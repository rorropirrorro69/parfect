/* PARFECT service worker: la app funciona offline una vez visitada. */
const CACHE = 'parfect-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './css/styles.css?v=6',
  './js/ui.js?v=6',
  './js/store.js?v=6',
  './js/stats.js?v=6',
  './js/trainer.js?v=6',
  './js/views-public.js?v=6',
  './js/views-home.js?v=6',
  './js/views-round.js?v=6',
  './js/views-modules.js?v=6',
  './js/party.js?v=6',
  './js/views-party.js?v=6',
  './js/sync.js?v=6',
  './js/app.js?v=6',
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
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit ||
      fetch(e.request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => (e.request.mode === 'navigate' ? caches.match('./') : undefined))
    )
  );
});
