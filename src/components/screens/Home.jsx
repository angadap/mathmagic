// src/components/screens/Home.jsx — ThemeSelector, DailyQuestSection, QuickLaunch, WorldsSection, Home
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { C, updateC, THEMES, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, Card, BackBtn, XPBar } from '../ui/primitives.jsx';
import { Starfield, Confetti, Mascot, Tutorial, MuteBtn } from '../layout/layout.jsx';
import { WORLDS, LESSONS, BADGES } from '../../constants/gameData.js';
import { DailyQuestHub, DailyQuiz, DailyPuzzle } from './Daily.jsx';
import { ProgressGrid, SOSButton } from '../shared/shared.jsx';
import { RatingPrompt } from './Feedback.jsx';


export function ThemeSelector({ onClose }) {
  const [cur, setCur] = useState(localStorage.getItem("mm_theme")||"space");
  const themes = Object.entries(THEMES);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:C.card, borderRadius:"20px 20px 0 0", padding:"20px 18px 32px", width:"100%", maxWidth:480, animation:"slideUp 0.25s ease" }} onClick={e=>e.stopPropagation()}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color:C.cyan, marginBottom:16, textAlign:"center" }}>🎨 CHOOSE THEME</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {themes.map(([key,t]) => (
            <button key={key} onClick={() => {
              localStorage.setItem("mm_theme",""); // force
              localStorage.setItem("mm_theme", key);
              setCur(key); updateC(key);
              window.location.reload(); // reload to apply theme everywhere
            }} style={{
              background: cur===key ? `${t.cyan}22` : t.bg,
              border:`2px solid ${cur===key ? t.cyan : t.dim+"44"}`,
              borderRadius:14, padding:"12px 10px", cursor:"pointer", textAlign:"center",
              boxShadow: cur===key ? `0 0 16px ${t.cyan}44` : "none",
            }}>
              <div style={{ fontSize:24, marginBottom:4 }}>{t.icon}</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color: cur===key ? t.cyan : t.dim }}>{t.name}</div>
              <div style={{ display:"flex", gap:4, justifyContent:"center", marginTop:6 }}>
                {[t.purple,t.cyan,t.yellow,t.green].map((cl,i)=>(
                  <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:cl }}/>
                ))}
              </div>
              {cur===key && <div style={{ fontSize:8, color:t.cyan, fontFamily:"'Orbitron',sans-serif", marginTop:4 }}>✓ ACTIVE</div>}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop:14, width:"100%", background:"none", border:`1px solid ${C.dim}44`, borderRadius:10, padding:"10px", color:C.dim, cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13 }}>CLOSE</button>
      </div>
    </div>
  );
}

