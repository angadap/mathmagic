// src/components/teacher/TeacherExtras.jsx — StudentLogin, StudentActions, ExcelImport, AdminPanel
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, BackBtn, Card } from '../ui/primitives.jsx';
import { LESSONS } from '../../constants/gameData.js';
import { Starfield } from '../layout/layout.jsx';
import { schoolApi } from '../screens/Entry.jsx';

export function StudentLogin({ onBack, onDone }) {
  const [step,      setStep]      = useState("school"); // school|student
  const [schoolCode,setSchoolCode]= useState("");
  const [rollNo,    setRollNo]    = useState("");
  const [pin,       setPin]       = useState("");
  const [classNum,  setClassNum]  = useState("");
  const [section,   setSection]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const handleSchool = () => {
    if (!schoolCode.trim()) { setError("Enter school code"); return; }
    setError(""); setStep("student");
  };

  const handleLogin = async () => {
    if (!rollNo.trim()||pin.length<4) { setError("Enter roll number and 4-digit PIN"); return; }
    setLoading(true); setError("");
    try {
      const d = await schoolApi("student_login", {school_code:schoolCode.trim().toUpperCase(), roll_no:rollNo.trim(), name:rollNo.trim(), pin, class_num:classNum?parseInt(classNum):undefined, section:section||undefined});
      if (d.student) { SFX.select(); onDone(d.student); }
      else setError(d.error||"Invalid credentials");
    } catch(e) { setError("Network error"); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"24px 18px",position:"relative"}}>
      <Starfield n={30}/>
      <div style={{position:"relative",zIndex:2,maxWidth:420,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
          <BackBtn onClick={onBack} color={C.cyan}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>STUDENT LOGIN</div>
        </div>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:52,marginBottom:8}}>🏫</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,color:C.yellow}}>MATHMAGIC</div>
          <div style={{color:C.dim,fontSize:12,marginTop:4}}>School Edition</div>
        </div>

        {step==="school" ? (
          <Card color={C.cyan} style={{marginBottom:16}}>
            <div style={{color:C.dim,fontSize:12,marginBottom:8,fontFamily:"'Orbitron',sans-serif"}}>SCHOOL CODE</div>
            <input value={schoolCode} onChange={e=>setSchoolCode(e.target.value.toUpperCase())}
              placeholder="e.g. MATH001" maxLength={20}
              style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"12px 14px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:16,letterSpacing:3,textAlign:"center",marginBottom:12,display:"block"}}/>
            {error&&<div style={{color:C.red,fontSize:12,marginBottom:10}}>{error}</div>}
            <Btn color={C.cyan} onClick={handleSchool}>NEXT →</Btn>
          </Card>
        ) : (
          <Card color={C.purple} style={{marginBottom:16}}>
            <div style={{color:C.cyan,fontSize:11,fontFamily:"'Orbitron',sans-serif",marginBottom:12}}>🏫 {schoolCode}</div>
            <div style={{color:C.dim,fontSize:12,marginBottom:6,fontFamily:"'Orbitron',sans-serif"}}>USERNAME</div>
            <input value={rollNo} onChange={e=>setRollNo(e.target.value)} placeholder="Enter your username"
              style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"11px 14px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:15,marginBottom:10,display:"block"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <div>
                <div style={{color:C.dim,fontSize:11,marginBottom:4}}>CLASS</div>
                <select value={classNum} onChange={e=>setClassNum(e.target.value)}
                  style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"10px",color:classNum?"white":C.dim,fontFamily:"'Nunito',sans-serif",fontSize:14}}>
                  <option value="">Any</option>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>Class {n}</option>)}
                </select>
              </div>
              <div>
                <div style={{color:C.dim,fontSize:11,marginBottom:4}}>SECTION</div>
                <input value={section} onChange={e=>setSection(e.target.value.toUpperCase())} placeholder="A"
                  maxLength={3} style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"10px 14px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block"}}/>
              </div>
            </div>
            <div style={{color:C.dim,fontSize:12,marginBottom:6,fontFamily:"'Orbitron',sans-serif"}}>4-DIGIT PIN</div>
            <input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,4))}
              type="password" placeholder="••••" maxLength={4}
              style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"11px 14px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:20,letterSpacing:6,textAlign:"center",marginBottom:12,display:"block"}}/>
            {error&&<div style={{color:C.red,fontSize:12,marginBottom:10}}>{error}</div>}
            <Btn color={C.purple} loading={loading} onClick={handleLogin}>🚀 ENTER ACADEMY</Btn>
            <button onClick={()=>{setStep("school");setError("");}} style={{background:"none",border:"none",color:C.dim,fontSize:12,cursor:"pointer",marginTop:8,width:"100%",fontFamily:"'Nunito',sans-serif"}}>← Change school code</button>
          </Card>
        )}
      </div>
    </div>
  );
}

