// src/components/screens/Auth.jsx — Welcome, Register, Login
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, Card, BackBtn, PinPad, StepDots, RegPage } from '../ui/primitives.jsx';
import { WORLDS } from '../../constants/gameData.js';
import { Starfield } from '../layout/layout.jsx';


export function Welcome({ onRegister, onLogin, onPrivacy }) {
  return (
    <div style={{ minHeight:"100vh", background:C.bg, position:"relative", overflow:"hidden", fontFamily:"'Nunito',sans-serif" }}>
      <Starfield/>
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"50px 22px 40px", animation:"slideUp 0.4s ease" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:60, marginBottom:8, animation:"floatUp 3s ease-in-out infinite" }}>🚀</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:24, fontWeight:900, background:`linear-gradient(135deg,${C.cyan},${C.purple})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:2 }}>MATHMAGIC</div>
          <div style={{ color:C.dim, fontSize:11, letterSpacing:4, fontFamily:"'Orbitron',sans-serif", marginTop:4 }}>SPACE ACADEMY</div>
          <div style={{ marginTop:12, color:"#4a5a8a", fontSize:13, fontWeight:600, lineHeight:1.7 }}>Master maths while conquering the cosmos! 🌌</div>
        </div>
        <div style={{ display:"flex", gap:14, marginBottom:30 }}>
          {["🌕","🔴","🪐","🌌"].map((p, i) => (
            <div key={i} style={{ fontSize:26+i*4, animation:`floatUp ${2+i*0.4}s ${i*0.3}s ease-in-out infinite`, filter:`drop-shadow(0 0 10px ${["#f97316","#ec4899","#8b5cf6","#00f5ff"][i]}88)` }}>{p}</div>
          ))}
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7, justifyContent:"center", marginBottom:30 }}>
          {["📚 CBSE & ICSE","🎮 Game-Based","🧮 Abacus","🏆 Olympiad","Class 1–5"].map((t, i) => (
            <span key={i} style={{ padding:"5px 11px", borderRadius:20, fontSize:11, fontWeight:700, border:`1px solid ${[C.cyan,C.purple,C.pink,C.orange,C.yellow][i]}44`, color:[C.cyan,C.purple,C.pink,C.orange,C.yellow][i], background:`${[C.cyan,C.purple,C.pink,C.orange,C.yellow][i]}0e` }}>{t}</span>
          ))}
        </div>
        <div style={{ width:"100%", maxWidth:340, display:"flex", flexDirection:"column", gap:12 }}>
          <Btn color={C.cyan} onClick={onRegister}>🚀  REGISTER NEW ACCOUNT</Btn>
          <Btn color={C.purple} onClick={onLogin}>🌌  LOGIN TO MY ACCOUNT</Btn>
        </div>
        <div style={{ marginTop:14, display:"flex", gap:16, alignItems:"center", justifyContent:"center" }}>
          <div style={{ color:"#1a2a4a", fontSize:11, fontWeight:600 }}>No ads for kids · Safe &amp; secure</div>
          {onPrivacy && <button onClick={onPrivacy} style={{background:"none",border:"none",color:C.dim,fontSize:11,cursor:"pointer",textDecoration:"underline",fontFamily:"'Nunito',sans-serif",padding:0}}>Privacy Policy</button>}
        </div>
      </div>
    </div>
  );
}

// ── Register ──────────────────────────────────────────────────────────
export function Register({ onBack, onDone }) {
  const [step,    setStep]    = useState(1);
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [pass2,   setPass2]   = useState("");
  const [name,    setName]    = useState("");
  const [avatar,  setAvatar]  = useState(null);
  const [cls,     setCls]     = useState(null);
  const [pin,     setPin]     = useState("");
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [shake,   setShake]   = useState(false);

  const goBack = () => { setErrors({}); step > 1 ? setStep(step - 1) : onBack(); };

  // Step 1 ─ credentials
  if (step === 1) {
    const doNext = () => {
      const e = {};
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email.trim())) e.email = "Enter a valid email";
      if (pass.length < 6) e.pass = "At least 6 characters";
      if (pass !== pass2)  e.pass2 = "Passwords don't match";
      if (Object.keys(e).length) { setErrors(e); return; }
      setErrors({}); setStep(2);
    };
    return (
      <RegPage step={1} title="CREATE ACCOUNT" color={C.cyan} onBack={goBack}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, letterSpacing:2, marginBottom:12 }}>STEP 1 — PARENT ACCOUNT</div>

        <Inp label="EMAIL" value={email} onChange={setEmail} placeholder="parent@email.com" type="email" error={errors.email} onEnter={doNext} autoComp="email"/>
        <Inp label="PASSWORD" value={pass} onChange={v => { setPass(v); if(pass2 && v!==pass2) setErrors(e=>({...e,pass2:"Passwords don't match"})); else setErrors(e=>({...e,pass2:undefined})); }} placeholder="Min 6 characters" type="password" error={errors.pass} onEnter={doNext} autoComp="new-password"/>
        <Inp label="CONFIRM PASSWORD" value={pass2} onChange={setPass2} placeholder="Repeat password" type="password" error={errors.pass2} onEnter={doNext} autoComp="new-password"/>
        <div style={{ height:6 }}/>
        <Btn color={C.cyan} onClick={doNext}>NEXT → CHILD PROFILE</Btn>
      </RegPage>
    );
  }

  // Step 2 ─ name + avatar
  if (step === 2) {
    const doNext = () => {
      const e = {};
      if (!name.trim()) e.name = "Enter child's name";
      if (!avatar)      e.avatar = "Pick an avatar";
      if (Object.keys(e).length) { setErrors(e); return; }
      setErrors({}); setName(name.trim()); setStep(3);
    };
    return (
      <RegPage step={2} title="CHILD PROFILE" color={C.purple} onBack={goBack}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, letterSpacing:2, marginBottom:12 }}>STEP 2 — YOUR SPACE EXPLORER</div>
        <Inp label="CHILD'S NAME" value={name} onChange={setName} placeholder="Enter child's name…" error={errors.name} maxLen={40} autoComp="off" onEnter={doNext}/>
        <div style={{ fontSize:10, color:C.purple, fontFamily:"'Orbitron',sans-serif", letterSpacing:2, marginBottom:8 }}>PICK AN AVATAR</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8, marginBottom:12 }}>
          {AVATARS.map((a, i) => (
            <button key={i} onClick={() => setAvatar(a)} style={{
              background: avatar === a ? `${C.purple}33` : "#07071a",
              border:`2px solid ${avatar === a ? C.cyan : "#111128"}`,
              borderRadius:12, aspectRatio:"1", fontSize:24, cursor:"pointer",
              boxShadow: avatar === a ? `0 0 14px ${C.cyan}88` : "none",
              transform: avatar === a ? "scale(1.14)" : "scale(1)",
              transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center",
            }}>{a}</button>
          ))}
        </div>
        {avatar && (
          <div style={{ textAlign:"center", marginBottom:12 }}>
            <div style={{ fontSize:48, animation:"floatUp 2s ease-in-out infinite" }}>{avatar}</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.cyan, marginTop:5 }}>
              ASTRONAUT {name.trim().toUpperCase() || "?"}
            </div>
          </div>
        )}
        {errors.avatar && <div style={{ color:C.red, fontSize:11, marginBottom:8, fontWeight:700 }}>⚠ {errors.avatar}</div>}
        <Btn color={C.purple} onClick={doNext}>NEXT → SELECT CLASS</Btn>
      </RegPage>
    );
  }

  // Step 3 ─ class
  if (step === 3) {
    return (
      <RegPage step={3} title="SELECT CLASS" color={C.orange} onBack={goBack}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, letterSpacing:2, marginBottom:4 }}>STEP 3 — WHICH CLASS?</div>
        <div style={{ color:C.dim, fontSize:12, fontWeight:600, marginBottom:12, lineHeight:1.5 }}>

        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
          {WORLDS.map(w => (
            <button key={w.id} onClick={() => setCls(w.id)} style={{
              background: cls === w.id ? `${w.color}22` : "#07071a",
              border:`2px solid ${cls === w.id ? w.color : "#181838"}`,
              borderRadius:15, padding:"12px 15px", cursor:"pointer",
              display:"flex", alignItems:"center", gap:12,
              boxShadow: cls === w.id ? `0 0 18px ${w.glow}` : "none",
              transition:"all 0.2s",
            }}>
              <span style={{ fontSize:26 }}>{w.planet}</span>
              <div style={{ textAlign:"left", flex:1 }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:13, color: cls === w.id ? w.color : "white" }}>{w.name}</div>
                <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{w.world}</div>
              </div>
              {cls === w.id && <div style={{ color:w.color, fontSize:20 }}>✓</div>}
            </button>
          ))}
        </div>
        {errors.cls && <div style={{ color:C.red, fontSize:11, marginBottom:8, fontWeight:700 }}>⚠ {errors.cls}</div>}
        <Btn color={C.orange} disabled={!cls} onClick={() => { if (!cls) { setErrors({ cls:"Select a class" }); return; } setErrors({}); setStep(4); }}>
          NEXT → CREATE PIN
        </Btn>
      </RegPage>
    );
  }

  // Step 4 ─ PIN + submit
  if (step === 4) {
    const doRegister = async () => {
      if (pin.length < 4) { setErrors({ pin:"Enter all 4 digits" }); setShake(true); setTimeout(() => setShake(false), 500); return; }
      setLoading(true);
      try {
        const { data: ad, error: ae } = await db.signUp(email, pass);
        if (ae) {
          // Hard auth error (duplicate email, invalid format etc.) — show to user
          setErrors({ pin: ae.message }); setLoading(false); return;
        }
        const uid = ad?.user?.id;
        if (!uid) {
          // No uid at all — should not happen after our signUp fix, but guard anyway
          setErrors({ pin: "Registration error. Please try again." });
          setLoading(false); return;
        }
        // Add child profile — works whether uid is a real Supabase UUID or an in-memory id
        const { data: child } = await db.addChild(uid, { name, avatar, class_num: cls, pin });
        if (!child) { setErrors({ pin: "Could not create profile. Please try again." }); setLoading(false); return; }
        setLoading(false);
        // Save session so login screen skips email/pass next time
        try {
          const kidsData = [child];
          sessionStorage.setItem("mm_parent_session", JSON.stringify({ email, pass, pid: uid, kids: kidsData }));
        } catch(e) {}
        onDone({ user: { id: uid, email }, child, requirePayment: true });
      } catch (err) {
        console.warn("[doRegister error]", err.message);
        setErrors({ pin: "Connection error. Please check your internet and try again." });
        setLoading(false);
      }
    };
    return (
      <RegPage step={4} title="CREATE PIN" color={C.yellow} onBack={goBack}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, letterSpacing:2, marginBottom:4 }}>STEP 4 — SECRET PIN</div>
        <div style={{ color:C.dim, fontSize:12, fontWeight:600, marginBottom:10, lineHeight:1.6 }}>
          Set a 4-digit PIN for <strong style={{ color:textColor() }}>{name}</strong> to log in.
        </div>
        <div style={{ background:`${C.cyan}14`, border:`1px solid ${C.cyan}33`, borderRadius:10, padding:"8px 12px", marginBottom:12 }}>
          <div style={{ color:C.cyan, fontSize:10, fontFamily:"'Orbitron',sans-serif", marginBottom:2 }}>🔐 STEP 4 — ALMOST THERE!</div>
          <div style={{ color:C.dim, fontSize:11 }}>Set a 4-digit PIN your child will use to log in each time.</div>
        </div>
        <PinPad pin={pin} setPin={setPin} error={errors.pin} shake={shake}/>
        <div style={{ height:10 }}/>
        <Btn color={C.yellow} disabled={pin.length < 4} loading={loading} onClick={doRegister}>
          🚀  LAUNCH INTO SPACE!
        </Btn>
      </RegPage>
    );
  }
  return null;
}

// ── Login ─────────────────────────────────────────────────────────────
export function Login({ onBack, onDone }) {
  // ── Session restore: if parent already logged in this session, skip email/pass ──
  const savedSession = (() => { try { return JSON.parse(sessionStorage.getItem("mm_parent_session")||"null"); } catch(e){return null;} })();
  const hasSession = savedSession && savedSession.kids && savedSession.kids.length > 0;

  const [step,    setStep]    = useState(hasSession ? "child" : "email");
  const [email,   setEmail]   = useState(savedSession?.email || "");
  const [pass,    setPass]    = useState(savedSession?.pass || "");
  const [kids,    setKids]    = useState(savedSession?.kids || []);
  const [kid,     setKid]     = useState(null);
  const [pid,     setPid]     = useState(savedSession?.pid || null);
  const [pin,     setPin]     = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [shake,   setShake]   = useState(false);

  // ── Clear session and go back to email step (for switching accounts) ──
  const switchAccount = () => {
    try { sessionStorage.removeItem("mm_parent_session"); } catch(e) {}
    setStep("email"); setEmail(""); setPass(""); setKids([]); setPid(null); setError("");
  };

  if (step === "email") return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"20px 18px", fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={26}/>
      <div style={{ position:"relative", zIndex:1, animation:"slideUp 0.3s ease" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <BackBtn onClick={onBack}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.cyan }}>PARENT LOGIN</div>
        </div>
        {/* Friendly explanation of why parent logs in */}
        <div style={{ background:`${C.cyan}11`, border:`1.5px solid ${C.cyan}33`, borderRadius:16, padding:"14px 16px", marginBottom:20, display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ fontSize:24, flexShrink:0 }}>👋</div>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:textColor(), marginBottom:3 }}>Parents sign in once</div>
            <div style={{ fontSize:12, color:C.dim, lineHeight:1.6 }}>After this your child picks their avatar and enters their own 4-digit PIN — no email needed for them!</div>
          </div>
        </div>
        <Inp label="PARENT EMAIL" value={email} onChange={setEmail} placeholder="parent@email.com" type="email" autoComp="email" onEnter={() => document.getElementById("loginSubmit")?.click()}/>
        <Inp label="PASSWORD" value={pass} onChange={setPass} placeholder="Your password" type="password" autoComp="current-password" onEnter={() => document.getElementById("loginSubmit")?.click()}/>
        {error && <div style={{ color:C.red, fontSize:12, marginBottom:12, fontWeight:700, textAlign:"center", lineHeight:1.5 }}>⚠ {error}</div>}
        <div id="loginSubmit" style={{ display:"none" }}/>
        <Btn color={C.cyan} loading={loading} style={{ marginBottom:10 }} onClick={async () => {
          const te = email.trim();
          if (!te || !pass) { setError("Enter email and password"); return; }
          setLoading(true); setError("");
          try {
            const { data, error: err } = await db.signIn(te, pass);
            if (err || !data?.user) { setError(err?.message || "Login failed"); setLoading(false); return; }
            const parentId = data.user.id; setPid(parentId);
            const { data: children } = await db.getChildren(parentId);
            setLoading(false);
            if (!children || children.length === 0) { setError("No profiles found. Please register first."); return; }
            setKids(children); setStep("child");
            // Save session so child can login with just PIN next time (same browser session)
            try { sessionStorage.setItem("mm_parent_session", JSON.stringify({ email:te, pass, pid:parentId, kids:children })); } catch(e) {}
          } catch(e) { setError("Login failed: " + e.message); setLoading(false); }
        }}>CONTINUE →</Btn>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:C.dim, fontSize:12, cursor:"pointer", fontWeight:600 }}>No account? Register →</button>
          <button onClick={async () => {
            if (!email.trim().includes("@")) { setError("Enter your email first"); return; }
            setError("✉️ Reset email sent!");
          }} style={{ background:"none", border:"none", color:C.dim, fontSize:12, cursor:"pointer", fontWeight:600 }}>Forgot password?</button>
        </div>
        <div style={{height:8}}/>
      </div>
    </div>
  );

  if (step === "child") return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"20px 18px", fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={26}/>
      <div style={{ position:"relative", zIndex:1, animation:"slideUp 0.3s ease" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <BackBtn onClick={onBack}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.purple }}>CHOOSE PILOT</div>
        </div>
        {/* Show who is logged in + option to switch account */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
          <button onClick={switchAccount} style={{ background:"none", border:"none", color:C.dim, fontSize:11, cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:600 }}>
            🔄 Switch account
          </button>
        </div>
        <div style={{ color:C.dim, fontSize:13, fontWeight:600, marginBottom:14 }}>Who's flying today? 🚀</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {kids.map(k => {
            const w = WORLDS[(k.class_num || 1) - 1];
            return (
              <button key={k.id} onClick={() => { setKid(k); setPin(""); setError(""); setStep("pin"); }}
                style={{ background:C.card, border:`2px solid ${w.color}33`, borderRadius:16, padding:"13px 15px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, transition:"all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = w.color; e.currentTarget.style.boxShadow = `0 0 16px ${w.glow}`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${w.color}33`; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width:48, height:48, background:`${w.color}18`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, border:`1.5px solid ${w.color}33` }}>{k.avatar}</div>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:13, color:textColor()}}>{k.name}</div>
                  <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{w.name} · Lv {k.level||1} · {k.xp||0} XP</div>
                </div>
                <div style={{ marginLeft:"auto", color:w.color, fontSize:20 }}>›</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (step === "pin" && kid) return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"20px 18px", fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={26}/>
      <div style={{ position:"relative", zIndex:1, animation:"slideUp 0.3s ease" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
          <BackBtn onClick={() => { setStep("child"); setPin(""); setError(""); }}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.cyan }}>ENTER PIN</div>
        </div>
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ fontSize:52, animation:"floatUp 2s ease-in-out infinite", marginBottom:8 }}>{kid.avatar}</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.cyan }}>{kid.name.toUpperCase()}</div>
          <div style={{ color:C.dim, fontSize:11, marginTop:3 }}>{WORLDS[(kid.class_num||1)-1].world}</div>
        </div>
        <div style={{ color:C.dim, fontSize:12, fontWeight:600, textAlign:"center", marginBottom:12 }}>Enter your secret PIN 🔐</div>
        <PinPad pin={pin} setPin={setPin} error={error} shake={shake} onComplete={async fullPin => {
          // SECURITY: track failed PIN attempts
          const attemptKey = `pin_attempts_${kid.id}`;
          const attempts = parseInt(localStorage.getItem(attemptKey)||"0");
          if (attempts >= 5) { setError("Too many attempts. Wait 5 minutes."); setShake(true); setTimeout(()=>setShake(false),600); setPin(""); return; }
          const { ok, child: rawChild } = await db.checkPin(kid.id, fullPin);
          if (!ok) localStorage.setItem(attemptKey, String(attempts+1));
          else localStorage.removeItem(attemptKey);
          if (ok && rawChild) {
            // Update daily streak
            const today     = new Date().toISOString().slice(0, 10);
            const lastActive = rawChild.last_active ? new Date(rawChild.last_active).toISOString().slice(0, 10) : null;
            const yesterday  = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            let updatedChild = { ...rawChild };
            if (lastActive !== today) {
              const newStreak = lastActive === yesterday ? (rawChild.streak_days||0) + 1 : 1;
              // Direct API call — works regardless of getSb state
              fetch("/api/db", { method:"POST",
                headers:{"Content-Type":"application/json","Authorization":`Bearer ${db._token||""}`},
                body: JSON.stringify({ action:"update_children", id:rawChild.id,
                  streak_days: newStreak, last_active: new Date().toISOString() }) }).catch(()=>{});
              updatedChild = { ...rawChild, streak_days: newStreak, last_active: new Date().toISOString() };
            }
            // Save session so next login skips email/pass
            try { sessionStorage.setItem("mm_parent_session", JSON.stringify({ email, pass, pid, kids })); } catch(e){}
            onDone({ user:{ id:pid, email }, child: updatedChild });
          }
          else { setShake(true); setError("Wrong PIN! Try again 🔒"); setTimeout(() => { setShake(false); setPin(""); setError(""); }, 700); }
        }}/>
      </div>
    </div>
  );
  return null;
}

// ── Paywall ───────────────────────────────────────────────────────────
