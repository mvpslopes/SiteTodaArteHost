<?php
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
        $stmt = $pdo->prepare('SELECT id, login, nome, perfil, ativo, created_at FROM usuarios WHERE id = ? AND ativo = 1');
        $stmt->execute([(int)$id]);
        return $stmt->fetch() ?: null;
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

function requireRoot() {
    $user = requireAuth();
    if ($user['perfil'] !== 'root') {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado']);
        exit;
    }
    return $user;
}

function requireAdminOrRoot() {
    $user = requireAuth();
    if (!in_array($user['perfil'], ['root', 'admin'], true)) {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado']);
        exit;
    }
    return $user;
}

function normalizarData($data) {
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) return $data;
    if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $data, $m)) {
        return $m[3] . '-' . $m[2] . '-' . $m[1];
    }
    return null;
}

function atualizarStatusEspaco(PDO $pdo, int $espacoId): void {
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM vendas_espaco WHERE espaco_id = ? AND status != "cancelado"');
    $stmt->execute([$espacoId]);
    $ativas = (int)$stmt->fetchColumn();
    if ($ativas === 0) {
        $pdo->prepare('UPDATE espacos SET status = "disponivel" WHERE id = ?')->execute([$espacoId]);
        return;
    }
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM vendas_espaco WHERE espaco_id = ? AND status NOT IN ("cancelado", "quitado")');
    $stmt->execute([$espacoId]);
    $abertas = (int)$stmt->fetchColumn();
    $pdo->prepare('UPDATE espacos SET status = ? WHERE id = ?')->execute([
        $abertas === 0 ? 'vendido' : 'reservado',
        $espacoId,
    ]);
}
