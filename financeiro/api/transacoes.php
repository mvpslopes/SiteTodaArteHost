<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';
require_once 'db_helpers.php';

try {
    requireAuth();
    $pdo = getDBConnection();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno', 'detail' => $e->getMessage()]);
    exit;
}

$metodosPermitidos = ['pix', 'boleto', 'ted', 'dinheiro', 'cheque'];
$tiposPermitidos = ['entrada', 'saida'];
$hasClienteId = columnExists($pdo, 'transacoes', 'cliente_id');
$hasClientes = tableExists($pdo, 'clientes');

// GET: listar com filtros (ou um por id)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if ($id) {
        if ($hasClientes && $hasClienteId) {
            $stmt = $pdo->prepare("
                SELECT t.*, f.nome AS favorecido_nome, c.nome AS cliente_nome
                FROM transacoes t
                LEFT JOIN favorecidos f ON f.id = t.favorecido_id
                LEFT JOIN clientes c ON c.id = t.cliente_id
                WHERE t.id = ?
            ");
        } else {
            $stmt = $pdo->prepare("
                SELECT t.*, f.nome AS favorecido_nome
                FROM transacoes t
                LEFT JOIN favorecidos f ON f.id = t.favorecido_id
                WHERE t.id = ?
            ");
        }
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Transação não encontrada']);
            exit;
        }
        if (!isset($row['cliente_nome'])) $row['cliente_nome'] = null;
        echo json_encode($row);
        exit;
    }

    $mes = isset($_GET['mes']) ? (int)$_GET['mes'] : null;
    $ano = isset($_GET['ano']) ? (int)$_GET['ano'] : null;
    $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : null;
    if ($tipo && !in_array($tipo, $tiposPermitidos, true)) $tipo = null;

    if ($hasClientes && $hasClienteId) {
        $sql = "
            SELECT t.*, f.nome AS favorecido_nome, c.nome AS cliente_nome
            FROM transacoes t
            LEFT JOIN favorecidos f ON f.id = t.favorecido_id
            LEFT JOIN clientes c ON c.id = t.cliente_id
            WHERE 1=1
        ";
    } else {
        $sql = "
            SELECT t.*, f.nome AS favorecido_nome
            FROM transacoes t
            LEFT JOIN favorecidos f ON f.id = t.favorecido_id
            WHERE 1=1
        ";
    }
    $params = [];
    if ($mes && $ano) {
        $sql .= " AND MONTH(t.data_transacao) = ? AND YEAR(t.data_transacao) = ?";
        $params[] = $mes;
        $params[] = $ano;
    }
    if ($tipo) {
        $sql .= " AND t.tipo = ?";
        $params[] = $tipo;
    }
    $sql .= " ORDER BY t.data_transacao DESC, t.id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $list = $stmt->fetchAll();
    if (!$hasClienteId) {
        foreach ($list as &$row) {
            $row['cliente_nome'] = null;
        }
    }
    echo json_encode(['transacoes' => $list]);
    exit;
}

// POST: criar
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $tipo = $input['tipo'] ?? '';
    $data = $input['data_transacao'] ?? $input['data'] ?? '';
    $valor = isset($input['valor']) ? (float)str_replace(',', '.', $input['valor']) : 0;
    $metodo = $input['metodo_pagamento'] ?? '';
    $favorecido_id = isset($input['favorecido_id']) ? (int)$input['favorecido_id'] : 0;
    if ($favorecido_id < 1) $favorecido_id = null;
    $cliente_id = isset($input['cliente_id']) ? (int)$input['cliente_id'] : null;
    if ($cliente_id < 1) $cliente_id = null;
    $descricao = trim($input['descricao'] ?? '');

    if (!in_array($tipo, $tiposPermitidos, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Tipo deve ser entrada ou saida']);
        exit;
    }
    if (!in_array($metodo, $metodosPermitidos, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Método de pagamento inválido']);
        exit;
    }
    if ($tipo === 'saida' && ($favorecido_id === null || $favorecido_id < 1)) {
        http_response_code(400);
        echo json_encode(['error' => 'Destino é obrigatório para saída']);
        exit;
    }
    if ($valor <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Valor deve ser positivo']);
        exit;
    }
    $dataObj = null;
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) {
        $dataObj = $data;
    } elseif (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $data, $m)) {
        $dataObj = $m[3] . '-' . $m[2] . '-' . $m[1];
    }
    if (!$dataObj) {
        http_response_code(400);
        echo json_encode(['error' => 'Data inválida (use AAAA-MM-DD ou DD/MM/AAAA)']);
        exit;
    }

    try {
        if ($hasClienteId) {
            $stmt = $pdo->prepare("INSERT INTO transacoes (tipo, data_transacao, valor, metodo_pagamento, favorecido_id, cliente_id, descricao) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$tipo, $dataObj, $valor, $metodo, $favorecido_id, $cliente_id, $descricao ?: null]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO transacoes (tipo, data_transacao, valor, metodo_pagamento, favorecido_id, descricao) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$tipo, $dataObj, $valor, $metodo, $favorecido_id, $descricao ?: null]);
        }
    } catch (PDOException $e) {
        $msg = $e->getMessage();
        if (stripos($msg, 'favorecido_id') !== false || stripos($msg, 'cannot be null') !== false || stripos($msg, 'Column') !== false && stripos($msg, 'null') !== false) {
            http_response_code(503);
            echo json_encode([
                'error' => 'Para registrar entradas sem destino, execute no phpMyAdmin o script: favorecido-opcional-entrada.sql',
                'detail' => 'A coluna favorecido_id precisa aceitar NULL.',
            ]);
            exit;
        }
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao salvar transação', 'detail' => $msg]);
        exit;
    }
    $id = (int)$pdo->lastInsertId();
    if ($hasClientes && $hasClienteId) {
        $stmt = $pdo->prepare("SELECT t.*, f.nome AS favorecido_nome, c.nome AS cliente_nome FROM transacoes t LEFT JOIN favorecidos f ON f.id = t.favorecido_id LEFT JOIN clientes c ON c.id = t.cliente_id WHERE t.id = ?");
    } else {
        $stmt = $pdo->prepare("SELECT t.*, f.nome AS favorecido_nome FROM transacoes t LEFT JOIN favorecidos f ON f.id = t.favorecido_id WHERE t.id = ?");
    }
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!isset($row['cliente_nome'])) $row['cliente_nome'] = null;
    echo json_encode($row);
    exit;
}

