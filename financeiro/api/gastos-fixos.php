<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';
require_once 'db_helpers.php';

try {
    $currentUser = requireAuth();
    $pdo = getDBConnection();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno', 'detail' => $e->getMessage()]);
    exit;
}

function normalizarInt($value, $min, $max) {
    $n = (int)$value;
    if ($n < $min || $n > $max) return null;
    return $n;
}

function gastoFixoVigente(array $g, int $mes, int $ano): bool {
    $inicio = ((int)$g['ano_inicio']) * 12 + ((int)$g['mes_inicio']);
    $atual = $ano * 12 + $mes;
    if ($atual < $inicio) {
        return false;
    }
    if (!empty($g['mes_fim']) && !empty($g['ano_fim'])) {
        $fim = ((int)$g['ano_fim']) * 12 + ((int)$g['mes_fim']);
        if ($atual > $fim) {
            return false;
        }
    }
    return true;
}

function statusGastoFixo(bool $pago, int $diaVencimento, int $mes, int $ano): string {
    if ($pago) {
        return 'pago';
    }
    $hoje = new DateTimeImmutable('today');
    $mesAtual = ((int)$hoje->format('n'));
    $anoAtual = ((int)$hoje->format('Y'));
    $compSel = $ano * 12 + $mes;
    $compHoje = $anoAtual * 12 + $mesAtual;
    if ($compSel < $compHoje) {
        return 'atrasado';
    }
    if ($compSel > $compHoje) {
        return 'pendente';
    }
    $diaHoje = (int)$hoje->format('j');
    return $diaHoje > $diaVencimento ? 'atrasado' : 'pendente';
}

// GET: listar gastos fixos (por mês/ano) ou alertas de vencimento
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $mes = isset($_GET['mes']) ? normalizarInt($_GET['mes'], 1, 12) : (int)date('n');
    $ano = isset($_GET['ano']) ? normalizarInt($_GET['ano'], 2000, 2100) : (int)date('Y');
    $alertas = isset($_GET['alertas']) ? (int)$_GET['alertas'] === 1 : false;
    $hasGastoFixoId = ensureTransacaoGastoFixoColumn($pdo);

    $sqlBase = "
        SELECT g.*, f.nome AS favorecido_nome
        FROM gastos_fixos g
        LEFT JOIN favorecidos f ON f.id = g.favorecido_id
        WHERE g.ativo = 1
        ORDER BY g.dia_vencimento ASC, g.nome ASC
    ";

    try {
        $stmt = $pdo->query($sqlBase);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $pagamentos = [];
        $descricoesPagas = [];
        $sqlPag = "
            SELECT " . ($hasGastoFixoId ? 'gasto_fixo_id,' : 'NULL AS gasto_fixo_id,') . " descricao
            FROM transacoes
            WHERE tipo = 'saida'
              AND MONTH(data_transacao) = ?
              AND YEAR(data_transacao) = ?
        ";
        $stmtPag = $pdo->prepare($sqlPag);
        $stmtPag->execute([$mes, $ano]);
        foreach ($stmtPag->fetchAll(PDO::FETCH_ASSOC) as $p) {
            if (!empty($p['gasto_fixo_id'])) {
                $pagamentos[(int)$p['gasto_fixo_id']] = true;
            }
            $d = trim((string)($p['descricao'] ?? ''));
            if ($d !== '' && stripos($d, 'Pagamento gasto fixo:') === 0) {
                $descricoesPagas[] = mb_strtolower($d);
            }
        }

        $saida = [];
        foreach ($rows as $g) {
            if (!gastoFixoVigente($g, $mes, $ano)) {
                continue;
            }
            $id = (int)$g['id'];
            $pago = !empty($pagamentos[$id]);
            if (!$pago) {
                $prefix = mb_strtolower('Pagamento gasto fixo: ' . $g['nome']);
                foreach ($descricoesPagas as $d) {
                    if (strpos($d, $prefix) === 0) {
                        $pago = true;
                        break;
                    }
                }
            }
            $status = statusGastoFixo($pago, (int)$g['dia_vencimento'], $mes, $ano);
            $g['pago'] = $pago ? 1 : 0;
            $g['status_pagamento'] = $status;
            if ($alertas && $pago) {
                continue;
            }
            $saida[] = $g;
        }

        if ($alertas) {
            usort($saida, function ($a, $b) {
                $ordem = ['atrasado' => 0, 'pendente' => 1, 'pago' => 2];
                $oa = $ordem[$a['status_pagamento']] ?? 9;
                $ob = $ordem[$b['status_pagamento']] ?? 9;
                if ($oa !== $ob) return $oa - $ob;
                return ((int)$a['dia_vencimento']) - ((int)$b['dia_vencimento']);
            });
        }

        echo json_encode([
            'mes' => $mes,
            'ano' => $ano,
            $alertas ? 'alertas' : 'gastos' => $saida,
            'pendentes' => count(array_filter($saida, fn($g) => ($g['status_pagamento'] ?? '') !== 'pago')),
        ]);
        exit;
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Erro ao consultar gastos fixos',
            'detail' => $e->getMessage(),
        ]);
        exit;
    }
}

