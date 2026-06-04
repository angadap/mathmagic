// src/constants/bazaarData.js — Bazaar: markets, passport, festivals, avatars, achievements, helpers

// ─── Market catalogue ────────────────────────────────────────────────
export const BAZAAR_MARKETS = [
  { id:"fruits",  name:"Fruit Market",  emoji:"🍎", color:"#f97316", keeper:"Ramu Kaka",   keeperEmoji:"👴", desc:"Buy & sell fresh fruits!",      mood:["😊","😐","😠"], isPaid:false, city:"Mumbai", cityEmoji:"🏙️",
    items:[{name:"Apple",emoji:"🍎",price:120,unit:"per kg"},{name:"Banana",emoji:"🍌",price:5,unit:"each"},{name:"Mango",emoji:"🥭",price:80,unit:"per kg"},{name:"Orange",emoji:"🍊",price:15,unit:"each"},{name:"Grapes",emoji:"🍇",price:90,unit:"per kg"},{name:"Watermelon",emoji:"🍉",price:30,unit:"per kg"}]},
  { id:"veggies", name:"Veggie Shop",   emoji:"🥦", color:"#22c55e", keeper:"Savitri Bai", keeperEmoji:"👩", desc:"Fresh veggies from the farm!",   mood:["😊","😐","😠"], isPaid:false, city:"Pune",   cityEmoji:"🏘️",
    items:[{name:"Potato",emoji:"🥔",price:30,unit:"per kg"},{name:"Tomato",emoji:"🍅",price:40,unit:"per kg"},{name:"Onion",emoji:"🧅",price:50,unit:"per kg"},{name:"Carrot",emoji:"🥕",price:60,unit:"per kg"},{name:"Brinjal",emoji:"🍆",price:35,unit:"per kg"},{name:"Capsicum",emoji:"🫑",price:20,unit:"each"}]},
  { id:"grocery", name:"Kirana Store",  emoji:"🛒", color:"#a855f7", keeper:"Sharma Ji",   keeperEmoji:"🧔", desc:"Daily grocery needs!",             mood:["😊","😐","😠"], isPaid:true,  city:"Delhi",  cityEmoji:"🕌",
    items:[{name:"Rice",emoji:"🍚",price:60,unit:"per kg"},{name:"Dal",emoji:"🫘",price:100,unit:"per kg"},{name:"Biscuits",emoji:"🍪",price:10,unit:"each"},{name:"Milk",emoji:"🥛",price:25,unit:"each"},{name:"Sugar",emoji:"🍬",price:45,unit:"per kg"},{name:"Oil",emoji:"🫙",price:150,unit:"each"}]},
  { id:"sweets",  name:"Mithai Shop",   emoji:"🍮", color:"#ec4899", keeper:"Halwai Ji",   keeperEmoji:"👨‍🍳",desc:"Yummy Indian sweets!",              mood:["😊","😐","😠"], isPaid:true,  city:"Jaipur", cityEmoji:"🏯",
    items:[{name:"Ladoo",emoji:"🟡",price:15,unit:"each"},{name:"Barfi",emoji:"🟩",price:400,unit:"per kg"},{name:"Gulab Jamun",emoji:"🟤",price:10,unit:"each"},{name:"Jalebi",emoji:"🟠",price:200,unit:"per kg"},{name:"Kheer",emoji:"⬜",price:120,unit:"per kg"},{name:"Halwa",emoji:"🟨",price:160,unit:"per kg"}]},
];

