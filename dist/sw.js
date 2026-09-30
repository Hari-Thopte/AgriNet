// AgriNet Progressive Web App Service Worker
const CACHE_NAME = 'agrin-v1-cache';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install Event - Pre-cache critical core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-while-revalidate or Network-first with Cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests or chrome-extension URLs
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0 || networkResponse.type === 'opaque' || networkResponse.type === 'cors')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, return cached response if present
          if (cachedResponse) return cachedResponse;
          
          // Fallback response for offline API calls
          if (event.request.headers.get('accept')?.includes('application/json')) {
            return new Response(
              JSON.stringify({ 
                error: 'Offline mode active',
                offline: true,
                message: 'You are currently offline. Displaying cached farm data.'
              }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
