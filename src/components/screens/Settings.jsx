// src/components/screens/Settings.jsx — Settings, TermsOfService, DataPolicy, PrivacyPolicy
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, BackBtn, Card } from '../ui/primitives.jsx';


export function TermsOfService({ onBack }) {
  const S = { h:{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.cyan,margin:"16px 0 6px"}, p:{color:C.dim,fontSize:12,lineHeight:1.7,marginBottom:8} };
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px",overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={onBack} color={C.cyan}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>TERMS OF SERVICE</div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        {[["1. Acceptance","By using MathMagic Space Academy you agree to these Terms. Parents accept on behalf of their child."],
          ["2. Use of Service","MathMagic is for children mathematics learning only. Must not be used for unlawful purposes."],
          ["3. Accounts","Parents are responsible for account security. We may terminate accounts that violate these Terms."],
          ["4. Content","All lessons and questions are owned by MathMagic. Do not copy or distribute without permission."],
          ["5. Payments","Subscriptions charged as selected. Refunds subject to our policy. Pricing may change with 30 days notice."],
          ["6. Liability","Service provided as-is. We are not liable for indirect or consequential damages."],
          ["7. Contact","support@mathmagicapp.in"]
        ].map(([h,p],i)=><div key={i}><div style={S.h}>{h}</div><p style={S.p}>{p}</p></div>)}
      </div>
    </div>
  );
}

