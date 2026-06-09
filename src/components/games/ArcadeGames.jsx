// src/components/games/ArcadeGames.jsx — NumberRocket, StarCatcher, MathMaze, SpeedMath, NumberMemory
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, BackBtn } from '../ui/primitives.jsx';
import { shuffle } from '../../lib/db.js';
import { Starfield } from '../layout/layout.jsx';
import { Card } from '../ui/primitives.jsx';


export function NumberRocket({ onBack, child }) {
  const TOTAL = 10;
  const [phase,   setPhase]   = useState("ready");
  const [q,       setQ]       = useState("");
  const [opts,    setOpts]    = useState([]);
  const [ans,     setAns]     = useState(0);
  const [fuel,    setFuel]    = useState(100);
  const [score,   setScore]   = useState(0);
  const [round,   setRound]   = useState(1);
  const [chosen,  setChosen]  = useState(null); // index|"timeout"
  const [rocketY, setRocketY] = useState(60);   // % from top, 20=high 80=low
  const fuelRef = useRef(100);
  const timerRef = useRef(null);

  const genQ = () => {
    const ops=["+","-","×"];
    const op=ops[Math.floor(Math.random()*ops.length)];
    let a=Math.floor(Math.random()*20)+1,b=Math.floor(Math.random()*10)+1,correct;
    if(op==="+")correct=a+b;
    else if(op==="-"){if(b>a)[a,b]=[b,a];correct=a-b;}
    else correct=a*b;
    const wrong=new Set();
    while(wrong.size<3){const v=correct+(Math.floor(Math.random()*7)-3);if(v!==correct&&v>=0)wrong.add(v);}
    const all=shuffle([correct,...wrong]);
    setQ(a+" "+op+" "+b+" = ?"); setOpts(all.map(String)); setAns(all.indexOf(correct)); setChosen(null);
    fuelRef.current=100; setFuel(100);
  };

  const startGame = () => { setScore(0); setRound(1); setRocketY(60); setPhase("playing"); genQ(); };

  useEffect(()=>{
    if(phase!=="playing"||chosen!==null) return;
    timerRef.current=setInterval(()=>{
      fuelRef.current-=2;
      setFuel(fuelRef.current);
      // Rocket drifts down as fuel depletes
      setRocketY(y=>Math.min(80,y+0.4));
      if(fuelRef.current<=0){
        clearInterval(timerRef.current);
        setRocketY(85);
        setChosen("timeout");
        setTimeout(()=>{
          if(round>=TOTAL) setPhase("over");
          else{setRound(r=>r+1);genQ();}
        },900);
      }
    },100);
    return ()=>clearInterval(timerRef.current);
  },[q,phase]);

  const pick = (i) => {
    if(chosen!==null) return;
    clearInterval(timerRef.current);
    setChosen(i);
    const ok=i===ans;
    if(ok){
      setScore(s=>s+1);
      setRocketY(y=>Math.max(15,y-25)); // rocket blasts up!
    } else {
      setRocketY(y=>Math.min(85,y+12)); // rocket sinks
    }
    setTimeout(()=>{ if(round>=TOTAL) setPhase("over"); else{setRound(r=>r+1);genQ();} },700);
  };

  if(phase==="ready") return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0a0020,#12003a,#0d1a3a)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={50}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:310}}>
        <div style={{fontSize:72,marginBottom:8}}>🚀</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:26,color:C.orange,marginBottom:6,letterSpacing:1}}>NUMBER ROCKET</div>
        <div style={{background:"rgba(255,150,50,0.1)",border:"1.5px solid rgba(255,150,50,0.3)",borderRadius:16,padding:"12px 16px",marginBottom:20}}>
          <div style={{color:"rgba(255,255,255,0.75)",fontSize:12,lineHeight:1.9}}>
            🚀 Solve the question to blast the rocket up!<br/>
            ⛽ Answer before the fuel runs out<br/>
            ⚠️ Wrong answer = rocket sinks — {TOTAL} rounds
          </div>
        </div>
        <Btn color={C.orange} onClick={startGame}>🔥 LAUNCH!</Btn>
        <div style={{marginTop:12}}><Btn color={C.dim} style={{padding:"9px 20px"}} onClick={onBack}>← Back</Btn></div>
      </div>
    </div>
  );

  if(phase==="over") return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0a0020,#12003a,#0d1a3a)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={60}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:72,marginBottom:8}}>{score>=8?"🏆":score>=5?"🌟":"💥"}</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.orange,marginBottom:4}}>{score>=8?"STELLAR LAUNCH!":score>=5?"GOOD FLIGHT!":"ROCKET CRASHED!"}</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:44,color:"#FFD700",marginBottom:20}}>{score}/{TOTAL}</div>
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={onBack}>← Back</Btn>
          <Btn color={C.orange} style={{flex:1}} onClick={startGame}>↺ Retry</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0a0020,#12003a,#1a0050)",fontFamily:"'Nunito',sans-serif",position:"relative",overflow:"hidden"}}>
      <Starfield n={30}/>
      {/* Rocket visual lane */}
      <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:80,transform:"translateX(-50%)",zIndex:2,pointerEvents:"none"}}>
        {/* launch trail */}
        <div style={{position:"absolute",left:"50%",top:rocketY+"%",transform:"translateX(-50%) translateY(40px)",width:4,background:"linear-gradient(180deg,transparent,"+C.orange+"88)",height:"30vh",borderRadius:4,opacity:0.5}}/>
        {/* rocket */}
        <div style={{position:"absolute",left:"50%",top:rocketY+"%",transform:"translateX(-50%)",fontSize:44,transition:"top 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>🚀</div>
      </div>
      {/* HUD strip */}
      <div style={{position:"relative",zIndex:10,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",borderBottom:"1px solid rgba(255,150,50,0.2)",padding:"10px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <button onClick={()=>{clearInterval(timerRef.current);setPhase("ready");}} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"5px 12px",color:"white",fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>✕ QUIT</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.orange}}>🚀 {score}/{TOTAL}</div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:"rgba(255,255,255,0.6)"}}>Round {round}</div>
        </div>
        {/* Fuel bar */}
        <div style={{background:"rgba(255,255,255,0.1)",borderRadius:6,height:8,overflow:"hidden"}}>
          <div style={{width:fuel+"%",height:"100%",background:"linear-gradient(90deg,"+(fuel>50?C.green:fuel>25?C.yellow:C.red)+","+C.orange+")",borderRadius:6,transition:"width 0.1s linear"}}/>
        </div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginTop:2,fontWeight:700}}>FUEL — ANSWER BEFORE IT RUNS OUT!</div>
      </div>
      {/* Question + options at bottom */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:10,padding:"16px 18px 28px",background:"linear-gradient(180deg,transparent,rgba(0,0,0,0.85) 40%)"}}>
        <div style={{background:"rgba(255,150,50,0.1)",border:"1.5px solid rgba(255,150,50,0.35)",borderRadius:20,padding:"16px 18px",textAlign:"center",marginBottom:14}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:"white",letterSpacing:1}}>{q}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {opts.map((o,i)=>{
            const state=chosen===null?"idle":i===ans?"correct":i===chosen?"wrong":"idle";
            return (
              <button key={i} onClick={()=>pick(i)} style={{
                background:state==="correct"?"rgba(74,222,128,0.2)":state==="wrong"?"rgba(248,113,113,0.2)":"rgba(255,255,255,0.07)",
                border:"2px solid "+(state==="correct"?"rgba(74,222,128,0.7)":state==="wrong"?"rgba(248,113,113,0.7)":"rgba(255,150,50,0.3)"),
                borderRadius:18,padding:"20px 12px",
                fontFamily:"'Fredoka One',cursive",fontSize:26,color:"white",
                cursor:chosen===null?"pointer":"default",
                textAlign:"center",transition:"all 0.2s",
              }}>{o}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function StarCatcher({ onBack, child }) {
  // ── METEOR BLASTER ─ blast WRONG meteors, let the RIGHT one pass
  const [gameState, setGameState] = useState("ready");
  const [score,     setScore]     = useState(0);
  const [lives,     setLives]     = useState(3);
  const [q,         setQ]         = useState("");
  const [items,     setItems]     = useState([]);
  const [blastFX,   setBlastFX]   = useState([]);
  const itemsRef   = useRef([]);
  const scoreRef   = useRef(0);
  const livesRef   = useRef(3);
  const frameRef   = useRef(null);
  const qRef       = useRef({ ans: "" });
  const blastIdRef = useRef(0);

  const genQuestion = () => {
    const ops = ["+", "-", "x"];
    const op  = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * 10) + 1;
    let b = Math.floor(Math.random() * 9)  + 1;
    let correct;
    if (op === "+") correct = a + b;
    else if (op === "-") { if (b > a) [a, b] = [b, a]; correct = a - b; }
    else correct = a * b;
    const ans = String(correct);
    qRef.current = { ans };
    setQ(op === "x" ? a + " × " + b + " = ?" : a + " " + op + " " + b + " = ?");
    return ans;
  };

  const makeWrong = (correct, existing) => {
    const used = new Set([correct, ...existing]);
    let v;
    let tries = 0;
    do {
      v = String(Math.max(1, parseInt(correct) + (Math.floor(Math.random() * 10) - 5)));
      tries++;
    } while (used.has(v) && tries < 30);
    return v;
  };

  const spawnWave = (ans) => {
    const w1 = makeWrong(ans, []);
    const w2 = makeWrong(ans, [w1]);
    const cols = [15, 50, 85].sort(() => Math.random() - 0.5);
    const spd  = Math.min(0.28 + scoreRef.current * 0.012, 0.65);
    // All 3 look identical — kids must calculate, not colour-spot
    return [
      { id: Date.now() + 1, x: cols[0], y: -12, val: ans, correct: true,  speed: spd },
      { id: Date.now() + 2, x: cols[1], y: -12, val: w1,  correct: false, speed: spd + 0.04 },
      { id: Date.now() + 3, x: cols[2], y: -12, val: w2,  correct: false, speed: spd + 0.08 },
    ];
  };

  const startGame = () => {
    cancelAnimationFrame(frameRef.current);
    scoreRef.current = 0; livesRef.current = 3;
    setScore(0); setLives(3); setBlastFX([]);
    itemsRef.current = [];
    const ca = genQuestion();
    setGameState("playing");
    let frame = 0;
    const loop = () => {
      frame++;
      if (itemsRef.current.length === 0) {
        const wave = spawnWave(qRef.current.ans);
        itemsRef.current = wave;
      }
      itemsRef.current = itemsRef.current
        .map(it => ({ ...it, y: it.y + it.speed }))
        .filter(it => {
          if (it.y > 102) {
            if (it.correct) {
              // correct bubble hit ground = lose life
              livesRef.current = Math.max(0, livesRef.current - 1);
              setLives(livesRef.current);
              if (livesRef.current <= 0) { setGameState("over"); return false; }
              const na = genQuestion();
              itemsRef.current = spawnWave(na);
              return false;
            }
            return false; // wrong fell off, no penalty
          }
          return true;
        });
      setItems([...itemsRef.current]);
      if (livesRef.current > 0) frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => () => { cancelAnimationFrame(frameRef.current); }, []);

  const tapItem = (item) => {
    const bid = ++blastIdRef.current;
    setBlastFX(fx => [...fx, { id: bid, x: item.x, y: item.y, hit: !item.correct }]);
    setTimeout(() => setBlastFX(fx => fx.filter(f => f.id !== bid)), 500);
    itemsRef.current = itemsRef.current.filter(i => i.id !== item.id);
    setItems([...itemsRef.current]);
    if (!item.correct) {
      // Blasted a wrong meteor — correct!
      scoreRef.current += 1;
      setScore(scoreRef.current);
    } else {
      // Tapped the correct answer — penalty
      livesRef.current = Math.max(0, livesRef.current - 1);
      setLives(livesRef.current);
      if (livesRef.current <= 0) { cancelAnimationFrame(frameRef.current); setGameState("over"); return; }
      const na = genQuestion();
      const wave = spawnWave(na);
      itemsRef.current = wave;
      setItems([...wave]);
    }
  };

  // ─ READY SCREEN
  if (gameState === "ready") return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(180deg,#0a0020,#12003a,#0d1a3a)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, position:"relative" }}>
      <Starfield n={50}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:320 }}>
        <div style={{ fontSize:72, marginBottom:6 }}>☄️</div>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:26, color:"#FF6B6B", marginBottom:6, letterSpacing:1 }}>METEOR BLASTER</div>
        <div style={{ background:"rgba(255,107,107,0.12)", border:"1.5px solid rgba(255,107,107,0.35)", borderRadius:16, padding:"12px 16px", marginBottom:20 }}>
          <div style={{ color:"#FF6B6B", fontSize:13, fontWeight:800, marginBottom:8 }}>HOW TO PLAY</div>
          <div style={{ color:"rgba(255,255,255,0.8)", fontSize:12, lineHeight:1.9, textAlign:"left" }}>
            🔢 Solve the question at the top<br/>
            💥 TAP the meteor with the <b>WRONG</b> answer to blast it<br/>
            ✋ Let the <b>CORRECT</b> answer float past safely<br/>
            ❤️ Lose a life if you tap the right answer or miss it
          </div>
        </div>
        <Btn color="#FF6B6B" onClick={startGame}>🚀 LAUNCH BLASTER</Btn>
        <div style={{ marginTop:12 }}><Btn color={C.dim} style={{ padding:"9px 20px" }} onClick={onBack}>← BACK</Btn></div>
      </div>
    </div>
  );

  // ─ GAME OVER SCREEN
  if (gameState === "over") return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(180deg,#0a0020,#12003a,#0d1a3a)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, position:"relative" }}>
      <Starfield n={60}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{ fontSize:72, marginBottom:8 }}>{score >= 10 ? "🏆" : "💥"}</div>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:"#FF6B6B", marginBottom:4 }}>{score >= 10 ? "GALAXY HERO!" : "PLANET DOWN!"}</div>
        <div style={{ fontSize:42, fontFamily:"'Fredoka One',cursive", color:"#FFD700", marginBottom:16 }}>☄️ {score} Blasted</div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn color={C.dim} style={{ flex:1 }} onClick={onBack}>← BACK</Btn>
          <Btn color="#FF6B6B" style={{ flex:1 }} onClick={startGame}>↺ PLAY AGAIN</Btn>
        </div>
      </div>
    </div>
  );

  // ─ GAMEPLAY SCREEN
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(180deg,#0a0020 0%,#12003a 60%,#0d1a3a 100%)", position:"relative", overflow:"hidden" }}>
      <Starfield n={60}/>
      {/* Planet at bottom */}
      <div style={{ position:"absolute", bottom:-70, left:"50%", transform:"translateX(-50%)", width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle at 38% 36%,#4BBDF5,#1a0050)", boxShadow:"0 0 60px #4BBDF588,0 0 120px #4BBDF522", zIndex:1, pointerEvents:"none" }}/>
      {/* HUD */}
      <div style={{ position:"relative", zIndex:20, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", borderBottom:"1px solid rgba(255,107,107,0.25)", padding:"10px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <button onClick={() => { cancelAnimationFrame(frameRef.current); setGameState("ready"); }} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:10, padding:"5px 12px", color:"white", fontSize:12, cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>✕ QUIT</button>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#FF6B6B", letterSpacing:1 }}>☄️ {score}</div>
        <div style={{ display:"flex", gap:4 }}>{[...Array(3)].map((_,i) => <span key={i} style={{ fontSize:18, filter:i < lives ? "none" : "grayscale(1) opacity(0.15)" }}>❤️</span>)}</div>
      </div>
      {/* Question banner */}
      <div style={{ position:"relative", zIndex:20, textAlign:"center", padding:"10px 18px 4px" }}>
        <div style={{ display:"inline-block", background:"rgba(255,215,0,0.12)", border:"1.5px solid rgba(255,215,0,0.4)", borderRadius:14, padding:"6px 22px" }}>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:24, color:"#FFD700", letterSpacing:1 }}>{q}</div>
        </div>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:3, fontWeight:700, letterSpacing:1 }}>TAP THE WRONG ANSWERS</div>
      </div>
      {/* Play field */}
      <div style={{ position:"relative", height:"70vh", overflow:"hidden" }}>
        {/* Blast FX */}
        {blastFX.map(fx => (
          <div key={fx.id} style={{ position:"absolute", left:fx.x+"%", top:fx.y+"%", transform:"translate(-50%,-50%)", fontSize:30, zIndex:15, pointerEvents:"none", animation:"mmPop 0.4s ease forwards" }}>
            {fx.hit ? "💥" : "❌"}
          </div>
        ))}
        {/* Meteors — ALL IDENTICAL STYLE, only the number differs */}
        {items.map(it => (
          <div key={it.id} onClick={() => tapItem(it)}
            style={{ position:"absolute", left:it.x+"%", top:it.y+"%", transform:"translate(-50%,-50%)", cursor:"pointer", zIndex:10, userSelect:"none" }}
          >
            <div style={{
              background:"radial-gradient(circle at 38% 32%, #5a3060, #1a0a2e)",
              border:"2px solid rgba(160,100,255,0.6)",
              borderRadius:"48% 52% 40% 60% / 50% 44% 56% 50%",
              width:64, height:64,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 0 16px rgba(160,100,255,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:"white", textShadow:"0 1px 4px rgba(0,0,0,0.8)" }}>{it.val}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Game 3: Math Maze — solve to move the astronaut through a maze ────
// ── Math Maze ─ visual path game, solve to advance the astronaut ────
export function MathMaze({ onBack, child }) {
  const STEPS = 8;
  const genQ = (step) => {
    const difficulty=Math.min(Math.floor(step/3)+1,4);
    const ops=difficulty<2?["+","-"]:difficulty<3?["+","-","×"]:["+"," -","×","÷"];
    const op=ops[Math.floor(Math.random()*ops.length)].trim();
    let a,b,ans;
    if(op==="+"){a=Math.floor(Math.random()*15)+1;b=Math.floor(Math.random()*15)+1;ans=a+b;}
    else if(op==="-"){a=Math.floor(Math.random()*20)+5;b=Math.floor(Math.random()*a)+1;ans=a-b;}
    else if(op==="×"){a=Math.floor(Math.random()*8)+2;b=Math.floor(Math.random()*8)+2;ans=a*b;}
    else{b=Math.floor(Math.random()*8)+2;ans=Math.floor(Math.random()*8)+2;a=b*ans;}
    const wrong=new Set();
    while(wrong.size<3){const v=ans+(Math.floor(Math.random()*7)-3);if(v>0&&v!==ans)wrong.add(v);}
    const opts=shuffle([ans,...wrong]);
    return {q:a+" "+op+" "+b+" = ?",ans,opts};
  };

  const [step,   setStep]   = useState(0);  // 0..STEPS, STEPS = won
  const [q,      setQ]      = useState(()=>genQ(0));
  const [chosen, setChosen] = useState(null);
  const [shake,  setShake]  = useState(false);
  const [score,  setScore]  = useState(0);

  const pick = (opt) => {
    if(chosen!==null) return;
    setChosen(opt);
    if(opt===q.ans){
      SFX.correct(); setScore(s=>s+10);
      setTimeout(()=>{
        const ns=step+1;
        setStep(ns); setChosen(null);
        if(ns<STEPS) setQ(genQ(ns));
      },600);
    } else {
      SFX.wrong(); setShake(true);
      setTimeout(()=>{ setShake(false); setChosen(null); },700);
    }
  };

  const done = step>=STEPS;

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,padding:"16px 14px"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <BackBtn onClick={onBack} color={C.cyan}/>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:17,color:C.cyan,letterSpacing:1}}>🌀 MATH MAZE</div>
          <div style={{background:C.yellow+"22",border:"1.5px solid "+C.yellow+"44",borderRadius:12,padding:"4px 10px",fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.yellow}}>⭐ {score}</div>
        </div>

        {/* Path visual */}
        <div style={{background:C.card,border:"2px solid "+C.cyan+"33",borderRadius:20,padding:"16px 12px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,overflowX:"auto"}}>
            {Array.from({length:STEPS+1},(_,i)=>{
              const isAstronaut=i===step;
              const isPast=i<step;
              const isGoal=i===STEPS;
              return (
                <React.Fragment key={i}>
                  <div style={{
                    width:isAstronaut?44:isGoal?38:32,
                    height:isAstronaut?44:isGoal?38:32,
                    borderRadius:"50%",
                    background:isAstronaut?"linear-gradient(135deg,"+C.cyan+","+C.purple+")":isPast?C.green+"44":"rgba(255,255,255,0.12)",
                    border:"2px solid "+(isAstronaut?C.cyan:isPast?C.green:isGoal?"#FFD700":"rgba(255,255,255,0.2)"),
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:isAstronaut?22:isGoal?20:12,
                    flexShrink:0,
                    transition:"all 0.4s ease",
                    boxShadow:isAstronaut?"0 0 14px "+C.cyan+"88":"none",
                    animation:isAstronaut?"mmPulse 1.5s ease-in-out infinite":"none",
                  }}>{isAstronaut?"👨‍🚀":isGoal?"🏆":isPast?"✔️":i+1}</div>
                  {i<STEPS&&<div style={{width:10,height:3,background:isPast?C.green:"rgba(255,255,255,0.15)",borderRadius:2,flexShrink:0,transition:"background 0.4s"}}/>}
                </React.Fragment>
              );
            })}
          </div>
          <div style={{textAlign:"center",fontSize:11,color:C.dim,marginTop:8,fontWeight:700}}>Step {step} / {STEPS}</div>
        </div>

        {done ? (
          <div style={{textAlign:"center",padding:"30px 20px",background:C.green+"10",borderRadius:22,border:"2px solid "+C.green+"44"}}>
            <div style={{fontSize:64,marginBottom:10}}>🏆</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.green,marginBottom:6}}>Maze Complete!</div>
            <div style={{color:C.dim,fontSize:14,marginBottom:20}}>Score: {score}</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <Btn color={C.dim} style={{flex:1}} onClick={onBack}>← Back</Btn>
              <Btn color={C.cyan} style={{flex:1}} onClick={()=>{setStep(0);setScore(0);setChosen(null);setQ(genQ(0));}}>↺ Play Again</Btn>
            </div>
          </div>
        ) : (
          <>
            <div style={{background:shake?"rgba(248,113,113,0.1)":C.card,border:"2px solid "+(shake?"rgba(248,113,113,0.5)":C.cyan+"33"),borderRadius:20,padding:"20px 18px",textAlign:"center",marginBottom:16,animation:shake?"shakeX 0.4s ease":"none",transition:"background 0.2s"}}>
              <div style={{fontSize:10,color:C.dim,fontWeight:700,marginBottom:4,letterSpacing:1}}>SOLVE TO MOVE FORWARD</div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:textColor(),letterSpacing:1}}>{q.q}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {q.opts.map((o,i)=>{
                const state=chosen===null?"idle":o===q.ans?"correct":o===chosen?"wrong":"idle";
                return (
                  <button key={i} onClick={()=>pick(o)} style={{
                    background:state==="correct"?C.green+"22":state==="wrong"?"rgba(248,113,113,0.15)":"white",
                    border:"2.5px solid "+(state==="correct"?C.green:state==="wrong"?"rgba(248,113,113,0.6)":C.cyan+"44"),
                    borderRadius:18,padding:"20px 12px",
                    fontFamily:"'Fredoka One',cursive",fontSize:26,
                    color:state==="correct"?C.green:state==="wrong"?"#f87171":"#1A1040",
                    cursor:chosen===null?"pointer":"default",
                    textAlign:"center",transition:"all 0.2s",
                    boxShadow:"0 4px 14px rgba(75,189,245,0.1)",
                  }}>{o}</button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function SpeedMath({ onBack, child }) {
  const [phase,    setPhase]    = useState("ready");
  const [q,        setQ]        = useState("");
  const [opts,     setOpts]     = useState([]);
  const [ans,      setAns]      = useState(0);
  const [score,    setScore]    = useState(0);
  const [wrong,    setWrong]    = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [flash,    setFlash]    = useState(null); // "correct"|"wrong"
  const [lastPick, setLastPick] = useState(null); // index of last tapped option
  const scoreRef = useRef(0);
  const wrongRef = useRef(0);

  const nextQ = () => {
    const level=Math.min(Math.floor(scoreRef.current/5)+1,5);
    const max=level*8;
    const a=Math.floor(Math.random()*max)+1;
    const b=Math.floor(Math.random()*max)+1;
    const ops=level<3?["+","-"]:["+"," -","×"];
    const op=ops[Math.floor(Math.random()*ops.length)].trim();
    let correct;
    if(op==="+")correct=a+b;
    else if(op==="-"){const[x,y]=[Math.max(a,b),Math.min(a,b)];correct=x-y;
      const w=new Set();while(w.size<3){const v=correct+(Math.floor(Math.random()*7)-3);if(v>=0&&v!==correct)w.add(v);}
      const all=shuffle([correct,...w]);setQ(x+" - "+y+" = ?");setOpts(all.map(String));setAns(all.indexOf(correct));setLastPick(null);return;
    }
    else correct=a*b;
    const w=new Set();while(w.size<3){const v=correct+(Math.floor(Math.random()*9)-4);if(v>=0&&v!==correct)w.add(v);}
    const all=shuffle([correct,...w]);
    setQ(a+" "+op+" "+b+" = ?"); setOpts(all.map(String)); setAns(all.indexOf(correct)); setLastPick(null);
  };

  useEffect(()=>{
    if(phase!=="playing") return;
    if(timeLeft<=0){setPhase("over");return;}
    const t=setTimeout(()=>setTimeLeft(tl=>tl-1),1000);
    return ()=>clearTimeout(t);
  },[timeLeft,phase]);

  const start=()=>{ scoreRef.current=0; wrongRef.current=0; setScore(0); setWrong(0); setTimeLeft(60); setFlash(null); setLastPick(null); setPhase("playing"); nextQ(); };

  const pick=(i)=>{
    setLastPick(i);
    const ok=i===ans;
    if(ok){SFX.correct();scoreRef.current++;setScore(scoreRef.current);setFlash("correct");}
    else{wrongRef.current++;setWrong(wrongRef.current);SFX.wrong();setFlash("wrong");}
    setTimeout(()=>{setFlash(null);setLastPick(null);nextQ();},350);
  };

  if(phase==="ready") return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a0040,#2d0070,#0d1a3a)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={40}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:310}}>
        <div style={{fontSize:72,marginBottom:8}}>⚡</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:28,color:"#FFD700",marginBottom:6,letterSpacing:1}}>SPEED MATH</div>
        <div style={{background:"rgba(255,215,0,0.1)",border:"1.5px solid rgba(255,215,0,0.3)",borderRadius:16,padding:"12px 16px",marginBottom:20}}>
          <div style={{color:"rgba(255,255,255,0.75)",fontSize:12,lineHeight:1.9}}>
            ⏱️ 60 seconds on the clock<br/>
            📈 Questions get harder as you score<br/>
            🎯 Aim for 20+ correct!
          </div>
        </div>
        <Btn color="#FFD700" onClick={start}>▶ GO!</Btn>
        <div style={{marginTop:12}}><Btn color={C.dim} style={{padding:"9px 20px"}} onClick={onBack}>← Back</Btn></div>
      </div>
    </div>
  );

  if(phase==="over") return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a0040,#2d0070,#0d1a3a)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={60}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:72,marginBottom:8}}>{score>=15?"🏆":score>=8?"🌟":"⚡"}</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:"#FFD700",marginBottom:16}}>TIME'S UP!</div>
        <div style={{background:"rgba(255,215,0,0.1)",border:"1.5px solid rgba(255,215,0,0.3)",borderRadius:20,padding:"20px 24px",marginBottom:20,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:"#4ade80"}}>{score}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",fontWeight:700}}>CORRECT</div></div>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:"#f87171"}}>{wrong}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",fontWeight:700}}>WRONG</div></div>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:"#60a5fa"}}>{Math.round(score/(score+wrong||1)*100)}%</div><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",fontWeight:700}}>ACCURACY</div></div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={onBack}>← Back</Btn>
          <Btn color="#FFD700" style={{flex:1}} onClick={start}>↺ Retry</Btn>
        </div>
      </div>
    </div>
  );

  const timerPct=(timeLeft/60)*100;
  return (
    <div style={{minHeight:"100vh",background:flash==="correct"?"linear-gradient(135deg,#052e16,#064e3b)":flash==="wrong"?"linear-gradient(135deg,#2d0a0a,#450a0a)":"linear-gradient(135deg,#1a0040,#2d0070,#0d1a3a)",fontFamily:"'Nunito',sans-serif",position:"relative",transition:"background 0.15s"}}>
      <Starfield n={15}/>
      {/* HUD */}
      <div style={{position:"relative",zIndex:20,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(8px)",borderBottom:"1px solid rgba(255,215,0,0.2)",padding:"10px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <button onClick={()=>setPhase("ready")} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"5px 12px",color:"white",fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>✕ QUIT</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#FFD700"}}>⚡ SPEED MATH</div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:timeLeft<=10?"#f87171":"#4ade80"}}>{timeLeft}s</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <div style={{fontSize:13,color:"#4ade80",fontWeight:800}}>✓ {score}</div>
          <div style={{fontSize:13,color:"#f87171",fontWeight:800}}>✗ {wrong}</div>
        </div>
        <div style={{background:"rgba(255,255,255,0.1)",borderRadius:6,height:6,overflow:"hidden"}}>
          <div style={{width:timerPct+"%",height:"100%",background:"linear-gradient(90deg,"+(timeLeft>20?"#4ade80":"#f87171")+",#FFD700)",borderRadius:6,transition:"width 1s linear"}}/>
        </div>
      </div>
      {/* Question */}
      <div style={{position:"relative",zIndex:2,padding:"24px 18px 0"}}>
        <div style={{background:flash==="correct"?"rgba(74,222,128,0.15)":flash==="wrong"?"rgba(248,113,113,0.15)":"rgba(255,215,0,0.08)",border:"2px solid "+(flash==="correct"?"rgba(74,222,128,0.5)":flash==="wrong"?"rgba(248,113,113,0.5)":"rgba(255,215,0,0.25)"),borderRadius:24,padding:"28px 20px",textAlign:"center",marginBottom:20,transition:"all 0.15s"}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:36,color:"white",letterSpacing:1}}>{q}</div>
          {flash&&<div style={{fontSize:28,marginTop:8,animation:"mmPop 0.3s ease"}}>{flash==="correct"?"✅":"❌"}</div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {opts.map((o,i)=>{
            const state=lastPick===null?"idle":i===ans?"correct":i===lastPick?"wrong":"idle";
            return (
              <button key={i} onClick={()=>pick(i)} disabled={lastPick!==null} style={{
                background:state==="correct"?"rgba(74,222,128,0.2)":state==="wrong"?"rgba(248,113,113,0.2)":"rgba(255,255,255,0.07)",
                border:"2px solid "+(state==="correct"?"rgba(74,222,128,0.7)":state==="wrong"?"rgba(248,113,113,0.7)":"rgba(255,215,0,0.25)"),
                borderRadius:18,padding:"22px 12px",
                fontFamily:"'Fredoka One',cursive",fontSize:28,color:"white",
                cursor:lastPick===null?"pointer":"default",
                textAlign:"center",transition:"all 0.2s",
                boxShadow:"0 4px 16px rgba(0,0,0,0.3)",
              }}>{o}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function NumberMemory({ onBack, child }) {
  const [phase,    setPhase]    = useState("ready"); // ready|show|input|result
  const [level,    setLevel]    = useState(1);
  const [sequence, setSequence] = useState([]);
  const [showing,  setShowing]  = useState(-1); // index being highlighted
  const [input,    setInput]    = useState([]);
  const [result,   setResult]   = useState(null);
  const [highScore,setHighScore]= useState(0);

  const startLevel = (lvl) => {
    const len = lvl + 2; // level 1 = 3 numbers
    const seq = Array.from({length:len},()=>Math.floor(Math.random()*9)+1);
    setSequence(seq); setInput([]); setPhase("show");
    let idx = 0;
    const show = () => {
      if (idx >= seq.length) { setTimeout(()=>{setShowing(-1);setPhase("input");},500); return; }
      setShowing(idx);
      setTimeout(()=>{setShowing(-1);setTimeout(()=>{idx++;show();},300);}, 600);
    };
    setTimeout(show, 500);
  };

  const pickNum = (n) => {
    const newInput = [...input, n];
    setInput(newInput);
    if (newInput.length === sequence.length) {
      const ok = newInput.every((v,i)=>v===sequence[i]);
      setResult(ok?"win":"lose");
      setPhase("result");
      if(ok) setHighScore(h=>Math.max(h,level));
    }
  };

  if(phase==="ready") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={40}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:12}}>🧠</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:C.pink,marginBottom:8}}>NUMBER MEMORY</div>
        <div style={{color:C.dim,fontSize:13,lineHeight:1.7,marginBottom:8,maxWidth:270}}>Watch the number sequence, then repeat it in order! Gets longer each level.</div>
        {highScore>0&&<div style={{color:C.yellow,fontFamily:"'Orbitron',sans-serif",fontSize:11,marginBottom:14}}>🏆 BEST: LEVEL {highScore}</div>}
        <Btn color={C.pink} onClick={()=>{setLevel(1);startLevel(1);}}>▶ START</Btn>
        <div style={{marginTop:12}}><Btn color={C.dim} style={{padding:"9px 20px"}} onClick={onBack}>← BACK</Btn></div>
      </div>
    </div>
  );

  if(phase==="result") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={60}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:8}}>{result==="win"?"🧠":"💫"}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:result==="win"?C.green:C.red,marginBottom:8}}>{result==="win"?"CORRECT!":"WRONG!"}</div>
        {result==="lose"&&<div style={{color:C.dim,fontSize:13,marginBottom:8}}>The sequence was: <span style={{color:textColor(),fontWeight:700}}>{sequence.join(", ")}</span></div>}
        {result==="lose"&&<div style={{color:C.dim,fontSize:13,marginBottom:12}}>You entered: <span style={{color:C.red}}>{input.join(", ")}</span></div>}
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={()=>setPhase("ready")}>← BACK</Btn>
          {result==="win"
            ?<Btn color={C.green} style={{flex:1}} onClick={()=>{const nl=level+1;setLevel(nl);startLevel(nl);}}>NEXT LEVEL →</Btn>
            :<Btn color={C.pink} style={{flex:1}} onClick={()=>{setLevel(1);startLevel(1);}}>↺ RESTART</Btn>
          }
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,background:`${C.pink}18`,borderBottom:`1px solid ${C.pink}33`,padding:"12px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <BackBtn onClick={()=>setPhase("ready")} color={C.pink}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.pink}}>🧠 NUMBER MEMORY</div>
          <div style={{marginLeft:"auto",fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.dim}}>LEVEL {level}</div>
        </div>
      </div>
      <div style={{position:"relative",zIndex:2,padding:"24px 18px"}}>
        {phase==="show"&&(
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{color:C.dim,fontSize:13,marginBottom:14,fontFamily:"'Orbitron',sans-serif",letterSpacing:2}}>REMEMBER THIS SEQUENCE</div>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              {sequence.map((n,i)=>(
                <div key={i} style={{width:52,height:52,borderRadius:14,background:i===showing?`${C.pink}44`:"#0a0a20",border:`2px solid ${i===showing?C.pink:"#1a1a30"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:i===showing?26:0,color:C.pink,transition:"all 0.2s",boxShadow:i===showing?`0 0 20px ${C.pink}`:"none"}}>
                  {i===showing?n:""}
                </div>
              ))}
            </div>
          </div>
        )}
        {phase==="input"&&(
          <>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{color:C.dim,fontSize:13,fontFamily:"'Orbitron',sans-serif",letterSpacing:2,marginBottom:10}}>NOW ENTER THE SEQUENCE</div>
              <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:4}}>
                {sequence.map((_,i)=>(
                  <div key={i} style={{width:40,height:40,borderRadius:11,background:i<input.length?`${C.pink}33`:C.card2,border:`2px solid ${i<input.length?C.pink:C.dim+"44"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:16,color:C.pink}}>
                    {i<input.length?input[i]:""}
                  </div>
                ))}
              </div>
              <div style={{fontSize:10,color:C.dim}}>{input.length}/{sequence.length} entered</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {[1,2,3,4,5,6,7,8,9].map(n=>(
                <button key={n} onClick={()=>pickNum(n)} style={{background:C.card,border:`1.5px solid ${C.pink}33`,borderRadius:14,padding:"16px",fontSize:20,fontFamily:"'Orbitron',sans-serif",color:textColor(),cursor:"pointer"}}>
                  {n}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}