// PUT: atualizar
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    if ($id < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }
    $tipo = $input['tipo'] ?? '';
    $data = $input['data_transacao'] ?? $input['data'] ?? '';
    $valor = isset($input['valor']) ? (float)str_replace(',', '.', $input['valor']) : 0;
    $metodo = $input['metodo_pagamento'] ?? '';
    $favorecido_id = isset($input['favorecido_id']) ? (int)$input['favorecido_id'] : 0;
    if ($favorecido_id < 1) $favorecido_id = null;
    $cliente_id = isset($input['cliente_id']) ? (int)$input['cliente_id'] : null;
    if ($cliente_id < 1) $cliente_id = null;
    $descricao = trim($input['descricao'] ?? '');

    if (!in_array($tipo, $tiposPermitidos, true) || !in_array($metodo, $metodosPermitidos, true) || $valor <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Dados inválidos']);
        exit;
    }
    if ($tipo === 'saida' && ($favorecido_id === null || $favorecido_id < 1)) {
        http_response_code(400);
        echo json_encode(['error' => 'Destino é obrigatório para saída']);
        exit;
    }
    $dataObj = null;
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) $dataObj = $data;
    elseif (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $data, $m)) $dataObj = $m[3] . '-' . $m[2] . '-' . $m[1];
    if (!$dataObj) {
        http_response_code(400);
        echo json_encode(['error' => 'Data inválida']);
        exit;
    }

    if ($hasClienteId) {
        $stmt = $pdo->prepare("UPDATE transacoes SET tipo=?, data_transacao=?, valor=?, metodo_pagamento=?, favorecido_id=?, cliente_id=?, descricao=? WHERE id=?");
        $stmt->execute([$tipo, $dataObj, $valor, $metodo, $favorecido_id, $cliente_id, $descricao ?: null, $id]);
    } else {
        $stmt = $pdo->prepare("UPDATE transacoes SET tipo=?, data_transacao=?, valor=?, metodo_pagamento=?, favorecido_id=?, descricao=? WHERE id=?");
        $stmt->execute([$tipo, $dataObj, $valor, $metodo, $favorecido_id, $descricao ?: null, $id]);
    }
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Transação não encontrada']);
        exit;
    }
    if ($hasClientes && $hasClienteId) {
        $stmt = $pdo->prepare("SELECT t.*, f.nome AS favorecido_nome, c.nome AS cliente_nome FROM transacoes t LEFT JOIN favorecidos f ON f.id = t.favorecido_id LEFT JOIN clientes c ON c.id = t.cliente_id WHERE t.id = ?");
    } else {
        $stmt = $pdo->prepare("SELECT t.*, f.nome AS favorecido_nome FROM transacoes t LEFT JOIN favorecidos f ON f.id = t.favorecido_id WHERE t.id = ?");
    }
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!isset($row['cliente_nome'])) $row['cliente_nome'] = null;
    echo json_encode($row);
    exit;
}

// DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM transacoes WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Transação não encontrada']);
        exit;
    }
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
