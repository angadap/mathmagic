// api/auth.js — Vercel Serverless Function
// All Supabase auth happens HERE (server-side), never in the browser
// Keys read from Vercel environment variables — never sent to client

const SB_URL     = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY; // service role key (never anon)

// ── In-memory rate limiter (per IP, resets on cold start) ──────────
// For production, replace with Upstash Redis for persistence across instances
const rateLimitMap = new Map();

function rateLimit(ip, action, maxRequests, windowMs) {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count++;
  rateLimitMap.set(key, entry);

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { limited: true, retryAfter };
  }
  return { limited: false };
}

// Rate limits per action
const LIMITS = {
  signup:         { max: 3,  windowMs: 60 * 60 * 1000 },  // 3 signups per hour per IP
  signin:         { max: 10, windowMs: 15 * 60 * 1000 },  // 10 logins per 15 min per IP
  reset_password: { max: 3,  windowMs: 60 * 60 * 1000 },  // 3 resets per hour
  default:        { max: 30, windowMs: 60 * 1000 },        // 30 requests per minute
};

async function supabaseAuth(endpoint, body, method = "POST") {
  const res = await fetch(`${SB_URL}/auth/v1/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": SB_SERVICE,
      "Authorization": `Bearer ${SB_SERVICE}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS — only allow from your domain
  const origin = req.headers.origin || "";
  const allowed = ["https://mathmagic-virid.vercel.app", "http://localhost:5173", "http://localhost:3000"];
  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Get client IP for rate limiting
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
          || req.headers["x-real-ip"]
          || req.socket?.remoteAddress
          || "unknown";

  const { action, email, password } = req.body || {};

  if (!action) return res.status(400).json({ error: "Missing action" });

  // Apply rate limit
  const limit = LIMITS[action] || LIMITS.default;
  const { limited, retryAfter } = rateLimit(ip, action, limit.max, limit.windowMs);
  if (limited) {
    return res.status(429).json({
      error: `Too many ${action} attempts. Please wait ${retryAfter} seconds.`,
      retryAfter,
    });
  }

  try {
    // ── SIGN UP ─────────────────────────────────────────────────
    if (action === "signup") {
      if (!email || !password) return res.status(400).json({ error: "Email and password required" });
      if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Invalid email format" });

      const { status, data } = await supabaseAuth("signup", { email, password });

      if (status >= 400) return res.status(status).json({ error: data.msg || data.message || "Signup failed" });

      // Return only what client needs — never return service key or internal data
      return res.status(200).json({
        user: { id: data.user?.id, email: data.user?.email },
        access_token: data.access_token || data.session?.access_token || null,
        has_session: !!(data.access_token || data.session?.access_token),
      });
    }

    // ── SIGN IN ─────────────────────────────────────────────────
    if (action === "signin") {
      if (!email || !password) return res.status(400).json({ error: "Email and password required" });

      const { status, data } = await supabaseAuth("token?grant_type=password", { email, password });

      if (status >= 400) return res.status(401).json({ error: "Invalid email or password" });

      return res.status(200).json({
        user: { id: data.user?.id, email: data.user?.email },
        access_token: data.access_token,
      });
    }

    // ── SIGN OUT ─────────────────────────────────────────────────
    if (action === "signout") {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (token) {
        await fetch(`${SB_URL}/auth/v1/logout`, {
          method: "POST",
          headers: { "apikey": SB_SERVICE, "Authorization": `Bearer ${token}` },
        });
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (err) {
    console.error("[auth API error]", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