// ── DataPolicy ────────────────────────────────────────────────────
export function DataPolicy({ onBack }) {
  const S = { h:{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.purple,margin:"16px 0 6px"}, p:{color:C.dim,fontSize:12,lineHeight:1.7,marginBottom:8} };
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px",overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={onBack} color={C.purple}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.purple}}>DATA COMPLIANCE</div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <div style={{color:C.dim,fontSize:11,marginBottom:14}}>COPPA · DPDP Act 2023 · GDPR</div>
        {[["Data Collected","Child name, avatar, class, PIN. Parent email. Progress and scores. Device type."],
          ["How We Use It","Personalised learning, progress tracking for parents. Never sold to third parties."],
          ["Children Privacy COPPA","Compliant. Only necessary data collected. Parents can request deletion anytime."],
          ["India DPDP 2023","Compliant with India Digital Personal Data Protection Act 2023. Data stored in India."],
          ["Security","Data encrypted in transit TLS 1.3 and at rest AES-256. JWT tokens expire in 7 days."],
          ["Your Rights","Access · Correct · Delete · Export your data. Contact: privacy@mathmagicapp.in"],
          ["AI Disclosure","Hints may use AI. No personal child data shared with AI providers."]
        ].map(([h,p],i)=><div key={i}><div style={S.h}>{h}</div><p style={S.p}>{p}</p></div>)}
      </div>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────
export function Settings({ child, user, onBack, onThemeChange, onLogout }) {
  const [sec,     setSec]     = useState(null);
  const [delConf, setDelConf] = useState(false);
  const [pwEmail, setPwEmail] = useState(user?.email||"");
  const [pwSent,  setPwSent]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState("");

  const handleReset = async () => {
    if (!pwEmail.trim()) { setMsg("Enter email"); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/db",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${db._token||""}`},body:JSON.stringify({action:"reset_password",email:pwEmail.trim()})});
      const d = await r.json();
      if(d.ok){setPwSent(true);setMsg("Reset link sent! Check your email.");}else setMsg(d.error||"Failed.");
    } catch(e){setMsg("Network error.");}
    setLoading(false);
  };

  const handleDelete = async () => {
    try{await fetch("/api/db",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${db._token||""}`},body:JSON.stringify({action:"delete_account",user_id:user?.id})});}catch(e){}
    onLogout();
  };

  if (sec==="theme") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={()=>setSec(null)} color={C.cyan}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>CHOOSE THEME</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,maxWidth:480,margin:"0 auto"}}>
        {Object.entries(THEMES).map(([key,t])=>{
          const cur=localStorage.getItem("mm_theme")||"light";
          return(<button key={key} onClick={()=>{localStorage.setItem("mm_theme",key);C=THEMES[key];if(onThemeChange)onThemeChange(key);SFX.tap();setSec(null);}} style={{background:cur===key?`${t.cyan}22`:t.card,border:`2px solid ${cur===key?t.cyan:t.dim+"44"}`,borderRadius:16,padding:"14px 10px",cursor:"pointer",textAlign:"center",boxShadow:cur===key?`0 0 14px ${t.cyan}44`:"none"}}>
            <div style={{fontSize:24,marginBottom:4}}>{t.icon}</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:cur===key?t.cyan:t.dim}}>{t.name}</div>
            <div style={{display:"flex",gap:3,justifyContent:"center",marginTop:6}}>{[t.purple,t.cyan,t.green,t.orange].map((cl,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:cl}}/>)}</div>
            {cur===key&&<div style={{fontSize:8,color:t.cyan,marginTop:4}}>✓ ACTIVE</div>}
          </button>);
        })}
      </div>
    </div>
  );

  if (sec==="profile") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={()=>setSec(null)} color={C.yellow}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.yellow}}>MY PROFILE</div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto",textAlign:"center"}}>
        <div style={{fontSize:60,marginBottom:10}}>{child?.avatar||"🧒"}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,color:C.yellow,marginBottom:4}}>{child?.name}</div>
        <div style={{color:C.dim,fontSize:12,marginBottom:20}}>Class {child?.class_num} · Level {child?.level||1}</div>
        <Card color={C.purple} style={{textAlign:"left"}}>
          {[["📧","Email",user?.email||"—"],["🏆","XP",`${child?.xp||0} pts`],["🪙","Coins",`${child?.coins||0}`],["🔥","Streak",`${child?.streak_days||0} days`],["💎","Plan",child?.is_premium?"Premium ✓":"Free"]].map(([e,l,v],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<4?`1px solid ${C.dim}22`:"none"}}>
              <span style={{color:C.dim,fontSize:13}}>{e} {l}</span><span style={{color:textColor(),fontSize:13,fontWeight:700}}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );

  if (sec==="password") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <BackBtn onClick={()=>setSec(null)} color={C.cyan}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>RESET PASSWORD</div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <Card color={C.cyan}>
          <div style={{color:C.dim,fontSize:13,marginBottom:12,lineHeight:1.6}}>A reset link will be sent to your email address.</div>
          <input value={pwEmail} onChange={e=>setPwEmail(e.target.value)} placeholder="Your email" style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"11px 14px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14,marginBottom:12,display:"block"}}/>
          {msg&&<div style={{fontSize:12,color:pwSent?C.green:C.red,marginBottom:10}}>{msg}</div>}
          {!pwSent?<Btn color={C.cyan} loading={loading} onClick={handleReset}>📧 SEND RESET LINK</Btn>
            :<div style={{textAlign:"center",color:C.green,fontFamily:"'Orbitron',sans-serif",fontSize:12}}>✅ CHECK YOUR EMAIL</div>}
        </Card>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <BackBtn onClick={()=>onBack()} color={C.cyan}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>SETTINGS</div>
      </div>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:48}}>{child?.avatar||"🧒"}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,color:C.yellow,marginTop:6}}>{child?.name}</div>
        <div style={{color:C.dim,fontSize:11}}>Class {child?.class_num}</div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column",gap:8}}>
        {[
          {icon:"👤",label:"My Profile",      sub:"Name, class, XP, coins",      act:()=>setSec("profile")},
          {icon:"🎨",label:"Change Theme",    sub:"6 themes incl. light modes",   act:()=>setSec("theme")},
          {icon:"🔑",label:"Reset Password",  sub:"Send reset link to email",     act:()=>setSec("password")},
          {icon:"⭐",label:"Rate the App",    sub:"Share your experience",        act:()=>onBack("rate")},
          {icon:"🔒",label:"Privacy Policy",  sub:"How we protect your data",     act:()=>onBack("privacy")},
          {icon:"📋",label:"Terms of Service",sub:"Usage terms and conditions",   act:()=>onBack("terms")},
          {icon:"🛡️",label:"Data Compliance", sub:"COPPA · DPDP 2023 · GDPR",   act:()=>onBack("datapolicy")},
          {icon:"🚪",label:"Logout",          sub:"Sign out of this device",      act:()=>onLogout(),color:C.orange},
          {icon:"🗑️",label:"Delete Account",  sub:"Permanently remove all data", act:()=>setDelConf(true),color:C.red},
        ].map((item,i)=>(
          <button key={i} onClick={item.act} style={{background:C.card,border:`1.5px solid ${(item.color||C.purple)+"33"}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left"}}>
            <span style={{fontSize:20,width:28,textAlign:"center"}}>{item.icon}</span>
            <div style={{flex:1}}><div style={{fontWeight:800,fontSize:14,color:item.color||"white"}}>{item.label}</div><div style={{fontSize:11,color:C.dim,marginTop:2}}>{item.sub}</div></div>
            <span style={{color:C.dim,fontSize:18}}>›</span>
          </button>
        ))}
      </div>
      {delConf&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <Card color={C.red} style={{maxWidth:320,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:10}}>⚠️</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.red,marginBottom:8}}>DELETE ACCOUNT?</div>
            <div style={{color:C.dim,fontSize:12,marginBottom:18,lineHeight:1.6}}>Permanently deletes all data for <strong style={{color:textColor()}}>{child?.name}</strong>. Cannot be undone.</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setDelConf(false)} style={{flex:1,background:C.card2,border:`1px solid ${C.dim}44`,borderRadius:12,padding:"11px",color:textColor(),cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>CANCEL</button>
              <button onClick={handleDelete} style={{flex:1,background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:12,padding:"11px",color:C.red,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:800}}>DELETE</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}



// ── EntryScreen ───────────────────────────────────────────────────
// ── Shared login helpers ─────────────────────────────────────────
export function PrivacyPolicy({ onBack }) {
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
      <div style={{position:"sticky",top:0,background:C.bg,zIndex:10,padding:"14px 18px",borderBottom:`1px solid #181838`,display:"flex",alignItems:"center",gap:12}}>
        <BackBtn onClick={onBack} color={C.cyan}/>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>PRIVACY POLICY</div>
      </div>
      <div style={{padding:"20px 20px 40px",maxWidth:600,margin:"0 auto",color:"#ccc",lineHeight:1.8,fontSize:14}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16, color:textColor(),marginBottom:6}}>MathMagic Space Academy</div>
        <div style={{color:C.dim,fontSize:12,marginBottom:24}}>Last updated: {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div>

        {[
          {t:"1. Data We Collect",b:["Account: Parent/guardian email and password (encrypted)","Child profile: First name, avatar, class level, PIN hash (not plain text)","Learning data: Lessons completed, quiz scores, XP, coins, streaks","Usage analytics: Lessons accessed, games played, daily challenges, session duration","Device info: Browser type, platform (web/Android/iOS), app version","Feedback and support messages submitted via the app"]},
          {t:"2. How We Use Your Data",b:["Deliver personalised learning content based on your child's class","Track progress and award XP, coins, stars and level-ups","Generate parent dashboard reports and learning insights","Improve app content, fix bugs, and enhance features","Send account-related notifications (no marketing without consent)","Detect and prevent fraud or unauthorised access"]},
          {t:"3. Data Sharing",b:["We DO NOT sell your data to anyone","We DO NOT share data with advertisers or third-party marketers","Service providers: Supabase (secure database hosting in EU/US) — bound by strict data processing agreements","Legal: We may disclose data if required by Indian law or court order","We NEVER share children's personal data with any third party for commercial purposes"]},
          {t:"4. Children's Privacy (COPPA & DPDP Compliant)",b:["MathMagic is for children aged 5-11 under parental supervision","A parent or guardian must register the account — children do not register directly","We collect only the minimum data necessary for the app to function","We do not show behavioural advertising to children","We do not use children's data for profiling or automated decision-making","Parents can request access, correction or deletion of their child's data at any time by emailing privacy@mathmagicacademy.in"]},
          {t:"5. AI-Generated Content Disclosure",b:["MathMagic uses AI assistance (Claude by Anthropic) to generate maths questions, puzzles, hints and learning content","All AI-generated content is reviewed for age-appropriateness and educational accuracy before use","AI is not used to make decisions about your child or generate personal recommendations without review","The app does not use AI to identify, track or profile children","AI-generated content is clearly integrated into the learning experience and is not presented as human-created"]},
          {t:"6. Play Store Data Safety",b:["Data collected: Name, email, learning progress, usage analytics","Data encrypted in transit: Yes (HTTPS/TLS)","Data encrypted at rest: Yes (Supabase AES-256)","User can request deletion: Yes — email privacy@mathmagicacademy.in","Data shared with third parties: No (except hosting provider)","Precise location: Not collected","Financial info: Not collected","Health info: Not collected","Messages: Not collected"]},
          {t:"7. Permissions We Request",b:["Internet access: Required to load lessons and save progress","Storage (optional): For offline caching of app shell only","Camera/Microphone: NOT requested","Contacts: NOT requested","Location: NOT requested","We request only the minimum permissions necessary for core functionality"]},
          {t:"8. Data Security",b:["All data transmitted over HTTPS with TLS encryption","Passwords are hashed and never stored in plain text","PINs are hashed before storage","JWT authentication tokens stored in browser memory only (not localStorage)","Supabase Row-Level Security policies restrict data access","Regular security audits and vulnerability assessments"]},
          {t:"9. Data Retention & Deletion",b:["Account data retained while account is active","Progress data deleted within 30 days of account deletion","Analytics data retained for 12 months then anonymised","To delete your account and all data: email privacy@mathmagicacademy.in","We will process deletion requests within 30 days as required by DPDP Act 2023"]},
          {t:"10. Your Rights (DPDP Act 2023)",b:["Right to access: Request a copy of your personal data","Right to correction: Request correction of inaccurate data","Right to erasure: Request deletion of your data","Right to grievance: File a complaint with our Grievance Officer","Right to nominate: Nominate another person to exercise your rights","Grievance Officer: privacy@mathmagicacademy.in | Response within 30 days"]},
          {t:"11. Content Rating",b:["This app is rated for ages 5+ (Everyone)","Contains: Educational content only","Does not contain: Violence, adult content, gambling, horror","Safe for children: Yes — all content is educational and age-appropriate","IARC/PEGI rating: 3+ | ESRB: Everyone"]},
          {t:"12. Contact & Updates",b:["Privacy Officer: privacy@mathmagicacademy.in","Support: Available via the SOS/Feedback feature in the app","Policy updates: Users notified via in-app notification","Effective date: "+new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}),"Governing law: Information Technology Act 2000 and DPDP Act 2023 (India)"]},
        ].map(({t,b},i)=>(
          <div key={i} style={{marginBottom:20}}>
            <div style={{fontWeight:800,color:textColor(),fontSize:14,marginBottom:6,lineHeight:1.4}}>{t}</div>
            <div style={{color:"#bbb"}}>{b.map((line,j)=><div key={j} style={{marginBottom:3,lineHeight:1.6,fontSize:13}}>{line}</div>)}</div>
          </div>
        ))
        }
      </div>
    </div>
  );
}

// ── Games Hub ─────────────────────────────────────────────────────────
