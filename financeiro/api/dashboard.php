<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';
require_once 'db_helpers.php';

try {
    requireAuth();
    $pdo = getDBConnection();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno', 'detail' => $e->getMessage()]);
    exit;
}

$mes = isset($_GET['mes']) ? (int)$_GET['mes'] : (int)date('n');
$ano = isset($_GET['ano']) ? (int)$_GET['ano'] : (int)date('Y');

// Totais do mês
$stmt = $pdo->prepare("
    SELECT
        COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END), 0) AS total_entradas,
        COALESCE(SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END), 0) AS total_saidas
    FROM transacoes
    WHERE MONTH(data_transacao) = ? AND YEAR(data_transacao) = ?
");
$stmt->execute([$mes, $ano]);
$totais = $stmt->fetch();

$totalEntradas = (float)($totais['total_entradas'] ?? 0);
$totalSaidas = (float)($totais['total_saidas'] ?? 0);
$saldoMes = $totalEntradas - $totalSaidas;

$hasClientes = tableExists($pdo, 'clientes');
$hasClienteId = columnExists($pdo, 'transacoes', 'cliente_id');

// Lista de transações do mês com descrição (para o relatório)
if ($hasClientes && $hasClienteId) {
    $stmt = $pdo->prepare("
        SELECT t.id, t.tipo, t.data_transacao, t.valor, t.metodo_pagamento, t.descricao, f.nome AS favorecido_nome, c.nome AS cliente_nome
        FROM transacoes t
        LEFT JOIN favorecidos f ON f.id = t.favorecido_id
        LEFT JOIN clientes c ON c.id = t.cliente_id
        WHERE MONTH(t.data_transacao) = ? AND YEAR(t.data_transacao) = ?
        ORDER BY t.data_transacao ASC, t.id ASC
    ");
} else {
    $stmt = $pdo->prepare("
        SELECT t.id, t.tipo, t.data_transacao, t.valor, t.metodo_pagamento, t.descricao, f.nome AS favorecido_nome
        FROM transacoes t
        LEFT JOIN favorecidos f ON f.id = t.favorecido_id
        WHERE MONTH(t.data_transacao) = ? AND YEAR(t.data_transacao) = ?
        ORDER BY t.data_transacao ASC, t.id ASC
    ");
}
$stmt->execute([$mes, $ano]);
$transacoes = $stmt->fetchAll();
if (!$hasClienteId) {
    foreach ($transacoes as &$row) {
        $row['cliente_nome'] = null;
    }
}

// Resumo por método (opcional para gráfico)
$stmt = $pdo->prepare("
    SELECT metodo_pagamento, tipo, SUM(valor) AS total
    FROM transacoes
    WHERE MONTH(data_transacao) = ? AND YEAR(data_transacao) = ?
    GROUP BY metodo_pagamento, tipo
");
$stmt->execute([$mes, $ano]);
$porMetodo = $stmt->fetchAll();

echo json_encode([
    'mes' => $mes,
    'ano' => $ano,
    'total_entradas' => round($totalEntradas, 2),
    'total_saidas' => round($totalSaidas, 2),
    'saldo_mes' => round($saldoMes, 2),
    'transacoes' => $transacoes,
    'por_metodo' => $porMetodo,
]);
