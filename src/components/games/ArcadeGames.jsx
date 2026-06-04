// src/components/games/ArcadeGames.jsx — NumberRocket, StarCatcher, MathMaze, SpeedMath, NumberMemory
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, BackBtn } from '../ui/primitives.jsx';


export function NumberRocket({ onBack, child }) {
  const [q, setQ]         = useState(null);
  const [opts, setOpts]   = useState([]);
  const [ans, setAns]     = useState(null);
  const [fuel, setFuel]   = useState(100);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [result, setResult]= useState(null); // "win"|"lose"
  const [chosen, setChosen]= useState(null);
  const fuelRef = useRef(100);
  const timerRef = useRef(null);
  const TOTAL = 10;

  const genQ = () => {
    const ops = ["+","-","×"];
    const op  = ops[Math.floor(Math.random()*ops.length)];
    let a = Math.floor(Math.random()*20)+1;
    let b = Math.floor(Math.random()*10)+1;
    let correct;
    if (op==="+") correct = a+b;
    else if (op==="-") { if(b>a)[a,b]=[b,a]; correct = a-b; }
    else correct = a*b;
    const wrong = new Set();
    while(wrong.size < 3) {
      const w = correct + (Math.floor(Math.random()*7)-3);
      if (w !== correct && w >= 0) wrong.add(w);
    }
    const all = shuffle([correct, ...[...wrong]]);
    setQ(`${a} ${op} ${b} = ?`);
    setOpts(all.map(String));
    setAns(all.indexOf(correct));
    setChosen(null);
    fuelRef.current = 100; setFuel(100);
  };

  useEffect(() => { genQ(); }, []);

  useEffect(() => {
    if (result || chosen !== null) return;
    timerRef.current = setInterval(() => {
      fuelRef.current -= 2.5;
      setFuel(fuelRef.current);
      if (fuelRef.current <= 0) {
        clearInterval(timerRef.current);
        setChosen(-1);
        setTimeout(() => { if (round >= TOTAL) setResult("lose"); else { setRound(r=>r+1); genQ(); } }, 900);
      }
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [q, result]);

  const pick = (i) => {
    if (chosen !== null) return;
    clearInterval(timerRef.current);
    setChosen(i);
    const ok = i === ans;
    if (ok) setScore(s => s+1);
    setTimeout(() => {
      if (round >= TOTAL) setResult(score+(ok?1:0) >= 7 ? "win" : "lose");
      else { setRound(r=>r+1); genQ(); }
    }, 700);
  };

  if (result) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:22,position:"relative"}}>
      <Starfield n={60}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:72,marginBottom:8}}>{result==="win"?"🚀":"💥"}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:result==="win"?C.green:C.red,marginBottom:8}}>{result==="win"?"LAUNCH SUCCESS!":"ROCKET CRASHED!"}</div>
        <div style={{color:textColor(),fontSize:28,fontFamily:"'Orbitron',sans-serif",marginBottom:16}}>{score}/{TOTAL}</div>
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={onBack}>← BACK</Btn>
          <Btn color={C.cyan} style={{flex:1}} onClick={()=>{setScore(0);setRound(1);setResult(null);genQ();}}>↺ RETRY</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),position:"relative"}}>
      <Starfield n={25}/>
      <div style={{position:"relative",zIndex:2,background:`${C.orange}18`,borderBottom:`1px solid ${C.orange}33`,padding:"12px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
          <BackBtn onClick={onBack} color={C.orange}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.orange}}>🚀 NUMBER ROCKET</div>
          <div style={{marginLeft:"auto",fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.yellow}}>⭐ {score}/{TOTAL}</div>
        </div>
        {/* Fuel bar */}
        <div style={{background:isDark()?"rgba(255,255,255,0.06)":"rgba(124,111,224,0.06)",borderRadius:6,height:8,overflow:"hidden"}}>
          <div style={{width:`${fuel}%`,height:"100%",background:`linear-gradient(90deg,${fuel>50?C.green:fuel>25?C.orange:C.red},${C.yellow})`,borderRadius:6,transition:"width 0.1s"}}/>
        </div>
        <div style={{fontSize:9,color:C.dim,marginTop:2,fontFamily:"'Orbitron',sans-serif"}}>FUEL — ANSWER BEFORE IT RUNS OUT! · Q{round}/{TOTAL}</div>
      </div>
      <div style={{position:"relative",zIndex:2,padding:"28px 18px"}}>
        {/* Rocket animation */}
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:64,animation:fuel<30?"shakeX 0.3s ease infinite":"bFloat 2s ease-in-out infinite"}}>{fuel<30?"💥":"🚀"}</div>
        </div>
        <Card color={C.orange} style={{textAlign:"center",marginBottom:18,padding:"18px"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:22, color:textColor()}}>{q}</div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {opts.map((o,i)=>{
            let bg=C.card,border=`1.5px solid ${C.orange}28`,col="white";
            if(chosen!==null){
              if(i===ans){bg="#052e16";border=`2px solid ${C.green}`;col="#4ade80";}
              else if(i===chosen){bg="#2d0a0a";border=`2px solid ${C.red}`;col="#f87171";}
            }
            return <button key={i} onClick={()=>pick(i)} style={{background:bg,border,borderRadius:14,padding:"16px",fontSize:18,fontFamily:"'Orbitron',sans-serif",color:col,cursor:"pointer",transition:"all 0.15s"}}>{o}</button>;
          })}
        </div>
      </div>
    </div>
  );
}

