# 📊 Sistema de Banco de Dados - Grupo Raça
## Apresentação para Cliente

---

## 🎯 Visão Geral

Sistema de gerenciamento de arquivos integrado ao site do Grupo Raça, permitindo upload, organização e acesso controlado a materiais de marketing, fotos de leilões, catálogos e mídias sociais.

---

## 💾 Sistema de Armazenamento

### **Google Drive - Solução Escolhida**

**Por quê Google Drive?**
- ✅ **Interface familiar** - Todos já conhecem e usam
- ✅ **Backup automático** - Google cuida da segurança dos arquivos
- ✅ **Acesso multiplataforma** - Web, mobile e desktop
- ✅ **Escalável** - Fácil aumentar espaço conforme necessário
- ✅ **Integração segura** - Arquivos gerenciados via site, com controle total de permissões

**Como funciona:**
- Arquivos são armazenados no Google Drive
- Acesso e gerenciamento são feitos **exclusivamente pelo site**
- Usuários **não acessam o Drive diretamente**
- Controle total de permissões e segurança

---

## 💰 Investimento

| Plano | Espaço | Valor Mensal |
|-------|--------|--------------|
| **Inicial** | 100GB | **R$ 8,50/mês** |
| **Crescimento** | 200GB | **R$ 12,50/mês** |
| **Alto Volume** | 2TB | **R$ 35,00/mês** |

**Recomendação:** Começar com 100GB (R$ 8,50/mês) e aumentar conforme necessário.

---

## 🔐 Sistema de Acesso - 3 Níveis

### **1. ROOT (Super Administrador)**
**Usuário:**
- **Marcus Lopes**

**Permissões:**
- ✅ Acesso total a todas as pastas
- ✅ Criar novos usuários no sistema
- ✅ Definir permissões de cada usuário
- ✅ Deletar usuários
- ✅ Upload, Download e Delete em todas as pastas
- ✅ Visualizar todos os arquivos

**Responsabilidades:**
- Gerenciar usuários do sistema
- Criar pastas para novos usuários
- Configurar permissões de acesso

---

### **2. ADMIN (Administradores)**
**Usuários:**
- **Thaty**
- **Lara**
- **Ana Beatriz**
- **Larissa Mendes**
- **Ariane Andrade**

**Permissões:**
- ✅ Acesso a **todas as pastas** do Banco de Dados
- ✅ Upload de arquivos em qualquer pasta
- ✅ Download de qualquer arquivo
- ✅ Deletar arquivos de qualquer pasta
- ✅ Visualizar todos os arquivos
- ❌ Não pode criar/deletar usuários
- ❌ Não pode alterar permissões

**Uso:**
- Acesso completo para gerenciar todos os materiais
- Organização e manutenção de arquivos
- Suporte aos usuários quando necessário

---

### **3. USER (Usuários)**
**Tipos de Usuários:**
- **Fotógrafos** (múltiplos usuários)
- **Responsáveis pelos Catálogos** (múltiplos usuários)
- **Mídias** (um usuário para cada perfil de mídia)

**Permissões:**
- ✅ Acesso **apenas à sua pasta** (criada pelo ROOT)
- ✅ Upload de arquivos na sua pasta
- ✅ Download dos seus arquivos
- ✅ Visualizar apenas seus arquivos
- ❌ **Não pode deletar** (nem os próprios arquivos - por segurança)
- ❌ Não pode acessar outras pastas
- ❌ Não pode criar/deletar usuários

**Segurança:**
- Cada usuário tem sua pasta exclusiva
- Não podem ver ou acessar arquivos de outros usuários
- Proteção contra exclusão acidental (não podem deletar)

---

## 📁 Estrutura de Pastas

```
Google Drive (Conta Grupo Raça)
├── 📁 marketing/              # Materiais de marketing
├── 📁 fotografos/            # Fotos de leilões
│   ├── fotografo-1/
│   ├── fotografo-2/
│   └── ...
├── 📁 catalogos/             # Catálogos
│   ├── responsavel-1/
│   ├── responsavel-2/
│   └── ...
└── 📁 midias/                # Mídias sociais
    ├── perfil-midia-1/
    ├── perfil-midia-2/
    └── ...
```

**Observação:** Cada USER terá sua pasta individual criada pelo ROOT.

---

## 🎨 Funcionalidades do Sistema

### **Para Todos os Usuários:**
- ✅ **Login seguro** no site
- ✅ **Upload de arquivos** (fotos, vídeos, PDFs)
- ✅ **Visualização** de arquivos
- ✅ **Download** de arquivos
- ✅ **Busca** por nome de arquivo
- ✅ **Organização** por pastas

