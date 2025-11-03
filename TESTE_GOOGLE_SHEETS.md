# 🧪 Teste da Conexão Google Sheets

## Passos para Testar as Melhorias

### 1. Abra o Sistema
- Acesse `index.html` no navegador
- Vá para a aba "Configurações" (⚙️)

### 2. Configure Google Sheets
- Clique em "Google Sheets"
- Preencha os campos conforme o arquivo `GOOGLE_SHEETS_SETUP.md`

### 3. Teste a Conexão
- Clique no botão "Testar Conexão"
- **OBSERVE** as mensagens específicas que aparecerão:

#### ✅ Mensagens de Sucesso:
- `✅ Conectado: Nome da Planilha`

#### ❌ Mensagens de Erro Específicas:
- `❌ API Key não preenchida`
- `❌ API Key deve começar com "AIza"`
- `❌ Client ID deve terminar com "googleusercontent.com"`
- `❌ Spreadsheet ID muito curto`
- `❌ Google API não carregada - recarregue a página`
- `❌ Erro: API Key inválida ou sem permissões`
- `❌ Erro: Planilha sem permissão de acesso`
- `❌ Erro: Sem permissão (verifique APIs ativadas)`
- `❌ Erro: Planilha não encontrada (verifique ID)`
- `❌ Erro: Configuração inválida (verifique credenciais)`

### 4. Diagnóstico Avançado
Se aparecer erro, **pressione F12** e vá na aba "Console":

#### Mensagens de Log que Você Verá:
```
🔍 Testando conexão com: { apiKey: "AIza...", clientId: "123...", spreadsheetId: "abc..." }
📡 Inicializando Google API Client...
✅ Google API Client inicializado
✅ Planilha acessada: { properties: { title: "..." } }
```

#### Erros Comuns no Console:
```
❌ Erro detalhado: { status: 403, result: { error: { message: "..." } } }
```

### 5. Status Visual Melhorado
- O indicador de sincronização agora mostra mensagens mais específicas
- Mensagens de erro têm tooltip ao passar o mouse
- Animação durante conexão

### 6. Se Ainda Não Funcionar
1. **Copie EXATAMENTE** a mensagem de erro que aparece
2. **Copie** o erro do console (F12)
3. **Envie** essas informações para análise

## 🚀 Próximos Passos
Depois que a conexão funcionar:
- Teste "Sincronizar Agora"
- Verifique se os dados aparecem na planilha
- Teste a sincronização automática

---
*Sistema atualizado com diagnósticos avançados e mensagens específicas*