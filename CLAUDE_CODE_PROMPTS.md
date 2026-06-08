# MathMagic — Claude Code Prompts
# Paste each phase prompt → Claude Code handles everything autonomously
# DO NOT modify prompts — they are self-contained and efficient

---

## HOW TO USE
1. Open terminal in mathmagic project root
2. Run: `claude`
3. Paste Phase 1 prompt → wait for completion
4. Paste Phase 2 prompt → wait → continue
5. Never interrupt mid-phase

---

## ⚠️ PASTE THIS FIRST (one time only)

```
You are implementing a visual-only redesign of MathMagic Space Academy app.

ABSOLUTE RULES — never break these:
- NEVER touch /api/ files
- NEVER touch Supabase/DB/auth/JWT logic
- NEVER touch WORLDS or LESSONS constants in App.jsx
- NEVER touch Razorpay/payment logic
- NEVER touch service worker (public/sw.js)
- NEVER rewrite entire files — use targeted edits only
- ALWAYS run `npm run build` after each phase and fix any errors before finishing
- ALWAYS backup before editing App.jsx: `cp src/App.jsx src/App.jsx.bak`
- If a build error occurs, fix it immediately before moving on

DESIGN SYSTEM (memorize these — use everywhere):
Colors: bg=#FAFBFF, surface=#FFFFFF, surfaceAlt=#F0ECFF
indigo=#5B4FE8, coral=#FF6B6B, amber=#FFC847, mint=#2ECC9A
sky=#4BBDF5, rose=#FF5FA0, grape=#9B59F5
ink=#1A1040, ink2=#5A4E8A, ink3=#9890C4
Shadows: card = "0 8px 30px {color}28, 0 2px 6px {color}18, inset 0 1px 0 rgba(255,255,255,0.8)"
Button = "0 4px 0 {color}CC, 0 6px 16px {color}35, inset 0 1px 0 rgba(255,255,255,0.35)"
Radii: xs=8, sm=14, md=20, lg=28, full=999
Fonts: display="Fredoka One", body="Nunito", mono="DM Mono"
Animations: mmFloat, mmPop, mmSlideUp, mmShimmer, mmBounce, mmWave, mmPulse

Confirm you understand with: "Ready. Design system memorized."
```

---

## PHASE 1 — Design System (paste after confirmation)

