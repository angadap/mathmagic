// src/constants/gameData.js — Static game content: worlds, lessons, badges, shop items, avatars

export const WORLDS = [
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
export const LESSONS = {
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
export const BADGES = [
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
export const SHOP_ITEMS = [
  // ── Avatars ───────────────────────────────────────────────────────
  {id:"avatar_wizard",   name:"Math Wizard",    icon:"🧙‍♂️", desc:"Legendary wizard avatar",       cat:"avatar",   stars:null, gems:50,   coins:null, lvl:5},
  {id:"avatar_unicorn",  name:"Unicorn",         icon:"🦄",   desc:"Magical unicorn avatar",        cat:"avatar",   stars:null, gems:null, coins:300,  lvl:3},
  {id:"avatar_robot",    name:"Robot",           icon:"🤖",   desc:"Futuristic robot avatar",       cat:"avatar",   stars:null, gems:30,   coins:null, lvl:4},
  {id:"avatar_dragon",   name:"Dragon",          icon:"🐉",   desc:"Mighty dragon avatar",          cat:"avatar",   stars:null, gems:80,   coins:null, lvl:8},
  {id:"avatar_hero",     name:"Superhero",       icon:"🦸",   desc:"Superhero avatar",              cat:"avatar",   stars:50,   gems:null, coins:null, lvl:6},
  {id:"avatar_knight",   name:"Knight",          icon:"⚔️",   desc:"Brave knight avatar",           cat:"avatar",   stars:null, gems:40,   coins:null, lvl:5},
  {id:"avatar_elf",      name:"Elf",             icon:"🧝",   desc:"Magical elf avatar",            cat:"avatar",   stars:60,   gems:null, coins:null, lvl:4},
  {id:"avatar_king",     name:"King",            icon:"👑",   desc:"Royal king avatar",             cat:"avatar",   stars:null, gems:100,  coins:null, lvl:10},
  // ── Hints ─────────────────────────────────────────────────────────
  {id:"hints_3",         name:"Hint Pack S",     icon:"💡",   desc:"+3 hints today only",           cat:"hints",    stars:null, gems:null, coins:30,   lvl:1, hintCount:3},
  {id:"hints_5",         name:"Hint Pack M",     icon:"💡",   desc:"+5 hints today only",           cat:"hints",    stars:null, gems:null, coins:45,   lvl:1, hintCount:5},
  {id:"hints_10",        name:"Hint Pack L",     icon:"💡",   desc:"+10 hints today only",          cat:"hints",    stars:15,   gems:null, coins:null, lvl:2, hintCount:10},
  // ── Power-ups ─────────────────────────────────────────────────────
  {id:"powerup_shield",  name:"Shield Pack",     icon:"🛡️",   desc:"Extra 2 lives per set",        cat:"powerup",  stars:null, gems:null, coins:150,  lvl:2},
  {id:"powerup_time",    name:"Time Freeze",     icon:"⏰",   desc:"+10s per question",             cat:"powerup",  stars:15,   gems:null, coins:null, lvl:1},
  {id:"powerup_double",  name:"Double XP",       icon:"⚡",   desc:"2x XP for 3 sets",              cat:"powerup",  stars:null, gems:20,   coins:null, lvl:3},
  {id:"powerup_skip",    name:"Skip Question",   icon:"⏭️",   desc:"Skip 3 tough questions",       cat:"powerup",  stars:null, gems:null, coins:100,  lvl:2},
  {id:"powerup_magnet",  name:"Star Magnet",     icon:"🧲",   desc:"Double stars for 1 lesson",    cat:"powerup",  stars:null, gems:15,   coins:null, lvl:3},
  // ── Themes ────────────────────────────────────────────────────────
  {id:"theme_dark",      name:"Space Dark",      icon:"🌙",   desc:"Original dark theme",          cat:"theme",    stars:null, gems:30,   coins:null, lvl:1},
  {id:"theme_candy",     name:"Candy Pop",       icon:"🍭",   desc:"Sweet candy theme",            cat:"theme",    stars:null, gems:25,   coins:null, lvl:2},
  {id:"theme_sunset",    name:"Sunset Blaze",    icon:"🌅",   desc:"Warm sunset theme",            cat:"theme",    stars:null, gems:20,   coins:null, lvl:2},
  {id:"theme_teal",      name:"Cosmic Teal",     icon:"🚀",   desc:"Deep space teal theme",        cat:"theme",    stars:null, gems:35,   coins:null, lvl:3},
  {id:"theme_midnight",  name:"Royal Midnight",  icon:"👑",   desc:"Navy and gold theme",          cat:"theme",    stars:null, gems:45,   coins:null, lvl:4},
  // ── Name Tags ─────────────────────────────────────────────────────
  {id:"tag_goldstar",    name:"Gold Star",       icon:"🌟",   desc:"Gold Star title on profile",   cat:"nametag",  stars:100,  gems:null, coins:null, lvl:3},
  {id:"tag_champion",    name:"Champion",        icon:"🏆",   desc:"Champion title on profile",    cat:"nametag",  stars:null, gems:50,   coins:null, lvl:5},
  {id:"tag_genius",      name:"Genius",          icon:"🧠",   desc:"Genius title on profile",      cat:"nametag",  stars:200,  gems:null, coins:null, lvl:7},
  {id:"tag_rocket",      name:"Rocket Kid",      icon:"🚀",   desc:"Rocket Kid title on profile",  cat:"nametag",  stars:null, gems:null, coins:500,  lvl:4},
  // ── Sticker Packs ────────────────────────────────────────────────
  {id:"sticker_space",   name:"Space Pack",      icon:"🪐",   desc:"8 space stickers",             cat:"sticker",  stars:null, gems:null, coins:80,   lvl:1},
  {id:"sticker_animals", name:"Animals Pack",    icon:"🐾",   desc:"8 animal stickers",            cat:"sticker",  stars:null, gems:null, coins:80,   lvl:1},
  {id:"sticker_food",    name:"Food Pack",       icon:"🍕",   desc:"8 food stickers",              cat:"sticker",  stars:25,   gems:null, coins:null, lvl:2},
  {id:"sticker_premium", name:"Galaxy Pack",     icon:"✨",   desc:"10 premium galaxy stickers",  cat:"sticker",  stars:null, gems:20,   coins:null, lvl:3},
];

// ── Conversion rates ──────────────────────────────────────────────
// 10 Coins → 1 Star | 1 Gem → 5 Stars (one-way only, no reverse)
export const CONVERSION = { coinsPerStar: 10, gemsToStars: 5 };

// ── How to earn Coins & Gems ──────────────────────────────────────
export const EARN_GUIDE = {
  coins: [
    { action:"Complete a lesson set",      reward:"+5 coins" },
    { action:"Perfect score (3 stars)",    reward:"+5 bonus coins" },
    { action:"Complete Daily Quiz",        reward:"+10 coins" },
    { action:"3-day streak bonus",         reward:"+15 coins" },
    { action:"Daily Puzzle solved",        reward:"+8 coins" },
  ],
  gems: [
    { action:"7-day streak maintained",    reward:"+5 gems" },
    { action:"Complete full lesson (20 sets)", reward:"+10 gems" },
    { action:"Win a Boss Battle",          reward:"+3 gems" },
    { action:"Olympiad 3-star any test",   reward:"+2 gems" },
    { action:"Monthly class leaderboard top", reward:"+20 gems" },
  ],
};

export const FREE_AVATARS = ["🧒","👧","👦","🧑","🧒‍♀️"];
export const ALL_AVATARS  = ["🧒","👧","👦","🧑","🧒‍♀️","🧙‍♂️","🦄","🤖","🐉","🦸","⚔️"];