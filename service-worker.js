const CACHE_NAME = 'netball-scorer-cache-v1';
// Paths assume service-worker.js is at the root.
// Source files are in 'src/', other assets are at root or in 'assets/' at the root.
const urlsToCache = [
  './', // Root of the site (served by index.html due to base tag)
  './index.html',
  './manifest.json',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',

  // Files inside src directory
  './src/index.tsx',
  './src/App.tsx',
  './src/components/Modal.tsx',
  './src/components/TeamNameModal.tsx',
  './src/components/TeamScore.tsx',
  './src/components/GameInfo.tsx',
  './src/components/GameControls.tsx',
  './src/icons.tsx',
  
  // .ts files are fine as they are processed by esm.sh, paths relative to src
  './src/services/geminiService.ts',
  './src/constants.ts',
  './src/types.ts',

  // External URLs (esm.sh, cdn.tailwindcss.com) will be cached by the fetch handler if accessed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Filter out external URLs for pre-caching, they'll be cached on first fetch.
        const localUrlsToCache = urlsToCache.filter(url => !url.startsWith('http') && !url.startsWith('https'));
        return cache.addAll(localUrlsToCache.map(url => new URL(url, self.location.origin).pathname))
          .catch(error => {
             console.error('Failed to cache some local assets during install:', error);
             // It's important to see which specific URL failed if any
             localUrlsToCache.forEach(localUrl => {
                const fullUrl = new URL(localUrl, self.location.origin).pathname;
                fetch(fullUrl)
                    .then(res => { if(!res.ok) console.error('Failed resource during install check:', fullUrl, res.status);})
                    .catch(err => console.error('Network error for resource during install check:', fullUrl, err));
             });
          });
      })
      .catch(error => {
        console.error('Failed to open cache during install:', error);
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
    }).then(() => self.clients.claim()) 
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
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
          return caches.match(event.request)
            .then(cachedResponse => cachedResponse || caches.match('./index.html'));
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(
          response => {
            if (!response || (response.status !== 200 && response.type !== 'opaque') || response.type === 'error') {
              if (response && response.type === 'error') {
                console.warn(`Fetch resulted in an error for: ${event.request.url}`, response);
              }
              return response;
            }
            
            const responseToCache = response.clone();
            if (event.request.method === 'GET') { 
                 caches.open(CACHE_NAME)
                .then(cache => {
                    cache.put(event.request, responseToCache);
                });
            }
            return response;
          }
        ).catch(error => {
          console.warn('Fetch failed (will not be cached):', event.request.url, error);
        });
      })
  );
});