```
PHASE 1: Design System Foundation. Do all steps autonomously. Run build at end.

STEP 1 — Backup critical files:
cp src/App.jsx src/App.jsx.bak
cp src/constants/themes.js src/constants/themes.js.bak
cp src/components/ui/primitives.jsx src/components/ui/primitives.jsx.bak
cp src/components/layout/layout.jsx src/components/layout/layout.jsx.bak

STEP 2 — Edit index.html, add inside <head>:
<link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">

STEP 3 — Edit src/constants/themes.js:
Add a new theme entry called "cosmic" (make it the first/default theme):
{
  name: "cosmic",
  bg: "#FAFBFF",
  bgWarm: "#F5F0FF", 
  surface: "#FFFFFF",
  surfaceAlt: "#F0ECFF",
  primary: "#5B4FE8",
  secondary: "#FF6B6B",
  accent: "#FFC847",
  text: "#1A1040",
  text2: "#5A4E8A",
  text3: "#9890C4",
  border: "rgba(91,79,232,0.10)",
  card: "#FFFFFF",
  nav: "#FFFFFF"
}
Map it so C.bg, C.surface, C.primary etc work. Do NOT remove existing themes. Do NOT touch isDark().

STEP 4 — Edit src/components/layout/layout.jsx:
In GlobalStyles or wherever CSS is injected, ADD these keyframes (do not remove existing ones):
@keyframes mmFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes mmPop{0%{transform:scale(0.85);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
@keyframes mmSlideUp{from{transform:translateY(22px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes mmShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes mmBounce{0%,100%{transform:scale(1)}40%{transform:scale(1.15)}70%{transform:scale(0.94)}}
@keyframes mmStarPop{0%{transform:scale(0) rotate(-30deg)}60%{transform:scale(1.3) rotate(5deg)}100%{transform:scale(1) rotate(0)}}
@keyframes mmConfetti{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(120px) rotate(540deg);opacity:0}}
@keyframes mmWave{0%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}}
@keyframes mmPulse{0%,100%{opacity:1}50%{opacity:0.6}}
Also add utility classes:
.mm-press:active{transform:translateY(3px)!important;}
.mm-btn:active{transform:translateY(4px)!important;box-shadow:none!important;}

STEP 5 — Edit src/components/ui/primitives.jsx:
Replace Btn component style only (keep props/onClick/disabled logic):
- background: linear-gradient(155deg, {color}EE, {color}CC)
- boxShadow: 0 4px 0 {color}CC, 0 6px 16px {color}35, inset 0 1px 0 rgba(255,255,255,0.35)
- borderRadius: 20px, fontFamily: Nunito, fontWeight: 900
- active: class "mm-btn"
- disabled: background #E5E3F0, no shadow

Replace Card component style only (keep props/children/onClick):
- background: C.surface (white)
- borderRadius: 28px
- boxShadow: 0 8px 30px {color}28, 0 2px 6px {color}18, inset 0 1px 0 rgba(255,255,255,0.8)
- border: 1.5px solid {color}22
- Add top shine: absolute div height:1px, gradient transparent→{color}30→transparent

Replace XPBar style only (keep xp/level props):
- track: background #F0ECFF, height 10px, borderRadius 999px
- fill: background linear-gradient(90deg,#5B4FE8,#9B59F5,#4BBDF5), backgroundSize 200% 100%
- fill animation: mmShimmer 3s linear infinite
- fill shadow: 0 0 10px #5B4FE855

STEP 6 — Run: npm run build
Fix any errors. Then run: git add -A && git commit -m "phase1: cosmic candy design system"

Report: which files changed, build status, any issues found.
```

---

## PHASE 2 — Splash + Entry Screens

```
PHASE 2: Restyle auth/entry screens. Visual only. Build and commit at end.

Read src/App.jsx now. Find these components: SplashScreen, EntryScreen, StudentEntryScreen (or StudentEntry), StudentLoginScreen.

SPLASH SCREEN — restyle JSX return only, keep all logic:
- Outer div: background "linear-gradient(160deg,#F0ECFF 0%,#E8F4FF 50%,#FFF0F5 100%)", position relative, overflow hidden
- Add 3 blob divs (position absolute, borderRadius "60% 40% 30% 70%/60% 30% 70% 40%", animation mmWave 8s infinite):
  blob1: width/height 180px, background "radial-gradient(#5B4FE855,#5B4FE815)", top:-40, right:-40
  blob2: width/height 120px, background "radial-gradient(#FF6B6B55,#FF6B6B15)", bottom:60, left:-30
  blob3: width/height 100px, background "radial-gradient(#FFC84755,#FFC84715)", top:40%, right:-20
- Rocket emoji: fontSize 80, animation "mmFloat 2.5s ease-in-out infinite", filter "drop-shadow(0 12px 24px #5B4FE844)"
- "MathMagic": fontFamily "Fredoka One", fontSize 38, color #5B4FE8
- "SPACE ACADEMY": fontSize 16, letterSpacing 4, color #5A4E8A
- 4 chip badges (CBSE/ICSE/Class 1-5/Game-Based): display inline-flex, padding "3px 10px", borderRadius 999, background {color}18, border 1.5px solid {color}30, fontSize 11, fontWeight 800
  colors: #5B4FE8, #FF6B6B, #2ECC9A, #9B59F5
- Loading bar: width 80%, height 5px, background #F0ECFF, borderRadius 999
  fill: width 65%, background linear-gradient(90deg,#5B4FE8,#9B59F5), animation mmShimmer 1.5s linear infinite, backgroundSize 200% 100%

ENTRY SCREEN — restyle role buttons only, keep onClick handlers:
Each role card (Student/Teacher/Admin):
- button: background #FFFFFF, border 2px solid {roleColor}28, borderRadius 28px, padding "18px 20px"
- boxShadow: 0 8px 30px {roleColor}28, 0 2px 6px {roleColor}18, inset 0 1px 0 rgba(255,255,255,0.8)
- animation: mmSlideUp 0.4s ease {i*0.12}s both
- Left icon box: 56x56, borderRadius 20px, background linear-gradient(135deg,{color}28,{color}10), border 2px solid {color}35, fontSize 28
- Label: fontSize 17, fontWeight 900, color #1A1040
- Subtitle: fontSize 12, color #5A4E8A, fontWeight 600
- Right arrow circle: 32px, borderRadius 999, background {color}15, border 1.5px solid {color}30, fontSize 16

STUDENT ENTRY SCREEN — same card style as EntryScreen:
3 options — School🏫 (indigo), Home🏠 (mint #2ECC9A), Register✨ (coral #FF6B6B)
Same animation stagger. Keep all onSelect/onNav callbacks.

STUDENT LOGIN SCREEN — restyle form only, keep all state/handlers:
- School code input: fontSize 20, letterSpacing 4, textAlign center, fontWeight 900, background #F0ECFF, border 2px solid #5B4FE825, borderRadius 14px, padding 14px
- Username input: same style, fontSize 15, letterSpacing normal
- PIN boxes (4): 50x55px each, borderRadius 14px
  filled: background white, border 2px solid #5B4FE855, boxShadow 0 4px 12px #5B4FE830
  empty: background #F0ECFF, border 2px solid rgba(91,79,232,0.10)
  dot: ● character, fontSize 24
- Submit button: use new Btn style (raised 3D), color #5B4FE8, full width, "ENTER ACADEMY 🚀"

Run: npm run build — fix errors.
Run: git add -A && git commit -m "phase2: splash and entry screens"
Report what changed.
```

