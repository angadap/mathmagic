// src/components/screens/Home.jsx — ThemeSelector, DailyQuestSection, QuickLaunch, WorldsSection, Home
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { C, updateC, THEMES, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, Card, BackBtn, XPBar } from '../ui/primitives.jsx';
import { Starfield, Confetti, Mascot, Tutorial, MuteBtn } from '../layout/layout.jsx';
import { WORLDS, LESSONS, BADGES } from '../../constants/gameData.js';
import { BOSSES as _BOSSES } from '../../constants/bossData.js';
const BOSS_MAP = _BOSSES || {};
import { DailyQuestHub, DailyQuiz, DailyPuzzle } from './Daily.jsx';
import { ProgressGrid, SOSButton, FABButton } from '../shared/shared.jsx';
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

export function QuickLaunch({ onAbacus, onGames, onOlympiad, onBazaar, child }) {
  const [open, setOpen] = React.useState(true);
  const classNum = parseInt(child?.class_num || 1);
  const showOlympiad = classNum >= 1 && classNum <= 5;
  const items = [
    {i:"🧮",l:"Abacus",    sub:"Train your brain",  c:"#FFC847",  a:onAbacus},
    {i:"🎮",l:"Games Hub", sub:"Fun challenges",     c:"#4BBDF5",  a:onGames},
    showOlympiad && {i:"🎓",l:"Olympiad",  sub:"Compete & win",      c:"#9B59F5",  a:onOlympiad},
    {i:"🛒",l:"Bazaar",    sub:"Real-life maths 🆕", c:"#f97316", a:onBazaar},
  ].filter(Boolean);
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

export function WorldsSection({ WORLDS, child, onWorld, forceOpen, onToggle }) {
  const [open, setOpen] = React.useState(false);
  const sectionRef = React.useRef(null);
  React.useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setTimeout(() => sectionRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 80);
    }
  }, [forceOpen]);
  const toggle = () => { setOpen(o=>!o); if (onToggle) onToggle(); };
  const others = WORLDS.filter(cw => cw.id !== parseInt(child.class_num||1));
  return (
    <div ref={sectionRef} style={{ position:"relative", zIndex:2, margin:"14px 18px 0" }}>
      <button onClick={toggle}
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

// ── ClassLeaderboard — bottom drawer for school students ─────────────────────
// Caches result in localStorage keyed by school+class+section.
// Refreshes once per day (midnight reset).
const LB_CACHE_KEY = (sid, cls, sec) => `mm_lb_${sid}_${cls}_${sec||"all"}`;

export function ClassLeaderboard({ child, onClose }) {
  const [data,    setData]    = useState(null);   // null=loading, []= empty, [...]= rows
  const [error,   setError]   = useState("");
  const [msLeft,  setMsLeft]  = useState(0);      // ms until midnight

  // ── Countdown to midnight ────────────────────────────────────────
  useEffect(() => {
    const calcMs = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      return midnight - now;
    };
    setMsLeft(calcMs());
    const t = setInterval(() => setMsLeft(calcMs()), 60000); // update every minute
    return () => clearInterval(t);
  }, []);

  const hh = String(Math.floor(msLeft / 3600000)).padStart(2, "0");
  const mm = String(Math.floor((msLeft % 3600000) / 60000)).padStart(2, "0");

  // ── Fetch / cache logic ─────────────────────────────────────────
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = LB_CACHE_KEY(child.school_id, child.class_num, child.section);
    let cached = null;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) cached = JSON.parse(raw);
    } catch(e) {}

    if (cached && cached.fetchedAt === today && Array.isArray(cached.data)) {
      setData(cached.data);
      return;
    }

    // Stale or missing — fetch fresh
    fetch("/api/school", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action:    "school_get_class_leaderboard",
        school_id: child.school_id,
        class_num: child.class_num,
        section:   child.section || "",
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setData(d.data);
          try { localStorage.setItem(cacheKey, JSON.stringify({ fetchedAt: today, data: d.data })); } catch(e) {}
        } else {
          setError(d.error || "Could not load rankings.");
          setData([]);
        }
      })
      .catch(() => { setError("Network error. Try again later."); setData([]); });
  }, [child.school_id, child.class_num, child.section]);

  // ── Class label ──────────────────────────────────────────────────
  const classLabel = (() => {
    const cn = parseInt(child.class_num);
    if (cn === 10) return "Nursery";
    if (cn === 11) return "Jr KG";
    if (cn === 12) return "Sr KG";
    return `Class ${cn}`;
  })();
  const secLabel = child.section ? ` · Section ${child.section}` : "";

  // ── Rank medal ───────────────────────────────────────────────────
  const medal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return <span style={{ fontSize:13, color:"#9890C4", fontWeight:800, minWidth:22, display:"inline-block", textAlign:"center" }}>{rank}</span>;
  };

  // ── My row (logged-in student) ───────────────────────────────────
  const myRow  = data ? data.find(r => r.id === child.id) : null;
  const inTop  = myRow && myRow.rank <= 10;
  const top10  = data ? data.slice(0, 10) : [];

  // ── Row renderer ─────────────────────────────────────────────────
  const renderRow = (row, isMe) => (
    <div key={row.id} style={{
      display:"flex", alignItems:"center", gap:10,
      padding:"10px 12px", borderRadius:16,
      background: isMe ? "linear-gradient(135deg,#5B4FE814,#9B59F510)" : "white",
      border: isMe ? "2px solid #5B4FE844" : "1.5px solid rgba(91,79,232,0.08)",
      boxShadow: isMe ? "0 0 14px #5B4FE822" : "0 2px 8px rgba(91,79,232,0.06)",
      marginBottom:8,
    }}>
      {/* Rank */}
      <div style={{ width:28, textAlign:"center", fontSize:18, flexShrink:0 }}>{medal(row.rank)}</div>
      {/* Avatar initial */}
      <div style={{ width:34, height:34, borderRadius:10, background:`${isMe?"#5B4FE8":"#9B59F5"}22`, border:`1.5px solid ${isMe?"#5B4FE8":"#9B59F5"}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:isMe?"#5B4FE8":"#9B59F5", flexShrink:0 }}>
        {row.name?.[0]?.toUpperCase() || "?"}
      </div>
      {/* Name */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:800, color:"#1A1040", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {isMe ? `${row.name} (You)` : row.name}
        </div>
        <div style={{ fontSize:10, color:"#9890C4", fontWeight:600 }}>Lv {row.level} · 🔥 {row.streak_days}d</div>
      </div>
      {/* Stats */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2, flexShrink:0 }}>
        <div style={{ fontSize:12, fontWeight:900, color:"#FFC847" }}>⭐ {(row.xp||0).toLocaleString()} XP</div>
        <div style={{ fontSize:11, color:"#4BBDF5", fontWeight:700 }}>🪙 {row.coins||0} · 📚 {row.sets_completed||0}</div>
      </div>
    </div>
  );

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:400, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={onClose}
    >
      <div
        style={{ background:"#FAFBFF", borderRadius:"24px 24px 0 0", width:"100%", maxWidth:480, maxHeight:"82vh", display:"flex", flexDirection:"column", animation:"slideUp 0.28s ease", boxShadow:"0 -4px 40px rgba(91,79,232,0.18)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding:"18px 18px 12px", borderBottom:"1.5px solid rgba(91,79,232,0.08)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:22 }}>🏆</span>
                <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:13, fontWeight:900, color:"#1A1040" }}>CLASS RANKINGS</span>
              </div>
              <div style={{ fontSize:12, color:"#9890C4", fontWeight:600, marginTop:2 }}>{classLabel}{secLabel}</div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(91,79,232,0.08)", border:"none", borderRadius:10, width:32, height:32, fontSize:16, cursor:"pointer", color:"#9890C4", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
          {/* Freshness bar */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#F0ECFF", borderRadius:12, padding:"7px 12px", marginTop:6 }}>
            <span style={{ fontSize:10 }}>🟢</span>
            <span style={{ fontSize:11, color:"#2ECC9A", fontWeight:700 }}>Updated today</span>
            <span style={{ fontSize:11, color:"#9890C4", marginLeft:"auto" }}>Next update in <strong style={{ color:"#5B4FE8" }}>{hh}:{mm}</strong></span>
          </div>
          {/* Ranked-by pill */}
          <div style={{ marginTop:8, display:"inline-flex", alignItems:"center", gap:6, background:"#FFC84718", border:"1.5px solid #FFC84730", borderRadius:999, padding:"4px 12px" }}>
            <span style={{ fontSize:11 }}>📊</span>
            <span style={{ fontSize:11, fontWeight:800, color:"#FFC847" }}>Ranked by XP · Top 10 in your class</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:"14px 16px 24px" }}>
          {/* Loading */}
          {data === null && (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <div style={{ fontSize:32, animation:"mmFloat 1.5s ease-in-out infinite", marginBottom:10 }}>🏆</div>
              <div style={{ color:"#9890C4", fontSize:13, fontWeight:700 }}>Loading rankings…</div>
            </div>
          )}

          {/* Error */}
          {data !== null && error && (
            <div style={{ background:"#FF6B6B14", border:"1.5px solid #FF6B6B30", borderRadius:14, padding:"14px 16px", textAlign:"center", color:"#FF6B6B", fontSize:13, fontWeight:700 }}>
              ⚠ {error}
            </div>
          )}

          {/* Empty */}
          {data !== null && !error && data.length === 0 && (
            <div style={{ textAlign:"center", padding:"28px 0", color:"#9890C4", fontSize:13 }}>
              No classmates found yet. Be the first on the board! 🚀
            </div>
          )}

          {/* Top 10 */}
          {data !== null && !error && data.length > 0 && (
            <>
              {top10.map(row => renderRow(row, row.id === child.id))}

              {/* Pinned self row — only if outside top 10 */}
              {myRow && !inTop && (
                <>
                  <div style={{ textAlign:"center", margin:"6px 0", fontSize:11, color:"#9890C4", fontWeight:700 }}>── Your Rank ──</div>
                  {renderRow(myRow, true)}
                </>
              )}

              {/* Not in list at all — show placeholder */}
              {!myRow && (
                <>
                  <div style={{ textAlign:"center", margin:"6px 0", fontSize:11, color:"#9890C4", fontWeight:700 }}>── Your Rank ──</div>
                  <div style={{ background:"linear-gradient(135deg,#5B4FE814,#9B59F510)", border:"2px solid #5B4FE844", borderRadius:16, padding:"12px 14px", textAlign:"center", color:"#9890C4", fontSize:13, fontWeight:700 }}>
                    Complete a lesson to appear on the board! 🚀
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── BrainSpark components (defined outside Home — no re-creation on render) ──

const CATEGORY_COLORS = {
  numbers:   { bg:"#FF5FA018", border:"#FF5FA040", label:"#FF5FA0", emoji:"🔢" },
  geometry:  { bg:"#4BBDF518", border:"#4BBDF540", label:"#4BBDF5", emoji:"📐" },
  history:   { bg:"#FFC84718", border:"#FFC84740", label:"#B8860B", emoji:"📜" },
  space:     { bg:"#9B59F518", border:"#9B59F540", label:"#9B59F5", emoji:"🚀" },
  patterns:  { bg:"#2ECC9A18", border:"#2ECC9A40", label:"#2ECC9A", emoji:"🔁" },
  paradoxes: { bg:"#FF814218", border:"#FF814240", label:"#FF8142", emoji:"🤯" },
  realworld: { bg:"#5B4FE818", border:"#5B4FE840", label:"#5B4FE8", emoji:"🌍" },
};
const DEFAULT_SPARK = { bg:"#FF5FA018", border:"#FF5FA040", label:"#FF5FA0", emoji:"✨" };

const COSMO_DURATION = 5000;   // 5s
const SPARK_DURATION  = 15000;  // 15s

function BrainSparkCard({ brainSpark, onOpen, mascotMsg }) {
  const clr = brainSpark ? (CATEGORY_COLORS[brainSpark.category] || DEFAULT_SPARK) : DEFAULT_SPARK;
  // phase: 'cosmo' or 'spark' — only alternates if brainSpark is loaded
  const [phase, setPhase] = useState('cosmo');
  const [visible, setVisible] = useState(true); // controls fade in/out

  useEffect(() => {
    if (!brainSpark) return; // no fact loaded — stay on Cosmo permanently
    let timer;
    const cycle = () => {
      // fade out, then swap content, then fade in
      setVisible(false);
      timer = setTimeout(() => {
        setPhase(p => {
          const next = p === 'cosmo' ? 'spark' : 'cosmo';
          const dur = next === 'spark' ? SPARK_DURATION : COSMO_DURATION;
          timer = setTimeout(cycle, dur);
          return next;
        });
        setVisible(true);
      }, 350); // fade duration
    };
    timer = setTimeout(cycle, phase === 'cosmo' ? COSMO_DURATION : SPARK_DURATION);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brainSpark]);

  const showSpark = brainSpark && phase === 'spark';
  const fadeStyle = { opacity: visible ? 1 : 0, transition: "opacity 0.35s ease" };

  return (
    <div style={{ position:"relative", borderRadius:20, overflow:"hidden", border: showSpark ? "1.5px solid #9B59F535" : "1.5px solid #5B4FE820", boxShadow: showSpark ? "0 0 0 1px #FF5FA020, 0 0 22px #9B59F524" : "none", transition:"border-color 0.4s ease, box-shadow 0.4s ease" }}>
      {/* Shimmer beam — only during BrainSpark phase */}
      {showSpark && (
        <div style={{ position:"absolute", top:0, bottom:0, width:"38%", background:"linear-gradient(105deg, transparent 15%, rgba(255,255,255,0.6) 50%, transparent 85%)", animation:"mmBsShimmer 3.4s ease-in-out infinite", animationDelay:"0.5s", pointerEvents:"none", zIndex:2 }}/>
      )}
      {!showSpark ? (
        // ── COSMO SAYS phase ──
        <div onClick={undefined} style={{ ...fadeStyle, background:"linear-gradient(135deg,#5B4FE812,#9B59F50a)", padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:34, animation:"mmFloat 2.5s ease-in-out infinite", flexShrink:0 }}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:"#5B4FE8", fontWeight:800, letterSpacing:1, marginBottom:2 }}>COSMO SAYS</div>
            <div key={mascotMsg} style={{ fontSize:14, color:"#1A1040", fontWeight:700 }}>{mascotMsg}</div>
          </div>
        </div>
      ) : (
        // ── BRAINSPARK phase (Option C shimmer) ──
        <div onClick={onOpen} style={{ ...fadeStyle, background:`linear-gradient(135deg,${clr.bg},#FF5FA008,#FAFAFF)`, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", position:"relative", zIndex:1 }}>
          <div style={{ fontSize:34, animation:"mmFloat 2.5s ease-in-out infinite", flexShrink:0 }}>{clr.emoji}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, color:clr.label, fontWeight:800, letterSpacing:1, marginBottom:2 }}>⚡ BRAINSPARK</div>
            <div style={{ fontSize:13, color:"#1A1040", fontWeight:700, lineHeight:1.35, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{brainSpark.fact}</div>
            <div style={{ marginTop:5, fontSize:10, color:clr.label, fontWeight:800 }}>Tap to explore ✦</div>
          </div>
        </div>
      )}
    </div>
  );
}

