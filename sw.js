const CACHE_NAME = 'bloom-tower-v1';
const ASSETS = [
  './index.html',
  './manifest.json',
  './js/settings.js',
  './js/audio.js',
  './js/engine.js',
  './js/board.js',
  './js/enemies.js',
  './js/map.js',
  './js/ai.js',
  './js/combat.js',
  './js/codex.js',
  './js/utils.js',
  './js/main.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
