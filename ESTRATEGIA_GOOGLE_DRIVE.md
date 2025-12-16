# 📁 Estratégia de Integração com Google Drive - Grupo Raça

## ✅ Por que Google Drive é uma Excelente Escolha

1. **Custo-benefício:**
   - 15GB **GRÁTIS** (conta Google básica)
   - 100GB: **R$ 8,50/mês** (~$1.70/mês)
   - 200GB: **R$ 12,50/mês** (~$2.50/mês)
   - 2TB: **R$ 35/mês** (~$7/mês)

2. **Vantagens:**
   - ✅ Interface familiar (todos já conhecem)
   - ✅ Backup automático
   - ✅ Acesso via web, app mobile, desktop
   - ✅ Compartilhamento fácil
   - ✅ Integração via API oficial
   - ✅ Escalável (fácil aumentar espaço)

3. **Integração:**
   - ✅ Google Drive API (oficial)
   - ✅ Upload direto do site
   - ✅ Download/visualização via site
   - ✅ Gerenciamento de permissões via API

---

## 🏗️ Arquitetura Proposta

```
┌─────────────────────────────────────────┐
│         Frontend (React)               │
│    GrupoRaca_/src/components/          │
│         Database.tsx                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      API PHP (Hostinger)               │
│  /gruporaca/api/                        │
│  ├── auth.php      (Autenticação)      │
│  ├── drive-auth.php (OAuth Google)     │
│  ├── upload.php    (Upload → Drive)    │
│  ├── list.php      (Listar arquivos)   │
│  ├── delete.php    (Deletar)           │
│  └── download.php  (Gerar link Drive)   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    Google Drive API                     │
│    Conta: gruporaca@gmail.com           │
│    ├── marketing/                       │
│    ├── fotografos/                      │
│    ├── larissa/                         │
│    └── midias/                          │
│        ├── de-olho-no-marchador/        │
│        ├── top-marchador/               │
│        └── ...                          │
└─────────────────────────────────────────┘
```

---

## 🔐 Sistema de Permissões

### **Como Funciona:**

1. **Permissões no Site (nosso controle):**
   - Quem pode ver/quais pastas
   - Quem pode fazer upload
   - Quem pode deletar
   - Gerenciado via JSON no Hostinger

2. **Permissões no Google Drive:**
   - Conta do Google Drive: **privada** (apenas API acessa)
   - Usuários **NÃO** têm acesso direto ao Drive
   - Tudo passa pelo site (nosso controle total)

3. **Fluxo:**
   ```
   Usuário → Site (valida permissão) → API PHP → Google Drive API → Drive
   ```

---

## 📋 Estrutura de Pastas no Google Drive

```
Google Drive (gruporaca@gmail.com)
├── 📁 marketing/
│   └── (materiais produzidos)
├── 📁 fotografos/
│   ├── leilao-2024-01/
│   ├── leilao-2024-02/
│   └── ...
├── 📁 larissa/
│   └── (catálogos)
└── 📁 midias/
    ├── 📁 de-olho-no-marchador/
    ├── 📁 top-marchador/
    ├── 📁 aqui-tem-raca/
    ├── 📁 raca-e-marcha/
    ├── 📁 portal-marchador/
    └── 📁 pura-marcha/
```

---

## 🛠️ Implementação Técnica

### **1. Configuração Google Drive API**

**Passo 1: Criar Projeto no Google Cloud Console**
1. Acessar: https://console.cloud.google.com
2. Criar novo projeto: "Grupo Raça Database"
3. Habilitar "Google Drive API"
4. Criar credenciais OAuth 2.0
5. Configurar URLs de redirecionamento

**Passo 2: Obter Credenciais**
- Client ID
- Client Secret
- Refresh Token (para acesso permanente)

### **2. Estrutura de Arquivos PHP**

```
/gruporaca/api/
├── config.php              # Configurações gerais
├── drive-config.php        # Credenciais Google Drive
├── auth.php                # Autenticação usuários
├── drive-auth.php          # OAuth Google Drive
├── drive-client.php        # Cliente Google Drive API
├── upload.php              # Upload para Drive
├── list.php                # Listar arquivos
├── download.php            # Gerar link download
├── delete.php              # Deletar arquivo
├── users.json              # Usuários e permissões
└── metadata.json           # Metadados dos arquivos
```

### **3. Exemplo de Código PHP**

