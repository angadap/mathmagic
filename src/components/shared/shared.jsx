// src/components/shared/shared.jsx — Certificate, ProgressGrid, ProgressMap, SOSButton, FreezeDetector, BadgeUnlockToast
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, isDark } from '../../constants/themes.js';
import { BADGES } from '../../constants/gameData.js';
import { Btn } from '../ui/primitives.jsx';

export function Certificate({ child, lesson, stars, onClose }) {
  const canvasRef = useRef(null);
  useEffect(()=>{
    const cv = canvasRef.current; if(!cv) return;
    const ctx = cv.getContext("2d");
    const w=600, h=400;
    cv.width=w; cv.height=h;
    // Background
    ctx.fillStyle=C.bg; ctx.fillRect(0,0,w,h);
    // Border
    ctx.strokeStyle="#fbbf24"; ctx.lineWidth=6;
    ctx.strokeRect(12,12,w-24,h-24);
    ctx.strokeStyle="#a78bfa"; ctx.lineWidth=2;
    ctx.strokeRect(20,20,w-40,h-40);
    // Stars
    const starX=[80,300,520], sy=60;
    starX.forEach(x=>{ ctx.font="28px serif"; ctx.fillText("⭐",x-14,sy+10); });
    // Title
    ctx.font="bold 22px 'Arial'"; ctx.fillStyle="#fbbf24"; ctx.textAlign="center";
    ctx.fillText("CERTIFICATE OF ACHIEVEMENT",w/2,100);
    // Body
    ctx.font="16px 'Arial'"; ctx.fillStyle="#ccc";
    ctx.fillText("This is to certify that",w/2,145);
    ctx.font="bold 28px 'Arial'"; ctx.fillStyle="#ffffff";
    ctx.fillText(child?.name||"Student",w/2,185);
    ctx.font="15px 'Arial'"; ctx.fillStyle="#a78bfa";
    ctx.fillText(`has successfully completed`,w/2,220);
    ctx.font="bold 18px 'Arial'"; ctx.fillStyle="#06b6d4";
    ctx.fillText(`${lesson?.emoji||"📚"} ${lesson?.title||"Lesson"}`,w/2,250);
    ctx.font="13px 'Arial'"; ctx.fillStyle="#fbbf24";
    ctx.fillText(`Stars Earned: ${"⭐".repeat(stars||1)}  |  Date: ${new Date().toLocaleDateString("en-IN")}`,w/2,295);
    ctx.font="11px 'Arial'"; ctx.fillStyle="#6b7db3";
    ctx.fillText("MathMagic Space Academy",w/2,360);
  },[child,lesson,stars]);

  const download = () => {
    const a = document.createElement("a");
    a.download = `MathMagic_Certificate_${child?.name||"student"}.png`;
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <canvas ref={canvasRef} style={{maxWidth:"100%",borderRadius:12,boxShadow:`0 0 40px ${C.yellow}66`,marginBottom:16}}/>
      <div style={{display:"flex",gap:12}}>
        <Btn color={C.yellow} onClick={download}>⬇️ DOWNLOAD</Btn>
        <button onClick={onClose} style={{background:"none",border:`1px solid ${C.dim}44`,borderRadius:12,padding:"12px 20px",color:C.dim,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>CLOSE</button>
      </div>
    </div>
  );
}
// ── Difficulty Auto-Adjust ────────────────────────────────────────
export function ProgressGrid({ lessons, progress }) {
  const [open, setOpen] = useState(false); // collapsed by default
  if (!lessons?.length) return null;
  const setsDone = (lid) => Array.from({length:20},(_,i)=>i)
    .filter(i=>progress.some(p=>p.lesson_id===`${lid}_s${i}`&&(p.stars_earned||0)>=1)).length;
  const total    = lessons.reduce((s,l)=>s+setsDone(l.id),0);
  const max      = lessons.length*20;
  const totalPct = max>0?Math.round(total/max*100):0;
  const COLORS   = [C.purple,C.cyan,C.green,C.orange,C.pink,C.yellow,C.red,"#06b6d4","#8b5cf6","#f43f5e"];

  return (
    <div style={{borderRadius:22,overflow:"hidden",boxShadow:`0 4px 20px ${C.purple}18`,border:`1.5px solid ${C.purple}33`}}>
      {/* Header — always visible */}
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",cursor:"pointer",background:isDark()?`linear-gradient(135deg,${C.purple}28,${C.cyan}14)`:`linear-gradient(135deg,#7c6fe022,#a855f714)`}}>
        {/* Donut chart */}
        <div style={{position:"relative",flexShrink:0}}>
          <svg width="56" height="56" style={{transform:"rotate(-90deg)"}}>
            <circle cx="28" cy="28" r="22" fill="none" stroke={isDark()?"rgba(255,255,255,0.07)":C.border||"#ece8ff"} strokeWidth="5"/>
            <circle cx="28" cy="28" r="22" fill="none" stroke={`url(#pg_grad)`} strokeWidth="5"
              strokeDasharray={`${2*Math.PI*22*totalPct/100} ${2*Math.PI*22}`} strokeLinecap="round"
              style={{transition:"stroke-dasharray 1.2s ease"}}/>
            <defs>
              <linearGradient id="pg_grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={C.cyan}/>
                <stop offset="100%" stopColor={C.purple}/>
              </linearGradient>
            </defs>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:C.cyan}}>{totalPct}%</div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:textColor()}}>Lesson Progress</div>
          <div style={{fontSize:12,color:C.dim,marginTop:2}}>{total} of {max} sets done</div>
          {/* Mini lesson dots */}
          <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
            {lessons.map((l,i)=>{
              const d=setsDone(l.id), p=Math.round(d/20*100);
              const col=COLORS[i%COLORS.length];
              return <div key={l.id} title={`${l.title}: ${p}%`} style={{width:20,height:6,borderRadius:3,background:p===100?col:p>0?`${col}88`:isDark()?"rgba(255,255,255,0.1)":C.border||"#ddd",transition:"background 0.4s"}}/>;
            })}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{background:open?C.purple:"transparent",border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"5px 12px",fontSize:13,fontWeight:800,color:open?"white":C.purple,transition:"all 0.2s"}}>{open?"▲":"▼"}</div>
        </div>
      </div>

      {/* Collapsed summary bar */}
      <div style={{padding:"0 18px 4px",background:C.card}}>
        <div style={{background:isDark()?"rgba(255,255,255,0.07)":C.border||"#ece8ff",borderRadius:20,height:8,overflow:"hidden"}}>
          <div style={{width:`${totalPct}%`,height:"100%",background:`linear-gradient(90deg,${C.cyan},${C.purple})`,borderRadius:20,transition:"width 1.2s ease",boxShadow:`0 0 8px ${C.cyan}55`}}/>
        </div>
      </div>

      {/* Expanded — horizontal scrolling cards */}
      {open && (
        <div style={{background:C.card,padding:"14px 0 18px"}}>
          <div style={{overflowX:"auto",paddingBottom:8}}>
            <div style={{display:"flex",gap:12,padding:"0 18px",minWidth:"max-content"}}>
              {lessons.map((l,i)=>{
                const done=setsDone(l.id), pct=Math.round(done/20*100);
                const col=COLORS[i%COLORS.length];
                const complete=done===20, started=done>0;
                return (
                  <div key={l.id} style={{
                    background:complete?`linear-gradient(145deg,${col}22,${col}0a)`:started?`${col}10`:isDark()?"rgba(255,255,255,0.03)":C.border||"#f5f0ff",
                    border:`2px solid ${complete?col+"66":started?col+"33":isDark()?"rgba(255,255,255,0.08)":C.border||"#ddd"}`,
                    borderRadius:20, padding:"14px 12px", width:130, flexShrink:0,
                    boxShadow:complete?`0 4px 16px ${col}33`:"none",
                  }}>
                    {/* Top: emoji + % */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div style={{fontSize:26}}>{complete?"⭐":started?l.emoji:"🔒"}</div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:18,fontWeight:900,color:complete?col:started?col:C.dim}}>{pct}%</div>
                        {complete&&<div style={{fontSize:9,color:col,fontWeight:800}}>DONE!</div>}
                      </div>
                    </div>
                    {/* Lesson name */}
                    <div style={{fontSize:12,fontWeight:900,color:textColor(),marginBottom:4,lineHeight:1.3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>L{i+1}: {l.title}</div>
                    <div style={{fontSize:10,color:C.dim,marginBottom:8}}>{done}/20 sets</div>
                    {/* Arc progress bar */}
                    <div style={{background:isDark()?"rgba(255,255,255,0.07)":C.border||"#ece8ff",borderRadius:20,height:6,overflow:"hidden"}}>
                      <div style={{width:`${pct}%`,height:"100%",background:complete?`linear-gradient(90deg,${col},${col}aa)`:`linear-gradient(90deg,${col},${col}88)`,borderRadius:20,transition:"width 0.8s ease",boxShadow:started?`0 0 6px ${col}66`:"none"}}/>
                    </div>
                    {/* 20 dot grid */}
                    <div style={{display:"flex",gap:2,flexWrap:"wrap",marginTop:8}}>
                      {Array.from({length:20},(_,si)=>{
                        const s=progress.find(p=>p.lesson_id===`${l.id}_s${si}`)?.stars_earned||0;
                        const done2=progress.some(p=>p.lesson_id===`${l.id}_s${si}`&&(p.stars_earned||0)>=1);
                        return <div key={si} style={{width:8,height:8,borderRadius:2,background:done2?(s>=3?C.yellow:s>=2?C.green:col):isDark()?"rgba(255,255,255,0.08)":C.border||"#ddd",flexShrink:0}}/>;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Legend */}
          <div style={{display:"flex",gap:14,padding:"8px 18px 0",fontSize:10,color:C.dim}}>
            <span>🟡 3★</span><span>🟢 2★</span><span>🔵 1★ done</span><span style={{opacity:0.5}}>⬜ not yet</span>
          </div>
        </div>
      )}
    </div>
  );
}
// ── ProgressMap ───────────────────────────────────────────────────
export function ProgressMap({ child, lessons, progress, world, onSelectSet }) {
  const completedSets = (lid) => Array.from({length:20},(_,i)=>i).filter(i=>progress.some(p=>p.lesson_id===`${lid}_s${i}`&&(p.stars_earned||0)>=1)).length;
  return (
    <div style={{overflowX:"auto",paddingBottom:8}}>
      <div style={{display:"flex",gap:12,minWidth:"max-content",padding:"4px 2px"}}>
        {lessons.slice(0,6).map((lesson,li)=>{
          const done = completedSets(lesson.id);
          const pct  = Math.round(done/20*100);
          return (
            <div key={lesson.id} style={{background:C.card,border:`1.5px solid ${pct===100?C.green:pct>0?world.color:C.dim+"33"}`,borderRadius:14,padding:"10px 12px",minWidth:90,textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:22,marginBottom:4}}>{pct===100?"⭐":pct>0?"📖":"🔒"}</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:pct===100?C.green:pct>0?world.color:C.dim,marginBottom:4}}>L{li+1}</div>
              <div style={{background:C.card2,borderRadius:6,height:6,overflow:"hidden",marginBottom:4}}>
                <div style={{width:`${pct}%`,height:"100%",background:pct===100?C.green:world.color,borderRadius:6,transition:"width 0.5s ease"}}/>
              </div>
              <div style={{color:C.dim,fontSize:9}}>{done}/20 sets</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export function SOSButton({ onClick }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    // Pulse every 30 seconds to remind user it exists
    const t = setInterval(() => { setPulse(true); setTimeout(() => setPulse(false), 1000); }, 30000);
    return () => clearInterval(t);
  }, []);
  return (
    <button onClick={onClick} style={{
      position:"fixed", bottom:72, right:16, zIndex:999,
      width:46, height:46, borderRadius:"50%",
      background: pulse ? `${C.red}` : `${C.red}cc`,
      border:`2px solid ${C.red}`,
      boxShadow: pulse ? `0 0 20px ${C.red}` : `0 0 10px ${C.red}66`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:20, cursor:"pointer",
      animation: pulse ? "pulseG 0.5s ease" : "none",
      transition:"all 0.3s",
    }}>🆘</button>
  );
}

export function BadgeUnlockToast({ badges, onDone }) {
  const [idx, setIdx] = useState(0);
  if (!badges?.length) return null;
  const badge = BADGES.find(b=>b.id===badges[idx]);
  if (!badge) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>{ if(idx<badges.length-1) setIdx(i=>i+1); else onDone(); }}>
      <div style={{background:C.card,border:`3px solid ${C.yellow}88`,borderRadius:28,padding:"32px 28px",textAlign:"center",maxWidth:320,width:"100%",animation:"popIn 0.4s ease",boxShadow:`0 0 60px ${C.yellow}44`}}>
        <div style={{fontSize:72,marginBottom:12,animation:"heartbeat 1s ease-in-out infinite"}}>{badge.icon}</div>
        <div style={{fontSize:13,color:C.yellow,fontWeight:900,letterSpacing:2,marginBottom:6}}>BADGE UNLOCKED!</div>
        <div style={{fontSize:24,fontWeight:900,color:textColor(),marginBottom:8}}>{badge.name}</div>
        <div style={{fontSize:14,color:C.dim,lineHeight:1.5,marginBottom:20}}>{badge.desc}</div>
        <div style={{background:`${C.yellow}22`,borderRadius:16,padding:"10px 16px",fontSize:12,color:C.yellow,fontWeight:700}}>
          {idx<badges.length-1 ? `Tap to see next (${idx+1}/${badges.length})` : "Tap to continue"}
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────
// ROOT APP

export function FreezeDetector({ currentScreen, child, onReport }) {
  const lastInteraction = useRef(Date.now());
  const [showPrompt, setShowPrompt] = useState(false);

  // Update on any user interaction
  useEffect(() => {
    const update = () => { lastInteraction.current = Date.now(); setShowPrompt(false); };
    window.addEventListener("touchstart", update);
    window.addEventListener("click", update);
    window.addEventListener("keydown", update);
    return () => {
      window.removeEventListener("touchstart", update);
      window.removeEventListener("click", update);
      window.removeEventListener("keydown", update);
    };
  }, []);

  // Check every 45 seconds — if no interaction for 60s on game/abacus screen, prompt
  useEffect(() => {
    const activeScreens = ["game", "abacus", "olympiad"];
    if (!activeScreens.includes(currentScreen)) return;
    const t = setInterval(() => {
      const idle = Date.now() - lastInteraction.current;
      if (idle > 60000) setShowPrompt(true);
    }, 45000);
    return () => clearInterval(t);
  }, [currentScreen]);

  if (!showPrompt) return null;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center",
      justifyContent:"center", padding:24,
    }}>
      <Card color={C.orange} style={{ maxWidth:300, width:"100%", textAlign:"center", padding:22, animation:"popIn 0.4s ease" }}>
        <div style={{ fontSize:44, marginBottom:10 }}>😴</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.orange, marginBottom:8 }}>IS THE APP STUCK?</div>
        <div style={{ color:C.dim, fontSize:12, lineHeight:1.6, marginBottom:18 }}>
          We noticed no activity for a while. Is the app not responding?
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn color={C.dim} style={{ flex:1, padding:"10px", fontSize:11 }} onClick={() => { lastInteraction.current = Date.now(); setShowPrompt(false); }}>
            ALL GOOD
          </Btn>
          <Btn color={C.orange} style={{ flex:1, padding:"10px", fontSize:11 }} onClick={() => { setShowPrompt(false); onReport("freeze"); }}>
            REPORT ISSUE
          </Btn>
        </div>
      </Card>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════
// GAMES SECTION — 5 Mini Games
// ═════════════════════════════════════════════════════════════════════

// ── Game 1: Number Rocket — tap correct answer before rocket launches ─
