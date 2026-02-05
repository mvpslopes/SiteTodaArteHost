# 📐 Dimensões do Hero - Mobile e Desktop

## 📱 MOBILE

### Dimensão Recomendada: **1080px × 1920px** (9:16 - Portrait)

**Por quê?**
- ✅ Proporção vertical (portrait) - ideal para celulares
- ✅ Altura de 1920px cobre bem a altura de telas mobile (geralmente 667px - 896px de altura visível)
- ✅ Largura de 1080px é maior que qualquer tela mobile, garantindo qualidade em telas Retina
- ✅ Com `width: 100%` e `height: auto`, a imagem se adapta perfeitamente

### Especificações Técnicas Mobile:

| Aspecto | Valor |
|---------|-------|
| **Largura** | 1080px |
| **Altura** | 1920px |
| **Proporção** | 9:16 (portrait/vertical) |
| **Orientação** | Vertical |
| **Formato** | PNG ou JPG |
| **Tamanho do arquivo** | Máximo 500KB-1MB |
| **DPI** | 72 DPI (web) |

### Como é Exibida:
- **Largura:** 100% da tela (geralmente 375px - 414px)
- **Altura:** Automática (mantém proporção)
- **Altura mínima:** `calc(100vh - 5rem)` ≈ 667px - 896px (dependendo do dispositivo)
- **Object-fit:** `cover` (preenche toda a área)

### Dispositivos Mobile Comuns:
- iPhone SE: 375 × 667px
- iPhone 12/13: 390 × 844px
- iPhone 14 Pro Max: 430 × 932px
- Samsung Galaxy: 360 × 800px até 412 × 915px

**Sua imagem de 1080px de largura cobre todos esses dispositivos com qualidade!**

---

## 💻 DESKTOP

### Dimensão Recomendada: **1920px × 1080px** (16:9 - Landscape)

**Por quê?**
- ✅ Proporção horizontal (landscape) - padrão para desktops
- ✅ Resolução Full HD (1920×1080) é a mais comum
- ✅ Altura de 1080px cobre bem a altura do viewport desktop
- ✅ Funciona perfeitamente em monitores de 1920px de largura

### Especificações Técnicas Desktop:

| Aspecto | Valor |
|---------|-------|
| **Largura** | 1920px |
| **Altura** | 1080px |
| **Proporção** | 16:9 (landscape/horizontal) |
| **Orientação** | Horizontal |
| **Formato** | PNG ou JPG |
| **Tamanho do arquivo** | Máximo 500KB-1MB |
| **DPI** | 72 DPI (web) |

### Como é Exibida:
- **Largura:** 100% da tela (geralmente 1920px em Full HD)
- **Altura:** `calc(100vh - 5rem)` ≈ 1000px (em tela Full HD)
- **Object-fit:** `cover` (preenche toda a área)

### Resoluções Desktop Comuns:
- Full HD: 1920 × 1080px (mais comum)
- HD: 1366 × 768px
- 2K: 2560 × 1440px
- 4K: 3840 × 2160px

**Sua imagem de 1920×1080px funciona bem em todas essas resoluções!**

---

## 📊 Comparação Visual

```
MOBILE (1080 × 1920px)          DESKTOP (1920 × 1080px)
┌─────────┐                     ┌──────────────────────────┐
│         │                     │                          │
│         │                     │                          │
│         │                     │                          │
│         │                     │                          │
│         │                     │                          │
│         │                     └──────────────────────────┘
│         │
│         │
│         │
│         │
│         │
└─────────┘
```

---

## 🎯 Resumo das Dimensões

| Dispositivo | Largura | Altura | Proporção | Orientação |
|-------------|---------|--------|-----------|------------|
| **Mobile** | 1080px | 1920px | 9:16 | Vertical (Portrait) |
| **Desktop** | 1920px | 1080px | 16:9 | Horizontal (Landscape) |

---

## 💡 Dicas Importantes

### Para Mobile (1080 × 1920px):
- ✅ Coloque elementos importantes no **centro** da imagem
- ✅ Textos devem ser legíveis mesmo quando a imagem for redimensionada
- ✅ Mantenha margens de segurança nas laterais (elementos não muito nas bordas)

### Para Desktop (1920 × 1080px):
- ✅ Elementos podem ser distribuídos horizontalmente
- ✅ Aproveite o espaço lateral para criar composições mais elaboradas
- ✅ Textos podem ser maiores e mais espaçados

---

## 📁 Estrutura de Arquivos Recomendada

```
public/
├── hero-mobile.png    (1080 × 1920px) - Para mobile
└── hero-desktop.png   (1920 × 1080px) - Para desktop
```

Ou se quiser usar a mesma imagem para ambos (não recomendado):
```
public/
└── hero.png           (1920 × 1080px) - Funciona em ambos, mas não é ideal
```

---

## ✅ Recomendação Final

**Crie DUAS imagens separadas:**
1. **hero-mobile.png**: 1080 × 1920px (vertical)
2. **hero-desktop.png**: 1920 × 1080px (horizontal)

Isso garante:
- ✅ Melhor experiência visual em cada dispositivo
- ✅ Elementos posicionados corretamente para cada orientação
- ✅ Melhor aproveitamento do espaço disponível
- ✅ Performance otimizada (cada dispositivo carrega apenas sua imagem)
