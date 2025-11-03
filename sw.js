// Service Worker para PWA - Leo's Cake
const CACHE_NAME = 'leos-cake-v2';
const urlsToCache = [
    './',
    './index.html',
    './css/styles.css',
    './js/app.js',
    './images/logo.png',
    './manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Cache aberto');
                return cache.addAll(urlsToCache).catch((error) => {
                    console.warn('⚠️ Alguns arquivos não puderam ser cacheados:', error);
                    // Não falhar se alguns arquivos não existirem
                    return Promise.resolve();
                });
            })
    );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker ativado');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
    // Só cache para arquivos locais (não APIs externas)
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // Retorna do cache se encontrar
                    if (response) {
                        return response;
                    }
                    // Senão, busca na rede
                    return fetch(event.request).catch(() => {
                        // Se offline, retorna página principal
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                    });
                })
        );
    }
});