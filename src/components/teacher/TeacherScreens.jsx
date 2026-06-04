// src/components/teacher/TeacherScreens.jsx — TeacherLogin, TeacherDashboard, TeacherQManager, TeacherLessons
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, BackBtn, Card } from '../ui/primitives.jsx';
import { LESSONS } from '../../constants/gameData.js';

export function TeacherLogin({ onBack, onDone }) {
  const [email,   setEmail]   = useState("");
  const [pin,     setPin]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleLogin = async () => {
    if (!email.trim()||pin.length<4) { setError("Enter email and PIN"); return; }
    setLoading(true); setError("");
    try {
      const d = await schoolApi("teacher_login", {email:email.trim().toLowerCase(), pin});
      if (d.teacher) { SFX.select(); localStorage.setItem('mm_teacher_session', JSON.stringify({...d.teacher, session_token:d.session_token})); onDone({...d.teacher, session_token:d.session_token}); }
      else setError(d.error||"Invalid credentials");
    } catch(e) { setError("Network error"); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"24px 18px",position:"relative"}}>
      <Starfield n={20}/>
      <div style={{position:"relative",zIndex:2,maxWidth:420,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
          <BackBtn onClick={onBack} color={C.yellow}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.yellow}}>TEACHER LOGIN</div>
        </div>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:52,marginBottom:8}}>👨‍🏫</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,color:C.yellow}}>TEACHER PORTAL</div>
        </div>
        <Card color={C.yellow}>
          <div style={{color:C.dim,fontSize:12,marginBottom:6,fontFamily:"'Orbitron',sans-serif"}}>EMAIL</div>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="teacher@school.com" type="email"
            style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.yellow}44`,borderRadius:10,padding:"11px 14px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14,marginBottom:12,display:"block"}}/>
          <div style={{color:C.dim,fontSize:12,marginBottom:6,fontFamily:"'Orbitron',sans-serif"}}>PIN</div>
          <input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,6))}
            type="password" placeholder="••••••" maxLength={6}
            style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.yellow}44`,borderRadius:10,padding:"11px 14px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:20,letterSpacing:6,textAlign:"center",marginBottom:12,display:"block"}}/>
          {error&&<div style={{color:C.red,fontSize:12,marginBottom:10}}>{error}</div>}
          <Btn color={C.yellow} loading={loading} onClick={handleLogin}>👨‍🏫 LOGIN</Btn>
        </Card>
      </div>
    </div>
  );
}

// ── TeacherDashboard Screen ───────────────────────────────────────

