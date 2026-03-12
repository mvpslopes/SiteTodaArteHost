<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';

try {
    requireAuth();
    $pdo = getDBConnection();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno', 'detail' => $e->getMessage()]);
    exit;
}

$tiposClientePermitidos = ['fixo', 'avulso'];
$categoriasPermitidas = ['cliente_avulso', 'cliente_fixo', 'cliente_gestao'];
$statusPermitidos = ['pendente', 'em_execucao', 'concluida', 'cancelada'];
$prioridadesPermitidas = ['baixa', 'media', 'alta'];

// Helpers
function parseDateOrFail(string $value, string $field)
{
    $value = trim($value);
    if ($value === '') {
        http_response_code(400);
        echo json_encode(['error' => "Campo {$field} é obrigatório"]);
        exit;
    }
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        return $value;
    }
    if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $value, $m)) {
        return $m[3] . '-' . $m[2] . '-' . $m[1];
    }
    http_response_code(400);
    echo json_encode(['error' => "Data inválida em {$field}"]);
    exit;
}

// GET: listar ou obter por id
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if ($id) {
        $stmt = $pdo->prepare("
            SELECT d.*, c.nome AS cliente_nome
            FROM demandas d
            LEFT JOIN clientes c ON c.id = d.cliente_id
            WHERE d.id = ?
        ");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Demanda não encontrada']);
            exit;
        }
        if (!isset($row['cliente_nome'])) $row['cliente_nome'] = null;
        echo json_encode($row);
        exit;
    }

    $tipo_cliente = isset($_GET['tipo_cliente']) ? $_GET['tipo_cliente'] : null;
    $cliente_id = isset($_GET['cliente_id']) ? (int)$_GET['cliente_id'] : null;
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    $prioridade = isset($_GET['prioridade']) ? $_GET['prioridade'] : null;

    $sql = "
        SELECT d.*, c.nome AS cliente_nome
        FROM demandas d
        LEFT JOIN clientes c ON c.id = d.cliente_id
        WHERE 1=1
    ";
    $params = [];

    if ($tipo_cliente && in_array($tipo_cliente, $tiposClientePermitidos, true)) {
        $sql .= " AND d.tipo_cliente = ?";
        $params[] = $tipo_cliente;
    }
    if ($cliente_id && $cliente_id > 0) {
        $sql .= " AND d.cliente_id = ?";
        $params[] = $cliente_id;
    }
    if ($status && in_array($status, $statusPermitidos, true)) {
        $sql .= " AND d.status = ?";
        $params[] = $status;
    }
    if ($prioridade && in_array($prioridade, $prioridadesPermitidas, true)) {
        $sql .= " AND d.prioridade = ?";
        $params[] = $prioridade;
    }

    $sql .= " ORDER BY d.data_pedido DESC, d.id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $list = $stmt->fetchAll();
    foreach ($list as &$row) {
        if (!isset($row['cliente_nome'])) $row['cliente_nome'] = null;
    }
    echo json_encode(['demandas' => $list]);
    exit;
}