// ─── Passport cities ─────────────────────────────────────────────────
export const BAZAAR_PASSPORT = [
  { id:"mumbai",   name:"Mumbai",   emoji:"🏙️", unlockCoins:0,    marketId:"fruits",  desc:"Start your journey!",              color:"#f97316" },
  { id:"pune",     name:"Pune",     emoji:"🏘️", unlockCoins:50,   marketId:"veggies", desc:"Earn 50 coins to unlock",          color:"#22c55e" },
  { id:"delhi",    name:"Delhi",    emoji:"🕌",  unlockCoins:150,  marketId:"grocery", desc:"Earn 150 coins to unlock",         color:"#a855f7" },
  { id:"jaipur",   name:"Jaipur",   emoji:"🏯",  unlockCoins:300,  marketId:"sweets",  desc:"Earn 300 coins to unlock",         color:"#ec4899" },
  { id:"chennai",  name:"Chennai",  emoji:"🌊",  unlockCoins:500,  marketId:null,      desc:"Coming Soon — Sea market!",        color:"#06b6d4", comingSoon:true },
  { id:"kolkata",  name:"Kolkata",  emoji:"🎨",  unlockCoins:750,  marketId:null,      desc:"Coming Soon — Street food!",       color:"#fbbf24", comingSoon:true },
  { id:"kerala",   name:"Kerala",   emoji:"🌴",  unlockCoins:1000, marketId:null,      desc:"Coming Soon — Spice market!",      color:"#34d399", comingSoon:true },
  { id:"varanasi", name:"Varanasi", emoji:"🪔",  unlockCoins:1500, marketId:null,      desc:"Coming Soon — Festival market!",   color:"#fb923c", comingSoon:true },
];

// ─── Festival events ──────────────────────────────────────────────────
export const BAZAAR_FESTIVALS = [
  { id:"diwali",  name:"Diwali Mela 🪔",     emoji:"🪔", color:"#fbbf24", bonus:3, months:[10],      badge:"🪔 Diwali Hero",   desc:"Festival of lights! Special sweets & deco orders." },
  { id:"holi",    name:"Holi Bazaar 🎨",      emoji:"🎨", color:"#ec4899", bonus:3, months:[2,3],     badge:"🎨 Holi Champ",    desc:"Festival of colours! Sell gulal, thandai & sweets." },
  { id:"eid",     name:"Eid Special 🌙",      emoji:"🌙", color:"#a855f7", bonus:3, months:[3,4],     badge:"🌙 Eid Star",      desc:"Eid Mubarak! Special orders everywhere." },
  { id:"harvest", name:"Harvest Festival 🌾", emoji:"🌾", color:"#22c55e", bonus:2, months:[1,4,10,11],badge:"🌾 Harvest Hero", desc:"Fresh crop season! Big orders, special prices." },
  { id:"weekend", name:"Weekend Bazaar 🎪",   emoji:"🎪", color:"#06b6d4", bonus:2, weekdays:[0,6],   badge:"🎪 Weekend Trader",desc:"Weekend rush! Every Saturday & Sunday." },
];

// ─── Daily challenges ─────────────────────────────────────────────────
export const BAZAAR_DAILY_CHALLENGES = [
  { title:"Dadi Ji's Order 👵",      emoji:"👵", desc:"Dadi needs 3 items for dinner tonight!",          bonus:2, color:"#f97316" },
  { title:"School Tiffin Rush 🎒",   emoji:"🎒", desc:"50 kids need tiffin items. Big order alert!",     bonus:2, color:"#22c55e" },
  { title:"Festival Special 🪔",     emoji:"🪔", desc:"Diwali prep — help the family stock up!",         bonus:3, color:"#fbbf24" },
  { title:"Rainy Day Sale ☔",        emoji:"☔", desc:"It's raining! Prices changed. Adjust fast!",       bonus:2, color:"#3b82f6" },
  { title:"Cricket Match Snacks 🏏", emoji:"🏏", desc:"Match day! Serve customers before the over ends!",bonus:2, color:"#a855f7" },
  { title:"Wedding Season 💍",       emoji:"💍", desc:"Big wedding order — mithai, fruit & more!",       bonus:3, color:"#ec4899" },
  { title:"Sunday Bazaar 🎪",        emoji:"🎪", desc:"Busiest day! Handle the rush like a pro!",        bonus:2, color:"#06b6d4" },
];