---

## PHASE 3 — Home Screen

```
PHASE 3: Restyle HomeScreen. This is the most important screen. Visual only. Keep ALL hooks, useEffect, data fetching, navigation, and state vars 100% unchanged.

Read HomeScreen in src/App.jsx carefully first. Then restyle section by section:

HERO HEADER DIV:
- background: linear-gradient(160deg,#5B4FE818 0%,#9B59F512 50%,transparent 100%)
- padding: "24px 20px 20px", position relative, overflow hidden
- Add blob: position absolute, top:-50, right:-40, width 160px, height 160px, borderRadius "60% 40% 30% 70%/60% 30% 70% 40%", background "radial-gradient(#9B59F540,#9B59F510)", animation mmWave 8s infinite, pointerEvents none, opacity 0.4

AVATAR (child.avatar emoji):
- Container: position relative, width 64px, height 64px, flexShrink 0
- Inner: width 52px, height 52px, borderRadius 14px, background "linear-gradient(135deg,#9B59F522,#9B59F50a)", border "2.5px solid #9B59F544", display flex, alignItems center, justifyContent center, fontSize 27, boxShadow "0 0 20px #9B59F555"
- Level badge: position absolute, bottom -4, right -4, background "linear-gradient(135deg,#FFC847,#FF6B6B)", borderRadius 999, padding "1px 7px", fontSize 10, fontWeight 900, color white, border "2px solid white"

XP BAR:
- Track: background #F0ECFF, borderRadius 999, height 10px, overflow hidden, boxShadow "inset 0 2px 4px rgba(91,79,232,0.1)"
- Fill: background "linear-gradient(90deg,#5B4FE8,#9B59F5,#4BBDF5)", backgroundSize "200% 100%", borderRadius 999, animation "mmShimmer 3s linear infinite", boxShadow "0 0 10px #5B4FE855"

STREAK PILL (if streak_days > 0):
- background #FF6B6B15, border "1.5px solid #FF6B6B30", borderRadius 14px, padding "6px 10px", textAlign center
- 🔥 emoji fontSize 18, streak number in Fredoka One fontSize 13 color #FF6B6B

PROGRESS RING (SVG, keep existing calculation):
- Track circle: stroke {grape}20, strokeWidth 5
- Fill circle: stroke #9B59F5, strokeWidth 5, strokeLinecap round, strokeDasharray based on pctDone
- Center text: fontSize 11, fontWeight 900, color #9B59F5

STATS GRID (4 cards — Stars/Coins/Gems/Streak or Today):
Each card: background white, border "1.5px solid {color}22", borderRadius 28px, padding "10px 6px", textAlign center
boxShadow: 0 8px 30px {color}28, inset 0 1px 0 rgba(255,255,255,0.8)
Emoji fontSize 20, value fontSize 16 fontWeight 900, label fontSize 9 color #9890C4

COSMO MASCOT BAR:
- background "linear-gradient(135deg,#5B4FE812,#9B59F50a)", border "1.5px solid #5B4FE820", borderRadius 20px, padding "12px 16px"
- Robot 🤖 emoji: fontSize 34, animation "mmFloat 2.5s ease-in-out infinite"
- "COSMO SAYS": fontSize 11, color #5B4FE8, fontWeight 800, letterSpacing 1
- Message text: fontSize 14, fontWeight 700, color #1A1040

DAILY QUEST CARD:
- Card: background white, border "1.5px solid #9B59F522", borderRadius 28px, padding 16px
- boxShadow: 0 8px 30px #9B59F528, inset 0 1px 0 rgba(255,255,255,0.8)
- Progress bar: background #F0ECFF height 7px, fill: gradient indigo→grape→coral
- 3 task pills: done = {color}14 bg + {color}40 border; pending = #F0ECFF bg + light border

QUICK LAUNCH GRID (2x2):
Each button: background {color}10, border "1.5px solid {color}25", borderRadius 20px, padding "14px 12px"
boxShadow: 0 4px 12px {color}30, 0 2px 6px {color}20
icon fontSize 26, title fontSize 13 fontWeight 800, subtitle fontSize 10 in accent color

CLASS CARD (bottom — navigates to lesson map):
- background white, border "2px solid #9B59F530", borderRadius 28px, padding 16px
- boxShadow: 0 8px 30px #9B59F528, inset 0 1px 0 rgba(255,255,255,0.8)
- class emoji 58x58 square, class name fontSize 18 fontWeight 900
- Mini progress bar: grape→sky gradient
- Right arrow: fontSize 24, color #9B59F5

Run: npm run build — fix all errors.
Run: git add -A && git commit -m "phase3: home screen"
Report sections changed and build status.
```

