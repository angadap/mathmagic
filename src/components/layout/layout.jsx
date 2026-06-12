// src/components/layout/layout.jsx — GlobalStyles, Starfield, MuteBtn, Mascot, Confetti, Tutorial, Skeleton, OfflineBanner
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, isDark } from '../../constants/themes.js';
import { SFX } from '../../lib/sfx.js';

export function GlobalStyles() {
  useEffect(() => {
    // fonts
    if (!document.getElementById("mm-fonts")) {
      const l = document.createElement("link");
      l.id = "mm-fonts";
      l.href = "https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&family=Orbitron:wght@700;900&family=Baloo+2:wght@500;600;700;800&display=swap";
      l.rel = "stylesheet";
      document.head.appendChild(l);
    }
    // keyframes
    if (!document.getElementById("mm-styles")) {
      const s = document.createElement("style");
      s.id = "mm-styles";
      s.textContent = `
        :root{--gold:${C.yellow};--teal:${C.cyan};--violet:${C.purple};--rose:${C.pink};--lime:${C.green};--bg:${C.bg};--card:${C.card};--navyL:${C.card2};--border:${C.border};--ink:${C.text};--ink2:${C.text2};--ink3:${C.dim}}
        @keyframes twinkle{0%,100%{opacity:.1}50%{opacity:.9}}
        @keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulseG{0%,100%{box-shadow:0 0 10px ${C.purple}55}50%{box-shadow:0 0 28px ${C.purple}cc}}
        @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{0%{transform:scale(0.7);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        @keyframes shakeX{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
        @keyframes correctFlash{0%{background:transparent}30%{background:${C.green}33}100%{background:transparent}}
        @keyframes wrongShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-10px)}40%,80%{transform:translateX(10px)}}
        @keyframes coinBounce{0%{transform:translateY(0)scale(1)}40%{transform:translateY(-20px)scale(1.3)}100%{transform:translateY(0)scale(1)opacity(0)}}
        @keyframes starPop{0%{transform:scale(0)rotate(-30deg)}60%{transform:scale(1.3)rotate(5deg)}100%{transform:scale(1)rotate(0deg)}}
        @keyframes xpRise{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-40px);opacity:0}}
        @keyframes ripple{0%{transform:scale(0.8);opacity:1}100%{transform:scale(2);opacity:0}}
        @keyframes glow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.4)}}
        @keyframes loadBar{from{width:0}to{width:100%}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes correctBounce{0%{transform:scale(1)}20%{transform:scale(1.18) rotate(-3deg)}40%{transform:scale(1.12) rotate(2deg)}60%{transform:scale(1.06)}100%{transform:scale(1)}}
        @keyframes wrongWiggle{0%,100%{transform:rotate(0deg)}20%{transform:rotate(-8deg)}40%{transform:rotate(8deg)}60%{transform:rotate(-5deg)}80%{transform:rotate(5deg)}}
        @keyframes starBurst{0%{opacity:1;transform:scale(0) translate(0,0)}100%{opacity:0;transform:scale(1.5) translate(var(--dx),var(--dy))}}
        @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
        @keyframes superCorrect{0%{transform:scale(1);filter:brightness(1)}30%{transform:scale(1.25);filter:brightness(1.6)}60%{transform:scale(1.1);filter:brightness(1.3)}100%{transform:scale(1);filter:brightness(1)}}
        @keyframes floatEmoji{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-80px) scale(1.5);opacity:0}}
        @keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.3)}28%{transform:scale(1)}42%{transform:scale(1.2)}70%{transform:scale(1)}}
        @keyframes rainbowBg{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes spinR{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes bFloat{0%,100%{transform:translateY(0)scale(1)}50%{transform:translateY(-10px)scale(1.05)}}
        @keyframes bossW{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
        @keyframes goldPulse{0%,100%{box-shadow:inset 0 1.5px 0 rgba(255,230,100,.25),0 4px 0 rgba(0,0,0,.5),0 8px 28px rgba(255,184,0,.18)}50%{box-shadow:inset 0 1.5px 0 rgba(255,230,100,.35),0 4px 0 rgba(0,0,0,.5),0 8px 44px rgba(255,184,0,.55),0 0 60px rgba(255,184,0,.18)}}
        @keyframes levitate{0%,100%{transform:translateY(0) rotate(-.5deg)}50%{transform:translateY(-12px) rotate(.5deg)}}
        @keyframes xpFlow{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fireFlick{0%,100%{transform:scaleY(1) scaleX(1)}30%{transform:scaleY(1.12) scaleX(.92)}65%{transform:scaleY(.92) scaleX(1.06)}}
        @keyframes starSpin{0%{transform:rotate(0) scale(1)}50%{transform:rotate(180deg) scale(1.3)}100%{transform:rotate(360deg) scale(1)}}
        @keyframes nebulaDrift{0%{transform:translate(0,0) rotate(0)}33%{transform:translate(18px,-12px) rotate(120deg)}66%{transform:translate(-12px,18px) rotate(240deg)}100%{transform:translate(0,0) rotate(360deg)}}
        @keyframes pinPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1);box-shadow:0 0 0 5px rgba(255,184,0,.2)}}
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        body{background:#FAFBFF;color:#1A1040}
        body,*{font-family:'Nunito','Baloo 2',sans-serif;}
        input,textarea,select{font-family:'Nunito','Baloo 2',sans-serif;outline:none;color:#1A1040;background:transparent}
        input::placeholder,textarea::placeholder{color:#9890C4}
        select option{background:#FFFFFF;color:#1A1040}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:${C.cyan};border-radius:4px}
        .mm-btn-press:active{transform:translateY(4px) scale(.92)!important;transition:transform 0.07s,box-shadow 0.07s!important}
        .mm-haptic:active{transform:scale(0.97)}
        .mm-card{position:relative;overflow:hidden;transition:transform .22s cubic-bezier(.34,1.4,.64,1)}
        .mm-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);pointer-events:none;z-index:1}
        .mm-card:active{transform:scale(.97) translateY(2px)!important}
        .mm-card-gold{background:linear-gradient(160deg,rgba(255,184,0,.18),rgba(255,184,0,.04))!important;border-color:rgba(255,184,0,.3)!important;box-shadow:inset 0 1.5px 0 rgba(255,230,100,.25),inset 0 -1px 0 rgba(0,0,0,.25),0 4px 0 rgba(0,0,0,.5),0 8px 28px rgba(255,184,0,.2)!important}
        .mm-card-teal{background:linear-gradient(160deg,rgba(0,197,181,.16),rgba(0,197,181,.04))!important;border-color:rgba(0,197,181,.3)!important;box-shadow:inset 0 1.5px 0 rgba(100,255,240,.2),inset 0 -1px 0 rgba(0,0,0,.25),0 4px 0 rgba(0,0,0,.5),0 8px 28px rgba(0,197,181,.18)!important}
        .mm-card-violet{background:linear-gradient(160deg,rgba(155,111,255,.18),rgba(155,111,255,.04))!important;border-color:rgba(155,111,255,.3)!important;box-shadow:inset 0 1.5px 0 rgba(200,180,255,.2),inset 0 -1px 0 rgba(0,0,0,.25),0 4px 0 rgba(0,0,0,.5),0 8px 28px rgba(155,111,255,.18)!important}
        .mm-card-rose{background:linear-gradient(160deg,rgba(255,107,138,.16),rgba(255,107,138,.04))!important;border-color:rgba(255,107,138,.3)!important;box-shadow:inset 0 1.5px 0 rgba(255,180,200,.2),inset 0 -1px 0 rgba(0,0,0,.25),0 4px 0 rgba(0,0,0,.5),0 8px 28px rgba(255,107,138,.18)!important}
        .mm-card-lime{background:linear-gradient(160deg,rgba(77,221,136,.14),rgba(77,221,136,.04))!important;border-color:rgba(77,221,136,.28)!important;box-shadow:inset 0 1.5px 0 rgba(150,255,200,.2),inset 0 -1px 0 rgba(0,0,0,.25),0 4px 0 rgba(0,0,0,.5),0 8px 28px rgba(77,221,136,.15)!important}
        .mm-gold-pulse{animation:goldPulse 3s ease-in-out infinite}
        .mm-levitate{animation:levitate 4s ease-in-out infinite}
        .mm-star-spin{animation:starSpin 5s linear infinite}
        .mm-fire-flick{animation:fireFlick .8s ease-in-out infinite}
        @keyframes mmFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes mmPop{0%{transform:scale(0.85);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
        @keyframes mmSlideUp{from{transform:translateY(22px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes mmShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes mmBounce{0%,100%{transform:scale(1)}40%{transform:scale(1.15)}70%{transform:scale(0.94)}}
        @keyframes mmStarPop{0%{transform:scale(0) rotate(-30deg)}60%{transform:scale(1.3) rotate(5deg)}100%{transform:scale(1) rotate(0)}}
        @keyframes mmConfetti{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(120px) rotate(540deg);opacity:0}}
        @keyframes mmWave{0%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}}
        @keyframes mmBsShimmer{0%{transform:translateX(-130%) skewX(-18deg);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateX(320%) skewX(-18deg);opacity:0}}
        @keyframes mmPulse{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes fabSubIn{0%{opacity:0;transform:scale(0.5) translateY(12px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        .mm-press:active{transform:translateY(3px)!important;}
        .mm-btn:active{transform:translateY(4px)!important;box-shadow:none!important;}
      `;
      document.head.appendChild(s);
    }
  }, []);
  return null;
}

