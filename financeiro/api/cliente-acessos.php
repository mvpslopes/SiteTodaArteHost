<?php
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';
require_once 'db_helpers.php';

$user = requireAuth();
if (!in_array($user['perfil'] ?? '', ['root', 'administrador', 'usuario'], true)) {
    http_response_code(403);
    echo json_encode(['error' => 'Acesso negado']);
    exit;
}

$pdo = getDBConnection();
ensureClienteAcessosTable($pdo);

$plataformasFixas = ['instagram', 'youtube', 'email', 'facebook'];

function acessoFail(string $msg, int $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

function plataformaEhOutra(string $p): bool {
    return (bool)preg_match('/^outro_[a-zA-Z0-9]+$/', $p);
}

function rotuloPlataforma(string $p, ?string $rotulo): string {
    $map = [
        'instagram' => 'Instagram',
        'youtube' => 'YouTube',
        'email' => 'E-mail',
        'facebook' => 'Facebook',
    ];
    if (isset($map[$p])) return $map[$p];
    $r = trim((string)$rotulo);
    return $r !== '' ? $r : 'Outro';
}

function rowAcesso(array $row): array {
    return [
        'id' => (int)$row['id'],
        'cliente_id' => (int)$row['cliente_id'],
        'cliente_nome' => $row['cliente_nome'] ?? '',
        'plataforma' => $row['plataforma'],
        'rotulo' => $row['rotulo'] ?? '',
        'plataforma_label' => rotuloPlataforma($row['plataforma'], $row['rotulo'] ?? null),
        'login' => $row['login'] ?? '',
        'senha' => decryptPasswordDisplay(is_string($row['senha_enc'] ?? null) ? $row['senha_enc'] : null) ?? '',
        'observacao' => $row['observacao'] ?? '',
    ];
}

function listarTodos(PDO $pdo, ?int $clienteId = null): array {
    $sql = '
        SELECT a.id, a.cliente_id, c.nome AS cliente_nome, a.plataforma, a.rotulo, a.login, a.senha_enc, a.observacao
        FROM cliente_acessos a
        INNER JOIN clientes c ON c.id = a.cliente_id
    ';
    $params = [];
    if ($clienteId !== null && $clienteId > 0) {
        $sql .= ' WHERE a.cliente_id = ?';
        $params[] = $clienteId;
    }
    $sql .= ' ORDER BY c.nome ASC, a.id ASC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return array_map('rowAcesso', $stmt->fetchAll());
}

function buscarPorId(PDO $pdo, int $id): ?array {
    $stmt = $pdo->prepare('
        SELECT a.id, a.cliente_id, c.nome AS cliente_nome, a.plataforma, a.rotulo, a.login, a.senha_enc, a.observacao
        FROM cliente_acessos a
        INNER JOIN clientes c ON c.id = a.cliente_id
        WHERE a.id = ?
    ');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ? rowAcesso($row) : null;
}

function normalizarPlataforma(array $input, array $plataformasFixas): array {
    $tipo = trim((string)($input['tipo'] ?? $input['plataforma'] ?? ''));
    $rotulo = trim((string)($input['rotulo'] ?? ''));
    if (strlen($rotulo) > 80) $rotulo = substr($rotulo, 0, 80);

    if (in_array($tipo, $plataformasFixas, true)) {
        return [$tipo, null];
    }
    if ($tipo === 'outro' || plataformaEhOutra($tipo)) {
        if ($rotulo === '') acessoFail('Informe o nome do tipo de acesso (ex: TikTok, LinkedIn)');
        $plat = plataformaEhOutra($tipo) ? $tipo : ('outro_' . bin2hex(random_bytes(4)));
        return [$plat, $rotulo];
    }
    acessoFail('Tipo de acesso inválido');
}

$method = $_SERVER['REQUEST_METHOD'];
$input = in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)
    ? (json_decode(file_get_contents('php://input'), true) ?: [])
    : [];

if ($method === 'GET') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id > 0) {
        $item = buscarPorId($pdo, $id);
        if (!$item) acessoFail('Login não encontrado', 404);
        echo json_encode($item);
        exit;
    }
    $clienteId = isset($_GET['cliente_id']) ? (int)$_GET['cliente_id'] : null;
    echo json_encode(['acessos' => listarTodos($pdo, $clienteId)]);
    exit;
}

