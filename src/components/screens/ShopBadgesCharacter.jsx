// src/components/screens/ShopBadgesCharacter.jsx — ShopScreen, BadgesScreen, CharacterScreen
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, BackBtn, Card } from '../ui/primitives.jsx';
import { SHOP_ITEMS, BADGES, CONVERSION, EARN_GUIDE } from '../../constants/gameData.js';
import { updateC, THEMES } from '../../constants/themes.js';
import { getHintsRemaining, addExtraHints, HINT_FREE_DAILY } from '../../lib/hints.js';

// ── Currency conversion helper ────────────────────────────────────
function ConvertModal({ child, setChild, totalStars, onClose }) {
  const [mode, setMode] = useState('coins'); // 'coins' | 'gems'
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');
  const coins = child.coins||0;
  const gems  = child.gems||0;

  const convert = async () => {
    const n = parseInt(amount)||0;
    if (mode === 'coins') {
      if (n < CONVERSION.coinsPerStar) { setMsg(`Min ${CONVERSION.coinsPerStar} coins`); return; }
      if (n > coins) { setMsg('Not enough coins'); return; }
      const starsGained = Math.floor(n / CONVERSION.coinsPerStar);
      const coinsSpent  = starsGained * CONVERSION.coinsPerStar;
      const xpGained    = starsGained * 20;
      await db.addXP(child.id, xpGained, 0, !!(child.is_school_student));
      const newCoins = coins - coinsSpent;
      await db.updateChildFields(child.id, { coins: newCoins });
      setChild(c=>({...c, coins: newCoins, xp:(c.xp||0)+xpGained}));
      setMsg(`✅ Converted ${coinsSpent} coins → ${starsGained} stars!`);
      SFX.correct();
    } else {
      if (n < 1) { setMsg('Min 1 gem'); return; }
      if (n > gems) { setMsg('Not enough gems'); return; }
      const starsGained = n * CONVERSION.gemsToStars;
      const xpGained    = starsGained * 20;
      await db.addXP(child.id, xpGained, 0, !!(child.is_school_student));
      const newGems = gems - n;
      await db.updateChildFields(child.id, { gems: newGems });
      setChild(c=>({...c, gems: newGems, xp:(c.xp||0)+xpGained}));
      setMsg(`✅ Converted ${n} gems → ${starsGained} stars!`);
      SFX.correct();
    }
    setAmount('');
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"white",borderRadius:24,padding:"24px 20px",width:"100%",maxWidth:320}}>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#5B4FE8",marginBottom:14,textAlign:"center"}}>💱 Convert to Stars</div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {[{k:'coins',e:"🪙",l:"Coins",v:coins},{k:'gems',e:"💎",l:"Gems",v:gems}].map(m=>(
            <button key={m.k} onClick={()=>{setMode(m.k);setMsg('');setAmount('');}}
              style={{flex:1,background:mode===m.k?"#5B4FE815":"#F5F3FF",border:`1.5px solid ${mode===m.k?"#5B4FE8":"#E8E6F0"}`,borderRadius:14,padding:"10px 6px",cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:22}}>{m.e}</div>
              <div style={{fontSize:12,fontWeight:900,color:"#1A1040"}}>{m.v} {m.l}</div>
            </button>
          ))}
        </div>
        <div style={{background:"#F0ECFF",borderRadius:14,padding:"10px 14px",marginBottom:12,fontSize:12,color:"#5B4FE8",fontWeight:700,textAlign:"center"}}>
          {mode==='coins' ? `${CONVERSION.coinsPerStar} Coins = 1 ⭐ Star` : `1 💎 Gem = ${CONVERSION.gemsToStars} ⭐ Stars`}
        </div>
        <input
          type="number"
          value={amount}
          onChange={e=>setAmount(e.target.value)}
          placeholder={mode==='coins'?"Enter coins amount":"Enter gems amount"}
          style={{width:"100%",background:"#F5F3FF",border:"1.5px solid #5B4FE820",borderRadius:12,padding:"10px 14px",fontSize:14,color:"#1A1040",fontFamily:"'Nunito',sans-serif",marginBottom:8,boxSizing:"border-box"}}
        />
        {amount && parseInt(amount)>0 && (
          <div style={{textAlign:"center",fontSize:13,color:"#2ECC9A",fontWeight:800,marginBottom:8}}>
            = {mode==='coins' ? Math.floor(parseInt(amount)/CONVERSION.coinsPerStar) : (parseInt(amount)||0)*CONVERSION.gemsToStars} ⭐ stars
          </div>
        )}
        {msg && <div style={{textAlign:"center",fontSize:13,fontWeight:700,color:msg.startsWith("✅")?"#2ECC9A":"#FF6B6B",marginBottom:8}}>{msg}</div>}
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:"#F5F3FF",border:"1.5px solid #E8E6F0",borderRadius:12,padding:"11px",fontSize:13,fontWeight:700,color:"#9890C4",cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Cancel</button>
          <button onClick={convert} style={{flex:1,background:"linear-gradient(135deg,#5B4FE8,#9B59F5)",border:"none",borderRadius:12,padding:"11px",fontSize:13,fontWeight:900,color:"white",cursor:"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 4px 0 #5B4FE8CC"}}>Convert ✨</button>
        </div>
      </div>
    </div>
  );
}