---

## PHASE 4 — Lesson Map + Set Path + Game + Result

```
PHASE 4: Restyle LessonMapScreen, SetPathMap/SetScreen, GameScreen, ResultScreen. Visual only. Keep all unlock logic, navigation, scoring unchanged.

LESSON MAP SCREEN:
Header: background "linear-gradient(135deg,#9B59F520,#5B4FE810)", borderBottom "1.5px solid #9B59F520"
Back button: 40x40, borderRadius 14px, background #9B59F515, border "1.5px solid #9B59F530"
Overall progress bar: background rgba(91,79,232,0.08), fill: grape→sky gradient, boxShadow "0 0 8px #9B59F566"

Each lesson card (keep done/locked/isNext logic):
- button: background white, borderRadius 28px, padding "14px 16px"
- Border: done="{color}66", isNext="{color}50", else="{color}22" — width 2px
- boxShadow: isNext=deep shadow, done=regular shadow, else=minimal
- Progress ring (SVG): track={color}18, fill=color (or mint if done), center=emoji or 🔒
- Mini progress bar inside: height 6px, borderRadius 999
- Right side: done=🏆 in mint card, isNext=pulsing ▶ button (animation mmPulse 1.5s infinite), else=› arrow
- Section header every 3 lessons: colored band, "SECTION N" label

SET PATH MAP (Duolingo grid):
4-column grid, each set button:
- done: background #2ECC9A12, border "2px solid #2ECC9A44", ✅ icon, 3 tiny ⭐ rating
- current: background white, border "2px solid #9B59F555", deep shadow, ▶ icon, "NEXT" label, transform scale(1.06)
- locked: background #F0ECFF, border light, 🔒 icon, cursor not-allowed, opacity 0.6

GAME SCREEN:
Header bar: background {color}15, borderBottom "1.5px solid {color}25"
Back button: same 40x40 style. Hearts: ❤️ row
Progress bar: {color}18 track, {color}→sky fill, boxShadow glow
Question card: background white, borderRadius 28px, deep shadow
  - Color flash on answer: correct=boxShadow "0 0 40px #2ECC9A50", wrong=coral glow
  - Floating emoji: fontSize 42, animation mmFloat 2s infinite
Answer buttons (2x2):
  - default: white, border "2px solid {color}25", top shine overlay (absolute div, gradient rgba(255,255,255,0.5)→transparent)
  - Letter label: "A/B/C/D" fontSize 10 fontWeight 900 above answer
  - correct: background #E8FFF4, border "2.5px solid #2ECC9A", color #2ECC9A, shadow "0 0 24px #2ECC9A55"
  - wrong chosen: background #FFF0F0, border "2.5px solid #FF6B6B", color #FF6B6B
  - animation: mmPop 0.3s ease {i*0.06}s both
Hint button: background #FFC84710, border "1.5px solid #FFC84730", borderRadius 20px
Correct feedback card: mint gradient, ⭐ emoji, "+20 XP" text
Wrong feedback: amber tinted, hint text

RESULT SCREEN:
- Background: linear-gradient(160deg,#F5F0FF,#FAFBFF)
- 14 confetti emoji (absolute, top -20px, spaced left 5%→100%, animation mmConfetti with staggered delays)
- 🏆 trophy: fontSize 90, animation mmBounce 1.2s ease, drop-shadow amber
- "MISSION COMPLETE!": Fredoka One, fontSize 28, color #5B4FE8
- 3 ⭐ stars: fontSize 42 each, animation mmStarPop 0.4s ease {s*0.15}s both
- Score card: white card, deep shadow, score in Fredoka One fontSize 50, "/20" fontSize 20 color #5A4E8A
- XP+Coins: fontSize 15, fontWeight 900, color #FFC847
- Unlock banner: background #2ECC9A14, border "1.5px solid #2ECC9A40", borderRadius 14px
- Next Set button: raised style, indigo, full width
- Retry+Home buttons: white, light border, side by side

Run: npm run build — fix errors.
Run: git add -A && git commit -m "phase4: lesson map, set path, game, result"
```

