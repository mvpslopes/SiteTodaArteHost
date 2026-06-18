<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';

$current = requireAuth();
$pdo = getDBConnection();
$perfis = ['root', 'admin'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!in_array($current['perfil'], ['root', 'admin'], true)) {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado']);
        exit;
    }
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if ($id) {
        $stmt = $pdo->prepare('SELECT id, login, nome, perfil, ativo, created_at, updated_at FROM usuarios WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Usuário não encontrado']);
            exit;
        }
        echo json_encode($row);
        exit;
    }
    $stmt = $pdo->query('SELECT id, login, nome, perfil, ativo, created_at, updated_at FROM usuarios ORDER BY nome ASC');
    echo json_encode(['usuarios' => $stmt->fetchAll()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireRoot();
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $login = trim($input['login'] ?? '');
    $senha = $input['senha'] ?? '';
    $nome = trim($input['nome'] ?? '');
    $perfil = $input['perfil'] ?? 'admin';
    if ($login === '' || $senha === '' || $nome === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Login, senha e nome são obrigatórios']);
        exit;
    }
    if (!in_array($perfil, $perfis, true) || $perfil === 'root') {
        $perfil = 'admin';
    }
    if (strlen($senha) < 8) {
        http_response_code(400);
        echo json_encode(['error' => 'Senha deve ter no mínimo 8 caracteres']);
        exit;
    }
    $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE login = ?');
    $stmt->execute([$login]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Login já cadastrado']);
        exit;
    }
    $stmt = $pdo->prepare('INSERT INTO usuarios (login, password_hash, nome, perfil, ativo) VALUES (?, ?, ?, ?, 1)');
    $stmt->execute([$login, password_hash($senha, PASSWORD_DEFAULT), $nome, $perfil]);
    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT id, login, nome, perfil, ativo, created_at FROM usuarios WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = (int)($input['id'] ?? 0);
    if ($id < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }
    $stmt = $pdo->prepare('SELECT id, perfil FROM usuarios WHERE id = ?');
    $stmt->execute([$id]);
    $target = $stmt->fetch();
    if (!$target) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuário não encontrado']);
        exit;
    }
    $isSelf = (int)$target['id'] === (int)$current['id'];
    if ($current['perfil'] === 'admin') {
        if ($target['perfil'] === 'root' || (!$isSelf && $current['perfil'] !== 'root')) {
            if ($target['perfil'] === 'root') {
                http_response_code(403);
                echo json_encode(['error' => 'Não é permitido editar usuário Root']);
                exit;
            }
        }
        if (($input['perfil'] ?? '') === 'root') {
            http_response_code(403);
            echo json_encode(['error' => 'Administrador não pode definir perfil Root']);
            exit;
        }
    }
    if ($current['perfil'] !== 'root' && !$isSelf) {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado']);
        exit;
    }
    $updates = [];
    $params = [];
    if (!empty($input['nome'])) {
        $updates[] = 'nome = ?';
        $params[] = trim($input['nome']);
    }
    if ($current['perfil'] === 'root' && in_array($input['perfil'] ?? '', $perfis, true)) {
        $updates[] = 'perfil = ?';
        $params[] = $input['perfil'];
    }
    if ($current['perfil'] === 'root' && isset($input['ativo'])) {
        $updates[] = 'ativo = ?';
        $params[] = (int)(bool)$input['ativo'];
    }
    if (!empty($input['senha']) && strlen($input['senha']) >= 8) {
        $updates[] = 'password_hash = ?';
        $params[] = password_hash($input['senha'], PASSWORD_DEFAULT);
    }
    if (count($updates) === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Nada para atualizar']);
        exit;
    }
    $params[] = $id;
    $pdo->prepare('UPDATE usuarios SET ' . implode(', ', $updates) . ' WHERE id = ?')->execute($params);
    $stmt = $pdo->prepare('SELECT id, login, nome, perfil, ativo, created_at FROM usuarios WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    requireRoot();
    $id = (int)($_GET['id'] ?? 0);
    if ($id === (int)$current['id']) {
        http_response_code(400);
        echo json_encode(['error' => 'Não é permitido inativar seu próprio usuário']);
        exit;
    }
    $pdo->prepare('UPDATE usuarios SET ativo = 0 WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
