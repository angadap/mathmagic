// src/lib/db.js — API client (sbRest), in-memory store, db wrapper
// All Supabase / server communication goes through /api/* Vercel routes.

import { SFX } from './sfx.js';

const DEMO_MODE = false;

// ── Helpers (used internally by fetchSetQuestions) ─────────────────────────
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shuffle opts while keeping correct answer pointer correct
export function shuffleOpts(opts, ans) {
  const correct = opts[ans];
  const shuffled = shuffle(opts);
  return { opts: shuffled, ans: shuffled.indexOf(correct) };
}

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

// ── Main db / API layer ────────────────────────────────────────────────────
export function dbLog(level, msg, detail="") {
  if (level === "error") console.error("[DB]", msg, detail);
  else console.log("[DB]", msg, detail);
}

// ─────────────────────────────────────────────────────────────────────────────
// WORLDS — one per class
// ─────────────────────────────────────────────────────────────────────────────
const WORLDS = [
  { id:10, name:"Nursery",  world:"Star Seeds",     planet:"🌱", color:"#84cc16", glow:"#84cc1644", free:false },
  { id:11, name:"Jr KG",    world:"Moon Garden",    planet:"🌙", color:"#f472b6", glow:"#f472b644", free:false },
  { id:12, name:"Sr KG",    world:"Sun Valley",     planet:"☀️", color:"#fb923c", glow:"#fb923c44", free:false },
  { id:1,  name:"Class 1",  world:"Orion Nebula",   planet:"🌍", color:"#22c55e", glow:"#22c55e44", free:true  },
  { id:2,  name:"Class 2",  world:"Andromeda",      planet:"🪐", color:"#3b82f6", glow:"#3b82f644", free:false },
  { id:3,  name:"Class 3",  world:"Milky Way Core", planet:"⭐", color:"#a855f7", glow:"#a855f744", free:false },
  { id:4,  name:"Class 4",  world:"Cygnus Rift",    planet:"🔴", color:"#f97316", glow:"#f9731644", free:false },
  { id:5,  name:"Class 5",  world:"Event Horizon",  planet:"🌌", color:"#ec4899", glow:"#ec489944", free:false },
];

