<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';

requireAuth();
$pdo = getDBConnection();

function atualizarStatusVenda(PDO $pdo, int $vendaId): void {
    $stmt = $pdo->prepare('SELECT COUNT(*) AS total, SUM(status = "paga") AS pagas FROM parcelas WHERE venda_espaco_id = ? AND status != "cancelada"');
    $stmt->execute([$vendaId]);
    $r = $stmt->fetch();
    $total = (int)$r['total'];
    $pagas = (int)$r['pagas'];
    $status = 'aberto';
    if ($pagas > 0 && $pagas < $total) $status = 'parcial';
    if ($total > 0 && $pagas >= $total) $status = 'quitado';
    $pdo->prepare('UPDATE vendas_espaco SET status = ? WHERE id = ?')->execute([$status, $vendaId]);
    if ($status === 'quitado') {
        $stmt = $pdo->prepare('SELECT espaco_id FROM vendas_espaco WHERE id = ?');
        $stmt->execute([$vendaId]);
        $espacoId = (int)$stmt->fetchColumn();
        if ($espacoId) {
            $pdo->prepare('UPDATE espacos SET status = "vendido" WHERE id = ?')->execute([$espacoId]);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $status = $_GET['status'] ?? null;
    $sql = '
        SELECT p.*, v.espaco_id, v.cliente_id, e.nome AS espaco_nome, c.nome AS cliente_nome, c.email AS cliente_email
        FROM parcelas p
        JOIN vendas_espaco v ON v.id = p.venda_espaco_id
        JOIN espacos e ON e.id = v.espaco_id
        JOIN clientes c ON c.id = v.cliente_id
        WHERE v.status != "cancelado"
    ';
    $params = [];
    if ($status && in_array($status, ['pendente','paga','atrasada','cancelada'], true)) {
        $sql .= ' AND p.status = ?';
        $params[] = $status;
    }
    $sql .= ' ORDER BY p.data_vencimento ASC, p.numero ASC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $parcelas = $stmt->fetchAll();
    $hoje = date('Y-m-d');
    foreach ($parcelas as &$p) {
        if ($p['status'] === 'pendente' && $p['data_vencimento'] < $hoje) {
            $p['status'] = 'atrasada';
        }
    }
    echo json_encode(['parcelas' => $parcelas]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireAdminOrRoot();
    $current = requireAuth();
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = (int)($input['id'] ?? 0);
    if ($id < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }

    $stmt = $pdo->prepare('
        SELECT p.*, v.espaco_id, v.cliente_id, e.nome AS espaco_nome
        FROM parcelas p
        JOIN vendas_espaco v ON v.id = p.venda_espaco_id
        JOIN espacos e ON e.id = v.espaco_id
        WHERE p.id = ?
    ');
    $stmt->execute([$id]);
    $parcela = $stmt->fetch();
    if (!$parcela) {
        http_response_code(404);
        echo json_encode(['error' => 'Parcela não encontrada']);
        exit;
    }

    if (($input['acao'] ?? '') === 'pagar') {
        $dataPag = normalizarData($input['data_pagamento'] ?? '') ?: date('Y-m-d');
        $metodo = $input['metodo_pagamento'] ?? 'pix';
        $metodos = ['pix','boleto','ted','dinheiro','transferencia','cheque'];
        if (!in_array($metodo, $metodos, true)) $metodo = 'pix';

        try {
            $pdo->beginTransaction();
            $pdo->prepare('UPDATE parcelas SET status = "paga", data_pagamento = ? WHERE id = ?')->execute([$dataPag, $id]);
            $desc = 'Pagamento parcela ' . $parcela['numero'] . ' — ' . $parcela['espaco_nome'];
            $pdo->prepare('INSERT INTO transacoes (tipo, data_transacao, valor, descricao, metodo_pagamento, cliente_id, espaco_id, parcela_id, created_by) VALUES ("entrada", ?, ?, ?, ?, ?, ?, ?, ?)')
                ->execute([
                    $dataPag,
                    $parcela['valor'],
                    $desc,
                    $metodo,
                    $parcela['cliente_id'],
                    $parcela['espaco_id'],
                    $id,
                    (int)$current['id'],
                ]);
            atualizarStatusVenda($pdo, (int)$parcela['venda_espaco_id']);
            $pdo->commit();
            $stmt = $pdo->prepare('SELECT * FROM parcelas WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode($stmt->fetch());
        } catch (Throwable $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao registrar pagamento', 'detail' => $e->getMessage()]);
        }
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Ação inválida']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
