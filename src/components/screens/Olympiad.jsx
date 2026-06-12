import React, { useState, useEffect, useRef } from 'react';
import { C, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Card, BackBtn } from '../ui/primitives.jsx';
import { Starfield } from '../layout/layout.jsx';

// ── Top-level constants & helpers ─────────────────────────────────────────────

const TIERS = [
  { key:"starter",  label:"Starter",  icon:"🌱", color:"#2ECC9A", tests:10, tagline:"Begin your journey" },
  { key:"explorer", label:"Explorer", icon:"🔭", color:"#4BBDF5", tests:10, tagline:"Expand your skills" },
  { key:"champion", label:"Champion", icon:"🏅", color:"#FFC847", tests:5,  tagline:"Rise to the challenge" },
  { key:"master",   label:"Master",   icon:"👑", color:"#FF6B6B", tests:5,  tagline:"Prove your mastery" },
];

function getClassKey(classNum) {
  const n = parseInt(classNum);
  if (n === 1) return "c1";
  if (n === 2) return "c2";
  if (n === 3) return "c3";
  if (n === 4) return "c4";
  if (n === 5) return "c5";
  return "c3";
}

function getClassLabel(classNum) {
  const n = parseInt(classNum);
  if (n === 10) return "Nursery";
  if (n === 11) return "Jr KG";
  if (n === 12) return "Sr KG";
  return "Class " + n;
}

function getQCount(classKey) {
  return (classKey === "c1" || classKey === "c2") ? 15 : 25;
}

function getTierTimer(tierKey) {
  if (tierKey === "starter")  return 50;
  if (tierKey === "explorer") return 45;
  if (tierKey === "champion") return 40;
  return 35;
}

function calcStars(correct, total) {
  const pct = total > 0 ? correct / total : 0;
  if (pct >= 0.8) return 3;
  if (pct >= 0.6) return 2;
  if (pct >= 0.4) return 1;
  return 0;
}

function tierAllThreeStars(tierKey, tierTests, doneMap) {
  const tier = TIERS.find(t => t.key === tierKey);
  if (!tier) return false;
  for (let i = 0; i < tier.tests; i++) {
    const entry = doneMap[tierKey + "_" + i];
    if (!entry || entry.stars < 3) return false;
  }
  return true;
}

function isTierUnlocked(tierKey, doneMap) {
  if (tierKey === "starter")  return true;
  if (tierKey === "explorer") return tierAllThreeStars("starter", 10, doneMap);
  if (tierKey === "champion") return tierAllThreeStars("explorer", 10, doneMap);
  if (tierKey === "master")   return tierAllThreeStars("champion", 5, doneMap);
  return false;
}

function isTestUnlockedInTier(tierKey, testIdx, doneMap) {
  if (testIdx === 0) return true;
  const prev = doneMap[tierKey + "_" + (testIdx - 1)];
  return !!(prev && prev.stars >= 1);
}

// ── Olympiad component ────────────────────────────────────────────────────────

