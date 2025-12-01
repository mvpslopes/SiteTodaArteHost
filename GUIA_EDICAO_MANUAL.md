# 🎨 Guia: Edição Manual de Posicionamento e Fontes

## ✅ Pronto! Agora você pode editar tudo manualmente

Criei um arquivo de configuração super simples onde você pode ajustar:
- ✅ **Posição da imagem das meninas** (top, left, largura, altura)
- ✅ **Posição dos textos** ("Seu Negócio Seu Sucesso" e "Conecte")
- ✅ **Posição do botão**
- ✅ **Fontes aplicadas** em cada elemento
- ✅ **Cores dos textos**
- ✅ **Background do Hero**

---

## 📁 Arquivo para Editar

**Abra este arquivo no Dreamweaver (ou qualquer editor):**

```
src/config/hero.config.ts
```

---

## 🎯 Como Editar no Dreamweaver

### 1. **Abrir o Arquivo**
- No Dreamweaver: **File > Open**
- Navegue até: `C:\projetos\SiteTodaArteHost\src\config\hero.config.ts`
- Abra o arquivo

### 2. **Editar Posicionamento da Imagem das Meninas**

Procure por esta seção:

```typescript
imagemMeninas: {
  top: '70%',        // ← Ajuste aqui (ex: '50%', '60%', '80%')
  left: '50%',       // ← Ajuste aqui (ex: '30%', '50%', '70%')
  width: '300px',    // ← Ajuste aqui (ex: '400px', '500px', '50%')
  height: 'auto',    // ← Geralmente deixe 'auto'
  zIndex: 13         // ← Camada (números maiores ficam na frente)
},
```

**Exemplos:**
- Para mover a imagem mais para a direita: `left: '70%'`
- Para mover mais para cima: `top: '50%'`
- Para aumentar o tamanho: `width: '400px'`

### 3. **Editar Fontes**

#### Fonte do texto "Seu Negócio Seu Sucesso":
```typescript
textoNegocio: {
  fontFamily: "'Montserrat Light', sans-serif", // ← Troque aqui
  color: '#815d46',  // ← Cor do texto
  fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', // ← Tamanho
},
```

#### Fonte do texto "Conecte":
```typescript
textoConecte: {
  fontFamily: "'Andrea Bellarosa', cursive", // ← Troque aqui
  color: '#4c2e13',  // ← Cor do texto
  fontSize: 'clamp(4rem, 15vw, 12rem)', // ← Tamanho
},
```

**Para usar uma nova fonte:**
1. Adicione o arquivo `.ttf` em `public/fonts/`
2. Declare a fonte em `src/index.css` (veja como está feito com Montserrat e Andrea Bellarosa)
3. Use o nome da fonte aqui (ex: `"'Nome da Fonte', sans-serif"`)

### 4. **Editar Posição dos Textos**

```typescript
textoNegocio: {
  top: '30%',   // ← Mover para cima/baixo
  left: '50%',  // ← Mover para esquerda/direita
},
```

### 5. **Editar Gradiente de Fundo**

```typescript
background: {
  // Gradiente linear diagonal
  gradient: 'linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 25%, #d4c4b0 50%, #c9b8a3 75%, #b8a690 100%)',
  
  // Ou use um gradiente radial:
  // gradient: 'radial-gradient(circle at center, #f5f1eb 0%, #d4c4b0 50%, #b8a690 100%)',
  
  // Ou um gradiente vertical simples:
  // gradient: 'linear-gradient(to bottom, #f5f1eb, #b8a690)'
},
```

**Para personalizar as cores do gradiente:**
- Edite os valores hexadecimais (ex: `#f5f1eb`, `#b8a690`)
- Os números após as cores (0%, 25%, 50%, etc.) definem onde cada cor aparece no gradiente

---

## 💡 Dicas Importantes

### Valores de Posição:
- **top/left**: Use porcentagens (`'50%'`) ou pixels (`'100px'`)
- **width/height**: Use pixels (`'300px'`) ou porcentagens (`'50%'`)
- **zIndex**: Números maiores ficam na frente (ex: 10, 11, 12, 13)

### Exemplos Práticos:

**Mover imagem das meninas para o canto direito:**
```typescript
imagemMeninas: {
  top: '60%',
  left: '75%',  // ← Mais à direita
  width: '350px',
  height: 'auto',
  zIndex: 13
},
```

**Mover texto "Conecte" mais para a esquerda:**
```typescript
textoConecte: {
  top: '40%',
  left: '30%',  // ← Mais à esquerda
  // ... resto
},
```

**Aumentar tamanho da imagem:**
```typescript
imagemMeninas: {
  width: '500px',  // ← Maior
  height: 'auto',
  // ... resto
},
```

---

## 🔄 Após Editar

1. **Salve o arquivo** (`Ctrl+S`)
2. **O site atualiza automaticamente** (se estiver rodando com `npm run dev`)
3. **Se não atualizar**, recarregue a página no navegador (`F5`)

---

## 📝 Estrutura Completa do Arquivo

O arquivo `hero.config.ts` tem esta estrutura:

```typescript
export const heroConfig = {
  imagemMeninas: { ... },    // ← Imagem das meninas
  textoNegocio: { ... },      // ← Texto "Seu Negócio Seu Sucesso"
  textoConecte: { ... },      // ← Texto "Conecte"
  botao: { ... },             // ← Botão "Conheça nosso trabalho"
  background: { ... }         // ← Imagem de fundo
};
```

---

## 🆘 Precisa de Ajuda?

Se tiver dúvidas sobre:
- Como aplicar uma nova fonte
- Valores de posicionamento
- Ajustes mais complexos

É só me avisar! 😊

