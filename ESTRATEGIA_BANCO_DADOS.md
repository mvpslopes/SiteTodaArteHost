# 📋 Estratégia de Sistema de Banco de Dados - Grupo Raça

## 🎯 Objetivo
Criar um sistema de gerenciamento de arquivos sem usar banco de dados da Hostinger, utilizando arquivos JSON e estrutura de pastas.

---

## 👥 Perfis de Usuário

### **Perfis com Acesso Total:**
1. **Toda Arte Marketing** (`marketing@gruporaca.com.br`)
   - Acesso: Todas as pastas
   - Permissões: Upload, Download, Delete, Visualizar tudo

2. **Larissa Mendes** (`larissa@gruporaca.com.br`)
   - Acesso: Todas as pastas
   - Permissões: Upload, Download, Delete, Visualizar tudo

3. **Ariane Andrade** (`ariane@gruporaca.com.br`)
   - Acesso: Todas as pastas
   - Permissões: Upload, Download, Delete, Visualizar tudo

### **Perfis com Acesso Restrito:**

4. **Fotógrafos** (`fotografo@gruporaca.com.br`)
   - Acesso: Apenas pasta `/fotografos/`
   - Permissões: Upload, Download, Visualizar (sem delete)

5. **De Olho no Marchador** (`deolhonomarchador@gruporaca.com.br`)
   - Acesso: Apenas pasta `/midias/de-olho-no-marchador/`
   - Permissões: Upload, Download, Visualizar

6. **Top Marchador** (`topmarchador@gruporaca.com.br`)
   - Acesso: Apenas pasta `/midias/top-marchador/`
   - Permissões: Upload, Download, Visualizar

7. **Aqui Tem Raça** (`aquitemraca@gruporaca.com.br`)
   - Acesso: Apenas pasta `/midias/aqui-tem-raca/`
   - Permissões: Upload, Download, Visualizar

8. **Raça e Marcha** (`racaemarcha@gruporaca.com.br`)
   - Acesso: Apenas pasta `/midias/raca-e-marcha/`
   - Permissões: Upload, Download, Visualizar

9. **Portal Marchador** (`portalmarchador@gruporaca.com.br`)
   - Acesso: Apenas pasta `/midias/portal-marchador/`
   - Permissões: Upload, Download, Visualizar

10. **Pura Marcha** (`puramarcha@gruporaca.com.br`)
    - Acesso: Apenas pasta `/midias/pura-marcha/`
    - Permissões: Upload, Download, Visualizar

---

## 📁 Estrutura de Pastas no Servidor

```
/gruporaca/database/
├── uploads/
│   ├── marketing/              # Materiais produzidos pela Toda Arte
│   ├── fotografos/             # Fotos e vídeos de leilões
│   ├── larissa/                # Catálogos
│   └── midias/
│       ├── de-olho-no-marchador/
│       ├── top-marchador/
│       ├── aqui-tem-raca/
│       ├── raca-e-marcha/
│       ├── portal-marchador/
│       └── pura-marcha/
├── api/
│   ├── users.json              # Usuários e permissões
│   ├── upload.php              # Script de upload
│   ├── list.php                # Listar arquivos
│   ├── delete.php              # Deletar arquivos
│   ├── auth.php                # Autenticação
│   └── .htaccess               # Proteção da API
└── .htaccess                   # Proteção geral
```

---

## 🔐 Sistema de Autenticação