---

## PHASE 5 — Feature Screens

```
PHASE 5: Restyle AbacusScreen, OlympiadScreen, BazaarScreen, GamesHubScreen, DailyQuizScreen, DailyPuzzleScreen. Visual only. Keep all logic.

ABACUS SCREEN:
Header: amber tinted, same back button style
Beads (keep count logic): active bead = background "linear-gradient(135deg,#FFC847,#FF6B6B)", border #FFC847, boxShadow "0 2px 6px #FFC84744" | empty = background #F0ECFF, border light
Question card: white, deep amber shadow, floating abacus emoji
Answer grid: same 2x2 style as GameScreen (A/B/C/D labels, correct/wrong flash)

OLYMPIAD SCREEN:
Stats card top: grape gradient, rank/medals/contests in 3 columns
Each contest card: white card, 3px left accent bar (position absolute, left 0, top 0, bottom 0, width 3px, gradient {color}→{color}66)
Icon: 50x50 colored square. Status pill: coral "LIVE" / mint "SOON" / grey "ENDED"
Prize: colored text with 🎁

BAZAAR SCREEN:
Intro card: coral tinted
Each lesson card: accent bar style (same as Olympiad/GamesHub)
NEW/HOT tags: Chip style (pill, color tinted)

GAMES HUB SCREEN:
Each game card: white, accent bar left, 52x52 icon square, title+desc, circular arrow button
Keep all game navigation onClick handlers

DAILY QUIZ (bottom sheet modal):
Outer: background rgba(0,0,0,0.35), justifyContent flex-end
Sheet: background #FAFBFF, borderRadius "28px 28px 0 0", boxShadow "0 -20px 60px rgba(91,79,232,0.2)"
Drag handle: width 40px, height 4px, background rgba(91,79,232,0.1), borderRadius 999, margin "12px auto"
Progress dots: 5 colored pills (filled=sky, empty=surfaceAlt)
Question + answer grid: same GameScreen style

DAILY PUZZLE SCREEN:
Missing number box: width 52px, height 52px, borderRadius 14px, background #9B59F518, border "2.5px dashed #9B59F5", animation mmPulse 1.5s infinite, fontSize 28, color #9B59F5
Answer grid: 3 columns of number buttons (white, colored border, shadow)
Hint: amber card

Run: npm run build — fix errors.
Run: git add -A && git commit -m "phase5: feature screens"
```

