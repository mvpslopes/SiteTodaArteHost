<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';

requireAuth();
$pdo = getDBConnection();
$metodos = ['pix','boleto','ted','dinheiro','transferencia','cheque'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $mes = isset($_GET['mes']) ? (int)$_GET['mes'] : null;
    $ano = isset($_GET['ano']) ? (int)$_GET['ano'] : null;
    $tipo = $_GET['tipo'] ?? null;

    $sql = '
        SELECT t.*, c.nome AS cliente_nome, e.nome AS espaco_nome
        FROM transacoes t
        LEFT JOIN clientes c ON c.id = t.cliente_id
        LEFT JOIN espacos e ON e.id = t.espaco_id
        WHERE 1=1
    ';
    $params = [];
    if ($mes && $ano) {
        $sql .= ' AND MONTH(t.data_transacao) = ? AND YEAR(t.data_transacao) = ?';
        $params[] = $mes;
        $params[] = $ano;
    } elseif ($ano) {
        $sql .= ' AND YEAR(t.data_transacao) = ?';
        $params[] = $ano;
    }
    if ($tipo && in_array($tipo, ['entrada','saida'], true)) {
        $sql .= ' AND t.tipo = ?';
        $params[] = $tipo;
    }
    $sql .= ' ORDER BY t.data_transacao DESC, t.id DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['transacoes' => $stmt->fetchAll()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAdminOrRoot();
    $current = requireAuth();
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $tipo = $input['tipo'] ?? '';
    $valor = (float)str_replace(',', '.', (string)($input['valor'] ?? 0));
    $data = normalizarData($input['data_transacao'] ?? '') ?: date('Y-m-d');
    $metodo = $input['metodo_pagamento'] ?? null;
    if (!in_array($tipo, ['entrada','saida'], true) || $valor <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Dados inválidos']);
        exit;
    }
    if ($metodo && !in_array($metodo, $metodos, true)) $metodo = null;
    $stmt = $pdo->prepare('INSERT INTO transacoes (tipo, data_transacao, valor, descricao, metodo_pagamento, cliente_id, espaco_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $tipo,
        $data,
        $valor,
        trim($input['descricao'] ?? '') ?: null,
        $metodo,
        !empty($input['cliente_id']) ? (int)$input['cliente_id'] : null,
        !empty($input['espaco_id']) ? (int)$input['espaco_id'] : null,
        (int)$current['id'],
    ]);
    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT t.*, c.nome AS cliente_nome, e.nome AS espaco_nome FROM transacoes t LEFT JOIN clientes c ON c.id = t.cliente_id LEFT JOIN espacos e ON e.id = t.espaco_id WHERE t.id = ?');
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
    $stmt = $pdo->prepare('SELECT parcela_id FROM transacoes WHERE id = ?');
    $stmt->execute([$id]);
    $parcelaId = $stmt->fetchColumn();
    if ($parcelaId) {
        http_response_code(400);
        echo json_encode(['error' => 'Transação vinculada a parcela não pode ser excluída diretamente']);
        exit;
    }
    $pdo->prepare('DELETE FROM transacoes WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
