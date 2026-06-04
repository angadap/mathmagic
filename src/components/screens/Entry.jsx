// src/components/screens/Entry.jsx — Splash, EntryScreen, StudentEntry
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, isDark } from '../../constants/themes.js';
import { SFX } from '../../lib/sfx.js';
import { db } from '../../lib/db.js';
import { Btn, BackBtn } from '../ui/primitives.jsx';
import { Starfield } from '../layout/layout.jsx';

export function Splash({ onDone }) {
  const [s, setS] = useState(0);
  useEffect(() => {
    setTimeout(() => SFX.splash(), 400);
    // Warm up Supabase connection during splash so first game open is instant
    db.getSb().catch(() => {});
    const t = [
      setTimeout(() => setS(1), 300),
      setTimeout(() => setS(2), 1000),
      setTimeout(() => setS(3), 1700),
      setTimeout(() => onDone(), 2800),
    ];
    return () => t.forEach(clearTimeout);
  }, []);
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      <Starfield n={80}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{
          fontSize:86, marginBottom:10,
          opacity: s >= 1 ? 1 : 0,
          transform: s >= 1 ? "scale(1)" : "scale(0.2)",
          transition:"all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          filter: s >= 1 ? "drop-shadow(0 0 40px #a855f7) drop-shadow(0 0 80px #00f5ff55)" : "none",
          animation: s >= 1 ? "floatUp 3s ease-in-out infinite" : "none",
        }}>🚀</div>
        <div style={{
          fontFamily:"'Orbitron',sans-serif", fontSize:30, fontWeight:900, letterSpacing:3,
          background:`linear-gradient(135deg,${C.cyan},${C.purple},${C.pink})`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          opacity: s >= 2 ? 1 : 0, transform: s >= 2 ? "translateY(0)" : "translateY(14px)",
          transition:"all 0.5s ease",
        }}>MATHMAGIC</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.dim, letterSpacing:5, marginTop:6, opacity: s >= 3 ? 1 : 0, transition:"opacity 0.5s ease" }}>
          SPACE ACADEMY
        </div>
      </div>
    </div>
  );
}

