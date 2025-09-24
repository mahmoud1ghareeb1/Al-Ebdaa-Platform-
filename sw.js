const CACHE_NAME = 'al-ibdaa-cache-v7'; // Incremented version
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // Added the main script
  '/manifest.json',
  '/icon.svg',
];

// On install, cache the core app shell
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: App shell cached, activating now.');
        return self.skipWaiting(); // Activate the new service worker immediately
      })
      .catch(error => {
        console.error('Service Worker: Caching failed', error);
      })
  );
});

// On activation, clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('Service Worker: Claiming clients.');
        return self.clients.claim(); // Take control of all open clients
    })
  );
});

// On fetch, use a cache-first strategy
self.addEventListener('fetch', event => {
  // Let browser handle Supabase API calls, do not cache them.
  if (event.request.url.includes('supabase.co')) {
    return;
  }
  
  // Let the browser handle external CDN resources like Tailwind and fonts
  // The service worker will only cache local assets from the urlsToCache list
  if (event.request.url.startsWith('https://')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return from cache if found
        if (response) {
          return response;
        }
        
        // Otherwise, fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response to avoid caching errors
            // We don't cache network responses here anymore to keep it simple,
            // only the initial app shell is cached on install.
            return networkResponse;
          }
        );
      })
  );
});