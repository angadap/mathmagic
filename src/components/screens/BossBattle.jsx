// src/components/screens/BossBattle.jsx
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, isDark } from '../../constants/themes.js';
import { BOSSES, BOSS_LEVELS } from '../../constants/bossData.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, BackBtn, Card } from '../ui/primitives.jsx';
import { Starfield, Confetti } from '../layout/layout.jsx';
import { getHintsRemaining, useHint } from '../../lib/hints.js';

const CLASS_NAMES = {
  10:"Nursery", 11:"Jr KG", 12:"Sr KG",
  1:"Class 1", 2:"Class 2", 3:"Class 3", 4:"Class 4", 5:"Class 5",
};

const LEVEL_COLORS = {
  minion:"#2ECC9A", warrior:"#FFC847", champion:"#FF8C42", legend:"#FF6B6B", god:"#9B59F5",
};

function getFallbackQuestions(theme, levelKey, count) {
  const base = [
    { q:"What is 5 + 3?",      opts:["6","8","7","9"],         ans:1, h:"Count on from 5" },
    { q:"What is 10 - 4?",     opts:["5","7","6","8"],         ans:2, h:"Count back from 10" },
    { q:"What is 3 x 4?",      opts:["10","11","12","13"],     ans:2, h:"3 groups of 4" },
    { q:"What is 20 / 4?",     opts:["4","5","6","7"],         ans:1, h:"How many 4s in 20" },
    { q:"What is 15 + 8?",     opts:["21","22","23","24"],     ans:2, h:"Add 5 then 3" },
    { q:"What is 7 x 6?",      opts:["40","41","42","43"],     ans:2, h:"7 times 6" },
    { q:"What is 100 - 37?",   opts:["63","62","64","61"],     ans:0, h:"Subtract from 100" },
    { q:"What is 9 x 9?",      opts:["80","81","82","79"],     ans:1, h:"9 times table" },
    { q:"What is 48 / 6?",     opts:["7","8","9","6"],         ans:1, h:"6 times what equals 48" },
    { q:"What is 25 + 37?",    opts:["61","62","63","60"],     ans:1, h:"Add tens then units" },
  ];
  const result = [];
  for (let i = 0; i < count; i++) result.push(base[i % base.length]);
  return result;
}

