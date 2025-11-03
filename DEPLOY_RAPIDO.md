# 🚀 Guia Rápido - Deploy no GitHub Pages

## ⚡ **Passos Essenciais**

### 1. **Criar Repositório**
1. Vá em: https://github.com/new
2. **Nome:** `leos-cake-sistema`
3. ✅ **Private**
4. ✅ **Add README**
5. **Create repository**

### 2. **Upload dos Arquivos**
1. **"Add file"** → **"Upload files"**
2. **Arraste TODOS os arquivos:**
   - `index.html`
   - `manifest.json` 
   - `sw.js`
   - Pasta `css/`
   - Pasta `js/`
   - Pasta `images/`
   - `*.md` (documentação)
3. **Commit:** "Sistema Leo's Cake completo"

### 3. **Ativar GitHub Pages**
1. **Settings** → **Pages**
2. **Source:** Deploy from branch
3. **Branch:** main
4. **Folder:** / (root)
5. **Save**
6. ⏱️ **Aguarde 5-10 minutos**

### 4. **Sua URL**
```
https://SEU-USUARIO.github.io/leos-cake-sistema
```

### 5. **Configurar Google API**
1. Google Cloud Console
2. OAuth Client ID
3. **Adicionar origem:**
   ```
   https://SEU-USUARIO.github.io
   ```

## ✅ **Pronto!**
Seu sistema estará online com URL HTTPS segura!