// ─────────────────────────────────────────────────────────────────────
export function MuteBtn() {
  const [muted, setMuted] = React.useState(SFX.muted);
  return (
    <button
      onClick={() => { setMuted(SFX.toggleMute()); }}
      title={muted ? "Unmute" : "Mute"}
      style={{ background:"none", border:"none", cursor:"pointer", fontSize:18,
               color: muted ? "#9890C4" : "#4BBDF5", padding:"4px 6px", lineHeight:1,
               transition:"color 0.2s" }}>
      {muted ? "🔇" : "🔊"}
    </button>
  );
}

// ── Mascot ────────────────────────────────────────────────────────
export function Mascot({ message, mood="happy" }) {
  const faces = { happy:"🚀", thinking:"🤔", celebrate:"🎉", sleep:"😴", cheer:"⭐" };
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,background:"white",border:"1.5px solid #4BBDF533",borderRadius:16,padding:"10px 14px",marginBottom:12,boxShadow:"0 4px 14px #5B4FE818"}}>
      <div style={{fontSize:32,animation:"mmFloat 2s ease-in-out infinite",flexShrink:0}}>{faces[mood]||faces.happy}</div>
      <div style={{background:"#F0ECFF",borderRadius:12,padding:"8px 12px",flex:1,position:"relative"}}>
        <div style={{fontSize:13,color:"#1A1040",lineHeight:1.5}}>{message}</div>
        <div style={{position:"absolute",left:-8,top:"50%",transform:"translateY(-50%)",width:0,height:0,borderTop:"6px solid transparent",borderBottom:"6px solid transparent",borderRight:"8px solid #F0ECFF"}}/>
      </div>
    </div>
  );
}


