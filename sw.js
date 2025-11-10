// Service Worker para PWA - Leo's Cake
// DESABILITADO TEMPORARIAMENTE - Causava erros de cache

const CACHE_NAME = 'leos-cake-v1';

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker instalando...');
    self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker ativado');
    self.clients.claim();
});

// Não cachear nada - apenas passar requisições
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                // Se offline, retornar erro amigável
                return new Response('Offline - não foi possível conectar', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
    );
});