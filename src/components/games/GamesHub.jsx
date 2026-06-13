// src/components/games/GamesHub.jsx — MathCardFlip, EquationBalance, SequenceBuilder, GamesHub
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, BackBtn } from '../ui/primitives.jsx';
import { NumberRocket, StarCatcher, MathMaze, SpeedMath, NumberMemory } from './ArcadeGames.jsx';
import { Starfield } from '../layout/layout.jsx';


export function MathCardFlip({ onBack, child }) {
  const PAIRS = 6;
  const genCards = () => {
    const pairs = [];
    for(let i=0;i<PAIRS;i++){
      const a=Math.floor(Math.random()*10)+1, b=Math.floor(Math.random()*10)+1;
      pairs.push({id:i*2,   type:"q", val:a+" + "+b, ans:a+b});
      pairs.push({id:i*2+1, type:"a", val:String(a+b), ans:a+b});
    }
    return pairs.sort(()=>Math.random()-0.5).map((c,i)=>({...c,idx:i,flipped:false,matched:false}));
  };
  const [cards,   setCards]   = useState(()=>genCards());
  const [flipped, setFlipped] = useState([]);
  const [moves,   setMoves]   = useState(0);
  const [won,     setWon]     = useState(false);
  const [score,   setScore]   = useState(0);
  const [level,   setLevel]   = useState(1);

  const flip = (idx) => {
    if(flipped.length===2||cards[idx].flipped||cards[idx].matched) return;
    SFX.tap();
    const nf = [...flipped, idx];
    const nc = cards.map((c,i)=>i===idx?{...c,flipped:true}:c);
    setCards(nc); setFlipped(nf);
    if(nf.length===2){
      setMoves(m=>m+1);
      const [a,b] = nf;
      if(nc[a].ans===nc[b].ans && nc[a].type!==nc[b].type){
        SFX.correct();
        const mc = nc.map((c,i)=>nf.includes(i)?{...c,matched:true}:c);
        setCards(mc); setFlipped([]); setScore(s=>s+10);
        if(mc.every(c=>c.matched)){ SFX.xpLevelUp(); setWon(true); }
      } else {
        SFX.wrong();
        setTimeout(()=>{ setCards(c=>c.map((cd,i)=>nf.includes(i)?{...cd,flipped:false}:cd)); setFlipped([]); },900);
      }
    }
  };

  const nextLevel = () => { setLevel(l=>l+1); setCards(genCards()); setFlipped([]); setMoves(0); setWon(false); };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,padding:"16px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <BackBtn onClick={onBack} color={C.cyan}/>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:17,color:C.cyan,letterSpacing:1}}>🃏 CARD FLIP</div>
          <div style={{background:C.yellow+"22",border:"1.5px solid "+C.yellow+"44",borderRadius:12,padding:"4px 10px",fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.yellow}}>⭐ {score}</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,padding:"8px 14px",background:C.cyan+"10",border:"1px solid "+C.cyan+"22",borderRadius:14}}>
          <span style={{fontSize:12,color:C.dim,fontWeight:700}}>Level {level}</span>
          <span style={{fontSize:12,color:C.cyan,fontWeight:700}}>Match equation ↔ answer</span>
          <span style={{fontSize:12,color:C.dim,fontWeight:700}}>Moves: {moves}</span>
        </div>
        {won ? (
          <div style={{textAlign:"center",padding:"40px 20px",background:C.green+"10",borderRadius:24,border:"2px solid "+C.green+"44"}}>
            <div style={{fontSize:72,marginBottom:12}}>🎉</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.green,marginBottom:6}}>Level {level} Cleared!</div>
            <div style={{color:C.dim,fontSize:14,marginBottom:24}}>Moves: {moves} · Score: {score}</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <Btn color={C.dim} style={{flex:1}} onClick={onBack}>← Back</Btn>
              <Btn color={C.green} style={{flex:1}} onClick={nextLevel}>Next Level →</Btn>
            </div>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {cards.map((c,i)=>(
              <button key={c.id} onClick={()=>flip(i)} style={{
                aspectRatio:"1",
                background: c.matched ? "linear-gradient(135deg,"+C.green+"33,"+C.green+"11)" : c.flipped ? "linear-gradient(135deg,"+C.cyan+"22,"+C.purple+"11)" : "white",
                border: "2.5px solid "+(c.matched?C.green:c.flipped?C.cyan:"#D0C8F0"),
                borderRadius:18,
                cursor:c.matched?"default":"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,
                boxShadow: c.matched?"0 4px 14px "+C.green+"44":c.flipped?"0 4px 14px "+C.cyan+"33":"0 4px 12px rgba(91,79,232,0.1)",
                transition:"all 0.25s",
                padding:8,
                minHeight:90,
              }}>
                {c.flipped||c.matched ? (
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    <div style={{fontSize:10,color:c.matched?C.green:c.type==="q"?C.cyan:C.purple,fontWeight:900,letterSpacing:0.5}}>{c.type==="q"?"EQ":"ANS"}</div>
                    <div style={{fontFamily:"'Fredoka One',cursive",fontSize:c.type==="q"?16:26,color:c.matched?C.green:c.type==="q"?C.cyan:C.purple,textAlign:"center",lineHeight:1.1}}>{c.val}</div>
                  </div>
                ) : (
                  <div style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:"#C8C0E8"}}>?</div>
                )}
              </button>
            ))}
          </div>
        )}
        {!won && <div style={{textAlign:"center",color:C.dim,fontSize:11,marginTop:14,fontWeight:700}}>Tap two cards — match equation with its answer</div>}
      </div>
    </div>
  );
}