// ── Certificate ───────────────────────────────────────────────────
export function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({length:40},(_,i)=>({
    x: Math.random()*100, delay: Math.random()*1.5,
    color: ["#FFC847","#4BBDF5","#2ECC9A","#FF5FA0","#FF6B6B","#9B59F5"][i%6],
    size: Math.random()*8+4, rot: Math.random()*360,
  }));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:998,overflow:"hidden"}}>
      {pieces.map((p,i)=>(
        <div key={i} style={{position:"absolute",left:`${p.x}%`,top:"-20px",width:p.size,height:p.size,background:p.color,borderRadius:Math.random()>0.5?"50%":"2px",animation:`coinBounce 1.5s ${p.delay}s ease-in forwards`,transform:`rotate(${p.rot}deg)`}}/>
      ))}
    </div>
  );
}
// ── Tutorial (first-time) ────────────────────────────────────────
export function Tutorial({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon:"🚀", title:"Welcome to MathMagic!", body:"Your personal space academy for maths. Complete lessons, earn XP and unlock new worlds!", color:"#FFC847" },
    { icon:"📚", title:"How Lessons Work",       body:"Each lesson has 20 sets of questions. Complete Set 1 to unlock Set 2, and so on. Answer correctly to earn stars and XP!", color:"#4BBDF5" },
    { icon:"🎮", title:"Play Games",             body:"Visit the Games Hub to play 8 fun maths games. The more you play, the more coins you earn!", color:"#9B59F5" },
    { icon:"🏆", title:"Daily Challenges",       body:"A new Word Problem and Brain Puzzle every day! Solve both to earn bonus XP and keep your streak going!", color:"#FF6B6B" },
    { icon:"🎯", title:"You're Ready!",          body:"Tap Start to begin your maths adventure. Remember — practice every day to climb the leaderboard!", color:"#2ECC9A" },
  ];
  const s = steps[step];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:"white",borderRadius:28,padding:"32px 24px",maxWidth:380,width:"100%",textAlign:"center",border:`2px solid ${s.color}44`,animation:"mmPop 0.3s ease",boxShadow:`0 8px 40px ${s.color}20, inset 0 1px 0 rgba(255,255,255,0.8)`}}>
        <div style={{fontSize:64,marginBottom:16,animation:"mmFloat 2s ease-in-out infinite"}}>{s.icon}</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:s.color,marginBottom:12}}>{s.title}</div>
        <div style={{color:"#9890C4",fontSize:14,lineHeight:1.7,marginBottom:24,fontFamily:"'Nunito',sans-serif"}}>{s.body}</div>
        <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:20}}>
          {steps.map((_,i)=><div key={i} style={{width:i===step?24:8,height:8,borderRadius:4,background:i===step?s.color:"#9890C444",transition:"all 0.3s"}}/>)}
        </div>
        <div style={{display:"flex",gap:10}}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,background:"none",border:"1px solid #9890C444",borderRadius:12,padding:"12px",color:"#9890C4",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>← BACK</button>}
          <button onClick={()=>step<steps.length-1?setStep(s=>s+1):onDone()} style={{flex:1,background:`linear-gradient(155deg,${s.color}EE,${s.color}CC)`,border:"none",borderRadius:16,padding:"12px",color:"white",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:900,boxShadow:`0 4px 0 ${s.color}CC, 0 6px 16px ${s.color}35`}}>
            {step<steps.length-1?"NEXT →":"🚀 START!"}
          </button>
        </div>
      </div>
    </div>
  );
}
// ── Skeleton Loader ──────────────────────────────────────────────
export function SkeletonLoader({ rows=4 }) {
  return (
    <div style={{padding:"16px 0"}}>
      <div style={{background:"#F0ECFF",borderRadius:12,height:60,marginBottom:16,animation:"mmPulse 1.5s ease-in-out infinite"}}/>
      {Array.from({length:rows},(_,i)=>(
        <div key={i} style={{background:"#F0ECFF",borderRadius:10,height:44,marginBottom:8,opacity:1-i*0.15,animation:"mmPulse 1.5s ease-in-out infinite"}}/>
      ))}
    </div>
  );
}
// ── Offline Banner ───────────────────────────────────────────────
export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    document.addEventListener("mm_online",  on);
    document.addEventListener("mm_offline", off);
    return () => { document.removeEventListener("mm_online",on); document.removeEventListener("mm_offline",off); };
  }, []);
  if (!offline) return null;
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,background:"#FF6B6B",color:"white",textAlign:"center",padding:"6px 12px",fontSize:12,fontFamily:"'Nunito',sans-serif",fontWeight:800,letterSpacing:1}}>
      📡 NO CONNECTION — App works offline, progress saves when back online
    </div>
  );
}


export function Starfield({ n = 40 }) {
  const pts = useRef(
    Array.from({ length: n }, (_, i) => ({
      i, x: Math.random() * 100, y: Math.random() * 100,
      w: 1 + Math.random() * 2, d: 2 + Math.random() * 3, dl: Math.random() * 4,
    }))
  ).current;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      {pts.map(p => (
        <div key={p.i} style={{
          position:"absolute", left:`${p.x}%`, top:`${p.y}%`,
          width:p.w, height:p.w, borderRadius:"50%",
          background: `rgba(${100+Math.floor(p.x*1.5)},${80+Math.floor(p.y)},220,0.25)`,
          animation:`twinkle ${p.d}s ${p.dl}s ease-in-out infinite`,
        }}/>
      ))}
    </div>
  );
}