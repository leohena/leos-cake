# Leo's Cake - Sistema de Pré-Vendas Completo# Leo's Cake - Sistema de Pré-Vendas



Sistema profissional de gerenciamento de pré-vendas com banco de dados, autenticação, geração de recibos e suporte multilingual.Sistema completo de gerenciamento de pré-vendas desenvolvido especialmente para pequenos negócios que precisam controlar estoque, pedidos e entregas de forma simples e eficiente.



## ✨ Funcionalidades Principais## 🚀 Funcionalidades



### 🔐 Sistema de Autenticação### 📊 Dashboard

- Login com validação no banco de dados Supabase- Visão geral dos números do negócio

- Gestão de sessão com expiração automática- Estatísticas de produtos, clientes, pedidos e entregas

- Controle de acesso baseado em níveis- Lista de entregas do dia



### 📊 Dashboard Profissional### 🧁 Gestão de Produtos

- Estatísticas em tempo real- Cadastro de produtos com imagens

- Gestão completa de Clientes, Produtos, Pedidos, Estoque e Entregas- Controle automático de estoque

- Interface responsiva (Desktop, Tablet, Mobile)- Alertas quando estoque está baixo (≤ 5 unidades)

- Filtros avançados e busca em tempo real- Busca por nome ou descrição



### 🌍 Sistema Multilingual### 👥 Gestão de Clientes

- Suporte completo para Português e Inglês- Cadastro completo de clientes

- Troca de idioma em tempo real- Informações de contato e endereço

- Formatação regional de moeda e datas- Busca por nome, telefone ou endereço



### 📄 Geração de Recibos### 📋 Sistema de Pedidos

- PDFs automáticos com resumo detalhado- Criação de pedidos com múltiplos produtos

- Controle de pagamentos parciais- Controle de pagamento (valor pago vs valor total)

- Envio automático por email- Cálculo automático de saldo restante

- Status automático (Pendente/Pago/Entregue)

### 💾 Banco de Dados Robusto- Verificação automática de estoque

- Supabase PostgreSQL com 8 tabelas relacionadas

- Cache offline para funcionamento sem internet### 🚚 Agendamento de Entregas

- Triggers de auditoria e backup automático- Horários pré-definidos (8h às 18h)

- Controle de disponibilidade por data/horário

## 🚀 Tecnologias Utilizadas- Agenda visual por dia

- Informações completas para entrega

### Frontend

- HTML5 Semântico### 📄 Sistema de Recibos

- CSS3 com Grid e Flexbox- Geração automática de recibos profissionais

- JavaScript ES6+ (Vanilla)- Download em PDF

- PWA (Progressive Web App)- Envio automático por email para clientes

- Template personalizável com dados da empresa

### Backend & Banco

- Supabase (PostgreSQL)### ⚙️ Configurações Avançadas

- Realtime subscriptions- Dados da empresa personalizáveis

- Authentication & Authorization- Integração com EmailJS para envio de emails

- Backup e restauração de dados

### Integrações

- EmailJS para envio de emails## 📱 Otimizado para Celular

- jsPDF para geração de recibos

- Font Awesome para íconesA aplicação foi desenvolvida com foco em dispositivos móveis:

- Google Fonts (Inter)- Interface responsiva

- Navegação por abas na parte inferior

## 📁 Estrutura do Projeto- PWA (Progressive Web App) - funciona como app nativo

- Funciona offline após primeiro carregamento

### Arquivos Principais- Pode ser instalada na tela inicial do celular

- `index.html` - Página de login

- `dashboard.html` - Interface principal do sistema## 🛠️ Tecnologias Utilizadas

- `CONFIGURACAO.md` - Instruções detalhadas de configuração

- **HTML5** - Estrutura da aplicação

### Scripts JavaScript- **CSS3** - Estilização responsiva com gradientes e animações

- `js/auth-system.js` - Sistema de autenticação e configuração- **JavaScript Vanilla** - Lógica da aplicação (sem dependências)

- `js/data-manager.js` - Gerenciamento completo de dados- **LocalStorage** - Armazenamento local dos dados

- `js/dashboard-app.js` - Aplicação do dashboard- **PWA** - Service Worker para funcionamento offline

- `js/login-app.js` - Aplicação da tela de login

- `js/i18n.js` - Sistema de internacionalização## 📦 Como Usar

- `js/receipt-system.js` - Geração de recibos e emails

### Instalação

### Banco de Dados1. Baixe todos os arquivos para uma pasta

- `database/schema.sql` - Estrutura completa das tabelas2. Abra o arquivo `index.html` em um navegador web

3. Para usar no celular: acesse via navegador e adicione à tela inicial

### Estilos e Assets

- `css/styles.css` - Estilos principais### Primeiros Passos

- `images/` - Logos e imagens do sistema

- `manifest.json` - Configuração PWA#### 1. Cadastrar Produtos

- `sw.js` - Service Worker- Vá na aba "Produtos"

- Clique em "+ Adicionar Produto"

## 🔧 Configuração Rápida- Preencha: nome, descrição, preço, quantidade em estoque

- Adicione uma foto (opcional)

