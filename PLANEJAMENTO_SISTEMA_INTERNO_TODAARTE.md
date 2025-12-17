# 📊 Planejamento - Sistema Interno Toda Arte

## 🎯 Objetivo
Criar um sistema interno completo para gerenciamento da Toda Arte, acessível em `todaarte.com.br/sistema-interno`

---

## 🏗️ Arquitetura Proposta

### Estrutura de Rotas
```
todaarte.com.br/
├── /                    # Site institucional (já existe)
├── /gruporaca           # Sistema Grupo Raça (já existe)
└── /sistema-interno     # 🆕 Sistema Interno Toda Arte
    ├── /dashboard       # Painel principal
    ├── /financeiro      # Controle financeiro
    ├── /projetos        # Gestão de projetos
    ├── /clientes        # CRM de clientes
    └── /configuracoes   # Configurações do sistema
```

### Tecnologias
- **Frontend**: React + TypeScript + Tailwind CSS (mesma stack do Grupo Raça)
- **Backend**: PHP + MySQL (reutilizar API existente ou criar nova)
- **Autenticação**: Sistema de sessões (mesmo padrão do Grupo Raça)
- **Banco de Dados**: MySQL na Hostinger (mesmo servidor)

---

## 📋 Módulos a Implementar

### 1. 🔐 Autenticação e Usuários
- [x] Login/Logout
- [x] Gerenciamento de usuários
- [x] Níveis de acesso (Admin, Usuário, Cliente)
- [ ] Recuperação de senha

### 2. 💰 Controle Financeiro
**Requisitos definidos:**
- [ ] **Cadastro de Prestadores de Serviço**
  - Nome, contato, dados bancários
  - Histórico de pagamentos
  
- [ ] **Pagamentos Fixos da Empresa**
  - Despesas recorrentes (aluguel, salários, etc.)
  - Controle mensal
  
- [ ] **Pagamentos Variáveis**
  - Despesas esporádicas
  - Categorização
  
- [ ] **Controle de Entrada e Saída Geral**
  - Visão consolidada da empresa
  - Gráficos e relatórios
  
- [ ] **Controle Financeiro por Cliente** ⭐
  - Cada cliente tem seu próprio controle
  - Serviços prestados mediante demanda
  - Fechamento mensal
  
- [ ] **Registro de Serviços por Cliente**
  - Identificação do serviço
  - Valor
  - Observações
  - Responsável (Lara, prestador, ou cliente)
  - Data
  
- [ ] **Relatório Mensal por Cliente** ⭐
  - Prestação de contas
  - Lista de serviços realizados
  - Valor total a pagar
  - Exportação (PDF)

### 3. 📁 Gestão de Projetos (Trello-like)
**Requisitos definidos:**
- [ ] **Sistema de Quadros (Kanban)**
  - Ana agenda os trabalhos
  - Lara e cliente visualizam tarefas
  - Marcar como concluído
  
- [ ] **Colunas de Status**
  - A fazer
  - Em andamento
  - Concluído
  
- [ ] **Informações das Tarefas**
  - Título
  - Descrição
  - Responsável
  - Prazo
  - Cliente relacionado
  
- [ ] **Área do Cliente** ⭐
  - Cliente acessa e visualiza:
    - O que está sendo feito
    - O que já foi concluído
    - O que ainda vai ser feito
  - Acesso restrito apenas aos projetos do cliente

### 4. 📊 Dashboard
- [ ] Visão geral financeira
- [ ] Projetos em andamento
- [ ] Gráficos de receita/despesa
- [ ] Indicadores (KPIs)
- [ ] Tarefas pendentes

### 5. ⚙️ Configurações
- [ ] Perfil da empresa
- [ ] Configurações gerais
- [ ] Gerenciamento de usuários

---

## ❓ Informações Necessárias

### Para o Módulo Financeiro:
1. **Quais tipos de transações você precisa controlar?**
   - Receitas (vendas, serviços, etc.)
   - Despesas (fornecedores, salários, etc.)
   - Outros?

