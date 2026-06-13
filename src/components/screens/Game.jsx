// src/components/screens/Game.jsx — Main Game component
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, Card, BackBtn, XPBar } from '../ui/primitives.jsx';
import { Starfield, Confetti, Mascot } from '../layout/layout.jsx';
import { WORLDS, LESSONS, BADGES } from '../../constants/gameData.js';
import { ProgressGrid, Certificate } from '../shared/shared.jsx';
import { fetchSetQuestions, shuffle } from '../../lib/db.js';
import { getDifficulty } from '../../lib/utils.js';
import { BadgeUnlockToast } from '../shared/shared.jsx';
import { getHintsRemaining, useHint } from '../../lib/hints.js';


// ── Game ──────────────────────────────────────────────────────────────
export function Game({ lesson, world, child, setChild, onBack, onDone, onNextSet, newBadges, setNewBadges }) {
  const setIndex   = lesson.setIndex || 0;
  const difficulty = getDifficulty(lesson._progress||[], lesson.id);
  const [showCert, setShowCert] = useState(false);
  const mode       = lesson.mode || "quiz";
  const [questions, setQuestions] = useState(null); // null = loading

  // ── Session resume key — unique per child + lesson + set ────────
  const resumeKey = `mm_game_${child.id}_${lesson.id}_s${setIndex}`;

  useEffect(() => {
    let cancelled = false;
    setQuestions(null);

    fetchSetQuestions(lesson.id, setIndex).then(qs => {
      if (!cancelled) {
        // Check for a saved mid-session state
        let savedState = null;
        try {
          const raw = localStorage.getItem(resumeKey);
          if (raw) savedState = JSON.parse(raw);
        } catch(e) {}

        // Validate saved state — must be for same questions (same count)
        const valid = savedState
          && savedState.qi > 0                     // at least 1 question answered
          && savedState.qi < qs.length             // not already finished
          && savedState.questionCount === qs.length; // same set size

        if (valid) {
          // Restore saved question order (we stored the shuffled indices)
          const orderedQs = savedState.order
            ? savedState.order.map(i => qs[i]).filter(Boolean)
            : qs;
          setQuestions(orderedQs);
          setQi(savedState.qi);
          setScore(savedState.score);
          scoreRef.current = savedState.score;
          setLives(savedState.lives);
          livesRef.current = savedState.lives;
          setResumed(true);
        } else {
          // Fresh start — store a shuffled order so resume works
          const order = qs.map((_, i) => i); // questions already shuffled by fetchSetQuestions
          setQuestions(qs);
          setQi(0); setChosen(null); setScore(0); setHint(false); setDone(false); setSaving(false); setBurst(false);
          setLives(3);
          scoreRef.current = 0; livesRef.current = 3; processing.current = false;
          historyRef.current = [];
          setResumed(false);
          // Persist the order so if interrupted we can restore same question sequence
          try { localStorage.setItem(resumeKey, JSON.stringify({ qi:0, score:0, lives:3, questionCount:qs.length, order })); } catch(e) {}
        }
        // Prefetch next set in background
        if (setIndex < 9) fetchSetQuestions(lesson.id, setIndex + 1);
      }
    });
    return () => { cancelled = true; };
  }, [lesson.id, setIndex]);
  const scoreRef   = useRef(0);
  const historyRef = useRef([]);
  const livesRef   = useRef(3);
  const processing = useRef(false);

  const [qi,       setQi]       = useState(0);
  const [chosen,   setChosen]   = useState(null);
  const [lives,    setLives]    = useState(3);
  const [score,    setScore]    = useState(0);
  const [hint,     setHint]     = useState(false);
  const [noHints,  setNoHints]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [burst,    setBurst]    = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [bubbles,  setBubbles]  = useState([]);
  const [resumed,  setResumed]  = useState(false);

  // ── Persist game state after every answered question ───────────
  const saveGameState = useCallback((newQi, newScore, newLives, qs) => {
    if (!qs) return;
    try {
      const order = qs.map((_, i) => i); // identity — questions already in play order
      localStorage.setItem(resumeKey, JSON.stringify({
        qi: newQi, score: newScore, lives: newLives,
        questionCount: qs.length, order
      }));
    } catch(e) {}
  }, [resumeKey]);

  // ── Clear saved state on clean completion ───────────────────────
  const clearGameState = useCallback(() => {
    try { localStorage.removeItem(resumeKey); } catch(e) {}
  }, [resumeKey]);

  // ── Back-button guard — warn if mid-game ─────────────────────────
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const handleBack = useCallback(() => {
    if (!done && qi > 0) { setShowBackConfirm(true); }
    else { clearGameState(); onBack(); }
  }, [done, qi, clearGameState, onBack]);

  // Bubble regeneration — guard against null questions
  useEffect(() => {
    if (mode !== "bubble" || !questions || questions.length === 0) return;
    const q = questions[qi % questions.length];
    if (!q) return;
    SFX.bubblesAppear();
    setBubbles([...q.opts.map((text, id) => ({ id, text }))].sort(() => Math.random() - 0.5));
    processing.current = false;
  }, [qi, mode, questions]);

  const finalizeRef = useRef(null);
  const finalize = useCallback(() => {
    const fs      = scoreRef.current;
    const fst     = fs >= 16 ? 3 : fs >= 12 ? 2 : fs >= 6 ? 1 : 0;
    setTimeout(()=>{
      SFX.starAppear();
      const pct = (questions && questions.length > 0) ? fs / questions.length : 0;
      setTimeout(()=>{
        if (pct >= 0.95 || fst >= 3) SFX.perfectScore();
        else if (pct >= 0.6) SFX.goodScore();
        else if (fst === 0) SFX.wrong();
      }, 600);
      setTimeout(()=>SFX.xpShimmer(), 900);
      setTimeout(()=>SFX.coinsRain(), 1100);
    }, 500);
    const xpEarned = fs * 20;
    const totalQ  = questions ? questions.length : 20;

    // Clear the saved session — set completed cleanly
    clearGameState();

    // Show result immediately — no waiting for DB
    setDone(true);

    const gemGain = fst >= 3 ? 5 : fst >= 2 ? 2 : 0;
    // Optimistic XP + gems update in UI
    const oldXp = child?.xp || 0;
    const newXp = oldXp + xpEarned;
    setChild(c => c ? { ...c, xp:newXp, coins:(c.coins||0)+fst*10, gems:(c.gems||0)+gemGain, level:Math.floor(newXp/200)+1, total_correct:(c.total_correct||0)+fs } : c);
    if (xpEarned > 0 && Math.floor(newXp/100) > Math.floor(oldXp/100)) {
      setTimeout(() => SFX.xpLevelUp(), 950);
    }

    // Save to DB in background (non-blocking)
    db.saveProgress(child.id, lesson.id + "_s" + setIndex, { correct:fs, total:totalQ, stars:fst, xpEarned, isSchoolStudent:!!(child.is_school_student) });
    db.addXP(child.id, xpEarned, fst * 10, !!(child.is_school_student));
    if (gemGain > 0) db.addGems(child.id, gemGain);
    // First lesson badge
    if (!Array.isArray(child.badge_ids) || !child.badge_ids.includes("first_lesson")) {
      db.unlockBadge(child.id, "first_lesson");
    }
    // Perfect score badge
    if (fst >= 3 && (!Array.isArray(child.badge_ids) || !child.badge_ids.includes("perfect_score"))) {
      db.unlockBadge(child.id, "perfect_score");
    }
    // Check & unlock other badges async
    if (typeof setNewBadges === "function") {
      (async () => {
        const updChild = { ...child, xp:(child.xp||0)+xpEarned, streak_days:child.streak_days||0, total_correct:(child.total_correct||0)+fs, badge_ids:child.badge_ids||[] };
        const newBadgeIds = await db.checkAndUnlockBadges(child.id, updChild);
        if (newBadgeIds.length > 0 && fst >= 1) setNewBadges(newBadgeIds);
      })();
    }
  }, [child.id, lesson.id, questions, mode, setChild, setIndex, clearGameState]);
  useEffect(() => { finalizeRef.current = finalize; }, [finalize]);

  const advance = useCallback((shouldEnd) => {
    if (shouldEnd) { finalize(); return; }
    SFX.questionAppear();
    setQi(x => x+1); setChosen(null); setHint(false); processing.current = false;
  }, [finalize]);

  const pick = useCallback((ansIdx) => {
    if (chosen !== null || processing.current) return;
    processing.current = true;
    if (!questions || questions.length === 0) return;
    const q = questions[qi % questions.length];
    if (!q) return;
    const ok = ansIdx === q.ans;
    if (mode === "bubble") { if (ok) SFX.bubbleCorrect(); else SFX.bubbleWrong(); }
    else { if (ok) SFX.correct(); else SFX.wrong(); }
    setChosen(ansIdx);
    // Record for post-set review
    historyRef.current = [...historyRef.current, { q: q.question || q.q || "", opts: q.options || q.opts || [], chosen: ansIdx, ans: q.ans, ok }];
    let newLives = livesRef.current;
    if (ok) {
      scoreRef.current += 1; setScore(scoreRef.current);
      setBurst(true); setTimeout(() => setBurst(false), 600);
    } else {
      newLives = Math.max(0, livesRef.current - 1); livesRef.current = newLives; setLives(newLives);
    }
    const end = qi+1 >= questions.length || (livesRef.current <= 0 && !ok);
    // Persist progress — so if interrupted, student resumes from next question
    const nextQi = end ? qi : qi + 1;
    saveGameState(nextQi, scoreRef.current, livesRef.current, questions);
    setTimeout(() => advance(end), 900);
  }, [chosen, qi, questions, mode, advance, saveGameState]);

  const fs   = scoreRef.current;
  const fst  = fs >= 16 ? 3 : fs >= 12 ? 2 : fs >= 6 ? 1 : 0;
  // Loading state while fetching from Supabase
  // ── Back confirm modal (rendered over whichever mode is active) ──
  const BackConfirmModal = showBackConfirm ? (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:C.card,border:`2px solid ${C.orange}55`,borderRadius:24,padding:"28px 22px",width:"100%",maxWidth:320,textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:10}}>⚠️</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.orange,marginBottom:6}}>LEAVE THIS SET?</div>
        <div style={{fontSize:13,color:C.dim,marginBottom:18,lineHeight:1.6}}>Your progress is saved up to Q{qi}.<br/>You can <strong style={{color:C.cyan}}>resume from here</strong> next time.</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setShowBackConfirm(false)}
            style={{flex:1,background:"transparent",border:`1.5px solid ${C.dim}44`,borderRadius:12,padding:"12px",color:C.dim,fontFamily:"'Nunito',sans-serif",fontSize:14,cursor:"pointer",fontWeight:700}}>
            Keep Playing
          </button>
          <button onClick={()=>{setShowBackConfirm(false); onBack();}}
            style={{flex:1,background:`linear-gradient(135deg,${C.orange},${C.red})`,border:"none",borderRadius:12,padding:"12px",color:"white",fontFamily:"'Orbitron',sans-serif",fontSize:10,cursor:"pointer",fontWeight:700}}>
            SAVE & EXIT
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (questions === null) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif" }}>
      <Starfield n={20}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{ width:44, height:44, border:`3px solid ${C.purple}44`, borderTopColor:C.purple, borderRadius:"50%", animation:"spinR 0.8s linear infinite", margin:"0 auto 14px" }}/>
        <div style={{ fontFamily:"'Orbitron',sans-serif", color:C.dim, fontSize:11, letterSpacing:2 }}>LOADING QUESTIONS…</div>
      </div>
    </div>
  );

  if (questions.length === 0) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif" }}>
      <Starfield n={20}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", color:C.red, fontSize:13, marginBottom:14 }}>⚠ Questions not found.<br/>Check Supabase seed.</div>
        <Btn color={C.dim} style={{width:160,padding:"10px"}} onClick={onBack}>← BACK</Btn>
      </div>
    </div>
  );

  const q    = questions[qi % questions.length];

  if (done) return (
    <>
    {newBadges && newBadges.length > 0 && <BadgeUnlockToast badges={newBadges} onDone={()=>setNewBadges && setNewBadges([])}/>}
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#F5F0FF,#FAFBFF)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Baloo 2','Nunito',sans-serif", padding:22, position:"relative", overflow:"hidden" }}>
      {showCert && <Certificate child={child} lesson={lesson} stars={fst} onClose={()=>setShowCert(false)}/>}
      <Confetti active={fst>=2}/>
      <Starfield n={60}/>
      {/* Big celebration emoji rain for perfect score */}
      {["🎉","⭐","🚀","🏆","🌟","🎊","💫","✨","🎈","🌈","🎆","💝","⚡","🍬"].map((e,i)=>(
        <div key={i} style={{position:"absolute",left:`${5+i*7}%`,top:-20,fontSize:22,animation:`mmConfetti ${1.5+i*0.2}s ${i*0.1}s ease-in forwards`,zIndex:0,pointerEvents:"none"}}>{e}</div>
      ))}
      <div style={{ position:"relative", zIndex:1, textAlign:"center", animation:"popIn 0.5s ease", width:"100%", maxWidth:360 }}>
        <div style={{ fontSize:90, marginBottom:8, animation:"mmBounce 1.2s ease", filter:"drop-shadow(0 12px 24px #FFC84788)" }}>
          {fst===3 ? "🏆" : fst===2 ? "🥈" : fst>=1 ? "🥉" : "💫"}
        </div>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:28, color:"#5B4FE8", marginBottom:10 }}>
          {fst===3 ? "PERFECT! 🌟" : fst>=2 ? "MISSION COMPLETE! 🚀" : fst>=1 ? "GOOD EFFORT! 💪" : "KEEP TRAINING! 🔥"}
        </div>
        <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:20 }}>
          {[1,2,3].map(i => <span key={i} style={{ fontSize:42, filter: i<=fst ? "none" : "grayscale(1) opacity(0.2)", animation: i<=fst ? `mmStarPop 0.4s ease ${i*0.15}s both` : "none" }}>⭐</span>)}
        </div>
        <Card color={C.purple} style={{ marginBottom:16, textAlign:"center", padding:"18px 26px" }}>
          <div style={{ color:C.dim, fontSize:13, fontWeight:700, letterSpacing:1, marginBottom:4 }}>YOUR SCORE</div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:50, color:"#1A1040", fontWeight:900 }}>{fs}<span style={{ fontSize:20, color:"#5A4E8A", fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>/{questions.length}</span></div>
          <div style={{ color:"#FFC847", fontWeight:900, fontSize:15, marginTop:6 }}>+{fs*20} XP 🌟 +{fst*10} Coins 🪙</div>
          <div style={{ color:C.green, fontSize:13, marginTop:6, fontWeight:700 }}>✅ Progress saved!</div>
        </Card>

        {/* ── Answer Review ── */}
        {historyRef.current.length > 0 && (
          <div style={{ width:"100%", marginBottom:16, textAlign:"left" }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:16, color:"#5B4FE8", marginBottom:10, textAlign:"center", letterSpacing:0.5 }}>
              📋 Answer Review
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {historyRef.current.map((h, i) => (
                <div key={i} style={{
                  background: h.ok ? "#E8FFF4" : "#FFF0F0",
                  border: "1.5px solid " + (h.ok ? "#2ECC9A44" : "#FF6B6B44"),
                  borderRadius: 16,
                  padding: "10px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}>
                  {/* Question */}
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:16, flexShrink:0 }}>{h.ok ? "✅" : "❌"}</span>
                    <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:800, color:"#1A1040", flex:1 }}>{h.q}</span>
                    <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:11, color: h.ok ? "#2ECC9A" : "#FF6B6B", fontWeight:900, background: h.ok ? "#2ECC9A18" : "#FF6B6B18", borderRadius:8, padding:"2px 8px", flexShrink:0 }}>
                      Q{i+1}
                    </span>
                  </div>
                  {/* Answer detail */}
                  <div style={{ paddingLeft:24, display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
                    {h.ok ? (
                      <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:14, color:"#2ECC9A" }}>
                        {h.opts[h.chosen]} ✓
                      </span>
                    ) : (
                      <>
                        <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:14, color:"#FF6B6B", textDecoration:"line-through", opacity:0.8 }}>
                          {h.opts[h.chosen] ?? "—"}
                        </span>
                        <span style={{ fontSize:12, color:"#9890C4" }}>→</span>
                        <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:14, color:"#2ECC9A", fontWeight:900 }}>
                          {h.opts[h.ans]} ✓
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {setIndex < 9 && fst >= 1 && (
          <div style={{ background:"#2ECC9A14", border:"1.5px solid #2ECC9A40", borderRadius:14, padding:"10px 18px", marginBottom:14, width:"100%", animation:"popIn 0.4s 0.3s both" }}>
            <div style={{ color:"#2ECC9A", fontSize:16, fontWeight:800, textAlign:"center" }}>🔓 Set {setIndex+2} Unlocked!</div>
          </div>
        )}
        {setIndex < 9 && fst >= 1
          ? <Btn color="#5B4FE8" style={{ width:"100%", marginBottom:10 }} onClick={() => onNextSet && onNextSet(setIndex+1)}>Next Set →</Btn>
          : <Btn color="#5B4FE8" style={{ width:"100%", marginBottom:10 }} onClick={onDone}>Done ✓</Btn>
        }
        <div style={{ display:"flex", gap:10, width:"100%" }}>
          <button style={{ flex:1, background:"#F5F3FF", border:"1.5px solid #5B4FE820", borderRadius:20, padding:"14px", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:14, color:"#5A4E8A" }} onClick={() => {
            scoreRef.current = 0; livesRef.current = 3; processing.current = false;
            historyRef.current = [];
            setQi(0); setChosen(null); setScore(0); setLives(3); setDone(false);
          }}>↺ Retry</button>
          <button style={{ flex:1, background:"#F5F3FF", border:"1.5px solid #5B4FE820", borderRadius:20, padding:"14px", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:14, color:"#5A4E8A" }} onClick={onBack}>🏠 Home</button>
        </div>
      </div>
    </div>
    </>
  );

  // Bubble pop
  if (mode === "bubble") return (
    <div style={{ minHeight:"100vh", background:"#FAFBFF", fontFamily:"'Nunito',sans-serif", position:"relative", overflow:"hidden" }}>
      <Starfield n={18}/>
      <div style={{ position:"relative", zIndex:2, background:`${world.color}16`, borderBottom:`1px solid ${world.color}2a`, padding:"12px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <BackBtn onClick={handleBack} color={world.color}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color:world.color }}>🫧 BUBBLE POP · Q{qi+1}/{questions.length}</div>
          <div style={{ display:"flex", gap:3 }}>{[1,2,3].map(i => <span key={i} style={{ fontSize:13, opacity: i<=lives ? 1 : 0.15 }}>❤️</span>)}</div>
        </div>
        {resumed && qi > 0 && (
          <div style={{ marginTop:5, background:`${C.orange}22`, border:`1px solid ${C.orange}44`, borderRadius:8, padding:"3px 10px", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:11 }}>⚡</span>
            <span style={{ fontSize:9, color:C.orange, fontFamily:"'Orbitron',sans-serif", fontWeight:700 }}>RESUMING — Q{qi+1} · Score: {score}</span>
          </div>
        )}
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"18px 18px", textAlign:"center" }}>
        <Card color={world.color} style={{ marginBottom:18, padding:"14px" }}>
          <div style={{ fontSize:20, color:textColor(), fontWeight:800, lineHeight:1.4 }}>{q.q}</div>
          <div style={{ color:C.dim, fontSize:11, marginTop:5, fontFamily:"'Orbitron',sans-serif" }}>TAP THE CORRECT BUBBLE!</div>
        </Card>
        <div style={{ display:"flex", flexWrap:"wrap", gap:16, justifyContent:"center", marginTop:10 }}>
          {bubbles.map((b, idx) => {
            let bg    = `radial-gradient(circle at 30% 30%, ${world.color}88, ${world.color}33)`;
            let brd   = `3px solid ${world.color}88`;
            if (chosen !== null) {
              if (b.id === q.ans)     { bg = `radial-gradient(circle at 30% 30%, ${C.green}88, ${C.green}33)`; brd = `3px solid ${C.green}`; }
              else if (b.id === chosen){ bg = `radial-gradient(circle at 30% 30%, ${C.red}88, ${C.red}33)`;   brd = `3px solid ${C.red}`;   }
            }
            return (
              <button key={b.id} onClick={() => chosen === null && pick(b.id)} style={{ width:96, height:96, borderRadius:"50%", background:bg, border:brd, color:textColor(), fontSize:19, fontWeight:800, cursor: chosen!==null?"default":"pointer", boxShadow:`0 0 22px ${world.color}66`, animation:`bFloat ${2+idx*0.3}s ease-in-out ${idx*0.2}s infinite`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                {b.text}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop:16, color:C.dim, fontSize:12, fontWeight:700 }}>Score: {score} ⭐</div>
      </div>
      {BackConfirmModal}
    </div>
  );

  // Standard quiz
  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Nunito',sans-serif", position:"relative", background: burst ? `radial-gradient(circle at 50% 40%,${world.color}18 0%,#FAFBFF 65%)` : "#FAFBFF", transition:"background 0.4s" }}>
      <Starfield n={16}/>
      <div style={{ position:"relative", zIndex:2, background:`${world.color}15`, borderBottom:`1.5px solid ${world.color}25`, padding:"12px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
          <BackBtn onClick={handleBack} color={world.color}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:world.color }}>{lesson.emoji} {lesson.title}</div>
          <div style={{ display:"flex", gap:3 }}>{[1,2,3].map(i => <span key={i} style={{ fontSize:13, opacity: i<=lives ? 1 : 0.15 }}>❤️</span>)}</div>
        </div>
        <div style={{ background:`${world.color}18`, borderRadius:7, height:5, overflow:"hidden" }}>
          <div style={{ width:`${((qi+1)/questions.length)*100}%`, height:"100%", background:`linear-gradient(90deg,${world.color},${C.cyan})`, borderRadius:7, transition:"width 0.4s", boxShadow:`0 0 8px ${world.color}66` }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
          <span style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif" }}>Q {qi+1}/{questions.length}</span>
          <span style={{ fontSize:9, color:C.yellow, fontFamily:"'Orbitron',sans-serif" }}>SCORE: {score}</span>
        </div>
        {resumed && qi > 0 && (
          <div style={{ marginTop:6, background:`${C.orange}22`, border:`1px solid ${C.orange}44`, borderRadius:8, padding:"4px 10px", display:"flex", alignItems:"center", gap:6, animation:"fadeIn 0.4s ease" }}>
            <span style={{ fontSize:13 }}>⚡</span>
            <span style={{ fontSize:10, color:C.orange, fontFamily:"'Orbitron',sans-serif", fontWeight:700 }}>RESUMING — Q{qi+1} · Score: {score}</span>
          </div>
        )}
      </div>
      {/* ✅ Correct / ❌ Wrong floating emoji */}
      {chosen!==null && chosen===q.ans && (
        <div style={{position:"fixed",top:"30%",left:"50%",transform:"translateX(-50%)",zIndex:999,pointerEvents:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <div style={{fontSize:72,animation:"floatEmoji 1.2s ease-out forwards"}}>⭐</div>
          <div style={{fontSize:52,animation:"floatEmoji 1.2s 0.15s ease-out forwards"}}>🎉</div>
        </div>
      )}
      {chosen!==null && chosen!==q.ans && (
        <div style={{position:"fixed",top:"30%",left:"50%",transform:"translateX(-50%)",zIndex:999,pointerEvents:"none"}}>
          <div style={{fontSize:64,animation:"floatEmoji 1s ease-out forwards"}}>💫</div>
        </div>
      )}
      <div style={{ position:"relative", zIndex:2, padding:"14px 16px" }}>
        <Card color={world.color} style={{ textAlign:"center", padding:"22px 18px", marginBottom:16,
          transform: chosen===q.ans&&chosen!==null ? "scale(1)" : "scale(1)",
          animation: chosen===q.ans&&chosen!==null ? "correctBounce 0.6s ease" : chosen!==null&&chosen!==q.ans ? "wrongWiggle 0.5s ease" : "none",
          boxShadow: chosen===q.ans&&chosen!==null ? "0 0 40px #2ECC9A50" : chosen!==null ? "0 0 20px #FF6B6B44" : `0 0 20px ${world.color}22`,
          transition:"box-shadow 0.3s"
        }}>
          <div style={{ fontSize:42, marginBottom:10, animation:"mmFloat 2s ease-in-out infinite" }}>{lesson.emoji}</div>
          <div style={{ fontSize:20, color:textColor(), lineHeight:1.5, fontWeight:800 }}>{q.q}</div>
        </Card>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          {q.opts.map((opt, i) => {
            const isCorrect = i===q.ans;
            const isChosen  = i===chosen;
            const answered  = chosen!==null;
            let bg="#F5F3FF", border=`2px solid ${world.color}25`, col="#1A1040", shadow="none", anim=`mmPop 0.3s ease ${i*0.06}s both`;
            if (answered) {
              if (isCorrect)     { bg="#E8FFF4"; border="2.5px solid #2ECC9A"; col="#2ECC9A"; shadow="0 0 24px #2ECC9A55"; anim="superCorrect 0.5s ease"; }
              else if (isChosen) { bg="#FFF0F0"; border="2.5px solid #FF6B6B"; col="#FF6B6B"; }
            }
            const optLabels = ["A","B","C","D"];
            return (
              <button key={i} onClick={() => pick(i)} style={{ background:bg, border, borderRadius:18, padding:"16px 12px", fontSize:18, fontWeight:800, color:col, cursor:answered?"default":"pointer", transition:"all 0.2s", boxShadow:shadow, animation:anim, position:"relative", textAlign:"center", lineHeight:1.4, overflow:"hidden" }}>
                {!answered && <div style={{position:"absolute",top:0,left:0,right:0,height:"50%",background:"linear-gradient(180deg,rgba(255,255,255,0.5),transparent)",borderRadius:"18px 18px 0 0",pointerEvents:"none"}}/>}
                <div style={{fontSize:10,color:answered&&isCorrect?"#2ECC9A":answered&&isChosen?"#FF6B6B":world.color,fontFamily:"'Nunito',sans-serif",fontWeight:900,marginBottom:4}}>{optLabels[i]}</div>
                {answered && isCorrect ? "✓ " : answered && isChosen && !isCorrect ? "✗ " : ""}{opt}
              </button>
            );
          })}
        </div>
        {chosen === null && (() => {
          const { totalLeft, freeLeft, extraLeft } = getHintsRemaining(child.id);
          const handleHintTap = () => {
            if (hint) { setHint(false); return; }
            const ok = useHint(child.id);
            if (ok) { SFX.hintReveal(); setHint(true); }
            else { SFX.hintEmpty(); setNoHints(true); }
          };
          return (
            <div>
              <button onClick={handleHintTap} style={{ width:"100%", background: totalLeft>0 ? "#FFC84710" : "#FF6B6B08", border: `1.5px solid ${totalLeft>0?"#FFC84730":"#FF6B6B25"}`, borderRadius:20, padding:"13px 16px", cursor:"pointer", color: totalLeft>0 ? "#FFC847" : "#FF6B6B", fontSize:15, fontWeight:700, textAlign:"left", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span>💡 {hint ? q.h : "Tap for a cosmic hint!"}</span>
                <span style={{ fontSize:11, fontWeight:900, background: totalLeft>0 ? "#FFC84720" : "#FF6B6B18", borderRadius:999, padding:"3px 10px", color: totalLeft>0 ? "#FFC847" : "#FF6B6B", flexShrink:0, marginLeft:8 }}>{totalLeft} left</span>
              </button>
              {totalLeft===0 && !hint && <div style={{ textAlign:"center", fontSize:11, color:"#FF6B6B", marginTop:5, fontWeight:700 }}>No hints left today · Buy more in Shop 🛒</div>}
            </div>
          );
        })()}
        {chosen!==null && chosen===q.ans && (
          <div style={{marginTop:12,textAlign:"center",background:"linear-gradient(135deg,#2ECC9A15,#2ECC9A08)",borderRadius:16,padding:"12px 16px",border:"2px solid #2ECC9A40"}}>
            <div style={{fontSize:28,marginBottom:4,animation:"mmBounce 1s ease infinite"}}>⭐</div>
            <div style={{color:"#2ECC9A",fontSize:17,fontWeight:800}}>Amazing! +{q.xp||10} XP</div>
          </div>
        )}
        {chosen!==null && chosen!==q.ans && (
          <div style={{marginTop:12,textAlign:"center",background:"#FFC84710",borderRadius:16,padding:"12px 16px",border:"1.5px solid #FFC84730"}}>
            <div style={{color:"#FFC847",fontSize:15,fontWeight:800}}>💡 Hint: {q.h}</div>
          </div>
        )}
      </div>
      {BackConfirmModal}
      {noHints && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:"white",borderRadius:24,padding:"28px 22px",width:"100%",maxWidth:320,textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:10}}>💡</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#FF6B6B",marginBottom:6}}>No hints left today!</div>
            <div style={{fontSize:13,color:"#9890C4",marginBottom:18,lineHeight:1.6}}>You have used all 5 free hints for today.<br/>Extra hint packs reset at midnight 🌙<br/><strong style={{color:"#5B4FE8"}}>Buy more in the Shop!</strong></div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setNoHints(false)} style={{flex:1,background:"#F5F3FF",border:"1.5px solid #5B4FE820",borderRadius:12,padding:"12px",color:"#5A4E8A",fontFamily:"'Nunito',sans-serif",fontSize:14,cursor:"pointer",fontWeight:700}}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Abacus ────────────────────────────────────────────────────────────
