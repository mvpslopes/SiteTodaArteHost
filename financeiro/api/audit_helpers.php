<?php
require_once __DIR__ . '/db_config.php';
require_once __DIR__ . '/auth_helpers.php';

function getClientIp(): string {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
    if (strpos($ip, ',') !== false) {
        $parts = explode(',', $ip);
        $ip = trim($parts[0]);
    }
    return substr($ip, 0, 45);
}

function getUserAgent(): string {
    return substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);
}

/**
 * Registra uma linha na auditoria de usuários.
 *
 * @param PDO    $pdo
 * @param array  $user array retornado por requireAuth()/getCurrentUser()
 * @param string $acao 'login' | 'logout' | 'acesso' | 'criar' | 'atualizar' | 'excluir'
 * @param string $recurso ex: 'auth', 'transacoes', 'clientes', 'usuarios', 'demandas'
 * @param int|null $referenciaId id do registro afetado (quando houver)
 * @param array $detalhes dados adicionais (serão armazenados como JSON)
 */
function logAuditoria(PDO $pdo, array $user, string $acao, string $recurso, ?int $referenciaId = null, array $detalhes = []): void {
    try {
        $sessaoId = $_SESSION['sessao_id'] ?? null;
        $ip = getClientIp();
        $ua = getUserAgent();
        $path = $_SERVER['REQUEST_URI'] ?? '';
        $method = $_SERVER['REQUEST_METHOD'] ?? '';

        $stmt = $pdo->prepare("
            INSERT INTO auditoria_usuarios
                (user_id, sessao_id, acao, recurso, referencia_id, detalhes, ip, user_agent, path, metodo_http)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $json = !empty($detalhes) ? json_encode($detalhes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;
        $stmt->execute([
            (int)$user['id'],
            $sessaoId ? (int)$sessaoId : null,
            $acao,
            $recurso,
            $referenciaId,
            $json,
            $ip,
            $ua,
            substr($path, 0, 255),
            substr($method, 0, 10),
        ]);
    } catch (Throwable $e) {
        // Auditoria não deve quebrar o fluxo principal
    }
}

