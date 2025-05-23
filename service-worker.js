const CACHE_NAME = 'netball-scorer-cache-v1';
// Ensure all paths are relative for GitHub Pages
const urlsToCache = [
  './', // Represents the root of the application directory relative to service worker location
  './index.html',
  './index.tsx',
  './App.tsx',
  './components/Modal.tsx',
  './components/TeamNameModal.tsx',
  './components/TeamScore.tsx',
  './components/GameInfo.tsx',
  './components/GameControls.tsx',
  './services/geminiService.ts',
  './constants.ts',
  './types.ts',
  './icons.tsx',
  './manifest.json',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
  // External URLs (esm.sh, cdn.tailwindcss.com) will be cached by the fetch handler if accessed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Filter out external http(s) links if any were accidentally included above,
        // though current list is fine.
        const localUrlsToCache = urlsToCache.filter(url => !url.startsWith('http'));
        return cache.addAll(localUrlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache initial assets:', error);
      })
  );
});

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
    }).then(() => self.clients.claim()) // Ensure new service worker takes control immediately
  );
});

self.addEventListener('fetch', event => {
  // For navigation requests (HTML), try network first, then cache.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Check if we received a valid response
          if (response && response.ok && event.request.method === 'GET') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try to serve from cache
          // Fallback to the main page relative to the service worker's scope
          return caches.match(event.request)
            .then(cachedResponse => cachedResponse || caches.match('./index.html'));
        })
    );
    return;
  }

  // For other requests (CSS, JS, images, etc.), use cache-first, then network & cache strategy.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(
          response => {
            // Ensure we have a valid response before caching
            // For opaque responses (e.g. CDN no-cors), we can't check status, but still try to cache.
            if (!response || (response.status !== 200 && response.type !== 'opaque') || response.type === 'error') {
              return response;
            }
            
            const responseToCache = response.clone();
            // Only cache GET requests
            if (event.request.method === 'GET') { 
                 caches.open(CACHE_NAME)
                .then(cache => {
                    cache.put(event.request, responseToCache);
                });
            }
            return response;
          }
        ).catch(error => {
          console.error('Fetch failed for:', event.request.url, error);
          // Optionally, return a generic fallback for specific asset types if needed
          // e.g., if (event.request.destination === 'image') return caches.match('./assets/offline-image.png');
        });
      })
  );
});