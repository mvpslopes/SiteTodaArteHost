import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './utils/test-analytics';

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration.scope);
        
        // Verificar atualizações periodicamente
        setInterval(() => {
          registration.update();
        }, 60000); // Verificar a cada minuto
      })
      .catch((error) => {
        console.log('Erro ao registrar Service Worker:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <App />
);