**drive-client.php:**
```php
<?php
require_once 'drive-config.php';

class GoogleDriveClient {
    private $client;
    private $service;
    
    public function __construct() {
        $this->client = new Google_Client();
        $this->client->setClientId(DRIVE_CLIENT_ID);
        $this->client->setClientSecret(DRIVE_CLIENT_SECRET);
        $this->client->setRedirectUri(DRIVE_REDIRECT_URI);
        $this->client->setScopes([
            'https://www.googleapis.com/auth/drive.file'
        ]);
        $this->client->setAccessType('offline');
        $this->client->setPrompt('consent');
        
        // Usar refresh token salvo
        if (file_exists('drive-token.json')) {
            $token = json_decode(file_get_contents('drive-token.json'), true);
            $this->client->setAccessToken($token);
            
            if ($this->client->isAccessTokenExpired()) {
                $this->client->refreshToken($token['refresh_token']);
                file_put_contents('drive-token.json', 
                    json_encode($this->client->getAccessToken()));
            }
        }
        
        $this->service = new Google_Service_Drive($this->client);
    }
    
    public function uploadFile($filePath, $fileName, $folderId) {
        $fileMetadata = new Google_Service_Drive_DriveFile([
            'name' => $fileName,
            'parents' => [$folderId]
        ]);
        
        $content = file_get_contents($filePath);
        $file = $this->service->files->create($fileMetadata, [
            'data' => $content,
            'mimeType' => mime_content_type($filePath),
            'uploadType' => 'multipart',
            'fields' => 'id, name, webViewLink, webContentLink, size'
        ]);
        
        return [
            'id' => $file->getId(),
            'name' => $file->getName(),
            'viewLink' => $file->getWebViewLink(),
            'downloadLink' => $file->getWebContentLink(),
            'size' => $file->getSize()
        ];
    }
    
    public function listFiles($folderId) {
        $response = $this->service->files->listFiles([
            'q' => "'$folderId' in parents and trashed=false",
            'fields' => 'files(id, name, size, mimeType, createdTime, webViewLink)'
        ]);
        
        return $response->getFiles();
    }
    
    public function deleteFile($fileId) {
        return $this->service->files->delete($fileId);
    }
    
    public function getFolderId($folderName) {
        $response = $this->service->files->listFiles([
            'q' => "name='$folderName' and mimeType='application/vnd.google-apps.folder' and trashed=false",
            'fields' => 'files(id)'
        ]);
        
        $files = $response->getFiles();
        return $files ? $files[0]->getId() : null;
    }
    
    public function createFolder($folderName, $parentId = null) {
        $fileMetadata = new Google_Service_Drive_DriveFile([
            'name' => $folderName,
            'mimeType' => 'application/vnd.google-apps.folder'
        ]);
        
        if ($parentId) {
            $fileMetadata->setParents([$parentId]);
        }
        
        $file = $this->service->files->create($fileMetadata, [
            'fields' => 'id'
        ]);
        
        return $file->getId();
    }
}
?>
```

**upload.php:**
```php
<?php
require_once 'auth.php';
require_once 'drive-client.php';
require_once 'permissions.php';

header('Content-Type: application/json');

// Autenticar usuário
$user = authenticate();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autenticado']);
    exit;
}

// Validar permissão de upload
$folder = $_POST['folder'] ?? '';
if (!hasPermission($user, 'upload', $folder)) {
    http_response_code(403);
    echo json_encode(['error' => 'Sem permissão para upload nesta pasta']);
    exit;
}

// Validar arquivo
if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Nenhum arquivo enviado']);
    exit;
}

$file = $_FILES['file'];
$maxSize = 500 * 1024 * 1024; // 500MB

if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'Arquivo muito grande (máx 500MB)']);
    exit;
}

// Mapear pasta para ID do Google Drive
$folderMapping = [
    'marketing' => 'ID_DA_PASTA_MARKETING',
    'fotografos' => 'ID_DA_PASTA_FOTOGRAFOS',
    'larissa' => 'ID_DA_PASTA_LARISSA',
    'midias/de-olho-no-marchador' => 'ID_DA_PASTA_DE_OLHO',
    // ... outros
];

$driveFolderId = $folderMapping[$folder] ?? null;
if (!$driveFolderId) {
    http_response_code(400);
    echo json_encode(['error' => 'Pasta inválida']);
    exit;
}

// Upload para Google Drive
try {
    $drive = new GoogleDriveClient();
    $result = $drive->uploadFile(
        $file['tmp_name'],
        sanitizeFilename($file['name']),
        $driveFolderId
    );
    
    // Salvar metadados
    saveMetadata([
        'id' => generateUUID(),
        'driveId' => $result['id'],
        'name' => $file['name'],
        'size' => $file['size'],
        'type' => $file['type'],
        'folder' => $folder,
        'uploadedBy' => $user['email'],
        'uploadedAt' => date('c'),
        'viewLink' => $result['viewLink'],
        'downloadLink' => $result['downloadLink']
    ]);
    
    echo json_encode([
        'success' => true,
        'file' => [
            'id' => $result['id'],
            'name' => $file['name'],
            'size' => $file['size'],
            'viewLink' => $result['viewLink']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao fazer upload: ' . $e->getMessage()]);
}
?>
```

