// src/components/screens/Abacus.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { fetchAbacusQuestions } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, BackBtn, AbacusRod } from '../ui/primitives.jsx';
import { Starfield } from '../layout/layout.jsx';
import { ABACUS_LEVELS_BY_CLASS, ABACUS_CLASS_META } from '../../constants/abacusData.js';

// ── helpers ──────────────────────────────────────────────────────────────────
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

function StarRow({ stars, size = 16 }) {
  return (
    <span style={{ display:'inline-flex', gap:2 }}>
      {[1,2,3].map(i => (
        <span key={i} style={{ fontSize:size, opacity: i <= stars ? 1 : 0.25 }}>★</span>
      ))}
    </span>
  );
}

// ── LevelMap ─────────────────────────────────────────────────────────────────
function LevelMap({ classNum, levels, unlockedLvl, progress, onSelectLevel, onBack }) {
  const meta   = ABACUS_CLASS_META[parseInt(classNum)] || {};
  const earned = progress.reduce((acc, p) => acc + (p.stars_earned || 0), 0);
  const maxStar = levels.length * 3;

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:"'Baloo 2','Nunito',sans-serif", position:'relative' }}>
      <Starfield n={isDark() ? 20 : 6}/>

      {/* Header */}
      <div style={{ position:'relative', zIndex:2, background:'linear-gradient(135deg,#FFC84720,#FF6B6B10)', borderBottom:`1.5px solid #FFC84730`, padding:'14px 18px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
          <BackBtn onClick={onBack} color="#FFC847"/>
          <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,#FFC847,#FF6B6B)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>🧮</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:'#FFC847', letterSpacing:2 }}>SPACE ABACUS</div>
            <div style={{ fontSize:16, fontWeight:900, color:textColor() }}>
              {meta.icon} {meta.name} — Abacus
            </div>
            <div style={{ fontSize:11, color:C.dim }}>{meta.focus}</div>
          </div>
          {/* Stars summary */}
          <div style={{ textAlign:'center', background:`${C.yellow}18`, border:`1px solid ${C.yellow}44`, borderRadius:12, padding:'6px 12px' }}>
            <div style={{ fontSize:18, lineHeight:1 }}>⭐</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.yellow, fontWeight:900 }}>{earned}/{maxStar}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background:'rgba(255,200,71,0.12)', borderRadius:6, height:6, overflow:'hidden' }}>
          <div style={{ width:`${maxStar > 0 ? (earned/maxStar)*100 : 0}%`, height:'100%', background:'linear-gradient(90deg,#FFC847,#FF6B6B)', borderRadius:6, transition:'width 0.5s ease' }}/>
        </div>
        <div style={{ marginTop:4, fontSize:10, color:C.dim, fontFamily:"'Orbitron',sans-serif" }}>
          {unlockedLvl - 1}/{levels.length} LEVELS COMPLETED
        </div>
      </div>

      {/* Level grid */}
      <div style={{ position:'relative', zIndex:2, padding:'18px 14px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {levels.map((lv) => {
            const isUnlocked = lv.level < unlockedLvl;
            const isCurrent  = lv.level === unlockedLvl;
            const prog       = progress.find(p => p.lesson_id === progressKey(classNum, lv.level));
            const stars      = prog?.stars_earned || 0;
            const completed  = !!prog;

            const bgColor = completed
              ? `linear-gradient(135deg,${C.green}22,${C.cyan}11)`
              : isCurrent
                ? `linear-gradient(135deg,#FFC84722,#FF6B6B11)`
                : isUnlocked
                  ? `${C.card || '#F0ECFF'}cc`
                  : isDark() ? '#ffffff08' : '#f5f3ff';

            const borderColor = completed
              ? `${C.green}55`
              : isCurrent
                ? '#FFC84766'
                : isUnlocked
                  ? '#FFC84733'
                  : 'rgba(91,79,232,0.1)';

            return (
              <button key={lv.level}
                onClick={() => (isUnlocked || isCurrent) && onSelectLevel(lv.level)}
                style={{
                  background: bgColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: 16,
                  padding: '12px 8px',
                  cursor: (isUnlocked || isCurrent) ? 'pointer' : 'not-allowed',
                  textAlign: 'center',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: isCurrent ? `0 4px 16px ${C.yellow}33` : completed ? `0 2px 8px ${C.green}22` : 'none',
                  position: 'relative',
                  opacity: (!isUnlocked && !isCurrent) ? 0.55 : 1,
                }}>
                {/* Lock icon */}
                {!isUnlocked && !isCurrent && (
                  <div style={{ fontSize:18, marginBottom:4 }}>🔒</div>
                )}
                {/* Level number badge */}
                {(isUnlocked || isCurrent) && (
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:9, color: completed ? C.green : isCurrent ? '#FFC847' : C.dim, fontWeight:900, marginBottom:2 }}>
                    LVL {lv.level}
                  </div>
                )}
                {/* Title */}
                <div style={{ fontSize:10, fontWeight:700, color: textColor(), lineHeight:1.3, marginBottom:6, minHeight:28 }}>
                  {(!isUnlocked && !isCurrent) ? `Level ${lv.level}` : lv.title}
                </div>
                {/* Stars */}
                {(isUnlocked || isCurrent) && (
                  <div style={{ marginBottom:4 }}>
                    <StarRow stars={stars} size={12}/>
                  </div>
                )}
                {/* Question count */}
                {(isUnlocked || isCurrent) && (
                  <div style={{ fontSize:9, color:C.dim }}>{lv.probs.length} Qs</div>
                )}
                {/* Current level pulse */}
                {isCurrent && !completed && (
                  <div style={{ position:'absolute', top:6, right:6, width:8, height:8, borderRadius:'50%', background:'#FFC847', animation:'mmFloat 1.5s ease-in-out infinite' }}/>
                )}
              </button>
            );
          })}
        </div>
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
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAbacusQuestions(classNum, levelData.level).then(qs => {
      setProbs(qs.length > 0 ? qs : levelData.probs);
      setLoading(false);
    });
  }, [classNum, levelData.level]);

  const prob  = probs[pi] || { q:'', t:0, o:0 };
  const hasH  = typeof prob.h === 'number' && prob.h > 0;
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
      SFX.play('correct');
      onComplete({ correct: newCorrect, total, stars, level: levelData.level });
    } else {
      setQCorrect(newCorrect);
      setPi(p => p + 1);
      reset();
    }
  }, [pi, total, isOk, qCorrect, classNum, levelData.level, child]);

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
        <div style={{ fontSize:40, animation:'mmFloat 1.5s ease-in-out infinite' }}>🧮</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color:C.dim }}>LOADING QUESTIONS…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:"'Baloo 2','Nunito',sans-serif", position:'relative' }}>
      <Starfield n={isDark() ? 20 : 6}/>

      {/* Header */}
      <div style={{ position:'relative', zIndex:2, background:'linear-gradient(135deg,#FFC84720,#FF6B6B10)', borderBottom:`1.5px solid #FFC84730`, padding:'12px 18px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <BackBtn onClick={onBack} color="#FFC847"/>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:9, color:'#FFC847', letterSpacing:2 }}>
              {ABACUS_CLASS_META[parseInt(classNum)]?.name} · LEVEL {levelData.level}
            </div>
            <div style={{ fontSize:14, fontWeight:900, color:textColor() }}>{levelData.title}</div>
          </div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.dim }}>Q{pi+1}/{total}</div>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop:8, background:'rgba(255,200,71,0.12)', borderRadius:5, height:5, overflow:'hidden' }}>
          <div style={{ width:`${(pi/total)*100}%`, height:'100%', background:'linear-gradient(90deg,#FFC847,#FF6B6B)', borderRadius:5, transition:'width 0.3s ease' }}/>
        </div>
      </div>

      <div style={{ position:'relative', zIndex:2, padding:18 }}>
        {/* Question card */}
        <div style={{ background: isDark() ? 'rgba(255,200,71,0.06)' : 'rgba(255,200,71,0.1)', border:`1.5px solid #FFC84733`, borderRadius:18, padding:'16px 14px', textAlign:'center', marginBottom:14 }}>
          <div style={{ fontSize:28, marginBottom:6, animation:'mmFloat 2.5s ease-in-out infinite' }}>🧮</div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:textColor(), lineHeight:1.3 }}>{prob.q}</div>
        </div>

        {/* Rods */}
        <div style={{ display:'flex', gap:16, justifyContent:'center', marginBottom:14 }}>
          {hasH && <AbacusRod count={hundreds} setCount={setHundreds} color={C.pink}   label="HUNDREDS"/>}
          <AbacusRod count={tens}     setCount={setTens}     color={C.orange} label="TENS"/>
          <AbacusRod count={ones}     setCount={setOnes}     color={C.cyan}   label="ONES"/>
        </div>

        {/* Display total */}
        <div style={{ textAlign:'center', marginBottom:12, fontFamily:"'Orbitron',sans-serif", fontSize:44, fontWeight:900, color:C.purple, textShadow:`0 0 16px ${C.purple}66` }}>
          {(hasH ? hundreds * 100 : 0) + tens * 10 + ones}
        </div>

        {/* Feedback */}
        {checked && (
          <div style={{ background: isOk ? `${C.green}18` : `${C.red}18`, border:`1px solid ${isOk ? C.green : C.red}44`, borderRadius:14, padding:'10px 14px', textAlign:'center', marginBottom:12 }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color: isOk ? C.green : C.red }}>
              {isOk
                ? '🚀 PERFECT!'
                : `💡 Answer: ${hasH ? prob.h + 'h + ' : ''}${prob.t} tens + ${prob.o} ones = ${(hasH ? prob.h * 100 : 0) + prob.t * 10 + prob.o}`}
            </div>
          </div>
        )}

        {!checked
          ? <Btn color={C.purple} onClick={() => { SFX.play(isOk ? 'correct' : 'wrong'); setChecked(true); }}>
              CHECK ANSWER ✓
            </Btn>
          : <Btn color={isOk ? C.yellow : C.orange} onClick={handleNext}>
              {pi + 1 >= total ? 'FINISH LEVEL 🎉' : 'NEXT →'}
            </Btn>
        }
      </div>
    </div>
  );
}

