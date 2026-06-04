// src/components/screens/ShopBadgesCharacter.jsx — ShopScreen, BadgesScreen, CharacterScreen
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, BackBtn, Card } from '../ui/primitives.jsx';
import { SHOP_ITEMS, BADGES } from '../../constants/gameData.js';


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
      <div style={{background:`linear-gradient(135deg,${C.green},${C.cyan})`,padding:"16px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <BackBtn onClick={onBack} color="white"/>
          <div style={{fontSize:18,fontWeight:900,color:"white",flex:1}}>🛒 Reward Shop</div>
        </div>
        {/* Currency balances */}
        <div style={{display:"flex",gap:8}}>
          {[{e:"⭐",v:totalStars,l:"Stars"},{e:"💎",v:child.gems||0,l:"Gems"},{e:"🪙",v:child.coins||0,l:"Coins"}].map((c,i)=>(
            <div key={i} style={{flex:1,background:"rgba(255,255,255,0.2)",borderRadius:14,padding:"8px 6px",textAlign:"center"}}>
              <div style={{fontSize:20}}>{c.e}</div>
              <div style={{fontSize:16,fontWeight:900,color:"white"}}>{c.v}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.7)",fontWeight:700}}>{c.l}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Tab bar */}
      <div style={{display:"flex",background:C.card,borderBottom:`1.5px solid ${C.border||"#ece8ff"}`}}>
        {tabs.map(t=>(
          <button key={t.k} onClick={()=>{setTab(t.k);setMsg("");}} style={{flex:1,background:"none",border:"none",padding:"11px 4px",fontSize:12,fontWeight:800,color:tab===t.k?C.green:C.dim,cursor:"pointer",borderBottom:`3px solid ${tab===t.k?C.green:"transparent"}`,transition:"all 0.2s"}}>{t.l}</button>
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
            <div key={item.id} style={{background:C.card,border:`2px solid ${isOwned?C.green+"55":C.border||"#ece8ff"}`,borderRadius:20,padding:"16px 12px",textAlign:"center",boxShadow:isOwned?`0 2px 12px ${C.green}22`:`0 2px 8px ${C.purple}10`,opacity:lockedByLevel?0.5:1}}>
              <div style={{fontSize:42,marginBottom:8,filter:lockedByLevel?"grayscale(1)":"none"}}>{item.icon}</div>
              <div style={{fontSize:13,fontWeight:900,color:textColor(),marginBottom:4}}>{item.name}</div>
              <div style={{fontSize:11,color:C.dim,marginBottom:10,lineHeight:1.4}}>{item.desc}</div>
              {lockedByLevel ? (
                <div style={{background:`${C.dim}22`,borderRadius:10,padding:"6px 12px",fontSize:11,color:C.dim,fontWeight:700}}>🔒 Level {item.lvl}</div>
              ) : isOwned ? (
                <div style={{background:`${C.green}22`,borderRadius:10,padding:"6px 12px",fontSize:12,color:C.green,fontWeight:800}}>✅ Owned</div>
              ) : (
                <button onClick={()=>handleBuy(item)} disabled={loading} style={{background:`linear-gradient(135deg,${C.purple},${C.cyan})`,border:"none",borderRadius:12,padding:"8px 16px",fontSize:13,fontWeight:900,color:"white",cursor:"pointer",boxShadow:`0 3px 12px ${C.purple}44`,width:"100%"}}>
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
      <div style={{background:`linear-gradient(135deg,${C.yellow},${C.orange})`,padding:"16px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <BackBtn onClick={onBack} color="white"/>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:900,color:"white"}}>🏅 Achievements</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginTop:2}}>{earnedCount} / {BADGES.length} badges unlocked</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{background:"rgba(255,255,255,0.2)",borderRadius:20,height:10,overflow:"hidden"}}>
          <div style={{width:`${(earnedCount/BADGES.length)*100}%`,height:"100%",background:"white",borderRadius:20,transition:"width 1s ease"}}/>
        </div>
      </div>
      {/* Category tabs */}
      <div style={{display:"flex",gap:0,background:C.card,borderBottom:`1.5px solid ${C.border||"#ece8ff"}`,overflowX:"auto"}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setBadgeTab(c)} style={{flex:"0 0 auto",background:"none",border:"none",padding:"10px 14px",fontSize:12,fontWeight:800,color:badgeTab===c?C.orange:C.dim,cursor:"pointer",borderBottom:`3px solid ${badgeTab===c?C.orange:"transparent"}`,whiteSpace:"nowrap"}}>{catLabels[c]}</button>
        ))}
      </div>
      {/* Badge grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,padding:"14px 14px"}}>
        {shown.map(badge=>{
          const isEarned = earned.includes(badge.id);
          return (
            <div key={badge.id} style={{background:C.card,border:`2px solid ${isEarned?C.yellow+"55":C.border||"#ece8ff"}`,borderRadius:18,padding:"14px 8px",textAlign:"center",boxShadow:isEarned?`0 3px 14px ${C.yellow}33`:"none",opacity:isEarned?1:0.45,transition:"all 0.3s"}}>
              <div style={{fontSize:34,marginBottom:6,filter:isEarned?"none":"grayscale(1)"}}>{badge.icon}</div>
              <div style={{fontSize:11,fontWeight:900,color:isEarned?textColor():C.dim,marginBottom:3,lineHeight:1.2}}>{badge.name}</div>
              <div style={{fontSize:9,color:C.dim,lineHeight:1.3}}>{badge.desc}</div>
              {isEarned && <div style={{marginTop:6,background:`${C.yellow}22`,borderRadius:8,padding:"2px 6px",fontSize:9,color:C.yellow,fontWeight:800}}>EARNED ✓</div>}
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
      <div style={{background:`linear-gradient(135deg,${C.purple},${C.pink})`,padding:"14px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <BackBtn onClick={onBack} color="white"/>
          <div style={{fontSize:18,fontWeight:900,color:"white"}}>🎭 My Character</div>
        </div>
      </div>
      {/* Stage — preview selected char */}
      <div style={{textAlign:"center",padding:"20px 0 12px",background:isDark()?`${C.purple}14`:`linear-gradient(180deg,${C.purple}0a,transparent)`}}>
        <div style={{fontSize:88,marginBottom:8,animation:"floatUp 2.5s ease-in-out infinite",filter:`drop-shadow(0 8px 20px ${C.purple}44)`}}>{sel}</div>
        <div style={{fontSize:18,fontWeight:900,color:textColor()}}>{child.name}</div>
        <div style={{fontSize:12,color:C.dim,marginTop:2}}>Level {child.level||1} · {HERO_CHARS.find(c=>c.emoji===sel)?.name||"Explorer"}</div>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:8,justifyContent:"center",padding:"0 16px 12px"}}>
        {[["heroes","🧒 Heroes"],["pets","🐾 Pets (soon)"],["skins","🎨 Skins (soon)"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{background:tab===k?`linear-gradient(135deg,${C.purple},${C.pink})`:"transparent",border:`2px solid ${tab===k?C.purple:C.border||"#ece8ff"}`,borderRadius:50,padding:"7px 16px",fontSize:12,fontWeight:800,color:tab===k?"white":C.dim,cursor:"pointer",transition:"all 0.2s"}}>{l}</button>
        ))}
      </div>
      {/* Character grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,padding:"0 14px 14px"}}>
        {HERO_CHARS.map(c=>{
          const unlocked = isUnlocked(c);
          const isSelected = sel===c.emoji;
          return (
            <div key={c.emoji} onClick={()=>unlocked&&setSel(c.emoji)} style={{background:isSelected?`linear-gradient(135deg,${C.purple}22,${C.pink}14)`:C.card,border:`2.5px solid ${isSelected?C.purple:C.border||"#ece8ff"}`,borderRadius:18,padding:"12px 6px",textAlign:"center",cursor:unlocked?"pointer":"not-allowed",opacity:unlocked?1:0.4,transition:"all 0.2s",boxShadow:isSelected?`0 4px 16px ${C.purple}44`:"none",transform:isSelected?"scale(1.06)":"none"}}>
              <div style={{fontSize:32,marginBottom:4}}>{c.emoji}</div>
              <div style={{fontSize:10,fontWeight:900,color:isSelected?C.purple:textColor()}}>{c.name}</div>
              {!unlocked && <div style={{fontSize:9,color:C.dim,marginTop:2}}>🔒 Shop</div>}
              {isSelected && <div style={{width:6,height:6,borderRadius:"50%",background:C.purple,margin:"4px auto 0"}}/>}
            </div>
          );
        })}
      </div>
      {msg&&<div style={{margin:"0 16px 10px",padding:"8px 14px",borderRadius:12,background:`${C.green}18`,color:C.green,fontSize:13,fontWeight:700}}>{msg}</div>}
      <div style={{padding:"0 16px"}}>
        <Btn color={C.purple} onClick={handleSave}>✨ Save Character</Btn>
      </div>
    </div>
  );
}