1. **Configurar Supabase:**- Salve

   - Criar projeto no [Supabase](https://supabase.com)

   - Executar `database/schema.sql`#### 2. Cadastrar Clientes

   - Atualizar credenciais em `js/auth-system.js`- Vá na aba "Clientes"

- Clique em "+ Adicionar Cliente"

2. **Configurar EmailJS:**- Preencha: nome, telefone, endereço

   - Criar conta no [EmailJS](https://emailjs.com)- Email é opcional

   - Configurar template de email- Salve

   - Atualizar credenciais em `js/auth-system.js`

#### 3. Fazer Pedidos

3. **Testar:**- Vá na aba "Pedidos"

   - Abrir `index.html` em servidor local- Clique em "+ Novo Pedido"

   - Login: `admin` / `admin`- Selecione o cliente

- Adicione produtos (clique em "+ Adicionar Produto")

## 📱 PWA - Progressive Web App- Defina quantidade para cada produto

- Informe quanto foi pago

O sistema pode ser instalado como aplicativo no celular:- Escolha data e horário de entrega

- Funciona offline com cache- Adicione observações se necessário

- Interface otimizada para mobile- Salve

- Notificações push (futuro)

#### 4. Gerenciar Entregas

## 🛡️ Segurança- Vá na aba "Entregas"

- Selecione uma data no filtro

- Autenticação com JWT tokens- Veja todas as entregas agendadas por horário

- Sanitização de dados de entrada- Informações completas para facilitar a entrega

- Validação no frontend e backend

- Controle de sessão com timeout#### 5. Configurar Sistema

- Clique no ícone ⚙️ no header

## 📈 Performance- Configure dados da empresa

- Configure EmailJS para envio de recibos (veja arquivo EMAILJS_SETUP.md)

- Carregamento inicial: ~2-3 segundos- Salve as configurações

- Cache inteligente para dados frequentes

- Lazy loading de componentes#### 6. Gerar e Enviar Recibos

- Otimizado para dispositivos móveis- Na lista de pedidos, clique em "📄 Recibo"

- Visualize o recibo gerado

## 🎯 Como Usar- Baixe em PDF ou envie por email para o cliente



1. **Login:** Use `admin` / `admin` para primeiro acesso### Recursos Avançados

2. **Clientes:** Cadastre clientes com idioma preferido

3. **Produtos:** Adicione produtos e controle estoque#### Controle de Estoque

4. **Pedidos:** Crie pedidos que geram recibos automaticamente- O estoque é automaticamente reduzido quando um pedido é criado

5. **Entregas:** Organize e acompanhe entregas por data- Produtos com estoque ≤ 5 aparecem com alerta vermelho

- Não é possível criar pedidos com quantidade maior que o estoque

## 📞 Suporte

#### Horários de Entrega

Veja `CONFIGURACAO.md` para instruções detalhadas de configuração e uso.- Horários disponíveis: 8h, 9h, 10h, 11h, 14h, 15h, 16h, 17h, 18h

- Apenas um pedido por horário/data

---- Horários ocupados não aparecem na seleção



**Status:** ✅ Sistema completo e funcional  #### Status de Pedidos

**Versão:** 2.0.0  - **Pendente**: Ainda há saldo a receber

**Última atualização:** Novembro 2024- **Pago**: Valor total já foi pago
- **Entregue**: Pedido foi entregue (pode ser marcado manualmente)

## 💾 Armazenamento de Dados

Os dados são salvos localmente no navegador (LocalStorage):
- **Vantagem**: Não precisa de internet, dados sempre disponíveis
- **Cuidado**: Limpar cache do navegador apaga os dados

### Backup e Restauração
Para implementar backup/restauração, você pode:
1. Adicionar botões de exportar/importar dados
2. Salvar arquivos JSON com os dados
3. Implementar sincronização com Google Drive ou similar

## 🔧 Personalização

### Horários de Entrega
Edite a linha 8 do arquivo `js/app.js`:
```javascript
this.horariosDisponiveis = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
```

### Cores e Tema
Edite o arquivo `css/styles.css`:
- Cor principal: `#ff6b9d` (rosa)
- Cor secundária: `#ffa726` (laranja)
- Cor de fundo: `#f5f7fa` (cinza claro)

### Logo e Ícones
Substitua os arquivos na pasta `images/`:
- `icon-192.png` - Ícone 192x192px
- `icon-512.png` - Ícone 512x512px

## 📱 Instalação como App (PWA)

### Android
1. Abra no Chrome
2. Toque no menu (⋮)
3. Selecione "Adicionar à tela inicial"
4. Confirme a instalação

### iOS
1. Abra no Safari
2. Toque no botão de compartilhar
3. Selecione "Adicionar à Tela de Início"
4. Confirme a instalação

## 🚀 Próximas Melhorias

Sugestões para expansão do sistema:
- Relatórios de vendas
- Integração com WhatsApp para notificações
- Múltiplos usuários/funcionários
- Sincronização na nuvem
- Impressão de pedidos
- Controle financeiro completo
- Integração com meios de pagamento

## 🐛 Problemas Conhecidos

- Dados são perdidos se o cache do navegador for limpo
- Não há validação de CPF/CNPJ
- Fotos são armazenadas em Base64 (podem ocupar muito espaço)

## 📞 Suporte

Para dúvidas ou melhorias:
1. Verifique este README
2. Teste as funcionalidades passo a passo
3. Para personalizações, edite os arquivos conforme as instruções

## 📄 Licença

Este projeto é de código aberto e pode ser usado, modificado e distribuído livremente.

---

**Desenvolvido com ❤️ para facilitar a gestão de pequenos negócios**