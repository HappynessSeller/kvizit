// Network-first service worker: always fresh when online, still playable offline.
const CACHE = 'kvizit-v1';
const CORE = ['./', 'index.html', 'css/app.css', 'js/main.js', 'js/store.js', 'js/math.js', 'js/scene.js', 'js/audio.js', 'js/fx.js',
  'scenes/mokki.svg', 'scenes/ruska.svg', 'scenes/revontulet.svg', 'scenes/kesailta/scene.json',
  'scenes/kesailta/line.webp', 'scenes/kesailta/colour.webp', 'scenes/kesailta/labels.png', 'scenes/kesailta/thumb.webp',
  'manifest.webmanifest', 'icons/icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    } catch {
      return (await cache.match(req)) || (await cache.match('index.html'));
    }
  })());
});