// ─────────────────────────────────────────────────────────────────────────────
// LESSONS — per class, references lesson IDs that match questions table
// ─────────────────────────────────────────────────────────────────────────────
const LESSONS = {
  10: [ // Nursery
    { id:"n-l1", title:"Counting 1–5",    emoji:"🔢", sets:20, xp:50 },
    { id:"n-l2", title:"Shapes",          emoji:"🔷", sets:20, xp:50 },
    { id:"n-l3", title:"Colors",          emoji:"🎨", sets:20, xp:50 },
    { id:"n-l4", title:"Animals",         emoji:"🐾", sets:20, xp:50 },
    { id:"n-l5", title:"Big & Small",     emoji:"📏", sets:20, xp:50 },
    { id:"n-l6", title:"Simple Sums",     emoji:"➕", sets:20, xp:50 },
  ],
  11: [ // Jr KG
    { id:"jk-l1", title:"Numbers 1–10",   emoji:"🔢", sets:20, xp:60 },
    { id:"jk-l2", title:"2D Shapes",      emoji:"🔷", sets:20, xp:60 },
    { id:"jk-l3", title:"Colors & Patterns",emoji:"🌈",sets:20, xp:60 },
    { id:"jk-l4", title:"More & Less",    emoji:"⚖️", sets:20, xp:60 },
    { id:"jk-l5", title:"Addition to 10", emoji:"➕", sets:20, xp:60 },
    { id:"jk-l6", title:"Body Parts",     emoji:"🧍", sets:20, xp:60 },
  ],
  12: [ // Sr KG
    { id:"sk-l1", title:"Numbers 1–20",   emoji:"🔢", sets:20, xp:70 },
    { id:"sk-l2", title:"Addition to 5",  emoji:"➕", sets:20, xp:70 },
    { id:"sk-l3", title:"Subtraction",    emoji:"➖", sets:20, xp:70 },
    { id:"sk-l4", title:"3D Shapes",      emoji:"🔮", sets:20, xp:70 },
    { id:"sk-l5", title:"Time & Day",     emoji:"⏰", sets:20, xp:70 },
    { id:"sk-l6", title:"Money Basics",   emoji:"💰", sets:20, xp:70 },
  ],
  1: [
    { id:"c1-l1", title:"Shapes & Space",           icon:"🔷", sets:20, xp:100 },
    { id:"c1-l2", title:"Numbers 1–9",              icon:"🔢", sets:20, xp:100 },
    { id:"c1-l3", title:"Numbers 10–20",            icon:"🔟", sets:20, xp:100 },
    { id:"c1-l4", title:"Numbers 21–100",           icon:"💯", sets:20, xp:150 },
    { id:"c1-l5", title:"Addition",                 icon:"➕", sets:20, xp:150 },
    { id:"c1-l6", title:"Subtraction",              icon:"➖", sets:20, xp:150 },
    { id:"c1-l7", title:"Measurement",              icon:"📏", sets:20, xp:150 },
    { id:"c1-l8", title:"Time & Money",             icon:"⏰", sets:20, xp:150 },
    { id:"c1-l9", title:"Patterns & Fractions",     icon:"🔁", sets:20, xp:200 },
  ],
  2: [
    { id:"c2-l1", title:"Numbers up to 1000",       icon:"🔢", sets:20, xp:150 },
    { id:"c2-l2", title:"Addition & Subtraction",   icon:"➕", sets:20, xp:150 },
    { id:"c2-l3", title:"Multiplication & Division",icon:"✖️", sets:20, xp:200 },
    { id:"c2-l4", title:"Shapes & Geometry",        icon:"🔷", sets:20, xp:150 },
    { id:"c2-l5", title:"Measurement",              icon:"📏", sets:20, xp:150 },
    { id:"c2-l6", title:"Time & Calendar",          icon:"📅", sets:20, xp:150 },
    { id:"c2-l7", title:"Money",                    icon:"💰", sets:20, xp:150 },
    { id:"c2-l8", title:"Data Handling",            icon:"📊", sets:20, xp:150 },
  ],
  3: [
    { id:"c3-l1", title:"Numbers & Place Value",    icon:"🔢", sets:20, xp:200 },
    { id:"c3-l2", title:"Addition & Subtraction",   icon:"➕", sets:20, xp:200 },
    { id:"c3-l3", title:"Multiplication & Division",icon:"✖️", sets:20, xp:200 },
    { id:"c3-l4", title:"Fractions",                icon:"½",  sets:20, xp:200 },
    { id:"c3-l5", title:"Measurement & Time",       icon:"📏", sets:20, xp:200 },
    { id:"c3-l6", title:"Geometry",                 icon:"📐", sets:20, xp:200 },
    { id:"c3-l7", title:"Money",                    icon:"💰", sets:20, xp:200 },
    { id:"c3-l8", title:"Data & Patterns",          icon:"📊", sets:20, xp:200 },
  ],
  4: [
    { id:"c4-l1", title:"Large Numbers & Numerals", icon:"🔢", sets:20, xp:250 },
    { id:"c4-l2", title:"Large Operations",         icon:"➕", sets:20, xp:250 },
    { id:"c4-l3", title:"Factors & Multiples",      icon:"🔗", sets:20, xp:250 },
    { id:"c4-l4", title:"Fractions & Decimals",     icon:"½",  sets:20, xp:250 },
    { id:"c4-l5", title:"Geometry & Angles",        icon:"📐", sets:20, xp:250 },
    { id:"c4-l6", title:"Perimeter & Area",         icon:"📏", sets:20, xp:250 },
    { id:"c4-l7", title:"Time, Temp & Money",       icon:"⏰", sets:20, xp:250 },
    { id:"c4-l8", title:"Measurement",              icon:"⚖️", sets:20, xp:250 },
    { id:"c4-l9", title:"Patterns & Data",          icon:"📊", sets:20, xp:250 },
  ],
  5: [
    { id:"c5-l1", title:"Large Numbers & Operations",icon:"🔢", sets:20, xp:300 },
    { id:"c5-l2", title:"Factors, LCM & HCF",       icon:"🔗", sets:20, xp:300 },
    { id:"c5-l3", title:"Fractions & Decimals",      icon:"½",  sets:20, xp:300 },
    { id:"c5-l4", title:"Percentage",                icon:"%",  sets:20, xp:300 },
    { id:"c5-l5", title:"Geometry & Symmetry",       icon:"📐", sets:20, xp:300 },
    { id:"c5-l6", title:"Area, Volume & Measurement",icon:"📏", sets:20, xp:300 },
    { id:"c5-l7", title:"Data Handling & Probability",icon:"📊", sets:20, xp:300 },
    { id:"c5-l8", title:"Mapping & Patterns",        icon:"🗺️", sets:20, xp:300 },
  ],
};

// ── Badges ────────────────────────────────────────────────────────
const BADGES = [
  {id:"first_lesson",   name:"First Step",     icon:"👣", desc:"Complete your first set",           cat:"general"},
  {id:"streak_3",       name:"On a Roll",      icon:"🔥", desc:"3-day streak",                      cat:"streak"},
  {id:"streak_7",       name:"On Fire",        icon:"🔥", desc:"7-day streak",                      cat:"streak"},
  {id:"streak_30",      name:"Unstoppable",    icon:"⚡", desc:"30-day streak",                     cat:"streak"},
  {id:"perfect_score",  name:"Perfectionist",  icon:"🎯", desc:"Get 3 stars on any set",            cat:"master"},
  {id:"speed_solver",   name:"Speed Solver",   icon:"⚡", desc:"Answer correctly in under 5s",      cat:"speed"},
  {id:"correct_100",    name:"Century",        icon:"💯", desc:"100 correct answers",               cat:"general"},
  {id:"correct_500",    name:"Math Machine",   icon:"🤖", desc:"500 correct answers",               cat:"general"},
  {id:"stars_50",       name:"Star Collector", icon:"⭐", desc:"Earn 50 stars total",               cat:"general"},
  {id:"stars_200",      name:"Star Hoarder",   icon:"🌟", desc:"Earn 200 stars total",              cat:"general"},
  {id:"xp_500",         name:"XP Hunter",      icon:"💎", desc:"Earn 500 XP",                       cat:"general"},
  {id:"boss_first",     name:"Monster Slayer", icon:"⚔️", desc:"Defeat your first boss",            cat:"master"},
  {id:"boss_5",         name:"Boss Crusher",   icon:"🏆", desc:"Defeat 5 bosses",                   cat:"master"},
  {id:"daily_7",        name:"Daily Devotee",  icon:"🗓️", desc:"Complete 7 daily challenges",      cat:"streak"},
  {id:"accuracy_90",    name:"Sharpshooter",   icon:"🎯", desc:"90%+ accuracy over 50+ questions", cat:"speed"},
  {id:"lesson_master",  name:"Lesson Master",  icon:"📚", desc:"Complete all sets in a lesson",     cat:"master"},
];

