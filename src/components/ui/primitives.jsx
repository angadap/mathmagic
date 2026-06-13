// src/components/ui/primitives.jsx — Base UI: Btn, Inp, Card, XPBar, PinPad, etc.
import { SFX } from '../../lib/sfx.js';
import { Starfield } from '../layout/layout.jsx';
import React, { useState, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';

export function Btn({ children, onClick, color = C.cyan, disabled, loading, style: sx = {} }) {
  const [hov, setHov] = React.useState(false);
  const handleClick = () => { SFX.tap(); if(onClick) onClick(); };
  const isOff = disabled || loading;
  return (
    <button
      onClick={!isOff ? handleClick : undefined}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      className="mm-btn"
      style={{
        width:"100%", padding:"17px 24px",
        border:"none",
        borderRadius:20,
        background: isOff
          ? "#E5E3F0"
          : `linear-gradient(155deg,${color}EE,${color}CC)`,
        color: isOff ? C.dim : "#fff",
        fontSize:16, fontFamily:"'Nunito',sans-serif", fontWeight:900,
        cursor: isOff ? "not-allowed" : "pointer",
        letterSpacing:1,
        textShadow: isOff ? "none" : `0 1px 8px ${color}66`,
        boxShadow: isOff
          ? "none"
          : `0 4px 0 ${color}CC, 0 6px 16px ${color}35, inset 0 1px 0 rgba(255,255,255,0.35)`,
        transform: hov && !isOff ? "translateY(-1px)" : "none",
        transition:"all 0.18s ease",
        position:"relative", overflow:"hidden",
        ...sx,
      }}
    >
      {!isOff && <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(255,255,255,0.22) 0%,transparent 55%)",borderRadius:20,pointerEvents:"none"}}/>}
      {loading ? (
        <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          <span style={{
            width:16, height:16,
            border:"3px solid rgba(255,255,255,0.3)", borderTopColor:"white",
            borderRadius:"50%", animation:"spinR 0.7s linear infinite", display:"inline-block",
          }}/>
          Please wait…
        </span>
      ) : children}
    </button>
  );
}

// Input field with show/hide password
export function Inp({ value, onChange, placeholder, type = "text", label, error, onEnter, maxLen = 200, autoComp }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ marginBottom:13 }}>
      {label && (
        <div style={{ fontSize:10, color:C.cyan, fontFamily:"'Orbitron',sans-serif", letterSpacing:2, marginBottom:5 }}>
          {label}
        </div>
      )}
      <div style={{ position:"relative" }}>
        <input
          type={isPass ? (show ? "text" : "password") : type}
          value={value}
          onChange={e => onChange(type === "email" ? e.target.value.trim() : e.target.value)}
          placeholder={placeholder}
          maxLength={maxLen}
          autoComplete={autoComp || (type === "email" ? "email" : type === "password" ? "current-password" : "off")}
          onKeyDown={e => e.key === "Enter" && onEnter && onEnter()}
          style={{
            width:"100%",
            padding:`12px ${isPass ? "44px" : "13px"} 12px 13px`,
            background:C.card2,
            border:`1.5px solid ${error ? C.red + "99" : C.purple + "44"}`,
            borderRadius:12, fontSize:14, fontWeight:600,
          }}
          onFocus={e => { e.target.style.borderColor = error ? C.red : C.cyan; e.target.style.boxShadow = `0 0 0 2px ${error ? C.red : C.cyan}22`; }}
          onBlur={e => { e.target.style.borderColor = error ? C.red + "99" : C.purple + "44"; e.target.style.boxShadow = "none"; }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)} style={{
            position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
            background:"none", border:"none", cursor:"pointer", color:C.dim, fontSize:16, padding:4,
          }}>
            {show ? "🙈" : "👁️"}
          </button>
        )}
      </div>
      {error && <div style={{ color:C.red, fontSize:11, marginTop:3, fontWeight:700 }}>⚠ {error}</div>}
    </div>
  );
}

