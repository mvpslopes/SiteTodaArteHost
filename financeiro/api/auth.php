<?php
require_once 'cors.php';
require_once 'auth_helpers.php';
require_once 'db_config.php';

sessionStart();
$pdo = getDBConnection();

// GET: usuário logado
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

// POST: login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $email = trim($input['email'] ?? '');
    $senha = $input['senha'] ?? '';

    if ($email === '' || $senha === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Email e senha são obrigatórios']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, email, password_hash, nome, perfil, ativo FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $row = $stmt->fetch();

    if (!$row || (int)$row['ativo'] !== 1) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciais inválidas']);
        exit;
    }

    if (!password_verify($senha, $row['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciais inválidas']);
        exit;
    }

    $_SESSION['user_id'] = (int)$row['id'];
    $user = [
        'id' => (int)$row['id'],
        'email' => $row['email'],
        'nome' => $row['nome'],
        'perfil' => $row['perfil'],
    ];
    echo json_encode(['user' => $user]);
    exit;
}

// DELETE: logout
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
