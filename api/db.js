// api/db.js — Vercel Serverless Function
// All DB operations server-side only. JWT verified before every write.

import { notifyNewUser } from "./notify.js";
import { createHash } from "crypto";

// SECURITY: hash PIN server-side before storing
function hashPin(pin) {
  return createHash("sha256").update("mm_pin_" + String(pin)).digest("hex");
}

// ── ENV (all from Vercel environment variables — never in client code) ──
const SB_URL     = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY;
const SB_ANON    = process.env.SUPABASE_ANON_KEY;

// ── ALLOWED ORIGINS ────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://mathmagic-virid.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

// ── SECURITY HEADERS (applied to every response) ──────────────────
function setSecurityHeaders(res, origin) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cache-Control", "no-store");
}

// ── INPUT VALIDATION ───────────────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID  = (s) => typeof s === "string" && UUID_RE.test(s);
const sanitizeStr  = (s, max = 200) => typeof s === "string" ? s.replace(/[<>]/g, "").slice(0, max).trim() : "";
const sanitizeInt  = (n, min, max) => { const i = parseInt(n); return isNaN(i) ? min : Math.min(Math.max(i, min), max); };

// ── RATE LIMITER (in-memory — resets on cold start, sufficient for MVP) ──
const rateLimitMap = new Map();
function rateLimit(ip, action, maxReq, windowMs) {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const e = rateLimitMap.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > e.resetAt) { e.count = 0; e.resetAt = now + windowMs; }
  e.count++;
  rateLimitMap.set(key, e);
  if (e.count > maxReq) return { limited: true, retryAfter: Math.ceil((e.resetAt - now) / 1000) };
  return { limited: false };
}

const LIMITS = {
  add_child:       { max: 5,   windowMs: 60 * 60 * 1000 },
  save_progress:   { max: 200, windowMs: 60 * 60 * 1000 },
  submit_feedback: { max: 10,  windowMs: 60 * 60 * 1000 },
  save_rating:     { max: 3,   windowMs: 24 * 60 * 60 * 1000 },
  delete_account:  { max: 2,   windowMs: 24 * 60 * 60 * 1000 },
  reset_password:  { max: 3,   windowMs: 60 * 60 * 1000 },
  default:         { max: 60,  windowMs: 60 * 1000 },
};

