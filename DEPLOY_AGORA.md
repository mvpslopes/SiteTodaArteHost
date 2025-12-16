# 🚀 Deploy para Hostinger - PRONTO!

## ✅ Build Concluído com Sucesso!

O projeto foi compilado e está **100% pronto** para upload na Hostinger.

---

## 📦 O que foi gerado:

A pasta `dist/` contém todos os arquivos necessários:

```
dist/
├── index.html                    ← Página principal
├── .htaccess                     ← Configurações Apache (IMPORTANTE!)
├── assets/                       ← JS e CSS compilados
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── logo-[hash].png
├── gruporaca/                    ← Site do Grupo Raça
│   ├── index.html
│   ├── assets/
│   └── [imagens]
├── partners/                     ← Logos dos parceiros
├── favicon.png
├── logo.png
├── hero-mobile.png
├── Thaty_Lara.png
└── [outras imagens]
```

---

## 📤 Como fazer o Upload:

### **Opção 1: Via FileZilla (Recomendado)**

1. **Abra o FileZilla**
2. **Conecte-se ao servidor FTP:**
   - Host: `ftp.todaarte.com.br` (ou o host fornecido pela Hostinger)
   - Usuário: Seu usuário FTP
   - Senha: Sua senha FTP
   - Porta: 21

3. **Navegue até `/public_html`** no servidor

4. **⚠️ IMPORTANTE: Faça backup do conteúdo atual** (se houver)

5. **Delete todo o conteúdo antigo** de `/public_html`

6. **Faça upload de TODOS os arquivos** da pasta `dist/`:
   - Selecione TODOS os arquivos e pastas de `dist/`
   - Arraste para `/public_html`
   - ⚠️ **NÃO ESQUEÇA** do arquivo `.htaccess` (pode estar oculto - ative "Mostrar arquivos ocultos")

7. **Aguarde o upload terminar** (pode levar alguns minutos)

---

### **Opção 2: Via cPanel (Gerenciador de Arquivos)**

1. **Acesse o cPanel da Hostinger**
2. **Abra "Gerenciador de Arquivos"**
3. **Navegue até `public_html`**
4. **Faça backup do conteúdo atual** (se houver)
5. **Delete o conteúdo antigo**
6. **Clique em "Upload"**
7. **Selecione TODOS os arquivos** da pasta `dist/`
8. **⚠️ IMPORTANTE:** Certifique-se de que o `.htaccess` foi enviado também!

---

## ✅ Verificações Pós-Deploy:

Após o upload, verifique:

1. ✅ **Página principal carrega:** `https://todaarte.com.br/`
2. ✅ **Grupo Raça funciona:** `https://todaarte.com.br/gruporaca/`
3. ✅ **Imagens aparecem:** Verifique se todas as imagens estão visíveis
4. ✅ **Assessores atualizados:** Verifique se os novos assessores aparecem:
   - Evolução da Marcha
   - Melquiades Leandro
   - Hugo Ferrari (nome atualizado)
   - Kauan (número atualizado)
5. ✅ **HTTPS está ativo:** O site deve redirecionar para HTTPS automaticamente
6. ✅ **Rotas funcionam:** Navegue pelas páginas e verifique se não há 404

---

## 🔧 Estrutura Final no Servidor:

```
public_html/
├── index.html
├── .htaccess          ← CRÍTICO: Deve estar presente!
├── assets/
│   └── [arquivos JS/CSS]
├── gruporaca/
│   ├── index.html
│   ├── assets/
│   └── [imagens]
├── partners/
│   └── [logos]
└── [imagens na raiz]
```

---

## 🐛 Problemas Comuns:

### **Imagens não aparecem:**
- Verifique se todas as pastas foram enviadas (`gruporaca/`, `partners/`)
- Limpe o cache do navegador (Ctrl+Shift+R)

### **Página 404 em rotas:**
- Verifique se o `.htaccess` foi enviado corretamente
- Verifique permissões (644 para arquivos, 755 para pastas)

### **HTTPS não funciona:**
- Verifique se o SSL está ativo no cPanel
- Aguarde alguns minutos para propagação

---

## 📝 Checklist Final:

- [x] Build executado com sucesso
- [x] Todas as imagens verificadas
- [x] Pasta `dist/` contém todos os arquivos
- [x] `.htaccess` está presente em `dist/`
- [ ] Upload completo para Hostinger
- [ ] Página principal carrega corretamente
- [ ] Todas as imagens aparecem
- [ ] Grupo Raça funciona (`/gruporaca/`)
- [ ] Assessores atualizados aparecem
- [ ] HTTPS está ativo
- [ ] Rotas funcionam sem 404

---

## 🎉 Pronto para Deploy!

**Localização da pasta `dist/`:**
```
C:\projetos\SiteTodaArteHost\dist\
```

**Próximo passo:** Faça o upload de TODO o conteúdo de `dist/` para `/public_html` na Hostinger!

---

**✨ Dica:** Mantenha um backup da pasta `dist` antes de cada deploy!

