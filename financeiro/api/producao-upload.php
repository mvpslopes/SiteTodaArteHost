<?php
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';
require_once 'producao_lib.php';

$user = requireAuth();
if (!producaoIsStaff($user)) {
    http_response_code(403);
    echo json_encode(['error' => 'Acesso negado']);
    exit;
}

$pdo = getDBConnection();
producaoEnsureSchema($pdo);

$jobId = (int)($_POST['job_id'] ?? 0);
$job = producaoGetJob($pdo, $jobId);
if (!$job) {
    http_response_code(404);
    echo json_encode(['error' => 'Job não encontrado']);
    exit;
}
if (!producaoPodeVerJob($user, $job, $pdo)) {
    http_response_code(403);
    echo json_encode(['error' => 'Acesso negado']);
    exit;
}
if (!in_array($job['status'], ['em_producao', 'retrabalho'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Este job não está em produção']);
    exit;
}
$uid = (int)$user['id'];
$souExecutor = $uid === (int)$job['executor_id']
    || $uid === (int)($job['executante_usuario_id'] ?? 0);
if (!$souExecutor && !in_array($user['perfil'], ['root', 'administrador'], true)) {
    http_response_code(403);
    echo json_encode(['error' => 'Só quem foi atribuído pode enviar a arte']);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Envie um arquivo']);
    exit;
}

$file = $_FILES['file'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$ok = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'ai', 'psd', 'zip', 'mp4', 'mov'];
if (!in_array($ext, $ok, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Formato não permitido']);
    exit;
}
if ($file['size'] > 40 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'Arquivo maior que 40 MB']);
    exit;
}

$dir = producaoDirUpload();
$nome = 'j' . $jobId . '-' . bin2hex(random_bytes(8)) . '.' . $ext;
if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $nome)) {
    http_response_code(500);
    echo json_encode(['error' => 'Falha ao salvar arquivo']);
    exit;
}

$ver = $pdo->prepare('SELECT COALESCE(MAX(versao), 0) + 1 FROM producao_entregas WHERE job_id = ?');
$ver->execute([$jobId]);
$versao = (int)$ver->fetchColumn();
$nota = trim($_POST['nota'] ?? '');
$pdo->prepare('INSERT INTO producao_entregas (job_id, versao, arquivo, nome_original, nota, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)')
    ->execute([$jobId, $versao, $nome, $file['name'], $nota !== '' ? $nota : null, (int)$user['id']]);

$pdo->prepare('UPDATE producao_jobs SET status = "aguardando_entrega" WHERE id = ?')->execute([$jobId]);

if (!empty($job['atendente_id'])) {
    producaoNotificar($pdo, (int)$job['atendente_id'], $jobId, 'Arte enviada', $job['titulo'] . ' — versão ' . $versao);
}

echo json_encode(producaoGetJob($pdo, $jobId));
