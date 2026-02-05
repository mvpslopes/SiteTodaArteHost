<?php
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';

requireAuth();
$pdo = getDBConnection();

// GET: listar todos (ou um por id)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $apenasAtivos = isset($_GET['ativos']) && $_GET['ativos'] !== '0';

    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM favorecidos WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Favorecido não encontrado']);
            exit;
        }
        echo json_encode($row);
        exit;
    }

    $sql = "SELECT * FROM favorecidos";
    $params = [];
    if ($apenasAtivos) {
        $sql .= " WHERE ativo = 1";
    }
    $sql .= " ORDER BY nome ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $list = $stmt->fetchAll();
    echo json_encode(['favorecidos' => $list]);
    exit;
}

// POST: criar
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $nome = trim($input['nome'] ?? '');
    if ($nome === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Nome é obrigatório']);
        exit;
    }
    $ativo = isset($input['ativo']) ? (int)(bool)$input['ativo'] : 1;
    $stmt = $pdo->prepare("INSERT INTO favorecidos (nome, ativo) VALUES (?, ?)");
    $stmt->execute([$nome, $ativo]);
    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare("SELECT * FROM favorecidos WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

// PUT: atualizar
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $nome = trim($input['nome'] ?? '');
    if ($id < 1 || $nome === '') {
        http_response_code(400);
        echo json_encode(['error' => 'ID e nome são obrigatórios']);
        exit;
    }
    $ativo = isset($input['ativo']) ? (int)(bool)$input['ativo'] : 1;
    $stmt = $pdo->prepare("UPDATE favorecidos SET nome = ?, ativo = ? WHERE id = ?");
    $stmt->execute([$nome, $ativo, $id]);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Favorecido não encontrado']);
        exit;
    }
    $stmt = $pdo->prepare("SELECT * FROM favorecidos WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

// DELETE: inativar ou excluir (soft delete: inativar)
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $id) {
    $stmt = $pdo->prepare("UPDATE favorecidos SET ativo = 0 WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Favorecido inativado']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
