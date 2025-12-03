// 🎨 CONFIGURAÇÃO DO HERO - VERSÃO DESKTOP (PC)
// 
// Este arquivo controla o layout para telas grandes (PC, tablets em landscape)
// Edite aqui para ajustar posicionamento e fontes na versão desktop

export const heroConfigDesktop = {
  // 📍 POSICIONAMENTO DA IMAGEM DAS MENINAS (Thaty_Lara.png)
  imagemMeninas: {
    top: '60%',        // Posição vertical
    left: '80%',       // Posição horizontal
    width: '600px',    // Largura da imagem
    height: 'auto',    // Altura (use 'auto' para manter proporção)
    zIndex: 13         // Camada
  },

  // 📍 POSICIONAMENTO DO TEXTO "SEU NEGÓCIO SEU SUCESSO"
  textoNegocio: {
    top: '36%',        // Posição vertical
    left: '42%',       // Posição horizontal
    fontSize: '1.5rem', // Tamanho da fonte
    fontFamily: "'Montserrat Light', sans-serif",
    color: '#815d46',
    zIndex: 10
  },

  // 📍 POSICIONAMENTO DO TEXTO "CONECTE"
  textoConecte: {
    top: '40%',        // Posição vertical
    left: '30%',       // Posição horizontal
    fontSize: 'clamp(4rem, 15vw, 12rem)', // Tamanho responsivo
    fontFamily: "'Andrea Bellarosa', cursive",
    color: '#4c2e13',
    zIndex: 11
  },

  // 📍 POSICIONAMENTO DO BOTÃO "CONHEÇA NOSSO TRABALHO"
  botao: {
    top: '70%',        // Posição vertical
    left: '37%',       // Posição horizontal
    fontSize: '1.125rem',
    zIndex: 12
  },

  // 🎨 GRADIENTE DO HERO
  background: {
    gradient: 'linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 25%, #d4c4b0 50%, #c9b8a3 75%, #b8a690 100%)',
  }
};

