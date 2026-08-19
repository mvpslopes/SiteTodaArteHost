<?php
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';
require_once 'db_helpers.php';

$current = requireAuth();
$pdo = getDBConnection();
ensureUsuarioPasswordEncColumn($pdo);

function usuarioSelectSql(): string {
    return 'id, email, nome, perfil, ativo, created_at, updated_at, password_enc';
}

function usuarioJson(PDO $pdo, int $id): array {
    $stmt = $pdo->prepare('SELECT ' . usuarioSelectSql() . ' FROM usuarios WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ? attachUsuarioSenhaVisivel($row) : [];
}

$perfis = ['root', 'administrador', 'usuario', 'cliente'];

// GET: listar (root ou administrador) ou obter um por id
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($current['perfil'] !== 'root' && $current['perfil'] !== 'administrador') {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado']);
        exit;
    }

    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if ($id) {
        $row = usuarioJson($pdo, $id);
        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Usuário não encontrado']);
            exit;
        }
        echo json_encode($row);
        exit;
    }

    $stmt = $pdo->query('SELECT ' . usuarioSelectSql() . ' FROM usuarios ORDER BY nome ASC');
    $list = array_map('attachUsuarioSenhaVisivel', $stmt->fetchAll());
    echo json_encode(['usuarios' => $list]);
    exit;
}

// POST: criar usuário (apenas root)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($current['perfil'] !== 'root') {
        http_response_code(403);
        echo json_encode(['error' => 'Apenas Root pode criar usuários']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $email = trim($input['email'] ?? '');
    $senha = $input['senha'] ?? '';
    $nome = trim($input['nome'] ?? '');
    $perfil = $input['perfil'] ?? 'usuario';

    if ($email === '' || $senha === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Email e senha são obrigatórios']);
        exit;
    }
    if (!in_array($perfil, $perfis, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Perfil inválido']);
        exit;
    }
    if (strlen($senha) < 8) {
        http_response_code(400);
        echo json_encode(['error' => 'Senha deve ter no mínimo 8 caracteres']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Email já cadastrado']);
        exit;
    }

    $hash = password_hash($senha, PASSWORD_DEFAULT);
    $enc = encryptPasswordDisplay($senha);
    $stmt = $pdo->prepare("INSERT INTO usuarios (email, password_hash, password_enc, nome, perfil, ativo) VALUES (?, ?, ?, ?, ?, 1)");
    $stmt->execute([$email, $hash, $enc, $nome, $perfil]);
    $id = (int)$pdo->lastInsertId();
    echo json_encode(usuarioJson($pdo, $id));
    exit;
}

// PUT: atualizar (root: qualquer um; admin: não pode alterar root nem promover para root; usuário: apenas próprio nome)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    if ($id < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, perfil FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    $target = $stmt->fetch();
    if (!$target) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuário não encontrado']);
        exit;
    }

    $isSelf = ((int)$target['id']) === ((int)$current['id']);

    if ($current['perfil'] === 'usuario' || $current['perfil'] === 'cliente') {
        if (!$isSelf) {
            http_response_code(403);
            echo json_encode(['error' => 'Acesso negado']);
            exit;
        }
        // Cliente só pode atualizar próprio nome (senha vai em alterar-senha.php)
        $nome = trim($input['nome'] ?? '');
        $stmt = $pdo->prepare("UPDATE usuarios SET nome = ? WHERE id = ?");
        $stmt->execute([$nome, $id]);
        echo json_encode(usuarioJson($pdo, $id));
        exit;
    }

    if ($current['perfil'] === 'administrador') {
        if ($target['perfil'] === 'root') {
            http_response_code(403);
            echo json_encode(['error' => 'Não é permitido editar usuário Root']);
            exit;
        }
    }

    $nome = trim($input['nome'] ?? '');
    $perfil = $input['perfil'] ?? null;
    $ativo = isset($input['ativo']) ? (int)(bool)$input['ativo'] : null;

    if ($current['perfil'] === 'administrador' && $perfil === 'root') {
        http_response_code(403);
        echo json_encode(['error' => 'Administrador não pode definir perfil Root']);
        exit;
    }

    $updates = [];
    $params = [];
    if ($nome !== '') {
        $updates[] = 'nome = ?';
        $params[] = $nome;
    }
    if (in_array($perfil, $perfis, true)) {
        $updates[] = 'perfil = ?';
        $params[] = $perfil;
    }
    if ($ativo !== null) {
        $updates[] = 'ativo = ?';
        $params[] = $ativo;
    }
    if (isset($input['senha']) && $input['senha'] !== '' && strlen($input['senha']) >= 8) {
        $updates[] = 'password_hash = ?';
        $params[] = password_hash($input['senha'], PASSWORD_DEFAULT);
        $updates[] = 'password_enc = ?';
        $params[] = encryptPasswordDisplay($input['senha']);
    }

    if (count($updates) === 0) {
        echo json_encode(usuarioJson($pdo, $id));
        exit;
    }

    $params[] = $id;
    $sql = "UPDATE usuarios SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(usuarioJson($pdo, $id));
    exit;
}

// DELETE: inativar usuário (apenas root; não pode deletar a si mesmo)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if ($current['perfil'] !== 'root') {
        http_response_code(403);
        echo json_encode(['error' => 'Apenas Root pode excluir usuários']);
        exit;
    }

    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }
    if ($id === (int)$current['id']) {
        http_response_code(400);
        echo json_encode(['error' => 'Não é permitido excluir seu próprio usuário']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE usuarios SET ativo = 0 WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Usuário inativado']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
