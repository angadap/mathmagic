// src/lib/cache.js — Question cache with 24h TTL

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENT QUESTION CACHE — localStorage-backed, 24h TTL, 50-set LRU
// On page reload the cache is restored instantly — no DB round-trip needed
// ─────────────────────────────────────────────────────────────────────────────
export const Q_CACHE_MAX = 50;
export const Q_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
export const Q_LS_KEY    = "mm_qcache_v2";

export const Q_RAW_CACHE = (() => {
  try {
    const raw = localStorage.getItem(Q_LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const now = Date.now();
    const fresh = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (v && v._ts && now - v._ts < Q_CACHE_TTL) fresh[k] = v;
    }
    return fresh;
  } catch(e) { return {}; }
})();

export function cacheSet(key, data) {
  const keys = Object.keys(Q_RAW_CACHE);
  if (keys.length >= Q_CACHE_MAX) {
    const oldest = keys.sort((a,b)=>(Q_RAW_CACHE[a]._ts||0)-(Q_RAW_CACHE[b]._ts||0))[0];
    delete Q_RAW_CACHE[oldest];
  }
  Q_RAW_CACHE[key] = { _data: data, _ts: Date.now() };
  try { localStorage.setItem(Q_LS_KEY, JSON.stringify(Q_RAW_CACHE)); } catch(e) {}
}

export function cacheGet(key) {
  const entry = Q_RAW_CACHE[key];
  if (!entry) return null;
  if (!entry._ts || Date.now() - entry._ts > Q_CACHE_TTL) { delete Q_RAW_CACHE[key]; return null; }
  return entry._data;
}

// ── Shared LS helpers (progress + children) ───────────────────────────────────
