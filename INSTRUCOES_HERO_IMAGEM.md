# 🎨 Instruções para Criar a Imagem do Hero

## 📋 O que fazer:

### 1. **Criar a Imagem Completa**
Crie uma imagem PNG com **TODOS** os elementos já posicionados:
- ✅ Background (gradiente ou imagem)
- ✅ Texto "Seu Negócio Seu Sucesso" (com a fonte Montserrat Light, cor #815d46)
- ✅ Texto "Conecte" (com a fonte Andrea Bellarosa, cor #4c2e13)
- ✅ Imagem das meninas (Thaty_Lara.png)
- ✅ Qualquer outro elemento visual

### 2. **Especificações da Imagem**
- **Nome do arquivo**: `hero-completo.png`
- **Resolução recomendada**: 1920x1080px (Full HD)
- **Formato**: PNG (para manter transparência se necessário)
- **Tamanho**: Otimize para web (máximo 2-3MB)
- **Localização**: Coloque na pasta `public/` do projeto

### 3. **Posicionamento do Botão**
O botão "Conheça nosso trabalho" ficará **separado** da imagem para ser clicável:
- **Posição atual**: `top: 55%, left: 25%`
- Se quiser mudar a posição do botão, me avise e eu ajusto no código

### 4. **Vantagens desta Abordagem**
✅ **Fácil de editar**: Basta editar a imagem no Photoshop/Designer  
✅ **Sem problemas de posicionamento**: Tudo fica fixo na imagem  
✅ **Performance**: Uma única imagem carrega mais rápido  
✅ **Responsivo**: A imagem se adapta com `background-size: cover`  

### 5. **Como Usar**
1. Crie a imagem `hero-completo.png` com todos os elementos
2. Coloque na pasta `public/`
3. O código já está configurado para usar essa imagem
4. Se quiser ajustar a posição do botão, me avise

### 6. **Estrutura Final**
```
public/
├── hero-completo.png  ← SUA IMAGEM COMPLETA AQUI
├── Thaty_Lara.png     ← Pode remover se já estiver na imagem completa
└── bg.png             ← Pode remover se já estiver na imagem completa
```

## 🎯 Exemplo de Estrutura da Imagem

A imagem deve ter aproximadamente:
- **Largura**: 1920px
- **Altura**: 1080px (ou proporcional à altura da tela)
- **Elementos posicionados**:
  - Textos à esquerda
  - Imagem das meninas à direita
  - Background com gradiente

## ⚠️ Importante

- O botão **NÃO** deve estar na imagem (fica separado para ser clicável)
- Mantenha a área do botão vazia ou com fundo neutro na imagem
- A posição do botão pode ser ajustada no código se necessário

