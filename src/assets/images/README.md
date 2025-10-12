# 📸 Guia de Imagens - Toda Arte Design Gráfico

## 🎯 Como Substituir as Imagens

### 📁 Estrutura de Pastas
```
src/assets/images/
├── hero/           # Imagens para seção Hero
├── portfolio/      # Imagens para portfólio de design
├── services/       # Imagens para serviços de design
├── team/           # Imagens para equipe criativa
├── gallery/        # Imagens para galeria de projetos
├── about/          # Imagens para seção sobre
├── testimonials/   # Imagens para depoimentos
└── imageConfig.ts  # Configuração centralizada
```

### 🔧 Como Alterar as Imagens

#### 1. **Método Simples - Editar URLs**
Abra o arquivo `src/assets/images/imageConfig.ts` e substitua as URLs:

```typescript
export const images = {
  hero: {
    main: 'SUA_NOVA_URL_AQUI',
    background: 'SUA_NOVA_URL_AQUI',
    // ...
  },
  // ...
};
```

#### 2. **Método Avançado - Imagens Locais**
1. Coloque suas imagens nas pastas correspondentes
2. Importe as imagens no `imageConfig.ts`:

```typescript
import heroImage from './hero/sua-imagem.jpg';

export const images = {
  hero: {
    main: heroImage,
    // ...
  },
  // ...
};
```

### 📏 Especificações Recomendadas

#### **Hero Section**
- **Resolução**: 1920x1080px (Full HD)
- **Formato**: JPG ou PNG
- **Tamanho**: Máximo 2MB
- **Estilo**: Imagens impactantes, alta qualidade

#### **Portfólio**
- **Resolução**: 800x600px
- **Formato**: JPG
- **Tamanho**: Máximo 500KB
- **Estilo**: Projetos de design, trabalhos realizados, boa qualidade

#### **Serviços**
- **Resolução**: 600x400px
- **Formato**: JPG
- **Tamanho**: Máximo 300KB
- **Estilo**: Representativo do serviço de design

#### **Equipe**
- **Resolução**: 400x400px (quadrado)
- **Formato**: JPG ou PNG
- **Tamanho**: Máximo 200KB
- **Estilo**: Fotos profissionais, fundo neutro

### 🎨 Dicas de Design

#### **Cores Recomendadas**
- **Primária**: Tons de roxo/roxo (#8B5CF6)
- **Secundária**: Tons de dourado/amarelo (#F59E0B)
- **Neutras**: Cinza, branco, preto

#### **Estilo Visual**
- **Elegante e sofisticado**
- **Alta qualidade**
- **Boa iluminação**
- **Composição equilibrada**

### 🔗 Fontes de Imagens Gratuitas

#### **Sites Recomendados**
- [Unsplash](https://unsplash.com) - Fotos gratuitas de alta qualidade
- [Pexels](https://pexels.com) - Banco de imagens gratuito
- [Pixabay](https://pixabay.com) - Imagens e ilustrações
- [Freepik](https://freepik.com) - Recursos gráficos (alguns gratuitos)

#### **Termos de Busca Úteis**
- "graphic design"
- "brand identity"
- "logo design"
- "packaging design"
- "editorial design"
- "corporate design"
- "visual identity"
- "design studio"
- "creative workspace"
- "design process"

### ⚡ Otimização de Performance

#### **Dicas Importantes**
1. **Comprima as imagens** antes de usar
2. **Use formatos modernos** (WebP quando possível)
3. **Mantenha tamanhos pequenos** para carregamento rápido
4. **Use lazy loading** para imagens abaixo da dobra

#### **Ferramentas de Otimização**
- [TinyPNG](https://tinypng.com) - Compressão de imagens
- [Squoosh](https://squoosh.app) - Editor de imagens online
- [ImageOptim](https://imageoptim.com) - Otimizador para Mac

### 🚀 Como Aplicar as Mudanças

1. **Desenvolvimento**: As mudanças aparecem automaticamente
2. **Produção**: Execute `npm run build` e faça upload dos arquivos

### 📝 Exemplo de Substituição

```typescript
// Antes
hero: {
  main: 'https://images.unsplash.com/photo-123...',
}

// Depois
hero: {
  main: 'https://images.unsplash.com/photo-456...',
}
```

### 🆘 Suporte

Se precisar de ajuda para substituir as imagens ou tiver dúvidas sobre o processo, entre em contato com a equipe de desenvolvimento.

---

**💡 Dica**: Mantenha sempre backups das imagens originais antes de fazer alterações!
