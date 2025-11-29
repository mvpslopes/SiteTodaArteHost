// Google Analytics 4 Integration
// Sistema completo de analytics sem usar espaço em disco local

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

/**
 * Inicializa o Google Analytics 4
 */
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics: Measurement ID não configurado');
    return;
  }

  // Criar script do Google Analytics
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Criar script de configuração
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', {
      page_path: window.location.pathname,
      send_page_view: true
    });
  `;
  document.head.appendChild(script2);
};

/**
 * Rastreia uma visualização de página
 */
export const trackPageView = (path: string, title?: string) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
  });
};

/**
 * Rastreia um evento customizado
 */
export const trackEvent = (
  eventName: string,
  eventParams?: {
    action?: string;
    category?: string;
    label?: string;
    value?: number;
    [key: string]: any;
  }
) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('event', eventName, eventParams);
};

/**
 * Eventos pré-configurados comuns
 */
export const analyticsEvents = {
  // Rastrear cliques em botões importantes
  buttonClick: (buttonName: string, location?: string) => {
    trackEvent('button_click', {
      button_name: buttonName,
      location: location || window.location.pathname,
    });
  },

  // Rastrear envio de formulário de contato
  contactFormSubmit: (formType: 'contact' | 'login' | 'register') => {
    trackEvent('form_submit', {
      form_type: formType,
    });
  },

  // Rastrear visualizações de seções
  sectionView: (sectionName: string) => {
    trackEvent('section_view', {
      section_name: sectionName,
    });
  },

  // Rastrear cliques em links externos
  externalLink: (url: string) => {
    trackEvent('external_link_click', {
      link_url: url,
    });
  },

  // Rastrear downloads
  download: (fileName: string, fileType: string) => {
    trackEvent('file_download', {
      file_name: fileName,
      file_type: fileType,
    });
  },

  // Rastrear login de usuário
  userLogin: (userId?: string | number) => {
    trackEvent('login', {
      user_id: userId?.toString(),
    });
  },

  // Rastrear ações no dashboard
  dashboardAction: (action: string, entity?: string) => {
    trackEvent('dashboard_action', {
      action,
      entity: entity || 'unknown',
    });
  },
};

