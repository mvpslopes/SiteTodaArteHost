<?php
/**
 * Configuração de Conexão - Sistema Financeiro TodaArte
 * Banco: u179630068_todaarte_bd
 */

$isLocal = (
    ($_SERVER['SERVER_NAME'] ?? '') === 'localhost' ||
    ($_SERVER['SERVER_NAME'] ?? '') === '127.0.0.1' ||
    ($_SERVER['HTTP_HOST'] ?? '') === 'localhost' ||
    ($_SERVER['HTTP_HOST'] ?? '') === '127.0.0.1' ||
    strpos($_SERVER['SERVER_NAME'] ?? '', '.local') !== false ||
    file_exists(__DIR__ . '/.local')
);

if ($isLocal && file_exists(__DIR__ . '/db_config.local.php')) {
    require __DIR__ . '/db_config.local.php';
    return;
}

// Produção (Hostinger) - banco criado no painel
define('DB_HOST', 'localhost');
define('DB_NAME', 'u179630068_todaarte_bd');
define('DB_USER', 'u179630068_root_todaarte');
define('DB_PASS', '7TxWy8l;');
define('DB_CHARSET', 'utf8mb4');

function getDBConnection() {
    static $conn = null;
    if ($conn === null) {
        try {
            // Hostinger: use apenas 'localhost' (usuário costuma ser válido só para localhost)
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
            echo json_encode([
                'error' => 'Erro ao conectar ao banco de dados',
                'detail' => $e->getMessage(),
            ]);
            exit;
        }
    }
    return $conn;
}
