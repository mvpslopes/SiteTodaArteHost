<?php
/**
 * Uso único: redefine a senha do usuário root.
 * Acesse via navegador: /api/redefinir-senha-root.php?senha=NOVA_SENHA
 * Ou via linha de comando: php redefinir-senha-root.php
 * REMOVA ou renomeie este arquivo após usar.
 */
require_once 'db_config.php';

$senha = $_GET['senha'] ?? (isset($argv[1]) ? $argv[1] : null);
if (!$senha || strlen($senha) < 8) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Passe ?senha=SUA_SENHA (mín. 8 caracteres) na URL ou como argumento.']);
    exit;
}

$pdo = getDBConnection();
$hash = password_hash($senha, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("UPDATE usuarios SET password_hash = ? WHERE email = 'marcus.lopes@todaarte.com.br' AND perfil = 'root'");
$stmt->execute([$hash]);
$updated = $stmt->rowCount();

header('Content-Type: application/json');
if ($updated) {
    echo json_encode(['success' => true, 'message' => 'Senha do root atualizada. Remova este arquivo agora.']);
} else {
    echo json_encode(['error' => 'Nenhum usuário root encontrado com esse email.']);
}
