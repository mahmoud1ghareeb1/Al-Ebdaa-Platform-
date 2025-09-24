const CACHE_NAME = 'al-ibdaa-cache-v6';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

// On install, cache the core app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activate new SW immediately
  );
});

// On activation, clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of clients
  );
});

// On fetch, use a cache-first strategy
self.addEventListener('fetch', event => {
  // Let browser handle Supabase API calls, do not cache them.
  if (event.request.url.includes('supabase.co')) {
    return; 
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return from cache if found
        if (response) {
          return response;
        }
        
        // Otherwise, fetch from network, cache it, and return it
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response to avoid caching errors
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Clone the response because it's a one-time-use stream
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
            console.error('Fetching failed:', error);
            // You could return a custom offline page here if you had one in the cache
        });
      })
  );
});