**list.php:**
```php
<?php
require_once 'auth.php';
require_once 'drive-client.php';
require_once 'permissions.php';

header('Content-Type: application/json');

$user = authenticate();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autenticado']);
    exit;
}

$folder = $_GET['folder'] ?? '';

// Verificar permissão de visualização
if (!hasPermission($user, 'view', $folder)) {
    http_response_code(403);
    echo json_encode(['error' => 'Sem permissão para ver esta pasta']);
    exit;
}

// Listar arquivos do Drive
$drive = new GoogleDriveClient();
$folderMapping = getFolderMapping();
$driveFolderId = $folderMapping[$folder] ?? null;

if (!$driveFolderId) {
    echo json_encode(['files' => []]);
    exit;
}

$files = $drive->listFiles($driveFolderId);

// Filtrar apenas arquivos que o usuário tem permissão
$allowedFiles = [];
foreach ($files as $file) {
    $metadata = getFileMetadata($file->getId());
    if (hasPermission($user, 'view', $metadata['folder'])) {
        $allowedFiles[] = [
            'id' => $file->getId(),
            'name' => $file->getName(),
            'size' => $file->getSize(),
            'type' => $file->getMimeType(),
            'createdAt' => $file->getCreatedTime(),
            'viewLink' => $file->getWebViewLink()
        ];
    }
}

echo json_encode(['files' => $allowedFiles]);
?>
```

---

## 🔒 Segurança e Permissões

### **Sistema de Permissões (JSON):**

**users.json:**
```json
{
  "users": [
    {
      "id": 1,
      "email": "marketing@gruporaca.com.br",
      "password": "$2y$10$hash...",
      "name": "Toda Arte Marketing",
      "role": "admin",
      "folders": ["*"],
      "permissions": ["upload", "download", "delete", "view_all"]
    },
    {
      "id": 4,
      "email": "fotografo@gruporaca.com.br",
      "password": "$2y$10$hash...",
      "name": "Fotógrafo",
      "role": "photographer",
      "folders": ["fotografos"],
      "permissions": ["upload", "download", "view"]
    }
  ]
}
```

### **Proteção:**
- ✅ Conta Google Drive: **privada** (apenas API acessa)
- ✅ Validação de permissões em cada requisição
- ✅ Senhas com bcrypt
- ✅ Tokens de sessão
- ✅ Validação de tipos de arquivo
- ✅ Limite de tamanho

---

## 💰 Custos

| Plano | Espaço | Preço/Mês | Ideal Para |
|-------|--------|-----------|------------|
| **Grátis** | 15GB | **R$ 0** | Teste inicial |
| **Google One 100GB** | 100GB | **R$ 8,50** | Começar |
| **Google One 200GB** | 200GB | **R$ 12,50** | Crescimento |
| **Google One 2TB** | 2TB | **R$ 35** | Volume alto |

**Recomendação:** Começar com 100GB (R$ 8,50/mês) e aumentar conforme necessário.

---

## ✅ Vantagens desta Solução

1. **Custo baixo:** R$ 8,50/mês para 100GB
2. **Familiar:** Todos já conhecem Google Drive
3. **Backup automático:** Google cuida do backup
4. **Acesso múltiplo:** Web, mobile, desktop
5. **Escalável:** Fácil aumentar espaço
6. **API robusta:** Documentação completa
7. **Controle total:** Permissões gerenciadas pelo site

---

## 🚀 Próximos Passos

1. **Criar conta Google Drive** (ou usar existente)
2. **Configurar Google Cloud Console**
3. **Habilitar Google Drive API**
4. **Obter credenciais OAuth**
5. **Criar estrutura de pastas no Drive**
6. **Desenvolver scripts PHP**
7. **Atualizar componente React**
8. **Testar upload/download**

---

## 📝 Checklist de Implementação

- [ ] Criar/verificar conta Google Drive
- [ ] Configurar Google Cloud Console
- [ ] Habilitar Google Drive API
- [ ] Criar credenciais OAuth 2.0
- [ ] Criar estrutura de pastas no Drive
- [ ] Instalar biblioteca PHP Google API Client
- [ ] Desenvolver drive-client.php
- [ ] Desenvolver upload.php
- [ ] Desenvolver list.php
- [ ] Desenvolver download.php
- [ ] Desenvolver delete.php
- [ ] Implementar sistema de permissões
- [ ] Atualizar Database.tsx (React)
- [ ] Testar com diferentes usuários
- [ ] Documentar processo de setup

---

## 🎯 Conclusão

**Google Drive é uma excelente escolha porque:**
- ✅ Custo muito baixo (R$ 8,50/mês)
- ✅ Interface familiar
- ✅ Backup automático
- ✅ API robusta e bem documentada
- ✅ Escalável
- ✅ Controle total de permissões via site

**Posso começar a implementar agora!** 🚀