export function DailyQuestSection({ dqDone, dpDone, todaySets, onOpen }) {
  const [open, setOpen] = React.useState(true);
  const doneCnt = [dqDone, dpDone, todaySets>=1].filter(Boolean).length;
  const allDone = doneCnt === 3;
  return (
    <div style={{ position:"relative", zIndex:2, margin:"14px 18px 0" }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ width:"100%", background:isDark()?`linear-gradient(135deg,${C.purple}18,${C.cyan}0a)`:C.card, border:`1.5px solid ${C.purple}${isDark()?"33":"44"}`, borderRadius:18, padding:"14px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left", boxShadow:`0 2px 10px ${C.purple}10` }}>
        <div style={{ fontSize:26 }}>🎯</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:900, color:textColor() }}>Daily Quest</div>
          <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{doneCnt}/3 tasks done today</div>
        </div>
        {allDone
          ? <div style={{ background:`${C.green}22`, border:`1px solid ${C.green}44`, borderRadius:10, padding:"5px 12px", fontSize:11, color:C.green, fontWeight:800 }}>✅ DONE</div>
          : <div style={{ background:open?C.purple:"transparent", border:`1.5px solid ${C.purple}44`, borderRadius:10, padding:"5px 12px", fontSize:13, fontWeight:800, color:open?"white":C.purple, transition:"all 0.2s" }}>{open?"▲":"▼"}</div>
        }
      </button>
      {open && (
        <div style={{ marginTop:10 }}>
          {/* Progress bar */}
          <div style={{ background:isDark()?"rgba(255,255,255,0.06)":"#ece8ff", borderRadius:8, height:7, overflow:"hidden", marginBottom:12 }}>
            <div style={{ width:`${(doneCnt/3)*100}%`, height:"100%",
              background:`linear-gradient(90deg,${C.cyan},${C.purple},${C.pink})`, borderRadius:8, transition:"width 0.6s ease",
              boxShadow:doneCnt===3?`0 0 10px ${C.purple}88`:"none" }}/>
          </div>
          {allDone ? (
            <div style={{ background:`linear-gradient(135deg,${C.green}18,${C.cyan}12)`, border:`2px solid ${C.green}44`,
              borderRadius:20, padding:"18px 20px", textAlign:"center" }}>
              <div style={{ fontSize:44, marginBottom:6 }}>🏆</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:13, color:C.green, fontWeight:900, marginBottom:4 }}>QUEST COMPLETE!</div>
              <div style={{ fontSize:12, color:C.dim }}>You earned all daily rewards. Come back tomorrow!</div>
            </div>
          ) : (
            <button onClick={onOpen}
              style={{ width:"100%", background:`linear-gradient(135deg,${C.purple}22,${C.cyan}14)`,
                border:`2px solid ${C.purple}55`, borderRadius:20, padding:"18px 20px",
                cursor:"pointer", textAlign:"left", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", right:-20, top:-20, width:100, height:100, borderRadius:"50%",
                background:`radial-gradient(circle,${C.purple}44,transparent 70%)`, pointerEvents:"none" }}/>
              <div style={{ display:"flex", alignItems:"center", gap:16, position:"relative", zIndex:1 }}>
                <div style={{ fontSize:48 }}>{doneCnt===0?"🚀":doneCnt===1?"⚡":"🔥"}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.purple, fontWeight:700, marginBottom:4 }}>
                    {doneCnt===0?"START TODAY'S QUEST":"CONTINUE QUEST"}
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {[
                      { label:"Do a Set",     done:todaySets>=1, color:C.cyan,   icon:"🧮" },
                      { label:"Word Problem", done:dqDone,       color:C.yellow, icon:"🌟" },
                      { label:"Brain Puzzle", done:dpDone,       color:C.purple, icon:"🧩" },
                    ].map((t,i)=>(
                      <div key={i} style={{ background:t.done?`${C.green}22`:`${t.color}18`,
                        border:`1px solid ${t.done?C.green+"55":t.color+"33"}`,
                        borderRadius:10, padding:"3px 9px", display:"flex", alignItems:"center", gap:4 }}>
                        <span style={{ fontSize:11 }}>{t.done?"✅":t.icon}</span>
                        <span style={{ fontSize:10, fontWeight:700, color:t.done?C.green:t.color }}>{t.label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:11, color:C.dim, marginTop:6 }}>
                    Total reward: <span style={{ color:C.yellow, fontWeight:800 }}>+275 XP</span> · <span style={{ color:C.orange, fontWeight:800 }}>+35 Coins</span>
                  </div>
                </div>
                <div style={{ fontSize:24, color:C.purple }}>›</div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function MyClassSection({ world: w, child, onWorld, pctDone }) {
  const [open, setOpen] = React.useState(true);
  return (
    <div style={{ position:"relative", zIndex:2, margin:"14px 18px 0" }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ width:"100%", background:isDark()?`linear-gradient(135deg,${w.color}18,${C.purple}0a)`:C.card, border:`1.5px solid ${w.color}${isDark()?"33":"44"}`, borderRadius:18, padding:"14px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left", boxShadow:`0 2px 10px ${w.color}10` }}>
        <div style={{ fontSize:26 }}>{w.planet}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:900, color:textColor() }}>My Class</div>
          <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{w.name} · {pctDone}% complete</div>
        </div>
        <div style={{ background:open?w.color:"transparent", border:`1.5px solid ${w.color}44`, borderRadius:10, padding:"5px 12px", fontSize:13, fontWeight:800, color:open?"white":w.color, transition:"all 0.2s" }}>{open?"▲":"▼"}</div>
      </button>
      {open && (
        <div style={{ marginTop:10 }}>
          <div onClick={()=>onWorld(w)} style={{ background:`linear-gradient(135deg,${w.color}22,${w.color}0a)`, border:`2px solid ${w.color}55`, borderRadius:22, padding:"18px", cursor:"pointer", display:"flex", alignItems:"center", gap:16, boxShadow:`0 0 30px ${w.glow}`, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", right:-10, top:-10, fontSize:80, opacity:0.12, animation:"floatUp 3s ease-in-out infinite", pointerEvents:"none" }}>{w.planet}</div>
            <div style={{ width:64, height:64, borderRadius:20, background:`${w.color}25`, border:`3px solid ${w.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, flexShrink:0 }}>{w.planet}</div>
            <div style={{ flex:1, position:"relative", zIndex:1 }}>
              <div style={{ fontSize:20, fontWeight:900, color:textColor() }}>{w.name}</div>
              <div style={{ fontSize:13, color:w.color, fontWeight:700, marginTop:2 }}>{w.world}</div>
              <div style={{ fontSize:12, color:C.dim, marginTop:4 }}>{(LESSONS[child.class_num]||LESSONS[1]).length} Lessons · {pctDone}% complete</div>
            </div>
            <div style={{ fontSize:32, color:w.color }}>›</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function QuickLaunch({ onAbacus, onGames, onOlympiad, onBazaar }) {
  const [open, setOpen] = React.useState(true);
  const items = [
    {i:"🧮",l:"Abacus",    sub:"Train your brain",  c:C.yellow,  a:onAbacus},
    {i:"🎮",l:"Games Hub", sub:"Fun challenges",     c:C.cyan,    a:onGames},
    {i:"🎓",l:"Olympiad",  sub:"Compete & win",      c:C.purple,  a:onOlympiad},
    {i:"🛒",l:"Bazaar",    sub:"Real-life maths 🆕", c:"#f97316", a:onBazaar},
  ];
  return (
    <div style={{ position:"relative", zIndex:2, margin:"14px 18px 0" }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ width:"100%", background:isDark()?`linear-gradient(135deg,${C.cyan}18,${C.yellow}0a)`:C.card, border:`1.5px solid ${C.cyan}${isDark()?"33":"44"}`, borderRadius:18, padding:"14px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left", boxShadow:`0 2px 10px ${C.cyan}10` }}>
        <div style={{ fontSize:26 }}>⚡</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:900, color:textColor() }}>Quick Launch</div>
          <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>Abacus · Games · Olympiad · Bazaar</div>
        </div>
        <div style={{ background:open?C.cyan:"transparent", border:`1.5px solid ${C.cyan}44`, borderRadius:10, padding:"5px 12px", fontSize:13, fontWeight:800, color:open?"white":C.cyan, transition:"all 0.2s" }}>{open?"▲":"▼"}</div>
      </button>
      {open && (
        <div style={{ marginTop:10, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {items.map((n,i)=>(
            <button key={i} onClick={n.a} style={{ background:`${n.c}14`, border:`2px solid ${n.c}33`, borderRadius:18, padding:"16px 14px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ fontSize:32, flexShrink:0 }}>{n.i}</div>
              <div><div style={{ fontSize:16, fontWeight:800, color:textColor() }}>{n.l}</div><div style={{ fontSize:11, color:n.c, marginTop:2, fontWeight:600 }}>{n.sub}</div></div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  🛒  BAZAAR MATHS — Phase 3·4·5: Customise · Badges · Social
// ═══════════════════════════════════════════════════════════════════════

// ─── Market catalogue ────────────────────────────────────────────────
export function WorldsSection({ WORLDS, child, onWorld }) {
  const [open, setOpen] = React.useState(false);
  const others = WORLDS.filter(cw => cw.id !== parseInt(child.class_num||1));
  return (
    <div style={{ position:"relative", zIndex:2, margin:"14px 18px 0" }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ width:"100%", background:isDark()?`linear-gradient(135deg,${C.purple}18,${C.cyan}0a)`:C.card, border:`1.5px solid ${C.purple}${isDark()?"33":"44"}`, borderRadius:18, padding:"14px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left", boxShadow:`0 2px 10px ${C.purple}10` }}>
        <div style={{ fontSize:26 }}>🌌</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:900, color:textColor() }}>Explore Other Worlds</div>
          <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{others.length} worlds · Unlock any lesson for ₹300</div>
        </div>
        <div style={{ background:open?C.purple:"transparent", border:`1.5px solid ${C.purple}44`, borderRadius:10, padding:"5px 12px", fontSize:13, fontWeight:800, color:open?"white":C.purple, transition:"all 0.2s" }}>{open?"▲":"▼"}</div>
      </button>
      {open && (
        <div style={{ marginTop:10, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {others.map(cw=>(
            <button key={cw.id} onClick={()=>onWorld(cw)}
              style={{ background:isDark()?`linear-gradient(135deg,${cw.color}14,rgba(10,10,28,0.9))`:C.card, border:`2px solid ${cw.color}44`, borderRadius:18, padding:"16px 12px", cursor:"pointer", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:4, boxShadow:`0 2px 14px ${cw.color}18`, transition:"all 0.2s" }}>
              <div style={{ fontSize:34, marginBottom:2 }}>{cw.planet}</div>
              <div style={{ fontSize:13, fontWeight:900, color:cw.color }}>{cw.name}</div>
              <div style={{ fontSize:11, color:C.dim }}>{cw.world}</div>
              <div style={{ background:`${C.orange}22`, border:`1px solid ${C.orange}33`, borderRadius:10, padding:"3px 10px", marginTop:4 }}>
                <span style={{ fontSize:11, color:C.orange, fontWeight:800 }}>🔒 ₹300/lesson</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Home({ child, onWorld, onAbacus, onGames, onOlympiad, onParent, onBazaar, onLogout, onFeedback, onRate, onSettings, isLessonPurchased, onShop, onBadges, onCharacter, onThemeChange }) {
  const [showTutorial, setShowTutorial] = useState(()=>!localStorage.getItem('mm_tutorial_done'));
  const doneTutorial = () => { localStorage.setItem('mm_tutorial_done','1'); setShowTutorial(false); };
  const [showWelcome, setShowWelcome] = useState(()=>!localStorage.getItem('mm_welcomed_'+(child?.id||"")));
  const dismissWelcome = () => { localStorage.setItem('mm_welcomed_'+(child?.id||""),'1'); setShowWelcome(false); };
  const [progress,   setProgress]   = useState([]);
  const [showDQ,         setShowDQ]         = useState(false);
  const [showPuzzle,     setShowPuzzle]     = useState(false);
  const [showDailyQuest, setShowDailyQuest] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [mascotMsg,  setMascotMsg]  = useState(0);
  const w = WORLDS.find(x=>x.id===parseInt(child.class_num||1)) || WORLDS[0];
  const MASCOT_MSGS = [
    `Hi ${child.name?.split(" ")[0]}! Ready to blast off? 🚀`,
    "You're a Math Superstar! ⭐ Keep going!",
    "Every problem you solve makes you smarter! 💡",
    "Don't forget your Daily Challenge today! 🎯",
    `${child.streak_days||0} day streak! You're on fire! 🔥`,
    "Math is your superpower! 🦸 Show the galaxy!",
  ];
  useEffect(() => {
    if (!localStorage.getItem("mm_rated")) {
      const sessions = parseInt(localStorage.getItem("mm_sessions")||"0") + 1;
      localStorage.setItem("mm_sessions", String(sessions));
      if (sessions === 3) setTimeout(() => setShowRating(true), 5000);
    }
    db.track("app_open", child.id, null, { session: 1, class_num: child.class_num });
  }, [child.id]);
  useEffect(() => {
    db.getProgress(child.id).then(({ data }) => setProgress(data || []));
    const t = setInterval(() => setMascotMsg(m => (m+1) % 6), 4000);
    return () => clearInterval(t);
  }, [child.id]);
  const myLessons  = LESSONS[child.class_num] || LESSONS[1];
  const totalStars = progress.reduce((s,p)=>s+(p.stars_earned||0),0);
  const todayStr   = new Date().toDateString();
  const todaySets  = progress.filter(p=>p.completed_at&&new Date(p.completed_at).toDateString()===todayStr).length;
  const totalSets  = myLessons.length*20;
  const doneSets   = myLessons.reduce((s,l)=>s+Array.from({length:20},(_,i)=>i).filter(i=>progress.some(p=>p.lesson_id===l.id+"_s"+i&&(p.stars_earned||0)>=1)).length,0);
  const pctDone    = totalSets>0?Math.round((doneSets/totalSets)*100):0;
  const todayKey   = new Date().toISOString().slice(0,10);
  const dqDone     = !!localStorage.getItem(`dq_done_${child.id}_${todayKey}`);
  const dpDone     = !!localStorage.getItem(`dp_done_${child.id}_${todayKey}`);
  const levelEmoji = ["🌱","🌟","💫","🚀","🏆","👑"][Math.min(Math.floor((child.level||1)/2),5)];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Baloo 2','Nunito',sans-serif", paddingBottom:88, position:"relative", overflowX:"hidden" }}>
      <Starfield n={50}/>
      {onFeedback && <SOSButton onClick={() => onFeedback()}/>}
      {showTutorial && <Tutorial onDone={doneTutorial}/>}
      {showDQ     && <DailyQuiz   child={child} onClose={() => setShowDQ(false)}/>}
      {showPuzzle && <DailyPuzzle child={child} onClose={() => setShowPuzzle(false)}/>}
      {showDailyQuest && (
        <DailyQuestHub
          child={child}
          dqDone={dqDone} dpDone={dpDone} setDone={todaySets>=1}
          onWorld={onWorld} worldW={w}
          onClose={() => setShowDailyQuest(false)}
        />
      )}
      {showRating && <RatingPrompt child={child} onClose={() => setShowRating(false)}/>}

      {showWelcome && (
        <div onClick={dismissWelcome} style={{ position:"fixed", inset:0, zIndex:150, display:"flex", alignItems:"center", justifyContent:"center", background:isDark()?"rgba(4,4,15,0.92)":"rgba(240,244,255,0.95)", backdropFilter:"blur(10px)", padding:"0 20px" }}>
          <div style={{ background:`linear-gradient(135deg,${C.purple}28,${C.cyan}18)`, border:`2px solid ${C.cyan}${isDark()?"55":"88"}`, borderRadius:28, padding:"36px 28px", maxWidth:380, width:"100%", textAlign:"center", boxShadow:`0 0 80px ${C.cyan}33`, animation:"popIn 0.5s ease" }}>
            <div style={{ fontSize:80, marginBottom:10, animation:"floatUp 2s ease-in-out infinite" }}>{child.avatar||"🧒"}</div>
            <div style={{ fontSize:13, color:C.cyan, letterSpacing:4, marginBottom:6, fontWeight:700 }}>WELCOME TO</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:26, color:textColor(), fontWeight:900, marginBottom:4 }}>MathMagic</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.yellow, marginBottom:20 }}>SPACE ACADEMY 🚀</div>
            <div style={{ fontSize:20, color:textColor(), fontWeight:800, marginBottom:8 }}>Hello, {child.name}! 👋</div>
            <div style={{ fontSize:15, color:C.dim, lineHeight:1.7, marginBottom:24 }}>Your math adventure awaits!<br/>Let's explore the galaxy together! 🌌</div>
            <button onClick={dismissWelcome} style={{ background:`linear-gradient(135deg,${C.cyan},${C.purple})`, border:"none", borderRadius:20, padding:"16px 40px", color:"white", fontFamily:"'Baloo 2',sans-serif", fontSize:18, cursor:"pointer", fontWeight:800, boxShadow:`0 0 30px ${C.cyan}55` }}>🚀 LET'S GO!</button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div style={{ position:"relative", zIndex:2 }}>
        <div style={{ background:`linear-gradient(160deg,${w.color}${isDark()?"28":"18"} 0%,${C.purple}${isDark()?"18":"0f"} 50%,transparent 100%)`, padding:"20px 20px 16px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", right:-20, top:-20, fontSize:110, opacity:0.1, animation:"floatUp 4s ease-in-out infinite", pointerEvents:"none" }}>{w.planet}</div>
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <div style={{ position:"relative", flexShrink:0 }}>
                <div style={{ width:58, height:58, background:`linear-gradient(135deg,${w.color}44,${C.purple}44)`, borderRadius:20, border:`3px solid ${w.color}66`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, boxShadow:`0 0 22px ${w.color}44` }}>{child.avatar}</div>
                <div style={{ position:"absolute", bottom:-5, right:-5, background:C.yellow, borderRadius:10, padding:"2px 7px", fontSize:10, fontWeight:900, color:"#000", border:"2px solid "+C.bg }}>Lv{child.level||1}</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:21, fontWeight:900, color:textColor(), lineHeight:1.1 }}>Hey, {child.name?.split(" ")[0]}! {levelEmoji}</div>
                <div style={{ fontSize:13, color:w.color, fontWeight:700, marginTop:2 }}>{w.world} · Cadet</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {child.streak_days>0 && <div style={{ background:`${C.orange}22`, border:`1px solid ${C.orange}44`, borderRadius:12, padding:"5px 9px", textAlign:"center" }}><div style={{ fontSize:16 }}>🔥</div><div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color:C.orange, fontWeight:900 }}>{child.streak_days}</div></div>}
                <MuteBtn/>
                <button onClick={onLogout} style={{ background:`${C.pink}14`, border:`1px solid ${C.pink}44`, borderRadius:12, padding:"7px 11px", color:C.pink, fontSize:13, cursor:"pointer", fontWeight:700 }}>Exit</button>
              </div>
            </div>
            <XPBar xp={child.xp||0} level={child.level||1}/>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:12 }}>
              <div style={{ position:"relative", width:56, height:56, flexShrink:0 }}>
                <svg width="56" height="56" style={{ transform:"rotate(-90deg)" }}>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#ffffff10" strokeWidth="5"/>
                  <circle cx="28" cy="28" r="22" fill="none" stroke={w.color} strokeWidth="5"
                    strokeDasharray={`${2*Math.PI*22*pctDone/100} ${2*Math.PI*22}`} strokeLinecap="round"
                    style={{transition:"stroke-dasharray 1s ease"}}/>
                </svg>
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:textColor() }}>{pctDone}%</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:800, color:textColor() }}>Overall Progress</div>
                <div style={{ fontSize:12, color:C.dim }}>{doneSets} of {totalSets} sets done</div>
              </div>
              <div style={{ textAlign:"right" }}><div style={{ fontSize:24, fontWeight:900, color:C.yellow }}>{totalStars}</div><div style={{ fontSize:10, color:C.dim }}>Stars ⭐</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Cosmo Mascot */}
      <div style={{ position:"relative", zIndex:2, margin:"14px 18px 0" }}>
        <div style={{ background:`linear-gradient(135deg,${C.purple}${isDark()?"22":"14"},${C.cyan}${isDark()?"14":"0f"})`, color:textColor(), border:`1.5px solid ${C.cyan}33`, borderRadius:20, padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:36, animation:"floatUp 2.5s ease-in-out infinite", flexShrink:0 }}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:C.cyan, fontWeight:700, marginBottom:2 }}>COSMO SAYS</div>
            <div key={mascotMsg} style={{ fontSize:15, color:textColor(), fontWeight:700, animation:"slideUp 0.4s ease" }}>{MASCOT_MSGS[mascotMsg]}</div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ position:"relative", zIndex:2, display:"flex", gap:10, padding:"12px 18px 0" }}>
        {[
          {e:"⭐",v:totalStars,      l:"Stars",   c:C.yellow},
          {e:"🪙",v:child.coins||0,  l:"Coins",   c:C.orange},
          {e:"💎",v:child.gems||0,   l:"Gems",    c:C.purple},
          {e:"🗓️",v:todaySets,       l:"Today",   c:C.cyan},
        ].map((s,i)=>(
          <div key={i} style={{ flex:1, background:C.card, borderRadius:16, padding:"10px 6px", textAlign:"center", border:`1.5px solid ${s.c}${isDark()?"28":"44"}` }}>
            <div style={{ fontSize:20 }}>{s.e}</div>
            <div style={{ fontSize:18, fontWeight:900, color:textColor() }}>{s.v}</div>
            <div style={{ fontSize:10, color:C.dim, fontWeight:700 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── Parent Dashboard — prominent card ───────────────────────── */}
      <div style={{ position:"relative", zIndex:2, margin:"12px 18px 0" }}>
        <button onClick={onParent}
          style={{ width:"100%", background:isDark()?`linear-gradient(135deg,${C.pink}18,${C.purple}0a)`:C.card, border:`2px solid ${C.pink}44`, borderRadius:18, padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, textAlign:"left", boxShadow:`0 2px 14px ${C.pink}14`, transition:"all 0.2s" }}>
          <div style={{ width:50, height:50, borderRadius:16, background:`linear-gradient(135deg,${C.pink},${C.purple})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0, boxShadow:`0 4px 14px ${C.pink}44` }}>📊</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:900, color:textColor() }}>Parent Dashboard</div>
            <div style={{ fontSize:11, color:C.dim, marginTop:2, lineHeight:1.5 }}>View progress · Strengths · Insights · Reports</div>
          </div>
          <div style={{ fontSize:22, color:C.pink }}>›</div>
        </button>
      </div>

      {/* ── Daily Quest ─────────────────────────────────────────────── */}
      <DailyQuestSection
        dqDone={dqDone} dpDone={dpDone} todaySets={todaySets}
        onOpen={()=>setShowDailyQuest(true)}
      />

      {/* Quick Launch */}
      <QuickLaunch onAbacus={onAbacus} onGames={onGames} onOlympiad={onOlympiad} onBazaar={onBazaar}/>

      {/* Shop · Badges · Character */}
      {(onShop || onBadges || onCharacter) && (
        <div style={{ position:"relative", zIndex:2, display:"flex", gap:10, padding:"12px 18px 0" }}>
          {[{icon:"🛒",label:"Shop",    act:onShop,      color:C.green},
            {icon:"🏅",label:"Badges",  act:onBadges,    color:C.yellow},
            {icon:"🎭",label:"Me",      act:onCharacter, color:C.purple},
          ].map((b,i)=> b.act ? (
            <button key={i} onClick={b.act}
              style={{ flex:1, background:C.card, border:`2px solid ${b.color}44`, borderRadius:18,
                padding:"12px 6px", cursor:"pointer", textAlign:"center",
                boxShadow:`0 2px 10px ${b.color}18`, transition:"all 0.2s" }}>
              <div style={{ fontSize:24, marginBottom:4 }}>{b.icon}</div>
              <div style={{ fontSize:11, fontWeight:800, color:textColor() }}>{b.label}</div>
            </button>
          ) : null)}
        </div>
      )}

      {/* My Class */}
      <MyClassSection world={w} child={child} onWorld={onWorld} pctDone={pctDone}/>

      {/* Other Worlds — collapsible */}
      <WorldsSection WORLDS={WORLDS} child={child} onWorld={onWorld}/>

      {/* Progress Grid */}
      <div style={{ position:"relative", zIndex:2, margin:"14px 18px 14px" }}>
        <ProgressGrid lessons={LESSONS[child.class_num]||LESSONS[1]} progress={progress}/>
      </div>

      {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:10, background:isDark()?"rgba(4,4,15,0.97)":"rgba(255,255,255,0.97)", backdropFilter:"blur(20px)", borderTop:`1px solid ${C.purple}33`, padding:"10px 14px 14px", display:"flex", justifyContent:"space-around" }}>
        {[
          {icon:"🏠",label:"Home",    act:null,       active:true},
          {icon:"🎮",label:"Games",   act:onGames},
          {icon:"🧮",label:"Abacus",  act:onAbacus},
          {icon:"🎓",label:"Exams",   act:onOlympiad},
          {icon:"⚙️",label:"Settings",act:()=>onSettings&&onSettings()},
          {icon:"📣",label:"Report",  act:onFeedback},
        ].map((n,i)=>(
          <button key={i} onClick={n.act||undefined} style={{ background:"none", border:"none", cursor:n.act?"pointer":"default", display:"flex", flexDirection:"column", alignItems:"center", gap:2, color:n.active?C.cyan:C.dim }}>
            <div style={{ fontSize:22 }}>{n.icon}</div>
            <div style={{ fontSize:9, fontFamily:"'Orbitron',sans-serif" }}>{n.label}</div>
            {n.active&&<div style={{ width:5, height:5, borderRadius:"50%", background:C.cyan, boxShadow:`0 0 6px ${C.cyan}` }}/>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Lessons ───────────────────────────────────────────────────────────
