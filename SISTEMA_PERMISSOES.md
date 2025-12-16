# 🔐 Sistema de Permissões - 3 Níveis de Acesso

## 📊 Estrutura de Níveis

### **1. ROOT (Super Admin)**
- ✅ Acesso a **todas as pastas**
- ✅ **Criar usuários** do sistema
- ✅ **Deletar usuários** do sistema
- ✅ **Editar permissões** de usuários
- ✅ Upload, Download, Delete em **todas as pastas**
- ✅ Visualizar **todos os arquivos**

### **2. ADMIN**
- ✅ Acesso a **todas as pastas**
- ✅ Upload, Download, Delete em **todas as pastas**
- ✅ Visualizar **todos os arquivos**
- ❌ **NÃO pode** criar/deletar usuários
- ❌ **NÃO pode** editar permissões

### **3. USER**
- ✅ Acesso **apenas à sua pasta** (criada pelo Root)
- ✅ Upload na **sua pasta**
- ✅ Download dos **seus arquivos**
- ✅ Visualizar **seus arquivos**
- ❌ **NÃO pode deletar** (nem os próprios arquivos)
- ❌ **NÃO pode** acessar outras pastas

---

## 👥 Mapeamento de Usuários

### **ROOT:**
- `root@gruporaca.com.br` - Super Admin (você)

### **ADMIN:**
- `marketing@gruporaca.com.br` - Toda Arte Marketing
- `larissa@gruporaca.com.br` - Larissa Mendes
- `ariane@gruporaca.com.br` - Ariane Andrade

### **USER:**
- `fotografo@gruporaca.com.br` - Fotógrafo (pasta: `fotografos`)
- `deolhonomarchador@gruporaca.com.br` - De Olho no Marchador (pasta: `midias/de-olho-no-marchador`)
- `topmarchador@gruporaca.com.br` - Top Marchador (pasta: `midias/top-marchador`)
- `aquitemraca@gruporaca.com.br` - Aqui Tem Raça (pasta: `midias/aqui-tem-raca`)
- `racaemarcha@gruporaca.com.br` - Raça e Marcha (pasta: `midias/raca-e-marcha`)
- `portalmarchador@gruporaca.com.br` - Portal Marchador (pasta: `midias/portal-marchador`)
- `puramarcha@gruporaca.com.br` - Pura Marcha (pasta: `midias/pura-marcha`)

---

## 📁 Estrutura de Pastas no Google Drive

```
Google Drive (gruporaca@gmail.com)
├── 📁 marketing/              # Pasta do Admin Toda Arte
├── 📁 larissa/                # Pasta do Admin Larissa
├── 📁 ariane/                 # Pasta do Admin Ariane
├── 📁 fotografos/             # Pasta do User Fotógrafo
└── 📁 midias/
    ├── 📁 de-olho-no-marchador/    # Pasta do User De Olho
    ├── 📁 top-marchador/           # Pasta do User Top Marchador
    ├── 📁 aqui-tem-raca/           # Pasta do User Aqui Tem Raça
    ├── 📁 raca-e-marcha/           # Pasta do User Raça e Marcha
    ├── 📁 portal-marchador/        # Pasta do User Portal Marchador
    └── 📁 pura-marcha/             # Pasta do User Pura Marcha
```

**Nota:** Cada USER tem sua própria pasta criada pelo ROOT.

---

## 🔐 Estrutura de Dados (users.json)

```json
{
  "users": [
    {
      "id": 1,
      "email": "root@gruporaca.com.br",
      "password": "$2y$10$hash_bcrypt_aqui",
      "name": "Root Admin",
      "role": "root",
      "folder": "*",
      "permissions": {
        "upload": true,
        "download": true,
        "delete": true,
        "view_all": true,
        "manage_users": true,
        "manage_permissions": true
      },
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "email": "marketing@gruporaca.com.br",
      "password": "$2y$10$hash_bcrypt_aqui",
      "name": "Toda Arte Marketing",
      "role": "admin",
      "folder": "*",
      "permissions": {
        "upload": true,
        "download": true,
        "delete": true,
        "view_all": true,
        "manage_users": false,
        "manage_permissions": false
      },
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": 3,
      "email": "larissa@gruporaca.com.br",
      "password": "$2y$10$hash_bcrypt_aqui",
      "name": "Larissa Mendes",
      "role": "admin",
      "folder": "*",
      "permissions": {
        "upload": true,
        "download": true,
        "delete": true,
        "view_all": true,
        "manage_users": false,
        "manage_permissions": false
      },
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": 4,
      "email": "ariane@gruporaca.com.br",
      "password": "$2y$10$hash_bcrypt_aqui",
      "name": "Ariane Andrade",
      "role": "admin",
      "folder": "*",
      "permissions": {
        "upload": true,
        "download": true,
        "delete": true,
        "view_all": true,
        "manage_users": false,
        "manage_permissions": false
      },
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": 5,
      "email": "fotografo@gruporaca.com.br",
      "password": "$2y$10$hash_bcrypt_aqui",
      "name": "Fotógrafo",
      "role": "user",
      "folder": "fotografos",
      "permissions": {
        "upload": true,
        "download": true,
        "delete": false,
        "view_all": false,
        "manage_users": false,
        "manage_permissions": false
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "createdBy": "root@gruporaca.com.br"
    },
    {
      "id": 6,
      "email": "deolhonomarchador@gruporaca.com.br",
      "password": "$2y$10$hash_bcrypt_aqui",
      "name": "De Olho no Marchador",
      "role": "user",
      "folder": "midias/de-olho-no-marchador",
      "permissions": {
        "upload": true,
        "download": true,
        "delete": false,
        "view_all": false,
        "manage_users": false,
        "manage_permissions": false
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "createdBy": "root@gruporaca.com.br"
    }
    // ... outros users
  ]
}
```