// POST: criar demanda
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];

    $tipo_cliente = $input['tipo_cliente'] ?? '';
    $cliente_id = isset($input['cliente_id']) ? (int)$input['cliente_id'] : null;
    if ($cliente_id < 1) $cliente_id = null;
    $categoria = $input['categoria'] ?? null;
    $nome_cliente_avulso = trim($input['nome_cliente_avulso'] ?? '');
    $data_pedido_raw = $input['data_pedido'] ?? '';
    $descricao = trim($input['descricao'] ?? '');
    $quem_pediu = trim($input['quem_pediu'] ?? '');
    $data_execucao_raw = $input['data_execucao'] ?? '';
    $data_entrega_raw = $input['data_entrega'] ?? '';
    $valor_unitario = isset($input['valor_unitario']) ? (float)str_replace(',', '.', (string)$input['valor_unitario']) : 0;
    $quantidade = isset($input['quantidade']) ? (int)$input['quantidade'] : 0;
    $prioridade = $input['prioridade'] ?? 'media';

    if (!in_array($tipo_cliente, $tiposClientePermitidos, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Tipo de cliente deve ser fixo ou avulso']);
        exit;
    }
    if ($tipo_cliente === 'fixo' && (!$cliente_id || $cliente_id < 1)) {
        http_response_code(400);
        echo json_encode(['error' => 'Cliente é obrigatório para demandas de cliente fixo']);
        exit;
    }
    if ($tipo_cliente === 'avulso') {
        if ($categoria && !in_array($categoria, $categoriasPermitidas, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Categoria inválida para cliente avulso']);
            exit;
        }
        if ($nome_cliente_avulso === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Nome do cliente avulso é obrigatório']);
            exit;
        }
    }
    if ($tipo_cliente === 'fixo' && $categoria && !in_array($categoria, $categoriasPermitidas, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Categoria inválida']);
        exit;
    }
    if ($descricao === '' || $quem_pediu === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Descrição e quem pediu são obrigatórios']);
        exit;
    }
    if ($valor_unitario <= 0 || $quantidade < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'Valor unitário e quantidade devem ser maiores que zero']);
        exit;
    }
    if (!in_array($prioridade, $prioridadesPermitidas, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Prioridade inválida']);
        exit;
    }

    $data_pedido = parseDateOrFail($data_pedido_raw, 'data_pedido');
    $data_execucao = null;
    $data_entrega = null;
    if (trim($data_execucao_raw) !== '') {
        $data_execucao = parseDateOrFail($data_execucao_raw, 'data_execucao');
    }
    if (trim($data_entrega_raw) !== '') {
        $data_entrega = parseDateOrFail($data_entrega_raw, 'data_entrega');
    }

    $valor_total = $valor_unitario * $quantidade;

    $stmt = $pdo->prepare("
        INSERT INTO demandas (
            tipo_cliente, cliente_id, categoria, nome_cliente_avulso,
            data_pedido, descricao, quem_pediu,
            data_execucao, data_entrega,
            valor_unitario, quantidade, valor_total, prioridade, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')
    ");
    $stmt->execute([
        $tipo_cliente,
        $cliente_id,
        $categoria,
        $tipo_cliente === 'avulso' ? $nome_cliente_avulso : null,
        $data_pedido,
        $descricao,
        $quem_pediu,
        $data_execucao,
        $data_entrega,
        $valor_unitario,
        $quantidade,
        $valor_total,
        $prioridade,
    ]);

    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare("
        SELECT d.*, c.nome AS cliente_nome
        FROM demandas d
        LEFT JOIN clientes c ON c.id = d.cliente_id
        WHERE d.id = ?
    ");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!isset($row['cliente_nome'])) $row['cliente_nome'] = null;
    echo json_encode($row);
    exit;
}

// PUT: atualizar demanda
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    if ($id < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM demandas WHERE id = ?");
    $stmt->execute([$id]);
    $current = $stmt->fetch();
    if (!$current) {
        http_response_code(404);
        echo json_encode(['error' => 'Demanda não encontrada']);
        exit;
    }

    $tipo_cliente = $input['tipo_cliente'] ?? $current['tipo_cliente'];
    $cliente_id = array_key_exists('cliente_id', $input) ? (int)$input['cliente_id'] : ($current['cliente_id'] ?? null);
    if ($cliente_id < 1) $cliente_id = null;
    $categoria = array_key_exists('categoria', $input) ? $input['categoria'] : $current['categoria'];
    $nome_cliente_avulso = array_key_exists('nome_cliente_avulso', $input)
        ? trim((string)$input['nome_cliente_avulso'])
        : ($current['nome_cliente_avulso'] ?? '');
    $data_pedido_raw = $input['data_pedido'] ?? $current['data_pedido'];
    $descricao = array_key_exists('descricao', $input) ? trim((string)$input['descricao']) : $current['descricao'];
    $quem_pediu = array_key_exists('quem_pediu', $input) ? trim((string)$input['quem_pediu']) : $current['quem_pediu'];
    $data_execucao_raw = array_key_exists('data_execucao', $input) ? (string)$input['data_execucao'] : ($current['data_execucao'] ?? '');
    $data_entrega_raw = array_key_exists('data_entrega', $input) ? (string)$input['data_entrega'] : ($current['data_entrega'] ?? '');
    $valor_unitario = array_key_exists('valor_unitario', $input)
        ? (float)str_replace(',', '.', (string)$input['valor_unitario'])
        : (float)$current['valor_unitario'];
    $quantidade = array_key_exists('quantidade', $input) ? (int)$input['quantidade'] : (int)$current['quantidade'];
    $prioridade = $input['prioridade'] ?? ($current['prioridade'] ?? 'media');
    $status = $input['status'] ?? ($current['status'] ?? 'pendente');

    if (!in_array($tipo_cliente, $tiposClientePermitidos, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Tipo de cliente inválido']);
        exit;
    }
    if ($tipo_cliente === 'fixo' && (!$cliente_id || $cliente_id < 1)) {
        http_response_code(400);
        echo json_encode(['error' => 'Cliente é obrigatório para demandas de cliente fixo']);
        exit;
    }
    if ($tipo_cliente === 'avulso') {
        if ($categoria && !in_array($categoria, $categoriasPermitidas, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Categoria inválida para cliente avulso']);
            exit;
        }
        if ($nome_cliente_avulso === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Nome do cliente avulso é obrigatório']);
            exit;
        }
    }
    if ($tipo_cliente === 'fixo' && $categoria && !in_array($categoria, $categoriasPermitidas, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Categoria inválida']);
        exit;
    }
    if ($descricao === '' || $quem_pediu === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Descrição e quem pediu são obrigatórios']);
        exit;
    }
    if ($valor_unitario <= 0 || $quantidade < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'Valor unitário e quantidade devem ser maiores que zero']);
        exit;
    }
    if (!in_array($prioridade, $prioridadesPermitidas, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Prioridade inválida']);
        exit;
    }
    if (!in_array($status, $statusPermitidos, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Status inválido']);
        exit;
    }

    $data_pedido = parseDateOrFail($data_pedido_raw, 'data_pedido');
    $data_execucao = null;
    $data_entrega = null;
    if (trim((string)$data_execucao_raw) !== '') {
        $data_execucao = parseDateOrFail((string)$data_execucao_raw, 'data_execucao');
    }
    if (trim((string)$data_entrega_raw) !== '') {
        $data_entrega = parseDateOrFail((string)$data_entrega_raw, 'data_entrega');
    }

    $valor_total = $valor_unitario * $quantidade;

    $stmt = $pdo->prepare("
        UPDATE demandas
        SET tipo_cliente = ?, cliente_id = ?, categoria = ?, nome_cliente_avulso = ?,
            data_pedido = ?, descricao = ?, quem_pediu = ?,
            data_execucao = ?, data_entrega = ?,
            valor_unitario = ?, quantidade = ?, valor_total = ?, prioridade = ?, status = ?
        WHERE id = ?
    ");
    $stmt->execute([
        $tipo_cliente,
        $cliente_id,
        $categoria,
        $tipo_cliente === 'avulso' ? $nome_cliente_avulso : null,
        $data_pedido,
        $descricao,
        $quem_pediu,
        $data_execucao,
        $data_entrega,
        $valor_unitario,
        $quantidade,
        $valor_total,
        $prioridade,
        $status,
        $id,
    ]);

    $stmt = $pdo->prepare("
        SELECT d.*, c.nome AS cliente_nome
        FROM demandas d
        LEFT JOIN clientes c ON c.id = d.cliente_id
        WHERE d.id = ?
    ");
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
    $stmt = $pdo->prepare("DELETE FROM demandas WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Demanda não encontrada']);
        exit;
    }
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);

