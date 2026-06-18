<?php
/**
 * Configuração MySQL - Nacional 2026 (Hostinger)
 */

$isLocal = (
    ($_SERVER['SERVER_NAME'] ?? '') === 'localhost' ||
    ($_SERVER['SERVER_NAME'] ?? '') === '127.0.0.1' ||
    strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false
);

if ($isLocal && file_exists(__DIR__ . '/db_config.local.php')) {
    require __DIR__ . '/db_config.local.php';
    return;
}

define('DB_HOST', 'localhost');
define('DB_NAME', 'u179630068_nacional2026');
define('DB_USER', 'u179630068_nacional2026_u');
define('DB_PASS', 'K74zdJ7Ss^');
define('DB_CHARSET', 'utf8mb4');

function getDBConnection() {
    static $conn = null;
    if ($conn === null) {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
            $conn = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao conectar ao banco', 'detail' => $e->getMessage()]);
            exit;
        }
    }
    return $conn;
}
