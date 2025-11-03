# Configuração do Google Sheets API

## 1. Configurar Google Cloud Console

### Passo 1: Criar um Projeto
1. Acesse: https://console.cloud.google.com
2. Clique em "Select a project" → "New Project"
3. Nome do projeto: "Leo's Cake Sistema"
4. Clique em "Create"

### Passo 2: Ativar APIs
1. No menu lateral, vá em "APIs & Services" → "Library"
2. Procure e ative as seguintes APIs:
   - **Google Sheets API**
   - **Google Drive API**
3. Clique em "Enable" para cada uma

### Passo 3: Criar Credenciais

#### 3.1: Criar API Key
1. Vá em **"APIs & Services"** → **"Credentials"** (no menu lateral esquerdo)
2. Clique no botão **"+ CREATE CREDENTIALS"** (azul, no topo)
3. Selecione **"API key"**
4. Uma janela popup aparecerá com sua API Key
5. **COPIE e SALVE** a API Key (formato: `AIzaSyC...`)
6. Clique em **"RESTRICT KEY"** (recomendado para segurança)
7. Em **"API restrictions"**, selecione **"Restrict key"**
8. Marque apenas: **"Google Sheets API"** e **"Google Drive API"**
9. Clique **"SAVE"**

#### 3.2: Criar OAuth 2.0 Client ID
1. Na mesma página "Credentials", clique novamente em **"+ CREATE CREDENTIALS"**
2. Selecione **"OAuth client ID"**
3. **Se aparecer uma tela sobre "OAuth consent screen":**
   - Clique em **"CONFIGURE CONSENT SCREEN"**
   - Escolha **"External"** → **"CREATE"**
   - Preencha apenas:
     - **App name:** "Leo's Cake Sistema"
     - **User support email:** Seu email
     - **Developer contact information:** Seu email
   - Clique **"SAVE AND CONTINUE"** em todas as próximas telas
   - No final, clique **"BACK TO DASHBOARD"**
