// On install, cache necessary files
self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('text-speech-converter-cache').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/speech.js',
          '/images/text&speech.jpg',
          // Add any other resources you want to cache
        ]);
      })
    );
});

// Intercept fetch requests and serve cached assets or fetch from network
self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return cached response if available, otherwise fetch from the network
        return cachedResponse || fetch(event.request);
      })
    );
});