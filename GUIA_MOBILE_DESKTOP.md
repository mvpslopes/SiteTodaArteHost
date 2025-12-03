# 📱💻 Guia: Versões Mobile e Desktop

## ✅ Sistema Implementado

Agora você tem **duas versões completamente separadas** do Hero:

### 📁 Arquivos de Configuração:

1. **`src/config/hero.config.desktop.ts`** - Versão para PC/Desktop
2. **`src/config/hero.config.mobile.ts`** - Versão para Mobile/Celular

O sistema **detecta automaticamente** o tamanho da tela e usa a configuração apropriada:
- **Telas menores que 768px** → Usa configuração Mobile
- **Telas maiores que 768px** → Usa configuração Desktop

---

## 🎨 Como Editar

### Para Editar a Versão Desktop (PC):

Abra: `src/config/hero.config.desktop.ts`

Edite os valores normalmente:
```typescript
imagemMeninas: {
  top: '60%',
  left: '80%',
  width: '600px',
  // ...
}
```

### Para Editar a Versão Mobile (Celular):

Abra: `src/config/hero.config.mobile.ts`

Edite os valores normalmente:
```typescript
imagemMeninas: {
  top: '75%',
  left: '50%',
  width: '250px',  // Menor para mobile
  // ...
}
```

---

## 📐 Diferenças Padrão Entre Mobile e Desktop

### Desktop (PC):
- Imagem das meninas: **600px** de largura, posicionada à direita (`left: '80%'`)
- Textos posicionados de forma mais espalhada
- Fontes maiores

### Mobile (Celular):
- Imagem das meninas: **250px** de largura, centralizada (`left: '50%'`)
- Textos centralizados e mais compactos
- Fontes menores para caber na tela

---

## 🔧 Personalização

Você pode editar **cada versão independentemente**:

### Exemplo: Mover foto das meninas no Mobile

Edite `hero.config.mobile.ts`:
```typescript
imagemMeninas: {
  left: '70%',  // ← Mover para direita no mobile
  // ...
}
```

Isso **não afeta** a versão desktop!

### Exemplo: Mudar fonte do texto "Conecte" no Desktop

Edite `hero.config.desktop.ts`:
```typescript
textoConecte: {
  fontSize: 'clamp(5rem, 15vw, 14rem)', // ← Maior no desktop
  // ...
}
```

Isso **não afeta** a versão mobile!

---

## 🧪 Como Testar

### Testar Versão Desktop:
1. Abra o site no navegador
2. Abra DevTools (F12)
3. Clique no ícone de dispositivo móvel (ou Ctrl+Shift+M)
4. Desmarque "Toggle device toolbar" ou aumente a largura acima de 768px
5. Veja a versão Desktop

### Testar Versão Mobile:
1. Abra o site no navegador
2. Abra DevTools (F12)
3. Clique no ícone de dispositivo móvel (ou Ctrl+Shift+M)
4. Selecione um dispositivo móvel (iPhone, Galaxy, etc.)
5. Ou diminua a largura abaixo de 768px
6. Veja a versão Mobile

---

## 💡 Dicas

### Breakpoint:
O sistema usa **768px** como ponto de corte:
- **< 768px** = Mobile
- **≥ 768px** = Desktop

Se quiser mudar esse valor, edite `src/components/landing/Hero.tsx`:
```typescript
setIsMobile(window.innerWidth < 768); // ← Mude 768 para outro valor
```

### Valores Recomendados:
- **Mobile**: Elementos centralizados, tamanhos menores
- **Desktop**: Elementos mais espalhados, tamanhos maiores

---

## 📝 Estrutura dos Arquivos

```
src/config/
├── hero.config.desktop.ts  ← Edite aqui para PC
└── hero.config.mobile.ts   ← Edite aqui para Mobile
```

Ambos têm a mesma estrutura, mas você pode configurar valores completamente diferentes!

---

## 🆘 Precisa de Ajuda?

Se quiser:
- Ajustar o breakpoint (quando muda de mobile para desktop)
- Adicionar mais configurações específicas
- Criar versões para tablets também

É só me avisar! 😊

