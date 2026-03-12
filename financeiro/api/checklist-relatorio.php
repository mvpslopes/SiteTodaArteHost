<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';
require_once 'db_helpers.php';

try {
    $currentUser = requireAuth();
    requireAdminOrRoot();
    $pdo = getDBConnection();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno', 'detail' => $e->getMessage()]);
    exit;
}

function parseDateOrNull(string $s): ?string {
    $s = trim($s);
    if ($s === '') return null;
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $s)) return $s;
    if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $s, $m)) {
        return $m[3] . '-' . $m[2] . '-' . $m[1];
    }
    return null;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

$inicio = parseDateOrNull($_GET['inicio'] ?? '') ?? date('Y-m-01');
$fim = parseDateOrNull($_GET['fim'] ?? '') ?? date('Y-m-t');
$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

if ($inicio > $fim) {
    [$inicio, $fim] = [$fim, $inicio];
}

$startTs = strtotime($inicio);
$endTs = strtotime($fim);
if ($endTs === false || $startTs === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Datas inválidas']);
    exit;
}

// Limitar período para evitar laços muito grandes (ex: 90 dias)
$maxDias = 90;
if (($endTs - $startTs) / 86400 > $maxDias) {
    http_response_code(400);
    echo json_encode(['error' => 'Período muito longo. Use no máximo 90 dias.']);
    exit;
}

// Carregar tarefas ativas
$stmt = $pdo->prepare("SELECT * FROM checklist_tarefas_fixas WHERE ativo = 1");
$stmt->execute();
$tarefas = $stmt->fetchAll(PDO::FETCH_ASSOC);

$tarefasById = [];
foreach ($tarefas as $t) {
    $tarefasById[$t['id']] = $t;
}

$periodos = ['diaria','segunda','terca','quarta','quinta','sexta'];
$diaMap = [
    1 => 'segunda',
    2 => 'terca',
    3 => 'quarta',
    4 => 'quinta',
    5 => 'sexta',
];

$esperadasTotal = 0;
$esperadasPorPeriodo = array_fill_keys($periodos, 0);
$esperadasPorTarefa = [];

// Contabilizar tarefas esperadas por dia no intervalo
for ($ts = $startTs; $ts <= $endTs; $ts += 86400) {
    $diaSemana = (int)date('w', $ts); // 0 domingo
    $periodicidadesDia = ['diaria'];
    if (isset($diaMap[$diaSemana])) {
        $periodicidadesDia[] = $diaMap[$diaSemana];
    }
    foreach ($tarefas as $t) {
        if (!in_array($t['periodicidade'], $periodicidadesDia, true)) continue;
        $esperadasTotal++;
        $esperadasPorPeriodo[$t['periodicidade']]++;
        $id = (int)$t['id'];
        if (!isset($esperadasPorTarefa[$id])) {
            $esperadasPorTarefa[$id] = 0;
        }
        $esperadasPorTarefa[$id]++;
    }
}

// Carregar execuções concluídas no período
$sqlExec = "
    SELECT e.*, t.titulo, t.periodicidade
    FROM checklist_execucoes e
    JOIN checklist_tarefas_fixas t ON t.id = e.tarefa_fixa_id
    WHERE e.data_referencia BETWEEN :inicio AND :fim
      AND t.ativo = 1
      AND e.concluida = 1
";
$paramsExec = [
    ':inicio' => $inicio,
    ':fim' => $fim,
];
if ($userId) {
    $sqlExec .= " AND e.user_id = :user_id";
    $paramsExec[':user_id'] = $userId;
}
$stmt = $pdo->prepare($sqlExec);
$stmt->execute($paramsExec);
$execucoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

$concluidasTotal = 0;
$concluidasPorPeriodo = array_fill_keys($periodos, 0);
$concluidasPorTarefa = [];

foreach ($execucoes as $e) {
    $concluidasTotal++;
    $p = $e['periodicidade'];
    if (isset($concluidasPorPeriodo[$p])) {
        $concluidasPorPeriodo[$p]++;
    }
    $id = (int)$e['tarefa_fixa_id'];
    if (!isset($concluidasPorTarefa[$id])) {
        $concluidasPorTarefa[$id] = 0;
    }
    $concluidasPorTarefa[$id]++;
}

$tarefasResumo = [];
foreach ($tarefas as $t) {
    $id = (int)$t['id'];
    $esp = $esperadasPorTarefa[$id] ?? 0;
    $conc = $concluidasPorTarefa[$id] ?? 0;
    if ($esp === 0 && $conc === 0) continue;
    $tarefasResumo[] = [
        'id' => $id,
        'titulo' => $t['titulo'],
        'periodicidade' => $t['periodicidade'],
        'esperadas' => $esp,
        'concluidas' => $conc,
    ];
}

echo json_encode([
    'inicio' => $inicio,
    'fim' => $fim,
    'user_id' => $userId,
    'geral' => [
        'esperadas' => $esperadasTotal,
        'concluidas' => $concluidasTotal,
    ],
    'por_periodicidade' => [
        'esperadas' => $esperadasPorPeriodo,
        'concluidas' => $concluidasPorPeriodo,
    ],
    'por_tarefa' => $tarefasResumo,
]);

