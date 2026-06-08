import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   MATHMAGIC SPACE ACADEMY — COMPLETE UI REDESIGN
   Design: "Cosmic Candy" — Warm white base, rich jewel-tone 
   accents, tactile 3D cards, bouncy micro-animations
   All logic/DB/API untouched — pure visual layer redesign
═══════════════════════════════════════════════════════════════ */

const DS = {
  // COLOUR SYSTEM
  bg:        "#FAFBFF",
  bgWarm:    "#F5F0FF",
  surface:   "#FFFFFF",
  surfaceAlt:"#F0ECFF",
  
  indigo:    "#5B4FE8",
  indigoL:   "#7B6FF8",
  indigoD:   "#3D33C4",
  
  coral:     "#FF6B6B",
  coralL:    "#FF9494",
  
  amber:     "#FFC847",
  amberL:    "#FFE08A",
  
  mint:      "#2ECC9A",
  mintL:     "#5EDBB5",
  
  sky:       "#4BBDF5",
  skyL:      "#80D0FF",
  
  rose:      "#FF5FA0",
  roseL:     "#FF88BE",
  
  grape:     "#9B59F5",
  grapeL:    "#BB88FF",
  
  // TEXT
  ink:       "#1A1040",
  ink2:      "#5A4E8A",
  ink3:      "#9890C4",
  
  // BORDERS
  border:    "rgba(91,79,232,0.10)",
  borderMed: "rgba(91,79,232,0.18)",
  
  // SHADOWS — the core of the tactile feel
  shadow: (color, intensity=1) => `0 ${4*intensity}px ${12*intensity}px ${color}30, 0 ${2*intensity}px ${6*intensity}px ${color}20`,
  shadowDeep: (color) => `0 8px 30px ${color}28, 0 2px 6px ${color}18, inset 0 1px 0 rgba(255,255,255,0.8)`,
  btn: (color) => `0 4px 0 ${color}CC, 0 6px 16px ${color}35, inset 0 1px 0 rgba(255,255,255,0.35)`,
  
  // RADIUS
  r: { xs:8, sm:14, md:20, lg:28, xl:36, full:999 },
  
  // FONTS
  font: {
    display: "'Fredoka One', 'Nunito', system-ui, sans-serif",
    body:    "'Nunito', 'DM Sans', system-ui, sans-serif",
    mono:    "'DM Mono', monospace",
  }
};

// Google Fonts loader
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap";
fontLink.rel = "stylesheet";
if (!document.getElementById("mm-gf")) { fontLink.id = "mm-gf"; document.head.appendChild(fontLink); }

// Inject global styles
const styleEl = document.createElement("style");
styleEl.textContent = `
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; margin:0; padding:0; }
  body { background: #FAFBFF; font-family: 'Nunito', sans-serif; }
  @keyframes mmFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes mmPop { 0%{transform:scale(0.85);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
  @keyframes mmSlideUp { from{transform:translateY(22px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes mmSlideIn { from{transform:translateX(-18px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes mmPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
  @keyframes mmSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes mmShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes mmBounce { 0%,100%{transform:scale(1)} 40%{transform:scale(1.15)} 70%{transform:scale(0.94)} }
  @keyframes mmStarPop { 0%{transform:scale(0)rotate(-30deg)} 60%{transform:scale(1.3)rotate(5deg)} 100%{transform:scale(1)rotate(0)} }
  @keyframes mmConfetti { 0%{transform:translateY(-10px) rotate(0);opacity:1} 100%{transform:translateY(120px) rotate(540deg);opacity:0} }
  @keyframes mmWave { 0%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} 100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} }

  .mm-card-press:active { transform: translateY(4px) !important; }
  .mm-btn-press:active { transform: translateY(4px) !important; box-shadow: 0 0px 0 rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.1) !important; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: ${DS.indigo}44; border-radius: 99px; }
`;
if (!document.getElementById("mm-styles")) { styleEl.id = "mm-styles"; document.head.appendChild(styleEl); }

// ─── REUSABLE UI ATOMS ───────────────────────────────────────────

function Blob({ color, size=120, style={} }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%",
      background: `radial-gradient(circle at 35% 35%, ${color}55, ${color}15)`,
      animation: "mmWave 8s ease-in-out infinite",
      position: "absolute", pointerEvents: "none",
      ...style
    }}/>
  );
}

function Stars({ n=30 }) {
  const stars = useRef(Array.from({length:n}, (_,i) => ({
    x: Math.random()*100, y: Math.random()*100,
    s: 1+Math.random()*2.5, d: 2+Math.random()*4, dl: Math.random()*3,
    color: [DS.indigo, DS.coral, DS.amber, DS.mint, DS.grape][i%5]
  }))).current;
  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
      {stars.map((st,i) => (
        <div key={i} style={{
          position:"absolute", left:`${st.x}%`, top:`${st.y}%`,
          width:st.s, height:st.s, borderRadius:"50%",
          background: st.color,
          opacity: 0.25,
          animation: `mmPulse ${st.d}s ${st.dl}s ease-in-out infinite`
        }}/>
      ))}
    </div>
  );
}

function Chip({ children, color=DS.indigo, size="sm" }) {
  const pad = size==="sm" ? "3px 10px" : "5px 14px";
  const fs = size==="sm" ? 11 : 13;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding: pad, borderRadius: DS.r.full,
      background: `${color}18`, border: `1.5px solid ${color}30`,
      color, fontSize: fs, fontWeight: 800, fontFamily: DS.font.body,
      letterSpacing: 0.3,
    }}>{children}</span>
  );
}

function BigBtn({ children, color=DS.indigo, onClick, icon, disabled, small }) {
  const pad = small ? "12px 20px" : "16px 24px";
  const fs = small ? 14 : 17;
  return (
    <button onClick={!disabled ? onClick : undefined} className="mm-btn-press"
      style={{
        width: "100%", padding: pad, border: "none", borderRadius: DS.r.md,
        background: disabled ? "#E5E3F0" : `linear-gradient(155deg, ${color}EE 0%, ${color}CC 100%)`,
        color: disabled ? DS.ink3 : "white",
        fontSize: fs, fontFamily: DS.font.body, fontWeight: 900,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : DS.btn(color),
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        transition: "all 0.15s",
        position:"relative", overflow:"hidden",
        letterSpacing: 0.5,
      }}>
      {!disabled && <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(255,255,255,0.22) 0%,transparent 50%)",borderRadius:DS.r.md,pointerEvents:"none"}}/>}
      {icon && <span style={{fontSize:fs+2}}>{icon}</span>}
      {children}
    </button>
  );
}

function Card({ children, color=DS.indigo, style:sx={}, onClick, anim }) {
  return (
    <div onClick={onClick} className={onClick?"mm-card-press":undefined}
      style={{
        background: DS.surface,
        border: `1.5px solid ${color}22`,
        borderRadius: DS.r.lg,
        boxShadow: DS.shadowDeep(color),
        padding: 16,
        cursor: onClick ? "pointer" : "default",
        animation: anim ? "mmSlideUp 0.35s ease both" : undefined,
        position: "relative", overflow: "hidden",
        ...sx,
      }}>
      {/* Top shine */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${color}30,transparent)`,borderRadius:`${DS.r.lg}px ${DS.r.lg}px 0 0`}}/>
      {children}
    </div>
  );
}

function Avatar({ emoji, size=52, color=DS.indigo, level, glow }) {
  return (
    <div style={{position:"relative",width:size+12,height:size+12,flexShrink:0}}>
      <div style={{
        width:size, height:size, borderRadius: DS.r.md,
        background:`linear-gradient(135deg,${color}22,${color}0a)`,
        border:`2.5px solid ${color}44`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:size*0.52,
        boxShadow: glow ? `0 0 20px ${color}55` : DS.shadow(color),
      }}>{emoji}</div>
      {level && <div style={{
        position:"absolute",bottom:-4,right:-4,
        background:`linear-gradient(135deg,${DS.amber},${DS.coral})`,
        borderRadius:DS.r.full, padding:"1px 7px",
        fontSize:10,fontWeight:900,color:"white",fontFamily:DS.font.body,
        border:`2px solid white`,
        boxShadow:`0 2px 6px ${DS.amber}44`,
      }}>Lv{level}</div>}
    </div>
  );
}

function XPBar({ xp=0, level=1 }) {
  const pct = (xp % 200) / 200 * 100;
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1}}>
        <div style={{background:DS.surfaceAlt,borderRadius:DS.r.full,height:10,overflow:"hidden",boxShadow:"inset 0 2px 4px rgba(91,79,232,0.1)"}}>
          <div style={{
            width:`${pct}%`,height:"100%",
            background:`linear-gradient(90deg,${DS.indigo},${DS.grape},${DS.sky})`,
            backgroundSize:"200% 100%",
            borderRadius:DS.r.full,
            animation:"mmShimmer 3s linear infinite",
            boxShadow:`0 0 10px ${DS.indigo}55`,
          }}/>
        </div>
      </div>
      <span style={{fontSize:11,color:DS.ink3,fontWeight:700,fontFamily:DS.font.body}}>{xp} XP</span>
    </div>
  );
}

function ScreenShell({ children, bg=DS.bg, nav, style:sx={} }) {
  return (
    <div style={{
      width:"100%",height:"100%",background:bg,
      position:"relative",overflow:"hidden",
      display:"flex",flexDirection:"column",
      fontFamily:DS.font.body, color:DS.ink,
      ...sx,
    }}>
      {children}
      {nav}
    </div>
  );
}

// ─── BOTTOM NAV ─────────────────────────────────────────────────

function BottomNav({ active, onNav }) {
  const tabs = [
    {id:"home",   icon:"🏠", label:"Home"},
    {id:"map",    icon:"🗺️", label:"Lessons"},
    {id:"games",  icon:"🎮", label:"Games"},
    {id:"badges", icon:"🏅", label:"Badges"},
    {id:"me",     icon:"🎭", label:"Me"},
  ];
  return (
    <div style={{
      position:"absolute",bottom:0,left:0,right:0,
      background:"rgba(255,255,255,0.92)",
      backdropFilter:"blur(20px)",
      borderTop:`1px solid ${DS.border}`,
      display:"flex",justifyContent:"space-around",
      padding:"10px 0 14px",
      boxShadow:`0 -8px 30px rgba(91,79,232,0.08)`,
      zIndex:20,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onNav(t.id)} style={{
            display:"flex",flexDirection:"column",alignItems:"center",gap:3,
            background:"none",border:"none",cursor:"pointer",
            padding:"2px 10px",
          }}>
            <div style={{
              width:40,height:40,borderRadius:DS.r.sm,
              background: isActive ? `${DS.indigo}15` : "transparent",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:20,
              transition:"all 0.2s",
              transform: isActive ? "scale(1.1)" : "scale(1)",
            }}>{t.icon}</div>
            <span style={{
              fontSize:9,fontWeight: isActive?900:600,
              color: isActive ? DS.indigo : DS.ink3,
              fontFamily:DS.font.body,letterSpacing:0.3,
              transition:"all 0.2s",
            }}>{t.label}</span>
            {isActive && <div style={{width:16,height:3,background:DS.indigo,borderRadius:DS.r.full,marginTop:-2}}/>}
          </button>
        );
      })}
    </div>
  );
}

// ─── SCREEN: SPLASH ─────────────────────────────────────────────

function SplashScreen() {
  return (
    <ScreenShell bg={`linear-gradient(160deg, #F0ECFF 0%, #E8F4FF 50%, #FFF0F5 100%)`}>
      <Stars n={25}/>
      <Blob color={DS.indigo} size={180} style={{top:-40,right:-40}}/>
      <Blob color={DS.coral} size={120} style={{bottom:60,left:-30}}/>
      <Blob color={DS.amber} size={100} style={{top:"40%",right:-20}}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",zIndex:2,gap:20,padding:"0 24px"}}>
        <div style={{fontSize:80,animation:"mmFloat 2.5s ease-in-out infinite",filter:`drop-shadow(0 12px 24px ${DS.indigo}44)`}}>🚀</div>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:DS.font.display,fontSize:38,color:DS.indigo,letterSpacing:1,lineHeight:1.1}}>MathMagic</div>
          <div style={{fontFamily:DS.font.display,fontSize:16,color:DS.ink2,letterSpacing:4,marginTop:4}}>SPACE ACADEMY</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginTop:8}}>
          {["🌍 CBSE","🪐 ICSE","⭐ Class 1–5","🎮 Game-Based"].map((t,i)=>(
            <Chip key={i} color={[DS.indigo,DS.coral,DS.mint,DS.grape][i]}>{t}</Chip>
          ))}
        </div>
        {/* Loading bar */}
        <div style={{width:"80%",background:DS.surfaceAlt,borderRadius:DS.r.full,height:5,overflow:"hidden",marginTop:20}}>
          <div style={{width:"65%",height:"100%",background:`linear-gradient(90deg,${DS.indigo},${DS.grape})`,borderRadius:DS.r.full,animation:"mmShimmer 1.5s linear infinite",backgroundSize:"200% 100%"}}/>
        </div>
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: ENTRY ──────────────────────────────────────────────