export function StudentActions({ student, teacher, canChangePin, canModifyStudent, canDeleteStudent, canViewAnalytics, onRefresh, onClose }) {
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

// ── ExcelImport Component ─────────────────────────────────────────
export function ExcelImport({ teacher, onDone }) {
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");

  const parseCSV = (text) => {
    const lines = text.trim().split("\n").filter(l=>l.trim());
    const headers = lines[0].toLowerCase().split(",").map(h=>h.trim().replace(/"/g,""));
    return lines.slice(1).map(line => {
      const vals = line.split(",").map(v=>v.trim().replace(/"/g,""));
      const obj = {};
      headers.forEach((h,i) => obj[h] = vals[i]||"");
      return {
        name:     obj.name||obj["student name"]||obj["full name"]||"",
        roll_no:  String(obj.roll_no||obj["roll no"]||obj["roll number"]||obj.roll||""),
        class_num:parseInt(obj.class||obj["class num"]||obj.class_num||teacher.class_num||1),
        section:  (obj.section||"A").toUpperCase(),
        pin:      String(obj.pin||obj["4-digit pin"]||obj.password||"1234"),
      };
    }).filter(r=>r.name&&r.roll_no);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setResult(null); setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try { setPreview(parseCSV(ev.target.result).slice(0,5)); }
      catch(e) { setError("Could not parse file. Use CSV format."); }
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true); setResult(null); setError("");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const students = parseCSV(ev.target.result);
        const d = await schoolApi("bulk_create_students", {teacher_id:teacher.id, session_token:teacher.session_token||"", students});
        if (d.ok) { setResult(d); if(d.success>0) setTimeout(onDone, 2000); }
        else setError(d.error||"Import failed");
      } catch(e) { setError("Network error"); }
      setLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <Card color={C.cyan}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.cyan,marginBottom:12}}>📥 BULK IMPORT STUDENTS</div>
      <div style={{background:`${C.purple}15`,borderRadius:10,padding:"10px 12px",marginBottom:14,fontSize:12,color:C.dim,lineHeight:1.7}}>
        Upload a <strong style={{color:textColor()}}>CSV file</strong> with columns:<br/>
        <code style={{color:C.cyan,fontSize:11}}>name, roll_no, class, section, pin</code><br/>
        <span style={{fontSize:11}}>Example: <code style={{color:C.yellow}}>Arjun Sharma, 01, 1, A, 1234</code></span>
      </div>
      <input type="file" accept=".csv,.txt" onChange={handleFile}
        style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"10px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:13,marginBottom:12,display:"block",cursor:"pointer"}}/>
      {preview.length>0 && (
        <div style={{marginBottom:12}}>
          <div style={{color:C.dim,fontSize:11,marginBottom:6}}>PREVIEW (first {preview.length} rows):</div>
          {preview.map((s,i)=>(
            <div key={i} style={{fontSize:12,color:textColor(),padding:"4px 0",borderBottom:`1px solid ${C.dim}22`}}>
              {s.roll_no} · {s.name} · Class {s.class_num}-{s.section} · PIN:{s.pin}
            </div>
          ))}
        </div>
      )}
      {error  && <div style={{color:C.red,  fontSize:12,marginBottom:10}}>⚠️ {error}</div>}
      {result && <div style={{color:C.green,fontSize:12,marginBottom:10}}>✅ {result.success} imported{result.failed?.length>0?`, ${result.failed.length} failed`:""}</div>}
      {file && !result && <Btn color={C.cyan} loading={loading} onClick={handleImport}>📥 IMPORT {file.name}</Btn>}
      <a href="data:text/csv;charset=utf-8,name%2Croll_no%2Cclass%2Csection%2Cpin%0AArjun%20Sharma%2C01%2C1%2CA%2C1234%0APriya%20Patel%2C02%2C1%2CA%2C5678"
        download="students_template.csv"
        style={{display:"block",textAlign:"center",color:C.dim,fontSize:11,marginTop:10,textDecoration:"none"}}>
        ⬇️ Download CSV template
      </a>
    </Card>
  );
}


export function AdminPanel({ onBack }) {
  // Passphrase is already verified on Entry screen — no second login needed
  const ADMIN_KEY = "angadadmin2026";
  const [tab,        setTab]       = useState("schools");
  const [view,       setView]      = useState("list");
  const [toast,      setToast]     = useState("");
  const [schools,    setSchools]   = useState([]);
  const [teachers,   setTeachers]  = useState([]);
  const [students,   setStudents]  = useState([]);
  const [homeStudents,setHomeStudents] = useState([]);
  const [selSchool,  setSelSchool] = useState(null);
  const [selTeacher, setSelTeacher]= useState(null);
  const [form,       setForm]      = useState({});
  const [loading,    setLoading]   = useState(false);
  const [msg,        setMsg]       = useState("");
  const [search,     setSearch]    = useState("");
  const [bulkText,   setBulkText]  = useState("");
  const [bulkResult, setBulkResult]= useState([]);
  // Questions
  const [qClassNum,  setQClassNum] = useState(1);
  const [qLessons,   setQLessons]  = useState([]);
  const [qLesson,    setQLesson]   = useState(null);
  const [qSets,      setQSets]     = useState([]);
  const [qSet,       setQSet]      = useState(null);
  const [questions,  setQuestions] = useState([]);

  const PERMS = [
    {id:"change_student_pin",         label:"Change PIN",           icon:"🔑"},
    {id:"modify_student",             label:"Modify Student",       icon:"✏️"},
    {id:"delete_student",             label:"Delete Student",       icon:"🗑️"},
    {id:"add_lesson_set_question",    label:"Add Content",          icon:"➕"},
    {id:"modify_lesson_set_question", label:"Edit Content",         icon:"📝"},
    {id:"delete_lesson_set_question", label:"Delete Content",       icon:"❌"},
    {id:"view_analytics",             label:"Analytics",            icon:"📊"},
  ];
  const PERM_PRESETS = {
    "Class Teacher":   ["change_student_pin","modify_student","view_analytics"],
    "Full Access":     ["change_student_pin","modify_student","delete_student","add_lesson_set_question","modify_lesson_set_question","delete_lesson_set_question","view_analytics"],
    "Content Manager": ["add_lesson_set_question","modify_lesson_set_question","delete_lesson_set_question"],
    "Read Only":       ["view_analytics"],
  };
  const CLASS_OPTS = ["Nursery","Jr KG","Sr KG","Class 1","Class 2","Class 3","Class 4","Class 5"];
  const CLASS_NUMS = [10,11,12,1,2,3,4,5];
  const CLASS_LABELS = {10:"Nursery",11:"Jr KG",12:"Sr KG",1:"Class 1",2:"Class 2",3:"Class 3",4:"Class 4",5:"Class 5"};

  const api = (action, body={}) => schoolApi(action, body, ADMIN_KEY);
  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(""),3500); };
  const iS = (c) => ({width:"100%",background:isDark()?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.03)",border:`1.5px solid ${c}44`,borderRadius:10,padding:"10px 12px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block",marginBottom:10,outline:"none"});
  const MsgBar = ({m}) => m ? <div style={{margin:"0 0 12px",padding:"10px 14px",borderRadius:12,background:m.startsWith("✅")?`${C.green}18`:`${C.red}18`,color:m.startsWith("✅")?C.green:C.red,fontSize:13,fontWeight:700}}>{m}</div> : null;

  const loadSchools   = async () => { setLoading(true); const d=await api("admin_list_schools"); setSchools(d.data||[]); setLoading(false); };
  const loadTeachers  = async (sid) => { setLoading(true); const d=await api("admin_list_all_teachers",{school_id:sid}); setTeachers(d.data||[]); setLoading(false); };
  const loadStudents  = async (sid,tid) => { setLoading(true); const body={}; if(sid)body.school_id=sid; if(tid)body.teacher_id=tid; const d=await api("admin_list_all_students",body); setStudents(d.data||[]); setLoading(false); };
  const loadHomeStudents = async () => { setLoading(true); const d=await api("admin_list_home_students"); setHomeStudents(d.data||[]); setLoading(false); };
  const loadQLessons  = async (cn) => { setLoading(true); setQClassNum(cn); setQLessons([]); setQLesson(null); setQSets([]); setQSet(null); setQuestions([]); const d=await api("admin_list_lessons_for_class",{class_num:cn}); setQLessons(Array.isArray(d.data)?d.data:[]); setLoading(false); };
  const loadQSets     = async (lid) => { setLoading(true); setQLesson(lid); setQSets([]); setQSet(null); setQuestions([]); const d=await api("admin_list_sets_for_lesson",{lesson_id_prefix:lid}); setQSets(d.data||[]); setLoading(false); };
  const loadQs        = async (lid,si) => { setLoading(true); setQSet(si); setQuestions([]); const d=await api("admin_list_questions",{lesson_id_prefix:lid,set_index:si}); setQuestions(d.data||[]); setLoading(false); };

  useEffect(()=>{ loadSchools(); loadTeachers(); loadStudents(); loadHomeStudents(); },[]);

  const switchTab = (t) => { setTab(t); setView("list"); setSearch(""); setMsg(""); setForm({}); setSelSchool(null); setSelTeacher(null); };

  // ── TABS config ────────────────────────────────────────────────────
  const TABS = [
    {id:"schools",  icon:"🏫", label:"Schools",   color:C.yellow,  count:schools.length},
    {id:"teachers", icon:"👩‍🏫",label:"Teachers",  color:C.cyan,    count:teachers.length},
    {id:"students", icon:"🎒", label:"Students",  color:C.purple,  count:students.length},
    {id:"home",     icon:"🏠", label:"Home Users",color:C.green,   count:homeStudents.length},
    {id:"questions",icon:"📚", label:"Questions", color:C.orange,  count:null},
  ];

  // ── Shell layout ──────────────────────────────────────────────────
  const Shell = ({children, title, accent, actions, backTo}) => (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{background:isDark()?`rgba(6,6,20,0.97)`:C.card,borderBottom:`2px solid ${accent}33`,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        {backTo && <button onClick={backTo} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:20,padding:"0 2px",lineHeight:1}}>‹</button>}
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:accent,fontWeight:900,flex:1}}>{title}</div>
        <div style={{display:"flex",gap:6}}>{actions}</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>{children}</div>
    </div>
  );

  const ActionBtn = ({color,onClick,children,small}) => (
    <button onClick={onClick} style={{background:`${color}22`,border:`1px solid ${color}55`,borderRadius:9,padding:small?"5px 9px":"8px 14px",color:color,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:small?10:11,fontWeight:900,whiteSpace:"nowrap"}}>{children}</button>
  );

  const Row = ({accent,left,right,onClick,actions}) => (
    <div style={{background:C.card,border:`1px solid ${accent}22`,borderRadius:12,padding:"11px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1,cursor:onClick?"pointer":"default"}} onClick={onClick}>{left}</div>
      <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>{right||actions}</div>
    </div>
  );

  const FormCard = ({color,onBack,title,children,onSave,saveLabel,saving}) => (
    <div style={{maxWidth:520,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:20}}>‹</button>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:color}}>{title}</div>
      </div>
      <div style={{background:C.card,border:`1.5px solid ${color}33`,borderRadius:16,padding:"18px 16px"}}>
        {children}
        <MsgBar m={msg}/>
        <Btn color={color} loading={saving||loading} onClick={onSave}>{saveLabel||"SAVE"}</Btn>
      </div>
    </div>
  );

  // ── SCHOOLS tab ───────────────────────────────────────────────────
  if (tab==="schools") {
    if (view==="add" || view==="edit") {
      const isEdit = view==="edit";
      return (
        <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
          {renderTopBar()}
          <div style={{padding:"14px"}}>
            <FormCard color={C.yellow} title={isEdit?"EDIT SCHOOL":"NEW SCHOOL"} onBack={()=>{setView("list");setMsg("");}}
              saveLabel={isEdit?"SAVE CHANGES":"CREATE SCHOOL"}
              onSave={async()=>{setLoading(true);setMsg("");
                const d=isEdit?await api("admin_update_school",{school_id:selSchool?.id,...form}):await api("admin_create_school",form);
                if(d.ok||d.data){showToast("✅ School "+(isEdit?"updated":"created")+": "+form.name);loadSchools();setView("list");}else setMsg(d.error||"Failed");
                setLoading(false);}}>
              {[["School Name","name","text"],["City","city","text"],["School Code","school_code","text"]].map(([l,k,t])=>(
                <div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:k==="school_code"?e.target.value.toUpperCase():e.target.value})} type={t} style={iS(C.yellow)}/></div>
              ))}
              {isEdit&&<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><input type="checkbox" checked={!!form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})} style={{width:18,height:18}}/><span style={{fontSize:13,color:textColor()}}>Active</span></div>}
            </FormCard>
          </div>
        </div>
      );
    }
    if (view==="detail") {
      const filtered = teachers.filter(t=>!search||t.name?.toLowerCase().includes(search.toLowerCase())||t.email?.toLowerCase().includes(search.toLowerCase()));
      return (
        <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),display:"flex",flexDirection:"column"}}>
          {renderTopBar()}
          <Shell title={"🏫 "+selSchool?.name} accent={C.yellow}
            backTo={()=>setView("list")}
            actions={[
              <ActionBtn color={C.green} onClick={()=>{setForm({});setMsg("");switchTab("teachers");setTimeout(()=>setView("add"),50);}}>+ TEACHER</ActionBtn>,
            ]}>
            <div style={{fontSize:11,color:C.dim,marginBottom:10}}>Code: {selSchool?.school_code} · {teachers.length} teachers</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search teachers..." style={{...iS(C.yellow),marginBottom:10}}/>
            {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
            {filtered.map(t=>(
              <Row key={t.id} accent={C.cyan}
                left={<><div style={{fontWeight:800,fontSize:14,color:textColor()}}>{t.name}</div><div style={{fontSize:12,color:C.dim}}>{t.email}</div></>}
                actions={[
                  <button onClick={()=>{setSelTeacher(t);setForm({name:t.name,email:t.email,permissions:t.permissions||[]});setMsg("");setTab("teachers");setView("edit");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 9px",color:C.cyan,cursor:"pointer",fontSize:12}}>✏️</button>,
                  <button onClick={async()=>{if(!window.confirm("Delete "+t.name+"?"))return;setLoading(true);const d=await api("admin_delete_teacher",{teacher_id:t.id});if(d.data){showToast("✅ Deleted: "+t.name);loadTeachers();}else setMsg(d.error||"Failed");setLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"5px 9px",color:C.red,cursor:"pointer",fontSize:12}}>🗑️</button>
                ]}/>
            ))}
            {!loading&&filtered.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No teachers yet.</div>}
          </Shell>
        </div>
      );
    }
    const filtered = schools.filter(s=>!search||s.name?.toLowerCase().includes(search.toLowerCase())||s.school_code?.toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),display:"flex",flexDirection:"column"}}>
        {renderTopBar()}
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search schools..." style={{...iS(C.yellow),flex:1,marginBottom:0}}/>
            <ActionBtn color={C.yellow} onClick={()=>{setForm({});setMsg("");setView("add");}}>+ NEW</ActionBtn>
          </div>
          {toast&&<div style={{marginBottom:10,padding:"10px 14px",borderRadius:10,background:toast.startsWith("✅")?`${C.green}18`:`${C.red}18`,color:toast.startsWith("✅")?C.green:C.red,fontSize:13,fontWeight:700}}>{toast}</div>}
          <MsgBar m={msg}/>
          {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
          <div style={{fontSize:11,color:C.dim,marginBottom:8}}>{filtered.length} schools</div>
          {filtered.map(s=>(
            <Row key={s.id} accent={C.yellow}
              onClick={()=>{setSelSchool(s);loadTeachers(s.id);setSearch("");setView("detail");}}
              left={<><div style={{fontWeight:800,fontSize:14,color:textColor()}}>{s.name} <span style={{fontSize:10,color:s.is_active?C.green:C.red}}>{s.is_active?"●":"○"}</span></div><div style={{fontSize:11,color:C.dim}}>{s.city} · {s.school_code}</div></>}
              actions={[
                <button onClick={e=>{e.stopPropagation();setSelSchool(s);setForm({name:s.name,city:s.city,school_code:s.school_code,is_active:s.is_active});setMsg("");setView("edit");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 9px",color:C.cyan,cursor:"pointer",fontSize:12}}>✏️</button>,
                <button onClick={async e=>{e.stopPropagation();if(!window.confirm("Delete "+s.name+"? ALL data deleted!"))return;setLoading(true);const d=await api("admin_delete_school",{school_id:s.id});if(d.ok){showToast("✅ Deleted: "+s.name);loadSchools();}else setMsg(d.error||"Failed");setLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"5px 9px",color:C.red,cursor:"pointer",fontSize:12}}>🗑️</button>
              ]}/>
          ))}
          {!loading&&filtered.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No schools yet.</div>}
        </div>
      </div>
    );
  }

  // ── TEACHERS tab ──────────────────────────────────────────────────
  if (tab==="teachers") {
    if (view==="add"||view==="edit") {
      const isEdit=view==="edit";
      return (
        <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
          {renderTopBar()}
          <div style={{padding:"14px"}}>
            <FormCard color={C.cyan} title={isEdit?"EDIT TEACHER":"NEW TEACHER"} onBack={()=>{setView("list");setMsg("");}}
              saveLabel={isEdit?"SAVE CHANGES":"CREATE TEACHER"}
              onSave={async()=>{setLoading(true);setMsg("");
                const d=isEdit?await api("admin_modify_teacher",{teacher_id:selTeacher?.id,...form}):await api("admin_create_teacher",{...form,school_id:form.school_id||selSchool?.id});
                if(d.data){showToast("✅ Teacher "+(isEdit?"updated":"created")+": "+form.name);loadTeachers();setView("list");}else setMsg(d.error||"Failed");
                setLoading(false);}}>
              {!isEdit&&(<div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>SCHOOL</div><select value={form.school_id||""} onChange={e=>setForm({...form,school_id:e.target.value})} style={iS(C.cyan)}><option value="">Select school...</option>{schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>)}
              {[["Name","name","text"],["Email","email","email"],["PIN (4-6 digits)","pin","password"]].map(([l,k,t])=>(
                <div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} type={t} style={iS(C.cyan)}/></div>
              ))}
              <div style={{marginBottom:10}}><div style={{color:C.dim,fontSize:11,marginBottom:6}}>PRESET</div><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{Object.entries(PERM_PRESETS).map(([pname,pperms])=>(<button key={pname} onClick={()=>setForm({...form,permissions:pperms})} style={{background:`${C.cyan}18`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 10px",color:C.cyan,cursor:"pointer",fontSize:11}}>{pname}</button>))}<button onClick={()=>setForm({...form,permissions:[]})} style={{background:`${C.red}11`,border:`1px solid ${C.dim}33`,borderRadius:8,padding:"5px 10px",color:C.dim,cursor:"pointer",fontSize:11}}>Clear</button></div></div>
              <div style={{color:C.dim,fontSize:11,marginBottom:6}}>PERMISSIONS</div>
              {PERMS.map(p=>(<div key={p.id} onClick={()=>{const cur=form.permissions||[];const has=cur.includes(p.id);setForm({...form,permissions:has?cur.filter(x=>x!==p.id):[...cur,p.id]});}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,background:(form.permissions||[]).includes(p.id)?`${C.cyan}18`:"transparent",border:`1px solid ${(form.permissions||[]).includes(p.id)?C.cyan+"44":"transparent"}`,cursor:"pointer",marginBottom:4}}><div style={{width:18,height:18,borderRadius:5,border:`2px solid ${C.cyan}66`,background:(form.permissions||[]).includes(p.id)?C.cyan:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{(form.permissions||[]).includes(p.id)?"✓":""}</div><span style={{fontSize:13,color:textColor()}}>{p.icon} {p.label}</span></div>))}
            </FormCard>
          </div>
        </div>
      );
    }
    if (view==="bulk") return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
        {renderTopBar()}
        <div style={{padding:"14px"}}>
          <FormCard color={C.purple} title="BULK IMPORT TEACHERS" onBack={()=>setView("list")} saveLabel="IMPORT" onSave={async()=>{
            const rows=bulkText.split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{const p=l.split(",").map(s=>s.trim());return{name:p[0],email:p[1],pin:p[2]||"1234"};}).filter(r=>r.name&&r.email);
            if(!rows.length){setMsg("No valid rows.");return;}
            setLoading(true);setMsg("");setBulkResult([]);
            const d=await api("admin_bulk_create_teachers",{school_id:form.school_id,rows});
            setBulkResult(d.data||[]);const ok=(d.data||[]).filter(r=>r.ok).length;showToast(`✅ ${ok}/${rows.length} teachers created.`);setLoading(false);}}>
            <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>SCHOOL</div><select value={form.school_id||""} onChange={e=>setForm({...form,school_id:e.target.value})} style={iS(C.purple)}><option value="">Select...</option>{schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div style={{color:C.dim,fontSize:11,marginBottom:4}}>CSV: Name, Email, PIN</div>
            <div style={{fontSize:10,color:C.dim,marginBottom:8,background:`${C.purple}11`,borderRadius:8,padding:"6px 10px"}}>Mrs. Sharma, sharma@school.com, 1234</div>
            <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)} rows={7} style={{...iS(C.purple),resize:"vertical"}}/>
            {bulkResult.length>0&&<div style={{maxHeight:100,overflowY:"auto",marginBottom:8}}>{bulkResult.map((r,i)=><div key={i} style={{fontSize:11,color:r.ok?C.green:C.red}}>{r.ok?"✅":"❌"} {r.name} {r.error||""}</div>)}</div>}
          </FormCard>
        </div>
      </div>
    );
    const filtered=teachers.filter(t=>!search||t.name?.toLowerCase().includes(search.toLowerCase())||t.email?.toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),display:"flex",flexDirection:"column"}}>
        {renderTopBar()}
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{...iS(C.cyan),flex:1,marginBottom:0}}/>
            <ActionBtn color={C.cyan} onClick={()=>{setSelTeacher(null);setForm({});setMsg("");setView("add");}}>+ NEW</ActionBtn>
            <ActionBtn color={C.purple} onClick={()=>{setBulkText("");setBulkResult([]);setForm({});setView("bulk");}}>⚡ BULK</ActionBtn>
          </div>
          {toast&&<div style={{marginBottom:10,padding:"10px 14px",borderRadius:10,background:toast.startsWith("✅")?`${C.green}18`:`${C.red}18`,color:toast.startsWith("✅")?C.green:C.red,fontSize:13,fontWeight:700}}>{toast}</div>}
          <MsgBar m={msg}/>
          {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
          <div style={{fontSize:11,color:C.dim,marginBottom:8}}>{filtered.length} teachers</div>
          {filtered.map(t=>(
            <Row key={t.id} accent={C.cyan}
              left={<><div style={{fontWeight:800,fontSize:14,color:textColor()}}>{t.name}</div><div style={{fontSize:11,color:C.dim}}>{t.email} · {schools.find(s=>s.id===t.school_id)?.name||"—"}</div><div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>{(t.permissions||[]).map(p=>{const pr=PERMS.find(x=>x.id===p);return pr?<span key={p} style={{background:`${C.cyan}18`,border:`1px solid ${C.cyan}33`,borderRadius:5,padding:"2px 5px",fontSize:9,color:C.cyan}}>{pr.icon}</span>:null;})} {(t.permissions||[]).length===0&&<span style={{fontSize:9,color:C.dim}}>no perms</span>}</div></>}
              actions={[
                <button onClick={()=>{setSelTeacher(t);setForm({name:t.name,email:t.email,permissions:t.permissions||[]});setMsg("");setView("edit");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 9px",color:C.cyan,cursor:"pointer",fontSize:12}}>✏️</button>,
                <button onClick={async()=>{if(!window.confirm("Delete "+t.name+"?"))return;setLoading(true);const d=await api("admin_delete_teacher",{teacher_id:t.id});if(d.data){showToast("✅ Deleted: "+t.name);loadTeachers();}else setMsg(d.error||"Failed");setLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"5px 9px",color:C.red,cursor:"pointer",fontSize:12}}>🗑️</button>
              ]}/>
          ))}
          {!loading&&filtered.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No teachers found.</div>}
        </div>
      </div>
    );
  }

  // ── STUDENTS (school) tab ─────────────────────────────────────────
  if (tab==="students") {
    if (view==="add"||view==="edit") {
      const isEdit=view==="edit";
      return (
        <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
          {renderTopBar()}
          <div style={{padding:"14px"}}>
            <FormCard color={C.purple} title={isEdit?"EDIT STUDENT":"NEW STUDENT"} onBack={()=>{setView("list");setMsg("");}}
              saveLabel={isEdit?"SAVE CHANGES":"CREATE STUDENT"}
              onSave={async()=>{setLoading(true);setMsg("");
                const payload=isEdit?{student_id:form.student_id,name:form.name,roll_no:form.roll_no,class_num:form.class_num,section:form.section}:{...form,teacher_id:form.teacher_id||null,school_id:form.school_id||selSchool?.id};
                if(form.pin)payload.pin=form.pin;
                const d=isEdit?await api("admin_modify_student",payload):await api("create_student_admin",payload);
                if(d.data){showToast("✅ Student "+(isEdit?"updated":"created")+": "+form.name);loadStudents();setView("list");}else setMsg(d.error||"Failed");
                setLoading(false);}}>
              {!isEdit&&<>
                <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>SCHOOL</div><select value={form.school_id||""} onChange={e=>setForm({...form,school_id:e.target.value})} style={iS(C.purple)}><option value="">Select school...</option>{schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              </>}
              {[["Full Name","name","text"],["Roll No","roll_no","text"],["PIN (4 digits)","pin","password"]].map(([l,k,t])=>(<div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} type={t} style={iS(C.purple)}/></div>))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>CLASS</div><select value={form.class_num??1} onChange={e=>setForm({...form,class_num:parseInt(e.target.value)})} style={iS(C.purple)}>{CLASS_OPTS.map((n,i)=><option key={i} value={CLASS_NUMS[i]}>{n}</option>)}</select></div>
                <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>SECTION</div><input value={form.section||"A"} onChange={e=>setForm({...form,section:e.target.value.toUpperCase().slice(0,3)})} style={iS(C.purple)}/></div>
              </div>
            </FormCard>
          </div>
        </div>
      );
    }
    if (view==="bulk") return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
        {renderTopBar()}
        <div style={{padding:"14px"}}>
          <FormCard color={C.purple} title="BULK IMPORT STUDENTS" onBack={()=>setView("list")} saveLabel="IMPORT" onSave={async()=>{
            const rows=bulkText.split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{const p=l.split(",").map(s=>s.trim());return{name:p[0],roll_no:p[1],class_num:parseInt(p[2])||1,section:p[3]||"A",pin:p[4]||"1234"};}).filter(r=>r.name);
            if(!rows.length){setMsg("No valid rows.");return;}
            setLoading(true);setMsg("");setBulkResult([]);
            const d=await api("admin_bulk_create_students",{school_id:form.school_id,rows});
            setBulkResult(d.data||[]);const ok=(d.data||[]).filter(r=>r.ok).length;showToast(`✅ ${ok}/${rows.length} students added.`);setLoading(false);}}>
            <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>SCHOOL</div><select value={form.school_id||""} onChange={e=>setForm({...form,school_id:e.target.value})} style={iS(C.purple)}><option value="">Select...</option>{schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div style={{color:C.dim,fontSize:11,marginBottom:4}}>CSV: Name, Roll, Class, Section, PIN</div>
            <div style={{fontSize:10,color:C.dim,marginBottom:8,background:`${C.purple}11`,borderRadius:8,padding:"6px 10px"}}>Aarav, 01, 3, A, 1234</div>
            <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)} rows={8} style={{...iS(C.purple),resize:"vertical"}}/>
            {bulkResult.length>0&&<div style={{maxHeight:100,overflowY:"auto",marginBottom:8}}>{bulkResult.map((r,i)=><div key={i} style={{fontSize:11,color:r.ok?C.green:C.red}}>{r.ok?"✅":"❌"} {r.name} {r.error||""}</div>)}</div>}
          </FormCard>
        </div>
      </div>
    );
    const filtered=students.filter(s=>!search||s.name?.toLowerCase().includes(search.toLowerCase())||String(s.roll_no).includes(search));
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),display:"flex",flexDirection:"column"}}>
        {renderTopBar()}
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name / roll..." style={{...iS(C.purple),flex:1,marginBottom:0,minWidth:120}}/>
            <ActionBtn color={C.purple} onClick={()=>{setSelTeacher(null);setForm({});setMsg("");setView("add");}}>+ NEW</ActionBtn>
            <ActionBtn color={C.cyan} onClick={()=>{setBulkText("");setBulkResult([]);setForm({});setView("bulk");}}>⚡ BULK</ActionBtn>
          </div>
          {toast&&<div style={{marginBottom:10,padding:"10px 14px",borderRadius:10,background:toast.startsWith("✅")?`${C.green}18`:`${C.red}18`,color:toast.startsWith("✅")?C.green:C.red,fontSize:13,fontWeight:700}}>{toast}</div>}
          <MsgBar m={msg}/>
          {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
          <div style={{fontSize:11,color:C.dim,marginBottom:8}}>{filtered.length} students</div>
          {filtered.map(s=>(
            <Row key={s.id} accent={C.purple}
              left={<><div style={{fontWeight:800,fontSize:14,color:textColor()}}>{s.name} <span style={{fontFamily:"monospace",fontSize:10,color:C.dim}}>#{String(s.roll_no).padStart(2,"0")}</span></div><div style={{fontSize:11,color:C.dim}}>{CLASS_LABELS[s.class_num]||"C"+s.class_num}-{s.section} · {schools.find(x=>x.id===s.school_id)?.name||"—"} · Lv {s.level||1}</div></>}
              actions={[
                <button onClick={()=>{setForm({student_id:s.id,name:s.name,roll_no:s.roll_no,class_num:s.class_num,section:s.section});setMsg("");setView("edit");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 9px",color:C.cyan,cursor:"pointer",fontSize:12}}>✏️</button>,
                <button onClick={async()=>{if(!window.confirm("Delete "+s.name+"?"))return;setLoading(true);const d=await api("admin_delete_student",{student_id:s.id});if(d.data){showToast("✅ Deleted: "+s.name);loadStudents();}else setMsg(d.error||"Failed");setLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"5px 9px",color:C.red,cursor:"pointer",fontSize:12}}>🗑️</button>
              ]}/>
          ))}
          {!loading&&filtered.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No students found.</div>}
        </div>
      </div>
    );
  }

  // ── HOME (individual) students tab ────────────────────────────────
  if (tab==="home") {
    if (view==="add"||view==="edit") {
      const isEdit=view==="edit";
      return (
        <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
          {renderTopBar()}
          <div style={{padding:"14px"}}>
            <FormCard color={C.green} title={isEdit?"EDIT HOME STUDENT":"NEW HOME STUDENT"} onBack={()=>{setView("list");setMsg("");}}
              saveLabel={isEdit?"SAVE CHANGES":"CREATE"}
              onSave={async()=>{setLoading(true);setMsg("");
                const d=isEdit?await api("admin_modify_home_student",{child_id:form.child_id,name:form.name,class_num:form.class_num,avatar:form.avatar,pin:form.pin||undefined}):await api("admin_create_home_student",{name:form.name,class_num:form.class_num||1,pin:form.pin||"1234",avatar:form.avatar||"🚀"});
                if(d.data||d.ok){showToast("✅ Student "+(isEdit?"updated":"created")+": "+form.name);loadHomeStudents();setView("list");}else setMsg(d.error||"Failed");
                setLoading(false);}}>
              {[["Full Name","name","text"],["Avatar Emoji","avatar","text"],["PIN (4-6 digits)","pin","password"]].map(([l,k,t])=>(<div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} type={t} style={iS(C.green)}/></div>))}
              <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>CLASS</div><select value={form.class_num||1} onChange={e=>setForm({...form,class_num:parseInt(e.target.value)})} style={iS(C.green)}>{CLASS_OPTS.map((n,i)=><option key={i} value={CLASS_NUMS[i]}>{n}</option>)}</select></div>
              {isEdit&&<div style={{fontSize:11,color:C.dim,marginTop:-8,marginBottom:10}}>Leave PIN blank to keep existing.</div>}
            </FormCard>
          </div>
        </div>
      );
    }
    const filtered=homeStudents.filter(s=>!search||s.name?.toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),display:"flex",flexDirection:"column"}}>
        {renderTopBar()}
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{...iS(C.green),flex:1,marginBottom:0}}/>
            <ActionBtn color={C.green} onClick={()=>{setForm({});setMsg("");setView("add");}}>+ NEW</ActionBtn>
          </div>
          {toast&&<div style={{marginBottom:10,padding:"10px 14px",borderRadius:10,background:toast.startsWith("✅")?`${C.green}18`:`${C.red}18`,color:toast.startsWith("✅")?C.green:C.red,fontSize:13,fontWeight:700}}>{toast}</div>}
          <MsgBar m={msg}/>
          {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
          <div style={{fontSize:11,color:C.dim,marginBottom:8}}>{filtered.length} home students</div>
          {filtered.map(s=>(
            <Row key={s.id} accent={C.green}
              left={<><div style={{fontWeight:800,fontSize:14,color:textColor()}}>{s.avatar||"🚀"} {s.name}</div><div style={{fontSize:11,color:C.dim}}>{CLASS_LABELS[s.class_num]||"Class "+s.class_num} · Lv {s.level||1} · {s.xp||0} XP · {s.coins||0} 🪙</div></>}
              actions={[
                <button onClick={()=>{setForm({child_id:s.id,name:s.name,class_num:s.class_num,avatar:s.avatar||""});setMsg("");setView("edit");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 9px",color:C.cyan,cursor:"pointer",fontSize:12}}>✏️</button>,
                <button onClick={async()=>{if(!window.confirm("Delete "+s.name+"? All progress lost!"))return;setLoading(true);const d=await api("admin_delete_home_student",{child_id:s.id});if(d.ok){showToast("✅ Deleted: "+s.name);loadHomeStudents();}else setMsg(d.error||"Failed");setLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"5px 9px",color:C.red,cursor:"pointer",fontSize:12}}>🗑️</button>
              ]}/>
          ))}
          {!loading&&filtered.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No home students.</div>}
        </div>
      </div>
    );
  }

  // ── QUESTIONS tab ─────────────────────────────────────────────────
  if (tab==="questions") {
    if (view==="class_select") {
      const emojis=["🌱","🌙","☀️","🌍","🪐","⭐","🔴","🌌"];
      return (
        <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),display:"flex",flexDirection:"column"}}>
          {renderTopBar()}
          <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {CLASS_OPTS.map((n,i)=>{const cn=CLASS_NUMS[i];return(
                <button key={cn} onClick={()=>{loadQLessons(cn);setView("lessons");}} style={{background:C.card,border:`2px solid ${C.orange}33`,borderRadius:16,padding:"18px 14px",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
                  <div style={{fontSize:28}}>{emojis[i]}</div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.orange,marginTop:6}}>{n}</div>
                </button>
              );})}
            </div>
          </div>
        </div>
      );
    }
    if (view==="lessons") {
      const filtered=qLessons.filter(l=>!search||(l.id||l).toLowerCase().includes(search.toLowerCase()));
      return (
        <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),display:"flex",flexDirection:"column"}}>
          {renderTopBar()}
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderBottom:`1px solid ${C.orange}22`}}>
            <button onClick={()=>setView("class_select")} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:18}}>‹</button>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.orange,flex:1}}>{CLASS_LABELS[qClassNum]} — LESSONS</div>
            <ActionBtn color={C.green} small onClick={async()=>{setLoading(true);const d=await api("admin_add_lesson",{class_num:qClassNum});if(d.data){showToast("✅ Created: "+d.data.lesson_id);loadQLessons(qClassNum);}else setMsg(d.error||"Failed");setLoading(false);}}>+ LESSON</ActionBtn>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Filter lessons..." style={{...iS(C.orange),marginBottom:12}}/>
            {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
            <MsgBar m={msg}/>
            {filtered.map((lesson,idx)=>{const lid=lesson.id||lesson;const num=parseInt((lid.split("-l")[1])||idx+1);return(
              <button key={lid} onClick={()=>{loadQSets(lid);setView("sets");}} style={{width:"100%",background:C.card,border:`1px solid ${C.orange}33`,borderRadius:12,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,marginBottom:8,textAlign:"left"}}>
                <div style={{width:38,height:38,borderRadius:10,background:`${C.orange}22`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.orange,fontWeight:900,flexShrink:0}}>{num}</div>
                <div style={{flex:1}}><div style={{fontWeight:800,color:textColor(),fontSize:14}}>{lesson.title||"Lesson "+num}</div><div style={{fontSize:10,color:C.dim,fontFamily:"monospace"}}>{lid}</div></div>
                <span style={{color:C.orange,fontSize:18}}>›</span>
              </button>
            );})}
            {!loading&&filtered.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No lessons. Click + LESSON.</div>}
          </div>
        </div>
      );
    }
    if (view==="sets") return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),display:"flex",flexDirection:"column"}}>
        {renderTopBar()}
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderBottom:`1px solid ${C.purple}22`}}>
          <button onClick={()=>setView("lessons")} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:18}}>‹</button>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.purple,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{qLesson} — SETS</div>
          <ActionBtn color={C.green} small onClick={()=>{setForm({lesson_id:qLesson,set_index:(qSets.length>0?Math.max(...qSets)+1:0)});setMsg("");setView("add_set");}}>+ SET</ActionBtn>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
          {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
          {qSets.map(si=>(
            <button key={si} onClick={()=>{loadQs(qLesson,si);setView("q_list");}} style={{width:"100%",background:C.card,border:`1px solid ${C.purple}33`,borderRadius:12,padding:"14px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,textAlign:"left"}}>
              <div><div style={{fontWeight:800,color:textColor(),fontSize:14}}>Set {si+1}</div><div style={{fontSize:11,color:C.dim}}>index: {si}</div></div>
              <span style={{color:C.purple,fontSize:18}}>›</span>
            </button>
          ))}
          {!loading&&qSets.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No sets yet.</div>}
        </div>
      </div>
    );
    if (view==="add_set") return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
        {renderTopBar()}
        <div style={{padding:"14px"}}>
          <FormCard color={C.green} title={`NEW SET — ${qLesson} · Set ${(form.set_index??0)+1}`} onBack={()=>setView("sets")} saveLabel="CREATE SET"
            onSave={async()=>{
              if(!form.question||!form.opt0||!form.opt1||!form.opt2||!form.opt3){setMsg("Fill all fields.");return;}
              setLoading(true);setMsg("");
              const d=await api("admin_add_question",{lesson_id:form.lesson_id,set_index:form.set_index??0,question_index:0,question:form.question,options:[form.opt0,form.opt1,form.opt2,form.opt3],correct_answer:form.correct??0,hint:form.hint||""});
              if(d.data){showToast("✅ Set created!");loadQSets(qLesson);setView("sets");}else setMsg(d.error||"Failed");
              setLoading(false);}}>
            {[["Question","question"],["Option A","opt0"],["Option B","opt1"],["Option C","opt2"],["Option D","opt3"],["Hint (optional)","hint"]].map(([l,k])=>(<div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} style={iS(C.green)}/></div>))}
            <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>CORRECT</div><select value={form.correct??0} onChange={e=>setForm({...form,correct:parseInt(e.target.value)})} style={iS(C.green)}>{["A","B","C","D"].map((l,i)=><option key={i} value={i}>Option {l}</option>)}</select></div>
          </FormCard>
        </div>
      </div>
    );
    if (view==="q_list") return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),display:"flex",flexDirection:"column"}}>
        {renderTopBar()}
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderBottom:`1px solid ${C.yellow}22`}}>
          <button onClick={()=>setView("sets")} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:18}}>‹</button>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.yellow,flex:1}}>{qLesson} · Set {(qSet??0)+1} — {questions.length} Qs</div>
          <ActionBtn color={C.green} small onClick={()=>{setForm({lesson_id:qLesson,set_index:qSet??0,question_index:questions.length});setMsg("");setView("add_q");}}>+ Q</ActionBtn>
          <ActionBtn color={C.purple} small onClick={()=>{setBulkText("");setBulkResult([]);setMsg("");setView("q_bulk");}}>⚡</ActionBtn>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 12px"}}>
          <MsgBar m={msg}/>
          {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
          {questions.map((q,i)=>(
            <div key={q.id} style={{background:C.card,border:`1px solid ${C.yellow}22`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:textColor(),marginBottom:6}}>{i+1}. {q.question}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                    {(q.options||[]).map((o,oi)=><div key={oi} style={{fontSize:11,color:oi===q.correct_answer?C.green:"#aaa",padding:"3px 6px",borderRadius:6,background:oi===q.correct_answer?`${C.green}18`:"transparent"}}>{["A","B","C","D"][oi]}. {o}</div>)}
                  </div>
                  {q.hint&&<div style={{fontSize:10,color:C.dim,marginTop:4}}>💡 {q.hint}</div>}
                </div>
                <div style={{display:"flex",gap:5,flexShrink:0}}>
                  <button onClick={()=>{setForm({id:q.id,question:q.question,opt0:q.options[0],opt1:q.options[1],opt2:q.options[2],opt3:q.options[3],correct:q.correct_answer,hint:q.hint||""});setMsg("");setView("edit_q");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:7,padding:"4px 7px",color:C.cyan,cursor:"pointer",fontSize:11}}>✏️</button>
                  <button onClick={async()=>{if(!window.confirm("Delete?"))return;setLoading(true);const d=await api("admin_delete_question",{id:q.id});if(d.ok){showToast("✅ Deleted");loadQs(qLesson,qSet);}else setMsg(d.error||"Failed");setLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:7,padding:"4px 7px",color:C.red,cursor:"pointer",fontSize:11}}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {!loading&&questions.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No questions. Click + Q.</div>}
        </div>
      </div>
    );
    if (view==="add_q"||view==="edit_q") {
      const isEdit=view==="edit_q";
      return (
        <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
          {renderTopBar()}
          <div style={{padding:"14px"}}>
            <FormCard color={isEdit?C.cyan:C.green} title={isEdit?"EDIT QUESTION":"ADD QUESTION"} onBack={()=>setView("q_list")} saveLabel={isEdit?"SAVE":"ADD QUESTION"}
              onSave={async()=>{
                if(!form.question||!form.opt0||!form.opt1||!form.opt2||!form.opt3){setMsg("Fill question and all 4 options.");return;}
                setLoading(true);setMsg("");
                const d=isEdit?await api("admin_update_question",{id:form.id,question:form.question,options:[form.opt0,form.opt1,form.opt2,form.opt3],correct_answer:form.correct??0,hint:form.hint||""}):await api("admin_add_question",{lesson_id:form.lesson_id,set_index:form.set_index??0,question_index:form.question_index??0,question:form.question,options:[form.opt0,form.opt1,form.opt2,form.opt3],correct_answer:form.correct??0,hint:form.hint||""});
                if(d.data||d.ok){showToast("✅ "+(isEdit?"Updated":"Added")+"!");if(isEdit){loadQs(qLesson,qSet);setView("q_list");}else{setForm(f=>({...f,question:"",opt0:"",opt1:"",opt2:"",opt3:"",hint:"",question_index:(f.question_index??0)+1}));loadQs(qLesson,qSet);}}else setMsg(d.error||"Failed");
                setLoading(false);}}>
              {[["Question","question"],["Option A","opt0"],["Option B","opt1"],["Option C","opt2"],["Option D","opt3"],["Hint (optional)","hint"]].map(([l,k])=>(<div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} style={iS(isEdit?C.cyan:C.green)}/></div>))}
              <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>CORRECT</div><select value={form.correct??0} onChange={e=>setForm({...form,correct:parseInt(e.target.value)})} style={iS(isEdit?C.cyan:C.green)}>{["A","B","C","D"].map((l,i)=><option key={i} value={i}>Option {l} — {form["opt"+i]||""}</option>)}</select></div>
            </FormCard>
          </div>
        </div>
      );
    }
    if (view==="q_bulk") return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
        {renderTopBar()}
        <div style={{padding:"14px"}}>
          <FormCard color={C.purple} title={`BULK QUESTIONS — ${qLesson} Set ${(qSet??0)+1}`} onBack={()=>setView("q_list")} saveLabel="UPLOAD" onSave={async()=>{
            const rows=bulkText.split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{const p=l.split(",").map(s=>s.trim());return{question:p[0],options:[p[1]||"",p[2]||"",p[3]||"",p[4]||""],correct_answer:parseInt(p[5])||0,hint:p[6]||""};}).filter(r=>r.question);
            if(!rows.length){setMsg("No valid rows.");return;}
            setLoading(true);setMsg("");setBulkResult([]);
            const d=await api("admin_bulk_add_questions",{lesson_id:qLesson,set_index:qSet??0,questions:rows});
            setBulkResult(d.data||[]);const ok=(d.data||[]).filter(r=>r.ok).length;showToast(`✅ ${ok}/${rows.length} added.`);if(ok>0)loadQs(qLesson,qSet);setLoading(false);}}>
            <div style={{color:C.dim,fontSize:11,marginBottom:4}}>CSV: Question, A, B, C, D, Correct(0-3), Hint</div>
            <div style={{fontSize:10,color:C.dim,marginBottom:8,background:`${C.purple}11`,borderRadius:8,padding:"6px 10px"}}>What is 2+2?, 3, 4, 5, 6, 1, Add numbers</div>
            <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)} rows={10} style={{...iS(C.purple),resize:"vertical"}}/>
            {bulkResult.length>0&&<div style={{maxHeight:100,overflowY:"auto",marginBottom:8}}>{bulkResult.map((r,i)=><div key={i} style={{fontSize:11,color:r.ok?C.green:C.red}}>{r.ok?"✅":"❌"} Row {i+1}: {r.error||"OK"}</div>)}</div>}
          </FormCard>
        </div>
      </div>
    );
    // Default questions view = class select
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),display:"flex",flexDirection:"column"}}>
        {renderTopBar()}
        <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {CLASS_OPTS.map((n,i)=>{const cn=CLASS_NUMS[i];const emojis=["🌱","🌙","☀️","🌍","🪐","⭐","🔴","🌌"];return(
              <button key={cn} onClick={()=>{loadQLessons(cn);setView("lessons");}} style={{background:C.card,border:`2px solid ${C.orange}33`,borderRadius:16,padding:"18px 14px",cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:28}}>{emojis[i]}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.orange,marginTop:6}}>{n}</div>
              </button>
            );})}
          </div>
        </div>
      </div>
    );
  }

  return null;

  // ── Top nav bar (hoisted) ─────────────────────────────────────────
  function renderTopBar() {
    const activeTab = TABS.find(t=>t.id===tab);
    return (
      <div style={{background:isDark()?"rgba(4,4,15,0.98)":C.card,borderBottom:"2px solid rgba(124,111,224,0.2)",flexShrink:0}}>
        {/* Header row */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={onBack} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:20,lineHeight:1,padding:"0 2px"}}>‹</button>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:C.red,letterSpacing:1}}>🔐 ADMIN</div>
          </div>
          <div style={{fontSize:12,fontWeight:800,color:textColor()}}>{activeTab?.icon} {activeTab?.label}</div>
          <button onClick={onBack} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:10,padding:"6px 12px",color:C.red,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:900}}>EXIT</button>
        </div>
        {/* Tab strip */}
        <div style={{display:"flex",overflowX:"auto",padding:"0 10px 10px",gap:6,scrollbarWidth:"none"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>switchTab(t.id)} style={{background:tab===t.id?`${t.color}22`:"transparent",border:`1.5px solid ${tab===t.id?t.color+"66":"transparent"}`,borderRadius:12,padding:"7px 12px",color:tab===t.id?t.color:C.dim,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,whiteSpace:"nowrap",transition:"all 0.2s",display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
              {t.icon} {t.label}{t.count!==null?<span style={{background:tab===t.id?`${t.color}33`:"rgba(255,255,255,0.08)",borderRadius:8,padding:"1px 6px",fontSize:10}}>{t.count}</span>:null}
            </button>
          ))}
        </div>
        {toast&&<div style={{margin:"0 14px 10px",padding:"8px 12px",borderRadius:10,background:toast.startsWith("✅")?`${C.green}18`:`${C.red}18`,color:toast.startsWith("✅")?C.green:C.red,fontSize:12,fontWeight:700}}>{toast}</div>}
      </div>
    );
  }
}
