# 🚀 Instruções de Deploy - Toda Arte v2.11.0

## 📋 Checklist de Deploy

### ✅ 1. Frontend (Já feito)
- [x] Upload da pasta `dist/` para o servidor web
- [x] Arquivos estáticos no diretório público

### 🔧 2. Backend - Configurações Necessárias

#### A. Criar arquivo `.env` na pasta backend:
```env
# Configurações do Backend para Produção
PORT=3000
DB_PATH=./database.sqlite
JWT_SECRET=todaarte_jwt_secret_key_2024_production
NODE_ENV=production

# Configurações de CORS
CORS_ORIGIN=https://todaarte.com.br

# Configurações de Log
LOG_LEVEL=info
```

#### B. Criar arquivo `.env.production` na raiz do projeto:
```env
# Configurações para Produção
VITE_API_URL=https://todaarte.com.br
```

### 🖥️ 3. Comandos no Servidor

#### No diretório do backend:
```bash
# Instalar dependências
npm install

# Iniciar o servidor
npm start
```

#### Para manter o servidor rodando (recomendado):
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar com PM2
pm2 start index.js --name "todaarte-backend"

# Salvar configuração do PM2
pm2 save

# Configurar para iniciar automaticamente
pm2 startup
```

### 🌐 4. Configurações do Servidor Web

#### Apache (.htaccess):
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Configurar CORS
Header always set Access-Control-Allow-Origin "https://todaarte.com.br"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

#### Nginx:
```nginx
server {
    listen 80;
    server_name todaarte.com.br;
    root /caminho/para/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 🔒 5. Configurações de Segurança

#### SSL/HTTPS:
- Configurar certificado SSL
- Redirecionar HTTP para HTTPS
- Configurar HSTS

#### Firewall:
- Abrir porta 3000 para o backend
- Configurar regras de segurança

### 📊 6. Monitoramento

#### Verificar se está funcionando:
```bash
# Testar backend
curl https://todaarte.com.br:3000/api/health

# Testar frontend
curl https://todaarte.com.br
```

#### Logs:
```bash
# Ver logs do PM2
pm2 logs todaarte-backend

# Ver logs do sistema
tail -f /var/log/nginx/error.log
```

### 🗄️ 7. Banco de Dados

O sistema usa SQLite, que será criado automaticamente na primeira execução.

#### Backup (recomendado):
```bash
# Fazer backup do banco
cp database.sqlite database_backup_$(date +%Y%m%d).sqlite
```

### 🔄 8. Atualizações Futuras

Para atualizar o sistema:
1. Fazer backup do banco de dados
2. Parar o servidor: `pm2 stop todaarte-backend`
3. Fazer upload dos novos arquivos
4. Instalar dependências: `npm install`
5. Iniciar o servidor: `pm2 start todaarte-backend`

### 📞 9. Suporte

Em caso de problemas:
- Verificar logs: `pm2 logs todaarte-backend`
- Verificar status: `pm2 status`
- Reiniciar: `pm2 restart todaarte-backend`

---

## 🎯 URLs de Acesso

- **Frontend:** https://todaarte.com.br
- **Backend API:** https://todaarte.com.br:3000
- **Sistema Interno:** https://todaarte.com.br/dashboard

---

**✅ Sistema pronto para produção!**