---

## PHASE 6 — Profile Screens

```
PHASE 6: Restyle BadgesScreen, ShopScreen, CharacterScreen. Visual only. Keep all data/state.

BADGES SCREEN:
Header: amber→coral gradient tinted, progress bar amber→coral fill, glow shadow
Badge grid (3 columns):
  earned: white card, border "#FFC84755", emoji full color, "EARNED ✓" amber pill (fontSize 9)
  locked: same card but opacity 0.45, emoji filter grayscale(1), no pill
  animation: mmPop staggered

SHOP SCREEN:
Hero header: background "linear-gradient(135deg,#2ECC9A,#4BBDF5)", no border
Currency row: 3 pills, background rgba(255,255,255,0.22), border rgba(255,255,255,0.3), color white
Tabs: background #F0ECFF, borderRadius 20px, padding 3px
  active tab: white card, boxShadow indigo shadow, color #5B4FE8, fontWeight 900
  inactive: transparent, color #9890C4
Item cards (2-column grid): white card, deep indigo shadow
  owned: border "#2ECC9A44", mint "✅ Owned" pill
  not owned: buy button "linear-gradient(135deg,#5B4FE8,#9B59F5)", raised shadow, fontWeight 900

CHARACTER SCREEN:
Preview card: white card, rose shadow, large emoji (fontSize 72, mmFloat), name, select/buy button
Avatar grid (4 columns):
  selected: border "{color}55", boxShadow deep shadow, background {color}18
  owned unselected: white, mint border hint
  not owned: white, 💎 badge (position absolute top-right, amber bg, fontSize 8)
  emoji filter grayscale(0.4) if not owned

Run: npm run build — fix errors.
Run: git add -A && git commit -m "phase6: profile screens"
```

---

## PHASE 7 — Parent + Teacher + Admin

```
PHASE 7: Restyle ParentDashScreen, TeacherDashboard (TeacherScreens.jsx), AdminPanel.jsx. Visual only. Keep all data fetching, API calls, permissions, pagination logic.

PARENT DASHBOARD:
Header: rose+grape gradient tinted, grade badge (mint tinted 52x52 square)
Child info row: white 70% opacity, blur backdrop, avatar + name + class + streak
KPI grid (4 cards): same mini card style (emoji + value + label)
Performance rings (3 SVG donuts):
  - Track: {color}18, Fill: {color}, strokeWidth 5, strokeLinecap round
  - Center text: fontWeight 900, color {color}
  - Label below: fontSize 10 fontWeight 800
Strengths card: mint tinted background (#2ECC9A0a), ✅ per topic, "88%+" in mint
Needs Work card: coral tinted (#FF6B6B07), 📌 per topic, "Below 60%" in coral

TEACHER DASHBOARD (TeacherScreens.jsx):
Header: amber tinted, school/class info
Stats row (3 cards): Avg Score (mint) / Avg Streak (coral) / Sets Done (sky)
Action buttons (4): tinted icon squares — Questions (grape) / Assign (sky) / Reports (mint) / Notify (coral)
Student list — each card:
  good (>80%): mint accent, ⭐ icon
  ok (60-80%): amber accent, 📖 icon  
  alert (<60%): coral accent, ⚠️ icon
  Show: name + sets + streak + accuracy % on right
Keep all teacher permission checks (7 granular permissions) — only restyle the JSX return.

ADMIN PANEL (AdminPanel.jsx):
Platform overview: grape gradient card, Uptime/Revenue/Rating in 3 columns
5-tile grid (2 columns, last tile full width or 2+3 layout):
  Each tile: white card, deep colored shadow
  Icon: 44x44 colored square, count in Fredoka One fontSize 22, colored label
  "MANAGE →" chip: top right, fontSize 9, color tinted pill
Analytics tile: indigo gradient tinted, keep existing onClick
CRUD tables inside each tile: keep all adminApi calls and sbAll pagination
Just restyle table rows as cards (white, light border, padding 12px)

Run: npm run build — fix errors.
Run: git add -A && git commit -m "phase7: parent, teacher, admin"
```