2. **Quais categorias de receitas/despesas?**
   - Exemplo: Desenvolvimento Web, Marketing, Infraestrutura, etc.

3. **Precisa de controle de contas bancárias?**
   - Múltiplas contas?
   - Conciliação bancária?

4. **Relatórios necessários:**
   - DRE (Demonstrativo de Resultados)?
   - Fluxo de caixa?
   - Balanço?
   - Outros?

5. **Integração com outros sistemas?**
   - Contabilidade?
   - Bancos?
   - Nota fiscal eletrônica?

### Para o Módulo de Projetos:
1. **Quais informações cada projeto deve ter?**
   - Nome, cliente, valor, status, prazo?
   - Outros campos?

2. **Quais status de projeto?**
   - Exemplo: Proposta, Em andamento, Concluído, Cancelado

3. **Precisa de controle de tempo/horas trabalhadas?**

### Para o CRM:
1. **Quais informações de clientes?**
   - Dados básicos, contatos, histórico?
   - Outros?

2. **Precisa de controle de propostas comerciais?**

---

## 🗄️ Estrutura de Banco de Dados

```sql
-- Usuários (reutilizar estrutura do Grupo Raça ou criar nova)
users                    # Usuários do sistema (Ana, Lara, Clientes)
  - id
  - email
  - password
  - name
  - role (admin, user, client)
  - client_id (se for cliente, relaciona com clients)

-- Clientes
clients                  # Clientes da Toda Arte
  - id
  - name
  - email
  - phone
  - company
  - created_at

-- Prestadores de Serviço
service_providers        # Prestadores externos
  - id
  - name
  - email
  - phone
  - bank_account
  - notes
  - active
  - created_at

-- Pagamentos Fixos
fixed_payments           # Despesas fixas recorrentes
  - id
  - name
  - description
  - amount
  - due_day (dia do mês)
  - category
  - active
  - created_at

-- Transações Financeiras Gerais
transactions             # Entradas e saídas gerais
  - id
  - type (income, expense)
  - amount
  - description
  - category
  - date
  - payment_method
  - created_by
  - created_at

-- Serviços por Cliente
client_services          # Serviços prestados para cada cliente
  - id
  - client_id
  - service_name
  - description
  - amount
  - performed_by (lara, provider_id, client)
  - provider_id (se foi prestador)
  - date
  - month (mês de referência)
  - year (ano de referência)
  - status (pending, invoiced, paid)
  - created_at

-- Projetos
projects                 # Projetos dos clientes
  - id
  - client_id
  - name
  - description
  - status (active, completed, archived)
  - created_by
  - created_at
  - updated_at

-- Tarefas (Trello-like)
tasks                    # Tarefas dos projetos
  - id
  - project_id
  - title
  - description
  - status (todo, in_progress, done)
  - assigned_to (user_id)
  - due_date
  - position (ordem no quadro)
  - created_by
  - created_at
  - updated_at
```

---

## 🚀 Próximos Passos

1. ✅ **Coletar informações** sobre os módulos necessários
2. ⏳ **Definir estrutura** do banco de dados
3. ⏳ **Criar rotas** no React Router
4. ⏳ **Desenvolver API** PHP para cada módulo
5. ⏳ **Implementar frontend** React
6. ⏳ **Testes** e ajustes
7. ⏳ **Deploy** na Hostinger

---

## 📝 Notas

- Sistema será separado do Grupo Raça, mas pode reutilizar:
  - Sistema de autenticação
  - Estrutura de API
  - Padrões de código

- Acesso será restrito (apenas usuários autenticados)

- Design será consistente com o site da Toda Arte

---

**Status**: 🟢 Requisitos definidos - Iniciando desenvolvimento

## 🎯 Fase Atual: Protótipo com Dados Fictícios

Criando sistema completo com dados fictícios para teste e aprovação da cliente antes da implementação final.

