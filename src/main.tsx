import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './utils/test-analytics';

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration.scope);
        
        // Força atualização imediata
        registration.update();
        
        // Verificar atualizações periodicamente
        setInterval(() => {
          registration.update();
        }, 30000); // Verificar a cada 30 segundos
        
        // Escuta atualizações do Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Novo Service Worker disponível, recarregar página automaticamente
                  console.log('Nova versão do Service Worker detectada, recarregando...');
                  window.location.reload();
                } else {
                  // Primeira instalação
                  console.log('Service Worker instalado pela primeira vez');
                }
              }
            });
          }
        });
        
        // Escuta mensagens do Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SW_UPDATED') {
            console.log('Service Worker atualizado para versão:', event.data.version);
            // Recarrega automaticamente quando recebe mensagem de atualização
            window.location.reload();
          }
        });
      })
      .catch((error) => {
        console.log('Erro ao registrar Service Worker:', error);
      });
    
    // Escuta mensagens do Service Worker para forçar reload
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <App />
);