---

## PHASE 8 — Payment Screen

```
PHASE 8: Restyle PaymentScreen. Visual only. Keep ALL Razorpay calls, UTR logic, API calls, and form handlers.

Find PaymentScreen or the payment JSX section in App.jsx.

Restyle:
- Outer: background "linear-gradient(160deg,#F5F0FF,#FAFBFF)", soft gradient
- Unlock card: white card, mint shadow, 🔓 emoji fontSize 48, lesson name fontSize 20 fontWeight 900
  Price row: price in Fredoka One fontSize 32 color #5B4FE8, strikethrough original price fontSize 12, discount chip (coral pill "40% OFF")
- Features list: ✅ emoji + text, each in a row with gap 8px
- Pay button: raised style (0 4px 0 {mint}CC shadow), background linear-gradient(155deg,#2ECC9AEE,#2ECC9ACC), full width, fontWeight 900
- UTR fallback text: color #5B4FE8, textDecoration underline, fontSize 12
- Security note: fontSize 10, color #9890C4, marginTop 16

Run: npm run build — fix errors.
Run: git add -A && git commit -m "phase8: payment screen"
```

---

## PHASE 9 — Final QA (paste this last)

```
PHASE 9: Final verification. Run all checks autonomously.

STEP 1 — Verify no logic was touched:
Run: git diff src/App.jsx.bak src/App.jsx | grep "^+" | grep -E "supabase|fetch\(|api/|WORLDS|LESSONS|localStorage|jwt|razorpay" | head -20
If any matches found, investigate and revert those specific lines.

STEP 2 — Verify build is clean:
Run: npm run build
Zero errors required.

STEP 3 — Check WORLDS and LESSONS still exist:
Run: grep -n "const WORLDS\|const LESSONS" src/App.jsx
Must return results.

STEP 4 — Check no API files changed:
Run: git diff --name-only HEAD~8 HEAD | grep "^api/"
Must return empty.

STEP 5 — Check fonts loaded in index.html:
Run: grep "Fredoka" index.html
Must return the font link.

STEP 6 — Final commit and push:
git add -A
git commit -m "feat: Cosmic Candy redesign complete — 23 screens"
git push origin main

STEP 7 — Report:
List all files changed across all phases.
Confirm build status.
Confirm no logic files touched.
State: "Redesign complete. Deploy triggered."
```

---

## IF SOMETHING BREAKS — Recovery Prompt

```
Build is broken. Fix it now.

Run: npm run build 2>&1 | head -50
Read the error. Fix only the broken file.
Do NOT touch any other files.
Common issues to check:
- Multi-line strings in JSX (use arrays instead)
- Missing closing tags or brackets
- Duplicate variable declarations
- Component defined inside another component
- isDark() called inside static object

After fixing, run: npm run build again.
Confirm zero errors before stopping.
```

---

## TIPS
- Each prompt is self-contained — Claude Code reads files itself
- Prompts avoid asking Claude to "read the whole file" — it targets sections
- Build+commit is inside every prompt — no manual steps needed
- Recovery prompt handles any breakage without you intervening
- Total paste count: 11 prompts (1 setup + 9 phases + 1 recovery if needed)
