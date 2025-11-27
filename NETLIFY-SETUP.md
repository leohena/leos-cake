# 🚀 Guia Completo de Deploy no Netlify - Leo's Cake

## 📋 Pré-requisitos

Antes de começar, certifique-se de que você tem:
- Conta no GitHub com o repositório `leos-cake` atualizado
- Conta no Netlify (gratuita)
- Chave API do Brevo (antigo Sendinblue)
- Credenciais do Supabase (URL e chave anônima)

---

## 📝 Passo 1: Criar Conta no Netlify

1. Acesse [netlify.com](https://netlify.com)
2. Clique em **"Sign up"** (canto superior direito)
3. Escolha uma das opções:
   - **GitHub**: Recomendado (integração automática)
   - **GitLab**
   - **Bitbucket**
   - **Email**: Para outros provedores

---

## 🔗 Passo 2: Conectar o Repositório GitHub

1. Após login, clique em **"Add new site"**
2. Selecione **"Import an existing project"**
3. Escolha **"Deploy with GitHub"**
4. **Autorize o Netlify** a acessar sua conta GitHub
5. **Selecione o repositório**: `leohena/leos-cake`
6. Clique em **"Continue"**

---

## ⚙️ Passo 3: Configurar Build Settings

O Netlify deve detectar automaticamente as configurações do `netlify.toml`, mas confirme:

### Basic build settings:
- **Branch to deploy**: `master` (ou a branch que você usa)
- **Build command**: Deixe vazio (não precisamos de build)
- **Publish directory**: `.` (raiz do projeto)

### Advanced build settings:
- **Functions directory**: `netlify/functions` ✅ (já configurado)
- **Build status**: Ativado ✅

Clique em **"Deploy site"**

---

## 🔐 Passo 4: Configurar Variáveis de Ambiente

### Acesse as configurações:
1. No painel do Netlify, selecione seu site
2. Vá para **"Site settings"** (ícone de engrenagem)
3. No menu lateral: **"Environment variables"**
4. Clique em **"Add variable"**

### Adicione estas variáveis obrigatórias:

#### 1. BREVO_API_KEY
```
Key: BREVO_API_KEY
Value: SUA_CHAVE_API_DO_BREVO_AQUI
Scopes: Functions, Post-processing
```

#### 2. SUPABASE_URL
```
Key: SUPABASE_URL
Value: https://qzuccgbxddzpbotxvjug.supabase.co
Scopes: Functions, Build time, Runtime
```

#### 3. SUPABASE_ANON_KEY
```
Key: SUPABASE_ANON_KEY
Value: SUA_CHAVE_ANONIMA_DO_SUPABASE_AQUI
Scopes: Functions, Build time, Runtime
```

#### 4. NODE_VERSION (opcional, mas recomendado)
```
Key: NODE_VERSION
Value: 18
Scopes: Build time, Runtime
```

**Importante**: Marque a opção **"All scopes"** para garantir que as variáveis estejam disponíveis em todos os contextos.

---

## 🚀 Passo 5: Primeiro Deploy

1. Após configurar as variáveis, clique em **"Deploy site"**
2. O Netlify começará o deploy automático
3. **Acompanhe o progresso** na aba "Deploys"
4. **Status esperado**:
   - Building...
   - Publishing...
   - ✅ Deploy complete

---

## ✅ Passo 6: Verificar o Deploy

### Teste básico:
1. Acesse a URL gerada (ex: `https://amazing-site.netlify.app`)
2. **Página inicial**: Deve carregar o login
3. **Teste de funcionalidades**:
   - Login no sistema
   - Navegação entre seções
   - Cadastro de produtos/clientes

### Teste das funções serverless:
1. Vá para **"Site settings" > "Functions"**
2. Deve aparecer: `send-email`
3. **Teste o envio de email**:
   - Faça um pedido de teste
   - Verifique se o email é enviado

---

## 🌐 Passo 7: Configurar Domínio Personalizado (Opcional)

### Se você tiver um domínio:
1. Vá para **"Site settings" > "Domain management"**
2. Clique em **"Add custom domain"**
3. Digite seu domínio (ex: `leoscake.com`)
4. Siga as instruções do Netlify para configurar DNS

### Para subdomínio gratuito:
- O Netlify oferece `seu-site.netlify.app` gratuitamente

---

## 🔍 Passo 8: Monitoramento e Logs

### Ver logs de função:
1. **"Site settings" > "Functions"**
2. Clique na função `send-email`
3. Veja **"Function logs"** para debug

### Ver logs de deploy:
1. Aba **"Deploys"**
2. Clique no deploy atual
3. Veja **"Deploy log"** para erros

---

## 🛠️ Passo 9: Configurações Avançadas

### Headers de segurança (recomendado):
Adicione no `netlify.toml` ou via UI:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Redirects para SPA:
Já configurado no `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🚨 Solução de Problemas

### Deploy falha:
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se o `netlify.toml` está correto
- Veja os logs de deploy para erros específicos

### Função não funciona:
- Verifique se `BREVO_API_KEY` está definida
- Teste a função via **"Functions" > "send-email" > "Test function"**

### Emails não chegam:
- Verifique se a chave API do Brevo é válida
- Confirme se o domínio está autorizado no Brevo
- Veja os logs da função

---

## 📊 Status do Deploy

Após completar estes passos, você terá:
- ✅ Site funcionando em produção
- ✅ Backend Supabase conectado
- ✅ Sistema de emails operacional
- ✅ Deploy automático do GitHub
- ✅ Funções serverless ativas

**URL de produção**: Acesse a URL fornecida pelo Netlify

---

## 🔄 Atualizações Futuras

Sempre que você fizer push para a branch `master` no GitHub:
1. O Netlify detectará automaticamente
2. Iniciará novo deploy
3. Site será atualizado em produção

**Tempo típico de deploy**: 1-3 minutos

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Netlify
2. Consulte a documentação: [docs.netlify.com](https://docs.netlify.com)
3. Abra uma issue no GitHub se necessário

**🎉 Parabéns! Seu sistema Leo's Cake está agora em produção!**</content>
<parameter name="filePath">c:\Users\leocv\OneDrive\Área de Trabalho\Leo's Cake\NETLIFY-SETUP.md