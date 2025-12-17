# 📤 Guia Passo a Passo - Upload da Biblioteca Google API

## 🎯 Objetivo
Fazer upload da pasta `vendor` completa para o servidor Hostinger.

---

## 📂 Passo 1: Localizar a Pasta `vendor`

### 1.1 Onde está a pasta extraída?
Você mencionou que está em:
```
C:\Users\Marcus Lopes\Desktop\google-api-php-client--PHP8.2
```

### 1.2 Abra essa pasta no Windows Explorer
1. Abra o **Windows Explorer** (pasta do computador)
2. Navegue até: `C:\Users\Marcus Lopes\Desktop\google-api-php-client--PHP8.2`
3. Você deve ver várias pastas e arquivos, incluindo:
   - `src/`
   - `vendor/` ← **ESTA É A PASTA QUE PRECISAMOS!**
   - `composer.json`
   - `README.md`
   - etc.

---

## 📂 Passo 2: Verificar o Conteúdo da Pasta `vendor`

### 2.1 Abra a pasta `vendor`
1. Dentro de `google-api-php-client--PHP8.2`, clique duas vezes na pasta **`vendor/`**
2. Você deve ver uma pasta chamada **`google/`**

### 2.2 Abra a pasta `google`
1. Dentro de `vendor/`, clique duas vezes na pasta **`google/`**
2. Você deve ver pelo menos uma dessas pastas:
   - `apiclient/` ← **Biblioteca principal**
   - `apiclient-services/` ← **Serviços (Drive, etc.)**

### 2.3 Verificar `apiclient`
1. Dentro de `vendor/google/`, abra a pasta **`apiclient/`**
2. Dentro dela, procure por: `src/Google/Client.php`
3. Se encontrar esse arquivo, está correto! ✅

---

## 📤 Passo 3: Fazer Upload para o Servidor

### Opção A: Upload da Pasta `vendor` Completa (Recomendado)

1. **No Windows Explorer:**
   - Volte para: `C:\Users\Marcus Lopes\Desktop\google-api-php-client--PHP8.2`
   - Você verá a pasta **`vendor/`**

2. **No File Manager do Hostinger (cPanel):**
   - Acesse: https://seu-cpanel.hostinger.com
   - Vá em **File Manager**
   - Navegue até: `/public_html/api/`
   - Se não existir a pasta `vendor/` em `/api/`, está tudo bem, vamos criar

3. **Fazer Upload:**
   - No File Manager, clique em **"Upload"** ou **"Enviar arquivos"**
   - Selecione a pasta **`vendor/`** completa
   - Aguarde o upload terminar

### Opção B: Upload via ZIP (Mais Fácil)

1. **Criar ZIP da pasta vendor:**
   - No Windows Explorer, vá até: `C:\Users\Marcus Lopes\Desktop\google-api-php-client--PHP8.2`
   - Clique com botão direito na pasta **`vendor/`**
   - Selecione **"Enviar para"** → **"Pasta compactada (em zip)"**
   - Isso criará `vendor.zip`

2. **Fazer Upload do ZIP:**
   - No File Manager do Hostinger, vá até `/public_html/api/`
   - Faça upload do arquivo `vendor.zip`
   - Depois, extraia o ZIP no servidor (botão direito → "Extrair")

---

## ✅ Passo 4: Verificar Estrutura Final

Após o upload, a estrutura deve estar assim:

```
/public_html/api/
├── vendor/
│   └── google/
│       ├── apiclient/
│       │   └── src/
│       │       └── Google/
│       │           └── Client.php  ← Deve existir!
│       └── apiclient-services/
│           └── src/
│               └── Google/
│                   └── Service/
│                       └── Drive.php  ← Deve existir!
```

---

## 🔍 Se Não Encontrar a Pasta `vendor`

### Possível Problema:
A versão que você baixou pode não ter a pasta `vendor` pré-compilada.

### Solução:
1. Baixe novamente: `google-api-php-client--PHP8.2.zip`
2. Extraia em uma nova pasta
3. Procure pela pasta `vendor/` na raiz da pasta extraída

---

## 📞 Precisa de Ajuda?

Me diga:
1. Você consegue ver a pasta `vendor/` em `C:\Users\Marcus Lopes\Desktop\google-api-php-client--PHP8.2`?
2. O que você vê dentro da pasta `vendor/`?
3. Você vê a pasta `google/` dentro de `vendor/`?

Com essas informações, posso te ajudar melhor! 🚀

