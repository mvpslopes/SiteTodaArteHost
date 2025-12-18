# 🚀 Guia de Deploy - Sistema Interno para Hostinger

## ✅ Build Concluído!

O build foi executado com sucesso. A pasta `dist/` está pronta para upload.

## 📦 O que fazer upload:

### 1. **Arquivos do Frontend (pasta `dist/`)**

Faça upload de **TODOS** os arquivos e pastas da pasta `dist/` para o servidor Hostinger:

```
dist/
├── index.html              ← IMPORTANTE
├── .htaccess               ← IMPORTANTE (arquivo oculto)
├── assets/                 ← Pasta completa
│   ├── index-BUHRZfxZ.js
│   ├── index-DasflTkC.css
│   └── logo-BdKDd3cP.png
├── partners/               ← Pasta completa
├── fonts/                  ← Pasta completa
├── favicon.png
├── manifest.json
├── sw.js
└── [todas as imagens na raiz]
```

### 2. **Arquivos da API (pasta `api/`)**

A pasta `api/` já deve estar no servidor. Se não estiver, faça upload também:

```
api/
├── *.php                   ← Todos os arquivos PHP
├── config/                 ← Pasta de configuração
└── [outros arquivos]
```

## 📋 Passos para Deploy:

### **Opção 1: Via File Manager (cPanel) - RECOMENDADO**

1. **Acesse o cPanel da Hostinger**
   - URL: `https://seu-dominio.com.br:2083` ou `https://cpanel.hostinger.com`
   - Faça login com suas credenciais

2. **Abra o Gerenciador de Arquivos**
   - Procure por "File Manager" ou "Gerenciador de Arquivos"
   - Navegue até `public_html` (ou `www`)

3. **Faça Backup (IMPORTANTE!)**
   - Selecione todos os arquivos atuais
   - Clique em "Comprimir" para criar um backup
   - Ou renomeie a pasta atual para `public_html_backup`

4. **Limpe o Diretório**
   - Delete todos os arquivos antigos (exceto a pasta `api/` se já existir)
   - ⚠️ **NÃO delete** a pasta `api/` se ela já estiver no servidor

5. **Faça Upload dos Arquivos**
   - Clique em "Upload" ou "Enviar"
   - Selecione **TODOS** os arquivos da pasta `dist/`
   - ⚠️ **IMPORTANTE**: Ative "Mostrar arquivos ocultos" para ver o `.htaccess`
   - Faça upload do `.htaccess` também

6. **Verifique a Estrutura**
   - Confirme que `index.html` está na raiz
   - Confirme que a pasta `assets/` existe
   - Confirme que o `.htaccess` foi enviado

### **Opção 2: Via FTP (FileZilla)**

1. **Conecte-se ao FTP**
   - Host: `ftp.todaarte.com.br` (ou o host fornecido pela Hostinger)
   - Usuário: Seu usuário FTP
   - Senha: Sua senha FTP
   - Porta: 21 (ou 22 para SFTP)

2. **Navegue até `public_html`**

3. **Faça Backup**
   - Baixe todos os arquivos atuais para backup local

4. **Delete arquivos antigos** (exceto `api/`)

5. **Upload de `dist/`**
   - Arraste todos os arquivos de `dist/` para `public_html`
   - ⚠️ Ative "Mostrar arquivos ocultos" no FileZilla para ver `.htaccess`

## 🔍 Verificações Pós-Deploy:

Após o upload, verifique:

1. ✅ **Página principal**: `https://todaarte.com.br/`
2. ✅ **Sistema Interno**: `https://todaarte.com.br/sistema-interno`
3. ✅ **Login funciona**: Use `admin@todaarte.com.br` / `123456`
4. ✅ **Dashboard carrega**: Verifique se os cards aparecem
5. ✅ **Projetos funcionam**: Teste criar/editar projeto
6. ✅ **Clientes funcionam**: Teste criar/editar cliente
7. ✅ **Financeiro funciona**: Teste todas as abas
8. ✅ **HTTPS ativo**: Verifique se o site redireciona para HTTPS
9. ✅ **Imagens aparecem**: Verifique se todas as imagens carregam

## 🗄️ Banco de Dados (se necessário):

Se o banco de dados do sistema interno ainda não foi criado:

1. **Acesse o phpMyAdmin** no cPanel
2. **Execute o script SQL**: `api/setup-sistema-interno.sql`
3. **Verifique as credenciais** em `api/config/db_config.php`

## ⚠️ Importante:

- **NÃO delete** a pasta `api/` se ela já existir no servidor
- **SEMPRE faça backup** antes de fazer upload
- **Verifique o `.htaccess`** foi enviado (é um arquivo oculto)
- **Limpe o cache** do navegador após o deploy (Ctrl+F5)

## 🎯 Estrutura Final no Servidor:

```
public_html/
├── index.html
├── .htaccess
├── assets/
├── partners/
├── fonts/
├── favicon.png
├── manifest.json
├── sw.js
├── [imagens]
└── api/                    ← Já deve existir
    ├── *.php
    └── config/
```

## ✅ Pronto!

Após seguir estes passos, o sistema estará disponível em:
- **Site Principal**: `https://todaarte.com.br/`
- **Sistema Interno**: `https://todaarte.com.br/sistema-interno`

