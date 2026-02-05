<?php
/**
 * Helpers de autenticação - sessão PHP
 */
require_once __DIR__ . '/db_config.php';

function sessionStart() {
    if (session_status() === PHP_SESSION_NONE) {
        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'domain' => '',
            'secure' => $isHttps,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

function getCurrentUser() {
    sessionStart();
    $id = $_SESSION['user_id'] ?? null;
    if (!$id) return null;
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT id, email, nome, perfil, ativo, created_at FROM usuarios WHERE id = ? AND ativo = 1");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        return $user ?: null;
    } catch (Throwable $e) {
        return null;
    }
}

function requireAuth() {
    $user = getCurrentUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Não autorizado']);
        exit;
    }
    return $user;
}

/** Apenas root */
function requireRoot() {
    $user = requireAuth();
    if ($user['perfil'] !== 'root') {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado']);
        exit;
    }
    return $user;
}

/** Root ou administrador */
function requireAdminOrRoot() {
    $user = requireAuth();
    if (!in_array($user['perfil'], ['root', 'administrador'], true)) {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado']);
        exit;
    }
    return $user;
}
