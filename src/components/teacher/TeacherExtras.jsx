// src/components/teacher/TeacherExtras.jsx — StudentLogin, StudentActions, ExcelImport
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


