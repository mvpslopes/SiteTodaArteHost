// Utilitário para testar se o Google Analytics está configurado e funcionando

export const checkAnalyticsSetup = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  console.log('=== VERIFICAÇÃO DO GOOGLE ANALYTICS ===');
  
  if (!measurementId || measurementId === '') {
    console.warn('⚠️ Google Analytics NÃO está configurado!');
    console.log('📝 Para configurar:');
    console.log('1. Crie um arquivo .env na raiz do projeto');
    console.log('2. Adicione: VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX');
    console.log('3. Reinicie o servidor (npm run dev)');
    return false;
  }
  
  console.log('✅ Measurement ID encontrado:', measurementId);
  
  if (typeof window !== 'undefined') {
    if (window.gtag) {
      console.log('✅ Google Analytics está carregado e funcionando!');
      console.log('✅ Você pode verificar em: https://analytics.google.com/');
      console.log('📊 Acesse "Realtime" no menu para ver visitantes em tempo real');
      return true;
    } else {
      console.warn('⚠️ Google Analytics ainda não carregou (aguarde alguns segundos)');
      return false;
    }
  }
  
  return false;
};

// Executar verificação ao importar
if (typeof window !== 'undefined') {
  setTimeout(() => {
    checkAnalyticsSetup();
  }, 2000); // Aguarda 2 segundos para o GA carregar
}

