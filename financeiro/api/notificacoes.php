<?php
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';
require_once 'producao_lib.php';

$user = requireAuth();
$pdo = getDBConnection();
producaoEnsureSchema($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare('SELECT * FROM producao_notificacoes WHERE user_id = ? ORDER BY id DESC LIMIT 40');
    $stmt->execute([(int)$user['id']]);
    $list = $stmt->fetchAll();
    $naoLidas = 0;
    foreach ($list as $n) {
        if ((int)$n['lida'] === 0) $naoLidas++;
    }
    echo json_encode(['notificacoes' => $list, 'nao_lidas' => $naoLidas]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    if ($id > 0) {
        $pdo->prepare('UPDATE producao_notificacoes SET lida = 1 WHERE id = ? AND user_id = ?')->execute([$id, (int)$user['id']]);
    } else {
        $pdo->prepare('UPDATE producao_notificacoes SET lida = 1 WHERE user_id = ?')->execute([(int)$user['id']]);
    }
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
