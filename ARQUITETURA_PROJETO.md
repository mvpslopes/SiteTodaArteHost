# 📐 Arquitetura do Projeto - Grupo Raça

## 🏗️ Estrutura do Projeto

```
SiteTodaArteHost/
├── api/                    # Backend PHP (API)
│   ├── auth.php           # Autenticação
│   ├── db_config.php      # Configuração do banco (detecta local/produção)
│   └── ...
├── GrupoRaca_/            # Frontend React (Landing Page + Sistema)
│   ├── src/
│   └── ...
└── dist/                  # Build de produção (gerado automaticamente)
```

---

## 🌐 AMBIENTE DE PRODUÇÃO (Hostinger)

### Como funciona:
- **URL do Site**: `todaarte.com.br/gruporaca`
- **URL da API**: `todaarte.com.br/api` (mesmo servidor)
- **Banco de Dados**: MySQL na Hostinger (`u179630068_gruporaca_db`)

### Fluxo:
```
Usuário acessa: todaarte.com.br/gruporaca
    ↓
Frontend (React) carrega
    ↓
Faz requisições para: todaarte.com.br/api/auth.php
    ↓
API PHP conecta no banco da Hostinger
    ↓
Retorna dados para o frontend
```

**✅ Tudo roda na Hostinger, tudo conectado ao banco de produção.**

---

## 💻 AMBIENTE DE DESENVOLVIMENTO (Local - Seu Computador)

### Como funciona:
- **URL do Site**: `localhost:5173/gruporaca` (Vite dev server)
- **URL da API**: `localhost/api` (XAMPP Apache)
- **Banco de Dados**: MySQL local no XAMPP (`gruporaca_db`)

### Fluxo:
```
Você acessa: localhost:5173/gruporaca
    ↓
Frontend (React) carrega via Vite
    ↓
Faz requisições para: /api/auth.php
    ↓
Vite Proxy intercepta e redireciona para: localhost/api/auth.php
    ↓
API PHP (XAMPP) detecta que está em localhost
    ↓
Conecta no banco LOCAL (gruporaca_db) - NÃO na Hostinger!
    ↓
Retorna dados para o frontend
```

**✅ Tudo roda no seu computador, TUDO LOCAL, NÃO acessa a Hostinger!**

---

## 🔄 Detecção Automática de Ambiente

O arquivo `api/db_config.php` detecta automaticamente onde está rodando:

```php
// Se detectar "localhost" → usa banco LOCAL
if ($isLocal) {
    DB_NAME = 'gruporaca_db'           // Banco local
    DB_USER = 'root'                   // XAMPP padrão
    DB_PASS = ''                       // XAMPP padrão
}
// Se detectar Hostinger → usa banco de PRODUÇÃO
else {
    DB_NAME = 'u179630068_gruporaca_db'  // Banco Hostinger
    DB_USER = 'u179630068_gruporaca_user'
    DB_PASS = 'Gr@up0R@c@2024!DB#Secure'
}
```

---

## ❓ Por que precisa de banco local?

### ✅ Vantagens:
1. **Testar sem afetar produção** - Você pode criar/deletar dados sem medo
2. **Desenvolver offline** - Não precisa de internet
3. **Dados de teste controlados** - Você cria os dados que precisa
4. **Mais rápido** - Banco local é mais rápido que remoto
5. **Debug mais fácil** - Pode ver logs direto no XAMPP

### ⚠️ Importante:
- **Banco local é SEPARADO do banco de produção**
- **Mudanças no banco local NÃO afetam produção**
- **Você precisa criar os dados de teste localmente** (usuários, etc.)

---

## 📋 Resumo Visual

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUÇÃO (Hostinger)                  │
├─────────────────────────────────────────────────────────┤
│  Frontend: todaarte.com.br/gruporaca                    │
│  API:      todaarte.com.br/api                          │
│  Banco:    u179630068_gruporaca_db (Hostinger)          │
│  Status:   ✅ ONLINE - Usuários reais                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              DESENVOLVIMENTO (Seu PC)                    │
├─────────────────────────────────────────────────────────┤
│  Frontend: localhost:5173/gruporaca (Vite)              │
│  API:      localhost/api (XAMPP)                        │
│  Banco:    gruporaca_db (MySQL local)                   │
│  Status:   🔧 OFFLINE - Dados de teste                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Como usar:

### Para desenvolver/testar localmente:
1. ✅ XAMPP rodando (Apache + MySQL)
2. ✅ Banco `gruporaca_db` criado localmente
3. ✅ Dados de teste inseridos (usuários, etc.)
4. ✅ `npm run dev` na pasta `GrupoRaca_`
5. ✅ Acessar: `localhost:5173/gruporaca`

### Para fazer deploy em produção:
1. ✅ `npm run build` na pasta `GrupoRaca_`
2. ✅ Upload da pasta `dist/` para Hostinger
3. ✅ API já está na Hostinger
4. ✅ Banco de produção já existe

---

## ⚠️ Resposta direta à sua pergunta:

**"Quando eu acesso localmente eu estou acessando direto no site da hostinger para testar?"**

**NÃO!** Quando você acessa `localhost:5173/gruporaca`:
- ✅ Frontend roda no seu PC (Vite)
- ✅ API roda no seu PC (XAMPP)
- ✅ Banco de dados roda no seu PC (MySQL do XAMPP)
- ❌ **NÃO acessa a Hostinger de forma alguma!**

É um ambiente **100% local e isolado** da produção.

