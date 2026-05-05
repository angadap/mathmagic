// api/payment.js — Vercel Serverless Payment Handler
// Handles: Razorpay order creation + verification, UPI/PhonePe UTR verification
//
// ── ENV VARS REQUIRED (set in Vercel Dashboard) ────────────────────────────
//   RAZORPAY_KEY_ID          — Razorpay API Key ID (from razorpay.com dashboard)
//   RAZORPAY_KEY_SECRET      — Razorpay API Key Secret
//   SUPABASE_URL             — Your Supabase project URL
//   SUPABASE_SERVICE_KEY     — Supabase service role key (server-side only)
//   MERCHANT_UPI_ID          — Your UPI ID (e.g. yourname@upi or yourname@okaxis)
// ─────────────────────────────────────────────────────────────────────────────

import crypto from "crypto";

const SB_URL     = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY;
const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RZP_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Rate limiter
const rateLimitMap = new Map();
function rateLimit(ip, action, maxReq=10, windowMs=60*60*1000) {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const e = rateLimitMap.get(key) || { count:0, resetAt: now+windowMs };
  if (now > e.resetAt) { e.count=0; e.resetAt=now+windowMs; }
  e.count++;
  rateLimitMap.set(key, e);
  if (e.count > maxReq) return { limited:true, retryAfter: Math.ceil((e.resetAt-now)/1000) };
  return { limited:false };
}

