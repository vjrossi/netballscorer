const CACHE_NAME = 'netball-scorer-cache-v2'; // Increment cache version
// Paths are relative to the service worker's scope, which will be the root of the deployed 'dist' folder.
const urlsToCache = [
  './', // Root of the site (index.html)
  './index.html',
  './bundle.js', // The bundled application code
  './manifest.json',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
  // Note: TailwindCSS and esm.sh imports are fetched via network and cached by the fetch handler on first use.
  // Individual .tsx/.ts files are no longer directly fetched by the browser, so they are not listed here.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache:', CACHE_NAME);
        // Pre-cache only local assets. External assets (CDNs) will be cached on first fetch.
        const localUrlsToCache = urlsToCache.filter(url => !url.startsWith('http'));
        
        // Ensure paths are correctly resolved relative to the service worker's location.
        // For GitHub pages, if deployed from 'dist', paths like './' are relative to '/repository-name/'.
        // The `new URL(url, self.location.origin).pathname` might be problematic if self.location.origin already has the repo sub-path.
        // For simplicity, we assume paths in urlsToCache are directly relative to SW scope.
        return cache.addAll(localUrlsToCache)
          .catch(error => {
             console.error('Failed to cache some local assets during install:', error);
             // Attempt to fetch each failed resource individually for more detailed error logging
             localUrlsToCache.forEach(localUrl => {
                fetch(localUrl) // Fetch relative to SW scope
                    .then(res => { if(!res.ok) console.error('Failed resource during install check:', localUrl, res.status, res.statusText);})
                    .catch(err => console.error('Network error for resource during install check:', localUrl, err));
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
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service worker activated and old caches cleaned.');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // For navigation requests, try network first, then cache, then offline page.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If response is valid, cache it
          if (response && response.ok && event.request.method === 'GET') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try to serve from cache
          return caches.match(event.request)
            .then(cachedResponse => cachedResponse || caches.match('./index.html')); // Fallback to index.html
        })
    );
    return;
  }

  // For other requests (assets, API calls, etc.)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse; // Serve from cache if found
        }
        // Not in cache, fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if the response is valid to cache
            if (networkResponse && networkResponse.ok && event.request.method === 'GET') {
              // For external resources (like esm.sh, tailwind cdn), check origin before caching
              // Or simply cache all GET requests if desired
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            } else if (networkResponse && !networkResponse.ok) {
                console.warn(`Fetch successful but response not OK for: ${event.request.url}`, networkResponse.status, networkResponse.statusText);
            }
            return networkResponse;
          }
        ).catch(error => {
          console.warn('Fetch failed; returning error response or offline fallback for:', event.request.url, error);
          // Optionally, return a custom offline response for specific asset types
          // For example, for images: return caches.match('./assets/offline-image.png');
        });
      })
  );
});
