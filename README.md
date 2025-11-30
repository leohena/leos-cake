# Leo's Cake - Sistema de Pré-Vendas

![Leo's Cake Logo](images/logo-png.png)

Sistema de gerenciamento de pré-vendas para pequenas confeitarias, construído com HTML, CSS e JavaScript puro. O sistema utiliza Supabase para o backend de banco de dados e autenticação, e Netlify para o deploy e funções serverless.

## ✨ Funcionalidades

- **🔐 Autenticação:** Sistema de login seguro conectado ao Supabase.
- **📊 Dashboard:** Visão geral de pedidos, clientes e produtos.
- **🧁 Gestão de Produtos:** Cadastro de produtos com nome, imagem e controle de estoque.
- **👥 Gestão de Clientes:** Cadastro de informações de contato e endereço dos clientes.
- **📋 Gestão de Pedidos:** Criação e acompanhamento de pedidos com status.
- **🚚 Agenda de Entregas:** Visualização diária dos pedidos a serem entregues.
- **📄 Recibos:** Geração de recibos para os pedidos.
- **🌍 Multilingual:** Suporte para Português e Inglês.
- **📱 PWA (Progressive Web App):** Pode ser "instalado" em dispositivos móveis para uma experiência de aplicativo nativo e funcionamento offline.

## 🚀 Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend (BaaS):** [Supabase](https://supabase.com/) (PostgreSQL Database, Auth)
- **Hospedagem & Deploy:** [Netlify](https://www.netlify.com/)
- **Funções Serverless:** Netlify Functions (Node.js)
- **Envio de Email:** [Brevo](https://www.brevo.com/) (utilizado através de uma Netlify Function)

## ⚙️ Como Configurar e Rodar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Uma conta no [Supabase](https://supabase.com/)
- Uma conta no [Brevo](https://www.brevo.com/) para o serviço de email

### 1. Clone o Repositório

```bash
git clone https://github.com/leohena/leos-cake.git
cd leos-cake
```

### 2. Instale as Dependências

Este projeto usa a CLI da Netlify para desenvolvimento local.

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Para rodar o projeto localmente, a CLI da Netlify precisa das mesmas variáveis de ambiente que serão usadas em produção.

Crie um arquivo chamado `.env` na raiz do projeto e adicione as seguintes variáveis:

```env
# URL do seu projeto Supabase
SUPABASE_URL=https://<seu-projeto-id>.supabase.co

# Chave anônima (public) do seu projeto Supabase
SUPABASE_ANON_KEY=<sua-chave-anon-publica>

# Chave de API do Brevo para envio de emails
BREVO_API_KEY=<sua-chave-da-api-do-brevo>
```

**Importante:** Nunca suba o arquivo `.env` para o seu repositório Git. Ele já está incluído no `.gitignore`.

### 4. Rode o Projeto Localmente

Use o comando da Netlify para iniciar o servidor de desenvolvimento. Isso irá servir seus arquivos estáticos e também as funções da pasta `netlify/functions`.

```bash
npm run dev
```

O site estará disponível em `http://localhost:8888` (ou outra porta, se a 8888 estiver em uso).

## 🚀 Deploy em Produção

O deploy é feito via Netlify e é acionado a cada `push` na branch `main` (ou `master`).

1.  **Conecte seu Repositório:** No painel da Netlify, importe seu repositório do GitHub.
2.  **Configurações de Build:**
    - **Build command:** Deixe em branco ou use `echo "No build step"`.
    - **Publish directory:** `.` (raiz do projeto).
    - **Functions directory:** `netlify/functions`.
3.  **Configure as Variáveis de Ambiente na Netlify:**
    - Vá para `Site settings` > `Build & deploy` > `Environment`.
    - Adicione as mesmas variáveis do seu arquivo `.env` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `BREVO_API_KEY`).

A Netlify fará o deploy automático do seu site e das funções serverless.

## 🔒 Segurança

### Configurações Críticas
- **Chaves de API:** Nunca commite chaves de API no código. Use variáveis de ambiente no Netlify.
- **Senhas:** As senhas são armazenadas com hash base64 simples. Para produção, considere migrar para hash seguro (ex: bcrypt) no backend.
- **Armazenamento Local:** Dados sensíveis não devem ser armazenados em localStorage. Use sessionStorage para dados temporários.
- **CORS:** As funções serverless permitem CORS de qualquer origem. Restrinja para domínios específicos em produção.
- **Validação:** Sempre valide e sanitize inputs do usuário para prevenir XSS e injeções.

### Verificações de Segurança
Execute os testes básicos em `test.js` para validar funcionalidades críticas.

### Problemas Conhecidos
- Hash de senha fraco (base64).
- Possível exposição de dados em localStorage/sessionStorage via XSS.

## 📁 Estrutura do Projeto

```
.
├── netlify/
│   └── functions/
│       ├── config.js       # Função que expõe as variáveis de ambiente do Supabase para o frontend de forma segura.
│       └── send-email.js   # Função que envia emails transacionais usando a API do Brevo.
├── src/
│   ├── app.js            # Lógica principal da aplicação do dashboard.
│   ├── auth.js           # Gerenciamento de autenticação com Supabase.
│   ├── brevo-email-service.js # Classe do lado do cliente para chamar a função `send-email`.
│   ├── i18n.js           # Lógica de internacionalização (traduções).
│   └── supabase.js       # Inicialização e configuração do cliente Supabase no frontend.
├── *.html              # Arquivos HTML principais (index.html, dashboard.html, etc.).
├── styles.css          # Folha de estilos principal.
├── netlify.toml        # Arquivo de configuração da Netlify (build, redirects, etc.).
└── package.json        # Dependências e scripts do projeto.
```
