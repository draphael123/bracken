/* BRACKEN's service worker: the game SHELL (page, scripts, manifest, icons) is kept so an installed copy opens with no network.
   NETWORK FIRST, ALWAYS: a deploy wins the moment the player is online. The cached copy answers only when the network FAILS, so a
   session never mixes new and old scripts (a timeout race would have let a slow connection serve half a deploy from the cache).
   The cache is keyed by VERSION: bumping it throws every old copy away on the next activate. Audio (126 MB) and everything
   cross-origin except the pixel fonts is left alone: this is not an offline mirror of the sound, it is a shell that starts. */
const VERSION = 'bracken-shell-v1', FONTS = 'bracken-fonts-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png'];
const CACHEABLE = /\.(?:js|mjs|json|webmanifest|html|css|png|svg)$/i;
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== FONTS).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/fonts\.(?:googleapis|gstatic)\.com$/.test(url.hostname)) {   // the pixel fonts: cached copy first, refreshed behind it
    e.respondWith(caches.open(FONTS).then(c => c.match(req).then(hit => { const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => hit); return hit || net; })));
    return;
  }
  if (url.origin !== self.location.origin || req.headers.has('range')) return;
  if (!(req.mode === 'navigate' || CACHEABLE.test(url.pathname) || url.pathname.endsWith('/'))) return;   // audio and anything unknown go straight to the network
  const key = req.mode === 'navigate' ? './index.html' : req;   // every way into the game (/, /?x=1, /index.html) is the one cached page
  e.respondWith(fetch(req, { cache: 'no-store' }).then(r => { if (r && r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(key, copy)); } return r; })
    .catch(() => caches.open(VERSION).then(c => c.match(key)).then(hit => hit || Response.error())));
});
