// src/components/screens/Abacus.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, Card, BackBtn, XPBar } from '../ui/primitives.jsx';
import { Starfield, Confetti, Mascot } from '../layout/layout.jsx';
import { WORLDS, LESSONS, BADGES } from '../../constants/gameData.js';
import { ProgressGrid } from '../shared/shared.jsx';
import { ABACUS_LEVELS } from '../../constants/abacusData.js';
import { AbacusRod } from '../ui/primitives.jsx';


export function Abacus({ onBack, child }) {
  const [unlockedLvl, setUnlockedLvl] = useState(1);
  const [level,    setLevel]    = useState(0);

  // Load abacus progress from DB on mount to restore unlocked levels
  useEffect(() => {
    if (!child?.id) return;
    db.getProgress(child.id).then(({ data }) => {
      if (!data) return;
      // Each completed abacus level is stored as "abacus_lvl_N"
      let maxUnlocked = 1;
      data.forEach(p => {
        const m = p.lesson_id?.match(/^abacus_lvl_(\d+)$/);
        if (m) maxUnlocked = Math.max(maxUnlocked, parseInt(m[1]) + 1);
      });
      setUnlockedLvl(Math.min(maxUnlocked, 30));
    });
  }, [child?.id]);
  const [pi,       setPi]       = useState(0);
  const [tens,     setTens]     = useState(0);
  const [ones,     setOnes]     = useState(0);
  const [hundreds, setHundreds] = useState(0);
  const [checked,  setChecked]  = useState(false);
  const [wrong,    setWrong]    = useState(false);
  const [levelDone,setLevelDone]= useState(false);
  const [qCorrect, setQCorrect] = useState(0); // correct in this level

  const lv   = ABACUS_LEVELS[level];
  const prob = lv.probs[pi];
  const hasH = typeof prob.h === 'number' && prob.h > 0;
  const ok   = checked && tens === prob.t && ones === prob.o && (!hasH || hundreds === prob.h);

  const goLevel = (idx) => {
    if (idx >= unlockedLvl) return;
    setLevel(idx); setPi(0); setTens(0); setOnes(0); setHundreds(0);
    setChecked(false); setWrong(false); setLevelDone(false); setQCorrect(0);
  };

  if (levelDone) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Baloo 2','Nunito',sans-serif", padding:22, position:"relative" }}>
      <Starfield n={isDark()?50:15}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center", animation:"popIn 0.5s ease" }}>
        <div style={{ fontSize:72, marginBottom:10 }}>🧮✨</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:22, fontWeight:900, color:textColor(), marginBottom:6 }}>🧮 Level {lv.level} Complete!</div>
        <div style={{ color:C.dim, fontSize:14, fontWeight:700, marginBottom:4 }}>{lv.title} — Mastered! 🎉</div>
        <div style={{ color:C.yellow, fontSize:15, fontWeight:900, marginBottom:18 }}>{qCorrect}/{lv.probs.length} correct ⭐</div>
        {level < ABACUS_LEVELS.length-1 && (
          <div style={{ background:`${C.green}18`, border:`1px solid ${C.green}44`, borderRadius:12, padding:"8px 14px", marginBottom:14 }}>
            <div style={{ color:C.green, fontSize:11, fontFamily:"'Orbitron',sans-serif" }}>🔓 LEVEL {lv.level+1} UNLOCKED!</div>
          </div>
        )}
        <div style={{ display:"flex", gap:12, width:"100%", maxWidth:280 }}>
          <Btn color={C.dim} style={{ flex:1, padding:"11px" }} onClick={onBack}>HOME</Btn>
          {level < ABACUS_LEVELS.length-1 && (
            <Btn color={C.cyan} style={{ flex:1, padding:"11px" }} onClick={() => { goLevel(level+1); setLevelDone(false); }}>
              LEVEL {lv.level+1} →
            </Btn>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Baloo 2','Nunito',sans-serif", position:"relative" }}>
      <Starfield n={isDark()?20:6}/>
      <div style={{ position:"relative", zIndex:2, background:"linear-gradient(135deg,#FFC84720,#FF6B6B10)", borderBottom:"1.5px solid #FFC84730", padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <BackBtn onClick={onBack} color="#FFC847"/>
          <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#FFC847,#FF6B6B)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🧮</div>
          <div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:"#FFC847", letterSpacing:2 }}>SPACE ABACUS</div>
            <div style={{ fontSize:16, fontWeight:900, color:textColor() }}>Level {lv.level} — {lv.title}</div>
            <div style={{ fontSize:11, color:C.dim }}>{unlockedLvl}/30 levels unlocked</div>
          </div>
        </div>
        {/* Level selector — scrollable row */}
        <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:3 }}>
          {ABACUS_LEVELS.map((al, i) => {
            const isUnlocked = i < unlockedLvl;
            const isCurrent  = level === i;
            return (
              <button key={i} onClick={() => isUnlocked && goLevel(i)}
                style={{ flexShrink:0, width:36, height:36, background: isCurrent ? "linear-gradient(135deg,#FFC847,#FF6B6B)" : isUnlocked ? "#F0ECFF" : "#E8E4F8", border:`2px solid ${isCurrent ? "#FFC847" : isUnlocked ? "#FFC84744" : "rgba(91,79,232,0.12)"}`, borderRadius:12, color: isCurrent ? "white" : isUnlocked ? "#1A1040" : "#9890C4", fontSize:9, fontFamily:"'Orbitron',sans-serif", cursor: isUnlocked ? "pointer" : "not-allowed", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
                {isUnlocked ? <span>L{al.level}</span> : <span style={{fontSize:11}}>🔒</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ position:"relative", zIndex:2, padding:18 }}>
        <Card color="#FFC847" style={{ textAlign:"center", marginBottom:14 }}>
          <div style={{ fontSize:28, animation:"mmFloat 2.5s ease-in-out infinite", marginBottom:4 }}>🧮</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:"#9890C4", letterSpacing:2, marginBottom:4 }}>
            LEVEL {lv.level} · {lv.title} · Q{pi+1}/{lv.probs.length}
          </div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:"#1A1040" }}>{prob.q}</div>
          {/* Progress bar within level */}
          <div style={{ marginTop:8, background:"rgba(91,79,232,0.08)", borderRadius:5, height:4, overflow:"hidden" }}>
            <div style={{ width:`${(pi/lv.probs.length)*100}%`, height:"100%", background:`linear-gradient(90deg,${C.purple},${C.cyan})`, borderRadius:5 }}/>
          </div>
        </Card>

        {/* Abacus rods */}
        <div style={{ display:"flex", gap:16, justifyContent:"center", marginBottom:12 }}>
          {hasH && <AbacusRod count={hundreds} setCount={setHundreds} color={C.pink}   label="HUNDREDS"/>}
          <AbacusRod count={tens}     setCount={setTens}     color={C.orange} label="TENS"/>
          <AbacusRod count={ones}     setCount={setOnes}     color={C.cyan}   label="ONES"/>
        </div>

        <div style={{ textAlign:"center", marginBottom:12, fontFamily:"'Orbitron',sans-serif", fontSize:44, fontWeight:900, color:C.purple, textShadow:`0 0 16px ${C.purple}66` }}>
          {(hasH ? hundreds*100 : 0) + tens*10 + ones}
        </div>

        {checked && (
          <Card color={ok ? C.green : C.red} style={{ textAlign:"center", marginBottom:12, padding:"10px" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color: ok ? "#4ade80" : "#f87171" }}>
              {ok ? "🚀 PERFECT LAUNCH!" : `💡 Answer: ${hasH?prob.h+"h + ":""}${prob.t} tens + ${prob.o} ones = ${(hasH?prob.h*100:0)+prob.t*10+prob.o}`}
            </div>
          </Card>
        )}

        {!checked
          ? <Btn color={C.purple} onClick={() => { setChecked(true); setWrong(!(tens===prob.t && ones===prob.o && (!hasH||hundreds===prob.h))); }}>CHECK ANSWER ✓</Btn>
          : <Btn color={ok ? C.yellow : C.orange} onClick={() => {
              const newCorrect = qCorrect + (ok ? 1 : 0);
              if (pi+1 >= lv.probs.length) {
                setQCorrect(newCorrect);
                // unlock next level
                const nextUnlock = level + 2;
                setUnlockedLvl(u => Math.max(u, nextUnlock));
                if (child?.id) db.saveProgress(child.id, `abacus_lvl_${level+1}`, { correct: newCorrect, total: lv.probs.length, stars: newCorrect >= 18 ? 3 : newCorrect >= 14 ? 2 : 1, xpEarned: newCorrect * 5, isSchoolStudent:!!(child.is_school_student) });
                setLevelDone(true);
              } else {
                setQCorrect(newCorrect);
                setPi(p => p+1); setTens(0); setOnes(0); setHundreds(0); setChecked(false); setWrong(false);
              }
            }}>NEXT →</Btn>
        }
      </div>
    </div>
  );
}

// ── Olympiad ──────────────────────────────────────────────────────────