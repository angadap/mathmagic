const CACHE = "mathmagic-v1";
const STATIC = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes("supabase.co") || url.hostname.includes("anthropic.com") || e.request.method !== "GET") return;
  if (url.hostname.includes("fonts.g")) {
    e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
      if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
      return r;
    }).catch(() => cached)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => {
    const net = fetch(e.request).then(r => {
      if (r.ok && r.type !== "opaque") caches.open(CACHE).then(c => c.put(e.request, r.clone()));
      return r;
    }).catch(() => null);
    return cached || net;
  }));
});
