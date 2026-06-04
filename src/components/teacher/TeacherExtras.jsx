// src/components/teacher/TeacherExtras.jsx — StudentLogin, StudentActions, ExcelImport, AdminPanel
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, BackBtn, Card } from '../ui/primitives.jsx';
import { LESSONS } from '../../constants/gameData.js';
import { Starfield } from '../layout/layout.jsx';

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
  const [key,         setKey]         = useState(localStorage.getItem("mm_admin_key")||"");
  const [authed,      setAuthed]      = useState(!!localStorage.getItem("mm_admin_key"));
  const [view,        setView]        = useState("home");
  const [toastMsg,    setToastMsg]    = useState(""); // home-level toast
  const [schools,     setSchools]     = useState([]);
  const [selSchool,   setSelSchool]   = useState(null);
  const [teachers,    setTeachers]    = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [selTeacher,  setSelTeacher]  = useState(null);
  const [students,    setStudents]    = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allClasses,  setAllClasses]  = useState([]);
  const [form,        setForm]        = useState({});
  const [loading,     setLoading]     = useState(false);
  const [msg,         setMsg]         = useState("");
  const [search,      setSearch]      = useState("");
  const [sortBy,      setSortBy]      = useState("name");
  const [filterVal,   setFilterVal]   = useState("");
  // Questions
  const [qClassNum,   setQClassNum]   = useState(1);
  const [qLessons,    setQLessons]    = useState([]);
  const [qLesson,     setQLesson]     = useState(null);
  const [qSets,       setQSets]       = useState([]);
  const [qSet,        setQSet]        = useState(null);
  const [questions,   setQuestions]   = useState([]);
  const [bulkText,    setBulkText]    = useState("");
  const [bulkResult,  setBulkResult]  = useState([]);

  const PERMS = [
    {id:"change_student_pin",         label:"Change Student PIN",             icon:"🔑"},
    {id:"modify_student",             label:"Modify Student Details",         icon:"✏️"},
    {id:"delete_student",             label:"Delete Student",                 icon:"🗑️"},
    {id:"add_lesson_set_question",    label:"Add Lesson / Set / Question",    icon:"➕"},
    {id:"modify_lesson_set_question", label:"Modify Lesson / Set / Question", icon:"📝"},
    {id:"delete_lesson_set_question", label:"Delete Lesson / Set / Question", icon:"❌"},
    {id:"view_analytics",             label:"View Analytics",                 icon:"📊"},
  ];
  const PERM_PRESETS = {
    "Class Teacher":    ["change_student_pin","modify_student","view_analytics"],
    "Full Access":      ["change_student_pin","modify_student","delete_student","add_lesson_set_question","modify_lesson_set_question","delete_lesson_set_question","view_analytics"],
    "Content Manager":  ["add_lesson_set_question","modify_lesson_set_question","delete_lesson_set_question"],
    "Read Only":        ["view_analytics"],
  };
  const CLASS_LABELS = {10:"Nursery",11:"Jr KG",12:"Sr KG",1:"Class 1",2:"Class 2",3:"Class 3",4:"Class 4",5:"Class 5"};
  const CLASS_OPTS   = ["Nursery","Jr KG","Sr KG","Class 1","Class 2","Class 3","Class 4","Class 5"];
  const CLASS_NUMS   = [10,11,12,1,2,3,4,5];

  const api = (action, body={}) => schoolApi(action, body, key);
  const iS  = (a) => ({width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${a}44`,borderRadius:10,padding:"10px 12px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block",marginBottom:10});
  const Hdr = ({title,back,accent,extra}) => (
    <div style={{background:`linear-gradient(135deg,${accent}${isDark()?"1a":"14"},${isDark()?"rgba(4,4,15,0.98)":C.card})`,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10,borderBottom:`1px solid ${accent}33`,backdropFilter:"blur(20px)"}}>
      <div style={{fontFamily:"'Baloo 2',sans-serif",fontSize:15,fontWeight:900,color:textColor(),flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{title}</div>
      <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
        {extra}
        <button onClick={()=>setView("home")} title="Admin Home" style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:10,padding:"7px 11px",color:C.red,cursor:"pointer",fontSize:14,fontWeight:800}}>🏠</button>
        <BackBtn onClick={back} color={C.dim}/>
      </div>
    </div>
  );
  const MsgBar = ({m}) => m ? <div style={{margin:"0 0 14px",padding:"12px 16px",borderRadius:14,background:m.startsWith("✅")?`${C.green}18`:`${C.red}18`,border:`1px solid ${m.startsWith("✅")?C.green+"33":C.red+"33"}`,color:m.startsWith("✅")?C.green:C.red,fontSize:14,fontWeight:800}}>{m}</div> : null;
  const SearchBar = ({val,onChange,placeholder,accent}) => (
    <div style={{position:"relative",marginBottom:12}}>
      <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}>🔍</span>
      <input value={val} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"Search..."} style={{width:"100%",background:isDark()?"rgba(255,255,255,0.06)":"rgba(124,111,224,0.06)",border:`1.5px solid ${accent||C.cyan}33`,borderRadius:14,padding:"12px 14px 12px 40px",color:textColor(),fontFamily:"'Baloo 2','Nunito',sans-serif",fontSize:14,display:"block",outline:"none"}}/>
    </div>
  );
  const toast = (m) => { setToastMsg(m); setTimeout(()=>setToastMsg(""),3500); };

  const loadSchools     = async () => { setLoading(true); const d=await api("admin_list_schools"); if(d.data)setSchools(d.data); else setMsg(d.error||"Failed"); setLoading(false); };
  const loadAllTeachers = async (sid) => { setLoading(true); const d=await api("admin_list_all_teachers",{school_id:sid}); setAllTeachers(d.data||[]); setLoading(false); };
  const loadAllStudents = async (sid,cn,sec) => { setLoading(true); const body={}; if(sid)body.school_id=sid; if(cn!==undefined)body.class_num=cn; if(sec)body.section=sec; const d=await api("admin_list_all_students",body); setAllStudents(d.data||[]); setLoading(false); };
  const loadAllClasses  = async (sid) => { setLoading(true); const d=await api("admin_list_all_classes",{school_id:sid}); setAllClasses(d.data||[]); setLoading(false); };
  const loadTeachers    = async (school) => { setLoading(true);setSelSchool(school);setTeachers([]); const d=await api("admin_list_teachers",{school_id:school.id}); setTeachers(Array.isArray(d.data)?d.data:[]); setView("school_detail");setLoading(false); };
  const loadStudents    = async (teacher) => { if(!selSchool?.id)return; setLoading(true);setSelTeacher(teacher); const d=await api("admin_list_students",{school_id:selSchool.id,teacher_id:teacher.id}); setStudents(Array.isArray(d.data)?d.data:[]); setView("teacher_detail");setLoading(false); };
  const loadQLessons    = async (cn) => { setLoading(true);setQClassNum(cn);setQLessons([]);setQLesson(null);setQSets([]);setQSet(null);setQuestions([]); const d=await api("admin_list_lessons_for_class",{class_num:cn}); setQLessons(Array.isArray(d.data)?d.data:[]);setLoading(false); };
  const loadQSets       = async (lid) => { setLoading(true);setQLesson(lid);setQSets([]);setQSet(null);setQuestions([]); const d=await api("admin_list_sets_for_lesson",{lesson_id_prefix:lid}); setQSets(d.data||[]);setLoading(false); };
  const loadQs          = async (lid,si) => { setLoading(true);setQSet(si);setQuestions([]); const d=await api("admin_list_questions",{lesson_id_prefix:lid,set_index:si}); setQuestions(d.data||[]);setLoading(false); };

  const handleAuth = () => { if(!key.trim())return; localStorage.setItem("mm_admin_key",key); setAuthed(true); loadSchools(); };
  useEffect(()=>{ if(authed){loadSchools();loadAllTeachers();loadAllStudents();loadAllClasses();} },[]);

  // ── Login ──────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",position:"relative",overflow:"hidden"}}>
      <Starfield n={20}/>
      <div style={{position:"absolute",bottom:"5%",right:"5%",fontSize:100,opacity:0.05,pointerEvents:"none",animation:"floatUp 4s ease-in-out infinite"}}>🔐</div>
      <div style={{position:"relative",zIndex:2,width:"100%",maxWidth:400}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
          <BackBtn onClick={onBack} color={C.red}/>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.red,letterSpacing:3}}>ADMIN ACCESS</div>
        </div>
        <div style={{background:`linear-gradient(160deg,${C.red}18,isDark()?"rgba(8,8,24,0.97)":C.card)`,border:`2px solid ${C.red}33`,borderRadius:28,padding:"30px 26px",boxShadow:`0 8px 48px ${C.red}22`}}>
          <div style={{textAlign:"center",marginBottom:26}}>
            <div style={{fontSize:64,marginBottom:10,animation:"floatUp 2s ease-in-out infinite"}}>🔐</div>
            <div style={{fontSize:22,fontWeight:900,color:textColor()}}>Admin Panel</div>
            <div style={{fontSize:13,color:C.dim,marginTop:6}}>MathMagic School Management</div>
          </div>
          <div style={{fontSize:14,color:C.dim,marginBottom:6,fontWeight:700}}>Secret Key</div>
          <input value={key} onChange={e=>setKey(e.target.value)} type="password" placeholder="Enter admin secret key"
            style={{width:"100%",background:isDark()?"rgba(255,255,255,0.06)":"rgba(124,111,224,0.06)",border:`2px solid ${C.red}44`,borderRadius:14,padding:"14px 18px",color:textColor(),fontFamily:"'Baloo 2',sans-serif",fontSize:16,display:"block",marginBottom:14,outline:"none"}}
            onKeyDown={e=>e.key==="Enter"&&handleAuth()}/>
          <Btn color={C.red} onClick={handleAuth}>🔐 Enter Admin</Btn>
        </div>
      </div>
    </div>
  );

  // ── Home Dashboard — 5 Tiles ──────────────────────────────────────
  if (view==="home") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
      <div style={{background:C.card,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.red}33`}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.red}}>🔐 ADMIN PANEL</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>{localStorage.removeItem("mm_admin_key");setKey("");setAuthed(false);setView("home");}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:12,padding:"8px 14px",color:C.red,cursor:"pointer",fontSize:13,fontWeight:800,display:"flex",alignItems:"center",gap:6}}>🚪 Logout</button>
          <BackBtn onClick={onBack} color={C.dim}/>
        </div>
      </div>
      {toastMsg && (
        <div style={{margin:"12px 18px 0",padding:"12px 16px",borderRadius:12,background:toastMsg.startsWith("✅")?`${C.green}20`:`${C.red}20`,color:toastMsg.startsWith("✅")?C.green:C.red,fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>{toastMsg.startsWith("✅")?"✅":"❌"}</span>{toastMsg.replace(/^✅\s*/,"").replace(/^❌\s*/,"")}
        </div>
      )}
      <div style={{padding:"16px 18px",maxWidth:620,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          {[
            {icon:"🏫",label:"Schools",    sub:`${schools.length} total`,       color:C.yellow,  action:()=>{setSearch("");setMsg("");setView("schools");}},
            {icon:"👩‍🏫",label:"Teachers",  sub:`${allTeachers.length} total`,   color:C.cyan,    action:()=>{setSearch("");setSortBy("name");setMsg("");loadAllTeachers();setView("all_teachers");}},
            {icon:"🏛️",label:"Classes",    sub:`${allClasses.length} classes`,  color:C.green,   action:()=>{setSearch("");setFilterVal("");setMsg("");loadAllClasses();setView("all_classes");}},
            {icon:"👦",label:"Students",   sub:`${allStudents.length} total`,   color:C.purple,  action:()=>{setSearch("");setSortBy("name");setFilterVal("");setMsg("");loadAllStudents();setView("all_students");}},
            {icon:"📚",label:"Questions",  sub:"Manage content",                color:C.orange,  action:()=>{setMsg("");setView("questions_class");}},
          ].map((t,i)=>(
            <button key={i} onClick={t.action} style={{background:C.card,border:`2px solid ${t.color}33`,borderRadius:18,padding:"20px 16px",cursor:"pointer",textAlign:"left",display:"flex",flexDirection:"column",gap:6,transition:"all 0.2s",gridColumn:i===4?"span 2":"auto"}}>
              <div style={{fontSize:28}}>{t.icon}</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:t.color}}>{t.label}</div>
              <div style={{fontSize:11,color:C.dim}}>{t.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Schools ───────────────────────────────────────────────────────
  if (view==="schools") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
      <Hdr title="🏫 SCHOOLS" back={()=>setView("home")} accent={C.yellow}
        extra={<button onClick={()=>{setForm({});setMsg("");setView("add_school");}} style={{background:`${C.yellow}22`,border:`1px solid ${C.yellow}44`,borderRadius:10,padding:"7px 12px",color:C.yellow,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ SCHOOL</button>}
      />
      <div style={{padding:"12px 16px",maxWidth:620,margin:"0 auto"}}>
        <SearchBar val={search} onChange={setSearch} placeholder="🔍 Search school..." accent={C.yellow}/>
        <MsgBar m={msg}/>
        {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
        {schools.filter(s=>!search||s.name?.toLowerCase().includes(search.toLowerCase())||s.school_code?.toLowerCase().includes(search.toLowerCase())).map(s=>(
          <div key={s.id} style={{background:C.card,border:`1px solid ${C.yellow}33`,borderRadius:14,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>loadTeachers(s)} style={{flex:1,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>
              <div style={{fontWeight:800,color:textColor(),fontSize:14}}>{s.name}</div>
              <div style={{color:C.dim,fontSize:12}}>{s.city} · {s.school_code}</div>
              <div style={{fontSize:10,color:s.is_active?C.green:C.red,marginTop:2}}>{s.is_active?"● Active":"○ Inactive"}</div>
            </button>
            <button onClick={()=>{setSelSchool(s);setForm({name:s.name,city:s.city,school_code:s.school_code,is_active:s.is_active});setMsg("");setView("edit_school");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 9px",color:C.cyan,cursor:"pointer",fontSize:11}}>✏️</button>
            <button onClick={async()=>{if(!window.confirm("Delete school "+s.name+"? This deletes ALL teachers and students!"))return;setLoading(true);const d=await api("admin_delete_school",{school_id:s.id});if(d.ok){toast("✅ School deleted: "+s.name);loadSchools();}else setMsg(d.error||"Failed");setLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"5px 9px",color:C.red,cursor:"pointer",fontSize:11}}>🗑️</button>
          </div>
        ))}
        {!loading&&schools.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No schools yet.</div>}
      </div>
    </div>
  );

  if (view==="add_school") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><BackBtn onClick={()=>setView("schools")} color={C.yellow}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.yellow}}>CREATE SCHOOL</div></div>
      <Card color={C.yellow} style={{maxWidth:480,margin:"0 auto"}}>
        {[["School Name","name","text","St. Xavier's School"],["City","city","text","Mumbai"],["School Code","school_code","text","STXAV001"]].map(([l,k,t,ph])=>(
          <div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:k==="school_code"?e.target.value.toUpperCase():e.target.value})} type={t} placeholder={ph} style={iS(C.yellow)}/></div>
        ))}
        <MsgBar m={msg}/>
        <Btn color={C.yellow} loading={loading} onClick={async()=>{setLoading(true);setMsg("");const d=await api("admin_create_school",form);if(d.data){toast("✅ School created: "+form.name);loadSchools();setForm({});setView("schools");}else setMsg(d.error||"Failed");setLoading(false);}}>CREATE SCHOOL</Btn>
      </Card>
    </div>
  );

  if (view==="edit_school") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><BackBtn onClick={()=>setView("schools")} color={C.yellow}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.yellow}}>EDIT SCHOOL</div></div>
      <Card color={C.yellow} style={{maxWidth:480,margin:"0 auto"}}>
        {[["School Name","name","text"],["City","city","text"],["School Code","school_code","text"]].map(([l,k,t])=>(
          <div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:k==="school_code"?e.target.value.toUpperCase():e.target.value})} type={t} style={iS(C.yellow)}/></div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><input type="checkbox" checked={!!form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})} style={{width:18,height:18}}/><span style={{color:textColor(),fontSize:13}}>School is Active</span></div>
        <MsgBar m={msg}/>
        <Btn color={C.yellow} loading={loading} onClick={async()=>{setLoading(true);setMsg("");const d=await api("admin_update_school",{school_id:selSchool?.id,...form});if(d.ok){toast("✅ School updated: "+form.name);loadSchools();setView("schools");}else setMsg(d.error||"Failed");setLoading(false);}}>SAVE CHANGES</Btn>
      </Card>
    </div>
  );

  if (view==="school_detail") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
      <Hdr title={selSchool?.name||""} back={()=>setView("schools")} accent={C.cyan}
        extra={<>
          <button onClick={()=>{setForm({});setMsg("");setView("add_class");}} style={{background:`${C.green}22`,border:`1px solid ${C.green}44`,borderRadius:10,padding:"7px 12px",color:C.green,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ CLASS</button>
          <button onClick={()=>{setForm({});setMsg("");setView("add_teacher");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:10,padding:"7px 12px",color:C.cyan,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ TEACHER</button>
          <button onClick={()=>{setBulkText("");setBulkResult([]);setMsg("");setView("bulk_teachers");}} style={{background:`${C.purple}22`,border:`1px solid ${C.purple}44`,borderRadius:10,padding:"7px 12px",color:C.purple,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>⚡ BULK</button>
        </>}
      />
      <div style={{padding:"12px 16px",maxWidth:620,margin:"0 auto"}}>
        <div style={{color:C.dim,fontSize:11,marginBottom:8}}>Code: {selSchool?.school_code} · {teachers.length} teachers</div>
        {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
        {teachers.map(t=>(
          <div key={t.id} style={{background:C.card,border:`1px solid ${C.purple}33`,borderRadius:14,padding:"12px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>loadStudents(t)} style={{flex:1,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>
              <div style={{fontWeight:800,color:textColor(),fontSize:14}}>{t.name}</div>
              <div style={{color:C.dim,fontSize:12}}>{t.email}</div>
              {(t.permissions||[]).length>0&&<div style={{fontSize:10,color:C.cyan,marginTop:3}}>{(t.permissions||[]).length} permissions</div>}
            </button>
            <button onClick={()=>{setSelTeacher(t);setForm({name:t.name,email:t.email,permissions:t.permissions||[]});setMsg("");setView("edit_teacher");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 9px",color:C.cyan,cursor:"pointer",fontSize:11}}>✏️</button>
            <button onClick={async()=>{if(!window.confirm("Delete "+t.name+"?"))return;setLoading(true);const d=await api("admin_delete_teacher",{teacher_id:t.id});if(d.data){toast("✅ Teacher deleted: "+t.name);loadTeachers(selSchool);}else setMsg(d.error||"Failed");setLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"5px 9px",color:C.red,cursor:"pointer",fontSize:11}}>🗑️</button>
          </div>
        ))}
        {!loading&&teachers.length===0&&<div style={{textAlign:"center",color:C.dim,padding:20}}>No teachers yet.</div>}
      </div>
    </div>
  );

  // ── All Teachers (tile view) ───────────────────────────────────────
  if (view==="all_teachers") {
    const filtered = allTeachers.filter(t=>!search||t.name?.toLowerCase().includes(search.toLowerCase())||t.email?.toLowerCase().includes(search.toLowerCase()));
    const sorted   = [...filtered].sort((a,b)=>sortBy==="name"?a.name?.localeCompare(b.name):0);
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
        <Hdr title="👩‍🏫 ALL TEACHERS" back={()=>setView("home")} accent={C.cyan}
          extra={<button onClick={()=>{setMsg("");setView("add_teacher_global");setSelSchool(null);setForm({});}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:10,padding:"7px 12px",color:C.cyan,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ TEACHER</button>}
        />
        <div style={{padding:"12px 16px",maxWidth:620,margin:"0 auto"}}>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <SearchBar val={search} onChange={setSearch} placeholder="🔍 Search teacher..." accent={C.cyan}/>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{background:C.card2,border:`1px solid ${C.cyan}33`,borderRadius:8,padding:"6px 10px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:12,flex:1}}>
              <option value="name">Sort: Name A-Z</option>
            </select>
          </div>
          <MsgBar m={msg}/>
          {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
          <div style={{color:C.dim,fontSize:11,marginBottom:8}}>{sorted.length} teacher{sorted.length!==1?"s":""}</div>
          {sorted.map(t=>(
            <div key={t.id} style={{background:C.card,border:`1px solid ${C.cyan}22`,borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,color:textColor(),fontSize:14}}>{t.name}</div>
                <div style={{color:C.dim,fontSize:12}}>{t.email}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>
                  {(t.permissions||[]).map(p=>{const pr=PERMS.find(x=>x.id===p);return pr?<span key={p} style={{background:`${C.cyan}18`,border:`1px solid ${C.cyan}33`,borderRadius:6,padding:"2px 6px",fontSize:10,color:C.cyan}}>{pr.icon} {pr.label}</span>:null;})}
                  {(t.permissions||[]).length===0&&<span style={{fontSize:10,color:C.dim}}>No permissions</span>}
                </div>
              </div>
              <button onClick={()=>{setSelTeacher(t);setForm({name:t.name,email:t.email,permissions:t.permissions||[]});setMsg("");setView("edit_teacher");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 9px",color:C.cyan,cursor:"pointer",fontSize:11}}>✏️</button>
              <button onClick={async()=>{if(!window.confirm("Delete "+t.name+"?"))return;setLoading(true);const d=await api("admin_delete_teacher",{teacher_id:t.id});if(d.data){toast("✅ Teacher deleted: "+t.name);loadAllTeachers();}else setMsg(d.error||"Failed");setLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"5px 9px",color:C.red,cursor:"pointer",fontSize:11}}>🗑️</button>
            </div>
          ))}
          {!loading&&sorted.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No teachers found.</div>}
        </div>
      </div>
    );
  }

  // ── All Classes (tile view) ────────────────────────────────────────
  if (view==="all_classes") {
    const filtered = allClasses.filter(c=>!search||(CLASS_LABELS[c.class_num]||"").toLowerCase().includes(search.toLowerCase())||c.section?.toLowerCase().includes(search.toLowerCase()));
    const grouped  = {};
    for (const c of filtered) { const k=c.school_id||"unknown"; if(!grouped[k])grouped[k]=[]; grouped[k].push(c); }
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
        <Hdr title="🏛️ ALL CLASSES" back={()=>setView("home")} accent={C.green}
          extra={<>
            <select value={filterVal} onChange={e=>{setFilterVal(e.target.value);loadAllClasses(e.target.value||undefined);}} style={{background:C.card2,border:`1px solid ${C.green}33`,borderRadius:8,padding:"6px 8px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:11}}>
              <option value="">All Schools</option>
              {schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </>}
        />
        <div style={{padding:"12px 16px",maxWidth:620,margin:"0 auto"}}>
          <SearchBar val={search} onChange={setSearch} placeholder="🔍 Search class..." accent={C.green}/>
          <MsgBar m={msg}/>
          {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
          <div style={{color:C.dim,fontSize:11,marginBottom:8}}>{filtered.length} class{filtered.length!==1?"es":""}</div>
          {filtered.map((c,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${C.green}22`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <div style={{background:`${C.green}22`,borderRadius:10,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.green}}>{c.section||"A"}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,color:textColor(),fontSize:14}}>{CLASS_LABELS[c.class_num]||`Class ${c.class_num}`} — {c.section}</div>
                <div style={{color:C.dim,fontSize:12}}>{schools.find(s=>s.id===c.school_id)?.name||"Unknown School"}</div>
              </div>
            </div>
          ))}
          {!loading&&filtered.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No classes found.</div>}
        </div>
      </div>
    );
  }

  // ── All Students (tile view) ───────────────────────────────────────
  if (view==="all_students") {
    const filtered = allStudents.filter(s=>!search||s.name?.toLowerCase().includes(search.toLowerCase())||String(s.roll_no).includes(search));
    const sorted   = [...filtered].sort((a,b)=>sortBy==="name"?a.name?.localeCompare(b.name):sortBy==="class"?(a.class_num-b.class_num)||a.section?.localeCompare(b.section):0);
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
        <Hdr title="👦 ALL STUDENTS" back={()=>setView("home")} accent={C.purple}/>
        <div style={{padding:"12px 16px",maxWidth:620,margin:"0 auto"}}>
          <SearchBar val={search} onChange={setSearch} placeholder="🔍 Search student or roll no..." accent={C.purple}/>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{background:C.card2,border:`1px solid ${C.purple}33`,borderRadius:8,padding:"6px 10px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:12,flex:1}}>
              <option value="name">Sort: Name A-Z</option>
              <option value="class">Sort: By Class</option>
            </select>
            <select value={filterVal} onChange={e=>{setFilterVal(e.target.value);loadAllStudents(undefined,e.target.value?parseInt(e.target.value):undefined);}} style={{background:C.card2,border:`1px solid ${C.purple}33`,borderRadius:8,padding:"6px 10px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:12,flex:1}}>
              <option value="">All Classes</option>
              {CLASS_OPTS.map((n,i)=><option key={i} value={CLASS_NUMS[i]}>{n}</option>)}
            </select>
          </div>
          <MsgBar m={msg}/>
          {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
          <div style={{color:C.dim,fontSize:11,marginBottom:8}}>{sorted.length} student{sorted.length!==1?"s":""}</div>
          {sorted.map(s=>(
            <div key={s.id} style={{background:C.card,border:`1px solid ${C.purple}22`,borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
              <div style={{background:`${C.purple}33`,borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.purple,flexShrink:0}}>{String(s.roll_no).padStart(2,"0")}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:14,color:textColor()}}>{s.name}</div>
                <div style={{fontSize:11,color:C.dim}}>{CLASS_LABELS[s.class_num]||`Class ${s.class_num}`}-{s.section} · Lv {s.level||1} · {s.xp||0} XP</div>
              </div>
              <button onClick={()=>{setSelTeacher({id:s.teacher_id});setSelSchool({id:s.school_id});setForm({student_id:s.id,name:s.name,roll_no:s.roll_no,class_num:s.class_num,section:s.section});setMsg("");setView("edit_student");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 9px",color:C.cyan,cursor:"pointer",fontSize:11}}>✏️</button>
              <button onClick={async()=>{if(!window.confirm("Delete "+s.name+"?"))return;setLoading(true);const d=await api("admin_delete_student",{student_id:s.id});if(d.data){toast("✅ Student deleted: "+s.name);loadAllStudents();}else setMsg(d.error||"Failed");setLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"5px 9px",color:C.red,cursor:"pointer",fontSize:11}}>🗑️</button>
            </div>
          ))}
          {!loading&&sorted.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No students found.</div>}
        </div>
      </div>
    );
  }

  // ── Add Class ─────────────────────────────────────────────────────
  if (view==="add_class") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><BackBtn onClick={()=>setView("school_detail")} color={C.green}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.green}}>ADD CLASS — {selSchool?.name}</div></div>
      <Card color={C.green} style={{maxWidth:480,margin:"0 auto"}}>
        <div style={{marginBottom:10}}>
          <div style={{color:C.dim,fontSize:11,marginBottom:4}}>CLASS</div>
          <select value={form.class_num??1} onChange={e=>setForm({...form,class_num:parseInt(e.target.value)})} style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.green}44`,borderRadius:10,padding:"10px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14,marginBottom:10}}>
            {CLASS_OPTS.map((n,i)=><option key={i} value={CLASS_NUMS[i]}>{n}</option>)}
          </select>
        </div>
        <div style={{marginBottom:10}}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>SECTION</div><input value={form.section||"A"} onChange={e=>setForm({...form,section:e.target.value.toUpperCase().slice(0,3)})} placeholder="A" style={iS(C.green)}/></div>
        <div style={{marginBottom:10}}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>CLASS TEACHER NAME (optional)</div><input value={form.teacher_name||""} onChange={e=>setForm({...form,teacher_name:e.target.value})} placeholder="Mrs. Sharma" style={iS(C.green)}/></div>
        <MsgBar m={msg}/>
        <Btn color={C.green} loading={loading} onClick={async()=>{setLoading(true);setMsg("");const d=await api("admin_add_class",{school_id:selSchool?.id,...form});if(d.data){toast("✅ Class created!");loadTeachers(selSchool);}else setMsg(d.error||"Failed");setLoading(false);}}>CREATE CLASS</Btn>
      </Card>
    </div>
  );

  // ── Add Teacher (from school detail) ──────────────────────────────
  if (view==="add_teacher"||view==="add_teacher_global") {
    const targetSchool = selSchool;
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><BackBtn onClick={()=>setView(view==="add_teacher_global"?"all_teachers":"school_detail")} color={C.cyan}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>ADD TEACHER{targetSchool?" — "+targetSchool.name:""}</div></div>
        <Card color={C.cyan} style={{maxWidth:500,margin:"0 auto"}}>
          {view==="add_teacher_global"&&(
            <div style={{marginBottom:12}}>
              <div style={{color:C.dim,fontSize:11,marginBottom:4}}>SCHOOL</div>
              <select value={form.school_id||""} onChange={e=>setForm({...form,school_id:e.target.value})} style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"10px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14,marginBottom:10}}>
                <option value="">Select school...</option>
                {schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          {[["Name","name","text","Mrs. Sharma"],["Email","email","email","teacher@school.com"],["PIN (4-6 digits)","pin","password","••••"]].map(([l,k,t,ph])=>(
            <div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} type={t} placeholder={ph} style={iS(C.cyan)}/></div>
          ))}
          {/* Permission Sets */}
          <div style={{marginBottom:12}}>
            <div style={{color:C.dim,fontSize:11,marginBottom:6}}>PERMISSION PRESET (quick assign)</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
              {Object.entries(PERM_PRESETS).map(([pname,pperms])=>(
                <button key={pname} onClick={()=>setForm({...form,permissions:pperms})} style={{background:`${C.cyan}18`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 10px",color:C.cyan,cursor:"pointer",fontSize:11,fontWeight:700}}>{pname}</button>
              ))}
              <button onClick={()=>setForm({...form,permissions:[]})} style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:8,padding:"5px 10px",color:C.dim,cursor:"pointer",fontSize:11}}>Clear</button>
            </div>
            <div style={{color:C.dim,fontSize:11,marginBottom:6}}>INDIVIDUAL PERMISSIONS</div>
            {PERMS.map(p=>(
              <div key={p.id} onClick={()=>{const cur=form.permissions||[];const has=cur.includes(p.id);setForm({...form,permissions:has?cur.filter(x=>x!==p.id):[...cur,p.id]});}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,background:(form.permissions||[]).includes(p.id)?`${C.cyan}18`:"transparent",border:`1px solid ${(form.permissions||[]).includes(p.id)?C.cyan+"44":"transparent"}`,cursor:"pointer",marginBottom:4}}>
                <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${C.cyan}66`,background:(form.permissions||[]).includes(p.id)?C.cyan:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{(form.permissions||[]).includes(p.id)?"✓":""}</div>
                <span style={{fontSize:13,color:textColor()}}>{p.icon} {p.label}</span>
              </div>
            ))}
          </div>
          <MsgBar m={msg}/>
          <Btn color={C.cyan} loading={loading} onClick={async()=>{
            const sid=view==="add_teacher_global"?form.school_id:targetSchool?.id;
            if(!sid){setMsg("Select a school.");return;}
            setLoading(true);setMsg("");
            const d=await api("admin_create_teacher",{...form,school_id:sid});
            if(d.data){toast("✅ Teacher created: "+form.name);if(view==="add_teacher")loadTeachers(selSchool);else loadAllTeachers();setForm({});setView(view==="add_teacher"?"school_detail":"all_teachers");}else setMsg(d.error||"Failed");
            setLoading(false);
          }}>ADD TEACHER</Btn>
        </Card>
      </div>
    );
  }

  // ── Bulk Teachers ─────────────────────────────────────────────────
  if (view==="bulk_teachers") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><BackBtn onClick={()=>setView("school_detail")} color={C.purple}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.purple}}>BULK ADD TEACHERS — {selSchool?.name}</div></div>
      <Card color={C.purple} style={{maxWidth:520,margin:"0 auto"}}>
        <div style={{color:C.dim,fontSize:11,marginBottom:8}}>CSV: <b style={{color:C.purple}}>Name, Email, PIN</b></div>
        <div style={{color:C.dim,fontSize:10,marginBottom:10,background:`${C.purple}11`,borderRadius:8,padding:"8px 10px"}}>Mrs. Sharma, sharma@school.com, 1234</div>
        <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)} rows={8} placeholder="Name, Email, PIN" style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"10px 12px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:13,display:"block",marginBottom:10,resize:"vertical"}}/>
        {bulkResult.length>0&&<div style={{maxHeight:120,overflowY:"auto",marginBottom:10}}>{bulkResult.map((r,i)=><div key={i} style={{fontSize:11,color:r.ok?C.green:C.red}}>{r.ok?"✅":"❌"} {r.name} {r.error||""}</div>)}</div>}
        <MsgBar m={msg}/>
        <Btn color={C.purple} loading={loading} onClick={async()=>{
          const rows=bulkText.split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{const p=l.split(",").map(s=>s.trim());return{name:p[0],email:p[1],pin:p[2]||"1234"};}).filter(r=>r.name&&r.email);
          if(!rows.length){setMsg("No valid rows.");return;}
          setLoading(true);setMsg("");setBulkResult([]);
          const d=await api("admin_bulk_create_teachers",{school_id:selSchool?.id,rows});
          setBulkResult(d.data||[]);const ok=(d.data||[]).filter(r=>r.ok).length;
          toast(`✅ ${ok}/${rows.length} teachers created.`);setLoading(false);
        }}>IMPORT TEACHERS</Btn>
      </Card>
    </div>
  );

  // ── Bulk Students ─────────────────────────────────────────────────
  if (view==="bulk_students") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><BackBtn onClick={()=>setView("teacher_detail")} color={C.purple}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.purple}}>BULK ADD STUDENTS</div></div>
      <Card color={C.purple} style={{maxWidth:520,margin:"0 auto"}}>
        <div style={{color:C.dim,fontSize:11,marginBottom:8}}>CSV: <b style={{color:C.purple}}>Name, Roll No, Class (1-5 or 10/11/12), Section, PIN</b></div>
        <div style={{color:C.dim,fontSize:10,marginBottom:10,background:`${C.purple}11`,borderRadius:8,padding:"8px 10px"}}>Aarav Sharma, 01, 3, A, 1234</div>
        <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)} rows={10} placeholder="Name, Roll No, Class, Section, PIN" style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"10px 12px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:13,display:"block",marginBottom:10,resize:"vertical"}}/>
        {bulkResult.length>0&&<div style={{maxHeight:150,overflowY:"auto",marginBottom:10}}>{bulkResult.map((r,i)=><div key={i} style={{fontSize:11,color:r.ok?C.green:C.red}}>{r.ok?"✅":"❌"} {r.name} {r.error||""}</div>)}</div>}
        <MsgBar m={msg}/>
        <Btn color={C.purple} loading={loading} onClick={async()=>{
          const rows=bulkText.split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{const p=l.split(",").map(s=>s.trim());return{name:p[0],roll_no:p[1],class_num:parseInt(p[2])||1,section:p[3]||"A",pin:p[4]||"1234"};}).filter(r=>r.name);
          if(!rows.length){setMsg("No valid rows.");return;}
          setLoading(true);setMsg("");setBulkResult([]);
          const d=await api("admin_bulk_create_students",{school_id:selSchool?.id,teacher_id:selTeacher?.id,rows});
          setBulkResult(d.data||[]);const ok=(d.data||[]).filter(r=>r.ok).length;
          toast(`✅ ${ok}/${rows.length} students created.`);setLoading(false);
        }}>IMPORT STUDENTS</Btn>
      </Card>
    </div>
  );

  // ── Add Student ───────────────────────────────────────────────────
  if (view==="add_student") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><BackBtn onClick={()=>setView("teacher_detail")} color={C.cyan}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>ADD STUDENT — {selTeacher?.name}</div></div>
      <Card color={C.cyan} style={{maxWidth:480,margin:"0 auto"}}>
        {[["Name","name","text","Full name"],["Roll No","roll_no","text","01"],["PIN (4 digits)","pin","password","••••"]].map(([l,k,t,ph])=>(
          <div key={k} style={{marginBottom:10}}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} type={t} placeholder={ph} style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"10px 12px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block"}}/></div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>CLASS</div><select value={form.class_num??1} onChange={e=>setForm({...form,class_num:parseInt(e.target.value)})} style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"10px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14}}>{CLASS_OPTS.map((n,i)=><option key={i} value={CLASS_NUMS[i]}>{n}</option>)}</select></div>
          <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>SECTION</div><input value={form.section||"A"} onChange={e=>setForm({...form,section:e.target.value.toUpperCase().slice(0,3)})} placeholder="A" style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"10px 12px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14,display:"block"}}/></div>
        </div>
        <MsgBar m={msg}/>
        <Btn color={C.cyan} loading={loading} onClick={async()=>{setLoading(true);setMsg("");const d=await api("create_student_admin",{...form,teacher_id:selTeacher?.id,school_id:selSchool?.id});if(d.data){toast("✅ Student added: "+form.name);setForm({});}else setMsg(d.error||"Failed");setLoading(false);}}>ADD STUDENT</Btn>
      </Card>
    </div>
  );

  // ── Teacher Detail — Student List ─────────────────────────────────
  if (view==="teacher_detail") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
      <Hdr title={selTeacher?.name||""} back={()=>setView("school_detail")} accent={C.purple}
        extra={<>
          <button onClick={()=>{setForm({});setMsg("");setView("add_student");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:10,padding:"7px 12px",color:C.cyan,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ STUDENT</button>
          <button onClick={()=>{setBulkText("");setBulkResult([]);setMsg("");setView("bulk_students");}} style={{background:`${C.purple}22`,border:`1px solid ${C.purple}44`,borderRadius:10,padding:"7px 12px",color:C.purple,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>⚡ BULK</button>
        </>}
      />
      <div style={{padding:"12px 16px",maxWidth:620,margin:"0 auto"}}>
        <div style={{color:C.dim,fontSize:11,marginBottom:8}}>{selSchool?.name} · {students.length} students</div>
        {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
        {students.map(s=>(
          <div key={s.id} style={{background:C.card,border:`1px solid ${C.purple}22`,borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:`${C.purple}33`,borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.purple,flexShrink:0}}>{String(s.roll_no).padStart(2,"0")}</div>
            <div style={{flex:1}}><div style={{fontWeight:800,fontSize:14,color:textColor()}}>{s.name}</div><div style={{fontSize:11,color:C.dim}}>{CLASS_LABELS[s.class_num]||`Class ${s.class_num}`}-{s.section} · Lv {s.level||1} · {s.xp||0} XP</div></div>
            <button onClick={()=>{setForm({student_id:s.id,name:s.name,roll_no:s.roll_no,class_num:s.class_num,section:s.section});setMsg("");setView("edit_student");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 9px",color:C.cyan,cursor:"pointer",fontSize:11}}>✏️</button>
            <button onClick={async()=>{if(!window.confirm("Delete "+s.name+"?"))return;setLoading(true);const d=await api("admin_delete_student",{student_id:s.id});if(d.data){toast("✅ Student deleted: "+s.name);loadStudents(selTeacher);}else setMsg(d.error||"Failed");setLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"5px 9px",color:C.red,cursor:"pointer",fontSize:11}}>🗑️</button>
          </div>
        ))}
        {!loading&&students.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No students.</div>}
      </div>
    </div>
  );

  // ── Edit Teacher (with permissions) ──────────────────────────────
  if (view==="edit_teacher") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px",overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><BackBtn onClick={()=>setView(selSchool?"school_detail":"all_teachers")} color={C.cyan}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>EDIT TEACHER</div></div>
      <Card color={C.cyan} style={{maxWidth:500,margin:"0 auto"}}>
        {[["Name","name","text","Teacher name"],["Email","email","email","teacher@school.com"]].map(([l,k,t,ph])=>(
          <div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} type={t} placeholder={ph} style={iS(C.cyan)}/></div>
        ))}
        {/* Permission Sets */}
        <div style={{marginBottom:12}}>
          <div style={{color:C.dim,fontSize:11,marginBottom:6}}>PERMISSION PRESET</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
            {Object.entries(PERM_PRESETS).map(([pname,pperms])=>(
              <button key={pname} onClick={()=>setForm({...form,permissions:pperms})} style={{background:`${C.cyan}18`,border:`1px solid ${C.cyan}44`,borderRadius:8,padding:"5px 10px",color:C.cyan,cursor:"pointer",fontSize:11,fontWeight:700}}>{pname}</button>
            ))}
            <button onClick={()=>setForm({...form,permissions:[]})} style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,borderRadius:8,padding:"5px 10px",color:C.dim,cursor:"pointer",fontSize:11}}>Clear All</button>
          </div>
          <div style={{color:C.dim,fontSize:11,marginBottom:6}}>INDIVIDUAL PERMISSIONS</div>
          {PERMS.map(p=>(
            <div key={p.id} onClick={()=>{const cur=form.permissions||[];const has=cur.includes(p.id);setForm({...form,permissions:has?cur.filter(x=>x!==p.id):[...cur,p.id]});}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,background:(form.permissions||[]).includes(p.id)?`${C.cyan}18`:"transparent",border:`1px solid ${(form.permissions||[]).includes(p.id)?C.cyan+"44":"transparent"}`,cursor:"pointer",marginBottom:4}}>
              <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${C.cyan}66`,background:(form.permissions||[]).includes(p.id)?C.cyan:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{(form.permissions||[]).includes(p.id)?"✓":""}</div>
              <span style={{fontSize:13,color:textColor()}}>{p.icon} {p.label}</span>
            </div>
          ))}
        </div>
        <MsgBar m={msg}/>
        <Btn color={C.cyan} loading={loading} onClick={async()=>{
          setLoading(true);setMsg("");
          const d=await api("admin_modify_teacher",{teacher_id:selTeacher?.id,...form});
          if(d.data){toast("✅ Teacher updated: "+form.name);if(selSchool)loadTeachers(selSchool);else loadAllTeachers();setView(selSchool?"school_detail":"all_teachers");}else setMsg(d.error||"Failed");
          setLoading(false);
        }}>SAVE CHANGES</Btn>
      </Card>
    </div>
  );

  // ── Edit Student ──────────────────────────────────────────────────
  if (view==="edit_student") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><BackBtn onClick={()=>setView(selTeacher?.id&&selSchool?.id?"teacher_detail":"all_students")} color={C.purple}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.purple}}>EDIT STUDENT</div></div>
      <Card color={C.purple} style={{maxWidth:480,margin:"0 auto"}}>
        {[["Name","name","text","Full name"],["Roll No","roll_no","text","01"],["New PIN (blank = keep)","pin","password",""]].map(([l,k,t,ph])=>(
          <div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} type={t} placeholder={ph} style={iS(C.purple)}/></div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>CLASS</div><select value={form.class_num??1} onChange={e=>setForm({...form,class_num:parseInt(e.target.value)})} style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"10px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14}}>{CLASS_OPTS.map((n,i)=><option key={i} value={CLASS_NUMS[i]}>{n}</option>)}</select></div>
          <div><div style={{color:C.dim,fontSize:11,marginBottom:4}}>SECTION</div><input value={form.section||"A"} onChange={e=>setForm({...form,section:e.target.value.toUpperCase().slice(0,3)})} style={iS(C.purple)}/></div>
        </div>
        <MsgBar m={msg}/>
        <Btn color={C.purple} loading={loading} onClick={async()=>{
          setLoading(true);setMsg("");
          const payload={student_id:form.student_id,name:form.name,roll_no:form.roll_no,class_num:form.class_num,section:form.section};
          if(form.pin)payload.pin=form.pin;
          const d=await api("admin_modify_student",payload);
          if(d.data){toast("✅ Student updated: "+form.name);if(selTeacher?.id&&selSchool?.id)loadStudents(selTeacher);else loadAllStudents();setView(selTeacher?.id&&selSchool?.id?"teacher_detail":"all_students");}else setMsg(d.error||"Failed");
          setLoading(false);
        }}>SAVE CHANGES</Btn>
      </Card>
    </div>
  );

  // ── Questions: Class Selector ─────────────────────────────────────
  if (view==="questions_class") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
      <Hdr title="📚 QUESTION MANAGER" back={()=>setView("home")} accent={C.orange}/>
      <div style={{padding:"16px 18px",maxWidth:600,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {CLASS_OPTS.map((n,i)=>{
            const cn=CLASS_NUMS[i];
            const emojis=["🌱","🌙","☀️","🌍","🪐","⭐","🔴","🌌"];
            return (
              <button key={cn} onClick={()=>{loadQLessons(cn);setView("questions_lessons");}} style={{background:C.card,border:`2px solid ${C.orange}33`,borderRadius:16,padding:"18px 14px",cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:28}}>{emojis[i]}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:C.orange,marginTop:6}}>{n}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Questions: Lessons List ───────────────────────────────────────
  if (view==="questions_lessons") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
      <Hdr title={`${CLASS_LABELS[qClassNum]||"Class "+qClassNum} — LESSONS`} back={()=>setView("questions_class")} accent={C.orange}
        extra={<button onClick={async()=>{setLoading(true);setMsg("");const d=await api("admin_add_lesson",{class_num:qClassNum});if(d.data){const lid=d.data.lesson_id;toast("✅ New lesson: "+lid);await loadQLessons(qClassNum);}else setMsg(d.error||"Failed");setLoading(false);}} style={{background:`${C.green}22`,border:`1px solid ${C.green}44`,borderRadius:10,padding:"7px 12px",color:C.green,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ LESSON</button>}
      />
      <div style={{padding:"12px 16px",maxWidth:600,margin:"0 auto"}}>
        <SearchBar val={search} onChange={setSearch} placeholder="🔍 Filter lessons..." accent={C.orange}/>
        {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
        {msg&&<div style={{color:msg.startsWith("✅")?C.green:C.red,fontSize:12,marginBottom:10,padding:"8px",borderRadius:8,background:msg.startsWith("✅")?`${C.green}11`:`${C.red}11`}}>{msg}</div>}
        <div style={{color:C.dim,fontSize:11,marginBottom:8}}>{qLessons.filter(l=>!search||l.toLowerCase().includes(search.toLowerCase())).length} lessons</div>
        {qLessons.filter(l=>!search||(l.title||l.id||"").toLowerCase().includes(search.toLowerCase())||(l.id||"").toLowerCase().includes(search.toLowerCase())).map((lesson,idx)=>{
          const lid=lesson.id||lesson;
          const title=lesson.title||lid;
          const lessonNum=parseInt((lid.split("-l")[1])||idx+1);
          const className=CLASS_LABELS[qClassNum]||"Class "+qClassNum;
          return (
            <button key={lid} onClick={()=>{loadQSets(lid);setView("questions_sets");}} style={{width:"100%",background:C.card,border:`1px solid ${C.orange}33`,borderRadius:14,padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,marginBottom:10,textAlign:"left"}}>
              <div style={{width:42,height:42,borderRadius:12,background:`${C.orange}22`,border:`2px solid ${C.orange}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.orange,fontWeight:900}}>{lessonNum}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:900,color:textColor(),fontSize:15}}>{className} — Lesson {lessonNum}: {title}</div>
                <div style={{fontSize:11,color:C.orange,marginTop:3,fontFamily:"monospace"}}>{lid}</div>
              </div>
              <span style={{color:C.orange,fontSize:22}}>›</span>
            </button>
          );
        })}
        {!loading&&qLessons.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No lessons found. Click + LESSON to create one.</div>}
      </div>
    </div>
  );

  // ── Questions: Sets List ──────────────────────────────────────────
  if (view==="questions_sets") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
      <Hdr title={`${qLesson} — SETS`} back={()=>setView("questions_lessons")} accent={C.purple}
        extra={<button onClick={()=>{setForm({lesson_id:qLesson,set_index:(qSets.length>0?Math.max(...qSets)+1:0)});setMsg("");setView("questions_add_set");}} style={{background:`${C.green}22`,border:`1px solid ${C.green}44`,borderRadius:10,padding:"7px 12px",color:C.green,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ SET</button>}
      />
      <div style={{padding:"12px 16px",maxWidth:600,margin:"0 auto"}}>
        {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
        {qSets.map(si=>(
          <button key={si} onClick={()=>{loadQs(qLesson,si);setView("questions_list");}} style={{width:"100%",background:C.card,border:`1px solid ${C.purple}33`,borderRadius:12,padding:"14px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,textAlign:"left"}}>
            <div><div style={{fontWeight:800,color:textColor(),fontSize:14}}>Set {si+1}</div><div style={{fontSize:11,color:C.dim,marginTop:2}}>set_index: {si}</div></div>
            <span style={{color:C.purple,fontSize:20}}>›</span>
          </button>
        ))}
        {!loading&&qSets.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No sets yet.</div>}
      </div>
    </div>
  );

  // ── Questions: Add New Set ────────────────────────────────────────
  if (view==="questions_add_set") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><BackBtn onClick={()=>setView("questions_sets")} color={C.green}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.green}}>NEW SET — {qLesson} · Set {(form.set_index??0)+1}</div></div>
      <Card color={C.green} style={{maxWidth:520,margin:"0 auto"}}>
        <div style={{color:textColor(),fontSize:13,marginBottom:12,background:`${C.green}11`,borderRadius:8,padding:"8px 12px"}}>Creates Set {(form.set_index??0)+1} in lesson <b style={{color:C.green}}>{qLesson}</b>. Fill the first question to create the set.</div>
        {[["Question","question"],["Option A","opt0"],["Option B","opt1"],["Option C","opt2"],["Option D","opt3"],["Hint (optional)","hint"]].map(([l,k])=>(
          <div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} style={iS(C.green)}/></div>
        ))}
        <div style={{marginBottom:12}}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>CORRECT ANSWER</div><select value={form.correct||0} onChange={e=>setForm({...form,correct:parseInt(e.target.value)})} style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.green}44`,borderRadius:10,padding:"10px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14}}>{["A","B","C","D"].map((l,i)=><option key={i} value={i}>Option {l}</option>)}</select></div>
        <MsgBar m={msg}/>
        <Btn color={C.green} loading={loading} onClick={async()=>{
          if(!form.question||!form.opt0||!form.opt1||!form.opt2||!form.opt3){setMsg("Fill all fields.");return;}
          setLoading(true);setMsg("");
          const d=await api("admin_add_question",{lesson_id:form.lesson_id,set_index:form.set_index??0,question_index:0,question:form.question,options:[form.opt0,form.opt1,form.opt2,form.opt3],correct_answer:form.correct??0,hint:form.hint||""});
          if(d.data){toast("✅ Set created!");loadQSets(qLesson);setTimeout(()=>setView("questions_sets"),800);}else setMsg(d.error||"Failed");
          setLoading(false);
        }}>CREATE SET + ADD QUESTION</Btn>
      </Card>
    </div>
  );

  // ── Questions: List in Set (table) ────────────────────────────────
  if (view==="questions_list") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),overflowY:"auto"}}>
      <Hdr title={`${qLesson} · Set ${(qSet??0)+1}`} back={()=>setView("questions_sets")} accent={C.yellow}
        extra={<>
          <button onClick={()=>{setForm({lesson_id:qLesson,set_index:qSet??0,question_index:questions.length,opt0:"",opt1:"",opt2:"",opt3:"",correct:0});setMsg("");setView("questions_add_q");}} style={{background:`${C.green}22`,border:`1px solid ${C.green}44`,borderRadius:10,padding:"7px 12px",color:C.green,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>+ QUESTION</button>
          <button onClick={()=>{setBulkText("");setBulkResult([]);setMsg("");setView("questions_bulk");}} style={{background:`${C.purple}22`,border:`1px solid ${C.purple}44`,borderRadius:10,padding:"7px 12px",color:C.purple,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>⚡ BULK</button>
        </>}
      />
      <div style={{padding:"10px 12px",maxWidth:800,margin:"0 auto"}}>
        {loading&&<div style={{textAlign:"center",color:C.dim,padding:20}}>Loading...</div>}
        <MsgBar m={msg}/>
        {questions.length>0&&(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:C.card2}}>{["#","Question","A","B","C","D","✓","Hint",""].map((h,i)=><th key={i} style={{padding:"8px 10px",textAlign:"left",color:C.dim,fontWeight:700,whiteSpace:"nowrap",borderBottom:`1px solid ${C.yellow}33`}}>{h}</th>)}</tr></thead>
              <tbody>
                {questions.map((q,i)=>(
                  <tr key={q.id} style={{background:i%2===0?C.card:"transparent",borderBottom:`1px solid #ffffff08`}}>
                    <td style={{padding:"8px 10px",color:C.dim}}>{i+1}</td>
                    <td style={{padding:"8px 10px",color:textColor(),maxWidth:200,wordBreak:"break-word"}}>{q.question}</td>
                    {(q.options||[]).map((o,oi)=><td key={oi} style={{padding:"8px 10px",color:oi===q.correct_answer?C.green:"#aaa",maxWidth:120,wordBreak:"break-word"}}>{o}</td>)}
                    <td style={{padding:"8px 10px",color:C.green,fontWeight:800}}>{"ABCD"[q.correct_answer]}</td>
                    <td style={{padding:"8px 10px",color:C.dim,maxWidth:100,wordBreak:"break-word"}}>{q.hint||"—"}</td>
                    <td style={{padding:"8px 6px",whiteSpace:"nowrap"}}>
                      <button onClick={()=>{setForm({id:q.id,question:q.question,opt0:q.options[0],opt1:q.options[1],opt2:q.options[2],opt3:q.options[3],correct:q.correct_answer,hint:q.hint||""});setMsg("");setView("questions_edit_q");}} style={{background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,borderRadius:6,padding:"4px 7px",color:C.cyan,cursor:"pointer",marginRight:4,fontSize:11}}>✏️</button>
                      <button onClick={async()=>{if(!window.confirm("Delete?"))return;setLoading(true);const d=await api("admin_delete_question",{id:q.id});if(d.ok){toast("✅ Question deleted");loadQs(qLesson,qSet);}else setMsg(d.error||"Failed");setLoading(false);}} style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:6,padding:"4px 7px",color:C.red,cursor:"pointer",fontSize:11}}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading&&questions.length===0&&<div style={{textAlign:"center",color:C.dim,padding:30}}>No questions in this set.</div>}
      </div>
    </div>
  );

  // ── Questions: Add Single Question ────────────────────────────────
  if (view==="questions_add_q") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><BackBtn onClick={()=>setView("questions_list")} color={C.green}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.green}}>ADD QUESTION — {qLesson} Set {(qSet??0)+1}</div></div>
      <Card color={C.green} style={{maxWidth:520,margin:"0 auto"}}>
        {[["Question","question"],["Option A","opt0"],["Option B","opt1"],["Option C","opt2"],["Option D","opt3"],["Hint (optional)","hint"]].map(([l,k])=>(
          <div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} style={iS(C.green)}/></div>
        ))}
        <div style={{marginBottom:12}}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>CORRECT ANSWER</div><select value={form.correct??0} onChange={e=>setForm({...form,correct:parseInt(e.target.value)})} style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.green}44`,borderRadius:10,padding:"10px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14}}>{["A","B","C","D"].map((l,i)=><option key={i} value={i}>Option {l} — {form["opt"+i]||""}</option>)}</select></div>
        <MsgBar m={msg}/>
        <Btn color={C.green} loading={loading} onClick={async()=>{
          if(!form.question||!form.opt0||!form.opt1||!form.opt2||!form.opt3){setMsg("Fill question and all 4 options.");return;}
          setLoading(true);setMsg("");
          const d=await api("admin_add_question",{lesson_id:form.lesson_id,set_index:form.set_index??0,question_index:form.question_index??0,question:form.question,options:[form.opt0,form.opt1,form.opt2,form.opt3],correct_answer:form.correct??0,hint:form.hint||""});
          if(d.data){toast("✅ Question added!");setForm(f=>({...f,question:"",opt0:"",opt1:"",opt2:"",opt3:"",hint:"",question_index:(f.question_index??0)+1}));loadQs(qLesson,qSet);}else setMsg(d.error||"Failed");
          setLoading(false);
        }}>ADD QUESTION</Btn>
      </Card>
    </div>
  );

  // ── Questions: Edit Question ──────────────────────────────────────
  if (view==="questions_edit_q") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><BackBtn onClick={()=>setView("questions_list")} color={C.cyan}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.cyan}}>EDIT QUESTION</div></div>
      <Card color={C.cyan} style={{maxWidth:520,margin:"0 auto"}}>
        {[["Question","question"],["Option A","opt0"],["Option B","opt1"],["Option C","opt2"],["Option D","opt3"],["Hint","hint"]].map(([l,k])=>(
          <div key={k}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>{l}</div><input value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} style={iS(C.cyan)}/></div>
        ))}
        <div style={{marginBottom:12}}><div style={{color:C.dim,fontSize:11,marginBottom:4}}>CORRECT ANSWER</div><select value={form.correct??0} onChange={e=>setForm({...form,correct:parseInt(e.target.value)})} style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.cyan}44`,borderRadius:10,padding:"10px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:14}}>{["A","B","C","D"].map((l,i)=><option key={i} value={i}>Option {l} — {form["opt"+i]||""}</option>)}</select></div>
        <MsgBar m={msg}/>
        <Btn color={C.cyan} loading={loading} onClick={async()=>{
          setLoading(true);setMsg("");
          const d=await api("admin_update_question",{id:form.id,question:form.question,options:[form.opt0,form.opt1,form.opt2,form.opt3],correct_answer:form.correct??0,hint:form.hint||""});
          if(d.ok){toast("✅ Question updated!");loadQs(qLesson,qSet);setView("questions_list");}else setMsg(d.error||"Failed");
          setLoading(false);
        }}>SAVE CHANGES</Btn>
      </Card>
    </div>
  );

  // ── Questions: Bulk Upload ────────────────────────────────────────
  if (view==="questions_bulk") return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",color:textColor(),padding:"20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><BackBtn onClick={()=>setView("questions_list")} color={C.purple}/><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:C.purple}}>BULK UPLOAD — {qLesson} Set {(qSet??0)+1}</div></div>
      <Card color={C.purple} style={{maxWidth:520,margin:"0 auto"}}>
        <div style={{color:C.dim,fontSize:11,marginBottom:6}}>CSV: <b style={{color:C.purple}}>Question, Option A, Option B, Option C, Option D, Correct (0-3), Hint</b></div>
        <div style={{color:C.dim,fontSize:10,marginBottom:10,background:`${C.purple}11`,borderRadius:8,padding:"8px 10px"}}>What is 2+2?, 3, 4, 5, 6, 1, Add the numbers</div>
        <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)} rows={10} placeholder="Question, A, B, C, D, correct(0-3), hint" style={{width:"100%",background:isDark()?C.card2:"rgba(124,111,224,0.06)",border:`1.5px solid ${C.purple}44`,borderRadius:10,padding:"10px 12px",color:textColor(),fontFamily:"'Nunito',sans-serif",fontSize:12,display:"block",marginBottom:10,resize:"vertical"}}/>
        {bulkResult.length>0&&<div style={{maxHeight:150,overflowY:"auto",marginBottom:10}}>{bulkResult.map((r,i)=><div key={i} style={{fontSize:11,color:r.ok?C.green:C.red}}>{r.ok?"✅":"❌"} Row {i+1}: {r.error||"OK"}</div>)}</div>}
        <MsgBar m={msg}/>
        <Btn color={C.purple} loading={loading} onClick={async()=>{
          const rows=bulkText.split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{const p=l.split(",").map(s=>s.trim());return{question:p[0],options:[p[1]||"",p[2]||"",p[3]||"",p[4]||""],correct_answer:parseInt(p[5])||0,hint:p[6]||""};}).filter(r=>r.question);
          if(!rows.length){setMsg("No valid rows.");return;}
          setLoading(true);setMsg("");setBulkResult([]);
          const d=await api("admin_bulk_add_questions",{lesson_id:qLesson,set_index:qSet??0,questions:rows});
          setBulkResult(d.data||[]);const ok=(d.data||[]).filter(r=>r.ok).length;
          toast(`✅ ${ok}/${rows.length} questions added.`);if(ok>0)loadQs(qLesson,qSet);
          setLoading(false);
        }}>UPLOAD QUESTIONS</Btn>
      </Card>
    </div>
  );

  return null;
}

