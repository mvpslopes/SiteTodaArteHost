<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';

requireAuth();
$pdo = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if ($id) {
        $stmt = $pdo->prepare('SELECT * FROM clientes WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Cliente não encontrado']);
            exit;
        }
        echo json_encode($row);
        exit;
    }
    $ativos = ($_GET['ativos'] ?? '1') === '1';
    $sql = $ativos ? 'SELECT * FROM clientes WHERE ativo = 1 ORDER BY nome ASC' : 'SELECT * FROM clientes ORDER BY nome ASC';
    echo json_encode(['clientes' => $pdo->query($sql)->fetchAll()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAdminOrRoot();
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $nome = trim($input['nome'] ?? '');
    if ($nome === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Nome é obrigatório']);
        exit;
    }
    $stmt = $pdo->prepare('INSERT INTO clientes (nome, email, telefone, documento, observacoes, ativo) VALUES (?, ?, ?, ?, ?, 1)');
    $stmt->execute([
        $nome,
        trim($input['email'] ?? '') ?: null,
        trim($input['telefone'] ?? '') ?: null,
        trim($input['documento'] ?? '') ?: null,
        trim($input['observacoes'] ?? '') ?: null,
    ]);
    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM clientes WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireAdminOrRoot();
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = (int)($input['id'] ?? 0);
    if ($id < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }
    $nome = trim($input['nome'] ?? '');
    if ($nome === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Nome é obrigatório']);
        exit;
    }
    $stmt = $pdo->prepare('UPDATE clientes SET nome=?, email=?, telefone=?, documento=?, observacoes=?, ativo=? WHERE id=?');
    $stmt->execute([
        $nome,
        trim($input['email'] ?? '') ?: null,
        trim($input['telefone'] ?? '') ?: null,
        trim($input['documento'] ?? '') ?: null,
        trim($input['observacoes'] ?? '') ?: null,
        isset($input['ativo']) ? (int)(bool)$input['ativo'] : 1,
        $id,
    ]);
    $stmt = $pdo->prepare('SELECT * FROM clientes WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    requireAdminOrRoot();
    $id = (int)($_GET['id'] ?? 0);
    if ($id < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }
    $stmt = $pdo->prepare('UPDATE clientes SET ativo = 0 WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
