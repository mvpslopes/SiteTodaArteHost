// Configuração do EmailJS
// Para configurar:
// 1. Crie uma conta em https://www.emailjs.com/
// 2. Crie um serviço de email (Gmail, Outlook, etc.)
// 3. Crie um template de email
// 4. Preencha as informações abaixo com seus IDs

export const emailjsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY',
  recipientEmail: 'contato@todaarte.com.br'
};

