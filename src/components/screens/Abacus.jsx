// src/components/screens/Abacus.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { C, textColor, isDark } from '../../constants/themes.js';
import { db, fetchAbacusQuestions } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, BackBtn, AbacusRod } from '../ui/primitives.jsx';
import { Starfield } from '../layout/layout.jsx';
import { ABACUS_LEVELS_BY_CLASS, ABACUS_CLASS_META } from '../../constants/abacusData.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const TIERS = [
  { name:"Starter",   icon:"🌱", color:"#22c55e" },
  { name:"Explorer",  icon:"🔭", color:"#3b82f6" },
  { name:"Champion",  icon:"🏆", color:"#f97316" },
  { name:"Master",    icon:"👑", color:"#a855f7" },
];

// Divide levels array into 4 roughly equal tier groups
function buildTiers(levels) {
  const n = levels.length;
  // Split as evenly as possible into 4 groups
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
  sizes.forEach((size, ti) => {
    tiers.push(levels.slice(cursor, cursor + size));
    cursor += size;
  });
  return tiers;
}

// Progress key per class+level
function progressKey(classNum, levelNum) {
  return `abacus_c${classNum}_lvl_${levelNum}`;
}

// Stars from score
function starsFor(correct, total) {
  const pct = correct / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.7) return 2;
  if (pct >= 0.5) return 1;
  return 0;
}

// ── StarRow ───────────────────────────────────────────────────────────────────
function StarRow({ stars, size = 14 }) {
  return (
    <span style={{ display:"inline-flex", gap:1 }}>
      {[1,2,3].map(i => (
        <span key={i} style={{ fontSize:size, opacity: i <= stars ? 1 : 0.2 }}>★</span>
      ))}
    </span>
  );
}