// Demais métodos exigem perfil administrador ou root
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE'], true)) {
    requireAdminOrRoot();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $nome = trim($input['nome'] ?? '');
    $descricao = trim($input['descricao'] ?? '');
    $valor = isset($input['valor_padrao']) ? (float)$input['valor_padrao'] : null;
    $dia = normalizarInt($input['dia_vencimento'] ?? 0, 1, 31);
    $mesInicio = normalizarInt($input['mes_inicio'] ?? 0, 1, 12);
    $anoInicio = normalizarInt($input['ano_inicio'] ?? 0, 2000, 2100);
    $mesFim = isset($input['mes_fim']) ? normalizarInt($input['mes_fim'], 1, 12) : null;
    $anoFim = isset($input['ano_fim']) ? normalizarInt($input['ano_fim'], 2000, 2100) : null;
    $metodo = $input['metodo_pagamento'] ?? null;
    $favorecido_id = isset($input['favorecido_id']) ? (int)$input['favorecido_id'] : null;
    if ($favorecido_id !== null && $favorecido_id < 1) $favorecido_id = null;
    $ativo = isset($input['ativo']) ? (int)(bool)$input['ativo'] : 1;

    if ($nome === '' || !$dia || !$mesInicio || !$anoInicio) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome, dia de vencimento, mês e ano de início são obrigatórios']);
        exit;
    }

    $metodosPermitidos = ['pix','boleto','ted','dinheiro','cheque','pix_nota_fiscal'];
    if ($metodo !== null && !in_array($metodo, $metodosPermitidos, true)) {
        $metodo = null;
    }

    $stmt = $pdo->prepare("
        INSERT INTO gastos_fixos (nome, descricao, valor_padrao, dia_vencimento, mes_inicio, ano_inicio, mes_fim, ano_fim, metodo_pagamento, favorecido_id, ativo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $nome,
        $descricao !== '' ? $descricao : null,
        $valor !== null ? $valor : null,
        $dia,
        $mesInicio,
        $anoInicio,
        $mesFim,
        $anoFim,
        $metodo,
        $favorecido_id,
        $ativo,
    ]);

    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare("SELECT g.*, f.nome AS favorecido_nome FROM gastos_fixos g LEFT JOIN favorecidos f ON f.id = g.favorecido_id WHERE g.id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    if ($id < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }

    $nome = isset($input['nome']) ? trim($input['nome']) : null;
    $descricao = array_key_exists('descricao', $input) ? trim((string)$input['descricao']) : null;
    $valor = array_key_exists('valor_padrao', $input) ? (float)$input['valor_padrao'] : null;
    $dia = array_key_exists('dia_vencimento', $input) ? normalizarInt($input['dia_vencimento'], 1, 31) : null;
    $mesInicio = array_key_exists('mes_inicio', $input) ? normalizarInt($input['mes_inicio'], 1, 12) : null;
    $anoInicio = array_key_exists('ano_inicio', $input) ? normalizarInt($input['ano_inicio'], 2000, 2100) : null;
    $mesFim = array_key_exists('mes_fim', $input) ? normalizarInt($input['mes_fim'], 1, 12) : null;
    $anoFim = array_key_exists('ano_fim', $input) ? normalizarInt($input['ano_fim'], 2000, 2100) : null;
    $metodo = array_key_exists('metodo_pagamento', $input) ? $input['metodo_pagamento'] : null;
    $favorecido_id = array_key_exists('favorecido_id', $input) ? (int)$input['favorecido_id'] : null;
    $ativo = array_key_exists('ativo', $input) ? (int)(bool)$input['ativo'] : null;

    $metodosPermitidos = ['pix','boleto','ted','dinheiro','cheque','pix_nota_fiscal'];
    if ($metodo !== null && $metodo !== '' && !in_array($metodo, $metodosPermitidos, true)) {
        $metodo = null;
    }
    if ($favorecido_id !== null && $favorecido_id < 1) {
        $favorecido_id = null;
    }

    $fields = [];
    $params = [];
    if ($nome !== null) { $fields[] = 'nome = ?'; $params[] = $nome; }
    if ($descricao !== null) { $fields[] = 'descricao = ?'; $params[] = ($descricao === '' ? null : $descricao); }
    if ($valor !== null) { $fields[] = 'valor_padrao = ?'; $params[] = $valor; }
    if ($dia !== null) { $fields[] = 'dia_vencimento = ?'; $params[] = $dia; }
    if ($mesInicio !== null) { $fields[] = 'mes_inicio = ?'; $params[] = $mesInicio; }
    if ($anoInicio !== null) { $fields[] = 'ano_inicio = ?'; $params[] = $anoInicio; }
    if (array_key_exists('mes_fim', $input)) { $fields[] = 'mes_fim = ?'; $params[] = $mesFim; }
    if (array_key_exists('ano_fim', $input)) { $fields[] = 'ano_fim = ?'; $params[] = $anoFim; }
    if (array_key_exists('metodo_pagamento', $input)) { $fields[] = 'metodo_pagamento = ?'; $params[] = $metodo; }
    if (array_key_exists('favorecido_id', $input)) { $fields[] = 'favorecido_id = ?'; $params[] = $favorecido_id; }
    if ($ativo !== null) { $fields[] = 'ativo = ?'; $params[] = $ativo; }

    if (!$fields) {
        http_response_code(400);
        echo json_encode(['error' => 'Nenhum campo para atualizar']);
        exit;
    }

    $params[] = $id;
    $sql = "UPDATE gastos_fixos SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Registro não encontrado']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT g.*, f.nome AS favorecido_nome FROM gastos_fixos g LEFT JOIN favorecidos f ON f.id = g.favorecido_id WHERE g.id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM gastos_fixos WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);

