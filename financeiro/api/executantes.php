<?php
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';
require_once 'producao_lib.php';

$user = requireAuth();
if (!in_array($user['perfil'], ['root', 'administrador', 'usuario'], true)) {
    http_response_code(403);
    echo json_encode(['error' => 'Acesso negado']);
    exit;
}

$pdo = getDBConnection();
producaoEnsureSchema($pdo);

$input = json_decode(file_get_contents('php://input'), true) ?: [];

function execOk($data) {
    echo json_encode($data);
    exit;
}
function execFail(string $msg, int $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

function execRow(PDO $pdo, int $id): ?array {
    return producaoGetExecutante($pdo, $id);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id > 0) {
        $row = execRow($pdo, $id);
        if (!$row) execFail('Executante não encontrado', 404);
        execOk($row);
    }
    $apenasAtivos = !isset($_GET['ativos']) || $_GET['ativos'] !== '0';
    $sql = 'SELECT e.*, u.nome AS usuario_nome FROM producao_executantes e LEFT JOIN usuarios u ON u.id = e.usuario_id';
    if ($apenasAtivos) $sql .= ' WHERE e.ativo = 1';
    $sql .= ' ORDER BY e.tipo, e.nome';
    execOk(['executantes' => $pdo->query($sql)->fetchAll()]);
}

if (!in_array($user['perfil'], ['root', 'administrador'], true)) {
    execFail('Acesso negado', 403);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim((string)($input['nome'] ?? ''));
    if ($nome === '') execFail('Informe o nome');
    $tipo = $input['tipo'] ?? 'executor';
    if (!in_array($tipo, ['executor', 'freelancer'], true)) execFail('Tipo inválido');
    $whatsapp = preg_replace('/\D+/', '', (string)($input['whatsapp'] ?? '')) ?: null;
    $email = trim((string)($input['email'] ?? '')) ?: null;
    $especialidade = trim((string)($input['especialidade'] ?? '')) ?: null;
    $usuarioId = isset($input['usuario_id']) ? (int)$input['usuario_id'] : 0;
    if ($usuarioId < 1) $usuarioId = null;
    $stmt = $pdo->prepare('INSERT INTO producao_executantes (nome, tipo, whatsapp, email, especialidade, usuario_id) VALUES (?,?,?,?,?,?)');
    $stmt->execute([$nome, $tipo, $whatsapp, $email, $especialidade, $usuarioId]);
    execOk(execRow($pdo, (int)$pdo->lastInsertId()));
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = (int)($input['id'] ?? 0);
    $row = execRow($pdo, $id);
    if (!$row) execFail('Executante não encontrado', 404);
    $nome = trim((string)($input['nome'] ?? $row['nome']));
    if ($nome === '') execFail('Informe o nome');
    $tipo = $input['tipo'] ?? $row['tipo'];
    if (!in_array($tipo, ['executor', 'freelancer'], true)) execFail('Tipo inválido');
    $whatsapp = array_key_exists('whatsapp', $input)
        ? (preg_replace('/\D+/', '', (string)$input['whatsapp']) ?: null)
        : $row['whatsapp'];
    $email = array_key_exists('email', $input) ? (trim((string)$input['email']) ?: null) : $row['email'];
    $especialidade = array_key_exists('especialidade', $input)
        ? (trim((string)$input['especialidade']) ?: null)
        : $row['especialidade'];
    $usuarioId = array_key_exists('usuario_id', $input)
        ? ((int)$input['usuario_id'] > 0 ? (int)$input['usuario_id'] : null)
        : ($row['usuario_id'] ? (int)$row['usuario_id'] : null);
    $ativo = isset($input['ativo']) ? (int)(bool)$input['ativo'] : (int)$row['ativo'];
    $pdo->prepare('UPDATE producao_executantes SET nome=?, tipo=?, whatsapp=?, email=?, especialidade=?, usuario_id=?, ativo=? WHERE id=?')
        ->execute([$nome, $tipo, $whatsapp, $email, $especialidade, $usuarioId, $ativo, $id]);
    execOk(execRow($pdo, $id));
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = (int)($_GET['id'] ?? ($input['id'] ?? 0));
    $pdo->prepare('UPDATE producao_executantes SET ativo = 0 WHERE id = ?')->execute([$id]);
    execOk(['ok' => true]);
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