// ── LevelComplete ─────────────────────────────────────────────────────────────
function LevelComplete({ classNum, result, totalLevels, onNext, onMap }) {
  const { correct, total, stars, level } = result;
  const hasNext = level < totalLevels;
  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Baloo 2','Nunito',sans-serif", padding:22, position:'relative' }}>
      <Starfield n={isDark() ? 50 : 15}/>
      <div style={{ position:'relative', zIndex:1, textAlign:'center', animation:'popIn 0.5s ease', maxWidth:300, width:'100%' }}>
        <div style={{ fontSize:64, marginBottom:8 }}>🧮✨</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:20, fontWeight:900, color:textColor(), marginBottom:4 }}>
          Level {level} Complete!
        </div>
        <div style={{ marginBottom:8 }}>
          <StarRow stars={stars} size={28}/>
        </div>
        <div style={{ color:C.yellow, fontSize:16, fontWeight:900, marginBottom:6 }}>
          {correct}/{total} correct
        </div>
        <div style={{ color:C.dim, fontSize:13, marginBottom:20 }}>
          +{correct * 5} XP earned
        </div>
        {hasNext && (
          <div style={{ background:`${C.green}18`, border:`1px solid ${C.green}44`, borderRadius:12, padding:'8px 14px', marginBottom:16 }}>
            <div style={{ color:C.green, fontSize:11, fontFamily:"'Orbitron',sans-serif" }}>🔓 LEVEL {level + 1} UNLOCKED!</div>
          </div>
        )}
        <div style={{ display:'flex', gap:10, width:'100%' }}>
          <Btn color={C.dim}  style={{ flex:1, padding:11 }} onClick={onMap}>LEVEL MAP</Btn>
          {hasNext && (
            <Btn color={C.cyan} style={{ flex:1, padding:11 }} onClick={onNext}>
              LEVEL {level + 1} →
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Abacus (main export) ──────────────────────────────────────────────────────
export function Abacus({ onBack, child }) {
  const classNum   = parseInt(child?.class_num) || 1;
  const levels     = ABACUS_LEVELS_BY_CLASS[classNum] || ABACUS_LEVELS_BY_CLASS[1];
  const totalLevels = levels.length;

  const [screen,      setScreen]      = useState('map');   // 'map' | 'quiz' | 'complete'
  const [activeLevel, setActiveLevel] = useState(1);
  const [unlockedLvl, setUnlockedLvl] = useState(1);
  const [progress,    setProgress]    = useState([]);
  const [lastResult,  setLastResult]  = useState(null);

  // Load progress from DB on mount
  useEffect(() => {
    if (!child?.id) return;
    db.getProgress(child.id).then(({ data }) => {
      if (!data) return;
      // Filter to this class's abacus entries
      const prefix = `abacus_c${classNum}_lvl_`;
      const abacusProg = data.filter(p => p.lesson_id?.startsWith(prefix));
      setProgress(abacusProg);
      let maxUnlocked = 1;
      abacusProg.forEach(p => {
        const m = p.lesson_id?.match(new RegExp(`^abacus_c${classNum}_lvl_(\\d+)$`));
        if (m) maxUnlocked = Math.max(maxUnlocked, parseInt(m[1]) + 1);
      });
      setUnlockedLvl(Math.min(maxUnlocked, totalLevels + 1));
    });
  }, [child?.id, classNum, totalLevels]);

  const handleSelectLevel = (lvNum) => {
    setActiveLevel(lvNum);
    setScreen('quiz');
  };

  const handleComplete = (result) => {
    // Unlock next level
    const nextUnlock = result.level + 1;
    setUnlockedLvl(u => Math.max(u, Math.min(nextUnlock + 1, totalLevels + 1)));
    // Update local progress state
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
    setScreen('complete');
  };

  const handleNextLevel = () => {
    setActiveLevel(l => l + 1);
    setScreen('quiz');
  };

  if (screen === 'complete' && lastResult) {
    return (
      <LevelComplete
        classNum={classNum}
        result={lastResult}
        totalLevels={totalLevels}
        onNext={handleNextLevel}
        onMap={() => setScreen('map')}
      />
    );
  }

  if (screen === 'quiz') {
    const levelData = levels.find(l => l.level === activeLevel) || levels[0];
    return (
      <QuizScreen
        classNum={classNum}
        levelData={levelData}
        child={child}
        onBack={() => setScreen('map')}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <LevelMap
      classNum={classNum}
      levels={levels}
      unlockedLvl={unlockedLvl}
      progress={progress}
      onSelectLevel={handleSelectLevel}
      onBack={onBack}
    />
  );
}