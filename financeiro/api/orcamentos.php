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
ensureCatalogoServicosTables($pdo);

function orcFail(string $msg, int $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

function itensDoOrcamento(PDO $pdo, int $orcamentoId): array {
    $stmt = $pdo->prepare('SELECT * FROM orcamento_itens WHERE orcamento_id = ? ORDER BY ordem ASC, id ASC');
    $stmt->execute([$orcamentoId]);
    $out = [];
    foreach ($stmt->fetchAll() as $r) {
        $out[] = [
            'id' => (int)$r['id'],
            'servico_id' => $r['servico_id'] !== null ? (int)$r['servico_id'] : null,
            'descricao' => $r['descricao'],
            'detalhes' => $r['detalhes'],
            'quantidade' => (float)$r['quantidade'],
            'valor_unitario' => (float)$r['valor_unitario'],
            'valor_total' => (float)$r['valor_total'],
            'prazo' => $r['prazo'],
            'observacao' => $r['observacao'],
            'ordem' => (int)$r['ordem'],
        ];
    }
    return $out;
}

function rowOrcamento(PDO $pdo, array $r, bool $comItens = true): array {
    $out = [
        'id' => (int)$r['id'],
        'numero' => (int)$r['numero'],
        'cliente_id' => $r['cliente_id'] !== null ? (int)$r['cliente_id'] : null,
        'cliente_nome' => $r['cliente_nome'],
        'titulo' => $r['titulo'],
        'status' => $r['status'],
        'prazo' => $r['prazo'],
        'observacoes' => $r['observacoes'],
        'validade_ate' => $r['validade_ate'],
        'total' => (float)$r['total'],
        'created_at' => $r['created_at'],
        'updated_at' => $r['updated_at'],
    ];
    if ($comItens) $out['itens'] = itensDoOrcamento($pdo, (int)$r['id']);
    return $out;
}

function proximoNumero(PDO $pdo): int {
    $n = (int)$pdo->query('SELECT COALESCE(MAX(numero), 0) + 1 FROM orcamentos')->fetchColumn();
    return max(1, $n);
}

function salvarItens(PDO $pdo, int $orcamentoId, array $itens): float {
    $pdo->prepare('DELETE FROM orcamento_itens WHERE orcamento_id = ?')->execute([$orcamentoId]);
    $ins = $pdo->prepare('INSERT INTO orcamento_itens (orcamento_id, servico_id, descricao, detalhes, quantidade, valor_unitario, valor_total, prazo, observacao, ordem) VALUES (?,?,?,?,?,?,?,?,?,?)');
    $total = 0.0;
    $ordem = 0;
    foreach ($itens as $item) {
        if (!is_array($item)) continue;
        $desc = trim((string)($item['descricao'] ?? ''));
        if ($desc === '') continue;
        $qtd = max(0.01, (float)($item['quantidade'] ?? 1));
        $vu = (float)($item['valor_unitario'] ?? 0);
        $vt = round($qtd * $vu, 2);
        $total += $vt;
        $ins->execute([
            $orcamentoId,
            !empty($item['servico_id']) ? (int)$item['servico_id'] : null,
            $desc,
            trim((string)($item['detalhes'] ?? '')) ?: null,
            $qtd,
            $vu,
            $vt,
            trim((string)($item['prazo'] ?? '')) ?: null,
            trim((string)($item['observacao'] ?? '')) ?: null,
            $ordem++,
        ]);
    }
    $pdo->prepare('UPDATE orcamentos SET total = ? WHERE id = ?')->execute([$total, $orcamentoId]);
    return $total;
}

$method = $_SERVER['REQUEST_METHOD'];
$input = in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)
    ? (json_decode(file_get_contents('php://input'), true) ?: [])
    : [];

if ($method === 'GET') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id > 0) {
        $stmt = $pdo->prepare('SELECT * FROM orcamentos WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) orcFail('Orçamento não encontrado', 404);
        echo json_encode(rowOrcamento($pdo, $row, true));
        exit;
    }
    $status = trim((string)($_GET['status'] ?? ''));
    $sql = 'SELECT * FROM orcamentos';
    $params = [];
    if ($status !== '' && in_array($status, ['rascunho', 'enviado', 'aprovado', 'recusado'], true)) {
        $sql .= ' WHERE status = ?';
        $params[] = $status;
    }
    $sql .= ' ORDER BY numero DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $lista = [];
    foreach ($stmt->fetchAll() as $r) {
        $lista[] = rowOrcamento($pdo, $r, false);
    }
    echo json_encode(['orcamentos' => $lista]);
    exit;
}