// ─── PHASE 3: Character Customisation catalogue ───────────────────────
export const BAZAAR_AVATAR_ITEMS = {
  hat: [
    { id:"none",     name:"No Hat",        emoji:"",    price:0,    unlocked:true  },
    { id:"cap",      name:"Cricket Cap",   emoji:"🧢",  price:30,   unlocked:false },
    { id:"turban",   name:"Golden Turban", emoji:"👳",  price:80,   unlocked:false },
    { id:"crown",    name:"Royal Crown",   emoji:"👑",  price:200,  unlocked:false },
    { id:"chef",     name:"Chef Hat",      emoji:"👨‍🍳", price:50,   unlocked:false },
    { id:"graduation",name:"Scholar Cap",  emoji:"🎓",  price:120,  unlocked:false },
  ],
  outfit: [
    { id:"basic",    name:"Basic Kurta",   emoji:"👕",  price:0,    unlocked:true  },
    { id:"coloured", name:"Coloured Kurta",emoji:"🟦",  price:40,   unlocked:false },
    { id:"sherwani", name:"Sherwani",      emoji:"🥻",  price:100,  unlocked:false },
    { id:"sports",   name:"Sports Jersey", emoji:"👚",  price:60,   unlocked:false },
    { id:"golden",   name:"Golden Outfit", emoji:"✨",  price:250,  unlocked:false },
  ],
  accessory: [
    { id:"none",     name:"None",          emoji:"",    price:0,    unlocked:true  },
    { id:"glasses",  name:"Cool Glasses",  emoji:"🕶️", price:25,   unlocked:false },
    { id:"watch",    name:"Smart Watch",   emoji:"⌚",  price:45,   unlocked:false },
    { id:"necklace", name:"Gold Necklace", emoji:"📿",  price:70,   unlocked:false },
    { id:"bag",      name:"Trader Bag",    emoji:"👜",  price:55,   unlocked:false },
  ],
  shop_sign: [
    { id:"basic",    name:"Basic Sign",    emoji:"🪧",  price:0,    unlocked:true  },
    { id:"star",     name:"Star Sign",     emoji:"⭐",  price:35,   unlocked:false },
    { id:"rainbow",  name:"Rainbow Sign",  emoji:"🌈",  price:90,   unlocked:false },
    { id:"diwali",   name:"Diwali Lights", emoji:"🪔",  price:150,  unlocked:false },
    { id:"crown",    name:"Crown Board",   emoji:"👑",  price:300,  unlocked:false },
  ],
};

