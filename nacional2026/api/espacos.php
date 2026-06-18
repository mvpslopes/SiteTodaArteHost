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
        $stmt = $pdo->prepare('
            SELECT e.*, c.nome AS cliente_nome, v.id AS venda_id, v.status AS venda_status
            FROM espacos e
            LEFT JOIN vendas_espaco v ON v.espaco_id = e.id AND v.status != "cancelado"
            LEFT JOIN clientes c ON c.id = v.cliente_id
            WHERE e.id = ?
            ORDER BY v.id DESC LIMIT 1
        ');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Espaço não encontrado']);
            exit;
        }
        echo json_encode($row);
        exit;
    }

    $status = $_GET['status'] ?? null;
    $sql = '
        SELECT e.*, c.nome AS cliente_nome, v.id AS venda_id, v.status AS venda_status, v.valor_total
        FROM espacos e
        LEFT JOIN vendas_espaco v ON v.espaco_id = e.id AND v.status != "cancelado"
        LEFT JOIN clientes c ON c.id = v.cliente_id
        WHERE e.ativo = 1
    ';
    $params = [];
    if ($status && in_array($status, ['disponivel','reservado','vendido','cancelado'], true)) {
        $sql .= ' AND e.status = ?';
        $params[] = $status;
    }
    $sql .= ' ORDER BY e.nome ASC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['espacos' => $stmt->fetchAll()]);
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
    $valor = (float)str_replace(',', '.', (string)($input['valor_venda'] ?? 0));
    $custo = (float)str_replace(',', '.', (string)($input['custo'] ?? 0));
    $stmt = $pdo->prepare('INSERT INTO espacos (nome, descricao, valor_venda, custo, status, ativo) VALUES (?, ?, ?, ?, "disponivel", 1)');
    $stmt->execute([
        $nome,
        trim($input['descricao'] ?? '') ?: null,
        $valor,
        $custo,
    ]);
    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM espacos WHERE id = ?');
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
    $status = $input['status'] ?? 'disponivel';
    if (!in_array($status, ['disponivel','reservado','vendido','cancelado'], true)) $status = 'disponivel';
    $stmt = $pdo->prepare('UPDATE espacos SET nome=?, descricao=?, valor_venda=?, custo=?, status=?, ativo=? WHERE id=?');
    $stmt->execute([
        $nome,
        trim($input['descricao'] ?? '') ?: null,
        (float)str_replace(',', '.', (string)($input['valor_venda'] ?? 0)),
        (float)str_replace(',', '.', (string)($input['custo'] ?? 0)),
        $status,
        isset($input['ativo']) ? (int)(bool)$input['ativo'] : 1,
        $id,
    ]);
    $stmt = $pdo->prepare('SELECT * FROM espacos WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    requireAdminOrRoot();
    $id = (int)($_GET['id'] ?? 0);
    $stmt = $pdo->prepare('UPDATE espacos SET ativo = 0 WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
