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
  const [chosen,  setChosen]  = useState(null);
  const [rocketY, setRocketY] = useState(55);
  const fuelRef  = useRef(100);
  const timerRef = useRef(null);

  const genQ = () => {
    const ops=["+","-","x"];
    const op=ops[Math.floor(Math.random()*ops.length)];
    let a=Math.floor(Math.random()*20)+1, b=Math.floor(Math.random()*10)+1, correct;
    if(op==="+") correct=a+b;
    else if(op==="-"){if(b>a)[a,b]=[b,a]; correct=a-b;}
    else correct=a*b;
    const wrong=new Set();
    while(wrong.size<3){const v=correct+(Math.floor(Math.random()*7)-3);if(v!==correct&&v>=0)wrong.add(v);}
    const all=shuffle([correct,...wrong]);
    const dispOp = op==="x" ? "\xd7" : op;
    setQ(a+" "+dispOp+" "+b+" = ?"); setOpts(all.map(String)); setAns(all.indexOf(correct)); setChosen(null);
    fuelRef.current=100; setFuel(100);
  };

  const startGame=()=>{setScore(0);setRound(1);setRocketY(55);setPhase("playing");genQ();};

  useEffect(()=>{
    if(phase!=="playing"||chosen!==null) return;
    timerRef.current=setInterval(()=>{
      fuelRef.current-=2; setFuel(fuelRef.current);
      setRocketY(y=>Math.min(78,y+0.35));
      if(fuelRef.current<=0){
        clearInterval(timerRef.current); setChosen("timeout");
        setTimeout(()=>{ if(round>=TOTAL)setPhase("over"); else{setRound(r=>r+1);genQ();} },900);
      }
    },100);
    return ()=>clearInterval(timerRef.current);
  },[q,phase]);

  const pick=(i)=>{
    if(chosen!==null) return;
    clearInterval(timerRef.current); setChosen(i);
    if(i===ans){SFX.correct();setScore(s=>s+1);setRocketY(y=>Math.max(12,y-26));}
    else{SFX.wrong();setRocketY(y=>Math.min(80,y+10));}
    setTimeout(()=>{ if(round>=TOTAL)setPhase("over"); else{setRound(r=>r+1);genQ();} },750);
  };

  if(phase==="ready") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={30}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",width:"100%",maxWidth:360}}>
        <div style={{fontSize:72,marginBottom:8}}>{"🚀"}</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:26,color:C.orange,marginBottom:16}}>Number Rocket</div>
        <div style={{background:"white",border:"1.5px solid "+C.orange+"33",borderRadius:24,padding:"16px 20px",marginBottom:20,boxShadow:"0 8px 30px "+C.orange+"18"}}>
          <div style={{color:C.dim,fontSize:13,lineHeight:1.9,textAlign:"left"}}>
            {"🚀"} Solve the question to blast the rocket up!<br/>
            {"⛽"} Answer before the fuel bar empties<br/>
            {"🎯"} {TOTAL} rounds — how high can you go?
          </div>
        </div>
        <Btn color={C.orange} onClick={startGame}>{"🔥"} LAUNCH!</Btn>
        <div style={{marginTop:12}}><Btn color={C.dim} style={{padding:"12px 24px"}} onClick={onBack}>{"←"} Back</Btn></div>
      </div>
    </div>
  );

  if(phase==="over") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={30}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",width:"100%",maxWidth:360}}>
        <div style={{fontSize:72,marginBottom:8}}>{score>=8?"🏆":score>=5?"🌟":"🚀"}</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,color:C.orange,marginBottom:16}}>{score>=8?"Stellar Launch!":score>=5?"Good Flight!":"Rocket Crashed!"}</div>
        <div style={{background:"white",border:"1.5px solid "+C.orange+"33",borderRadius:24,padding:"20px",marginBottom:20,boxShadow:"0 8px 30px "+C.orange+"18"}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:48,color:C.orange}}>{score}<span style={{fontSize:20,color:C.dim}}>/{TOTAL}</span></div>
          <div style={{fontSize:12,color:C.dim,fontWeight:700,marginTop:4}}>Correct Answers</div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={onBack}>{"←"} Back</Btn>
          <Btn color={C.orange} style={{flex:1}} onClick={startGame}>{"↺"} Retry</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",position:"relative",overflow:"hidden"}}>
      <Starfield n={20}/>
      <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:72,transform:"translateX(-50%)",zIndex:2,pointerEvents:"none"}}>
        <div style={{position:"absolute",left:"50%",top:rocketY+"%",transform:"translateX(-50%) translateY(30px)",width:3,background:"linear-gradient(180deg,transparent,"+C.orange+"66)",height:"22vh",borderRadius:4,opacity:0.6}}/>
        <div style={{position:"absolute",left:"50%",top:rocketY+"%",transform:"translateX(-50%)",fontSize:40,transition:"top 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>{"🚀"}</div>
      </div>
      <div style={{position:"relative",zIndex:10,background:"white",borderBottom:"1.5px solid "+C.orange+"25",padding:"10px 18px",boxShadow:"0 2px 12px "+C.orange+"18"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <button onClick={()=>{clearInterval(timerRef.current);setPhase("ready");}} style={{background:"transparent",border:"1.5px solid "+C.dim+"44",borderRadius:12,padding:"5px 12px",color:C.dim,fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:800}}>{"✕"} Quit</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.orange}}>{"🚀"} {score}/{TOTAL}</div>
          <div style={{fontSize:12,color:C.dim,fontWeight:700}}>Round {round}</div>
        </div>
        <div style={{background:C.orange+"18",borderRadius:8,height:10,overflow:"hidden"}}>
          <div style={{width:fuel+"%",height:"100%",background:"linear-gradient(90deg,"+(fuel>50?C.green:fuel>25?C.yellow:C.red)+","+C.orange+")",borderRadius:8,transition:"width 0.1s linear"}}/>
        </div>
        <div style={{fontSize:9,color:C.dim,marginTop:2,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Fuel — answer before it runs out!</div>
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:10,padding:"0 16px 24px"}}>
        <Card color={C.orange} style={{textAlign:"center",padding:"22px 18px",marginBottom:14}}>
          <div style={{fontSize:11,color:C.orange,fontWeight:900,marginBottom:6,letterSpacing:1,textTransform:"uppercase"}}>Solve to blast off!</div>
          <div style={{fontSize:32,color:textColor(),fontWeight:900,fontFamily:"'Fredoka One',cursive"}}>{q}</div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {opts.map((o,i)=>{
            const answered=chosen!==null;
            let bg="white",border="2px solid "+C.orange+"25",col=textColor();
            if(answered){if(i===ans){bg="#E8FFF4";border="2.5px solid #2ECC9A";col="#2ECC9A";}else if(i===chosen){bg="#FFF0F0";border="2.5px solid "+C.red;col=C.red;}}
            return(
              <button key={i} onClick={()=>pick(i)} style={{background:bg,border,borderRadius:18,padding:"18px 12px",fontSize:20,fontWeight:800,color:col,cursor:answered?"default":"pointer",transition:"all 0.2s",fontFamily:"'Nunito',sans-serif",position:"relative",overflow:"hidden"}}>
                {!answered&&<div style={{position:"absolute",top:0,left:0,right:0,height:"50%",background:"linear-gradient(180deg,rgba(255,255,255,0.5),transparent)",borderRadius:"18px 18px 0 0",pointerEvents:"none"}}/>}
                <div style={{fontSize:10,color:answered&&i===ans?"#2ECC9A":answered&&i===chosen?C.red:C.orange,fontWeight:900,marginBottom:3}}>{"ABCD"[i]}</div>
                {answered&&i===ans?"✓ ":answered&&i===chosen&&i!==ans?"✗ ":""}{o}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function StarCatcher({ onBack, child }) {
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
  const ansRef     = useRef("");
  const blastIdRef = useRef(0);

  const genQuestion = () => {
    const ops=["+","-","x"];
    const op=ops[Math.floor(Math.random()*ops.length)];
    let a=Math.floor(Math.random()*10)+1, b=Math.floor(Math.random()*9)+1, correct;
    if(op==="+") correct=a+b;
    else if(op==="-"){if(b>a)[a,b]=[b,a]; correct=a-b;}
    else correct=a*b;
    const ans=String(correct);
    ansRef.current=ans;
    const dispOp = op==="x" ? "\xd7" : op;
    setQ(a+" "+dispOp+" "+b+" = ?");
    return ans;
  };

  const makeWrong=(correct,existing)=>{
    const used=new Set([correct,...existing]);
    let v,tries=0;
    do{v=String(Math.max(1,parseInt(correct)+(Math.floor(Math.random()*10)-5)));tries++;}while(used.has(v)&&tries<30);
    return v;
  };

  const spawnWave=(ans)=>{
    const w1=makeWrong(ans,[]);
    const w2=makeWrong(ans,[w1]);
    const cols=[15,50,85].sort(()=>Math.random()-0.5);
    const spd=Math.min(0.28+scoreRef.current*0.012,0.65);
    return[
      {id:Date.now()+1,x:cols[0],y:-12,val:ans,correct:true, speed:spd},
      {id:Date.now()+2,x:cols[1],y:-12,val:w1, correct:false,speed:spd+0.04},
      {id:Date.now()+3,x:cols[2],y:-12,val:w2, correct:false,speed:spd+0.08},
    ];
  };

  const startGame=()=>{
    cancelAnimationFrame(frameRef.current);
    scoreRef.current=0; livesRef.current=3;
    setScore(0); setLives(3); setBlastFX([]);
    const ca=genQuestion();
    itemsRef.current=spawnWave(ca);
    setGameState("playing");
    const loop=()=>{
      if(itemsRef.current.length===0){
        const na=genQuestion();
        itemsRef.current=spawnWave(na);
      }
      itemsRef.current=itemsRef.current
        .map(it=>({...it,y:it.y+it.speed}))
        .filter(it=>{
          if(it.y>102){
            if(it.correct){
              livesRef.current=Math.max(0,livesRef.current-1);
              setLives(livesRef.current);
              if(livesRef.current<=0){setGameState("over");return false;}
              const na=genQuestion();
              itemsRef.current=spawnWave(na);
              return false;
            }
            return false;
          }
          return true;
        });
      setItems([...itemsRef.current]);
      if(livesRef.current>0) frameRef.current=requestAnimationFrame(loop);
    };
    frameRef.current=requestAnimationFrame(loop);
  };

  useEffect(()=>()=>{cancelAnimationFrame(frameRef.current);},[]);

  const tapItem=(item)=>{
    const bid=++blastIdRef.current;
    setBlastFX(fx=>[...fx,{id:bid,x:item.x,y:item.y,hit:!item.correct}]);
    setTimeout(()=>setBlastFX(fx=>fx.filter(f=>f.id!==bid)),500);
    itemsRef.current=itemsRef.current.filter(i=>i.id!==item.id);
    setItems([...itemsRef.current]);
    if(!item.correct){
      SFX.correct();
      scoreRef.current+=1; setScore(scoreRef.current);
    } else {
      SFX.wrong();
      livesRef.current=Math.max(0,livesRef.current-1);
      setLives(livesRef.current);
      if(livesRef.current<=0){cancelAnimationFrame(frameRef.current);setGameState("over");return;}
      const na=genQuestion();
      itemsRef.current=spawnWave(na);
      setItems([...itemsRef.current]);
    }
  };

  if(gameState==="ready") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={30}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",width:"100%",maxWidth:360}}>
        <div style={{fontSize:72,marginBottom:8}}>{"☄️"}</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:26,color:C.red,marginBottom:16}}>Meteor Blaster</div>
        <div style={{background:"white",border:"1.5px solid "+C.red+"33",borderRadius:24,padding:"16px 20px",marginBottom:20,boxShadow:"0 8px 30px "+C.red+"18"}}>
          <div style={{color:C.dim,fontSize:13,lineHeight:1.9,textAlign:"left"}}>
            {"🔢"} Solve the question at the top<br/>
            {"💥"} TAP the meteor with the <b style={{color:C.red}}>WRONG</b> answer<br/>
            {"✋"} Let the <b style={{color:C.green}}>RIGHT</b> answer float past safely
          </div>
        </div>
        <Btn color={C.red} onClick={startGame}>{"🚀"} Launch Blaster</Btn>
        <div style={{marginTop:12}}><Btn color={C.dim} style={{padding:"12px 24px"}} onClick={onBack}>{"←"} Back</Btn></div>
      </div>
    </div>
  );

  if(gameState==="over") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={30}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",width:"100%",maxWidth:360}}>
        <div style={{fontSize:72,marginBottom:8}}>{score>=10?"🏆":"💥"}</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,color:C.red,marginBottom:16}}>{score>=10?"Galaxy Hero!":"Planet Down!"}</div>
        <div style={{background:"white",border:"1.5px solid "+C.red+"33",borderRadius:24,padding:"20px",marginBottom:20,boxShadow:"0 8px 30px "+C.red+"18"}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:48,color:C.red}}>{score}<span style={{fontSize:16,color:C.dim}}> blasted</span></div>
          <div style={{fontSize:12,color:C.dim,fontWeight:700,marginTop:4}}>Wrong meteors destroyed</div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={onBack}>{"←"} Back</Btn>
          <Btn color={C.red} style={{flex:1}} onClick={startGame}>{"↺"} Play Again</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",position:"relative",overflow:"hidden"}}>
      <Starfield n={20}/>
      <div style={{position:"absolute",bottom:-80,left:"50%",transform:"translateX(-50%)",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle at 38% 36%,"+C.cyan+","+C.purple+")",boxShadow:"0 0 60px "+C.cyan+"55",zIndex:1,pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:20,background:"white",borderBottom:"1.5px solid "+C.red+"25",padding:"10px 18px",boxShadow:"0 2px 12px "+C.red+"15"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <button onClick={()=>{cancelAnimationFrame(frameRef.current);setGameState("ready");}} style={{background:"transparent",border:"1.5px solid "+C.dim+"44",borderRadius:12,padding:"5px 12px",color:C.dim,fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:800}}>{"✕"} Quit</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.red}}>{"☄️"} {score} blasted</div>
          <div style={{display:"flex",gap:3}}>{[...Array(3)].map((_,i)=><span key={i} style={{fontSize:16,opacity:i<lives?1:0.15}}>{"❤️"}</span>)}</div>
        </div>
      </div>
      <div style={{position:"relative",zIndex:20,padding:"12px 16px 0"}}>
        <Card color={C.red} style={{textAlign:"center",padding:"16px 18px"}}>
          <div style={{fontSize:10,color:C.red,fontWeight:900,marginBottom:4,letterSpacing:1,textTransform:"uppercase"}}>Blast the WRONG answer!</div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:textColor()}}>{q}</div>
        </Card>
      </div>
      <div style={{position:"relative",height:"66vh",overflow:"hidden"}}>
        {blastFX.map(fx=>(
          <div key={fx.id} style={{position:"absolute",left:fx.x+"%",top:fx.y+"%",transform:"translate(-50%,-50%)",fontSize:28,zIndex:15,pointerEvents:"none",animation:"mmPop 0.4s ease forwards"}}>
            {fx.hit?"💥":"❌"}
          </div>
        ))}
        {items.map(it=>(
          <div key={it.id} onClick={()=>tapItem(it)} style={{position:"absolute",left:it.x+"%",top:it.y+"%",transform:"translate(-50%,-50%)",cursor:"pointer",zIndex:10,userSelect:"none"}}>
            <div style={{background:"white",border:"2.5px solid "+C.purple+"44",borderRadius:"48% 52% 40% 60% / 50% 44% 56% 50%",width:66,height:66,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px "+C.purple+"33"}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:textColor()}}>{it.val}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Game 3: Math Maze ────────────────────────────────────────────────
export function MathMaze({ onBack, child }) {
  const STEPS = 8;
  const genQ = (step) => {
    const diff=Math.min(Math.floor(step/3)+1,4);
    const ops=diff<2?["+","-"]:diff<3?["+","-","x"]:["+","-","x"];
    const op=ops[Math.floor(Math.random()*ops.length)];
    let a,b,correct;
    if(op==="+"){a=Math.floor(Math.random()*15)+1;b=Math.floor(Math.random()*15)+1;correct=a+b;}
    else if(op==="-"){a=Math.floor(Math.random()*20)+5;b=Math.floor(Math.random()*a)+1;correct=a-b;}
    else{a=Math.floor(Math.random()*8)+2;b=Math.floor(Math.random()*8)+2;correct=a*b;}
    const wrong=new Set();
    while(wrong.size<3){const v=correct+(Math.floor(Math.random()*7)-3);if(v>0&&v!==correct)wrong.add(v);}
    const dispOp = op==="x" ? "\xd7" : op;
    return {q:a+" "+dispOp+" "+b+" = ?",ans:correct,opts:shuffle([correct,...wrong])};
  };

  const [step,   setStep]   = useState(0);
  const [q,      setQ]      = useState(()=>genQ(0));
  const [chosen, setChosen] = useState(null);
  const [shake,  setShake]  = useState(false);
  const [score,  setScore]  = useState(0);

  const pick=(opt)=>{
    if(chosen!==null) return;
    setChosen(opt);
    if(opt===q.ans){
      SFX.correct(); setScore(s=>s+10);
      setTimeout(()=>{
        const ns=step+1; setStep(ns); setChosen(null);
        if(ns<STEPS) setQ(genQ(ns));
      },600);
    } else {
      SFX.wrong(); setShake(true);
      setTimeout(()=>{ setShake(false); setChosen(null); },700);
    }
  };

  const done=step>=STEPS;

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,padding:"16px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <BackBtn onClick={onBack} color={C.cyan}/>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:17,color:C.cyan,letterSpacing:1}}>{"🌀"} MATH MAZE</div>
          <div style={{background:C.yellow+"22",border:"1.5px solid "+C.yellow+"44",borderRadius:12,padding:"4px 10px",fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.yellow}}>{"⭐"} {score}</div>
        </div>
        <div style={{background:C.card,border:"2px solid "+C.cyan+"33",borderRadius:20,padding:"16px 12px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,overflowX:"auto"}}>
            {Array.from({length:STEPS+1},(_,i)=>{
              const isAstronaut=i===step, isPast=i<step, isGoal=i===STEPS;
              return (
                <React.Fragment key={i}>
                  <div style={{minWidth:isAstronaut?44:isGoal?38:32,height:isAstronaut?44:isGoal?38:32,borderRadius:"50%",background:isAstronaut?"linear-gradient(135deg,"+C.cyan+","+C.purple+")":isPast?C.green+"44":"rgba(91,79,232,0.08)",border:"2px solid "+(isAstronaut?C.cyan:isPast?C.green:isGoal?"#FFD700":C.dim+"33"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:isAstronaut?22:isGoal?20:12,flexShrink:0,transition:"all 0.4s",boxShadow:isAstronaut?"0 0 14px "+C.cyan+"88":"none"}}>
                    {isAstronaut?"👨‍🚀":isGoal?"🏆":isPast?"✔️":i+1}
                  </div>
                  {i<STEPS&&<div style={{width:10,height:3,background:isPast?C.green:C.dim+"22",borderRadius:2,flexShrink:0}}/>}
                </React.Fragment>
              );
            })}
          </div>
          <div style={{textAlign:"center",fontSize:11,color:C.dim,marginTop:8,fontWeight:700}}>Step {step} / {STEPS}</div>
        </div>
        {done ? (
          <div style={{textAlign:"center",padding:"30px 20px",background:C.green+"10",borderRadius:22,border:"2px solid "+C.green+"44"}}>
            <div style={{fontSize:64,marginBottom:10}}>{"🏆"}</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.green,marginBottom:6}}>Maze Complete!</div>
            <div style={{color:C.dim,fontSize:14,marginBottom:20}}>Score: {score}</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <Btn color={C.dim} style={{flex:1}} onClick={onBack}>{"←"} Back</Btn>
              <Btn color={C.cyan} style={{flex:1}} onClick={()=>{setStep(0);setScore(0);setChosen(null);setQ(genQ(0));}}>{"↺"} Play Again</Btn>
            </div>
          </div>
        ) : (
          <>
            <div style={{background:shake?"#FFF0F0":C.card,border:"2px solid "+(shake?C.red+"66":C.cyan+"33"),borderRadius:20,padding:"20px 18px",textAlign:"center",marginBottom:16,transition:"all 0.2s"}}>
              <div style={{fontSize:10,color:C.dim,fontWeight:700,marginBottom:4,letterSpacing:1,textTransform:"uppercase"}}>Solve to move forward</div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:textColor()}}>{q.q}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {q.opts.map((o,i)=>{
                const answered=chosen!==null;
                let bg="white",border="2px solid "+C.cyan+"44",col=textColor();
                if(answered){if(o===q.ans){bg="#E8FFF4";border="2.5px solid #2ECC9A";col="#2ECC9A";}else if(o===chosen){bg="#FFF0F0";border="2.5px solid "+C.red;col=C.red;}}
                return(
                  <button key={i} onClick={()=>pick(o)} style={{background:bg,border,borderRadius:18,padding:"20px 12px",fontFamily:"'Fredoka One',cursive",fontSize:26,color:col,cursor:answered?"default":"pointer",textAlign:"center",transition:"all 0.2s",boxShadow:"0 4px 14px rgba(75,189,245,0.1)"}}>{o}</button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Game 4: Speed Math ───────────────────────────────────────────────
export function SpeedMath({ onBack, child }) {
  const [phase,    setPhase]    = useState("ready");
  const [q,        setQ]        = useState("");
  const [opts,     setOpts]     = useState([]);
  const [ans,      setAns]      = useState(0);
  const [score,    setScore]    = useState(0);
  const [wrong,    setWrong]    = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [chosen,   setChosen]   = useState(null);
  const scoreRef=useRef(0); const wrongRef=useRef(0);

  const nextQ=()=>{
    const level=Math.min(Math.floor(scoreRef.current/5)+1,5);
    const max=level*8;
    const a=Math.floor(Math.random()*max)+1;
    const b=Math.floor(Math.random()*max)+1;
    const ops=level<3?["+","-"]:["+","-","x"];
    const op=ops[Math.floor(Math.random()*ops.length)];
    let correct;
    if(op==="+")correct=a+b;
    else if(op==="-"){const x=Math.max(a,b),y=Math.min(a,b);correct=x-y;
      const w=new Set();while(w.size<3){const v=correct+(Math.floor(Math.random()*7)-3);if(v>=0&&v!==correct)w.add(v);}
      const all=shuffle([correct,...w]);
      setQ(x+" - "+y+" = ?");setOpts(all.map(String));setAns(all.indexOf(correct));setChosen(null);return;
    }
    else correct=a*b;
    const w=new Set();while(w.size<3){const v=correct+(Math.floor(Math.random()*9)-4);if(v>=0&&v!==correct)w.add(v);}
    const all=shuffle([correct,...w]);
    const dispOp = op==="x" ? "\xd7" : op;
    setQ(a+" "+dispOp+" "+b+" = ?");setOpts(all.map(String));setAns(all.indexOf(correct));setChosen(null);
  };

  useEffect(()=>{
    if(phase!=="playing") return;
    if(timeLeft<=0){setPhase("over");return;}
    const t=setTimeout(()=>setTimeLeft(tl=>tl-1),1000);
    return ()=>clearTimeout(t);
  },[timeLeft,phase]);

  const start=()=>{scoreRef.current=0;wrongRef.current=0;setScore(0);setWrong(0);setTimeLeft(60);setChosen(null);setPhase("playing");nextQ();};

  const pick=(i)=>{
    if(chosen!==null) return;
    setChosen(i);
    if(i===ans){SFX.correct();scoreRef.current++;setScore(scoreRef.current);}
    else{wrongRef.current++;setWrong(wrongRef.current);SFX.wrong();}
    setTimeout(()=>{setChosen(null);nextQ();},350);
  };

  if(phase==="ready") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",width:"100%",maxWidth:360}}>
        <div style={{fontSize:72,marginBottom:8}}>{"⚡"}</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:26,color:C.yellow,marginBottom:16}}>Speed Math</div>
        <div style={{background:"white",border:"1.5px solid "+C.yellow+"44",borderRadius:24,padding:"16px 20px",marginBottom:20,boxShadow:"0 8px 30px "+C.yellow+"22"}}>
          <div style={{color:C.dim,fontSize:13,lineHeight:1.9,textAlign:"left"}}>
            {"⏱️"} 60 seconds on the clock<br/>
            {"📈"} Questions get harder as you score more<br/>
            {"🎯"} Aim for 20+ correct answers!
          </div>
        </div>
        <Btn color={C.yellow} onClick={start}>{"▶"} GO!</Btn>
        <div style={{marginTop:12}}><Btn color={C.dim} style={{padding:"12px 24px"}} onClick={onBack}>{"←"} Back</Btn></div>
      </div>
    </div>
  );

  if(phase==="over") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",width:"100%",maxWidth:360}}>
        <div style={{fontSize:72,marginBottom:8}}>{score>=15?"🏆":score>=8?"🌟":"⚡"}</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,color:C.yellow,marginBottom:16}}>{"Time's Up!"}</div>
        <div style={{background:"white",border:"1.5px solid "+C.yellow+"44",borderRadius:24,padding:"20px",marginBottom:20,boxShadow:"0 8px 30px "+C.yellow+"22",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:C.green}}>{score}</div><div style={{fontSize:10,color:C.dim,fontWeight:700}}>CORRECT</div></div>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:C.red}}>{wrong}</div><div style={{fontSize:10,color:C.dim,fontWeight:700}}>WRONG</div></div>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:C.cyan}}>{Math.round(score/(score+wrong||1)*100)}%</div><div style={{fontSize:10,color:C.dim,fontWeight:700}}>ACCURACY</div></div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={onBack}>{"←"} Back</Btn>
          <Btn color={C.yellow} style={{flex:1}} onClick={start}>{"↺"} Retry</Btn>
        </div>
      </div>
    </div>
  );

  const timerPct=(timeLeft/60)*100;
  const timerColor=timeLeft>20?C.green:timeLeft>10?C.yellow:C.red;
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",position:"relative"}}>
      <Starfield n={15}/>
      <div style={{position:"relative",zIndex:10,background:"white",borderBottom:"1.5px solid "+C.yellow+"25",padding:"10px 18px",boxShadow:"0 2px 12px "+C.yellow+"15"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <button onClick={()=>setPhase("ready")} style={{background:"transparent",border:"1.5px solid "+C.dim+"44",borderRadius:12,padding:"5px 12px",color:C.dim,fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:800}}>{"✕"} Quit</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.yellow}}>{"⚡"} Speed Math</div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:timerColor}}>{timeLeft}s</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <div style={{fontSize:13,color:C.green,fontWeight:800}}>{"✓"} {score}</div>
          <div style={{fontSize:13,color:C.red,fontWeight:800}}>{"✗"} {wrong}</div>
        </div>
        <div style={{background:C.yellow+"22",borderRadius:8,height:8,overflow:"hidden"}}>
          <div style={{width:timerPct+"%",height:"100%",background:"linear-gradient(90deg,"+timerColor+","+C.yellow+")",borderRadius:8,transition:"width 1s linear"}}/>
        </div>
      </div>
      <div style={{position:"relative",zIndex:2,padding:"20px 16px"}}>
        <Card color={C.yellow} style={{textAlign:"center",padding:"26px 18px",marginBottom:16,
          animation:chosen===ans&&chosen!==null?"correctBounce 0.5s ease":chosen!==null&&chosen!==ans?"wrongWiggle 0.5s ease":"none",
          boxShadow:chosen===ans&&chosen!==null?"0 0 40px "+C.green+"50":chosen!==null&&chosen!==ans?"0 0 20px "+C.red+"44":"0 8px 30px "+C.yellow+"28, inset 0 1px 0 rgba(255,255,255,0.8)",
        }}>
          {chosen!==null&&<div style={{fontSize:28,marginBottom:4,animation:"mmPop 0.3s ease"}}>{chosen===ans?"✅":"❌"}</div>}
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:34,color:textColor()}}>{q}</div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {opts.map((o,i)=>{
            const answered=chosen!==null;
            let bg="white",border="2px solid "+C.yellow+"33",col=textColor();
            if(answered){if(i===ans){bg="#E8FFF4";border="2.5px solid #2ECC9A";col="#2ECC9A";}else if(i===chosen){bg="#FFF0F0";border="2.5px solid "+C.red;col=C.red;}}
            return(
              <button key={i} onClick={()=>pick(i)} disabled={chosen!==null} style={{background:bg,border,borderRadius:18,padding:"18px 12px",fontSize:20,fontWeight:800,color:col,cursor:answered?"default":"pointer",transition:"all 0.2s",fontFamily:"'Nunito',sans-serif",position:"relative",overflow:"hidden"}}>
                {!answered&&<div style={{position:"absolute",top:0,left:0,right:0,height:"50%",background:"linear-gradient(180deg,rgba(255,255,255,0.5),transparent)",borderRadius:"18px 18px 0 0",pointerEvents:"none"}}/>}
                <div style={{fontSize:10,color:answered&&i===ans?"#2ECC9A":answered&&i===chosen?C.red:C.yellow,fontWeight:900,marginBottom:3}}>{"ABCD"[i]}</div>
                {answered&&i===ans?"✓ ":answered&&i===chosen&&i!==ans?"✗ ":""}{o}
              </button>
            );
          })}
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