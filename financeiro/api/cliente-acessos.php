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

function acessosDoCliente(PDO $pdo, array $plataformasFixas, int $clienteId): array {
    $stmt = $pdo->prepare('SELECT plataforma, rotulo, login, senha_enc, observacao FROM cliente_acessos WHERE cliente_id = ? ORDER BY id ASC');
    $stmt->execute([$clienteId]);
    $byPlat = [];
    foreach ($stmt->fetchAll() as $row) {
        $byPlat[$row['plataforma']] = [
            'plataforma' => $row['plataforma'],
            'rotulo' => $row['rotulo'] ?? '',
            'login' => $row['login'],
            'senha' => decryptPasswordDisplay(is_string($row['senha_enc'] ?? null) ? $row['senha_enc'] : null) ?? '',
            'observacao' => $row['observacao'] ?? '',
        ];
    }
    $out = [];
    foreach ($plataformasFixas as $p) {
        $out[] = $byPlat[$p] ?? ['plataforma' => $p, 'rotulo' => '', 'login' => '', 'senha' => '', 'observacao' => ''];
        unset($byPlat[$p]);
    }
    foreach ($byPlat as $extra) {
        $out[] = $extra;
    }
    return $out;
}

function upsertAcesso(PDO $pdo, int $clienteId, string $plataforma, string $login, string $senha, ?string $obs, ?string $rotulo): void {
    $ex = $pdo->prepare('SELECT senha_enc FROM cliente_acessos WHERE cliente_id = ? AND plataforma = ?');
    $ex->execute([$clienteId, $plataforma]);
    $atual = $ex->fetch();
    $enc = $senha !== '' ? encryptPasswordDisplay($senha) : ($atual['senha_enc'] ?? null);
    if ($atual) {
        $pdo->prepare('UPDATE cliente_acessos SET login = ?, senha_enc = ?, observacao = ?, rotulo = ? WHERE cliente_id = ? AND plataforma = ?')
            ->execute([$login, $enc, $obs, $rotulo, $clienteId, $plataforma]);
        return;
    }
    $pdo->prepare('INSERT INTO cliente_acessos (cliente_id, plataforma, rotulo, login, senha_enc, observacao) VALUES (?,?,?,?,?,?)')
        ->execute([$clienteId, $plataforma, $rotulo, $login, $enc, $obs]);
}

$clienteId = (int)($_GET['cliente_id'] ?? 0);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $clienteId = (int)($input['cliente_id'] ?? $clienteId);
}
if ($clienteId < 1) acessoFail('Informe o cliente');

$chk = $pdo->prepare('SELECT id, nome FROM clientes WHERE id = ?');
$chk->execute([$clienteId]);
$cliente = $chk->fetch();
if (!$cliente) acessoFail('Cliente não encontrado', 404);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['cliente_id' => $clienteId, 'cliente_nome' => $cliente['nome'], 'acessos' => acessosDoCliente($pdo, $plataformasFixas, $clienteId)]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $lista = $input['acessos'] ?? [];
    if (!is_array($lista)) acessoFail('Acessos inválidos');

    $keep = $plataformasFixas;
    $vistos = [];
    foreach ($lista as $item) {
        if (!is_array($item)) continue;
        $p = trim((string)($item['plataforma'] ?? ''));
        if (isset($vistos[$p])) continue;
        $isFixa = in_array($p, $plataformasFixas, true);
        $isOutro = plataformaEhOutra($p);
        if (!$isFixa && !$isOutro) continue;
        $vistos[$p] = true;

        $login = trim((string)($item['login'] ?? ''));
        $senha = (string)($item['senha'] ?? '');
        $obs = trim((string)($item['observacao'] ?? '')) ?: null;
        $rotulo = trim((string)($item['rotulo'] ?? ''));
        if (strlen($rotulo) > 80) $rotulo = substr($rotulo, 0, 80);

        if ($isFixa) {
            if ($login === '' && $senha === '' && $obs === null) {
                $pdo->prepare('DELETE FROM cliente_acessos WHERE cliente_id = ? AND plataforma = ?')->execute([$clienteId, $p]);
                continue;
            }
            upsertAcesso($pdo, $clienteId, $p, $login, $senha, $obs, null);
            continue;
        }

        if ($rotulo === '') {
            continue;
        }
        $keep[] = $p;
        upsertAcesso($pdo, $clienteId, $p, $login, $senha, $obs, $rotulo);
    }

    $ph = implode(',', array_fill(0, count($keep), '?'));
    $del = $pdo->prepare("DELETE FROM cliente_acessos WHERE cliente_id = ? AND plataforma NOT IN ($ph)");
    $del->execute(array_merge([$clienteId], $keep));

    echo json_encode(['cliente_id' => $clienteId, 'cliente_nome' => $cliente['nome'], 'acessos' => acessosDoCliente($pdo, $plataformasFixas, $clienteId)]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