export function Olympiad({ child, setChild, onBack }) {
  const classKey = getClassKey(child.class_num);
  const qCount   = getQCount(classKey);

  const [view,        setView]        = useState("tiers");
  const [activeTier,  setActiveTier]  = useState(null);
  const [testIdx,     setTestIdx]     = useState(0);
  const [qi,          setQi]          = useState(0);
  const [chosen,      setChosen]      = useState(null);
  const [score,       setScore]       = useState(0);
  const [timeLeft,    setTimeLeft]    = useState(50);
  const [questions,   setQuestions]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [results,     setResults]     = useState([]);
  const [doneMap,     setDoneMap]     = useState({});
  const [confirmBack, setConfirmBack] = useState(false);
  const scoreRef = useRef(0);
  const savedRef = useRef(false);

  // Load progress on mount
  useEffect(() => {
    if (!child?.id) return;
    db.getProgress(child.id).then(({ data }) => {
      if (!data) return;
      const map = {};
      data
        .filter(p => p.lesson_id?.startsWith("olympiad_" + classKey + "_"))
        .forEach(p => {
          const parts   = p.lesson_id.split("_");
          const tierKey = parts[2];
          const tidx    = parts[3];
          const key     = tierKey + "_" + tidx;
          map[key] = {
            stars:   p.stars_earned    || 0,
            correct: p.correct_count   || 0,
            total:   p.total_questions || qCount,
          };
        });
      setDoneMap(map);
    });
  }, [child?.id]);

  const loadTest = async (tier, ti) => {
    setLoading(true);
    setQuestions([]);
    let loaded = false;
    try {
      const r = await db.getOlympiadQuestions(classKey, tier.key, ti);
      if (r && r.data && r.data.length > 0) {
        setQuestions(r.data.map(q => ({
          q:    q.question,
          opts: q.options,
          ans:  q.correct_answer,
          h:    q.hint || "Think carefully!",
          time: q.time_limit || getTierTimer(tier.key),
        })));
        loaded = true;
      }
    } catch(e) {}
    if (!loaded) {
      try {
        const { getOlympiadFallback } = await import("../../constants/olympiadData.js");
        const fb = getOlympiadFallback(classKey, tier.key, ti);
        setQuestions(fb || []);
      } catch(e2) {
        setQuestions([]);
      }
    }
    setLoading(false);
  };

  const startTest = async (tier, ti) => {
    setActiveTier(tier);
    setTestIdx(ti);
    setQi(0);
    setChosen(null);
    setScore(0);
    setResults([]);
    scoreRef.current = 0;
    savedRef.current = false;
    await loadTest(tier, ti);
    setView("test");
  };

  useEffect(() => {
    if (view !== "test" || chosen !== null || questions.length === 0) return;
    const q = questions[qi];
    if (!q) return;
    setTimeLeft(q.time || getTierTimer(activeTier?.key || "starter"));
  }, [qi, view, questions]);

  useEffect(() => {
    if (view !== "test" || chosen !== null) return;
    if (timeLeft <= 0) { handlePick(-1); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [view, timeLeft, chosen]);

  const handlePick = (idx) => {
    if (chosen !== null || questions.length === 0) return;
    const q  = questions[qi];
    const ok = idx === q.ans;
    if (ok) SFX.correct(); else SFX.wrong();
    setChosen(idx);
    setResults(r => [...r, ok]);
    if (ok) { scoreRef.current += 1; setScore(scoreRef.current); }
    setTimeout(() => {
      if (qi + 1 >= questions.length) {
        finishTest();
      } else {
        setQi(prev => prev + 1);
        setChosen(null);
      }
    }, 1100);
  };

  const finishTest = () => {
    if (savedRef.current) return;
    savedRef.current = true;
    const total   = questions.length;
    const correct = scoreRef.current;
    const stars   = calcStars(correct, total);
    const xp      = correct * 25;
    const coins   = correct * 5;
    const doneKey = activeTier.key + "_" + testIdx;
    setDoneMap(prev => ({ ...prev, [doneKey]: { stars, correct, total } }));
    db.saveProgress(
      child.id,
      "olympiad_" + classKey + "_" + activeTier.key + "_" + testIdx,
      { correct, total, stars, xpEarned: xp, isSchoolStudent: !!(child.is_school_student) }
    );
    db.addXP(child.id, xp, coins, !!(child.is_school_student))
      .then(({ data: nc }) => { if (nc) setChild(nc); });
    setView("result");
  };

  // ── VIEW: tiers ──────────────────────────────────────────────────────────────
  if (view === "tiers") {
    const totalTests = TIERS.reduce((sum, t) => sum + t.tests, 0);
    const totalDone  = Object.keys(doneMap).length;
    const classLabel = getClassLabel(child.class_num);

    return (
      <div style={{ minHeight:"100vh", background:"#FAFBFF", fontFamily:"'Nunito',sans-serif", position:"relative" }}>
        <Starfield n={isDark() ? 25 : 6}/>
        <div style={{ position:"relative", zIndex:2, background:"linear-gradient(135deg,#5B4FE820,#5B4FE808)", borderBottom:"1.5px solid #5B4FE820", padding:"16px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
            <BackBtn onClick={onBack} color="#5B4FE8"/>
            <div style={{ width:44, height:44, borderRadius:14, background:"linear-gradient(135deg,#5B4FE8,#9B59F5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>🎓</div>
            <div>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#1A1040" }}>Olympiad</div>
              <div style={{ fontSize:11, color:"#9890C4" }}>{classLabel + " · " + totalDone + "/" + totalTests + " done"}</div>
            </div>
          </div>
          <div style={{ background:"rgba(91,79,232,0.08)", borderRadius:999, height:6, overflow:"hidden" }}>
            <div style={{ width:(totalTests > 0 ? Math.round((totalDone / totalTests) * 100) : 0) + "%", height:"100%", background:"linear-gradient(90deg,#5B4FE8,#9B59F5)", borderRadius:999, transition:"width 0.4s" }}/>
          </div>
        </div>
        <div style={{ position:"relative", zIndex:2, padding:"14px 16px", display:"flex", flexDirection:"column", gap:12 }}>
          {TIERS.map((tier, ti) => {
            const unlocked       = isTierUnlocked(tier.key, doneMap);
            const completed      = Array.from({length: tier.tests}, (_, i) => doneMap[tier.key + "_" + i]).filter(Boolean).length;
            const threeStarCount = Array.from({length: tier.tests}, (_, i) => doneMap[tier.key + "_" + i]).filter(d => d && d.stars === 3).length;
            const prevTier       = ti > 0 ? TIERS[ti - 1] : null;
            return (
              <button key={tier.key}
                onClick={() => { if (!unlocked) return; setActiveTier(tier); setView("list"); }}
                style={{ background:"white", border:"1.5px solid " + (unlocked ? tier.color + "44" : "#E8E6F0"), borderRadius:20, padding:"16px", cursor:unlocked ? "pointer" : "not-allowed", textAlign:"left", display:"flex", flexDirection:"column", gap:10, position:"relative", overflow:"hidden", opacity:unlocked ? 1 : 0.6, boxShadow:unlocked ? "0 4px 16px " + tier.color + "22" : "0 2px 8px rgba(91,79,232,0.06)", transition:"all 0.2s" }}>
                <div style={{ position:"absolute", left:0, top:0, bottom:0, width:4, background:tier.color, borderRadius:"20px 0 0 20px" }}/>
                <div style={{ paddingLeft:8, display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:52, height:52, borderRadius:16, background:tier.color + "18", border:"2px solid " + tier.color + "44", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>{tier.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:"#1A1040" }}>{tier.label}</div>
                    <div style={{ fontSize:11, color:"#9890C4", marginTop:1 }}>{tier.tagline}</div>
                    {!unlocked && prevTier && (
                      <div style={{ fontSize:10, color:"#FF6B6B", marginTop:4, fontWeight:700 }}>{"Complete all " + prevTier.label + " with ⭐⭐⭐ to unlock"}</div>
                    )}
                  </div>
                  {unlocked ? (
                    <div style={{ background:tier.color + "18", border:"1.5px solid " + tier.color + "44", borderRadius:999, padding:"6px 12px", fontSize:11, fontWeight:800, color:tier.color, flexShrink:0, textAlign:"center" }}>
                      <div>{threeStarCount + "/" + tier.tests}</div>
                      <div>{"⭐⭐⭐"}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize:24, flexShrink:0 }}>🔒</div>
                  )}
                </div>
                <div style={{ paddingLeft:8 }}>
                  <div style={{ background:tier.color + "18", borderRadius:999, height:5, overflow:"hidden" }}>
                    <div style={{ width:(tier.tests > 0 ? Math.round((completed / tier.tests) * 100) : 0) + "%", height:"100%", background:tier.color, borderRadius:999, transition:"width 0.4s" }}/>
                  </div>
                  <div style={{ fontSize:9, color:"#9890C4", marginTop:3 }}>{completed + "/" + tier.tests + " tests attempted"}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── VIEW: list ───────────────────────────────────────────────────────────────
  if (view === "list") {
    const tier           = activeTier;
    const completedCount = Array.from({length: tier.tests}, (_, i) => doneMap[tier.key + "_" + i]).filter(d => d && d.stars >= 1).length;
    return (
      <div style={{ minHeight:"100vh", background:"#FAFBFF", fontFamily:"'Nunito',sans-serif", position:"relative" }}>
        <Starfield n={isDark() ? 20 : 5}/>
        <div style={{ position:"relative", zIndex:2, background:"linear-gradient(135deg," + tier.color + "18," + tier.color + "08)", borderBottom:"1.5px solid " + tier.color + "20", padding:"14px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <BackBtn onClick={() => setView("tiers")} color={tier.color}/>
            <div style={{ fontSize:28 }}>{tier.icon}</div>
            <div>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#1A1040" }}>{tier.label + " Tier"}</div>
              <div style={{ fontSize:11, color:"#9890C4" }}>{completedCount + "/" + tier.tests + " tests completed"}</div>
            </div>
          </div>
        </div>
        <div style={{ position:"relative", zIndex:2, padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
          {Array.from({length: tier.tests}, (_, ti) => {
            const done     = doneMap[tier.key + "_" + ti];
            const unlocked = isTestUnlockedInTier(tier.key, ti, doneMap);
            const stars    = done ? done.stars : 0;
            const isDone   = !!(done && done.stars >= 1);
            const status   = isDone ? "DONE" : unlocked ? "OPEN" : "LOCKED";
            const scMap    = { DONE: tier.color, OPEN: "#2ECC9A", LOCKED: "#9890C4" };
            const sc       = scMap[status];
            return (
              <button key={ti}
                onClick={() => { if (!unlocked) return; startTest(tier, ti); }}
                style={{ background:"white", border:"1.5px solid " + (isDone ? tier.color + "44" : "#E8E6F0"), borderRadius:18, padding:"14px 16px", cursor:unlocked ? "pointer" : "not-allowed", textAlign:"left", display:"flex", alignItems:"center", gap:12, opacity:unlocked ? 1 : 0.55, boxShadow:unlocked ? "0 2px 10px rgba(91,79,232,0.08)" : "none", transition:"all 0.15s" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:tier.color + "18", border:"2px solid " + tier.color + "33", display:"flex", alignItems:"center", justifyContent:"center", fontSize:isDone ? 20 : 16, flexShrink:0, fontWeight:900, color:tier.color }}>
                  {isDone ? "✅" : unlocked ? (ti + 1) : "🔒"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:900, fontSize:15, color:"#1A1040" }}>{"Test " + (ti + 1)}</div>
                  <div style={{ fontSize:11, color:"#9890C4" }}>{qCount + " Qs · +" + (qCount * 25) + " XP max"}</div>
                  <div style={{ fontSize:14, marginTop:3 }}>
                    {[0, 1, 2].map(s => (
                      <span key={s} style={{ opacity: s < stars ? 1 : 0.18 }}>⭐</span>
                    ))}
                  </div>
                </div>
                <div style={{ background:sc + "18", border:"1.5px solid " + sc + "44", borderRadius:999, padding:"4px 12px", fontSize:10, fontWeight:900, color:sc, flexShrink:0 }}>{status}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── VIEW: test ───────────────────────────────────────────────────────────────
  if (view === "test") {
    const tier      = activeTier;
    const tierColor = tier ? tier.color : "#5B4FE8";
    const question  = questions[qi];
    const total     = questions.length;

    if (loading) return (
      <div style={{ minHeight:"100vh", background:"#FAFBFF", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center", padding:32 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🚀</div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:"#5B4FE8" }}>Loading questions...</div>
        </div>
      </div>
    );

    if (!loading && questions.length === 0) return (
      <div style={{ minHeight:"100vh", background:"#FAFBFF", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center", padding:32 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🔧</div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:"#5B4FE8", marginBottom:16 }}>Questions coming soon!</div>
          <Btn color="#5B4FE8" onClick={() => setView("list")}>← Back</Btn>
        </div>
      </div>
    );

    return (
      <div style={{ minHeight:"100vh", background:"#FAFBFF", fontFamily:"'Nunito',sans-serif", position:"relative" }}>
        <Starfield n={isDark() ? 20 : 5}/>
        {confirmBack && (
          <div style={{ position:"fixed", inset:0, background:"rgba(26,16,64,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ background:"white", borderRadius:20, padding:24, maxWidth:300, width:"90%", textAlign:"center", boxShadow:"0 8px 40px rgba(91,79,232,0.25)" }}>
              <div style={{ fontSize:36, marginBottom:8 }}>⚠️</div>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#1A1040", marginBottom:6 }}>Leave test?</div>
              <div style={{ fontSize:13, color:"#9890C4", marginBottom:18 }}>Progress will be lost.</div>
              <div style={{ display:"flex", gap:10 }}>
                <Btn color="#9890C4" style={{ flex:1 }} onClick={() => setConfirmBack(false)}>Stay</Btn>
                <Btn color="#FF6B6B" style={{ flex:1 }} onClick={() => { setConfirmBack(false); setView("list"); }}>Leave</Btn>
              </div>
            </div>
          </div>
        )}
        <div style={{ position:"relative", zIndex:2, background:"linear-gradient(135deg," + tierColor + "18," + tierColor + "08)", borderBottom:"1.5px solid " + tierColor + "20", padding:"14px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
            <BackBtn onClick={() => setConfirmBack(true)} color={tierColor}/>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:900, color:tierColor }}>
              {(tier ? tier.label.toUpperCase() : "") + " · TEST " + (testIdx + 1) + " · Q" + (qi + 1) + "/" + total}
            </div>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color: timeLeft <= 10 ? "#FF6B6B" : tierColor }}>
              {timeLeft + "s"}
            </div>
          </div>
          <div style={{ background:"rgba(0,0,0,0.06)", borderRadius:999, height:6, overflow:"hidden" }}>
            <div style={{ width:(total > 0 ? Math.round((qi / total) * 100) : 0) + "%", height:"100%", background:tierColor, borderRadius:999, transition:"width 0.4s", boxShadow:"0 0 8px " + tierColor + "55" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
            <span style={{ fontSize:9, color:"#9890C4" }}>{"Score: " + score}</span>
            <div style={{ width:(question && question.time ? Math.round((timeLeft / question.time) * 100) : 0) + "%", maxWidth:80, height:4, background: timeLeft <= 10 ? "#FF6B6B" : tierColor, borderRadius:4, transition:"width 1s linear" }}/>
          </div>
        </div>
        <div style={{ position:"relative", zIndex:2, padding:"14px 18px" }}>
          <Card color={tierColor} style={{ marginBottom:14, padding:"18px 14px" }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:800, color:"#1A1040", lineHeight:1.6 }}>{question ? question.q : ""}</div>
          </Card>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            {(question ? question.opts : []).map((opt, i) => {
              let bg = "white", border = "2px solid #5B4FE825", col = "#1A1040", shadow = "none";
              if (chosen !== null) {
                if (i === question.ans)  { bg = "#E8FFF4"; border = "2.5px solid #2ECC9A"; col = "#2ECC9A"; shadow = "0 0 20px #2ECC9A44"; }
                else if (i === chosen)   { bg = "#FFF0F0"; border = "2.5px solid #FF6B6B"; col = "#FF6B6B"; }
              }
              return (
                <button key={i} onClick={() => chosen === null && handlePick(i)}
                  style={{ background:bg, border, borderRadius:18, padding:"16px 14px", fontSize:16, fontWeight:800, fontFamily:"'Nunito',sans-serif", color:col, cursor:chosen !== null ? "default" : "pointer", transition:"all 0.2s", boxShadow:shadow, position:"relative", overflow:"hidden" }}>
                  <div style={{ fontSize:10, color: chosen !== null && i === question.ans ? "#2ECC9A" : chosen !== null && i === chosen ? "#FF6B6B" : tierColor, fontWeight:900, marginBottom:4 }}>{"ABCD"[i]}</div>
                  {chosen !== null && i === question.ans ? "✓ " : ""}{opt}
                </button>
              );
            })}
          </div>
          {chosen !== null && question && (
            <div style={{ background:"#4BBDF514", border:"1px solid #4BBDF533", borderRadius:14, padding:"9px 13px" }}>
              <div style={{ color:"#4BBDF5", fontSize:12, fontWeight:700 }}>{"💡 " + question.h}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── VIEW: result ─────────────────────────────────────────────────────────────
  const total      = questions.length;
  const pct        = total > 0 ? Math.round((score / total) * 100) : 0;
  const stars      = calcStars(score, total);
  const tierColor  = activeTier ? activeTier.color : "#5B4FE8";
  const tier       = activeTier;
  const resEmoji   = pct >= 80 ? "🥇" : pct >= 60 ? "🥈" : pct >= 40 ? "🥉" : "📚";
  const resMsg     = pct >= 80 ? "BRILLIANT!" : pct >= 60 ? "WELL DONE!" : pct >= 40 ? "GOOD TRY!" : "KEEP GOING!";

  const nextTierIdx  = tier ? TIERS.findIndex(t => t.key === tier.key) + 1 : -1;
  const nextTier     = nextTierIdx >= 1 && nextTierIdx < TIERS.length ? TIERS[nextTierIdx] : null;
  const updatedMap   = { ...doneMap, ...(tier ? { [tier.key + "_" + testIdx]: { stars, correct: score, total } } : {}) };
  const tierComplete = !!(tier && stars === 3 && tierAllThreeStars(tier.key, tier.tests, updatedMap));
  const showUnlock   = tierComplete && nextTier;

  return (
    <div style={{ minHeight:"100vh", background:"#FAFBFF", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif", padding:22, position:"relative" }}>
      <Starfield n={isDark() ? 50 : 12}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center", width:"100%", maxWidth:340 }}>
        <div style={{ fontSize:72, marginBottom:8 }}>{resEmoji}</div>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:tierColor, marginBottom:8 }}>{resMsg}</div>
        <div style={{ fontSize:32, marginBottom:14, letterSpacing:6 }}>
          {[0, 1, 2].map(s => (
            <span key={s} style={{ opacity: s < stars ? 1 : 0.15, filter: s < stars ? "drop-shadow(0 0 4px gold)" : "none" }}>⭐</span>
          ))}
        </div>
        <Card color={tierColor} style={{ marginBottom:14, textAlign:"center" }}>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:52, fontWeight:900, color:"#1A1040" }}>
            {score}<span style={{ fontSize:20, color:"#9890C4" }}>{"/" + total}</span>
          </div>
          <div style={{ color:tierColor, fontSize:13, fontWeight:700, marginTop:4 }}>{"+" + score * 25 + " XP · +" + score * 5 + " COINS"}</div>
          <div style={{ marginTop:10, background:"rgba(0,0,0,0.06)", borderRadius:6, height:8, overflow:"hidden" }}>
            <div style={{ width:pct + "%", height:"100%", background:"linear-gradient(90deg," + (pct >= 60 ? "#2ECC9A" : "#FFC847") + "," + tierColor + ")", borderRadius:6 }}/>
          </div>
          <div style={{ color:"#9890C4", fontSize:11, marginTop:3 }}>{pct + "% accuracy"}</div>
          <div style={{ color:"#2ECC9A", fontSize:9, marginTop:4, letterSpacing:1 }}>{"✅ PROGRESS SAVED"}</div>
        </Card>
        {showUnlock && (
          <div style={{ background:nextTier.color + "18", border:"1.5px solid " + nextTier.color + "44", borderRadius:14, padding:"10px 14px", marginBottom:12 }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:14, color:nextTier.color }}>{nextTier.icon + " " + nextTier.label + " tier unlocked!"}</div>
          </div>
        )}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <Btn color="#9890C4" style={{ flex:1, minWidth:90 }} onClick={() => setView("list")}>{"← All Tests"}</Btn>
          <Btn color={tierColor} style={{ flex:1, minWidth:90 }} onClick={() => startTest(tier, testIdx)}>{"↺ Retry"}</Btn>
          {tier && testIdx < tier.tests - 1 && (
            <Btn color="#2ECC9A" style={{ flex:1, minWidth:90 }} onClick={() => startTest(tier, testIdx + 1)}>{"Next →"}</Btn>
          )}
        </div>
      </div>
    </div>
  );
}
