# 🎨 Guia Prático: Editando Imagens e Fontes no Site

## 📁 Qual Pasta Abrir no Dreamweaver?

**Resposta curta**: Abra a pasta **`public`** (não a `dist`)

### Por quê?
- A pasta `public` contém os arquivos estáticos (imagens, fontes) que você pode editar
- A pasta `dist` contém arquivos compilados que serão sobrescritos
- Os arquivos em `public` são copiados automaticamente para `dist` quando você compila

---

## 🖼️ Como Editar a Foto das Meninas

### Localização da Imagem:
- **Arquivo**: `public/Thaty_Lara.png`
- **Background do Hero**: `public/bg.png`

### Passo a Passo:

1. **Abra o Dreamweaver**
2. **Abra a pasta `public`** como site:
   - File > Open Site > New Site
   - Escolha: `C:\projetos\SiteTodaArteHost\public`
3. **Edite a imagem**:
   - **Opção A**: Clique com botão direito em `Thaty_Lara.png` > "Open With" > Photoshop/GIMP
   - **Opção B**: Abra diretamente no Photoshop/GIMP: `C:\projetos\SiteTodaArteHost\public\Thaty_Lara.png`
4. **Faça suas edições** (corte, ajuste de cor, posicionamento, etc.)
5. **Salve substituindo o arquivo original**
6. **Pronto!** A mudança já aparece no site (após recompilar se necessário)

### Dica:
Se você quiser criar uma imagem completa do Hero (com background + meninas + textos), crie um arquivo `hero-completo.png` e coloque em `public/`. Depois me avise que eu ajusto o código para usar essa imagem.

---

## 🔤 Como Adicionar/Trocar Fontes

### Fontes Atuais:
- **Montserrat Light** → `public/fonts/Montserrat-Light.ttf`
- **Andrea Bellarosa** → `public/fonts/Andrea Bellarosa.ttf`

### Passo a Passo para Adicionar Nova Fonte:

1. **Baixe a fonte** (arquivo `.ttf` ou `.otf`)
2. **Coloque na pasta**: `public/fonts/`
3. **Edite o arquivo**: `src/index.css`

No Dreamweaver ou qualquer editor de código:

1. Abra: `C:\projetos\SiteTodaArteHost\src\index.css`
2. Adicione o `@font-face` (copie o padrão das fontes existentes):

```css
@font-face {
  font-family: 'Nome da Sua Fonte';
  src: url('/fonts/nome-do-arquivo.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
```

3. **Aplique a fonte** nos componentes que você quiser

### Exemplo: Aplicar Fonte no Menu

Se quiser aplicar uma fonte diferente no menu, edite: `src/components/layout/Header.tsx`

Procure por:
```tsx
style={{ fontFamily: 'inherit' }}
```

E troque por:
```tsx
style={{ fontFamily: "'Nome da Sua Fonte', sans-serif" }}
```

---

## 🎯 Resumo Rápido

### Para Editar Imagens:
✅ Abra `public/` no Dreamweaver  
✅ Edite `Thaty_Lara.png` ou `bg.png` no Photoshop/GIMP  
✅ Salve substituindo o arquivo original  

### Para Editar Fontes:
✅ Adicione arquivo `.ttf` em `public/fonts/`  
✅ Edite `src/index.css` para declarar a fonte  
✅ Aplique a fonte nos componentes (me avise que eu ajudo)  

---

## ⚠️ Importante

- **Não edite arquivos na pasta `dist`** - eles serão sobrescritos
- **Sempre edite na pasta `public` ou `src`**
- **Após editar fontes**, pode ser necessário recompilar o projeto (`npm run build`)

---

## 💡 Dica Extra: Usar Dreamweaver como Editor de Código

O Dreamweaver pode ser útil para:
- ✅ Ver a estrutura de arquivos
- ✅ Editar arquivos CSS diretamente
- ✅ Ver preview de imagens
- ✅ Gerenciar arquivos do projeto

Mas para editar o HTML visualmente, não vai funcionar bem porque o site é React (o conteúdo é gerado pelo JavaScript).

---

## 🆘 Precisa de Ajuda?

Se quiser que eu:
- Ajuste o código para usar uma nova imagem
- Aplique uma nova fonte em alguma parte específica
- Configure algo diferente

É só me avisar! 😊

