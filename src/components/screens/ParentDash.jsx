// src/components/screens/ParentDash.jsx — DonutChart, BarRow, Sparkline, SkillBadge, ParentDash
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, BackBtn, Card } from '../ui/primitives.jsx';
import { WORLDS, LESSONS, BADGES } from '../../constants/gameData.js';
import { Starfield } from '../layout/layout.jsx';


// ─────────────────────────────────────────────────────────────────────
// PARENT DASHBOARD — Revamped with charts, insights, strengths/weaknesses
// ─────────────────────────────────────────────────────────────────────

// Mini SVG Donut Chart (pure SVG, no deps)
export function DonutChart({ pct, color, size=80, strokeW=10, label, sublabel }) {
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const cx = size / 2, cy = size / 2;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}18`} strokeWidth={strokeW}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeW}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition:"stroke-dasharray 1.2s ease", filter:`drop-shadow(0 0 5px ${color}88)` }}/>
      </svg>
      <div style={{ marginTop:-size*0.62, marginBottom:size*0.62, textAlign:"center", zIndex:1, position:"relative" }}>
        <div style={{ fontSize:size*0.22, fontWeight:900, color, fontFamily:"'Orbitron',sans-serif", lineHeight:1 }}>{pct}%</div>
      </div>
      {label && <div style={{ fontSize:11, fontWeight:800, color:textColor(), textAlign:"center", marginTop:4 }}>{label}</div>}
      {sublabel && <div style={{ fontSize:10, color:C.dim, textAlign:"center" }}>{sublabel}</div>}
    </div>
  );
}

// Mini bar chart row
export function BarRow({ label, pct, color, val, max }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:12, fontWeight:700, color:textColor() }}>{label}</span>
        <span style={{ fontSize:11, fontWeight:800, color }}>{val}</span>
      </div>
      <div style={{ background:isDark()?"rgba(255,255,255,0.07)":C.border||"#ece8ff", borderRadius:20, height:8, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${color},${color}bb)`, borderRadius:20, transition:"width 1.1s ease", boxShadow:`0 0 6px ${color}66` }}/>
      </div>
    </div>
  );
}

// Sparkline SVG (weekly activity)
export function Sparkline({ data, color, height=40, width=180 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v,i) => {
    const x = (i / (data.length - 1)) * (width - 8) + 4;
    const y = height - 4 - ((v / max) * (height - 8));
    return `${x},${y}`;
  }).join(" ");
  const areaBot = `${(data.length-1)/(data.length-1)*(width-8)+4},${height-4} 4,${height-4}`;
  return (
    <svg width={width} height={height} style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <polygon points={`4,${height-4} ${pts} ${areaBot}`} fill="url(#sg)"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter:`drop-shadow(0 0 4px ${color}88)` }}/>
      {data.map((v,i)=>{
        const x=(i/(data.length-1))*(width-8)+4;
        const y=height-4-((v/max)*(height-8));
        return <circle key={i} cx={x} cy={y} r={i===data.length-1?4:2.5} fill={color} stroke={C.bg} strokeWidth={1.5}/>;
      })}
    </svg>
  );
}

