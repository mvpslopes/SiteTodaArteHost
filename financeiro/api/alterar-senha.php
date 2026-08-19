<?php
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';
require_once 'db_helpers.php';

$user = requireAuth();
$pdo = getDBConnection();
ensureUsuarioPasswordEncColumn($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$senhaAtual = $input['senha_atual'] ?? '';
$senhaNova = $input['senha_nova'] ?? '';

if ($senhaAtual === '' || $senhaNova === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Senha atual e nova senha são obrigatórias']);
    exit;
}

if (strlen($senhaNova) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'A nova senha deve ter no mínimo 8 caracteres']);
    exit;
}

$stmt = $pdo->prepare("SELECT password_hash FROM usuarios WHERE id = ?");
$stmt->execute([$user['id']]);
$row = $stmt->fetch();
if (!$row || !password_verify($senhaAtual, $row['password_hash'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Senha atual incorreta']);
    exit;
}

$hash = password_hash($senhaNova, PASSWORD_DEFAULT);
$enc = encryptPasswordDisplay($senhaNova);
$stmt = $pdo->prepare("UPDATE usuarios SET password_hash = ?, password_enc = ?, updated_at = NOW() WHERE id = ?");
$stmt->execute([$hash, $enc, $user['id']]);

echo json_encode(['success' => true, 'message' => 'Senha alterada com sucesso']);
