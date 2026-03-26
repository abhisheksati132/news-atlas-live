const CACHE_NAME = 'newsatlas-cache-v3';

if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    self.addEventListener('install', () => self.skipWaiting());
    self.addEventListener('activate', event => {
        event.waitUntil(
            caches.keys()
                .then(keys => Promise.all(keys.map(k => caches.delete(k))))
                .then(() => self.registration.unregister())
        );
    });
} else {
    const URLS_TO_CACHE = [
        '/',
        '/terminal',
        '/favicon.ico'
    ];

    self.addEventListener('install', event => {
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
        );
        self.skipWaiting();
    });

    self.addEventListener('fetch', event => {
        if (event.request.method !== 'GET') return;

        // Network-first strategy: Always try to fetch newest file from server, fallback to cache if offline
        event.respondWith(
            fetch(event.request).then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            }).catch(() => {
                return caches.match(event.request).then(response => {
                    if (response) return response;
                    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
                });
            })
        );
    });

    self.addEventListener('activate', event => {
        event.waitUntil(
            caches.keys().then(cacheNames =>
                Promise.all(
                    cacheNames.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
                )
            )
        );
        self.clients.claim();
    });
}