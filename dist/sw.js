// Service Worker para PWA
// IMPORTANTE: Mude este número a cada deploy para forçar atualização automática
const CACHE_VERSION = 'v4'; // Incremente este número a cada deploy
const CACHE_NAME = `toda-arte-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.png',
  '/hero-mobile.png', // Adicionada imagem do mobile
  '/assets/index.css',
  '/assets/index.js'
];

// Instalação do Service Worker - força atualização imediata
self.addEventListener('install', (event) => {
  console.log('Service Worker instalando versão:', CACHE_VERSION);
  // Força ativação imediata, sem esperar outros tabs fecharem
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto:', CACHE_NAME);
        // Não bloqueia a instalação se algum arquivo falhar
        return cache.addAll(urlsToCache).catch((error) => {
          console.error('Erro ao fazer cache:', error);
          // Continua mesmo se alguns arquivos falharem
        });
      })
  );
});

// Ativação do Service Worker - força atualização e limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativando versão:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Remove TODOS os caches que não são da versão atual
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.includes(CACHE_VERSION)) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Força controle imediato de todos os clientes (tabs abertos)
      return self.clients.claim();
    })
  );
  
  // Notifica todos os clientes para recarregar
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
    });
  });
});

// Estratégia: Network First com bypass de cache para atualizações
self.addEventListener('fetch', (event) => {
  // Para arquivos HTML e JS, sempre buscar da rede primeiro (bypass cache)
  if (event.request.destination === 'document' || 
      event.request.url.includes('.js') || 
      event.request.url.includes('hero-mobile.png')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((response) => {
          // Atualiza o cache em background
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // Fallback para cache apenas se rede falhar
          return caches.match(event.request);
        })
    );
  } else {
    // Para outros recursos, usa estratégia normal
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});

// Notificações push (opcional, para implementação futura)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação',
    icon: '/favicon.png',
    badge: '/favicon.png'
  };
  
  event.waitUntil(
    self.registration.showNotification('Toda Arte', options)
  );
});