// ─── PHASE 4: Achievement definitions ────────────────────────────────
export const BAZAAR_ACHIEVEMENTS = [
  // First steps
  { id:"first_sale",     emoji:"🛍️",  name:"First Sale!",       desc:"Get your first correct answer",              color:"#22c55e", condition: s=> s.totalCorrect >= 1 },
  { id:"five_correct",   emoji:"✋",   name:"High Five!",         desc:"Get 5 correct answers in total",            color:"#06b6d4", condition: s=> s.totalCorrect >= 5 },
  { id:"perfect_round",  emoji:"💯",   name:"Flawless!",          desc:"Complete a round with 100% accuracy",       color:"#fbbf24", condition: s=> s.perfectRounds >= 1 },
  // Streaks
  { id:"streak3",        emoji:"🔥",   name:"On Fire!",           desc:"Get a 3-answer streak in one session",      color:"#f97316", condition: s=> s.bestStreak >= 3 },
  { id:"streak5",        emoji:"⚡",   name:"Lightning!",         desc:"Get a 5-answer streak",                     color:"#ef4444", condition: s=> s.bestStreak >= 5 },
  { id:"daily_3",        emoji:"📅",   name:"3-Day Streak",       desc:"Complete daily challenge 3 days in a row",  color:"#a855f7", condition: s=> s.dailyStreak >= 3 },
  { id:"daily_7",        emoji:"🗓️",  name:"Week Warrior!",      desc:"Complete daily challenge 7 days in a row",  color:"#ec4899", condition: s=> s.dailyStreak >= 7 },
  // Coins
  { id:"coins_100",      emoji:"🪙",   name:"Century!",           desc:"Earn 100 total coins",                      color:"#fbbf24", condition: s=> s.totalCoins >= 100 },
  { id:"coins_500",      emoji:"💰",   name:"Half Millionaire",   desc:"Earn 500 total coins",                      color:"#f97316", condition: s=> s.totalCoins >= 500 },
  { id:"coins_1000",     emoji:"🏦",   name:"Coin Millionaire",   desc:"Earn 1000 total coins",                     color:"#fbbf24", condition: s=> s.totalCoins >= 1000 },
  // Roles
  { id:"buyer_5",        emoji:"🧺",   name:"Smart Shopper",      desc:"Complete 5 sessions as a Buyer",            color:"#06b6d4", condition: s=> s.buyerSessions >= 5 },
  { id:"seller_5",       emoji:"🏪",   name:"Top Seller",         desc:"Complete 5 sessions as a Seller",           color:"#22c55e", condition: s=> s.sellerSessions >= 5 },
  { id:"both_roles",     emoji:"🔄",   name:"Versatile Trader",   desc:"Play as both Buyer and Seller",             color:"#a855f7", condition: s=> s.buyerSessions>=1 && s.sellerSessions>=1 },
  // Markets
  { id:"all_markets",    emoji:"🗺️",  name:"Market Explorer",    desc:"Play in all available markets",             color:"#ec4899", condition: s=> s.marketsPlayed >= 2 },
  { id:"rep_4star",      emoji:"⭐",   name:"Top Rated Shop!",    desc:"Reach 4+ star reputation in any market",    color:"#fbbf24", condition: s=> s.bestReputation >= 4 },
  { id:"rep_5star",      emoji:"🌟",   name:"Perfect Shop!",      desc:"Reach 5-star reputation",                   color:"#fbbf24", condition: s=> s.bestReputation >= 5 },
  // Speed
  { id:"speed_first",    emoji:"⚡",   name:"Speed Racer!",       desc:"Complete your first Speed Round",           color:"#ef4444", condition: s=> s.speedRounds >= 1 },
  { id:"speed_10",       emoji:"🚀",   name:"Turbo Trader!",      desc:"Answer 10 correctly in a Speed Round",      color:"#f97316", condition: s=> s.speedBestScore >= 10 },
  // Boss
  { id:"boss_first",     emoji:"😤",   name:"Boss Slayer!",       desc:"Beat your first Boss Customer",             color:"#a855f7", condition: s=> s.bossesBeaten >= 1 },
  { id:"boss_5",         emoji:"🗡️",  name:"Boss Hunter!",       desc:"Beat 5 Boss Customers",                     color:"#ec4899", condition: s=> s.bossesBeaten >= 5 },
  // Social
  { id:"challenge_sent", emoji:"📤",   name:"Challenger!",        desc:"Send a Challenge to a friend",              color:"#06b6d4", condition: s=> s.challengesSent >= 1 },
  { id:"challenge_won",  emoji:"🏆",   name:"Unbeatable!",        desc:"Win a Challenge against a friend",          color:"#fbbf24", condition: s=> s.challengesWon >= 1 },
  // Festival
  { id:"festival_play",  emoji:"🪔",   name:"Festival Spirit!",   desc:"Play during a Festival event",              color:"#fbbf24", condition: s=> s.festivalSessions >= 1 },
];

export const BAZAAR_CUSTOMER_NAMES  = ["Priya","Ravi","Sunita","Arjun","Meena","Vikram","Ananya","Rahul","Kavya","Deepak","Lalita","Suresh","Pinki","Mohan","Geeta"];
export const BAZAAR_CUSTOMER_EMOJIS = ["🧒","👦","👧","🧑","👩","👨","👴","👵","🧔","💁"];
export const BAZAAR_REACTIONS_CORRECT = ["शाबाश! 🎉","Wah! Bilkul sahi! ✅","Perfect! 👏","Bahut acha! 🌟","Excellent! 🏆","Ek dum sahi! 💯","Kya baat hai! 🔥"];
export const BAZAAR_REACTIONS_WRONG   = ["Arre nahi...😅","Phir se socho! 🤔","Sochke dekho...💭","Galat hai beta...😬","Dhyan se! 👀"];

