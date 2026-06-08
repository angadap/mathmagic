// src/components/screens/Payment.jsx — loadRazorpayScript, RegPayment, LessonPayment, Paywall
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, Card, BackBtn, PinPad, StepDots, RegPage } from '../ui/primitives.jsx';
import { Starfield } from '../layout/layout.jsx';
import { WORLDS } from '../../constants/gameData.js';


export function loadRazorpayScript() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

async function openRazorpay({ keyId, orderId, amount, description, prefillName, onSuccess, onFail }) {
  // Fetch key on-demand if not yet loaded
  let resolvedKey = keyId;
  if (!resolvedKey) {
    try {
      const kr = await fetch("/api/payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"get_rzp_key"})});
      const kd = await kr.json();
      resolvedKey = kd.key || "";
      if (resolvedKey) window.__RZP_KEY__ = resolvedKey;
    } catch(e) {}
  }
  if (!resolvedKey) { onFail("Payment not configured. Contact support."); return; }
  const loaded = await loadRazorpayScript();
  if (!loaded) { onFail("Could not load payment gateway. Check internet."); return; }
  const rzp = new window.Razorpay({
    key: resolvedKey,
    order_id: orderId,
    amount: amount * 100,
    currency: "INR",
    name: "MathMagic Space Academy",
    description,
    prefill: { name: prefillName || "" },
    theme: { color: "#7c3aed" },
    handler: onSuccess,
    modal: { ondismiss: () => onFail("Payment cancelled.") },
  });
  rzp.open();
}

// -- RegPayment: Rs599 one-time registration payment
export function RegPayment({ onBack, onPaid }) {
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState("");
  const [utr,     setUtr]     = useState("");
  const [tab,     setTab]     = useState("razorpay");

  const handleRazorpay = async () => {
    setLoading(true); setMsg("");
    try {
      const r = await fetch("/api/payment", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({action:"create_reg_order", amount:599}),
      });
      const d = await r.json();
      if (!d.order_id) { setMsg(d.error||"Could not create order."); setLoading(false); return; }
      setLoading(false);
      openRazorpay({
        keyId: window.__RZP_KEY__||"",
        orderId: d.order_id,
        amount: 599,
        description: "MathMagic Registration Fee",
        prefillName: "",
        onSuccess: async (resp) => {
          setLoading(true);
          const v = await fetch("/api/payment", {
            method:"POST", headers:{"Content-Type":"application/json"},
            body:JSON.stringify({action:"verify_reg_payment", razorpay_order_id:resp.razorpay_order_id, razorpay_payment_id:resp.razorpay_payment_id, razorpay_signature:resp.razorpay_signature}),
          });
          const vd = await v.json();
          setLoading(false);
          if (vd.ok) { setMsg("\u2705 Payment successful! Setting up your account..."); setTimeout(onPaid, 1200); }
          else setMsg(vd.error||"Verification failed. Contact support.");
        },
        onFail: (e) => { setLoading(false); setMsg(e); },
      });
    } catch(e) { setLoading(false); setMsg("Network error. Try again."); }
  };

  const handleUPI = async () => {
    if (utr.trim().length < 10) { setMsg("Enter valid UTR (10+ chars)."); return; }
    setLoading(true); setMsg("");
    const r = await fetch("/api/payment", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"verify_reg_upi", utr:utr.trim()}),
    });
    const d = await r.json();
    setLoading(false);
    if (d.ok) { setMsg("\u2705 Payment verified! Setting up your account..."); setTimeout(onPaid, 1200); }
    else setMsg(d.error||"Verification failed.");
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#F5F0FF,#FAFBFF)",fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
          <BackBtn onClick={onBack} color={C.green}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.green}}>REGISTRATION FEE</div>
        </div>
        <div style={{background:"white",borderRadius:20,boxShadow:"0 8px 30px #2ECC9A28, 0 2px 6px #2ECC9A18, inset 0 1px 0 rgba(255,255,255,0.8)",padding:"24px 20px",marginBottom:20,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:8}}>{"\u{1F680}"}</div>
          <div style={{fontSize:20,fontWeight:900,color:"#1A1040",marginBottom:8}}>Registration Fee</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:4}}>
            <span style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:"#5B4FE8"}}>{"\u20B9"}599</span>
            <span style={{fontSize:12,color:"#9890C4",textDecoration:"line-through"}}>{"\u20B9"}999</span>
            <span style={{fontSize:10,color:"#FF6B6B",background:"#FF6B6B12",border:"1px solid #FF6B6B30",borderRadius:999,padding:"2px 8px",fontWeight:800}}>40% OFF</span>
          </div>
          <div style={{color:"#9890C4",fontSize:12}}>One-time {"\u00B7"} Lifetime access to your class</div>
        </div>
        <div style={{background:"white",border:"1.5px solid #2ECC9A30",borderRadius:20,boxShadow:"0 4px 12px #2ECC9A18",padding:"16px 14px",marginBottom:14}}>
          {[["Full access to your class lessons"],["All game modes & Abacus"],["Parent dashboard included"],["No ads, ever"]].map(([t],i)=>(
            <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
              <span style={{fontSize:16}}>✅</span><span style={{color:"#1A1040",fontSize:13,fontWeight:700}}>{t}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:0,marginBottom:16,background:"#F0ECFF",borderRadius:14,padding:3}}>
          {[["razorpay","\ud83d\udcb3 Card/UPI"],["upi","\ud83c\udfe6 UPI Manual"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{flex:1,background:tab===k?"white":"none",border:"none",borderRadius:11,padding:"8px",color:tab===k?"#5B4FE8":"#9890C4",fontWeight:tab===k?800:600,fontSize:12,cursor:"pointer",boxShadow:tab===k?"0 2px 8px rgba(91,79,232,0.15)":"none",transition:"all 0.2s"}}>{l}</button>
          ))}
        </div>
        {tab==="razorpay" ? (
          <Btn color={C.green} loading={loading} onClick={handleRazorpay}>{"\u{1F680}"} PAY {"\u20B9"}599 {"\u2014"} REGISTER NOW</Btn>
        ) : (
          <div>
            <div style={{color:"#5B4FE8",fontSize:12,marginBottom:6,textDecoration:"underline"}}>UPI ID: mathmagic@upi \u00B7 Amount: \u20B9599</div>
            <div style={{color:"#9890C4",fontSize:11,marginBottom:8}}>After paying, enter UTR / transaction ref number:</div>
            <input value={utr} onChange={e=>setUtr(e.target.value.toUpperCase())} placeholder="UTR / Ref number"
              style={{width:"100%",background:"rgba(91,79,232,0.04)",border:"1.5px solid #2ECC9A44",borderRadius:10,padding:"10px 12px",color:"#1A1040",fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block",marginBottom:10}}/>
            <Btn color={C.green} loading={loading} onClick={handleUPI}>{"\u2705"} VERIFY {"\u0026"} REGISTER</Btn>
          </div>
        )}
        {msg && <div style={{marginTop:12,color:msg.startsWith("\u2705")?C.green:C.red,fontSize:12,textAlign:"center",fontWeight:700}}>{msg}</div>}
        <div style={{marginTop:16,textAlign:"center",color:"#9890C4",fontSize:10}}>{"\ud83d\udd12"} Secured by Razorpay {"\u00B7"} 256-bit SSL</div>
      </div>
    </div>
  );
}

