import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from '../../utils/analytics';

/**
 * Componente para gerenciar Google Analytics 4
 * Rastreia automaticamente mudanças de rota em SPAs
 */
export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Inicializar GA na primeira renderização
    initGA();
  }, []);

  useEffect(() => {
    // Rastrear mudanças de página quando a rota muda
    if (window.gtag) {
      trackPageView(location.pathname + location.search);
    }
  }, [location]);

  return null; // Componente invisível
}

