# 📦 Instalar Biblioteca Google API PHP

## ⚠️ IMPORTANTE

Antes de usar o sistema de arquivos com Google Drive, você precisa instalar a biblioteca do Google.

---

## 🔧 Opção 1: Via Composer (Recomendado)

### Se você tem acesso SSH/Terminal no Hostinger:

1. Conecte-se via SSH ao servidor Hostinger
2. Navegue até a pasta da API:
   ```bash
   cd /home/usuario/public_html/api
   ```
3. Instale o Composer (se não tiver):
   ```bash
   curl -sS https://getcomposer.org/installer | php
   ```
4. Instale a biblioteca do Google:
   ```bash
   php composer.phar require google/apiclient
   ```
   Ou se o Composer estiver instalado globalmente:
   ```bash
   composer require google/apiclient
   ```

---

## 🔧 Opção 2: Download Manual

### Se você NÃO tem acesso SSH:

1. Acesse: https://github.com/googleapis/google-api-php-client/releases
2. Baixe a versão mais recente (ex: `google-api-php-client-2.x.x.zip`)
3. Extraia o arquivo ZIP
4. Faça upload da pasta `vendor/` para:
   ```
   /public_html/api/vendor/
   ```
5. Certifique-se de que a estrutura fique assim:
   ```
   /public_html/api/vendor/google/apiclient/
   ```

---

## ✅ Verificar Instalação

Após instalar, teste a conexão:

1. Acesse: `https://todaarte.com.br/api/test-drive-connection.php`
2. Se retornar `{"success": true}`, está funcionando!
3. Se retornar erro sobre biblioteca não encontrada, verifique a instalação

---

## 🚨 Problemas Comuns

### Erro: "Biblioteca Google API PHP não encontrada"

**Solução:**
- Verifique se a pasta `vendor/google/apiclient/` existe
- Verifique se o arquivo `vendor/autoload.php` existe
- Se não existir, instale via Composer ou faça upload manual

### Erro: "Class 'Google_Client' not found"

**Solução:**
- A biblioteca não foi instalada corretamente
- Siga as instruções acima para instalar

---

**Última atualização**: Dezembro 2024

