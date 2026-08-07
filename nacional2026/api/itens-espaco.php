<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';

requireAuth();
$pdo = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $espacoId = isset($_GET['espaco_id']) ? (int)$_GET['espaco_id'] : null;
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

    if ($id) {
        $stmt = $pdo->prepare('SELECT * FROM itens_espaco WHERE id = ?');
        $stmt->execute([$id]);
        $item = $stmt->fetch();
        if (!$item) {
            http_response_code(404);
            echo json_encode(['error' => 'Item não encontrado']);
            exit;
        }
        echo json_encode($item);
        exit;
    }

    if ($espacoId) {
        $stmt = $pdo->prepare('SELECT * FROM itens_espaco WHERE espaco_id = ? AND ativo = 1 ORDER BY nome ASC');
        $stmt->execute([$espacoId]);
        echo json_encode(['itens' => $stmt->fetchAll()]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Informe espaco_id']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAdminOrRoot();
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $espacoId = (int)($input['espaco_id'] ?? 0);
    $nome = trim($input['nome'] ?? '');
    if ($espacoId < 1 || $nome === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Espaço e nome do item são obrigatórios']);
        exit;
    }
    $valor = (float)str_replace(',', '.', (string)($input['valor_padrao'] ?? 0));
    $stmt = $pdo->prepare('INSERT INTO itens_espaco (espaco_id, nome, descricao, valor_padrao, ativo) VALUES (?, ?, ?, ?, 1)');
    $stmt->execute([
        $espacoId,
        $nome,
        trim($input['descricao'] ?? '') ?: null,
        $valor,
    ]);
    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM itens_espaco WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireAdminOrRoot();
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = (int)($input['id'] ?? 0);
    $nome = trim($input['nome'] ?? '');
    if ($id < 1 || $nome === '') {
        http_response_code(400);
        echo json_encode(['error' => 'ID e nome são obrigatórios']);
        exit;
    }
    $stmt = $pdo->prepare('UPDATE itens_espaco SET nome=?, descricao=?, valor_padrao=?, ativo=? WHERE id=?');
    $stmt->execute([
        $nome,
        trim($input['descricao'] ?? '') ?: null,
        (float)str_replace(',', '.', (string)($input['valor_padrao'] ?? 0)),
        isset($input['ativo']) ? (int)(bool)$input['ativo'] : 1,
        $id,
    ]);
    $stmt = $pdo->prepare('SELECT * FROM itens_espaco WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    requireAdminOrRoot();
    $id = (int)($_GET['id'] ?? 0);
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM vendas_espaco WHERE item_espaco_id = ? AND status != "cancelado"');
    $stmt->execute([$id]);
    if ((int)$stmt->fetchColumn() > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Item possui vendas ativas e não pode ser removido']);
        exit;
    }
    $pdo->prepare('UPDATE itens_espaco SET ativo = 0 WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
