# 👥 Lista de Usuários e Pastas - Google Drive

## 📋 Usuários Definidos no Sistema

Esta lista contém os usuários que já estão ou serão criados no sistema. Use esta lista para criar as pastas correspondentes no Google Drive.

---

## 🔴 ROOT (Super Admin)

| Nome | Email | Pasta no Drive | Permissões |
|------|-------|----------------|------------|
| **Marcus Lopes** | `marcus@gruporaca.com.br` | `*` (todas) | Total |

**Nota:** ROOT tem acesso a todas as pastas, não precisa de pasta específica.

---

## 🟡 ADMIN (Acesso Total)

| Nome | Email | Pasta no Drive | Permissões |
|------|-------|----------------|------------|
| **Thaty** | `thaty@gruporaca.com.br` | `*` (todas) | Upload/Download/Delete |
| **Lara** | `lara@gruporaca.com.br` | `*` (todas) | Upload/Download/Delete |
| **Ana Beatriz** | `ana@gruporaca.com.br` | `*` (todas) | Upload/Download/Delete |
| **Larissa Mendes** | `larissa@gruporaca.com.br` | `*` (todas) | Upload/Download/Delete |
| **Ariane Andrade** | `ariane@gruporaca.com.br` | `*` (todas) | Upload/Download/Delete |
| **Toda Arte Marketing** | `marketing@gruporaca.com.br` | `*` (todas) | Upload/Download/Delete |

**Nota:** ADMIN também tem acesso a todas as pastas, mas pode ter pastas específicas para organização.

---

## 🟢 USER (Acesso Restrito)

### 📸 Fotógrafos

| Nome | Email | Pasta no Drive | Permissões |
|------|-------|----------------|------------|
| **Fotógrafo** | `fotografo@gruporaca.com.br` | `fotografos/` | Upload/Download |

**Estrutura sugerida:**
```
fotografos/
├── leilao-2024-01/
├── leilao-2024-02/
└── ...
```

---

### 📄 Responsáveis por Catálogos

| Nome | Email | Pasta no Drive | Permissões |
|------|-------|----------------|------------|
| **Responsável Catálogo 1** | `catalogo1@gruporaca.com.br` | `catalogos/responsavel-1/` | Upload/Download |
| **Responsável Catálogo 2** | `catalogo2@gruporaca.com.br` | `catalogos/responsavel-2/` | Upload/Download |

**Estrutura sugerida:**
```
catalogos/
├── responsavel-1/
├── responsavel-2/
└── ...
```

**Nota:** Adicione mais responsáveis conforme necessário.

---

### 📱 Mídias Sociais

| Nome | Email | Pasta no Drive | Permissões |
|------|-------|----------------|------------|
| **De Olho no Marchador** | `deolhonomarchador@gruporaca.com.br` | `midias/de-olho-no-marchador/` | Upload/Download |
| **Top Marchador** | `topmarchador@gruporaca.com.br` | `midias/top-marchador/` | Upload/Download |
| **Aqui Tem Raça** | `aquitemraca@gruporaca.com.br` | `midias/aqui-tem-raca/` | Upload/Download |
| **Raça e Marcha** | `racaemarcha@gruporaca.com.br` | `midias/raca-e-marcha/` | Upload/Download |
| **Portal Marchador** | `portalmarchador@gruporaca.com.br` | `midias/portal-marchador/` | Upload/Download |
| **Pura Marcha** | `puramarcha@gruporaca.com.br` | `midias/pura-marcha/` | Upload/Download |

**Estrutura sugerida:**
```
midias/
├── de-olho-no-marchador/
├── top-marchador/
├── aqui-tem-raca/
├── raca-e-marcha/
├── portal-marchador/
└── pura-marcha/
```

---

## 📁 Estrutura Completa de Pastas no Google Drive

```
Google Drive (Conta Grupo Raça)
│
└── 📁 GRUPO_RACA/                    # Pasta Raiz
    │
    ├── 📁 marketing/                 # ADMIN: Toda Arte Marketing
    │   ├── 📁 leiloes/
    │   ├── 📁 redes-sociais/
    │   └── 📁 campanhas/
    │
    ├── 📁 fotografos/                # USER: Fotógrafos
    │   ├── 📁 leilao-2024-01/
    │   ├── 📁 leilao-2024-02/
    │   └── 📁 ...
    │
    ├── 📁 catalogos/                  # USER: Responsáveis por Catálogos
    │   ├── 📁 responsavel-1/
    │   ├── 📁 responsavel-2/
    │   └── 📁 ...
    │
    └── 📁 midias/                     # USER: Mídias Sociais
        ├── 📁 de-olho-no-marchador/
        ├── 📁 top-marchador/
        ├── 📁 aqui-tem-raca/
        ├── 📁 raca-e-marcha/
        ├── 📁 portal-marchador/
        └── 📁 pura-marcha/
```

---

## ✅ Checklist de Criação de Pastas

### Pastas Principais (Criar Agora)
- [ ] `GRUPO_RACA/` (pasta raiz)
- [ ] `marketing/`
- [ ] `fotografos/`
- [ ] `catalogos/`
- [ ] `midias/`

### Subpastas de Mídias (Criar Agora)
- [ ] `midias/de-olho-no-marchador/`
- [ ] `midias/top-marchador/`
- [ ] `midias/aqui-tem-raca/`
- [ ] `midias/raca-e-marcha/`
- [ ] `midias/portal-marchador/`
- [ ] `midias/pura-marcha/`

### Subpastas de Catálogos (Criar quando necessário)
- [ ] `catalogos/responsavel-1/` (quando criar o usuário)
- [ ] `catalogos/responsavel-2/` (quando criar o usuário)

### Subpastas de Fotógrafos (Criar quando necessário)
- [ ] `fotografos/leilao-2024-01/` (quando houver leilão)
- [ ] `fotografos/leilao-2024-02/` (quando houver leilão)

---

## 📝 Notas Importantes

1. **Pastas de ADMIN**: Os ADMINs têm acesso a todas as pastas, mas a pasta `marketing/` é específica para a Toda Arte Marketing.

2. **Pastas de USER**: Cada USER só acessa sua pasta específica. As pastas serão criadas pelo ROOT quando criar o usuário.

3. **Nomenclatura**: Use letras minúsculas e hífens para separar palavras (ex: `de-olho-no-marchador`).

4. **Compartilhamento**: Apenas a pasta raiz `GRUPO_RACA/` precisa ser compartilhada com a Service Account. As subpastas herdam as permissões.

---

## 🔄 Adicionar Novos Usuários

Quando precisar adicionar novos usuários:

1. **ROOT cria o usuário** no sistema (via interface ou banco de dados)
2. **ROOT cria a pasta** no Google Drive (se for USER)
3. **Sistema mapeia** o usuário para a pasta automaticamente

**Exemplo:**
- Criar usuário: `novo-fotografo@gruporaca.com.br` (role: USER)
- Criar pasta: `fotografos/novo-fotografo/`
- Configurar no sistema: `folder = 'fotografos/novo-fotografo/'`

---

**Última atualização**: Dezembro 2024

