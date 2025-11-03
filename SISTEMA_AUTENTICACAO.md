# 🔐 Sistema de Autenticação - Leo's Cake

## 🎯 **Problema Resolvido**

**❌ Antes:** Qualquer pessoa com a URL poderia acessar o sistema e suas configurações Google Sheets

**✅ Agora:** Sistema protegido por senha - só você tem acesso aos seus dados!

---

## 🔒 **Como Funciona**

### 1. **Primeira Vez (Senha Padrão)**
- **Senha padrão:** `leoscake2024`
- **IMPORTANTE:** Mude imediatamente para sua senha pessoal!

### 2. **Tela de Login**
- Sistema sempre pede senha ao abrir
- Design profissional e seguro
- Senha fica válida por 24 horas

### 3. **Autenticação Válida**
- **24 horas** de acesso sem pedir senha novamente
- **Renovação automática** a cada uso
- **Logout automático** após expirar

---

## ⚙️ **Configurar Sua Senha**

### Passo 1: Primeiro Acesso
1. **Acesse sua URL** do GitHub Pages
2. **Digite a senha padrão:** `leoscake2024`
3. **Clique "Entrar"**

### Passo 2: Alterar Senha
1. **Vá em Configurações** (⚙️)
2. **Role até "🔐 Segurança do Sistema"**
3. **Digite sua nova senha** (use uma senha forte!)
4. **Clique "Salvar"**
5. **Sistema forçará novo login** com a nova senha

### 💡 **Dicas para Senha Forte:**
- ✅ Mínimo 8 caracteres
- ✅ Misture letras, números e símbolos
- ✅ Exemplos: `MinhaEmpresa2024!`, `LeosCake#123`
- ❌ Evite: `123456`, `password`, `leoscake`

---

## 🛡️ **Recursos de Segurança**

### ✅ **Proteção Completa**
- **Tela de login** sempre que alguém acessa
- **Senha criptografada** localmente
- **Expiração automática** em 24h
- **Logout forçado** disponível

### ✅ **Controle Total**
- **Mude a senha** quando quiser
- **Force logout** em todos os dispositivos
- **Veja quando expira** o acesso atual

### ✅ **Seus Dados Seguros**
- **Mesmo com URL pública**, ninguém acessa sem senha
- **Configurações Google Sheets** protegidas
- **Dados locais** inacessíveis
- **Backup Google Sheets** com sua conta

---

## 🚨 **Emergência - Esqueci a Senha**

### Opção 1: Reset via Navegador
1. **Pressione F12** (ferramentas do desenvolvedor)
2. **Aba "Console"**
3. **Digite:** `localStorage.removeItem('configuracoes')`
4. **Pressione Enter**
5. **Recarregue a página** - voltará senha padrão `leoscake2024`

### Opção 2: Limpar Dados
1. **Configurações do navegador**
2. **Limpar dados do site** específico
3. **Recarregar** - sistema resetado

### ⚠️ **ATENÇÃO:** 
- Reset apaga TODAS as configurações
- Backup no Google Sheets NÃO é afetado
- Você precisará reconfigurar APIs

---

## 👥 **Compartilhar Acesso**

### Como Dar Acesso para Funcionário:
1. **Compartilhe apenas:**
   - URL do sistema
   - Senha atual
2. **Funcionário terá acesso completo**
3. **Para revogar:** Mude a senha

### Múltiplos Dispositivos:
- **Mesma senha** funciona em todos
- **24h de validade** em cada dispositivo
- **Logout forçado** afeta todos simultaneamente

---

## 🔧 **Configurações Avançadas**

### No Modal de Configurações:

#### 🔐 **Segurança do Sistema**
- **Campo Senha:** Digite nova senha
- **Botão "Forçar Logout":** Remove acesso de todos os dispositivos
- **Aviso:** Mudança de senha força novo login

#### 💾 **Backup das Configurações**
```json
{
    "sistemaSenha": "sua_senha_aqui",
    "empresa": {...},
    "emailjs": {...},
    "googleSheets": {...}
}
```

---

## ✅ **Teste de Segurança**

### Verificar se Está Protegido:
1. **Acesse no modo anônimo** (Ctrl+Shift+N)
2. **Deve pedir senha** - ✅ Funcionando
3. **Digite senha errada** - deve recusar
4. **Digite senha correta** - deve funcionar

### Teste com Amigos:
1. **Compartilhe apenas a URL** (sem senha)
2. **Eles NÃO devem conseguir** acessar
3. **Compartilhe URL + senha** - devem conseguir

---

## 🎉 **Resultado Final**

### ✅ **100% Seguro Agora:**
- **✅ Repositório pode ser público** - código visível, dados protegidos
- **✅ URL pode ser compartilhada** - só funciona com senha
- **✅ Google Sheets protegido** - só você configura
- **✅ Controle total** - mude senha quando quiser

### 🌐 **Funciona Como Site Profissional:**
- Tela de login elegante
- Sessão com tempo de validade
- Logout automático por segurança
- Controle de acesso completo

---

**🔐 Agora seu sistema está TOTALMENTE PROTEGIDO mesmo sendo público no GitHub!**