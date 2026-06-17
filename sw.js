/* PARFECT service worker: la app funciona offline una vez visitada. */
const CACHE = 'parfect-v260';
/* Shell + imágenes. El JS/CSS llevan ?v=N y se cachean en runtime (cache-first exacto),
   así nunca se sirve una versión vieja tras un deploy. */
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/golfer.png',
  './assets/bird.png',
  './assets/eagle.png',
  './assets/flag.png',
  './assets/trophy.png',
  './assets/avatars/a1.png',
  './assets/avatars/a2.png',
  './assets/avatars/a3.png',
  './assets/avatars/a4.png',
  './assets/avatars/a5.png',
  './assets/avatars/a6.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // fuentes/CDN: red normal

  const isNav = e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');

  // HTML (navegación): red primero para ver siempre la última versión; cae a cache si no hay internet.
  if (isNav) {
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html').then((h) => h || caches.match('./')))
    );
    return;
  }

  // Resto (assets con ?v=): cache primero, rápido; si no está, red y se guarda.
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit ||
      fetch(e.request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
    )
  );
});
