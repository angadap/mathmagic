// api/notify.js — Free owner notifications via Telegram Bot
//
// SETUP (one-time, completely free):
// 1. Open Telegram → search @BotFather → /newbot → follow prompts
// 2. Copy the bot token BotFather gives you
// 3. Message your new bot once (any message)
// 4. Open: https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
//    Copy the "chat"."id" number from the response
// 5. Add to Vercel env vars:
//      TELEGRAM_BOT_TOKEN  = 123456:ABCdef...  (from BotFather)
//      TELEGRAM_CHAT_ID    = 987654321          (your personal chat id)
//
// Called internally by api/auth.js after successful registration
// ─────────────────────────────────────────────────────────────────────

const TELEGRAM_TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function notifyNewUser({ name, classNum, avatar, email }) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return; // silently skip if not configured

  const classEmoji = ["","🌍","🌙","☄️","⭐","🚀"][classNum] || "🎓";
  const text = [
    `🎉 *New MathMagic User Registered!*`,
    ``,
    `${avatar || "🧒"} *Name:* ${name}`,
    `${classEmoji} *Class:* ${classNum}`,
    `📧 *Email:* ${email || "—"}`,
    `🕐 *Time:* ${new Date().toLocaleString("en-IN", { timeZone:"Asia/Kolkata" })} IST`,
    ``,
    `_MathMagic Space Academy_`,
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch(e) {
    // Never block registration if notification fails
    console.warn("[notify] Telegram notification failed:", e.message);
  }
}