function EntryScreen({ onSelect }) {
  return (
    <ScreenShell>
      <Stars n={20}/>
      <Blob color={DS.indigo} size={200} style={{top:-60,right:-60,opacity:0.6}}/>
      <Blob color={DS.coral} size={140} style={{bottom:80,left:-40,opacity:0.5}}/>
      
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"40px 20px 24px",position:"relative",zIndex:2,overflowY:"auto"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:64,marginBottom:12,animation:"mmFloat 3s ease-in-out infinite",filter:`drop-shadow(0 10px 20px ${DS.indigo}44)`}}>🚀</div>
          <div style={{fontFamily:DS.font.display,fontSize:30,color:DS.indigo}}>MathMagic</div>
          <div style={{fontFamily:DS.font.body,fontSize:13,color:DS.ink2,letterSpacing:3,marginTop:2}}>SPACE ACADEMY</div>
        </div>

        {/* Entry cards */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[
            {icon:"🧒",label:"I'm a Student",  sub:"Jump into your adventure!",  s:"student",  color:DS.indigo},
            {icon:"👩‍🏫",label:"I'm a Teacher",  sub:"Manage your class & progress",s:"teacher",  color:DS.amber},
          ].map((r,i)=>(
            <button key={i} onClick={()=>onSelect(r.s)} className="mm-card-press"
              style={{
                background:DS.surface, border:`2px solid ${r.color}28`,
                borderRadius:DS.r.lg, padding:"18px 20px", cursor:"pointer",
                display:"flex",alignItems:"center",gap:16,textAlign:"left",
                boxShadow:DS.shadowDeep(r.color),
                animation:`mmSlideUp 0.4s ease ${i*0.12}s both`,
              }}>
              <div style={{
                width:56,height:56,borderRadius:DS.r.md,
                background:`linear-gradient(135deg,${r.color}28,${r.color}10)`,
                border:`2px solid ${r.color}35`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0,
                boxShadow:DS.shadow(r.color),
              }}>{r.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:17,fontWeight:900,color:DS.ink,marginBottom:3}}>{r.label}</div>
                <div style={{fontSize:12,color:DS.ink2,fontWeight:600}}>{r.sub}</div>
              </div>
              <div style={{
                width:32,height:32,borderRadius:DS.r.full,
                background:`${r.color}15`,border:`1.5px solid ${r.color}30`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:16,color:r.color,
              }}>›</div>
            </button>
          ))}
        </div>

        <div style={{textAlign:"center",marginTop:24,fontSize:11,color:DS.ink3}}>🔒 Secure · No ads · COPPA compliant</div>
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: HOME ────────────────────────────────────────────────

function HomeScreen({ onNav }) {
  const child = { name:"Aarav", avatar:"🧒", class_num:3, level:7, xp:1420, coins:340, gems:12, streak_days:6 };
  const world = { name:"Class 3", world:"Milky Way Core", planet:"⭐", color:DS.grape };
  
  const doneSets = 42, totalSets = 160;
  const pctDone = Math.round(doneSets/totalSets*100);
  
  return (
    <ScreenShell>
      <Stars n={18}/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:72,position:"relative",zIndex:2}}>

        {/* Hero header */}
        <div style={{
          background:`linear-gradient(160deg, ${DS.indigo}18 0%, ${DS.grape}12 50%, transparent 100%)`,
          padding:"24px 20px 20px",position:"relative",overflow:"hidden",
        }}>
          <Blob color={DS.grape} size={160} style={{top:-50,right:-40,opacity:0.4}}/>
          
          {/* Top row */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,position:"relative",zIndex:1}}>
            <Avatar emoji={child.avatar} size={52} color={world.color} level={child.level} glow/>
            <div style={{flex:1}}>
              <div style={{fontSize:21,fontWeight:900,color:DS.ink,lineHeight:1.1}}>
                Hey, {child.name}! 👋
              </div>
              <div style={{fontSize:12,color:DS.ink2,fontWeight:700,marginTop:2}}>
                {world.world} · Space Cadet
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {child.streak_days>0 && (
                <div style={{
                  background:`${DS.coral}15`,border:`1.5px solid ${DS.coral}30`,
                  borderRadius:DS.r.sm,padding:"6px 10px",textAlign:"center",
                }}>
                  <div style={{fontSize:18}}>🔥</div>
                  <div style={{fontFamily:DS.font.display,fontSize:13,color:DS.coral}}>{child.streak_days}</div>
                </div>
              )}
              <button style={{background:DS.surfaceAlt,border:`1.5px solid ${DS.border}`,borderRadius:DS.r.sm,padding:"6px 10px",cursor:"pointer",fontSize:13,color:DS.ink2,fontWeight:700}}>Exit</button>
            </div>
          </div>
          
          {/* XP bar */}
          <div style={{position:"relative",zIndex:1}}>
            <XPBar xp={child.xp} level={child.level}/>
          </div>
          
          {/* Progress ring row */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginTop:14,position:"relative",zIndex:1}}>
            <div style={{position:"relative",width:56,height:56,flexShrink:0}}>
              <svg width="56" height="56" style={{transform:"rotate(-90deg)"}}>
                <circle cx="28" cy="28" r="22" fill="none" stroke={`${DS.grape}20`} strokeWidth="5"/>
                <circle cx="28" cy="28" r="22" fill="none" stroke={DS.grape} strokeWidth="5"
                  strokeDasharray={`${2*Math.PI*22*pctDone/100} ${2*Math.PI*22}`} strokeLinecap="round"/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:DS.grape}}>{pctDone}%</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:800,color:DS.ink}}>Overall Progress</div>
              <div style={{fontSize:12,color:DS.ink2}}>{doneSets} of {totalSets} sets done</div>
            </div>
            {/* Mini stat pills */}
            <div style={{display:"flex",gap:6}}>
              {[{e:"⭐",v:71,c:DS.amber},{e:"🪙",v:child.coins,c:DS.coral}].map((s,i)=>(
                <div key={i} style={{
                  background:`${s.c}12`,border:`1.5px solid ${s.c}28`,
                  borderRadius:DS.r.sm,padding:"4px 10px",textAlign:"center",
                }}>
                  <div style={{fontSize:14}}>{s.e}</div>
                  <div style={{fontSize:11,fontWeight:900,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:14}}>

          {/* Cosmo mascot */}
          <div style={{
            background:`linear-gradient(135deg, ${DS.indigo}12, ${DS.grape}0a)`,
            border:`1.5px solid ${DS.indigo}20`,
            borderRadius:DS.r.md, padding:"12px 16px",
            display:"flex",alignItems:"center",gap:12,
          }}>
            <div style={{fontSize:34,animation:"mmFloat 2.5s ease-in-out infinite",flexShrink:0}}>🤖</div>
            <div>
              <div style={{fontSize:11,color:DS.indigo,fontWeight:800,letterSpacing:1}}>COSMO SAYS</div>
              <div style={{fontSize:14,fontWeight:700,color:DS.ink,marginTop:2}}>You're on a 6-day streak! 🔥 Keep going!</div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[
              {e:"⭐",v:71,    l:"Stars",   c:DS.amber},
              {e:"🪙",v:340,   l:"Coins",   c:DS.coral},
              {e:"💎",v:12,    l:"Gems",    c:DS.grape},
              {e:"🗓️",v:"3",  l:"Today",   c:DS.mint},
            ].map((s,i)=>(
              <Card key={i} color={s.c} style={{padding:"10px 6px",textAlign:"center"}}>
                <div style={{fontSize:20}}>{s.e}</div>
                <div style={{fontSize:16,fontWeight:900,color:DS.ink,marginTop:2}}>{s.v}</div>
                <div style={{fontSize:9,color:DS.ink3,fontWeight:700}}>{s.l}</div>
              </Card>
            ))}
          </div>

          {/* Daily Quest */}
          <Card color={DS.grape} style={{overflow:"visible"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:14,fontWeight:900,color:DS.ink}}>🎯 Daily Quest</div>
              <Chip color={DS.grape}>1/3 done</Chip>
            </div>
            <div style={{background:DS.surfaceAlt,borderRadius:DS.r.sm,height:7,overflow:"hidden",marginBottom:10}}>
              <div style={{width:"33%",height:"100%",background:`linear-gradient(90deg,${DS.indigo},${DS.grape},${DS.coral})`,borderRadius:DS.r.full}}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              {[
                {icon:"🧮",label:"Do a Set",    done:true,  c:DS.mint},
                {icon:"🌟",label:"Word Problem", done:false, c:DS.amber},
                {icon:"🧩",label:"Puzzle",       done:false, c:DS.grape},
              ].map((t,i)=>(
                <div key={i} style={{
                  flex:1,background:t.done?`${t.c}14`:`${DS.surfaceAlt}`,
                  border:`1.5px solid ${t.done?t.c+"40":DS.border}`,
                  borderRadius:DS.r.sm,padding:"8px 4px",textAlign:"center",
                  cursor:"pointer",
                }}>
                  <div style={{fontSize:16}}>{t.done?"✅":t.icon}</div>
                  <div style={{fontSize:9,fontWeight:700,color:t.done?t.c:DS.ink3,marginTop:2}}>{t.label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick launch */}
          <Card color={DS.sky}>
            <div style={{fontSize:14,fontWeight:900,color:DS.ink,marginBottom:10}}>⚡ Quick Launch</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {i:"🧮",l:"Abacus",    s:"Train your brain",  c:DS.amber},
                {i:"🎮",l:"Games Hub",  s:"8 mini-games",      c:DS.sky},
                {i:"🎓",l:"Olympiad",   s:"Compete & win",     c:DS.grape},
                {i:"🛒",l:"Bazaar 🆕",  s:"Real-life maths",   c:DS.coral},
              ].map((n,i)=>(
                <button key={i} style={{
                  background:`${n.c}10`,border:`1.5px solid ${n.c}25`,
                  borderRadius:DS.r.md,padding:"14px 12px",cursor:"pointer",
                  textAlign:"left",display:"flex",alignItems:"center",gap:10,
                  boxShadow:DS.shadow(n.c,0.5),
                }}>
                  <div style={{fontSize:26}}>{n.i}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:DS.ink}}>{n.l}</div>
                    <div style={{fontSize:10,color:n.c,fontWeight:700}}>{n.s}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* My class */}
          <button onClick={()=>onNav("map")} className="mm-card-press" style={{
            background:DS.surface,border:`2px solid ${DS.grape}30`,
            borderRadius:DS.r.lg,padding:"16px",cursor:"pointer",
            display:"flex",alignItems:"center",gap:14,
            boxShadow:DS.shadowDeep(DS.grape),
            width:"100%",textAlign:"left",
          }}>
            <div style={{
              width:58,height:58,borderRadius:DS.r.md,
              background:`linear-gradient(135deg,${DS.grape}25,${DS.grape}0a)`,
              border:`2px solid ${DS.grape}40`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0,
            }}>⭐</div>
            <div style={{flex:1}}>
              <div style={{fontSize:18,fontWeight:900,color:DS.ink}}>Class 3</div>
              <div style={{fontSize:12,color:DS.ink2,fontWeight:700}}>Milky Way Core · {pctDone}% done</div>
              <div style={{background:DS.surfaceAlt,borderRadius:DS.r.full,height:5,overflow:"hidden",marginTop:6}}>
                <div style={{width:`${pctDone}%`,height:"100%",background:`linear-gradient(90deg,${DS.grape},${DS.sky})`,borderRadius:DS.r.full}}/>
              </div>
            </div>
            <div style={{fontSize:24,color:DS.grape}}>›</div>
          </button>

        </div>
      </div>
      <BottomNav active="home" onNav={onNav}/>
    </ScreenShell>
  );
}

// ─── SCREEN: LESSON MAP ──────────────────────────────────────────

