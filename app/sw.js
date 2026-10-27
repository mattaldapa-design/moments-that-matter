// Moments That Matter — offline shell. Bump VERSION whenever a shell file changes.
const VERSION = 'mtm-v47';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './css/darkroom-tokens.css', './css/darkroom.css', './css/app.css',
  './js/app.js', './js/db.js', './js/exif.js', './js/words.js', './js/recap.js', './js/util.js',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  // Straight from the network: a new version must never precache a copy the browser's own cache still holds.
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fonts: serve from cache, refresh in the background.
  if (url.hostname.endsWith('gstatic.com') || url.hostname.endsWith('googleapis.com')) {
    e.respondWith(
      caches.open(VERSION + '-fonts').then(async (c) => {
        const hit = await c.match(req);
        // Font responses are opaque (no-cors), so r.ok is false even when they are fine: cache those too.
        const net = fetch(req).then((r) => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
        return hit || net;
      })
    );
    return;
  }

  if (url.origin !== location.origin) return;

  // App shell: cache first, then network; navigations fall back to index.html.
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((r) => {
        if (r.ok) caches.open(VERSION).then((c) => c.put(req, r.clone()));
        return r;
      }).catch(() => (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()));
    })
  );
});
