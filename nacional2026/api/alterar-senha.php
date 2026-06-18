<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';

$current = requireAuth();
$pdo = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$senhaAtual = $input['senha_atual'] ?? '';
$senhaNova = $input['senha_nova'] ?? '';

if ($senhaAtual === '' || strlen($senhaNova) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Senha atual e nova senha (mín. 8 caracteres) são obrigatórias']);
    exit;
}

$stmt = $pdo->prepare('SELECT password_hash FROM usuarios WHERE id = ?');
$stmt->execute([(int)$current['id']]);
$row = $stmt->fetch();
if (!$row || !password_verify($senhaAtual, $row['password_hash'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Senha atual incorreta']);
    exit;
}

$pdo->prepare('UPDATE usuarios SET password_hash = ? WHERE id = ?')
    ->execute([password_hash($senhaNova, PASSWORD_DEFAULT), (int)$current['id']]);

echo json_encode(['success' => true]);
