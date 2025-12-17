# 📦 Instalação Manual - Biblioteca Google API PHP

## 🎯 Objetivo
Instalar a biblioteca Google API PHP sem usar Composer, fazendo download e upload manual.

---

## 📋 Passo 1: Baixar a Biblioteca

### 1.1 Acessar o Repositório
1. Acesse: https://github.com/googleapis/google-api-php-client/releases
2. Procure pela versão mais recente (ex: `v2.15.0` ou superior)
3. Clique em **"Assets"** para expandir
4. Baixe o arquivo: **`google-api-php-client-2.x.x.zip`**
   - Exemplo: `google-api-php-client-2.15.0.zip`

### 1.2 Extrair o Arquivo
1. Extraia o arquivo ZIP baixado
2. Dentro da pasta extraída, você verá:
   - `src/` (código fonte)
   - `vendor/` (dependências)
   - Outros arquivos

---

## 📋 Passo 2: Preparar Estrutura no Servidor

### 2.1 Estrutura Necessária
A biblioteca precisa estar em:
```
/public_html/api/vendor/google/apiclient/
```

### 2.2 O que fazer:
1. Dentro da pasta extraída, encontre a pasta `vendor/`
2. Dentro de `vendor/`, você verá a pasta `google/`
3. A pasta `google/` contém `apiclient/`

**Estrutura esperada:**
```
vendor/
└── google/
    └── apiclient/
        ├── src/
        ├── composer.json
        └── ...
```

---

## 📋 Passo 3: Upload para o Servidor

### Opção A: Upload da Pasta Completa `vendor/`

1. Acesse o **File Manager** do cPanel da Hostinger
2. Navegue até: `/public_html/api/`
3. Faça upload da pasta **`vendor/`** completa
   - Se não existir a pasta `vendor/` em `/api/`, crie ela primeiro
   - Faça upload de toda a pasta `vendor/` (com a estrutura `google/apiclient/` dentro)

### Opção B: Upload Apenas do `google/apiclient/`

1. Acesse o **File Manager** do cPanel
2. Navegue até: `/public_html/api/vendor/`
   - Se não existir, crie a pasta `vendor/`
3. Faça upload da pasta **`google/`** (que contém `apiclient/`)

**Resultado final esperado:**
```
/public_html/api/vendor/google/apiclient/src/Google/Client.php
```

---

## 📋 Passo 4: Verificar Instalação

### 4.1 Criar Script de Verificação

Crie um arquivo `api/verificar-biblioteca.php`:

```php
<?php
echo "<h2>Verificação da Biblioteca Google API PHP</h2>";

// Verificar se o arquivo principal existe
$clientPath = __DIR__ . '/vendor/google/apiclient/src/Google/Client.php';
if (file_exists($clientPath)) {
    echo "✅ Arquivo Client.php encontrado!<br>";
} else {
    echo "❌ Arquivo Client.php NÃO encontrado em: $clientPath<br>";
    echo "Verifique se a pasta vendor/google/apiclient/ foi enviada corretamente.<br>";
    exit;
}

// Tentar carregar a classe
try {
    require_once $clientPath;
    echo "✅ Classe Google_Client carregada com sucesso!<br>";
} catch (Exception $e) {
    echo "❌ Erro ao carregar classe: " . $e->getMessage() . "<br>";
    exit;
}

// Verificar se a classe existe
if (class_exists('Google_Client')) {
    echo "✅ Classe Google_Client disponível!<br>";
} else {
    echo "❌ Classe Google_Client NÃO disponível!<br>";
    exit;
}

// Verificar outras dependências
$servicePath = __DIR__ . '/vendor/google/apiclient/src/Google/Service/Drive.php';
if (file_exists($servicePath)) {
    echo "✅ Arquivo Drive.php encontrado!<br>";
} else {
    echo "⚠️ Arquivo Drive.php não encontrado. Pode ser necessário instalar dependências adicionais.<br>";
}

echo "<br><strong>✅ Biblioteca instalada corretamente!</strong><br>";
echo "<a href='test-drive-connection.php'>Testar Conexão com Google Drive</a>";
?>
```

### 4.2 Acessar o Script
1. Acesse: `https://todaarte.com.br/api/verificar-biblioteca.php`
2. Se aparecerem todos os ✅, a biblioteca está instalada!

---

## 📋 Passo 5: Testar Conexão com Google Drive

Após verificar a biblioteca:

1. Acesse: `https://todaarte.com.br/api/test-drive-connection.php`
2. Deve retornar:
   ```json
   {
     "success": true,
     "rootFolder": {
       "id": "1EeKxOPybc3QRtVS6RgOUY0TEirl4MBsD",
       "name": "GRUPO_RACA"
     }
   }
   ```

---

## ⚠️ Problemas Comuns

### Erro: "Class 'Google_Client' not found"

**Causa:** A biblioteca não foi enviada corretamente ou está no caminho errado.

**Solução:**
1. Verifique se a estrutura está correta: `/api/vendor/google/apiclient/`
2. Verifique se o arquivo `Client.php` existe em: `/api/vendor/google/apiclient/src/Google/Client.php`
3. Use o script `verificar-biblioteca.php` para diagnosticar

### Erro: "require_once(): Failed opening required"

**Causa:** Caminho incorreto ou permissões de arquivo.

**Solução:**
1. Verifique as permissões das pastas (devem ser `755`)
2. Verifique se todos os arquivos foram enviados

### Erro: "Autoloader not found"

**Causa:** A biblioteca pode precisar do autoloader do Composer.

**Solução:**
1. Se a biblioteca extraída tiver um arquivo `vendor/autoload.php`, faça upload dele também
2. Ou ajuste o código para carregar as classes manualmente

---

## 📝 Checklist

- [ ] Biblioteca baixada do GitHub
- [ ] Arquivo ZIP extraído
- [ ] Pasta `vendor/` ou `google/apiclient/` identificada
- [ ] Upload feito para `/public_html/api/vendor/`
- [ ] Estrutura verificada: `/api/vendor/google/apiclient/src/Google/Client.php`
- [ ] Script `verificar-biblioteca.php` criado e testado
- [ ] Teste de conexão executado com sucesso

---

## 🚀 Próximos Passos

Após instalar a biblioteca:
1. Testar conexão: `test-drive-connection.php`
2. Testar listagem de arquivos via `files.php`
3. Testar upload de arquivos
4. Integrar com o frontend

---

**Última atualização**: Dezembro 2024