---

## 🛠️ Implementação de Permissões (PHP)

### **permissions.php:**

```php
<?php
require_once 'config.php';

function loadUsers() {
    $usersFile = __DIR__ . '/users.json';
    if (!file_exists($usersFile)) {
        return [];
    }
    $data = json_decode(file_get_contents($usersFile), true);
    return $data['users'] ?? [];
}

function saveUsers($users) {
    $usersFile = __DIR__ . '/users.json';
    $data = ['users' => $users];
    file_put_contents($usersFile, json_encode($data, JSON_PRETTY_PRINT));
}

function getUserByEmail($email) {
    $users = loadUsers();
    foreach ($users as $user) {
        if ($user['email'] === $email) {
            return $user;
        }
    }
    return null;
}

function hasPermission($user, $action, $folder = null) {
    if (!$user) {
        return false;
    }
    
    $role = $user['role'];
    $permissions = $user['permissions'] ?? [];
    
    // ROOT tem acesso total
    if ($role === 'root') {
        return true;
    }
    
    // ADMIN tem acesso a tudo exceto gerenciar usuários
    if ($role === 'admin') {
        if ($action === 'manage_users' || $action === 'manage_permissions') {
            return false;
        }
        return true;
    }
    
    // USER - verificar permissões específicas
    if ($role === 'user') {
        // USER não pode deletar
        if ($action === 'delete') {
            return false;
        }
        
        // USER não pode gerenciar usuários
        if ($action === 'manage_users' || $action === 'manage_permissions') {
            return false;
        }
        
        // USER só acessa sua própria pasta
        $userFolder = $user['folder'] ?? '';
        if ($folder && $folder !== $userFolder) {
            return false;
        }
        
        // Verificar permissão específica
        return $permissions[$action] ?? false;
    }
    
    return false;
}

function canAccessFolder($user, $folder) {
    if (!$user) {
        return false;
    }
    
    $role = $user['role'];
    $userFolder = $user['folder'] ?? '';
    
    // ROOT e ADMIN acessam todas as pastas
    if ($role === 'root' || $role === 'admin') {
        return true;
    }
    
    // USER só acessa sua própria pasta
    if ($role === 'user') {
        return $folder === $userFolder;
    }
    
    return false;
}

function createUser($rootUser, $userData) {
    // Apenas ROOT pode criar usuários
    if ($rootUser['role'] !== 'root') {
        return ['success' => false, 'error' => 'Apenas ROOT pode criar usuários'];
    }
    
    $users = loadUsers();
    
    // Verificar se email já existe
    foreach ($users as $user) {
        if ($user['email'] === $userData['email']) {
            return ['success' => false, 'error' => 'Email já cadastrado'];
        }
    }
    
    // Criar novo usuário
    $newUser = [
        'id' => count($users) + 1,
        'email' => $userData['email'],
        'password' => password_hash($userData['password'], PASSWORD_BCRYPT),
        'name' => $userData['name'],
        'role' => $userData['role'] ?? 'user',
        'folder' => $userData['folder'] ?? '',
        'permissions' => [
            'upload' => $userData['role'] === 'user',
            'download' => true,
            'delete' => $userData['role'] !== 'user',
            'view_all' => $userData['role'] !== 'user',
            'manage_users' => false,
            'manage_permissions' => false
        ],
        'createdAt' => date('c'),
        'createdBy' => $rootUser['email']
    ];
    
    $users[] = $newUser;
    saveUsers($users);
    
    return ['success' => true, 'user' => $newUser];
}

function deleteUser($rootUser, $userId) {
    // Apenas ROOT pode deletar usuários
    if ($rootUser['role'] !== 'root') {
        return ['success' => false, 'error' => 'Apenas ROOT pode deletar usuários'];
    }
    
    $users = loadUsers();
    
    // Não permitir deletar o próprio ROOT
    foreach ($users as $key => $user) {
        if ($user['id'] == $userId) {
            if ($user['role'] === 'root') {
                return ['success' => false, 'error' => 'Não é possível deletar o usuário ROOT'];
            }
            unset($users[$key]);
            break;
        }
    }
    
    $users = array_values($users); // Reindexar array
    saveUsers($users);
    
    return ['success' => true];
}

function updateUserPermissions($rootUser, $userId, $permissions) {
    // Apenas ROOT pode editar permissões
    if ($rootUser['role'] !== 'root') {
        return ['success' => false, 'error' => 'Apenas ROOT pode editar permissões'];
    }
    
    $users = loadUsers();
    
    foreach ($users as $key => $user) {
        if ($user['id'] == $userId) {
            // Não permitir editar ROOT
            if ($user['role'] === 'root') {
                return ['success' => false, 'error' => 'Não é possível editar permissões do ROOT'];
            }
            
            $users[$key]['permissions'] = array_merge($users[$key]['permissions'], $permissions);
            saveUsers($users);
            
            return ['success' => true, 'user' => $users[$key]];
        }
    }
    
    return ['success' => false, 'error' => 'Usuário não encontrado'];
}
?>
```

