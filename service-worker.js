
const CACHE_NAME = 'netball-scorer-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/components/Modal.tsx',
  '/components/TeamNameModal.tsx',
  '/components/TeamScore.tsx',
  '/components/GameInfo.tsx',
  '/components/GameControls.tsx',
  '/services/geminiService.ts',
  '/constants.ts',
  '/types.ts',
  '/icons.tsx',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  // Note: esm.sh URLs for React, React-DOM, and GenAI will be cached on first fetch by the fetch handler
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add essential local assets. External CDN assets will be cached by the fetch handler.
        return cache.addAll(urlsToCache.filter(url => !url.startsWith('http')));
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
    })
  );
  return self.clients.claim(); // Ensure new service worker takes control immediately
});

self.addEventListener('fetch', event => {
  // For navigation requests (HTML), try network first, then cache, then offline page (optional).
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If successful, cache it (for non-OK responses, just return them)
          if (response.ok && event.request.method === 'GET') {
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
          return caches.match(event.request)
            .then(cachedResponse => {
              return cachedResponse || caches.match('/index.html'); // Fallback to main page
            });
        })
    );
    return;
  }

  // For other requests (CSS, JS, images), use cache-first, then network & cache strategy.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();
            if (event.request.method === 'GET') { // Only cache GET requests
                 caches.open(CACHE_NAME)
                .then(cache => {
                    cache.put(event.request, responseToCache);
                });
            }
            return response;
          }
        ).catch(error => {
          console.error('Fetch failed; returning offline fallback or error for:', event.request.url, error);
          // Optionally, return a generic fallback for images or other assets
          // For now, just let the browser handle the error.
        });
      })
  );
});
