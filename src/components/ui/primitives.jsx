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
      className="mm-btn-press"
      style={{
        width:"100%", padding:"17px 24px",
        border:"none",
        borderRadius:20,
        background: isOff
          ? "linear-gradient(135deg,#111128,#0a0a1f)"
          : hov
            ? `linear-gradient(135deg,${color},${color}cc,${color}aa)`
            : `linear-gradient(135deg,${color}ee,${color}bb,${color}88)`,
        color: isOff ? isDark()?"#2a2a50":"#c5bde8" : "#fff",
        fontSize:16, fontFamily:"'Baloo 2','Nunito',sans-serif", fontWeight:900,
        cursor: isOff ? "not-allowed" : "pointer",
        letterSpacing:1.5,
        textShadow: isOff ? "none" : `0 1px 8px ${color}88`,
        boxShadow: isOff
          ? "none"
          : hov
            ? `0 6px 28px ${color}88, 0 0 0 2px ${color}55, inset 0 1px 0 rgba(255,255,255,0.25)`
            : `0 4px 18px ${color}55, 0 0 0 1px ${color}33, inset 0 1px 0 rgba(255,255,255,0.15)`,
        transform: hov && !isOff ? "translateY(-2px) scale(1.01)" : "none",
        transition:"all 0.18s ease",
        position:"relative", overflow:"hidden",
        ...sx,
      }}
    >
      {!isOff && <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,rgba(255,255,255,0.12) 0%,transparent 60%)`,borderRadius:20,pointerEvents:"none"}}/>}
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
    <div style={{
      background:C.card, borderRadius:16, padding:14,
      border:`1.5px solid ${isDark() ? color+"33" : color+"44"}`,
      boxShadow: isDark() ? `0 4px 18px ${color}12` : `0 4px 20px ${color}18, 0 1px 4px rgba(0,0,0,0.05)`,
      ...sx,
    }}>
      {children}
    </div>
  );
}

// XP bar
export function XPBar({ xp = 0, level = 1 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{
        background:`linear-gradient(135deg,${C.purple},${C.pink})`,
        borderRadius:20, padding:"3px 10px", fontSize:10,
        fontFamily:"'Orbitron',sans-serif", color:textColor(), flexShrink:0,
      }}>LV {level}</div>
      <div style={{ flex:1, background:"rgba(255,255,255,0.07)", borderRadius:7, height:7, overflow:"hidden" }}>
        <div style={{
          width:`${((xp % 200) / 200) * 100}%`, height:"100%",
          background:`linear-gradient(90deg,${C.cyan},${C.purple})`,
          borderRadius:7, transition:"width 1s ease",
        }}/>
      </div>
      <span style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif" }}>{xp} XP</span>
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
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:14, animation:shake ? "shakeX 0.4s ease" : "none" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width:50, height:50, borderRadius:14,
            background: pin.length > i ? `linear-gradient(135deg,${C.cyan},${C.purple})` : "#07071a",
            border:`2px solid ${shake ? C.red : pin.length > i ? C.cyan : "#181840"}`,
            boxShadow: pin.length > i ? `0 0 14px ${C.cyan}77` : shake ? `0 0 12px ${C.red}66` : "none",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, color:textColor(), transition:"all 0.2s",
          }}>{pin.length > i ? "●" : ""}</div>
        ))}
      </div>
      {error && <div style={{ color:C.red, fontSize:12, fontWeight:700, textAlign:"center", marginBottom:10 }}>⚠ {error}</div>}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
          <button key={i} onClick={() => k !== "" && handleKey(String(k))}
            onMouseDown={e => { if(k!=="") e.currentTarget.style.background = "#1a1a40"; }}
            onMouseUp={e => { if(k!=="") e.currentTarget.style.background = C.card2; }}
            onTouchStart={e => { if(k!=="") e.currentTarget.style.background = "#1a1a40"; }}
            onTouchEnd={e => { if(k!=="") e.currentTarget.style.background = C.card2; }}
            style={{
              padding:"15px", background: k === "" ? "transparent" : C.card2,
              border: k === "" ? "none" : `1.5px solid ${C.purple}44`,
              borderRadius:13, color:textColor(), fontSize:20,
              fontFamily:"'Orbitron',sans-serif", fontWeight:700,
              cursor: k === "" ? "default" : "pointer",
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
    <button onClick={()=>{SFX.back();if(onClick)onClick();}} style={{
      background:`${color}18`, border:`1px solid ${color}44`,
      borderRadius:12, width:42, height:42, color,
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
          background: i <= current ? `linear-gradient(90deg,${C.cyan},${C.purple})` : "#111128",
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
        {Array.from({ length:count }).map((_, i) => (
          <div key={i} style={{
            width:40, height:14,
            background:`linear-gradient(90deg,${color},${color}bb)`,
            borderRadius:8, boxShadow:`0 0 6px ${color}88`, zIndex:1,
          }}/>
        ))}
      </div>
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:22, color, textShadow:`0 0 10px ${color}` }}>{count}</div>
      <div style={{ display:"flex", gap:7 }}>
        <button onClick={() => setCount(c => Math.max(0, c-1))} style={{ width:32, height:32, background:"#2a0a0a", border:`1.5px solid ${C.red}`, borderRadius:9, color:"#f87171", fontSize:18, cursor:"pointer", fontWeight:900 }}>−</button>
        <button onClick={() => setCount(c => Math.min(9, c+1))} style={{ width:32, height:32, background:"#0a2a0a", border:`1.5px solid ${C.green}`, borderRadius:9, color:"#4ade80", fontSize:18, cursor:"pointer", fontWeight:900 }}>+</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