if ($method === 'POST') {
    $clienteId = (int)($input['cliente_id'] ?? 0);
    if ($clienteId < 1) acessoFail('Selecione o cliente');
    $chk = $pdo->prepare('SELECT id, nome FROM clientes WHERE id = ?');
    $chk->execute([$clienteId]);
    if (!$chk->fetch()) acessoFail('Cliente não encontrado', 404);

    [$plataforma, $rotulo] = normalizarPlataforma($input, $plataformasFixas);
    $login = trim((string)($input['login'] ?? ''));
    $senha = (string)($input['senha'] ?? '');
    $obs = trim((string)($input['observacao'] ?? '')) ?: null;
    if ($login === '' && $senha === '' && $obs === null) {
        acessoFail('Informe ao menos login, senha ou observação');
    }

    $ex = $pdo->prepare('SELECT id, senha_enc FROM cliente_acessos WHERE cliente_id = ? AND plataforma = ?');
    $ex->execute([$clienteId, $plataforma]);
    $atual = $ex->fetch();
    $enc = $senha !== '' ? encryptPasswordDisplay($senha) : ($atual['senha_enc'] ?? null);

    if ($atual) {
        $pdo->prepare('UPDATE cliente_acessos SET login = ?, senha_enc = ?, observacao = ?, rotulo = ? WHERE id = ?')
            ->execute([$login, $enc, $obs, $rotulo, (int)$atual['id']]);
        $id = (int)$atual['id'];
    } else {
        $pdo->prepare('INSERT INTO cliente_acessos (cliente_id, plataforma, rotulo, login, senha_enc, observacao) VALUES (?,?,?,?,?,?)')
            ->execute([$clienteId, $plataforma, $rotulo, $login, $enc, $obs]);
        $id = (int)$pdo->lastInsertId();
    }

    echo json_encode(buscarPorId($pdo, $id));
    exit;
}

if ($method === 'PUT' || $method === 'PATCH') {
    $id = (int)($input['id'] ?? $_GET['id'] ?? 0);
    if ($id < 1) acessoFail('Informe o login');
    $atual = $pdo->prepare('SELECT id, cliente_id, plataforma, senha_enc FROM cliente_acessos WHERE id = ?');
    $atual->execute([$id]);
    $row = $atual->fetch();
    if (!$row) acessoFail('Login não encontrado', 404);

    $login = trim((string)($input['login'] ?? ''));
    $senha = (string)($input['senha'] ?? '');
    $obs = trim((string)($input['observacao'] ?? '')) ?: null;
    $rotulo = null;
    if (plataformaEhOutra($row['plataforma'])) {
        $rotulo = trim((string)($input['rotulo'] ?? ''));
        if ($rotulo === '') acessoFail('Informe o nome do tipo de acesso');
        if (strlen($rotulo) > 80) $rotulo = substr($rotulo, 0, 80);
    }

    $enc = $senha !== '' ? encryptPasswordDisplay($senha) : ($row['senha_enc'] ?? null);
    if (plataformaEhOutra($row['plataforma'])) {
        $pdo->prepare('UPDATE cliente_acessos SET login = ?, senha_enc = ?, observacao = ?, rotulo = ? WHERE id = ?')
            ->execute([$login, $enc, $obs, $rotulo, $id]);
    } else {
        $pdo->prepare('UPDATE cliente_acessos SET login = ?, senha_enc = ?, observacao = ? WHERE id = ?')
            ->execute([$login, $enc, $obs, $id]);
    }

    echo json_encode(buscarPorId($pdo, $id));
    exit;
}

if ($method === 'DELETE') {
    $id = (int)($input['id'] ?? $_GET['id'] ?? 0);
    if ($id < 1) acessoFail('Informe o login');
    $pdo->prepare('DELETE FROM cliente_acessos WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