// ─── localStorage helpers ─────────────────────────────────────────────
export function getBazaarReputation(marketId) {
  try { return JSON.parse(localStorage.getItem(`bz_rep_${marketId}`)||"null") || {stars:3.0,happy:0,angry:0}; }
  catch { return {stars:3.0,happy:0,angry:0}; }
}
export function updateBazaarReputation(marketId, correct) {
  const rep = getBazaarReputation(marketId);
  if (correct) { rep.happy++; rep.stars = Math.min(5, rep.stars+0.15); }
  else         { rep.angry++; rep.stars = Math.max(1, rep.stars-0.25); }
  rep.stars = Math.round(rep.stars*10)/10;
  localStorage.setItem(`bz_rep_${marketId}`, JSON.stringify(rep));
  return rep;
}
export function getTodayDailyChallenge() {
  const doy = Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/86400000);
  return BAZAAR_DAILY_CHALLENGES[doy % BAZAAR_DAILY_CHALLENGES.length];
}
export function isDailyChallengeCompletedToday(childId) {
  return localStorage.getItem(`bz_daily_${childId}_${new Date().toISOString().slice(0,10)}`) === "1";
}
export function markDailyChallengeComplete(childId) {
  const today = new Date().toISOString().slice(0,10);
  localStorage.setItem(`bz_daily_${childId}_${today}`, "1");
  // update daily streak
  const prev = new Date(); prev.setDate(prev.getDate()-1);
  const prevKey = `bz_daily_${childId}_${prev.toISOString().slice(0,10)}`;
  const prevDone = localStorage.getItem(prevKey)==="1";
  const cur = parseInt(localStorage.getItem(`bz_dstreak_${childId}`)||"0");
  localStorage.setItem(`bz_dstreak_${childId}`, String(prevDone ? cur+1 : 1));
}
export function getDailyStreak(childId) { return parseInt(localStorage.getItem(`bz_dstreak_${childId}`)||"0"); }
export function getBazaarTotalCoins(childId) { return parseInt(localStorage.getItem(`bz_coins_${childId}`)||"0"); }
export function addBazaarCoins(childId, n) {
  const c = getBazaarTotalCoins(childId)+n;
  localStorage.setItem(`bz_coins_${childId}`, String(c));
  return c;
}
export function getWeeklyLeague(childId) {
  try { return JSON.parse(localStorage.getItem(`bz_wk_${childId}_${getWeekKey()}`)||"null") || {coins:0,sessions:0}; }
  catch { return {coins:0,sessions:0}; }
}
export function updateWeeklyLeague(childId, coins) {
  const key = `bz_wk_${childId}_${getWeekKey()}`;
  const wk  = getWeeklyLeague(childId);
  wk.coins += coins; wk.sessions += 1;
  localStorage.setItem(key, JSON.stringify(wk));
  return wk;
}
export function getWeekKey() {
  const d=new Date(), jan1=new Date(d.getFullYear(),0,1);
  return `${d.getFullYear()}_w${Math.ceil((((d-jan1)/86400000)+jan1.getDay()+1)/7)}`;
}
export function getActiveFestival() {
  const now=new Date(), mon=now.getMonth()+1, wday=now.getDay();
  return BAZAAR_FESTIVALS.find(f=>f.weekdays?f.weekdays.includes(wday):f.months.includes(mon))||null;
}