// ── Game 2: Star Catcher — catch falling correct answers, avoid wrong ──
export function StarCatcher({ onBack, child }) {
  const [gameState, setGameState] = useState("ready"); // ready|playing|over
  const [score, setScore]   = useState(0);
  const [lives, setLives]   = useState(3);
  const [q, setQ]           = useState("");
  const [correctAns, setCA] = useState("");
  const [items, setItems]   = useState([]);
  const [playerX, setPlayerX] = useState(50);
  const itemsRef  = useRef([]);
  const scoreRef  = useRef(0);
  const livesRef  = useRef(3);
  const frameRef  = useRef(null);
  const qRef      = useRef({q:"",ans:""});

  const genQuestion = () => {
    const a = Math.floor(Math.random()*9)+1;
    const b = Math.floor(Math.random()*9)+1;
    const correct = String(a+b);
    qRef.current = {q:`${a} + ${b}`, ans: correct};
    setQ(`${a} + ${b} = ?`);
    setCA(correct);
    return correct;
  };

  const spawnWave = (currentCA) => {
    // Always spawn 1 correct + 2 wrong answers so stars are always visible
    const wrong1 = (() => { let v; do { v=String(Math.floor(Math.random()*18)+2); } while(v===currentCA); return v; })();
    const wrong2 = (() => { let v; do { v=String(Math.floor(Math.random()*18)+2); } while(v===currentCA||v===wrong1); return v; })();
    const positions = [15,50,82].sort(()=>Math.random()-0.5);
    return [
      { id: Date.now()+1, x:positions[0], y:-8, val:currentCA, correct:true,  speed:0.35+Math.random()*0.25 },
      { id: Date.now()+2, x:positions[1], y:-8, val:wrong1,    correct:false, speed:0.35+Math.random()*0.25 },
      { id: Date.now()+3, x:positions[2], y:-8, val:wrong2,    correct:false, speed:0.35+Math.random()*0.25 },
    ];
  };
  const spawnItem = spawnWave; // alias kept for compat

  const startGame = () => {
    scoreRef.current = 0; livesRef.current = 3;
    setScore(0); setLives(3); itemsRef.current = [];
    const ca = genQuestion();
    setGameState("playing");
    let frame = 0;
    const loop = () => {
      frame++;
      // Spawn new wave every 90 frames (~1.5s at 60fps) only when field is clear
      if (frame % 90 === 0 || (frame > 30 && itemsRef.current.length === 0)) {
        const wave = spawnWave(qRef.current.ans);
        itemsRef.current = [...itemsRef.current.filter(i=>i.y<100), ...wave];
      }
      // Move items down
      itemsRef.current = itemsRef.current
        .map(it => ({ ...it, y: it.y + it.speed }))
        .filter(it => {
          if (it.y > 100) {
            // Missed a correct answer
            if (it.correct) { livesRef.current = Math.max(0,livesRef.current-1); setLives(livesRef.current); if(livesRef.current<=0){setGameState("over");return false;} }
            return false;
          }
          return true;
        });
      setItems([...itemsRef.current]);
      if (livesRef.current > 0) frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => () => { if(frameRef.current) cancelAnimationFrame(frameRef.current); }, []);

  const catchItem = (item) => {
    if (item.correct) {
      scoreRef.current += 1; setScore(scoreRef.current);
      genQuestion();
    } else {
      livesRef.current = Math.max(0,livesRef.current-1); setLives(livesRef.current);
      if(livesRef.current<=0) setGameState("over");
    }
    itemsRef.current = itemsRef.current.filter(i => i.id !== item.id);
    setItems([...itemsRef.current]);
  };

  if (gameState === "ready") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={40}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:12}}>⭐</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:C.yellow,marginBottom:8}}>STAR CATCHER</div>
        <div style={{color:C.dim,fontSize:13,lineHeight:1.7,marginBottom:20,maxWidth:270}}>Stars fall from the sky! Tap the star with the CORRECT answer. Avoid wrong ones!</div>
        <Btn color={C.yellow} onClick={startGame}>▶ START CATCHING</Btn>
        <div style={{marginTop:12}}><Btn color={C.dim} style={{padding:"9px 20px"}} onClick={onBack}>← BACK</Btn></div>
      </div>
    </div>
  );

  if (gameState === "over") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={60}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:8}}>🌟</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:C.yellow,marginBottom:8}}>GAME OVER!</div>
        <div style={{color:textColor(),fontSize:36,fontFamily:"'Orbitron',sans-serif",marginBottom:16}}>Score: {score}</div>
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={onBack}>← BACK</Btn>
          <Btn color={C.yellow} style={{flex:1}} onClick={startGame}>↺ PLAY AGAIN</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,#000010,#04040f)"}}>
        {[...Array(20)].map((_,i)=><div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:2,height:2,background:"white",borderRadius:"50%",opacity:Math.random()*0.5+0.1}}/>)}
      </div>
      {/* HUD */}
      <div style={{position:"relative",zIndex:10,background:`${C.yellow}18`,borderBottom:`1px solid ${C.yellow}33`,padding:"10px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Btn color={C.dim} style={{padding:"5px 10px",fontSize:10}} onClick={()=>{cancelAnimationFrame(frameRef.current);setGameState("ready");}}>✕</Btn>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,color:C.yellow}}>⭐ {score}</div>
        <div style={{display:"flex",gap:4}}>{[...Array(3)].map((_,i)=><span key={i} style={{fontSize:16,filter:i<lives?"none":"grayscale(1) opacity(0.2)"}}>❤️</span>)}</div>
      </div>
      {/* Question */}
      <div style={{position:"relative",zIndex:10,textAlign:"center",padding:"12px 18px"}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20, color:textColor()}}>{q}</div>
      </div>
      {/* Play field */}
      <div style={{position:"relative",height:"65vh",overflow:"hidden",background:"transparent",touchAction:"none"}}
        onTouchMove={e=>{e.preventDefault();const rect=e.currentTarget.getBoundingClientRect();const pct=((e.touches[0].clientX-rect.left)/rect.width)*100;setPlayerX(Math.max(8,Math.min(92,pct)));}}
        onMouseMove={e=>{const rect=e.currentTarget.getBoundingClientRect();const pct=((e.clientX-rect.left)/rect.width)*100;setPlayerX(Math.max(8,Math.min(92,pct)));}}
      >
        {items.map(it=>(
          <div key={it.id}
            onClick={()=>catchItem(it)}
            style={{
              position:"absolute",
              left:`${it.x}%`,
              top:`${it.y}%`,
              transform:"translate(-50%,-50%)",
              cursor:"pointer",
              zIndex:5,
              userSelect:"none",
            }}
          >
            <div style={{
              background: it.correct ? `linear-gradient(135deg,${C.yellow}44,${C.orange}22)` : `${C.red}22`,
              border:`2px solid ${it.correct ? C.yellow : C.red}`,
              borderRadius:14,
              padding:"6px 12px",
              fontFamily:"'Orbitron',sans-serif",
              fontSize:14,
              fontWeight:700,
              color: it.correct ? C.yellow : C.red,
              boxShadow: it.correct ? `0 0 12px ${C.yellow}66` : "none",
              minWidth:44,
              textAlign:"center",
              whiteSpace:"nowrap",
            }}>
              {it.correct ? "⭐ " : ""}{it.val}
            </div>
          </div>
        ))}
        {/* Catcher ship */}
        <div style={{position:"absolute",bottom:10,left:`${playerX}%`,transform:"translateX(-50%)",fontSize:34,zIndex:5,filter:"drop-shadow(0 0 8px #00f5ff)"}}>🛸</div>
      </div>
    </div>
  );
}

