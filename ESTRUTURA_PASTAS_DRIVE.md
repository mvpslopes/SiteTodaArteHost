# 📂 Estrutura de Pastas - Google Drive Grupo Raça

## 🎯 Visão Geral

Esta é a estrutura recomendada de pastas no Google Drive dedicado do Grupo Raça. Cada pasta tem um propósito específico e permissões definidas.

---

## 📁 Estrutura Completa

```
Google Drive (Conta Grupo Raça)
│
├── 📁 GRUPO_RACA/                    # Pasta Raiz (compartilhada com Service Account)
│   │
│   ├── 📁 marketing/                 # ADMIN: Toda Arte Marketing
│   │   ├── 📁 leiloes/              # Materiais de leilões
│   │   │   ├── 📁 leilao-2024-01/
│   │   │   ├── 📁 leilao-2024-02/
│   │   │   └── 📁 ...
│   │   ├── 📁 redes-sociais/        # Posts e artes para redes sociais
│   │   │   ├── 📁 instagram/
│   │   │   ├── 📁 facebook/
│   │   │   └── 📁 ...
│   │   └── 📁 campanhas/            # Campanhas publicitárias
│   │       ├── 📁 campanha-2024-01/
│   │       └── 📁 ...
│   │
│   ├── 📁 fotografos/                # USER: Fotógrafos
│   │   ├── 📁 leilao-2024-01/       # Fotos do leilão 1
│   │   │   ├── 📄 foto-001.jpg
│   │   │   ├── 📄 foto-002.jpg
│   │   │   └── 📄 ...
│   │   ├── 📁 leilao-2024-02/       # Fotos do leilão 2
│   │   └── 📁 ...
│   │
│   ├── 📁 catalogos/                 # USER: Responsáveis por Catálogos
│   │   ├── 📁 responsavel-1/         # Catálogos do responsável 1
│   │   │   ├── 📄 catalogo-leilao-01.pdf
│   │   │   ├── 📄 catalogo-leilao-02.pdf
│   │   │   └── 📄 ...
│   │   ├── 📁 responsavel-2/        # Catálogos do responsável 2
│   │   └── 📁 ...
│   │
│   └── 📁 midias/                    # USER: Mídias Sociais
│       ├── 📁 de-olho-no-marchador/  # De Olho no Marchador
│       │   ├── 📄 post-001.jpg
│       │   ├── 📄 post-002.jpg
│       │   └── 📄 ...
│       ├── 📁 top-marchador/         # Top Marchador
│       ├── 📁 aqui-tem-raca/        # Aqui Tem Raça
│       ├── 📁 raca-e-marcha/        # Raça e Marcha
│       ├── 📁 portal-marchador/     # Portal Marchador
│       └── 📁 pura-marcha/           # Pura Marcha
```

---

## 👥 Permissões por Pasta

### ROOT (Super Admin)
- ✅ Acesso a **TODAS** as pastas
- ✅ Criar/Deletar pastas e arquivos
- ✅ Gerenciar usuários do sistema

### ADMIN (Toda Arte Marketing, Larissa, Ariane)
- ✅ Acesso a **TODAS** as pastas
- ✅ Upload/Download/Delete em qualquer pasta
- ❌ Não pode gerenciar usuários

### USER (Fotógrafos, Catálogos, Mídias)
- ✅ Acesso **APENAS** à sua pasta específica
- ✅ Upload/Download na sua pasta
- ❌ **NÃO pode deletar** (nem próprios arquivos)
- ❌ Não pode acessar outras pastas

---

## 📋 Mapeamento de Usuários para Pastas

| Usuário | Email | Pasta | Permissões |
|---------|-------|-------|------------|
| **ROOT** | `root@gruporaca.com.br` | `*` (todas) | Total |
| **ADMIN** | `marketing@gruporaca.com.br` | `*` (todas) | Upload/Download/Delete |
| **ADMIN** | `larissa@gruporaca.com.br` | `*` (todas) | Upload/Download/Delete |
| **ADMIN** | `ariane@gruporaca.com.br` | `*` (todas) | Upload/Download/Delete |
| **USER** | `fotografo@gruporaca.com.br` | `fotografos/` | Upload/Download |
| **USER** | `catalogo1@gruporaca.com.br` | `catalogos/responsavel-1/` | Upload/Download |
| **USER** | `deolhonomarchador@gruporaca.com.br` | `midias/de-olho-no-marchador/` | Upload/Download |
| **USER** | `topmarchador@gruporaca.com.br` | `midias/top-marchador/` | Upload/Download |
| **USER** | `aquitemraca@gruporaca.com.br` | `midias/aqui-tem-raca/` | Upload/Download |
| **USER** | `racaemarcha@gruporaca.com.br` | `midias/raca-e-marcha/` | Upload/Download |
| **USER** | `portalmarchador@gruporaca.com.br` | `midias/portal-marchador/` | Upload/Download |
| **USER** | `puramarcha@gruporaca.com.br` | `midias/pura-marcha/` | Upload/Download |

---

## 🚀 Como Criar as Pastas

### Opção 1: Criar Manualmente no Google Drive
1. Acesse o Google Drive da conta dedicada
2. Crie a pasta raiz `GRUPO_RACA`
3. Dentro dela, crie as subpastas conforme a estrutura acima
4. **IMPORTANTE**: Compartilhe a pasta raiz `GRUPO_RACA` com a Service Account (permissão Editor)

### Opção 2: Criar via Sistema (Futuro)
- O sistema poderá criar pastas automaticamente quando:
  - ROOT criar um novo usuário USER
  - ROOT criar uma nova pasta manualmente
  - ADMIN solicitar criação de subpasta

---

## 📝 Convenções de Nomenclatura

### Pastas
- Use **letras minúsculas** e **hífens** para separar palavras
- Exemplos: `de-olho-no-marchador`, `raca-e-marcha`
- Evite espaços e caracteres especiais

### Arquivos
- Use nomes descritivos
- Inclua data quando relevante: `leilao-2024-01-15.pdf`
- Mantenha extensões originais: `.jpg`, `.png`, `.pdf`, `.mp4`

---

## 🔄 Sincronização com Sistema

### Como Funciona
1. **Sistema → Drive**: Quando usuário faz upload, arquivo vai para a pasta correspondente no Drive
2. **Drive → Sistema**: Sistema lista arquivos do Drive baseado na pasta do usuário
3. **Permissões**: Sistema valida permissões antes de permitir acesso

### IDs das Pastas
- Cada pasta no Google Drive tem um **ID único**
- O sistema armazenará o mapeamento: `usuário → folder_id`
- Exemplo: `fotografo@gruporaca.com.br` → `1a2b3c4d5e6f7g8h9i0j`

---

## ✅ Checklist de Criação

- [ ] Criar pasta raiz `GRUPO_RACA` no Google Drive
- [ ] Criar subpasta `marketing/`
- [ ] Criar subpasta `fotografos/`
- [ ] Criar subpasta `catalogos/`
- [ ] Criar subpasta `midias/`
- [ ] Criar subpastas dentro de `midias/` para cada mídia social
- [ ] Compartilhar pasta raiz com Service Account (Editor)
- [ ] Anotar ID da pasta raiz para configuração
- [ ] Testar acesso via Service Account

---

**Última atualização**: Dezembro 2024

