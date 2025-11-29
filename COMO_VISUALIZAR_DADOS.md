# 📊 Como Visualizar os Dados do Site

## 🚀 Passo a Passo Completo

### 1️⃣ Criar Conta no Google Analytics

1. Acesse: **https://analytics.google.com/**
2. Faça login com sua conta Google (ou crie uma)
3. Clique em **"Começar a medir"** ou **"Administrador"** (ícone de engrenagem)
4. Se for primeira vez, clique em **"Criar propriedade"**

### 2️⃣ Configurar Propriedade

1. **Nome da propriedade**: `Toda Arte Site`
2. **Fuso horário**: `(GMT-03:00) Brasília`
3. **Moeda**: `Real brasileiro (BRL)`
4. Clique em **"Avançar"**

### 3️⃣ Criar Fluxo de Dados (Data Stream)

1. Clique em **"Fluxos de dados"** → **"Adicionar fluxo"** → **"Web"**
2. Preencha:
   - **URL do site**: `https://todaarte.com.br`
   - **Nome do fluxo**: `Website Toda Arte`
3. Clique em **"Criar fluxo"**
4. **COPIE A MEASUREMENT ID** (formato: `G-XXXXXXXXXX`)

### 4️⃣ Adicionar no Projeto

1. Na raiz do projeto, crie/edite o arquivo `.env`
2. Adicione:
   ```env
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
   (Cole sua Measurement ID real aqui)

3. Reinicie o servidor:
   ```bash
   npm run dev
   ```

### 5️⃣ Verificar se Está Funcionando

1. Abra o site no navegador
2. Abra o Console (F12 → Console)
3. Você verá mensagens de verificação do Analytics
4. Se aparecer ✅, está funcionando!

---

## 📈 ONDE VISUALIZAR OS DADOS

### 🏠 Página Inicial (Home)

**Acesse**: https://analytics.google.com/ → Selecione sua propriedade

**O que você vê**:
- 👥 Visitantes no momento (tempo real)
- 📊 Total de sessões hoje
- 📄 Páginas mais visitadas
- 📍 Principais fontes de tráfego

---

### ⚡ RELATÓRIO EM TEMPO REAL (Melhor para Verificar Agora!)

**Acesse**: Menu lateral → **Realtime**

**O que você vê**:
- ✅ Visitantes ativos AGORA
- 📄 Páginas sendo visualizadas neste momento
- 📍 Localização geográfica
- 🔗 Origem do tráfego
- ⏱️ Quando acessaram

**Dica**: Use este relatório para verificar se está funcionando! Acesse o site e veja aparecer aqui.

---

### 📊 RELATÓRIOS PRINCIPAIS

#### 1. Engajamento → Eventos
**Acesse**: Menu → Relatórios → Engajamento → Eventos

**O que você vê**:
- 🔔 Todos os eventos customizados
- 📱 Cliques no botão WhatsApp
- 📧 Envios do formulário de contato
- 🔐 Logins de usuários
- 👆 Cliques em botões importantes

#### 2. Aquisição → Visão Geral
**Acesse**: Menu → Relatórios → Aquisição → Visão geral

**O que você vê**:
- 🔍 **De onde vêm os visitantes**:
  - Google (busca orgânica)
  - Direto (digitou o endereço)
  - Redes sociais (Facebook, Instagram, etc.)
  - Links externos
  - Campanhas

#### 3. Usuários → Visão Geral
**Acesse**: Menu → Relatórios → Usuários → Visão geral

**O que você vê**:
- 📱 Dispositivos (desktop, mobile, tablet)
- 🌍 Localização geográfica (cidades, estados, países)
- 🖥️ Navegadores usados
- 👥 Novos vs retornantes
- 📈 Gráficos de crescimento

#### 4. Engajamento → Páginas e telas
**Acesse**: Menu → Relatórios → Engajamento → Páginas e telas

**O que você vê**:
- 📄 Quais páginas são mais visitadas
- ⏱️ Tempo médio em cada página
- 📊 Taxa de rejeição
- 📈 Visualizações ao longo do tempo

---

## 🔍 RELATÓRIOS PERSONALIZADOS

### Análises Exploratórias
**Acesse**: Menu → **Explorar**

**O que você pode fazer**:
- Criar análises personalizadas
- Comparar dados
- Criar segmentos personalizados
- Exportar dados

---

## ⏰ Quando os Dados Aparecem?

- ⚡ **Realtime**: Aparece imediatamente (alguns segundos)
- 📊 **Relatórios padrão**: 24-48 horas para dados completos
- 📈 **Estatísticas históricas**: A partir do momento que você configurou

**Dica**: Use sempre o **Realtime** para verificar se está funcionando!

---

## 🎯 O Que Você Pode Ver

### Números Gerais:
- ✅ Total de visitantes
- ✅ Visitantes únicos
- ✅ Sessões
- ✅ Taxa de rejeição
- ✅ Tempo médio no site
- ✅ Páginas por sessão

### Detalhes de Visitantes:
- ✅ Dispositivos (mobile, desktop, tablet)
- ✅ Navegadores (Chrome, Firefox, Safari, etc.)
- ✅ Sistema operacional
- ✅ Localização (cidade, estado, país)
- ✅ Idioma
- ✅ Resolução de tela

### Comportamento:
- ✅ Quais páginas visitam
- ✅ Quanto tempo ficam em cada página
- ✅ Por onde entram
- ✅ Por onde saem
- ✅ Fluxo de navegação

### Eventos:
- ✅ Cliques no WhatsApp
- ✅ Envios de formulário
- ✅ Logins
- ✅ Downloads
- ✅ Cliques em botões

---

## 📱 APP MOBILE

Você também pode ver os dados pelo app:

1. Instale: **Google Analytics** (iOS ou Android)
2. Faça login com a mesma conta
3. Veja relatórios em tempo real no celular!

---

## 💡 DICAS IMPORTANTES

1. **Primeira vez**: Aguarde alguns minutos após configurar
2. **Realtime é melhor**: Use para verificar se está funcionando
3. **Dados completos**: Leva 24-48h para relatórios detalhados
4. **Histórico**: Dados são salvos para sempre (nunca expiram)
5. **Exportar**: Você pode exportar relatórios em PDF ou Excel

---

## ❓ NÃO ESTÁ APARECENDO DADOS?

### Verifique:

1. ✅ Measurement ID está no arquivo `.env`?
2. ✅ Reiniciou o servidor após adicionar?
3. ✅ Abriu o console do navegador (F12) para verificar erros?
4. ✅ Aguardou alguns minutos? (primeira vez pode demorar)
5. ✅ Está acessando no relatório **Realtime**? (mais rápido)

### Teste Rápido:

1. Abra o site em uma aba anônima
2. Navegue pelo site
3. Clique no WhatsApp
4. Vá para Google Analytics → **Realtime**
5. Você deve ver seu próprio acesso aparecendo!

---

**🎉 Agora você tem acesso a TODOS os dados do seu site, sem ocupar espaço em disco!**

