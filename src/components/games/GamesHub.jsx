// src/components/games/GamesHub.jsx — MathCardFlip, EquationBalance, SequenceBuilder, GamesHub
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, BackBtn } from '../ui/primitives.jsx';


export function MathCardFlip({ onBack, child }) {
  const genCards = (lvl) => {
    const count = 4 + lvl * 2; // 6,8,10 pairs
    const pairs = [];
    for(let i=0;i<count;i++){
      const a=Math.floor(Math.random()*10)+1, b=Math.floor(Math.random()*10)+1;
      pairs.push({id:i*2,   type:"q", val:`${a}+${b}`, ans:a+b});
      pairs.push({id:i*2+1, type:"a", val:`${a+b}`,    ans:a+b});
    }
    return pairs.sort(()=>Math.random()-0.5).map((c,i)=>({...c,idx:i,flipped:false,matched:false}));
  };

  const [level,   setLevel]   = useState(1);
  const [cards,   setCards]   = useState(()=>genCards(1));
  const [flipped, setFlipped] = useState([]); // indices
  const [moves,   setMoves]   = useState(0);
  const [won,     setWon]     = useState(false);
  const [score,   setScore]   = useState(0);

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
        if(mc.every(c=>c.matched)){
          SFX.levelUp(); setWon(true);
        }
      } else {
        SFX.wrong();
        setTimeout(()=>{ setCards(c=>c.map((cd,i)=>nf.includes(i)?{...cd,flipped:false}:cd)); setFlipped([]); },800);
      }
    }
  };

  const nextLevel = () => { setLevel(l=>l+1); setCards(genCards(level+1)); setFlipped([]); setMoves(0); setWon(false); };

  const cols = level===1?4:level===2?4:5;
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,padding:"16px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <BackBtn onClick={onBack} color={C.cyan}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.cyan}}>MATH CARD FLIP</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.yellow}}>⭐{score} | L{level}</div>
        </div>
        {won ? (
          <div style={{textAlign:"center",padding:40}}>
            <div style={{fontSize:64,marginBottom:12}}>🎉</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,color:C.green,marginBottom:8}}>LEVEL {level} CLEARED!</div>
            <div style={{color:C.dim,fontSize:13,marginBottom:20}}>Moves: {moves} · Score: {score}</div>
            <Btn color={C.green} onClick={nextLevel}>NEXT LEVEL →</Btn>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:8}}>
            {cards.map((c,i)=>(
              <button key={c.id} onClick={()=>flip(i)} style={{
                aspectRatio:"1",background:c.matched?`${C.green}22`:c.flipped?C.card2:C.card,
                border:`2px solid ${c.matched?C.green:c.flipped?C.cyan:C.dim+"44"}`,
                borderRadius:12,cursor:c.matched?"default":"pointer",fontSize:c.flipped||c.matched?13:20,
                color:c.matched?C.green:c.flipped?"white":C.purple,fontWeight:800,
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all 0.2s",fontFamily:"'Orbitron',sans-serif",
              }}>{c.flipped||c.matched ? c.val : "?"}</button>
            ))}
          </div>
        )}
        <div style={{textAlign:"center",color:C.dim,fontSize:11,marginTop:12}}>Match equation with answer · Moves: {moves}</div>
      </div>
    </div>
  );
}

