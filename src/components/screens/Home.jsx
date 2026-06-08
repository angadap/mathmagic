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
  const [cur, setCur] = useState(localStorage.getItem("mm_theme")||"midnight");
  const themes = Object.entries(THEMES);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"white", borderRadius:"20px 20px 0 0", padding:"20px 18px 32px", width:"100%", maxWidth:480, animation:"slideUp 0.25s ease", boxShadow:"0 -4px 30px rgba(91,79,232,0.12)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"#5B4FE8", marginBottom:16, textAlign:"center", fontWeight:800 }}>🎨 CHOOSE THEME</div>
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
        <button onClick={onClose} style={{ marginTop:14, width:"100%", background:"none", border:"1px solid #9890C444", borderRadius:10, padding:"10px", color:"#9890C4", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13 }}>CLOSE</button>
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
        style={{ width:"100%", background:"white", border:"1.5px solid #9B59F522", borderRadius:28, padding:16, cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left", boxShadow:"0 8px 30px #9B59F528, inset 0 1px 0 rgba(255,255,255,0.8)" }}>
        <div style={{ fontSize:26 }}>🎯</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:900, color:"#1A1040" }}>Daily Quest</div>
          <div style={{ fontSize:11, color:"#9890C4", marginTop:2 }}>{doneCnt}/3 tasks done today</div>
        </div>
        {allDone
          ? <div style={{ background:"#2ECC9A22", border:"1px solid #2ECC9A44", borderRadius:10, padding:"5px 12px", fontSize:11, color:"#2ECC9A", fontWeight:800 }}>✅ DONE</div>
          : <div style={{ background:open?"#9B59F5":"transparent", border:"1.5px solid #9B59F544", borderRadius:10, padding:"5px 12px", fontSize:13, fontWeight:800, color:open?"white":"#9B59F5", transition:"all 0.2s" }}>{open?"▲":"▼"}</div>
        }
      </button>
      {open && (
        <div style={{ marginTop:10 }}>
          {/* Progress bar */}
          <div style={{ background:"#F0ECFF", borderRadius:8, height:7, overflow:"hidden", marginBottom:12 }}>
            <div style={{ width:`${(doneCnt/3)*100}%`, height:"100%",
              background:"linear-gradient(90deg,#5B4FE8,#9B59F5,#FF6B6B)", borderRadius:8, transition:"width 0.6s ease",
              boxShadow:doneCnt===3?"0 0 10px #9B59F588":"none" }}/>
          </div>
          {allDone ? (
            <div style={{ background:"linear-gradient(135deg,#2ECC9A18,#4BBDF512)", border:"2px solid #2ECC9A44",
              borderRadius:20, padding:"18px 20px", textAlign:"center" }}>
              <div style={{ fontSize:44, marginBottom:6 }}>🏆</div>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:13, color:"#2ECC9A", fontWeight:900, marginBottom:4 }}>QUEST COMPLETE!</div>
              <div style={{ fontSize:12, color:"#9890C4" }}>You earned all daily rewards. Come back tomorrow!</div>
            </div>
          ) : (
            <button onClick={onOpen}
              style={{ width:"100%", background:"linear-gradient(135deg,#9B59F522,#4BBDF514)",
                border:"2px solid #9B59F555", borderRadius:20, padding:"18px 20px",
                cursor:"pointer", textAlign:"left", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", right:-20, top:-20, width:100, height:100, borderRadius:"50%",
                background:"radial-gradient(circle,#9B59F544,transparent 70%)", pointerEvents:"none" }}/>
              <div style={{ display:"flex", alignItems:"center", gap:16, position:"relative", zIndex:1 }}>
                <div style={{ fontSize:48 }}>{doneCnt===0?"🚀":doneCnt===1?"⚡":"🔥"}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"#9B59F5", fontWeight:800, marginBottom:4 }}>
                    {doneCnt===0?"START TODAY'S QUEST":"CONTINUE QUEST"}
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {[
                      { label:"Do a Set",     done:todaySets>=1, color:"#4BBDF5", icon:"🧮" },
                      { label:"Word Problem", done:dqDone,       color:"#FFC847", icon:"🌟" },
                      { label:"Brain Puzzle", done:dpDone,       color:"#9B59F5", icon:"🧩" },
                    ].map((t,i)=>(
                      <div key={i} style={{ background:t.done?`${t.color}14`:"#F0ECFF",
                        border:`1px solid ${t.done?t.color+"40":"rgba(91,79,232,0.10)"}`,
                        borderRadius:10, padding:"3px 9px", display:"flex", alignItems:"center", gap:4 }}>
                        <span style={{ fontSize:11 }}>{t.done?"✅":t.icon}</span>
                        <span style={{ fontSize:10, fontWeight:700, color:t.color }}>{t.label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:11, color:"#9890C4", marginTop:6 }}>
                    Total reward: <span style={{ color:"#FFC847", fontWeight:800 }}>+275 XP</span> · <span style={{ color:"#FF6B6B", fontWeight:800 }}>+35 Coins</span>
                  </div>
                </div>
                <div style={{ fontSize:24, color:"#9B59F5" }}>›</div>
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
        style={{ width:"100%", background:"white", border:`1.5px solid ${w.color}30`, borderRadius:28, padding:"14px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left", boxShadow:`0 8px 30px ${w.color}20, inset 0 1px 0 rgba(255,255,255,0.8)` }}>
        <div style={{ fontSize:26 }}>{w.planet}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:900, color:"#1A1040" }}>My Class</div>
          <div style={{ fontSize:11, color:"#9890C4", marginTop:2 }}>{w.name} · {pctDone}% complete</div>
        </div>
        <div style={{ background:open?w.color:"transparent", border:`1.5px solid ${w.color}44`, borderRadius:10, padding:"5px 12px", fontSize:13, fontWeight:800, color:open?"white":w.color, transition:"all 0.2s" }}>{open?"▲":"▼"}</div>
      </button>
      {open && (
        <div style={{ marginTop:10 }}>
          <div onClick={()=>onWorld(w)} style={{ background:"white", border:"2px solid #9B59F530", borderRadius:28, padding:16, cursor:"pointer", display:"flex", alignItems:"center", gap:16, boxShadow:"0 8px 30px #9B59F528, inset 0 1px 0 rgba(255,255,255,0.8)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", right:-10, top:-10, fontSize:80, opacity:0.12, animation:"floatUp 3s ease-in-out infinite", pointerEvents:"none" }}>{w.planet}</div>
            <div style={{ width:58, height:58, borderRadius:14, background:`${w.color}25`, border:`2px solid ${w.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, flexShrink:0 }}>{w.planet}</div>
            <div style={{ flex:1, position:"relative", zIndex:1 }}>
              <div style={{ fontSize:18, fontWeight:900, color:"#1A1040" }}>{w.name}</div>
              <div style={{ fontSize:13, color:w.color, fontWeight:700, marginTop:2 }}>{w.world}</div>
              <div style={{ fontSize:12, color:"#9890C4", marginTop:4 }}>{(LESSONS[child.class_num]||LESSONS[1]).length} Lessons · {pctDone}% complete</div>
              <div style={{ background:"#F0ECFF", borderRadius:999, height:5, overflow:"hidden", marginTop:8 }}>
                <div style={{ width:`${pctDone}%`, height:"100%", background:"linear-gradient(90deg,#9B59F5,#4BBDF5)", borderRadius:999, transition:"width 1s ease" }}/>
              </div>
            </div>
            <div style={{ fontSize:24, color:"#9B59F5" }}>›</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function QuickLaunch({ onAbacus, onGames, onOlympiad, onBazaar }) {
  const [open, setOpen] = React.useState(true);
  const items = [
    {i:"🧮",l:"Abacus",    sub:"Train your brain",  c:"#FFC847",  a:onAbacus},
    {i:"🎮",l:"Games Hub", sub:"Fun challenges",     c:"#4BBDF5",  a:onGames},
    {i:"🎓",l:"Olympiad",  sub:"Compete & win",      c:"#9B59F5",  a:onOlympiad},
    {i:"🛒",l:"Bazaar",    sub:"Real-life maths 🆕", c:"#f97316", a:onBazaar},
  ];
  return (
    <div style={{ position:"relative", zIndex:2, margin:"14px 18px 0" }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ width:"100%", background:"white", border:"1.5px solid #4BBDF522", borderRadius:28, padding:"14px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left", boxShadow:"0 8px 30px #4BBDF528, inset 0 1px 0 rgba(255,255,255,0.8)" }}>
        <div style={{ fontSize:26 }}>⚡</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:900, color:"#1A1040" }}>Quick Launch</div>
          <div style={{ fontSize:11, color:"#9890C4", marginTop:2 }}>Abacus · Games · Olympiad · Bazaar</div>
        </div>
        <div style={{ background:open?"#4BBDF5":"transparent", border:"1.5px solid #4BBDF544", borderRadius:10, padding:"5px 12px", fontSize:13, fontWeight:800, color:open?"white":"#4BBDF5", transition:"all 0.2s" }}>{open?"▲":"▼"}</div>
      </button>
      {open && (
        <div style={{ marginTop:10, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {items.map((n,i)=>(
            <button key={i} onClick={n.a} style={{ background:`${n.c}10`, border:`1.5px solid ${n.c}25`, borderRadius:20, padding:"14px 12px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:12, boxShadow:`0 4px 12px ${n.c}30, 0 2px 6px ${n.c}20` }}>
              <div style={{ fontSize:26, flexShrink:0 }}>{n.i}</div>
              <div><div style={{ fontSize:13, fontWeight:800, color:"#1A1040" }}>{n.l}</div><div style={{ fontSize:10, color:n.c, marginTop:2, fontWeight:700 }}>{n.sub}</div></div>
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
        style={{ width:"100%", background:"white", border:"1.5px solid #9B59F522", borderRadius:28, padding:"14px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left", boxShadow:"0 8px 30px #9B59F528, inset 0 1px 0 rgba(255,255,255,0.8)" }}>
        <div style={{ fontSize:26 }}>🌌</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:900, color:"#1A1040" }}>Explore Other Worlds</div>
          <div style={{ fontSize:11, color:"#9890C4", marginTop:2 }}>{others.length} worlds · Unlock any lesson for ₹300</div>
        </div>
        <div style={{ background:open?"#9B59F5":"transparent", border:"1.5px solid #9B59F544", borderRadius:10, padding:"5px 12px", fontSize:13, fontWeight:800, color:open?"white":"#9B59F5", transition:"all 0.2s" }}>{open?"▲":"▼"}</div>
      </button>
      {open && (
        <div style={{ marginTop:10, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {others.map(cw=>(
            <button key={cw.id} onClick={()=>onWorld(cw)}
              style={{ background:"white", border:`2px solid ${cw.color}30`, borderRadius:20, padding:"16px 12px", cursor:"pointer", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:4, boxShadow:`0 4px 14px ${cw.color}20, inset 0 1px 0 rgba(255,255,255,0.8)`, transition:"all 0.2s" }}>
              <div style={{ fontSize:34, marginBottom:2 }}>{cw.planet}</div>
              <div style={{ fontSize:13, fontWeight:900, color:cw.color }}>{cw.name}</div>
              <div style={{ fontSize:11, color:"#9890C4" }}>{cw.world}</div>
              <div style={{ background:"#FF6B6B12", border:"1px solid #FF6B6B30", borderRadius:999, padding:"3px 10px", marginTop:4 }}>
                <span style={{ fontSize:11, color:"#FF6B6B", fontWeight:800 }}>🔒 ₹300/lesson</span>
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
    <div style={{ minHeight:"100vh", background:"#FAFBFF", fontFamily:"'Baloo 2','Nunito',sans-serif", paddingBottom:88, position:"relative", overflowX:"hidden" }}>
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
        <div onClick={dismissWelcome} style={{ position:"fixed", inset:0, zIndex:150, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(91,79,232,0.18)", backdropFilter:"blur(10px)", padding:"0 20px" }}>
          <div style={{ background:"white", border:"2px solid #4BBDF544", borderRadius:28, padding:"36px 28px", maxWidth:380, width:"100%", textAlign:"center", boxShadow:"0 8px 40px #5B4FE828, inset 0 1px 0 rgba(255,255,255,0.8)", animation:"mmPop 0.4s ease" }}>
            <div style={{ fontSize:80, marginBottom:10, animation:"mmFloat 2s ease-in-out infinite" }}>{child.avatar||"🧒"}</div>
            <div style={{ fontSize:13, color:"#4BBDF5", letterSpacing:4, marginBottom:6, fontWeight:800 }}>WELCOME TO</div>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:26, color:"#1A1040", fontWeight:900, marginBottom:4 }}>MathMagic</div>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:14, color:"#FFC847", marginBottom:20 }}>SPACE ACADEMY 🚀</div>
            <div style={{ fontSize:20, color:"#1A1040", fontWeight:800, marginBottom:8 }}>Hello, {child.name}! 👋</div>
            <div style={{ fontSize:15, color:"#9890C4", lineHeight:1.7, marginBottom:24 }}>Your math adventure awaits!<br/>Let's explore the galaxy together! 🌌</div>
            <button onClick={dismissWelcome} style={{ background:"linear-gradient(155deg,#4BBDF5EE,#5B4FE8CC)", border:"none", borderRadius:20, padding:"16px 40px", color:"white", fontFamily:"'Nunito',sans-serif", fontSize:18, cursor:"pointer", fontWeight:900, boxShadow:"0 4px 0 #5B4FE8CC, 0 6px 20px #5B4FE845" }}>🚀 LET'S GO!</button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div style={{ position:"relative", zIndex:2 }}>
        <div style={{ background:"linear-gradient(160deg,#5B4FE818 0%,#9B59F512 50%,transparent 100%)", padding:"24px 20px 20px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", right:-20, top:-20, fontSize:110, opacity:0.1, animation:"floatUp 4s ease-in-out infinite", pointerEvents:"none" }}>{w.planet}</div>
          <div style={{position:"absolute",top:-50,right:-40,width:160,height:160,borderRadius:"60% 40% 30% 70%/60% 30% 70% 40%",background:"radial-gradient(#9B59F540,#9B59F510)",animation:"mmWave 8s ease-in-out infinite",pointerEvents:"none",opacity:0.4}}/>
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <div style={{ position:"relative", width:64, height:64, flexShrink:0 }}>
                <div style={{ width:52, height:52, borderRadius:14, background:"linear-gradient(135deg,#9B59F522,#9B59F50a)", border:"2.5px solid #9B59F544", display:"flex", alignItems:"center", justifyContent:"center", fontSize:27, boxShadow:"0 0 20px #9B59F555" }}>{child.avatar}</div>
                <div style={{ position:"absolute", bottom:-4, right:-4, background:"linear-gradient(135deg,#FFC847,#FF6B6B)", borderRadius:999, padding:"1px 7px", fontSize:10, fontWeight:900, color:"white", border:"2px solid white" }}>Lv{child.level||1}</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:21, fontWeight:900, color:"#1A1040", lineHeight:1.1 }}>Hey, {child.name?.split(" ")[0]}! {levelEmoji}</div>
                <div style={{ fontSize:13, color:w.color, fontWeight:700, marginTop:2 }}>{w.world} · Cadet</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {child.streak_days>0 && <div style={{ background:"#FF6B6B15", border:"1.5px solid #FF6B6B30", borderRadius:14, padding:"6px 10px", textAlign:"center" }}><div style={{ fontSize:18 }}>🔥</div><div style={{ fontFamily:"'Fredoka One',cursive", fontSize:13, color:"#FF6B6B", fontWeight:900 }}>{child.streak_days}</div></div>}
                <MuteBtn/>
                <button onClick={onLogout} style={{ background:"#FF5FA014", border:"1px solid #FF5FA044", borderRadius:12, padding:"7px 11px", color:"#FF5FA0", fontSize:13, cursor:"pointer", fontWeight:700 }}>Exit</button>
              </div>
            </div>
            <XPBar xp={child.xp||0} level={child.level||1}/>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:12 }}>
              <div style={{ position:"relative", width:56, height:56, flexShrink:0 }}>
                <svg width="56" height="56" style={{ transform:"rotate(-90deg)" }}>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#9B59F520" strokeWidth="5"/>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#9B59F5" strokeWidth="5"
                    strokeDasharray={`${2*Math.PI*22*pctDone/100} ${2*Math.PI*22}`} strokeLinecap="round"
                    style={{transition:"stroke-dasharray 1s ease"}}/>
                </svg>
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#9B59F5" }}>{pctDone}%</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#1A1040" }}>Overall Progress</div>
                <div style={{ fontSize:12, color:"#9890C4" }}>{doneSets} of {totalSets} sets done</div>
              </div>
              <div style={{ textAlign:"right" }}><div style={{ fontSize:24, fontWeight:900, color:"#FFC847" }}>{totalStars}</div><div style={{ fontSize:10, color:"#9890C4" }}>Stars ⭐</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Cosmo Mascot */}
      <div style={{ position:"relative", zIndex:2, margin:"14px 18px 0" }}>
        <div style={{ background:"linear-gradient(135deg,#5B4FE812,#9B59F50a)", border:"1.5px solid #5B4FE820", borderRadius:20, padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:34, animation:"mmFloat 2.5s ease-in-out infinite", flexShrink:0 }}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:"#5B4FE8", fontWeight:800, letterSpacing:1, marginBottom:2 }}>COSMO SAYS</div>
            <div key={mascotMsg} style={{ fontSize:14, color:"#1A1040", fontWeight:700, animation:"slideUp 0.4s ease" }}>{MASCOT_MSGS[mascotMsg]}</div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ position:"relative", zIndex:2, display:"flex", gap:10, padding:"12px 18px 0" }}>
        {[
          {e:"⭐",v:totalStars,      l:"Stars",   c:"#FFC847"},
          {e:"🪙",v:child.coins||0,  l:"Coins",   c:"#FF6B6B"},
          {e:"💎",v:child.gems||0,   l:"Gems",    c:"#9B59F5"},
          {e:"🗓️",v:todaySets,       l:"Today",   c:"#4BBDF5"},
        ].map((s,i)=>(
          <div key={i} style={{ flex:1, background:"white", borderRadius:28, padding:"10px 6px", textAlign:"center", border:`1.5px solid ${s.c}22`, boxShadow:`0 8px 30px ${s.c}28, inset 0 1px 0 rgba(255,255,255,0.8)` }}>
            <div style={{ fontSize:20 }}>{s.e}</div>
            <div style={{ fontSize:16, fontWeight:900, color:"#1A1040" }}>{s.v}</div>
            <div style={{ fontSize:9, color:"#9890C4", fontWeight:700 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── Parent Dashboard — prominent card ───────────────────────── */}
      <div style={{ position:"relative", zIndex:2, margin:"12px 18px 0" }}>
        <button onClick={onParent}
          style={{ width:"100%", background:"white", border:"2px solid #FF5FA025", borderRadius:28, padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, textAlign:"left", boxShadow:"0 8px 30px #FF5FA020, inset 0 1px 0 rgba(255,255,255,0.8)", transition:"all 0.2s" }}>
          <div style={{ width:50, height:50, borderRadius:16, background:"linear-gradient(135deg,#FF5FA0,#9B59F5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0, boxShadow:"0 4px 14px #FF5FA044" }}>📊</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:900, color:"#1A1040" }}>Parent Dashboard</div>
            <div style={{ fontSize:11, color:"#9890C4", marginTop:2, lineHeight:1.5 }}>View progress · Strengths · Insights · Reports</div>
          </div>
          <div style={{ fontSize:22, color:"#FF5FA0" }}>›</div>
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
          {[{icon:"🛒",label:"Shop",    act:onShop,      color:"#2ECC9A"},
            {icon:"🏅",label:"Badges",  act:onBadges,    color:"#FFC847"},
            {icon:"🎭",label:"Me",      act:onCharacter, color:"#9B59F5"},
          ].map((b,i)=> b.act ? (
            <button key={i} onClick={b.act}
              style={{ flex:1, background:"white", border:`2px solid ${b.color}35`, borderRadius:20,
                padding:"12px 6px", cursor:"pointer", textAlign:"center",
                boxShadow:`0 4px 14px ${b.color}22, inset 0 1px 0 rgba(255,255,255,0.8)`, transition:"all 0.2s" }}>
              <div style={{ fontSize:24, marginBottom:4 }}>{b.icon}</div>
              <div style={{ fontSize:11, fontWeight:800, color:"#1A1040" }}>{b.label}</div>
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
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:10, background:"rgba(255,255,255,0.97)", backdropFilter:"blur(20px)", borderTop:"1.5px solid rgba(91,79,232,0.10)", padding:"10px 14px 14px", display:"flex", justifyContent:"space-around" }}>
        {[
          {icon:"🏠",label:"Home",    act:null,       active:true},
          {icon:"🎮",label:"Games",   act:onGames},
          {icon:"🧮",label:"Abacus",  act:onAbacus},
          {icon:"🎓",label:"Exams",   act:onOlympiad},
          {icon:"⚙️",label:"Settings",act:()=>onSettings&&onSettings()},
          {icon:"📣",label:"Report",  act:onFeedback},
        ].map((n,i)=>(
          <button key={i} onClick={n.act||undefined} style={{ background:"none", border:"none", cursor:n.act?"pointer":"default", display:"flex", flexDirection:"column", alignItems:"center", gap:2, color:n.active?"#4BBDF5":"#9890C4" }}>
            <div style={{ fontSize:22 }}>{n.icon}</div>
            <div style={{ fontSize:9, fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>{n.label}</div>
            {n.active&&<div style={{ width:5, height:5, borderRadius:"50%", background:"#4BBDF5", boxShadow:"0 0 6px #4BBDF5" }}/>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Lessons ───────────────────────────────────────────────────────────
