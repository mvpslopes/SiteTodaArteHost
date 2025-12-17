<?php
/**
 * Google Drive Service - Grupo Raça
 * 
 * Classe para gerenciar operações com Google Drive usando Service Account
 */

// Carregar autoloader do Composer
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    throw new Exception('Autoloader do Composer não encontrado em: ' . $autoloadPath . '. Faça upload da pasta vendor/ completa.');
}

require_once $autoloadPath;

// Carregar aliases para compatibilidade (Google_Client, Google_Service_Drive, etc.)
$aliasesPath = __DIR__ . '/src/aliases.php';
if (file_exists($aliasesPath)) {
    require_once $aliasesPath;
} else {
    // Se não encontrar em src/, tentar em vendor/google/apiclient/src/
    $aliasesPathAlt = __DIR__ . '/vendor/google/apiclient/src/aliases.php';
    if (file_exists($aliasesPathAlt)) {
        require_once $aliasesPathAlt;
    }
}

// Verificar se a classe está disponível
if (!class_exists('Google_Client') && !class_exists('Google\Client')) {
    throw new Exception('Biblioteca Google API PHP não encontrada. Faça upload das pastas vendor/ e src/ completas.');
}

class DriveService {
    private $client;
    private $service;
    private $config;
    private $rootFolderId;
    
    public function __construct() {
        // Carregar configuração
        $configPath = __DIR__ . '/config/drive_config.php';
        if (!file_exists($configPath)) {
            throw new Exception('Arquivo de configuração do Drive não encontrado: ' . $configPath);
        }
        
        $this->config = require $configPath;
        $this->rootFolderId = $this->config['root_folder_id'];
        
        // Verificar se arquivo de credenciais existe
        $credentialsPath = $this->config['credentials_path'];
        if (!file_exists($credentialsPath)) {
            throw new Exception('Arquivo de credenciais não encontrado: ' . $credentialsPath);
        }
        
        // Inicializar cliente Google
        $this->client = new Google_Client();
        $this->client->setAuthConfig($credentialsPath);
        $this->client->setScopes($this->config['scopes']);
        $this->client->setAccessType('offline');
        
        // Criar serviço do Drive
        $this->service = new Google_Service_Drive($this->client);
    }
    
