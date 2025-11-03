# ❌ Erro OAuth: "Invalid Origin: URIs must not contain a path"

## 🎯 **O Que Aconteceu:**
Você tentou adicionar uma URL com caminho (ex: `/leos-cake-sistema`) ou que termina com `/`, mas o Google só aceita **domínios puros**.

---

## ✅ **Solução Rápida:**

### **No Google Cloud Console:**
1. **Vá em APIs & Services** → **Credentials**
2. **Clique no seu OAuth 2.0 Client ID**
3. **Em "Authorized JavaScript origins"**:

### **❌ REMOVA (se adicionou):**
- `https://seu-usuario.github.io/leos-cake-sistema` ❌
- `https://seu-usuario.github.io/` ❌
- Qualquer URL que termine com `/` ❌

### **✅ ADICIONE APENAS:**
- `https://seu-usuario.github.io` ✅

### **4. Clique "Save"**

---

## 📝 **Exemplos Práticos:**

### **Se seu usuário GitHub é `joaosilva`:**
- **❌ ERRADO:** `https://joaosilva.github.io/leos-cake-sistema`
- **❌ ERRADO:** `https://joaosilva.github.io/`
- **✅ CORRETO:** `https://joaosilva.github.io`

### **Se seu usuário GitHub é `mariacake`:**
- **❌ ERRADO:** `https://mariacake.github.io/leos-cake-sistema`
- **❌ ERRADO:** `https://mariacake.github.io/`
- **✅ CORRETO:** `https://mariacake.github.io`

---

## 🤔 **"Mas Meu Site Está em /leos-cake-sistema!"**

### **✅ Isso é NORMAL e FUNCIONA:**
- **Seu site:** `https://usuario.github.io/leos-cake-sistema`
- **OAuth origin:** `https://usuario.github.io` (sem o caminho)

### **🔧 Como Funciona:**
- Google API verifica **apenas o domínio** (`usuario.github.io`)
- **Não importa** qual página específica (`/leos-cake-sistema`)
- É como dar permissão para **todo o domínio**

---

## 🔍 **Verificar Se Está Correto:**

### **1. No Google Cloud Console:**
```
Authorized JavaScript origins:
✅ https://seu-usuario.github.io
✅ http://localhost:3000 (opcional, para testes)
```

### **2. Teste de Validação:**
- **URL não deve ter** `/` no final
- **URL não deve ter** caminhos como `/pasta`
- **URL deve começar** com `https://`
- **URL deve ser** só o domínio GitHub

---

## 🚀 **Após Corrigir:**

### **1. Aguarde 2-3 minutos**
- Google precisa propagar as mudanças

### **2. Teste o Sistema:**
1. **Acesse:** `https://seu-usuario.github.io/leos-cake-sistema`
2. **Faça login** com a senha
3. **Vá em Configurações** → **Google Sheets**
4. **Teste conexão** - agora deve funcionar! ✅

### **3. Se Ainda Não Funcionar:**
- **Aguarde mais 5 minutos** (pode demorar)
- **Recarregue a página** do sistema
- **Teste em aba anônima** (Ctrl+Shift+N)

---

## 📋 **Checklist Final:**

### **✅ Google Cloud Console:**
- [ ] OAuth Client ID criado
- [ ] Authorized JavaScript origins: `https://seu-usuario.github.io`
- [ ] **SEM** `/` no final
- [ ] **SEM** caminhos como `/leos-cake-sistema`
- [ ] APIs ativadas: Google Sheets API + Google Drive API

### **✅ Sistema:**
- [ ] Site carregando: `https://seu-usuario.github.io/leos-cake-sistema`
- [ ] Login funcionando
- [ ] Configurações → Google Sheets abre
- [ ] Teste de conexão passa

---

## 🎉 **Resultado:**
Com a URL correta no OAuth, o Google API vai funcionar perfeitamente com seu site no GitHub Pages!

**A regra é simples: OAuth quer apenas o domínio, sem caminhos ou barras extras!** ✅