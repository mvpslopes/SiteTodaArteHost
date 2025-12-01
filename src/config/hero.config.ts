// 🎨 CONFIGURAÇÃO DO HERO - EDITE AQUI PARA AJUSTAR POSICIONAMENTO E FONTES
// 
// Este arquivo pode ser editado diretamente no Dreamweaver ou qualquer editor de texto
// Após editar, salve o arquivo e o site será atualizado automaticamente

export const heroConfig = {
  // 📍 POSICIONAMENTO DA IMAGEM DAS MENINAS (Thaty_Lara.png)
  imagemMeninas: {
    top: '60%',        // Posição vertical (ex: '50%' = meio da tela, '70%' = mais abaixo)
    left: '80%',       // Posição horizontal (ex: '50%' = centro, '70%' = mais à direita, '30%' = mais à esquerda)
    width: '600px',    // Largura da imagem (ex: '300px', '400px', '50%')
    height: 'auto',    // Altura (use 'auto' para manter proporção)
    zIndex: 13         // Camada (números maiores ficam na frente)
  },

  // 📍 POSICIONAMENTO DO TEXTO "SEU NEGÓCIO SEU SUCESSO"
  textoNegocio: {
    top: '36%',        // Posição vertical
    left: '42%',       // Posição horizontal
    fontSize: '1.5rem', // Tamanho da fonte (ex: '2rem' = menor, '3rem' = maior, ou use 'clamp(1.5rem, 3vw, 2.5rem)' para responsivo)
    fontFamily: "'Montserrat Light', sans-serif", // Fonte
    color: '#815d46',  // Cor do texto
    zIndex: 10
  },

  // 📍 POSICIONAMENTO DO TEXTO "CONECTE"
  textoConecte: {
    top: '40%',        // Posição vertical
    left: '30%',       // Posição horizontal
    fontSize: 'clamp(4rem, 15vw, 12rem)', // Tamanho da fonte (responsivo)
    fontFamily: "'Andrea Bellarosa', cursive", // Fonte
    color: '#4c2e13',  // Cor do texto
    zIndex: 11
  },

  // 📍 POSICIONAMENTO DO BOTÃO "CONHEÇA NOSSO TRABALHO"
  botao: {
    top: '70%',        // Posição vertical
    left: '37%',       // Posição horizontal
    fontSize: '1.125rem', // Tamanho da fonte
    zIndex: 12
  },

  // 🎨 GRADIENTE DO HERO (substitui a imagem de fundo)
  background: {
    // Gradiente linear - você pode editar as cores aqui
    gradient: 'linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 25%, #d4c4b0 50%, #c9b8a3 75%, #b8a690 100%)',
    // Ou use um gradiente radial:
    // gradient: 'radial-gradient(circle at center, #f5f1eb 0%, #d4c4b0 50%, #b8a690 100%)',
    // Ou um gradiente vertical simples:
    // gradient: 'linear-gradient(to bottom, #f5f1eb, #b8a690)'
  }
};