function BrainSparkPopup({ brainSpark, onClose }) {
  if (!brainSpark) return null;
  const clr = CATEGORY_COLORS[brainSpark.category] || DEFAULT_SPARK;
  return (
    <div
      onClick={onClose}
      style={{ position:"fixed", inset:0, background:"rgba(10,6,32,0.72)", backdropFilter:"blur(6px)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 20px", animation:"mmSlideUp 0.25s ease" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:"linear-gradient(160deg,#FFF9FF 0%,#FFF0FA 50%,#F0F4FF 100%)", borderRadius:28, padding:"28px 24px 24px", maxWidth:420, width:"100%", boxShadow:"0 24px 80px rgba(91,79,232,0.28), 0 0 0 1.5px #FF5FA030, inset 0 1px 0 rgba(255,255,255,0.9)", position:"relative", overflow:"hidden" }}
      >
        {/* candy blobs */}
        <div style={{ position:"absolute", top:-30, right:-30, width:100, height:100, borderRadius:"50%", background:`radial-gradient(${clr.bg},transparent)`, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-20, left:-20, width:80, height:80, borderRadius:"50%", background:"radial-gradient(#4BBDF520,transparent)", pointerEvents:"none" }}/>

        {/* header */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
          <div style={{ fontSize:40, animation:"mmPop 0.4s ease" }}>{clr.emoji}</div>
          <div>
            <div style={{ fontSize:11, color:clr.label, fontWeight:800, letterSpacing:1.5 }}>⚡ BRAINSPARK</div>
            <div style={{ fontSize:13, color:"#9890C4", fontWeight:700, textTransform:"capitalize" }}>{(brainSpark.category||"math").replace("realworld","Real World")}</div>
          </div>
          <button
            onClick={onClose}
            style={{ marginLeft:"auto", background:"#F0ECFF", border:"1.5px solid #9B59F530", borderRadius:999, width:32, height:32, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}
          >✕</button>
        </div>

        {/* decorative quote marks */}
        <div style={{ fontSize:60, color:"#FF5FA015", fontFamily:"Georgia,serif", lineHeight:0.6, marginBottom:4, userSelect:"none" }}>"</div>

        {/* fact */}
        <div style={{ fontSize:17, color:"#1A1040", fontWeight:800, lineHeight:1.55, padding:"0 4px", animation:"mmSlideUp 0.35s ease" }}>
          {brainSpark.fact}
        </div>

        <div style={{ fontSize:60, color:"#FF5FA015", fontFamily:"Georgia,serif", lineHeight:0.6, textAlign:"right", marginTop:4, userSelect:"none" }}>"</div>

        {/* footer */}
        <div style={{ marginTop:16, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <div style={{ background:`${clr.bg}`, border:`1.5px solid ${clr.border}`, borderRadius:999, padding:"4px 14px", fontSize:11, fontWeight:800, color:clr.label }}>
            🧠 Daily BrainSpark
          </div>
          <div style={{ fontSize:11, color:"#9890C4", fontWeight:700 }}>New fact tomorrow!</div>
        </div>
      </div>
    </div>
  );
}

function WordProblemToast({ onOpen, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <div onClick={onDismiss} style={{ position:'fixed', inset:0, zIndex:497, background:'transparent' }}/>
      <div style={{ position:'fixed', top:16, left:'50%', transform:'translateX(-50%)', zIndex:500, width:'90%', maxWidth:400, background:'white', borderRadius:18, boxShadow:'0 8px 32px rgba(91,79,232,0.18)', border:'1.5px solid #5B4FE820', display:'flex', alignItems:'center', gap:12, padding:'12px 14px', animation:'slideUp 0.3s ease' }}>
        <div style={{ fontSize:28, flexShrink:0 }}>🧩</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:800, color:'#1A1040' }}>Daily Word Problem!</div>
          <div style={{ fontSize:11, color:'#9890C4', marginTop:2 }}>Solve today's challenge</div>
        </div>
        <button onClick={onOpen} style={{ background:'linear-gradient(135deg,#5B4FE8,#9B59F5)', border:'none', borderRadius:10, padding:'8px 14px', color:'white', fontSize:12, fontWeight:800, cursor:'pointer', flexShrink:0 }}>Open</button>
      </div>
    </>
  );
}

function WordProblemModal({ child, onClose, onSolved }) {
  const [problem,       setProblem]       = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [result,        setResult]        = useState(null);
  const [xpAwarded,     setXpAwarded]     = useState(0);
  const [error,         setError]         = useState('');
  const [showHint,      setShowHint]      = useState(false);
  const [loading,       setLoading]       = useState(false);

  useEffect(() => {
    const payload = child.is_school_student
      ? { action:'get_daily_word_problem', student_id:child.id, school_code:child.school_code }
      : { action:'get_daily_word_problem', student_id:child.id, is_home_student:true };
    fetch('/api/school', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      .then(r => r.json())
      .then(d => { if (d.data) setProblem(d.data); else setError(d.error || 'Could not load word problem.'); })
      .catch(() => setError('Network error. Try again.'));
  }, []);

  const handleAnswer = () => {
    if (selectedIndex === null || loading) return;
    setLoading(true);
    const payload = child.is_school_student
      ? { action:'submit_word_problem_answer', student_id:child.id, school_code:child.school_code, problem_id:problem.id, answer_index:selectedIndex, attempt_number:attemptNumber }
      : { action:'submit_word_problem_answer', student_id:child.id, is_home_student:true, problem_id:problem.id, answer_index:selectedIndex, attempt_number:attemptNumber };
    fetch('/api/school', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      .then(r => r.json())
      .then(d => {
        setLoading(false);
        if (d.correct) {
          const today = new Date().toISOString().slice(0,10);
          localStorage.setItem(`mm_wp_solved_${child.id}_${today}`, '1');
          setResult('correct');
          setXpAwarded(d.xp_awarded || 0);
          onSolved(d.xp_awarded || 0);
        } else if (attemptNumber < 3) {
          setResult('wrong');
          setTimeout(() => { setResult(null); setSelectedIndex(null); setAttemptNumber(a => a+1); }, 800);
        } else {
          const today = new Date().toISOString().slice(0,10);
          localStorage.setItem(`mm_wp_solved_${child.id}_${today}`, '1');
          setProblem(p => ({ ...p, correct_index:d.correct_index, explanation:d.explanation }));
          setResult('revealed');
        }
      })
      .catch(() => { setLoading(false); setError('Network error. Try again.'); });
  };

  const optionLabel = ['A','B','C','D'];

  const getOptionStyle = (idx) => {
    const base = { width:'100%', borderRadius:14, padding:'12px 16px', cursor:result==='correct'||result==='revealed'?'default':'pointer', display:'flex', alignItems:'center', gap:10, fontSize:15, fontWeight:700, transition:'all 0.2s', marginBottom:8, textAlign:'left', border:'2px solid' };
    if (result==='correct' && idx===selectedIndex) return { ...base, background:'#2ECC9A18', borderColor:'#2ECC9A', color:'#2ECC9A' };
    if (result==='wrong'   && idx===selectedIndex) return { ...base, background:'#FF6B6B18', borderColor:'#FF6B6B', color:'#FF6B6B', animation:'shakeX 0.4s ease' };
    if (result==='revealed') {
      if (idx===problem.correct_index) return { ...base, background:'#2ECC9A18', borderColor:'#2ECC9A', color:'#2ECC9A' };
      return { ...base, background:'white', borderColor:'#E8E4FF', color:'#C0BAE0', opacity:0.5 };
    }
    if (idx===selectedIndex) return { ...base, background:'#5B4FE818', borderColor:'#5B4FE8', color:'#5B4FE8' };
    return { ...base, background:'white', borderColor:'#E8E4FF', color:'#1A1040' };
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:400, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:'#FAFBFF', borderRadius:'24px 24px 0 0', width:'100%', maxWidth:480, maxHeight:'85vh', display:'flex', flexDirection:'column', animation:'slideUp 0.28s ease', boxShadow:'0 -4px 40px rgba(91,79,232,0.18)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding:'18px 18px 12px', borderBottom:'1.5px solid rgba(91,79,232,0.08)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:22 }}>🧩</span>
                <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:13, fontWeight:900, color:'#1A1040' }}>DAILY WORD PROBLEM</span>
              </div>
              {problem && <div style={{ fontSize:12, color:'#9890C4', fontWeight:600, marginTop:2 }}>Day {problem.problem_num} of 100</div>}
            </div>
            <button onClick={onClose} style={{ background:'rgba(91,79,232,0.08)', border:'none', borderRadius:10, width:32, height:32, fontSize:16, cursor:'pointer', color:'#9890C4', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>
        </div>
        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 18px 28px', position:'relative' }}>
          {!problem && !error && (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div style={{ fontSize:36, animation:'mmFloat 1.5s ease-in-out infinite', marginBottom:10 }}>🧩</div>
              <div style={{ color:'#9890C4', fontSize:13, fontWeight:700 }}>Loading your problem…</div>
            </div>
          )}
          {error && (
            <div style={{ background:'#FF6B6B14', border:'1.5px solid #FF6B6B30', borderRadius:14, padding:'14px 16px', textAlign:'center', color:'#FF6B6B', fontSize:13, fontWeight:700 }}>⚠ {error}</div>
          )}
          {problem && !error && (
            <>
              {/* Emoji scene */}
              {problem.question_type === 'emoji' && problem.image_data && (
                problem.image_data.includes('|') ? (
                  <div style={{ background:'#FFF8E7', border:'1.5px solid #FFC84740', borderRadius:16, padding:'14px 16px', marginBottom:14, display:'flex', gap:16 }}>
                    {(() => { const [l1,l2,lb1,lb2] = problem.image_data.split('|'); return (
                      <>
                        <div style={{ flex:1, textAlign:'center' }}>
                          <div style={{ fontSize:'1.8rem', lineHeight:1.4 }}>{l1}</div>
                          <div style={{ fontSize:11, color:'#9890C4', fontWeight:700, marginTop:4 }}>{lb1}</div>
                        </div>
                        <div style={{ width:1, background:'#FFC84740' }}/>
                        <div style={{ flex:1, textAlign:'center' }}>
                          <div style={{ fontSize:'1.8rem', lineHeight:1.4 }}>{l2}</div>
                          <div style={{ fontSize:11, color:'#9890C4', fontWeight:700, marginTop:4 }}>{lb2}</div>
                        </div>
                      </>
                    ); })()}
                  </div>
                ) : (
                  <div style={{ background:'#F0ECFF', border:'1.5px solid #5B4FE840', borderRadius:16, padding:'16px', marginBottom:14, textAlign:'center' }}>
                    <div style={{ fontSize:'2rem', lineHeight:1.5 }}>{problem.image_data}</div>
                  </div>
                )
              )}
              {/* Question */}
              <div style={{ fontSize:16, fontWeight:800, color:'#1A1040', lineHeight:1.55, marginBottom:16, fontFamily:"'Baloo 2',sans-serif" }}>{problem.question}</div>
              {/* Attempt counter */}
              {result !== 'correct' && result !== 'revealed' && (
                <div style={{ fontSize:11, color:'#9890C4', fontWeight:700, marginBottom:10 }}>Attempt {attemptNumber} of 3</div>
              )}
              {/* MCQ options */}
              <div>
                {(problem.options || []).map((opt, idx) => (
                  <button key={idx} onClick={() => { if (result==='correct'||result==='revealed'||result==='wrong') return; setSelectedIndex(idx); }} style={getOptionStyle(idx)}>
                    <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:selectedIndex===idx?'#5B4FE8':'#F0ECFF', color:selectedIndex===idx?'white':'#5B4FE8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900 }}>{optionLabel[idx]}</div>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
              {/* Hint */}
              {attemptNumber >= 2 && result !== 'correct' && result !== 'revealed' && problem.hint && (
                <div style={{ marginTop:8 }}>
                  <button onClick={() => setShowHint(h => !h)} style={{ background:'#FFC84718', border:'1.5px solid #FFC84740', borderRadius:10, padding:'6px 14px', fontSize:12, fontWeight:700, color:'#B8860B', cursor:'pointer' }}>
                    {showHint ? '▲ Hide Hint' : '💡 Show Hint'}
                  </button>
                  {showHint && (
                    <div style={{ background:'#FFF8E7', border:'1.5px solid #FFC84740', borderRadius:12, padding:'10px 14px', marginTop:8, fontSize:13, color:'#7A5C00', fontWeight:600, lineHeight:1.5 }}>💡 {problem.hint}</div>
                  )}
                </div>
              )}
              {/* Submit */}
              {result !== 'correct' && result !== 'revealed' && (
                <button onClick={handleAnswer} disabled={selectedIndex===null||loading}
                  style={{ width:'100%', marginTop:16, background:selectedIndex===null?'#F0ECFF':'linear-gradient(135deg,#5B4FE8,#9B59F5)', border:'none', borderRadius:16, padding:'14px', fontSize:15, fontWeight:900, color:selectedIndex===null?'#C0BAE0':'white', cursor:selectedIndex===null?'default':'pointer', transition:'all 0.2s', boxShadow:selectedIndex===null?'none':'0 4px 0 #5B4FE8CC' }}>
                  {loading ? '…' : 'Check Answer ✓'}
                </button>
              )}
              {/* Correct */}
              {result === 'correct' && (
                <>
                  {xpAwarded > 0 && (
                    <div style={{ position:'fixed', top:'40%', left:'50%', transform:'translateX(-50%)', fontSize:24, fontWeight:900, color:'#FFC847', pointerEvents:'none', animation:'xpRise 1.5s ease forwards', zIndex:1000, textShadow:'0 2px 8px rgba(0,0,0,0.3)' }}>✨ +{xpAwarded} XP</div>
                  )}
                  <div style={{ marginTop:16, background:'#2ECC9A14', border:'2px solid #2ECC9A44', borderRadius:20, padding:'18px 20px', textAlign:'center', animation:'popIn 0.4s ease' }}>
                    <div style={{ fontSize:44, marginBottom:8 }}>🎉</div>
                    <div style={{ fontSize:18, fontWeight:900, color:'#2ECC9A', marginBottom:4 }}>Correct!</div>
                    {xpAwarded > 0 && <div style={{ fontSize:14, color:'#FFC847', fontWeight:800, marginBottom:8 }}>+{xpAwarded} XP earned!</div>}
                    {problem.explanation && <div style={{ fontSize:13, color:'#5A4E8A', lineHeight:1.55, marginBottom:12 }}>{problem.explanation}</div>}
                    <button onClick={onClose} style={{ background:'#2ECC9A', border:'none', borderRadius:14, padding:'12px 28px', color:'white', fontSize:14, fontWeight:900, cursor:'pointer' }}>Done ✓</button>
                  </div>
                </>
              )}
              {/* Revealed */}
              {result === 'revealed' && (
                <div style={{ marginTop:16, background:'#F0ECFF', border:'2px solid #9B59F540', borderRadius:20, padding:'18px 20px', textAlign:'center', animation:'popIn 0.4s ease' }}>
                  <div style={{ fontSize:36, marginBottom:8 }}>💡</div>
                  <div style={{ fontSize:15, fontWeight:800, color:'#5B4FE8', marginBottom:4 }}>The correct answer was:</div>
                  <div style={{ fontSize:18, fontWeight:900, color:'#1A1040', marginBottom:12 }}>{optionLabel[problem.correct_index]}. {(problem.options||[])[problem.correct_index]}</div>
                  {problem.explanation && <div style={{ fontSize:13, color:'#5A4E8A', lineHeight:1.55, marginBottom:14 }}>{problem.explanation}</div>}
                  <button onClick={onClose} style={{ background:'#5B4FE8', border:'none', borderRadius:14, padding:'12px 28px', color:'white', fontSize:14, fontWeight:900, cursor:'pointer' }}>Close</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function Home({ child, onWorld, onAbacus, onGames, onOlympiad, onParent, onBazaar, onLogout, onFeedback, onRate, onSettings, isLessonPurchased, onShop, onBadges, onCharacter, onThemeChange, onBossArena }) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(()=>!localStorage.getItem('mm_tutorial_done'));
  const doneTutorial = () => { localStorage.setItem('mm_tutorial_done','1'); setShowTutorial(false); };
  const [showWelcome, setShowWelcome] = useState(()=>!localStorage.getItem('mm_welcomed_'+(child?.id||"")));
  const dismissWelcome = () => { localStorage.setItem('mm_welcomed_'+(child?.id||""),'1'); setShowWelcome(false); };
  const [progress,   setProgress]   = useState([]);
  const [showDQ,         setShowDQ]         = useState(false);
  const [showPuzzle,     setShowPuzzle]     = useState(false);
  const [showDailyQuest, setShowDailyQuest] = useState(false);
  const [dailyQuestInitialStep, setDailyQuestInitialStep] = useState(0);
  const [showRating,        setShowRating]        = useState(false);
  const [exploreOpen,       setExploreOpen]       = useState(false);
  const [mascotMsg,         setMascotMsg]         = useState(0);
  const [showWordProblem,   setShowWordProblem]   = useState(false);
  const [wordProblemSolved, setWordProblemSolved] = useState(() => {
    const today = new Date().toISOString().slice(0,10);
    return localStorage.getItem(`mm_wp_solved_${child.id}_${today}`) === '1';
  });
  const [showWPToast, setShowWPToast] = useState(false);
  const [brainSpark,   setBrainSpark]   = useState(null);   // { fact, category }
  const [sparkOpen,    setSparkOpen]    = useState(false);
  const w = WORLDS.find(x=>x.id===parseInt(child.class_num||1)) || WORLDS[0];
  const showOlympiad = (() => { const cn = parseInt(child.class_num || 1); return cn >= 1 && cn <= 5; })();
  const MASCOT_MSGS = [
    `Hi ${child.name?.split(" ")[0]?.toUpperCase()}! Ready to blast off? 🚀`,
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
    const today = new Date().toISOString().slice(0,10);
    const solvedKey = `mm_wp_solved_${child.id}_${today}`;
    const toastKey  = `mm_wp_toast_${child.id}`;
    if (localStorage.getItem(solvedKey) !== '1' && sessionStorage.getItem(toastKey) !== '1') {
      const t = setTimeout(() => { setShowWPToast(true); sessionStorage.setItem(toastKey, '1'); }, 2000);
      return () => clearTimeout(t);
    }
  }, [child.id]);
  useEffect(() => {
    db.getProgress(child.id).then(({ data }) => setProgress(data || []));
    // BrainSpark: load today's fun fact (one new fact per login day, per child)
    const ct = child.is_school_student ? 'school' : 'home';
    db.getFunFact(child.id, ct).then(r => { if (r.fact) setBrainSpark(r); });
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
  const doneCnt = [dqDone, dpDone, todaySets>=1].filter(Boolean).length;

  return (
    <div style={{ minHeight:"100vh", background:"#FAFBFF", color:"#1A1040", fontFamily:"'Nunito','Baloo 2',sans-serif", position:"relative", overflowX:"hidden" }}>
      {/* Background blobs */}
      <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"60% 40% 30% 70%/60% 30% 70% 40%", background:"radial-gradient(#9B59F540,#9B59F510)", animation:"mmWave 8s ease-in-out infinite", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"absolute", bottom:80, left:-30, width:120, height:120, borderRadius:"60% 40% 30% 70%/60% 30% 70% 40%", background:"radial-gradient(#5B4FE840,#5B4FE810)", animation:"mmWave 10s ease-in-out infinite reverse", pointerEvents:"none", zIndex:0 }}/>
      <Starfield n={50}/>
      {onFeedback && (
        <FABButton
          onHelp={() => onFeedback()}
          onRankings={() => setShowLeaderboard(true)}
          showRankings={!!(child.is_school_student && child.school_id)}
          onWordProblem={() => { setDailyQuestInitialStep(2); setShowDailyQuest(true); }}
          showWordProblem={true}
          wordProblemSolved={dqDone}
          onPuzzle={() => { setDailyQuestInitialStep(3); setShowDailyQuest(true); }}
          showPuzzle={true}
          puzzleSolved={dpDone}
        />
      )}
      {showLeaderboard && (
        <ClassLeaderboard
          child={child}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
      {showWPToast && !wordProblemSolved && (
        <WordProblemToast
          onOpen={() => { setShowWordProblem(true); setShowWPToast(false); }}
          onDismiss={() => setShowWPToast(false)}
        />
      )}
      {showWordProblem && (
        <WordProblemModal
          child={child}
          onClose={() => setShowWordProblem(false)}
          onSolved={(xp) => { setWordProblemSolved(true); setShowWordProblem(false); }}
        />
      )}
      {showTutorial && <Tutorial onDone={doneTutorial}/>}
      {showDQ     && <DailyQuiz   child={child} onClose={() => setShowDQ(false)}/>}
      {showPuzzle && <DailyPuzzle child={child} onClose={() => setShowPuzzle(false)}/>}
      {showDailyQuest && (
        <DailyQuestHub
          child={child}
          dqDone={dqDone} dpDone={dpDone} setDone={todaySets>=1}
          onWorld={onWorld} worldW={w}
          initialStep={dailyQuestInitialStep}
          onClose={() => { setShowDailyQuest(false); setDailyQuestInitialStep(0); }}
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
            <div style={{ fontSize:20, color:"#1A1040", fontWeight:800, marginBottom:8 }}>Hello, {child.name?.toUpperCase()}! 👋</div>
            <div style={{ fontSize:15, color:"#9890C4", lineHeight:1.7, marginBottom:24 }}>Your math adventure awaits!<br/>Let's explore the galaxy together! 🌌</div>
            <button onClick={dismissWelcome} style={{ background:"linear-gradient(155deg,#4BBDF5EE,#5B4FE8CC)", border:"none", borderRadius:20, padding:"16px 40px", color:"white", fontFamily:"'Nunito',sans-serif", fontSize:18, cursor:"pointer", fontWeight:900, boxShadow:"0 4px 0 #5B4FE8CC, 0 6px 20px #5B4FE845" }}>🚀 LET'S GO!</button>
          </div>
        </div>
      )}

      {/* 3 — Hero Header */}
      <div style={{ position:"relative", zIndex:1, background:"linear-gradient(160deg,#5B4FE818,#9B59F512,transparent)", padding:"20px 18px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <div style={{ position:"relative", width:64, height:64, flexShrink:0 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:"linear-gradient(135deg,#9B59F522,#9B59F50a)", border:"2.5px solid #9B59F544", display:"flex", alignItems:"center", justifyContent:"center", fontSize:27, boxShadow:"0 0 20px #9B59F555" }}>{child.avatar}</div>
            <div style={{ position:"absolute", bottom:-4, right:-4, background:"linear-gradient(135deg,#FFC847,#FF6B6B)", borderRadius:999, padding:"1px 7px", fontSize:10, fontWeight:900, color:"white", border:"2px solid white" }}>Lv{child.level||1}</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:"#1A1040", lineHeight:1.1 }}>Hey, {child.name?.split(" ")[0]?.toUpperCase()}! {levelEmoji}</div>
            <div style={{ fontSize:12, color:"#5A4E8A", fontWeight:600, marginTop:2 }}>
              {child.is_school_student
                ? <span>Class {child.class_num}{child.section ? <span style={{color:"#4BBDF5"}}> · {child.section}</span> : ''}</span>
                : <span>Class {child.class_num || 1}</span>
              }
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {child.streak_days>0 && (
              <div style={{ background:"#FF6B6B15", border:"1.5px solid #FF6B6B30", borderRadius:14, padding:"4px 10px", fontSize:12, fontWeight:800, color:"#FF6B6B", display:"flex", alignItems:"center", gap:4 }}>🔥 {child.streak_days}</div>
            )}
            <MuteBtn/>
            <button onClick={onLogout} style={{ background:"#FF5FA014", border:"1px solid #FF5FA044", borderRadius:12, padding:"7px 11px", color:"#FF5FA0", fontSize:13, cursor:"pointer", fontWeight:700 }}>Exit</button>
          </div>
        </div>
        <XPBar xp={child.xp||0} level={child.level||1}/>
        {/* School banner — school students only */}
        {child.is_school_student && child.school_name && (
          <div style={{ marginTop:12, background:"linear-gradient(135deg,#4BBDF518,#5B4FE812)", border:"1.5px solid #4BBDF530", borderRadius:16, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:22, flexShrink:0 }}>🏫</div>
            <div>
              <div style={{ fontSize:10, color:"#4BBDF5", fontWeight:800, letterSpacing:1 }}>YOUR SCHOOL</div>
              <div style={{ fontSize:14, color:"#1A1040", fontWeight:800, lineHeight:1.2 }}>{child.school_name}</div>
            </div>
          </div>
        )}
      </div>

      {/* 4 — Content Wrapper */}
      <div style={{ position:"relative", zIndex:1, padding:"14px 16px", display:"flex", flexDirection:"column", gap:14, paddingBottom:88 }}>

        {/* 4a — Stats Row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[
            {e:"⭐",v:totalStars,     l:"Stars",  c:"#FFC847"},
            {e:"🪙",v:child.coins||0, l:"Coins",  c:"#4BBDF5"},
            {e:"💎",v:child.gems||0,  l:"Gems",   c:"#9B59F5"},
            {e:"🔥",v:child.streak_days||0, l:"Streak", c:"#FF6B6B"},
          ].map((s,i)=>(
            <div key={i} style={{ background:"white", border:`1.5px solid ${s.c}22`, borderRadius:28, padding:"10px 6px", textAlign:"center", boxShadow:`0 8px 30px ${s.c}28, inset 0 1px 0 rgba(255,255,255,0.8)` }}>
              <div style={{ fontSize:20 }}>{s.e}</div>
              <div style={{ fontSize:16, fontWeight:900, color:"#1A1040" }}>{s.v}</div>
              <div style={{ fontSize:9, color:"#9890C4", fontWeight:700 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* 4b — BrainSpark (replaces Cosmo Says) */}
        <BrainSparkCard brainSpark={brainSpark} onOpen={() => setSparkOpen(true)} mascotMsg={MASCOT_MSGS[mascotMsg]} />
        {sparkOpen && <BrainSparkPopup brainSpark={brainSpark} onClose={() => setSparkOpen(false)} />}

        {/* 4d — Quick Launch (always expanded) */}
        <div style={{ background:"white", border:"1.5px solid #FFC84722", borderRadius:28, padding:16, boxShadow:"0 8px 30px #FFC84728, inset 0 1px 0 rgba(255,255,255,0.8)" }}>
          <div style={{ fontSize:15, fontWeight:900, color:"#1A1040", marginBottom:12 }}>⚡ Quick Launch</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              {i:"🧮",l:"Abacus",   s:"Train your brain", c:"#FFC847",a:onAbacus},
              {i:"🎮",l:"Games Hub", s:"8 mini-games",     c:"#4BBDF5",a:onGames},
              showOlympiad && {i:"🎓",l:"Olympiad",  s:"Compete & win",    c:"#9B59F5",a:onOlympiad},
              {i:"🛒",l:"Bazaar 🆕", s:"Real-life maths",  c:"#FF6B6B",a:onBazaar},
            ].filter(Boolean).map((n,i)=>(
              <button key={i} onClick={n.a} style={{ background:`${n.c}10`, border:`1.5px solid ${n.c}25`, borderRadius:20, padding:"14px 12px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10, boxShadow:`0 4px 12px ${n.c}30, 0 2px 6px ${n.c}20` }}>
                <div style={{ fontSize:26, flexShrink:0 }}>{n.i}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:"#1A1040" }}>{n.l}</div>
                  <div style={{ fontSize:10, color:n.c, fontWeight:700, marginTop:2 }}>{n.s}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 4e — My Class (single tap to map) */}
        <button onClick={()=>onWorld(w)} style={{ background:"white", border:"2px solid #9B59F530", borderRadius:28, padding:16, cursor:"pointer", display:"flex", alignItems:"center", gap:14, boxShadow:"0 8px 30px #9B59F528, inset 0 1px 0 rgba(255,255,255,0.8)", width:"100%", textAlign:"left" }}>
          <div style={{ width:58, height:58, borderRadius:20, background:"#9B59F514", border:"2px solid #9B59F530", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>{w.planet}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:900, color:"#1A1040" }}>{w.name}</div>
            <div style={{ fontSize:12, color:"#5A4E8A", fontWeight:600, marginTop:2 }}>{w.world} · {pctDone}% done</div>
            <div style={{ background:"#F0ECFF", borderRadius:999, height:5, overflow:"hidden", marginTop:6 }}>
              <div style={{ width:`${pctDone}%`, height:"100%", background:"linear-gradient(90deg,#9B59F5,#4BBDF5)", borderRadius:999, transition:"width 1s ease" }}/>
            </div>
          </div>
          <div style={{ fontSize:24, color:"#9B59F5" }}>›</div>
        </button>

        {/* 4f — Boss Arena */}
        {(() => {
          let bossList = [];
          try {
            const cn = parseInt(child.class_num || 1);
            bossList = BOSS_MAP[cn] || [];
          } catch(e) {}
          if (!bossList.length) return null;

          let bossPreview = {};
          try {
            const raw = localStorage.getItem("mm_boss_preview_" + child.id);
            if (raw) bossPreview = JSON.parse(raw);
          } catch(e) {}

          return (
            <div style={{ background:"white", border:"1.5px solid rgba(255,107,107,0.18)", borderRadius:28, padding:"16px 16px 14px", boxShadow:"0 8px 30px rgba(255,107,107,0.10), inset 0 1px 0 rgba(255,255,255,0.8)" }}>
              {/* Header row */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ fontSize:15, fontWeight:900, color:"#1A1040" }}>{"⚔️ Boss Arena"}</div>
                <button onClick={onBossArena} style={{ fontSize:12, color:"#FF6B6B", fontWeight:800, background:"none", border:"none", cursor:"pointer", padding:"4px 8px" }}>{"See All →"}</button>
              </div>
              {/* Horizontal scroll row */}
              <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:6, scrollbarWidth:"none", msOverflowStyle:"none" }}>
                {bossList.map((boss, idx) => {
                  const killedLevels = boss.levels.filter(lk => bossPreview[boss.id + "_" + lk]);
                  const totalLevels  = boss.levels.length;
                  const allKilled    = killedLevels.length === totalLevels;
                  const someKilled   = killedLevels.length > 0 && !allKilled;
                  const prevBoss   = idx > 0 ? bossList[idx - 1] : null;
                  const isUnlocked = idx === 0 || !!(prevBoss && (prevBoss.levels || []).every(lk => bossPreview[prevBoss.id + "_" + lk] === true));

                  return (
                    <button key={boss.id} onClick={onBossArena}
                      style={{ background:"white", borderRadius:20, boxShadow:"0 4px 14px rgba(0,0,0,0.08)", padding:"12px 8px", width:112, minWidth:112, display:"flex", flexDirection:"column", alignItems:"center", gap:6, border:"1.5px solid rgba(0,0,0,0.06)", cursor:"pointer", flexShrink:0 }}>
                      <div style={{ fontSize:34 }}>{boss.emoji}</div>
                      <div style={{ fontSize:11, fontWeight:800, color:"#1A1040", textAlign:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", width:"100%", padding:"0 4px" }}>{boss.name}</div>
                      {allKilled ? (
                        <div style={{ background:"rgba(255,200,71,0.15)", border:"1.5px solid #FFC847", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:800, color:"#B8860B" }}>{"🏆 SLAIN"}</div>
                      ) : someKilled ? (
                        <div style={{ background:"rgba(155,89,245,0.12)", border:"1.5px solid #9B59F5", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:800, color:"#9B59F5" }}>{"⚔️ " + killedLevels.length + "/" + totalLevels}</div>
                      ) : isUnlocked ? (
                        <div style={{ background:"linear-gradient(135deg,#FF6B6B,#FF4444)", borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:900, color:"white", animation:"mmFloat 1.5s ease-in-out infinite" }}>{"FIGHT!"}</div>
                      ) : (
                        <div style={{ background:"rgba(0,0,0,0.06)", borderRadius:20, padding:"3px 10px", fontSize:14 }}>{"🔒"}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

      </div>

      {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:10, background:"rgba(255,255,255,0.98)", backdropFilter:"blur(24px)", borderTop:"1.5px solid rgba(91,79,232,0.10)", padding:"8px 8px 16px", display:"flex", justifyContent:"space-around", boxShadow:"0 -4px 24px rgba(91,79,232,0.10)" }}>
        {[
          {icon:"🏠",label:"Home",    act:null,                          active:true},
          {icon:"🎮",label:"Games",   act:onGames},
          {icon:"👨‍👩‍👧",label:"Parent",  act:onParent},
          {icon:"🌌",label:"Explore", act:()=>setExploreOpen(true)},
          {icon:"⚙️",label:"Settings",act:()=>onSettings&&onSettings()},
          {icon:"🛍️",label:"Shop",    act:()=>onShop&&onShop()},
        ].map((n,i)=>(
          <button key={i} onClick={n.act||undefined} style={{ background:n.active?"#5B4FE815":"none", border:"none", cursor:n.act?"pointer":"default", display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"6px 10px", borderRadius:16, color:n.active?"#5B4FE8":"#9890C4", minWidth:44, transition:"all 0.2s" }}>
            <div style={{ fontSize:22, lineHeight:1 }}>{n.icon}</div>
            <div style={{ fontSize:9, fontFamily:"'Nunito',sans-serif", fontWeight:800, marginTop:2 }}>{n.label}</div>
            {n.active&&<div style={{ width:16, height:3, borderRadius:999, background:"linear-gradient(90deg,#5B4FE8,#9B59F5)", marginTop:2 }}/>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Lessons ───────────────────────────────────────────────────────────