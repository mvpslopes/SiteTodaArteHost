# Configuração de Email na Hostinger

O formulário de contato está configurado para usar um endpoint PHP hospedado na Hostinger, enviando emails diretamente para `contato@todaarte.com.br`.

## Como Funciona

1. O formulário envia os dados para o arquivo `contact-form.php`
2. O PHP processa e envia o email usando a função `mail()` do PHP
3. O email é entregue em `contato@todaarte.com.br`

## Passo a Passo para Configuração

### 1. Fazer Upload do Arquivo PHP

1. Acesse o **File Manager** no painel da Hostinger
2. Navegue até a pasta `public_html` (ou a pasta raiz do seu site)
3. Faça upload do arquivo `contact-form.php` que está na pasta `public/` do projeto

**Importante:** O arquivo deve estar na mesma pasta onde está o `index.html` do site.

### 2. Verificar Permissões

Certifique-se de que o arquivo PHP tem permissões de leitura e execução (geralmente 644 ou 755).

### 3. Testar o Formulário

1. Acesse o site em produção
2. Preencha o formulário de contato
3. Envie uma mensagem de teste
4. Verifique se o email chegou em `contato@todaarte.com.br`

## Estrutura de Arquivos na Hostinger

```
public_html/
├── index.html
├── contact-form.php  ← Arquivo PHP para processar formulário
├── assets/
└── ...
```

## Solução de Problemas

### Email não está sendo enviado

1. **Verificar se o PHP está habilitado:**
   - No painel da Hostinger, verifique se PHP está ativo
   - Versão recomendada: PHP 7.4 ou superior

2. **Verificar logs de erro:**
   - Acesse o painel da Hostinger > Logs
   - Verifique se há erros relacionados ao `contact-form.php`

3. **Testar o arquivo PHP diretamente:**
   - Acesse: `https://seudominio.com.br/contact-form.php`
   - Deve retornar um erro JSON (isso é normal, pois precisa receber dados POST)

4. **Verificar função mail() do PHP:**
   - A Hostinger geralmente tem a função `mail()` habilitada
   - Se não funcionar, pode ser necessário configurar SMTP

### Configurar SMTP (se necessário)

Se a função `mail()` não funcionar, você pode usar SMTP. Edite o `contact-form.php` e adicione configuração SMTP usando PHPMailer ou similar.

## Vantagens desta Solução

✅ Não precisa de serviços externos (EmailJS, etc.)
✅ Usa recursos nativos da Hostinger
✅ Sem limites de emails (dependendo do plano)
✅ Mais seguro e privado
✅ Sem custos adicionais

## Nota Importante

O arquivo `contact-form.php` já está configurado para enviar emails para `contato@todaarte.com.br`. Se precisar alterar o destinatário, edite a linha:

```php
$to = 'contato@todaarte.com.br';
```