// ── LevelMap ──────────────────────────────────────────────────────────────────
function LevelMap({ classNum, levels, progress, onSelectLevel, onBack }) {
  const meta      = ABACUS_CLASS_META[parseInt(classNum)] || {};
  const tierGroups = buildTiers(levels);
  const earned    = progress.reduce((a, p) => a + (p.stars_earned || 0), 0);
  const maxStars  = levels.length * 3;

  // A level is unlocked only if the previous level has 3 stars (or it's level 1)
  const getStars = (lvNum) => {
    const p = progress.find(p => p.lesson_id === progressKey(classNum, lvNum));
    return p?.stars_earned || 0;
  };
  const isUnlocked = (lvNum) => {
    if (lvNum === 1) return true;
    return getStars(lvNum - 1) >= 3;
  };
  const isCompleted = (lvNum) => getStars(lvNum) > 0;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Baloo 2','Nunito',sans-serif", position:"relative", paddingBottom:32 }}>
      <Starfield n={isDark() ? 20 : 6}/>

      {/* Header */}
      <div style={{ position:"sticky", top:0, zIndex:10, background:`linear-gradient(135deg,#FFC84720,#FF6B6B10)`, borderBottom:`1.5px solid #FFC84730`, padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <BackBtn onClick={onBack} color="#FFC847"/>
          <div style={{ width:44, height:44, borderRadius:14, background:"linear-gradient(135deg,#FFC847,#FF6B6B)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>🧮</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:"#FFC847", letterSpacing:2 }}>SPACE ABACUS</div>
            <div style={{ fontSize:15, fontWeight:900, color:textColor() }}>{meta.icon} {meta.name}</div>
            <div style={{ fontSize:10, color:C.dim }}>{meta.focus}</div>
          </div>
          <div style={{ textAlign:"center", background:`#FFC84718`, border:`1px solid #FFC84744`, borderRadius:12, padding:"6px 12px" }}>
            <div style={{ fontSize:16 }}>⭐</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:"#FFC847", fontWeight:900 }}>{earned}/{maxStars}</div>
          </div>
        </div>
        {/* Overall progress bar */}
        <div style={{ background:"rgba(255,200,71,0.12)", borderRadius:6, height:7, overflow:"hidden" }}>
          <div style={{ width:`${maxStars > 0 ? (earned / maxStars) * 100 : 0}%`, height:"100%", background:"linear-gradient(90deg,#FFC847,#FF6B6B)", borderRadius:6, transition:"width 0.6s ease" }}/>
        </div>
        <div style={{ marginTop:4, fontSize:10, color:C.dim, fontFamily:"'Orbitron',sans-serif" }}>
          {progress.filter(p => p.lesson_id?.startsWith(`abacus_c${classNum}_lvl_`)).length}/{levels.length} LEVELS DONE · 3 ★ to unlock next
        </div>
      </div>

      {/* Tier sections */}
      <div style={{ position:"relative", zIndex:2, padding:"16px 18px", display:"flex", flexDirection:"column", gap:16 }}>
        {tierGroups.map((tierLevels, ti) => {
          if (!tierLevels.length) return null;
          const tier         = TIERS[ti];
          const tierDone     = tierLevels.filter(lv => isCompleted(lv.level)).length;
          const tierTotal    = tierLevels.length;
          const tierComplete = tierDone === tierTotal && tierLevels.every(lv => getStars(lv.level) === 3);
          const tierUnlocked = isUnlocked(tierLevels[0].level);
          const firstLevel   = tierLevels[0].level;
          const lastLevel    = tierLevels[tierLevels.length - 1].level;

          return (
            <div key={ti} style={{
              background: C.card || (isDark() ? "#ffffff08" : "#fff"),
              border: `1.5px solid ${tierComplete ? tier.color + "66" : tierUnlocked ? tier.color + "33" : isDark() ? "rgba(255,255,255,0.06)" : "#e5e7eb"}`,
              borderRadius:22,
              overflow:"hidden",
              boxShadow: tierComplete ? `0 4px 18px ${tier.color}22` : "none",
            }}>
              {/* Tier header */}
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background: tierComplete ? `linear-gradient(135deg,${tier.color}22,${tier.color}08)` : tierUnlocked ? `${tier.color}0a` : "transparent" }}>
                <div style={{ fontSize:26 }}>{tier.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:900, color: tierUnlocked ? tier.color : C.dim }}>
                    {tier.name} — Levels {firstLevel}–{lastLevel}
                  </div>
                  <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>
                    {tierDone}/{tierTotal} complete · needs 3★ to progress
                  </div>
                </div>
                {tierComplete && <div style={{ fontSize:20 }}>✅</div>}
                {!tierUnlocked && <div style={{ fontSize:18 }}>🔒</div>}
              </div>

              {/* Level cards grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, padding:"8px 12px 14px" }}>
                {tierLevels.map((lv) => {
                  const lvStars    = getStars(lv.level);
                  const lvDone     = lvStars > 0;
                  const lvUnlocked = isUnlocked(lv.level);
                  const isCurrent  = lvUnlocked && !lvDone;
                  const is3Star    = lvStars === 3;

                  return (
                    <button key={lv.level}
                      onClick={() => {
                        if (lvUnlocked) { SFX.tap(); onSelectLevel(lv.level); }
                        else SFX.wrong();
                      }}
                      style={{
                        background: is3Star
                          ? `linear-gradient(135deg,${tier.color}22,${tier.color}0a)`
                          : lvDone
                            ? `${C.green || "#2ECC9A"}12`
                            : isCurrent
                              ? isDark() ? "#ffffff12" : "#fff"
                              : isDark() ? "#ffffff05" : "#f5f3ff",
                        border: `2px solid ${is3Star ? tier.color + "55" : lvDone ? "#2ECC9A44" : isCurrent ? tier.color + "55" : "rgba(91,79,232,0.10)"}`,
                        borderRadius:14,
                        padding:"10px 6px",
                        cursor: lvUnlocked ? "pointer" : "not-allowed",
                        textAlign:"center",
                        opacity: lvUnlocked ? 1 : 0.5,
                        boxShadow: isCurrent ? `0 4px 16px ${tier.color}44` : is3Star ? `0 2px 10px ${tier.color}33` : "none",
                        transform: isCurrent ? "scale(1.04)" : "none",
                        transition:"all 0.2s",
                        position:"relative",
                      }}>
                      {/* Status icon */}
                      <div style={{ fontSize: isCurrent ? 20 : 16, marginBottom:3 }}>
                        {!lvUnlocked ? "🔒" : is3Star ? "✅" : lvDone ? "▶" : "▶"}
                      </div>
                      {/* Level number */}
                      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:9, color: is3Star ? tier.color : isCurrent ? tier.color : C.dim, fontWeight:900 }}>
                        LVL {lv.level}
                      </div>
                      {/* Title */}
                      <div style={{ fontSize:9, fontWeight:700, color:textColor(), lineHeight:1.3, margin:"3px 0", minHeight:24 }}>
                        {lvUnlocked ? lv.title : `Level ${lv.level}`}
                      </div>
                      {/* Stars */}
                      {lvUnlocked && (
                        <div style={{ marginTop:2 }}>
                          <StarRow stars={lvStars} size={11}/>
                        </div>
                      )}
                      {/* NEXT badge */}
                      {isCurrent && (
                        <div style={{ position:"absolute", top:-6, right:-4, background:tier.color, borderRadius:6, padding:"2px 5px", fontSize:7, color:"#fff", fontWeight:900 }}>
                          NEXT
                        </div>
                      )}
                      {/* 3★ unlocks next indicator */}
                      {lvDone && !is3Star && lvUnlocked && (
                        <div style={{ fontSize:8, color:C.dim, marginTop:2 }}>need 3★</div>
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

// ── QuizScreen ────────────────────────────────────────────────────────────────
function QuizScreen({ classNum, levelData, onBack, onComplete, child }) {
  const [probs,    setProbs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [pi,       setPi]       = useState(0);
  const [tens,     setTens]     = useState(0);
  const [ones,     setOnes]     = useState(0);
  const [hundreds, setHundreds] = useState(0);
  const [checked,  setChecked]  = useState(false);
  const [qCorrect, setQCorrect] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchAbacusQuestions(classNum, levelData.level).then(qs => {
      setProbs(qs.length > 0 ? qs : levelData.probs);
      setLoading(false);
    });
  }, [classNum, levelData.level]);

  const prob  = probs[pi] || { q:"", t:0, o:0 };
  const hasH  = typeof prob.h === "number" && prob.h > 0;
  const isOk  = checked && tens === prob.t && ones === prob.o && (!hasH || hundreds === prob.h);
  const total = probs.length;

  const reset = () => { setTens(0); setOnes(0); setHundreds(0); setChecked(false); };

  const handleNext = useCallback(() => {
    const newCorrect = qCorrect + (isOk ? 1 : 0);
    if (pi + 1 >= total) {
      const stars = starsFor(newCorrect, total);
      const xp    = newCorrect * 5;
      if (child?.id) {
        db.saveProgress(child.id, progressKey(classNum, levelData.level), {
          correct: newCorrect, total, stars, xpEarned: xp,
          isSchoolStudent: !!(child.is_school_student),
        });
      }
      isOk ? SFX.correct() : SFX.wrong();
      onComplete({ correct: newCorrect, total, stars, level: levelData.level });
    } else {
      setQCorrect(newCorrect);
      setPi(p => p + 1);
      reset();
    }
  }, [pi, total, isOk, qCorrect, classNum, levelData.level, child]);

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
      <div style={{ position:"relative", zIndex:2, background:"linear-gradient(135deg,#FFC84720,#FF6B6B10)", borderBottom:`1.5px solid #FFC84730`, padding:"12px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <BackBtn onClick={onBack} color="#FFC847"/>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:9, color:"#FFC847", letterSpacing:2 }}>
              {meta.name} · LEVEL {levelData.level}
            </div>
            <div style={{ fontSize:14, fontWeight:900, color:textColor() }}>{levelData.title}</div>
          </div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.dim }}>Q{pi+1}/{total}</div>
        </div>
        <div style={{ marginTop:8, background:"rgba(255,200,71,0.12)", borderRadius:5, height:5, overflow:"hidden" }}>
          <div style={{ width:`${(pi/total)*100}%`, height:"100%", background:"linear-gradient(90deg,#FFC847,#FF6B6B)", borderRadius:5, transition:"width 0.3s ease" }}/>
        </div>
      </div>

      <div style={{ position:"relative", zIndex:2, padding:18 }}>
        {/* Question card */}
        <div style={{ background: isDark() ? "rgba(255,200,71,0.06)" : "rgba(255,200,71,0.10)", border:`1.5px solid #FFC84733`, borderRadius:18, padding:"16px 14px", textAlign:"center", marginBottom:14 }}>
          <div style={{ fontSize:28, marginBottom:6, animation:"mmFloat 2.5s ease-in-out infinite" }}>🧮</div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:textColor(), lineHeight:1.3 }}>{prob.q}</div>
        </div>

        {/* Rods */}
        <div style={{ display:"flex", gap:16, justifyContent:"center", marginBottom:14 }}>
          {hasH && <AbacusRod count={hundreds} setCount={setHundreds} color={C.pink || "#ec4899"} label="HUNDREDS"/>}
          <AbacusRod count={tens}     setCount={setTens}     color={C.orange || "#f97316"} label="TENS"/>
          <AbacusRod count={ones}     setCount={setOnes}     color={C.cyan  || "#22d3ee"} label="ONES"/>
        </div>

        {/* Total display */}
        <div style={{ textAlign:"center", marginBottom:12, fontFamily:"'Orbitron',sans-serif", fontSize:44, fontWeight:900, color:C.purple || "#a855f7", textShadow:`0 0 16px ${C.purple || "#a855f7"}66` }}>
          {(hasH ? hundreds * 100 : 0) + tens * 10 + ones}
        </div>

        {/* Feedback */}
        {checked && (
          <div style={{ background: isOk ? `${C.green || "#2ECC9A"}18` : `${C.red || "#ef4444"}18`, border:`1px solid ${isOk ? (C.green || "#2ECC9A") : (C.red || "#ef4444")}44`, borderRadius:14, padding:"10px 14px", textAlign:"center", marginBottom:12 }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color: isOk ? (C.green || "#2ECC9A") : (C.red || "#ef4444") }}>
              {isOk
                ? "🚀 PERFECT!"
                : `💡 Answer: ${hasH ? prob.h + "h + " : ""}${prob.t} tens + ${prob.o} ones = ${(hasH ? prob.h * 100 : 0) + prob.t * 10 + prob.o}`}
            </div>
          </div>
        )}

        {!checked
          ? <Btn color={C.purple || "#a855f7"} onClick={() => { isOk ? SFX.correct() : SFX.wrong(); setChecked(true); }}>
              CHECK ANSWER ✓
            </Btn>
          : <Btn color={isOk ? (C.yellow || "#FFC847") : (C.orange || "#f97316")} onClick={handleNext}>
              {pi + 1 >= total ? "FINISH LEVEL 🎉" : "NEXT →"}
            </Btn>
        }
      </div>
    </div>
  );
}

