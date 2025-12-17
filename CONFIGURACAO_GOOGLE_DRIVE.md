# 📁 Configuração Google Drive - Grupo Raça

## 🎯 Objetivo
Configurar uma conta Google Drive dedicada para o Grupo Raça e integrar com o sistema de gerenciamento de arquivos.

---

## 📋 Pré-requisitos

✅ Conta Google separada/dedicada para o Grupo Raça  
✅ Acesso ao Google Cloud Console  
✅ Acesso ao servidor Hostinger (para upload de arquivos de configuração)

---

## 📂 Estrutura de Pastas Recomendada no Google Drive

```
Google Drive (Conta Grupo Raça)
│
├── 📁 marketing/                    # Materiais de marketing (ADMIN)
│   ├── 📁 leiloes/                 # Materiais de leilões
│   ├── 📁 redes-sociais/          # Posts e artes para redes
│   └── 📁 campanhas/               # Campanhas publicitárias
│
├── 📁 fotografos/                  # Fotos de leilões (USER)
│   ├── 📁 leilao-2024-01/         # Fotos do leilão 1
│   ├── 📁 leilao-2024-02/         # Fotos do leilão 2
│   └── 📁 ...                     # Outros leilões
│
├── 📁 catalogos/                   # Catálogos de leilões (USER)
│   ├── 📁 responsavel-1/          # Catálogos do responsável 1
│   ├── 📁 responsavel-2/          # Catálogos do responsável 2
│   └── 📁 ...                     # Outros responsáveis
│
└── 📁 midias/                      # Mídias sociais (USER)
    ├── 📁 de-olho-no-marchador/    # De Olho no Marchador
    ├── 📁 top-marchador/           # Top Marchador
    ├── 📁 aqui-tem-raca/          # Aqui Tem Raça
    ├── 📁 raca-e-marcha/          # Raça e Marcha
    ├── 📁 portal-marchador/       # Portal Marchador
    └── 📁 pura-marcha/             # Pura Marcha
```

**Observações:**
- Cada pasta de USER será criada pelo ROOT quando criar o usuário
- ROOT e ADMIN têm acesso a todas as pastas
- USER só acessa sua pasta específica

---

## 🔧 Passo 1: Criar Projeto no Google Cloud Console

### 1.1 Acessar Google Cloud Console
1. Acesse: https://console.cloud.google.com/
2. Faça login com a **conta Google dedicada do Grupo Raça**
3. Se não tiver projeto, clique em **"Criar Projeto"**

### 1.2 Criar Novo Projeto
- **Nome do Projeto**: `Grupo Raca Drive API`
- **ID do Projeto**: (será gerado automaticamente, ex: `grupo-raca-drive-api-123456`)
- Clique em **"Criar**

### 1.3 Aguardar Criação
- Aguarde alguns segundos até o projeto estar pronto
- Selecione o projeto criado no seletor de projetos (topo da página)

---

## 🔑 Passo 2: Habilitar Google Drive API

### 2.1 Navegar até APIs
1. No menu lateral, vá em **"APIs e Serviços"** → **"Biblioteca"**
2. Ou acesse diretamente: https://console.cloud.google.com/apis/library

### 2.2 Buscar e Habilitar API
1. Busque por: **"Google Drive API"**
2. Clique no resultado **"Google Drive API"**
3. Clique no botão **"Habilitar"**
4. Aguarde a confirmação (pode levar alguns segundos)

---

## 👤 Passo 3: Criar Service Account

### 3.1 Acessar Service Accounts
1. No menu lateral, vá em **"APIs e Serviços"** → **"Credenciais"**
2. Ou acesse: https://console.cloud.google.com/apis/credentials

### 3.2 Criar Service Account
1. Clique em **"Criar Credenciais"** → **"Conta de serviço"**
2. Preencha:
   - **Nome**: `grupo-raca-drive-service`
   - **ID**: (será gerado automaticamente)
   - **Descrição**: `Service account para acesso ao Google Drive do Grupo Raça`
3. Clique em **"Criar e continuar"**

### 3.3 Configurar Permissões (Opcional)
- Pode pular esta etapa (não precisa de permissões no projeto)
- Clique em **"Continuar"** → **"Concluído"**

### 3.4 Criar Chave JSON
1. Na lista de Service Accounts, clique na conta criada (`grupo-raca-drive-service`)
2. Vá na aba **"Chaves"**
3. Clique em **"Adicionar chave"** → **"Criar nova chave"**
4. Selecione **"JSON"**
5. Clique em **"Criar"**
6. **IMPORTANTE**: O arquivo JSON será baixado automaticamente
   - **Salve este arquivo com segurança!**
   - **NÃO compartilhe publicamente!**
   - **Nome sugerido**: `grupo-raca-drive-credentials.json`

---

## 🔐 Passo 4: Compartilhar Pasta Raiz no Google Drive

### 4.1 Acessar Google Drive
1. Acesse: https://drive.google.com/
2. Faça login com a **conta Google dedicada do Grupo Raça**

### 4.2 Criar Pasta Raiz (se não existir)
1. Crie uma pasta chamada: **`GRUPO_RACA`** (ou o nome que preferir)
2. Esta será a pasta raiz onde todas as subpastas ficarão