// Verify Supabase JWT
async function verifyToken(token) {
  if (!token) return null;
  try {
    const res = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { "apikey": SB_SERVICE, "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch(e) { return null; }
}

// Supabase REST helper
async function sbQuery(table, method, body, params="") {
  const res = await fetch(`${SB_URL}/rest/v1/${table}${params}`, {
    method,
    headers: {
      "apikey": SB_SERVICE,
      "Authorization": `Bearer ${SB_SERVICE}`,
      "Content-Type": "application/json",
      "Prefer": method==="POST" ? "return=representation" : "return=minimal",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await res.text();
  try { return { ok:res.ok, status:res.status, data:JSON.parse(txt) }; }
  catch(e) { return { ok:res.ok, status:res.status, data:txt }; }
}

// Mark child as premium in Supabase
async function setPremium(childId, plan, txnId, gateway) {
  const expiresAt = plan === "monthly"
    ? new Date(Date.now() + 30*24*60*60*1000).toISOString()
    : new Date(Date.now() + 365*24*60*60*1000).toISOString();

  await sbQuery("children", "PATCH", {
    is_premium: true,
    premium_plan: plan,
    premium_expires_at: expiresAt,
    premium_txn_id: txnId,
    premium_gateway: gateway,
    premium_activated_at: new Date().toISOString(),
  }, `?id=eq.${encodeURIComponent(childId)}`);

  // Log payment in analytics
  await sbQuery("analytics", "POST", {
    event_type: "payment_success",
    event_data: { child_id: childId, plan, gateway, txn_id: txnId },
    created_at: new Date().toISOString(),
  }).catch(() => {});
}

// ── RAZORPAY HELPERS ──────────────────────────────────────────────────

// Create Razorpay order via their REST API
async function createRazorpayOrder(amount, receipt) {
  if (!RZP_KEY_ID || !RZP_SECRET) throw new Error("Razorpay keys not configured");
  const auth = Buffer.from(`${RZP_KEY_ID}:${RZP_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: amount * 100, // paise
      currency: "INR",
      receipt,
      notes: { source: "mathmagic_app" },
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.description || "Razorpay order creation failed");
  }
  return res.json();
}

// Verify Razorpay payment signature (HMAC SHA256)
function verifyRazorpaySignature(orderId, paymentId, signature) {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", RZP_SECRET)
    .update(body)
    .digest("hex");
  return expected === signature;
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    return res.status(200).end();
  }
  if (req.method !== "POST") return res.status(405).json({ error:"Method not allowed" });

  const origin = req.headers.origin || "";
  const allowed = ["https://mathmagic-virid.vercel.app","http://localhost:5173","http://localhost:3000"];
  if (allowed.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const { action } = req.body || {};
  if (!action) return res.status(400).json({ error:"Missing action" });

  // All payment endpoints require auth
  const token = req.headers.authorization?.replace("Bearer ","");
  const user  = await verifyToken(token);
  if (!user?.id) return res.status(401).json({ error:"Unauthorized" });

  // Rate limit payments strictly
  const { limited, retryAfter } = rateLimit(ip, action, 5, 60*60*1000);
  if (limited) return res.status(429).json({ error:`Too many requests. Wait ${retryAfter}s.`, retryAfter });

  try {

    // ── CREATE RAZORPAY ORDER ──────────────────────────────────────────
    if (action === "create_razorpay_order") {
      const { plan, amount, child_id } = req.body;

      // Validate amount matches plan
      const validAmounts = { monthly:199, yearly:999 };
      if (!validAmounts[plan] || validAmounts[plan] !== amount) {
        return res.status(400).json({ error:"Invalid plan or amount" });
      }

      // Verify child belongs to this user
      const chk = await sbQuery("children","GET",null,`?id=eq.${encodeURIComponent(child_id)}&parent_id=eq.${encodeURIComponent(user.id)}`);
      if (!Array.isArray(chk.data) || !chk.data[0]) {
        return res.status(403).json({ error:"Forbidden" });
      }

      const receipt = `mm_${child_id.slice(0,8)}_${Date.now()}`;
      const order = await createRazorpayOrder(amount, receipt);

      return res.status(200).json({ order_id: order.id });
    }

    // ── VERIFY RAZORPAY PAYMENT ────────────────────────────────────────
    if (action === "verify_razorpay") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, child_id, plan } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error:"Missing payment details" });
      }

      // Verify child belongs to user
      const chk = await sbQuery("children","GET",null,`?id=eq.${encodeURIComponent(child_id)}&parent_id=eq.${encodeURIComponent(user.id)}`);
      if (!Array.isArray(chk.data) || !chk.data[0]) {
        return res.status(403).json({ error:"Forbidden" });
      }

      // Verify signature
      const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!valid) {
        console.error("[Payment] Invalid Razorpay signature for order:", razorpay_order_id);
        return res.status(400).json({ error:"Payment signature verification failed. Please contact support." });
      }

      // Activate premium
      await setPremium(child_id, plan, razorpay_payment_id, "razorpay");

      console.log("[Payment] Razorpay success:", razorpay_payment_id, "child:", child_id);
      return res.status(200).json({ ok:true });
    }

    // ── VERIFY UPI PAYMENT (UTR-based) ─────────────────────────────────
    // NOTE: For production, you need a payment provider that gives you webhook
    // notifications (Razorpay UPI, PhonePe PG, or Cashfree).
    // This implementation uses manual UTR entry + logs for admin review.
    // For automated verification, integrate PhonePe PG or use Razorpay's
    // UPI payment link feature which has webhooks built-in.
    if (action === "verify_upi") {
      const { utr, txn_ref, child_id, plan, amount } = req.body;

      if (!utr || utr.length < 10) {
        return res.status(400).json({ error:"Please enter a valid UTR / Transaction ID (10+ digits)" });
      }

      // Validate amount
      const validAmounts = { monthly:199, yearly:999 };
      if (!validAmounts[plan] || validAmounts[plan] !== amount) {
        return res.status(400).json({ error:"Invalid plan or amount" });
      }

      // Verify child belongs to user
      const chk = await sbQuery("children","GET",null,`?id=eq.${encodeURIComponent(child_id)}&parent_id=eq.${encodeURIComponent(user.id)}`);
      if (!Array.isArray(chk.data) || !chk.data[0]) {
        return res.status(403).json({ error:"Forbidden" });
      }

      // Check for duplicate UTR (prevent double activation)
      const dupCheck = await sbQuery("children","GET",null,`?premium_txn_id=eq.${encodeURIComponent(utr)}`);
      if (Array.isArray(dupCheck.data) && dupCheck.data.length > 0) {
        return res.status(400).json({ error:"This UTR has already been used." });
      }

      // Log payment for admin review
      await sbQuery("analytics","POST",{
        event_type: "upi_payment_submitted",
        parent_id: user.id,
        event_data: { child_id, plan, amount, utr, txn_ref, status:"pending_review" },
        created_at: new Date().toISOString(),
      }).catch(()=>{});

      // ── AUTO-APPROVE (for MVP/testing) ─────────────────────────────
      // In production, replace this with actual UPI verification via:
      // Option A: Razorpay Payment Links + webhook (recommended)
      // Option B: PhonePe PG API (requires business account)
      // Option C: Admin panel to manually approve
      //
      // For now: auto-approve if UTR looks valid (12+ digits, numeric/alphanumeric)
      const utrPattern = /^[A-Z0-9]{10,22}$/i;
      if (!utrPattern.test(utr)) {
        return res.status(400).json({ error:"UTR format invalid. Should be 10-22 alphanumeric characters." });
      }

      // Activate premium
      await setPremium(child_id, plan, utr, "upi");

      console.log("[Payment] UPI submitted:", utr, "child:", child_id, "plan:", plan);
      return res.status(200).json({ ok:true });
    }

    return res.status(400).json({ error:"Unknown action" });

  } catch(err) {
    console.error("[payment API error]", err);
    return res.status(500).json({ error: err.message || "Server error. Please try again." });
  }
}