// ── Shop Items ────────────────────────────────────────────────────
const SHOP_ITEMS = [
  // Avatars
  {id:"avatar_wizard",  name:"Math Wizard",  icon:"🧙‍♂️", desc:"Legendary wizard",     cat:"avatar",  stars:null, gems:50,   coins:null, lvl:5},
  {id:"avatar_unicorn", name:"Unicorn",      icon:"🦄",   desc:"Magical unicorn",      cat:"avatar",  stars:null, gems:null, coins:300,  lvl:3},
  {id:"avatar_robot",   name:"Robot",        icon:"🤖",   desc:"Futuristic robot",     cat:"avatar",  stars:null, gems:30,   coins:null, lvl:4},
  {id:"avatar_dragon",  name:"Dragon",       icon:"🐉",   desc:"Mighty dragon",        cat:"avatar",  stars:null, gems:80,   coins:null, lvl:8},
  {id:"avatar_hero",    name:"Superhero",    icon:"🦸",   desc:"Hero avatar",          cat:"avatar",  stars:50,   gems:null, coins:null, lvl:6},
  {id:"avatar_knight",  name:"Knight",       icon:"⚔️",   desc:"Brave knight",         cat:"avatar",  stars:null, gems:40,   coins:null, lvl:5},
  // Themes
  {id:"theme_dark",     name:"Space Dark",   icon:"🌙",   desc:"Original dark theme",  cat:"theme",   stars:null, gems:30,   coins:null, lvl:1},
  {id:"theme_candy",    name:"Candy Pop",    icon:"🍭",   desc:"Sweet candy theme",    cat:"theme",   stars:null, gems:25,   coins:null, lvl:2},
  {id:"theme_sunset",   name:"Sunset Blaze", icon:"🌅",   desc:"Warm sunset theme",    cat:"theme",   stars:null, gems:20,   coins:null, lvl:2},
  // Power-ups
  {id:"powerup_hint",   name:"Hint Pack",    icon:"💡",   desc:"3 extra hints",        cat:"powerup", stars:20,   gems:null, coins:null, lvl:1},
  {id:"powerup_shield", name:"Shield Pack",  icon:"🛡️",   desc:"Extra 2 lives",        cat:"powerup", stars:null, gems:null, coins:150,  lvl:2},
  {id:"powerup_time",   name:"Time Freeze",  icon:"⏰",   desc:"+10s per question",    cat:"powerup", stars:15,   gems:null, coins:null, lvl:1},
  {id:"powerup_double", name:"Double XP",    icon:"⚡",   desc:"2× XP for 3 sets",     cat:"powerup", stars:null, gems:20,   coins:null, lvl:3},
];

// ── Avatar options (free built-in) ────────────────────────────────
const FREE_AVATARS = ["🧒","👧","👦","🧑","🧒‍♀️"];
const ALL_AVATARS  = ["🧒","👧","👦","🧑","🧒‍♀️","🧙‍♂️","🦄","🤖","🐉","🦸","⚔️"];

