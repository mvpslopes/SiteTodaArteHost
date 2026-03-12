<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';

try {
    $current = requireRoot();
    $pdo = getDBConnection();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno', 'detail' => $e->getMessage()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
$inicio = $_GET['inicio'] ?? null; // formato AAAA-MM-DD
$fim = $_GET['fim'] ?? null;

// Sessões
$sqlSess = "
    SELECT s.*, u.email, u.nome
    FROM sessoes_usuarios s
    JOIN usuarios u ON u.id = s.user_id
    WHERE 1=1
";
$paramsSess = [];
if ($userId && $userId > 0) {
    $sqlSess .= " AND s.user_id = ?";
    $paramsSess[] = $userId;
}
if ($inicio && preg_match('/^\d{4}-\d{2}-\d{2}$/', $inicio)) {
    $sqlSess .= " AND s.login_at >= ?";
    $paramsSess[] = $inicio . ' 00:00:00';
}
if ($fim && preg_match('/^\d{4}-\d{2}-\d{2}$/', $fim)) {
    $sqlSess .= " AND s.login_at <= ?";
    $paramsSess[] = $fim . ' 23:59:59';
}
$sqlSess .= " ORDER BY s.login_at DESC LIMIT 500";
$stmt = $pdo->prepare($sqlSess);
$stmt->execute($paramsSess);
$sessoes = $stmt->fetchAll();

// Ações
$sqlAcoes = "
    SELECT a.*, u.email, u.nome
    FROM auditoria_usuarios a
    JOIN usuarios u ON u.id = a.user_id
    WHERE 1=1
";
$paramsAcoes = [];
if ($userId && $userId > 0) {
    $sqlAcoes .= " AND a.user_id = ?";
    $paramsAcoes[] = $userId;
}
if ($inicio && preg_match('/^\d{4}-\d{2}-\d{2}$/', $inicio)) {
    $sqlAcoes .= " AND a.created_at >= ?";
    $paramsAcoes[] = $inicio . ' 00:00:00';
}
if ($fim && preg_match('/^\d{4}-\d{2}-\d{2}$/', $fim)) {
    $sqlAcoes .= " AND a.created_at <= ?";
    $paramsAcoes[] = $fim . ' 23:59:59';
}
$sqlAcoes .= " ORDER BY a.created_at DESC LIMIT 1000";
$stmt = $pdo->prepare($sqlAcoes);
$stmt->execute($paramsAcoes);
$acoes = $stmt->fetchAll();

echo json_encode([
    'sessoes' => $sessoes,
    'acoes' => $acoes,
]);

