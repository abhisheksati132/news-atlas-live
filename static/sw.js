const CACHE_NAME = 'newsatlas-cache-v2';

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

        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) return response;
                return fetch(event.request).catch(() => {
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