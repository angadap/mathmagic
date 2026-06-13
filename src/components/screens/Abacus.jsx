// src/components/screens/Abacus.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { C, textColor, isDark } from '../../constants/themes.js';
import { db, fetchAbacusQuestions } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, BackBtn, AbacusRod } from '../ui/primitives.jsx';
import { Starfield } from '../layout/layout.jsx';
import { ABACUS_LEVELS_BY_CLASS, ABACUS_CLASS_META } from '../../constants/abacusData.js';
import { getHintsRemaining, useHint } from '../../lib/hints.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const TIERS = [
  { name:"Starter",  icon:"🌱", color:"#22c55e" },
  { name:"Explorer", icon:"🔭", color:"#3b82f6" },
  { name:"Champion", icon:"🏆", color:"#f97316" },
  { name:"Master",   icon:"👑", color:"#a855f7" },
];

function buildTiers(levels) {
  const n    = levels.length;
  const base = Math.floor(n / 4);
  const rem  = n % 4;
  const sizes = [
    base + (rem > 0 ? 1 : 0),
    base + (rem > 1 ? 1 : 0),
    base + (rem > 2 ? 1 : 0),
    base,
  ];
  const tiers = [];
  let cursor = 0;
  sizes.forEach(size => { tiers.push(levels.slice(cursor, cursor + size)); cursor += size; });
  return tiers;
}

function progressKey(classNum, levelNum) {
  return `abacus_c${classNum}_lvl_${levelNum}`;
}

function starsFor(correct, total) {
  const pct = correct / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.7) return 2;
  if (pct >= 0.5) return 1;
  return 0;
}

function StarRow({ stars, size = 14 }) {
  return (
    <span style={{ display:"inline-flex", gap:1 }}>
      {[1,2,3].map(i => (
        <span key={i} style={{ fontSize:size, opacity: i <= stars ? 1 : 0.2 }}>★</span>
      ))}
    </span>
  );
}

function getRodValue(prob) {
  return (typeof prob.h === "number" && prob.h > 0 ? prob.h * 100 : 0) + prob.t * 10 + prob.o;
}