---

## 📝 Exemplos de Uso

### **Upload (upload.php):**
```php
// Verificar permissão de upload
if (!hasPermission($user, 'upload', $folder)) {
    http_response_code(403);
    echo json_encode(['error' => 'Sem permissão para upload']);
    exit;
}

// Verificar acesso à pasta
if (!canAccessFolder($user, $folder)) {
    http_response_code(403);
    echo json_encode(['error' => 'Sem acesso a esta pasta']);
    exit;
}
```

### **Delete (delete.php):**
```php
// Verificar permissão de delete
if (!hasPermission($user, 'delete', $folder)) {
    http_response_code(403);
    echo json_encode(['error' => 'Sem permissão para deletar']);
    exit;
}
```

### **Listar Usuários (users.php):**
```php
// Apenas ROOT pode listar usuários
if ($user['role'] !== 'root') {
    http_response_code(403);
    echo json_encode(['error' => 'Apenas ROOT pode listar usuários']);
    exit;
}

$users = loadUsers();
// Remover senhas antes de retornar
foreach ($users as &$u) {
    unset($u['password']);
}
echo json_encode(['users' => $users]);
```

### **Criar Usuário (create-user.php):**
```php
$result = createUser($user, [
    'email' => $_POST['email'],
    'password' => $_POST['password'],
    'name' => $_POST['name'],
    'role' => $_POST['role'],
    'folder' => $_POST['folder']
]);

echo json_encode($result);
```

---

## 🎨 Interface React - Diferenciação por Role

### **Componente Database.tsx:**

```tsx
// Mostrar botão "Gerenciar Usuários" apenas para ROOT
{user.role === 'root' && (
  <button onClick={() => setShowUserManagement(true)}>
    Gerenciar Usuários
  </button>
)}

// Esconder botão "Deletar" para USER
{user.role !== 'user' && (
  <button onClick={handleDelete}>
    Deletar
  </button>
)}

// Mostrar apenas pastas permitidas
{user.role === 'user' ? (
  <FolderList folders={[user.folder]} />
) : (
  <FolderList folders={allFolders} />
)}
```

---

## ✅ Resumo das Permissões

| Ação | ROOT | ADMIN | USER |
|------|------|-------|------|
| Upload (própria pasta) | ✅ | ✅ | ✅ |
| Upload (outras pastas) | ✅ | ✅ | ❌ |
| Download (própria pasta) | ✅ | ✅ | ✅ |
| Download (outras pastas) | ✅ | ✅ | ❌ |
| Delete (própria pasta) | ✅ | ✅ | ❌ |
| Delete (outras pastas) | ✅ | ✅ | ❌ |
| Visualizar todas pastas | ✅ | ✅ | ❌ |
| Criar usuários | ✅ | ❌ | ❌ |
| Deletar usuários | ✅ | ❌ | ❌ |
| Editar permissões | ✅ | ❌ | ❌ |

---

## 🚀 Próximos Passos

1. ✅ Implementar sistema de permissões
2. ✅ Criar interface de gerenciamento de usuários (apenas ROOT)
3. ✅ Atualizar componentes React
4. ✅ Criar pastas no Google Drive para cada USER
5. ✅ Testar com diferentes níveis de acesso