// ─── PHASE 3: Avatar/customisation helpers ────────────────────────────
export function getBazaarOutfit(childId) {
  try { return JSON.parse(localStorage.getItem(`bz_outfit_${childId}`)||"null") || {hat:"none",outfit:"basic",accessory:"none",shop_sign:"basic"}; }
  catch { return {hat:"none",outfit:"basic",accessory:"none",shop_sign:"basic"}; }
}
export function setBazaarOutfit(childId, outfit) { localStorage.setItem(`bz_outfit_${childId}`, JSON.stringify(outfit)); }
export function getBazaarPurchased(childId) {
  try { return JSON.parse(localStorage.getItem(`bz_purchased_${childId}`)||"[]"); }
  catch { return []; }
}
export function addBazaarPurchase(childId, itemId) {
  const p = getBazaarPurchased(childId);
  if (!p.includes(itemId)) { p.push(itemId); localStorage.setItem(`bz_purchased_${childId}`, JSON.stringify(p)); }
}
export function isItemOwned(childId, itemId) { return itemId===undefined||BAZAAR_AVATAR_ITEMS.hat.find(i=>i.id===itemId)?.price===0 || getBazaarPurchased(childId).includes(itemId); }

// ─── PHASE 4: Achievements helpers ───────────────────────────────────
export function getBazaarStats(childId) {
  try { return JSON.parse(localStorage.getItem(`bz_stats_${childId}`)||"null") || {totalCorrect:0,perfectRounds:0,bestStreak:0,totalCoins:0,buyerSessions:0,sellerSessions:0,marketsPlayed:0,bestReputation:0,speedRounds:0,speedBestScore:0,bossesBeaten:0,challengesSent:0,challengesWon:0,festivalSessions:0,dailyStreak:0}; }
  catch { return {totalCorrect:0,perfectRounds:0,bestStreak:0,totalCoins:0,buyerSessions:0,sellerSessions:0,marketsPlayed:0,bestReputation:0,speedRounds:0,speedBestScore:0,bossesBeaten:0,challengesSent:0,challengesWon:0,festivalSessions:0,dailyStreak:0}; }
}
export function updateBazaarStats(childId, delta) {
  const s = getBazaarStats(childId);
  Object.keys(delta).forEach(k=>{ if(typeof delta[k]==="number") s[k]=Math.max(s[k]||0, delta[k]==='max'?delta[k]:s[k]+delta[k]); });
  s.totalCoins = getBazaarTotalCoins(childId);
  s.dailyStreak = getDailyStreak(childId);
  localStorage.setItem(`bz_stats_${childId}`, JSON.stringify(s));
  return s;
}
export function setStatMax(childId, key, val) {
  const s = getBazaarStats(childId);
  if (val > (s[key]||0)) { s[key]=val; localStorage.setItem(`bz_stats_${childId}`, JSON.stringify(s)); }
}
export function getEarnedAchievements(childId) {
  try { return JSON.parse(localStorage.getItem(`bz_ach_${childId}`)||"[]"); }
  catch { return []; }
}
export function checkAndAwardAchievements(childId) {
  const stats   = getBazaarStats(childId);
  const earned  = getEarnedAchievements(childId);
  const newOnes = [];
  BAZAAR_ACHIEVEMENTS.forEach(a=>{
    if (!earned.includes(a.id) && a.condition(stats)) { earned.push(a.id); newOnes.push(a); }
  });
  if (newOnes.length) localStorage.setItem(`bz_ach_${childId}`, JSON.stringify(earned));
  return newOnes;
}

// ─── PHASE 5: Challenge helpers ───────────────────────────────────────
export function generateChallengeId() { return Math.random().toString(36).slice(2,10).toUpperCase(); }
export function saveChallengeResult(challengeId, score, total, childName) {
  localStorage.setItem(`bz_ch_${challengeId}`, JSON.stringify({score,total,childName,ts:Date.now()}));
}
export function getChallengeResult(challengeId) {
  try { return JSON.parse(localStorage.getItem(`bz_ch_${challengeId}`)||"null"); }
  catch { return null; }
}

// ─── Supabase fetch ───────────────────────────────────────────────────
async function fetchBazaarQuestions(marketId, role, isDaily) {
  try {
    const res = await fetch("/api/db",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${db._token||""}`},body:JSON.stringify({action:"get_bazaar_questions",market_id:marketId,role,is_daily:isDaily})});
    const json = await res.json();
    if (Array.isArray(json.data)&&json.data.length>0) return json.data;
  } catch(e) { console.warn("fetchBazaarQuestions:",e.message); }
  return null;
}