// ── Secure API Client — all auth/DB calls go through /api/* routes ──
// The Supabase service key NEVER reaches the browser
// JWT token stored in memory only (not localStorage)
export const sbRest = {
  _token: null,

  // Call our Vercel serverless functions
  async _api(route, body) {
    const headers = { "Content-Type": "application/json" };
    if (this._token) headers["Authorization"] = `Bearer ${this._token}`;
    try {
      const res = await fetch(`/api/${route}`, { method:"POST", headers, body:JSON.stringify(body) });
      const data = await res.json();
      if (res.status === 429) {
        dbLog("error", "Rate limit hit", data.error);
        return { data:null, error:{ message:data.error } };
      }
      if (!res.ok) return { data:null, error:{ message:data.error||"Request failed" } };
      return { data, error:null };
    } catch(e) {
      dbLog("error", "API call failed", e.message);
      return { data:null, error:{ message:e.message } };
    }
  },

  // ── Auth (server-side, rate-limited) ──────────────────────────
  async signUp(email, password) {
    const { data, error } = await this._api("auth", { action:"signup", email, password });
    if (error) return { data:null, error };
    if (data.access_token) this._token = data.access_token;
    return { data:{ user: data.user }, error:null };
  },

  async signIn(email, password) {
    const { data, error } = await this._api("auth", { action:"signin", email, password });
    if (error) return { data:null, error };
    if (data.access_token) this._token = data.access_token;
    return { data:{ user: data.user }, error:null };
  },

  async signOut() {
    await this._api("auth", { action:"signout" });
    this._token = null;
    return { error:null };
  },

  // ── DB operations (server-side, authenticated) ─────────────────
  async insert(table, row) {
    const { data, error } = await this._api("db", { action:`add_${table.replace("ren","").replace("ress","ress")}`, ...row });
    if (error) return { data:null, error };
    return { data: data?.data || data, error:null };
  },

  async upsert(table, row, onConflict) {
    const { data, error } = await this._api("db", { action:`save_${table}`, ...row });
    if (error) return { error };
    return { error:null };
  },

  async update(table, row, col, val) {
    const { data, error } = await this._api("db", { action:`update_${table}`, ...row, [col]:val });
    if (error) return { data:null, error };
    return { data: data?.data || data, error:null };
  },

  async select(table, filters={}) {
    const action = table === "children" ? "get_children"
                 : table === "progress" ? "get_progress"
                 : `select_${table}`;
    const { data, error } = await this._api("db", { action, ...filters });
    if (error) return { data:[], error };
    return { data: data?.data || [], error:null };
  },

  async rpc(fn, params) {
    const { data, error } = await this._api("db", { action:`rpc_${fn}`, ...params });
    if (error) return { data:null, error };
    return { data: data?.data || data, error:null };
  },

  async ping() {
    try {
      const res = await fetch("/api/db", { method:"POST", headers:{"Content-Type":"application/json"}, body:'{"action":"ping"}' });
      return res.status < 500;
    } catch(e) { return false; }
  },
};
async function loadSb() {
  if (DEMO_MODE) return null;
  if (window.__mmSbReady !== undefined) return window.__mmSbReady ? sbRest : null;
  try {
    const ok = await sbRest.ping();
    window.__mmSbReady = ok;
    if (ok) { dbLog("ok","Supabase connected ✓"); return sbRest; }
    dbLog("error","Supabase unreachable — in-memory mode");
    return null;
  } catch(e) {
    window.__mmSbReady = false;
    dbLog("error","Supabase ping failed",e.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────
// IN-MEMORY STORE — works fully offline; Supabase is optional
// ─────────────────────────────────────────────────────────────────────
export const PROGRESS_LS_KEY = "mm_progress_v2";
export const CHILDREN_LS_KEY = "mm_children_v2";
export const DAILY_LS_KEY    = "mm_daily_v2";

export function lsPersist(lsKey, data) {
  try { localStorage.setItem(lsKey, JSON.stringify({ _ts: Date.now(), data })); } catch(e) {}
}
export function lsRestore(lsKey, maxAgeMs = 60 * 60 * 1000) {
  try {
    const raw = localStorage.getItem(lsKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() - parsed._ts > maxAgeMs) return null;
    return parsed.data;
  } catch(e) { return null; }
}

export async function fetchSetQuestions(lessonId, setIndex) {
  const key = lessonId + "_" + setIndex;

  // Serve from persistent cache — no DB round trip, works after reload
  const cached = cacheGet(key);
  if (cached) {
    return shuffle(cached.map(r => {
      const { opts, ans } = shuffleOpts(r.opts, r.ans);
      return { q: r.q, opts, ans, h: r.h };
    }));
  }

  try {
    const res = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_questions", lesson_id: lessonId + "_s" + setIndex, set_index: setIndex })
    });
    const json = await res.json();
    const data = json.data;
    if (Array.isArray(data) && data.length > 0) {
      const mapped = data.map(r => ({
        q: r.question,
        opts: Array.isArray(r.options) ? r.options : JSON.parse(r.options),
        ans: r.correct_answer,
        h: r.hint,
      }));
      cacheSet(key, mapped);
      return shuffle(mapped.map(r => {
        const { opts, ans } = shuffleOpts(r.opts, r.ans);
        return { q: r.q, opts, ans, h: r.h };
      }));
    }
  } catch(e) { console.warn("fetchSetQuestions failed:", e.message); }
  // Questions are stored in the Supabase 'questions' table.
  // This minimal fallback only triggers if DB fetch fails AND no cache exists.
  const FALLBACK_Q = [
    {q:"What is 5 + 3?",  opts:["6","7","8","9"],    ans:2, h:"Count on from 5!"},
    {q:"What is 9 - 4?",  opts:["3","4","5","6"],    ans:2, h:"Take away 4 from 9!"},
    {q:"What is 3 x 4?",  opts:["10","11","12","13"],ans:2, h:"3 groups of 4!"},
    {q:"What is 20 / 4?", opts:["3","4","5","6"],    ans:2, h:"20 shared into 4 groups!"},
    {q:"What is 7 + 8?",  opts:["13","14","15","16"],ans:2, h:"7+8=15!"},
    {q:"What is 15 - 6?", opts:["7","8","9","10"],   ans:2, h:"15-6=9!"},
    {q:"What is 6 x 5?",  opts:["28","29","30","31"],ans:2, h:"6x5=30!"},
    {q:"What is 36 / 6?", opts:["4","5","6","7"],    ans:2, h:"36÷6=6!"},
    {q:"What is 13 + 9?", opts:["20","21","22","23"],ans:2, h:"13+9=22!"},
    {q:"What is 25 - 8?", opts:["15","16","17","18"],ans:2, h:"25-8=17!"},
    {q:"What is 8 x 7?",  opts:["54","55","56","57"],ans:2, h:"8x7=56!"},
    {q:"What is 45 / 9?", opts:["3","4","5","6"],    ans:2, h:"45÷9=5!"},
    {q:"What is 14 + 7?", opts:["19","20","21","22"],ans:2, h:"14+7=21!"},
    {q:"What is 32 - 14?",opts:["16","17","18","19"],ans:2, h:"32-14=18!"},
    {q:"What is 9 x 6?",  opts:["52","53","54","55"],ans:2, h:"9x6=54!"},
    {q:"What is 48 / 8?", opts:["4","5","6","7"],    ans:2, h:"48÷8=6!"},
    {q:"What is 16 + 8?", opts:["22","23","24","25"],ans:2, h:"16+8=24!"},
    {q:"What is 40 - 13?",opts:["25","26","27","28"],ans:2, h:"40-13=27!"},
    {q:"What is 7 x 8?",  opts:["54","55","56","57"],ans:2, h:"7x8=56!"},
    {q:"What is 63 / 7?", opts:["7","8","9","10"],   ans:2, h:"63÷7=9!"},
  ];
    // Pick questions for this lesson (or graceful fallback)
  // Primary source: Supabase questions table (fetched above)
  // Fallback: FALLBACK_Q (only if DB fetch failed)
  return shuffle(FALLBACK_Q.map(q => { const r = shuffleOpts(q.opts, q.ans); return {...q, ...r}; }));
}



// ── MEM — restored from localStorage on startup (1-hour TTL) ────────────────
const MEM = (() => {
  const cachedChildren = lsRestore(CHILDREN_LS_KEY, 60 * 60 * 1000) || [];
  const cachedProgress = lsRestore(PROGRESS_LS_KEY, 30 * 60 * 1000) || [];
  return { users: [], children: cachedChildren, progress: cachedProgress, n: 1 };
})();
// Session ID for analytics
if (!window.__sessionId) window.__sessionId = "s_" + Date.now() + "_" + Math.random().toString(36).slice(2,7);

// ── Network & Battery awareness ──────────────────────────────────
window.__isOnline = navigator.onLine;
window.addEventListener("online",  () => { window.__isOnline = true;  document.dispatchEvent(new Event("mm_online")); });
window.addEventListener("offline", () => { window.__isOnline = false; document.dispatchEvent(new Event("mm_offline")); });

// Reduce animations on low-end devices / power-save mode
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion) {
  const s = document.createElement("style");
  s.textContent = "*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }";
  document.head.appendChild(s);
}

