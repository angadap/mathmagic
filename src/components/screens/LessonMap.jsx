// src/components/screens/LessonMap.jsx — SetPathMap, LessonMap
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, Card, BackBtn, XPBar } from '../ui/primitives.jsx';
import { Starfield, Confetti, Mascot } from '../layout/layout.jsx';
import { WORLDS, LESSONS, BADGES } from '../../constants/gameData.js';
import { ProgressGrid } from '../shared/shared.jsx';


// ── Lessons ───────────────────────────────────────────────────────────
export function SetPathMap({ lesson, world, progress, onLesson, onBack, isSetDone, isSetUnlocked, completedSets }) {
  const cSets = completedSets(lesson.id);
  const CHEST_SETS = [4, 9, 14, 19];
  const EMOJIS = ["🌟","🎯","🚀","⭐","🏆","💡","🎮","🔥","💫","✨","🎪","🌈","🎓","🧠","⚡","🎁","🏅","🌙","🪄","👑"];
  const groups = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19]];
  const GROUP_NAMES = ["Starter","Explorer","Champion","Master"];
  const GROUP_ICONS = ["🌱","🔭","🏆","👑"];

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",paddingBottom:40}}>
      {/* Sticky header */}
      <div style={{position:"sticky",top:0,zIndex:10,background:C.card,borderBottom:`3px solid ${world.color}55`,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,boxShadow:`0 2px 16px ${world.color}22`}}>
        <BackBtn onClick={onBack} color={world.color}/>
        <div style={{width:46,height:46,borderRadius:14,background:`linear-gradient(135deg,${world.color},${world.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{lesson.emoji}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:world.color,fontWeight:900,letterSpacing:2}}>LESSON {lesson._li+1}</div>
          <div style={{fontSize:16,fontWeight:900,color:textColor()}}>{lesson.title}</div>
        </div>
        <div style={{background:`linear-gradient(135deg,${world.color},${world.color}99)`,borderRadius:14,padding:"6px 12px",textAlign:"center"}}>
          <div style={{fontSize:18,fontWeight:900,color:"white"}}>{cSets}/20</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.7)"}}>SETS</div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div style={{padding:"12px 18px 0"}}>
        <div style={{background:isDark()?"rgba(255,255,255,0.08)":C.border||"#ece8ff",borderRadius:20,height:12,overflow:"hidden"}}>
          <div style={{width:`${(cSets/20)*100}%`,height:"100%",background:`linear-gradient(90deg,${world.color},${C.cyan})`,borderRadius:20,transition:"width 0.6s ease",boxShadow:`0 0 10px ${world.color}66`}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:11,color:C.dim}}>
          <span>{cSets} complete</span><span>{20-cSets} remaining</span>
        </div>
      </div>

      {/* Groups of 5 sets */}
      <div style={{padding:"16px 18px",display:"flex",flexDirection:"column",gap:16}}>
        {groups.map((group,gi)=>{
          const groupDone = group.filter(si=>isSetDone(lesson.id,si)).length;
          const groupUnlocked = group.some(si=>isSetUnlocked(lesson.id,si));
          return (
            <div key={gi} style={{background:C.card,borderRadius:22,border:`1.5px solid ${groupDone===5?world.color+"55":groupUnlocked?world.color+"22":isDark()?"rgba(255,255,255,0.06)":C.border||"#ddd"}`,overflow:"hidden",boxShadow:groupDone===5?`0 4px 18px ${world.color}22`:"none"}}>
              {/* Group header */}
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:groupDone===5?`linear-gradient(135deg,${world.color}22,${world.color}0a)`:groupUnlocked?`${world.color}0a`:"transparent"}}>
                <div style={{fontSize:26}}>{GROUP_ICONS[gi]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:900,color:groupDone===5?world.color:groupUnlocked?textColor():C.dim}}>{GROUP_NAMES[gi]} — Sets {group[0]+1}–{group[4]+1}</div>
                  <div style={{fontSize:11,color:C.dim,marginTop:2}}>{groupDone}/5 complete</div>
                </div>
                {groupDone===5&&<div style={{fontSize:20}}>✅</div>}
              </div>
              {/* 5 set cards in a row */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,padding:"8px 12px 14px"}}>
                {group.map(si=>{
                  const sDone=isSetDone(lesson.id,si);
                  const sUnlock=isSetUnlocked(lesson.id,si);
                  const isCurrent=!sDone&&sUnlock;
                  const isChest=CHEST_SETS.includes(si);
                  return (
                    <button key={si}
                      onClick={()=>{if(sUnlock){SFX.unlock();onLesson({...lesson,setIndex:si,_progress:progress});}else SFX.wrong();}}
                      style={{
                        background:sDone?`linear-gradient(135deg,${world.color},${world.color}99)`:isCurrent?`linear-gradient(135deg,${world.color}22,${world.color}11)`:isDark()?"rgba(255,255,255,0.04)":"#f5f0ff",
                        border:`2px solid ${sDone?world.color:isCurrent?world.color+"88":isDark()?"rgba(255,255,255,0.1)":C.border||"#ddd"}`,
                        borderRadius:14, padding:"10px 4px", cursor:sUnlock?"pointer":"not-allowed",
                        textAlign:"center", opacity:sUnlock?1:0.35,
                        boxShadow:isCurrent?`0 0 0 4px ${world.color}33, 0 4px 14px ${world.color}44`:sDone?`0 3px 10px ${world.color}44`:"none",
                        animation:isCurrent?"heartbeat 1.5s ease-in-out infinite":"none",
                        transition:"all 0.2s",
                      }}>
                      <div style={{fontSize:isChest?22:sDone?20:isCurrent?20:18,marginBottom:3}}>
                        {isChest&&!sDone&&sUnlock?"🎁":sDone?"⭐":isCurrent?EMOJIS[si%EMOJIS.length]:"🔒"}
                      </div>
                      <div style={{fontSize:9,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:sDone?"white":isCurrent?world.color:C.dim}}>S{si+1}</div>
                      {isCurrent&&<div style={{fontSize:8,color:world.color,fontWeight:700,marginTop:1}}>TAP!</div>}
                      {sDone&&<div style={{fontSize:8,color:"rgba(255,255,255,0.7)",marginTop:1}}>✓</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export function LessonMap({ world, child, onBack, onLesson, isLessonPurchased, onPurchaseLesson }) {
  const [progress,    setProgress]    = useState([]);
  const [activeLesson, setActiveLesson] = useState(null); // when set → show SetPathMap
  const lessons = LESSONS[child.class_num] || LESSONS[1];

  useEffect(() => {
    db.getProgress(child.id).then(({ data }) => setProgress(data || []));
    const lessons = LESSONS[child.class_num] || LESSONS[1];
    lessons.forEach((l, i) => { if (i === 0) fetchSetQuestions(l.id, 0); });
  }, [child.id]);

  const isSetDone     = (lid, si) => progress.some(p => p.lesson_id === lid+"_s"+si && (p.stars_earned||0) >= 1);
  const isSetUnlocked = (lid, si) => si === 0 || isSetDone(lid, si - 1);
  const lessonDone    = (lid) => isSetDone(lid, 19);
  const lessonStarted = (lid) => isSetDone(lid, 0);
  const completedSets = (lid) => Array.from({length:20},(_,i)=>i).filter(i=>isSetDone(lid,i)).length;
  const worldProg = lessons.filter(l => lessonStarted(l.id)).length;
  const totalSets = lessons.length * 20;
  const doneSets  = lessons.reduce((s,l)=>s+completedSets(l.id),0);

  // Show SetPathMap when a lesson is tapped
  if (activeLesson) {
    return <SetPathMap
      lesson={activeLesson} world={world} progress={progress}
      onLesson={onLesson} onBack={() => setActiveLesson(null)}
      isSetDone={isSetDone} isSetUnlocked={isSetUnlocked} completedSets={completedSets}
    />;
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Baloo 2','Nunito',sans-serif", paddingBottom:40, position:"relative" }}>
      <Starfield n={isDark()?20:8}/>
      {/* Header */}
      <div style={{ position:"relative", zIndex:2, background:isDark()?`${world.color}1a`:C.card, borderBottom:`3px solid ${world.color}44`, padding:"16px 18px", boxShadow:`0 2px 12px ${world.color}22` }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <BackBtn onClick={onBack} color={world.color}/>
          <div style={{ width:48, height:48, borderRadius:16, background:`linear-gradient(135deg,${world.color},${world.color}99)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, boxShadow:`0 0 16px ${world.color}55`, flexShrink:0 }}>{world.planet}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:11, color:world.color, letterSpacing:2 }}>{world.world.toUpperCase()}</div>
            <div style={{ fontSize:16, fontWeight:900, color:textColor() }}>{world.name}</div>
            <div style={{ fontSize:11, color:C.dim }}>{doneSets}/{totalSets} Sets Done</div>
          </div>
        </div>
        <div style={{ background:isDark()?"rgba(255,255,255,0.06)":C.border||"#ece8ff", borderRadius:10, height:10, overflow:"hidden" }}>
          <div style={{ width:`${totalSets>0?(doneSets/totalSets)*100:0}%`, height:"100%", background:`linear-gradient(90deg,${world.color},${C.cyan})`, borderRadius:10, transition:"width 0.8s ease", boxShadow:`0 0 8px ${world.color}66` }}/>
        </div>
        <div style={{ fontSize:11, color:C.dim, marginTop:4, fontFamily:"'Orbitron',sans-serif" }}>{worldProg}/{lessons.length} LESSONS STARTED</div>
      </div>

      {/* Lessons list */}
      <div style={{ position:"relative", zIndex:2, padding:"16px 18px" }}>
        {lessons.map((lesson, li) => {
          const done = lessonDone(lesson.id);
          const started = lessonStarted(lesson.id);
          const cSets = completedSets(lesson.id);
          const pct = Math.round(cSets/20*100);
          const isOwnClass = world.id === parseInt(child.class_num||1) || child.is_premium;
          const purchased = isOwnClass || (isLessonPurchased && isLessonPurchased(world.id, lesson.id));
          const nextLesson = !done && purchased && (li === 0 || lessonStarted(lessons[li-1]?.id));
          return (
            <div key={lesson.id} style={{ marginBottom:12 }}>
              {/* Section label for lesson groups */}
              {li % 3 === 0 && (
                <div style={{ background:`linear-gradient(135deg,${world.color}22,${world.color}0a)`, border:`1.5px solid ${world.color}33`, borderRadius:14, padding:"10px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ fontSize:22 }}>{world.planet}</div>
                  <div>
                    <div style={{ fontSize:10, color:world.color, fontFamily:"'Orbitron',sans-serif", fontWeight:900, letterSpacing:2 }}>SECTION {Math.floor(li/3)+1}</div>
                    <div style={{ fontSize:13, fontWeight:800, color:textColor() }}>{world.name}</div>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  if (!purchased) { onPurchaseLesson && onPurchaseLesson(lesson.id, world.id, 300); return; }
                  setActiveLesson({...lesson, _li:li});
                }}
                style={{
                  width:"100%", background:C.card, textAlign:"left", cursor:"pointer",
                  border:`2px solid ${done ? world.color+"66" : nextLesson ? world.color+"88" : purchased ? world.color+"33" : C.dim+"22"}`,
                  borderRadius:20, padding:"14px 16px", display:"flex", alignItems:"center", gap:14,
                  boxShadow: nextLesson ? `0 4px 20px ${world.color}44` : done ? `0 2px 12px ${world.color}22` : "none",
                  transform: nextLesson ? "scale(1.01)" : "none",
                  transition:"all 0.2s",
                  opacity: purchased ? 1 : 0.65,
                }}>
                {/* Lesson icon circle with progress ring */}
                <div style={{ position:"relative", flexShrink:0 }}>
                  <svg width="58" height="58" style={{ transform:"rotate(-90deg)" }}>
                    <circle cx="29" cy="29" r="23" fill="none" stroke={isDark()?"rgba(255,255,255,0.06)":C.border||"#ece8ff"} strokeWidth="4"/>
                    <circle cx="29" cy="29" r="23" fill="none" stroke={done?C.green:world.color} strokeWidth="4"
                      strokeDasharray={`${2*Math.PI*23*pct/100} ${2*Math.PI*23}`} strokeLinecap="round"
                      style={{transition:"stroke-dasharray 0.8s ease"}}/>
                  </svg>
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                    {!purchased ? "🔒" : done ? "✅" : lesson.emoji}
                  </div>
                </div>
                {/* Text */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, color:world.color, fontWeight:900, fontFamily:"'Orbitron',sans-serif", letterSpacing:1, marginBottom:3 }}>LESSON {li+1}</div>
                  <div style={{ fontSize:16, fontWeight:900, color:textColor(), marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{lesson.title}</div>
                  <div style={{ fontSize:12, color:C.dim, marginBottom:6 }}>{lesson.sub}</div>
                  {purchased ? (
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ flex:1, background:isDark()?"rgba(255,255,255,0.07)":C.border||"#ece8ff", borderRadius:20, height:6, overflow:"hidden" }}>
                        <div style={{ width:`${pct}%`, height:"100%", background:done?`linear-gradient(90deg,${C.green},${C.green}aa)`:`linear-gradient(90deg,${world.color},${C.cyan})`, borderRadius:20, transition:"width 0.6s" }}/>
                      </div>
                      <div style={{ fontSize:11, fontWeight:900, color:done?C.green:world.color, whiteSpace:"nowrap" }}>{cSets}/20</div>
                    </div>
                  ) : (
                    <div style={{ background:`${C.orange}22`, borderRadius:10, padding:"4px 10px", display:"inline-block" }}>
                      <span style={{ fontSize:11, color:C.orange, fontWeight:800 }}>💰 Unlock — ₹300</span>
                    </div>
                  )}
                </div>
                {/* Arrow / badge */}
                <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  {done
                    ? <div style={{ background:`${C.green}22`, borderRadius:12, padding:"6px 10px" }}><div style={{ fontSize:18 }}>🏆</div></div>
                    : nextLesson
                      ? <div style={{ background:world.color, borderRadius:14, padding:"8px 12px", animation:"heartbeat 1.5s ease-in-out infinite" }}><div style={{ fontSize:16, color:"white", fontWeight:900 }}>▶</div></div>
                      : <div style={{ fontSize:22, color:purchased?world.color:C.dim }}>›</div>
                  }
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Game ──────────────────────────────────────────────────────────────