// Card
export function Card({ children, color = C.purple, style: sx = {} }) {
  return (
    <div className="mm-card" style={{
      background: C.surface || "#FFFFFF",
      border:`1.5px solid ${color}22`,
      borderRadius:28, padding:14,
      boxShadow:`0 8px 30px ${color}28, 0 2px 6px ${color}18, inset 0 1px 0 rgba(255,255,255,0.8)`,
      ...sx,
    }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${color}30,transparent)`,pointerEvents:"none"}}/>
      {children}
    </div>
  );
}

// XP bar
export function XPBar({ xp = 0, level = 1 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{
        background:"linear-gradient(135deg,#FFC847,#FF6B6B)",
        borderRadius:20, padding:"3px 10px", fontSize:10,
        fontFamily:"'Nunito',sans-serif", color:"#1A1040", flexShrink:0, fontWeight:900,
      }}>LV {level}</div>
      <div style={{ flex:1, background:"#F0ECFF", borderRadius:999, height:10, overflow:"hidden" }}>
        <div style={{
          width:`${((xp % 200) / 200) * 100}%`, height:"100%",
          background:"linear-gradient(90deg,#5B4FE8,#9B59F5,#4BBDF5)",
          backgroundSize:"200% 100%",
          borderRadius:999,
          animation:"mmShimmer 3s linear infinite",
          boxShadow:"0 0 10px #5B4FE855",
          transition:"width 1s ease",
        }}/>
      </div>
      <span style={{ fontSize:9, color:"#9890C4", fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>{xp} XP</span>
    </div>
  );
}

// Pin pad
export function PinPad({ pin, setPin, error, shake, onComplete }) {
  const handleKey = (k) => {
    if (k === "⌫") { setPin(p => p.slice(0, -1)); return; }
    setPin(p => {
      if (p.length >= 4) return p;
      const next = p + k;
      if (next.length === 4 && onComplete) setTimeout(() => onComplete(next), 0);
      return next;
    });
  };
  const keyShad = "0 4px 0 #5B4FE8CC, 0 6px 16px #5B4FE835, inset 0 1px 0 rgba(255,255,255,0.35)";
  const keyPressShad = "0 1px 0 #5B4FE8CC";
  return (
    <div>
      {/* PIN dots */}
      <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:22, animation:shake ? "shakeX 0.4s ease" : "none" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width:18, height:18, borderRadius:"50%",
            background: pin.length > i ? "#FFC847" : "transparent",
            border:`2.5px solid ${shake ? "#FF6B6B" : pin.length > i ? "#FFC847" : "rgba(91,79,232,0.15)"}`,
            boxShadow: pin.length > i ? "0 0 14px #FFC84799" : shake ? "0 0 10px #FF6B6B66" : "none",
            transition:"all 0.2s",
            transform: pin.length > i ? "scale(1.1)" : "scale(1)",
          }}/>
        ))}
      </div>
      {error && <div style={{ color:"#FF6B6B", fontSize:12, fontWeight:700, textAlign:"center", marginBottom:10 }}>⚠ {error}</div>}
      {/* Keys */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, maxWidth:280, margin:"0 auto" }}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
          <button key={i}
            onClick={() => k !== "" && handleKey(String(k))}
            onMouseDown={e => { if(k!=="") { e.currentTarget.style.transform="translateY(4px) scale(.88)"; e.currentTarget.style.boxShadow=keyPressShad; }}}
            onMouseUp={e => { if(k!=="") { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=keyShad; }}}
            onTouchStart={e => { if(k!=="") { e.currentTarget.style.transform="translateY(4px) scale(.88)"; e.currentTarget.style.boxShadow=keyPressShad; }}}
            onTouchEnd={e => { if(k!=="") { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=keyShad; }}}
            style={{
              width:72, height:72, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center",
              background: k === "" ? "transparent" : "linear-gradient(155deg,#F0ECFF,#E8E2FF)",
              border: k === "" ? "none" : "2px solid rgba(91,79,232,0.20)",
              borderRadius:"50%",
              color:"#1A1040", fontSize: k === "⌫" ? 20 : 22,
              fontFamily:"'Baloo 2',sans-serif", fontWeight:900,
              cursor: k === "" ? "default" : "pointer",
              boxShadow: k === "" ? "none" : keyShad,
              transition:"transform 0.15s,box-shadow 0.15s",
            }}
          >{k}</button>
        ))}
      </div>
    </div>
  );
}

// Back button (reusable)
export function BackBtn({ onClick, color = C.purple }) {
  return (
    <button onClick={()=>{SFX.tap();if(onClick)onClick();}} style={{
      background:`${color}15`, border:`1.5px solid ${color}30`,
      borderRadius:14, width:40, height:40, color,
      fontSize:22, cursor:"pointer",
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
    }}>‹</button>
  );
}

// Step dots for register
export function StepDots({ current }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:18 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{
          width: i === current ? 26 : 8, height:8, borderRadius:4,
          background: i <= current ? `linear-gradient(90deg,${C.cyan},${C.purple})` : C.card2,
          boxShadow: i === current ? `0 0 8px ${C.cyan}` : "none",
          transition:"all 0.3s",
        }}/>
      ))}
    </div>
  );
}

// Page wrapper for register steps
export function RegPage({ children, step, title, color = C.cyan, onBack }) {
  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"20px 18px", position:"relative", fontFamily:"'Nunito',sans-serif", overflowY:"auto" }}>
      <Starfield n={16}/>
      <div style={{ position:"relative", zIndex:1, animation:"slideUp 0.3s ease" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <BackBtn onClick={onBack} color={color}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:13, color }}>{title}</div>
        </div>
        <StepDots current={step}/>
        {children}
      </div>
    </div>
  );
}

// Abacus rod (defined outside Abacus screen)
export function AbacusRod({ count, setCount, color, label }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:9, color, letterSpacing:2 }}>{label}</div>
      <div style={{
        width:64, background:`${color}0a`, borderRadius:13, padding:"8px 0",
        border:`1.5px solid ${color}33`,
        display:"flex", flexDirection:"column", alignItems:"center",
        minHeight:155, justifyContent:"flex-end",
        position:"relative", gap:3, boxShadow:`0 0 14px ${color}18`,
      }}>
        <div style={{ position:"absolute", top:8, bottom:8, width:5, background:`${color}44`, borderRadius:3, left:"50%", transform:"translateX(-50%)" }}/>
        {Array.from({ length:9 }).map((_, i) => (
          <div key={i} style={{
            width:40, height:14,
            background: i >= (9-count) ? "linear-gradient(135deg,#FFC847,#FF6B6B)" : "#F0ECFF",
            border: i >= (9-count) ? "1px solid #FFC847" : "1px solid rgba(91,79,232,0.12)",
            boxShadow: i >= (9-count) ? "0 2px 6px #FFC84744" : "none",
            borderRadius:8, zIndex:1,
          }}/>
        ))}
      </div>
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:22, color, textShadow:`0 0 10px ${color}` }}>{count}</div>
      <div style={{ display:"flex", gap:7 }}>
        <button onClick={() => setCount(c => Math.max(0, c-1))} style={{ width:32, height:32, background:"#FF6B6B15", border:"1.5px solid #FF6B6B44", borderRadius:9, color:"#FF6B6B", fontSize:18, cursor:"pointer", fontWeight:900 }}>−</button>
        <button onClick={() => setCount(c => Math.min(9, c+1))} style={{ width:32, height:32, background:"#FFC84715", border:"1.5px solid #FFC84744", borderRadius:9, color:"#FFC847", fontSize:18, cursor:"pointer", fontWeight:900 }}>+</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────