export function BossBattle({ child, setChild, onBack }) {

  // ── State ────────────────────────────────────────────────────────────
  const [view,            setView]            = useState("arena");
  const [bossProgress,    setBossProgress]    = useState([]);
  const [activeBoss,      setActiveBoss]      = useState(null);
  const [activeLevel,     setActiveLevel]     = useState(null);
  const [questions,       setQuestions]       = useState([]);
  const [qi,              setQi]              = useState(0);
  const [chosen,          setChosen]          = useState(null);
  const [lives,           setLives]           = useState(3);
  const [bossHp,          setBossHp]          = useState(100);
  const [timeLeft,        setTimeLeft]        = useState(30);
  const [score,           setScore]           = useState(0);
  const [battleResult,    setBattleResult]    = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [hint,            setHint]            = useState(false);
  const [noHints,         setNoHints]         = useState(false);

  const scoreRef      = useRef(0);
  const livesRef      = useRef(3);
  const processingRef = useRef(false);
  const timerRef      = useRef(null);

  // ── Effects ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!child?.id) return;
    fetch("/api/boss", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + (db._token || "") },
      body: JSON.stringify({ action: "get_progress", child_id: child.id }),
    })
      .then(r => r.json())
      .then(d => { if (d.data) setBossProgress(d.data); })
      .catch(() => {});
  }, [child?.id]);

  useEffect(() => {
    if (view !== "battle" || chosen !== null || questions.length === 0) return;
    if (timeLeft <= 0) { handlePick(-1); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [view, timeLeft, chosen, questions.length]);

  // ── Helpers ──────────────────────────────────────────────────────────
  const getClassNum = () => parseInt(child.class_num || 1);
  const getBossList = () => BOSSES[getClassNum()] || [];

  const isKilled = (bossId, levelKey) =>
    bossProgress.some(p => p.boss_key === bossId && p.level_key === levelKey && p.killed === true);

  const isBossUnlocked = (bossIndex) => {
    if (bossIndex === 0) return true;
    const prevBoss = getBossList()[bossIndex - 1];
    if (!prevBoss) return false;
    return isKilled(prevBoss.id, "minion");
  };

  const isLevelAvailable = (boss, bossIdx, levelKey) => {
    if (!isBossUnlocked(bossIdx)) return false;
    const levelIdx = boss.levels.indexOf(levelKey);
    if (levelIdx === 0) return true;
    return isKilled(boss.id, boss.levels[levelIdx - 1]);
  };

  const getTotalXpFromBoss = (bossId) =>
    bossProgress.filter(p => p.boss_key === bossId && p.killed).reduce((s, p) => s + (p.xp_earned || 0), 0);

  const getLevelConfig  = (levelKey) => BOSS_LEVELS.find(l => l.key === levelKey);
  const hasPenalty      = () => parseInt(child.class_num || 1) > 12;

  // ── Start Battle ─────────────────────────────────────────────────────
  const startBattle = async (boss, levelCfg) => {
    setLoading(true);
    setActiveBoss(boss);
    setActiveLevel(levelCfg);
    scoreRef.current      = 0;
    livesRef.current      = 3;
    processingRef.current = false;
    setQi(0); setChosen(null); setScore(0); setLives(3);
    setBossHp(100); setTimeLeft(levelCfg.timer); setBattleResult(null);
    setHint(false); setNoHints(false);

    const lessonId = "boss_" + boss.id + "_" + levelCfg.key;
    let qs = [];
    try {
      const r = await fetch("/api/boss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_questions", lesson_id: lessonId }),
      });
      const d = await r.json();
      if (d.data && d.data.length > 0) {
        qs = d.data.map(q => ({
          q:    q.question,
          opts: Array.isArray(q.options) ? q.options : JSON.parse(q.options || "[]"),
          ans:  q.correct_answer,
          h:    q.hint || "Think carefully!",
        }));
      }
    } catch(e) {}

    if (qs.length === 0) qs = getFallbackQuestions(boss.theme, levelCfg.key, levelCfg.questions);
    qs = qs.slice(0, levelCfg.questions);
    setQuestions(qs);
    setLoading(false);
    setView("battle");
  };

  // ── Handle Pick ──────────────────────────────────────────────────────
  const handlePick = (ansIdx) => {
    if (processingRef.current || chosen !== null) return;
    processingRef.current = true;
    const q = questions[qi];
    if (!q) return;
    const ok = ansIdx === q.ans;
    if (ok) SFX.correct(); else SFX.wrong();
    setChosen(ansIdx);

    const dmg      = Math.ceil(100 / questions.length);
    let newHp      = bossHp;
    let newLives   = livesRef.current;

    if (ok) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      newHp = Math.max(0, bossHp - dmg);
      setBossHp(newHp);
    } else {
      newLives = Math.max(0, livesRef.current - 1);
      livesRef.current = newLives;
      setLives(newLives);
    }

    const won  = newHp <= 0;
    const lost = newLives <= 0 && !ok;

    setTimeout(() => {
      processingRef.current = false;
      if (won || lost || qi + 1 >= questions.length) {
        finalizeBattle(won || newHp <= 0, scoreRef.current);
      } else {
        setQi(x => x + 1);
        setChosen(null);
        setHint(false);
        setTimeLeft(activeLevel.timer);
      }
    }, 900);
  };

  // ── Finalize Battle ──────────────────────────────────────────────────
  const finalizeBattle = async (won, finalScore) => {
    const levelCfg    = activeLevel;
    const boss        = activeBoss;
    const xpEarned    = won ? levelCfg.xp : 0;
    const coinsEarned = won ? levelCfg.coins : 0;
    const gemsEarned  = won ? levelCfg.gems : 0;
    const penalty     = (!won && hasPenalty()) ? levelCfg.penalty : 0;

    setBattleResult({ won, finalScore, xpEarned, coinsEarned, gemsEarned, penalty });

    try {
      await fetch("/api/boss", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + (db._token || "") },
        body: JSON.stringify({
          action: "save_result", child_id: child.id,
          boss_key: boss.id, level_key: levelCfg.key, killed: won,
          xp_earned: xpEarned, coins_earned: coinsEarned,
          gems_earned: gemsEarned, time_taken_sec: 0,
        }),
      });
      if (won) {
        setBossProgress(prev => {
          const filtered = prev.filter(p => !(p.boss_key === boss.id && p.level_key === levelCfg.key));
          return [...filtered, { boss_key: boss.id, level_key: levelCfg.key, killed: true, xp_earned: xpEarned }];
        });
      }
    } catch(e) {}

    if (won) {
      setChild(c => c ? { ...c, xp:(c.xp||0)+xpEarned, coins:(c.coins||0)+coinsEarned, gems:(c.gems||0)+gemsEarned } : c);
      SFX.unlock();
      try {
        const previewKey = "mm_boss_preview_" + (child?.id || "");
        const existing = JSON.parse(localStorage.getItem(previewKey) || "{}");
        existing[boss.id + "_" + levelCfg.key] = true;
        localStorage.setItem(previewKey, JSON.stringify(existing));
      } catch(e) {}
    } else if (penalty > 0) {
      setChild(c => c ? { ...c, xp: Math.max(0, (c.xp||0) - penalty) } : c);
    }

    setView("result");
  };

  // ════════════════════════════════════════════════════════════════════
  // VIEW: ARENA
  // ════════════════════════════════════════════════════════════════════
  if (view === "arena") {
    const bossList   = getBossList();
    const classNum   = getClassNum();
    const className  = CLASS_NAMES[classNum] || ("Class " + classNum);
    const slainCount = bossList.filter(b => b.levels.some(lk => isKilled(b.id, lk))).length;

    return (
      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", paddingBottom:32 }}>

        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#FF6B6B,#9B59F5)", padding:"18px 18px 14px", position:"sticky", top:0, zIndex:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
            <BackBtn onClick={onBack} color="white"/>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:"white", lineHeight:1.1 }}>{"⚔️ Boss Arena"}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.82)", fontWeight:700 }}>{className + " · " + bossList.length + " Bosses"}</div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:14, padding:"8px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:14, color:"white" }}>{"Bosses Defeated: " + slainCount + " / " + bossList.length}</div>
            <div style={{ display:"flex", gap:5 }}>
              {bossList.map(b => (
                <div key={b.id} style={{ width:10, height:10, borderRadius:"50%", background: b.levels.some(lk => isKilled(b.id, lk)) ? "#2ECC9A" : "rgba(255,255,255,0.28)" }}/>
              ))}
            </div>
          </div>
        </div>

        {/* Boss Cards */}
        <div style={{ padding:"4px 0 8px" }}>
          {bossList.map((boss, bossIdx) => {
            const unlocked  = isBossUnlocked(bossIdx);
            const anyKilled = boss.levels.some(lk => isKilled(boss.id, lk));
            const allKilled = boss.levels.every(lk => isKilled(boss.id, lk));
            const totalXP   = getTotalXpFromBoss(boss.id);
            const topColor  = LEVEL_COLORS[boss.levels[0]] || "#9B59F5";

            return (
              <div key={boss.id} style={{ background:"white", borderRadius:28, boxShadow:"0 4px 20px rgba(0,0,0,0.09)", margin:"14px 18px", padding:"16px 16px 14px", position:"relative", overflow:"hidden" }}>

                {/* DEFEATED watermark */}
                {allKilled && (
                  <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%) rotate(-20deg)", fontFamily:"'Fredoka One',cursive", fontSize:72, color:"#000", opacity:0.06, pointerEvents:"none", userSelect:"none", whiteSpace:"nowrap", zIndex:0 }}>
                    DEFEATED
                  </div>
                )}

                {/* Top row: icon + info + badge */}
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12, position:"relative", zIndex:1 }}>
                  <div style={{ width:56, height:56, borderRadius:"50%", background:topColor + "22", border:"2px solid " + topColor + "55", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>
                    {boss.emoji}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#1A1040", lineHeight:1.2 }}>{boss.name}</div>
                    <div style={{ background:"#9B59F518", border:"1px solid #9B59F540", borderRadius:8, padding:"2px 8px", display:"inline-block", fontSize:11, color:"#9B59F5", fontWeight:700, marginTop:3 }}>{boss.theme}</div>
                    {totalXP > 0 && (
                      <div style={{ fontSize:11, color:"#FFC847", fontWeight:800, marginTop:3 }}>{"⚡ " + totalXP + " XP earned"}</div>
                    )}
                  </div>
                  {anyKilled && (
                    <div style={{ position:"absolute", top:0, right:0, background:"linear-gradient(135deg,#FFC847,#FF8C42)", borderRadius:12, padding:"3px 10px", fontSize:11, fontWeight:900, color:"white", fontFamily:"'Fredoka One',cursive", flexShrink:0 }}>{"🏆 SLAIN"}</div>
                  )}
                </div>

                {/* Level pills */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, position:"relative", zIndex:1 }}>
                  {boss.levels.map(lk => {
                    const killed    = isKilled(boss.id, lk);
                    const available = !killed && isLevelAvailable(boss, bossIdx, lk);
                    const cfg       = getLevelConfig(lk);
                    if (!cfg) return null;
                    const lc = LEVEL_COLORS[lk] || "#9890C4";

                    if (killed) return (
                      <div key={lk} style={{ background:"#2ECC9A1A", border:"1.5px solid #2ECC9A", borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:800, color:"#1A7A5A" }}>
                        {"✅ " + cfg.label}
                      </div>
                    );
                    if (available) return (
                      <button key={lk} onClick={() => { setActiveBoss(boss); setActiveLevel(cfg); setView("briefing"); }}
                        style={{ background:lc + "1A", border:"1.5px solid " + lc, borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:800, color:lc, cursor:"pointer" }}>
                        {cfg.icon + " " + cfg.label}
                      </button>
                    );
                    return (
                      <div key={lk} style={{ background:"rgba(0,0,0,0.04)", border:"1.5px solid rgba(0,0,0,0.09)", borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:800, color:"#9890C4" }}>
                        {"🔒 " + cfg.label}
                      </div>
                    );
                  })}
                </div>

                {/* Locked overlay */}
                {!unlocked && (
                  <div style={{ position:"absolute", inset:0, background:"rgba(180,180,180,0.68)", borderRadius:28, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:10, gap:6 }}>
                    <div style={{ fontSize:30 }}>🔒</div>
                    <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:14, color:"#333", textAlign:"center", padding:"0 20px" }}>{"Defeat previous boss to unlock"}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // VIEW: BRIEFING
  // ════════════════════════════════════════════════════════════════════
  if (view === "briefing") {
    const boss     = activeBoss;
    const levelCfg = activeLevel;
    if (!boss || !levelCfg) { setView("arena"); return null; }
    const lc = LEVEL_COLORS[levelCfg.key] || "#9B59F5";

    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#1A0040,#0A1040)", fontFamily:"'Nunito',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", padding:"28px 22px 32px", position:"relative", overflow:"hidden" }}>
        <Starfield n={30}/>
        <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:380 }}>

          {/* Boss emoji — pulsing */}
          <div style={{ textAlign:"center", marginBottom:10 }}>
            <div style={{ fontSize:80, display:"inline-block", animation:"mmFloat 1.5s ease-in-out infinite" }}>{boss.emoji}</div>
          </div>

          {/* Boss name */}
          <div style={{ textAlign:"center", fontFamily:"'Fredoka One',cursive", fontSize:28, color:"#FFC847", marginBottom:8 }}>{boss.name}</div>

          {/* Level badge */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:6 }}>
            <div style={{ background:lc + "33", border:"1.5px solid " + lc, borderRadius:20, padding:"6px 20px", fontSize:14, fontWeight:800, color:lc }}>
              {levelCfg.icon + " " + levelCfg.label}
            </div>
          </div>

          {/* Theme */}
          <div style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.55)", marginBottom:20, fontWeight:600 }}>{boss.theme}</div>

          {/* Stats 2x2 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            {[
              { icon:"❤️", label:"Lives",     val:"3 Lives" },
              { icon:"⏱️", label:"Timer",     val:levelCfg.timer + "s per Q" },
              { icon:"❓", label:"Questions", val:levelCfg.questions + " Questions" },
              { icon:"🏆", label:"XP on Win", val:"+" + levelCfg.xp + " XP" },
            ].map((s, i) => (
              <div key={i} style={{ background:"rgba(255,255,255,0.10)", borderRadius:16, padding:"12px 10px", textAlign:"center" }}>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)", fontWeight:700, marginBottom:4 }}>{s.icon + " " + s.label}</div>
                <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:16, color:"white" }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Rules */}
          <div style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:20, padding:"14px 16px", marginBottom:14 }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:16, color:"white", marginBottom:10 }}>{"📜 Battle Rules"}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {[
                "⚔️ Correct answer deals damage to the boss",
                "💔 Wrong answer costs 1 life (3 lives total)",
                "⏰ Time runs out = counts as wrong answer",
                "💀 Reduce boss HP to 0 to WIN!",
                hasPenalty()
                  ? ("❌ Defeat = -" + levelCfg.penalty + " XP penalty")
                  : "🎈 No XP penalty — just keep trying!",
              ].map((r, i) => (
                <div key={i} style={{ fontSize:13, color:"rgba(255,255,255,0.80)", lineHeight:1.4 }}>{r}</div>
              ))}
            </div>
          </div>

          {/* Rewards row */}
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:22 }}>
            <div style={{ background:"#FFC84730", border:"1.5px solid #FFC847", borderRadius:20, padding:"6px 14px", fontSize:13, fontWeight:800, color:"#FFC847" }}>{"+" + levelCfg.xp + " XP"}</div>
            <div style={{ background:"#4BBDF530", border:"1.5px solid #4BBDF5", borderRadius:20, padding:"6px 14px", fontSize:13, fontWeight:800, color:"#4BBDF5" }}>{"+" + levelCfg.coins + " 🪙"}</div>
            {levelCfg.gems > 0 && (
              <div style={{ background:"#9B59F530", border:"1.5px solid #9B59F5", borderRadius:20, padding:"6px 14px", fontSize:13, fontWeight:800, color:"#9B59F5" }}>{"+" + levelCfg.gems + " 💎"}</div>
            )}
          </div>

          {/* Fight button */}
          <button onClick={() => startBattle(boss, levelCfg)}
            style={{ width:"100%", background:"linear-gradient(135deg,#FF6B6B,#FF4444)", border:"none", borderRadius:20, padding:"18px", fontFamily:"'Fredoka One',cursive", fontSize:18, color:"white", cursor:"pointer", boxShadow:"0 6px 20px rgba(255,107,107,0.45)", marginBottom:12 }}>
            {"⚔️ FIGHT!"}
          </button>

          <button onClick={() => setView("arena")}
            style={{ width:"100%", background:"transparent", border:"none", padding:"10px", fontSize:14, color:"rgba(255,255,255,0.55)", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>
            {"← Choose different level"}
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // VIEW: BATTLE
  // ════════════════════════════════════════════════════════════════════
  if (view === "battle") {
    const boss     = activeBoss;
    const levelCfg = activeLevel;
    const q        = questions[qi];
    const { totalLeft } = getHintsRemaining(child.id);
    const optLabels = ["A", "B", "C", "D"];

    const handleHintTap = () => {
      if (hint) { setHint(false); return; }
      const ok = useHint(child.id);
      if (ok) setHint(true); else setNoHints(true);
    };

    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0A0020,#001030)", fontFamily:"'Nunito',sans-serif", position:"relative" }}>
        <Starfield n={20}/>

        {/* Loading overlay */}
        {loading && (
          <div style={{ position:"fixed", inset:0, background:"rgba(10,0,32,0.96)", zIndex:100, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
            <div style={{ width:44, height:44, border:"3px solid rgba(155,89,245,0.25)", borderTopColor:"#9B59F5", borderRadius:"50%", animation:"spinR 0.8s linear infinite" }}/>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:17, color:"rgba(255,255,255,0.7)" }}>{"Summoning the boss..."}</div>
          </div>
        )}

        {/* Sticky header */}
        <div style={{ position:"sticky", top:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)", padding:"12px 18px", zIndex:10 }}>
          {/* Row 1: back | boss name | timer */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <BackBtn onClick={() => setShowBackConfirm(true)} color="#FF6B6B"/>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:15, color:"white", textAlign:"center", flex:1, padding:"0 8px" }}>
              {boss ? (boss.emoji + " " + boss.name) : ""}
            </div>
            <div style={{ width:48, height:48, borderRadius:"50%", border:"3px solid " + (timeLeft <= 5 ? "#FF6B6B" : "#FFC847"), background:"rgba(255,255,255,0.10)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Orbitron',sans-serif", fontSize:13, color:timeLeft <= 5 ? "#FF6B6B" : "#FFC847", flexShrink:0, animation:timeLeft <= 5 ? "wrongWiggle 0.4s ease infinite" : "none" }}>
              {timeLeft}
            </div>
          </div>

          {/* Row 2: Boss HP bar */}
          <div style={{ marginBottom:7 }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.65)", fontFamily:"'Orbitron',sans-serif", marginBottom:3 }}>
              {"💀 " + (boss ? boss.name : "") + " HP: " + bossHp + "%"}
            </div>
            <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:8, height:10, overflow:"hidden" }}>
              <div style={{ width:bossHp + "%", height:"100%", background:"linear-gradient(90deg,#FF6B6B,#FF8C42)", borderRadius:8, transition:"width 0.4s ease" }}/>
            </div>
          </div>

          {/* Row 3: Lives */}
          <div style={{ display:"flex", gap:6 }}>
            {[1, 2, 3].map(i => (
              <span key={i} style={{ fontSize:16, opacity:i <= lives ? 1 : 0.2 }}>{i <= lives ? "❤️" : "🖤"}</span>
            ))}
          </div>
        </div>

        {/* Question area */}
        {q && (
          <div style={{ position:"relative", zIndex:1, padding:"16px 18px" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:"#FFC847", marginBottom:10, letterSpacing:1 }}>
              {"Q " + (qi + 1) + " / " + questions.length}
            </div>

            {/* Question card */}
            <div style={{ background:"rgba(255,255,255,0.08)", border:"1.5px solid rgba(255,255,255,0.14)", borderRadius:24, padding:"20px 16px", marginBottom:14 }}>
              <div style={{ color:"white", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:19, lineHeight:1.5 }}>{q.q}</div>
            </div>

            {/* Answer grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              {q.opts.map((opt, i) => {
                const isCorrect = i === q.ans;
                const isChosen  = i === chosen;
                const answered  = chosen !== null;
                let bg  = "rgba(255,255,255,0.08)";
                let brd = "1.5px solid rgba(255,255,255,0.18)";
                let col = "white";
                if (answered) {
                  if (isChosen && isCorrect)   { bg = "#2ECC9A33"; brd = "2px solid #2ECC9A"; col = "#2ECC9A"; }
                  else if (isChosen)           { bg = "#FF6B6B33"; brd = "2px solid #FF6B6B"; col = "#FF6B6B"; }
                  else if (isCorrect)          { bg = "#2ECC9A18"; brd = "1.5px dashed #2ECC9A"; col = "#2ECC9A"; }
                }
                return (
                  <button key={i} onClick={() => handlePick(i)}
                    style={{ background:bg, border:brd, borderRadius:18, padding:"16px 12px", fontSize:16, fontWeight:800, color:col, cursor:answered ? "default" : "pointer", transition:"all 0.2s", textAlign:"center", position:"relative", lineHeight:1.4 }}>
                    <div style={{ fontSize:10, marginBottom:4, color: answered && isCorrect ? "#2ECC9A" : answered && isChosen ? "#FF6B6B" : "rgba(255,255,255,0.38)", fontFamily:"'Nunito',sans-serif", fontWeight:900 }}>
                      {optLabels[i]}
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            {chosen === null && (
              <div>
                <button onClick={handleHintTap}
                  style={{ width:"100%", background:totalLeft > 0 ? "rgba(255,200,71,0.09)" : "rgba(255,107,107,0.07)", border:"1.5px solid " + (totalLeft > 0 ? "rgba(255,200,71,0.28)" : "rgba(255,107,107,0.22)"), borderRadius:20, padding:"13px 16px", cursor:"pointer", color:totalLeft > 0 ? "#FFC847" : "#FF6B6B", fontSize:14, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span>{"💡 " + (hint ? q.h : "Tap for a cosmic hint!")}</span>
                  <span style={{ fontSize:11, fontWeight:900, background:totalLeft > 0 ? "rgba(255,200,71,0.18)" : "rgba(255,107,107,0.16)", borderRadius:999, padding:"3px 10px", flexShrink:0, marginLeft:8 }}>
                    {totalLeft + " left"}
                  </span>
                </button>
                {totalLeft === 0 && !hint && (
                  <div style={{ textAlign:"center", fontSize:11, color:"#FF6B6B", marginTop:5, fontWeight:700 }}>{"No hints left today · Buy more in Shop 🛒"}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Back confirm modal */}
        {showBackConfirm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.86)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
            <div style={{ background:"#1A0040", border:"2px solid rgba(255,107,107,0.35)", borderRadius:24, padding:"28px 22px", width:"100%", maxWidth:320, textAlign:"center" }}>
              <div style={{ fontSize:44, marginBottom:10 }}>⚠️</div>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#FF6B6B", marginBottom:6 }}>{"Abandon Battle?"}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)", marginBottom:18, lineHeight:1.6 }}>{"Your battle progress will be lost!"}</div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setShowBackConfirm(false)}
                  style={{ flex:1, background:"transparent", border:"1.5px solid rgba(255,255,255,0.18)", borderRadius:12, padding:"12px", color:"rgba(255,255,255,0.65)", fontFamily:"'Nunito',sans-serif", fontSize:14, cursor:"pointer", fontWeight:700 }}>
                  {"Keep Fighting"}
                </button>
                <button onClick={() => { setShowBackConfirm(false); setView("arena"); }}
                  style={{ flex:1, background:"linear-gradient(135deg,#FF6B6B,#FF4444)", border:"none", borderRadius:12, padding:"12px", color:"white", fontFamily:"'Fredoka One',cursive", fontSize:14, cursor:"pointer" }}>
                  {"Retreat"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No hints modal */}
        {noHints && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
            <div style={{ background:"#1A0040", borderRadius:24, padding:"28px 22px", width:"100%", maxWidth:320, textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:10 }}>💡</div>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#FF6B6B", marginBottom:6 }}>{"No hints left today!"}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)", marginBottom:18, lineHeight:1.6 }}>{"You've used all free hints today. Buy more in the Shop!"}</div>
              <button onClick={() => setNoHints(false)}
                style={{ width:"100%", background:"rgba(255,255,255,0.1)", border:"1.5px solid rgba(255,255,255,0.18)", borderRadius:12, padding:"12px", color:"white", fontFamily:"'Nunito',sans-serif", fontSize:14, cursor:"pointer", fontWeight:700 }}>
                {"OK"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // VIEW: RESULT
  // ════════════════════════════════════════════════════════════════════
  if (!battleResult) return null;

  const { won, finalScore, xpEarned, coinsEarned, gemsEarned, penalty } = battleResult;
  const boss     = activeBoss;
  const levelCfg = activeLevel;

  const nextLevelKey = boss && levelCfg ? (() => {
    const idx = boss.levels.indexOf(levelCfg.key);
    if (idx < 0 || idx >= boss.levels.length - 1) return null;
    const nk = boss.levels[idx + 1];
    return isKilled(boss.id, nk) ? null : nk;
  })() : null;
  const nextLevelCfg = nextLevelKey ? BOSS_LEVELS.find(l => l.key === nextLevelKey) : null;

  const scorePct = questions.length > 0 ? finalScore / questions.length : 0;
  const winMsg   = scorePct >= 0.9 ? "PERFECT WARRIOR! ⚡" : scorePct >= 0.7 ? "Great fight, champion! 🔥" : "Victory is yours! Keep conquering! 💪";
  const loseMsg  = finalScore <= 3
    ? "Don't give up! Every battle makes you stronger! 💪"
    : finalScore <= 7
    ? "So close! You almost had it! Train harder! 🔥"
    : "Amazing effort! The boss was scared! Try again! ⚡";

  return (
    <div style={{ minHeight:"100vh", background: won ? "linear-gradient(160deg,#001A10,#0A1040)" : "linear-gradient(160deg,#200010,#0A0010)", fontFamily:"'Nunito',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", padding:"28px 22px 36px", position:"relative", overflow:"hidden" }}>
      {won && <Confetti active={true}/>}
      <Starfield n={won ? 50 : 20}/>

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:360, textAlign:"center" }}>
        {won ? (
          <>
            {/* WIN */}
            <div style={{ fontSize:80, marginBottom:10, display:"inline-block", animation:"mmBounce 1.2s ease", filter:"drop-shadow(0 8px 24px rgba(255,200,71,0.55))" }}>{"🏆"}</div>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:26, color:"#FFC847", marginBottom:14 }}>{"BOSS DEFEATED!"}</div>

            {/* Defeated boss with X */}
            {boss && (
              <div style={{ position:"relative", display:"inline-block", marginBottom:14 }}>
                <div style={{ fontSize:60 }}>{boss.emoji}</div>
                <div style={{ position:"absolute", top:-4, right:-12, fontSize:24, color:"#FF6B6B", fontWeight:900 }}>{"❌"}</div>
              </div>
            )}

            <div style={{ fontSize:14, color:"rgba(255,255,255,0.65)", marginBottom:14 }}>{finalScore + "/" + questions.length + " correct"}</div>

            {/* Rewards */}
            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:14 }}>
              <div style={{ background:"rgba(255,200,71,0.18)", border:"1.5px solid #FFC847", borderRadius:20, padding:"6px 14px", fontSize:13, fontWeight:800, color:"#FFC847" }}>{"+" + xpEarned + " XP"}</div>
              <div style={{ background:"rgba(75,189,245,0.18)", border:"1.5px solid #4BBDF5", borderRadius:20, padding:"6px 14px", fontSize:13, fontWeight:800, color:"#4BBDF5" }}>{"+" + coinsEarned + " 🪙"}</div>
              {gemsEarned > 0 && (
                <div style={{ background:"rgba(155,89,245,0.18)", border:"1.5px solid #9B59F5", borderRadius:20, padding:"6px 14px", fontSize:13, fontWeight:800, color:"#9B59F5" }}>{"+" + gemsEarned + " 💎"}</div>
              )}
            </div>

            <div style={{ fontSize:14, color:"rgba(255,255,255,0.75)", marginBottom:24, fontWeight:700 }}>{winMsg}</div>

            <div style={{ display:"flex", flexDirection:"column", gap:10, width:"100%" }}>
              {nextLevelCfg && (
                <button onClick={() => startBattle(boss, nextLevelCfg)}
                  style={{ width:"100%", background:"linear-gradient(135deg,#FF6B6B,#FF4444)", border:"none", borderRadius:20, padding:"16px", fontFamily:"'Fredoka One',cursive", fontSize:16, color:"white", cursor:"pointer", boxShadow:"0 4px 16px rgba(255,107,107,0.40)" }}>
                  {"⚔️ Fight Next Level"}
                </button>
              )}
              <button onClick={() => setView("arena")}
                style={{ width:"100%", background:"rgba(255,255,255,0.09)", border:"1.5px solid rgba(255,255,255,0.18)", borderRadius:20, padding:"16px", fontFamily:"'Fredoka One',cursive", fontSize:16, color:"white", cursor:"pointer" }}>
                {"🏠 Back to Arena"}
              </button>
              <button onClick={() => { try { navigator.clipboard.writeText("I defeated " + (boss ? boss.name : "the boss") + " in MathMagic Space Academy! 🏆⚔️"); } catch(e) {} }}
                style={{ background:"transparent", border:"none", fontSize:13, color:"rgba(255,255,255,0.42)", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:700, padding:"8px" }}>
                {"📋 Share Victory"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* LOSE */}
            <div style={{ fontSize:70, marginBottom:10, display:"inline-block", animation:"mmFloat 2s ease-in-out infinite" }}>{"💔"}</div>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:24, color:"#FF6B6B", marginBottom:12 }}>{"DEFEATED..."}</div>

            {boss && <div style={{ fontSize:60, marginBottom:12 }}>{boss.emoji}</div>}

            {penalty > 0 && (
              <div style={{ background:"rgba(255,107,107,0.20)", border:"1.5px solid #FF6B6B", borderRadius:20, padding:"6px 18px", fontSize:14, fontWeight:800, color:"#FF6B6B", display:"inline-block", marginBottom:14, animation:"wrongWiggle 0.5s ease" }}>
                {"-" + penalty + " XP"}
              </div>
            )}

            <div style={{ fontSize:14, color:"rgba(255,255,255,0.60)", marginBottom:12 }}>{finalScore + "/" + questions.length + " correct"}</div>
            <div style={{ fontSize:14, color:"rgba(255,255,255,0.70)", marginBottom:28, fontWeight:700, lineHeight:1.6 }}>{loseMsg}</div>

            <div style={{ display:"flex", flexDirection:"column", gap:10, width:"100%" }}>
              <button onClick={() => startBattle(boss, levelCfg)}
                style={{ width:"100%", background:"linear-gradient(135deg,#FF6B6B,#FF4444)", border:"none", borderRadius:20, padding:"16px", fontFamily:"'Fredoka One',cursive", fontSize:16, color:"white", cursor:"pointer", boxShadow:"0 4px 16px rgba(255,107,107,0.40)" }}>
                {"⚔️ Try Again"}
              </button>
              <button onClick={() => setView("arena")}
                style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"1.5px solid rgba(255,255,255,0.14)", borderRadius:20, padding:"16px", fontFamily:"'Fredoka One',cursive", fontSize:16, color:"rgba(255,255,255,0.65)", cursor:"pointer" }}>
                {"← Arena"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