function StudentActions({ student, teacher, canChangePin, canModifyStudent, canDeleteStudent, canViewAnalytics, onRefresh, onClose }) {
  const [view,    setView]    = useState("menu");
  const [newPin,  setNewPin]  = useState("");
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState("");
  const [prog,    setProg]    = useState(null);

  const api = (action,body={}) => schoolApi(action,{...body,teacher_id:teacher.id,session_token:teacher.session_token||""});

  const changePin = async () => {
    if (newPin.length<4) { setMsg("Enter 4-digit PIN"); return; }
    setLoading(true);
    const d = await api("update_student_pin",{student_id:student.id,new_pin:newPin});
    setMsg(d.ok?"✅ PIN updated!":d.error||"Failed"); setLoading(false);
    if (d.ok) setTimeout(()=>{setView("menu");setMsg("");setNewPin("");},1200);
  };

  const deleteStudent = async () => {
    if (!confirm(`Delete ${student.name}? This cannot be undone.`)) return;
    setLoading(true);
    const d = await api("delete_student",{student_id:student.id});
    if (d.ok) { onRefresh(); setTimeout(onClose,100); } else setMsg(d.error||"Failed");
    setLoading(false);
  };

  const loadProgress = async () => {
    setLoading(true);
    const d = await api("get_student_progress",{student_id:student.id});
    setProg(d.data||[]); setView("progress"); setLoading(false);
  };

  const iS = (c) => ({width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${c}44`,borderRadius:10,padding:"9px 12px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block",marginBottom:8,outline:"none"});

  // ── Modify view ──────────────────────────────────────────────
  if (view==="modify") return (
    <div style={{marginTop:12,padding:"14px",background:isDark()?"rgba(255,255,255,0.04)":"rgba(124,111,224,0.04)",borderRadius:14,border:`1px solid ${C.purple}22`}}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:C.purple,marginBottom:12,letterSpacing:1}}>✏️ MODIFY STUDENT</div>
      {[["Full Name","name","text",student.name],["Roll No","roll_no","text",student.roll_no],["Username","username","text",student.username||""],["Section","section","text",student.section]].map(([l,k,t,ph])=>(
        <div key={k}>
          <div style={{color:C.dim,fontSize:11,marginBottom:3}}>{l}</div>
          <input defaultValue={ph} id={`mod_${k}_${student.id}`} type={t} placeholder={ph} style={iS(C.purple)}/>
        </div>
      ))}
      <div>
        <div style={{color:C.dim,fontSize:11,marginBottom:3}}>Class</div>
        <select id={`mod_class_${student.id}`} defaultValue={student.class_num}
          style={{...iS(C.purple),appearance:"none"}}>
          {["Nursery","Jr KG","Sr KG","Class 1","Class 2","Class 3","Class 4","Class 5"].map((n,i)=><option key={i} value={i}>{n}</option>)}
        </select>
      </div>
      {msg && <div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:12,marginBottom:8,padding:"6px 10px",background:msg.startsWith("✅")?`${C.green}12`:`${C.red}12`,borderRadius:8}}>{msg}</div>}
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <Btn color={C.purple} loading={loading} onClick={async()=>{
          setLoading(true);
          const get = k => document.getElementById(`mod_${k}_${student.id}`)?.value||"";
          const d = await api("modify_student",{student_id:student.id,name:get("name"),roll_no:get("roll_no"),username:get("username"),section:get("section"),class_num:document.getElementById(`mod_class_${student.id}`)?.value});
          setMsg(d.ok?"✅ Updated!":d.error||"Failed");
          if(d.ok){onRefresh();setTimeout(()=>{setView("menu");setMsg("");},1200);}
          setLoading(false);
        }}>SAVE</Btn>
        <button onClick={()=>{setView("menu");setMsg("");}} style={{flex:1,background:"none",border:`1px solid ${C.dim}33`,borderRadius:10,padding:"10px",color:C.dim,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13}}>CANCEL</button>
      </div>
    </div>
  );

  // ── PIN view ─────────────────────────────────────────────────
  if (view==="pin") return (
    <div style={{marginTop:12,padding:"14px",background:isDark()?"rgba(255,255,255,0.04)":"rgba(255,193,7,0.04)",borderRadius:14,border:`1px solid ${C.yellow}22`}}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:C.yellow,marginBottom:12,letterSpacing:1}}>🔑 CHANGE PIN FOR {student.name.toUpperCase()}</div>
      <div style={{color:C.dim,fontSize:11,marginBottom:6}}>New 4-digit PIN</div>
      <input value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/g,"").slice(0,4))} type="password" placeholder="••••" maxLength={4}
        style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.yellow}44`,borderRadius:10,padding:"10px 12px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:22,letterSpacing:8,textAlign:"center",display:"block",marginBottom:10,outline:"none"}}/>
      {msg && <div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:12,marginBottom:8,padding:"6px 10px",background:msg.startsWith("✅")?`${C.green}12`:`${C.red}12`,borderRadius:8}}>{msg}</div>}
      <div style={{display:"flex",gap:8}}>
        <Btn color={C.yellow} loading={loading} onClick={changePin}>SAVE PIN</Btn>
        <button onClick={()=>{setView("menu");setMsg("");setNewPin("");}} style={{flex:1,background:"none",border:`1px solid ${C.dim}33`,borderRadius:10,padding:"10px",color:C.dim,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13}}>CANCEL</button>
      </div>
    </div>
  );

  // ── Progress view ─────────────────────────────────────────────
  if (view==="progress") return (
    <div style={{marginTop:12,padding:"14px",background:isDark()?"rgba(255,255,255,0.04)":"rgba(0,212,255,0.04)",borderRadius:14,border:`1px solid ${C.cyan}22`}}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:C.cyan,marginBottom:12,letterSpacing:1}}>📊 {student.name.toUpperCase()}'S PROGRESS</div>
      {loading && <div style={{color:C.dim,fontSize:12,padding:"10px 0"}}>Loading...</div>}
      {prog && prog.length === 0 && <div style={{color:C.dim,fontSize:13,padding:"10px 0"}}>No lessons completed yet.</div>}
      {prog && prog.length > 0 && (
        <div>
          {/* Summary */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            {[
              ["🎓", prog.length, "Sets Done"],
              ["⭐", prog.reduce((s,p)=>s+(p.stars_earned||0),0), "Stars"],
              ["✅", prog.reduce((s,p)=>s+(p.correct_count||0),0), "Correct"],
            ].map(([icon,val,label],i) => (
              <div key={i} style={{background:C.card,borderRadius:10,padding:"8px",textAlign:"center"}}>
                <div style={{fontSize:16}}>{icon}</div>
                <div style={{fontWeight:900,fontSize:14,color:textColor()}}>{val}</div>
                <div style={{fontSize:9,color:C.dim,marginTop:1}}>{label}</div>
              </div>
            ))}
          </div>
          {/* List */}
          <div style={{maxHeight:200,overflowY:"auto"}}>
            {prog.slice(0,12).map((p,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${C.dim}11`,fontSize:12}}>
                <span style={{color:C.dim,fontFamily:"monospace",fontSize:11}}>{p.lesson_id?.replace("_s",": Set ")}</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{color:C.yellow}}>{"⭐".repeat(Math.min(p.stars_earned||0,3))}</span>
                  <span style={{color:textColor(),fontWeight:700}}>{p.correct_count||0}/{p.total_questions||20}</span>
                </div>
              </div>
            ))}
            {prog.length > 12 && <div style={{color:C.dim,fontSize:11,marginTop:6,textAlign:"center"}}>+{prog.length-12} more</div>}
          </div>
        </div>
      )}
      <button onClick={()=>setView("menu")} style={{marginTop:10,background:"none",border:"none",color:C.dim,fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>← Back</button>
    </div>
  );

  // ── Menu ─────────────────────────────────────────────────────
  const hasNoActions = !canChangePin && !canModifyStudent && !canDeleteStudent && !canViewAnalytics;
  if (hasNoActions) return (
    <div style={{marginTop:10,padding:"10px 14px",background:isDark()?"rgba(255,255,255,0.03)":"#f9f7ff",borderRadius:10,color:C.dim,fontSize:12}}>
      👁 View only — no actions permitted
    </div>
  );

  return (
    <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
      {/* Action buttons row */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {canViewAnalytics && (
          <button onClick={loadProgress}
            style={{background:`${C.cyan}18`,border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"8px 14px",color:C.cyan,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:5}}>
            📊 Progress
          </button>
        )}
        {canChangePin && (
          <button onClick={()=>setView("pin")}
            style={{background:`${C.yellow}18`,border:`1.5px solid ${C.yellow}44`,borderRadius:10,padding:"8px 14px",color:C.yellow,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:5}}>
            🔑 Change PIN
          </button>
        )}
        {canModifyStudent && (
          <button onClick={()=>setView("modify")}
            style={{background:`${C.purple}18`,border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"8px 14px",color:C.purple,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:5}}>
            ✏️ Edit
          </button>
        )}
        {canDeleteStudent && (
          <button onClick={deleteStudent}
            style={{background:`${C.red}18`,border:`1.5px solid ${C.red}44`,borderRadius:10,padding:"8px 14px",color:C.red,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:5}}>
            {loading ? "…" : "🗑 Delete"}
          </button>
        )}
      </div>
      {msg && <div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:12,padding:"6px 10px",background:msg.startsWith("✅")?`${C.green}12`:`${C.red}12`,borderRadius:8}}>{msg}</div>}
    </div>
  );
}

export function TeacherDashboard({ teacher, onLogout }) {

  // ── Permission helpers ─────────────────────────────────────────
  const tPerms = Array.isArray(teacher?.permissions) ? teacher.permissions : null;
  const hasPerm  = (p) => !tPerms || tPerms.includes(p);
  const hasAny   = (...ps) => ps.some(p => hasPerm(p));

  // Named capability gates
  const canViewStudents    = hasAny("view_analytics","change_student_pin","modify_student","delete_student");
  const canViewAnalytics   = hasPerm("view_analytics");
  const canChangePin       = hasPerm("change_student_pin");
  const canModifyStudent   = hasPerm("modify_student");
  const canDeleteStudent   = hasPerm("delete_student");
  const canAddQ            = hasPerm("add_lesson_set_question");
  const canModifyQ         = hasPerm("modify_lesson_set_question");
  const canDeleteQ         = hasPerm("delete_lesson_set_question");
  const canManageContent   = hasAny("add_lesson_set_question","modify_lesson_set_question","delete_lesson_set_question");

  // Role label
  const roleLabel = (() => {
    if (!tPerms) return { label:"Full Access", color:C.purple, icon:"⭐" };
    if (tPerms.length === 0) return { label:"Read Only", color:C.dim, icon:"👁" };
    if (canManageContent && !canViewStudents) return { label:"Content Manager", color:C.orange, icon:"📚" };
    if (canViewStudents && !canManageContent) return { label:"Class Teacher", color:C.cyan, icon:"🏫" };
    return { label:"Full Access", color:C.purple, icon:"⭐" };
  })();

  // ── Tabs — only show what teacher can access ───────────────────
  const tabs = [
    canViewStudents   && { id:"students",  label:"🏛️ My Class",   color:C.cyan },
    canViewAnalytics  && { id:"analytics", label:"📊 Analytics",  color:C.purple },
    canManageContent  && { id:"content",   label:"📚 Questions",  color:C.orange },
  ].filter(Boolean);

  const defaultTab = tabs[0]?.id || "locked";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // ── Data state ─────────────────────────────────────────────────
  const [classMap,    setClassMap]    = useState({});
  const [allStudents, setAllStudents] = useState([]);
  const [selClass,    setSelClass]    = useState(null);
  const [students,    setStudents]    = useState([]);
  const [selStudent,  setSelStudent]  = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [studentsView,setStudentsView]= useState("classes"); // classes | list

  // Q manager state
  const [qClassNum,  setQClassNum]  = useState(parseInt(teacher.class_num||1)||1);
  const [qLessons,   setQLessonsT]  = useState([]);
  const [qLesson,    setQLessonT]   = useState(null);
  const [qSets,      setQSetsT]     = useState([]);
  const [qSet,       setQSetT]      = useState(null);
  const [questions,  setQuestionsT] = useState([]);
  const [qForm,      setQForm]      = useState({});
  const [qMsg,       setQMsg]       = useState("");
  const [qLoading,   setQLoading]   = useState(false);
  const [qSubView,   setQSubView]   = useState("t_q_class");
  const [bulkText,   setBulkText]   = useState("");
  const [bulkResult, setBulkResult] = useState([]);

  const tApi = (action, body={}) => schoolApi(action, {...body, teacher_id:teacher.id, session_token:teacher.session_token||""});

  // Load class map
  const loadAll = async () => {
    setLoading(true);
    try {
      const d = await schoolApi("get_class_dashboard",{teacher_id:teacher.id, session_token:teacher.session_token||""});
      if (d.data) {
        const map = {};
        d.data.forEach(s=>{ const k=`${s.class_num}-${s.section}`; map[k]=(map[k]||0)+1; });
        setClassMap(map);
        setAllStudents(d.data);
      } else setError(d.error||"Failed to load");
    } catch(e) { setError("Network error"); }
    setLoading(false);
  };

  const loadClass = async (cls) => {
    setLoading(true); setSelClass(cls); setStudents([]);
    try {
      const d = await schoolApi("get_class_dashboard",{teacher_id:teacher.id, session_token:teacher.session_token||"", class_num:cls.class_num, section:cls.section});
      if (d.data) setStudents(d.data); else setError(d.error||"Failed");
    } catch(e) { setError("Network error"); }
    setStudentsView("list"); setLoading(false);
  };

  const refreshClass = () => selClass ? loadClass(selClass) : loadAll();

  const loadQLessonsT = async(cn) => { setQLoading(true);setQClassNum(cn);setQLessonsT([]);setQLessonT(null);setQSetsT([]);setQSetT(null);setQuestionsT([]); const d=await tApi("admin_list_lessons_for_class",{class_num:cn}); setQLessonsT(Array.isArray(d.data)?d.data:[]);setQLoading(false); };
  const loadQSetsT    = async(lid) => { setQLoading(true);setQLessonT(lid);setQSetsT([]);setQSetT(null);setQuestionsT([]); const d=await tApi("admin_list_sets_for_lesson",{lesson_id_prefix:lid}); setQSetsT(d.data||[]);setQLoading(false); };
  const loadQsT       = async(lid,si) => { setQLoading(true);setQSetT(si);setQuestionsT([]); const d=await tApi("admin_list_questions",{lesson_id_prefix:lid,set_index:si}); setQuestionsT(d.data||[]);setQLoading(false); };

  useEffect(()=>{ if (canViewStudents || canViewAnalytics) loadAll(); },[]);

  // ── Derived analytics ──────────────────────────────────────────
  const totalStudents = allStudents.length;
  const avgXP   = totalStudents ? Math.round(allStudents.reduce((s,st)=>s+(st.xp||0),0)/totalStudents) : 0;
  const avgLvl  = totalStudents ? (allStudents.reduce((s,st)=>s+(st.level||1),0)/totalStudents).toFixed(1) : "—";
  const topPerformers = [...allStudents].sort((a,b)=>(b.xp||0)-(a.xp||0)).slice(0,5);
  const streakLeaders = [...allStudents].sort((a,b)=>(b.streak_days||0)-(a.streak_days||0)).slice(0,5);
  const xpBuckets = { "0-100":0, "101-500":0, "501-1000":0, "1001+":0 };
  allStudents.forEach(s=>{ const x=s.xp||0; if(x<=100)xpBuckets["0-100"]++; else if(x<=500)xpBuckets["101-500"]++; else if(x<=1000)xpBuckets["501-1000"]++; else xpBuckets["1001+"]++; });
  const xpMax = Math.max(...Object.values(xpBuckets), 1);

  const CLASS_LABELS = {10:"Nursery",11:"Jr KG",12:"Sr KG",1:"Class 1",2:"Class 2",3:"Class 3",4:"Class 4",5:"Class 5"};
  const CLASS_OPTS   = ["Nursery","Jr KG","Sr KG","Class 1","Class 2","Class 3","Class 4","Class 5"];
  const CLASS_NUMS   = [10,11,12,1,2,3,4,5];
  const CLASS_EMOJIS = ["🌱","🌙","☀️","🌍","🪐","⭐","🔴","🌌"];

  // ── Header ─────────────────────────────────────────────────────
  const Header = () => (
    <div style={{background:C.card, borderBottom:`1px solid ${C.yellow}22`, padding:"13px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:20, backdropFilter:"blur(20px)"}}>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:15, fontWeight:900, color:textColor(), whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
          👩‍🏫 {teacher.name}
        </div>
        <div style={{display:"flex", alignItems:"center", gap:6, marginTop:2}}>
          <div style={{background:`${roleLabel.color}22`, border:`1px solid ${roleLabel.color}44`, borderRadius:6, padding:"1px 7px", fontSize:10, color:roleLabel.color, fontWeight:700}}>
            {roleLabel.icon} {roleLabel.label}
          </div>
          {teacher.school_name && <div style={{fontSize:10, color:C.dim}}>{teacher.school_name}</div>}
        </div>
      </div>
      <button onClick={onLogout} style={{background:`${C.red}18`, border:`1px solid ${C.red}44`, borderRadius:12, padding:"8px 14px", color:C.red, cursor:"pointer", fontSize:12, fontWeight:800, flexShrink:0}}>🚪 Logout</button>
    </div>
  );

  // ── Tab bar ────────────────────────────────────────────────────
  const TabBar = () => (
    <div style={{background:C.card, borderBottom:`1px solid ${C.dim}11`, padding:"0 18px", display:"flex", gap:4, position:"sticky", top:57, zIndex:19, overflowX:"auto"}}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
          style={{background:"none", border:"none", borderBottom:`3px solid ${activeTab===tab.id?tab.color:"transparent"}`, padding:"12px 14px", color:activeTab===tab.id?tab.color:C.dim, cursor:"pointer", fontSize:13, fontWeight:800, fontFamily:"'Baloo 2',sans-serif", whiteSpace:"nowrap", transition:"all 0.2s"}}>
          {tab.label}
        </button>
      ))}
    </div>
  );

  // ── Locked screen (no permissions at all) ─────────────────────
  if (tabs.length === 0) return (
    <div style={{minHeight:"100vh", background:C.bg, fontFamily:"'Baloo 2','Nunito',sans-serif", color:textColor()}}>
      <Header/>
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"70vh", padding:"40px 24px", textAlign:"center"}}>
        <div style={{fontSize:64, marginBottom:16}}>🔒</div>
        <div style={{fontSize:20, fontWeight:900, color:textColor(), marginBottom:8}}>No Permissions Assigned</div>
        <div style={{fontSize:14, color:C.dim, maxWidth:300, lineHeight:1.6}}>Your account doesn't have any permissions yet. Please contact your school administrator to set up your access.</div>
        <div style={{marginTop:24, background:`${C.dim}11`, border:`1px solid ${C.dim}22`, borderRadius:14, padding:"14px 20px", fontSize:12, color:C.dim}}>
          Your admin can assign: View Analytics, Manage Students, or Manage Questions
        </div>
      </div>
    </div>
  );

  // ── STUDENTS TAB ───────────────────────────────────────────────
  const StudentsTab = () => (
    <div>
      {studentsView === "classes" && (
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif", fontSize:10, color:C.dim, marginBottom:14, letterSpacing:1}}>SELECT CLASS & SECTION</div>
          {loading && <div style={{textAlign:"center", color:C.dim, padding:30, fontSize:14}}>Loading classes...</div>}
          {error && <div style={{color:C.red, fontSize:13, marginBottom:10}}>{error}</div>}
          {!loading && Object.keys(classMap).length === 0 && (
            <div style={{textAlign:"center", padding:40}}>
              <div style={{fontSize:48, marginBottom:12}}>👥</div>
              <div style={{color:C.dim, fontSize:14}}>No students found in your classes.</div>
            </div>
          )}
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
            {Object.keys(classMap).sort().map(k => {
              const [cn, sec] = k.split("-");
              const count = classMap[k];
              const classStudents = allStudents.filter(s=>`${s.class_num}-${s.section}`===k);
              const classAvg = classStudents.length ? Math.round(classStudents.reduce((s,st)=>s+(st.xp||0),0)/classStudents.length) : 0;
              return (
                <button key={k} onClick={()=>loadClass({class_num:parseInt(cn), section:sec})}
                  style={{background:`linear-gradient(135deg,${C.cyan}12,${C.purple}08)`, border:`1.5px solid ${C.cyan}33`, borderRadius:18, padding:"18px 16px", cursor:"pointer", textAlign:"left", transition:"all 0.2s"}}>
                  <div style={{fontSize:28, marginBottom:8}}>🏫</div>
                  <div style={{fontWeight:900, color:textColor(), fontSize:16}}>Class {cn}</div>
                  <div style={{fontSize:12, color:C.cyan, fontWeight:700, marginTop:2}}>Section {sec}</div>
                  <div style={{display:"flex", justifyContent:"space-between", marginTop:10}}>
                    <div style={{fontSize:11, color:C.dim}}>{count} students</div>
                    <div style={{fontSize:11, color:C.yellow}}>⭐ {classAvg} avg XP</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {studentsView === "list" && (
        <div>
          {/* Breadcrumb */}
          <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
            <button onClick={()=>{ setStudentsView("classes"); setSelClass(null); setStudents([]); setSelStudent(null); }}
              style={{background:"none", border:`1px solid ${C.dim}33`, borderRadius:8, padding:"5px 12px", color:C.dim, cursor:"pointer", fontSize:12, fontFamily:"'Nunito',sans-serif", fontWeight:700}}>
              ← Classes
            </button>
            <div style={{flex:1}}>
              <div style={{fontWeight:900, color:textColor(), fontSize:14}}>Class {selClass?.class_num} — Section {selClass?.section}</div>
              <div style={{fontSize:11, color:C.dim}}>{students.length} students</div>
            </div>
          </div>

          {/* Class mini-stats */}
          {students.length > 0 && (
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14}}>
              {[
                ["👥", students.length, "Students"],
                ["⭐", Math.round(students.reduce((s,st)=>s+(st.xp||0),0)/students.length), "Avg XP"],
                ["🏆", students[0]?.name?.split(" ")[0]||"—", "Top Student"],
              ].map(([icon, val, label], i) => (
                <div key={i} style={{background:C.card, border:`1px solid ${C.purple}22`, borderRadius:14, padding:"12px 10px", textAlign:"center"}}>
                  <div style={{fontSize:20}}>{icon}</div>
                  <div style={{fontFamily:"'Orbitron',sans-serif", fontSize:14, color:textColor(), margin:"4px 0", fontWeight:900}}>{val}</div>
                  <div style={{fontSize:10, color:C.dim}}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {loading && <div style={{textAlign:"center", color:C.dim, padding:20}}>Loading students...</div>}
          {error   && <div style={{color:C.red, fontSize:13, marginBottom:10}}>{error}</div>}

          {students.map((s, i) => {
            const isTop = i === 0;
            const expanded = selStudent?.id === s.id;
            return (
              <div key={s.id} style={{background:C.card, border:`1.5px solid ${isTop?C.yellow+"55":C.purple+"22"}`, borderRadius:16, padding:"12px 14px", marginBottom:8, transition:"all 0.2s"}}>
                <div style={{display:"flex", alignItems:"center", gap:12}}>
                  {/* Rank badge */}
                  <div style={{width:38, height:38, borderRadius:12, background:isTop?`${C.yellow}22`:`${C.purple}18`, border:`2px solid ${isTop?C.yellow+"66":C.purple+"33"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                    {isTop ? <span style={{fontSize:16}}>🏆</span> : <span style={{fontFamily:"'Orbitron',sans-serif", fontSize:11, color:C.purple, fontWeight:900}}>{String(s.roll_no||i+1).padStart(2,"0")}</span>}
                  </div>

                  {/* Info */}
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontWeight:900, fontSize:14, color:textColor(), display:"flex", alignItems:"center", gap:6}}>
                      {s.name}
                      {isTop && <span style={{fontSize:10, color:C.yellow, fontWeight:700}}>TOP</span>}
                    </div>
                    <div style={{display:"flex", gap:8, marginTop:3, flexWrap:"wrap"}}>
                      <span style={{fontSize:11, color:C.cyan}}>Lv {s.level||1}</span>
                      <span style={{fontSize:11, color:C.yellow}}>⭐ {s.xp||0} XP</span>
                      {(s.streak_days||0) > 0 && <span style={{fontSize:11, color:C.orange}}>🔥 {s.streak_days}d</span>}
                    </div>
                  </div>

                  {/* XP bar */}
                  <div style={{width:48, flexShrink:0}}>
                    <div style={{background:isDark()?"rgba(255,255,255,0.06)":"#ece8ff", borderRadius:4, height:5, overflow:"hidden", marginBottom:3}}>
                      <div style={{width:`${Math.min(100,(s.xp||0)/20)}%`, height:"100%", background:`linear-gradient(90deg,${C.cyan},${C.purple})`, borderRadius:4}}/>
                    </div>
                    <div style={{fontSize:9, color:C.dim, textAlign:"center"}}>{s.xp||0} XP</div>
                  </div>

                  {/* Expand toggle — only if teacher has any action permission */}
                  {(canChangePin || canModifyStudent || canDeleteStudent || canViewAnalytics) && (
                    <button onClick={()=>setSelStudent(expanded?null:s)}
                      style={{background:expanded?`${C.purple}22`:"none", border:`1px solid ${C.purple}33`, borderRadius:8, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", color:C.purple, cursor:"pointer", flexShrink:0, fontSize:13, transition:"all 0.2s"}}>
                      {expanded?"▲":"▼"}
                    </button>
                  )}
                </div>

                {/* Expanded student actions */}
                {expanded && (
                  <StudentActions student={s} teacher={teacher}
                    canChangePin={canChangePin} canModifyStudent={canModifyStudent}
                    canDeleteStudent={canDeleteStudent} canViewAnalytics={canViewAnalytics}
                    onRefresh={refreshClass} onClose={()=>setSelStudent(null)}/>
                )}
              </div>
            );
          })}
          {!loading && students.length === 0 && selClass && (
            <div style={{textAlign:"center", color:C.dim, padding:40, fontSize:14}}>No students in this class yet.</div>
          )}
        </div>
      )}
    </div>
  );

  // ── ANALYTICS TAB ──────────────────────────────────────────────
  const AnalyticsTab = () => (
    <div>
      {/* Summary metric cards */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18}}>
        {[
          { icon:"👥", val:totalStudents, label:"Total Students", color:C.cyan },
          { icon:"⭐", val:avgXP,         label:"Avg XP",         color:C.yellow },
          { icon:"📈", val:avgLvl,        label:"Avg Level",      color:C.purple },
          { icon:"🔥", val:allStudents.filter(s=>(s.streak_days||0)>=3).length, label:"Active Streaks", color:C.orange },
        ].map((m,i) => (
          <div key={i} style={{background:`linear-gradient(135deg,${m.color}14,${m.color}06)`, border:`1.5px solid ${m.color}33`, borderRadius:18, padding:"16px 14px"}}>
            <div style={{fontSize:24, marginBottom:6}}>{m.icon}</div>
            <div style={{fontFamily:"'Orbitron',sans-serif", fontSize:22, fontWeight:900, color:m.color}}>{m.val}</div>
            <div style={{fontSize:11, color:C.dim, marginTop:3}}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* XP Distribution bar chart */}
      <div style={{background:C.card, border:`1px solid ${C.purple}22`, borderRadius:18, padding:"16px", marginBottom:14}}>
        <div style={{fontWeight:900, color:textColor(), fontSize:14, marginBottom:14}}>📊 XP Distribution</div>
        {Object.entries(xpBuckets).map(([range, count]) => (
          <div key={range} style={{marginBottom:10}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
              <span style={{fontSize:12, color:C.dim, fontFamily:"monospace"}}>{range}</span>
              <span style={{fontSize:12, color:textColor(), fontWeight:700}}>{count} students</span>
            </div>
            <div style={{background:isDark()?"rgba(255,255,255,0.06)":"#f0ecff", borderRadius:6, height:10, overflow:"hidden"}}>
              <div style={{width:`${(count/xpMax)*100}%`, height:"100%", background:`linear-gradient(90deg,${C.cyan},${C.purple})`, borderRadius:6, transition:"width 0.8s ease", minWidth:count>0?8:0}}/>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performers */}
      <div style={{background:C.card, border:`1px solid ${C.yellow}22`, borderRadius:18, padding:"16px", marginBottom:14}}>
        <div style={{fontWeight:900, color:textColor(), fontSize:14, marginBottom:12}}>🏆 Top Performers</div>
        {topPerformers.length === 0 && <div style={{color:C.dim, fontSize:13}}>No students yet.</div>}
        {topPerformers.map((s,i) => (
          <div key={s.id} style={{display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom:i<topPerformers.length-1?`1px solid ${C.dim}11`:"none"}}>
            <div style={{width:28, height:28, borderRadius:8, background:[`${C.yellow}22`,`${C.dim}18`,`${C.orange}18`,`${C.dim}11`,`${C.dim}11`][i], border:`1.5px solid ${[C.yellow,C.dim,C.orange,C.dim,C.dim][i]}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0}}>
              {["🥇","🥈","🥉","4️⃣","5️⃣"][i]}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800, fontSize:13, color:textColor()}}>{s.name}</div>
              <div style={{fontSize:11, color:C.dim}}>Class {s.class_num} · Sec {s.section}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:13, fontWeight:900, color:C.yellow}}>⭐ {s.xp||0}</div>
              <div style={{fontSize:10, color:C.dim}}>Lv {s.level||1}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Streak leaders */}
      <div style={{background:C.card, border:`1px solid ${C.orange}22`, borderRadius:18, padding:"16px", marginBottom:14}}>
        <div style={{fontWeight:900, color:textColor(), fontSize:14, marginBottom:12}}>🔥 Streak Leaders</div>
        {streakLeaders.filter(s=>(s.streak_days||0)>0).length === 0 && <div style={{color:C.dim, fontSize:13}}>No active streaks.</div>}
        {streakLeaders.filter(s=>(s.streak_days||0)>0).map((s,i) => (
          <div key={s.id} style={{display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom:i<streakLeaders.length-1?`1px solid ${C.dim}11`:"none"}}>
            <div style={{fontSize:20, flexShrink:0}}>🔥</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800, fontSize:13, color:textColor()}}>{s.name}</div>
              <div style={{fontSize:11, color:C.dim}}>Class {s.class_num}-{s.section}</div>
            </div>
            <div style={{fontFamily:"'Orbitron',sans-serif", fontSize:16, color:C.orange, fontWeight:900}}>{s.streak_days}d</div>
          </div>
        ))}
      </div>

      {/* Class breakdown */}
      {Object.keys(classMap).length > 1 && (
        <div style={{background:C.card, border:`1px solid ${C.cyan}22`, borderRadius:18, padding:"16px"}}>
          <div style={{fontWeight:900, color:textColor(), fontSize:14, marginBottom:12}}>🏫 Class Breakdown</div>
          {Object.keys(classMap).sort().map(k => {
            const [cn,sec] = k.split("-");
            const cs = allStudents.filter(s=>`${s.class_num}-${s.section}`===k);
            const cavg = cs.length ? Math.round(cs.reduce((a,s)=>a+(s.xp||0),0)/cs.length) : 0;
            return (
              <div key={k} style={{display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom:`1px solid ${C.dim}11`}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800, fontSize:13, color:textColor()}}>Class {cn} — Sec {sec}</div>
                  <div style={{fontSize:11, color:C.dim}}>{cs.length} students</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13, fontWeight:700, color:C.cyan}}>⭐ {cavg} avg</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── CONTENT TAB ────────────────────────────────────────────────
  const ContentTab = () => (
    <TeacherQManager teacher={teacher} tApi={tApi}
      canAddQ={canAddQ} canModifyQ={canModifyQ} canDeleteQ={canDeleteQ}
      qClassNum={qClassNum} setQClassNum={setQClassNum}
      qLessons={qLessons} setQLessonsT={setQLessonsT}
      qLesson={qLesson} setQLessonT={setQLessonT}
      qSets={qSets} setQSetsT={setQSetsT}
      qSet={qSet} setQSetT={setQSetT}
      questions={questions} setQuestionsT={setQuestionsT}
      qForm={qForm} setQForm={setQForm}
      qMsg={qMsg} setQMsg={setQMsg}
      qLoading={qLoading} setQLoading={setQLoading}
      bulkText={bulkText} setBulkText={setBulkText}
      bulkResult={bulkResult} setBulkResult={setBulkResult}
      loadQLessonsT={loadQLessonsT} loadQSetsT={loadQSetsT} loadQsT={loadQsT}
      subView={qSubView} setView={setQSubView}/>
  );

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh", background:C.bg, fontFamily:"'Baloo 2','Nunito',sans-serif", color:textColor(), overflowY:"auto"}}>
      <Header/>
      {tabs.length > 1 && <TabBar/>}

      <div style={{padding:"16px 18px", maxWidth:620, margin:"0 auto"}}>
        {activeTab === "students"  && <StudentsTab/>}
        {activeTab === "analytics" && <AnalyticsTab/>}
        {activeTab === "content"   && <ContentTab/>}
      </div>
    </div>
  );
}


// ── TeacherQManager Component ─────────────────────────────────────
export function TeacherQManager({ teacher, tApi, canAddQ, canModifyQ, canDeleteQ,
  qClassNum, setQClassNum, qLessons, setQLessonsT, qLesson, setQLessonT,
  qSets, setQSetsT, qSet, setQSetT, questions, setQuestionsT,
  qForm, setQForm, qMsg, setQMsg, qLoading, setQLoading,
  bulkText, setBulkText, bulkResult, setBulkResult,
  loadQLessonsT, loadQSetsT, loadQsT, subView, setView }) {

  const iSQ = (a) => ({width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${a}44`,borderRadius:10,padding:"10px 12px",color:textColor(),fontFamily:"'Baloo 2',sans-serif",fontSize:14,display:"block",marginBottom:10,outline:"none"});
  const CLASS_LABELS = {10:"Nursery",11:"Jr KG",12:"Sr KG",1:"Class 1",2:"Class 2",3:"Class 3",4:"Class 4",5:"Class 5"};
  const CLASS_OPTS   = ["Nursery","Jr KG","Sr KG","Class 1","Class 2","Class 3","Class 4","Class 5"];
  const CLASS_NUMS   = [10,11,12,1,2,3,4,5];
  const emojis       = ["🌱","🌙","☀️","🌍","🪐","⭐","🔴","🌌"];

  // ── Class selector ───────────────────────────────────────────
  if (subView==="t_q_class") return (
    <div style={{padding:"16px 18px",maxWidth:600,margin:"0 auto"}}>
      <div style={{fontSize:16,fontWeight:900,color:textColor(),marginBottom:14}}>📚 Questions — Select Class</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {CLASS_OPTS.map((n,i)=>{
          const cn=CLASS_NUMS[i];
          return (
            <button key={cn} onClick={()=>{loadQLessonsT(cn);setView("t_q_lessons");}}
              style={{background:C.card,border:`2px solid ${C.orange}33`,borderRadius:16,padding:"18px 14px",cursor:"pointer",textAlign:"center",boxShadow:`0 2px 10px ${C.orange}10`}}>
              <div style={{fontSize:28}}>{emojis[i]}</div>
              <div style={{fontSize:13,fontWeight:900,color:C.orange,marginTop:6}}>{n}</div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Lessons list ─────────────────────────────────────────────
  if (subView==="t_q_lessons") return (
    <div style={{padding:"12px 18px",maxWidth:600,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <button onClick={()=>setView("t_q_class")} style={{background:"none",border:`1px solid ${C.dim}44`,borderRadius:8,padding:"5px 10px",color:C.dim,cursor:"pointer",fontSize:12}}>← Back</button>
        <div style={{fontSize:15,fontWeight:900,color:textColor()}}>{CLASS_LABELS[qClassNum]||"Class "+qClassNum} — Lessons</div>
      </div>
      {qLoading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
      {qMsg&&<div style={{color:qMsg.startsWith("✅")?C.green:C.red,fontSize:13,marginBottom:10,padding:"8px 12px",borderRadius:10,background:qMsg.startsWith("✅")?`${C.green}12`:`${C.red}12`}}>{qMsg}</div>}
      {qLessons.map((lesson,idx)=>{
        const lid=lesson.id||lesson; const title=lesson.title||lid;
        const num=parseInt((lid.split("-l")[1])||idx+1);
        return (
          <button key={lid} onClick={()=>{loadQSetsT(lid);setView("t_q_sets");}}
            style={{width:"100%",background:C.card,border:`1px solid ${C.orange}33`,borderRadius:14,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,marginBottom:8,textAlign:"left"}}>
            <div style={{width:38,height:38,borderRadius:10,background:`${C.orange}22`,border:`2px solid ${C.orange}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.orange,fontWeight:900,flexShrink:0}}>{num}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:900,color:textColor(),fontSize:14}}>Lesson {num}: {title}</div>
              <div style={{fontSize:11,color:C.orange,marginTop:2,fontFamily:"monospace"}}>{lid}</div>
            </div>
            <span style={{color:C.orange,fontSize:20}}>›</span>
          </button>
        );
      })}
      {!qLoading&&qLessons.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No lessons found.</div>}
    </div>
  );

  // ── Sets list ────────────────────────────────────────────────
  if (subView==="t_q_sets") return (
    <div style={{padding:"12px 18px",maxWidth:600,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <button onClick={()=>setView("t_q_lessons")} style={{background:"none",border:`1px solid ${C.dim}44`,borderRadius:8,padding:"5px 10px",color:C.dim,cursor:"pointer",fontSize:12}}>← Back</button>
        <div style={{fontSize:15,fontWeight:900,color:textColor()}}>{qLesson} — Sets</div>
      </div>
      {qLoading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
      {qSets.map(si=>(
        <button key={si} onClick={()=>{loadQsT(qLesson,si);setView("t_q_list");}}
          style={{width:"100%",background:C.card,border:`1px solid ${C.purple}33`,borderRadius:12,padding:"14px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,textAlign:"left"}}>
          <div><div style={{fontWeight:900,color:textColor(),fontSize:14}}>Set {si+1}</div><div style={{fontSize:11,color:C.dim}}>set_index: {si}</div></div>
          <span style={{color:C.purple,fontSize:20}}>›</span>
        </button>
      ))}
      {!qLoading&&qSets.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No sets yet.</div>}
    </div>
  );

  // ── Questions table ──────────────────────────────────────────
  if (subView==="t_q_list") return (
    <div style={{padding:"10px 14px",maxWidth:700,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <button onClick={()=>setView("t_q_sets")} style={{background:"none",border:`1px solid ${C.dim}44`,borderRadius:8,padding:"5px 10px",color:C.dim,cursor:"pointer",fontSize:12}}>← Back</button>
        <div style={{flex:1,fontSize:14,fontWeight:900,color:textColor()}}>{qLesson} · Set {(qSet??0)+1}</div>
        {canAddQ&&<button onClick={()=>{setQForm({lesson_id:qLesson,set_index:qSet??0,question_index:questions.length,opt0:"",opt1:"",opt2:"",opt3:"",correct:0});setQMsg("");setView("t_q_add");}} style={{background:`${C.green}22`,border:`1px solid ${C.green}44`,borderRadius:10,padding:"6px 12px",color:C.green,cursor:"pointer",fontSize:12,fontWeight:700}}>+ Question</button>}
      </div>
      {qLoading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
      {qMsg&&<div style={{color:qMsg.startsWith("✅")?C.green:C.red,fontSize:13,marginBottom:10,padding:"8px 12px",borderRadius:10,background:qMsg.startsWith("✅")?`${C.green}12`:`${C.red}12`}}>{qMsg}</div>}
      {questions.length>0&&(
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:C.card2}}>{["#","Question","A","B","C","D","✓","Actions"].map((h,i)=><th key={i} style={{padding:"8px 10px",textAlign:"left",color:C.dim,fontWeight:700,borderBottom:`1px solid ${C.orange}33`}}>{h}</th>)}</tr></thead>
            <tbody>
              {questions.map((q,i)=>(
                <tr key={q.id} style={{background:i%2===0?C.card:"transparent",borderBottom:`1px solid rgba(0,0,0,0.04)`}}>
                  <td style={{padding:"8px 10px",color:C.dim}}>{i+1}</td>
                  <td style={{padding:"8px 10px",color:textColor(),maxWidth:180,wordBreak:"break-word"}}>{q.question}</td>
                  {(q.options||[]).map((o,oi)=><td key={oi} style={{padding:"8px 10px",color:oi===q.correct_answer?C.green:textColor(),maxWidth:80,wordBreak:"break-word",opacity:oi===q.correct_answer?1:0.7}}>{o}</td>)}
                  <td style={{padding:"8px 10px",color:C.green,fontWeight:900}}>{"ABCD"[q.correct_answer]}</td>
                  <td style={{padding:"8px 6px",whiteSpace:"nowrap"}}>
                    {canModifyQ&&<button onClick={()=>{setQForm({id:q.id,question:q.question,opt0:q.options[0],opt1:q.options[1],opt2:q.options[2],opt3:q.options[3],correct:q.correct_answer,hint:q.hint||""});setQMsg("");setView("t_q_edit");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:6,padding:"4px 8px",color:C.cyan,cursor:"pointer",marginRight:4,fontSize:11}}>✏️</button>}
                    {canDeleteQ&&<button onClick={async()=>{if(!window.confirm("Delete this question?"))return;setQLoading(true);const d=await tApi("admin_delete_question",{id:q.id});if(d.ok){setQMsg("✅ Deleted");loadQsT(qLesson,qSet);}else setQMsg(d.error||"Failed");setQLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:6,padding:"4px 8px",color:C.red,cursor:"pointer",fontSize:11}}>🗑️</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!qLoading&&questions.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No questions in this set.</div>}
    </div>
  );

  // ── Add question ─────────────────────────────────────────────
  if (subView==="t_q_add" && canAddQ) return (
    <div style={{padding:"12px 18px",maxWidth:520,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <button onClick={()=>setView("t_q_list")} style={{background:"none",border:`1px solid ${C.dim}44`,borderRadius:8,padding:"5px 10px",color:C.dim,cursor:"pointer",fontSize:12}}>← Back</button>
        <div style={{fontSize:14,fontWeight:900,color:textColor()}}>Add Question — {qLesson} Set {(qSet??0)+1}</div>
      </div>
      <Card color={C.green}>
        {[["Question","question"],["Option A","opt0"],["Option B","opt1"],["Option C","opt2"],["Option D","opt3"],["Hint (optional)","hint"]].map(([l,k])=>(
          <div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={qForm[k]||""} onChange={e=>setQForm({...qForm,[k]:e.target.value})} style={iSQ(C.green)}/></div>
        ))}
        <div style={{marginBottom:12}}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>CORRECT ANSWER</div>
          <select value={qForm.correct??0} onChange={e=>setQForm({...qForm,correct:parseInt(e.target.value)})} style={iSQ(C.green)}>
            {["A","B","C","D"].map((l,i)=><option key={i} value={i}>Option {l} — {qForm["opt"+i]||""}</option>)}
          </select>
        </div>
        {qMsg&&<div style={{color:qMsg.startsWith("✅")?C.green:C.red,fontSize:13,marginBottom:8}}>{qMsg}</div>}
        <Btn color={C.green} loading={qLoading} onClick={async()=>{
          if(!qForm.question||!qForm.opt0||!qForm.opt1||!qForm.opt2||!qForm.opt3){setQMsg("Fill question and all 4 options.");return;}
          setQLoading(true);setQMsg("");
          const d=await tApi("admin_add_question",{lesson_id:qForm.lesson_id,set_index:qForm.set_index??0,question_index:qForm.question_index??0,question:qForm.question,options:[qForm.opt0,qForm.opt1,qForm.opt2,qForm.opt3],correct_answer:qForm.correct??0,hint:qForm.hint||""});
          if(d.data){setQMsg("✅ Added!");setQForm(f=>({...f,question:"",opt0:"",opt1:"",opt2:"",opt3:"",hint:"",question_index:(f.question_index??0)+1}));loadQsT(qLesson,qSet);}else setQMsg(d.error||"Failed");
          setQLoading(false);
        }}>ADD QUESTION</Btn>
      </Card>
    </div>
  );

  // ── Edit question ─────────────────────────────────────────────
  if (subView==="t_q_edit" && canModifyQ) return (
    <div style={{padding:"12px 18px",maxWidth:520,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <button onClick={()=>setView("t_q_list")} style={{background:"none",border:`1px solid ${C.dim}44`,borderRadius:8,padding:"5px 10px",color:C.dim,cursor:"pointer",fontSize:12}}>← Back</button>
        <div style={{fontSize:14,fontWeight:900,color:textColor()}}>Edit Question</div>
      </div>
      <Card color={C.cyan}>
        {[["Question","question"],["Option A","opt0"],["Option B","opt1"],["Option C","opt2"],["Option D","opt3"],["Hint","hint"]].map(([l,k])=>(
          <div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={qForm[k]||""} onChange={e=>setQForm({...qForm,[k]:e.target.value})} style={iSQ(C.cyan)}/></div>
        ))}
        <div style={{marginBottom:12}}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>CORRECT ANSWER</div>
          <select value={qForm.correct??0} onChange={e=>setQForm({...qForm,correct:parseInt(e.target.value)})} style={iSQ(C.cyan)}>
            {["A","B","C","D"].map((l,i)=><option key={i} value={i}>Option {l} — {qForm["opt"+i]||""}</option>)}
          </select>
        </div>
        {qMsg&&<div style={{color:qMsg.startsWith("✅")?C.green:C.red,fontSize:13,marginBottom:8}}>{qMsg}</div>}
        <Btn color={C.cyan} loading={qLoading} onClick={async()=>{
          setQLoading(true);setQMsg("");
          const d=await tApi("admin_update_question",{id:qForm.id,question:qForm.question,options:[qForm.opt0,qForm.opt1,qForm.opt2,qForm.opt3],correct_answer:qForm.correct??0,hint:qForm.hint||""});
          if(d.ok){setQMsg("✅ Saved!");loadQsT(qLesson,qSet);setView("t_q_list");}else setQMsg(d.error||"Failed");
          setQLoading(false);
        }}>SAVE CHANGES</Btn>
      </Card>
    </div>
  );

  return null;
}

// ── TeacherLessons Component ──────────────────────────────────────
export function TeacherLessons({ teacher, classFilter }) {
  const [lessons,  setLessons]  = useState([]);
  const [selLesson,setSelLesson]= useState(null);
  const [view,     setView]     = useState("list"); // list|add_lesson|add_q
  const [form,     setForm]     = useState({});
  const [qForm,    setQForm]    = useState({set_index:0,question_index:0,correct_answer:0});
  const [loading,  setLoading]  = useState(false);
  const [msg,      setMsg]      = useState("");

  const api = (action,body={}) => schoolApi(action,{...body,teacher_id:teacher.id,session_token:teacher.session_token||""});

  const load = async () => {
    setLoading(true);
    const d = await api("list_custom_lessons",{class_num:classFilter?.class_num});
    if(d.data) setLessons(d.data);
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const iStyle = (c) => ({width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${c}44`,borderRadius:10,padding:"10px 12px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block",marginBottom:10});

  const handleAddLesson = async () => {
    setLoading(true); setMsg("");
    const d = await api("create_lesson",{...form,class_num:classFilter?.class_num||parseInt(form.class_num)||1});
    if(d.data){setMsg("✅ Lesson created!");load();setView("list");}else setMsg(d.error||"Failed");
    setLoading(false);
  };

  const handleAddQ = async () => {
    if(!qForm.question||!selLesson){setMsg("Fill all fields");return;}
    const opts = [qForm.o0,qForm.o1,qForm.o2,qForm.o3];
    if(opts.some(o=>!o)){setMsg("All 4 options required");return;}
    setLoading(true); setMsg("");
    const d = await api("create_question",{lesson_id:selLesson.lesson_id,...qForm,options:opts});
    if(d.data){setMsg("✅ Question added!");setQForm({...qForm,question_index:(qForm.question_index||0)+1,question:"",o0:"",o1:"",o2:"",o3:""});}
    else setMsg(d.error||"Failed");
    setLoading(false);
  };

  if(view==="add_lesson") return (
    <Card color={C.green}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.green,marginBottom:12}}>➕ CREATE LESSON</div>
      <div style={{color:C.dim,fontSize:11,marginBottom:4}}>TITLE</div>
      <input value={form.title||""} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Fractions Basics" style={iStyle(C.green)}/>
      <div style={{color:C.dim,fontSize:11,marginBottom:4}}>EMOJI</div>
      <input value={form.emoji||""} onChange={e=>setForm({...form,emoji:e.target.value})} placeholder="📚" maxLength={4} style={iStyle(C.green)}/>
      {!classFilter&&<><div style={{color:C.dim,fontSize:11,marginBottom:4}}>CLASS</div>
      <select value={form.class_num||1} onChange={e=>setForm({...form,class_num:e.target.value})} style={{...iStyle(C.green),cursor:"pointer"}}>
        {[1,2,3,4,5].map(n=><option key={n} value={n}>Class {n}</option>)}
      </select></>}
      {msg&&<div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:12,marginBottom:8}}>{msg}</div>}
      <div style={{display:"flex",gap:8}}>
        <Btn color={C.green} loading={loading} onClick={handleAddLesson}>CREATE</Btn>
        <button onClick={()=>setView("list")} style={{flex:1,background:"none",border:`1px solid ${C.dim}44`,borderRadius:12,padding:"12px",color:C.dim,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13}}>CANCEL</button>
      </div>
    </Card>
  );

  if(view==="add_q"&&selLesson) return (
    <Card color={C.cyan}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.cyan,marginBottom:4}}>➕ ADD QUESTION</div>
      <div style={{color:C.dim,fontSize:11,marginBottom:12}}>{selLesson.emoji} {selLesson.title}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>SET (0-19)</div>
          <input type="number" value={qForm.set_index} onChange={e=>setQForm({...qForm,set_index:parseInt(e.target.value)||0})} style={iStyle(C.cyan)}/></div>
        <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>Q# (0-19)</div>
          <input type="number" value={qForm.question_index} onChange={e=>setQForm({...qForm,question_index:parseInt(e.target.value)||0})} style={iStyle(C.cyan)}/></div>
      </div>
      <div style={{color:C.dim,fontSize:11,marginBottom:4}}>QUESTION</div>
      <input value={qForm.question||""} onChange={e=>setQForm({...qForm,question:e.target.value})} placeholder="What is 5 + 3?" style={iStyle(C.cyan)}/>
      {[0,1,2,3].map(i=>(
        <div key={i}>
          <div style={{color:i===qForm.correct_answer?C.green:C.dim,fontSize:11,marginBottom:4}}>
            Option {i+1} {i===qForm.correct_answer?"✓ CORRECT":""}</div>
          <input value={qForm[`o${i}`]||""} onChange={e=>setQForm({...qForm,[`o${i}`]:e.target.value})} placeholder={`Option ${i+1}`} style={iStyle(i===qForm.correct_answer?C.green:C.cyan)}/>
        </div>
      ))}
      <div style={{color:C.dim,fontSize:11,marginBottom:4}}>CORRECT ANSWER</div>
      <select value={qForm.correct_answer} onChange={e=>setQForm({...qForm,correct_answer:parseInt(e.target.value)})} style={{...iStyle(C.green),cursor:"pointer"}}>
        {[0,1,2,3].map(i=><option key={i} value={i}>Option {i+1}</option>)}
      </select>
      <div style={{color:C.dim,fontSize:11,marginBottom:4}}>HINT (optional)</div>
      <input value={qForm.hint||""} onChange={e=>setQForm({...qForm,hint:e.target.value})} placeholder="Hint for students" style={iStyle(C.dim)}/>
      {msg&&<div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:12,marginBottom:8}}>{msg}</div>}
      <div style={{display:"flex",gap:8}}>
        <Btn color={C.cyan} loading={loading} onClick={handleAddQ}>ADD QUESTION</Btn>
        <button onClick={()=>setView("list")} style={{background:"none",border:`1px solid ${C.dim}44`,borderRadius:12,padding:"12px",color:C.dim,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13}}>DONE</button>
      </div>
    </Card>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.dim}}>CUSTOM LESSONS ({lessons.length})</div>
        <button onClick={()=>setView("add_lesson")} style={{background:`${C.green}22`,border:`1px solid ${C.green}44`,borderRadius:10,padding:"7px 12px",color:C.green,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ LESSON</button>
      </div>
      {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
      {lessons.map(l=>(
        <div key={l.id} style={{background:C.card,border:`1px solid ${C.green}33`,borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:800,color:textColor(),fontSize:14}}>{l.emoji} {l.title}</div>
            <div style={{color:C.dim,fontSize:11}}>Class {l.class_num}</div>
          </div>
          <button onClick={()=>{setSelLesson(l);setView("add_q");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:10,padding:"7px 12px",color:C.cyan,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ QUESTION</button>
        </div>
      ))}
      {!loading&&lessons.length===0&&<div style={{textAlign:"center",color:C.dim,padding:20}}>No custom lessons yet.</div>}
    </div>
  );
}