// ── Game 3: Math Maze — solve to move the astronaut through a maze ────
export function MathMaze({ onBack, child }) {
  const MAZES = [
    { grid:["S","?","?","?","?","?","?","?","?","E"], cols:2, questions:[{q:"2+2",a:"4"},{q:"5-3",a:"2"},{q:"3×2",a:"6"},{q:"8÷2",a:"4"}] },
  ];
  const [step,    setStep]    = useState(0);
  const [q,       setQ]       = useState(null);
  const [chosen,  setChosen]  = useState(null);
  const [score,   setScore]   = useState(0);
  const [done,    setDone]    = useState(false);
  const [shake,   setShake]   = useState(false);
  const QUESTIONS = [
    {q:"4 + 3 = ?",  ans:1, opts:["5","7","8","9"]},
    {q:"9 - 5 = ?",  ans:1, opts:["2","4","5","6"]},
    {q:"3 × 3 = ?",  ans:2, opts:["6","7","9","11"]},
    {q:"12 ÷ 4 = ?", ans:2, opts:["2","3","3","4"]},
    {q:"6 + 8 = ?",  ans:1, opts:["12","14","15","16"]},
    {q:"15 - 7 = ?", ans:1, opts:["6","8","9","10"]},
    {q:"4 × 4 = ?",  ans:2, opts:["12","14","16","18"]},
    {q:"20 ÷ 5 = ?", ans:1, opts:["3","4","5","6"]},
  ];
  const shuffledQs = useRef(shuffle(QUESTIONS));
  const curQ = shuffledQs.current[Math.min(step, shuffledQs.current.length-1)];
  const STEPS = 8;

  const pick = (i) => {
    if (chosen !== null) return;
    setChosen(i);
    const ok = i === curQ.ans;
    if (ok) SFX.correct(); else SFX.wrong();
    if (ok) {
      setScore(s=>s+1);
      setTimeout(() => {
        setChosen(null);
        if (step+1 >= STEPS) setDone(true);
        else setStep(s=>s+1);
      }, 600);
    } else {
      setShake(true);
      setTimeout(() => { setShake(false); setChosen(null); }, 800);
    }
  };

  if (done) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={60}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:72,marginBottom:8}}>🏆</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:C.green,marginBottom:8}}>MAZE COMPLETE!</div>
        <div style={{color:textColor(),fontSize:28,fontFamily:"'Orbitron',sans-serif",marginBottom:16}}>{score}/{STEPS} correct</div>
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={onBack}>← BACK</Btn>
          <Btn color={C.green} style={{flex:1}} onClick={()=>{setStep(0);setScore(0);setDone(false);setChosen(null);shuffledQs.current=shuffle(QUESTIONS);}}>↺ AGAIN</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,background:`${C.green}18`,borderBottom:`1px solid ${C.green}33`,padding:"12px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <BackBtn onClick={onBack} color={C.green}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.green}}>🌀 MATH MAZE</div>
          <div style={{marginLeft:"auto",fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.dim}}>STEP {step+1}/{STEPS}</div>
        </div>
      </div>
      <div style={{position:"relative",zIndex:2,padding:"18px"}}>
        {/* Path visualizer */}
        <div style={{display:"flex",gap:4,marginBottom:18,justifyContent:"center",flexWrap:"wrap"}}>
          {[...Array(STEPS)].map((_,i)=>(
            <div key={i} style={{width:32,height:32,borderRadius:8,background:i<step?`${C.green}33`:i===step?C.green:"#0a0a20",border:`2px solid ${i<=step?C.green:"#1a1a30"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,transition:"all 0.3s"}}>
              {i<step?"✅":i===step?"🧑‍🚀":"⬛"}
            </div>
          ))}
          <div style={{width:32,height:32,borderRadius:8,background:"#0a0a20",border:`2px solid ${C.yellow}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🏆</div>
        </div>
        <Card color={C.green} style={{textAlign:"center",marginBottom:18,padding:"20px",animation:shake?"shakeX 0.4s ease":"none"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20, color:textColor(),marginBottom:4}}>🧑‍🚀 Solve to move forward!</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:26,color:C.green}}>{curQ.q}</div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {curQ.opts.map((o,i)=>{
            let bg=C.card,border=`1.5px solid ${C.green}28`,col="white";
            if(chosen!==null){
              if(i===curQ.ans){bg="#052e16";border=`2px solid ${C.green}`;col="#4ade80";}
              else if(i===chosen){bg="#2d0a0a";border=`2px solid ${C.red}`;col="#f87171";}
            }
            return <button key={i} onClick={()=>pick(i)} style={{background:bg,border,borderRadius:14,padding:"16px",fontSize:18,fontFamily:"'Orbitron',sans-serif",color:col,cursor:"pointer",transition:"all 0.15s"}}>{o}</button>;
          })}
        </div>
      </div>
    </div>
  );
}

// ── Game 4: Speed Math — answer as many as possible in 60 seconds ─────
export function SpeedMath({ onBack, child }) {
  const [phase,   setPhase]   = useState("ready"); // ready|playing|over
  const [q,       setQ]       = useState("");
  const [opts,    setOpts]    = useState([]);
  const [ans,     setAns]     = useState(0);
  const [score,   setScore]   = useState(0);
  const [wrong,   setWrong]   = useState(0);
  const [timeLeft,setTimeLeft]= useState(60);
  const [flash,   setFlash]   = useState(null); // "correct"|"wrong"
  const scoreRef = useRef(0);
  const wrongRef = useRef(0);

  const nextQ = () => {
    const level = Math.min(Math.floor(scoreRef.current/5)+1, 5);
    const max   = level * 8;
    const a = Math.floor(Math.random()*max)+1;
    const b = Math.floor(Math.random()*max)+1;
    const ops = level<3?["+","-"]:["+","-","×"];
    const op  = ops[Math.floor(Math.random()*ops.length)];
    let correct;
    if(op==="+") correct=a+b;
    else if(op==="-"){const [x,y]=[Math.max(a,b),Math.min(a,b)];correct=x-y;setQ(`${x} ${op} ${y} = ?`);const w=new Set();while(w.size<3){const v=correct+(Math.floor(Math.random()*7)-3);if(v>=0&&v!==correct)w.add(v);}const all=shuffle([correct,...w]);setOpts(all.map(String));setAns(all.indexOf(correct));return;}
    else correct=a*b;
    const w=new Set();while(w.size<3){const v=correct+(Math.floor(Math.random()*9)-4);if(v>=0&&v!==correct)w.add(v);}
    const all=shuffle([correct,...w]);
    setQ(`${a} ${op} ${b} = ?`); setOpts(all.map(String)); setAns(all.indexOf(correct));
  };

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) { setPhase("over"); return; }
    const t = setTimeout(() => setTimeLeft(tl=>tl-1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  const start = () => { scoreRef.current=0; wrongRef.current=0; setScore(0); setWrong(0); setTimeLeft(60); setPhase("playing"); nextQ(); };

  const pick = (i) => {
    const ok = i === ans;
    if(ok){SFX.correct();scoreRef.current++;setScore(scoreRef.current);setFlash("correct");}
    else{wrongRef.current++;setWrong(wrongRef.current);setFlash("wrong");}
    setTimeout(()=>{setFlash(null);nextQ();},300);
  };

  if(phase==="ready") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={40}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:12}}>⚡</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:C.yellow,marginBottom:8}}>SPEED MATH</div>
        <div style={{color:C.dim,fontSize:13,lineHeight:1.7,marginBottom:20,maxWidth:270}}>Answer as many questions as you can in 60 seconds! Questions get harder as you score more.</div>
        <Btn color={C.yellow} onClick={start}>▶ GO!</Btn>
        <div style={{marginTop:12}}><Btn color={C.dim} style={{padding:"9px 20px"}} onClick={onBack}>← BACK</Btn></div>
      </div>
    </div>
  );

  if(phase==="over") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={60}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:8}}>⏱️</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:C.yellow,marginBottom:12}}>TIME'S UP!</div>
        <Card color={C.yellow} style={{marginBottom:16,padding:"16px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-around"}}>
            <div style={{textAlign:"center"}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:28,color:C.green}}>{score}</div><div style={{fontSize:10,color:C.dim}}>CORRECT</div></div>
            <div style={{textAlign:"center"}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:28,color:C.red}}>{wrong}</div><div style={{fontSize:10,color:C.dim}}>WRONG</div></div>
            <div style={{textAlign:"center"}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:28,color:C.cyan}}>{Math.round(score/(score+wrong||1)*100)}%</div><div style={{fontSize:10,color:C.dim}}>ACCURACY</div></div>
          </div>
        </Card>
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={onBack}>← BACK</Btn>
          <Btn color={C.yellow} style={{flex:1}} onClick={start}>↺ RETRY</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:flash==="correct"?"#052e16":flash==="wrong"?"#2d0a0a":C.bg,fontFamily:"'Nunito',sans-serif",position:"relative",transition:"background 0.15s"}}>
      <Starfield n={15}/>
      <div style={{position:"relative",zIndex:2,background:`${C.yellow}18`,borderBottom:`1px solid ${C.yellow}33`,padding:"12px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.yellow}}>⚡ SPEED MATH</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20,color:timeLeft<=10?C.red:C.green}}>{timeLeft}s</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.green}}>✓ {score}</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.red}}>✗ {wrong}</div>
        </div>
        <div style={{marginTop:5,background:isDark()?"rgba(255,255,255,0.06)":"rgba(124,111,224,0.06)",borderRadius:5,height:5,overflow:"hidden"}}>
          <div style={{width:`${(timeLeft/60)*100}%`,height:"100%",background:`linear-gradient(90deg,${timeLeft>20?C.green:C.red},${C.yellow})`,borderRadius:5,transition:"width 1s linear"}}/>
        </div>
      </div>
      <div style={{position:"relative",zIndex:2,padding:"24px 18px"}}>
        <Card color={C.yellow} style={{textAlign:"center",marginBottom:20,padding:"22px"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:28, color:textColor()}}>{q}</div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {opts.map((o,i)=>(
            <button key={i} onClick={()=>pick(i)} style={{background:C.card,border:`1.5px solid ${C.yellow}28`,borderRadius:14,padding:"20px",fontSize:20,fontFamily:"'Orbitron',sans-serif",color:textColor(),cursor:"pointer",transition:"transform 0.1s",active:{transform:"scale(0.95)"}}}>
              {o}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Game 5: Number Memory — remember the sequence ─────────────────────
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

