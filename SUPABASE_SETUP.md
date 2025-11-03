# 🚀 Configuração do Supabase - Leo's Cake

O Leo's Cake agora usa **Supabase** como banco de dados principal, oferecendo sincronização em tempo real e uma experiência muito mais profissional.

## 🎯 **Por que Supabase?**

- ✅ **Real-time sync** automático entre dispositivos
- ✅ **PostgreSQL** completo (muito mais poderoso que planilhas)
- ✅ **API REST/GraphQL** nativa
- ✅ **Autenticação robusta** com JWT
- ✅ **Row Level Security (RLS)**
- ✅ **Interface admin profissional**
- ✅ **Webhooks e triggers**
- ✅ **Backup automático**

## 🔧 **Passo a Passo de Configuração**

### 1. **Criar Conta no Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub/Google
4. Crie um novo projeto

### 2. **Configurar Projeto**
1. **Nome do projeto**: `leos-cake-sistema`
2. **Senha do banco**: (escolha uma senha forte)
3. **Região**: escolha a mais próxima (ex: South America)
4. **Plano**: Free (suficiente para começar)

### 3. **Copiar Credenciais**
No dashboard do projeto, vá em **Settings > API**:

```javascript
// Exemplo das credenciais
Project URL: https://seu-projeto.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. **Configurar no Sistema**
1. Abra o Leo's Cake
2. Vá em ⚙️ **Configurações**
3. Na seção **Supabase**:
   - **Supabase URL**: Cole a Project URL
   - **Anon Key**: Cole a chave anon/public
   - ✅ **Ativar Real-time**: Marcado

### 5. **Criar Tabelas**
1. Clique em **"🔗 Testar Conexão"** (deve mostrar ✓)
2. Clique em **"📊 Criar Tabelas no Supabase"**
3. O sistema criará automaticamente:
   - `usuarios` (gerenciamento de usuários)
   - `produtos` (catálogo de produtos)
   - `clientes` (cadastro de clientes)
   - `pedidos` (pedidos e vendas)

## 📊 **Estrutura das Tabelas**

### **Tabela: usuarios**
```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'user',
  ativo BOOLEAN DEFAULT true,
  data_criacao DATE DEFAULT CURRENT_DATE,
  ultimo_login DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Tabela: produtos**
```sql
CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  estoque INTEGER DEFAULT 0,
  imagem TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Tabela: clientes**
```sql
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  email VARCHAR(255),
  endereco TEXT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Tabela: pedidos**
```sql
CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  produtos JSONB NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  saldo DECIMAL(10,2) GENERATED ALWAYS AS (valor_total - valor_pago) STORED,
  status VARCHAR(50) DEFAULT 'pendente',
  data_entrega DATE,
  horario_entrega TIME,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 **Real-time Sync**

Quando ativado, o sistema sincroniza automaticamente:
- ✅ **Produtos**: Alterações aparecem instantaneamente
- ✅ **Clientes**: Cadastros sincronizados em tempo real
- ✅ **Pedidos**: Pedidos aparecem imediatamente em outros dispositivos
- ✅ **Usuários**: Gerenciamento de usuários em tempo real

## 🛡️ **Segurança**

O Supabase oferece:
- **Row Level Security (RLS)**: Controle de acesso por linha
- **JWT Authentication**: Tokens seguros
- **Backups automáticos**: Seus dados estão seguros
- **Logs de auditoria**: Rastreamento de alterações

## 🆘 **Troubleshooting**

### **Erro: "Tabela não existe"**
1. Clique em "📊 Criar Tabelas no Supabase"
2. Verifique se as credenciais estão corretas

### **Erro: "Conexão falhou"**
1. Verifique se a URL está correta
2. Confirme se a Anon Key está completa
3. Teste a conexão novamente

### **Real-time não funciona**
1. Verifique se está marcado nas configurações
2. Confirme se o projeto Supabase tem real-time habilitado
3. Recarregue a página

## 🎉 **Benefícios Imediatos**

Após configurar o Supabase:
- 📱 **Acesso simultâneo**: Use em vários dispositivos
- 🔄 **Sync automático**: Mudanças aparecem instantaneamente
- 💾 **Backup seguro**: Dados na nuvem PostgreSQL
- 📊 **Dashboard admin**: Visualize dados no Supabase
- 🔍 **Queries SQL**: Relatórios personalizados
- 🔒 **Usuários seguros**: Sistema robusto de autenticação

## 📞 **Suporte**

- **Documentação**: [docs.supabase.com](https://docs.supabase.com)
- **Community**: [Discord](https://discord.supabase.com)
- **Exemplos**: [github.com/supabase/supabase](https://github.com/supabase/supabase)

---

**🚀 Agora seu Leo's Cake é um sistema profissional com banco de dados real!**