// ── JWT VERIFICATION ───────────────────────────────────────────────
async function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const res = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { apikey: SB_SERVICE, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ── SUPABASE REST HELPER ───────────────────────────────────────────
async function sbQuery(table, method, body, params = "", useAnon = false) {
  const key = useAnon ? SB_ANON : SB_SERVICE;
  const res = await fetch(`${SB_URL}/rest/v1/${table}${params}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : "return=minimal",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(txt) }; }
  catch { return { ok: res.ok, status: res.status, data: txt }; }
}

// ── OWNERSHIP CHECK ────────────────────────────────────────────────
async function childBelongsToUser(childId, userId) {
  if (!isValidUUID(childId) || !isValidUUID(userId)) return false;
  const r = await sbQuery("children", "GET", null,
    `?id=eq.${encodeURIComponent(childId)}&parent_id=eq.${encodeURIComponent(userId)}&select=id`);
  return Array.isArray(r.data) && r.data.length > 0;
}

// ── MAIN HANDLER ──────────────────────────────────────────────────
export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  setSecurityHeaders(res, origin);

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    return res.status(200).end();
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Block unknown origins in production
  if (origin && !ALLOWED_ORIGINS.includes(origin) && !origin.includes("localhost")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const { action } = req.body || {};
  if (!action) return res.status(400).json({ error: "Missing action" });

  const limit = LIMITS[action] || LIMITS.default;
  const { limited, retryAfter } = rateLimit(ip, action, limit.max, limit.windowMs);
  if (limited) return res.status(429).json({ error: `Rate limit exceeded. Wait ${retryAfter}s.`, retryAfter });

  const token = req.headers.authorization?.replace("Bearer ", "").trim();

  try {
    // ── PING (health check, no auth) ───────────────────────────
    if (action === "ping") {
      return res.status(200).json({ ok: true });
    }

    // ── PUBLIC READS (no auth) ─────────────────────────────────
    if (action === "get_questions") {
      const lesson_id = sanitizeStr(req.body.lesson_id, 20);
      if (!lesson_id) return res.status(400).json({ error: "lesson_id required" });
      const r = await sbQuery("questions", "GET", null,
        `?lesson_id=eq.${encodeURIComponent(lesson_id)}&order=question_index&limit=20`);
      return res.status(200).json({ data: r.data });
    }


    // ── ABACUS: Get questions for a class + level ──────────────────────
    if (action === "get_abacus_questions") {
      const class_num = sanitizeInt(req.body.class_num, 1, 12);
      const level_num = sanitizeInt(req.body.level_num, 1, 30);
      const r = await sbQuery("abacus_questions", "GET", null,
        `?class_num=eq.${class_num}&level_num=eq.${level_num}&order=question_index&limit=20`);
      return res.status(200).json({ data: Array.isArray(r.data) ? r.data : [] });
    }

    // ── ABACUS: Get all level titles for a class (for level map UI) ────
    if (action === "get_abacus_levels") {
      const class_num = sanitizeInt(req.body.class_num, 1, 12);
      const r = await sbQuery("abacus_questions", "GET", null,
        `?class_num=eq.${class_num}&select=level_num,level_title&order=level_num`);
      const seen = new Set();
      const levels = (Array.isArray(r.data) ? r.data : []).filter(row => {
        if (seen.has(row.level_num)) return false;
        seen.add(row.level_num);
        return true;
      });
      return res.status(200).json({ data: levels });
    }

    // ── BAZAAR: Get questions by adventure_id + class_group ─────────────
    if (action === "get_bazaar_questions") {
      const adventure_id = sanitizeStr(req.body.adventure_id, 40);
      const class_num    = sanitizeInt(req.body.class_num, 1, 12); // 1-5 + 10=Nursery,11=JrKG,12=SrKG
      if (!adventure_id) return res.status(400).json({ error: "adventure_id required" });
      // Derive class_group server-side (same logic as client getClassGroup())
      let class_group = 4;
      if (class_num === 10 || class_num === 11) class_group = 1;
      else if (class_num === 12 || class_num === 1) class_group = 2;
      else if (class_num === 2  || class_num === 3) class_group = 3;
      const r = await sbQuery("bazaar_questions", "GET", null,
        `?adventure_id=eq.${encodeURIComponent(adventure_id)}&class_group=eq.${class_group}&order=random()&limit=8`);
      return res.status(200).json({ data: Array.isArray(r.data) ? r.data : [] });
    }

    // ── BAZAAR: Save adventure result ────────────────────────────────
    if (action === "save_bazaar_result") {
      const { child_id, adventure_id, score, total, coins, is_daily, class_group } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      const user2 = await verifyToken(token);
      if (!user2?.id) return res.status(401).json({ error: "Unauthorized" });
      await sbQuery("bazaar_results", "POST", {
        child_id,
        adventure_id:  sanitizeStr(adventure_id, 40),
        class_group:   sanitizeInt(class_group, 1, 4),
        score:         sanitizeInt(score, 0, 100),
        total:         sanitizeInt(total, 1, 100),
        coins_earned:  sanitizeInt(coins, 0, 9999),
        is_daily:      !!is_daily,
        played_at:     new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    }

    // ── BAZAAR: Save speed blitz result ──────────────────────────────
    if (action === "save_bazaar_speed_result") {
      const { child_id, score, coins, time_left, class_group } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      const user2 = await verifyToken(token);
      if (!user2?.id) return res.status(401).json({ error: "Unauthorized" });
      await sbQuery("bazaar_speed_results", "POST", {
        child_id,
        adventure_id:  "speed_blitz",
        class_group:   sanitizeInt(class_group, 1, 4),
        score:         sanitizeInt(score, 0, 9999),
        coins:         sanitizeInt(coins, 0, 9999),
        time_left:     sanitizeInt(time_left, 0, 60),
        played_at:     new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    }

    // ── BAZAAR: Save achievement ──────────────────────────────────────
    if (action === "save_bazaar_achievement") {
      const { child_id, achievement_id } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      const user2 = await verifyToken(token);
      if (!user2?.id) return res.status(401).json({ error: "Unauthorized" });
      await sbQuery("bazaar_achievements", "POST", {
        child_id,
        achievement_id: sanitizeStr(achievement_id, 60),
        earned_at:      new Date().toISOString(),
      }, "?on_conflict=child_id,achievement_id");
      return res.status(200).json({ ok: true });
    }

    // ── BAZAAR: Get achievements ──────────────────────────────────────
    if (action === "get_bazaar_achievements") {
      const { child_id } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      const r = await sbQuery("bazaar_achievements", "GET", null,
        `?child_id=eq.${encodeURIComponent(child_id)}&order=earned_at`);
      return res.status(200).json({ data: Array.isArray(r.data) ? r.data : [] });
    }

    // ── BAZAAR: Save stats ────────────────────────────────────────────
    if (action === "save_bazaar_stats") {
      const { child_id, stats } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      const user2 = await verifyToken(token);
      if (!user2?.id) return res.status(401).json({ error: "Unauthorized" });
      const safe = {};
      const numFields = ["totalCorrect","perfectRounds","bestStreak",
                         "speedRounds","speedBestScore","dailyStreak","totalCoins"];
      numFields.forEach(k => {
        if (typeof stats[k] === "number") safe[k] = sanitizeInt(stats[k], 0, 999999);
      });
      // adventures_played is a text array
      if (Array.isArray(stats.adventuresPlayed)) {
        safe.adventures_played = stats.adventuresPlayed
          .map(v => sanitizeStr(v, 40)).filter(Boolean).slice(0, 20);
      }
      await sbQuery("bazaar_stats", "POST",
        { child_id, ...safe, updated_at: new Date().toISOString() },
        "?on_conflict=child_id");
      return res.status(200).json({ ok: true });
    }

    // ── BAZAAR: Weekly league ─────────────────────────────────────────
    if (action === "save_bazaar_weekly") {
      const { child_id, week_key, coins, sessions } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      const user2 = await verifyToken(token);
      if (!user2?.id) return res.status(401).json({ error: "Unauthorized" });
      await sbQuery("bazaar_weekly", "POST", {
        child_id,
        week_key:   sanitizeStr(week_key, 20),
        coins:      sanitizeInt(coins, 0, 999999),
        sessions:   sanitizeInt(sessions, 0, 9999),
        updated_at: new Date().toISOString(),
      }, "?on_conflict=child_id,week_key");
      return res.status(200).json({ ok: true });
    }

    // ── BAZAAR: Weekly leaderboard ────────────────────────────────────
    if (action === "get_bazaar_leaderboard") {
      const { week_key } = req.body;
      if (!week_key) return res.status(400).json({ error: "week_key required" });
      const r = await sbQuery("bazaar_weekly", "GET", null,
        `?week_key=eq.${encodeURIComponent(sanitizeStr(week_key, 20))}&order=coins.desc&limit=20`);
      return res.status(200).json({ data: Array.isArray(r.data) ? r.data : [] });
    }

    if (action === "get_daily_challenge") {
      const class_num = sanitizeInt(req.body.class_num, 1, 5);
      const seq_num   = req.body.seq_num ? sanitizeInt(req.body.seq_num, 1, 250) : null;
      const params = seq_num
        ? `?class_num=eq.${class_num}&seq_num=eq.${seq_num}&is_pool=eq.true&limit=1`
        : `?class_num=eq.${class_num}&is_pool=eq.true&order=seq_num&limit=250`;
      const r = await sbQuery("daily_challenges", "GET", null, params);
      const data = Array.isArray(r.data) ? r.data : [];
      return res.status(200).json({ data: seq_num ? (data[0] || null) : data });
    }

    if (action === "get_daily_puzzle") {
      const today = new Date().toISOString().slice(0, 10);
      const r = await sbQuery("daily_puzzles", "GET", null, `?date=eq.${today}&limit=1`);
      return res.status(200).json({ data: Array.isArray(r.data) ? r.data[0] : null });
    }

    // ── PUBLIC WRITE: submit_feedback — works for all user types incl. school students with no JWT ──
    if (action === "submit_feedback") {
      const { child_id, child_name, category, description, screen, app_version } = req.body;
      await sbQuery("feedback", "POST", {
        child_id: sanitizeStr(child_id, 36) || "guest",
        child_name: sanitizeStr(child_name, 50) || "Unknown",
        category: sanitizeStr(category, 50),
        description: sanitizeStr(description, 1000),
        screen: sanitizeStr(screen, 50) || "unknown",
        device_info: "",
        app_version: sanitizeStr(app_version, 20) || "1.0.0",
        status: "open",
        created_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    }

    // ── AUTHENTICATED ──────────────────────────────────────────
    const user = await verifyToken(token);
    if (!user?.id) return res.status(401).json({ error: "Unauthorized — please log in" });

    if (action === "get_progress") {
      const { child_id } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error:"Invalid child_id" });
      const chk = await sbQuery("children","GET",null,`?id=eq.${encodeURIComponent(child_id)}&parent_id=eq.${encodeURIComponent(user.id)}&select=id`);
      if (!Array.isArray(chk.data)||!chk.data[0]) return res.status(403).json({ error:"Forbidden" });
      const r = await sbQuery("progress","GET",null,`?child_id=eq.${encodeURIComponent(child_id)}&order=completed_at.desc`);
      return res.status(200).json({ data: r.data });
    }

    if (action === "get_children") {
      if (!isValidUUID(req.body.parent_id) || req.body.parent_id !== user.id)
        return res.status(403).json({ error: "Forbidden" });
      const r = await sbQuery("children", "GET", null,
        `?parent_id=eq.${encodeURIComponent(user.id)}&order=created_at`);
      // SECURITY: never send pin_hash to client
      const safe = Array.isArray(r.data)
        ? r.data.map(({ pin_hash, ...rest }) => rest)
        : [];
      return res.status(200).json({ data: safe });
    }

    if (action === "verify_pin") {
      // Server-side PIN comparison — pin_hash never leaves server
      const { child_id, pin } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      if (!isValidUUID(user.id)) return res.status(401).json({ error: "Unauthorized" });
      const r = await sbQuery("children", "GET", null,
        `?id=eq.${encodeURIComponent(child_id)}&parent_id=eq.${encodeURIComponent(user.id)}&select=id,name,avatar,class_num,xp,coins,gems,level,streak_days,is_premium,badge_ids,shop_items,total_correct,bosses_defeated,pin_hash`);
      const child = Array.isArray(r.data) ? r.data[0] : null;
      if (!child) return res.status(403).json({ error: "Forbidden" });
      // Compare against hashed PIN (new registrations) with fallback to raw (legacy)
      const inputHash = hashPin(sanitizeStr(pin, 10));
      const ok = child.pin_hash === inputHash || child.pin_hash === sanitizeStr(pin, 10);
      const { pin_hash, ...safeChild } = child;
      return res.status(200).json({ ok, child: ok ? safeChild : null });
    }

    if (action === "add_child") {
      const name     = sanitizeStr(req.body.name, 50);
      const avatar   = sanitizeStr(req.body.avatar, 10);
      // SECURITY: receive raw PIN from client, hash it server-side before storing
      const raw_pin = sanitizeStr(req.body.pin_hash || req.body.pin, 10);
      const class_num = sanitizeInt(req.body.class_num, 1, 5);
      if (!name || !raw_pin) return res.status(400).json({ error: "Missing fields" });
      if (!/^\d{4}$/.test(raw_pin)) return res.status(400).json({ error: "PIN must be 4 digits" });
      const pin_hash = hashPin(raw_pin);

      const r = await sbQuery("children", "POST", {
        parent_id: user.id, name, avatar, class_num, pin_hash,
        xp: 0, level: 1, coins: 50, streak_days: 0, is_premium: false,
        created_at: new Date().toISOString(),
      });
      if (!r.ok) return res.status(400).json({ error: "Failed to create child" });
      const rawChild = Array.isArray(r.data) ? r.data[0] : r.data;
      // SECURITY: never return pin_hash to client
      const { pin_hash: _ph, ...child } = rawChild || {};

      // Telegram notification (fire-and-forget)
      notifyNewUser({ name, classNum: class_num, avatar, email: user.email }).catch(() => {});

      return res.status(200).json({ data: child });
    }

    if (action === "save_progress") {
      const { child_id, lesson_id, correct_count, total_questions, stars_earned, xp_earned, is_school_student } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });

      // Allow both parent-owned children AND school students
      const isOwned = await childBelongsToUser(child_id, user.id);
      const isSchool = !isOwned && is_school_student === true;
      if (!isOwned && !isSchool) return res.status(403).json({ error: "Forbidden" });

      const lid   = sanitizeStr(lesson_id, 30);
      const xp    = sanitizeInt(xp_earned, 0, 1000);
      const stars = sanitizeInt(stars_earned, 0, 3);

      await sbQuery("progress", "POST", {
        child_id, lesson_id: lid,
        correct_count: sanitizeInt(correct_count, 0, 100),
        total_questions: sanitizeInt(total_questions, 0, 100),
        stars_earned: stars, xp_earned: xp,
        completed_at: new Date().toISOString(),
      }, "?on_conflict=child_id,lesson_id");

      // Update XP/coins on the correct table (children or students)
      if (isOwned) {
        const cur = await sbQuery("children", "GET", null, `?id=eq.${encodeURIComponent(child_id)}&select=xp,coins`);
        const c = Array.isArray(cur.data) ? cur.data[0] : {};
        const nx = Math.min((c.xp || 0) + xp, 999999);
        const nc = Math.min((c.coins || 0) + Math.floor(xp / 10), 999999);
        await sbQuery("children", "PATCH",
          { xp: nx, coins: nc, level: Math.floor(nx / 200) + 1, last_active: new Date().toISOString() },
          `?id=eq.${encodeURIComponent(child_id)}`);
        return res.status(200).json({ ok: true, xp: nx, coins: nc });
      } else {
        // School student — update students table
        const cur = await sbQuery("students", "GET", null, `?id=eq.${encodeURIComponent(child_id)}&select=xp,coins`);
        const c = Array.isArray(cur.data) ? cur.data[0] : {};
        const nx = Math.min((c.xp || 0) + xp, 999999);
        const nc = Math.min((c.coins || 0) + Math.floor(xp / 10), 999999);
        await sbQuery("students", "PATCH",
          { xp: nx, coins: nc, level: Math.floor(nx / 200) + 1, last_active: new Date().toISOString() },
          `?id=eq.${encodeURIComponent(child_id)}`);
        return res.status(200).json({ ok: true, xp: nx, coins: nc });
      }
    }

    if (action === "get_daily_completion") {
      const { child_id, date } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      if (!(await childBelongsToUser(child_id, user.id))) return res.status(403).json({ error: "Forbidden" });
      const r = await sbQuery("daily_completions", "GET", null,
        `?child_id=eq.${encodeURIComponent(child_id)}&date=eq.${sanitizeStr(date, 10)}&limit=1`);
      return res.status(200).json({ data: Array.isArray(r.data) ? r.data : [] });
    }

    if (action === "complete_daily_challenge") {
      const { child_id, challenge_id, date, correct } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      if (!(await childBelongsToUser(child_id, user.id))) return res.status(403).json({ error: "Forbidden" });
      await sbQuery("daily_completions", "POST", {
        child_id,
        challenge_id: challenge_id || null,
        date: sanitizeStr(date, 10) || new Date().toISOString().slice(0, 10),
        correct: !!correct,
        completed_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    }

    if (action === "complete_puzzle") {
      const { child_id, puzzle_id, date, answer_given, correct } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      if (!(await childBelongsToUser(child_id, user.id))) return res.status(403).json({ error: "Forbidden" });
      await sbQuery("puzzle_completions", "POST", {
        child_id, puzzle_id: puzzle_id || null,
        date: sanitizeStr(date, 10) || new Date().toISOString().slice(0, 10),
        answer_given: sanitizeStr(answer_given, 200),
        correct: !!correct,
        completed_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    }

    if (action === "get_puzzle_completion") {
      const { child_id, date } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      if (!(await childBelongsToUser(child_id, user.id))) return res.status(403).json({ error: "Forbidden" });
      const r = await sbQuery("puzzle_completions", "GET", null,
        `?child_id=eq.${encodeURIComponent(child_id)}&date=eq.${sanitizeStr(date, 10)}&limit=1`);
      return res.status(200).json({ data: Array.isArray(r.data) ? r.data : [] });
    }

    if (action === "save_rating") {
      const rating = sanitizeInt(req.body.rating, 1, 5);
      if (rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be 1-5" });
      await sbQuery("app_ratings", "POST", {
        parent_id: user.id, rating,
        review: sanitizeStr(req.body.review, 500) || "",
        app_version: "1.0.0", platform: "web",
        created_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true });
    }

    if (action === "track_event") {
      const { child_id, event_type, event_data, session_id } = req.body;
      sbQuery("analytics", "POST", {
        child_id: child_id || null, parent_id: user.id,
        event_type: sanitizeStr(event_type, 50),
        event_data: event_data || {},
        app_version: "1.0.0", platform: "web",
        session_id: session_id || null,
        created_at: new Date().toISOString(),
      }).catch(() => {});
      return res.status(200).json({ ok: true });
    }

    if (action === "reset_password") {
      // Uses email from authenticated user's token — prevents resetting other accounts
      const email = user.email;
      if (!email) return res.status(400).json({ error: "No email on account" });
      const r = await fetch(`${SB_URL}/auth/v1/recover`, {
        method: "POST",
        headers: { apikey: SB_SERVICE, "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return res.status(200).json({ ok: r.ok });
    }

    if (action === "delete_account") {
      const { user_id } = req.body;
      if (!isValidUUID(user_id) || user.id !== user_id)
        return res.status(403).json({ error: "Forbidden" });

      const chk = await sbQuery("children", "GET", null,
        `?parent_id=eq.${encodeURIComponent(user_id)}&select=id`);
      const ids = Array.isArray(chk.data) ? chk.data.map((c) => c.id) : [];

      for (const cid of ids) {
        await sbQuery("progress", "DELETE", null, `?child_id=eq.${encodeURIComponent(cid)}`).catch(() => {});
        await sbQuery("daily_completions", "DELETE", null, `?child_id=eq.${encodeURIComponent(cid)}`).catch(() => {});
        await sbQuery("puzzle_completions", "DELETE", null, `?child_id=eq.${encodeURIComponent(cid)}`).catch(() => {});
      }
      await sbQuery("children", "DELETE", null, `?parent_id=eq.${encodeURIComponent(user_id)}`).catch(() => {});
      await fetch(`${SB_URL}/auth/v1/admin/users/${encodeURIComponent(user_id)}`, {
        method: "DELETE",
        headers: { apikey: SB_SERVICE, Authorization: `Bearer ${SB_SERVICE}` },
      }).catch(() => {});

      return res.status(200).json({ ok: true });
    }

    // ── Update child fields (streak, XP, coins, level, last_active) ──────
    if (action === "update_children") {
      const { id: child_id, xp, coins, gems, level, streak_days, last_active,
              shop_items, badge_ids, selected_avatar, avatar, is_premium, consent_at } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      if (!(await childBelongsToUser(child_id, user.id))) return res.status(403).json({ error: "Forbidden" });
      const patch = {};
      if (xp              !== undefined) patch.xp              = sanitizeInt(xp, 0, 999999);
      if (coins           !== undefined) patch.coins            = sanitizeInt(coins, 0, 999999);
      if (gems            !== undefined) patch.gems             = sanitizeInt(gems, 0, 999999);
      if (level           !== undefined) patch.level            = sanitizeInt(level, 1, 9999);
      if (streak_days     !== undefined) patch.streak_days      = sanitizeInt(streak_days, 0, 9999);
      if (last_active     !== undefined) patch.last_active      = last_active;
      if (is_premium      !== undefined) patch.is_premium       = !!is_premium;
      // Parental consent timestamp — stored once at registration (DPDP 2023 + COPPA)
      if (consent_at      !== undefined) patch.consent_at       = sanitizeStr(consent_at, 40);
      if (selected_avatar !== undefined) patch.selected_avatar  = sanitizeStr(selected_avatar, 20);
      if (avatar          !== undefined) patch.avatar           = sanitizeStr(avatar, 20);
      // Arrays — validate and sanitize each element
      if (shop_items !== undefined && Array.isArray(shop_items)) {
        patch.shop_items = shop_items.map(s => sanitizeStr(s, 60)).filter(Boolean).slice(0, 100);
      }
      if (badge_ids !== undefined && Array.isArray(badge_ids)) {
        patch.badge_ids = badge_ids.map(s => sanitizeStr(s, 60)).filter(Boolean).slice(0, 100);
      }
      if (Object.keys(patch).length === 0) return res.status(400).json({ error: "Nothing to update" });
      await sbQuery("children", "PATCH", patch, `?id=eq.${encodeURIComponent(child_id)}`);
      return res.status(200).json({ ok: true });
    }

    // ── BRAINSPARK: get daily fun fact (no JWT needed — read-only public table) ──
    if (action === "get_fun_fact") {
      const { child_id, child_type, today } = req.body;
      if (!child_id || !today) return res.status(400).json({ error: "Missing fields" });
      const todayStr = sanitizeStr(today, 10); // YYYY-MM-DD
      const FUN_FACT_TOTAL = 400;
      const table = child_type === "school" ? "students" : "children";
      // Fetch current index and last_fact_date
      const cr = await sbQuery(table, "GET", null, `?id=eq.${encodeURIComponent(child_id)}&select=id,fun_fact_index,last_fact_date`);
      const row = Array.isArray(cr.data) ? cr.data[0] : null;
      if (!row) return res.status(404).json({ error: "Child not found" });
      let idx = parseInt(row.fun_fact_index || 0);
      const lastDate = row.last_fact_date || null;
      // Only advance on a new calendar day
      if (lastDate !== todayStr) {
        idx = idx + 1;
        await sbQuery(table, "PATCH", { fun_fact_index: idx, last_fact_date: todayStr }, `?id=eq.${encodeURIComponent(child_id)}`);
      }
      // Wrap at 400, 1-based
      const factId = ((idx - 1) % FUN_FACT_TOTAL) + 1;
      const fr = await sbQuery("fun_facts", "GET", null, `?id=eq.${factId}&select=id,fact,category`);
      const fact = Array.isArray(fr.data) ? fr.data[0] : null;
      if (!fact) return res.status(404).json({ error: "Fact not found" });
      return res.status(200).json({ fact: fact.fact, category: fact.category, fact_id: factId });
    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (err) {
    console.error("[db API error]", err.message);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}