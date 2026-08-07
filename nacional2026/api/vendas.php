<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';

requireAuth();
$pdo = getDBConnection();

function atualizarStatusVenda(PDO $pdo, int $vendaId): void {
    $stmt = $pdo->prepare('SELECT COUNT(*) AS total, SUM(status = "paga") AS pagas FROM parcelas WHERE venda_espaco_id = ?');
    $stmt->execute([$vendaId]);
    $r = $stmt->fetch();
    $total = (int)$r['total'];
    $pagas = (int)$r['pagas'];
    $status = 'aberto';
    if ($pagas > 0 && $pagas < $total) $status = 'parcial';
    if ($total > 0 && $pagas >= $total) $status = 'quitado';
    $pdo->prepare('UPDATE vendas_espaco SET status = ? WHERE id = ?')->execute([$status, $vendaId]);
    $stmt = $pdo->prepare('SELECT espaco_id FROM vendas_espaco WHERE id = ?');
    $stmt->execute([$vendaId]);
    $espacoId = (int)$stmt->fetchColumn();
    if ($espacoId) {
        atualizarStatusEspaco($pdo, $espacoId);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if ($id) {
        $stmt = $pdo->prepare('
            SELECT v.*, e.nome AS espaco_nome, c.nome AS cliente_nome, i.nome AS item_nome
            FROM vendas_espaco v
            JOIN espacos e ON e.id = v.espaco_id
            JOIN clientes c ON c.id = v.cliente_id
            LEFT JOIN itens_espaco i ON i.id = v.item_espaco_id
            WHERE v.id = ?
        ');
        $stmt->execute([$id]);
        $venda = $stmt->fetch();
        if (!$venda) {
            http_response_code(404);
            echo json_encode(['error' => 'Venda não encontrada']);
            exit;
        }
        $stmtP = $pdo->prepare('SELECT * FROM parcelas WHERE venda_espaco_id = ? ORDER BY numero ASC');
        $stmtP->execute([$id]);
        $venda['parcelas'] = $stmtP->fetchAll();
        echo json_encode($venda);
        exit;
    }

    $stmt = $pdo->query('
        SELECT v.*, e.nome AS espaco_nome, c.nome AS cliente_nome, c.email AS cliente_email,
               i.nome AS item_nome
        FROM vendas_espaco v
        JOIN espacos e ON e.id = v.espaco_id
        JOIN clientes c ON c.id = v.cliente_id
        LEFT JOIN itens_espaco i ON i.id = v.item_espaco_id
        WHERE v.status != "cancelado"
        ORDER BY v.data_venda DESC, v.id DESC
    ');
    echo json_encode(['vendas' => $stmt->fetchAll()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAdminOrRoot();
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $espacoId = (int)($input['espaco_id'] ?? 0);
    $itemEspacoId = (int)($input['item_espaco_id'] ?? 0);
    $clienteId = (int)($input['cliente_id'] ?? 0);
    $quantidade = max(1, (int)($input['quantidade'] ?? 1));
    $valorTotal = (float)str_replace(',', '.', (string)($input['valor_total'] ?? 0));
    $parcelado = !empty($input['parcelado']);
    $datasParcelas = $input['datas_parcelas'] ?? [];
    $valoresParcelas = $input['valores_parcelas'] ?? [];
    $dataVenda = normalizarData($input['data_venda'] ?? '') ?: date('Y-m-d');

    if ($espacoId < 1 || $itemEspacoId < 1 || $clienteId < 1 || $valorTotal <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Espaço, item, cliente e valor total são obrigatórios']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT id FROM espacos WHERE id = ? AND ativo = 1');
    $stmt->execute([$espacoId]);
    if (!$stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Espaço não encontrado ou inativo']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT id FROM itens_espaco WHERE id = ? AND espaco_id = ? AND ativo = 1');
    $stmt->execute([$itemEspacoId, $espacoId]);
    if (!$stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Item inválido para este espaço']);
        exit;
    }

    $qtdParcelas = $parcelado ? max(1, count($datasParcelas)) : 1;
    if ($parcelado && $qtdParcelas < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'Informe as datas das parcelas']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare('INSERT INTO vendas_espaco (espaco_id, item_espaco_id, cliente_id, valor_total, quantidade, parcelado, qtd_parcelas, status, data_venda, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, "aberto", ?, ?)');
        $stmt->execute([
            $espacoId,
            $itemEspacoId,
            $clienteId,
            $valorTotal,
            $quantidade,
            $parcelado ? 1 : 0,
            $qtdParcelas,
            $dataVenda,
            trim($input['observacoes'] ?? '') ?: null,
        ]);
        $vendaId = (int)$pdo->lastInsertId();

        if ($parcelado) {
            foreach ($datasParcelas as $i => $dataParc) {
                $dataNorm = normalizarData($dataParc);
                if (!$dataNorm) continue;
                $valorParc = isset($valoresParcelas[$i])
                    ? (float)str_replace(',', '.', (string)$valoresParcelas[$i])
                    : round($valorTotal / $qtdParcelas, 2);
                $pdo->prepare('INSERT INTO parcelas (venda_espaco_id, numero, valor, data_vencimento, status) VALUES (?, ?, ?, ?, "pendente")')
                    ->execute([$vendaId, $i + 1, $valorParc, $dataNorm]);
            }
        } else {
            $pdo->prepare('INSERT INTO parcelas (venda_espaco_id, numero, valor, data_vencimento, status) VALUES (?, 1, ?, ?, "pendente")')
                ->execute([$vendaId, $valorTotal, $dataVenda]);
        }

        atualizarStatusEspaco($pdo, $espacoId);
        $pdo->commit();

        $stmt = $pdo->prepare('
            SELECT v.*, e.nome AS espaco_nome, c.nome AS cliente_nome, i.nome AS item_nome
            FROM vendas_espaco v JOIN espacos e ON e.id = v.espaco_id JOIN clientes c ON c.id = v.cliente_id
            LEFT JOIN itens_espaco i ON i.id = v.item_espaco_id
            WHERE v.id = ?
        ');
        $stmt->execute([$vendaId]);
        $venda = $stmt->fetch();
        $stmtP = $pdo->prepare('SELECT * FROM parcelas WHERE venda_espaco_id = ? ORDER BY numero');
        $stmtP->execute([$vendaId]);
        $venda['parcelas'] = $stmtP->fetchAll();
        echo json_encode($venda);
    } catch (Throwable $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao registrar venda', 'detail' => $e->getMessage()]);
    }
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
    if (($input['acao'] ?? '') === 'cancelar') {
        $pdo->prepare('UPDATE vendas_espaco SET status = "cancelado" WHERE id = ?')->execute([$id]);
        $stmt = $pdo->prepare('SELECT espaco_id FROM vendas_espaco WHERE id = ?');
        $stmt->execute([$id]);
        $espacoId = (int)$stmt->fetchColumn();
        if ($espacoId) {
            atualizarStatusEspaco($pdo, $espacoId);
        }
        $pdo->prepare('UPDATE parcelas SET status = "cancelada" WHERE venda_espaco_id = ?')->execute([$id]);
        echo json_encode(['success' => true]);
        exit;
    }
    http_response_code(400);
    echo json_encode(['error' => 'Ação inválida']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
