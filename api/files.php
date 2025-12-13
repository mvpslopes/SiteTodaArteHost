<?php
/**
 * Gerenciamento de Arquivos
 * Por enquanto, simula operações (será integrado com Google Drive depois)
 */

require_once 'config.php';
require_once 'permissions_db.php';

$user = requireAuth();

// GET: Listar arquivos
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $folder = $_GET['folder'] ?? '*';
    
    // Verificar acesso à pasta
    if (!canAccessFolder($user, $folder)) {
        jsonError('Sem acesso a esta pasta', 403);
    }
    
    // Por enquanto, retornar lista vazia (será integrado com Google Drive)
    // TODO: Integrar com Google Drive API
    jsonResponse([
        'files' => [],
        'folder' => $folder,
        'message' => 'Aguardando integração com Google Drive'
    ]);
}

// POST: Upload de arquivo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $folder = $_POST['folder'] ?? ($user['folder'] ?? '');
    
    // Verificar permissão de upload
    if (!hasPermission($user, 'upload', $folder)) {
        jsonError('Sem permissão para upload', 403);
    }
    
    // Verificar acesso à pasta
    if (!canAccessFolder($user, $folder)) {
        jsonError('Sem acesso a esta pasta', 403);
    }
    
    // Por enquanto, retornar sucesso simulado
    // TODO: Integrar com Google Drive API para upload real
    jsonResponse([
        'success' => true,
        'message' => 'Upload simulado - aguardando integração com Google Drive',
        'folder' => $folder
    ]);
}

// DELETE: Deletar arquivo
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $fileId = $_GET['id'] ?? null;
    $folder = $_GET['folder'] ?? '*';
    
    if (!$fileId) {
        jsonError('ID do arquivo é obrigatório');
    }
    
    // Verificar permissão de delete
    if (!hasPermission($user, 'delete', $folder)) {
        jsonError('Sem permissão para deletar', 403);
    }
    
    // Verificar acesso à pasta
    if (!canAccessFolder($user, $folder)) {
        jsonError('Sem acesso a esta pasta', 403);
    }
    
    // Por enquanto, retornar sucesso simulado
    // TODO: Integrar com Google Drive API para delete real
    jsonResponse([
        'success' => true,
        'message' => 'Arquivo deletado (simulado) - aguardando integração com Google Drive'
    ]);
}

jsonError('Método não permitido', 405);
?>

