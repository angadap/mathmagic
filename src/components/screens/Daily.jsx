// src/components/screens/Daily.jsx — DailyQuestHub, DailyQuiz, DailyPuzzle
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, BackBtn, Card } from '../ui/primitives.jsx';
import { LESSONS } from '../../constants/gameData.js';
import { Starfield } from '../layout/layout.jsx';


// ── Daily Quest Hub — unified wrapper for all 3 daily tasks ─────────────────
// Shows a step-through flow: Do a Set → Word Problem → Brain Puzzle
// Each tab can be done in any order; hub tracks completion and shows summary
export function DailyQuestHub({ child, dqDone, dpDone, setDone, onWorld, worldW, onClose }) {
  // 0=overview  1=set  2=challenge  3=puzzle  4=allDone
  const [step,       setStep]       = useState(0);
  const [localDQ,    setLocalDQ]    = useState(dqDone);
  const [localDP,    setLocalDP]    = useState(dpDone);
  const [localSet,   setLocalSet]   = useState(setDone);
  const allDone = localDQ && localDP && localSet;

  const tasks = [
    { id:"set",       icon:"🧮", label:"Do a Set",     xp:150, coins:0,  color:C.cyan,   done:localSet,  step:1 },
    { id:"challenge", icon:"🌟", label:"Word Problem",  xp:50,  coins:10, color:C.yellow, done:localDQ,   step:2 },
    { id:"puzzle",    icon:"🧩", label:"Brain Puzzle",  xp:75,  coins:15, color:C.purple, done:localDP,   step:3 },
  ];
  const doneCount = tasks.filter(t=>t.done).length;

  // ── Overview screen ───────────────────────────────────────────────
  if (step === 0) return (
    <div style={{position:"fixed",inset:0,background:isDark()?"rgba(4,4,15,0.96)":"rgba(240,244,255,0.97)",
      backdropFilter:"blur(16px)",zIndex:998,display:"flex",flexDirection:"column",fontFamily:"'Baloo 2','Nunito',sans-serif",overflowY:"auto"}}>
      <Starfield n={30}/>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",padding:"20px 18px 32px",maxWidth:480,margin:"0 auto",width:"100%"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <BackBtn onClick={onClose}/>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,color:C.purple,fontWeight:700}}>DAILY QUEST</div>
            <div style={{fontSize:11,color:C.dim}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
          </div>
          <div style={{background:`${C.purple}22`,border:`1px solid ${C.purple}44`,borderRadius:12,padding:"4px 12px",
            fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.purple,fontWeight:700}}>{doneCount}/3</div>
        </div>

        {/* Hero banner */}
        <div style={{background:`linear-gradient(135deg,${C.purple}28,${C.cyan}18)`,border:`2px solid ${C.purple}44`,
          borderRadius:24,padding:"22px 20px",marginBottom:18,textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-20,top:-20,width:120,height:120,borderRadius:"50%",
            background:`radial-gradient(circle,${C.yellow}22,transparent 70%)`,pointerEvents:"none"}}/>
          <div style={{fontSize:56,marginBottom:8,animation:"floatUp 2.5s ease-in-out infinite"}}>
            {allDone?"🏆":doneCount===0?"🚀":doneCount===1?"⚡":"🔥"}
          </div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,color:textColor(),fontWeight:900,marginBottom:4}}>
            {allDone?"QUEST COMPLETE!":doneCount===0?"YOUR DAILY QUEST":"KEEP GOING!"}
          </div>
          <div style={{fontSize:12,color:C.dim,lineHeight:1.6}}>
            {allDone?"Amazing! You finished all 3 tasks today! 🌟"
              :`Complete all 3 tasks to earn `}<span style={{color:C.yellow,fontWeight:800}}>+275 XP</span>
            {!allDone && <span> & </span>}{!allDone && <span style={{color:C.orange,fontWeight:800}}>+35 Coins</span>}
          </div>
          {/* Overall progress bar */}
          <div style={{background:"rgba(255,255,255,0.1)",borderRadius:8,height:6,overflow:"hidden",marginTop:14}}>
            <div style={{width:`${(doneCount/3)*100}%`,height:"100%",
              background:`linear-gradient(90deg,${C.cyan},${C.purple},${C.pink})`,borderRadius:8,transition:"width 0.6s ease"}}/>
          </div>
        </div>

        {/* Task cards */}
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          {tasks.map((t,i)=>(
            <button key={t.id} onClick={()=>{ if(!t.done) setStep(t.step); }}
              disabled={t.done}
              style={{background:t.done?`${C.green}14`:`${t.color}12`,
                border:`2px solid ${t.done?C.green+"55":t.color+"44"}`,
                borderRadius:18,padding:"16px 18px",cursor:t.done?"default":"pointer",
                display:"flex",alignItems:"center",gap:14,textAlign:"left",
                transition:"all 0.2s",opacity:t.done?0.85:1}}>
              <div style={{width:52,height:52,borderRadius:16,
                background:t.done?`${C.green}22`:`${t.color}22`,
                border:`2px solid ${t.done?C.green+"44":t.color+"44"}`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>
                {t.done?"✅":t.icon}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:900,color:t.done?C.green:textColor(),marginBottom:3}}>{t.label}</div>
                <div style={{display:"flex",gap:8}}>
                  <span style={{fontSize:11,color:C.yellow,fontWeight:700}}>+{t.xp} XP</span>
                  {t.coins>0&&<span style={{fontSize:11,color:C.orange,fontWeight:700}}>+{t.coins} Coins</span>}
                </div>
              </div>
              {t.done
                ? <div style={{fontSize:13,color:C.green,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>DONE</div>
                : <div style={{fontSize:24,color:t.color}}>›</div>
              }
            </button>
          ))}
        </div>

        {allDone && (
          <div style={{textAlign:"center"}}>
            <Btn color={C.green} onClick={onClose}>🏆 BACK TO HOME</Btn>
          </div>
        )}
      </div>
    </div>
  );

  // ── Step 1: Do a Set — just close hub and open lessons ───────────
  if (step === 1) {
    // Mark as done optimistically and go back to overview, user navigates to lessons
    return (
      <div style={{position:"fixed",inset:0,background:isDark()?"rgba(4,4,15,0.96)":"rgba(240,244,255,0.97)",
        backdropFilter:"blur(16px)",zIndex:998,display:"flex",flexDirection:"column",alignItems:"center",
        justifyContent:"center",padding:24,fontFamily:"'Nunito',sans-serif",gap:16}}>
        <div style={{fontSize:60,animation:"floatUp 2s ease-in-out infinite"}}>🧮</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,color:C.cyan,textAlign:"center",marginBottom:4}}>DO A SET</div>
        <div style={{fontSize:14,color:C.dim,textAlign:"center",lineHeight:1.7,maxWidth:300}}>
          Complete any set from any lesson to earn <span style={{color:C.yellow,fontWeight:800}}>+150 XP</span>. Come back here after!
        </div>
        <div style={{display:"flex",gap:10,marginTop:8,width:"100%",maxWidth:300}}>
          <button onClick={()=>setStep(0)}
            style={{flex:1,background:"transparent",border:`1.5px solid ${C.dim}44`,borderRadius:12,
              padding:12,color:C.dim,fontFamily:"'Nunito',sans-serif",fontSize:14,cursor:"pointer",fontWeight:700}}>
            Back
          </button>
          <button onClick={()=>{ onClose(); onWorld(worldW); }}
            style={{flex:2,background:`linear-gradient(135deg,${C.cyan},${C.purple})`,border:"none",
              borderRadius:12,padding:12,color:"white",fontFamily:"'Orbitron',sans-serif",
              fontSize:11,cursor:"pointer",fontWeight:900}}>
            GO TO LESSONS →
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: Word Problem (DailyQuiz inline) ───────────────────────
  if (step === 2) return (
    <DailyQuiz child={child} onClose={()=>{ setLocalDQ(!!localStorage.getItem(`dq_done_${child.id}_${new Date().toISOString().slice(0,10)}`)); setStep(0); }}/>
  );

  // ── Step 3: Brain Puzzle (DailyPuzzle inline) ─────────────────────
  if (step === 3) return (
    <DailyPuzzle child={child} onClose={()=>{ setLocalDP(!!localStorage.getItem(`dp_done_${child.id}_${new Date().toISOString().slice(0,10)}`)); setStep(0); }}/>
  );

  return null;
}

// ── Daily Quiz ────────────────────────────────────────────────────────
// One word problem per day — seeded by date so all children get the same Q
// Encourages daily visits; resets at midnight
export function DailyQuiz({ child, onClose }) {
  const [challenge, setChallenge] = useState(null);   // from Supabase
  const [loading,   setLoading]   = useState(true);
  const [done,      setDone]      = useState(false);
  const [chosen,    setChosen]    = useState(null);   // 'A','B','C','D'
  const [shake,     setShake]     = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      db.getDailyChallenge(child.class_num || 1),
      db.getDailyCompletion(child.id)
    ]).then(([ch, comp]) => {
      setChallenge(ch);
      if (comp) setDone(true);
      setLoading(false);
    });
    db.track("daily_challenge_open", child.id, null, { class_num: child.class_num });
  }, [child.id, child.class_num]);

  const opts = challenge ? [
    { key:"A", val: challenge.option_a },
    { key:"B", val: challenge.option_b },
    { key:"C", val: challenge.option_c },
    { key:"D", val: challenge.option_d },
  ] : [];

  const handleAnswer = async (key) => {
    if (done || chosen) return;
    setChosen(key);
    const correct = key === challenge.correct;
    if (!correct) { setShake(true); setTimeout(()=>setShake(false),500); }
    else {
      await db.completeDailyChallenge(child.id, challenge.id, true);
      await db.addXP(child.id, challenge.xp_reward||50, challenge.coin_reward||10);
      SFX.dailyDone();
      db.track("daily_challenge_complete", child.id, null, { correct:true });
      const todayKey2 = new Date().toISOString().slice(0,10);
      localStorage.setItem(`dq_done_${child.id}_${todayKey2}`, "1");
      setDone(true);
    }
    if (!correct) {
      db.track("daily_challenge_attempt", child.id, null, { correct:false });
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center",fontFamily:"'Baloo 2','Nunito',sans-serif"}}>
      <div style={{background:"#FAFBFF",borderRadius:"28px 28px 0 0",padding:"0 0 32px",width:"100%",maxWidth:480,boxShadow:"0 -20px 60px rgba(91,79,232,0.2)",maxHeight:"90vh",overflowY:"auto",animation:"mmSlideUp 0.3s ease"}}>
        <div style={{paddingTop:12,marginBottom:4}}>
          <div style={{width:40,height:4,borderRadius:999,background:"rgba(91,79,232,0.1)",margin:"0 auto 10px"}}/>
          <div style={{display:"flex",gap:5,justifyContent:"center"}}>
            {[0,1,2,3,4].map(i=>(
              <div key={i} style={{width:i===0?24:8,height:6,borderRadius:999,background:i===0?"#4BBDF5":"#F0ECFF"}}/>
            ))}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 20px 14px",borderBottom:"1px solid rgba(91,79,232,0.1)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${C.yellow},${C.orange})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🌟</div>
            <div>
              <div style={{fontSize:16,fontWeight:900,color:textColor()}}>Daily Challenge</div>
              <div style={{fontSize:11,color:C.dim}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"rgba(91,79,232,0.08)",border:"none",borderRadius:12,width:36,height:36,fontSize:16,cursor:"pointer",color:"#5B4FE8",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:"16px 20px"}}>

        {loading ? (
          <div style={{textAlign:"center",padding:30,color:C.dim,fontFamily:"'Orbitron',sans-serif",fontSize:12}}>
            <div style={{fontSize:32,marginBottom:10,animation:"spin 1s linear infinite"}}>⭐</div>
            LOADING...
          </div>
        ) : !challenge ? (
          <div style={{textAlign:"center",padding:20}}>
            <div style={{fontSize:40,marginBottom:10}}>📅</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.dim,lineHeight:1.7}}>No challenge today yet.<br/>Check back later!</div>
            <div style={{marginTop:16}}><Btn color={C.dim} onClick={onClose}>CLOSE</Btn></div>
          </div>
        ) : done && !chosen ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:48,marginBottom:10}}>✅</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.green,marginBottom:6}}>ALREADY COMPLETED TODAY!</div>
            <div style={{color:C.dim,fontSize:12,lineHeight:1.7}}>Great job! Come back tomorrow for a new challenge.</div>
            <div style={{marginTop:16}}><Btn color={C.dim} onClick={onClose}>CLOSE</Btn></div>
          </div>
        ) : (
          <>
            <div style={{background:`${C.yellow}10`,border:`1px solid ${C.yellow}22`,borderRadius:14,padding:"16px 18px",marginBottom:18,lineHeight:1.6,fontSize:19,color:textColor(),fontWeight:800}}>
              📖 {challenge.question}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16,animation:shake?"shake 0.4s":"none"}}>
              {opts.map(({key,val})=>{
                const isCorrect = key === challenge.correct;
                const isChosen  = key === chosen;
                const answered  = chosen !== null;
                let bg="white", border="2px solid #9B59F525", color="#1A1040", shadow="none";
                if (answered) {
                  if (isCorrect){bg="#E8FFF4";border="2.5px solid #2ECC9A";color="#2ECC9A";shadow="0 0 24px #2ECC9A55";}
                  else if(isChosen){bg="#FFF0F0";border="2.5px solid #FF6B6B";color="#FF6B6B";}
                }
                return (
                  <button key={key} onClick={()=>handleAnswer(key)} disabled={!!chosen}
                    style={{background:bg,border,borderRadius:16,padding:"14px 12px",cursor:chosen?"default":"pointer",textAlign:"center",color,fontWeight:800,fontSize:16,transition:"all 0.2s",boxShadow:shadow,position:"relative",overflow:"hidden"}}>
                    {!chosen && <div style={{position:"absolute",top:0,left:0,right:0,height:"50%",background:"linear-gradient(180deg,rgba(255,255,255,0.5),transparent)",borderRadius:"16px 16px 0 0",pointerEvents:"none"}}/>}
                    <div style={{fontSize:10,color:answered&&isCorrect?"#2ECC9A":answered&&isChosen?"#FF6B6B":"#9B59F5",fontFamily:"'Nunito',sans-serif",fontWeight:900,marginBottom:4}}>{key}</div>
                    {val}
                    {answered && isCorrect && <div style={{position:"absolute",top:4,right:6,fontSize:14}}>✅</div>}
                    {answered && isChosen && !isCorrect && <div style={{position:"absolute",top:4,right:6,fontSize:14}}>❌</div>}
                  </button>
                );
              })}
            </div>
            {chosen && (
              <div style={{background:chosen===challenge.correct?"#2ECC9A14":"#FFC84710",border:`1px solid ${chosen===challenge.correct?"#2ECC9A40":"#FFC84730"}`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12,color:chosen===challenge.correct?"#2ECC9A":"#FFC847"}}>
                {chosen===challenge.correct ? "🎉 Excellent! " : "💡 Hint: "}{challenge.hint}
              </div>
            )}
            {chosen && (
              <div style={{textAlign:"center"}}>
                {chosen===challenge.correct&&<div style={{fontSize:15,fontWeight:900,color:C.yellow,marginBottom:12}}>+{challenge.xp_reward||50} XP 🌟 +{challenge.coin_reward||10} Coins 🪙</div>}
                <Btn color={chosen===challenge.correct?C.green:C.dim} onClick={onClose}>{chosen===challenge.correct?"🚀 Awesome!":"Close"}</Btn>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}

// ── Daily Puzzle ──────────────────────────────────────────────────────
export function DailyPuzzle({ child, onClose }) {
  const [puzzle,  setPuzzle]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [done,    setDone]    = useState(false);
  const [answer,  setAnswer]  = useState("");
  const [result,  setResult]  = useState(null); // null|"correct"|"wrong"
  const [showHint,setShowHint]= useState(false);

  useEffect(() => {
    Promise.all([
      db.getDailyPuzzle(),
      db.getPuzzleCompletion(child.id)
    ]).then(([p, comp]) => {
      setPuzzle(p);
      if (comp) setDone(true);
      setLoading(false);
    });
    db.track("daily_puzzle_open", child.id, null, {});
  }, [child.id]);

  const handleSubmit = async () => {
    if (!answer.trim() || !puzzle) return;
    const correct = answer.trim().toLowerCase() === puzzle.answer.toLowerCase();
    setResult(correct ? "correct" : "wrong");
    if (correct) SFX.puzzleSolve();
    await db.completePuzzle(child.id, puzzle.id, answer.trim(), correct);
    if (correct) {
      await db.addXP(child.id, puzzle.xp_reward||75, puzzle.coin_reward||15);
      db.track("daily_puzzle_complete", child.id, null, { correct:true });
      const todayKey = new Date().toISOString().slice(0,10);
      localStorage.setItem(`dp_${child.id}_${todayKey}`, "1");
      setDone(true);
    } else {
      db.track("daily_puzzle_complete", child.id, null, { correct:false });
    }
  };

  const typeColors = { riddle:C.purple, number:C.cyan, logic:C.orange, visual:C.yellow };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center",fontFamily:"'Baloo 2','Nunito',sans-serif"}}>
      <div style={{background:"#FAFBFF",borderRadius:"28px 28px 0 0",padding:"0 0 32px",width:"100%",maxWidth:480,boxShadow:"0 -20px 60px rgba(91,79,232,0.2)",maxHeight:"90vh",overflowY:"auto",animation:"mmSlideUp 0.3s ease"}}>
        <div style={{paddingTop:12,marginBottom:4}}>
          <div style={{width:40,height:4,borderRadius:999,background:"rgba(91,79,232,0.1)",margin:"0 auto 10px"}}/>
          <div style={{display:"flex",gap:5,justifyContent:"center"}}>
            {[0,1,2,3,4].map(i=>(
              <div key={i} style={{width:i===0?24:8,height:6,borderRadius:999,background:i===0?"#9B59F5":"#F0ECFF"}}/>
            ))}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 20px 14px",borderBottom:"1px solid rgba(91,79,232,0.1)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${C.purple},${C.pink})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🧩</div>
            <div>
              <div style={{fontSize:16,fontWeight:900,color:textColor()}}>Daily Puzzle</div>
              <div style={{fontSize:11,color:C.dim}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"rgba(91,79,232,0.08)",border:"none",borderRadius:12,width:36,height:36,fontSize:16,cursor:"pointer",color:"#5B4FE8",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:"16px 20px"}}>

        {loading ? (
          <div style={{textAlign:"center",padding:30,color:C.dim,fontFamily:"'Orbitron',sans-serif",fontSize:12}}>
            <div style={{fontSize:32,marginBottom:10}}>🧩</div>LOADING...
          </div>
        ) : !puzzle ? (
          <div style={{textAlign:"center",padding:20}}>
            <div style={{fontSize:40,marginBottom:10}}>📅</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.dim,lineHeight:1.7}}>No puzzle today yet.<br/>Check back later!</div>
            <div style={{marginTop:16}}><Btn color={C.dim} onClick={onClose}>CLOSE</Btn></div>
          </div>
        ) : done && result === null ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:48,marginBottom:10}}>🏆</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.green,marginBottom:6}}>PUZZLE SOLVED TODAY!</div>
            <div style={{color:C.dim,fontSize:12,lineHeight:1.7}}>A new puzzle drops at midnight. Come back tomorrow!</div>
            <div style={{marginTop:16}}><Btn color={C.dim} onClick={onClose}>CLOSE</Btn></div>
          </div>
        ) : (
          <>
            <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
              <div style={{background:`${typeColors[puzzle.puzzle_type]||C.purple}22`,border:`1px solid ${typeColors[puzzle.puzzle_type]||C.purple}44`,borderRadius:8,padding:"3px 10px",fontSize:10,color:typeColors[puzzle.puzzle_type]||C.purple,fontFamily:"'Orbitron',sans-serif",textTransform:"uppercase"}}>{puzzle.puzzle_type}</div>
              <div style={{fontSize:11,color:C.dim}}>+{puzzle.xp_reward||75} XP on solve</div>
            </div>

            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14, color:textColor(),marginBottom:10}}>{puzzle.title}</div>
            <div style={{background:"#9B59F510",border:"2px solid #9B59F530",borderRadius:20,padding:"16px 18px",marginBottom:18,lineHeight:1.8,fontSize:16,color:"#1A1040",fontWeight:700}}>
              🧩 {puzzle.description}
            </div>

            {result === null && (
              <>
                <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
                  <input value={answer} onChange={e=>setAnswer(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                    placeholder="?"
                    style={{width:64,height:64,borderRadius:14,background:"#9B59F518",border:"2.5px dashed #9B59F5",animation:"mmPulse 1.5s infinite",fontSize:28,color:"#9B59F5",fontFamily:"'Fredoka One',cursive",textAlign:"center",boxSizing:"border-box",outline:"none",display:"block"}}
                  />
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                  {[1,2,3,4,5,6,7,8,9,"0","⌫","✓"].map((k,i)=>(
                    <button key={i} onClick={()=>{
                      if(k==="⌫") setAnswer(a=>a.slice(0,-1));
                      else if(k==="✓") handleSubmit();
                      else setAnswer(a=>a+String(k));
                    }} style={{
                      background:"white",border:"1.5px solid #9B59F525",borderRadius:14,
                      padding:"12px 0",fontSize:16,fontWeight:900,color:k==="✓"?"#2ECC9A":k==="⌫"?"#FF6B6B":"#1A1040",
                      cursor:"pointer",boxShadow:"0 2px 8px rgba(91,79,232,0.12)",fontFamily:"'Nunito',sans-serif"
                    }}>{k}</button>
                  ))}
                </div>
                <div style={{display:"flex",gap:10,marginBottom:10}}>
                  <Btn color="#9B59F5" style={{flex:2}} onClick={handleSubmit}>🚀 SUBMIT</Btn>
                  <button onClick={()=>setShowHint(!showHint)} style={{flex:1,background:"#FFC84718",border:"1.5px solid #FFC84740",borderRadius:12,color:"#FFC847",fontSize:12,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",padding:"8px"}}>💡 HINT</button>
                </div>
                {showHint && puzzle.hint && (
                  <div style={{background:"#FFC84710",border:"1.5px solid #FFC84730",borderRadius:14,padding:"10px 14px",fontSize:12,color:"#FFC847",fontWeight:700}}>
                    💡 {puzzle.hint}
                  </div>
                )}
              </>
            )}

            {result === "correct" && (
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:48,marginBottom:8}}>🎉</div>
                {/* correct shown via floating overlay */}
                <div style={{fontSize:12,color:C.dim,marginBottom:14}}>Answer: {puzzle.answer}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.yellow,marginBottom:14}}>+{puzzle.xp_reward||75} XP · +{puzzle.coin_reward||15} COINS</div>
                <Btn color={C.green} onClick={onClose}>🏆 AWESOME!</Btn>
              </div>
            )}
            {result === "wrong" && (
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:8}}>🤔</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.red,marginBottom:4}}>NOT QUITE!</div>
                <div style={{fontSize:12,color:C.dim,marginBottom:6}}>Try again or check the hint.</div>
                <div style={{display:"flex",gap:10}}>
                  <Btn color={C.dim} style={{flex:1}} onClick={()=>setResult(null)}>↺ TRY AGAIN</Btn>
                  <Btn color={C.red}  style={{flex:1}} onClick={onClose}>CLOSE</Btn>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}

// ── App Rating ────────────────────────────────────────────────────────
