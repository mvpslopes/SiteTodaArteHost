# Logos dos Parceiros

## 📁 Onde colocar os logos

Coloque os arquivos de logo das empresas parceiras nesta pasta (`public/partners/`).

## 📐 Dimensões Recomendadas

### Tamanho ideal:
- **Largura**: 200px a 300px
- **Altura**: 80px a 120px
- **Proporção**: Mantenha a proporção original da logo
- **Formato**: PNG (com fundo transparente) ou SVG (preferível)

### Exemplos de dimensões:
- **Logo horizontal**: 300px x 100px
- **Logo quadrado**: 150px x 150px
- **Logo vertical**: 120px x 200px

## 🎨 Especificações Técnicas

- **Formato**: PNG (transparente) ou SVG
- **Resolução**: Mínimo 72 DPI (para web)
- **Tamanho do arquivo**: Máximo 200KB por logo
- **Fundo**: Transparente (preferível) ou branco

## 📝 Como usar no código

No arquivo `src/pages/WebDevelopment.tsx`, use o caminho:

```typescript
const partners = [
  { 
    name: 'Nome da Empresa', 
    logo: '/partners/logo-empresa.png', 
    website: 'https://site.com' 
  }
];
```

## ✅ Checklist

- [ ] Logo em formato PNG ou SVG
- [ ] Fundo transparente (se possível)
- [ ] Dimensões entre 200-300px de largura
- [ ] Arquivo otimizado (menos de 200KB)
- [ ] Nome do arquivo descritivo (ex: `logo-hostinger.png`)

