# Guia PWA - Versão Mobile do Toda Arte

## ✅ O que foi implementado

A aplicação agora é um **Progressive Web App (PWA)**, o que significa que pode ser instalada como um aplicativo no celular!

### Funcionalidades:
- ✅ **Instalável**: Usuários podem instalar o app no celular
- ✅ **Funciona offline**: Cache de recursos para uso sem internet
- ✅ **Experiência nativa**: Abre como app, sem barra do navegador
- ✅ **Atualizações automáticas**: Service Worker verifica atualizações

## 📱 Como instalar no celular

### Android (Chrome):
1. Abra o site no navegador Chrome
2. Aparecerá um banner "Adicionar à tela inicial" ou um ícone de "+" no menu
3. Toque em "Adicionar" ou "Instalar"
4. O app aparecerá na tela inicial como um aplicativo normal

### iOS (Safari):
1. Abra o site no Safari
2. Toque no botão de compartilhar (quadrado com seta)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Confirme o nome e toque em "Adicionar"
5. O app aparecerá na tela inicial

## 🧪 Como testar localmente

1. **Build da aplicação:**
   ```bash
   npm run build
   ```

2. **Servir a aplicação (necessário para PWA funcionar):**
   ```bash
   npm run preview
   ```
   Ou use um servidor HTTP local (não funciona com `file://`)

3. **Testar no navegador:**
   - Abra o DevTools (F12)
   - Vá em "Application" > "Service Workers"
   - Verifique se o service worker está registrado
   - Vá em "Application" > "Manifest" para ver as configurações

4. **Testar instalação:**
   - No Chrome: ícone de instalação na barra de endereços
   - No Edge: banner de instalação
   - No DevTools: "Application" > "Manifest" > botão "Add to homescreen"

## 🔧 Arquivos criados/modificados

- `public/manifest.json` - Configuração do PWA
- `public/sw.js` - Service Worker (cache e offline)
- `index.html` - Meta tags para PWA
- `src/main.tsx` - Registro do Service Worker

## 📝 Próximos passos (opcional)

### Para melhorar ainda mais:

1. **Ícones em diferentes tamanhos:**
   - Criar ícones 192x192, 512x512, etc.
   - Adicionar no `manifest.json`

2. **Capacitor (App Nativo):**
   - Para publicar nas lojas (Play Store / App Store)
   - Instalar: `npm install @capacitor/core @capacitor/cli`
   - Adicionar plataformas: `npx cap add android` ou `npx cap add ios`

3. **Notificações Push:**
   - Implementar notificações push (já preparado no service worker)
   - Requer backend com suporte a push notifications

4. **Splash Screen:**
   - Adicionar tela de carregamento personalizada
   - Configurar no `manifest.json`

## ⚠️ Importante

- O PWA só funciona em **HTTPS** (ou localhost para desenvolvimento)
- O service worker precisa ser servido do mesmo domínio
- Teste sempre após fazer build (`npm run build`)

## 🚀 Deploy

Ao fazer deploy, certifique-se de:
1. O servidor está configurado para servir `sw.js` e `manifest.json`
2. O site está em HTTPS (obrigatório para PWA em produção)
3. Os arquivos da pasta `public/` estão sendo servidos corretamente