// Hexagon skill badge
export function SkillBadge({ emoji, label, stars, color }) {
  const pct = Math.round((stars / 3) * 100);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, minWidth:72 }}>
      <div style={{ width:52, height:52, borderRadius:16, background:`${color}1a`, border:`2px solid ${color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, boxShadow:`0 2px 12px ${color}22`, position:"relative" }}>
        {emoji}
        {stars===3 && <div style={{ position:"absolute", top:-5, right:-5, fontSize:12 }}>✨</div>}
      </div>
      <div style={{ fontSize:9, fontWeight:800, color:textColor(), textAlign:"center", lineHeight:1.3, maxWidth:72 }}>{label}</div>
      <div style={{ display:"flex", gap:2 }}>
        {[1,2,3].map(s=><span key={s} style={{ fontSize:9, filter:s<=stars?"none":"grayscale(1) opacity(0.2)" }}>⭐</span>)}
      </div>
    </div>
  );
}

export function ParentDash({ child, onBack }) {
  const [progress, setProgress]   = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview | topics | insights | activity

  useEffect(() => {
    Promise.all([
      db.getProgress(child.id),
      new Promise(res => {
        const sb = window.__mmSb;
        if (!sb) return res(null);
        sb.from("analytics").select("event_type,created_at")
          .eq("child_id", child.id).order("created_at",{ascending:false}).limit(500)
          .then(({data:evts}) => res(evts)).catch(()=>res(null));
      })
    ]).then(([{data:prog}, evts]) => {
      setProgress(prog || []);
      if (evts) {
        const byType = {};
        evts.forEach(e => { byType[e.event_type]=(byType[e.event_type]||0)+1; });
        // Build last-7-days activity
        const days7 = Array.from({length:7},(_,i)=>{
          const d = new Date(); d.setDate(d.getDate()-6+i);
          return d.toISOString().slice(0,10);
        });
        const dayActivity = days7.map(d => evts.filter(e=>e.created_at?.slice(0,10)===d).length);
        const today = new Date().toISOString().slice(0,10);
        setAnalytics({ byType, total:evts.length, todayCount:evts.filter(e=>e.created_at?.slice(0,10)===today).length, dayActivity, days7 });
      }
      setLoading(false);
    });
  }, [child.id]);

  const myLessons    = LESSONS[child.class_num] || LESSONS[1];
  const allLessons   = Object.values(LESSONS).flat();
  const totalQ       = progress.reduce((s,p) => s+(p.total_questions||0), 0);
  const totalCorrect = progress.reduce((s,p) => s+(p.correct_count||0), 0);
  const acc          = totalQ > 0 ? Math.round((totalCorrect/totalQ)*100) : 0;
  const totalStars   = progress.reduce((s,p) => s+(p.stars_earned||0), 0);

  // Per-lesson metrics
  const lessonStats = myLessons.map(l => {
    const recs = progress.filter(x => x.lesson_id?.startsWith(l.id));
    const setsDone = new Set(recs.map(r=>r.lesson_id)).size;
    const lq = recs.reduce((s,r)=>s+(r.total_questions||0),0);
    const lc = recs.reduce((s,r)=>s+(r.correct_count||0),0);
    const lacc = lq>0 ? Math.round((lc/lq)*100) : 0;
    const bestStars = recs.reduce((mx,r)=>Math.max(mx,r.stars_earned||0),0);
    const pct = Math.round((setsDone/20)*100);
    return { ...l, setsDone, lq, lc, lacc, bestStars, pct };
  });

  const strengths = lessonStats.filter(l => l.lacc >= 75 && l.lq > 0).sort((a,b)=>b.lacc-a.lacc);
  const weaknesses = lessonStats.filter(l => l.lacc < 60 && l.lq > 0).sort((a,b)=>a.lacc-b.lacc);
  const notStarted = lessonStats.filter(l => l.lq === 0);
  const inProgress = lessonStats.filter(l => l.lq > 0 && l.pct < 100);

  // Overall progress pct
  const totalSets = myLessons.length * 20;
  const doneSets  = lessonStats.reduce((s,l)=>s+l.setsDone,0);
  const overallPct = totalSets > 0 ? Math.round((doneSets/totalSets)*100) : 0;

  // Grade
  const grade = acc >= 90 ? {label:"A+",color:C.green,msg:"Outstanding! 🌟"} :
                acc >= 80 ? {label:"A", color:C.cyan, msg:"Excellent! 🎉"} :
                acc >= 70 ? {label:"B", color:C.purple,msg:"Great work! 💪"} :
                acc >= 60 ? {label:"C", color:C.yellow,msg:"Good effort! 😊"} :
                acc > 0   ? {label:"D", color:C.orange,msg:"Keep practising! 🚀"} :
                            {label:"—", color:C.dim,   msg:"No data yet"};

  const tabs = [
    {id:"overview",  label:"Overview",  icon:"📊"},
    {id:"topics",    label:"Topics",    icon:"📚"},
    {id:"insights",  label:"Insights",  icon:"💡"},
    {id:"activity",  label:"Activity",  icon:"📈"},
  ];

  if (loading) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Starfield n={20}/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{ width:40, height:40, border:`3px solid ${C.purple}44`, borderTopColor:C.purple, borderRadius:"50%", animation:"spinR 0.7s linear infinite", margin:"0 auto 12px" }}/>
        <div style={{ fontFamily:"'Orbitron',sans-serif", color:C.dim, fontSize:11 }}>LOADING DASHBOARD…</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Baloo 2','Nunito',sans-serif", paddingBottom:50 }}>

      {/* ── Hero Header ── */}
      <div style={{ background:"linear-gradient(135deg,#FF5FA020,#9B59F515)", borderBottom:"1.5px solid #FF5FA018", padding:"18px 18px 14px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-30, right:-20, width:120, height:120, borderRadius:"50%", background:`radial-gradient(circle,${C.purple}22,transparent 70%)`, pointerEvents:"none" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <BackBtn onClick={onBack} color={C.pink}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, color:"#FF5FA0", fontWeight:900, letterSpacing:2, fontFamily:"'Nunito',sans-serif" }}>PARENT DASHBOARD</div>
            <div style={{ fontSize:19, fontWeight:900, color:textColor() }}>📊 {child.name}'s Report Card</div>
          </div>
          {/* Grade badge */}
          <div style={{ width:52, height:52, borderRadius:14, background:"#2ECC9A18", border:"2px solid #2ECC9A40", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <div style={{ fontSize:20, fontWeight:900, color:grade.color, fontFamily:"'Fredoka One',cursive", lineHeight:1 }}>{grade.label}</div>
            <div style={{ fontSize:8, color:"#9890C4" }}>GRADE</div>
          </div>
        </div>

        {/* Child info strip */}
        <div style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,0.7)", backdropFilter:"blur(10px)", borderRadius:16, padding:"10px 14px" }}>
          <div style={{ width:46, height:46, borderRadius:14, background:`linear-gradient(135deg,${C.purple},${C.pink})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{child.avatar}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:900, color:textColor() }}>{child.name}</div>
            <div style={{ fontSize:11, color:C.dim }}>{WORLDS.find(w=>w.id===parseInt(child.class_num||1))?.name||"Class"} · Level {child.level||1} · {child.is_premium?"⭐ Premium":"Free"}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:900, color:C.orange }}>{child.streak_days||0}🔥</div>
            <div style={{ fontSize:9, color:C.dim }}>Day Streak</div>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${isDark()?"rgba(255,255,255,0.08)":C.border||"#ece8ff"}`, background:C.card, position:"sticky", top:0, zIndex:10 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{ flex:1, padding:"11px 4px 9px", background:"none", border:"none", cursor:"pointer", borderBottom:`3px solid ${activeTab===t.id?C.cyan:"transparent"}`, transition:"all 0.2s" }}>
            <div style={{ fontSize:16 }}>{t.icon}</div>
            <div style={{ fontSize:9, fontWeight:800, color:activeTab===t.id?C.cyan:C.dim, fontFamily:"'Orbitron',sans-serif", letterSpacing:0.5 }}>{t.label}</div>
          </button>
        ))}
      </div>

      <div style={{ padding:"16px 16px" }}>

        {/* ══════════════ OVERVIEW TAB ══════════════ */}
        {activeTab === "overview" && (
          <div style={{ animation:"slideUp 0.35s ease" }}>

            {/* KPI cards row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
              {[
                {e:"⭐",v:totalStars,l:"Stars",c:C.yellow},
                {e:"📚",v:`${doneSets}/${totalSets}`,l:"Sets",c:C.cyan},
                {e:"🎯",v:`${acc}%`,l:"Accuracy",c:C.green},
                {e:"💎",v:child.xp||0,l:"XP",c:C.purple},
              ].map((s,i)=>(
                <div key={i} style={{ background:"white", border:`1.5px solid ${s.c}40`, borderRadius:16, padding:"11px 5px", textAlign:"center", boxShadow:`0 4px 14px ${s.c}18, inset 0 1px 0 rgba(255,255,255,0.8)` }}>
                  <div style={{ fontSize:20 }}>{s.e}</div>
                  <div style={{ fontSize:15, fontWeight:900, color:"#1A1040", marginTop:2 }}>{s.v}</div>
                  <div style={{ fontSize:9, color:"#9890C4", fontWeight:700 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Donut trio */}
            <div style={{ background:C.card, border:`1.5px solid ${C.purple}33`, borderRadius:20, padding:"18px 12px", marginBottom:14, boxShadow:`0 4px 20px ${C.purple}0d` }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.purple, letterSpacing:1.5, marginBottom:14, textAlign:"center" }}>📊 PERFORMANCE AT A GLANCE</div>
              <div style={{ display:"flex", justifyContent:"space-around", alignItems:"flex-start" }}>
                <DonutChart pct={overallPct} color={C.cyan}   size={86} strokeW={10} label="Progress"   sublabel={`${doneSets}/${totalSets} sets`}/>
                <DonutChart pct={acc}        color={grade.color} size={86} strokeW={10} label="Accuracy"   sublabel={`${totalCorrect}/${totalQ}`}/>
                <DonutChart pct={Math.min(100,Math.round((child.streak_days||0)/30*100))} color={C.orange} size={86} strokeW={10} label="Consistency" sublabel={`${child.streak_days||0} day streak`}/>
              </div>
            </div>

            {/* Strengths & Weaknesses quick row */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              {/* Strengths */}
              <div style={{ background:"#2ECC9A0a", border:"2px solid #2ECC9A30", borderRadius:18, padding:"14px 12px" }}>
                <div style={{ fontSize:11, fontWeight:900, color:"#2ECC9A", marginBottom:10, fontFamily:"'Nunito',sans-serif" }}>💪 STRONG</div>
                {strengths.length === 0
                  ? <div style={{ fontSize:11, color:"#9890C4" }}>Keep practising to unlock strengths!</div>
                  : strengths.slice(0,3).map((l,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                      <span style={{ fontSize:14 }}>✅</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, fontWeight:800, color:"#1A1040", lineHeight:1.2 }}>{l.title}</div>
                      </div>
                      <div style={{ fontSize:9, color:"#2ECC9A", fontWeight:800 }}>{l.lacc}%+</div>
                    </div>
                  ))
                }
              </div>

              {/* Weaknesses */}
              <div style={{ background:"#FF6B6B07", border:"2px solid #FF6B6B25", borderRadius:18, padding:"14px 12px" }}>
                <div style={{ fontSize:11, fontWeight:900, color:"#FF6B6B", marginBottom:10, fontFamily:"'Nunito',sans-serif" }}>⚠️ NEEDS WORK</div>
                {weaknesses.length === 0
                  ? <div style={{ fontSize:11, color:"#9890C4" }}>{totalQ>0?"All topics looking good! 🎉":"No data yet"}</div>
                  : weaknesses.slice(0,3).map((l,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                      <span style={{ fontSize:14 }}>📌</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, fontWeight:800, color:"#1A1040", lineHeight:1.2 }}>{l.title}</div>
                      </div>
                      <div style={{ fontSize:9, color:"#FF6B6B", fontWeight:800 }}>Below 60%</div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Analytics mini grid */}
            {analytics && (
              <div style={{ background:C.card, border:`1.5px solid ${C.cyan}33`, borderRadius:18, padding:"14px 12px", marginBottom:14 }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.cyan, letterSpacing:1.5, marginBottom:12 }}>📱 USAGE SUMMARY</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                  {[
                    {icon:"📱",label:"App Opens",   val:analytics.byType["app_open"]||0, c:C.cyan},
                    {icon:"📅",label:"Today",        val:analytics.todayCount, c:C.green},
                    {icon:"✅",label:"Sets Done",    val:analytics.byType["lesson_complete"]||0, c:C.purple},
                    {icon:"🌟",label:"Challenges",   val:analytics.byType["daily_challenge_complete"]||0, c:C.yellow},
                    {icon:"🧩",label:"Puzzles",      val:analytics.byType["daily_puzzle_complete"]||0, c:C.pink},
                    {icon:"📊",label:"Total Events", val:analytics.total, c:C.orange},
                  ].map(({icon,label,val,c})=>(
                    <div key={label} style={{background:`${c}0f`,border:`1px solid ${c}33`,borderRadius:12,padding:"9px 8px",textAlign:"center"}}>
                      <div style={{fontSize:18,marginBottom:2}}>{icon}</div>
                      <div style={{fontSize:16,fontWeight:900,color:c,fontFamily:"'Orbitron',sans-serif"}}>{val}</div>
                      <div style={{color:C.dim,fontSize:9,fontWeight:700}}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grade explanation */}
            <div style={{ background:`${grade.color}12`, border:`2px solid ${grade.color}44`, borderRadius:18, padding:"14px 16px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:52, height:52, borderRadius:16, background:`${grade.color}22`, border:`2.5px solid ${grade.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Orbitron',sans-serif", fontSize:20, fontWeight:900, color:grade.color, flexShrink:0 }}>{grade.label}</div>
              <div>
                <div style={{ fontSize:15, fontWeight:900, color:grade.color }}>{grade.msg}</div>
                <div style={{ fontSize:12, color:C.dim, marginTop:3, lineHeight:1.5 }}>
                  {acc >= 80 ? `${child.name} is performing brilliantly! Keep up this momentum.` :
                   acc >= 60 ? `Good progress! Focus on weak topics to push higher.` :
                   totalQ > 0 ? `Consistent daily practice will improve scores quickly.` :
                   `No practice sessions recorded yet. Start today!`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ TOPICS TAB ══════════════ */}
        {activeTab === "topics" && (
          <div style={{ animation:"slideUp 0.35s ease" }}>

            {/* Skill badges row */}
            {lessonStats.filter(l=>l.lq>0).length > 0 && (
              <div style={{ background:C.card, border:`1.5px solid ${C.cyan}33`, borderRadius:20, padding:"16px 12px", marginBottom:14 }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.cyan, letterSpacing:1.5, marginBottom:14 }}>🏅 SKILL BADGES</div>
                <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:4 }}>
                  {lessonStats.filter(l=>l.lq>0).map((l,i)=>(
                    <SkillBadge key={i} emoji={l.emoji||l.icon||"📚"} label={l.title} stars={l.bestStars}
                      color={l.lacc>=75?C.green:l.lacc>=50?C.yellow:C.orange}/>
                  ))}
                </div>
              </div>
            )}

            {/* Bar chart — accuracy per topic */}
            {lessonStats.filter(l=>l.lq>0).length > 0 && (
              <div style={{ background:C.card, border:`1.5px solid ${C.purple}33`, borderRadius:20, padding:"16px 14px", marginBottom:14 }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.purple, letterSpacing:1.5, marginBottom:14 }}>🎯 ACCURACY BY TOPIC</div>
                {lessonStats.filter(l=>l.lq>0).map((l,i)=>(
                  <BarRow key={i}
                    label={l.title}
                    pct={l.lacc}
                    val={`${l.lacc}%`}
                    color={l.lacc>=75?C.green:l.lacc>=50?C.yellow:C.orange}/>
                ))}
              </div>
            )}

            {/* Completion bar chart */}
            <div style={{ background:C.card, border:`1.5px solid ${C.cyan}33`, borderRadius:20, padding:"16px 14px", marginBottom:14 }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.cyan, letterSpacing:1.5, marginBottom:14 }}>📚 LESSON COMPLETION</div>
              {lessonStats.map((l,i)=>(
                <BarRow key={i}
                  label={l.title}
                  pct={l.pct}
                  val={`${l.setsDone}/20`}
                  color={l.pct===100?C.green:l.pct>0?C.cyan:C.dim}/>
              ))}
            </div>

            {/* Not started */}
            {notStarted.length > 0 && (
              <div style={{ background:`${C.dim}0a`, border:`1.5px solid ${C.dim}33`, borderRadius:18, padding:"14px 14px" }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, letterSpacing:1.5, marginBottom:10 }}>📋 NOT STARTED YET ({notStarted.length})</div>
                {notStarted.map((l,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7, background:isDark()?"rgba(255,255,255,0.04)":C.border||"#f5f0ff", borderRadius:10, padding:"7px 10px" }}>
                    <span style={{ fontSize:16, filter:"grayscale(1) opacity(0.5)" }}>{l.emoji||l.icon||"📚"}</span>
                    <span style={{ color:C.dim, fontSize:12, fontWeight:700 }}>{l.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════ INSIGHTS TAB ══════════════ */}
        {activeTab === "insights" && (
          <div style={{ animation:"slideUp 0.35s ease" }}>

            {/* Smart summary card */}
            <div style={{ background:`linear-gradient(135deg,${C.purple}22,${C.cyan}0d)`, border:`2px solid ${C.purple}44`, borderRadius:20, padding:"18px 16px", marginBottom:14 }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.purple, letterSpacing:1.5, marginBottom:12 }}>🧠 LEARNING SUMMARY</div>
              <div style={{ fontSize:13, color:textColor(), lineHeight:1.8 }}>
                {totalQ === 0 ? (
                  <span>{child.name} hasn't completed any practice sessions yet. Encourage them to start with Lesson 1 today!</span>
                ) : (
                  <>
                    <span>{child.name} has answered <b style={{color:C.cyan}}>{totalQ} questions</b> and got <b style={{color:C.green}}>{totalCorrect} correct</b> — an accuracy of <b style={{color:grade.color}}>{acc}%</b>.<br/><br/>
                    {strengths.length > 0 && <>Strongest in: <b style={{color:C.green}}>{strengths[0].title}</b>{strengths.length>1?`, ${strengths[1].title}`:""}<br/></>}
                    {weaknesses.length > 0 && <>Needs focus on: <b style={{color:C.orange}}>{weaknesses[0].title}</b>{weaknesses.length>1?`, ${weaknesses[1].title}`:""}<br/></>}
                    {(child.streak_days||0) >= 7 && <><b style={{color:C.yellow}}>🔥 {child.streak_days} day streak</b> — excellent consistency!</>}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div style={{ background:C.card, border:`1.5px solid ${C.pink}44`, borderRadius:20, padding:"16px 14px", marginBottom:14 }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.pink, letterSpacing:1.5, marginBottom:14 }}>🎯 RECOMMENDATIONS FOR PARENTS</div>
              {[
                weaknesses.length > 0 && {
                  icon:"📌", color:C.orange,
                  title:`Practice ${weaknesses[0].title} daily`,
                  desc:`This is ${child.name}'s weakest topic at ${weaknesses[0].lacc}% accuracy. Even 5 minutes a day will improve this significantly.`
                },
                acc < 70 && totalQ > 0 && {
                  icon:"⏱️", color:C.cyan,
                  title:"Short daily sessions beat long weekly ones",
                  desc:`Encourage ${child.name} to practice 10–15 minutes each day rather than hour-long sessions on weekends.`
                },
                (child.streak_days||0) < 3 && {
                  icon:"🔥", color:C.yellow,
                  title:"Build the streak habit",
                  desc:`A consistent streak boosts learning. Remind ${child.name} to open the app every day — even for 5 minutes!`
                },
                strengths.length > 0 && {
                  icon:"🌟", color:C.green,
                  title:`${child.name} excels at ${strengths[0].title}!`,
                  desc:`Celebrate this strength! It shows ${child.name} has mastered ${strengths[0].lacc}% accuracy in this topic.`
                },
                notStarted.length > 0 && {
                  icon:"🚀", color:C.purple,
                  title:`${notStarted.length} topics haven't been explored yet`,
                  desc:`Encourage ${child.name} to try ${notStarted[0].title} next for a well-rounded skill set.`
                },
              ].filter(Boolean).slice(0,4).map((r,i)=>(
                <div key={i} style={{ display:"flex", gap:12, marginBottom:12, background:`${r.color}0d`, border:`1px solid ${r.color}33`, borderRadius:14, padding:"12px 12px" }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:900, color:r.color, marginBottom:3 }}>{r.title}</div>
                    <div style={{ fontSize:11, color:C.dim, lineHeight:1.6 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
              {[weaknesses.length > 0, acc < 70 && totalQ > 0, (child.streak_days||0) < 3, strengths.length > 0, notStarted.length > 0].filter(Boolean).length === 0 && (
                <div style={{ textAlign:"center", padding:"20px 0", color:C.dim, fontSize:13 }}>
                  <div style={{ fontSize:36, marginBottom:8 }}>🎉</div>
                  Everything looks great! Keep up the amazing work!
                </div>
              )}
            </div>

            {/* Stars pie chart (SVG) */}
            {lessonStats.filter(l=>l.bestStars>0).length > 0 && (() => {
              const s3 = lessonStats.filter(l=>l.bestStars===3).length;
              const s2 = lessonStats.filter(l=>l.bestStars===2).length;
              const s1 = lessonStats.filter(l=>l.bestStars===1).length;
              const s0 = lessonStats.filter(l=>l.lq>0&&l.bestStars===0).length;
              const total2 = s3+s2+s1+s0 || 1;
              // Build pie slices
              const slices = [
                {val:s3,color:C.yellow,label:"3 Stars",pct:Math.round(s3/total2*100)},
                {val:s2,color:C.cyan,  label:"2 Stars",pct:Math.round(s2/total2*100)},
                {val:s1,color:C.purple,label:"1 Star", pct:Math.round(s1/total2*100)},
                {val:s0,color:C.dim,   label:"0 Stars",pct:Math.round(s0/total2*100)},
              ].filter(s=>s.val>0);
              let cumulAngle = -Math.PI/2;
              const cx=70, cy=70, r=55;
              const arcs = slices.map(s => {
                const angle = (s.val/total2)*2*Math.PI;
                const x1=cx+r*Math.cos(cumulAngle), y1=cy+r*Math.sin(cumulAngle);
                cumulAngle += angle;
                const x2=cx+r*Math.cos(cumulAngle), y2=cy+r*Math.sin(cumulAngle);
                const large = angle > Math.PI ? 1 : 0;
                return {...s, path:`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`};
              });
              return (
                <div style={{ background:C.card, border:`1.5px solid ${C.yellow}44`, borderRadius:20, padding:"16px 14px", marginBottom:14 }}>
                  <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.yellow, letterSpacing:1.5, marginBottom:14 }}>⭐ STAR DISTRIBUTION</div>
                  <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                    <svg width={140} height={140} viewBox="0 0 140 140">
                      {arcs.map((a,i)=>(
                        <path key={i} d={a.path} fill={a.color} stroke={C.bg} strokeWidth={2}
                          style={{ filter:`drop-shadow(0 0 4px ${a.color}66)` }}/>
                      ))}
                      <circle cx={70} cy={70} r={28} fill={C.card}/>
                      <text x={70} y={65} textAnchor="middle" fill={textColor()} fontSize="11" fontWeight="900" fontFamily="Orbitron">{lessonStats.filter(l=>l.lq>0).length}</text>
                      <text x={70} y={78} textAnchor="middle" fill={C.dim} fontSize="8" fontFamily="Nunito">topics</text>
                    </svg>
                    <div style={{ flex:1 }}>
                      {arcs.map((a,i)=>(
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                          <div style={{ width:12, height:12, borderRadius:4, background:a.color, flexShrink:0 }}/>
                          <div style={{ fontSize:12, fontWeight:700, color:textColor(), flex:1 }}>{a.label}</div>
                          <div style={{ fontSize:12, fontWeight:900, color:a.color }}>{a.pct}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══════════════ ACTIVITY TAB ══════════════ */}
        {activeTab === "activity" && (
          <div style={{ animation:"slideUp 0.35s ease" }}>

            {/* 7-day sparkline */}
            {analytics?.dayActivity && (
              <div style={{ background:C.card, border:`1.5px solid ${C.green}44`, borderRadius:20, padding:"18px 14px", marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <div>
                    <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.green, letterSpacing:1.5 }}>📈 LAST 7 DAYS</div>
                    <div style={{ fontSize:12, color:C.dim, marginTop:3 }}>App activity trend</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:20, fontWeight:900, color:C.green }}>{analytics.todayCount}</div>
                    <div style={{ fontSize:9, color:C.dim }}>events today</div>
                  </div>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <Sparkline data={analytics.dayActivity} color={C.green} width={280} height={56}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                  {analytics.days7.map((d,i)=>(
                    <div key={i} style={{ fontSize:8.5, color:C.dim, textAlign:"center" }}>
                      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(d).getDay()]}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed stats */}
            <div style={{ background:C.card, border:`1.5px solid ${C.purple}33`, borderRadius:20, padding:"16px 14px", marginBottom:14 }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.purple, letterSpacing:1.5, marginBottom:14 }}>🏆 LEARNING MILESTONES</div>
              {[
                {icon:"🔥",label:"Day Streak",         val:`${child.streak_days||0} days`,  color:C.orange, bar:(child.streak_days||0)/30},
                {icon:"💎",label:"Total XP",            val:`${child.xp||0} XP`,             color:C.purple, bar:Math.min(1,(child.xp||0)/5000)},
                {icon:"⭐",label:"Total Stars",         val:`${totalStars} ⭐`,              color:C.yellow, bar:Math.min(1,totalStars/(myLessons.length*3))},
                {icon:"📚",label:"Sets Completed",      val:`${doneSets}/${totalSets}`,      color:C.cyan,   bar:doneSets/Math.max(totalSets,1)},
                {icon:"🎯",label:"Overall Accuracy",    val:`${acc}%`,                       color:grade.color, bar:acc/100},
                {icon:"✅",label:"Questions Answered",  val:`${totalQ}`,                     color:C.green,  bar:Math.min(1,totalQ/1000)},
              ].map((m,i)=>(
                <div key={i} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>{m.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:12, fontWeight:800, color:textColor() }}>{m.label}</span>
                        <span style={{ fontSize:12, fontWeight:900, color:m.color }}>{m.val}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ background:isDark()?"rgba(255,255,255,0.07)":C.border||"#ece8ff", borderRadius:20, height:7, overflow:"hidden", marginLeft:28 }}>
                    <div style={{ width:`${Math.round(m.bar*100)}%`, height:"100%", background:`linear-gradient(90deg,${m.color},${m.color}aa)`, borderRadius:20, transition:"width 1.2s ease", boxShadow:`0 0 6px ${m.color}55` }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent topic performance table */}
            {lessonStats.filter(l=>l.lq>0).length > 0 && (
              <div style={{ background:C.card, border:`1.5px solid ${C.cyan}33`, borderRadius:20, padding:"16px 14px" }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.cyan, letterSpacing:1.5, marginBottom:14 }}>📋 FULL TOPIC REPORT</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto auto", gap:4, alignItems:"center" }}>
                  {["Topic","Sets","Acc","⭐"].map(h=>(
                    <div key={h} style={{ fontSize:9, color:C.dim, fontWeight:900, fontFamily:"'Orbitron',sans-serif", paddingBottom:6, borderBottom:`1px solid ${isDark()?"rgba(255,255,255,0.08)":C.border||"#ece8ff"}` }}>{h}</div>
                  ))}
                  {lessonStats.filter(l=>l.lq>0).map((l,i)=>(
                    <React.Fragment key={i}>
                      <div style={{ fontSize:11, fontWeight:700, color:textColor(), paddingTop:6, paddingBottom:6, display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:14 }}>{l.emoji||l.icon}</span> {l.title}
                      </div>
                      <div style={{ fontSize:11, color:C.dim, textAlign:"center", paddingTop:6 }}>{l.setsDone}</div>
                      <div style={{ fontSize:11, fontWeight:800, color:l.lacc>=75?C.green:l.lacc>=50?C.yellow:C.orange, textAlign:"center", paddingTop:6 }}>{l.lacc}%</div>
                      <div style={{ fontSize:11, textAlign:"center", paddingTop:6 }}>
                        {[1,2,3].map(s=><span key={s} style={{ fontSize:10, filter:s<=l.bestStars?"none":"grayscale(1) opacity(0.2)" }}>⭐</span>)}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export function AnalyticsCard({ childId }) {
  // Kept for backward compatibility but now merged into ParentDash
  return null;
}

// ─────────────────────────────────────────────────────────────────────
