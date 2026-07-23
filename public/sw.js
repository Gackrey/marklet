const CACHE = 'marklet-v1';
const PRECACHE = ['/', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(res => {
        if (res.ok) {
          caches.open(CACHE).then(c => c.put(request, res.clone()));
        }
        return res;
      });
      return cached ?? network;
    }),
  );
});
