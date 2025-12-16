# 🗄️ Estratégia Completa de Armazenamento - Grupo Raça

## 📊 Análise de Requisitos

### **Tipos de Arquivos:**
- 📸 **Fotos de Leilões**: 2-10MB cada (centenas por leilão)
- 🎥 **Vídeos de Leilões**: 50-500MB cada (dezenas por leilão)
- 📄 **Catálogos (PDF)**: 5-50MB cada
- 🎨 **Materiais de Marketing**: 1-20MB cada
- 📱 **Mídias Sociais**: 1-10MB cada

### **Volume Estimado:**
- **Por mês**: ~50-100GB (considerando múltiplos leilões)
- **Por ano**: ~600GB - 1.2TB
- **Crescimento**: Contínuo (arquivos não são deletados)

---

## ⚠️ Limitações do Plano Hostinger

### **Planos Hostinger Típicos:**
- **Starter**: 100GB de armazenamento
- **Premium**: 200GB de armazenamento
- **Business**: 200GB+ de armazenamento

### **Problemas:**
1. ❌ **Armazenamento limitado** - 100-200GB não é suficiente para vídeos
2. ❌ **Bandwidth limitado** - Pode esgotar com muitos downloads
3. ❌ **Performance** - Servidor pode ficar lento com muitos arquivos
4. ❌ **Backup** - Não há backup automático de arquivos grandes

---

## ✅ Estratégia Recomendada: Armazenamento Híbrido

### **Opção 1: Cloudflare R2 (RECOMENDADO) 🏆**

**Por quê?**
- ✅ **Armazenamento ilimitado** (ou muito generoso)
- ✅ **Sem custos de egress** (downloads gratuitos)
- ✅ **$0.015 por GB/mês** (muito barato)
- ✅ **Compatível com S3** (fácil integração)
- ✅ **CDN global** (downloads rápidos)
- ✅ **Backup automático**

**Custos Estimados:**
- 1TB de armazenamento: ~$15/mês
- Downloads: **GRÁTIS** (diferente do S3 da AWS)
- Total: ~$15-30/mês para começar

**Estrutura:**
```
Cloudflare R2 Bucket: gruporaca-media
├── marketing/
├── fotografos/
├── larissa/
└── midias/
    ├── de-olho-no-marchador/
    ├── top-marchador/
    └── ...
```

**Implementação:**
- Frontend (React) → API PHP → Cloudflare R2
- URLs públicas ou privadas (com autenticação)
- Thumbnails gerados automaticamente

---

### **Opção 2: AWS S3 + CloudFront**

**Vantagens:**
- ✅ Muito confiável
- ✅ Escalável
- ✅ Integração fácil

**Desvantagens:**
- ❌ Custos de egress (downloads cobrados)
- ❌ Mais caro que R2
- ❌ Pode chegar a $50-100/mês com tráfego

**Custos Estimados:**
- Armazenamento: ~$23/mês (1TB)
- Transferência: ~$90/mês (1TB de downloads)
- **Total: ~$100-150/mês**

---

### **Opção 3: Google Cloud Storage**

**Similar ao S3, mas:**
- ✅ Primeiros 5GB grátis
- ✅ $0.020 por GB/mês
- ❌ Custos de egress também

---

### **Opção 4: Hostinger + Otimização (ECONÔMICO)**

**Se quiser usar apenas Hostinger:**

**Estratégia:**
1. **Comprimir vídeos** antes do upload
   - Converter para MP4 (H.264)
   - Reduzir qualidade se necessário
   - Limitar tamanho máximo: 100MB por vídeo

2. **Gerar thumbnails** para vídeos
   - Salvar apenas thumbnail no servidor
   - Vídeo completo em storage externo

3. **Armazenar apenas no servidor:**
   - Fotos comprimidas (max 2MB cada)
   - PDFs de catálogos
   - Materiais de marketing

4. **Vídeos grandes → YouTube/Vimeo**
   - Upload direto para YouTube (privado)
   - Embed no sistema
   - **GRÁTIS e ilimitado**

**Limitações:**
- ⚠️ Depende do plano Hostinger
- ⚠️ Pode precisar upgrade para mais espaço
- ⚠️ Performance pode degradar com muitos arquivos

---

## 🏗️ Arquitetura Recomendada (Cloudflare R2)

