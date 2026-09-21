// Service worker: guarda la app para que funcione sin internet, pero sin dejar
// que una versión vieja se quede pegada.
//
// La estrategia es "primero la red, la caché de respaldo": con internet, cada
// recarga trae lo último; sin internet, se sirve lo guardado. La versión
// anterior hacía lo contrario (primero la caché) y por eso recargar el
// navegador nunca mostraba los cambios.
const VERSION = 'mis-silabas-v7';
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
  e.waitUntil(
    caches.open(VERSION)
      // "reload" evita que el precargado se llene desde la caché del navegador,
      // que es justo la que puede tener los archivos viejos.
      .then((c) => c.addAll(ARCHIVOS.map((u) => new Request(u, { cache: 'reload' }))))
      // La versión nueva entra sin esperar a que se cierren las pestañas: si no,
      // se queda bloqueada detrás de la vieja y la app nunca se actualiza.
      .then(() => self.skipWaiting())
  );
});

// Mensajes desde la página: consultar la versión instalada y aplicar la nueva.
self.addEventListener('message', (e) => {
  if (e.data === 'version') e.source?.postMessage({ tipo: 'version', version: VERSION });
  if (e.data === 'actualizar') self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Guarda una copia en la caché de la versión actual.
async function guardar(request, respuesta) {
  if (!respuesta || !respuesta.ok) return;
  const c = await caches.open(VERSION);
  await c.put(request, respuesta.clone());
}

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Fuentes de Google: de caché y se actualizan en segundo plano (cambian poco
  // y así la app abre rápido).
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

  if (url.origin !== self.location.origin) return;

  // Archivos de la app: primero la red (así una recarga siempre trae lo nuevo)
  // y, si no hay conexión, lo que haya guardado.
  e.respondWith((async () => {
    try {
      const red = await fetch(request);
      await guardar(request, red);
      return red;
    } catch (e) {
      const enCache = await caches.match(request, { ignoreSearch: true });
      if (enCache) return enCache;
      if (request.mode === 'navigate') {
        const inicio = await caches.match('./index.html');
        if (inicio) return inicio;
      }
      throw e;
    }
  })());
});
