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
          if (mode === "boss") {
            setBossHp(savedState.bossHp ?? 100);
            bossHpRef.current = savedState.bossHp ?? 100;
          }
          setResumed(true);
        } else {
          // Fresh start — store a shuffled order so resume works
          const order = qs.map((_, i) => i); // questions already shuffled by fetchSetQuestions
          setQuestions(qs);
          setQi(0); setChosen(null); setScore(0); setHint(false); setDone(false); setSaving(false); setBurst(false);
          setLives(mode === "boss" ? 5 : 3); setBossHp(100); setBossCD(mode === "boss" ? 3 : 0); setTimeLeft(mode === "boss" ? 30 : null);
          scoreRef.current = 0; livesRef.current = mode === "boss" ? 5 : 3; bossHpRef.current = 100; processing.current = false;
          setResumed(false);
          // Persist the order so if interrupted we can restore same question sequence
          try { localStorage.setItem(resumeKey, JSON.stringify({ qi:0, score:0, lives: mode==="boss"?5:3, bossHp:100, questionCount:qs.length, order })); } catch(e) {}
        }
        // Prefetch next set in background
        if (setIndex < 9) fetchSetQuestions(lesson.id, setIndex + 1);
      }
    });
    return () => { cancelled = true; };
  }, [lesson.id, setIndex]);
  const scoreRef   = useRef(0);
  const livesRef   = useRef(mode === "boss" ? 5 : 3);
  const bossHpRef  = useRef(100);
  const processing = useRef(false);

  const [qi,       setQi]       = useState(0);
  const [chosen,   setChosen]   = useState(null);
  const [lives,    setLives]    = useState(mode === "boss" ? 5 : 3);
  const [score,    setScore]    = useState(0);
  const [hint,     setHint]     = useState(false);
  const [done,     setDone]     = useState(false);
  const [burst,    setBurst]    = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [bossHp,   setBossHp]   = useState(100);
  const [timeLeft, setTimeLeft] = useState(mode === "boss" ? 30 : null);
  const [bossCD,   setBossCD]   = useState(mode === "boss" ? 3 : 0);
  const [bubbles,  setBubbles]  = useState([]);
  const [resumed,  setResumed]  = useState(false); // true when restored from saved session

  // ── Persist game state after every answered question ───────────
  const saveGameState = useCallback((newQi, newScore, newLives, newBossHp, qs) => {
    if (!qs) return;
    try {
      const order = qs.map((_, i) => i); // identity — questions already in play order
      localStorage.setItem(resumeKey, JSON.stringify({
        qi: newQi, score: newScore, lives: newLives,
        bossHp: newBossHp, questionCount: qs.length, order
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

  // Boss countdown
  useEffect(() => {
    if (mode !== "boss" || bossCD <= 0) return;
    const t = setTimeout(() => setBossCD(c => c-1), 1000);
    return () => clearTimeout(t);
  }, [bossCD, mode]);

  // Boss timer
  useEffect(() => {
    if (mode !== "boss" || done || bossCD > 0) return;
    const t = setInterval(() => setTimeLeft(tl => {
      if (tl <= 1) { if (finalizeRef.current) finalizeRef.current(); return 0; }
      return tl - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [mode, done, bossCD]);

  // Bubble regeneration — guard against null questions
  useEffect(() => {
    if (mode !== "bubble" || !questions || questions.length === 0) return;
    const q = questions[qi % questions.length];
    if (!q) return;
    setBubbles([...q.opts.map((text, id) => ({ id, text }))].sort(() => Math.random() - 0.5));
    processing.current = false;
  }, [qi, mode, questions]);

  const finalizeRef = useRef(null);
  const finalize = useCallback(() => {
    const fs      = scoreRef.current;
    const fst     = fs >= 16 ? 3 : fs >= 12 ? 2 : fs >= 6 ? 1 : 0;
    setTimeout(()=>{ if(fst>=3) SFX.starEarn(); else if(fst>0) SFX.xpGain(); }, 500);
    const xpEarned = fs * 20 + (mode === "boss" ? 50 : 0);
    const totalQ  = questions ? questions.length : 20;

    // Clear the saved session — set completed cleanly
    clearGameState();

    // Show result immediately — no waiting for DB
    setDone(true);

    const gemGain = fst >= 3 ? 5 : fst >= 2 ? 2 : 0;
    // Optimistic XP + gems update in UI
    setChild(c => c ? { ...c, xp:(c.xp||0)+xpEarned, coins:(c.coins||0)+fst*10, gems:(c.gems||0)+gemGain, level:Math.floor(((c.xp||0)+xpEarned)/200)+1, total_correct:(c.total_correct||0)+fs, bosses_defeated: mode==="boss"?(c.bosses_defeated||0)+1:(c.bosses_defeated||0) } : c);

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
        const updChild = { ...child, xp:(child.xp||0)+xpEarned, streak_days:child.streak_days||0, total_correct:(child.total_correct||0)+fs, bosses_defeated:mode==="boss"?(child.bosses_defeated||0)+1:(child.bosses_defeated||0), badge_ids:child.badge_ids||[] };
        const newBadgeIds = await db.checkAndUnlockBadges(child.id, updChild);
        if (newBadgeIds.length > 0 && fst >= 1) setNewBadges(newBadgeIds);
      })();
    }
    if(xpEarned>0) setTimeout(()=>SFX.xpGain(), 300);
  }, [child.id, lesson.id, questions, mode, setChild, setIndex, clearGameState]);
  useEffect(() => { finalizeRef.current = finalize; }, [finalize]);

  const advance = useCallback((shouldEnd) => {
    if (shouldEnd) { finalize(); return; }
    setQi(x => x+1); setChosen(null); setHint(false); processing.current = false;
  }, [finalize]);

  const pick = useCallback((ansIdx) => {
    if (chosen !== null || processing.current) return;
    processing.current = true;
    if (!questions || questions.length === 0) return;
    const q = questions[qi % questions.length];
    if (!q) return;
    const ok = ansIdx === q.ans;
    if (ok) SFX.correct(); else SFX.wrong();
    setChosen(ansIdx);
    let newLives = livesRef.current;
    let newBossHp = bossHpRef.current;
    if (ok) {
      scoreRef.current += 1; setScore(scoreRef.current);
      setBurst(true); setTimeout(() => setBurst(false), 600);
      if (mode === "boss") { SFX.bossHit(); newBossHp = Math.max(0, bossHpRef.current - 20); bossHpRef.current = newBossHp; setBossHp(newBossHp); }
    } else {
      newLives = Math.max(0, livesRef.current - 1); livesRef.current = newLives; setLives(newLives);
    }
    const end = qi+1 >= questions.length || (livesRef.current <= 0 && !ok) || (mode === "boss" && bossHpRef.current <= 0);
    // Persist progress — so if interrupted, student resumes from next question
    const nextQi = end ? qi : qi + 1;
    saveGameState(nextQi, scoreRef.current, livesRef.current, bossHpRef.current, questions);
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
    <div style={{ minHeight:"100vh", background: fst>=2 ? "linear-gradient(160deg,#0a0a1f,#05161a,#0a0a1f)" : C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Baloo 2','Nunito',sans-serif", padding:22, position:"relative", overflow:"hidden" }}>
      {showCert && <Certificate child={child} lesson={lesson} stars={fst} onClose={()=>setShowCert(false)}/>}
      <Confetti active={fst>=2}/>
      <Starfield n={60}/>
      {/* Big celebration emoji rain for perfect score */}
      {fst===3 && ["🎉","⭐","🚀","🏆","🌟","🎊","💫","✨"].map((e,i)=>(
        <div key={i} style={{position:"fixed",left:`${10+i*12}%`,top:"-10px",fontSize:28,animation:`confettiFall ${2+i*0.3}s ${i*0.2}s ease-in forwards`,zIndex:0,pointerEvents:"none"}}>{e}</div>
      ))}
      <div style={{ position:"relative", zIndex:1, textAlign:"center", animation:"popIn 0.5s ease", width:"100%", maxWidth:360 }}>
        <div style={{ fontSize:90, marginBottom:8, animation:"heartbeat 1.2s ease infinite", filter:`drop-shadow(0 0 30px ${fst>=2 ? C.yellow : C.dim})` }}>
          {mode==="boss" && bossHpRef.current<=0 ? "🏆" : fst===3 ? "🏆" : fst===2 ? "🥈" : fst>=1 ? "🥉" : "💫"}
        </div>
        <div style={{ fontSize:26, fontWeight:900, background:`linear-gradient(135deg,${C.cyan},${C.purple})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:10 }}>
          {mode==="boss" && bossHpRef.current<=0 ? "BOSS DEFEATED! 💥" : fst===3 ? "PERFECT! 🌟" : fst>=2 ? "MISSION COMPLETE! 🚀" : fst>=1 ? "GOOD EFFORT! 💪" : "KEEP TRAINING! 🔥"}
        </div>
        <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:20 }}>
          {[1,2,3].map(i => <span key={i} style={{ fontSize:46, filter: i<=fst ? "none" : "grayscale(1) opacity(0.2)", animation: i<=fst ? `starPop 0.4s ${i*0.15}s both` : "none" }}>⭐</span>)}
        </div>
        <Card color={C.purple} style={{ marginBottom:16, textAlign:"center", padding:"18px 26px" }}>
          <div style={{ color:C.dim, fontSize:13, fontWeight:700, letterSpacing:1, marginBottom:4 }}>YOUR SCORE</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:48, color:textColor(), fontWeight:900 }}>{fs}<span style={{ fontSize:18, color:C.dim }}>/{questions.length}</span></div>
          <div style={{ color:C.yellow, fontWeight:800, fontSize:16, marginTop:6 }}>+{fs*20+(mode==="boss"?50:0)} XP 🌟 +{fst*10} Coins 🪙</div>
          <div style={{ color:C.green, fontSize:13, marginTop:6, fontWeight:700 }}>✅ Progress saved!</div>
        </Card>
        {setIndex < 9 && fst >= 1 && (
          <div style={{ background:`${C.green}18`, border:`2px solid ${C.green}44`, borderRadius:14, padding:"10px 18px", marginBottom:14, width:"100%", animation:"popIn 0.4s 0.3s both" }}>
            <div style={{ color:C.green, fontSize:16, fontWeight:800, textAlign:"center" }}>🔓 Set {setIndex+2} Unlocked!</div>
          </div>
        )}
        <div style={{ display:"flex", gap:10, width:"100%" }}>
          <Btn color={C.dim} style={{ flex:1 }} onClick={() => {
            scoreRef.current = 0; livesRef.current = mode==="boss"?5:3; bossHpRef.current = 100; processing.current = false;
            setQi(0); setChosen(null); setScore(0); setLives(mode==="boss"?5:3); setBossHp(100); setDone(false); setBossCD(mode==="boss"?3:0); setTimeLeft(mode==="boss"?30:null);
          }}>↺ Retry</Btn>
          <Btn color={C.purple} style={{ flex:1 }} onClick={onBack}>🏠 Home</Btn>
          {setIndex < 9 && fst >= 1
            ? <Btn color={C.cyan} style={{ flex:1 }} onClick={() => onNextSet && onNextSet(setIndex+1)}>Next Set →</Btn>
            : <Btn color={C.cyan} style={{ flex:1 }} onClick={onDone}>Done ✓</Btn>
          }
        </div>
      </div>
    </div>
    </>
  );

  if (mode === "boss" && bossCD > 0) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={30}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{ fontSize:80, marginBottom:16, animation:"bossW 0.5s ease-in-out infinite" }}>{lesson.boss||"👾"}</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:16, color:C.red, marginBottom:12, letterSpacing:2 }}>BOSS INCOMING!</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:80, color:C.yellow, textShadow:`0 0 40px ${C.yellow}` }}>{bossCD}</div>
      </div>
    </div>
  );

  // Boss UI
  if (mode === "boss") return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={25}/>
      <div style={{ position:"relative", zIndex:2, background:`${C.red}18`, borderBottom:`1px solid ${C.red}33`, padding:"12px 18px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <BackBtn onClick={handleBack} color={C.red}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:12, color:C.red }}>⚔️ BOSS BATTLE</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:16, color: timeLeft<=10 ? C.red : C.yellow }}>{timeLeft}s</div>
        </div>
        <div style={{ marginBottom:5 }}>
          <div style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif", marginBottom:3 }}>BOSS HP</div>
          <div style={{ background:isDark()?"rgba(255,255,255,0.06)":"rgba(124,111,224,0.06)", borderRadius:8, height:10, overflow:"hidden" }}>
            <div style={{ width:`${bossHp}%`, height:"100%", background:`linear-gradient(90deg,${C.red},${C.orange})`, borderRadius:8, transition:"width 0.4s" }}/>
          </div>
        </div>
        <div style={{ display:"flex", gap:3 }}>{[1,2,3,4,5].map(i => <span key={i} style={{ fontSize:12, opacity: i<=lives ? 1 : 0.15 }}>❤️</span>)}</div>
        {resumed && qi > 0 && (
          <div style={{ marginTop:5, background:`${C.orange}22`, border:`1px solid ${C.orange}44`, borderRadius:8, padding:"3px 10px", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:11 }}>⚡</span>
            <span style={{ fontSize:9, color:C.orange, fontFamily:"'Orbitron',sans-serif", fontWeight:700 }}>RESUMING — Q{qi+1} · Score: {score}</span>
          </div>
        )}
      </div>
      <div style={{ position:"relative", zIndex:2, padding:"14px 18px", textAlign:"center" }}>
        <div style={{ fontSize:58, animation:"bossW 1.5s ease-in-out infinite", marginBottom:10 }}>{lesson.boss||"👾"}</div>
        {burst && <div style={{ fontSize:13, color:C.green, marginBottom:6, fontFamily:"'Orbitron',sans-serif", position:"fixed", top:"20%", left:"50%", transform:"translateX(-50%)", zIndex:998, background:`${C.green}22`, borderRadius:12, padding:"8px 20px" }}>⚡ HIT! Boss HP: {bossHp}%</div>}
        <Card color={C.red} style={{ marginBottom:12, padding:"16px 14px", textAlign:"left" }}>
          <div style={{ fontSize:20, color:textColor(), lineHeight:1.5, fontWeight:800 }}>{q.q}</div>
        </Card>
        <div style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif", marginBottom:8 }}>Q {qi+1}/{questions.length} · Score: {score}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {q.opts.map((opt, i) => {
            let bg=C.card, border=`1.5px solid ${C.red}28`, col="white";
            if (chosen!==null) { if(i===q.ans){bg="#052e16";border=`2px solid ${C.green}`;col="#4ade80";}else if(i===chosen){bg="#2d0a0a";border=`2px solid ${C.red}`;col="#f87171";} }
            return <button key={i} onClick={() => pick(i)} style={{ background:bg, border, borderRadius:18, padding:"18px 12px", fontSize:18, fontWeight:800, color:col, cursor: chosen!==null?"default":"pointer", transition:"all 0.2s", boxShadow: i===q.ans&&chosen!==null?`0 0 20px ${C.green}66`:"none", animation:i===q.ans&&chosen!==null?"superCorrect 0.5s ease":"none" }}>{i===q.ans&&chosen!==null?"✓ ":""}{opt}</button>;
          })}
        </div>
      </div>
      {BackConfirmModal}
    </div>
  );

  // Bubble pop
  if (mode === "bubble") return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", position:"relative", overflow:"hidden" }}>
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
              if (b.id === q.ans)     { SFX.bubblePop(); bg = `radial-gradient(circle at 30% 30%, ${C.green}88, ${C.green}33)`; brd = `3px solid ${C.green}`; }
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
    <div style={{ minHeight:"100vh", fontFamily:"'Nunito',sans-serif", position:"relative", background: burst ? `radial-gradient(circle at 50% 40%,${world.color}18 0%,${C.bg} 65%)` : C.bg, transition:"background 0.4s" }}>
      <Starfield n={16}/>
      <div style={{ position:"relative", zIndex:2, background:`${world.color}16`, borderBottom:`1px solid ${world.color}2a`, padding:"12px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
          <BackBtn onClick={handleBack} color={world.color}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:world.color }}>{lesson.emoji} {lesson.title}</div>
          <div style={{ display:"flex", gap:3 }}>{[1,2,3].map(i => <span key={i} style={{ fontSize:13, opacity: i<=lives ? 1 : 0.15 }}>❤️</span>)}</div>
        </div>
        <div style={{ background:isDark()?"rgba(255,255,255,0.06)":"rgba(124,111,224,0.06)", borderRadius:7, height:5, overflow:"hidden" }}>
          <div style={{ width:`${((qi+1)/questions.length)*100}%`, height:"100%", background:`linear-gradient(90deg,${world.color},${C.cyan})`, borderRadius:7, transition:"width 0.4s" }}/>
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
          boxShadow: chosen===q.ans&&chosen!==null ? `0 0 40px ${C.green}66` : chosen!==null ? `0 0 20px ${C.red}44` : `0 0 20px ${world.color}22`,
          transition:"box-shadow 0.3s"
        }}>
          <div style={{ fontSize:42, marginBottom:10 }}>{lesson.emoji}</div>
          <div style={{ fontSize:20, color:textColor(), lineHeight:1.5, fontWeight:800 }}>{q.q}</div>
        </Card>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          {q.opts.map((opt, i) => {
            const isCorrect = i===q.ans;
            const isChosen  = i===chosen;
            const answered  = chosen!==null;
            let bg=C.card, border=`2px solid ${world.color}${isDark()?"28":"44"}`, col=textColor(), shadow="none", anim="none";
            if (answered) {
              if (isCorrect)     { bg=isDark()?"#052e16":"#edfff6"; border=`3px solid ${C.green}`; col=isDark()?"#4ade80":"#065f46"; shadow=`0 0 24px ${C.green}88`; anim="superCorrect 0.5s ease"; }
              else if (isChosen) { bg=isDark()?"#2d0a0a":"#fff1f1"; border=`3px solid ${C.red}`;   col=isDark()?"#f87171":"#991b1b"; shadow=`0 0 14px ${C.red}44`; }
            }
            const optLabels = ["A","B","C","D"];
            return (
              <button key={i} onClick={() => pick(i)} style={{ background:bg, border, borderRadius:18, padding:"16px 12px", fontSize:18, fontWeight:800, color:col, cursor:answered?"default":"pointer", transition:"all 0.2s", boxShadow:shadow, animation:anim, position:"relative", textAlign:"center", lineHeight:1.4 }}>
                <div style={{fontSize:11,color:answered&&isCorrect?(isDark()?"#4ade80":"#065f46"):answered&&isChosen?(isDark()?"#f87171":"#991b1b"):world.color,fontFamily:"'Orbitron',sans-serif",marginBottom:4,opacity:0.8}}>{optLabels[i]}</div>
                {answered && isCorrect ? "✓ " : answered && isChosen && !isCorrect ? "✗ " : ""}{opt}
              </button>
            );
          })}
        </div>
        {chosen === null && (
          <button onClick={() => setHint(h => !h)} style={{ width:"100%", background: hint ? `${C.yellow}18` : C.card, border:`2px solid ${hint ? C.yellow+"66" : "#111128"}`, borderRadius:16, padding:"13px 16px", cursor:"pointer", color: hint ? C.yellow : C.dim, fontSize:15, fontWeight:700, textAlign:"left" }}>
            💡 {hint ? q.h : "Tap for a cosmic hint!"}
          </button>
        )}
        {chosen!==null && chosen===q.ans && (
          <div style={{marginTop:12,textAlign:"center",background:isDark()?`${C.green}15`:"#edfff6",borderRadius:16,padding:"12px 16px",border:`2px solid ${C.green}${isDark()?"33":"88"}`}}>
            <div style={{fontSize:28,marginBottom:4,animation:"heartbeat 1s ease infinite"}}>🌟</div>
            <div style={{color:C.green,fontSize:17,fontWeight:800}}>Amazing! +{q.xp||10} XP</div>
          </div>
        )}
        {chosen!==null && chosen!==q.ans && (
          <div style={{marginTop:12,textAlign:"center",background:isDark()?`${C.orange}12`:"#fffbf0",borderRadius:16,padding:"12px 16px",border:`2px solid ${C.orange}${isDark()?"33":"77"}`}}>
            <div style={{color:C.orange,fontSize:15,fontWeight:800}}>💡 Hint: {q.h}</div>
          </div>
        )}
      </div>
      {BackConfirmModal}
    </div>
  );
}

// ── Abacus ────────────────────────────────────────────────────────────