    /**
     * Obter ID de uma pasta pelo nome (dentro da pasta raiz)
     */
    public function getFolderIdByName($folderName, $parentId = null) {
        $parentId = $parentId ?? $this->rootFolderId;
        
        try {
            $query = "name = '" . addslashes($folderName) . "' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
            if ($parentId) {
                $query .= " and '" . addslashes($parentId) . "' in parents";
            }
            
            $results = $this->service->files->listFiles([
                'q' => $query,
                'fields' => 'files(id, name)'
            ]);
            
            if (count($results->getFiles()) > 0) {
                return $results->getFiles()[0]->getId();
            }
            
            return null;
        } catch (Exception $e) {
            error_log('Erro ao buscar pasta: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Criar pasta se não existir
     */
    public function ensureFolder($folderPath, $parentId = null) {
        $parentId = $parentId ?? $this->rootFolderId;
        $parts = explode('/', trim($folderPath, '/'));
        $currentParent = $parentId;
        
        foreach ($parts as $part) {
            if (empty($part)) continue;
            
            $folderId = $this->getFolderIdByName($part, $currentParent);
            
            if (!$folderId) {
                // Criar pasta
                $folderId = $this->createFolder($part, $currentParent);
            }
            
            $currentParent = $folderId;
        }
        
        return $currentParent;
    }
    
    /**
     * Criar uma pasta
     */
    public function createFolder($name, $parentId = null) {
        $parentId = $parentId ?? $this->rootFolderId;
        
        try {
            $fileMetadata = new Google_Service_Drive_DriveFile([
                'name' => $name,
                'mimeType' => 'application/vnd.google-apps.folder',
                'parents' => [$parentId]
            ]);
            
            $folder = $this->service->files->create($fileMetadata, [
                'fields' => 'id, name'
            ]);
            
            return $folder->getId();
        } catch (Exception $e) {
            error_log('Erro ao criar pasta: ' . $e->getMessage());
            throw new Exception('Erro ao criar pasta: ' . $e->getMessage());
        }
    }
    
    /**
     * Listar arquivos de uma pasta
     */
    public function listFiles($folderPath = '*', $includeFolders = true) {
        try {
            $folderId = null;
            
            // Se for '*', listar da pasta raiz
            if ($folderPath === '*') {
                $folderId = $this->rootFolderId;
            } else {
                // Obter ID da pasta pelo caminho
                $folderId = $this->ensureFolder($folderPath);
            }
            
            $query = "'" . addslashes($folderId) . "' in parents and trashed = false";
            
            if (!$includeFolders) {
                $query .= " and mimeType != 'application/vnd.google-apps.folder'";
            }
            
            $results = $this->service->files->listFiles([
                'q' => $query,
                'fields' => 'files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink)',
                'orderBy' => 'modifiedTime desc'
            ]);
            
            $files = [];
            foreach ($results->getFiles() as $file) {
                $isFolder = $file->getMimeType() === 'application/vnd.google-apps.folder';
                
                $files[] = [
                    'id' => $file->getId(),
                    'name' => $file->getName(),
                    'type' => $isFolder ? 'folder' : 'file',
                    'mimeType' => $file->getMimeType(),
                    'size' => $isFolder ? null : (int)$file->getSize(),
                    'modifiedTime' => $file->getModifiedTime(),
                    'viewLink' => $file->getWebViewLink(),
                    'downloadLink' => $file->getWebContentLink(),
                    'folder' => $folderPath
                ];
            }
            
            return $files;
        } catch (Exception $e) {
            error_log('Erro ao listar arquivos: ' . $e->getMessage());
            throw new Exception('Erro ao listar arquivos: ' . $e->getMessage());
        }
    }
    
    /**
     * Upload de arquivo
     */
    public function uploadFile($filePath, $fileName, $folderPath = '*') {
        try {
            // Verificar tamanho do arquivo
            $fileSize = filesize($filePath);
            if ($fileSize > $this->config['upload']['max_file_size']) {
                throw new Exception('Arquivo muito grande. Tamanho máximo: ' . ($this->config['upload']['max_file_size'] / 1024 / 1024) . 'MB');
            }
            
            // Verificar tipo de arquivo
            $mimeType = mime_content_type($filePath);
            if (!in_array($mimeType, $this->config['upload']['allowed_types'])) {
                throw new Exception('Tipo de arquivo não permitido: ' . $mimeType);
            }
            
            // Obter ID da pasta de destino
            $folderId = null;
            if ($folderPath === '*') {
                $folderId = $this->rootFolderId;
            } else {
                $folderId = $this->ensureFolder($folderPath);
            }
            
            // Criar metadata do arquivo
            $fileMetadata = new Google_Service_Drive_DriveFile([
                'name' => $fileName,
                'parents' => [$folderId]
            ]);
            
            // Upload do arquivo
            $content = file_get_contents($filePath);
            $file = $this->service->files->create($fileMetadata, [
                'data' => $content,
                'mimeType' => $mimeType,
                'uploadType' => 'multipart',
                'fields' => 'id, name, mimeType, size, modifiedTime, webViewLink, webContentLink'
            ]);
            
            return [
                'id' => $file->getId(),
                'name' => $file->getName(),
                'type' => 'file',
                'mimeType' => $file->getMimeType(),
                'size' => (int)$file->getSize(),
                'modifiedTime' => $file->getModifiedTime(),
                'viewLink' => $file->getWebViewLink(),
                'downloadLink' => $file->getWebContentLink(),
                'folder' => $folderPath
            ];
        } catch (Exception $e) {
            error_log('Erro ao fazer upload: ' . $e->getMessage());
            throw new Exception('Erro ao fazer upload: ' . $e->getMessage());
        }
    }
    
    /**
     * Deletar arquivo
     */
    public function deleteFile($fileId) {
        try {
            $this->service->files->delete($fileId);
            return true;
        } catch (Exception $e) {
            error_log('Erro ao deletar arquivo: ' . $e->getMessage());
            throw new Exception('Erro ao deletar arquivo: ' . $e->getMessage());
        }
    }
    
    /**
     * Obter informações de um arquivo
     */
    public function getFileInfo($fileId) {
        try {
            $file = $this->service->files->get($fileId, [
                'fields' => 'id, name, mimeType, size, modifiedTime, webViewLink, webContentLink'
            ]);
            
            return [
                'id' => $file->getId(),
                'name' => $file->getName(),
                'type' => $file->getMimeType() === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
                'mimeType' => $file->getMimeType(),
                'size' => (int)$file->getSize(),
                'modifiedTime' => $file->getModifiedTime(),
                'viewLink' => $file->getWebViewLink(),
                'downloadLink' => $file->getWebContentLink()
            ];
        } catch (Exception $e) {
            error_log('Erro ao obter informações do arquivo: ' . $e->getMessage());
            throw new Exception('Erro ao obter informações do arquivo: ' . $e->getMessage());
        }
    }
    
    /**
     * Verificar se a conexão está funcionando
     */
    public function testConnection() {
        try {
            $folder = $this->service->files->get($this->rootFolderId, [
                'fields' => 'id, name'
            ]);
            
            return [
                'success' => true,
                'rootFolder' => [
                    'id' => $folder->getId(),
                    'name' => $folder->getName()
                ]
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
?>

