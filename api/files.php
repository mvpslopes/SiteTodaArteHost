<?php
/**
 * Gerenciamento de Arquivos
 * Integrado com Google Drive
 */

require_once 'config.php';
require_once 'permissions_db.php';

$user = requireAuth();

// Tentar carregar DriveService
$driveService = null;
try {
    require_once __DIR__ . '/drive_service.php';
    $driveService = new DriveService();
} catch (Exception $e) {
    error_log('Erro ao carregar DriveService: ' . $e->getMessage());
    // Continuar sem DriveService (modo simulado)
}

// GET: Listar arquivos
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $folder = $_GET['folder'] ?? '*';
    
    // Verificar acesso à pasta
    if (!canAccessFolder($user, $folder)) {
        jsonError('Sem acesso a esta pasta', 403);
    }
    
    // Se DriveService estiver disponível, usar Google Drive
    if ($driveService) {
        try {
            // Converter pasta do usuário para caminho do Drive
            $driveFolder = convertUserFolderToDrivePath($user, $folder);
            $files = $driveService->listFiles($driveFolder, true);
            
            jsonResponse([
                'files' => $files,
                'folder' => $folder,
                'driveFolder' => $driveFolder
            ]);
        } catch (Exception $e) {
            error_log('Erro ao listar arquivos do Drive: ' . $e->getMessage());
            jsonResponse([
                'files' => [],
                'folder' => $folder,
                'error' => 'Erro ao conectar com Google Drive',
                'message' => $e->getMessage()
            ]);
        }
    } else {
        // Modo simulado (quando DriveService não está disponível)
        jsonResponse([
            'files' => [],
            'folder' => $folder,
            'message' => 'Google Drive não configurado. Instale a biblioteca: composer require google/apiclient'
        ]);
    }
}

// POST: Upload de arquivo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $folder = $_POST['folder'] ?? ($user['folder'] ?? '*');
    
    // Verificar permissão de upload
    if (!hasPermission($user, 'upload', $folder)) {
        jsonError('Sem permissão para upload', 403);
    }
    
    // Verificar acesso à pasta
    if (!canAccessFolder($user, $folder)) {
        jsonError('Sem acesso a esta pasta', 403);
    }
    
    // Verificar se arquivo foi enviado
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        jsonError('Nenhum arquivo enviado ou erro no upload', 400);
    }
    
    // Se DriveService estiver disponível, fazer upload real
    if ($driveService) {
        try {
            $uploadedFile = $_FILES['file'];
            $fileName = $uploadedFile['name'];
            $tmpPath = $uploadedFile['tmp_name'];
            
            // Converter pasta do usuário para caminho do Drive
            $driveFolder = convertUserFolderToDrivePath($user, $folder);
            
            // Fazer upload
            $result = $driveService->uploadFile($tmpPath, $fileName, $driveFolder);
            
            jsonResponse([
                'success' => true,
                'message' => 'Arquivo enviado com sucesso',
                'file' => $result,
                'folder' => $folder
            ]);
        } catch (Exception $e) {
            error_log('Erro ao fazer upload: ' . $e->getMessage());
            jsonError('Erro ao fazer upload: ' . $e->getMessage(), 500);
        }
    } else {
        jsonError('Google Drive não configurado. Instale a biblioteca: composer require google/apiclient', 503);
    }
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
    
    // Se DriveService estiver disponível, deletar do Drive
    if ($driveService) {
        try {
            $driveService->deleteFile($fileId);
            jsonResponse([
                'success' => true,
                'message' => 'Arquivo deletado com sucesso'
            ]);
        } catch (Exception $e) {
            error_log('Erro ao deletar arquivo: ' . $e->getMessage());
            jsonError('Erro ao deletar arquivo: ' . $e->getMessage(), 500);
        }
    } else {
        jsonError('Google Drive não configurado. Instale a biblioteca: composer require google/apiclient', 503);
    }
}

/**
 * Converter pasta do usuário para caminho do Google Drive
 */
function convertUserFolderToDrivePath($user, $folder) {
    // Se for ROOT ou ADMIN, pode acessar qualquer pasta
    if ($user['role'] === 'root' || $user['role'] === 'admin') {
        if ($folder === '*') {
            return '*'; // Pasta raiz
        }
        return $folder; // Usar o caminho diretamente
    }
    
    // Se for USER, usar apenas sua pasta
    if ($user['role'] === 'user') {
        $userFolder = $user['folder'] ?? '*';
        if ($userFolder === '*') {
            return '*';
        }
        // Se o usuário especificou uma subpasta, adicionar à pasta dele
        if ($folder !== '*' && $folder !== $userFolder) {
            return $userFolder . '/' . ltrim($folder, '/');
        }
        return $userFolder;
    }
    
    return '*';
}

jsonError('Método não permitido', 405);
?>

