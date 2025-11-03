# 🚀 Deploy no GitHub Pages - Leo's Cake

## Vantagens do GitHub Pages
- ✅ **URL HTTPS** - resolve problemas com Google API
- ✅ **Gratuito** - para repositórios públicos
- ✅ **Fácil atualização** - git push automático
- ✅ **Acesso global** - funciona de qualquer lugar
- ✅ **Backup do código** - versionamento completo

## 🔐 **Segurança dos Dados**
- **✅ Código público** - apenas a estrutura do sistema
- **✅ Sistema com login** - tela de autenticação protege acesso
- **✅ Dados privados** - clientes/pedidos ficam no seu navegador (LocalStorage) 
- **✅ Backup seguro** - Google Sheets com sua conta
- **✅ API Keys** - você configura suas próprias credenciais
- **✅ Senha personalizada** - defina sua própria senha de acesso

## 1. Criar Repositório no GitHub

### Passo 1: Criar Repositório
1. Acesse: https://github.com
2. Clique em **"New repository"** (botão verde)
3. **Repository name:** `leos-cake-sistema`
4. **Descrição:** "Sistema de Pré-Vendas - Leo's Cake"
5. ✅ Deixe **"Public"** (repositório público - necessário para GitHub Pages gratuito)
6. ✅ Marque **"Add a README file"**
7. Clique **"Create repository"**

> ⚠️ **Nota:** GitHub Pages gratuito só funciona com repositórios públicos. Seus dados (clientes, pedidos) ficam seguros no LocalStorage e Google Sheets, apenas o código ficará público.

### Passo 2: Alterar Repositório para Público (Se Criou Privado)
**⚠️ Se seu repositório já está como privado, precisa alterar para público:**

1. **No seu repositório**, clique na aba **"Settings"**
2. **Role até o final da página** → seção **"Danger Zone"**
3. **Clique em "Change repository visibility"**
4. **Selecione "Make public"**
5. **Digite o nome do repositório** para confirmar
6. **Clique "I understand, change repository visibility"**

### Passo 3: Ativar GitHub Pages
1. **Ainda em Settings**, role até a seção **"Pages"** (menu lateral esquerdo)
2. Em **"Source"**, selecione **"Deploy from a branch"**
3. Em **"Branch"**, selecione **"main"**
4. Em **"Folder"**, deixe **"/ (root)"**
5. Clique **"Save"**
6. **Aguarde 2-3 minutos** - GitHub vai processar
7. **Copie a URL** que aparecerá: `https://SEU-USUARIO.github.io/leos-cake-sistema`

## 2. Fazer Upload dos Arquivos

> 💡 **Se já tem repositório privado:** Siga o Passo 2 acima para tornar público primeiro, depois continue aqui.

### Opção A: Interface Web do GitHub (Mais Fácil)
1. No seu repositório, clique **"Add file"** → **"Upload files"**
2. **Arraste todos os arquivos** da pasta Leo's Cake:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - Pasta `css/` completa
   - Pasta `js/` completa
   - Pasta `images/` completa
3. **Commit message:** "Adicionar sistema Leo's Cake"
4. Clique **"Commit changes"**

### Opção B: Git na Linha de Comando
```bash
# Clonar o repositório
git clone https://github.com/SEU-USUARIO/leos-cake-sistema.git
cd leos-cake-sistema

# Copiar seus arquivos para esta pasta
# (copie todos os arquivos da pasta Leo's Cake)

# Adicionar e enviar
git add .
git commit -m "Adicionar sistema Leo's Cake"
git push origin main
```

## 3. Configurar Google Cloud Console

### Atualizar OAuth Client ID:
1. Acesse: https://console.cloud.google.com
2. Vá em **"APIs & Services"** → **"Credentials"**
3. Clique no seu **OAuth 2.0 Client ID**
4. Em **"Authorized JavaScript origins"**, adicione:
   - `https://SEU-USUARIO.github.io` ⚠️ **Substitua pelo seu usuário**
   - Exemplo: `https://joaosilva.github.io`
5. **⚠️ IMPORTANTE:** **NÃO** adicione `/leos-cake-sistema` no final
6. **⚠️ IMPORTANTE:** **NÃO** termine com `/`
7. **Remova ou mantenha** as URLs localhost para testes locais
8. Clique **"Save"**

### ⚠️ Exemplo Real:
Se seu usuário GitHub é `leocakesystem`, a URL do seu site será:
```
https://leocakesystem.github.io/leos-cake-sistema
```

