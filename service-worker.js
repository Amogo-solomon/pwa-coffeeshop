// Define the cache name and the assets to cache
const CACHE_NAME = 'coffee-shop-cache-v2'; // Increment version number
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'style1.css',
  'script.js',
  'indexDB.js',
  'checkout.html',
  'offline.html',
  'images',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/fa-brands-400.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/fa-regular-400.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/fa-solid-900.woff2'
];


// Install the service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .catch(error => {
                console.error('Cache installation failed:', error);
            })
    );
});

// Activate the service worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('coffee-shop-cache') && cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        }).catch(error => {
            console.error('Cache activation failed:', error);
        })
    );
});

// Fetch resources from cache or network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request to ensure it's safe to read when responding
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then(response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return caches.match('offline.html');
                        }

                        // Clone the response to ensure it's safe to read when caching
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        return caches.match('offline.html');
                    });
            })
            .catch(error => {
                console.error('Fetch request failed:', error);
            })
    );
});

// Background sync integration
self.addEventListener('sync', function(event) {
    if (event.tag === 'syncFormData') {
        event.waitUntil(syncFormData()); 
    }
});

// Push notification event listener
self.addEventListener('push', event => {
    const title = 'Coffee Shop';
    const options = {
        body: event.data.text(),
        icon: 'images/coffee-icon.png',
        badge: 'images/coffee-badge.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Inside the 'install' event listener in service-worker.js
self.addEventListener('install', function(event) {
    event.waitUntil(
        // Open a connection to a new or existing IndexedDB database named 'coffee-shop-db'
        // and create object stores for caching different types of data
        openDatabase()
    );
});


