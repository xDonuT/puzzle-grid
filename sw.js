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
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