function LessonMapScreen({ onNav }) {
  const world = { name:"Class 3", world:"Milky Way Core", planet:"⭐", color:DS.grape };
  const lessons = [
    {id:"c3-l1",title:"Numbers & Place Value",  emoji:"🔢",done:20,icon:"🔢"},
    {id:"c3-l2",title:"Addition & Subtraction",  emoji:"➕",done:14,icon:"➕"},
    {id:"c3-l3",title:"Multiplication & Division",emoji:"✖️",done:3, icon:"✖️"},
    {id:"c3-l4",title:"Fractions",               emoji:"½", done:0, icon:"½"},
    {id:"c3-l5",title:"Measurement & Time",      emoji:"📏",done:0, icon:"📏"},
  ];
  
  return (
    <ScreenShell>
      <Stars n={12}/>
      {/* Header */}
      <div style={{
        background:`linear-gradient(135deg,${DS.grape}20,${DS.indigo}10)`,
        borderBottom:`1.5px solid ${DS.grape}20`,
        padding:"16px 18px 14px",position:"relative",zIndex:2,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <button onClick={()=>onNav("home")} style={{
            width:40,height:40,borderRadius:DS.r.sm,
            background:`${DS.grape}15`,border:`1.5px solid ${DS.grape}30`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:20,color:DS.grape,cursor:"pointer",flexShrink:0,
          }}>‹</button>
          <div style={{
            width:44,height:44,borderRadius:DS.r.sm,
            background:`linear-gradient(135deg,${DS.grape},${DS.sky})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:22,flexShrink:0,boxShadow:DS.shadow(DS.grape),
          }}>⭐</div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:DS.grape,fontWeight:800,letterSpacing:2}}>MILKY WAY CORE</div>
            <div style={{fontSize:17,fontWeight:900,color:DS.ink}}>Class 3</div>
            <div style={{fontSize:11,color:DS.ink2}}>37/160 sets done</div>
          </div>
        </div>
        {/* Overall progress */}
        <div style={{background:`rgba(91,79,232,0.08)`,borderRadius:DS.r.full,height:10,overflow:"hidden"}}>
          <div style={{width:"23%",height:"100%",background:`linear-gradient(90deg,${DS.grape},${DS.sky})`,borderRadius:DS.r.full,boxShadow:`0 0 8px ${DS.grape}66`}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:10,color:DS.ink3}}>
          <span>37 sets complete</span><span>123 remaining</span>
        </div>
      </div>
      
      {/* Lessons */}
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px",paddingBottom:72,position:"relative",zIndex:2}}>
        {lessons.map((l,i) => {
          const pct = Math.round(l.done/20*100);
          const started = l.done > 0;
          const done = l.done === 20;
          const isNext = !done && (i===0 || lessons[i-1].done>=1);
          const color = [DS.grape,DS.indigo,DS.coral,DS.mint,DS.amber][i%5];
          
          return (
            <div key={l.id} style={{marginBottom:12,animation:`mmSlideUp 0.4s ease ${i*0.08}s both`}}>
              {/* Section label every 3 */}
              {i%3===0 && (
                <div style={{
                  display:"flex",alignItems:"center",gap:8,marginBottom:8,marginTop:i>0?4:0,
                  padding:"8px 12px",background:`${color}0e`,borderRadius:DS.r.sm,
                  border:`1px solid ${color}20`,
                }}>
                  <span style={{fontSize:16}}>⭐</span>
                  <div>
                    <div style={{fontSize:10,color,fontWeight:800,letterSpacing:1.5}}>SECTION {Math.floor(i/3)+1}</div>
                    <div style={{fontSize:11,fontWeight:700,color:DS.ink2}}>Milky Way Core</div>
                  </div>
                </div>
              )}
              
              <button style={{
                width:"100%",background:DS.surface,textAlign:"left",cursor:"pointer",
                border:`2px solid ${done?color+"66":isNext?color+"50":color+"22"}`,
                borderRadius:DS.r.lg,padding:"14px 16px",
                display:"flex",alignItems:"center",gap:14,
                boxShadow: isNext ? DS.shadowDeep(color) : done ? DS.shadow(color,0.6) : `0 2px 8px ${color}10`,
                transform: isNext ? "scale(1.01)" : "scale(1)",
              }}>
                {/* Progress ring */}
                <div style={{position:"relative",flexShrink:0}}>
                  <svg width="56" height="56" style={{transform:"rotate(-90deg)"}}>
                    <circle cx="28" cy="28" r="22" fill="none" stroke={`${color}18`} strokeWidth="4"/>
                    <circle cx="28" cy="28" r="22" fill="none" stroke={done?DS.mint:color} strokeWidth="4"
                      strokeDasharray={`${2*Math.PI*22*pct/100} ${2*Math.PI*22}`} strokeLinecap="round"/>
                  </svg>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
                    {done?"✅":started?l.emoji:"🔒"}
                  </div>
                </div>
                
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,color,fontWeight:800,letterSpacing:1,marginBottom:3}}>LESSON {i+1}</div>
                  <div style={{fontSize:15,fontWeight:900,color:DS.ink,marginBottom:2}}>{l.title}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{flex:1,background:DS.surfaceAlt,borderRadius:DS.r.full,height:6,overflow:"hidden"}}>
                      <div style={{width:`${pct}%`,height:"100%",background:done?`linear-gradient(90deg,${DS.mint},${DS.sky})`:`linear-gradient(90deg,${color},${color}bb)`,borderRadius:DS.r.full}}/>
                    </div>
                    <div style={{fontSize:11,fontWeight:900,color:done?DS.mint:color,whiteSpace:"nowrap"}}>{l.done}/20</div>
                  </div>
                </div>
                
                <div style={{flexShrink:0}}>
                  {done ? (
                    <div style={{background:`${DS.mint}15`,border:`1.5px solid ${DS.mint}40`,borderRadius:DS.r.sm,padding:"8px"}}>
                      <div style={{fontSize:18}}>🏆</div>
                    </div>
                  ) : isNext ? (
                    <div style={{
                      background:`linear-gradient(135deg,${color},${color}cc)`,
                      borderRadius:DS.r.sm,padding:"10px 14px",
                      animation:"mmPulse 1.5s ease-in-out infinite",
                    }}>
                      <div style={{fontSize:16,color:"white",fontWeight:900}}>▶</div>
                    </div>
                  ) : (
                    <div style={{fontSize:22,color:started?color:DS.ink3}}>›</div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
      <BottomNav active="map" onNav={onNav}/>
    </ScreenShell>
  );
}

// ─── SCREEN: GAME ────────────────────────────────────────────────

function GameScreen({ onNav }) {
  const [chosen, setChosen] = useState(null);
  const q = { q:"What is 7 × 8 = ?", opts:["54","56","63","72"], ans:1, h:"7 groups of 8 beads!" };
  const color = DS.grape;
  
  return (
    <ScreenShell>
      <Stars n={10}/>
      {/* Header */}
      <div style={{
        background:`${color}15`,borderBottom:`1.5px solid ${color}25`,padding:"12px 16px",
        position:"relative",zIndex:2,
      }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
          <button onClick={()=>onNav("map")} style={{width:38,height:38,borderRadius:DS.r.sm,background:`${color}15`,border:`1.5px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color,cursor:"pointer"}}>‹</button>
          <div style={{fontFamily:DS.font.body,fontSize:12,fontWeight:800,color}}>✖️ Multiplication · Set 1</div>
          <div style={{display:"flex",gap:3}}>{[1,2,3].map(i=><span key={i} style={{fontSize:13,opacity:i<=3?1:0.15}}>❤️</span>)}</div>
        </div>
        {/* Progress bar */}
        <div style={{background:`${color}18`,borderRadius:DS.r.full,height:7,overflow:"hidden"}}>
          <div style={{width:"35%",height:"100%",background:`linear-gradient(90deg,${color},${DS.sky})`,borderRadius:DS.r.full,boxShadow:`0 0 8px ${color}88`}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:3,fontSize:10,color:DS.ink2}}>
          <span>Q 7/20</span><span>Score: 6 ⭐</span>
        </div>
      </div>
      
      <div style={{flex:1,padding:"16px",position:"relative",zIndex:2,display:"flex",flexDirection:"column",gap:14}}>
        {/* Question card */}
        <Card color={color} style={{
          textAlign:"center",padding:"26px 18px",
          boxShadow: chosen===q.ans ? `0 0 40px ${DS.mint}50, ${DS.shadowDeep(DS.mint)}` : chosen!==null ? `0 0 20px ${DS.coral}35, ${DS.shadowDeep(DS.coral)}` : DS.shadowDeep(color),
          transition:"box-shadow 0.3s",
        }}>
          <div style={{fontSize:42,marginBottom:10,animation:"mmFloat 2s ease-in-out infinite"}}>✖️</div>
          <div style={{fontSize:22,fontWeight:900,color:DS.ink,lineHeight:1.5}}>
            {q.q}
          </div>
        </Card>
        
        {/* Answer grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {q.opts.map((opt,i) => {
            const isCorrect = i===q.ans;
            const isChosen = i===chosen;
            const answered = chosen!==null;
            
            let bg = DS.surface;
            let border = `2px solid ${color}25`;
            let col = DS.ink;
            let shadow = DS.shadow(color,0.4);
            
            if (answered) {
              if (isCorrect) { bg=`#E8FFF4`; border=`2.5px solid ${DS.mint}`; col=DS.mint; shadow=`0 0 24px ${DS.mint}55`; }
              else if (isChosen) { bg=`#FFF0F0`; border=`2.5px solid ${DS.coral}`; col=DS.coral; shadow="none"; }
            }
            
            return (
              <button key={i} onClick={()=>!answered&&setChosen(i)} style={{
                background:bg, border, borderRadius:DS.r.lg, padding:"18px 12px",
                fontSize:20, fontWeight:900, color:col,
                cursor:answered?"default":"pointer",
                boxShadow:shadow,
                transition:"all 0.2s",textAlign:"center",
                position:"relative",overflow:"hidden",
                animation:`mmPop 0.3s ease ${i*0.06}s both`,
              }}>
                {!answered && <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(255,255,255,0.5) 0%,transparent 100%)",pointerEvents:"none",borderRadius:DS.r.lg}}/>}
                <div style={{fontSize:10,fontWeight:900,color:answered&&isCorrect?DS.mint:answered&&isChosen?DS.coral:color,letterSpacing:0.5,marginBottom:4}}>
                  {["A","B","C","D"][i]}
                </div>
                {answered&&isCorrect?"✓ ":answered&&isChosen&&!isCorrect?"✗ ":""}{opt}
              </button>
            );
          })}
        </div>
        
        {/* Hint / feedback */}
        {!answered && (
          <button style={{
            background:`${DS.amber}10`,border:`1.5px solid ${DS.amber}30`,
            borderRadius:DS.r.md,padding:"12px 16px",cursor:"pointer",
            textAlign:"left",
          }}>
            <span style={{fontSize:13,color:DS.amber,fontWeight:700}}>💡 Tap for a cosmic hint!</span>
          </button>
        )}
        {chosen!==null && chosen===q.ans && (
          <div style={{
            background:`linear-gradient(135deg,${DS.mint}15,${DS.sky}10)`,
            border:`1.5px solid ${DS.mint}40`,
            borderRadius:DS.r.md,padding:"14px 16px",
            textAlign:"center",animation:"mmPop 0.35s ease",
          }}>
            <div style={{fontSize:26,marginBottom:4}}>🌟</div>
            <div style={{fontSize:16,fontWeight:900,color:DS.mint}}>Amazing! +20 XP</div>
          </div>
        )}
        {chosen!==null && chosen!==q.ans && (
          <div style={{
            background:`${DS.amber}10`,border:`1.5px solid ${DS.amber}30`,
            borderRadius:DS.r.md,padding:"12px 16px",animation:"mmPop 0.3s ease",
          }}>
            <div style={{fontSize:13,fontWeight:800,color:DS.amber}}>💡 Hint: {q.h}</div>
          </div>
        )}
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: RESULT ──────────────────────────────────────────────

function ResultScreen({ onNav }) {
  const color = DS.grape;
  return (
    <ScreenShell bg={`linear-gradient(160deg,${DS.bgWarm},${DS.bg})`}>
      <Stars n={25}/>
      {/* Confetti */}
      {Array.from({length:14}).map((_,i)=>(
        <div key={i} style={{
          position:"absolute",left:`${5+i*7}%`,top:"-20px",
          fontSize:14+i%3*4,
          animation:`mmConfetti ${1.2+i%4*0.3}s ease-in ${i%7*0.08}s both`,
          zIndex:0,pointerEvents:"none",
        }}>
          {["⭐","🎉","✨","🌟","🏆","💫","🎊"][i%7]}
        </div>
      ))}
      
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",position:"relative",zIndex:2,gap:16}}>
        
        {/* Trophy */}
        <div style={{fontSize:90,animation:"mmBounce 1.2s ease",filter:`drop-shadow(0 10px 20px ${DS.amber}55)`}}>🏆</div>
        
        {/* Title */}
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:DS.font.display,fontSize:28,color:DS.indigo,lineHeight:1}}>MISSION COMPLETE!</div>
          <div style={{fontSize:14,color:DS.ink2,marginTop:6}}>Multiplication · Set 1</div>
        </div>
        
        {/* Stars */}
        <div style={{display:"flex",gap:8}}>
          {[1,2,3].map(s=>(
            <span key={s} style={{fontSize:42,animation:`mmStarPop 0.4s ease ${s*0.15}s both`}}>⭐</span>
          ))}
        </div>
        
        {/* Score card */}
        <Card color={DS.grape} style={{width:"100%",maxWidth:320}}>
          <div style={{textAlign:"center",marginBottom:12}}>
            <div style={{fontSize:10,color:DS.ink3,fontWeight:700,letterSpacing:1}}>YOUR SCORE</div>
            <div style={{fontFamily:DS.font.display,fontSize:50,color:DS.ink,lineHeight:1,marginTop:4}}>
              18<span style={{fontSize:20,color:DS.ink2}}>/20</span>
            </div>
            <div style={{fontSize:15,fontWeight:900,color:DS.amber,marginTop:6}}>+360 XP 🌟 &nbsp; +30 Coins 🪙</div>
          </div>
          <div style={{background:`${DS.mint}14`,border:`1.5px solid ${DS.mint}40`,borderRadius:DS.r.sm,padding:"8px 12px",textAlign:"center"}}>
            <div style={{fontSize:14,fontWeight:800,color:DS.mint}}>🔓 Set 2 Unlocked!</div>
          </div>
        </Card>
        
        {/* Buttons */}
        <div style={{width:"100%",maxWidth:320,display:"flex",flexDirection:"column",gap:10}}>
          <BigBtn color={DS.indigo} icon="▶">Next Set</BigBtn>
          <div style={{display:"flex",gap:10}}>
            <button style={{flex:1,background:DS.surface,border:`1.5px solid ${DS.border}`,borderRadius:DS.r.md,padding:"12px",fontFamily:DS.font.body,fontWeight:700,fontSize:13,color:DS.ink2,cursor:"pointer",boxShadow:DS.shadow(DS.indigo,0.3)}}>↺ Retry</button>
            <button onClick={()=>onNav("map")} style={{flex:1,background:DS.surface,border:`1.5px solid ${DS.border}`,borderRadius:DS.r.md,padding:"12px",fontFamily:DS.font.body,fontWeight:700,fontSize:13,color:DS.ink2,cursor:"pointer",boxShadow:DS.shadow(DS.indigo,0.3)}}>🏠 Home</button>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: GAMES HUB ───────────────────────────────────────────

function GamesHubScreen({ onNav }) {
  const games = [
    {id:"rocket",  icon:"🚀",title:"Number Rocket",  desc:"Answer before fuel runs out!",     color:DS.coral},
    {id:"catcher", icon:"⭐",title:"Star Catcher",   desc:"Catch the right answers!",          color:DS.amber},
    {id:"maze",    icon:"🌀",title:"Math Maze",       desc:"Solve puzzles to move forward!",   color:DS.mint},
    {id:"speed",   icon:"⚡",title:"Speed Math",      desc:"60 seconds — go as fast as you can!", color:DS.grape},
    {id:"memory",  icon:"🧠",title:"Number Memory",  desc:"Remember the sequence!",            color:DS.rose},
    {id:"cardflip",icon:"🃏",title:"Card Flip",       desc:"Match equations with answers!",     color:DS.sky},
    {id:"balance", icon:"⚖️",title:"Equation Balance",desc:"Pick the right answer fast!",      color:DS.coral},
    {id:"sequence",icon:"🔢",title:"Sequence Builder",desc:"Find the missing pattern!",         color:DS.mint},
  ];
  
  return (
    <ScreenShell>
      <Stars n={15}/>
      {/* Header */}
      <div style={{
        background:`linear-gradient(135deg,${DS.sky}18,${DS.grape}10)`,
        borderBottom:`1.5px solid ${DS.sky}25`,padding:"16px 18px",
        position:"relative",zIndex:2,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <button onClick={()=>onNav("home")} style={{width:40,height:40,borderRadius:DS.r.sm,background:`${DS.sky}15`,border:`1.5px solid ${DS.sky}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:DS.sky,cursor:"pointer"}}>‹</button>
          <div style={{
            width:44,height:44,borderRadius:DS.r.sm,
            background:`linear-gradient(135deg,${DS.sky},${DS.grape})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:22,flexShrink:0,boxShadow:DS.shadow(DS.sky),
          }}>🎮</div>
          <div>
            <div style={{fontSize:11,color:DS.sky,fontWeight:800,letterSpacing:2}}>GAMES HUB</div>
            <div style={{fontSize:16,fontWeight:900,color:DS.ink}}>Play & Earn XP</div>
            <div style={{fontSize:11,color:DS.ink2}}>8 mini-games available</div>
          </div>
        </div>
      </div>
      
      {/* Games list */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:10,paddingBottom:80,position:"relative",zIndex:2}}>
        {games.map((g,i)=>(
          <button key={g.id} style={{
            background:DS.surface,
            border:`1.5px solid ${g.color}25`,
            borderRadius:DS.r.lg,padding:"16px",cursor:"pointer",
            display:"flex",alignItems:"center",gap:14,
            boxShadow:DS.shadowDeep(g.color),textAlign:"left",
            animation:`mmSlideUp 0.35s ease ${i*0.06}s both`,
            position:"relative",overflow:"hidden",
          }}>
            {/* Color accent bar */}
            <div style={{position:"absolute",top:0,left:0,bottom:0,width:3,background:`linear-gradient(180deg,${g.color},${g.color}66)`,borderRadius:"8px 0 0 8px"}}/>
            <div style={{
              width:52,height:52,borderRadius:DS.r.md,
              background:`${g.color}14`,border:`1.5px solid ${g.color}30`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,
              boxShadow:DS.shadow(g.color,0.5),
            }}>{g.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:900,color:DS.ink,marginBottom:3}}>{g.title}</div>
              <div style={{fontSize:12,color:DS.ink2,fontWeight:600}}>{g.desc}</div>
            </div>
            <div style={{
              width:32,height:32,borderRadius:DS.r.full,
              background:`${g.color}15`,border:`1.5px solid ${g.color}30`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:16,color:g.color,
            }}>›</div>
          </button>
        ))}
      </div>
      <BottomNav active="games" onNav={onNav}/>
    </ScreenShell>
  );
}

// ─── SCREEN: BADGES ──────────────────────────────────────────────

function BadgesScreen({ onNav }) {
  const badges = [
    {id:"first_lesson",  name:"First Step",     icon:"👣", desc:"Complete your first set",       cat:"general", earned:true},
    {id:"streak_3",      name:"On a Roll",       icon:"🔥", desc:"3-day streak",                  cat:"streak",  earned:true},
    {id:"streak_7",      name:"On Fire",         icon:"🔥", desc:"7-day streak",                  cat:"streak",  earned:false},
    {id:"perfect_score", name:"Perfectionist",   icon:"🎯", desc:"Get 3 stars on any set",        cat:"master",  earned:true},
    {id:"speed_solver",  name:"Speed Solver",    icon:"⚡", desc:"Answer correctly in under 5s",  cat:"speed",   earned:false},
    {id:"correct_100",   name:"Century",         icon:"💯", desc:"100 correct answers",           cat:"general", earned:true},
    {id:"correct_500",   name:"Math Machine",    icon:"🤖", desc:"500 correct answers",           cat:"general", earned:false},
    {id:"boss_first",    name:"Monster Slayer",  icon:"⚔️", desc:"Defeat your first boss",        cat:"master",  earned:false},
    {id:"stars_50",      name:"Star Collector",  icon:"⭐", desc:"Earn 50 stars total",           cat:"general", earned:true},
  ];
  const earnedCount = badges.filter(b=>b.earned).length;
  
  return (
    <ScreenShell>
      <Stars n={20}/>
      {/* Hero header */}
      <div style={{
        background:`linear-gradient(135deg,${DS.amber}18,${DS.coral}10)`,
        padding:"16px 18px",position:"relative",zIndex:2,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <button onClick={()=>onNav("home")} style={{width:40,height:40,borderRadius:DS.r.sm,background:`${DS.amber}15`,border:`1.5px solid ${DS.amber}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:DS.amber,cursor:"pointer"}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:900,color:DS.ink}}>🏅 Achievements</div>
            <div style={{fontSize:12,color:DS.ink2,marginTop:2}}>{earnedCount} / {badges.length} badges unlocked</div>
          </div>
        </div>
        <div style={{background:DS.surfaceAlt,borderRadius:DS.r.full,height:10,overflow:"hidden"}}>
          <div style={{width:`${(earnedCount/badges.length)*100}%`,height:"100%",background:`linear-gradient(90deg,${DS.amber},${DS.coral})`,borderRadius:DS.r.full,boxShadow:`0 0 8px ${DS.amber}55`}}/>
        </div>
      </div>
      
      {/* Badge grid */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px",paddingBottom:80,position:"relative",zIndex:2}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {badges.map((b,i)=>(
            <Card key={b.id} color={b.earned?DS.amber:DS.indigo} style={{
              padding:"14px 8px",textAlign:"center",
              opacity:b.earned?1:0.45,
              animation:`mmPop 0.4s ease ${i*0.05}s both`,
              background:b.earned?`${DS.surface}`:DS.surface,
              border:`1.5px solid ${b.earned?DS.amber+"55":DS.border}`,
            }}>
              <div style={{fontSize:32,marginBottom:6,filter:b.earned?"none":"grayscale(1)"}}>{b.icon}</div>
              <div style={{fontSize:11,fontWeight:900,color:b.earned?DS.ink:DS.ink3,marginBottom:3,lineHeight:1.2}}>{b.name}</div>
              <div style={{fontSize:9,color:DS.ink3,lineHeight:1.3}}>{b.desc}</div>
              {b.earned&&<div style={{marginTop:6,background:`${DS.amber}18`,borderRadius:DS.r.full,padding:"2px 8px",fontSize:9,color:DS.amber,fontWeight:800}}>EARNED ✓</div>}
            </Card>
          ))}
        </div>
      </div>
      <BottomNav active="badges" onNav={onNav}/>
    </ScreenShell>
  );
}

// ─── SCREEN: STUDENT LOGIN ───────────────────────────────────────

function StudentLoginScreen({ onNav }) {
  const [step, setStep] = useState("school");
  const [code, setCode] = useState("");
  
  return (
    <ScreenShell bg={`linear-gradient(160deg,${DS.bgWarm},${DS.bg})`}>
      <Stars n={18}/>
      <Blob color={DS.indigo} size={160} style={{top:-40,right:-40,opacity:0.5}}/>
      <Blob color={DS.coral} size={120} style={{bottom:60,left:-30,opacity:0.4}}/>
      
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"24px 20px",position:"relative",zIndex:2}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
          <button onClick={()=>onNav("home")} style={{width:40,height:40,borderRadius:DS.r.sm,background:`${DS.indigo}15`,border:`1.5px solid ${DS.indigo}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:DS.indigo,cursor:"pointer"}}>‹</button>
          <div style={{fontFamily:DS.font.body,fontSize:14,fontWeight:800,color:DS.indigo}}>STUDENT LOGIN</div>
        </div>
        
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:52,marginBottom:8}}>🏫</div>
          <div style={{fontFamily:DS.font.display,fontSize:20,color:DS.indigo}}>SCHOOL EDITION</div>
          <div style={{fontSize:12,color:DS.ink2,marginTop:4}}>Login with your school code</div>
        </div>
        
        <Card color={DS.indigo} style={{gap:14,display:"flex",flexDirection:"column"}}>
          <div>
            <div style={{fontSize:11,color:DS.indigo,fontWeight:800,letterSpacing:2,marginBottom:8}}>SCHOOL CODE</div>
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())}
              placeholder="e.g. MATH001"
              style={{
                width:"100%",background:DS.surfaceAlt,
                border:`2px solid ${DS.indigo}25`,borderRadius:DS.r.sm,
                padding:"14px",color:DS.ink,fontFamily:DS.font.body,
                fontSize:20,letterSpacing:4,textAlign:"center",fontWeight:900,
                outline:"none",
              }}
            />
          </div>
          <div>
            <div style={{fontSize:11,color:DS.indigo,fontWeight:800,letterSpacing:2,marginBottom:8}}>USERNAME / ROLL NO</div>
            <input placeholder="Your username"
              style={{
                width:"100%",background:DS.surfaceAlt,
                border:`2px solid ${DS.indigo}25`,borderRadius:DS.r.sm,
                padding:"14px",color:DS.ink,fontFamily:DS.font.body,
                fontSize:15,outline:"none",
              }}
            />
          </div>
          <div>
            <div style={{fontSize:11,color:DS.indigo,fontWeight:800,letterSpacing:2,marginBottom:8}}>4-DIGIT PIN</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              {[0,1,2,3].map(i=>(
                <div key={i} style={{
                  width:50,height:55,borderRadius:DS.r.sm,
                  background:i<2?DS.surface:DS.surfaceAlt,
                  border:`2px solid ${i<2?DS.indigo+"55":DS.border}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:24,
                  boxShadow:i<2?DS.shadow(DS.indigo,0.5):"none",
                }}>{i<2?"●":""}</div>
              ))}
            </div>
          </div>
          <BigBtn color={DS.indigo} icon="🚀">ENTER ACADEMY</BigBtn>
        </Card>
        
        <div style={{textAlign:"center",marginTop:16}}>
          <button style={{background:"none",border:"none",color:DS.ink3,fontSize:12,cursor:"pointer",fontFamily:DS.font.body}}>← Change school code</button>
        </div>
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: PARENT DASH ─────────────────────────────────────────

function ParentDashScreen({ onNav }) {
  return (
    <ScreenShell>
      <Stars n={12}/>
      {/* Header */}
      <div style={{
        background:`linear-gradient(135deg,${DS.rose}18,${DS.grape}10)`,
        borderBottom:`1.5px solid ${DS.rose}20`,
        padding:"16px 18px 14px",position:"relative",zIndex:2,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <button onClick={()=>onNav("home")} style={{width:40,height:40,borderRadius:DS.r.sm,background:`${DS.rose}15`,border:`1.5px solid ${DS.rose}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:DS.rose,cursor:"pointer"}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:DS.rose,fontWeight:800,letterSpacing:2}}>PARENT DASHBOARD</div>
            <div style={{fontSize:17,fontWeight:900,color:DS.ink}}>📊 Aarav's Report</div>
          </div>
          {/* Grade badge */}
          <div style={{
            width:52,height:52,borderRadius:DS.r.md,
            background:`${DS.mint}18`,border:`2px solid ${DS.mint}44`,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            boxShadow:DS.shadow(DS.mint),
          }}>
            <div style={{fontFamily:DS.font.display,fontSize:18,color:DS.mint,lineHeight:1}}>A</div>
            <div style={{fontSize:8,color:DS.ink3}}>GRADE</div>
          </div>
        </div>
        
        {/* Child info */}
        <div style={{
          background:"rgba(255,255,255,0.7)",borderRadius:DS.r.md,
          padding:"10px 14px",display:"flex",alignItems:"center",gap:12,
          border:`1.5px solid ${DS.border}`,
        }}>
          <div style={{width:44,height:44,borderRadius:DS.r.sm,background:`linear-gradient(135deg,${DS.grape}25,${DS.rose}15)`,border:`1.5px solid ${DS.grape}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🧒</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:900,color:DS.ink}}>Aarav</div>
            <div style={{fontSize:11,color:DS.ink2}}>Class 3 · Level 7 · Free Plan</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:20,fontWeight:900,color:DS.coral}}>6🔥</div>
            <div style={{fontSize:9,color:DS.ink3}}>Day Streak</div>
          </div>
        </div>
      </div>
      
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px",paddingBottom:20,position:"relative",zIndex:2}}>
        
        {/* KPI row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
          {[
            {e:"⭐",v:71,   l:"Stars",    c:DS.amber},
            {e:"📚",v:"37/160",l:"Sets",  c:DS.sky},
            {e:"🎯",v:"82%", l:"Accuracy",c:DS.mint},
            {e:"💎",v:1420,  l:"XP",      c:DS.grape},
          ].map((s,i)=>(
            <Card key={i} color={s.c} style={{padding:"10px 5px",textAlign:"center"}}>
              <div style={{fontSize:18}}>{s.e}</div>
              <div style={{fontSize:13,fontWeight:900,color:DS.ink,marginTop:2}}>{s.v}</div>
              <div style={{fontSize:9,color:DS.ink3,fontWeight:700}}>{s.l}</div>
            </Card>
          ))}
        </div>
        
        {/* Performance rings */}
        <Card color={DS.grape} style={{marginBottom:14}}>
          <div style={{fontFamily:DS.font.body,fontSize:11,fontWeight:800,color:DS.grape,letterSpacing:1.5,marginBottom:14}}>📊 PERFORMANCE AT A GLANCE</div>
          <div style={{display:"flex",justifyContent:"space-around"}}>
            {[
              {pct:26,color:DS.sky,   label:"Progress",   sub:"37/160"},
              {pct:82,color:DS.mint,  label:"Accuracy",   sub:"226/276"},
              {pct:20,color:DS.coral, label:"Consistency",sub:"6 day streak"},
            ].map((d,i)=>{
              const r=22,circ=2*Math.PI*r;
              return (
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{position:"relative"}}>
                    <svg width="56" height="56" style={{transform:"rotate(-90deg)"}}>
                      <circle cx="28" cy="28" r={r} fill="none" stroke={`${d.color}18`} strokeWidth="5"/>
                      <circle cx="28" cy="28" r={r} fill="none" stroke={d.color} strokeWidth="5"
                        strokeDasharray={`${circ*d.pct/100} ${circ}`} strokeLinecap="round"/>
                    </svg>
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:d.color}}>{d.pct}%</div>
                  </div>
                  <div style={{fontSize:10,fontWeight:800,color:DS.ink,textAlign:"center"}}>{d.label}</div>
                  <div style={{fontSize:9,color:DS.ink3,textAlign:"center"}}>{d.sub}</div>
                </div>
              );
            })}
          </div>
        </Card>
        
        {/* Strengths / weaknesses */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <Card color={DS.mint} style={{background:`${DS.mint}0a`}}>
            <div style={{fontSize:11,fontWeight:900,color:DS.mint,marginBottom:8,letterSpacing:1}}>💪 STRONG</div>
            {["Numbers","Addition","Shapes"].map((t,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                <span style={{fontSize:12}}>✅</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:800,color:DS.ink}}>{t}</div>
                  <div style={{fontSize:9,color:DS.mint}}>88%+</div>
                </div>
              </div>
            ))}
          </Card>
          <Card color={DS.coral} style={{background:`${DS.coral}07`}}>
            <div style={{fontSize:11,fontWeight:900,color:DS.coral,marginBottom:8,letterSpacing:1}}>⚠️ NEEDS WORK</div>
            {["Fractions","Division"].map((t,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                <span style={{fontSize:12}}>📌</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:800,color:DS.ink}}>{t}</div>
                  <div style={{fontSize:9,color:DS.coral}}>Below 60%</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: SHOP ────────────────────────────────────────────────

function ShopScreen({ onNav }) {
  const items = [
    {id:"avatar_wizard",  name:"Math Wizard",  icon:"🧙‍♂️", desc:"Legendary wizard",     cat:"avatar",  cost:"50💎",   owned:false, lvl:5},
    {id:"avatar_unicorn", name:"Unicorn",       icon:"🦄",   desc:"Magical unicorn",      cat:"avatar",  cost:"300🪙",  owned:true,  lvl:3},
    {id:"avatar_robot",   name:"Robot",         icon:"🤖",   desc:"Futuristic robot",     cat:"avatar",  cost:"30💎",   owned:false, lvl:4},
    {id:"avatar_dragon",  name:"Dragon",        icon:"🐉",   desc:"Mighty dragon",        cat:"avatar",  cost:"80💎",   owned:false, lvl:8},
    {id:"powerup_double", name:"Double XP",     icon:"⚡",   desc:"2× XP for 3 sets",     cat:"powerup", cost:"20💎",   owned:false, lvl:3},
    {id:"powerup_shield", name:"Shield Pack",   icon:"🛡️",  desc:"Extra 2 lives",        cat:"powerup", cost:"150🪙",  owned:false, lvl:2},
  ];
  
  return (
    <ScreenShell>
      <Stars n={12}/>
      {/* Hero header */}
      <div style={{
        background:`linear-gradient(135deg,${DS.mint},${DS.sky})`,
        padding:"16px 18px",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <button onClick={()=>onNav("home")} style={{width:40,height:40,borderRadius:DS.r.sm,background:"rgba(255,255,255,0.25)",border:"1.5px solid rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"white",cursor:"pointer"}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:900,color:"white"}}>🛒 Reward Shop</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {[{e:"⭐",v:"71 Stars"},{e:"💎",v:"12 Gems"},{e:"🪙",v:"340 Coins"}].map((c,i)=>(
            <div key={i} style={{flex:1,background:"rgba(255,255,255,0.22)",borderRadius:DS.r.sm,padding:"8px 6px",textAlign:"center",border:"1px solid rgba(255,255,255,0.3)"}}>
              <div style={{fontSize:18}}>{c.e}</div>
              <div style={{fontSize:11,fontWeight:900,color:"white",marginTop:2}}>{c.v}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px",paddingBottom:20,position:"relative",zIndex:2}}>
        {/* Tabs */}
        <div style={{display:"flex",gap:0,background:DS.surfaceAlt,borderRadius:DS.r.md,padding:3,marginBottom:14}}>
          {["🎭 Avatars","⚡ Power-ups","🎨 Themes"].map((t,i)=>(
            <button key={i} style={{
              flex:1,background:i===0?DS.surface:"transparent",border:"none",
              borderRadius:DS.r.sm,padding:"9px 4px",
              fontSize:11,fontWeight:i===0?900:700,
              color:i===0?DS.indigo:DS.ink3,
              cursor:"pointer",
              boxShadow:i===0?DS.shadow(DS.indigo,0.3):"none",
              transition:"all 0.2s",fontFamily:DS.font.body,
            }}>{t}</button>
          ))}
        </div>
        
        {/* Items grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {items.map((item,i)=>(
            <Card key={item.id} color={item.owned?DS.mint:DS.indigo} style={{
              textAlign:"center",
              border:`1.5px solid ${item.owned?DS.mint+"44":DS.border}`,
              animation:`mmPop 0.3s ease ${i*0.06}s both`,
            }}>
              <div style={{fontSize:38,marginBottom:8,filter:`drop-shadow(0 4px 8px ${DS.indigo}30)`}}>{item.icon}</div>
              <div style={{fontSize:13,fontWeight:900,color:DS.ink,marginBottom:3}}>{item.name}</div>
              <div style={{fontSize:10,color:DS.ink2,marginBottom:10,lineHeight:1.4}}>{item.desc}</div>
              {item.owned ? (
                <div style={{background:`${DS.mint}15`,borderRadius:DS.r.full,padding:"5px 10px",fontSize:11,color:DS.mint,fontWeight:800}}>✅ Owned</div>
              ) : (
                <button style={{
                  width:"100%",background:`linear-gradient(135deg,${DS.indigo},${DS.grape})`,
                  border:"none",borderRadius:DS.r.sm,padding:"7px 10px",
                  fontSize:12,fontWeight:900,color:"white",cursor:"pointer",
                  boxShadow:DS.btn(DS.indigo),fontFamily:DS.font.body,
                }}>{item.cost}</button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}

// ─── DESIGN SYSTEM PREVIEW ───────────────────────────────────────

function DesignSystemPreview({ onNav }) {
  return (
    <ScreenShell>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px"}}>
        <div style={{fontFamily:DS.font.display,fontSize:22,color:DS.indigo,marginBottom:4}}>Design System</div>
        <div style={{fontSize:12,color:DS.ink2,marginBottom:20}}>MathMagic Cosmic Candy v2.0</div>
        
        {/* Colors */}
        <div style={{fontFamily:DS.font.body,fontSize:11,fontWeight:800,color:DS.ink2,letterSpacing:2,marginBottom:10}}>COLOUR PALETTE</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
          {[
            {c:DS.indigo,n:"Indigo"},{c:DS.coral,n:"Coral"},
            {c:DS.amber,n:"Amber"},{c:DS.mint,n:"Mint"},
            {c:DS.sky,n:"Sky"},{c:DS.grape,n:"Grape"},
            {c:DS.rose,n:"Rose"},{c:DS.ink,n:"Ink"},
          ].map((cl,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{width:44,height:44,borderRadius:DS.r.sm,background:cl.c,boxShadow:DS.shadow(cl.c),marginBottom:4}}/>
              <div style={{fontSize:9,color:DS.ink2,fontWeight:700}}>{cl.n}</div>
            </div>
          ))}
        </div>
        
        {/* Typography */}
        <div style={{fontFamily:DS.font.body,fontSize:11,fontWeight:800,color:DS.ink2,letterSpacing:2,marginBottom:10}}>TYPOGRAPHY</div>
        <Card color={DS.indigo} style={{marginBottom:20,display:"flex",flexDirection:"column",gap:8}}>
          <div style={{fontFamily:DS.font.display,fontSize:28,color:DS.indigo}}>MathMagic</div>
          <div style={{fontFamily:DS.font.body,fontSize:18,fontWeight:900,color:DS.ink}}>Heading Level 1</div>
          <div style={{fontFamily:DS.font.body,fontSize:15,fontWeight:700,color:DS.ink}}>Heading Level 2</div>
          <div style={{fontFamily:DS.font.body,fontSize:13,fontWeight:600,color:DS.ink2}}>Body text — regular</div>
          <div style={{fontFamily:DS.font.mono,fontSize:12,color:DS.grape}}>DM Mono — labels & data</div>
        </Card>
        
        {/* Buttons */}
        <div style={{fontFamily:DS.font.body,fontSize:11,fontWeight:800,color:DS.ink2,letterSpacing:2,marginBottom:10}}>BUTTONS</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          <BigBtn color={DS.indigo} icon="🚀">Primary Action</BigBtn>
          <BigBtn color={DS.coral} icon="🎯">Secondary Action</BigBtn>
          <BigBtn color={DS.mint} icon="✅" small>Small Button</BigBtn>
          <BigBtn color={DS.indigo} disabled>Disabled State</BigBtn>
        </div>
        
        {/* Chips */}
        <div style={{fontFamily:DS.font.body,fontSize:11,fontWeight:800,color:DS.ink2,letterSpacing:2,marginBottom:10}}>CHIPS & BADGES</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
          <Chip color={DS.indigo}>📚 CBSE</Chip>
          <Chip color={DS.coral}>🔥 Streak</Chip>
          <Chip color={DS.mint} size="lg">✅ Completed</Chip>
          <Chip color={DS.amber}>⭐ Premium</Chip>
          <Chip color={DS.grape}>🆕 New</Chip>
        </div>
        
        {/* Cards */}
        <div style={{fontFamily:DS.font.body,fontSize:11,fontWeight:800,color:DS.ink2,letterSpacing:2,marginBottom:10}}>CARD VARIANTS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {[DS.indigo,DS.coral,DS.mint,DS.amber].map((c,i)=>(
            <Card key={i} color={c} style={{textAlign:"center",padding:"16px 10px"}}>
              <div style={{fontSize:28,marginBottom:6}}>{"⭐🎯🏆🚀"[i]}</div>
              <div style={{fontSize:13,fontWeight:800,color:DS.ink}}>Card {i+1}</div>
              <div style={{fontSize:10,color:DS.ink2,marginTop:2}}>3D shadow depth</div>
            </Card>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}

// ─── MAIN APP SHELL ──────────────────────────────────────────────


// ─── SCREEN: STUDENT ENTRY ───────────────────────────────────────────────────

function StudentEntryScreen({ onNav }) {
  return (
    <ScreenShell bg={`linear-gradient(160deg,${DS.bgWarm},${DS.bg})`}>
      <Stars n={18}/>
      <Blob color={DS.indigo} size={160} style={{top:-40,right:-40,opacity:0.5}}/>
      <Blob color={DS.mint} size={120} style={{bottom:60,left:-30,opacity:0.4}}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"32px 20px 24px",position:"relative",zIndex:2}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:52,marginBottom:10,animation:"mmFloat 3s ease-in-out infinite"}}>🧒</div>
          <div style={{fontFamily:DS.font.display,fontSize:22,color:DS.indigo}}>HOW DO YOU LEARN?</div>
          <div style={{fontSize:12,color:DS.ink2,marginTop:4}}>Choose your learning path</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[
            {icon:"🏫",label:"School Student",sub:"Login with school code & PIN",s:"login",color:DS.indigo},
            {icon:"🏠",label:"Home Learner",sub:"Use email & password",s:"home",color:DS.mint},
            {icon:"✨",label:"New Registration",sub:"Join MathMagic today!",s:"register",color:DS.coral},
          ].map((r,i)=>(
            <button key={i} onClick={()=>onNav(r.s)} className="mm-card-press"
              style={{
                background:DS.surface,border:`2px solid ${r.color}28`,
                borderRadius:DS.r.lg,padding:"18px 20px",cursor:"pointer",
                display:"flex",alignItems:"center",gap:16,textAlign:"left",
                boxShadow:DS.shadowDeep(r.color),
                animation:`mmSlideUp 0.4s ease ${i*0.1}s both`,
              }}>
              <div style={{
                width:54,height:54,borderRadius:DS.r.md,
                background:`linear-gradient(135deg,${r.color}28,${r.color}10)`,
                border:`2px solid ${r.color}35`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,
                boxShadow:DS.shadow(r.color),
              }}>{r.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:900,color:DS.ink,marginBottom:3}}>{r.label}</div>
                <div style={{fontSize:12,color:DS.ink2,fontWeight:600}}>{r.sub}</div>
              </div>
              <div style={{fontSize:20,color:r.color}}>›</div>
            </button>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:20,fontSize:11,color:DS.ink3}}>🔒 Safe · No ads · COPPA compliant</div>
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: SET PATH MAP ────────────────────────────────────────────────────

function SetPathMapScreen({ onNav }) {
  const color = DS.grape;
  const sets = Array.from({length:20},(_,i)=>({
    id:i+1,
    done: i<7, current: i===7, locked: i>7,
    stars: i<5?3:i<7?2:0,
  }));
  return (
    <ScreenShell>
      <Stars n={12}/>
      <div style={{
        background:`linear-gradient(135deg,${color}20,${DS.indigo}10)`,
        borderBottom:`1.5px solid ${color}20`,
        padding:"14px 18px",position:"relative",zIndex:2,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>onNav("map")} style={{width:40,height:40,borderRadius:DS.r.sm,background:`${color}15`,border:`1.5px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color,cursor:"pointer"}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color,fontWeight:800,letterSpacing:2}}>MULTIPLICATION · LESSON 3</div>
            <div style={{fontSize:16,fontWeight:900,color:DS.ink}}>Choose a Set</div>
          </div>
          <Chip color={color}>7/20 done</Chip>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px",paddingBottom:20,position:"relative",zIndex:2}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {sets.map((s,i)=>(
            <button key={s.id} style={{
              background: s.done?`${DS.mint}12`:s.current?DS.surface:DS.surfaceAlt,
              border:`2px solid ${s.done?DS.mint+"44":s.current?color+"55":DS.border}`,
              borderRadius:DS.r.md,padding:"14px 6px",
              cursor:s.locked?"not-allowed":"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",gap:6,
              boxShadow:s.current?DS.shadowDeep(color):s.done?DS.shadow(DS.mint,0.5):"none",
              transform:s.current?"scale(1.06)":"scale(1)",
              animation:`mmPop 0.3s ease ${i*0.04}s both`,
              position:"relative",overflow:"hidden",
            }}>
              {s.current && <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${color}08,transparent)`,pointerEvents:"none"}}/>}
              <div style={{fontSize:s.locked?18:20}}>{s.locked?"🔒":s.current?"▶":s.done?"✅":"⭐"}</div>
              <div style={{fontSize:13,fontWeight:900,color:s.done?DS.mint:s.current?color:DS.ink3}}>
                {s.id}
              </div>
              {s.done && (
                <div style={{display:"flex",gap:1}}>
                  {[1,2,3].map(x=><span key={x} style={{fontSize:8,opacity:x<=s.stars?1:0.2}}>⭐</span>)}
                </div>
              )}
              {s.current && <div style={{fontSize:8,fontWeight:900,color,letterSpacing:0.5}}>NEXT</div>}
            </button>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: ABACUS ──────────────────────────────────────────────────────────

function AbacusScreen({ onNav }) {
  const color = DS.amber;
  const beads = [7,4,9,3,6,5,8,2,7,4];
  return (
    <ScreenShell>
      <Stars n={10}/>
      <div style={{background:`linear-gradient(135deg,${color}18,${DS.coral}10)`,borderBottom:`1.5px solid ${color}20`,padding:"14px 18px",position:"relative",zIndex:2}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>onNav("home")} style={{width:40,height:40,borderRadius:DS.r.sm,background:`${color}15`,border:`1.5px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color,cursor:"pointer"}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color,fontWeight:800,letterSpacing:2}}>ABACUS TRAINER</div>
            <div style={{fontSize:16,fontWeight:900,color:DS.ink}}>Count the beads!</div>
          </div>
          <Chip color={color}>Level 3</Chip>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px",position:"relative",zIndex:2,display:"flex",flexDirection:"column",gap:16}}>
        <Card color={color} style={{textAlign:"center",padding:"20px 16px"}}>
          <div style={{fontSize:13,color,fontWeight:800,letterSpacing:1,marginBottom:16}}>ABACUS</div>
          <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:16}}>
            {beads.map((b,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                {Array.from({length:10}).map((_,j)=>(
                  <div key={j} style={{
                    width:16,height:16,borderRadius:"50%",
                    background:j<b?`linear-gradient(135deg,${color},${DS.coral})`:DS.surfaceAlt,
                    border:`1.5px solid ${j<b?color:DS.border}`,
                    boxShadow:j<b?`0 2px 6px ${color}44`:"none",
                  }}/>
                ))}
                <div style={{fontSize:11,fontWeight:900,color,marginTop:4}}>{b}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:18,fontWeight:900,color:DS.ink}}>What number is shown?</div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {["65","63","67","61"].map((opt,i)=>(
            <button key={i} style={{
              background:DS.surface,border:`2px solid ${color}25`,borderRadius:DS.r.lg,
              padding:"18px",fontSize:22,fontWeight:900,color:DS.ink,cursor:"pointer",
              boxShadow:DS.shadow(color,0.5),textAlign:"center",
              animation:`mmPop 0.3s ease ${i*0.07}s both`,
            }}>{opt}</button>
          ))}
        </div>
        <Card color={DS.mint} style={{textAlign:"center",background:`${DS.mint}08`}}>
          <div style={{fontSize:13,fontWeight:800,color:DS.mint}}>💡 Tip: Add each column top to bottom!</div>
        </Card>
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: OLYMPIAD ────────────────────────────────────────────────────────

function OlympiadScreen({ onNav }) {
  const color = DS.sky;
  const contests = [
    {id:1,name:"Weekly Sprint",icon:"⚡",desc:"20 Qs · 10 mins",prize:"500 XP",status:"live",color:DS.coral},
    {id:2,name:"Class 3 Cup",icon:"🏆",desc:"50 Qs · 30 mins",prize:"2000 XP + Badge",status:"upcoming",color:DS.amber},
    {id:3,name:"Math Masters",icon:"🎓",desc:"100 Qs · 60 mins",prize:"5000 XP + Trophy",status:"upcoming",color:DS.grape},
    {id:4,name:"Speed Round",icon:"🚀",desc:"10 Qs · 3 mins",prize:"200 XP",status:"ended",color:DS.mint},
  ];
  return (
    <ScreenShell>
      <Stars n={15}/>
      <div style={{background:`linear-gradient(135deg,${color}18,${DS.grape}10)`,borderBottom:`1.5px solid ${color}20`,padding:"14px 18px",position:"relative",zIndex:2}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>onNav("home")} style={{width:40,height:40,borderRadius:DS.r.sm,background:`${color}15`,border:`1.5px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color,cursor:"pointer"}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color,fontWeight:800,letterSpacing:2}}>OLYMPIAD</div>
            <div style={{fontSize:16,fontWeight:900,color:DS.ink}}>Compete & Win!</div>
          </div>
          <Chip color={DS.amber}>Rank #42</Chip>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:12,position:"relative",zIndex:2}}>
        <Card color={DS.grape} style={{background:`linear-gradient(135deg,${DS.grape}15,${DS.indigo}08)`}}>
          <div style={{display:"flex",justifyContent:"space-around",textAlign:"center"}}>
            {[{e:"🏆",v:"3rd",l:"Best Rank"},{e:"⭐",v:"12",l:"Contests"},{e:"🎖️",v:"4",l:"Medals"}].map((s,i)=>(
              <div key={i}>
                <div style={{fontSize:22}}>{s.e}</div>
                <div style={{fontSize:18,fontWeight:900,color:DS.ink}}>{s.v}</div>
                <div style={{fontSize:9,color:DS.ink3}}>{s.l}</div>
              </div>
            ))}
          </div>
        </Card>
        {contests.map((c,i)=>(
          <button key={c.id} style={{
            background:DS.surface,border:`1.5px solid ${c.color}30`,
            borderRadius:DS.r.lg,padding:"16px",cursor:c.status==="ended"?"not-allowed":"pointer",
            display:"flex",alignItems:"center",gap:14,textAlign:"left",
            boxShadow:DS.shadowDeep(c.color),opacity:c.status==="ended"?0.6:1,
            animation:`mmSlideUp 0.35s ease ${i*0.07}s both`,position:"relative",overflow:"hidden",
          }}>
            <div style={{position:"absolute",top:0,left:0,bottom:0,width:3,background:`linear-gradient(180deg,${c.color},${c.color}66)`,borderRadius:"8px 0 0 8px"}}/>
            <div style={{width:50,height:50,borderRadius:DS.r.md,background:`${c.color}14`,border:`1.5px solid ${c.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{c.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:900,color:DS.ink}}>{c.name}</div>
              <div style={{fontSize:11,color:DS.ink2,marginTop:2}}>{c.desc}</div>
              <div style={{fontSize:11,color:c.color,fontWeight:800,marginTop:3}}>🎁 {c.prize}</div>
            </div>
            <div style={{
              padding:"5px 10px",borderRadius:DS.r.full,fontSize:10,fontWeight:900,
              background:c.status==="live"?`${DS.coral}18`:c.status==="upcoming"?`${DS.mint}18`:`${DS.ink3}18`,
              color:c.status==="live"?DS.coral:c.status==="upcoming"?DS.mint:DS.ink3,
              border:`1.5px solid ${c.status==="live"?DS.coral:c.status==="upcoming"?DS.mint:DS.ink3}30`,
            }}>{c.status==="live"?"🔴 LIVE":c.status==="upcoming"?"SOON":"ENDED"}</div>
          </button>
        ))}
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: BAZAAR ──────────────────────────────────────────────────────────

function BazaarScreen({ onNav }) {
  const color = DS.coral;
  const lessons = [
    {icon:"🛒",title:"Shopping Math",desc:"Calculate totals, discounts & change",tag:"NEW",color:DS.coral},
    {icon:"🍕",title:"Pizza Portions",desc:"Fractions with real food!",tag:"",color:DS.amber},
    {icon:"📏",title:"Measure It!",desc:"Length, weight & volume",tag:"",color:DS.mint},
    {icon:"🕐",title:"Time Tables",desc:"Reading clocks & schedules",tag:"HOT",color:DS.grape},
    {icon:"💰",title:"Money Matters",desc:"Coins, notes & budgeting",tag:"",color:DS.sky},
  ];
  return (
    <ScreenShell>
      <Stars n={12}/>
      <div style={{background:`linear-gradient(135deg,${color}18,${DS.amber}10)`,borderBottom:`1.5px solid ${color}20`,padding:"14px 18px",position:"relative",zIndex:2}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>onNav("home")} style={{width:40,height:40,borderRadius:DS.r.sm,background:`${color}15`,border:`1.5px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color,cursor:"pointer"}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color,fontWeight:800,letterSpacing:2}}>MATH BAZAAR 🆕</div>
            <div style={{fontSize:16,fontWeight:900,color:DS.ink}}>Real-Life Maths</div>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:12,position:"relative",zIndex:2}}>
        <Card color={color} style={{background:`linear-gradient(135deg,${color}12,${DS.amber}08)`,textAlign:"center",padding:"14px"}}>
          <div style={{fontSize:13,fontWeight:700,color:DS.ink}}>🌍 Apply maths to the real world!</div>
          <div style={{fontSize:11,color:DS.ink2,marginTop:4}}>Interactive scenarios designed for everyday life</div>
        </Card>
        {lessons.map((l,i)=>(
          <button key={i} style={{
            background:DS.surface,border:`1.5px solid ${l.color}28`,borderRadius:DS.r.lg,
            padding:"16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,
            textAlign:"left",boxShadow:DS.shadowDeep(l.color),
            animation:`mmSlideUp 0.35s ease ${i*0.07}s both`,position:"relative",overflow:"hidden",
          }}>
            <div style={{position:"absolute",top:0,left:0,bottom:0,width:3,background:`linear-gradient(180deg,${l.color},${l.color}66)`,borderRadius:"8px 0 0 8px"}}/>
            <div style={{width:50,height:50,borderRadius:DS.r.md,background:`${l.color}14`,border:`1.5px solid ${l.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{l.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:900,color:DS.ink}}>{l.title}</div>
              <div style={{fontSize:11,color:DS.ink2,marginTop:2}}>{l.desc}</div>
            </div>
            {l.tag && <Chip color={l.color}>{l.tag}</Chip>}
          </button>
        ))}
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: DAILY QUIZ (bottom-sheet modal) ─────────────────────────────────

function DailyQuizScreen({ onNav }) {
  const [chosen, setChosen] = useState(null);
  const color = DS.sky;
  const q = {q:"A train has 48 passengers. 17 get off. How many remain?",opts:["31","35","29","33"],ans:0};
  return (
    <ScreenShell bg="rgba(0,0,0,0.4)" style={{justifyContent:"flex-end"}}>
      <div style={{
        background:DS.bg,borderRadius:"28px 28px 0 0",
        boxShadow:`0 -20px 60px rgba(91,79,232,0.2)`,
        padding:"0 0 32px",
        maxHeight:"90%",overflowY:"auto",
      }}>
        <div style={{width:40,height:4,background:DS.border,borderRadius:DS.r.full,margin:"12px auto 20px"}}/>
        <div style={{padding:"0 18px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div>
              <div style={{fontSize:11,color,fontWeight:800,letterSpacing:2}}>DAILY QUIZ</div>
              <div style={{fontSize:18,fontWeight:900,color:DS.ink}}>Question 3 of 5</div>
            </div>
            <div style={{display:"flex",gap:4}}>
              {[1,2,3,4,5].map(i=><div key={i} style={{width:28,height:6,borderRadius:DS.r.full,background:i<=3?color:DS.surfaceAlt}}/>)}
            </div>
          </div>
          <Card color={color} style={{marginBottom:14,textAlign:"center",padding:"20px 16px"}}>
            <div style={{fontSize:32,marginBottom:8}}>🚂</div>
            <div style={{fontSize:16,fontWeight:800,color:DS.ink,lineHeight:1.5}}>{q.q}</div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {q.opts.map((opt,i)=>{
              const isCorrect=i===q.ans, isChosen=i===chosen, answered=chosen!==null;
              let bg=DS.surface,border=`2px solid ${color}25`,col=DS.ink;
              if(answered){
                if(isCorrect){bg="#E8FFF4";border=`2.5px solid ${DS.mint}`;col=DS.mint;}
                else if(isChosen){bg="#FFF0F0";border=`2.5px solid ${DS.coral}`;col=DS.coral;}
              }
              return (
                <button key={i} onClick={()=>!answered&&setChosen(i)} style={{
                  background:bg,border,borderRadius:DS.r.lg,padding:"16px 10px",
                  fontSize:18,fontWeight:900,color:col,cursor:answered?"default":"pointer",
                  transition:"all 0.2s",textAlign:"center",
                  animation:`mmPop 0.3s ease ${i*0.06}s both`,
                }}>
                  <div style={{fontSize:10,color:answered&&isCorrect?DS.mint:answered&&isChosen?DS.coral:color,fontWeight:900,marginBottom:3}}>{["A","B","C","D"][i]}</div>
                  {opt}
                </button>
              );
            })}
          </div>
          {chosen!==null && <BigBtn color={DS.indigo} icon="▶">Next Question</BigBtn>}
        </div>
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: DAILY PUZZLE ────────────────────────────────────────────────────

function DailyPuzzleScreen({ onNav }) {
  const color = DS.grape;
  return (
    <ScreenShell>
      <Stars n={14}/>
      <div style={{background:`linear-gradient(135deg,${color}18,${DS.rose}10)`,borderBottom:`1.5px solid ${color}20`,padding:"14px 18px",position:"relative",zIndex:2}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>onNav("home")} style={{width:40,height:40,borderRadius:DS.r.sm,background:`${color}15`,border:`1.5px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color,cursor:"pointer"}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color,fontWeight:800,letterSpacing:2}}>DAILY PUZZLE</div>
            <div style={{fontSize:16,fontWeight:900,color:DS.ink}}>Today's Brain Teaser!</div>
          </div>
          <Chip color={DS.amber}>+100 XP</Chip>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:14,position:"relative",zIndex:2}}>
        <Card color={color} style={{textAlign:"center",padding:"24px 18px"}}>
          <div style={{fontSize:40,marginBottom:12,animation:"mmFloat 2s ease-in-out infinite"}}>🧩</div>
          <div style={{fontSize:13,color:DS.ink2,fontWeight:700,marginBottom:10}}>Fill in the missing number:</div>
          <div style={{
            display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            fontSize:28,fontWeight:900,color:DS.ink,
          }}>
            <span>4</span>
            <span style={{color:color}}>×</span>
            <div style={{
              width:52,height:52,borderRadius:DS.r.sm,
              background:`${color}18`,border:`2.5px dashed ${color}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:28,color,fontWeight:900,animation:"mmPulse 1.5s ease-in-out infinite",
            }}>?</div>
            <span style={{color:color}}>=</span>
            <span>36</span>
          </div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[7,8,9,6,10,11].map((n,i)=>(
            <button key={i} style={{
              background:DS.surface,border:`2px solid ${color}25`,borderRadius:DS.r.lg,
              padding:"18px",fontSize:22,fontWeight:900,color:DS.ink,cursor:"pointer",
              boxShadow:DS.shadow(color,0.4),textAlign:"center",
              animation:`mmPop 0.3s ease ${i*0.06}s both`,
            }}>{n}</button>
          ))}
        </div>
        <Card color={DS.amber} style={{background:`${DS.amber}08`}}>
          <div style={{fontSize:12,fontWeight:700,color:DS.amber}}>💡 Think: What times 4 gives 36?</div>
        </Card>
        <div style={{textAlign:"center",fontSize:11,color:DS.ink3}}>New puzzle every day at midnight 🕛</div>
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: CHARACTER ───────────────────────────────────────────────────────

function CharacterScreen({ onNav }) {
  const [selected, setSelected] = useState(0);
  const avatars = [
    {icon:"🧒",name:"Aarav",owned:true},{icon:"🧑‍🚀",name:"Cosmo",owned:true},
    {icon:"🦊",name:"Foxy",owned:true},{icon:"🐉",name:"Dragon",owned:false,cost:"80💎"},
    {icon:"🧙‍♂️",name:"Wizard",owned:false,cost:"50💎"},{icon:"🦄",name:"Unicorn",owned:true},
    {icon:"🤖",name:"RoboX",owned:false,cost:"30💎"},{icon:"🐼",name:"Panda",owned:false,cost:"40💎"},
    {icon:"🦁",name:"Leo",owned:false,cost:"60💎"},{icon:"🐸",name:"Froggee",owned:true},
    {icon:"🦋",name:"Flutter",owned:false,cost:"25💎"},{icon:"🐧",name:"Pengu",owned:true},
  ];
  const color = DS.rose;
  return (
    <ScreenShell>
      <Stars n={15}/>
      <div style={{background:`linear-gradient(135deg,${color}18,${DS.grape}10)`,borderBottom:`1.5px solid ${color}20`,padding:"14px 18px",position:"relative",zIndex:2}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>onNav("home")} style={{width:40,height:40,borderRadius:DS.r.sm,background:`${color}15`,border:`1.5px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color,cursor:"pointer"}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color,fontWeight:800,letterSpacing:2}}>MY CHARACTER</div>
            <div style={{fontSize:16,fontWeight:900,color:DS.ink}}>Choose Your Avatar</div>
          </div>
          <Chip color={DS.grape}>12 💎</Chip>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px",position:"relative",zIndex:2}}>
        <Card color={color} style={{textAlign:"center",padding:"20px",marginBottom:16}}>
          <div style={{fontSize:72,marginBottom:8,animation:"mmFloat 2s ease-in-out infinite",filter:`drop-shadow(0 8px 16px ${color}44)`}}>
            {avatars[selected].icon}
          </div>
          <div style={{fontSize:18,fontWeight:900,color:DS.ink}}>{avatars[selected].name}</div>
          {avatars[selected].owned
            ? <div style={{marginTop:8}}><BigBtn color={DS.mint} small icon="✅">Selected</BigBtn></div>
            : <div style={{marginTop:8}}><BigBtn color={color} small icon="💎">{avatars[selected].cost}</BigBtn></div>
          }
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {avatars.map((a,i)=>(
            <button key={i} onClick={()=>setSelected(i)} style={{
              background:i===selected?`${color}18`:DS.surface,
              border:`2px solid ${i===selected?color+"55":a.owned?DS.mint+"30":DS.border}`,
              borderRadius:DS.r.md,padding:"12px 6px",cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",gap:4,
              boxShadow:i===selected?DS.shadowDeep(color):a.owned?DS.shadow(DS.mint,0.3):"none",
              animation:`mmPop 0.3s ease ${i*0.04}s both`,
              position:"relative",
            }}>
              {!a.owned && <div style={{position:"absolute",top:4,right:4,fontSize:8,background:DS.amber,color:"white",borderRadius:DS.r.full,padding:"1px 4px",fontWeight:900}}>💎</div>}
              <div style={{fontSize:24,filter:a.owned?"none":"grayscale(0.4)"}}>{a.icon}</div>
              <div style={{fontSize:9,fontWeight:700,color:i===selected?color:a.owned?DS.ink:DS.ink3}}>{a.name}</div>
            </button>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: TEACHER DASHBOARD ───────────────────────────────────────────────

function TeacherDashScreen({ onNav }) {
  const color = DS.amber;
  const students = [
    {name:"Aarav S",avg:88,sets:42,streak:6,status:"good"},
    {name:"Priya M",avg:72,sets:31,streak:2,status:"ok"},
    {name:"Rishi K",avg:45,sets:18,streak:0,status:"alert"},
    {name:"Ananya R",avg:95,sets:55,streak:9,status:"good"},
    {name:"Dev P",avg:60,sets:25,streak:1,status:"ok"},
  ];
  return (
    <ScreenShell>
      <Stars n={10}/>
      <div style={{background:`linear-gradient(135deg,${color}18,${DS.coral}10)`,borderBottom:`1.5px solid ${color}20`,padding:"14px 18px",position:"relative",zIndex:2}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>onNav("entry")} style={{width:40,height:40,borderRadius:DS.r.sm,background:`${color}15`,border:`1.5px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color,cursor:"pointer"}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color,fontWeight:800,letterSpacing:2}}>TEACHER PORTAL</div>
            <div style={{fontSize:16,fontWeight:900,color:DS.ink}}>Class 3A Dashboard</div>
          </div>
          <Chip color={color}>24 students</Chip>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:12,position:"relative",zIndex:2}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[{e:"📊",v:"74%",l:"Avg Score",c:DS.mint},{e:"🔥",v:"3.2",l:"Avg Streak",c:DS.coral},{e:"📚",l:"Sets Done",v:"34",c:DS.sky}].map((s,i)=>(
            <Card key={i} color={s.c} style={{textAlign:"center",padding:"12px 6px"}}>
              <div style={{fontSize:20}}>{s.e}</div>
              <div style={{fontSize:16,fontWeight:900,color:DS.ink,marginTop:2}}>{s.v}</div>
              <div style={{fontSize:9,color:DS.ink3}}>{s.l}</div>
            </Card>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          {[{icon:"📝",label:"Questions",color:DS.grape},{icon:"📋",label:"Assign",color:DS.sky},{icon:"📊",label:"Reports",color:DS.mint},{icon:"🔔",label:"Notify",color:DS.coral}].map((a,i)=>(
            <button key={i} style={{flex:1,background:DS.surface,border:`1.5px solid ${a.color}25`,borderRadius:DS.r.md,padding:"10px 4px",cursor:"pointer",textAlign:"center",boxShadow:DS.shadow(a.color,0.4)}}>
              <div style={{fontSize:20}}>{a.icon}</div>
              <div style={{fontSize:9,fontWeight:800,color:a.color,marginTop:3}}>{a.label}</div>
            </button>
          ))}
        </div>
        <div style={{fontSize:12,fontWeight:900,color:DS.ink2,letterSpacing:1}}>STUDENTS</div>
        {students.map((s,i)=>(
          <Card key={i} color={s.status==="alert"?DS.coral:s.status==="good"?DS.mint:DS.amber} style={{padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:DS.r.sm,background:`${s.status==="alert"?DS.coral:s.status==="good"?DS.mint:DS.amber}18`,border:`1.5px solid ${s.status==="alert"?DS.coral:s.status==="good"?DS.mint:DS.amber}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                {s.status==="alert"?"⚠️":s.status==="good"?"⭐":"📖"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:900,color:DS.ink}}>{s.name}</div>
                <div style={{fontSize:10,color:DS.ink2}}>{s.sets} sets · {s.streak}🔥 streak</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:16,fontWeight:900,color:s.avg>=80?DS.mint:s.avg>=60?DS.amber:DS.coral}}>{s.avg}%</div>
                <div style={{fontSize:8,color:DS.ink3}}>avg</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: ADMIN PANEL ─────────────────────────────────────────────────────

function AdminPanelScreen({ onNav }) {
  const color = DS.indigo;
  const tiles = [
    {icon:"🏫",label:"Schools",count:48,color:DS.indigo},
    {icon:"👩‍🏫",label:"Teachers",count:124,color:DS.amber},
    {icon:"🎓",label:"Classes",count:312,color:DS.grape},
    {icon:"🧒",label:"Students",count:7840,color:DS.mint},
    {icon:"❓",label:"Questions",count:"16.8k",color:DS.coral},
  ];
  return (
    <ScreenShell>
      <Stars n={8}/>
      <div style={{background:`linear-gradient(135deg,${color}18,${DS.grape}10)`,borderBottom:`1.5px solid ${color}20`,padding:"14px 18px",position:"relative",zIndex:2}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>onNav("entry")} style={{width:40,height:40,borderRadius:DS.r.sm,background:`${color}15`,border:`1.5px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color,cursor:"pointer"}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color,fontWeight:800,letterSpacing:2}}>ADMIN PANEL</div>
            <div style={{fontSize:16,fontWeight:900,color:DS.ink}}>MathMagic Control</div>
          </div>
          <Chip color={DS.coral}>Super Admin</Chip>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:14,position:"relative",zIndex:2}}>
        <Card color={DS.grape} style={{background:`linear-gradient(135deg,${DS.grape}12,${DS.indigo}08)`,textAlign:"center"}}>
          <div style={{fontSize:11,color:DS.grape,fontWeight:800,letterSpacing:1,marginBottom:8}}>PLATFORM OVERVIEW</div>
          <div style={{display:"flex",justifyContent:"space-around"}}>
            {[{v:"98.2%",l:"Uptime"},{v:"₹2.4L",l:"Revenue"},{v:"4.8⭐",l:"Rating"}].map((s,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:900,color:DS.ink}}>{s.v}</div>
                <div style={{fontSize:9,color:DS.ink3}}>{s.l}</div>
              </div>
            ))}
          </div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {tiles.map((t,i)=>(
            <button key={i} style={{
              background:DS.surface,border:`1.5px solid ${t.color}28`,borderRadius:DS.r.lg,
              padding:"20px 16px",cursor:"pointer",textAlign:"left",
              boxShadow:DS.shadowDeep(t.color),
              animation:`mmPop 0.35s ease ${i*0.07}s both`,
              display:"flex",flexDirection:"column",gap:8,
            }}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{width:44,height:44,borderRadius:DS.r.md,background:`${t.color}14`,border:`1.5px solid ${t.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{t.icon}</div>
                <div style={{fontSize:9,color:t.color,fontWeight:800,background:`${t.color}12`,padding:"3px 8px",borderRadius:DS.r.full,border:`1px solid ${t.color}25`}}>MANAGE →</div>
              </div>
              <div>
                <div style={{fontSize:22,fontWeight:900,color:DS.ink}}>{t.count}</div>
                <div style={{fontSize:11,color:t.color,fontWeight:700}}>{t.label}</div>
              </div>
            </button>
          ))}
          <button style={{
            background:`linear-gradient(135deg,${DS.indigo}18,${DS.grape}10)`,
            border:`1.5px solid ${DS.indigo}28`,borderRadius:DS.r.lg,
            padding:"20px 16px",cursor:"pointer",textAlign:"left",
            boxShadow:DS.shadowDeep(DS.indigo),display:"flex",flexDirection:"column",gap:8,
          }}>
            <div style={{fontSize:22}}>📊</div>
            <div style={{fontSize:14,fontWeight:900,color:DS.ink}}>Analytics</div>
            <div style={{fontSize:10,color:DS.indigo,fontWeight:700}}>Usage · Revenue · Growth</div>
          </button>
        </div>
      </div>
    </ScreenShell>
  );
}

// ─── SCREEN: PAYMENT ─────────────────────────────────────────────────────────

function PaymentScreen({ onNav }) {
  const color = DS.mint;
  return (
    <ScreenShell bg={`linear-gradient(160deg,${DS.bgWarm},${DS.bg})`}>
      <Stars n={12}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"24px 20px",position:"relative",zIndex:2}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
          <button onClick={()=>onNav("home")} style={{width:40,height:40,borderRadius:DS.r.sm,background:`${color}15`,border:`1.5px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color,cursor:"pointer"}}>‹</button>
          <div style={{fontSize:14,fontWeight:800,color:DS.indigo}}>UNLOCK LESSON</div>
        </div>
        <Card color={color} style={{marginBottom:16,textAlign:"center",padding:"24px 18px"}}>
          <div style={{fontSize:48,marginBottom:10}}>🔓</div>
          <div style={{fontSize:20,fontWeight:900,color:DS.ink}}>Fractions — Class 3</div>
          <div style={{fontSize:13,color:DS.ink2,marginTop:4}}>Full access · 20 sets · 400 questions</div>
          <div style={{marginTop:14,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <div style={{fontSize:32,fontWeight:900,color:DS.indigo,fontFamily:DS.font.display}}>₹300</div>
            <div style={{fontSize:12,color:DS.ink3,textDecoration:"line-through"}}>₹500</div>
            <Chip color={DS.coral}>40% OFF</Chip>
          </div>
        </Card>
        <Card color={DS.indigo} style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:800,color:DS.indigo,letterSpacing:1,marginBottom:10}}>WHAT YOU GET</div>
          {["All 20 sets unlocked","400 unique questions","Star ratings & progress tracking","Works offline"].map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
              <span style={{fontSize:14}}>✅</span>
              <span style={{fontSize:12,fontWeight:700,color:DS.ink}}>{f}</span>
            </div>
          ))}
        </Card>
        <BigBtn color={DS.mint} icon="💳">Pay ₹300 via Razorpay</BigBtn>
        <div style={{textAlign:"center",marginTop:12}}>
          <div style={{fontSize:11,color:DS.ink3,marginBottom:6}}>or enter UTR manually</div>
          <button style={{background:"none",border:"none",color:DS.indigo,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:DS.font.body,textDecoration:"underline"}}>I've already paid — enter UTR</button>
        </div>
        <div style={{textAlign:"center",marginTop:16,fontSize:10,color:DS.ink3}}>🔒 Secured by Razorpay · Instant activation</div>
      </div>
    </ScreenShell>
  );
}


// ─── SCREENS REGISTRY + APP SHELL ────────────────────────────────────────────

const SCREENS = {
  splash:       { label:"Splash",           comp: SplashScreen },
  entry:        { label:"Entry",            comp: EntryScreen },
  studentEntry: { label:"Student Entry",    comp: StudentEntryScreen },
  home:         { label:"Home",             comp: HomeScreen },
  map:          { label:"Lesson Map",       comp: LessonMapScreen },
  setpath:      { label:"Set Path Map",     comp: SetPathMapScreen },
  game:         { label:"Game",             comp: GameScreen },
  result:       { label:"Result",           comp: ResultScreen },
  games:        { label:"Games Hub",        comp: GamesHubScreen },
  abacus:       { label:"Abacus",           comp: AbacusScreen },
  olympiad:     { label:"Olympiad",         comp: OlympiadScreen },
  bazaar:       { label:"Bazaar",           comp: BazaarScreen },
  dailyquiz:    { label:"Daily Quiz",       comp: DailyQuizScreen },
  dailypuzzle:  { label:"Daily Puzzle",     comp: DailyPuzzleScreen },
  badges:       { label:"Badges",           comp: BadgesScreen },
  shop:         { label:"Shop",             comp: ShopScreen },
  character:    { label:"Character",        comp: CharacterScreen },
  login:        { label:"Student Login",    comp: StudentLoginScreen },
  parent:       { label:"Parent Dash",      comp: ParentDashScreen },
  teacher:      { label:"Teacher Dash",     comp: TeacherDashScreen },
  admin:        { label:"Admin Panel",      comp: AdminPanelScreen },
  payment:      { label:"Payment",          comp: PaymentScreen },
  design:       { label:"Design System",    comp: DesignSystemPreview },
};

const GROUPS = {
  "Auth": ["splash","entry","studentEntry","login","payment"],
  "Student": ["home","map","setpath","game","result"],
  "Features": ["games","abacus","olympiad","bazaar","dailyquiz","dailypuzzle"],
  "Profile": ["badges","shop","character","parent"],
  "Staff": ["teacher","admin"],
  "System": ["design"],
};

export default function App() {
  const [current, setCurrent] = useState("home");
  const [activeGroup, setActiveGroup] = useState("Student");

  const Comp = SCREENS[current]?.comp || HomeScreen;

  return (
    <div style={{
      display:"flex",flexDirection:"column",alignItems:"center",
      minHeight:"100vh",background:"#E8E4F8",padding:"20px 16px 40px",
      fontFamily:DS.font.body,
    }}>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontFamily:DS.font.display,fontSize:28,color:DS.indigo}}>MathMagic</div>
        <div style={{fontSize:11,color:DS.ink2,fontWeight:700,letterSpacing:2}}>COMPLETE UI PREVIEW · ALL {Object.keys(SCREENS).length} SCREENS</div>
      </div>

      {/* Group tabs */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginBottom:10}}>
        {Object.keys(GROUPS).map(g=>(
          <button key={g} onClick={()=>{setActiveGroup(g);setCurrent(GROUPS[g][0]);}} style={{
            padding:"5px 13px",borderRadius:DS.r.full,
            background:activeGroup===g?DS.indigo:DS.surface,
            border:`1.5px solid ${activeGroup===g?DS.indigo:DS.border}`,
            color:activeGroup===g?"white":DS.ink2,
            fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:DS.font.body,
            boxShadow:activeGroup===g?DS.shadow(DS.indigo,0.7):"none",
            transition:"all 0.2s",
          }}>{g}</button>
        ))}
      </div>

      {/* Screen picker within group */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginBottom:18,maxWidth:600}}>
        {(GROUPS[activeGroup]||[]).map(id=>(
          <button key={id} onClick={()=>setCurrent(id)} style={{
            padding:"5px 12px",borderRadius:DS.r.full,
            background:current===id?DS.grape:DS.surface,
            border:`1.5px solid ${current===id?DS.grape:DS.border}`,
            color:current===id?"white":DS.ink2,
            fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:DS.font.body,
            boxShadow:current===id?DS.shadow(DS.grape,0.6):"none",
            transition:"all 0.2s",
          }}>{SCREENS[id]?.label}</button>
        ))}
      </div>

      {/* Phone frame */}
      <div style={{
        width:375,height:780,background:DS.surface,borderRadius:40,overflow:"hidden",
        boxShadow:`0 30px 80px rgba(91,79,232,0.25), 0 10px 30px rgba(91,79,232,0.12), inset 0 0 0 8px rgba(91,79,232,0.08)`,
        position:"relative",border:`2px solid rgba(91,79,232,0.12)`,
      }}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:120,height:28,background:"rgba(91,79,232,0.08)",borderRadius:"0 0 18px 18px",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:`${DS.ink}18`}}/>
          <div style={{width:50,height:5,borderRadius:DS.r.full,background:`${DS.ink}18`}}/>
        </div>
        <div style={{paddingTop:28,height:"100%",position:"relative"}}>
          <Comp onNav={setCurrent} onSelect={setCurrent}/>
        </div>
      </div>

      <div style={{marginTop:16,textAlign:"center",fontSize:11,color:DS.ink3,lineHeight:1.8}}>
        <strong style={{color:DS.indigo}}>Cosmic Candy · {Object.keys(SCREENS).length} Screens</strong><br/>
        Warm white · Jewel-tone accents · 3D tactile cards · Zero logic changes
      </div>
    </div>
  );
}
