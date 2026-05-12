// api/auth.js — Vercel Serverless Function
// All Supabase auth server-side only. Keys never sent to client.

const SB_URL     = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY;

const ALLOWED_ORIGINS = [
  "https://mathmagic-virid.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

// ── RATE LIMITER ───────────────────────────────────────────────────
const rateLimitMap = new Map();
function rateLimit(ip, action, maxRequests, windowMs) {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + windowMs; }
  entry.count++;
  rateLimitMap.set(key, entry);
  if (entry.count > maxRequests)
    return { limited: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  return { limited: false };
}

const LIMITS = {
  signup:         { max: 3,  windowMs: 60 * 60 * 1000 },
  signin:         { max: 10, windowMs: 15 * 60 * 1000 },
  signout:        { max: 20, windowMs: 60 * 60 * 1000 },
  default:        { max: 30, windowMs: 60 * 1000 },
};

// ── INPUT VALIDATION ───────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

function validateEmail(email) {
  return typeof email === "string" && EMAIL_RE.test(email.trim());
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 6 && password.length <= 128;
}

// ── SUPABASE AUTH HELPER ───────────────────────────────────────────
async function supabaseAuth(endpoint, body) {
  const res = await fetch(`${SB_URL}/auth/v1/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SB_SERVICE,
      Authorization: `Bearer ${SB_SERVICE}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

// ── SECURITY HEADERS ───────────────────────────────────────────────
function setHeaders(res, origin) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Cache-Control", "no-store");
}

// ── MAIN HANDLER ──────────────────────────────────────────────────
export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  setHeaders(res, origin);

  // CORS preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Block unknown origins in production
  if (origin && !ALLOWED_ORIGINS.includes(origin) && !origin.includes("localhost")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
          || req.headers["x-real-ip"]
          || "unknown";

  const { action } = req.body || {};
  if (!action) return res.status(400).json({ error: "Missing action" });

  const limit = LIMITS[action] || LIMITS.default;
  const { limited, retryAfter } = rateLimit(ip, action, limit.max, limit.windowMs);
  if (limited) return res.status(429).json({
    error: `Too many attempts. Wait ${retryAfter}s.`, retryAfter,
  });

  try {
    // ── SIGN UP ────────────────────────────────────────────────
    if (action === "signup") {
      const { email, password } = req.body;
      if (!validateEmail(email))    return res.status(400).json({ error: "Invalid email format" });
      if (!validatePassword(password)) return res.status(400).json({ error: "Password must be 6–128 characters" });

      const { status, data } = await supabaseAuth("signup", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (status >= 400) return res.status(status).json({ error: data.msg || data.message || "Signup failed" });

      return res.status(200).json({
        user: { id: data.user?.id, email: data.user?.email },
        access_token: data.access_token || data.session?.access_token || null,
        has_session: !!(data.access_token || data.session?.access_token),
      });
    }

    // ── SIGN IN ────────────────────────────────────────────────
    if (action === "signin") {
      const { email, password } = req.body;
      if (!validateEmail(email) || !validatePassword(password))
        return res.status(400).json({ error: "Invalid credentials" });

      const { status, data } = await supabaseAuth("token?grant_type=password", {
        email: email.trim().toLowerCase(),
        password,
      });

      // Always return same error to prevent email enumeration
      if (status >= 400) return res.status(401).json({ error: "Invalid email or password" });

      return res.status(200).json({
        user: { id: data.user?.id, email: data.user?.email },
        access_token: data.access_token,
      });
    }

    // ── SIGN OUT ───────────────────────────────────────────────
    if (action === "signout") {
      const token = req.headers.authorization?.replace("Bearer ", "").trim();
      if (token) {
        await fetch(`${SB_URL}/auth/v1/logout`, {
          method: "POST",
          headers: { apikey: SB_SERVICE, Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (err) {
    console.error("[auth API error]", err.message);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
