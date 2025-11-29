# 🔒 Como Resolver o Aviso de "Conexão Insegura"

## O Problema
O aviso aparece porque o site está sendo acessado via **HTTP** ao invés de **HTTPS**.

## ✅ Solução na Hostinger

### 1. Ativar SSL/HTTPS Gratuito
1. Acesse o **painel da Hostinger** (hPanel)
2. Vá em **"Domínios"** → Selecione seu domínio
3. Procure por **"SSL"** ou **"Certificados SSL"**
4. Ative o **SSL gratuito** (Let's Encrypt) se ainda não estiver ativo
5. Aguarde alguns minutos para o certificado ser instalado

### 2. Forçar HTTPS (Redirecionamento Automático)

#### Opção A: Via Painel da Hostinger
1. No painel, vá em **"Avançado"** → **"Redirecionamentos"**
2. Crie um redirecionamento:
   - **Tipo**: 301 (Permanente)
   - **De**: `http://todaarte.com.br`
   - **Para**: `https://todaarte.com.br`
   - **Incluir www**: Marque se usar www ou não

#### Opção B: Via arquivo .htaccess (Já criado)
O arquivo `.htaccess` já foi criado na pasta `public/`. Após fazer o build:

1. Execute `npm run build`
2. O arquivo `.htaccess` deve estar em `dist/.htaccess`
3. Se não estiver, copie manualmente de `public/.htaccess` para `dist/.htaccess`
4. Faça upload da pasta `dist/` completa para a Hostinger

### 3. Verificar Configuração
Após ativar o SSL:
1. Acesse `https://todaarte.com.br` (com https)
2. Verifique se aparece o cadeado verde no navegador
3. Teste se o redirecionamento de HTTP para HTTPS está funcionando

## 📝 Notas Importantes

- ⏱️ A propagação do SSL pode levar de **5 minutos a 24 horas**
- 🔄 Limpe o cache do navegador (Ctrl+Shift+Delete)
- 🌐 Teste em modo anônimo/privado
- ✅ O certificado SSL gratuito da Hostinger renova automaticamente

## 🆘 Se ainda não funcionar

1. **Verifique se o SSL está ativo** no painel da Hostinger
2. **Aguarde até 24 horas** para propagação completa
3. **Entre em contato com o suporte da Hostinger** se necessário
4. **Verifique se o DNS está apontando corretamente** para a Hostinger

## 🔍 Como Verificar se está Funcionando

Abra o console do navegador (F12) e verifique:
- Não deve aparecer erros de "Mixed Content"
- A URL deve começar com `https://`
- O cadeado deve aparecer verde na barra de endereço


