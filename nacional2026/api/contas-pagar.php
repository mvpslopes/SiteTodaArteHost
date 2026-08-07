<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';

requireAuth();
$pdo = getDBConnection();
$metodos = ['pix','boleto','ted','dinheiro','transferencia','cheque'];

function atualizarStatusContaPagar(PDO $pdo, int $contaId): void {
    $stmt = $pdo->prepare('SELECT COUNT(*) AS total, SUM(status = "paga") AS pagas FROM parcelas_pagar WHERE conta_pagar_id = ? AND status != "cancelada"');
    $stmt->execute([$contaId]);
    $r = $stmt->fetch();
    $total = (int)$r['total'];
    $pagas = (int)$r['pagas'];
    $status = 'aberto';
    if ($pagas > 0 && $pagas < $total) $status = 'parcial';
    if ($total > 0 && $pagas >= $total) $status = 'quitado';
    $pdo->prepare('UPDATE contas_pagar SET status = ? WHERE id = ?')->execute([$status, $contaId]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $status = $_GET['status'] ?? null;
    $sql = '
        SELECT p.*, c.descricao, c.fornecedor, c.espaco_id, c.parcelado, c.qtd_parcelas,
               e.nome AS espaco_nome
        FROM parcelas_pagar p
        JOIN contas_pagar c ON c.id = p.conta_pagar_id
        LEFT JOIN espacos e ON e.id = c.espaco_id
        WHERE c.status != "cancelado"
    ';
    $params = [];
    $hoje = date('Y-m-d');
    if ($status === 'atrasada') {
        $sql .= ' AND p.status = "pendente" AND p.data_vencimento < ?';
        $params[] = $hoje;
    } elseif ($status === 'pendente') {
        $sql .= ' AND p.status = "pendente" AND p.data_vencimento >= ?';
        $params[] = $hoje;
    } elseif ($status && in_array($status, ['paga', 'cancelada'], true)) {
        $sql .= ' AND p.status = ?';
        $params[] = $status;
    } elseif ($status === 'todas') {
        $sql .= ' AND p.status != "cancelada"';
    } else {
        $sql .= ' AND p.status = "pendente"';
    }
    $sql .= ' ORDER BY p.data_vencimento ASC, p.numero ASC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $parcelas = $stmt->fetchAll();
    foreach ($parcelas as &$p) {
        if ($p['status'] === 'pendente' && $p['data_vencimento'] < $hoje) {
            $p['status'] = 'atrasada';
        }
    }
    echo json_encode(['parcelas' => $parcelas]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAdminOrRoot();
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $descricao = trim($input['descricao'] ?? '');
    $valorTotal = (float)str_replace(',', '.', (string)($input['valor_total'] ?? 0));
    $parcelado = !empty($input['parcelado']);
    $datasParcelas = $input['datas_parcelas'] ?? [];
    $valoresParcelas = $input['valores_parcelas'] ?? [];
    $dataCompetencia = normalizarData($input['data_competencia'] ?? '') ?: date('Y-m-d');
    $espacoId = !empty($input['espaco_id']) ? (int)$input['espaco_id'] : null;

    if ($descricao === '' || $valorTotal <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Descrição e valor total são obrigatórios']);
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
        $stmt = $pdo->prepare('INSERT INTO contas_pagar (descricao, fornecedor, espaco_id, valor_total, parcelado, qtd_parcelas, status, data_competencia, observacoes) VALUES (?, ?, ?, ?, ?, ?, "aberto", ?, ?)');
        $stmt->execute([
            $descricao,
            trim($input['fornecedor'] ?? '') ?: null,
            $espacoId,
            $valorTotal,
            $parcelado ? 1 : 0,
            $qtdParcelas,
            $dataCompetencia,
            trim($input['observacoes'] ?? '') ?: null,
        ]);
        $contaId = (int)$pdo->lastInsertId();

        if ($parcelado) {
            foreach ($datasParcelas as $i => $dataParc) {
                $dataNorm = normalizarData($dataParc);
                if (!$dataNorm) continue;
                $valorParc = isset($valoresParcelas[$i])
                    ? (float)str_replace(',', '.', (string)$valoresParcelas[$i])
                    : round($valorTotal / $qtdParcelas, 2);
                $pdo->prepare('INSERT INTO parcelas_pagar (conta_pagar_id, numero, valor, data_vencimento, status) VALUES (?, ?, ?, ?, "pendente")')
                    ->execute([$contaId, $i + 1, $valorParc, $dataNorm]);
            }
        } else {
            $pdo->prepare('INSERT INTO parcelas_pagar (conta_pagar_id, numero, valor, data_vencimento, status) VALUES (?, 1, ?, ?, "pendente")')
                ->execute([$contaId, $valorTotal, $dataCompetencia]);
        }

        $pdo->commit();
        $stmt = $pdo->prepare('SELECT * FROM contas_pagar WHERE id = ?');
        $stmt->execute([$contaId]);
        $conta = $stmt->fetch();
        $stmtP = $pdo->prepare('SELECT * FROM parcelas_pagar WHERE conta_pagar_id = ? ORDER BY numero');
        $stmtP->execute([$contaId]);
        $conta['parcelas'] = $stmtP->fetchAll();
        echo json_encode($conta);
    } catch (Throwable $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao registrar conta a pagar', 'detail' => $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireAdminOrRoot();
    $current = requireAuth();
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = (int)($input['id'] ?? 0);
    $acao = $input['acao'] ?? '';

    if ($acao === 'cancelar_conta') {
        $contaId = (int)($input['conta_id'] ?? $id);
        if ($contaId < 1) {
            http_response_code(400);
            echo json_encode(['error' => 'ID da conta é obrigatório']);
            exit;
        }
        $pdo->prepare('UPDATE contas_pagar SET status = "cancelado" WHERE id = ?')->execute([$contaId]);
        $pdo->prepare('UPDATE parcelas_pagar SET status = "cancelada" WHERE conta_pagar_id = ? AND status = "pendente"')->execute([$contaId]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($id < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }

    $stmt = $pdo->prepare('
        SELECT p.*, c.descricao, c.fornecedor, c.espaco_id, e.nome AS espaco_nome
        FROM parcelas_pagar p
        JOIN contas_pagar c ON c.id = p.conta_pagar_id
        LEFT JOIN espacos e ON e.id = c.espaco_id
        WHERE p.id = ?
    ');
    $stmt->execute([$id]);
    $parcela = $stmt->fetch();
    if (!$parcela) {
        http_response_code(404);
        echo json_encode(['error' => 'Parcela não encontrada']);
        exit;
    }

    if ($acao === 'pagar') {
        if ($parcela['status'] !== 'pendente') {
            http_response_code(400);
            echo json_encode(['error' => 'Esta parcela já foi paga ou está cancelada']);
            exit;
        }

        $dataPag = normalizarData($input['data_pagamento'] ?? '') ?: date('Y-m-d');
        $metodo = $input['metodo_pagamento'] ?? 'pix';
        if (!in_array($metodo, $metodos, true)) $metodo = 'pix';

        try {
            $pdo->beginTransaction();
            $pdo->prepare('UPDATE parcelas_pagar SET status = "paga", data_pagamento = ? WHERE id = ?')->execute([$dataPag, $id]);
            $desc = 'Pagamento saída parcela ' . $parcela['numero'] . ' — ' . $parcela['descricao'];
            if (!empty($parcela['espaco_nome'])) {
                $desc .= ' — ' . $parcela['espaco_nome'];
            }
            $pdo->prepare('INSERT INTO transacoes (tipo, data_transacao, valor, descricao, metodo_pagamento, espaco_id, parcela_pagar_id, created_by) VALUES ("saida", ?, ?, ?, ?, ?, ?, ?)')
                ->execute([
                    $dataPag,
                    $parcela['valor'],
                    $desc,
                    $metodo,
                    $parcela['espaco_id'] ?: null,
                    $id,
                    (int)$current['id'],
                ]);
            atualizarStatusContaPagar($pdo, (int)$parcela['conta_pagar_id']);
            $pdo->commit();
            $stmt = $pdo->prepare('SELECT * FROM parcelas_pagar WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode($stmt->fetch());
        } catch (Throwable $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao registrar pagamento', 'detail' => $e->getMessage()]);
        }
        exit;
    }

    if ($acao === 'desfazer') {
        if ($parcela['status'] !== 'paga') {
            http_response_code(400);
            echo json_encode(['error' => 'Só é possível desfazer parcelas já pagas']);
            exit;
        }
        try {
            $pdo->beginTransaction();
            $pdo->prepare('UPDATE parcelas_pagar SET status = "pendente", data_pagamento = NULL WHERE id = ?')->execute([$id]);
            $pdo->prepare('DELETE FROM transacoes WHERE parcela_pagar_id = ? AND tipo = "saida"')->execute([$id]);
            atualizarStatusContaPagar($pdo, (int)$parcela['conta_pagar_id']);
            $pdo->commit();
            $stmt = $pdo->prepare('SELECT * FROM parcelas_pagar WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode($stmt->fetch());
        } catch (Throwable $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao desfazer pagamento', 'detail' => $e->getMessage()]);
        }
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Ação inválida']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
