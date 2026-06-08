# MathMagic Space Academy — Claude Code Rules

## Project
React+Vite gamified math app for Indian school children (Nursery–Class 5).
Deployed at https://mathmagic-virid.vercel.app via GitHub→Vercel auto-deploy.

## PowerShell — pre-approved
All PowerShell read/search commands are pre-approved:
- Select-String (file search)
- Get-Content (file read)
- Set-Content (file write)
- Get-ChildItem (directory listing)

## Environment
- Windows machine, project at D:\Candy Mathmagic\mathmagic
- Use forward slashes in all paths
- Use npm (not yarn)
- Git bash available

## Permissions — pre-approved for this project
All bash commands automatically allowed — never ask for confirmation:
- cp, mv, mkdir (project files only)
- npm run build, npm install
- git add, git commit, git push origin main
- python3 scripts in project root

## Design Reference
Before editing any screen, read the matching component in:
`./mathmagic-redesign.jsx`
This file is the visual source of truth for all 23 screens.

## ABSOLUTE RULES — never break these
- NEVER touch any file inside /api/
- NEVER touch Supabase calls, DB queries, or auth logic
- NEVER touch WORLDS or LESSONS constants in src/App.jsx
- NEVER touch Razorpay or payment logic
- NEVER touch public/sw.js (service worker)
- NEVER move JWT tokens to localStorage
- NEVER rewrite entire files — use targeted string replacements only
- NEVER define components inside other components (causes remount loops)
- NEVER use multi-line template strings in JSX (causes esbuild failures)
- NEVER duplicate state declarations
- NEVER call isDark() inside static objects — runtime calls only
- ALWAYS use parseInt() when comparing class_num
- ALWAYS backup App.jsx before editing: cp src/App.jsx src/App.jsx.bak
- ALWAYS run npm run build after every edit and fix all errors before finishing
- ALWAYS commit after each phase with a clear message

## Key Files
- src/App.jsx — all screens (~8800 lines), contains WORLDS + LESSONS constants
- src/constants/themes.js — theme system, C object, isDark(), textColor()
- src/components/ui/primitives.jsx — Btn, Card, XPBar, BackBtn atoms
- src/components/layout/layout.jsx — GlobalStyles, Starfield, keyframes
- src/components/admin/AdminPanel.jsx — admin CRUD, sbAll pagination helper
- src/components/teacher/TeacherScreens.jsx — teacher dashboard + permissions
- src/components/teacher/TeacherExtras.jsx — question manager
- src/components/screens/ — individual screen components
- index.html — font links go here

## Design System — Cosmic Candy

### Colors
- bg: #FAFBFF
- bgWarm: #F5F0FF
- surface: #FFFFFF
- surfaceAlt: #F0ECFF
- indigo: #5B4FE8
- coral: #FF6B6B
- amber: #FFC847
- mint: #2ECC9A
- sky: #4BBDF5
- rose: #FF5FA0
- grape: #9B59F5
- ink: #1A1040
- ink2: #5A4E8A
- ink3: #9890C4
- border: rgba(91,79,232,0.10)

### Shadows
- Card: 0 8px 30px {color}28, 0 2px 6px {color}18, inset 0 1px 0 rgba(255,255,255,0.8)
- Button: 0 4px 0 {color}CC, 0 6px 16px {color}35, inset 0 1px 0 rgba(255,255,255,0.35)
- Soft: 0 4px 12px {color}30, 0 2px 6px {color}20

### Border Radius
- xs: 8px, sm: 14px, md: 20px, lg: 28px, xl: 36px, full: 999px

### Fonts
- Display: 'Fredoka One' (headings, scores, titles)
- Body: 'Nunito' (all UI text, weights 400–900)
- Mono: 'DM Mono' (labels, data)
- Google Fonts URL: https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap

### Animations
- mmFloat: 0%,100%{translateY(0)} 50%{translateY(-6px)}
- mmPop: scale 0.85→1.06→1 with opacity
- mmSlideUp: translateY(22px)→0 with opacity
- mmShimmer: background-position -200%→200%
- mmBounce: scale 1→1.15→0.94→1
- mmStarPop: scale+rotate 0→1.3→1
- mmConfetti: translateY + rotate 540deg, opacity 1→0
- mmWave: border-radius morphing (blob shape)
- mmPulse: opacity 1→0.6→1

### Reusable Patterns
Card with top shine:
  background white, borderRadius 28px, border 1.5px solid {color}22
  boxShadow: card shadow above
  + absolute div: top 0, left 0, right 0, height 1px, gradient transparent→{color}30→transparent

Raised button:
  background linear-gradient(155deg, {color}EE, {color}CC)
  boxShadow: button shadow above
  borderRadius 20px, fontFamily Nunito, fontWeight 900
  active class mm-btn: translateY(4px), shadow collapses

Chip/pill badge:
  display inline-flex, padding 3px 10px, borderRadius 999px
  background {color}18, border 1.5px solid {color}30
  fontSize 11, fontWeight 800

Color blob (background decoration):
  position absolute, borderRadius 60% 40% 30% 70%/60% 30% 70% 40%
  background radial-gradient({color}55, {color}15)
  animation mmWave 8s ease-in-out infinite
  pointerEvents none

Progress ring (SVG):
  rotate(-90deg), track stroke {color}18 strokeWidth 5
  fill stroke {color} strokeDasharray based on percentage
  strokeLinecap round, center text absolute positioned

XP bar:
  track background #F0ECFF, height 10px, borderRadius 999
  fill background linear-gradient(90deg,#5B4FE8,#9B59F5,#4BBDF5)
  backgroundSize 200% 100%, animation mmShimmer 3s linear infinite
  boxShadow 0 0 10px #5B4FE855

## Screen List (all 23)
Auth: SplashScreen, EntryScreen, StudentEntryScreen, StudentLoginScreen, PaymentScreen
Student: HomeScreen, LessonMapScreen, SetPathMapScreen, GameScreen, ResultScreen
Features: GamesHubScreen, AbacusScreen, OlympiadScreen, BazaarScreen, DailyQuizScreen, DailyPuzzleScreen
Profile: BadgesScreen, ShopScreen, CharacterScreen, ParentDashScreen
Staff: TeacherDashboard, TeacherQManager, AdminPanel

## Stack
React+Vite, Vercel serverless APIs, Supabase, Razorpay, Telegram notifications
Supabase URL: vsfvvzcvhhibepinphtk.supabase.co
