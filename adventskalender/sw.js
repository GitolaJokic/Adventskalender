const CACHE = 'dezemberpost-v18';
const SHELL = ['./', './index.html', './style.css', './app.js', './content.json', './assets/cow.svg', './assets/teddy.svg', './assets/snowflake.svg', './assets/teddy-alive.svg', './assets/felix-alive.svg', './assets/cow-alive.svg', './assets/snowflake-alive.svg', './assets/cow-strict.svg', './assets/teddy-strict.svg', './assets/snowflake-strict.svg', './assets/teddy-icon.svg', './assets/teddy-icon-180.png', './assets/teddy-icon-192.png', './assets/teddy-icon-512.png', './manifest.webmanifest'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('dezemberpost-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || event.request.headers.has('range') || /\.(mp4|webm|mov)$/i.test(url.pathname)) return;
  const media = /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(url.pathname);
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok && (media || SHELL.some(path => new URL(path, self.registration.scope).pathname === url.pathname))) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
    return response;
  }).catch(async () => (await caches.match(event.request, { ignoreSearch: event.request.mode === 'navigate' })) || (event.request.mode === 'navigate' && new URL('./', self.registration.scope).pathname === url.pathname ? await caches.match('./') : null) || Response.error()));
});
