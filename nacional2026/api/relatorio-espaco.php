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

$valorVenda = (float)$espaco['valor_venda'];
$custo = (float)$espaco['custo'];

$stmtV = $pdo->prepare('
    SELECT v.*, c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_telefone, c.documento AS cliente_documento
    FROM vendas_espaco v
    JOIN clientes c ON c.id = v.cliente_id
    WHERE v.espaco_id = ? AND v.status != "cancelado"
    ORDER BY v.id DESC LIMIT 1
');
$stmtV->execute([$id]);
$venda = $stmtV->fetch() ?: null;

$parcelas = [];
if ($venda) {
    $stmtP = $pdo->prepare('SELECT * FROM parcelas WHERE venda_espaco_id = ? ORDER BY numero ASC');
    $stmtP->execute([(int)$venda['id']]);
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

$valorContrato = $venda ? (float)$venda['valor_total'] : $valorVenda;
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
        ];
        break;
    }
}

echo json_encode([
    'espaco' => $espaco,
    'venda' => $venda,
    'parcelas' => $parcelas,
    'transacoes' => $transacoes,
    'resumo' => [
        'valor_venda' => $valorVenda,
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
        'proxima_parcela' => $proximaParcela,
    ],
    'gerado_em' => date('c'),
]);
