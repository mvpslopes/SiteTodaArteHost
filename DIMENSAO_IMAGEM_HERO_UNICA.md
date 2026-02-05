# 📐 Dimensão Ideal para Imagem Única do Hero

## 🎯 Recomendação Principal

### **Dimensão: 1920px × 1080px (16:9 - Landscape)**

**Por quê?**
- ✅ Funciona perfeitamente no desktop (resolução mais comum: 1920x1080px)
- ✅ Com `object-fit: cover` se adapta bem ao mobile (cortará as laterais)
- ✅ Proporção 16:9 é padrão para hero sections
- ✅ Altura de 1080px cobre bem a maioria das telas desktop (100vh geralmente é ~1080px em monitores Full HD)

---

## 📊 Análise Técnica

### Altura do Hero:
- **Desktop:** `calc(100vh - 5rem)` = aproximadamente **1000px** (em tela Full HD)
- **Mobile:** `calc(100vh - 5rem)` = aproximadamente **667px - 896px** (dependendo do dispositivo)

### Largura do Hero:
- **Desktop:** 100% da viewport (geralmente 1920px em Full HD)
- **Mobile:** 100% da viewport (geralmente 375px - 414px)

---

## 🎨 Opções de Dimensões

### Opção 1: **1920 × 1080px** ⭐ RECOMENDADA
- **Proporção:** 16:9 (landscape)
- **Uso:** Desktop e Mobile (com crop lateral no mobile)
- **Vantagem:** Padrão Full HD, funciona bem em ambos

### Opção 2: **2560 × 1440px** (2K)
- **Proporção:** 16:9 (landscape)
- **Uso:** Telas maiores (2K/4K)
- **Vantagem:** Melhor qualidade em monitores grandes
- **Desvantagem:** Arquivo maior

### Opção 3: **3840 × 2160px** (4K)
- **Proporção:** 16:9 (landscape)
- **Uso:** Telas 4K
- **Vantagem:** Máxima qualidade
- **Desvantagem:** Arquivo muito grande (não recomendado para web)

---

## 📱 Como Funcionará no Mobile

Com `object-fit: cover` e `width: 100%`:
- A imagem será **cortada nas laterais** para manter a proporção
- A altura será ajustada automaticamente
- **Importante:** Coloque elementos importantes no **centro** da imagem, pois as laterais serão cortadas em telas verticais

---

## 💻 Como Funcionará no Desktop

- A imagem ocupará **100% da largura** e **100% da altura** do hero
- Com `object-fit: cover`, se a tela for mais larga que 16:9, cortará a parte superior/inferior
- Com `object-fit: contain`, mostrará a imagem completa (pode deixar espaços vazios)

---

## 🎯 Estrutura da Imagem Recomendada

### Zonas de Segurança (Safe Zones):

```
┌─────────────────────────────────────────┐
│                                         │
│  [Zona que será cortada no mobile]     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                   │   │
│  │  ZONA SEGURA (centro)            │   │
│  │  Coloque elementos importantes   │   │
│  │  aqui - visível em todos os      │   │
│  │  dispositivos                     │   │
│  │                                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Zona que será cortada no mobile]     │
│                                         │
└─────────────────────────────────────────┘
```

**Recomendação:** Mantenha textos e elementos principais no **centro vertical e horizontal** da imagem.

---

## 📋 Especificações Técnicas

### Formato:
- **PNG** (se precisar de transparência)
- **JPG** (se não precisar de transparência - menor tamanho)

### Tamanho do Arquivo:
- **Máximo recomendado:** 500KB - 1MB
- **Ideal:** 300KB - 600KB
- Use compressão otimizada para web

### Resolução:
- **1920 × 1080px** @ 72 DPI (web)
- Ou **3840 × 2160px** @ 72 DPI (para telas Retina, mas arquivo maior)

---

## 🔧 Implementação no Código

A imagem será exibida assim:

```css
/* Mobile e Desktop */
img {
  width: 100%;
  height: auto;
  min-height: calc(100vh - 5rem);
  object-fit: cover; /* Corta para preencher */
}
```

---

## ✅ Resumo Final

**Dimensão recomendada: 1920px × 1080px (16:9)**

Esta dimensão:
- ✅ Cobre bem a maioria dos desktops
- ✅ Funciona no mobile (com crop lateral)
- ✅ É o padrão da indústria
- ✅ Arquivo de tamanho razoável
- ✅ Mantém boa qualidade

**Dica:** Se quiser suportar telas Retina/4K, crie uma versão @2x (3840×2160px) e use `srcset` no HTML.
