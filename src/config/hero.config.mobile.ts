// 🎨 CONFIGURAÇÃO DO HERO - VERSÃO MOBILE (CELULAR)
// 
// Este arquivo controla o layout para telas pequenas (celulares)
// Edite aqui para ajustar posicionamento e fontes na versão mobile

export const heroConfigMobile = {
  // 📍 POSICIONAMENTO DA IMAGEM DAS MENINAS (Thaty_Lara.png)
  imagemMeninas: {
    top: '75%',        // Posição vertical (mais abaixo no mobile)
    left: '50%',       // Posição horizontal (centralizado)
    width: '250px',    // Largura menor para mobile
    height: 'auto',
    zIndex: 13
  },

  // 📍 POSICIONAMENTO DO TEXTO "SEU NEGÓCIO SEU SUCESSO"
  textoNegocio: {
    top: '19%',        // Posição vertical (mais acima)
    left: '63%',       // Posição horizontal (centralizado)
    fontSize: '0.8rem', // Tamanho menor para mobile
    fontFamily: "'Montserrat Light', sans-serif",
    color: '#815d46',
    zIndex: 10
  },

  // 📍 POSICIONAMENTO DO TEXTO "CONECTE"
  textoConecte: {
    top: '20%',        // Posição vertical
    left: '48%',       // Posição horizontal (centralizado)
    fontSize: 'clamp(5.5rem, 20vw, 8rem)', // Tamanho responsivo menor
    fontFamily: "'Andrea Bellarosa', cursive",
    color: '#4c2e13',
    zIndex: 11
  },

  // 📍 POSICIONAMENTO DO BOTÃO "CONHEÇA NOSSO TRABALHO"
  botao: {
    top: '43%',        // Posição vertical
    left: '50%',       // Posição horizontal (centralizado)
    fontSize: '0.5rem',  // Tamanho menor
    zIndex: 12
  },

  // 🎨 GRADIENTE DO HERO
  background: {
    gradient: 'linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 25%, #d4c4b0 50%, #c9b8a3 75%, #b8a690 100%)',
  }
};

