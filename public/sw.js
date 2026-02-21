const CACHE_NAME = 'newsatlas-cache-v1';
const URLS_TO_CACHE = [
    '/',
    '/terminal.html',
    '/manifest.json',
    '/favicon.ico',
    '/css/terminal.css',
    '/js/app.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(URLS_TO_CACHE);
            })
    );
    self.skipWaiting();
});
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).catch(() => {
                    console.log('Fetch failed; offline context triggered.');
                });
            }
            )
    );
});
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});