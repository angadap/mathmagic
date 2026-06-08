// src/components/screens/ShopBadgesCharacter.jsx — ShopScreen, BadgesScreen, CharacterScreen
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, BackBtn, Card } from '../ui/primitives.jsx';
import { SHOP_ITEMS, BADGES } from '../../constants/gameData.js';
import { updateC, THEMES } from '../../constants/themes.js';


export function ShopScreen({ child, setChild, onBack }) {
  const [tab,     setTab]     = useState("avatar");
  const [msg,     setMsg]     = useState("");
  const [loading, setLoading] = useState(false);
  const owned   = Array.isArray(child.shop_items) ? child.shop_items : [];
  const totalStars = Math.floor((child.xp||0)/20);
  const iS = (a) => ({width:"100%",background:isDark()?"rgba(255,255,255,0.06)":"rgba(124,111,224,0.06)",border:`1.5px solid ${a}44`,borderRadius:12,padding:"10px 14px",color:textColor(),fontFamily:"'Baloo 2',sans-serif",fontSize:14,display:"block",marginBottom:10,outline:"none"});

  const handleBuy = async (item) => {
    if (owned.includes(item.id)) { setMsg("Already owned!"); return; }
    const costType = item.gems?"gems":item.coins?"coins":"stars";
    const amount   = item.gems||item.coins||item.stars;
    const bal = costType==="gems"?(child.gems||0):costType==="coins"?(child.coins||0):totalStars;
    if (bal < amount) { setMsg(`Not enough ${costType}!`); return; }
    setLoading(true); setMsg("");
    const result = await db.purchaseShopItem(child.id, item.id, costType, amount);
    if (result.ok) {
      const updates = { shop_items:[...owned,item.id] };
      if (costType==="gems")   updates.gems  = (child.gems||0)  - amount;
      if (costType==="coins")  updates.coins = (child.coins||0) - amount;
      setChild(c=>({...c,...updates}));
      setMsg("✅ Purchased! "+item.icon);
      SFX.correct();
    } else {
      setMsg(result.error||"Failed");
    }
    setLoading(false);
  };

  const tabs = [{k:"avatar",l:"🎭 Avatars"},{k:"powerup",l:"⚡ Power-ups"},{k:"theme",l:"🎨 Themes"}];
  const items = SHOP_ITEMS.filter(i=>i.cat===tab);

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",paddingBottom:20}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#2ECC9A,#4BBDF5)",padding:"16px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <BackBtn onClick={onBack} color="white"/>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:"white",flex:1}}>🛒 Reward Shop</div>
        </div>
        {/* Currency balances */}
        <div style={{display:"flex",gap:8}}>
          {[{e:"⭐",v:totalStars,l:"Stars"},{e:"💎",v:child.gems||0,l:"Gems"},{e:"🪙",v:child.coins||0,l:"Coins"}].map((c,i)=>(
            <div key={i} style={{flex:1,background:"rgba(255,255,255,0.22)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:14,padding:"8px 6px",textAlign:"center"}}>
              <div style={{fontSize:20}}>{c.e}</div>
              <div style={{fontSize:16,fontWeight:900,color:"white"}}>{c.v}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.8)",fontWeight:700}}>{c.l}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Tab bar */}
      <div style={{display:"flex",background:"#F0ECFF",borderRadius:20,padding:3,margin:"12px 16px"}}>
        {tabs.map(t=>(
          <button key={t.k} onClick={()=>{setTab(t.k);setMsg("");}} style={{flex:1,background:tab===t.k?"white":"transparent",border:"none",borderRadius:16,padding:"9px 4px",fontSize:12,fontWeight:tab===t.k?900:700,color:tab===t.k?"#5B4FE8":"#9890C4",cursor:"pointer",boxShadow:tab===t.k?"0 2px 8px rgba(91,79,232,0.2)":"none",transition:"all 0.2s"}}>{t.l}</button>
        ))}
      </div>
      {msg&&<div style={{margin:"10px 16px 0",padding:"8px 14px",borderRadius:12,background:msg.startsWith("✅")?`${C.green}18`:`${C.red}18`,color:msg.startsWith("✅")?C.green:C.red,fontSize:13,fontWeight:700}}>{msg}</div>}
      {/* Items grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,padding:"14px 16px"}}>
        {items.map(item=>{
          const isOwned = owned.includes(item.id);
          const lockedByLevel = (child.level||1) < item.lvl;
          const costType = item.gems?"gems":item.coins?"coins":"stars";
          const costAmt  = item.gems||item.coins||item.stars;
          const costIcon = item.gems?"💎":item.coins?"🪙":"⭐";
          return (
            <div key={item.id} style={{background:"white",border:`1.5px solid ${isOwned?"#2ECC9A44":"rgba(91,79,232,0.12)"}`,borderRadius:20,padding:"16px 12px",textAlign:"center",boxShadow:isOwned?"0 4px 16px #2ECC9A18, inset 0 1px 0 rgba(255,255,255,0.8)":"0 4px 16px rgba(91,79,232,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",opacity:lockedByLevel?0.5:1}}>
              <div style={{fontSize:42,marginBottom:8,filter:lockedByLevel?"grayscale(1)":"none"}}>{item.icon}</div>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:900,color:"#1A1040",marginBottom:4}}>{item.name}</div>
              <div style={{fontSize:11,color:"#9890C4",marginBottom:10,lineHeight:1.4}}>{item.desc}</div>
              {lockedByLevel ? (
                <div style={{background:"rgba(91,79,232,0.08)",borderRadius:999,padding:"6px 12px",fontSize:11,color:"#9890C4",fontWeight:700}}>🔒 Level {item.lvl}</div>
              ) : isOwned ? (
                <div style={{background:"#2ECC9A18",border:"1.5px solid #2ECC9A40",borderRadius:999,padding:"5px 10px",fontSize:11,color:"#2ECC9A",fontWeight:800,display:"inline-block"}}>✅ Owned</div>
              ) : (
                <button onClick={()=>handleBuy(item)} disabled={loading} style={{background:"linear-gradient(135deg,#5B4FE8,#9B59F5)",border:"none",borderRadius:12,padding:"8px 16px",fontSize:13,fontWeight:900,color:"white",cursor:"pointer",boxShadow:"0 4px 0 #5B4FE8CC, 0 6px 16px #5B4FE835, inset 0 1px 0 rgba(255,255,255,0.35)",width:"100%"}}>
                  {costIcon} {costAmt}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 🏅 BADGES SCREEN
// ══════════════════════════════════════════════════════════════════
export function BadgesScreen({ child, badgeTab, setBadgeTab, onBack }) {
  const earned  = Array.isArray(child.badge_ids) ? child.badge_ids : [];
  const cats    = ["all","general","streak","speed","master"];
  const catLabels = {all:"All",general:"General",streak:"Streak",speed:"Speed",master:"Master"};
  const shown   = BADGES.filter(b=> badgeTab==="all" || b.cat===badgeTab);
  const earnedCount = BADGES.filter(b=>earned.includes(b.id)).length;

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",paddingBottom:20}}>
      <div style={{background:"linear-gradient(135deg,#FFC847,#FF6B6B)",padding:"16px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <BackBtn onClick={onBack} color="white"/>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:"white"}}>🏅 Achievements</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.85)",marginTop:2}}>{earnedCount} / {BADGES.length} badges unlocked</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{background:"rgba(255,255,255,0.25)",borderRadius:999,height:10,overflow:"hidden"}}>
          <div style={{width:`${(earnedCount/BADGES.length)*100}%`,height:"100%",background:"linear-gradient(90deg,#FFC847,#FF6B6B)",borderRadius:999,boxShadow:"0 0 8px #FF6B6B55",transition:"width 1s ease"}}/>
        </div>
      </div>
      {/* Category tabs */}
      <div style={{display:"flex",gap:0,background:"white",borderBottom:"1px solid rgba(91,79,232,0.1)",overflowX:"auto",padding:"0 8px"}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setBadgeTab(c)} style={{flex:"0 0 auto",background:"none",border:"none",padding:"11px 14px",fontSize:12,fontWeight:800,color:badgeTab===c?"#FFC847":"#9890C4",cursor:"pointer",borderBottom:`3px solid ${badgeTab===c?"#FFC847":"transparent"}`,whiteSpace:"nowrap",transition:"all 0.2s"}}>{catLabels[c]}</button>
        ))}
      </div>
      {/* Badge grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,padding:"14px 14px"}}>
        {shown.map((badge,bi)=>{
          const isEarned = earned.includes(badge.id);
          return (
            <div key={badge.id} style={{background:"white",border:`2px solid ${isEarned?"#FFC84755":"rgba(91,79,232,0.1)"}`,borderRadius:18,padding:"14px 8px",textAlign:"center",boxShadow:isEarned?"0 4px 16px #FFC84728, inset 0 1px 0 rgba(255,255,255,0.8)":"0 2px 8px rgba(91,79,232,0.06)",opacity:isEarned?1:0.45,transition:"all 0.3s",animation:"mmPop 0.35s ease both",animationDelay:`${bi*0.05}s`}}>
              <div style={{fontSize:34,marginBottom:6,filter:isEarned?"none":"grayscale(1)"}}>{badge.icon}</div>
              <div style={{fontSize:11,fontWeight:900,color:isEarned?"#1A1040":"#9890C4",marginBottom:3,lineHeight:1.2}}>{badge.name}</div>
              <div style={{fontSize:9,color:"#9890C4",lineHeight:1.3}}>{badge.desc}</div>
              {isEarned && <div style={{marginTop:6,background:"#FFC84722",border:"1.5px solid #FFC84740",borderRadius:999,padding:"3px 10px",fontSize:9,color:"#FFC847",fontWeight:800,display:"inline-block"}}>EARNED ✓</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 🎭 CHARACTER / AVATAR SCREEN
// ══════════════════════════════════════════════════════════════════
export function CharacterScreen({ child, setChild, onBack }) {
  const [sel,     setSel]     = useState(child.selected_avatar||child.avatar||"🧒");
  const [msg,     setMsg]     = useState("");
  const [tab,     setTab]     = useState("heroes");
  const owned    = Array.isArray(child.shop_items) ? child.shop_items : [];
  const totalStars = Math.floor((child.xp||0)/20);

  const HERO_CHARS = [
    {emoji:"🧒",name:"Explorer",  free:true},
    {emoji:"👧",name:"Scholar",   free:true},
    {emoji:"👦",name:"Cadet",     free:true},
    {emoji:"🧑",name:"Adventurer",free:true},
    {emoji:"🧙‍♂️",name:"Wizard",  free:false, item:"avatar_wizard"},
    {emoji:"🤖",name:"Robot",     free:false, item:"avatar_robot"},
    {emoji:"🐉",name:"Dragon",    free:false, item:"avatar_dragon"},
    {emoji:"🦸",name:"Hero",      free:false, item:"avatar_hero"},
    {emoji:"🦄",name:"Unicorn",   free:false, item:"avatar_unicorn"},
    {emoji:"⚔️",name:"Knight",    free:false, item:"avatar_knight"},
    {emoji:"🧝",name:"Elf",       free:false, item:null},
    {emoji:"👑",name:"King",       free:false, item:null},
  ];

  const isUnlocked = (c) => c.free || (c.item && owned.includes(c.item));

  const handleSave = async () => {
    await db.updateChildFields(child.id, { selected_avatar:sel, avatar:sel });
    setChild(c=>({...c,selected_avatar:sel,avatar:sel}));
    setMsg("✅ Character saved!");
    SFX.correct();
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",paddingBottom:20}}>
      <div style={{background:"linear-gradient(135deg,#9B59F5,#FF5FA0)",padding:"14px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <BackBtn onClick={onBack} color="white"/>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:"white"}}>🎭 My Character</div>
        </div>
      </div>
      {/* Stage — preview selected char */}
      <div style={{margin:"16px",background:"white",borderRadius:28,padding:"24px 16px",textAlign:"center",boxShadow:"0 8px 30px #FF5FA028, 0 2px 6px #FF5FA018, inset 0 1px 0 rgba(255,255,255,0.8)"}}>
        <div style={{fontSize:72,marginBottom:8,animation:"mmFloat 2.5s ease-in-out infinite",filter:"drop-shadow(0 8px 20px #FF5FA044)"}}>{sel}</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#1A1040"}}>{child.name}</div>
        <div style={{fontSize:12,color:"#9890C4",marginTop:2}}>Level {child.level||1} · {HERO_CHARS.find(c=>c.emoji===sel)?.name||"Explorer"}</div>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",background:"#F0ECFF",borderRadius:20,padding:3,margin:"0 16px 12px"}}>
        {[["heroes","🧒 Heroes"],["pets","🐾 Pets"],["skins","🎨 Skins"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,background:tab===k?"white":"transparent",border:"none",borderRadius:16,padding:"9px 6px",fontSize:11,fontWeight:tab===k?900:700,color:tab===k?"#9B59F5":"#9890C4",cursor:"pointer",boxShadow:tab===k?"0 2px 8px rgba(91,79,232,0.2)":"none",transition:"all 0.2s"}}>{l}</button>
        ))}
      </div>
      {/* Character grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,padding:"0 14px 14px"}}>
        {HERO_CHARS.map(c=>{
          const unlocked = isUnlocked(c);
          const isSelected = sel===c.emoji;
          return (
            <div key={c.emoji} onClick={()=>unlocked&&setSel(c.emoji)} style={{background:isSelected?"#9B59F518":"white",border:`2px solid ${isSelected?"#9B59F555":unlocked&&!isSelected?"#2ECC9A33":"rgba(91,79,232,0.12)"}`,borderRadius:18,padding:"12px 6px",textAlign:"center",cursor:unlocked?"pointer":"not-allowed",transition:"all 0.2s",boxShadow:isSelected?"0 8px 24px #9B59F528, inset 0 1px 0 rgba(255,255,255,0.8)":"0 2px 8px rgba(91,79,232,0.06)",transform:isSelected?"scale(1.06)":"none",position:"relative",overflow:"hidden"}}>
              {!unlocked && <div style={{position:"absolute",top:4,right:4,background:"#FFC847",borderRadius:999,padding:"1px 5px",fontSize:8,fontWeight:900,color:"#1A1040"}}>💎</div>}
              <div style={{fontSize:32,marginBottom:4,filter:unlocked?"none":"grayscale(0.4)"}}>{c.emoji}</div>
              <div style={{fontSize:10,fontWeight:900,color:isSelected?"#9B59F5":"#1A1040"}}>{c.name}</div>
              {!unlocked && <div style={{fontSize:8,color:"#9890C4",marginTop:2}}>Shop</div>}
              {isSelected && <div style={{width:6,height:6,borderRadius:"50%",background:"#9B59F5",margin:"4px auto 0"}}/>}
            </div>
          );
        })}
      </div>
      {msg&&<div style={{margin:"0 16px 10px",padding:"8px 14px",borderRadius:12,background:"#2ECC9A18",color:"#2ECC9A",fontSize:13,fontWeight:700}}>{msg}</div>}
      <div style={{padding:"0 16px"}}>
        <Btn color="#9B59F5" onClick={handleSave}>✨ Save Character</Btn>
      </div>
    </div>
  );
}