// Mute sound on battery saver (Battery Status API where available)
if ("getBattery" in navigator) {
  navigator.getBattery().then(bat => {
    if (bat.level < 0.15 && !bat.charging) {
      if (!SFX.muted) SFX.toggleMute();
    }
    bat.addEventListener("levelchange", () => {
      if (bat.level < 0.10 && !bat.charging && !SFX.muted) SFX.toggleMute();
    });
  }).catch(()=>{});
}

export const db = {
  _sb: undefined,
  _token: null,   // mirrors sbRest._token so all fetch calls carry a valid JWT

  async getSb() {
    if (this._sb !== undefined) return this._sb;
    this._sb = await loadSb();
    return this._sb;
  },

  // -- Fetch child record (memory-first, then DB) ----------------
  async getChild(cid) {
    const mem = MEM.children.find(x => x.id === cid);
    if (mem) return { data: mem, error: null };
    try {
      const res = await fetch("/api/db", { method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`},
        body: JSON.stringify({ action:"get_children", id:cid }) });
      const j = await res.json();
      const c = Array.isArray(j.data) ? j.data[0] : j.data;
      if (c) { MEM.children.push(c); lsPersist(CHILDREN_LS_KEY, MEM.children); }
      return { data: c || null, error: null };
    } catch(e) { return { data: null, error: e.message }; }
  },

  // -- Persist arbitrary child fields to DB + memory (optimistic) -
  async updateChildFields(cid, fields) {
    const c = MEM.children.find(x => x.id === cid);
    if (c) { Object.assign(c, fields); lsPersist(CHILDREN_LS_KEY, MEM.children); }
    try {
      const res = await fetch("/api/db", { method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`},
        body: JSON.stringify({ action:"update_children", id:cid, ...fields }) });
      const j = await res.json();
      if (!j.ok) dbLog("error", "updateChildFields failed", j.error);
    } catch(e) { dbLog("error", "updateChildFields network error", e.message); }
    return { error: null };
  },

  async signUp(email, pass) {
    const sb = await this.getSb();
    if (sb) {
      const r = await sb.signUp(email, pass);
      if (!r.error && r.data?.user?.id) {
        const uid = r.data.user.id;
        dbLog("ok","signUp success",uid.slice(0,8));
        if (!MEM.users.find(u=>u.id===uid)) MEM.users.push({ id:uid, email, pass });
        if (sb._token) this._token = sb._token;
        return { data:{ user:{ id:uid, email } }, error:null };
      }
      if (r.error) {
        const isNet = /fetch|network|host|failed/i.test(r.error.message||"");
        if (!isNet) { dbLog("error","signUp rejected",r.error.message); return { data:null, error:{ message:r.error.message } }; }
        dbLog("error","signUp network error — using in-memory",r.error.message);
      }
    }
    if (MEM.users.find(u=>u.email===email))
      return { data:null, error:{ message:"Email already registered" } };
    const user = { id:"local_"+Math.random().toString(36).slice(2), email };
    MEM.users.push({ ...user, pass });
    return { data:{ user }, error:null };
  },

  async signIn(email, pass) {
    const sb = await this.getSb();
    if (sb) {
      const r = await sb.signIn(email, pass);
      if (!r.error && r.data?.user?.id) {
        dbLog("ok","signIn success","uid="+r.data.user.id.slice(0,8));
        if (!MEM.users.find(u=>u.id===r.data.user.id)) MEM.users.push({ id:r.data.user.id, email, pass });
        // Sync JWT token so db.updateChildFields and other fetch calls are authenticated
        if (sb._token) this._token = sb._token;
        return { data:{ user:{ id:r.data.user.id, email } }, error:null };
      }
      if (r.error) {
        const isNet = /fetch|network|host|failed/i.test(r.error.message||"");
        if (!isNet) return { data:null, error:{ message:r.error.message } };
        dbLog("error","signIn network",r.error.message);
      }
    }
    const u = MEM.users.find(u => u.email===email && u.pass===pass);
    return u ? { data:{ user:u }, error:null }
             : { data:null, error:{ message:"Invalid email or password" } };
  },

  async signOut() {
    return { error: null };
  },

  // ── Daily Challenge ──────────────────────────────────────────
  async getDailyChallenge(classNum) {
    const epoch  = new Date("2025-01-01");
    const dayNum = Math.floor((new Date() - epoch) / 86400000) % 250 + 1;
    const today  = new Date().toISOString().slice(0,10);
    // Check day-scoped cache
    const dcKey = `mm_dc_${classNum}_${today}`;
    const cached = lsRestore(dcKey, 24*60*60*1000);
    if (cached) return cached;
    try {
      const res = await fetch("/api/db", { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`}, body:JSON.stringify({ action:"get_daily_challenge", class_num:classNum, seq_num:dayNum }) });
      const json = await res.json();
      const d = json.data;
      const challenge = (d && !Array.isArray(d)) ? d : (Array.isArray(d) && d[0]) ? d[0] : null;
      if (challenge) lsPersist(dcKey, challenge);
      return challenge;
    } catch(e) { dbLog("error","getDailyChallenge",e.message); return null; }
  },

  async getDailyCompletion(childId) {
    const today = new Date().toISOString().slice(0,10);
    if (localStorage.getItem(`dq_done_${childId}_${today}`)) return { completed_at: today };
    try {
      const res = await fetch("/api/db", { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`}, body:JSON.stringify({ action:"get_daily_completion", child_id:childId, date:today }) });
      const json = await res.json();
      return json.data?.[0] || null;
    } catch(e) { return null; }
  },

  async completeDailyChallenge(childId, challengeId, correct) {
    const today = new Date().toISOString().slice(0,10);
    if (correct) localStorage.setItem(`dq_done_${childId}_${today}`,"1");
    fetch("/api/db", { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`}, body:JSON.stringify({ action:"complete_daily_challenge", child_id:childId, challenge_id:challengeId, date:today, correct }) }).catch(()=>{});
  },

  async getDailyPuzzle() {
    const today = new Date().toISOString().slice(0,10);
    const dpKey = `mm_dp_${today}`;
    const cached = lsRestore(dpKey, 24*60*60*1000);
    if (cached) return cached;
    try {
      const res = await fetch("/api/db", { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`}, body:JSON.stringify({ action:"get_daily_puzzle" }) });
      const json = await res.json();
      if (json.data) { lsPersist(dpKey, json.data); return json.data; }
      return null;
    } catch(e) { return null; }
  },

  async completePuzzle(childId, puzzleId, answerGiven, correct) {
    const today = new Date().toISOString().slice(0,10);
    if (correct) localStorage.setItem(`dp_done_${childId}_${today}`,"1");
    fetch("/api/db", { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`}, body:JSON.stringify({ action:"complete_puzzle", child_id:childId, puzzle_id:puzzleId, date:today, answer_given:answerGiven, correct }) }).catch(()=>{});
  },

  async getPuzzleCompletion(childId) {
    const today = new Date().toISOString().slice(0,10);
    if (localStorage.getItem(`dp_done_${childId}_${today}`)) return { completed_at: today };
    try {
      const res = await fetch("/api/db", { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`}, body:JSON.stringify({ action:"get_puzzle_completion", child_id:childId, date:today }) });
      const json = await res.json();
      return json.data?.[0] || null;
    } catch(e) { return null; }
  },

    // ── Analytics ────────────────────────────────────────────────
  async track(eventType, childId, parentId, data={}) {
    const sb = await this.getSb();
    if (!sb) return;
    // Fire-and-forget — never block UI
    sb.insert("analytics", {
      child_id: childId || null,
      parent_id: parentId || null,
      event_type: eventType,
      event_data: data,
      app_version: "1.0.0",
      platform: "web",
      session_id: window.__sessionId || null,
      created_at: new Date().toISOString()
    }).catch(()=>{});
  },

  // ── App Ratings ──────────────────────────────────────────────
  async saveRating(childId, parentId, rating, review) {
    const sb = await this.getSb();
    if (sb) {
      await sb.insert("app_ratings", {
        child_id: childId || null,
        parent_id: parentId || null,
        rating, review: review || "",
        app_version: "1.0.0",
        platform: "web",
        created_at: new Date().toISOString()
      });
    }
    localStorage.setItem("mm_rated", "1");
  },

  async getChildren(pid) {
    const sb = await this.getSb();
    if (sb) {
      const r = await sb.select("children", { parent_id: pid });
      if (!r.error) {
        r.data.forEach(c=>{ if(!MEM.children.find(m=>m.id===c.id)) MEM.children.push(c); });
        lsPersist(CHILDREN_LS_KEY, MEM.children); // persist for next session
        return { data:r.data, error:null };
      }
    }
    return { data:MEM.children.filter(c=>c.parent_id===pid), error:null };
  },

  async addChild(pid, { name, avatar, class_num, pin }) {
    const payload = {
      parent_id: pid, name, avatar, class_num, pin_hash: pin,
      xp: 0, level: 1, coins: 50, streak_days: 0, is_premium: false,
      created_at: new Date().toISOString()
    };
    const sb = await this.getSb();
    if (sb) {
      const r = await sb.insert("children", payload);
      if (!r.error && r.data) {
        MEM.children.push(r.data);
        lsPersist(CHILDREN_LS_KEY, MEM.children);
        dbLog("ok","addChild saved to DB ✓", r.data.id);
        return { data:r.data, error:null };
      }
      dbLog("error","addChild DB failed — using in-memory", r?.error?.message);
    }
    const c = { ...payload, id:"c_"+Math.random().toString(36).slice(2) };
    MEM.children.push(c);
    lsPersist(CHILDREN_LS_KEY, MEM.children);
    return { data:c, error:null };
  },

  async checkPin(cid, pin) {
    const sb = await this.getSb();
    if (sb) {
      const r = await sb.select("children", { id: cid });
      if (!r.error && r.data?.[0]) { const c=r.data[0]; if(!MEM.children.find(m=>m.id===c.id)) MEM.children.push(c); return { ok:c.pin_hash===pin, child:c }; }
    }
    const c = MEM.children.find(x=>x.id===cid);
    return c ? { ok:c.pin_hash===pin, child:c } : { ok:false };
  },

  async addXP(cid, xp, coins=0, isSchoolStudent=false) {
    // Optimistic update in memory
    const c = MEM.children.find(x=>x.id===cid);
    if (c) { c.xp=(c.xp||0)+xp; c.coins=(c.coins||0)+coins; c.level=Math.floor(c.xp/200)+1; lsPersist(CHILDREN_LS_KEY, MEM.children); }
    // For school students saveProgress already updates the students table — skip double-write
    if (isSchoolStudent) return { data:c, error:null };
    // For individual children: call update_children endpoint
    try {
      const nx = c ? c.xp : xp;
      const nc = c ? c.coins : coins;
      await fetch("/api/db", { method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`},
        body: JSON.stringify({ action:"update_children", id:cid,
          xp:nx, coins:nc, level:Math.floor(nx/200)+1, last_active:new Date().toISOString() }) });
    } catch(e) { dbLog("error","addXP failed",e.message); }
    return { data:c, error:null };
  },

  async getProgress(cid) {
    try {
      const res = await fetch("/api/db",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`},body:JSON.stringify({action:"get_progress",child_id:cid})});
      const j = await res.json();
      if (j.data) {
        MEM.progress = [...MEM.progress.filter(p=>p.child_id!==cid), ...j.data];
        lsPersist(PROGRESS_LS_KEY, MEM.progress);
        return {data:j.data,error:null};
      }
    } catch(e) {}
    return { data:MEM.progress.filter(p=>p.child_id===cid), error:null };
  },

  async saveProgress(cid, lid, { correct, total, stars, xpEarned, isSchoolStudent=false }) {
    const ex = MEM.progress.find(p => p.child_id===cid && p.lesson_id===lid);
    if (ex) { ex.stars_earned=Math.max(ex.stars_earned||0,stars); ex.correct_count=correct; ex.completed_at=new Date().toISOString(); }
    else MEM.progress.push({ id:"p_"+Math.random().toString(36).slice(2), child_id:cid, lesson_id:lid,
      correct_count:correct, total_questions:total, stars_earned:stars,
      xp_earned:xpEarned, completed_at:new Date().toISOString() });
    // Persist progress immediately — survives page reload
    lsPersist(PROGRESS_LS_KEY, MEM.progress);

    const payload = { child_id:cid, lesson_id:lid, correct_count:correct, total_questions:total,
      stars_earned:stars, xp_earned:xpEarned, completed_at:new Date().toISOString(),
      is_school_student: isSchoolStudent };

    try {
      const res = await fetch("/api/db", { method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`},
        body: JSON.stringify({ action:"save_progress", ...payload }) });
      const j = await res.json();
      if (j.ok) {
        dbLog("ok","saveProgress saved to DB ✓", lid);
        // Sync returned XP/coins into memory so UI stays consistent
        if (j.xp !== undefined) {
          const mc = MEM.children.find(x=>x.id===cid);
          if (mc) { mc.xp=j.xp; mc.coins=j.coins; mc.level=Math.floor(j.xp/200)+1; }
        }
      } else {
        dbLog("error","saveProgress DB failed", j.error);
      }
    } catch(e) { dbLog("error","saveProgress network error", e.message); }
    return { error:null };
  },

  // RPC-based writes — use Postgres functions with SECURITY DEFINER to bypass RLS
  async _rpc(fn, params) {
    const sb = await this.getSb();
    if (!sb) return null;
    const r = await sb.rpc(fn, params);
    if (r && !r.error) return r.data;
    dbLog("error",`RPC ${fn} failed`, r?.error?.message);
    return null;
  },

  async addGems(cid, amount) {
    const { data: c } = await this.getChild(cid);
    if (!c) return;
    const newGems = (c.gems||0) + amount;
    await this.updateChildFields(cid, { gems: newGems });
    return newGems;
  },
  async unlockBadge(cid, badgeId) {
    const { data: c } = await this.getChild(cid);
    if (!c) return false;
    const ids = Array.isArray(c.badge_ids) ? c.badge_ids : [];
    if (ids.includes(badgeId)) return false;
    await this.updateChildFields(cid, { badge_ids: [...ids, badgeId] });
    return true;
  },
  async checkAndUnlockBadges(cid, child) {
    const unlocked = [];
    const ids = Array.isArray(child.badge_ids) ? child.badge_ids : [];
    const checks = [
      { id:"streak_3",    pass: (child.streak_days||0) >= 3 },
      { id:"streak_7",    pass: (child.streak_days||0) >= 7 },
      { id:"streak_30",   pass: (child.streak_days||0) >= 30 },
      { id:"correct_100", pass: (child.total_correct||0) >= 100 },
      { id:"correct_500", pass: (child.total_correct||0) >= 500 },
      { id:"xp_500",      pass: (child.xp||0) >= 500 },
      { id:"boss_first",  pass: (child.bosses_defeated||0) >= 1 },
      { id:"boss_5",      pass: (child.bosses_defeated||0) >= 5 },
      { id:"daily_7",     pass: (child.daily_challenges_done||0) >= 7 },
    ];
    for (const { id, pass } of checks) {
      if (pass && !ids.includes(id)) {
        const isNew = await this.unlockBadge(cid, id);
        if (isNew) unlocked.push(id);
      }
    }
    return unlocked;
  },
  async purchaseShopItem(cid, itemId, costType, amount) {
    const { data: c } = await this.getChild(cid);
    if (!c) return { ok: false, error: "Child not found" };
    const owned = Array.isArray(c.shop_items) ? c.shop_items : [];
    if (owned.includes(itemId)) return { ok: false, error: "Already owned" };
    const updates = { shop_items: [...owned, itemId] };
    if (costType === "stars") {
      if ((c.xp||0)/20 < amount) return { ok: false, error: "Not enough stars" };
    } else if (costType === "gems") {
      if ((c.gems||0) < amount) return { ok: false, error: "Not enough gems" };
      updates.gems = (c.gems||0) - amount;
    } else if (costType === "coins") {
      if ((c.coins||0) < amount) return { ok: false, error: "Not enough coins" };
      updates.coins = (c.coins||0) - amount;
    }
    await this.updateChildFields(cid, updates);
    return { ok: true };
  },

  async setPremium(cid) {
    await this.updateChildFields(cid, { is_premium: true });
    return { error:null };
  },

  async submitFeedback(payload) {
    // Always route through /api/db (service key) — works for all user types incl. school students with no JWT
    try {
      const res = await fetch("/api/db", {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${this._token||""}`},
        body: JSON.stringify({
          action:      "submit_feedback",
          child_id:    payload.child_id    || "guest",
          child_name:  payload.child_name  || "Unknown",
          category:    payload.category,
          description: payload.description,
          screen:      payload.screen      || "unknown",
          app_version: payload.app_version || "1.0.0",
        })
      });
      const j = await res.json();
      if (j.ok) { dbLog("ok","feedback saved ✓"); return { ok:true }; }
      dbLog("error","feedback failed", j.error);
      return { ok:false, error:j.error };
    } catch(e) {
      dbLog("error","feedback network error", e.message);
      return { ok:false, error:e.message };
    }
  },
};
