// src/components/screens/Feedback.jsx — FeedbackScreen, RatingPrompt
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, BackBtn, Card } from '../ui/primitives.jsx';


export function FeedbackScreen({ child, currentScreen, onBack, prefillCategory }) {
  const [cat,     setCat]     = useState(prefillCategory || null);
  const [desc,    setDesc]    = useState("");
  const [step,    setStep]    = useState("form"); // "form" | "sent" | "error"
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const deviceInfo = [
    navigator.userAgent.substring(0, 80),
    `Screen: ${window.screen.width}x${window.screen.height}`,
    `Online: ${navigator.onLine}`,
    `Lang: ${navigator.language}`,
  ].join(" | ");

  const handleSubmit = async () => {
    if (!cat)         { alert("Please select a category"); return; }
    if (desc.trim().length < 10) { alert("Please describe the issue (at least 10 characters)"); return; }
    setLoading(true);
    const payload = {
      child_id:    child?.id    || "guest",
      child_name:  child?.name  || "Unknown",
      category:    cat,
      description: desc.trim(),
      screen:      currentScreen || "unknown",
      device_info: deviceInfo,
      app_version: "1.0.0",
    };
    const { ok } = await db.submitFeedback(payload);
    setLoading(false);
    setStep(ok ? "sent" : "error");
  };

  if (step === "sent") return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif", padding:24, position:"relative" }}>
      <Starfield n={40}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center", animation:"popIn 0.5s ease" }}>
        <div style={{ fontSize:72, marginBottom:14 }}>🚀</div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:18, color:C.green, marginBottom:8 }}>REPORT SENT!</div>
        <div style={{ color:C.dim, fontSize:13, lineHeight:1.7, marginBottom:22, maxWidth:280 }}>
          Thank you! Our team will look into this and get back to you within 24 hours.
        </div>
        <Card color={C.green} style={{ marginBottom:20, padding:"12px 16px", textAlign:"left" }}>
          <div style={{ fontSize:10, color:C.green, fontFamily:"'Orbitron',sans-serif", marginBottom:6 }}>YOUR REPORT</div>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
            <span style={{ fontSize:16 }}>{FEEDBACK_CATS.find(c=>c.id===cat)?.icon}</span>
            <span style={{ color:textColor(), fontSize:12, fontWeight:700 }}>{FEEDBACK_CATS.find(c=>c.id===cat)?.label}</span>
          </div>
          <div style={{ color:C.dim, fontSize:11, lineHeight:1.5 }}>{desc.substring(0, 100)}{desc.length>100?"…":""}</div>
        </Card>
        <Btn color={C.cyan} onClick={onBack}>← BACK TO APP</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", position:"relative" }}>
      <Starfield n={20}/>
      <div style={{ position:"relative", zIndex:2, background:`${C.orange}1a`, borderBottom:`1px solid ${C.orange}33`, padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <BackBtn onClick={onBack} color={C.orange}/>
          <div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.orange }}>📣 REPORT / FEEDBACK</div>
            <div style={{ fontSize:10, color:C.dim }}>We read every report</div>
          </div>
        </div>
      </div>

      <div style={{ position:"relative", zIndex:2, padding:"16px 18px", paddingBottom:40 }}>
        {/* Category selector */}
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, letterSpacing:2, marginBottom:10 }}>
          STEP 1 — WHAT IS THIS ABOUT?
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:18 }}>
          {FEEDBACK_CATS.map(fc => (
            <button key={fc.id} onClick={() => setCat(fc.id)} style={{
              background: cat===fc.id ? `${fc.color}22` : C.card,
              border:`2px solid ${cat===fc.id ? fc.color : fc.color+"22"}`,
              borderRadius:13, padding:"11px 10px", cursor:"pointer", textAlign:"left",
              boxShadow: cat===fc.id ? `0 0 14px ${fc.color}44` : "none",
              transition:"all 0.15s",
            }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{fc.icon}</div>
              <div style={{ fontSize:11, color: cat===fc.id ? fc.color : "#888", fontWeight:700, lineHeight:1.3 }}>{fc.label}</div>
            </button>
          ))}
        </div>

        {/* Description */}
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, letterSpacing:2, marginBottom:8 }}>
          STEP 2 — DESCRIBE THE ISSUE
        </div>
        <div style={{ position:"relative", marginBottom:6 }}>
          <textarea
            value={desc}
            onChange={e => { setDesc(e.target.value); setCharCount(e.target.value.length); }}
            placeholder="Tell us what happened... What were you doing when the problem occurred?"
            maxLength={500}
            rows={5}
            style={{
              width:"100%", padding:"13px", background:C.card2,
              border:`1.5px solid ${C.purple}44`, borderRadius:13,
              color:textColor(), fontSize:13, fontFamily:"'Nunito',sans-serif",
              resize:"none", outline:"none", lineHeight:1.6,
              boxSizing:"border-box",
            }}
            onFocus={e => { e.target.style.borderColor = C.cyan; }}
            onBlur={e => { e.target.style.borderColor = `${C.purple}44`; }}
          />
          <div style={{ position:"absolute", bottom:10, right:12, fontSize:10, color: charCount>400 ? C.orange : C.dim }}>
            {charCount}/500
          </div>
        </div>

        {/* Auto-captured info */}
        <div style={{ background:`${C.purple}0a`, border:`1px solid ${C.purple}22`, borderRadius:10, padding:"9px 12px", marginBottom:18 }}>
          <div style={{ fontSize:9, color:C.dim, fontFamily:"'Orbitron',sans-serif", marginBottom:4 }}>AUTO-CAPTURED (helps us fix faster)</div>
          <div style={{ fontSize:10, color:"#444", lineHeight:1.6 }}>
            Screen: <span style={{ color:"#666" }}>{currentScreen}</span> · 
            User: <span style={{ color:"#666" }}>{child?.name || "Guest"}</span> · 
            Online: <span style={{ color: navigator.onLine ? C.green : C.red }}>{navigator.onLine ? "Yes" : "No"}</span>
          </div>
        </div>

        {step === "error" && (
          <div style={{ background:`${C.red}14`, border:`1px solid ${C.red}44`, borderRadius:10, padding:"10px 13px", marginBottom:14 }}>
            <div style={{ color:C.red, fontSize:12, fontWeight:700 }}>⚠ Could not send — saved locally. Will retry when online.</div>
          </div>
        )}

        <Btn color={C.orange} loading={loading} disabled={!cat || desc.trim().length < 10} onClick={handleSubmit}>
          🚀 SEND REPORT
        </Btn>
        <div style={{ textAlign:"center", color:C.dim, fontSize:10, marginTop:10 }}>
          Reports are reviewed within 24 hours
        </div>
      </div>
    </div>
  );
}