### **Arquivo: `/api/users.json`**
```json
{
  "users": [
    {
      "id": 1,
      "email": "marketing@gruporaca.com.br",
      "password": "hash_bcrypt_aqui",
      "name": "Toda Arte Marketing",
      "role": "admin",
      "folders": ["*"],
      "permissions": ["upload", "download", "delete", "view_all"]
    },
    {
      "id": 2,
      "email": "larissa@gruporaca.com.br",
      "password": "hash_bcrypt_aqui",
      "name": "Larissa Mendes",
      "role": "admin",
      "folders": ["*"],
      "permissions": ["upload", "download", "delete", "view_all"]
    },
    {
      "id": 3,
      "email": "ariane@gruporaca.com.br",
      "password": "hash_bcrypt_aqui",
      "name": "Ariane Andrade",
      "role": "admin",
      "folders": ["*"],
      "permissions": ["upload", "download", "delete", "view_all"]
    },
    {
      "id": 4,
      "email": "fotografo@gruporaca.com.br",
      "password": "hash_bcrypt_aqui",
      "name": "Fotógrafo",
      "role": "photographer",
      "folders": ["fotografos"],
      "permissions": ["upload", "download", "view"]
    },
    {
      "id": 5,
      "email": "deolhonomarchador@gruporaca.com.br",
      "password": "hash_bcrypt_aqui",
      "name": "De Olho no Marchador",
      "role": "media",
      "folders": ["midias/de-olho-no-marchador"],
      "permissions": ["upload", "download", "view"]
    }
    // ... outros perfis de mídia
  ]
}
```

---

## 🛠️ Implementação Técnica

### **Opção 1: PHP Backend (Recomendado para Hostinger)**

**Vantagens:**
- ✅ Nativo na Hostinger
- ✅ Sem custos adicionais
- ✅ Fácil de implementar
- ✅ Suporta upload de arquivos grandes

**Estrutura:**
- `auth.php` - Autenticação e geração de token JWT simples
- `upload.php` - Upload de arquivos com validação de permissões
- `list.php` - Listar arquivos baseado nas permissões
- `delete.php` - Deletar arquivos (apenas admins)

### **Opção 2: Node.js Backend (Se disponível na Hostinger)**

**Vantagens:**
- ✅ Mesma linguagem do frontend (React)
- ✅ Mais moderno
- ✅ Melhor performance

**Desvantagens:**
- ❌ Pode não estar disponível no plano básico
- ❌ Pode precisar de upgrade

---

## 🔒 Segurança

1. **Senhas:**
   - Usar `password_hash()` do PHP (bcrypt)
   - Nunca armazenar senhas em texto plano

2. **Proteção de Pastas:**
   - `.htaccess` para bloquear acesso direto
   - Validação de permissões em cada requisição

3. **Upload:**
   - Validação de tipo de arquivo
   - Limite de tamanho (ex: 50MB por arquivo)
   - Sanitização de nomes de arquivo
   - Proteção contra uploads maliciosos

4. **Autenticação:**
   - Tokens JWT simples ou sessões PHP
   - Timeout de sessão (ex: 2 horas)

---

## 📊 Metadados dos Arquivos

**Arquivo: `/api/metadata/{pasta}.json`**
```json
{
  "files": [
    {
      "id": "uuid-aqui",
      "name": "leilao-2024-01.jpg",
      "path": "fotografos/leilao-2024-01.jpg",
      "size": 2048576,
      "type": "image/jpeg",
      "uploadedBy": "fotografo@gruporaca.com.br",
      "uploadedAt": "2024-01-15T10:30:00Z",
      "tags": ["leilao", "2024"],
      "description": "Fotos do leilão de janeiro"
    }
  ]
}
```

---

## 🚀 Próximos Passos

1. **Criar estrutura de pastas no servidor**
2. **Desenvolver scripts PHP de autenticação e upload**
3. **Atualizar componente React `Database.tsx`**
4. **Implementar sistema de permissões**
5. **Testar upload/download com diferentes perfis**
6. **Configurar `.htaccess` para proteção**

---

## 💡 Alternativa: Supabase (Gratuito até 500MB)

Se quiser uma solução mais robusta sem custos:
- ✅ Banco de dados PostgreSQL gratuito
- ✅ Autenticação pronta
- ✅ Storage para arquivos (500MB grátis)
- ✅ API REST automática
- ✅ Dashboard de gerenciamento

**Limite gratuito:**
- 500MB de storage
- 2GB de bandwidth/mês
- Ilimitado para autenticação

---

## 📝 Recomendação Final

**Para começar rápido:** Use PHP + JSON (Opção 1)
**Para escalar no futuro:** Considere Supabase quando precisar de mais recursos

