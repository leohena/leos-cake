# Configuração do EmailJS para Envio de Recibos

## 1. Criar Conta no EmailJS

1. Acesse: https://emailjs.com
2. Crie uma conta gratuita
3. Confirme seu email

## 2. Configurar Serviço de Email

1. No dashboard do EmailJS, clique em "Email Services"
2. Clique em "Add New Service"
3. Escolha seu provedor (Gmail, Outlook, etc.)
4. Siga as instruções para conectar sua conta
5. Anote o **Service ID** gerado

## 3. Criar Template de Email

1. Clique em "Email Templates"
2. Clique em "Create New Template"
3. Cole o template abaixo:

### Template HTML para EmailJS:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Recibo de Pedido - {{from_name}}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            background: linear-gradient(135deg, #ff6b9d, #ffa726);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .recibo {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            background: #f9f9f9;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://seu-dominio.com/images/logo-png.png" alt="Logo" style="height: 60px; margin-bottom: 10px; border-radius: 8px;">
        <h1>{{from_name}}</h1>
        <p>Recibo do seu pedido #{{pedido_id}}</p>
    </div>
    
    <p>Olá {{to_name}},</p>
    
    <p>Segue o recibo do seu pedido:</p>
    
    <div class="recibo">
        {{{recibo_html}}}
    </div>
    
    <p><strong>Data de Entrega:</strong> {{data_entrega}} às {{horario_entrega}}</p>
    
    <p>Qualquer dúvida, entre em contato conosco!</p>
    
    <div class="footer">
        <p>Este é um email automático, por favor não responda.</p>
        <p>{{from_name}} - Sistema de Pré-Vendas</p>
    </div>
</body>
</html>
```

### Configurações do Template:

- **Template Name:** Recibo Pedido
- **Subject:** Recibo do Pedido #{{pedido_id}} - {{from_name}}
- **To Email:** {{to_email}}

### Variáveis utilizadas:
- `to_email` - Email do cliente
- `to_name` - Nome do cliente
- `from_name` - Nome da empresa
- `pedido_id` - ID do pedido
- `data_entrega` - Data de entrega
- `horario_entrega` - Horário de entrega
- `valor_total` - Valor total
- `valor_pago` - Valor pago
- `saldo` - Saldo restante
- `recibo_html` - HTML completo do recibo

4. Salve o template e anote o **Template ID**

## 4. Obter User ID

### Método 1: Pelo Dashboard (Mais Fácil)
1. No dashboard do EmailJS, vá no menu lateral esquerdo
2. Clique em **"Account"** ou **"Integration"**
3. Procure por **"Public Key"** ou **"User ID"**
4. Copie o código que aparece (formato: `user_xxxxxxxxxx`)

### Método 2: Pelo Menu Integration
1. No dashboard, clique em **"Integration"** no menu lateral
2. Na seção **"Installation"**, você verá:
   ```javascript
   emailjs.init("user_xxxxxxxxxx");
   ```
3. Copie apenas a parte `user_xxxxxxxxxx` (sem as aspas)

### Método 3: Nas Configurações da Conta
1. Clique no seu **nome/avatar** no canto superior direito
2. Selecione **"Account Settings"**
3. Na aba **"General"**, procure por **"Public Key"**
4. Este é o seu User ID

### ⚠️ Importante:
- O User ID tem o formato: `user_xxxxxxxxxx`
- É diferente do seu email ou nome de usuário
- É uma chave pública, pode ser vista por outros
- **NÃO confunda** com a Private Key (que deve ser mantida secreta)

## 5. Configurar no Sistema

1. Abra a aplicação Leo's Cake
2. Clique no ícone de configurações (⚙️) no header
3. Preencha:
   - **Service ID:** Cole o ID do serviço
   - **Template ID:** Cole o ID do template
   - **User ID:** Cole o User ID
4. Salve as configurações

## 6. Testar Envio

### ✅ Checklist antes do teste:
1. ✅ **Service ID** preenchido (formato: `service_xxxxxxx`)
2. ✅ **Template ID** preenchido (formato: `template_xxxxxxx`)  
3. ✅ **User ID** preenchido (formato: `user_xxxxxxxxxx`)
4. ✅ **Cliente tem email** cadastrado no sistema
5. ✅ **Pedido criado** com o cliente

### 🧪 Como testar:
1. **Cadastre um cliente** com SEU email para teste
2. **Crie um pedido** para este cliente
3. **Vá na aba "Pedidos"**
4. **Clique em "📄 Recibo"** no pedido criado
5. **Clique em "📧 Enviar Email"**
6. **Verifique sua caixa de entrada** (e spam/lixo eletrônico)

### 📧 O que você deve receber:
- **Assunto:** "Recibo do Pedido #[número] - Leo's Cake"
- **Remetente:** Seu email configurado no EmailJS
- **Conteúdo:** Recibo formatado com dados do pedido

## Limites da Conta Gratuita

- **200 emails/mês** na conta gratuita
- Para mais emails, considere upgrade para plano pago

## Solução de Problemas

### ❌ Email não enviado:
1. **Verifique os IDs:**
   - Service ID: `service_xxxxxxx`
   - Template ID: `template_xxxxxxx`
   - User ID: `user_xxxxxxxxxx`
2. **Confirme que o cliente tem email cadastrado**
3. **Abra o Console do navegador** (F12 → Console) para ver erros
4. **Teste com seu próprio email** primeiro

### ❌ Erro "User ID not found":
- Verifique se copiou o User ID correto (formato: `user_xxxxxxxxxx`)
- Certifique-se de não incluir aspas ou espaços extras
- Tente regenerar o User ID nas configurações da conta

### ❌ Erro "Template not found":
- Confirme se o Template ID está correto
- Verifique se o template está ativo (Published)
- Teste o template diretamente no dashboard do EmailJS

### ❌ Erro "Service not found":
- Verifique se o Service ID está correto
- Confirme se o serviço de email está conectado e ativo
- Teste enviando um email diretamente pelo dashboard

### Template não funciona:
1. Verifique se todas as variáveis estão corretas
2. Teste o template no dashboard do EmailJS
3. Certifique-se de usar `{{{recibo_html}}}` (3 chaves) para HTML

## Personalização Avançada

Você pode personalizar o template adicionando:
- Logo da empresa
- Cores personalizadas
- Informações adicionais
- Links para redes sociais

## Segurança

- Nunca compartilhe seus IDs publicamente
- Use variáveis do EmailJS para dados sensíveis
- Configure SPF/DKIM no seu domínio para melhor entregabilidade