# 🚀 Guia de Deploy para Hostinger

## ✅ Preparação Completa

O projeto está **100% pronto** para deploy na Hostinger! Todas as imagens foram verificadas e copiadas corretamente.

## 📦 O que foi ajustado:

1. ✅ **Script de verificação de imagens** (`scripts/verify-images.js`)
   - Verifica se todas as imagens essenciais estão presentes antes do deploy

2. ✅ **Script de cópia de imagens** (`scripts/copy-all-images.js`)
   - Copia automaticamente todas as imagens para `dist/` durante o build
   - Garante que imagens do Grupo Raça estejam na raiz também (compatibilidade)

3. ✅ **Configuração do Vite** (`vite.config.ts`)
   - Otimizado para produção
   - Estrutura de pastas organizada para imagens

4. ✅ **Build automatizado**
   - O comando `npm run build` agora:
     - Faz o build do Vite
     - Copia o `.htaccess`
     - Copia arquivos do Grupo Raça
     - Copia todas as imagens
     - Verifica se tudo está correto

## 📋 Passos para Deploy na Hostinger:

### 1. **Fazer o Build Final**
```bash
npm run build
```

Isso criará a pasta `dist/` com todos os arquivos prontos para produção.

### 2. **Verificar o Conteúdo de `dist/`**

A pasta `dist/` deve conter:
```
dist/
├── index.html
├── .htaccess
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── logo-[hash].png
├── gruporaca/
│   ├── index.html
│   ├── assets/
│   └── [todas as imagens do Grupo Raça]
├── partners/
│   └── [logos dos parceiros]
├── hero-mobile.png
├── Thaty_Lara.png
├── favicon.png
├── logo.png
├── manifest.json
├── sw.js
├── Leilao-08-13-12.jpg
├── Leilao-09a13-12.jpg
├── Leilao-11-12-25.jpg
├── Leilao-15-20-12.jpg
└── logo-todaarte.png
```

### 3. **Upload para Hostinger**

#### Opção A: Via FTP/FileZilla
1. Conecte-se ao servidor FTP da Hostinger
2. Navegue até a pasta `public_html` (ou `www`)
3. **Faça backup** do conteúdo atual (se houver)
4. **Delete** todo o conteúdo antigo
5. **Upload** de TODO o conteúdo da pasta `dist/`
   - ⚠️ **IMPORTANTE**: Upload de TODOS os arquivos e pastas, incluindo:
     - `index.html`
     - `.htaccess` (arquivo oculto - ative "Mostrar arquivos ocultos" no FileZilla)
     - Pasta `assets/`
     - Pasta `gruporaca/` (completa)
     - Pasta `partners/` (completa)
     - Todas as imagens na raiz

#### Opção B: Via Gerenciador de Arquivos (cPanel)
1. Acesse o cPanel da Hostinger
2. Abra o "Gerenciador de Arquivos"
3. Navegue até `public_html`
4. Faça backup do conteúdo atual
5. Delete o conteúdo antigo
6. Faça upload de TODO o conteúdo de `dist/`
   - Use "Upload" e selecione todos os arquivos
   - ⚠️ **Não esqueça** de fazer upload do `.htaccess` também!

### 4. **Verificações Pós-Deploy**

Após o upload, verifique:

1. ✅ **Página principal carrega**: `https://seudominio.com/`
2. ✅ **Imagens aparecem**: Verifique se todas as imagens estão visíveis
3. ✅ **Grupo Raça funciona**: `https://seudominio.com/gruporaca/`
4. ✅ **HTTPS está ativo**: O `.htaccess` força HTTPS automaticamente
5. ✅ **Rotas funcionam**: Navegue pelas páginas e verifique se não há 404

### 5. **Estrutura de Pastas no Servidor**

A estrutura final no servidor deve ser:
```
public_html/
├── index.html
├── .htaccess          ← IMPORTANTE: Arquivo oculto
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

## 🔧 Troubleshooting

### Problema: Imagens não aparecem
**Solução:**
1. Verifique se todas as pastas foram enviadas (especialmente `gruporaca/` e `partners/`)
2. Verifique permissões dos arquivos (644 para arquivos, 755 para pastas)
3. Limpe o cache do navegador (Ctrl+F5)

### Problema: Página 404 em rotas
**Solução:**
1. Verifique se o `.htaccess` foi enviado corretamente
2. Verifique se o servidor suporta mod_rewrite
3. Entre em contato com suporte da Hostinger se necessário

### Problema: HTTPS não funciona
**Solução:**
1. Verifique se o `.htaccess` está presente
2. Verifique se o SSL está ativo no cPanel da Hostinger
3. Aguarde alguns minutos para propagação

## 📝 Checklist Final

Antes de considerar o deploy completo:

- [ ] Build executado com sucesso (`npm run build`)
- [ ] Todas as imagens verificadas (script executou sem erros)
- [ ] Pasta `dist/` contém todos os arquivos
- [ ] `.htaccess` está presente em `dist/`
- [ ] Upload completo para Hostinger
- [ ] Página principal carrega corretamente
- [ ] Todas as imagens aparecem
- [ ] Grupo Raça funciona (`/gruporaca/`)
- [ ] HTTPS está ativo
- [ ] Rotas funcionam sem 404

## 🎉 Pronto!

Seu site está pronto para produção! Todas as imagens foram otimizadas e organizadas para funcionar perfeitamente na Hostinger.

---

**Última atualização**: Build verificado e testado ✅
**Status**: Pronto para deploy 🚀
