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
$hoje = date('Y-m-d');

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

/* ─── A Receber (parcelas de vendas) ─── */
$stmt = $pdo->prepare('
    SELECT
      COALESCE(SUM(CASE WHEN p.status = "pendente" AND p.data_vencimento >= ? THEN p.valor ELSE 0 END), 0) AS a_vencer,
      COALESCE(SUM(CASE WHEN p.status = "pendente" AND p.data_vencimento < ? THEN p.valor ELSE 0 END), 0) AS atrasado,
      COALESCE(SUM(CASE WHEN p.status = "pendente" THEN p.valor ELSE 0 END), 0) AS em_aberto,
      COALESCE(SUM(CASE WHEN p.status = "paga" AND YEAR(p.data_pagamento) = ? THEN p.valor ELSE 0 END), 0) AS recebido_ano,
      SUM(CASE WHEN p.status = "pendente" AND p.data_vencimento >= ? THEN 1 ELSE 0 END) AS qtd_a_vencer,
      SUM(CASE WHEN p.status = "pendente" AND p.data_vencimento < ? THEN 1 ELSE 0 END) AS qtd_atrasadas,
      SUM(CASE WHEN p.status = "pendente" THEN 1 ELSE 0 END) AS qtd_em_aberto
    FROM parcelas p
    JOIN vendas_espaco v ON v.id = p.venda_espaco_id
    WHERE v.status != "cancelado" AND p.status != "cancelada"
');
$stmt->execute([$hoje, $hoje, $ano, $hoje, $hoje]);
$rec = $stmt->fetch();

$aReceber = (float)$rec['a_vencer'];
$atrasadoReceber = (float)$rec['atrasado'];
$emAbertoReceber = (float)$rec['em_aberto'];

$stmtProxRec = $pdo->prepare('
    SELECT p.numero, p.valor, p.data_vencimento, e.nome AS espaco_nome, c.nome AS cliente_nome, i.nome AS item_nome
    FROM parcelas p
    JOIN vendas_espaco v ON v.id = p.venda_espaco_id
    JOIN espacos e ON e.id = v.espaco_id
    JOIN clientes c ON c.id = v.cliente_id
    LEFT JOIN itens_espaco i ON i.id = v.item_espaco_id
    WHERE v.status != "cancelado" AND p.status = "pendente"
    ORDER BY p.data_vencimento ASC, p.numero ASC
    LIMIT 1
');
$stmtProxRec->execute();
$proxReceber = $stmtProxRec->fetch() ?: null;
if ($proxReceber) {
    $proxReceber = [
        'numero' => (int)$proxReceber['numero'],
        'valor' => (float)$proxReceber['valor'],
        'data_vencimento' => $proxReceber['data_vencimento'],
        'atrasada' => $proxReceber['data_vencimento'] < $hoje,
        'espaco_nome' => $proxReceber['espaco_nome'],
        'cliente_nome' => $proxReceber['cliente_nome'],
        'item_nome' => $proxReceber['item_nome'],
    ];
}

/* ─── Contas a Pagar (saídas) ─── */
$stmt = $pdo->prepare('
    SELECT
      COALESCE(SUM(CASE WHEN p.status = "pendente" AND p.data_vencimento >= ? THEN p.valor ELSE 0 END), 0) AS a_vencer,
      COALESCE(SUM(CASE WHEN p.status = "pendente" AND p.data_vencimento < ? THEN p.valor ELSE 0 END), 0) AS atrasado,
      COALESCE(SUM(CASE WHEN p.status = "pendente" THEN p.valor ELSE 0 END), 0) AS em_aberto,
      COALESCE(SUM(CASE WHEN p.status = "paga" AND YEAR(p.data_pagamento) = ? THEN p.valor ELSE 0 END), 0) AS pago_ano,
      SUM(CASE WHEN p.status = "pendente" AND p.data_vencimento >= ? THEN 1 ELSE 0 END) AS qtd_a_vencer,
      SUM(CASE WHEN p.status = "pendente" AND p.data_vencimento < ? THEN 1 ELSE 0 END) AS qtd_atrasadas,
      SUM(CASE WHEN p.status = "pendente" THEN 1 ELSE 0 END) AS qtd_em_aberto
    FROM parcelas_pagar p
    JOIN contas_pagar c ON c.id = p.conta_pagar_id
    WHERE c.status != "cancelado" AND p.status != "cancelada"
');
$stmt->execute([$hoje, $hoje, $ano, $hoje, $hoje]);
$pag = $stmt->fetch();

$aPagar = (float)$pag['a_vencer'];
$atrasadoPagar = (float)$pag['atrasado'];
$emAbertoPagar = (float)$pag['em_aberto'];

$stmtProxPag = $pdo->prepare('
    SELECT p.numero, p.valor, p.data_vencimento, c.descricao, c.fornecedor, e.nome AS espaco_nome
    FROM parcelas_pagar p
    JOIN contas_pagar c ON c.id = p.conta_pagar_id
    LEFT JOIN espacos e ON e.id = c.espaco_id
    WHERE c.status != "cancelado" AND p.status = "pendente"
    ORDER BY p.data_vencimento ASC, p.numero ASC
    LIMIT 1
');
$stmtProxPag->execute();
$proxPagar = $stmtProxPag->fetch() ?: null;
if ($proxPagar) {
    $proxPagar = [
        'numero' => (int)$proxPagar['numero'],
        'valor' => (float)$proxPagar['valor'],
        'data_vencimento' => $proxPagar['data_vencimento'],
        'atrasada' => $proxPagar['data_vencimento'] < $hoje,
        'descricao' => $proxPagar['descricao'],
        'fornecedor' => $proxPagar['fornecedor'],
        'espaco_nome' => $proxPagar['espaco_nome'],
    ];
}

$vendasRecentes = $pdo->query('
    SELECT v.id, v.valor_total, v.status, v.data_venda, v.parcelado, v.quantidade,
           e.nome AS espaco_nome, c.nome AS cliente_nome, c.email AS cliente_email,
           i.nome AS item_nome
    FROM vendas_espaco v
    JOIN espacos e ON e.id = v.espaco_id
    JOIN clientes c ON c.id = v.cliente_id
    LEFT JOIN itens_espaco i ON i.id = v.item_espaco_id
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
    // compatibilidade com campos antigos
    'a_receber' => $aReceber,
    'atrasado' => $atrasadoReceber,
    'meses' => $meses,
    'vendas_recentes' => $vendasRecentes,
    'a_receber_resumo' => [
        'a_vencer' => $aReceber,
        'atrasado' => $atrasadoReceber,
        'em_aberto' => $emAbertoReceber,
        'recebido_ano' => (float)$rec['recebido_ano'],
        'qtd_a_vencer' => (int)$rec['qtd_a_vencer'],
        'qtd_atrasadas' => (int)$rec['qtd_atrasadas'],
        'qtd_em_aberto' => (int)$rec['qtd_em_aberto'],
        'proxima' => $proxReceber,
    ],
    'a_pagar_resumo' => [
        'a_vencer' => $aPagar,
        'atrasado' => $atrasadoPagar,
        'em_aberto' => $emAbertoPagar,
        'pago_ano' => (float)$pag['pago_ano'],
        'qtd_a_vencer' => (int)$pag['qtd_a_vencer'],
        'qtd_atrasadas' => (int)$pag['qtd_atrasadas'],
        'qtd_em_aberto' => (int)$pag['qtd_em_aberto'],
        'proxima' => $proxPagar,
    ],
    'saldo_previsto' => $emAbertoReceber - $emAbertoPagar,
]);