// ── Equation Balance ──────────────────────────────────────────────
export function EquationBalance({ onBack, child }) {
  const genQ = (lvl) => {
    const ops = lvl<2?["+","-"]:lvl<4?["+","-","×"]:["+","-","×","÷"];
    const op = ops[Math.floor(Math.random()*ops.length)];
    let a,b,ans;
    if(op==="+"){a=Math.floor(Math.random()*20)+1;b=Math.floor(Math.random()*20)+1;ans=a+b;}
    else if(op==="-"){a=Math.floor(Math.random()*20)+10;b=Math.floor(Math.random()*a)+1;ans=a-b;}
    else if(op==="×"){a=Math.floor(Math.random()*10)+2;b=Math.floor(Math.random()*10)+2;ans=a*b;}
    else{b=Math.floor(Math.random()*9)+2;ans=Math.floor(Math.random()*10)+2;a=b*ans;}
    const wrong = [ans+1,ans-1,ans+2,ans-2,ans+b,ans-b].filter(x=>x>0&&x!==ans);
    const opts = [ans,...wrong.slice(0,3)].sort(()=>Math.random()-0.5);
    return {q:`${a} ${op} ${b} = ?`, ans, opts};
  };

  const [level,  setLevel]  = useState(1);
  const [q,      setQ]      = useState(()=>genQ(1));
  const [score,  setScore]  = useState(0);
  const [streak, setStreak] = useState(0);
  const [shake,  setShake]  = useState(false);
  const [flash,  setFlash]  = useState(null); // "right"|"wrong"
  const [total,  setTotal]  = useState(0);

  const answer = (opt) => {
    setTotal(t=>t+1);
    if(opt===q.ans){
      SFX.correct(); setScore(s=>s+10+streak*2); setStreak(s=>s+1);
      setFlash("right");
      setTimeout(()=>{setFlash(null);setQ(genQ(Math.ceil(score/50)+1));},600);
    } else {
      SFX.wrong(); setStreak(0); setShake(true);
      setFlash("wrong");
      setTimeout(()=>{setShake(false);setFlash(null);},600);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,padding:"16px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <BackBtn onClick={onBack} color={C.orange}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.orange}}>EQUATION BALANCE</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.yellow}}>⭐{score}</div>
        </div>
        {streak>=3&&<div style={{textAlign:"center",color:C.orange,fontFamily:"'Orbitron',sans-serif",fontSize:11,marginBottom:8}}>🔥 STREAK x{streak}!</div>}
        <div style={{background:flash==="right"?`${C.green}22`:flash==="wrong"?`${C.red}22`:C.card,border:`2px solid ${flash==="right"?C.green:flash==="wrong"?C.red:C.orange+"44"}`,borderRadius:20,padding:"32px 16px",textAlign:"center",marginBottom:20,animation:shake?"shakeX 0.4s ease":"none",transition:"background 0.2s"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:28,color:textColor()}}>{q.q}</div>
          {flash&&<div style={{fontSize:20,marginTop:8}}>{flash==="right"?"✅":"❌"}</div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {q.opts.map((o,i)=>(
            <button key={i} onClick={()=>answer(o)} style={{background:C.card,border:`2px solid ${C.orange}44`,borderRadius:16,padding:"18px",fontFamily:"'Orbitron',sans-serif",fontSize:20,color:textColor(),cursor:"pointer",textAlign:"center"}}>
              {o}
            </button>
          ))}
        </div>
        <div style={{textAlign:"center",color:C.dim,fontSize:11,marginTop:14}}>Answered: {total} · Streak: {streak}</div>
      </div>
    </div>
  );
}

// ── Number Sequence Builder ───────────────────────────────────────
export function SequenceBuilder({ onBack, child }) {
  const genSeq = (lvl) => {
    const types = ["add","mul","fib","square","odd","even"];
    const type = types[Math.floor(Math.random()*Math.min(lvl+1,types.length))];
    let seq=[], step, missing;
    if(type==="add"){step=Math.floor(Math.random()*5)+2;const s=Math.floor(Math.random()*5)+1;seq=Array.from({length:6},(_,i)=>s+i*step);}
    else if(type==="mul"){step=Math.floor(Math.random()*4)+2;const s=Math.floor(Math.random()*3)+1;seq=Array.from({length:5},(_,i)=>s*Math.pow(step,i));}
    else if(type==="fib"){const a=Math.floor(Math.random()*3)+1,b=a+1;seq=[a,b];while(seq.length<6)seq.push(seq[seq.length-1]+seq[seq.length-2]);}
    else if(type==="square"){const s=Math.floor(Math.random()*3)+1;seq=Array.from({length:5},(_,i)=>Math.pow(s+i,2));}
    else if(type==="odd"){const s=Math.floor(Math.random()*10)*2+1;seq=Array.from({length:6},(_,i)=>s+i*2);}
    else{const s=Math.floor(Math.random()*10)*2+2;seq=Array.from({length:6},(_,i)=>s+i*2);}
    seq=seq.slice(0,6);
    missing=Math.floor(Math.random()*(seq.length-2))+1;
    const ans=seq[missing];
    const disp=seq.map((v,i)=>i===missing?"?":v);
    const wrongs=[ans+step||ans+1,ans-step||ans-1,ans*2,Math.floor(ans/2)].filter(x=>x>0&&x!==ans);
    const opts=[ans,...wrongs.slice(0,3)].sort(()=>Math.random()-0.5);
    return {disp,ans,opts,type,missing};
  };

  const [score, setScore]  = useState(0);
  const [q,     setQ]      = useState(()=>genSeq(1));
  const [flash, setFlash]  = useState(null);
  const [total, setTotal]  = useState(0);
  const [lvl,   setLvl]    = useState(1);

  const answer = (opt) => {
    setTotal(t=>t+1);
    if(opt===q.ans){
      SFX.correct(); setScore(s=>s+15); setFlash("right");
      const nl = Math.ceil((score+15)/60)+1;
      setLvl(nl);
      setTimeout(()=>{setFlash(null);setQ(genSeq(nl));},700);
    } else {
      SFX.wrong(); setFlash("wrong");
      setTimeout(()=>setFlash(null),600);
    }
  };

  const typeLabel = {add:"➕ Add",mul:"✖️ Multiply",fib:"🐚 Fibonacci",square:"² Square",odd:"Odd",even:"Even"};

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,padding:"16px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <BackBtn onClick={onBack} color={C.green}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.green}}>SEQUENCE BUILDER</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.yellow}}>⭐{score}</div>
        </div>
        <div style={{background:C.card,border:`2px solid ${C.green}44`,borderRadius:20,padding:"24px 16px",marginBottom:20}}>
          <div style={{color:C.dim,fontSize:11,textAlign:"center",marginBottom:12}}>{typeLabel[q.type]||"Pattern"} sequence — find the missing number</div>
          <div style={{display:"flex",justifyContent:"center",flexWrap:"wrap",gap:8}}>
            {q.disp.map((v,i)=>(
              <div key={i} style={{width:48,height:48,borderRadius:12,background:v==="?"?`${C.green}33`:C.card2,border:`2px solid ${v==="?"?C.green:C.dim+"44"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:v==="?"?22:14,color:v==="?"?C.green:"white",fontWeight:800}}>
                {v}
              </div>
            ))}
          </div>
          {flash&&<div style={{textAlign:"center",fontSize:24,marginTop:12}}>{flash==="right"?"✅":"❌"}</div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {q.opts.map((o,i)=>(
            <button key={i} onClick={()=>answer(o)} style={{background:C.card,border:`2px solid ${C.green}44`,borderRadius:16,padding:"18px",fontFamily:"'Orbitron',sans-serif",fontSize:18,color:textColor(),cursor:"pointer",textAlign:"center"}}>
              {o}
            </button>
          ))}
        </div>
        <div style={{textAlign:"center",color:C.dim,fontSize:11,marginTop:14}}>Answered: {total} · Level: {lvl}</div>
      </div>
    </div>
  );
}

const GAME_LIST = [
  {id:"rocket",  icon:"🚀", title:"Number Rocket",  desc:"Answer before fuel runs out!", color:"#f97316", component: NumberRocket},
  {id:"catcher", icon:"⭐", title:"Star Catcher",   desc:"Catch the right answers!",      color:"#fbbf24", component: StarCatcher},
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
      <div style={{position:"relative",zIndex:2,background:`linear-gradient(135deg,${C.cyan}22,${C.purple}0a)`,borderBottom:`3px solid ${C.cyan}44`,padding:"16px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <BackBtn onClick={onBack} color={C.cyan}/>
          <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${C.cyan},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🎮</div>
          <div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.cyan,letterSpacing:2}}>GAMES HUB</div>
            <div style={{fontSize:16,fontWeight:900,color:textColor()}}>Play & Earn XP</div>
            <div style={{fontSize:11,color:C.dim}}>8 mini-games</div>
          </div>
        </div>
      </div>
      <div style={{position:"relative",zIndex:2,padding:"16px 18px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {GAME_LIST.map(g=>(
            <button key={g.id} onClick={()=>setActiveGame(g.id)} style={{
              background:isDark()?`linear-gradient(135deg,${g.color}16,${g.color}08)`:C.card,
              border:`2px solid ${g.color}${isDark()?"44":"55"}`, borderRadius:20, padding:"18px 16px",
              cursor:"pointer", display:"flex", alignItems:"center", gap:14,
              boxShadow:`0 4px 18px ${g.color}${isDark()?"22":"18"}`, textAlign:"left",
            }}>
              <div style={{width:56,height:56,borderRadius:15,background:`${g.color}22`,border:`2px solid ${g.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{g.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:g.color,marginBottom:4}}>{g.title}</div>
                <div style={{fontSize:13,color:C.dim,fontWeight:600}}>{g.desc}</div>
              </div>
              <div style={{color:g.color,fontSize:22}}>›</div>
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

function ShopScreen({ child, setChild, onBack }) {