// ── Earn Guide modal ───────────────────────────────────────────────
function EarnModal({ onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto"}}>
      <div style={{background:"white",borderRadius:24,padding:"22px 18px",width:"100%",maxWidth:340,maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#5B4FE8",marginBottom:14,textAlign:"center"}}>💰 How to Earn</div>
        <div style={{marginBottom:14}}>
          <div style={{fontWeight:900,color:"#4BBDF5",fontSize:13,marginBottom:8}}>🪙 Coins</div>
          {EARN_GUIDE.coins.map((e,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:6,padding:"7px 10px",background:"#4BBDF508",borderRadius:10,border:"1px solid #4BBDF520"}}>
              <span style={{fontSize:12,color:"#1A1040",fontWeight:600}}>{e.action}</span>
              <span style={{fontSize:12,color:"#4BBDF5",fontWeight:900,flexShrink:0,marginLeft:8}}>{e.reward}</span>
            </div>
          ))}
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:900,color:"#9B59F5",fontSize:13,marginBottom:8}}>💎 Gems</div>
          {EARN_GUIDE.gems.map((e,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:6,padding:"7px 10px",background:"#9B59F508",borderRadius:10,border:"1px solid #9B59F520"}}>
              <span style={{fontSize:12,color:"#1A1040",fontWeight:600}}>{e.action}</span>
              <span style={{fontSize:12,color:"#9B59F5",fontWeight:900,flexShrink:0,marginLeft:8}}>{e.reward}</span>
            </div>
          ))}
        </div>
        <div style={{background:"#FFC84712",border:"1.5px solid #FFC84730",borderRadius:12,padding:"10px 12px",marginBottom:14,fontSize:11,color:"#5A4E8A",lineHeight:1.6}}>
          <strong>⭐ Stars</strong> = XP ÷ 20 &nbsp;|&nbsp; <strong>🪙 10 Coins</strong> = 1 Star &nbsp;|&nbsp; <strong>💎 1 Gem</strong> = 5 Stars
        </div>
        <button onClick={onClose} style={{width:"100%",background:"linear-gradient(135deg,#5B4FE8,#9B59F5)",border:"none",borderRadius:14,padding:"13px",fontSize:14,fontWeight:900,color:"white",cursor:"pointer",fontFamily:"'Fredoka One',cursive"}}>Got it! 🚀</button>
      </div>
    </div>
  );
}

