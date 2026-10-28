/* Gastrokniff Service Worker.
   Bei JEDEM Deploy mit Änderungen CACHE hochzählen (gk-v1 → gk-v2 …),
   sonst sehen installierte Apps alte CSS/JS/Schriften. */
const CACHE = 'gk-v1';

const PRECACHE = [
  '/',
  '/index.html',
  '/rechner.html',
  '/offline.html',
  // Werkzeuge
  '/wareneinsatz-rechner.html',
  '/aufschlag-vs-deckungsbeitrag.html',
  '/menu-engineering.html',
  '/getraenke-rechner.html',
  '/break-even-rechner.html',
  '/kostenstruktur.html',
  '/foodwaste-check.html',
  '/produktpass.html',
  '/mietcheck.html',
  '/einarbeitungsplan.html',
  '/gruendungs-checkliste.html',
  // gemeinsame Dateien
  '/theme.css',
  '/fonts.css',
  '/pwa.js',
  '/fonts/bricolage-grotesque-variable.woff2',
  '/fonts/space-grotesk-variable.woff2',
  '/fonts/inter-variable.woff2',
  '/favicon.svg',
  '/favicon-32.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // cache:'reload' umgeht den HTTP-Cache, damit wirklich die neue Version landet
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('gk-') && key !== CACHE).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Fremde Domains (z. B. Cloudflare Analytics) nicht anfassen
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(networkFirst(req, url));
  } else if (/\.(css|js|woff2?|png|svg|jpe?g|webp|gif|ico|webmanifest)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(req));
  }
});

// HTML: Netz zuerst (immer aktuell), offline aus dem Cache, sonst offline.html
async function networkFirst(req, url) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res.ok && res.type === 'basic') cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    // Netlify liefert /seite auch als /seite.html aus – offline beide Formen finden
    if (!url.pathname.endsWith('.html') && !url.pathname.endsWith('/')) {
      const alt = await cache.match(url.pathname + '.html');
      if (alt) return alt;
    }
    return (await cache.match('/offline.html')) || Response.error();
  }
}

// CSS, JS, Schriften, Bilder: Cache zuerst, sonst Netz (und dann merken)
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok && res.type === 'basic') cache.put(req, res.clone());
  return res;
}
