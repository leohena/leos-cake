# 🔒 Sistema de Configuração Segura - Leo's Cake

## ⚠️ Problemas de Segurança Resolvidos

O sistema anterior armazenava **configurações sensíveis no localStorage**, o que representava um risco de segurança. O novo sistema implementa:

- ✅ **Configurações sensíveis em arquivos externos**
- ✅ **Variáveis de ambiente para produção**
- ✅ **Separação entre dados públicos e privados**
- ✅ **Validação de configurações na inicialização**

## 🛠️ Como Configurar

### Opção 1: Arquivo config.json (Recomendado)

1. **Edite o arquivo `config.json`** na raiz do projeto:

```json
{
  "empresa": {
    "nome": "Leo's Cake",
    "telefone": "(11) 99999-9999",
    "endereco": "Sua rua, 123, Cidade - SP",
    "email": "contato@leoscake.com"
  },
  "supabase": {
    "url": "https://seu-projeto.supabase.co",
    "anonKey": "sua-chave-anonima-aqui",
    "realtime": true
  },
  "emailjs": {
    "serviceId": "service_xxxxxxx",
    "templateId": "template_xxxxxxx",
    "userId": "user_xxxxxxx"
  },
  "sistemaSenha": "sua_senha_segura_aqui",
  "security": {
    "allowConfigEdit": false,
    "requireHttps": true
  }
}
```

### Opção 2: Variáveis de Ambiente

1. **Copie o arquivo `.env.example`** para `.env`:
```bash
cp .env.example .env
```

2. **Configure suas variáveis**:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima-aqui
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxx
EMAILJS_USER_ID=user_xxxxxxx
```

## 🔐 Configurações de Segurança

### Ambientes

- **Desenvolvimento**: Permite edição via interface
- **Produção**: Configurações bloqueadas, apenas via arquivo/env

### Campos Sensíveis (Não ficam no localStorage)

- URLs do Supabase
- Chaves de API (Supabase, EmailJS)
- Configurações de conexão

### Campos Não-Sensíveis (Ficam no localStorage)

- Informações da empresa
- Senha do sistema
- Preferências do usuário

## 📊 Validação de Configurações

O sistema verifica automaticamente:

1. **Presença de configurações obrigatórias**
2. **Validade das URLs e chaves**
3. **Conexão com serviços externos**
4. **Compatibilidade entre configurações**

## 🚀 Inicialização

```javascript
// O sistema agora carrega configurações antes de iniciar
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await app.init(); // Carrega config.json + localStorage
    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
});
```

## 🛡️ Benefícios de Segurança

### Antes (Inseguro)
- ❌ Tudo no localStorage (visível no DevTools)
- ❌ URLs e chaves expostas no navegador  
- ❌ Configurações facilmente alteráveis
- ❌ Sem controle de ambiente

### Agora (Seguro)
- ✅ Configurações sensíveis em arquivos externos
- ✅ Variáveis de environment para produção
- ✅ Controle de acesso por ambiente
- ✅ Validação e sanitização automática

## 🔧 Interface de Configuração

### Modo Desenvolvimento
- Permite editar todas as configurações
- Mostra campos sensíveis
- Ideal para testes locais

### Modo Produção  
- Bloqueia edição de configurações sensíveis
- Exibe apenas campos seguros
- Força uso de config.json ou .env

## 📝 Migração de Dados Existentes

Se você já tinha configurações no localStorage:

1. **Backup**: Exporte suas configurações atuais
2. **Configure**: Transfira dados sensíveis para config.json
3. **Limpe**: O localStorage será limpo automaticamente
4. **Teste**: Verifique se tudo funciona corretamente

## ⚡ Exemplo Prático

```javascript
// Acessar configurações de forma segura
const supabaseUrl = configManager.get('supabase.url');
const empresaNome = configManager.get('empresa.nome');

// Verificar se está configurado
if (configManager.isConfigured()) {
    console.log('✅ Sistema configurado!');
} else {
    console.log('⚠️ Configure o sistema primeiro');
}

// Salvar apenas dados não-sensíveis
configManager.saveLocalConfig({
    empresa: { nome: "Novo Nome" },
    sistemaSenha: "nova_senha"
});
```

## 🎯 Próximos Passos

1. **Configure suas credenciais no config.json**
2. **Teste a conexão com Supabase**
3. **Configure EmailJS (opcional)**
4. **Defina uma senha segura**
5. **Faça backup das configurações**

---

## 🆘 Solução de Problemas

### "ConfigManager não disponível"
- Verifique se `config.js` está carregado antes de `app.js`

### "Configurações obrigatórias não encontradas"
- Configure `supabase.url` e `supabase.anonKey` no config.json

### "Erro ao carregar config.json"
- Verifique se o arquivo existe e tem JSON válido

### Configurações não salvam
- Em produção, edite apenas config.json
- Em desenvolvimento, use a interface web

---

**🔒 Lembre-se**: Nunca versione arquivos com credenciais reais no Git!