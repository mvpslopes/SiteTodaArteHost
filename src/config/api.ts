// Configuração da API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'todaarte.com.br' ? 'https://todaarte.com.br' : 
   window.location.hostname === 'localhost' ? 'http://localhost:3000' : 
   'http://localhost:3000');

// Função utilitária para construir URLs da API
export const apiUrl = (endpoint: string) => {
  // Se o endpoint já começa com http, retorna como está
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Se o endpoint começa com /api, adiciona a base URL
  if (endpoint.startsWith('/api')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  
  // Se não começa com /api, adiciona /api/ e a base URL
  return `${API_BASE_URL}/api/${endpoint}`;
};
