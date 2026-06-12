// src/lib/hints.js — Daily hint system
// Free: 5 hints/day. Extra packs from shop (same-day validity).

export const HINT_FREE_DAILY = 5;

function todayKey() { return new Date().toISOString().slice(0,10); }

export function getHintCounts(childId) {
  const today = todayKey();
  let free = 0, extra = 0;
  try { const r = localStorage.getItem(`mm_hints_free_${childId}_${today}`); free = r ? parseInt(r)||0 : 0; } catch(e) {}
  try { const r = localStorage.getItem(`mm_hints_extra_${childId}_${today}`); extra = r ? parseInt(r)||0 : 0; } catch(e) {}
  return { free, extra };
}

export function getHintsRemaining(childId) {
  const { free, extra } = getHintCounts(childId);
  const freeLeft = Math.max(0, HINT_FREE_DAILY - free);
  return { freeLeft, extraLeft: extra, totalLeft: freeLeft + extra };
}

export function useHint(childId) {
  const today = todayKey();
  const { freeLeft, extraLeft } = getHintsRemaining(childId);
  if (freeLeft <= 0 && extraLeft <= 0) return false;
  try {
    if (freeLeft > 0) {
      const { free } = getHintCounts(childId);
      localStorage.setItem(`mm_hints_free_${childId}_${today}`, String(free + 1));
    } else {
      const { extra } = getHintCounts(childId);
      localStorage.setItem(`mm_hints_extra_${childId}_${today}`, String(Math.max(0, extra - 1)));
    }
  } catch(e) {}
  return true;
}

export function addExtraHints(childId, count) {
  const today = todayKey();
  try {
    const { extra } = getHintCounts(childId);
    localStorage.setItem(`mm_hints_extra_${childId}_${today}`, String(extra + count));
  } catch(e) {}
}
