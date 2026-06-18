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

$ano = isset($_GET['ano']) ? (int)$_GET['ano'] : (int)date('Y');

$stmt = $pdo->prepare('
    SELECT COALESCE(SUM(CASE WHEN tipo = "entrada" THEN valor ELSE 0 END), 0) AS total_entradas,
           COALESCE(SUM(CASE WHEN tipo = "saida" THEN valor ELSE 0 END), 0) AS total_saidas
    FROM transacoes WHERE YEAR(data_transacao) = ?
');
$stmt->execute([$ano]);
$totais = $stmt->fetch();
$totalEntradas = (float)$totais['total_entradas'];
$totalSaidas = (float)$totais['total_saidas'];
$saldo = $totalEntradas - $totalSaidas;

$espacos = $pdo->query('
    SELECT status, COUNT(*) AS qtd FROM espacos WHERE ativo = 1 GROUP BY status
')->fetchAll();

$stmtEsp = $pdo->query('SELECT COUNT(*) FROM espacos WHERE ativo = 1');
$totalEspacos = (int)$stmtEsp->fetchColumn();
$stmtVend = $pdo->query('SELECT COUNT(*) FROM espacos WHERE ativo = 1 AND status IN ("vendido","reservado")');
$espacosVendidos = (int)$stmtVend->fetchColumn();

$stmtCli = $pdo->query('SELECT COUNT(*) FROM clientes WHERE ativo = 1');
$totalClientes = (int)$stmtCli->fetchColumn();

$meses = [];
for ($m = 1; $m <= 12; $m++) {
    $stmt = $pdo->prepare('
        SELECT COALESCE(SUM(CASE WHEN tipo = "entrada" THEN valor ELSE 0 END), 0) AS entradas,
               COALESCE(SUM(CASE WHEN tipo = "saida" THEN valor ELSE 0 END), 0) AS saidas
        FROM transacoes WHERE YEAR(data_transacao) = ? AND MONTH(data_transacao) = ?
    ');
    $stmt->execute([$ano, $m]);
    $r = $stmt->fetch();
    $meses[] = [
        'mes' => $m,
        'entradas' => (float)$r['entradas'],
        'saidas' => (float)$r['saidas'],
    ];
}

$hoje = date('Y-m-d');
$stmtParc = $pdo->prepare('
    SELECT COALESCE(SUM(valor), 0) FROM parcelas
    WHERE status = "pendente" AND data_vencimento >= ?
');
$stmtParc->execute([$hoje]);
$aReceber = (float)$stmtParc->fetchColumn();

$stmtAtr = $pdo->prepare('SELECT COALESCE(SUM(valor), 0) FROM parcelas WHERE status = "pendente" AND data_vencimento < ?');
$stmtAtr->execute([$hoje]);
$atrasado = (float)$stmtAtr->fetchColumn();

$vendasRecentes = $pdo->query('
    SELECT v.id, v.valor_total, v.status, v.data_venda, v.parcelado,
           e.nome AS espaco_nome, c.nome AS cliente_nome, c.email AS cliente_email
    FROM vendas_espaco v
    JOIN espacos e ON e.id = v.espaco_id
    JOIN clientes c ON c.id = v.cliente_id
    WHERE v.status != "cancelado"
    ORDER BY v.data_venda DESC, v.id DESC LIMIT 10
')->fetchAll();

echo json_encode([
    'ano' => $ano,
    'total_entradas' => $totalEntradas,
    'total_saidas' => $totalSaidas,
    'saldo' => $saldo,
    'total_clientes' => $totalClientes,
    'total_espacos' => $totalEspacos,
    'espacos_vendidos' => $espacosVendidos,
    'espacos_por_status' => $espacos,
    'a_receber' => $aReceber,
    'atrasado' => $atrasado,
    'meses' => $meses,
    'vendas_recentes' => $vendasRecentes,
]);
