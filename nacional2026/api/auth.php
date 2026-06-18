<?php
require_once 'cors.php';
require_once 'auth_helpers.php';

sessionStart();
$pdo = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = getCurrentUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Não autorizado']);
        exit;
    }
    echo json_encode(['user' => $user]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $login = trim($input['login'] ?? '');
    $senha = $input['senha'] ?? '';

    if ($login === '' || $senha === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Login e senha são obrigatórios']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT id, login, password_hash, nome, perfil, ativo FROM usuarios WHERE login = ?');
    $stmt->execute([$login]);
    $row = $stmt->fetch();

    if (!$row || (int)$row['ativo'] !== 1 || !password_verify($senha, $row['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciais inválidas']);
        exit;
    }

    $_SESSION['user_id'] = (int)$row['id'];
    echo json_encode([
        'user' => [
            'id' => (int)$row['id'],
            'login' => $row['login'],
            'nome' => $row['nome'],
            'perfil' => $row['perfil'],
        ],
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