// ── LevelComplete ─────────────────────────────────────────────────────────────
function LevelComplete({ classNum, result, totalLevels, onNext, onMap }) {
  const { correct, total, stars, level } = result;
  const hasNext      = level < totalLevels;
  const nextUnlocked = stars === 3 && hasNext;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Baloo 2','Nunito',sans-serif", padding:22, position:"relative" }}>
      <Starfield n={isDark() ? 50 : 15}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:300, width:"100%" }}>
        <div style={{ fontSize:64, marginBottom:8 }}>🧮✨</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:18, fontWeight:900, color:textColor(), marginBottom:4 }}>
          Level {level} Complete!
        </div>
        <div style={{ marginBottom:8 }}>
          <StarRow stars={stars} size={28}/>
        </div>
        <div style={{ color: C.yellow || "#FFC847", fontSize:16, fontWeight:900, marginBottom:4 }}>
          {correct}/{total} correct
        </div>
        <div style={{ color:C.dim, fontSize:13, marginBottom:16 }}>+{correct * 5} XP earned</div>

        {/* 3-star unlock message */}
        {nextUnlocked ? (
          <div style={{ background:`${C.green || "#2ECC9A"}18`, border:`1px solid ${C.green || "#2ECC9A"}44`, borderRadius:12, padding:"10px 14px", marginBottom:16 }}>
            <div style={{ color: C.green || "#2ECC9A", fontSize:12, fontFamily:"'Orbitron',sans-serif", fontWeight:900 }}>
              🔓 LEVEL {level + 1} UNLOCKED!
            </div>
          </div>
        ) : hasNext && stars < 3 ? (
          <div style={{ background:`${C.orange || "#f97316"}18`, border:`1px solid ${C.orange || "#f97316"}44`, borderRadius:12, padding:"10px 14px", marginBottom:16 }}>
            <div style={{ color: C.orange || "#f97316", fontSize:12, fontFamily:"'Orbitron',sans-serif", fontWeight:900 }}>
              ⭐ GET 3 STARS TO UNLOCK LEVEL {level + 1}
            </div>
            <div style={{ fontSize:11, color:C.dim, marginTop:4 }}>
              Score {Math.ceil(total * 0.9)}/{total} or better to get 3★
            </div>
          </div>
        ) : null}

        <div style={{ display:"flex", gap:10, width:"100%" }}>
          <Btn color={C.dim} style={{ flex:1, padding:11 }} onClick={onMap}>
            LEVEL MAP
          </Btn>
          {/* Retry always available */}
          <Btn color={C.purple || "#a855f7"} style={{ flex:1, padding:11 }} onClick={() => onMap("retry", level)}>
            RETRY 🔄
          </Btn>
          {nextUnlocked && (
            <Btn color={C.cyan || "#22d3ee"} style={{ flex:1, padding:11 }} onClick={onNext}>
              LVL {level + 1} →
            </Btn>
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

  // Load progress
  useEffect(() => {
    if (!child?.id) return;
    db.getProgress(child.id).then(({ data }) => {
      if (!data) return;
      const prefix = `abacus_c${classNum}_lvl_`;
      setProgress(data.filter(p => p.lesson_id?.startsWith(prefix)));
    });
  }, [child?.id, classNum]);

  const handleSelectLevel = (lvNum) => {
    setActiveLevel(lvNum);
    setScreen("quiz");
  };

  const handleComplete = (result) => {
    // Update local progress
    const key = progressKey(classNum, result.level);
    setProgress(prev => {
      const existing = prev.find(p => p.lesson_id === key);
      if (existing) {
        return prev.map(p => p.lesson_id === key
          ? { ...p, stars_earned: Math.max(p.stars_earned || 0, result.stars) }
          : p);
      }
      return [...prev, { lesson_id: key, stars_earned: result.stars, child_id: child?.id }];
    });
    setLastResult(result);
    setScreen("complete");
  };

  // onMap callback — handles retry or just going back to map
  const handleMap = (action, lvNum) => {
    if (action === "retry" && lvNum) {
      setActiveLevel(lvNum);
      setScreen("quiz");
    } else {
      setScreen("map");
    }
  };

  const handleNextLevel = () => {
    setActiveLevel(l => l + 1);
    setScreen("quiz");
  };

  if (screen === "complete" && lastResult) {
    return (
      <LevelComplete
        classNum={classNum}
        result={lastResult}
        totalLevels={totalLevels}
        onNext={handleNextLevel}
        onMap={handleMap}
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