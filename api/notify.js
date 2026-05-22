// api/notify.js — Telegram owner notifications
// Setup: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in Vercel env vars

export async function notifyNewUser({ name, classNum, avatar, email }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat  = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;

  const CLASS_LABELS = {
    10:"Nursery", 11:"Jr KG", 12:"Sr KG",
    1:"Class 1", 2:"Class 2", 3:"Class 3", 4:"Class 4", 5:"Class 5"
  };
  const CLASS_EMOJI = {
    10:"🌱", 11:"🌙", 12:"☀️",
    1:"🌍", 2:"🪐", 3:"⭐", 4:"🔴", 5:"🌌"
  };
  const cn    = parseInt(classNum) || 1;
  const label = CLASS_LABELS[cn] || `Class ${cn}`;
  const emoji = CLASS_EMOJI[cn] || "🎓";
  const safeStr = (s) => String(s || "").replace(/[*_`[\]]/g, ""); // escape Markdown
  const text = `🎉 *New MathMagic User!*\n${safeStr(avatar || "🧒")} *${safeStr(name)}* | ${emoji} ${label}\n📧 ${safeStr(email || "—")}\n🕐 ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: "Markdown" }),
    });
  } catch { /* Never block registration */ }
}