# 🚀 Guia de Deploy para Hostinger

## ✅ Build Concluído

O build do site foi gerado com sucesso na pasta `dist/`.

## 📋 Passos para Fazer Upload na Hostinger

### 1. Acessar o Painel da Hostinger

1. Acesse [hPanel da Hostinger](https://hpanel.hostinger.com/)
2. Faça login com suas credenciais
3. Vá em **"Gerenciador de Arquivos"** ou **"File Manager"**

### 2. Localizar a Pasta do Site

1. Navegue até a pasta `public_html` (ou `www` dependendo da configuração)
2. Esta é a pasta raiz do seu domínio `todaarte.com.br`

### 3. Fazer Upload dos Arquivos

#### Opção A: Via File Manager (Recomendado)

1. No File Manager, vá até `public_html`
2. **Delete todos os arquivos antigos** (se houver)
3. Clique em **"Upload"** ou **"Enviar arquivos"**
4. Selecione **TODOS os arquivos** da pasta `dist/` do seu computador:
   - `index.html`
   - Pasta `assets/` (com todos os arquivos dentro)
   - Arquivo `.htaccess`
   - Pasta `partners/` (com os logos)
5. Aguarde o upload completar

#### Opção B: Via FTP

1. Use um cliente FTP (FileZilla, WinSCP, etc.)
2. Conecte-se ao servidor da Hostinger usando as credenciais FTP
3. Navegue até `public_html`
4. Faça upload de **TODOS os arquivos** da pasta `dist/`

### 4. Verificar Estrutura de Pastas

Após o upload, a estrutura deve ficar assim:

```
public_html/
├── index.html
├── .htaccess
├── assets/
│   ├── index-XXXXX.js
│   ├── index-XXXXX.css
│   └── logo-XXXXX.png
└── partners/
    ├── LogoRealDriver.png
    ├── LogoArianeAndrade.png
    └── LogoGrupoRaca.png
```

### 5. Configurar SSL/HTTPS (Importante!)

1. No painel da Hostinger, vá em **"Domínios"**
2. Selecione `todaarte.com.br`
3. Vá em **"SSL"** ou **"Certificados SSL"**
4. Ative o **SSL gratuito** (Let's Encrypt)
5. Aguarde alguns minutos para instalação

### 6. Verificar Permissões

Certifique-se de que:
- Arquivos têm permissão `644`
- Pastas têm permissão `755`
- O arquivo `.htaccess` está presente na raiz

### 7. Testar o Site

1. Acesse `https://todaarte.com.br`
2. Verifique se todas as páginas funcionam:
   - `/` - Home
   - `/portfolio` - Portfólio
   - `/servicos` - Serviços
   - `/desenvolvimento-de-sites` - Desenvolvimento de Sites
   - `/equipe` - Equipe
   - `/contato` - Contato
3. Verifique se os logos dos parceiros aparecem
4. Teste o formulário de contato

## ⚠️ Problemas Comuns

### Site não carrega
- Verifique se o `index.html` está na raiz de `public_html`
- Verifique se o `.htaccess` foi enviado
- Limpe o cache do navegador

### Páginas retornam 404
- Verifique se o `.htaccess` está presente
- Verifique as permissões do arquivo (deve ser 644)

### SSL não funciona
- Aguarde até 24 horas para propagação
- Verifique se o SSL está ativo no painel
- Limpe o cache do navegador

### Logos não aparecem
- Verifique se a pasta `partners/` foi enviada
- Verifique os caminhos dos arquivos
- Verifique as permissões da pasta (755)

## 📝 Checklist Final

- [ ] Todos os arquivos da pasta `dist/` foram enviados
- [ ] Arquivo `.htaccess` está na raiz
- [ ] Pasta `partners/` com logos foi enviada
- [ ] SSL está ativo e funcionando
- [ ] Site acessível via HTTPS
- [ ] Todas as páginas funcionam corretamente
- [ ] Logos dos parceiros aparecem

## 🔄 Atualizações Futuras

Para atualizar o site no futuro:

1. Faça as alterações no código
2. Execute: `npm run build`
3. Faça upload apenas dos arquivos alterados na pasta `dist/`
4. Ou substitua todos os arquivos se preferir

---

**✅ Pronto! Seu site está no ar!**

