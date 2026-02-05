<?php
/**
 * Teste de conexão com o banco - abra no navegador para ver o erro exato.
 * Ex: https://financeiro.todaarte.com.br/api/test-db.php
 * REMOVA ou renomeie após corrigir a conexão.
 */
header('Content-Type: application/json; charset=utf-8');

$host = 'localhost';
$dbname = 'u179630068_todaarte_bd';
$user = 'u179630068_root_todaarte';
$pass = '7TxWy8l;';

$result = ['ok' => false, 'host' => $host, 'db' => $dbname, 'user' => $user];

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    $result['ok'] = true;
    $result['message'] = 'Conexão OK';
    $stmt = $pdo->query("SELECT COUNT(*) FROM usuarios");
    $result['usuarios_count'] = (int) $stmt->fetchColumn();
} catch (PDOException $e) {
    $result['error'] = $e->getMessage();
    $result['code'] = $e->getCode();
}

// Se localhost falhar, tentar 127.0.0.1
if (!$result['ok'] && $host === 'localhost') {
    $result['tentando'] = '127.0.0.1';
    try {
        $dsn = "mysql:host=127.0.0.1;dbname=$dbname;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $result['ok'] = true;
        $result['message'] = 'Conexão OK com 127.0.0.1';
    } catch (PDOException $e2) {
        $result['error_127'] = $e2->getMessage();
    }
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
