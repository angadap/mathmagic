// ─────────────────────────────────────────────────────────────────────────────
// MathMagic Space Academy — Service Worker  v3
// Strategy matrix:
//   Static shell (HTML/JS/CSS/icons)  → Cache-first, update in background
//   Google Fonts                      → Cache-first, 365-day TTL
//   /api/db  GET_QUESTIONS only        → Cache-first, 24-hour TTL
//   All other /api/*                  → Network-only (mutations, auth, payment)
//   Offline fallback                  → Serve /offline.html
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_VERSION  = "mm-v4";
const STATIC_CACHE   = `${CACHE_VERSION}-static`;
const QUESTION_CACHE = `${CACHE_VERSION}-questions`;
const FONT_CACHE     = `${CACHE_VERSION}-fonts`;

const STATIC_PRECACHE = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
];

const QUESTION_TTL_MS  = 24 * 60 * 60 * 1000; // 24 hours
const FONT_TTL_MS      = 365 * 24 * 60 * 60 * 1000; // 365 days
const MAX_QUESTION_ENTRIES = 200; // ~200 sets max in cache

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(c => c.addAll(STATIC_PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ── Activate — purge old caches ──────────────────────────────────────────────
self.addEventListener("activate", e => {
  const keep = [STATIC_CACHE, QUESTION_CACHE, FONT_CACHE];
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function isFresh(response, maxAgeMs) {
  if (!response) return false;
  const dateHeader = response.headers.get("sw-cached-at");
  if (!dateHeader) return false;
  return Date.now() - parseInt(dateHeader, 10) < maxAgeMs;
}

function stampedResponse(response) {
  // Clone and inject our own timestamp header so TTL checks work
  const headers = new Headers(response.headers);
  headers.set("sw-cached-at", String(Date.now()));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys  = await cache.keys();
  if (keys.length > maxItems) {
    // Delete oldest entries (FIFO)
    const toDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(toDelete.map(k => cache.delete(k)));
  }
}

// ── Fetch handler ─────────────────────────────────────────────────────────────
self.addEventListener("fetch", e => {
  const { request } = e;
  const url = new URL(request.url);

  // ── 1. Non-GET → always network (mutations, auth, payment) ──────────────
  if (request.method !== "GET") return;

  // ── 2. API routes ────────────────────────────────────────────────────────
  if (url.pathname.startsWith("/api/")) {
    // Only cache question fetches — everything else is network-only
    if (url.pathname === "/api/db") {
      e.respondWith(handleQuestionApi(request));
    }
    // auth, payment, school, notify → pure network
    return;
  }

  // ── 3. Google Fonts ──────────────────────────────────────────────────────
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(cacheFirstWithTTL(request, FONT_CACHE, FONT_TTL_MS));
    return;
  }

  // ── 4. JS/CSS assets → network-first (ensures fresh code after deploys) ──
  if (url.pathname.match(/\.(js|css)$/)) {
    e.respondWith(networkFirstWithFallback(request));
    return;
  }

  // ── 5. Images, fonts, icons → stale-while-revalidate ────────────────────
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?|webp|gif)$/)) {
    e.respondWith(staleWhileRevalidate(request));
    return;
  }

  // ── 6. HTML shell (index + root) → network-first ────────────────────────
  if (url.pathname === "/" || url.pathname === "/index.html") {
    e.respondWith(networkFirstWithFallback(request));
    return;
  }

  // ── 5. Everything else (SPA routes) → serve index.html ──────────────────
  e.respondWith(
    caches.match("/index.html").then(r => r || fetch(request))
  );
});

// ── Strategy: Network-first with cache fallback (for JS/CSS/HTML) ────────────
async function networkFirstWithFallback(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok && response.type !== "opaque") {
      cache.put(request, response.clone());
    }
    return response;
  } catch(e) {
    const cached = await cache.match(request);
    return cached || caches.match("/offline.html");
  }
}

// ── Strategy: Stale-while-revalidate for static shell ────────────────────────
async function staleWhileRevalidate(request) {
  const cache  = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response && response.ok && response.type !== "opaque") {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  return cached || fetchPromise || caches.match("/offline.html");
}

// ── Strategy: Cache-first with TTL ──────────────────────────────────────────
async function cacheFirstWithTTL(request, cacheName, ttlMs) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (isFresh(cached, ttlMs)) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, stampedResponse(response.clone()));
    }
    return response;
  } catch(e) {
    return cached || Response.error();
  }
}

// ── Strategy: Question API — cache-first by body hash, 24h TTL ──────────────
async function handleQuestionApi(request) {
  // Clone body to read action without consuming the stream
  let body;
  try { body = await request.clone().json(); } catch(e) { return fetch(request); }

  // Only cache get_questions — all other actions go to network
  if (body.action !== "get_questions") {
    return fetch(request).catch(() => Response.json({ error: "offline" }, { status: 503 }));
  }

  // Cache key = lesson_id + set_index
  const cacheKey = new Request(
    `${request.url}?lesson=${encodeURIComponent(body.lesson_id || "")}&set=${body.set_index ?? 0}`
  );
  const cache  = await caches.open(QUESTION_CACHE);
  const cached = await cache.match(cacheKey);

  if (isFresh(cached, QUESTION_TTL_MS)) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const stamped = stampedResponse(response.clone());
      await cache.put(cacheKey, stamped);
      await limitCacheSize(QUESTION_CACHE, MAX_QUESTION_ENTRIES);
    }
    return response;
  } catch(e) {
    // Offline — serve stale if available
    if (cached) return cached;
    return Response.json(
      { error: "offline", data: [] },
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ── Message: force update from app ──────────────────────────────────────────
self.addEventListener("message", e => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
  if (e.data === "CLEAR_QUESTION_CACHE") {
    caches.delete(QUESTION_CACHE).then(() =>
      e.source?.postMessage({ type: "QUESTION_CACHE_CLEARED" })
    );
  }
});