export function EntryScreen({ onSelect }) {
  useEffect(()=>{ SFX.screenIn(); },[]);
  const [hov, setHov] = useState(-1);

  // ── Secret admin gate: tap logo 7 times ──────────────────────────
  const tapCount    = useRef(0);
  const tapTimer    = useRef(null);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [adminPass,     setAdminPass]     = useState("");
  const [adminErr,      setAdminErr]      = useState("");
  // Hardcoded admin passphrase — change this to something only you know
  const ADMIN_GATE_PASS = "angadadmin2026";

  const handleLogoTap = () => {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    if (tapCount.current >= 7) {
      tapCount.current = 0;
      SFX.unlock();
      setShowAdminGate(true);
      setAdminPass(""); setAdminErr("");
    } else {
      tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1500);
    }
  };

  const handleAdminSubmit = () => {
    if (adminPass === ADMIN_GATE_PASS) {
      setShowAdminGate(false);
      SFX.select();
      onSelect("admin_panel");
    } else {
      setAdminErr("Wrong passphrase ✗");
      setAdminPass("");
    }
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0",position:"relative",overflow:"hidden"}}>
      <Starfield n={50}/>
      <div style={{position:"absolute",top:"8%",left:"5%",width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${C.cyan}${isDark()?"18":"28"},transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"10%",right:"5%",width:180,height:180,borderRadius:"50%",background:`radial-gradient(circle,${C.purple}18,transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:2,width:"100%",maxWidth:440,padding:"28px 22px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          {/* Tapping this logo 7 times opens the hidden admin gate */}
          <div
            onClick={handleLogoTap}
            style={{fontSize:80,marginBottom:14,animation:"floatUp 3s ease-in-out infinite",filter:`drop-shadow(0 0 36px ${C.cyan}88)`,cursor:"default",userSelect:"none",WebkitUserSelect:"none"}}
          >🚀</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:32,color:textColor(),fontWeight:900,letterSpacing:2,marginBottom:4}}>MathMagic</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan,letterSpacing:5,marginBottom:10}}>SPACE ACADEMY</div>
          <div style={{fontSize:15,color:text2Color()}}>Where math meets the cosmos ✨</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[
            {icon:"🧒", label:"I'm a Student",  sub:"Jump into your adventure!",  s:"student_entry", color:C.cyan},
            {icon:"👩‍🏫",label:"I'm a Teacher",  sub:"Manage your class",           s:"teacher_login",  color:C.yellow},
          ].map((r,i)=>(
            <button key={i}
              onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(-1)}
              onClick={()=>{SFX.tap();onSelect(r.s);}}
              style={{background:`linear-gradient(135deg,${r.color}18,${r.color}08)`,border:`2px solid ${hov===i?r.color+"88":r.color+"33"}`,borderRadius:22,padding:"20px 22px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,textAlign:"left",transition:"all 0.2s",boxShadow:hov===i?`0 0 30px ${r.color}33`:"none",transform:hov===i?"translateY(-2px)":"none"}}>
              <div style={{width:58,height:58,borderRadius:18,background:`${r.color}22`,border:`2px solid ${r.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{r.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:18,fontWeight:900,color:textColor()}}>{r.label}</div>
                <div style={{fontSize:13,color:r.color,marginTop:4,fontWeight:600}}>{r.sub}</div>
              </div>
              <div style={{fontSize:28,color:r.color}}>›</div>
            </button>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:26,fontSize:11,color:C.dim}}>🔒 Secured · No ads · COPPA compliant</div>
      </div>

      {/* ── Hidden admin passphrase modal ── */}
      {showAdminGate && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:C.card,border:`2px solid ${C.red}44`,borderRadius:24,padding:"28px 24px",width:"100%",maxWidth:320,textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:12}}>🔐</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.red,letterSpacing:2,marginBottom:16}}>ADMIN ACCESS</div>
            <input
              value={adminPass}
              onChange={e=>setAdminPass(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleAdminSubmit()}
              type="password"
              placeholder="Enter passphrase"
              autoFocus
              style={{width:"100%",background:isDark()?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",border:`1.5px solid ${C.red}44`,borderRadius:10,padding:"12px 14px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:15,marginBottom:8,display:"block",textAlign:"center"}}
            />
            {adminErr && <div style={{color:C.red,fontSize:12,marginBottom:8,fontWeight:700}}>{adminErr}</div>}
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button onClick={()=>{setShowAdminGate(false);setAdminErr("");setAdminPass("");}}
                style={{flex:1,background:"transparent",border:`1.5px solid ${C.dim}44`,borderRadius:10,padding:"10px",color:C.dim,fontFamily:"'Nunito',sans-serif",fontSize:14,cursor:"pointer"}}>Cancel</button>
              <button onClick={handleAdminSubmit}
                style={{flex:1,background:`linear-gradient(135deg,${C.red},${C.purple})`,border:"none",borderRadius:10,padding:"10px",color:"white",fontFamily:"'Orbitron',sans-serif",fontSize:11,cursor:"pointer",fontWeight:700}}>ENTER</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ── StudentEntry — school vs individual ───────────────────────────
export function StudentEntry({ onBack, onSelect }) {
  const [hov, setHov] = useState(-1);
  const opts = [
    {icon:"🏫",label:"My School uses MathMagic",sub:"Login with school code",        color:C.cyan,   s:"student_login"},
    {icon:"🏠",label:"I study at home",          sub:"Login with my account",          color:C.purple, s:"login"},
    {icon:"✨",label:"New? Register here",       sub:"One-time ₹599 · Lifetime access",color:C.green,  s:"reg_payment", highlight:true},
  ];
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0",position:"relative",overflow:"hidden"}}>
      <Starfield n={35}/>
      <div style={{position:"absolute",top:"6%",right:"6%",fontSize:90,opacity:0.06,animation:"floatUp 4s ease-in-out infinite",pointerEvents:"none"}}>🧒</div>
      <div style={{position:"relative",zIndex:2,width:"100%",maxWidth:440,padding:"28px 22px",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:34}}>
          <BackBtn onClick={onBack} color={C.cyan}/>
          <div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.cyan,letterSpacing:3}}>STUDENT ACCESS</div>
            <div style={{fontSize:20,fontWeight:900,color:textColor(),marginTop:3}}>How do you study?</div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {opts.map((r,i)=>(
            <button key={i}
              onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(-1)}
              onClick={()=>{SFX.tap();onSelect(r.s);}}
              style={{background:r.highlight?`linear-gradient(135deg,${r.color}28,${r.color}10)`:`linear-gradient(135deg,${r.color}18,${r.color}06)`,border:`2px solid ${hov===i?r.color+"88":r.highlight?r.color+"55":r.color+"33"}`,borderRadius:22,padding:"22px 20px",cursor:"pointer",textAlign:"left",display:"flex",gap:16,alignItems:"center",transition:"all 0.2s",boxShadow:hov===i?`0 0 28px ${r.color}33`:"none",transform:hov===i?"translateY(-2px)":"none"}}>
              <div style={{width:56,height:56,borderRadius:18,background:`${r.color}22`,border:`2px solid ${r.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{r.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:17,fontWeight:900,color:r.highlight?r.color:textColor()}}>{r.label}</div>
                <div style={{fontSize:13,color:C.dim,marginTop:4,fontWeight:600}}>{r.sub}</div>
              </div>
              <div style={{fontSize:28,color:r.color}}>›</div>
            </button>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:24,fontSize:12,color:C.dim}}>🌟 Join students on their math journey!</div>
      </div>
    </div>
  );
}
// ── School API helper ─────────────────────────────────────────────
const schoolApi = async (action, body={}, adminKey=null) => {
  const headers = {"Content-Type":"application/json"};
  if (adminKey) headers["Authorization"] = `Bearer ${adminKey}`;
  const r = await fetch("/api/school", {method:"POST", headers, body:JSON.stringify({action,...body})});
  return r.json();
};