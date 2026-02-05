# 📐 Especificações das Imagens do Hero

## 📱 HERO MOBILE

### Imagem: `hero-mobile.png`

**Dimensões da Imagem:**
- **Largura:** 1080px
- **Altura:** 1920px
- **Proporção:** 0.56:1 (vertical/portrait)
- **Formato:** PNG

**Como é usada:**
- A imagem é exibida com `width: 100%` e `height: auto`
- Altura mínima: `calc(100vh - 5rem)` (altura da viewport menos 80px do header)
- A imagem contém TODOS os elementos: background, textos, imagem das meninas, etc.
- O botão "Conheça nosso trabalho" é posicionado absolutamente sobre a imagem

**Recomendações para criar/editar:**
- **Resolução ideal:** 1080x1920px (9:16 - proporção de celular)
- **Formato:** PNG (para manter qualidade e transparência se necessário)
- **Orientação:** Vertical (portrait)
- **Tamanho do arquivo:** Otimizar para web (máximo 1-2MB)

---

## 💻 HERO DESKTOP

### Background
- **Tipo:** Gradiente CSS (não é uma imagem)
- **Código:** `linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 25%, #d4c4b0 50%, #c9b8a3 75%, #b8a690 100%)`

### Imagem das Meninas: `Thaty_Lara.png`

**Dimensões da Imagem Original:**
- **Largura:** 1540px
- **Altura:** 1549px
- **Proporção:** 0.99:1 (quase quadrada)
- **Formato:** PNG

**Como é exibida:**
- **Largura exibida:** 600px (altura automática para manter proporção)
- **Posição:** `top: 60%`, `left: 80%` (canto inferior direito)
- **Z-index:** 13 (sobre textos e botão)

**Elementos adicionais no Desktop:**
- Texto "Seu Negócio Seu Sucesso" - posicionado absolutamente
- Texto "Conecte" - posicionado absolutamente
- Botão "Conheça nosso trabalho" - posicionado absolutamente

**Recomendações para criar/editar:**
- **Resolução ideal:** 1200x1200px ou maior (mantendo proporção quadrada)
- **Formato:** PNG (para manter transparência do fundo)
- **Tamanho do arquivo:** Otimizar para web (máximo 500KB-1MB)

---

## 📊 Resumo Comparativo

| Aspecto | Mobile | Desktop |
|---------|--------|---------|
| **Imagem principal** | hero-mobile.png (1080x1920px) | Gradiente CSS + Thaty_Lara.png |
| **Orientação** | Vertical (portrait) | Horizontal (landscape) |
| **Largura exibida** | 100% da tela | 600px (imagem das meninas) |
| **Altura** | Auto (mín. 100vh - 5rem) | 100vh - 5rem |
| **Elementos** | Tudo na imagem | Elementos posicionados separadamente |

---

## 🎨 Dicas de Design

### Para Mobile:
- Use proporção 9:16 (1080x1920px)
- Certifique-se de que textos e elementos estão legíveis em telas pequenas
- Mantenha elementos importantes no centro e parte superior
- O botão será posicionado na parte inferior (10% do topo)

### Para Desktop:
- A imagem das meninas pode ser maior que 600px (será redimensionada)
- Mantenha fundo transparente na imagem das meninas
- O gradiente de fundo pode ser ajustado no arquivo `src/config/hero.config.desktop.ts`

---

## 📝 Arquivos de Configuração

- **Desktop:** `src/config/hero.config.desktop.ts`
- **Mobile:** `src/config/hero.config.mobile.ts`
- **Componente:** `src/components/landing/Hero.tsx`