**Mas no Google Cloud Console, adicione APENAS:**
```
https://leocakesystem.github.io
```

### ❌ **ERRADO (vai dar erro):**
- `https://leocakesystem.github.io/leos-cake-sistema` ❌ (tem caminho)
- `https://leocakesystem.github.io/` ❌ (termina com /)

### ✅ **CORRETO:**
- `https://leocakesystem.github.io` ✅ (só o domínio)

## 4. Testar o Sistema

### Passo 1: Aguardar Deploy
- ⏱️ **Primeiro deploy:** 5-10 minutos
- 🔄 **Atualizações:** 1-2 minutos
- 📍 **Status:** Vá em Settings → Pages para ver status

### Passo 2: Acessar Sistema
1. **Abra a URL:** `https://SEU-USUARIO.github.io/leos-cake-sistema`
2. **Aguarde carregar** - pode demorar alguns segundos
3. **Vá para Configurações** (⚙️)
4. **Configure Google Sheets** com suas credenciais
5. **Teste a conexão** - agora deve funcionar! ✅

## 5. Como Atualizar o Sistema

### Quando fizer mudanças no código:

**Opção A: Interface Web**
1. Vá no seu repositório GitHub
2. Navegue até o arquivo que quer editar
3. Clique no ícone ✏️ (lápis) para editar
4. Faça as mudanças
5. Clique **"Commit changes"**
6. **Aguarde 1-2 minutos** para atualizar online

**Opção B: Upload de Arquivos**
1. Clique **"Add file"** → **"Upload files"**
2. Arraste os arquivos atualizados
3. Marque **"Replace existing files"**
4. Commit e aguarde atualizar

**Opção C: Git Command Line**
```bash
# Fazer mudanças nos arquivos locais
git add .
git commit -m "Atualizar funcionalidade X"
git push origin main
```

## 6. Verificações Importantes

### ✅ Checklist Pré-Deploy:
- [ ] **Todas as imagens** estão na pasta `images/`
- [ ] **Caminhos relativos** (não absolutos) nos arquivos
- [ ] **Sem referências** a `C:\Users\...` no código
- [ ] **Arquivo index.html** na raiz do repositório

### ✅ Checklist Pós-Deploy:
- [ ] **Site carrega** sem erros 404
- [ ] **CSS e JS** carregam corretamente
- [ ] **Imagens** aparecem normalmente
- [ ] **PWA** funciona (pode instalar no celular)
- [ ] **Google Sheets** conecta sem erros

## 7. Resolução de Problemas

### ❌ "404 - Page not found"
- **Causa:** GitHub Pages ainda processando
- **Solução:** Aguarde 5-10 minutos e recarregue

### ❌ "CSS/JS não carrega"
- **Causa:** Caminhos incorretos nos arquivos
- **Solução:** Verificar se caminhos são relativos (`./css/` não `/css/`)

### ❌ "Imagens não aparecem"
- **Causa:** Imagens não foram enviadas ou caminhos errados
- **Solução:** Verificar pasta `images/` no repositório

### ❌ "Google API ainda não funciona"
- **Causa:** OAuth origins não atualizados
- **Solução:** Verificar URL exata no Google Cloud Console

## 8. URLs Importantes

### Seu Sistema:
- **URL Principal:** `https://SEU-USUARIO.github.io/leos-cake-sistema`
- **Repositório:** `https://github.com/SEU-USUARIO/leos-cake-sistema`

### Para Configurar:
- **Google Cloud Console:** https://console.cloud.google.com
- **Google Sheets:** https://sheets.google.com
- **GitHub:** https://github.com

## 9. Próximos Passos

1. **Criar repositório** no GitHub
2. **Fazer upload** dos arquivos
3. **Ativar GitHub Pages**
4. **Aguardar deploy** (5-10 minutos)
5. **Atualizar Google Cloud** com nova URL
6. **Testar conexão** Google Sheets
7. **Compartilhar URL** para usar o sistema

---

### 🎉 **Resultado Final:**
Seu sistema estará rodando em uma URL HTTPS profissional, acessível de qualquer lugar, com backup automático no GitHub!

### 💡 **Dica Extra:**
Você pode criar um domínio personalizado (opcional):
- Exemplo: `leos-cake.com.br` → GitHub Pages
- Configuração em Settings → Pages → Custom domain