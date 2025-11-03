# Leo's Cake - Sistema de Pré-Vendas

Sistema completo de gerenciamento de pré-vendas desenvolvido especialmente para pequenos negócios que precisam controlar estoque, pedidos e entregas de forma simples e eficiente.

## 🚀 Funcionalidades

### 📊 Dashboard
- Visão geral dos números do negócio
- Estatísticas de produtos, clientes, pedidos e entregas
- Lista de entregas do dia

### 🧁 Gestão de Produtos
- Cadastro de produtos com imagens
- Controle automático de estoque
- Alertas quando estoque está baixo (≤ 5 unidades)
- Busca por nome ou descrição

### 👥 Gestão de Clientes
- Cadastro completo de clientes
- Informações de contato e endereço
- Busca por nome, telefone ou endereço

### 📋 Sistema de Pedidos
- Criação de pedidos com múltiplos produtos
- Controle de pagamento (valor pago vs valor total)
- Cálculo automático de saldo restante
- Status automático (Pendente/Pago/Entregue)
- Verificação automática de estoque

### 🚚 Agendamento de Entregas
- Horários pré-definidos (8h às 18h)
- Controle de disponibilidade por data/horário
- Agenda visual por dia
- Informações completas para entrega

### 📄 Sistema de Recibos
- Geração automática de recibos profissionais
- Download em PDF
- Envio automático por email para clientes
- Template personalizável com dados da empresa

### ⚙️ Configurações Avançadas
- Dados da empresa personalizáveis
- Integração com EmailJS para envio de emails
- Backup e restauração de dados

## 📱 Otimizado para Celular

A aplicação foi desenvolvida com foco em dispositivos móveis:
- Interface responsiva
- Navegação por abas na parte inferior
- PWA (Progressive Web App) - funciona como app nativo
- Funciona offline após primeiro carregamento
- Pode ser instalada na tela inicial do celular

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura da aplicação
- **CSS3** - Estilização responsiva com gradientes e animações
- **JavaScript Vanilla** - Lógica da aplicação (sem dependências)
- **LocalStorage** - Armazenamento local dos dados
- **PWA** - Service Worker para funcionamento offline

## 📦 Como Usar

### Instalação
1. Baixe todos os arquivos para uma pasta
2. Abra o arquivo `index.html` em um navegador web
3. Para usar no celular: acesse via navegador e adicione à tela inicial

### Primeiros Passos

#### 1. Cadastrar Produtos
- Vá na aba "Produtos"
- Clique em "+ Adicionar Produto"
- Preencha: nome, descrição, preço, quantidade em estoque
- Adicione uma foto (opcional)
- Salve

#### 2. Cadastrar Clientes
- Vá na aba "Clientes"
- Clique em "+ Adicionar Cliente"
- Preencha: nome, telefone, endereço
- Email é opcional
- Salve

#### 3. Fazer Pedidos
- Vá na aba "Pedidos"
- Clique em "+ Novo Pedido"
- Selecione o cliente
- Adicione produtos (clique em "+ Adicionar Produto")
- Defina quantidade para cada produto
- Informe quanto foi pago
- Escolha data e horário de entrega
- Adicione observações se necessário
- Salve

#### 4. Gerenciar Entregas
- Vá na aba "Entregas"
- Selecione uma data no filtro
- Veja todas as entregas agendadas por horário
- Informações completas para facilitar a entrega

#### 5. Configurar Sistema
- Clique no ícone ⚙️ no header
- Configure dados da empresa
- Configure EmailJS para envio de recibos (veja arquivo EMAILJS_SETUP.md)
- Salve as configurações

#### 6. Gerar e Enviar Recibos
- Na lista de pedidos, clique em "📄 Recibo"
- Visualize o recibo gerado
- Baixe em PDF ou envie por email para o cliente

### Recursos Avançados

#### Controle de Estoque
- O estoque é automaticamente reduzido quando um pedido é criado
- Produtos com estoque ≤ 5 aparecem com alerta vermelho
- Não é possível criar pedidos com quantidade maior que o estoque

#### Horários de Entrega
- Horários disponíveis: 8h, 9h, 10h, 11h, 14h, 15h, 16h, 17h, 18h
- Apenas um pedido por horário/data
- Horários ocupados não aparecem na seleção

#### Status de Pedidos
- **Pendente**: Ainda há saldo a receber
- **Pago**: Valor total já foi pago
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