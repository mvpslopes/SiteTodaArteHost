# 🔧 Configuração para Desenvolvimento

## 🎯 Problema

Em desenvolvimento (localhost), a API precisa estar acessível. O Vite está configurado para fazer proxy, mas você precisa ter um servidor PHP rodando.

---

## 📋 Opções de Configuração

### **Opção 1: Servidor PHP Built-in (Mais Fácil)**

1. **Abra um terminal na pasta raiz do projeto:**
   ```bash
   cd C:\projetos\SiteTodaArteHost
   ```

2. **Inicie o servidor PHP:**
   ```bash
   php -S localhost:8000
   ```
   (Ou use outra porta, ex: 8080, 3000)

3. **Atualize o vite.config.ts** com a porta correta:
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:8000', // Porta do servidor PHP
       changeOrigin: true,
     },
   }
   ```

4. **Acesse:**
   - Frontend: `http://localhost:5173`
   - API: `http://localhost:8000/api/`

---

### **Opção 2: XAMPP/WAMP (Se já tiver instalado)**

1. **Coloque a pasta `api` no htdocs:**
   - XAMPP: `C:\xampp\htdocs\api\`
   - WAMP: `C:\wamp64\www\api\`

2. **Atualize o vite.config.ts:**
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost', // XAMPP padrão
       changeOrigin: true,
     },
   }
   ```

3. **Acesse:**
   - Frontend: `http://localhost:5173`
   - API: `http://localhost/api/`

---

### **Opção 3: Usar URL Absoluta (Temporário)**

Se não quiser configurar servidor PHP local, pode apontar para produção:

1. **Crie arquivo `.env` na pasta `GrupoRaca_`:**
   ```
   VITE_API_URL=https://todaarte.com.br/api
   ```

2. **Reinicie o servidor Vite:**
   ```bash
   npm run dev
   ```

---

## 🧪 Testar Conexão

### **1. Testar Banco de Dados:**
```
http://localhost:8000/api/test-connection-dev.php
```
(ou a porta que você configurou)

### **2. Testar Login:**
```
http://localhost:8000/api/test-login-dev.php
```

---

## ✅ Checklist

- [ ] Servidor PHP rodando (porta 8000 ou outra)
- [ ] Vite configurado com proxy correto
- [ ] Banco de dados configurado (`db_config.php`)
- [ ] Usuário ROOT criado no banco
- [ ] Testar conexão: `http://localhost:8000/api/test-connection-dev.php`
- [ ] Testar login: `http://localhost:8000/api/test-login-dev.php`

---

## 🚀 Comando Rápido

**Terminal 1 (PHP):**
```bash
cd C:\projetos\SiteTodaArteHost
php -S localhost:8000
```

**Terminal 2 (Vite):**
```bash
cd C:\projetos\SiteTodaArteHost\GrupoRaca_
npm run dev
```

---

**Pronto!** Agora a API deve funcionar em desenvolvimento! 🎯

