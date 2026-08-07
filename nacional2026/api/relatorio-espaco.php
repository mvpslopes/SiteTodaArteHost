<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';

requireAuth();
$pdo = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'Informe o id do espaço']);
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM espacos WHERE id = ?');
$stmt->execute([$id]);
$espaco = $stmt->fetch();
if (!$espaco) {
    http_response_code(404);
    echo json_encode(['error' => 'Espaço não encontrado']);
    exit;
}

$custo = (float)$espaco['custo'];

$stmtItens = $pdo->prepare('SELECT * FROM itens_espaco WHERE espaco_id = ? AND ativo = 1 ORDER BY nome ASC');
$stmtItens->execute([$id]);
$itens = $stmtItens->fetchAll();

$stmtV = $pdo->prepare('
    SELECT v.*, c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_telefone,
           c.documento AS cliente_documento, i.nome AS item_nome
    FROM vendas_espaco v
    JOIN clientes c ON c.id = v.cliente_id
    LEFT JOIN itens_espaco i ON i.id = v.item_espaco_id
    WHERE v.espaco_id = ? AND v.status != "cancelado"
    ORDER BY v.data_venda DESC, v.id DESC
');
$stmtV->execute([$id]);
$vendas = $stmtV->fetchAll();

$parcelas = [];
$vendaIds = array_map(fn($v) => (int)$v['id'], $vendas);
if ($vendaIds) {
    $placeholders = implode(',', array_fill(0, count($vendaIds), '?'));
    $stmtP = $pdo->prepare("
        SELECT p.*, v.cliente_id, c.nome AS cliente_nome, i.nome AS item_nome, v.quantidade
        FROM parcelas p
        JOIN vendas_espaco v ON v.id = p.venda_espaco_id
        JOIN clientes c ON c.id = v.cliente_id
        LEFT JOIN itens_espaco i ON i.id = v.item_espaco_id
        WHERE p.venda_espaco_id IN ($placeholders)
        ORDER BY p.data_vencimento ASC, p.numero ASC
    ");
    $stmtP->execute($vendaIds);
    $parcelas = $stmtP->fetchAll();
}

$stmtT = $pdo->prepare('
    SELECT t.*, c.nome AS cliente_nome
    FROM transacoes t
    LEFT JOIN clientes c ON c.id = t.cliente_id
    WHERE t.espaco_id = ?
    ORDER BY t.data_transacao DESC, t.id DESC
');
$stmtT->execute([$id]);
$transacoes = $stmtT->fetchAll();

$hoje = date('Y-m-d');
$totalEntradas = 0.0;
$totalSaidas = 0.0;
foreach ($transacoes as $t) {
    $v = (float)$t['valor'];
    if ($t['tipo'] === 'entrada') $totalEntradas += $v;
    else $totalSaidas += $v;
}

$valorContrato = 0.0;
foreach ($vendas as $v) {
    $valorContrato += (float)$v['valor_total'];
}

$recebidoParcelas = 0.0;
$aReceber = 0.0;
$atrasado = 0.0;
$parcelasPagas = 0;
$parcelasPendentes = 0;

foreach ($parcelas as $p) {
    $valor = (float)$p['valor'];
    if ($p['status'] === 'paga') {
        $recebidoParcelas += $valor;
        $parcelasPagas++;
    } elseif ($p['status'] === 'pendente') {
        $parcelasPendentes++;
        if ($p['data_vencimento'] < $hoje) {
            $atrasado += $valor;
        } else {
            $aReceber += $valor;
        }
    }
}

$margemPrevista = $valorContrato - $custo;
$lucroRealizado = $totalEntradas - $totalSaidas - $custo;
$percentualRecebido = $valorContrato > 0 ? round(($recebidoParcelas / $valorContrato) * 100, 1) : 0;

$proximaParcela = null;
foreach ($parcelas as $p) {
    if ($p['status'] === 'pendente') {
        $proximaParcela = [
            'numero' => (int)$p['numero'],
            'valor' => (float)$p['valor'],
            'data_vencimento' => $p['data_vencimento'],
            'atrasada' => $p['data_vencimento'] < $hoje,
            'cliente_nome' => $p['cliente_nome'] ?? null,
            'item_nome' => $p['item_nome'] ?? null,
        ];
        break;
    }
}

echo json_encode([
    'espaco' => $espaco,
    'itens' => $itens,
    'vendas' => $vendas,
    'parcelas' => $parcelas,
    'transacoes' => $transacoes,
    'resumo' => [
        'valor_contrato' => $valorContrato,
        'custo' => $custo,
        'margem_prevista' => $margemPrevista,
        'total_entradas' => $totalEntradas,
        'total_saidas' => $totalSaidas,
        'saldo_fluxo' => $totalEntradas - $totalSaidas,
        'recebido_parcelas' => $recebidoParcelas,
        'a_receber' => $aReceber,
        'atrasado' => $atrasado,
        'lucro_realizado' => $lucroRealizado,
        'percentual_recebido' => $percentualRecebido,
        'parcelas_pagas' => $parcelasPagas,
        'parcelas_pendentes' => $parcelasPendentes,
        'vendas_count' => count($vendas),
        'itens_count' => count($itens),
        'proxima_parcela' => $proximaParcela,
    ],
    'gerado_em' => date('c'),
]);
