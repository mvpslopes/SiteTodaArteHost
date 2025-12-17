# 🚀 Resumo Rápido - Configuração Google Drive

## ✅ O que você precisa fazer agora:

### 1️⃣ **Criar Projeto no Google Cloud** (5 minutos)
- Acesse: https://console.cloud.google.com/
- Crie projeto: `Grupo Raca Drive API`
- Habilite: **Google Drive API**

### 2️⃣ **Criar Service Account** (3 minutos)
- Vá em: **APIs e Serviços** → **Credenciais** → **Criar Conta de Serviço**
- Nome: `grupo-raca-drive-service`
- Crie chave **JSON** e **baixe o arquivo** (salve com segurança!)

### 3️⃣ **Criar Pastas no Google Drive** (5 minutos)
- Acesse: https://drive.google.com/
- Crie pasta raiz: **`GRUPO_RACA`**
- Dentro dela, crie:
  - `marketing/`
  - `fotografos/`
  - `catalogos/`
  - `midias/`

### 4️⃣ **Compartilhar com Service Account** (2 minutos)
- Clique com botão direito na pasta `GRUPO_RACA`
- **Compartilhar** → Cole o e-mail da Service Account
- Permissão: **Editor**
- **Anote o ID da pasta** (está na URL)

### 5️⃣ **Enviar Arquivos para Servidor** (quando estiver pronto)
- Upload do arquivo JSON de credenciais para: `/api/config/`
- Criar arquivo de configuração com o ID da pasta

---

## 📚 Documentação Completa

- **Guia Completo**: `CONFIGURACAO_GOOGLE_DRIVE.md`
- **Estrutura de Pastas**: `ESTRUTURA_PASTAS_DRIVE.md`

---

## ⏱️ Tempo Total Estimado: ~15 minutos

Depois disso, eu implemento a integração técnica no código! 🎯