export function RatingPrompt({ child, onClose }) {
  const [rating,  setRating]  = useState(0);
  const [hover,   setHover]   = useState(0);
  const [review,  setReview]  = useState("");
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (rating === 0) return;
    setLoading(true);
    await db.saveRating(child?.id, null, rating, review);
    db.track("app_rated", child?.id, null, { rating });
    setLoading(false);
    setDone(true);
  };

  if (done) return (
    <div style={{position:"fixed",inset:0,background:"rgba(4,4,15,0.94)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:C.card,borderRadius:22,padding:28,maxWidth:360,width:"100%",border:`2px solid ${C.yellow}44`,textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:10}}>🙏</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,color:C.yellow,marginBottom:8}}>THANK YOU!</div>
        <div style={{color:C.dim,fontSize:13,lineHeight:1.7,marginBottom:18}}>Your feedback helps us make MathMagic better for all space cadets!</div>
        <Btn color={C.yellow} onClick={onClose}>🚀 CONTINUE</Btn>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(4,4,15,0.94)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:C.card,borderRadius:22,padding:24,maxWidth:360,width:"100%",border:`2px solid ${C.yellow}44`,boxShadow:`0 0 40px ${C.yellow}22`}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:44,marginBottom:8}}>🌟</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,color:C.yellow,marginBottom:6}}>ENJOYING MATHMAGIC?</div>
          <div style={{color:C.dim,fontSize:13,lineHeight:1.6}}>Rate your experience and help other students discover MathMagic!</div>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
          {[1,2,3,4,5].map(i=>(
            <button key={i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(0)} onClick={()=>setRating(i)}
              style={{background:"none",border:"none",fontSize:38,cursor:"pointer",transition:"transform 0.15s",transform:(hover||rating)>=i?"scale(1.2)":"scale(1)",filter:(hover||rating)>=i?"none":"grayscale(1) opacity(0.4)"}}>
              ⭐
            </button>
          ))}
        </div>
        {rating > 0 && (
          <div style={{marginBottom:14}}>
            <div style={{color:textColor(),fontSize:13,fontWeight:700,marginBottom:6,textAlign:"center"}}>
              {["","😞 Poor","😐 Fair","🙂 Good","😊 Great","🤩 Amazing!"][rating]}
            </div>
            <textarea value={review} onChange={e=>setReview(e.target.value)}
              placeholder="Tell us more (optional)..."
              rows={2}
              style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.yellow}33`,borderRadius:11,padding:"10px 14px",color:textColor(),fontSize:13,fontFamily:"'Nunito',sans-serif",resize:"none",boxSizing:"border-box",outline:"none"}}
            />
          </div>
        )}
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:"none",border:`1px solid #181838`,borderRadius:12,color:C.dim,padding:"10px",cursor:"pointer",fontSize:12}}>LATER</button>
          <Btn color={C.yellow} style={{flex:2}} loading={loading} onClick={submit} disabled={rating===0}>⭐ SUBMIT RATING</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Privacy Policy ────────────────────────────────────────────────────

