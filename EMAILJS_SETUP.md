# Configuração do EmailJS para Formulário de Contato

O formulário de contato está configurado para enviar emails diretamente para `contato@todaarte.com.br` usando o serviço EmailJS.

## Passo a Passo para Configuração

### 1. Criar Conta no EmailJS

1. Acesse https://www.emailjs.com/
2. Crie uma conta gratuita (permite até 200 emails/mês)
3. Faça login no painel

### 2. Criar um Serviço de Email

1. No painel do EmailJS, vá em **Email Services**
2. Clique em **Add New Service**
3. Escolha seu provedor de email (Gmail, Outlook, etc.)
4. Siga as instruções para conectar sua conta de email
5. **Anote o Service ID** que será gerado

### 3. Criar um Template de Email

1. No painel do EmailJS, vá em **Email Templates**
2. Clique em **Create New Template**
3. Configure o template com as seguintes variáveis:
   - `{{from_name}}` - Nome do remetente
   - `{{from_email}}` - Email do remetente
   - `{{subject}}` - Assunto da mensagem
   - `{{message}}` - Mensagem do formulário
   - `{{to_email}}` - Email do destinatário (contato@todaarte.com.br)

4. Exemplo de template:
   ```
   Assunto: {{subject}}
   
   De: {{from_name}} ({{from_email}})
   
   Mensagem:
   {{message}}
   ```

5. Configure o destinatário como: `contato@todaarte.com.br`
6. **Anote o Template ID** que será gerado

### 4. Obter a Public Key

1. No painel do EmailJS, vá em **Account** > **General**
2. Copie a **Public Key** (API Key)

### 5. Configurar no Projeto

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_EMAILJS_SERVICE_ID=seu_service_id_aqui
VITE_EMAILJS_TEMPLATE_ID=seu_template_id_aqui
VITE_EMAILJS_PUBLIC_KEY=sua_public_key_aqui
```

**Importante:** 
- Não commite o arquivo `.env` no Git (já deve estar no `.gitignore`)
- Após criar o arquivo `.env`, reinicie o servidor de desenvolvimento (`npm run dev`)

### 6. Testar

1. Preencha o formulário de contato no site
2. Envie uma mensagem de teste
3. Verifique se o email chegou em `contato@todaarte.com.br`

## Alternativa: Configuração Manual

Se preferir não usar variáveis de ambiente, você pode editar diretamente o arquivo `src/config/emailjs.config.ts` e substituir os valores:

```typescript
export const emailjsConfig = {
  serviceId: 'seu_service_id',
  templateId: 'seu_template_id',
  publicKey: 'sua_public_key',
  recipientEmail: 'contato@todaarte.com.br'
};
```

## Limites do Plano Gratuito

- 200 emails por mês
- Suporte a Gmail, Outlook, Yahoo e outros provedores
- Sem necessidade de backend próprio

## Suporte

Se tiver problemas, consulte a documentação oficial: https://www.emailjs.com/docs/

