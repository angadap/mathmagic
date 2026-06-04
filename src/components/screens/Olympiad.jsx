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
      <div style={{ position:"relative", zIndex:2, background:`linear-gradient(135deg,${C.purple}22,${C.cyan}0a)`, borderBottom:`3px solid ${C.purple}44`, padding:"16px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:10 }}>
          <BackBtn onClick={onBack} color={C.purple}/>
          <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${C.purple},${C.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🎓</div>
          <div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.purple, letterSpacing:2 }}>OLYMPIAD TESTS</div>
            <div style={{ fontSize:16, fontWeight:900, color:textColor() }}>SOF IMO · ASSET · NTSE</div>
            <div style={{ fontSize:11, color:C.dim }}>{doneTests.length}/30 completed</div>
          </div>
        </div>
        <div style={{ background:isDark()?"rgba(255,255,255,0.06)":"rgba(124,111,224,0.06)", borderRadius:6, height:5, overflow:"hidden" }}>
          <div style={{ width:`${(doneTests.length/30)*100}%`, height:"100%", background:`linear-gradient(90deg,${C.purple},${C.cyan})`, borderRadius:6 }}/>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"14px 18px" }}>
        {/* Grid of tests */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {OLYMPIAD_TESTS.map((_, ti) => {
            const done    = isTestDone(ti);
            const unlocked = isTestUnlocked(ti);
            const diffLabel = ti < 10 ? "EASY" : ti < 20 ? "MED" : "HARD";
            const diffColor = ti < 10 ? C.green : ti < 20 ? C.yellow : C.red;
            return (
              <button key={ti} onClick={() => unlocked && startTest(ti)}
                style={{ background: done ? `linear-gradient(135deg,${C.purple}22,${C.cyan}0a)` : unlocked ? C.card : isDark()?"#060614":"#f5f0ff", border:`2px solid ${done?C.purple+"55":unlocked?C.purple+"33":isDark()?"#0c0c20":C.border||"#ddd"}`, borderRadius:16, padding:"14px 8px", cursor:unlocked?"pointer":"not-allowed", textAlign:"center", opacity:unlocked?1:0.35, boxShadow:done?`0 2px 10px ${C.purple}22`:"none" }}>
                <div style={{ fontSize:26, marginBottom:4 }}>{done?"🏅":unlocked?"📋":"🔒"}</div>
                <div style={{ fontFamily:"'Baloo 2',sans-serif", fontSize:11, fontWeight:900, color:done?C.purple:unlocked?textColor():C.dim }}>Test {ti+1}</div>
                <div style={{ fontSize:8, color:diffColor, fontFamily:"'Orbitron',sans-serif", marginTop:2 }}>{diffLabel}</div>
                <div style={{ fontSize:8, color:C.dim, marginTop:1 }}>25 Q</div>
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
      <div style={{ position:"relative", zIndex:2, background:`linear-gradient(135deg,${C.purple}22,${C.cyan}0a)`, borderBottom:`3px solid ${C.purple}44`, padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
          <BackBtn onClick={() => setView("list")} color={C.purple}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.purple }}>🎓 TEST {testIdx+1} · Q{qi+1}/25</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:16, color: timeLeft <= 10 ? C.red : C.yellow }}>{timeLeft}s</div>
        </div>
        <div style={{ background:isDark()?"rgba(255,255,255,0.06)":"rgba(124,111,224,0.06)", borderRadius:6, height:5, overflow:"hidden" }}>
          <div style={{ width:`${((qi)/25)*100}%`, height:"100%", background:`linear-gradient(90deg,${C.purple},${C.cyan})`, borderRadius:6, transition:"width 0.4s" }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
          <span style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif" }}>Score: {score}</span>
          <div style={{ width:`${(timeLeft/(question?.time||45))*100}%`, maxWidth:80, height:4, background:timeLeft<=10?C.red:C.green, borderRadius:4, transition:"width 1s linear" }}/>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"14px 18px" }}>
        <Card color={C.purple} style={{ marginBottom:14, padding:"18px 14px" }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:18, fontWeight:800, color:textColor(), lineHeight:1.6 }}>{question.q}</div>
        </Card>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          {question.opts.map((opt, i) => {
            let bg=C.card, border=isDark()?`1.5px solid ${C.purple}28`:`1.5px solid ${C.border||"#ece8ff"}`, col=textColor();
            if (chosen !== null) {
              if (i===question.ans){bg=isDark()?"#052e16":"#edfff6";border=`2px solid ${C.green}`;col=isDark()?"#4ade80":"#065f46";}
              else if(i===chosen){bg=isDark()?"#2d0a0a":"#fff1f1";border=`2px solid ${C.red}`;col=isDark()?"#f87171":"#991b1b";}
            }
            return <button key={i} onClick={() => chosen===null && handlePick(i)}
              style={{ background:bg, border, borderRadius:18, padding:"16px 14px", fontSize:17, fontWeight:800, fontFamily:"'Baloo 2',sans-serif", color:col, cursor:chosen!==null?"default":"pointer", transition:"all 0.2s" }}>
              {chosen!==null && i===question.ans ? "✓ " : ""}{opt}
            </button>;
          })}
        </div>
        {chosen!==null && (
          <div style={{ background:`${C.cyan}14`, border:`1px solid ${C.cyan}33`, borderRadius:11, padding:"9px 13px" }}>
            <div style={{ color:C.cyan, fontSize:12, fontWeight:700 }}>💡 {question.h}</div>
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
