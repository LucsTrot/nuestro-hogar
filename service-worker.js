const CACHE = 'nuestro-hogar-v2';
const ASSETS = [
  '/nuestro-hogar/',
  '/nuestro-hogar/index.html',
  '/nuestro-hogar/manifest.json',
  '/nuestro-hogar/icon-192.png',
  '/nuestro-hogar/icon-512.png'
];

// Instalación: cachear archivos base
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activación: limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: servir desde cache, con fallback a red
self.addEventListener('fetch', e => {
  // Las llamadas a Google Sheets siempre van a la red
  if(e.request.url.includes('script.google.com')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(response => {
        if(response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy));
        }
        return response;
      });
    }).catch(() => caches.match('/nuestro-hogar/index.html'))
  );
});
