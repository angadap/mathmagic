// src/components/screens/Olympiad.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, Card, BackBtn, XPBar } from '../ui/primitives.jsx';
import { Starfield, Confetti, Mascot } from '../layout/layout.jsx';
import { WORLDS, LESSONS, BADGES } from '../../constants/gameData.js';
import { ProgressGrid } from '../shared/shared.jsx';
import { OLYMPIAD_TESTS } from '../../constants/olympiadData.js';


export function Olympiad({ child, setChild, onBack }) {
  const [view,     setView]     = useState("list");
  const [testIdx,  setTestIdx]  = useState(0);
  const [qi,       setQi]       = useState(0);
  const [chosen,   setChosen]   = useState(null);
  const [score,    setScore]    = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [saving,   setSaving]   = useState(false);
  const [results,  setResults]  = useState([]);
  const [doneTests,setDoneTests]= useState([]);
  const scoreRef  = useRef(0);
  const savedRef  = useRef(false);

  // Restore completed tests from DB on mount
  useEffect(() => {
    if (!child?.id) return;
    db.getProgress(child.id).then(({ data }) => {
      if (!data) return;
      const done = data
        .filter(p => p.lesson_id?.startsWith("olympiad_test_"))
        .map(p => parseInt(p.lesson_id.replace("olympiad_test_", "")));
      if (done.length > 0) setDoneTests(done);
    });
  }, [child?.id]);

  const test     = OLYMPIAD_TESTS[testIdx] || OLYMPIAD_TESTS[0];
  const question = test[qi];

  // Per-question countdown
  useEffect(() => {
    if (view !== "test" || chosen !== null) return;
    const qTime = question?.time || 45;
    setTimeLeft(qTime);
  }, [qi, view]);

  useEffect(() => {
    if (view !== "test" || chosen !== null) return;
    if (timeLeft <= 0) { handlePick(-1); return; } // time out = wrong
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [view, timeLeft, chosen]);

  const handlePick = (idx) => {
    if (chosen !== null) return;
    const ok = idx === question.ans;
    if (ok) SFX.correct(); else SFX.wrong();
    setChosen(idx);
    setResults(r => [...r, ok]);
    if (ok) { scoreRef.current += 1; setScore(scoreRef.current); }
    setTimeout(() => {
      if (qi + 1 >= test.length) {
        // done
        if (!savedRef.current) {
          savedRef.current = true;
          setSaving(true);
          db.addXP(child.id, scoreRef.current * 25, scoreRef.current * 5, !!(child.is_school_student))
            .then(({data:nc}) => { if (nc) setChild(nc); setSaving(false); });
          db.saveProgress(child.id, `olympiad_test_${testIdx}`, { correct: scoreRef.current, total: test.length, stars: scoreRef.current >= 20 ? 3 : scoreRef.current >= 15 ? 2 : 1, xpEarned: scoreRef.current * 25, isSchoolStudent:!!(child.is_school_student) });
        }
        setDoneTests(dt => dt.includes(testIdx) ? dt : [...dt, testIdx]);
        setView("result");
      } else {
        setQi(q => q+1); setChosen(null);
      }
    }, 1000);
  };

  const isTestUnlocked = (ti) => ti === 0 || doneTests.includes(ti - 1);
  const isTestDone     = (ti) => doneTests.includes(ti);

  const startTest = (ti) => {
    setTestIdx(ti); setQi(0); setChosen(null); setScore(0);
    setResults([]); savedRef.current = false; setView("test");
  };

  // ── Test list ──
  if (view === "list") return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Baloo 2','Nunito',sans-serif", position:"relative" }}>
      <Starfield n={isDark()?35:8}/>
      <div style={{ position:"relative", zIndex:2, background:"linear-gradient(135deg,#9B59F520,#5B4FE810)", borderBottom:"1.5px solid #9B59F520", padding:"16px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:10 }}>
          <BackBtn onClick={onBack} color="#9B59F5"/>
          <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#9B59F5,#5B4FE8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🎓</div>
          <div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:"#9B59F5", letterSpacing:2 }}>OLYMPIAD TESTS</div>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#1A1040" }}>SOF IMO · ASSET · NTSE</div>
            <div style={{ fontSize:11, color:"#9890C4" }}>{doneTests.length}/30 completed</div>
          </div>
        </div>
        <div style={{ background:"rgba(91,79,232,0.08)", borderRadius:999, height:6, overflow:"hidden" }}>
          <div style={{ width:`${(doneTests.length/30)*100}%`, height:"100%", background:"linear-gradient(90deg,#9B59F5,#4BBDF5)", borderRadius:999, boxShadow:"0 0 8px #9B59F566" }}/>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"14px 18px" }}>
        {/* Stats card */}
        <div style={{ background:"linear-gradient(135deg,#9B59F522,#5B4FE810)", border:"1.5px solid #9B59F525", borderRadius:20, padding:"14px 18px", marginBottom:16, display:"flex" }}>
          {[{label:"Completed",value:doneTests.length,icon:"🏅"},{label:"Rank",value:`#${Math.max(1,31-doneTests.length)}`,icon:"🏆"},{label:"Total",value:30,icon:"📋"}].map((s,i)=>(
            <div key={i} style={{ flex:1, textAlign:"center", borderRight:i<2?"1.5px solid #9B59F520":"none", padding:"0 8px" }}>
              <div style={{ fontSize:20 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:"#5B4FE8" }}>{s.value}</div>
              <div style={{ fontSize:9, color:"#9890C4", fontWeight:700 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Contest cards list */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {OLYMPIAD_TESTS.map((_, ti) => {
            const done    = isTestDone(ti);
            const unlocked = isTestUnlocked(ti);
            const diffLabel = ti < 10 ? "EASY" : ti < 20 ? "MED" : "HARD";
            const diffColor = ti < 10 ? "#2ECC9A" : ti < 20 ? "#FFC847" : "#FF6B6B";
            const statusColor = done ? "#9890C4" : unlocked ? "#2ECC9A" : "#9890C4";
            const statusLabel = done ? "ENDED" : unlocked ? "LIVE" : "SOON";
            const statusBg = done ? "#9890C418" : unlocked ? "#2ECC9A18" : "#9890C418";
            return (
              <button key={ti} onClick={() => unlocked && startTest(ti)}
                style={{ background:"white", border:`1.5px solid ${done?"#9B59F530":unlocked?"#9B59F550":"rgba(91,79,232,0.12)"}`, borderRadius:20, padding:"14px 16px", cursor:unlocked?"pointer":"not-allowed", textAlign:"left", display:"flex", alignItems:"center", gap:14, position:"relative", overflow:"hidden", opacity:unlocked?1:0.6, boxShadow:unlocked&&!done?"0 4px 16px #9B59F522":"0 2px 8px rgba(91,79,232,0.06)" }}>
                <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:`linear-gradient(180deg,${diffColor},${diffColor}66)`, borderRadius:"20px 0 0 20px" }}/>
                <div style={{ width:50, height:50, borderRadius:14, background:`${diffColor}18`, border:`2px solid ${diffColor}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{done?"🏅":unlocked?"📋":"🔒"}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:15, fontWeight:900, color:"#1A1040", marginBottom:2 }}>Test {ti+1}</div>
                  <div style={{ fontSize:11, color:"#9890C4" }}>25 Questions · {diffLabel}</div>
                  <div style={{ fontSize:11, color:"#FFC847", fontWeight:800, marginTop:2 }}>🎁 +{(ti+1)*25} XP</div>
                </div>
                <div style={{ background:statusBg, border:`1.5px solid ${statusColor}33`, borderRadius:999, padding:"4px 12px", fontSize:10, fontWeight:900, color:statusColor, flexShrink:0 }}>{statusLabel}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Active test ──
  if (view === "test") return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Baloo 2','Nunito',sans-serif", position:"relative" }}>
      <Starfield n={isDark()?20:5}/>
      <div style={{ position:"relative", zIndex:2, background:"linear-gradient(135deg,#9B59F520,#5B4FE810)", borderBottom:"1.5px solid #9B59F520", padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
          <BackBtn onClick={() => setView("list")} color="#9B59F5"/>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:900, color:"#9B59F5" }}>🎓 TEST {testIdx+1} · Q{qi+1}/25</div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color: timeLeft <= 10 ? "#FF6B6B" : "#FFC847" }}>{timeLeft}s</div>
        </div>
        <div style={{ background:"rgba(91,79,232,0.08)", borderRadius:999, height:6, overflow:"hidden" }}>
          <div style={{ width:`${((qi)/25)*100}%`, height:"100%", background:"linear-gradient(90deg,#9B59F5,#4BBDF5)", borderRadius:999, transition:"width 0.4s", boxShadow:"0 0 8px #9B59F566" }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
          <span style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif" }}>Score: {score}</span>
          <div style={{ width:`${(timeLeft/(question?.time||45))*100}%`, maxWidth:80, height:4, background:timeLeft<=10?C.red:C.green, borderRadius:4, transition:"width 1s linear" }}/>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"14px 18px" }}>
        <Card color="#9B59F5" style={{ marginBottom:14, padding:"18px 14px" }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:800, color:"#1A1040", lineHeight:1.6 }}>{question.q}</div>
        </Card>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          {question.opts.map((opt, i) => {
            let bg="white", border="2px solid #9B59F525", col="#1A1040", shadow="none";
            if (chosen !== null) {
              if (i===question.ans){bg="#E8FFF4";border="2.5px solid #2ECC9A";col="#2ECC9A";shadow="0 0 24px #2ECC9A55";}
              else if(i===chosen){bg="#FFF0F0";border="2.5px solid #FF6B6B";col="#FF6B6B";}
            }
            return <button key={i} onClick={() => chosen===null && handlePick(i)}
              style={{ background:bg, border, borderRadius:18, padding:"16px 14px", fontSize:16, fontWeight:800, fontFamily:"'Nunito',sans-serif", color:col, cursor:chosen!==null?"default":"pointer", transition:"all 0.2s", boxShadow:shadow, position:"relative", overflow:"hidden" }}>
              {!chosen && <div style={{position:"absolute",top:0,left:0,right:0,height:"50%",background:"linear-gradient(180deg,rgba(255,255,255,0.5),transparent)",borderRadius:"18px 18px 0 0",pointerEvents:"none"}}/>}
              <div style={{fontSize:10,color:chosen!==null&&i===question.ans?"#2ECC9A":chosen!==null&&i===chosen?"#FF6B6B":"#9B59F5",fontFamily:"'Nunito',sans-serif",fontWeight:900,marginBottom:4}}>{"ABCD"[i]}</div>
              {chosen!==null && i===question.ans ? "✓ " : ""}{opt}
            </button>;
          })}
        </div>
        {chosen!==null && (
          <div style={{ background:"#4BBDF514", border:"1px solid #4BBDF533", borderRadius:14, padding:"9px 13px" }}>
            <div style={{ color:"#4BBDF5", fontSize:12, fontWeight:700 }}>💡 {question.h}</div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Result ──
  const total = test.length;
  const pct   = Math.round((score/total)*100);
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Baloo 2','Nunito',sans-serif", padding:22, position:"relative" }}>
      <Starfield n={isDark()?60:15}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center", animation:"popIn 0.5s ease", width:"100%", maxWidth:340 }}>
        <div style={{ fontSize:64, marginBottom:8 }}>{pct>=80?"🥇":pct>=60?"🥈":pct>=40?"🥉":"📚"}</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:18, background:`linear-gradient(135deg,${C.purple},${C.cyan})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:10 }}>
          {pct>=80?"BRILLIANT!":pct>=60?"WELL DONE!":pct>=40?"GOOD TRY!":"KEEP GOING!"}
        </div>
        <Card color={C.purple} style={{ marginBottom:14, textAlign:"center" }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:48, fontWeight:900, color:textColor()}}>{score}<span style={{ fontSize:18, color:C.dim }}>/{total}</span></div>
          <div style={{ color:C.yellow, fontSize:13, fontWeight:700, marginTop:3 }}>+{score*25} XP · +{score*5} COINS</div>
          <div style={{ marginTop:8, background:isDark()?"rgba(255,255,255,0.06)":"rgba(124,111,224,0.06)", borderRadius:6, height:8, overflow:"hidden" }}>
            <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${pct>=60?C.green:C.orange},${C.cyan})`, borderRadius:6 }}/>
          </div>
          <div style={{ color:C.dim, fontSize:11, marginTop:3 }}>{pct}% accuracy</div>
          <div style={{ color:C.green, fontSize:9, marginTop:4, fontFamily:"'Orbitron',sans-serif" }}>✅ PROGRESS SAVED</div>
        </Card>
        {testIdx < OLYMPIAD_TESTS.length-1 && (
          <div style={{ background:`${C.green}14`, border:`1px solid ${C.green}33`, borderRadius:11, padding:"8px 12px", marginBottom:12 }}>
            <div style={{ color:C.green, fontSize:10, fontFamily:"'Orbitron',sans-serif" }}>🔓 TEST {testIdx+2} UNLOCKED!</div>
          </div>
        )}
        <div style={{ display:"flex", gap:8 }}>
          <Btn color={C.dim} style={{ flex:1 }} onClick={() => { setView("list"); }}>← ALL TESTS</Btn>
          <Btn color={C.purple} style={{ flex:1 }} onClick={() => { startTest(testIdx); }}>↺ RETRY</Btn>
          {testIdx < OLYMPIAD_TESTS.length-1 && (
            <Btn color={C.cyan} style={{ flex:1 }} onClick={() => startTest(testIdx+1)}>NEXT →</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Parent Dashboard ──────────────────────────────────────────────────
