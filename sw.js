// Service worker: guarda la app completa para que funcione sin internet.
const VERSION = 'mis-silabas-v1';
const ARCHIVOS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data.js',
  './manifest.webmanifest',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Fuentes de Google: se sirven de caché y se actualizan en segundo plano.
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.open(VERSION + '-fuentes').then(async (c) => {
        const enCache = await c.match(request);
        const red = fetch(request).then((r) => { if (r.ok) c.put(request, r.clone()); return r; }).catch(() => enCache);
        return enCache || red;
      })
    );
    return;
  }

  // Archivos de la app: primero caché, si no está se busca en la red y se guarda.
  e.respondWith(
    caches.match(request, { ignoreSearch: true }).then((enCache) => {
      if (enCache) return enCache;
      return fetch(request).then((r) => {
        if (r.ok && url.origin === self.location.origin) {
          const copia = r.clone();
          caches.open(VERSION).then((c) => c.put(request, copia));
        }
        return r;
      }).catch(() => (request.mode === 'navigate' ? caches.match('./index.html') : undefined));
    })
  );
});
