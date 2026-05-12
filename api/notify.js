// api/notify.js — Telegram owner notifications
// Setup: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in Vercel env vars

export async function notifyNewUser({ name, classNum, avatar, email }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat  = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;

  const emoji  = ["","🌍","🌙","☄️","⭐","🚀"][classNum] || "🎓";
  const safeStr = (s) => String(s || "").replace(/[*_`[\]]/g, ""); // escape Markdown
  const text = `🎉 *New MathMagic User!*\n${safeStr(avatar || "🧒")} *${safeStr(name)}* | ${emoji} Class ${classNum}\n📧 ${safeStr(email || "—")}\n🕐 ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: "Markdown" }),
    });
  } catch { /* Never block registration */ }
}