// ── Main ShopScreen ────────────────────────────────────────────────
export function ShopScreen({ child, setChild, onBack }) {
  const [tab,         setTab]         = useState("hints");
  const [msg,         setMsg]         = useState("");
  const [loading,     setLoading]     = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [showEarn,    setShowEarn]    = useState(false);
  const owned      = Array.isArray(child.shop_items) ? child.shop_items : [];
  const totalStars = Math.floor((child.xp||0)/20);

  const { totalLeft: hintsLeft } = getHintsRemaining(child.id);

  const handleBuy = async (item) => {
    // Hint packs are consumable — never "owned", re-purchasable
    const isHintPack = item.cat === "hints";
    if (!isHintPack && owned.includes(item.id)) { setMsg("Already owned!"); return; }
    const costType = item.gems?"gems":item.coins?"coins":"stars";
    const amount   = item.gems||item.coins||item.stars;
    const bal      = costType==="gems"?(child.gems||0):costType==="coins"?(child.coins||0):totalStars;
    if (bal < amount) { setMsg(`Not enough ${costType}! Tap 💰 to see how to earn more.`); return; }
    setLoading(true); setMsg("");
    if (isHintPack) {
      // Deduct currency and add hints locally — no "owned" tracking
      const updates = {};
      if (costType==="coins")  updates.coins = (child.coins||0) - amount;
      if (costType==="gems")   updates.gems  = (child.gems||0)  - amount;
      if (costType==="stars") {
        const xpCost = amount * 20;
        updates.xp = Math.max(0, (child.xp||0) - xpCost);
      }
      await db.updateChildFields(child.id, updates);
      setChild(c=>({...c,...updates}));
      addExtraHints(child.id, item.hintCount);
      setMsg(`✅ +${item.hintCount} hints added for today! 💡`);
      SFX.correct();
    } else {
      const result = await db.purchaseShopItem(child.id, item.id, costType, amount);
      if (result.ok) {
        const updates = { shop_items:[...owned,item.id] };
        if (costType==="gems")   updates.gems  = (child.gems||0)  - amount;
        if (costType==="coins")  updates.coins = (child.coins||0) - amount;
        if (costType==="stars") {
          const xpCost = amount * 20;
          updates.xp = Math.max(0, (child.xp||0) - xpCost);
        }
        setChild(c=>({...c,...updates}));
        setMsg("✅ Purchased! "+item.icon);
        SFX.correct();
      } else {
        setMsg(result.error||"Failed");
      }
    }
    setLoading(false);
  };

  const TABS = [
    {k:"hints",   l:"💡 Hints"},
    {k:"powerup", l:"⚡ Power-ups"},
    {k:"avatar",  l:"🎭 Avatars"},
    {k:"theme",   l:"🎨 Themes"},
    {k:"nametag", l:"🏷️ Titles"},
    {k:"sticker", l:"🃏 Stickers"},
  ];
  const items = SHOP_ITEMS.filter(i=>i.cat===tab);

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Baloo 2','Nunito',sans-serif",paddingBottom:20}}>
      {showConvert && <ConvertModal child={child} setChild={setChild} totalStars={totalStars} onClose={()=>setShowConvert(false)}/>}
      {showEarn    && <EarnModal onClose={()=>setShowEarn(false)}/>}

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#2ECC9A,#4BBDF5)",padding:"16px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <BackBtn onClick={onBack} color="white"/>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:"white",flex:1}}>🛒 Reward Shop</div>
          <button onClick={()=>setShowEarn(true)} style={{background:"rgba(255,255,255,0.25)",border:"1px solid rgba(255,255,255,0.4)",borderRadius:20,padding:"6px 12px",color:"white",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>💰 Earn</button>
        </div>
        {/* Currency balances */}
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {[
            {e:"⭐",v:totalStars,l:"Stars"},
            {e:"💎",v:child.gems||0,l:"Gems"},
            {e:"🪙",v:child.coins||0,l:"Coins"},
            {e:"💡",v:hintsLeft,l:"Hints Today"},
          ].map((c,i)=>(
            <div key={i} style={{flex:1,background:"rgba(255,255,255,0.22)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:14,padding:"8px 4px",textAlign:"center"}}>
              <div style={{fontSize:18}}>{c.e}</div>
              <div style={{fontSize:15,fontWeight:900,color:"white"}}>{c.v}</div>
              <div style={{fontSize:8,color:"rgba(255,255,255,0.8)",fontWeight:700,lineHeight:1.2}}>{c.l}</div>
            </div>
          ))}
        </div>
        {/* Convert button */}
        <button onClick={()=>setShowConvert(true)} style={{width:"100%",background:"rgba(255,255,255,0.18)",border:"1.5px solid rgba(255,255,255,0.35)",borderRadius:14,padding:"8px",color:"white",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          💱 Convert Coins/Gems → Stars
        </button>
      </div>

      {/* Tab bar — scrollable */}
      <div style={{display:"flex",overflowX:"auto",gap:6,padding:"10px 14px",background:"white",borderBottom:"1px solid rgba(91,79,232,0.08)"}}>
        {TABS.map(t=>(
          <button key={t.k} onClick={()=>{setTab(t.k);setMsg("");}} style={{flexShrink:0,background:tab===t.k?"#5B4FE8":"#F0ECFF",border:"none",borderRadius:20,padding:"7px 14px",fontSize:11,fontWeight:900,color:tab===t.k?"white":"#9890C4",cursor:"pointer",transition:"all 0.2s",boxShadow:tab===t.k?"0 2px 8px #5B4FE844":"none"}}>{t.l}</button>
        ))}
      </div>

      {/* Hint info banner */}
      {tab==="hints" && (
        <div style={{margin:"10px 16px 0",background:"#FFC84712",border:"1.5px solid #FFC84730",borderRadius:16,padding:"12px 14px"}}>
          <div style={{fontWeight:900,color:"#FFC847",fontSize:13,marginBottom:4}}>💡 Daily Hint Limit: {HINT_FREE_DAILY} free hints/day</div>
          <div style={{fontSize:11,color:"#5A4E8A",lineHeight:1.6}}>You have <strong>{hintsLeft}</strong> hint(s) remaining today. Extra packs are valid for today only — unused hints vanish at midnight 🌙</div>
        </div>
      )}

      {msg && <div style={{margin:"10px 16px 0",padding:"8px 14px",borderRadius:12,background:msg.startsWith("✅")?`${C.green}18`:`${C.red}18`,color:msg.startsWith("✅")?C.green:C.red,fontSize:13,fontWeight:700}}>{msg}</div>}

      {/* Items grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,padding:"14px 16px"}}>
        {items.map(item=>{
          const isHintPack     = item.cat==="hints";
          const isOwned        = !isHintPack && owned.includes(item.id);
          const lockedByLevel  = (child.level||1) < item.lvl;
          const costType       = item.gems?"gems":item.coins?"coins":"stars";
          const costAmt        = item.gems||item.coins||item.stars;
          const costIcon       = item.gems?"💎":item.coins?"🪙":"⭐";
          return (
            <div key={item.id} style={{background:"white",border:`1.5px solid ${isOwned?"#2ECC9A44":"rgba(91,79,232,0.12)"}`,borderRadius:20,padding:"16px 12px",textAlign:"center",boxShadow:isOwned?"0 4px 16px #2ECC9A18, inset 0 1px 0 rgba(255,255,255,0.8)":"0 4px 16px rgba(91,79,232,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",opacity:lockedByLevel?0.5:1}}>
              <div style={{fontSize:40,marginBottom:6,filter:lockedByLevel?"grayscale(1)":"none"}}>{item.icon}</div>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:900,color:"#1A1040",marginBottom:3}}>{item.name}</div>
              <div style={{fontSize:10,color:"#9890C4",marginBottom:8,lineHeight:1.4}}>{item.desc}</div>
              {isHintPack && <div style={{fontSize:9,color:"#FF6B6B",fontWeight:800,marginBottom:6}}>⏰ Today only</div>}
              {lockedByLevel ? (
                <div style={{background:"rgba(91,79,232,0.08)",borderRadius:999,padding:"5px 10px",fontSize:11,color:"#9890C4",fontWeight:700}}>🔒 Level {item.lvl}</div>
              ) : isOwned ? (
                <div style={{background:"#2ECC9A18",border:"1.5px solid #2ECC9A40",borderRadius:999,padding:"5px 10px",fontSize:11,color:"#2ECC9A",fontWeight:800,display:"inline-block"}}>✅ Owned</div>
              ) : (
                <button onClick={()=>handleBuy(item)} disabled={loading} style={{background:"linear-gradient(135deg,#5B4FE8,#9B59F5)",border:"none",borderRadius:12,padding:"7px 14px",fontSize:13,fontWeight:900,color:"white",cursor:"pointer",boxShadow:"0 4px 0 #5B4FE8CC, 0 6px 16px #5B4FE835, inset 0 1px 0 rgba(255,255,255,0.35)",width:"100%"}}>
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
        <div style={{background:"rgba(255,255,255,0.25)",borderRadius:999,height:10,overflow:"hidden"}}>
          <div style={{width:`${(earnedCount/BADGES.length)*100}%`,height:"100%",background:"linear-gradient(90deg,#FFC847,#FF6B6B)",borderRadius:999,boxShadow:"0 0 8px #FF6B6B55",transition:"width 1s ease"}}/>
        </div>
      </div>
      <div style={{display:"flex",gap:0,background:"white",borderBottom:"1px solid rgba(91,79,232,0.1)",overflowX:"auto",padding:"0 8px"}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setBadgeTab(c)} style={{flex:"0 0 auto",background:"none",border:"none",padding:"11px 14px",fontSize:12,fontWeight:800,color:badgeTab===c?"#FFC847":"#9890C4",cursor:"pointer",borderBottom:`3px solid ${badgeTab===c?"#FFC847":"transparent"}`,whiteSpace:"nowrap",transition:"all 0.2s"}}>{catLabels[c]}</button>
        ))}
      </div>
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
    {emoji:"🧝",name:"Elf",       free:false, item:"avatar_elf"},
    {emoji:"👑",name:"King",      free:false, item:"avatar_king"},
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
      <div style={{margin:"16px",background:"white",borderRadius:28,padding:"24px 16px",textAlign:"center",boxShadow:"0 8px 30px #FF5FA028, 0 2px 6px #FF5FA018, inset 0 1px 0 rgba(255,255,255,0.8)"}}>
        <div style={{fontSize:72,marginBottom:8,animation:"mmFloat 2.5s ease-in-out infinite",filter:"drop-shadow(0 8px 20px #FF5FA044)"}}>{sel}</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#1A1040"}}>{child.name}</div>
        <div style={{fontSize:12,color:"#9890C4",marginTop:2}}>Level {child.level||1} · {HERO_CHARS.find(c=>c.emoji===sel)?.name||"Explorer"}</div>
      </div>
      <div style={{display:"flex",background:"#F0ECFF",borderRadius:20,padding:3,margin:"0 16px 12px"}}>
        {[["heroes","🧒 Heroes"],["pets","🐾 Pets"],["skins","🎨 Skins"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,background:tab===k?"white":"transparent",border:"none",borderRadius:16,padding:"9px 6px",fontSize:11,fontWeight:tab===k?900:700,color:tab===k?"#9B59F5":"#9890C4",cursor:"pointer",boxShadow:tab===k?"0 2px 8px rgba(91,79,232,0.2)":"none",transition:"all 0.2s"}}>{l}</button>
        ))}
      </div>
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