// -- LessonPayment: Rs300 per cross-class lesson
export function LessonPayment({ lessonToBuy, child, user, onBack, onPaid }) {
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState("");
  const [utr,     setUtr]     = useState("");
  const [tab,     setTab]     = useState("razorpay");
  if (!lessonToBuy) return null;
  const { lessonId, price=300 } = lessonToBuy;
  const authH = () => ({ "Content-Type":"application/json", Authorization:`Bearer ${db._token||""}` });

  const handleRazorpay = async () => {
    setLoading(true); setMsg("");
    try {
      const r = await fetch("/api/payment", {
        method:"POST", headers:authH(),
        body:JSON.stringify({action:"create_lesson_order", lesson_id:lessonId, child_id:child?.id, amount:price}),
      });
      const d = await r.json();
      if (!d.order_id) { setMsg(d.error||"Could not create order."); setLoading(false); return; }
      setLoading(false);
      openRazorpay({
        keyId: window.__RZP_KEY__||"",
        orderId: d.order_id,
        amount: price,
        description: `Unlock lesson ${lessonId}`,
        prefillName: child?.name||"",
        onSuccess: async (resp) => {
          setLoading(true);
          const v = await fetch("/api/payment", {
            method:"POST", headers:authH(),
            body:JSON.stringify({action:"verify_lesson_payment", razorpay_order_id:resp.razorpay_order_id, razorpay_payment_id:resp.razorpay_payment_id, razorpay_signature:resp.razorpay_signature, lesson_id:lessonId, child_id:child?.id}),
          });
          const vd = await v.json();
          setLoading(false);
          if (vd.ok) { setMsg("\u2705 Lesson unlocked!"); setTimeout(()=>onPaid(lessonId), 1000); }
          else setMsg(vd.error||"Verification failed.");
        },
        onFail: (e) => { setLoading(false); setMsg(e); },
      });
    } catch(e) { setLoading(false); setMsg("Network error."); }
  };

  const handleUPI = async () => {
    if (utr.trim().length < 10) { setMsg("Enter valid UTR."); return; }
    setLoading(true); setMsg("");
    const r = await fetch("/api/payment", {
      method:"POST", headers:authH(),
      body:JSON.stringify({action:"verify_lesson_upi", utr:utr.trim(), lesson_id:lessonId, child_id:child?.id, amount:price}),
    });
    const d = await r.json();
    setLoading(false);
    if (d.ok) { setMsg("\u2705 Lesson unlocked!"); setTimeout(()=>onPaid(lessonId), 1000); }
    else setMsg(d.error||"Verification failed.");
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#F5F0FF,#FAFBFF)",fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
          <BackBtn onClick={onBack} color={C.orange}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.orange}}>UNLOCK LESSON</div>
        </div>
        <div style={{background:"white",borderRadius:20,boxShadow:"0 8px 30px #2ECC9A28, 0 2px 6px #2ECC9A18, inset 0 1px 0 rgba(255,255,255,0.8)",padding:"24px 20px",marginBottom:20,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:8}}>{"🔓"}</div>
          <div style={{fontSize:20,fontWeight:900,color:"#1A1040",marginBottom:8}}>Lesson {lessonId}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:4}}>
            <span style={{fontFamily:"'Fredoka One',cursive",fontSize:32,color:"#5B4FE8"}}>{"₹"}{price}</span>
            <span style={{fontSize:12,color:"#9890C4",textDecoration:"line-through"}}>{"₹"}{Math.round(price*1.67)}</span>
            <span style={{fontSize:10,color:"#FF6B6B",background:"#FF6B6B12",border:"1px solid #FF6B6B30",borderRadius:999,padding:"2px 8px",fontWeight:800}}>40% OFF</span>
          </div>
          <div style={{color:"#9890C4",fontSize:12}}>Permanent unlock {"·"} Never expires</div>
        </div>
        <div style={{background:"white",border:"1.5px solid #2ECC9A30",borderRadius:20,boxShadow:"0 4px 12px #2ECC9A18",padding:"16px 14px",marginBottom:14}}>
          {[["All sets in this lesson unlocked"],["Permanent — never expires"],["All game modes for this lesson"]].map(([t],i)=>(
            <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
              <span style={{fontSize:16}}>✅</span><span style={{color:"#1A1040",fontSize:13,fontWeight:700}}>{t}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:0,marginBottom:16,background:"#F0ECFF",borderRadius:14,padding:3}}>
          {[["razorpay","💳 Card/UPI"],["upi","🏦 UPI Manual"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{flex:1,background:tab===k?"white":"none",border:"none",borderRadius:11,padding:"8px",color:tab===k?"#5B4FE8":"#9890C4",fontWeight:tab===k?800:600,fontSize:12,cursor:"pointer",boxShadow:tab===k?"0 2px 8px rgba(91,79,232,0.15)":"none",transition:"all 0.2s"}}>{l}</button>
          ))}
        </div>
        {tab==="razorpay" ? (
          <Btn color="#2ECC9A" loading={loading} onClick={handleRazorpay}>{"\ud83d\udd13"} UNLOCK FOR {"\u20B9"}{price}</Btn>
        ) : (
          <div>
            <div style={{color:"#5B4FE8",fontSize:12,marginBottom:6,textDecoration:"underline"}}>UPI ID: mathmagic@upi · Amount: {"₹"}{price}</div>
            <input value={utr} onChange={e=>setUtr(e.target.value.toUpperCase())} placeholder="UTR / Ref number"
              style={{width:"100%",background:"rgba(91,79,232,0.04)",border:"1.5px solid #2ECC9A44",borderRadius:10,padding:"10px 12px",color:"#1A1040",fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block",marginBottom:10}}/>
            <Btn color="#2ECC9A" loading={loading} onClick={handleUPI}>{"\u2705"} VERIFY {"\u0026"} UNLOCK</Btn>
          </div>
        )}
        {msg && <div style={{marginTop:12,color:msg.startsWith("\u2705")?C.green:C.red,fontSize:12,textAlign:"center",fontWeight:700}}>{msg}</div>}
        <div style={{marginTop:16,textAlign:"center",color:"#9890C4",fontSize:10}}>{"\ud83d\udd12"} Secured by Razorpay {"\u00B7"} 256-bit SSL</div>
      </div>
    </div>
  );
}

