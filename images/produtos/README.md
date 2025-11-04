# Imagens dos Produtos - Leo's Cake

Esta pasta contém as imagens dos produtos do sistema.

## 📁 Estrutura

As imagens dos produtos devem ser organizadas seguindo o padrão definido no banco de dados:

### Exemplos de arquivos esperados:
- `torta-chocolate-1.jpg` - Imagem principal da torta de chocolate
- `torta-chocolate-2.jpg` - Fatia da torta
- `torta-chocolate-3.jpg` - Detalhe da cobertura
- `cupcake-red-velvet-1.jpg` - Cupcake individual
- `cupcake-red-velvet-2.jpg` - Kit com 6 cupcakes
- `bolo-aniversario-1.jpg` - Modelo 1
- `bolo-aniversario-2.jpg` - Modelo 2
- `bolo-aniversario-3.jpg` - Modelo 3
- `bolo-aniversario-4.jpg` - Decoração especial
- `default.jpg` - Imagem padrão quando não há foto

## 🎨 Especificações Técnicas

### Formatos aceitos:
- JPG/JPEG (recomendado)
- PNG (para imagens com transparência)
- WebP (para melhor performance)

### Dimensões recomendadas:
- **Largura:** 800px - 1200px
- **Altura:** 600px - 900px
- **Proporção:** 4:3 ou 16:10 (horizontal)
- **Tamanho máximo:** 2MB por imagem

### Qualidade:
- Resolução: 72-150 DPI
- Compressão: Alta qualidade (85-95%)
- Iluminação: Boa iluminação natural
- Fundo: Preferencialmente neutro ou clean

## 📋 Como adicionar novas imagens:

1. **Pelo sistema:**
   - Acesse a seção "Produtos" no dashboard
   - Clique em "Gerenciar imagens" no produto
   - Adicione a URL da imagem hospedada

2. **Upload direto:**
   - Coloque os arquivos nesta pasta
   - Use nomes descritivos
   - Mantenha o padrão: `nome-produto-numero.extensao`

## 🌐 URLs das imagens no sistema:

As imagens devem ser referenciadas no formato:
```
images/produtos/nome-do-arquivo.jpg
```

Exemplo:
```
images/produtos/torta-chocolate-1.jpg
```

## 📱 Responsividade

O sistema automaticamente otimiza as imagens para:
- Desktop: Tamanho original
- Tablet: Redimensionamento proporcional
- Mobile: Compressão adicional para performance

## 🔄 Carrossel

Cada produto pode ter até **5 imagens** que são exibidas em carrossel:
- Navegação por setas
- Indicadores de posição
- Auto-play opcional
- Suporte a touch/swipe
- Zoom ao clicar (futuro)

## 💡 Dicas para melhores fotos:

1. **Iluminação:** Use luz natural sempre que possível
2. **Ângulos:** Capture diferentes perspectivas
3. **Detalhes:** Mostre texturas e acabamentos
4. **Contexto:** Inclua uma foto do produto servido
5. **Consistência:** Mantenha o mesmo estilo visual

## 🚀 Performance

Para melhor performance:
- Otimize as imagens antes do upload
- Use ferramentas como TinyPNG ou ImageOptim
- Considere usar WebP para navegadores modernos
- Mantenha backup das imagens originais