4. **Agora criar o OAuth Client ID:**
   - Volte para "Credentials" → **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
   - **Application type:** Selecione **"Web application"**
   - **Name:** Digite "Leo's Cake Web Client"
   - **Authorized JavaScript origins:** Clique **"+ ADD URI"** e adicione:
     - `http://localhost:3000`
     - `http://localhost:8000`
     - `http://127.0.0.1:3000`
   - **Authorized redirect URIs:** Deixe em branco (não éeo's Cake Web Client necessário)
   - Clique **"CREATE"**
5. **COPIE e SALVE** o Client ID (formato: `123456789-abc...googleusercontent.com`)

#### ⚠️ Exemplos dos Formatos Corretos:

**✅ API Key (exemplo):**
```
AIzaSyC-1234567890abcdefghijklmnopqrstuvwxyz
```

**✅ Client ID (exemplo):**
```
123456789012-abcdefghijklmnopqrstuvwxyz1234.apps.googleusercontent.com
```

**❌ Formatos INCORRETOS:**
- `1234567890` (muito curto)
- `client_secret_...` (isso é o Client Secret, não o Client ID)
- `@gmail.com` (isso é email, não credencial)

#### 🔒 Segurança:
- **Guarde ambos com segurança** - serão usados no sistema
- **API Key é pública** - pode ser vista no código
- **Nunca compartilhe** as credenciais publicamente

## 2. Criar Planilha no Google Sheets

### Passo 1: Criar Nova Planilha
1. Acesse: https://sheets.google.com
2. Clique em "+" para criar nova planilha
3. Nomeie: "Leo's Cake - Sistema de Pré-Vendas"

### Passo 2: Configurar Abas
Crie as seguintes abas (sheets):

#### Aba 1: "Produtos"
Cabeçalhos na linha 1:
```
A1: id | B1: nome | C1: descricao | D1: preco | E1: estoque | F1: imagem | G1: created
```

#### Aba 2: "Clientes"
Cabeçalhos na linha 1:
```
A1: id | B1: nome | C1: telefone | D1: endereco | E1: email | F1: created
```

#### Aba 3: "Pedidos"
Cabeçalhos na linha 1:
```
A1: id | B1: clienteId | C1: produtos | D1: valorTotal | E1: valorPago | F1: saldo | G1: dataEntrega | H1: horarioEntrega | I1: observacoes | J1: status | K1: created
```

### Passo 3: Compartilhar Planilha
1. Clique em "Share"
2. Em "Get link", configure como "Anyone with the link can edit"
3. **Copie o ID da planilha** da URL (parte entre `/d/` e `/edit`)
   - Exemplo: `https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit`
   - ID: `1ABC...XYZ`

## 3. Verificar se Tudo Está Correto

### ✅ Checklist Final:
Você deve ter coletado estes 3 dados:

1. **✅ API Key**
   - Formato: `AIzaSyC-abc123def456ghi789...`
   - Onde encontrar: Google Cloud Console → APIs & Services → Credentials

2. **✅ Client ID**
   - Formato: `123456789-abcdefgh.apps.googleusercontent.com`
   - Onde encontrar: Mesma página, na seção "OAuth 2.0 Client IDs"

3. **✅ Spreadsheet ID**
   - Formato: `1ABC123def456GHI789jkl012MNO345pqr678`
   - Onde encontrar: URL da planilha Google Sheets (entre `/d/` e `/edit`)

### 🔧 Configurar no Sistema Leo's Cake:
1. Abra a aplicação Leo's Cake
2. Clique no ícone **⚙️** (configurações) no header
3. Role até "Configurações do Google Sheets"
4. Cole os 3 dados coletados:
   - **API Key:** Cole a chave que começa com `AIzaSyC...`
   - **Client ID:** Cole o ID que termina com `.googleusercontent.com`
   - **Spreadsheet ID:** Cole o ID da planilha
5. Marque **"Sincronização automática"** se desejar
6. Clique **"🔗 Testar Conexão"** para verificar
7. Se aparecer "✅ Conectado", clique **"Salvar"**

## 4. Funcionalidades Implementadas

### ✅ Sincronização Automática
- Dados salvos automaticamente no Google Sheets
- Backup local no localStorage como fallback
- Sincronização bidirecional (leitura e escrita)

### ✅ Controle de Conflitos
- Sistema detecta mudanças externas na planilha
- Opção de sincronizar ou manter dados locais
- Timestamp para controle de versões

### ✅ Offline First
- Sistema funciona offline normalmente
- Sincroniza automaticamente quando online
- Indicador visual do status de sincronização

### ✅ Relatórios Automáticos
- Dados organizados automaticamente no Google Sheets
- Possibilidade de criar gráficos e relatórios
- Acesso de qualquer lugar via Google Sheets

## 5. Benefícios da Integração

### 🔒 Segurança
- Dados salvos na nuvem do Google
- Backup automático e versionamento
- Acesso controlado via Google Account

### 🌐 Acessibilidade  
- Acesso de qualquer dispositivo
- Sincronização em tempo real
- Colaboração com equipe

### 📊 Relatórios
- Análise de dados direto no Google Sheets
- Gráficos e dashboards personalizados
- Exportação para outros formatos

### ⚡ Performance
- Cache local para velocidade
- Sincronização inteligente (apenas mudanças)
- Funcionamento offline garantido

## 6. Limitações

### Cota da API
- **100 requests por 100 segundos por usuário**
- **300 requests por minuto**
- Suficiente para uso normal do sistema

### Tamanho dos Dados
- **10MB por planilha** (limite do Google Sheets)
- Imagens convertidas para Base64 (ocupam mais espaço)
- Recomendado otimizar imagens antes do upload

## 7. Solução de Problemas

### ❌ "API Key inválida" ou "Invalid API Key"
1. **Verifique o formato:** Deve começar com `AIzaSyC...`
2. **Confirme as APIs ativadas:** Google Sheets API + Google Drive API
3. **Restrições da API Key:** Certifique-se de que as APIs corretas estão liberadas
4. **Regenerar:** Se não funcionar, crie uma nova API Key

### ❌ "Client ID não encontrado" ou "OAuth error"
1. **Formato correto:** Deve terminar com `.googleusercontent.com`
2. **Authorized origins:** Adicione `http://localhost:3000` e `http://127.0.0.1:3000`
3. **OAuth Consent Screen:** Deve estar configurado (mesmo que básico)
4. **Status:** Verifique se o OAuth client está "ativo"

### ❌ "Planilha não encontrada" ou "Permission denied"
1. **Spreadsheet ID correto:** Copie da URL entre `/d/` e `/edit`
2. **Compartilhamento:** Planilha deve estar como "Anyone with the link can edit"
3. **Teste manual:** Abra a URL da planilha em aba anônima
4. **Abas corretas:** Certifique-se de ter as 3 abas: Produtos, Clientes, Pedidos

### ❌ Botão "🔗 Testar Conexão" não funciona

#### Verificações Básicas:
1. **Todos os campos preenchidos:**
   - ✅ API Key: `AIzaSyC...` (39-40 caracteres)
   - ✅ Client ID: `...googleusercontent.com`
   - ✅ Spreadsheet ID: `1ABC...XYZ` (44 caracteres)

2. **Aguarde 5-10 segundos** - API pode demorar para responder

3. **Navegador compatível:** Chrome, Edge, Firefox atualizado

#### Configurações que DEVEM estar corretas no Google Cloud:

**🔧 APIs Ativadas (obrigatório):**
- ✅ Google Sheets API
- ✅ Google Drive API

**🔧 API Key Restrictions:**
- **API restrictions:** "Restrict key" ✅
- **Select APIs:** Google Sheets API + Google Drive API ✅
- **Application restrictions:** None (ou HTTP referrers se souber configurar)

**🔧 OAuth Client ID:**
- **Application type:** Web application ✅
- **Authorized JavaScript origins:**
  - `https://SEU-USUARIO.github.io` ✅ (substitua pelo seu usuário GitHub)
  - `http://localhost:3000` ✅ (para testes locais)
  - `http://localhost:8000` ✅ (para testes locais)
  - `http://127.0.0.1:3000` ✅ (para testes locais)

**🔧 Planilha Google Sheets:**
- **Compartilhamento:** "Anyone with the link" + "Editor" ✅
- **3 Abas criadas:** Produtos, Clientes, Pedidos ✅
- **Cabeçalhos na linha 1** de cada aba ✅

#### Se ainda não funcionar:
4. **Console do navegador:** F12 → Console → veja mensagem de erro específica
5. **Teste em aba anônima** (pode ser problema de cache/cookies)

### ❌ Dados não aparecem na planilha
1. **Clique no botão 💾** (sincronizar) manualmente
2. **Verifique a internet:** Indicador deve mostrar "☁️ Online"
3. **Abas da planilha:** Dados aparecem nas abas Produtos, Clientes, Pedidos
4. **Aguarde:** Primeira sincronização pode demorar alguns minutos

### 🔍 **Como Diagnosticar Erros:**

#### 1. Verificar Console do Navegador (F12):
1. **Abra a aplicação** Leo's Cake
2. **Pressione F12** → Aba **"Console"**
3. **Clique "🔗 Testar Conexão"**
4. **Veja as mensagens de erro** no console

**Erros Comuns e Soluções:**

**❌ `Failed to load gapi`**
- **Problema:** Biblioteca Google não carregou
- **Solução:** Recarregue a página, verifique internet

**❌ `API key not valid`**
- **Problema:** API Key incorreta ou sem permissões
- **Solução:** Verifique formato `AIzaSyC...` e APIs ativadas

**❌ `Client ID not found`**
- **Problema:** Client ID incorreto
- **Solução:** Copie novamente do Google Cloud Console

**❌ `Access blocked: Request to API is not allowed`**
- **Problema:** JavaScript origins não configurados
- **Solução:** Adicione `http://localhost:3000` no OAuth Client

**❌ `Spreadsheet not found`**
- **Problema:** ID da planilha incorreto ou sem permissão
- **Solução:** Verifique compartilhamento "Anyone with link can edit"

#### 2. Teste Passo a Passo:
1. **Teste 1 - API Key:**
   - Cole apenas a API Key
   - Deixe outros campos vazios
   - Clique "Testar Conexão"
   - Deve aparecer erro específico sobre Client ID

2. **Teste 2 - Client ID:**
   - Adicione o Client ID
   - Ainda sem Spreadsheet ID
   - Teste novamente
   - Deve aparecer erro sobre planilha

3. **Teste 3 - Planilha:**
   - Adicione Spreadsheet ID
   - Teste completo
   - Deve funcionar

### 🆘 **Se nada funcionar:**
1. **Compartilhe o erro:** Copie a mensagem exata do Console (F12)
2. **Teste com nova planilha:** Crie uma planilha do zero
3. **Teste com novo projeto:** Crie novo projeto no Google Cloud
4. **Modo incógnito:** Teste em aba anônima/incógnita

## 8. Próximos Passos

Após configurar:
1. Teste a conexão nas configurações
2. Faça backup dos dados locais existentes
3. Teste sincronização com dados de exemplo
4. Configure sincronização automática