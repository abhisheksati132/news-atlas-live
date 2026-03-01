const CACHE_NAME = 'newsatlas-cache-v1';
const URLS_TO_CACHE = [
    '/',
    '/terminal.html',
    '/favicon.ico'
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
    // Skip interception for Vite's HMR and dev server requests
    if (event.request.url.includes('@vite') || event.request.url.includes('node_modules') || event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).catch((error) => {
                    console.warn('Fetch failed; offline context triggered:', event.request.url);
                    // Return a generic error response to stop the TypeError
                    return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
                });
            })
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