### **Apenas ADMIN e ROOT:**
- ✅ Acesso a todas as pastas
- ✅ Deletar arquivos
- ✅ Organizar arquivos de todos os usuários

### **Apenas ROOT:**
- ✅ Criar novos usuários
- ✅ Definir permissões
- ✅ Deletar usuários
- ✅ Gerenciar estrutura de pastas

---

## 🔒 Segurança

1. **Autenticação:**
   - Login seguro com senha criptografada
   - Sessões com timeout automático

2. **Permissões:**
   - Cada usuário vê apenas o que tem permissão
   - Validação de permissões em cada ação

3. **Proteção de Dados:**
   - Usuários USER não podem deletar arquivos (proteção contra exclusão acidental)
   - Backup automático pelo Google Drive
   - Arquivos armazenados de forma segura na nuvem

4. **Controle de Acesso:**
   - Acesso ao Google Drive apenas via site (não direto)
   - Controle total de quem acessa o quê

---

## 📊 Benefícios

### **Para a Empresa:**
- ✅ **Organização centralizada** de todos os materiais
- ✅ **Controle de acesso** por perfil de usuário
- ✅ **Segurança** - backup automático
- ✅ **Escalável** - fácil adicionar usuários e espaço
- ✅ **Custo baixo** - R$ 8,50/mês para começar

### **Para os Usuários:**
- ✅ **Interface simples** e familiar
- ✅ **Acesso rápido** aos arquivos
- ✅ **Upload fácil** de materiais
- ✅ **Organização automática** por pastas
- ✅ **Acesso de qualquer lugar** (web, mobile)

### **Para os Administradores:**
- ✅ **Visão completa** de todos os materiais
- ✅ **Controle total** de organização
- ✅ **Fácil gerenciamento** de usuários (ROOT)
- ✅ **Histórico** de uploads e modificações

---

## 🚀 Implementação

### **Fase 1: Configuração Inicial**
- Configuração da conta Google Drive
- Criação da estrutura de pastas
- Configuração do sistema de permissões

### **Fase 2: Cadastro de Usuários**
- Cadastro dos usuários ADMIN
- Cadastro dos usuários USER (conforme informações coletadas)
- Criação de pastas individuais para cada USER

### **Fase 3: Treinamento**
- Treinamento dos usuários ADMIN
- Treinamento dos usuários USER
- Documentação de uso

### **Fase 4: Go Live**
- Sistema disponível para uso
- Suporte inicial
- Ajustes conforme necessidade

---

## 📋 Checklist de Informações Necessárias

Para implementação completa, precisamos:

- [ ] **Lista completa de Fotógrafos** (nomes e emails)
- [ ] **Lista completa de Responsáveis pelos Catálogos** (nomes e emails)
- [ ] **Lista completa de perfis de Mídia** (nomes e emails)
- [ ] **Emails dos usuários ADMIN** (Thaty, Lara, Ana Beatriz, Larissa, Ariane)
- [ ] **Email do ROOT** (Marcus Lopes)
- [ ] **Definição de senhas iniciais** (ou se preferem definir no primeiro acesso)

---

## 💡 Próximos Passos

1. **Aprovação da estratégia** pela cliente
2. **Coleta de informações** dos usuários
3. **Configuração técnica** do sistema
4. **Cadastro de usuários**
5. **Treinamento e lançamento**

---

## ❓ Dúvidas Frequentes

**P: Os usuários precisam ter conta Google?**
R: Não. O acesso é feito exclusivamente pelo site, usando login próprio do sistema.

**P: O que acontece se um usuário USER deletar um arquivo por engano?**
R: Usuários USER não podem deletar arquivos (nem os próprios). Apenas ADMIN e ROOT podem deletar, garantindo segurança.

**P: Como adicionar novos usuários?**
R: O ROOT (Marcus Lopes) pode criar novos usuários a qualquer momento pelo painel administrativo.

**P: E se precisar de mais espaço?**
R: Basta fazer upgrade do plano Google Drive. O processo é simples e rápido.

**P: Os arquivos ficam seguros?**
R: Sim. Os arquivos ficam no Google Drive com backup automático, e o acesso é controlado pelo sistema de permissões.

---

## 📞 Contato

Para dúvidas ou sugestões sobre o sistema, entre em contato com a equipe de desenvolvimento.

---

**Documento criado em:** Janeiro 2024  
**Versão:** 1.0