### 4.3 Compartilhar com Service Account
1. Clique com botão direito na pasta **`GRUPO_RACA`**
2. Clique em **"Compartilhar"**
3. No campo de e-mail, cole o **e-mail da Service Account**
   - Formato: `grupo-raca-drive-service@PROJETO-ID.iam.gserviceaccount.com`
   - Você encontra este e-mail na página da Service Account no Google Cloud Console
4. Defina a permissão como **"Editor"** (para permitir upload, download e delete)
5. Clique em **"Enviar"**
6. **IMPORTANTE**: Desmarque a opção **"Notificar pessoas"** (não é necessário notificar a service account)

### 4.4 Verificar Permissão
- A Service Account agora tem acesso à pasta raiz
- Ela poderá criar subpastas e arquivos dentro desta pasta

---

## 📝 Passo 5: Obter IDs das Pastas

### 5.1 Encontrar ID da Pasta Raiz
1. No Google Drive, abra a pasta **`GRUPO_RACA`**
2. Olhe na URL do navegador:
   ```
   https://drive.google.com/drive/folders/ABC123XYZ456...
   ```
3. O ID da pasta é a parte após `/folders/`
   - Exemplo: Se a URL é `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j`
   - O ID é: `1a2b3c4d5e6f7g8h9i0j`

### 5.2 Salvar o ID
- **Anote este ID** - será usado na configuração do sistema
- Este será o `ROOT_FOLDER_ID` na configuração PHP

---

## 📦 Passo 6: Instalar Biblioteca PHP do Google Drive

### 6.1 Via Composer (Recomendado)
No servidor Hostinger, execute:
```bash
cd /home/usuario/public_html/api
composer require google/apiclient
```

### 6.2 Ou Download Manual
Se não tiver Composer, baixe a biblioteca:
1. Acesse: https://github.com/googleapis/google-api-php-client/releases
2. Baixe a versão mais recente
3. Extraia na pasta `api/vendor/google/apiclient/`

---

## ⚙️ Passo 7: Configurar no Sistema

### 7.1 Upload do Arquivo de Credenciais
1. Faça upload do arquivo `grupo-raca-drive-credentials.json` para:
   ```
   /home/usuario/public_html/api/config/
   ```
2. **IMPORTANTE**: Configure permissões de leitura apenas:
   ```bash
   chmod 600 grupo-raca-drive-credentials.json
   ```

### 7.2 Criar Arquivo de Configuração
Crie o arquivo `api/config/drive_config.php`:

```php
<?php
/**
 * Configuração Google Drive - Grupo Raça
 */

return [
    // Caminho para o arquivo de credenciais JSON
    'credentials_path' => __DIR__ . '/grupo-raca-drive-credentials.json',
    
    // ID da pasta raiz no Google Drive
    'root_folder_id' => 'SEU_ROOT_FOLDER_ID_AQUI',
    
    // Escopos necessários
    'scopes' => [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
    ],
    
    // Configurações de upload
    'upload' => [
        'max_file_size' => 100 * 1024 * 1024, // 100MB
        'allowed_types' => [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'video/mp4',
            'video/quicktime'
        ]
    ]
];
?>
```

### 7.3 Substituir o ID da Pasta
- No arquivo `drive_config.php`, substitua `SEU_ROOT_FOLDER_ID_AQUI` pelo ID real obtido no Passo 5

---

## ✅ Passo 8: Testar Conexão

### 8.1 Criar Script de Teste
Crie o arquivo `api/test-drive-connection.php`:

```php
<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/drive_service.php';

try {
    $driveService = new DriveService();
    $rootFolder = $driveService->getFolder('ROOT_FOLDER_ID');
    
    echo json_encode([
        'success' => true,
        'message' => 'Conexão com Google Drive estabelecida!',
        'root_folder' => $rootFolder
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
```

### 8.2 Executar Teste
- Acesse: `https://todaarte.com.br/api/test-drive-connection.php`
- Se retornar `success: true`, a conexão está funcionando!

---

## 📋 Checklist Final

- [ ] Projeto criado no Google Cloud Console
- [ ] Google Drive API habilitada
- [ ] Service Account criada
- [ ] Chave JSON baixada e salva com segurança
- [ ] Pasta raiz criada no Google Drive
- [ ] Pasta raiz compartilhada com Service Account (permissão Editor)
- [ ] ID da pasta raiz anotado
- [ ] Biblioteca PHP instalada (via Composer ou manual)
- [ ] Arquivo de credenciais enviado para o servidor
- [ ] Arquivo `drive_config.php` criado e configurado
- [ ] Teste de conexão executado com sucesso

---

## 🚨 Segurança

### ⚠️ IMPORTANTE:
1. **NUNCA** compartilhe o arquivo `grupo-raca-drive-credentials.json` publicamente
2. **NUNCA** faça commit deste arquivo no Git
3. Mantenha o arquivo com permissões restritas (`chmod 600`)
4. Se o arquivo for comprometido, delete a Service Account e crie uma nova

---

## 📞 Próximos Passos

Após completar esta configuração:
1. Implementar a classe `DriveService` em PHP
2. Integrar com `api/files.php`
3. Testar upload, download e listagem de arquivos
4. Configurar permissões por pasta no sistema

---

**Última atualização**: Dezembro 2024