export function Paywall({ world, child, onBack, onUnlock }) {
  const [plan,    setPlan]    = useState("yearly");
  const [loading, setLoading] = useState(false);
  const plans = {
    monthly: { label:"Monthly", price:"₹199", sub:"per month" },
    yearly:  { label:"Yearly",  price:"₹999", sub:"per year · save 58%", badge:"BEST VALUE" },
  };
  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Nunito',sans-serif", position:"relative", overflowY:"auto" }}>
      <Starfield n={35}/>
      <div style={{ position:"relative", zIndex:2, padding:"20px 18px" }}>
        <div style={{textAlign:"center",marginBottom:12,padding:"14px 16px",background:`linear-gradient(135deg,${C.purple}22,${C.cyan}11)`,borderRadius:16,border:`1px solid ${C.cyan}33`}}>
          <div style={{fontSize:11,color:C.dim,fontFamily:"'Nunito',sans-serif",marginBottom:4}}>Welcome to MathMagic Space Academy</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,color:C.yellow,letterSpacing:1}}>🚀 Hello, {child?.name?.split(" ")[0]}!</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <BackBtn onClick={onBack} color={C.yellow}/>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, color:C.yellow }}>UNLOCK PREMIUM</div>
        </div>
        <div style={{ textAlign:"center", marginBottom:22 }}>
          <div style={{ fontSize:58, marginBottom:8, animation:"floatUp 2s ease-in-out infinite" }}>{world.planet}</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:17, color:world.color, marginBottom:5 }}>{world.world} is LOCKED 🔒</div>
          <div style={{ color:C.dim, fontSize:13, fontWeight:600, lineHeight:1.6 }}>Unlock all 5 worlds, Abacus program & Olympiad prep!</div>
        </div>
        <Card color={C.yellow} style={{ marginBottom:14 }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.yellow, marginBottom:10 }}>✨ PREMIUM INCLUDES</div>
          {[["🌍","All Class 1–5 worlds"],["🎮","All game modes"],["🧮","Abacus 10 levels"],["🎓","Olympiad prep"],["📊","Parent dashboard"],["🚫","Zero ads"]].map(([e,t],i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:6, alignItems:"center" }}>
              <span style={{ fontSize:16 }}>{e}</span><span style={{ color:"#ccc", fontSize:13 }}>{t}</span>
            </div>
          ))}
        </Card>
        <div style={{ display:"flex", gap:10, marginBottom:14 }}>
          {Object.entries(plans).map(([key, p]) => (
            <button key={key} onClick={() => setPlan(key)} style={{
              flex:1, background: plan===key ? `${C.cyan}22` : C.card,
              border:`2px solid ${plan===key ? C.cyan : C.purple+"33"}`,
              borderRadius:14, padding:"14px 10px", cursor:"pointer", textAlign:"center",
              position:"relative", boxShadow: plan===key ? `0 0 18px ${C.cyan}33` : "none", transition:"all 0.2s",
            }}>
              {p.badge && <div style={{ position:"absolute", top:-9, left:"50%", transform:"translateX(-50%)", background:C.orange, color:textColor(), fontSize:9, fontFamily:"'Orbitron',sans-serif", padding:"2px 8px", borderRadius:8, whiteSpace:"nowrap" }}>{p.badge}</div>}
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color: plan===key ? C.cyan : C.dim, marginBottom:4 }}>{p.label}</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:22, color:textColor()}}>{p.price}</div>
              <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{p.sub}</div>
            </button>
          ))}
        </div>
        <Btn color={C.yellow} loading={loading} onClick={async () => {
          setLoading(true);
          await new Promise(r => setTimeout(r, 1500));
          await db.setPremium(child.id);
          setLoading(false);
          onUnlock();
        }}>🚀  UNLOCK — {plans[plan].price}</Btn>
        <div style={{ marginTop:10, textAlign:"center", color:C.dim, fontSize:11, fontWeight:600 }}>🔒 Secure · Cancel anytime</div>
        <Card color={C.purple} style={{ marginTop:12, textAlign:"center", padding:"10px 14px" }}>
          <div style={{ color:C.purple, fontSize:10, fontFamily:"'Orbitron',sans-serif", marginBottom:3 }}>🔒 SECURE PAYMENT</div>
          <div style={{ color:C.dim, fontSize:11 }}>Razorpay integration — safe & encrypted checkout.</div>
        </Card>
      </div>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────
