<?php
/**
 * Autenticação de Usuários
 */

require_once 'config.php';
require_once 'permissions_db.php';

// Rota: POST /api/auth.php?action=login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_GET['action'] ?? '') === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        jsonError('Email e senha são obrigatórios');
    }
    
    $user = getUserByEmail($email);
    
    if (!$user || !password_verify($password, $user['password'])) {
        jsonError('Email ou senha incorretos', 401);
    }
    
    // Atualizar último login
    updateLastLogin($user['id']);
    
    // Criar sessão
    $_SESSION['user'] = [
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'folder' => $user['folder'] ?? '',
        'permissions' => $user['permissions'] ?? []
    ];
    
    $_SESSION['last_activity'] = time();
    
    // Log de auditoria
    logAudit($user['id'], 'login', null, null, ['email' => $user['email']]);
    
    // Remover senha antes de retornar
    unset($user['password']);
    
    jsonResponse([
        'success' => true,
        'user' => $_SESSION['user']
    ]);
}

// Rota: POST /api/auth.php?action=logout
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_GET['action'] ?? '') === 'logout') {
    if (isset($_SESSION['user'])) {
        logAudit($_SESSION['user']['id'], 'logout', null, null, []);
    }
    session_destroy();
    jsonResponse(['success' => true, 'message' => 'Logout realizado com sucesso']);
}

// Rota: GET /api/auth.php?action=check
if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['action'] ?? '') === 'check') {
    // Verificar timeout de sessão
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > SESSION_TIMEOUT) {
        session_destroy();
        jsonError('Sessão expirada', 401);
    }
    
    if (isset($_SESSION['user'])) {
        $_SESSION['last_activity'] = time();
        jsonResponse([
            'authenticated' => true,
            'user' => $_SESSION['user']
        ]);
    } else {
        jsonResponse([
            'authenticated' => false
        ]);
    }
}

jsonError('Ação inválida', 400);
?>