// ── LevelMap ──────────────────────────────────────────────────────────────────
function LevelMap({ classNum, levels, progress, onSelectLevel, onBack }) {
  const meta       = ABACUS_CLASS_META[parseInt(classNum)] || {};
  const tierGroups = buildTiers(levels);
  const earned     = progress.reduce((a, p) => a + (p.stars_earned || 0), 0);
  const maxStars   = levels.length * 3;

  const getStars   = (lvNum) => progress.find(p => p.lesson_id === progressKey(classNum, lvNum))?.stars_earned || 0;
  const isUnlocked = (lvNum) => lvNum === 1 || getStars(lvNum - 1) >= 3;
  const isCompleted = (lvNum) => getStars(lvNum) > 0;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Baloo 2','Nunito',sans-serif", position:"relative", paddingBottom:32 }}>
      <Starfield n={isDark() ? 20 : 6}/>

      {/* Header */}
      <div style={{ position:"sticky", top:0, zIndex:10, background:"linear-gradient(135deg,#FFC84720,#FF6B6B10)", borderBottom:"1.5px solid #FFC84730", padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <BackBtn onClick={onBack} color="#FFC847"/>
          <div style={{ width:44, height:44, borderRadius:14, background:"linear-gradient(135deg,#FFC847,#FF6B6B)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>🧮</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:"#FFC847", letterSpacing:2 }}>SPACE ABACUS</div>
            <div style={{ fontSize:15, fontWeight:900, color:textColor() }}>{meta.icon} {meta.name}</div>
            <div style={{ fontSize:10, color:C.dim }}>{meta.focus}</div>
          </div>
          <div style={{ textAlign:"center", background:"#FFC84718", border:"1px solid #FFC84744", borderRadius:12, padding:"6px 12px" }}>
            <div style={{ fontSize:16 }}>⭐</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:"#FFC847", fontWeight:900 }}>{earned}/{maxStars}</div>
          </div>
        </div>
        <div style={{ background:"rgba(255,200,71,0.12)", borderRadius:6, height:7, overflow:"hidden" }}>
          <div style={{ width:`${maxStars > 0 ? (earned/maxStars)*100 : 0}%`, height:"100%", background:"linear-gradient(90deg,#FFC847,#FF6B6B)", borderRadius:6, transition:"width 0.6s ease" }}/>
        </div>
        <div style={{ marginTop:4, fontSize:10, color:C.dim, fontFamily:"'Orbitron',sans-serif" }}>
          {progress.filter(p => p.lesson_id?.startsWith(`abacus_c${classNum}_lvl_`)).length}/{levels.length} LEVELS DONE · 3★ to unlock next
        </div>
      </div>

      {/* Tier sections */}
      <div style={{ position:"relative", zIndex:2, padding:"16px 18px", display:"flex", flexDirection:"column", gap:16 }}>
        {tierGroups.map((tierLevels, ti) => {
          if (!tierLevels.length) return null;
          const tier         = TIERS[ti];
          const tierDone     = tierLevels.filter(lv => isCompleted(lv.level)).length;
          const tierTotal    = tierLevels.length;
          const tierComplete = tierLevels.every(lv => getStars(lv.level) === 3);
          const tierUnlocked = isUnlocked(tierLevels[0].level);
          const firstLevel   = tierLevels[0].level;
          const lastLevel    = tierLevels[tierLevels.length - 1].level;

          return (
            <div key={ti} style={{
              background: C.card || (isDark() ? "#ffffff08" : "#fff"),
              border:`1.5px solid ${tierComplete ? tier.color+"66" : tierUnlocked ? tier.color+"33" : isDark() ? "rgba(255,255,255,0.06)" : "#e5e7eb"}`,
              borderRadius:22, overflow:"hidden",
              boxShadow: tierComplete ? `0 4px 18px ${tier.color}22` : "none",
            }}>
              {/* Tier header */}
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background: tierComplete ? `linear-gradient(135deg,${tier.color}22,${tier.color}08)` : tierUnlocked ? `${tier.color}0a` : "transparent" }}>
                <div style={{ fontSize:26 }}>{tier.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:900, color: tierUnlocked ? tier.color : C.dim }}>
                    {tier.name} — Levels {firstLevel}–{lastLevel}
                  </div>
                  <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{tierDone}/{tierTotal} complete · 3★ needed to progress</div>
                </div>
                {tierComplete && <div style={{ fontSize:20 }}>✅</div>}
                {!tierUnlocked && <div style={{ fontSize:18 }}>🔒</div>}
              </div>

              {/* Level cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, padding:"8px 12px 14px" }}>
                {tierLevels.map((lv) => {
                  const lvStars    = getStars(lv.level);
                  const lvDone     = lvStars > 0;
                  const lvUnlocked = isUnlocked(lv.level);
                  const isCurrent  = lvUnlocked && !lvDone;
                  const is3Star    = lvStars === 3;

                  return (
                    <button key={lv.level}
                      onClick={() => { if (lvUnlocked) { SFX.tap(); onSelectLevel(lv.level); } else SFX.wrong(); }}
                      style={{
                        background: is3Star ? `linear-gradient(135deg,${tier.color}22,${tier.color}0a)` : lvDone ? "#2ECC9A12" : isCurrent ? (isDark()?"#ffffff12":"#fff") : (isDark()?"#ffffff05":"#f5f3ff"),
                        border:`2px solid ${is3Star ? tier.color+"55" : lvDone ? "#2ECC9A44" : isCurrent ? tier.color+"55" : "rgba(91,79,232,0.10)"}`,
                        borderRadius:14, padding:"10px 6px", cursor: lvUnlocked ? "pointer" : "not-allowed",
                        textAlign:"center", opacity: lvUnlocked ? 1 : 0.5,
                        boxShadow: isCurrent ? `0 4px 16px ${tier.color}44` : is3Star ? `0 2px 10px ${tier.color}33` : "none",
                        transform: isCurrent ? "scale(1.04)" : "none",
                        transition:"all 0.2s", position:"relative",
                      }}>
                      <div style={{ fontSize: isCurrent ? 20 : 16, marginBottom:3 }}>
                        {!lvUnlocked ? "🔒" : is3Star ? "✅" : "▶"}
                      </div>
                      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:9, color: is3Star ? tier.color : isCurrent ? tier.color : C.dim, fontWeight:900 }}>
                        LVL {lv.level}
                      </div>
                      <div style={{ fontSize:9, fontWeight:700, color:textColor(), lineHeight:1.3, margin:"3px 0", minHeight:24 }}>
                        {lvUnlocked ? lv.title : `Level ${lv.level}`}
                      </div>
                      {lvUnlocked && <div style={{ marginTop:2 }}><StarRow stars={lvStars} size={11}/></div>}
                      {isCurrent && (
                        <div style={{ position:"absolute", top:-6, right:-4, background:tier.color, borderRadius:6, padding:"2px 5px", fontSize:7, color:"#fff", fontWeight:900 }}>NEXT</div>
                      )}
                      {lvDone && !is3Star && (
                        <div style={{ fontSize:8, color:C.orange||"#f97316", marginTop:2, fontWeight:700 }}>need 3★</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── QuizScreen — silent submission, no per-question feedback ─────────────────
function QuizScreen({ classNum, levelData, onBack, onComplete, child }) {
  const [probs,    setProbs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [pi,       setPi]       = useState(0);
  const [tens,     setTens]     = useState(0);
  const [ones,     setOnes]     = useState(0);
  const [hundreds, setHundreds] = useState(0);
  // answers[i] = { given: number, correct: number, isOk: bool }
  const [answers,  setAnswers]  = useState([]);

  useEffect(() => {
    setLoading(true);
    fetchAbacusQuestions(classNum, levelData.level).then(qs => {
      setProbs(qs.length > 0 ? qs : levelData.probs);
      setLoading(false);
    });
  }, [classNum, levelData.level]);

  const prob  = probs[pi] || { q:"", t:0, o:0 };
  const hasH  = typeof prob.h === "number" && prob.h > 0;
  const total = probs.length;

  const currentValue = (hasH ? hundreds * 100 : 0) + tens * 10 + ones;

  const handleSubmit = useCallback(() => {
    SFX.tap();
    const correctVal = getRodValue(prob);
    const isOk       = currentValue === correctVal;
    const newAnswers = [...answers, { given: currentValue, correct: correctVal, isOk, q: prob.q }];

    if (pi + 1 >= total) {
      // All done — compute result
      const correctCount = newAnswers.filter(a => a.isOk).length;
      const stars        = starsFor(correctCount, total);
      const xp           = correctCount * 5;
      if (stars >= 3) { SFX.correct(); setTimeout(() => SFX.xpLevelUp(), 500); } else { SFX.wrong(); }
      if (child?.id) {
        db.saveProgress(child.id, progressKey(classNum, levelData.level), {
          correct: correctCount, total, stars, xpEarned: xp,
          isSchoolStudent: !!(child.is_school_student),
        });
      }
      onComplete({ correct: correctCount, total, stars, level: levelData.level, answers: newAnswers });
    } else {
      setAnswers(newAnswers);
      setPi(p => p + 1);
      setTens(0); setOnes(0); setHundreds(0);
    }
  }, [pi, total, currentValue, prob, answers, classNum, levelData.level, child]);

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
        <div style={{ fontSize:40, animation:"mmFloat 1.5s ease-in-out infinite" }}>🧮</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color:C.dim }}>LOADING…</div>
      </div>
    );
  }

  const meta = ABACUS_CLASS_META[parseInt(classNum)] || {};

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Baloo 2','Nunito',sans-serif", position:"relative" }}>
      <Starfield n={isDark() ? 20 : 6}/>

      {/* Header */}
      <div style={{ position:"relative", zIndex:2, background:"linear-gradient(135deg,#FFC84720,#FF6B6B10)", borderBottom:"1.5px solid #FFC84730", padding:"12px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <BackBtn onClick={onBack} color="#FFC847"/>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:9, color:"#FFC847", letterSpacing:2 }}>
              {meta.name} · LEVEL {levelData.level}
            </div>
            <div style={{ fontSize:14, fontWeight:900, color:textColor() }}>{levelData.title}</div>
          </div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:13, color:textColor(), fontWeight:900 }}>
            {pi + 1}<span style={{ color:C.dim, fontSize:10 }}>/{total}</span>
          </div>
        </div>
        {/* Question progress dots */}
        <div style={{ marginTop:10, display:"flex", gap:4, flexWrap:"wrap" }}>
          {probs.map((_, i) => (
            <div key={i} style={{
              height:5, flex:1, borderRadius:3,
              background: i < pi
                ? (answers[i]?.isOk ? "#2ECC9A" : "#ef4444")
                : i === pi
                  ? "#FFC847"
                  : isDark() ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
              transition:"background 0.3s",
            }}/>
          ))}
        </div>
      </div>

      <div style={{ position:"relative", zIndex:2, padding:18 }}>
        {/* Question card */}
        <div style={{ background: isDark() ? "rgba(255,200,71,0.06)" : "rgba(255,200,71,0.10)", border:"1.5px solid #FFC84733", borderRadius:18, padding:"16px 14px", textAlign:"center", marginBottom:14 }}>
          <div style={{ fontSize:26, marginBottom:6, animation:"mmFloat 2.5s ease-in-out infinite" }}>🧮</div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:textColor(), lineHeight:1.3 }}>{prob.q}</div>
        </div>

        {/* Rods */}
        <div style={{ display:"flex", gap:16, justifyContent:"center", marginBottom:14 }}>
          {hasH && <AbacusRod count={hundreds} setCount={v=>{SFX.beadSlide();setHundreds(v);}} color={C.pink||"#ec4899"} label="HUNDREDS"/>}
          <AbacusRod count={tens} setCount={v=>{SFX.beadSlide();setTens(v);}} color={C.orange||"#f97316"} label="TENS"/>
          <AbacusRod count={ones} setCount={v=>{SFX.beadSlide();setOnes(v);}} color={C.cyan||"#22d3ee"}  label="ONES"/>
        </div>

        {/* Live value display */}
        <div style={{ textAlign:"center", marginBottom:16, fontFamily:"'Orbitron',sans-serif", fontSize:48, fontWeight:900, color:C.purple||"#a855f7", textShadow:`0 0 16px ${C.purple||"#a855f7"}66` }}>
          {currentValue}
        </div>

        {/* Submit button — no feedback, just moves to next */}
        <Btn color={C.purple||"#a855f7"} onClick={handleSubmit}>
          {pi + 1 >= total ? "SUBMIT & SEE RESULTS 🎯" : "SUBMIT →"}
        </Btn>

        {/* Hint — limited by daily quota */}
        {(() => {
          const { totalLeft } = getHintsRemaining(child?.id||"guest");
          const [abHintShown, setAbHintShown] = React.useState(false);
          const [abNoHints,   setAbNoHints]   = React.useState(false);
          const prob = problems[pi];
          const hintText = prob ? `Answer: ${getRodValue(prob)}` : "Set the rods carefully!";
          return (
            <div style={{ marginTop:10 }}>
              <button onClick={()=>{
                if (abHintShown) { setAbHintShown(false); return; }
                const ok = useHint(child?.id||"guest");
                if (ok) setAbHintShown(true); else setAbNoHints(true);
              }} style={{ width:"100%", background:totalLeft>0?"#FFC84710":"#FF6B6B08", border:`1.5px solid ${totalLeft>0?"#FFC84730":"#FF6B6B25"}`, borderRadius:14, padding:"10px 14px", cursor:"pointer", color:totalLeft>0?"#FFC847":"#FF6B6B", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span>💡 {abHintShown ? hintText : "Show hint"}</span>
                <span style={{ fontSize:10, fontWeight:900, background:totalLeft>0?"#FFC84720":"#FF6B6B18", borderRadius:999, padding:"3px 9px" }}>{totalLeft} left</span>
              </button>
              {abNoHints && <div style={{ marginTop:5, fontSize:11, color:"#FF6B6B", textAlign:"center", fontWeight:700 }}>No hints left today · Buy Hint Packs in Shop 🛒</div>}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ── ResultsScreen — score + full question history ─────────────────────────────
function ResultsScreen({ classNum, result, totalLevels, onRetry, onNext, onMap }) {
  const { correct, total, stars, level, answers } = result;
  const pct          = Math.round((correct / total) * 100);
  const nextUnlocked = stars === 3 && level < totalLevels;
  const [showHistory, setShowHistory] = useState(false);

  const starColor = stars === 3 ? "#FFC847" : stars === 2 ? "#fb923c" : stars === 1 ? "#3b82f6" : "#9890C4";
  const resultEmoji = stars === 3 ? "🏆" : stars === 2 ? "🎯" : stars === 1 ? "👍" : "💪";

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Baloo 2','Nunito',sans-serif", position:"relative", paddingBottom:32 }}>
      <Starfield n={isDark() ? 40 : 12}/>

      <div style={{ position:"relative", zIndex:1, padding:"28px 20px 0" }}>

        {/* Score card */}
        <div style={{ background: isDark() ? "rgba(255,255,255,0.05)" : "#fff", border:`2px solid ${starColor}44`, borderRadius:24, padding:"24px 20px", textAlign:"center", marginBottom:16, boxShadow:`0 8px 32px ${starColor}22` }}>
          <div style={{ fontSize:64, marginBottom:8 }}>{resultEmoji}</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:starColor, letterSpacing:2, marginBottom:4 }}>LEVEL {level} COMPLETE</div>
          <div style={{ fontSize:44, fontWeight:900, color:textColor(), fontFamily:"'Fredoka One',cursive", lineHeight:1 }}>{pct}%</div>
          <div style={{ fontSize:14, color:C.dim, marginTop:4, marginBottom:12 }}>{correct} correct out of {total}</div>

          {/* Stars */}
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:14 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                fontSize:36,
                opacity: i <= stars ? 1 : 0.15,
                filter: i <= stars ? `drop-shadow(0 0 8px ${starColor})` : "none",
                transition:"all 0.4s",
                transitionDelay:`${i * 0.15}s`,
              }}>★</div>
            ))}
          </div>

          <div style={{ fontSize:13, fontWeight:800, color:starColor }}>+{correct * 5} XP earned</div>

          {/* Unlock status */}
          {nextUnlocked ? (
            <div style={{ marginTop:12, background:"#2ECC9A18", border:"1px solid #2ECC9A44", borderRadius:12, padding:"8px 14px" }}>
              <div style={{ color:"#2ECC9A", fontSize:12, fontFamily:"'Orbitron',sans-serif", fontWeight:900 }}>
                🔓 LEVEL {level + 1} UNLOCKED!
              </div>
            </div>
          ) : level < totalLevels && stars < 3 ? (
            <div style={{ marginTop:12, background:`${C.orange||"#f97316"}18`, border:`1px solid ${C.orange||"#f97316"}44`, borderRadius:12, padding:"8px 14px" }}>
              <div style={{ color:C.orange||"#f97316", fontSize:12, fontFamily:"'Orbitron',sans-serif", fontWeight:900 }}>
                ⭐ NEED 3 STARS TO UNLOCK LEVEL {level + 1}
              </div>
              <div style={{ fontSize:11, color:C.dim, marginTop:3 }}>
                Score {Math.ceil(total * 0.9)}/{total} or better · retry to improve!
              </div>
            </div>
          ) : null}
        </div>

        {/* Question history toggle */}
        <button
          onClick={() => setShowHistory(h => !h)}
          style={{ width:"100%", background: isDark() ? "rgba(255,255,255,0.05)" : "#f5f3ff", border:`1.5px solid ${isDark()?"rgba(255,255,255,0.10)":"rgba(91,79,232,0.15)"}`, borderRadius:16, padding:"12px 16px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: showHistory ? 0 : 12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:18 }}>📋</span>
            <span style={{ fontSize:13, fontWeight:800, color:textColor() }}>Question Review</span>
            <span style={{ background:"#9B59F518", border:"1px solid #9B59F530", borderRadius:999, padding:"2px 8px", fontSize:11, color:"#9B59F5", fontWeight:800 }}>
              {correct}/{total}
            </span>
          </div>
          <span style={{ fontSize:16, color:C.dim }}>{showHistory ? "▲" : "▼"}</span>
        </button>

        {/* History list */}
        {showHistory && (
          <div style={{ background: isDark() ? "rgba(255,255,255,0.03)" : "#f9f7ff", border:`1.5px solid ${isDark()?"rgba(255,255,255,0.08)":"rgba(91,79,232,0.10)"}`, borderRadius:"0 0 16px 16px", marginBottom:12, overflow:"hidden" }}>
            {answers.map((a, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 14px",
                borderBottom: i < answers.length - 1 ? `1px solid ${isDark()?"rgba(255,255,255,0.05)":"rgba(91,79,232,0.06)"}` : "none",
                background: a.isOk
                  ? (isDark() ? "rgba(46,204,154,0.06)" : "rgba(46,204,154,0.04)")
                  : (isDark() ? "rgba(239,68,68,0.06)"  : "rgba(239,68,68,0.04)"),
              }}>
                {/* Q number */}
                <div style={{ width:24, height:24, borderRadius:8, background: a.isOk ? "#2ECC9A22" : "#ef444422", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color: a.isOk ? "#2ECC9A" : "#ef4444", flexShrink:0 }}>
                  {i + 1}
                </div>
                {/* Question */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:textColor(), overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.q}</div>
                  <div style={{ fontSize:11, color:C.dim, marginTop:2, display:"flex", gap:10 }}>
                    <span>Your answer: <strong style={{ color: a.isOk ? "#2ECC9A" : "#ef4444" }}>{a.given}</strong></span>
                    {!a.isOk && <span>Correct: <strong style={{ color:"#2ECC9A" }}>{a.correct}</strong></span>}
                  </div>
                </div>
                {/* Status icon */}
                <div style={{ fontSize:18, flexShrink:0 }}>{a.isOk ? "✅" : "❌"}</div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display:"flex", gap:10 }}>
          <Btn color={C.dim}          style={{ flex:1, padding:12 }} onClick={onMap}>LEVEL MAP</Btn>
          <Btn color={C.purple||"#a855f7"} style={{ flex:1, padding:12 }} onClick={onRetry}>RETRY 🔄</Btn>
          {nextUnlocked && (
            <Btn color="#2ECC9A" style={{ flex:1, padding:12 }} onClick={onNext}>LVL {level+1} →</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Abacus (main export) ──────────────────────────────────────────────────────
export function Abacus({ onBack, child }) {
  const classNum    = parseInt(child?.class_num) || 1;
  const levels      = ABACUS_LEVELS_BY_CLASS[classNum] || ABACUS_LEVELS_BY_CLASS[1];
  const totalLevels = levels.length;

  const [screen,      setScreen]      = useState("map");
  const [activeLevel, setActiveLevel] = useState(1);
  const [progress,    setProgress]    = useState([]);
  const [lastResult,  setLastResult]  = useState(null);

  useEffect(() => {
    if (!child?.id) return;
    db.getProgress(child.id).then(({ data }) => {
      if (!data) return;
      const prefix = `abacus_c${classNum}_lvl_`;
      setProgress(data.filter(p => p.lesson_id?.startsWith(prefix)));
    });
  }, [child?.id, classNum]);

  const handleSelectLevel = (lvNum) => { setActiveLevel(lvNum); setScreen("quiz"); };

  const handleComplete = (result) => {
    const key = progressKey(classNum, result.level);
    setProgress(prev => {
      const existing = prev.find(p => p.lesson_id === key);
      if (existing) return prev.map(p => p.lesson_id === key ? { ...p, stars_earned: Math.max(p.stars_earned||0, result.stars) } : p);
      return [...prev, { lesson_id: key, stars_earned: result.stars, child_id: child?.id }];
    });
    setLastResult(result);
    setScreen("results");
  };

  if (screen === "results" && lastResult) {
    return (
      <ResultsScreen
        classNum={classNum}
        result={lastResult}
        totalLevels={totalLevels}
        onRetry={() => { setActiveLevel(lastResult.level); setScreen("quiz"); }}
        onNext={() => { setActiveLevel(lastResult.level + 1); setScreen("quiz"); }}
        onMap={() => setScreen("map")}
      />
    );
  }

  if (screen === "quiz") {
    const levelData = levels.find(l => l.level === activeLevel) || levels[0];
    return (
      <QuizScreen
        classNum={classNum}
        levelData={levelData}
        child={child}
        onBack={() => setScreen("map")}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <LevelMap
      classNum={classNum}
      levels={levels}
      progress={progress}
      onSelectLevel={handleSelectLevel}
      onBack={onBack}
    />
  );
}