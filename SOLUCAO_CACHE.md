# 🔧 Solução para Problemas de Cache no Site Hospedado

## ⚠️ Problema
O site está desconfigurado na hospedagem, mas funciona localmente.

## ✅ Soluções

### 1. **Limpar Cache do Navegador**
- **Chrome/Edge**: `Ctrl + Shift + Delete` → Marque "Imagens e arquivos em cache" → Limpar
- **Firefox**: `Ctrl + Shift + Delete` → Marque "Cache" → Limpar
- **Ou**: Abra uma janela anônima/privada (`Ctrl + Shift + N`)

### 2. **Forçar Atualização (Hard Refresh)**
- **Windows**: `Ctrl + F5` ou `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### 3. **Verificar se os Arquivos Foram Atualizados**
1. Acesse o painel da hospedagem
2. Verifique se a pasta `dist/` foi completamente substituída
3. Confirme que os arquivos têm as datas/horários mais recentes

### 4. **Deletar Arquivos Antigos Antes do Upload**
**IMPORTANTE**: Antes de fazer upload dos novos arquivos:
1. Delete **TODOS** os arquivos antigos da pasta `public_html` (ou `www`)
2. Depois faça upload dos novos arquivos da pasta `dist/`

### 5. **Verificar Estrutura de Pastas**
Após o upload, a estrutura deve estar assim:
```
public_html/
├── index.html (NOVO - com hash atualizado)
├── .htaccess (ATUALIZADO)
├── assets/
│   ├── index-C-F0rXRE.js (NOVO hash)
│   ├── index-krGTQjJW.css (NOVO hash)
│   └── logo-BdKDd3cP.png
├── fonts/
│   ├── Montserrat-Light.ttf
│   └── Andrea Bellarosa.ttf
├── bg.png
├── Thaty_Lara.png
└── outros arquivos...
```

### 6. **Verificar Permissões dos Arquivos**
- Arquivos: `644`
- Pastas: `755`
- `.htaccess`: `644`

### 7. **Limpar Cache do Servidor (se disponível)**
No painel da hospedagem:
- Procure por "Cache" ou "CDN"
- Limpe o cache do servidor
- Aguarde alguns minutos

### 8. **Verificar se o .htaccess Está Funcionando**
O arquivo `.htaccess` agora tem configurações para:
- Não cachear HTML (força atualização)
- Cachear CSS/JS com hash (OK, pois mudam de nome a cada build)

## 📋 Checklist de Upload

- [ ] Deletei todos os arquivos antigos
- [ ] Fiz upload de TODOS os arquivos da pasta `dist/`
- [ ] Verifiquei que o `.htaccess` foi enviado
- [ ] Verifiquei as permissões dos arquivos
- [ ] Limpei o cache do navegador
- [ ] Fiz hard refresh (`Ctrl + F5`)
- [ ] Testei em janela anônima

## 🔍 Como Verificar se Está Atualizado

1. Abra o DevTools (`F12`)
2. Vá na aba **Network**
3. Marque "Disable cache"
4. Recarregue a página (`F5`)
5. Verifique se os arquivos carregados têm os nomes/hashes mais recentes:
   - `index-C-F0rXRE.js` (deve ser o mais recente)
   - `index-krGTQjJW.css` (deve ser o mais recente)

## ⚡ Solução Rápida

Se nada funcionar:
1. Delete TODOS os arquivos de `public_html`
2. Faça upload novamente de TODA a pasta `dist/`
3. Limpe o cache do navegador
4. Teste em janela anônima