// ── Brain Blitz (Equation Balance) ──────────────────────────────
export function EquationBalance({ onBack, child }) {
  const genQ = (lvl) => {
    const ops = lvl<2?["+","-"]:lvl<4?["+","-","×"]:["+","-","×","÷"];
    const op = ops[Math.floor(Math.random()*ops.length)];
    let a,b,ans;
    if(op==="+"){a=Math.floor(Math.random()*20)+1;b=Math.floor(Math.random()*20)+1;ans=a+b;}
    else if(op==="-"){a=Math.floor(Math.random()*20)+10;b=Math.floor(Math.random()*a)+1;ans=a-b;}
    else if(op==="×"){a=Math.floor(Math.random()*10)+2;b=Math.floor(Math.random()*10)+2;ans=a*b;}
    else{b=Math.floor(Math.random()*9)+2;ans=Math.floor(Math.random()*10)+2;a=b*ans;}
    const wrong=[ans+1,ans-1,ans+2,ans-2,ans+b,ans-b].filter(x=>x>0&&x!==ans);
    const opts=[ans,...wrong.slice(0,3)].sort(()=>Math.random()-0.5);
    return {q:a+" "+op+" "+b+" = ?",ans,opts};
  };

  const [phase,   setPhase]   = useState("ready");
  const [q,       setQ]       = useState(null);
  const [score,   setScore]   = useState(0);
  const [streak,  setStreak]  = useState(0);
  const [wrong,   setWrong]   = useState(0);
  const [chosen,  setChosen]  = useState(null);
  const [timeLeft,setTimeLeft]= useState(60);
  const scoreRef = React.useRef(0);
  const lvlRef   = React.useRef(1);

  React.useEffect(()=>{
    if(phase!=="playing") return;
    if(timeLeft<=0){setPhase("over");return;}
    const t=setTimeout(()=>setTimeLeft(tl=>tl-1),1000);
    return ()=>clearTimeout(t);
  },[timeLeft,phase]);

  const start=()=>{ scoreRef.current=0; lvlRef.current=1; setScore(0); setStreak(0); setWrong(0); setTimeLeft(60); setChosen(null); setQ(genQ(1)); setPhase("playing"); };

  const answer=(opt)=>{
    if(!q||chosen!==null) return;
    setChosen(opt);
    if(opt===q.ans){
      SFX.correct();
      const ns=streak+1;
      const bonus=ns>=5?3:ns>=3?2:1;
      scoreRef.current+=10*bonus;
      lvlRef.current=Math.min(Math.ceil(scoreRef.current/50)+1,5);
      setScore(scoreRef.current); setStreak(ns);
      setTimeout(()=>{ setChosen(null); setQ(genQ(lvlRef.current)); },400);
    } else {
      SFX.wrong(); setStreak(0); setWrong(w=>w+1);
      setTimeout(()=>setChosen(null),400);
    }
  };

  if(phase==="ready") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",width:"100%",maxWidth:360}}>
        <div style={{fontSize:72,marginBottom:8}}>⚡</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:26,color:C.purple,marginBottom:16}}>Brain Blitz</div>
        <div style={{background:"white",border:"1.5px solid "+C.purple+"33",borderRadius:24,padding:"16px 20px",marginBottom:20,boxShadow:"0 8px 30px "+C.purple+"18"}}>
          <div style={{color:C.dim,fontSize:13,lineHeight:1.9,textAlign:"left"}}>
            ⚡ 60 seconds, answer as many as you can<br/>
            🔥 Build a streak for bonus points (×2, ×3)<br/>
            📈 Harder questions as your score grows
          </div>
        </div>
        <Btn color={C.purple} onClick={start}>⚡ Blitz Start!</Btn>
        <div style={{marginTop:12}}><Btn color={C.dim} style={{padding:"12px 24px"}} onClick={onBack}>← Back</Btn></div>
      </div>
    </div>
  );

  if(phase==="over") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",padding:24,position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",width:"100%",maxWidth:360}}>
        <div style={{fontSize:72,marginBottom:8}}>{score>=100?"🏆":score>=50?"🌟":"⚡"}</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,color:C.purple,marginBottom:16}}>Time's Up!</div>
        <div style={{background:"white",border:"1.5px solid "+C.purple+"33",borderRadius:24,padding:"20px",marginBottom:20,boxShadow:"0 8px 30px "+C.purple+"18",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:C.green}}>{score}</div><div style={{fontSize:10,color:C.dim,fontWeight:700}}>SCORE</div></div>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:C.cyan}}>{score/10|0}</div><div style={{fontSize:10,color:C.dim,fontWeight:700}}>CORRECT</div></div>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:C.red}}>{wrong}</div><div style={{fontSize:10,color:C.dim,fontWeight:700}}>WRONG</div></div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn color={C.dim} style={{flex:1}} onClick={onBack}>← Back</Btn>
          <Btn color={C.purple} style={{flex:1}} onClick={start}>↺ Play Again</Btn>
        </div>
      </div>
    </div>
  );

  const timerPct=(timeLeft/60)*100;
  const timerColor=timeLeft>20?C.green:timeLeft>10?C.yellow:C.red;
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",position:"relative"}}>
      <Starfield n={15}/>
      <div style={{position:"relative",zIndex:10,background:C.surface||"white",borderBottom:"1.5px solid "+C.purple+"25",padding:"10px 18px",boxShadow:"0 2px 12px "+C.purple+"15"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <button onClick={()=>setPhase("ready")} style={{background:"transparent",border:"1.5px solid "+C.dim+"44",borderRadius:12,padding:"5px 12px",color:C.dim,fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:800}}>✕ Quit</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.purple}}>⚡ Brain Blitz</div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:timerColor}}>{timeLeft}s</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <div style={{fontSize:13,color:C.green,fontWeight:800}}>✓ {scoreRef.current}</div>
          {streak>=3&&<div style={{fontSize:11,color:C.orange,fontWeight:900}}>🔥 ×{streak>=5?3:2} Combo!</div>}
          <div style={{fontSize:13,color:C.red,fontWeight:800}}>✗ {wrong}</div>
        </div>
        <div style={{background:C.purple+"22",borderRadius:8,height:8,overflow:"hidden"}}>
          <div style={{width:timerPct+"%",height:"100%",background:"linear-gradient(90deg,"+timerColor+","+C.purple+")",borderRadius:8,transition:"width 1s linear"}}/>
        </div>
      </div>
      <div style={{position:"relative",zIndex:2,padding:"20px 16px"}}>
        <Card color={C.purple} style={{textAlign:"center",padding:"26px 18px",marginBottom:16,
          animation:chosen===q.ans?"correctBounce 0.5s ease":chosen!==null&&chosen!==q.ans?"wrongWiggle 0.5s ease":"none",
          boxShadow:chosen===q.ans?"0 0 40px "+C.green+"50":chosen!==null&&chosen!==q.ans?"0 0 20px "+C.red+"44":"0 8px 30px "+C.purple+"28, inset 0 1px 0 rgba(255,255,255,0.8)",
        }}>
          {chosen!==null&&<div style={{fontSize:28,marginBottom:4,animation:"mmPop 0.3s ease"}}>{chosen===q.ans?"✅":"❌"}</div>}
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:34,color:textColor()}}>{q&&q.q}</div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {q&&q.opts.map((o,i)=>{
            const answered=chosen!==null;
            let bg="white",border="2px solid "+C.purple+"33",col=textColor();
            if(answered){if(o===q.ans){bg="#E8FFF4";border="2.5px solid #2ECC9A";col="#2ECC9A";}else if(o===chosen){bg="#FFF0F0";border="2.5px solid "+C.red;col=C.red;}}
            return(
              <button key={i} onClick={()=>answer(o)} style={{background:bg,border,borderRadius:18,padding:"18px 12px",fontSize:20,fontWeight:800,color:col,cursor:answered?"default":"pointer",transition:"all 0.2s",fontFamily:"'Nunito',sans-serif",position:"relative",overflow:"hidden"}}>
                {!answered&&<div style={{position:"absolute",top:0,left:0,right:0,height:"50%",background:"linear-gradient(180deg,rgba(255,255,255,0.5),transparent)",borderRadius:"18px 18px 0 0",pointerEvents:"none"}}/>}
                <div style={{fontSize:10,color:answered&&o===q.ans?"#2ECC9A":answered&&o===chosen?C.red:C.purple,fontWeight:900,marginBottom:3}}>{"ABCD"[i]}</div>
                {answered&&o===q.ans?"✓ ":answered&&o===chosen&&o!==q.ans?"✗ ":""}{o}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Sequence Builder ────────────────────────
export function SequenceBuilder({ onBack, child }) {
  const genSeq = (lvl) => {
    const types=["add","mul","fib","odd","even","square"];
    const type=types[Math.floor(Math.random()*Math.min(lvl+1,types.length))];
    let seq=[],step;
    if(type==="add"){step=Math.floor(Math.random()*5)+2;const s=Math.floor(Math.random()*5)+1;seq=Array.from({length:5},(_,i)=>s+i*step);}
    else if(type==="mul"){step=Math.floor(Math.random()*3)+2;const s=Math.floor(Math.random()*3)+1;seq=Array.from({length:5},(_,i)=>s*Math.pow(step,i));}
    else if(type==="fib"){const a=Math.floor(Math.random()*3)+1,b=a+1;seq=[a,b];while(seq.length<5)seq.push(seq[seq.length-1]+seq[seq.length-2]);}
    else if(type==="odd"){const s=Math.floor(Math.random()*8)*2+1;seq=Array.from({length:5},(_,i)=>s+i*2);}
    else if(type==="even"){const s=Math.floor(Math.random()*8)*2+2;seq=Array.from({length:5},(_,i)=>s+i*2);}
    else{const s=Math.floor(Math.random()*3)+1;seq=Array.from({length:5},(_,i)=>Math.pow(s+i,2));}
    seq=seq.slice(0,5);
    const missing=Math.floor(Math.random()*(seq.length-2))+1;
    const ans=seq[missing];
    const disp=seq.map((v,i)=>i===missing?"?":v);
    const diff=step||seq[1]-seq[0]||1;
    const wrongs=[ans+(diff||2),ans-(diff||2),ans*2,Math.max(1,ans-1)].filter(x=>x>0&&x!==ans);
    const opts=[ans,...wrongs.slice(0,3)].sort(()=>Math.random()-0.5);
    const hints={add:"Each number increases by "+diff,mul:"Each number is multiplied",fib:"Each number = sum of previous two",odd:"Odd numbers in order",even:"Even numbers in order",square:"Square numbers"};
    return {disp,ans,opts,type,missing,hint:hints[type]||"Find the pattern"};
  };

  const [score, setScore] = useState(0);
  const [q,     setQ]     = useState(()=>genSeq(1));
  const [flash, setFlash] = useState(null);
  const [total, setTotal] = useState(0);
  const [lvl,   setLvl]   = useState(1);
  const [showHint,setShowHint]=useState(false);

  const answer = (opt) => {
    setTotal(t=>t+1);
    if(opt===q.ans){
      SFX.correct(); setScore(s=>s+15); setFlash("right"); setShowHint(false);
      const nl=Math.ceil((score+15)/60)+1;
      setLvl(nl);
      setTimeout(()=>{setFlash(null);setQ(genSeq(nl));},700);
    } else {
      SFX.wrong(); setFlash("wrong");
      setTimeout(()=>setFlash(null),600);
    }
  };

  const typeLabel={add:"➕ Addition",mul:"× Multiply",fib:"🐚 Fibonacci",square:"² Squares",odd:"Odd Numbers",even:"Even Numbers"};

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,padding:"16px 14px"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <BackBtn onClick={onBack} color={C.green}/>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:17,color:C.green,letterSpacing:1}}>🔢 SEQUENCE</div>
          <div style={{background:C.yellow+"22",border:"1.5px solid "+C.yellow+"44",borderRadius:12,padding:"4px 10px",fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.yellow}}>⭐ {score}</div>
        </div>
        {/* Pattern type badge */}
        <div style={{textAlign:"center",marginBottom:12}}>
          <span style={{background:C.green+"22",border:"1.5px solid "+C.green+"44",borderRadius:20,padding:"5px 16px",fontFamily:"'Fredoka One',cursive",fontSize:13,color:C.green}}>{typeLabel[q.type]||"Pattern"} — find the missing number</span>
        </div>
        {/* Sequence tiles */}
        <div style={{background:C.card,border:"2px solid "+C.green+"33",borderRadius:22,padding:"22px 14px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6,flexWrap:"nowrap",overflowX:"auto"}}>
            {q.disp.map((v,i)=>(
              <div key={i} style={{
                minWidth:52,height:60,borderRadius:14,
                background:v==="?"?"linear-gradient(135deg,"+C.green+"44,"+C.green+"22)":"white",
                border:"2.5px solid "+(v==="?"?C.green:"#D0C8F0"),
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"'Fredoka One',cursive",
                fontSize:v==="?"?26:20,
                color:v==="?"?C.green:"#1A1040",
                fontWeight:800,
                boxShadow:v==="?"?"0 0 14px "+C.green+"44":"0 3px 8px rgba(91,79,232,0.1)",
                animation:v==="?"?"mmPulse 1.5s ease-in-out infinite":"none",
                flexShrink:0,
              }}>{v}</div>
            ))}
          </div>
          {flash&&<div style={{textAlign:"center",fontSize:32,marginTop:14,animation:"mmPop 0.3s ease"}}>{flash==="right"?"✅":"❌"}</div>}
        </div>
        {/* Hint toggle */}
        <div style={{textAlign:"center",marginBottom:14}}>
          <button onClick={()=>setShowHint(h=>!h)} style={{background:"none",border:"none",color:C.dim,fontSize:11,cursor:"pointer",fontWeight:700,padding:"4px 8px",textDecoration:"underline"}}>
            {showHint?"💡 "+q.hint:"💡 Show hint"}
          </button>
        </div>
        {/* Options */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {q.opts.map((o,i)=>(
            <button key={i} onClick={()=>answer(o)} style={{
              background:"white",
              border:"2.5px solid "+C.green+"44",
              borderRadius:18,
              padding:"20px 12px",
              fontFamily:"'Fredoka One',cursive",
              fontSize:28,
              color:"#1A1040",
              cursor:"pointer",
              textAlign:"center",
              boxShadow:"0 4px 14px rgba(34,197,94,0.12)",
              transition:"transform 0.1s",
            }}
              onTouchStart={e=>e.currentTarget.style.transform="scale(0.96)"}
              onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}
            >{o}</button>
          ))}
        </div>
        <div style={{textAlign:"center",color:C.dim,fontSize:11,marginTop:14,fontWeight:700}}>Answered: {total} · Level: {lvl}</div>
      </div>
    </div>
  );
}


const GAME_LIST = [
  {id:"rocket",  icon:"🚀", title:"Number Rocket",  desc:"Answer before fuel runs out!", color:"#f97316", component: NumberRocket},
  {id:"catcher", icon:"☄️", title:"Meteor Blaster",  desc:"Blast wrong answers, save the planet!", color:"#FF6B6B", component: StarCatcher},
  {id:"maze",    icon:"🌀", title:"Math Maze",       desc:"Solve puzzles to move forward!",color:"#22c55e", component: MathMaze},
  {id:"speed",   icon:"⚡", title:"Speed Math",      desc:"60 seconds — go as fast as you can!", color:"#a855f7", component: SpeedMath},
  {id:"memory",  icon:"🧠", title:"Number Memory",    desc:"Remember the number sequence!",    color:"#ec4899", component: NumberMemory},
  {id:"cardflip",icon:"🃏", title:"Math Card Flip",   desc:"Match equations with answers!",     color:"#06b6d4", component: MathCardFlip},
  {id:"balance", icon:"⚖️", title:"Equation Balance", desc:"Pick the right answer fast!",        color:"#f97316", component: EquationBalance},
  {id:"sequence",icon:"🔢", title:"Sequence Builder",  desc:"Find the missing number pattern!",   color:"#22c55e", component: SequenceBuilder},
];

export function GamesHub({ child, onBack }) {
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame) {
    const GameComp = GAME_LIST.find(g=>g.id===activeGame)?.component;
    if (GameComp) return <GameComp onBack={()=>setActiveGame(null)} child={child}/>;
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),position:"relative"}}>
      <Starfield n={30}/>
      <div style={{position:"relative",zIndex:2,background:"linear-gradient(135deg,#4BBDF520,#5B4FE810)",borderBottom:"1.5px solid #4BBDF520",padding:"16px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <BackBtn onClick={onBack} color="#4BBDF5"/>
          <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#4BBDF5,#5B4FE8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🎮</div>
          <div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#4BBDF5",letterSpacing:2}}>GAMES HUB</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#1A1040"}}>Play & Earn XP</div>
            <div style={{fontSize:11,color:"#9890C4"}}>8 mini-games</div>
          </div>
        </div>
      </div>
      <div style={{position:"relative",zIndex:2,padding:"16px 18px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {GAME_LIST.map(g=>(
            <button key={g.id} onClick={()=>setActiveGame(g.id)} style={{
              background:"white",
              border:`1.5px solid ${g.color}25`, borderRadius:20, padding:"16px 16px",
              cursor:"pointer", display:"flex", alignItems:"center", gap:14,
              boxShadow:`0 4px 16px ${g.color}22, 0 2px 6px ${g.color}14`, textAlign:"left",
              position:"relative", overflow:"hidden",
            }}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:`linear-gradient(180deg,${g.color},${g.color}66)`,borderRadius:"20px 0 0 20px"}}/>
              <div style={{width:52,height:52,borderRadius:14,background:`${g.color}18`,border:`1.5px solid ${g.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{g.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:900,color:"#1A1040",marginBottom:3}}>{g.title}</div>
                <div style={{fontSize:12,color:"#9890C4",fontWeight:600}}>{g.desc}</div>
              </div>
              <div style={{width:32,height:32,borderRadius:999,background:`${g.color}15`,border:`1.5px solid ${g.color}30`,display:"flex",alignItems:"center",justifyContent:"center",color:g.color,fontSize:16}}>›</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
// ══════════════════════════════════════════════════════════════════
// SHOP, BADGES, CHARACTER & BADGE TOAST SCREENS
// ══════════════════════════════════════════════════════════════════