### **Estrutura de Dados:**

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
│  ├── upload.php    (Upload → R2)       │
│  ├── list.php      (Listar arquivos)   │
│  ├── delete.php    (Deletar)           │
│  └── download.php  (Gerar URL R2)      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    Cloudflare R2 (Storage)             │
│    Bucket: gruporaca-media              │
│    ├── marketing/                      │
│    ├── fotografos/                     │
│    ├── larissa/                        │
│    └── midias/                         │
└─────────────────────────────────────────┘
```

### **Fluxo de Upload:**

1. **Usuário faz upload** → Frontend (React)
2. **Frontend envia** → API PHP (Hostinger)
3. **PHP valida** → Permissões, tipo, tamanho
4. **PHP faz upload** → Cloudflare R2
5. **PHP salva metadados** → JSON local (Hostinger)
6. **PHP retorna** → URL pública ou privada

### **Fluxo de Download:**

1. **Usuário clica em download** → Frontend
2. **Frontend solicita** → API PHP
3. **PHP valida** → Permissões do usuário
4. **PHP gera** → URL assinada do R2 (válida por 1 hora)
5. **Frontend redireciona** → Download direto do R2

---

## 📁 Estrutura de Metadados (JSON Local)

**Arquivo: `/api/files-metadata.json`**
```json
{
  "files": [
    {
      "id": "uuid-123",
      "name": "leilao-janeiro-2024.mp4",
      "path": "fotografos/leilao-janeiro-2024.mp4",
      "r2_key": "fotografos/leilao-janeiro-2024.mp4",
      "size": 157286400,
      "type": "video/mp4",
      "thumbnail": "fotografos/thumbs/leilao-janeiro-2024.jpg",
      "uploadedBy": "fotografo@gruporaca.com.br",
      "uploadedAt": "2024-01-15T10:30:00Z",
      "folder": "fotografos",
      "tags": ["leilao", "2024", "janeiro"],
      "description": "Vídeo completo do leilão de janeiro"
    }
  ]
}
```

**Vantagens:**
- ✅ Metadados leves (JSON pequeno)
- ✅ Busca rápida
- ✅ Fácil de fazer backup
- ✅ Armazenado no Hostinger (barato)

---

## 🔧 Implementação Técnica

### **1. Configuração Cloudflare R2:**

```php
// config.php
define('R2_ACCOUNT_ID', 'seu-account-id');
define('R2_ACCESS_KEY', 'sua-access-key');
define('R2_SECRET_KEY', 'sua-secret-key');
define('R2_BUCKET', 'gruporaca-media');
define('R2_ENDPOINT', 'https://seu-account-id.r2.cloudflarestorage.com');
```

### **2. Upload para R2 (PHP):**

```php
// upload.php
require_once 'config.php';
require_once 'auth.php';
require_once 'r2-client.php';

// Validar permissões
$user = authenticate();
checkPermission($user, 'upload', $_POST['folder']);

// Upload para R2
$file = $_FILES['file'];
$r2Key = $_POST['folder'] . '/' . sanitizeFilename($file['name']);

$result = uploadToR2($file['tmp_name'], $r2Key, $file['type']);

// Salvar metadados
saveMetadata([
    'id' => generateUUID(),
    'name' => $file['name'],
    'r2_key' => $r2Key,
    'size' => $file['size'],
    'type' => $file['type'],
    'uploadedBy' => $user['email'],
    'folder' => $_POST['folder']
]);

echo json_encode(['success' => true, 'url' => $result['url']]);
```

### **3. Geração de URL Assinada:**

```php
// download.php
$file = getFileMetadata($_GET['id']);
checkPermission($user, 'download', $file['folder']);

// Gerar URL assinada (válida por 1 hora)
$signedUrl = generateSignedUrl($file['r2_key'], 3600);

header('Location: ' . $signedUrl);
exit;
```

---

## 💰 Comparação de Custos (1TB de dados)

| Solução | Armazenamento | Transferência | Total/Mês |
|---------|--------------|--------------|-----------|
| **Cloudflare R2** | $15 | **$0** | **~$15-20** |
| AWS S3 | $23 | $90 | ~$100-150 |
| Google Cloud | $20 | $80 | ~$100-120 |
| **Hostinger + YouTube** | $0 | $0 | **$0** (mas limitado) |

---

## 🎯 Recomendação Final

### **Para Começar (Fase 1):**
1. **Usar Hostinger** para arquivos pequenos (fotos, PDFs)
2. **YouTube/Vimeo** para vídeos grandes (GRÁTIS)
3. **Implementar compressão** de imagens
4. **Gerar thumbnails** para vídeos

**Custo: $0/mês**

### **Para Escalar (Fase 2):**
1. **Migrar para Cloudflare R2** quando volume aumentar
2. **Manter metadados** em JSON no Hostinger
3. **API PHP** como intermediário

**Custo: ~$15-30/mês**

---

## 📋 Checklist de Implementação

### **Fase 1 (Hostinger + Otimização):**
- [ ] Implementar compressão de imagens (PHP)
- [ ] Limitar tamanho de upload (ex: 100MB)
- [ ] Integrar YouTube API para vídeos
- [ ] Gerar thumbnails automáticos
- [ ] Sistema de permissões baseado em JSON

### **Fase 2 (Cloudflare R2):**
- [ ] Criar conta Cloudflare
- [ ] Configurar bucket R2
- [ ] Implementar cliente R2 em PHP
- [ ] Migrar uploads para R2
- [ ] Implementar URLs assinadas
- [ ] Testar performance

---

## 🚀 Próximos Passos

**Qual estratégia você prefere?**

1. **Econômica**: Hostinger + YouTube (começar agora, $0/mês)
2. **Profissional**: Cloudflare R2 (escalável, ~$15/mês)
3. **Híbrida**: Começar com Hostinger, migrar para R2 depois

**Posso implementar qualquer uma das opções!**