if ($method === 'POST') {
    $clienteId = !empty($input['cliente_id']) ? (int)$input['cliente_id'] : null;
    $clienteNome = trim((string)($input['cliente_nome'] ?? ''));
    if ($clienteId) {
        $c = $pdo->prepare('SELECT nome FROM clientes WHERE id = ?');
        $c->execute([$clienteId]);
        $cn = $c->fetchColumn();
        if ($cn) $clienteNome = (string)$cn;
    }
    if ($clienteNome === '') orcFail('Informe o cliente');
    $titulo = trim((string)($input['titulo'] ?? 'Orçamento')) ?: 'Orçamento';
    $status = $input['status'] ?? 'rascunho';
    if (!in_array($status, ['rascunho', 'enviado', 'aprovado', 'recusado'], true)) $status = 'rascunho';
    $prazo = trim((string)($input['prazo'] ?? '')) ?: null;
    $obs = trim((string)($input['observacoes'] ?? '')) ?: null;
    $validade = trim((string)($input['validade_ate'] ?? '')) ?: null;
    $numero = proximoNumero($pdo);
    $pdo->prepare('INSERT INTO orcamentos (numero, cliente_id, cliente_nome, titulo, status, prazo, observacoes, validade_ate, total, created_by) VALUES (?,?,?,?,?,?,?,?,0,?)')
        ->execute([$numero, $clienteId, $clienteNome, $titulo, $status, $prazo, $obs, $validade, (int)($user['id'] ?? 0) ?: null]);
    $id = (int)$pdo->lastInsertId();
    salvarItens($pdo, $id, $input['itens'] ?? []);
    $stmt = $pdo->prepare('SELECT * FROM orcamentos WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(rowOrcamento($pdo, $stmt->fetch(), true));
    exit;
}

if ($method === 'PUT' || $method === 'PATCH') {
    $id = (int)($input['id'] ?? $_GET['id'] ?? 0);
    if ($id < 1) orcFail('Informe o orçamento');
    $chk = $pdo->prepare('SELECT * FROM orcamentos WHERE id = ?');
    $chk->execute([$id]);
    if (!$chk->fetch()) orcFail('Orçamento não encontrado', 404);

    $clienteId = array_key_exists('cliente_id', $input) ? (!empty($input['cliente_id']) ? (int)$input['cliente_id'] : null) : null;
    $clienteNome = trim((string)($input['cliente_nome'] ?? ''));
    if ($clienteId) {
        $c = $pdo->prepare('SELECT nome FROM clientes WHERE id = ?');
        $c->execute([$clienteId]);
        $cn = $c->fetchColumn();
        if ($cn) $clienteNome = (string)$cn;
    }
    if ($clienteNome === '') orcFail('Informe o cliente');
    $titulo = trim((string)($input['titulo'] ?? 'Orçamento')) ?: 'Orçamento';
    $status = $input['status'] ?? 'rascunho';
    if (!in_array($status, ['rascunho', 'enviado', 'aprovado', 'recusado'], true)) $status = 'rascunho';
    $prazo = trim((string)($input['prazo'] ?? '')) ?: null;
    $obs = trim((string)($input['observacoes'] ?? '')) ?: null;
    $validade = trim((string)($input['validade_ate'] ?? '')) ?: null;

    $pdo->prepare('UPDATE orcamentos SET cliente_id=?, cliente_nome=?, titulo=?, status=?, prazo=?, observacoes=?, validade_ate=? WHERE id=?')
        ->execute([$clienteId, $clienteNome, $titulo, $status, $prazo, $obs, $validade, $id]);
    if (isset($input['itens']) && is_array($input['itens'])) {
        salvarItens($pdo, $id, $input['itens']);
    }
    $stmt = $pdo->prepare('SELECT * FROM orcamentos WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(rowOrcamento($pdo, $stmt->fetch(), true));
    exit;
}

if ($method === 'DELETE') {
    $id = (int)($input['id'] ?? $_GET['id'] ?? 0);
    if ($id < 1) orcFail('Informe o orçamento');
    $pdo->prepare('DELETE FROM orcamentos WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
