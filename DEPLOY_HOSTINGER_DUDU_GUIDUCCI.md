# 🚀 DEPLOY PARA HOSTINGER - DUDU GUIDUCCI

## 📦 ARQUIVOS PARA UPLOAD

### **Arquivo 1: index.html**
**Caminho local:** `dist/gruporaca/index.html`  
**Caminho no servidor:** `/public_html/gruporaca/index.html`

**Conteúdo importante:**
- Aponta para: `index-B9BgeFW_.js?v=20241213-6`
- Meta tags anti-cache incluídas

---

### **Arquivo 2: index-B9BgeFW_.js**
**Caminho local:** `dist/gruporaca/assets/index-B9BgeFW_.js`  
**Caminho no servidor:** `/public_html/gruporaca/assets/index-B9BgeFW_.js`

**Este arquivo contém:**
- ✅ DUDU GUIDUCCI substituindo CARLOS EDUARDO
- ✅ Todos os nomes em maiúsculas
- ✅ Novos assessores: EVOLUÇÃO DA MARCHA, MELQUIADES LEANDRO

---

## 📋 PASSOS PARA DEPLOY

### **PASSO 1: Preparar Arquivos**

1. **Verifique se os arquivos existem localmente:**
   - `dist/gruporaca/index.html`
   - `dist/gruporaca/assets/index-B9BgeFW_.js`

---

### **PASSO 2: Conectar ao Servidor**

**Via FileZilla ou cPanel File Manager:**
- Host: `ftp.todaarte.com.br` (ou use cPanel)
- Usuário: [seu usuário]
- Senha: [sua senha]

---

### **PASSO 3: Upload dos Arquivos**

**⚠️ IMPORTANTE: Delete arquivos JS antigos primeiro!**

1. **Navegue até:** `/public_html/gruporaca/assets/`

2. **Delete os arquivos JS antigos:**
   - `index-XcYrAM-n.js` (se existir)
   - `index-Cj5KIHta.js` (se existir)
   - Qualquer outro `index-*.js` antigo

3. **Faça upload do novo arquivo:**
   - `dist/gruporaca/assets/index-B9BgeFW_.js`
   - **Verifique a data do arquivo** (deve ser de hoje)

4. **Atualize o index.html:**
   - `dist/gruporaca/index.html`
   - **Caminho no servidor:** `/public_html/gruporaca/index.html`

---

### **PASSO 4: Limpar Cache**

**Cache do Servidor (cPanel):**
1. Acesse cPanel da Hostinger
2. Vá em **"Cache"** ou **"LiteSpeed Cache"**
3. Clique em **"Purge All"** ou **"Limpar Cache"**
4. Aguarde 2-3 minutos

**Cache do Navegador:**
1. `Ctrl + Shift + Delete`
2. Selecione **"Tudo"**
3. Período: **"Todo o período"**
4. **FECHE COMPLETAMENTE o navegador**
5. **Abra novamente**

---

### **PASSO 5: Verificar**

1. **Modo anônimo:** `Ctrl + Shift + N`
2. **Acesse:** `https://todaarte.com.br/gruporaca/?nocache=123456`
3. **Vá até "Assessores"**
4. **Verifique:**
   - ✅ DUDU GUIDUCCI aparece (não mais CARLOS EDUARDO)
   - ✅ Todos os nomes em MAIÚSCULAS
   - ✅ EVOLUÇÃO DA MARCHA presente
   - ✅ MELQUIADES LEANDRO presente

---

## 🔍 VERIFICAÇÃO NO SERVIDOR

### **Teste 1: Verificar Arquivo Direto**

Acesse no navegador:
```
https://todaarte.com.br/gruporaca/assets/index-B9BgeFW_.js
```

Pressione `Ctrl + F` e procure por:
- `DUDU GUIDUCCI`
- `toUpperCase()`

**Se encontrar:** Arquivo está correto.

**Se NÃO encontrar:** Arquivo não foi atualizado no servidor.

---

### **Teste 2: Console do Navegador**

1. `F12` → Aba **"Network"**
2. **Marque "Disable cache"** (checkbox no topo)
3. Recarregue (`Ctrl + R`)
4. Procure por `index-B9BgeFW_.js`
5. Clique → Aba **"Response"**
6. Procure por `DUDU GUIDUCCI`

---

## 📋 CHECKLIST FINAL

- [ ] Arquivo `index-B9BgeFW_.js` existe no servidor
- [ ] Data do arquivo é de HOJE
- [ ] Arquivo contém `DUDU GUIDUCCI`
- [ ] `index.html` aponta para `index-B9BgeFW_.js?v=20241213-6`
- [ ] Arquivos JS antigos foram DELETADOS
- [ ] Cache do navegador limpo (navegador FECHADO e REABERTO)
- [ ] Cache do servidor limpo
- [ ] Testado em modo anônimo
- [ ] Console mostra "Disable cache" marcado

---

## 🚨 SE AINDA NÃO FUNCIONAR

### **Renomear Arquivo (Forçar Atualização)**

1. **Renomeie no servidor:**
   - De: `index-B9BgeFW_.js`
   - Para: `index-DUDU-GUIDUCCI-FINAL.js`

2. **Atualize o index.html:**
```html
<script src="/gruporaca/assets/index-DUDU-GUIDUCCI-FINAL.js"></script>
```

3. **Faça upload do index.html atualizado**

---

## 💡 DICA PRO

**Para garantir:**
1. Delete TODOS os arquivos JS antigos da pasta `assets/`
2. Faça upload APENAS do `index-B9BgeFW_.js`
3. Limpe cache do servidor
4. Teste em modo anônimo com "Disable cache" marcado

---

**✨ Arquivos prontos para upload!**

