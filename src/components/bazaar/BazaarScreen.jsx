// src/components/bazaar/BazaarScreen.jsx — Fully revamped Bazaar UI
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, text2Color, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { Btn, Inp, BackBtn, Card } from '../ui/primitives.jsx';
import {
  BAZAAR_MARKETS, BAZAAR_PASSPORT, BAZAAR_FESTIVALS,
  BAZAAR_AVATAR_ITEMS, BAZAAR_ACHIEVEMENTS,
  BAZAAR_CUSTOMER_EMOJIS, BAZAAR_REACTIONS_CORRECT, BAZAAR_REACTIONS_WRONG,
  fetchBazaarQuestions,
  getBazaarReputation, updateBazaarReputation,
  getTodayDailyChallenge, isDailyChallengeCompletedToday, markDailyChallengeComplete,
  getDailyStreak, getBazaarTotalCoins, addBazaarCoins,
  getWeeklyLeague, updateWeeklyLeague,
  getActiveFestival, getBazaarOutfit, setBazaarOutfit,
  getBazaarPurchased, addBazaarPurchase, isItemOwned,
  getBazaarStats, updateBazaarStats, setStatMax,
  getEarnedAchievements, checkAndAwardAchievements,
  generateChallengeId, saveChallengeResult, getChallengeResult,
} from '../../constants/bazaarData.js';
import { BADGES } from '../../constants/gameData.js';
import { shuffle } from '../../lib/db.js';
import { Starfield } from '../layout/layout.jsx';

// ─── Fallback question generator ─────────────────────────────────────
function getSpeedRoundQuestions(market) {
  return Array.from({ length: 12 }, (_, i) => {
    const item = market.items[i % market.items.length];
    const qty = 1 + (i % 4);
    const ans = item.price * qty;
    return {
      scenario: `${item.emoji} ${qty} × ${item.name}`,
      question: `= ₹?`,
      hint: `${qty}×₹${item.price}`,
      options: [String(ans - 10), String(ans), String(ans + 10), String(ans + 20)].sort(() => Math.random() - 0.5),
      correct_answer: String(ans),
      customer_name: '',
      customer_emoji: BAZAAR_CUSTOMER_EMOJIS[i % BAZAAR_CUSTOMER_EMOJIS.length],
    };
  });
}

function getBazaarFallback(market, role) {
  return Array.from({ length: 8 }, (_, i) => {
    const item = market.items[i % market.items.length];
    const qty = 1 + (i % 3);
    const ans = item.price * qty;
    const change = 500 - ans;
    const scenario = role === 'buyer'
      ? `You want to buy ${qty} ${item.name} (${item.unit}).\nPrice: ₹${item.price} each.`
      : `A customer wants ${qty} ${item.name}.\nYou have ₹${500} in the till.`;
    const question = role === 'buyer'
      ? `How much will you pay in total?`
      : `How much change do you return?`;
    const correct = role === 'buyer' ? String(ans) : String(change);
    const wrong1 = role === 'buyer' ? String(ans + 10) : String(change + 10);
    const wrong2 = role === 'buyer' ? String(ans - 10) : String(change - 10);
    const wrong3 = role === 'buyer' ? String(ans * 2) : String(change + 5);
    return {
      scenario, question,
      hint: role === 'buyer' ? `${qty}×₹${item.price}` : `₹500 − ₹${ans}`,
      options: [correct, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5),
      correct_answer: correct,
      customer_name: BAZAAR_CUSTOMER_EMOJIS[i % 5] ? `Customer ${i + 1}` : '',
      customer_emoji: BAZAAR_CUSTOMER_EMOJIS[i % BAZAAR_CUSTOMER_EMOJIS.length],
      isBoss: i === 7,
    };
  });
}

// ─── Shared UI Components ─────────────────────────────────────────────

function CoinShower({ active }) {
  if (!active) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none' }}>
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${5 + (i * 5.2) % 88}%`, top: '-24px',
          fontSize: i % 4 === 0 ? 26 : 18,
          animation: `confettiFall ${0.8 + (i % 4) * 0.25}s ease-in ${(i % 7) * 0.07}s forwards`,
        }}>
          {i % 5 === 0 ? '🪙' : i % 5 === 1 ? '⭐' : i % 5 === 2 ? '✨' : i % 5 === 3 ? '💰' : '🎉'}
        </div>
      ))}
    </div>
  );
}

function StarRating({ stars, size = 13, showNum = true }) {
  const full = Math.floor(stars), half = stars - full >= 0.5, empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      {Array.from({ length: full }).map((_, i) => <span key={`f${i}`} style={{ fontSize: size }}>⭐</span>)}
      {half && <span style={{ fontSize: size, filter: 'grayscale(0.5)' }}>⭐</span>}
      {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} style={{ fontSize: size, filter: 'grayscale(1) opacity(0.25)' }}>⭐</span>)}
      {showNum && <span style={{ fontSize: size - 2, fontWeight: 900, color: '#fbbf24', marginLeft: 2 }}>{stars}</span>}
    </span>
  );
}

function KeeperFace({ market, reputation, animate, size = 50 }) {
  const face = market.mood[reputation.stars >= 4 ? 0 : reputation.stars >= 2.5 ? 1 : 2];
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: `${market.color}22`, border: `2.5px solid ${market.color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.52, flexShrink: 0,
      animation: animate === 'happy' ? 'correctBounce 0.6s ease' : animate === 'sad' ? 'wrongWiggle 0.5s ease' : 'floatUp 3s ease-in-out infinite',
      position: 'relative',
    }}>
      {market.keeperEmoji}
      <div style={{ position: 'absolute', top: -8, right: -8, fontSize: size * 0.3 }}>{face}</div>
    </div>
  );
}

function CustomerQueue({ total, current, customerEmojis }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center', padding: '5px 0' }}>
      {Array.from({ length: Math.min(total, 8) }).map((_, i) => (
        <div key={i} style={{ position: 'relative' }}>
          <div style={{
            fontSize: 20,
            filter: i < current ? 'grayscale(1) opacity(0.3)' : i === current ? 'none' : 'opacity(0.65)',
            transform: i === current ? 'scale(1.22)' : 'scale(1)',
            transition: 'all 0.3s',
          }}>{customerEmojis[i % customerEmojis.length]}</div>
          {i === current && <div style={{ position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: '50%', background: C.cyan, boxShadow: `0 0 5px ${C.cyan}` }} />}
          {i < current && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✅</div>}
        </div>
      ))}
    </div>
  );
}

function LeagueBadge({ coins }) {
  const rank = coins >= 500 ? '👑 Bazaar King' : coins >= 300 ? '🏆 Champion' : coins >= 150 ? '⭐ Star Trader' : coins >= 50 ? '🥈 Rising Star' : '🌱 Newcomer';
  const col = coins >= 500 ? '#fbbf24' : coins >= 300 ? '#f97316' : coins >= 150 ? '#a855f7' : coins >= 50 ? '#22c55e' : '#6b7280';
  return (
    <div style={{
      background: `${col}18`, border: `1.5px solid ${col}44`, borderRadius: 12,
      padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      <span style={{ fontSize: 13 }}>{rank.split(' ')[0]}</span>
      <span style={{ fontSize: 10, fontWeight: 800, color: col }}>{rank.split(' ').slice(1).join(' ')}</span>
    </div>
  );
}

function BazaarAvatar({ outfit, size = 80 }) {
  const hat = BAZAAR_AVATAR_ITEMS.hat.find(i => i.id === outfit.hat) || BAZAAR_AVATAR_ITEMS.hat[0];
  const acc = BAZAAR_AVATAR_ITEMS.accessory.find(i => i.id === outfit.accessory) || BAZAAR_AVATAR_ITEMS.accessory[0];
  const sign = BAZAAR_AVATAR_ITEMS.shop_sign.find(i => i.id === outfit.shop_sign) || BAZAAR_AVATAR_ITEMS.shop_sign[0];
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {sign.emoji && <div style={{ position: 'absolute', top: -6, left: -6, fontSize: size * 0.22, zIndex: 2 }}>{sign.emoji}</div>}
      {hat.emoji && <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', fontSize: size * 0.3, zIndex: 2 }}>{hat.emoji}</div>}
      <div style={{
        width: size * 0.72, height: size * 0.72, borderRadius: size * 0.2,
        background: `linear-gradient(135deg,${C.purple}33,${C.cyan}22)`,
        border: `2.5px solid ${C.purple}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42,
      }}>🧑‍🛒</div>
      {acc.emoji && <div style={{ position: 'absolute', bottom: -4, right: -4, fontSize: size * 0.22, zIndex: 2 }}>{acc.emoji}</div>}
    </div>
  );
}

// ─── Achievement Toast ────────────────────────────────────────────────
function AchievementToast({ achievements, onClose }) {
  if (!achievements?.length) return null;
  const a = achievements[0];
  return (
    <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 500, animation: 'slideDown 0.5s ease', maxWidth: 340, width: 'calc(100% - 32px)' }}>
      <div style={{ background: `linear-gradient(135deg,${a.color}33,${a.color}18)`, border: `2.5px solid ${a.color}66`, borderRadius: 20, padding: '14px 16px', boxShadow: `0 8px 30px ${a.color}33`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 38, animation: 'coinBounce 0.8s ease', flexShrink: 0 }}>{a.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: a.color, fontWeight: 900, letterSpacing: 1, fontFamily: "'Orbitron',sans-serif" }}>🏅 BADGE UNLOCKED!</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: a.color, marginTop: 2 }}>{a.name}</div>
          <div style={{ fontSize: 11, color: isDark() ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', marginTop: 2 }}>{a.desc}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: a.color, flexShrink: 0 }}>✕</button>
      </div>
      {achievements.length > 1 && <div style={{ textAlign: 'center', fontSize: 11, color: C.dim, marginTop: 4 }}>+{achievements.length - 1} more badge{achievements.length > 2 ? 's' : ''} earned!</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  CUSTOMISE — Character Customisation Screen
// ═══════════════════════════════════════════════════════════════════════
function BazaarCustomise({ child, onClose }) {
  const [outfit, setOutfit] = useState(() => getBazaarOutfit(child.id));
  const [tab, setTab] = useState('hat');
  const [coins, setCoins] = useState(getBazaarTotalCoins(child.id));
  const [bought, setBought] = useState(null);
  const tabs = [{ id: 'hat', label: 'Hat 🎩' }, { id: 'outfit', label: 'Outfit 👕' }, { id: 'accessory', label: 'Accessory 💍' }, { id: 'shop_sign', label: 'Sign 🪧' }];

  function handleBuy(item) {
    if (isItemOwned(child.id, item.id)) { applyItem(item.id); return; }
    if (coins < item.price) return;
    const newCoins = coins - item.price;
    localStorage.setItem(`bz_coins_${child.id}`, String(newCoins));
    setCoins(newCoins);
    addBazaarPurchase(child.id, item.id);
    applyItem(item.id);
    setBought(item.name);
    setTimeout(() => setBought(null), 1500);
  }
  function applyItem(itemId) {
    const newOutfit = { ...outfit, [tab]: itemId };
    setOutfit(newOutfit);
    setBazaarOutfit(child.id, newOutfit);
  }

  const currentItems = BAZAAR_AVATAR_ITEMS[tab] || [];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: C.bg, borderRadius: '24px 24px 0 0', padding: '20px 16px 36px', maxHeight: '90vh', overflowY: 'auto', animation: 'slideUp 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 26 }}>🎨</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.purple, fontWeight: 900, letterSpacing: 2, fontFamily: "'Orbitron',sans-serif" }}>BAZAAR MATHS</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: textColor() }}>Customise My Trader</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#fbbf24' }}>🪙 {coins}</div>
            <button onClick={onClose} style={{ background: 'none', border: `1px solid ${C.dim}33`, borderRadius: 8, padding: '3px 10px', color: C.dim, cursor: 'pointer', fontSize: 12, marginTop: 3 }}>✕</button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ background: `linear-gradient(135deg,${C.purple}22,${C.cyan}14)`, border: `2px solid ${C.purple}44`, borderRadius: 24, padding: '20px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <BazaarAvatar outfit={outfit} size={90} />
          </div>
        </div>
        {bought && (
          <div style={{ background: '#22c55e18', border: '1.5px solid #22c55e55', borderRadius: 12, padding: '8px 14px', textAlign: 'center', marginBottom: 10, animation: 'popIn 0.3s ease' }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#22c55e' }}>✅ {bought} equipped!</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${isDark() ? 'rgba(255,255,255,0.08)' : C.border || '#ece8ff'}`, marginBottom: 12 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '9px 4px 7px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: `3px solid ${tab === t.id ? C.purple : 'transparent'}`, fontSize: 10, fontWeight: 800, color: tab === t.id ? C.purple : C.dim, transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {currentItems.map((item, i) => {
            const owned = isItemOwned(child.id, item.id);
            const selected = outfit[tab] === item.id;
            const canAfford = coins >= item.price;
            return (
              <button key={item.id} onClick={() => handleBuy(item)}
                style={{ background: selected ? `linear-gradient(135deg,${C.purple}28,${C.cyan}14)` : owned ? `${C.green}10` : `${C.dim}08`, border: `2px solid ${selected ? C.purple : owned ? C.green + '55' : C.dim + '22'}`, borderRadius: 16, padding: '13px 8px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, opacity: !owned && !canAfford ? 0.5 : 1, transition: 'all 0.2s', animation: `popIn 0.3s ease ${i * 0.04}s both` }}>
                <div style={{ fontSize: item.emoji ? 30 : 20, minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.emoji || '✕'}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: selected ? C.purple : textColor(), lineHeight: 1.3 }}>{item.name}</div>
                {item.price === 0 ? <div style={{ fontSize: 9, color: C.green, fontWeight: 700 }}>FREE</div>
                  : owned ? <div style={{ fontSize: 9, color: C.green, fontWeight: 700 }}>✅ Owned</div>
                    : <div style={{ fontSize: 10, fontWeight: 900, color: canAfford ? '#fbbf24' : C.dim }}>🪙{item.price}</div>}
                {selected && <div style={{ fontSize: 9, color: C.purple, fontWeight: 900 }}>● ACTIVE</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  BADGES WALL
// ═══════════════════════════════════════════════════════════════════════
function BazaarBadgesWall({ child, onClose }) {
  const earned = getEarnedAchievements(child.id);
  const stats = getBazaarStats(child.id);
  const pct = Math.round((earned.length / BAZAAR_ACHIEVEMENTS.length) * 100);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: C.bg, borderRadius: '24px 24px 0 0', padding: '20px 16px 40px', maxHeight: '92vh', overflowY: 'auto', animation: 'slideUp 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 26 }}>🏅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.yellow, fontWeight: 900, letterSpacing: 2, fontFamily: "'Orbitron',sans-serif" }}>BAZAAR MATHS</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: textColor() }}>Badges Wall</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: `1px solid ${C.dim}33`, borderRadius: 8, padding: '5px 12px', color: C.dim, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>✕</button>
        </div>
        <div style={{ background: C.card, border: `1.5px solid ${C.yellow}44`, borderRadius: 14, padding: '10px 14px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
            <span style={{ fontWeight: 800, color: textColor() }}>Badges Earned</span>
            <span style={{ color: C.yellow, fontWeight: 900 }}>{earned.length}/{BAZAAR_ACHIEVEMENTS.length}</span>
          </div>
          <div style={{ background: isDark() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', borderRadius: 20, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${C.yellow},${C.orange})`, borderRadius: 20, transition: 'width 0.8s ease', boxShadow: `0 0 8px ${C.yellow}66` }} />
          </div>
          <div style={{ fontSize: 10, color: C.dim, marginTop: 4, textAlign: 'center' }}>{pct}% complete</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
          {[
            { e: '✅', v: stats.totalCorrect, l: 'Correct', c: C.green },
            { e: '🔥', v: stats.bestStreak, l: 'Best Streak', c: '#f97316' },
            { e: '😤', v: stats.bossesBeaten, l: 'Bosses', c: '#a855f7' },
            { e: '⚡', v: stats.speedRounds, l: 'Speed Runs', c: '#ef4444' },
            { e: '📅', v: stats.dailyStreak, l: 'Day Streak', c: C.cyan },
            { e: '🗺️', v: stats.marketsPlayed, l: 'Markets', c: '#fbbf24' },
          ].map((s, i) => (
            <div key={i} style={{ background: `${s.c}10`, border: `1px solid ${s.c}33`, borderRadius: 12, padding: '8px 5px', textAlign: 'center' }}>
              <div style={{ fontSize: 16 }}>{s.e}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 9, color: C.dim }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: C.dim, fontWeight: 900, fontFamily: "'Orbitron',sans-serif", letterSpacing: 1, marginBottom: 10 }}>ALL BADGES ({BAZAAR_ACHIEVEMENTS.length})</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {BAZAAR_ACHIEVEMENTS.map((a, i) => {
            const isEarned = earned.includes(a.id);
            return (
              <div key={a.id} style={{ background: isEarned ? `${a.color}16` : isDark() ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1.5px solid ${isEarned ? a.color + '55' : a.color + '18'}`, borderRadius: 16, padding: '12px 8px', textAlign: 'center', opacity: isEarned ? 1 : 0.5, transition: 'all 0.2s', animation: isEarned ? `popIn 0.4s ease ${(i % 6) * 0.05}s both` : 'none' }}>
                <div style={{ fontSize: 28, marginBottom: 4, filter: isEarned ? 'none' : 'grayscale(1) opacity(0.35)' }}>{a.emoji}</div>
                <div style={{ fontSize: 10, fontWeight: 900, color: isEarned ? a.color : C.dim, lineHeight: 1.3 }}>{a.name}</div>
                {isEarned ? <div style={{ fontSize: 8, color: C.dim, marginTop: 3, lineHeight: 1.4 }}>{a.desc}</div>
                  : <div style={{ fontSize: 9, color: C.dim, marginTop: 3 }}>🔒 Locked</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  PASSPORT
// ═══════════════════════════════════════════════════════════════════════
function BazaarPassport({ child, onClose, onMarket }) {
  const totalCoins = getBazaarTotalCoins(child.id);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: C.bg, borderRadius: '24px 24px 0 0', padding: '20px 16px 36px', maxHeight: '92vh', overflowY: 'auto', animation: 'slideUp 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 28 }}>🗺️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.cyan, fontWeight: 900, letterSpacing: 2, fontFamily: "'Orbitron',sans-serif" }}>BAZAAR MATHS</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: textColor() }}>Bazaar Passport</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fbbf24' }}>🪙 {totalCoins}</div>
            <LeagueBadge coins={totalCoins} />
          </div>
        </div>
        {(() => {
          const next = BAZAAR_PASSPORT.find(c => c.unlockCoins > totalCoins);
          if (!next) return <div style={{ textAlign: 'center', padding: '8px', fontSize: 13, color: C.green, fontWeight: 800 }}>🏆 All cities unlocked!</div>;
          const prev = [...BAZAAR_PASSPORT].reverse().find(c => c.unlockCoins <= totalCoins);
          const base = prev?.unlockCoins || 0, pct = Math.min(100, Math.round(((totalCoins - base) / (next.unlockCoins - base)) * 100));
          return (
            <div style={{ background: C.card, border: `1.5px solid ${next.color}44`, borderRadius: 14, padding: '10px 14px', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                <span style={{ fontWeight: 800, color: textColor() }}>Next: {next.emoji} {next.name}</span>
                <span style={{ color: next.color, fontWeight: 900 }}>{totalCoins}/{next.unlockCoins} 🪙</span>
              </div>
              <div style={{ background: isDark() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', borderRadius: 20, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${next.color},${next.color}aa)`, borderRadius: 20, transition: 'width 0.8s ease', boxShadow: `0 0 8px ${next.color}66` }} />
              </div>
            </div>
          );
        })()}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {BAZAAR_PASSPORT.map((city, i) => {
            const unlocked = totalCoins >= city.unlockCoins, market = BAZAAR_MARKETS.find(m => m.id === city.marketId), rep = market ? getBazaarReputation(market.id) : null, cs = !!city.comingSoon;
            return (
              <button key={city.id} onClick={() => unlocked && market && !cs && onMarket(market)} disabled={!unlocked || cs}
                style={{ background: unlocked ? `linear-gradient(135deg,${city.color}18,${city.color}08)` : isDark() ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `2px solid ${unlocked ? city.color + '55' : city.color + '22'}`, borderRadius: 18, padding: '13px 14px', cursor: unlocked && !cs ? 'pointer' : 'not-allowed', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, opacity: unlocked ? 1 : 0.55, animation: `slideUp 0.35s ease ${i * 0.05}s both` }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: unlocked ? `${city.color}22` : isDark() ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)', border: `2px solid ${unlocked ? city.color + '44' : city.color + '22'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  {unlocked ? city.emoji : '🔒'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: unlocked ? textColor() : C.dim }}>{city.name}</span>
                    {cs && <span style={{ fontSize: 9, background: '#fbbf2422', border: '1px solid #fbbf2444', borderRadius: 8, padding: '2px 7px', color: '#fbbf24', fontWeight: 800 }}>SOON</span>}
                  </div>
                  <div style={{ fontSize: 11, color: C.dim }}>{unlocked ? (market ? `${market.name} · ${market.keeper}` : city.desc) : city.desc}</div>
                  {unlocked && rep && <div style={{ marginTop: 3 }}><StarRating stars={rep.stars} size={11} /></div>}
                </div>
                {!unlocked && <div style={{ textAlign: 'center', flexShrink: 0 }}><div style={{ fontSize: 13, fontWeight: 900, color: city.color }}>🪙{city.unlockCoins}</div><div style={{ fontSize: 9, color: C.dim }}>needed</div></div>}
                {unlocked && !cs && <div style={{ fontSize: 20, color: city.color }}>›</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  WEEKLY LEAGUE
// ═══════════════════════════════════════════════════════════════════════
function WeeklyLeague({ child, onClose }) {
  const wk = getWeeklyLeague(child.id);
  const tiers = [{ label: '🌱 Newcomer', min: 0, max: 49, col: '#6b7280' }, { label: '🥈 Rising Star', min: 50, max: 149, col: '#22c55e' }, { label: '⭐ Star Trader', min: 150, max: 299, col: '#a855f7' }, { label: '🏆 Champion', min: 300, max: 499, col: '#f97316' }, { label: '👑 Bazaar King', min: 500, max: Infinity, col: '#fbbf24' }];
  const curTier = tiers.find(t => wk.coins >= t.min && wk.coins <= t.max) || tiers[0], nextTier = tiers[tiers.indexOf(curTier) + 1];
  const weekLabel = (() => { const d = new Date(), mon = new Date(d); mon.setDate(d.getDate() - d.getDay() + 1); const sun = new Date(mon); sun.setDate(mon.getDate() + 6); return `${mon.getDate()}–${sun.getDate()} ${mon.toLocaleString('default', { month: 'short' })}`; })();
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: C.bg, borderRadius: '24px 24px 0 0', padding: '20px 16px 36px', animation: 'slideUp 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 28 }}>🏆</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: C.yellow, fontWeight: 900, letterSpacing: 2, fontFamily: "'Orbitron',sans-serif" }}>THIS WEEK · {weekLabel}</div><div style={{ fontSize: 19, fontWeight: 900, color: textColor() }}>Weekly League</div></div>
          <button onClick={onClose} style={{ background: 'none', border: `1px solid ${C.dim}33`, borderRadius: 10, padding: '5px 11px', color: C.dim, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>✕</button>
        </div>
        <div style={{ background: `linear-gradient(135deg,${curTier.col}22,${curTier.col}0a)`, border: `2.5px solid ${curTier.col}55`, borderRadius: 20, padding: '18px 16px', marginBottom: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 46, marginBottom: 4, animation: 'floatUp 2s ease-in-out infinite' }}>{curTier.label.split(' ')[0]}</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: curTier.col }}>{curTier.label.split(' ').slice(1).join(' ')}</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fbbf24', marginTop: 6 }}>🪙 {wk.coins}</div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{wk.sessions} session{wk.sessions !== 1 ? 's' : ''} this week</div>
          {nextTier && <div style={{ marginTop: 10 }}><div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>{nextTier.min - wk.coins} more coins → {nextTier.label}</div><div style={{ background: isDark() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', borderRadius: 20, height: 6, overflow: 'hidden' }}><div style={{ width: `${Math.min(100, Math.round((wk.coins / nextTier.min) * 100))}%`, height: '100%', background: `linear-gradient(90deg,${curTier.col},${nextTier.col})`, borderRadius: 20 }} /></div></div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {tiers.map((t, i) => {
            const active = t.label === curTier.label;
            return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 13px', background: active ? `${t.col}16` : isDark() ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1.5px solid ${active ? t.col + '55' : t.col + '22'}`, borderRadius: 13 }}>
              <span style={{ fontSize: 20, width: 26 }}>{t.label.split(' ')[0]}</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 800, color: active ? t.col : textColor() }}>{t.label.split(' ').slice(1).join(' ')}</div><div style={{ fontSize: 9, color: C.dim }}>{t.max === Infinity ? `${t.min}+ coins` : `${t.min}–${t.max} coins`}</div></div>
              {active && <div style={{ background: t.col, borderRadius: 9, padding: '2px 8px', fontSize: 9, color: 'white', fontWeight: 900 }}>YOU</div>}
              {wk.coins > t.max && <div style={{ fontSize: 15 }}>✅</div>}
            </div>;
          })}
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: C.dim, textAlign: 'center' }}>League resets every Monday. Top rank = special title! 👑</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  SPEED ROUND
// ═══════════════════════════════════════════════════════════════════════
function SpeedRound({ market, child, onBack, onDone }) {
  const TOTAL_TIME = 60;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [questions] = useState(() => getSpeedRoundQuestions(market));
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showCoins, setShowCoins] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); onDone({ score: scoreRef.current, coins: coinsRef.current, total: qIdx, role: 'speed', market, isSpeed: true }); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const q = questions[qIdx % questions.length];
  const shuffled = useRef([]);
  useEffect(() => { shuffled.current = [...(q?.options || [])].sort(() => Math.random() - 0.5); }, [qIdx]);

  function handleAnswer(opt) {
    if (feedback || frozen) return;
    const correct = opt.trim() === String(q.correct_answer).trim();
    if (correct) {
      SFX.correct();
      const earned = 1 + Math.floor(streak / 2);
      scoreRef.current += 1; coinsRef.current += earned;
      setScore(s => s + 1); setCoins(c => c + earned); setStreak(s => s + 1);
      setFeedback('correct'); setShowCoins(true);
      setTimeLeft(t => Math.min(TOTAL_TIME, t + 3));
      setTimeout(() => { setShowCoins(false); setFeedback(null); setQIdx(i => i + 1); }, 600);
    } else {
      SFX.wrong(); setStreak(0); setFeedback('wrong'); setFrozen(true);
      setTimeout(() => { setFeedback(null); setFrozen(false); }, 2000);
    }
  }

  const pct = (timeLeft / TOTAL_TIME) * 100, urgentColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? C.yellow : C.green;
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Baloo 2','Nunito',sans-serif", paddingBottom: 20, position: 'relative', overflow: 'hidden' }}>
      <CoinShower active={showCoins} />
      {frozen && <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(59,130,246,0.12)', pointerEvents: 'none' }} />}
      <div style={{ background: `linear-gradient(135deg,${market.color}22,${market.color}08)`, borderBottom: `2px solid ${market.color}44`, padding: '13px 15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <BackBtn onClick={onBack} color={market.color} />
          <div style={{ flex: 1, fontSize: 11, fontWeight: 900, color: market.color }}>⚡ SPEED ROUND · {market.emoji} {market.name}</div>
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ background: `${market.color}20`, borderRadius: 9, padding: '3px 8px', fontSize: 12, fontWeight: 900, color: market.color }}>{score} ✅</div>
            {streak > 1 && <div style={{ background: '#fb923c20', borderRadius: 9, padding: '3px 8px', fontSize: 12, fontWeight: 900, color: '#fb923c' }}>🔥{streak}</div>}
          </div>
        </div>
        <div style={{ background: isDark() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderRadius: 20, height: 10, overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${urgentColor},${urgentColor}bb)`, borderRadius: 20, transition: 'width 1s linear', boxShadow: `0 0 8px ${urgentColor}88` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
          <span style={{ color: urgentColor, fontWeight: 900, fontFamily: "'Orbitron',sans-serif", fontSize: 14 }}>⏱ {timeLeft}s</span>
          <span style={{ color: C.dim }}>+3s correct · freeze 2s wrong</span>
          <span style={{ color: '#fbbf24', fontWeight: 900 }}>🪙{coins}</span>
        </div>
      </div>
      <div style={{ padding: '16px 15px' }}>
        {frozen && <div style={{ background: '#3b82f622', border: '2px solid #3b82f655', borderRadius: 14, padding: '10px', marginBottom: 12, textAlign: 'center', animation: 'popIn 0.3s ease' }}><span style={{ fontSize: 15, fontWeight: 900, color: '#3b82f6' }}>❄️ Frozen for 2 seconds!</span></div>}
        <div style={{ background: `${market.color}14`, border: `2px solid ${market.color}44`, borderRadius: 20, padding: '20px 16px', marginBottom: 14, textAlign: 'center', animation: 'slideUp 0.25s ease' }}>
          <div style={{ fontSize: 30, marginBottom: 6 }}>{q.customer_emoji}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: textColor(), lineHeight: 1.3 }}>{q.scenario}</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: market.color, marginTop: 4 }}>{q.question}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {(shuffled.current.length ? shuffled.current : q.options).map((opt, i) => {
            const isAns = String(opt) === String(q.correct_answer), wasWrong = feedback === 'wrong' && !isAns;
            return <button key={i} onClick={() => handleAnswer(opt)} disabled={!!feedback || frozen}
              style={{ background: isAns && feedback === 'correct' ? `linear-gradient(135deg,#22c55e,#16a34a)` : wasWrong ? `${C.red}20` : `${market.color}0d`, border: isAns && feedback === 'correct' ? '2.5px solid #22c55e' : wasWrong ? `2.5px solid ${C.red}` : `2px solid ${market.color}33`, borderRadius: 18, padding: '16px 8px', cursor: (feedback || frozen) ? 'not-allowed' : 'pointer', textAlign: 'center', fontSize: 18, fontWeight: 900, color: isAns && feedback === 'correct' ? 'white' : textColor(), transition: 'all 0.15s', animation: `popIn 0.25s ease ${i * 0.04}s both` }}>
              {opt}
            </button>;
          })}
        </div>
        {feedback && <div style={{ textAlign: 'center', marginTop: 12, padding: '10px', borderRadius: 14, background: feedback === 'correct' ? '#22c55e14' : '#ef444414', animation: 'popIn 0.3s ease' }}><span style={{ fontSize: 16, fontWeight: 900, color: feedback === 'correct' ? '#22c55e' : C.red }}>{feedback === 'correct' ? '⚡ +3 seconds bonus!' : '❄️ 2 second freeze!'}</span></div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  CHALLENGE MODE
// ═══════════════════════════════════════════════════════════════════════
function ChallengeMode({ market, child, onBack, onDone }) {
  const [phase, setPhase] = useState('intro');
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [shuffled, setShuffled] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [challengeId] = useState(generateChallengeId);

  useEffect(() => {
    fetchBazaarQuestions(market.id, 'buyer', false).then(data => {
      setQuestions((data || getBazaarFallback(market, 'buyer')).slice(0, 5));
    });
  }, [market.id]);

  useEffect(() => {
    if (questions.length > 0 && questions[qIdx]) setShuffled([...(questions[qIdx].options || [])].sort(() => Math.random() - 0.5));
    setFeedback(null);
  }, [qIdx, questions]);

  function handleAnswer(opt) {
    if (feedback) return;
    const correct = opt.trim() === String(questions[qIdx].correct_answer).trim();
    if (correct) {
      SFX.correct(); setScore(s => s + 1); setFeedback('correct');
      setTimeout(() => {
        if (qIdx + 1 >= questions.length) { saveChallengeResult(challengeId, score + 1, questions.length, child.name); setPhase('share'); }
        else setQIdx(i => i + 1);
      }, 1200);
    } else { SFX.wrong(); setFeedback('wrong'); setTimeout(() => setFeedback(null), 1400); }
  }

  const shareUrl = `${window.location.origin}${window.location.pathname}?bazaar_challenge=${challengeId}&market=${market.id}`;
  const shareText = `🛒 I scored ${score}/${questions.length} in Bazaar Maths! Can you beat me?\nTry: ${shareUrl}`;

  if (phase === 'intro') return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Baloo 2','Nunito',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
      <Starfield n={15} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 12, animation: 'floatUp 2s ease-in-out infinite' }}>📤</div>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 18, fontWeight: 900, color: C.cyan, marginBottom: 8 }}>CHALLENGE A FRIEND!</div>
        <div style={{ background: C.card, border: `2px solid ${C.cyan}44`, borderRadius: 22, padding: '18px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: textColor(), lineHeight: 1.7 }}>Play 5 questions in <b style={{ color: market.color }}>{market.name}</b>.<br />Share your score with a friend.<br />See if they can beat you! 🏆</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => setPhase('playing')} style={{ background: `linear-gradient(135deg,${C.cyan},${C.purple})`, border: 'none', borderRadius: 18, padding: '15px', color: 'white', fontSize: 15, fontWeight: 900, cursor: 'pointer', boxShadow: `0 4px 18px ${C.cyan}44` }}>🎯 Play My Round!</button>
          <button onClick={onBack} style={{ background: 'transparent', border: `1.5px solid ${C.dim}33`, borderRadius: 18, padding: '12px', color: C.dim, fontSize: 13, cursor: 'pointer' }}>← Go Back</button>
        </div>
      </div>
    </div>
  );

  if (phase === 'share') return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Baloo 2','Nunito',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
      <CoinShower active={true} />
      <Starfield n={15} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 380 }}>
        <div style={{ background: `linear-gradient(135deg,${market.color}22,${market.color}08)`, border: `2.5px solid ${market.color}55`, borderRadius: 26, padding: '28px 22px', textAlign: 'center', boxShadow: `0 8px 40px ${market.color}22`, marginBottom: 14, animation: 'popIn 0.5s ease' }}>
          <div style={{ fontSize: 64, marginBottom: 8, animation: 'coinBounce 0.8s ease' }}>{score === questions.length ? '🏆' : score >= 3 ? '🎉' : '👏'}</div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 17, fontWeight: 900, color: market.color, marginBottom: 4 }}>YOUR SCORE: {score}/{questions.length}</div>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 16 }}>Challenge ID: <b style={{ color: C.cyan, fontFamily: "'Orbitron',sans-serif" }}>{challengeId}</b></div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            {[1, 2, 3].map(s => <span key={s} style={{ fontSize: 34, filter: s <= (score === 5 ? 3 : score >= 3 ? 2 : 1) ? 'none' : 'grayscale(1) opacity(0.2)' }}>⭐</span>)}
          </div>
          <div style={{ fontSize: 13, color: textColor(), lineHeight: 1.6 }}>Now share this challenge with a friend and see if they can beat <b style={{ color: market.color }}>{score}/{questions.length}</b>!</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => { if (navigator.share) { navigator.share({ title: 'Bazaar Maths Challenge!', text: shareText }).catch(() => {}); } else { navigator.clipboard.writeText(shareText); alert('Link copied to clipboard!'); } }} style={{ background: `linear-gradient(135deg,${C.green},${C.cyan})`, border: 'none', borderRadius: 18, padding: '15px', color: 'white', fontSize: 14, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>📲</span> Share Challenge Link
          </button>
          <div style={{ background: C.card, border: `1.5px solid ${C.cyan}33`, borderRadius: 16, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>🔑</span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: C.dim }}>Challenge Code</div><div style={{ fontSize: 16, fontWeight: 900, color: C.cyan, fontFamily: "'Orbitron',sans-serif" }}>{challengeId}</div></div>
            <button onClick={() => navigator.clipboard.writeText(challengeId).then(() => alert('Code copied!'))} style={{ background: `${C.cyan}20`, border: `1px solid ${C.cyan}44`, borderRadius: 9, padding: '5px 10px', color: C.cyan, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Copy</button>
          </div>
          <button onClick={() => onDone({ score, total: questions.length, market, role: 'challenge' })} style={{ background: `linear-gradient(135deg,${market.color},${market.color}aa)`, border: 'none', borderRadius: 18, padding: '13px', color: 'white', fontSize: 13, fontWeight: 900, cursor: 'pointer' }}>✅ Done</button>
          <button onClick={onBack} style={{ background: 'transparent', border: `1.5px solid ${C.dim}30`, borderRadius: 18, padding: '11px', color: C.dim, fontSize: 12, cursor: 'pointer' }}>← Back to Hub</button>
        </div>
      </div>
    </div>
  );

  if (!questions.length) return <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 36, height: 36, border: `3px solid ${market.color}44`, borderTopColor: market.color, borderRadius: '50%', animation: 'spinR 0.7s linear infinite' }} /></div>;
  const q = questions[qIdx], total = questions.length, pct = Math.round((qIdx / total) * 100);
  const isCorrect = feedback === 'correct', isWrong = feedback === 'wrong';
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Baloo 2','Nunito',sans-serif", paddingBottom: 28, position: 'relative', overflow: 'hidden' }}>
      {feedback && <div style={{ position: 'fixed', inset: 0, zIndex: 49, background: isCorrect ? 'rgba(34,197,94,0.09)' : 'rgba(239,68,68,0.09)', pointerEvents: 'none' }} />}
      <div style={{ background: `linear-gradient(135deg,${C.cyan}22,${C.purple}0a)`, borderBottom: `2px solid ${C.cyan}44`, padding: '13px 15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <BackBtn onClick={onBack} color={C.cyan} />
          <div style={{ flex: 1, fontSize: 11, fontWeight: 900, color: C.cyan }}>📤 Challenge · {market.emoji} {market.name}</div>
          <div style={{ background: `${C.cyan}20`, borderRadius: 9, padding: '3px 8px', fontSize: 12, fontWeight: 900, color: C.cyan }}>{score}/{total} ✅</div>
        </div>
        <div style={{ background: isDark() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', borderRadius: 20, height: 7, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${C.cyan},${C.purple})`, borderRadius: 20, transition: 'width 0.5s ease' }} />
        </div>
      </div>
      <div style={{ padding: '12px 15px' }}>
        <div style={{ background: `${market.color}12`, border: `2px solid ${market.color}44`, borderRadius: 19, padding: '12px 12px', marginBottom: 10, animation: 'slideUp 0.35s ease' }}>
          {q.customer_name && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><span style={{ fontSize: 16 }}>{q.customer_emoji || '🧑'}</span><span style={{ fontSize: 11, color: market.color, fontWeight: 900 }}>{q.customer_name}</span></div>}
          <div style={{ fontSize: 13, fontWeight: 700, color: textColor(), lineHeight: 1.65 }}>{q.scenario}</div>
        </div>
        <div style={{ background: C.card, border: `2px solid ${C.cyan}44`, borderRadius: 17, padding: '12px 14px', marginBottom: 11, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: textColor() }}>❓ {q.question}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {shuffled.map((opt, i) => {
            const isAns = String(opt).trim() === String(q.correct_answer).trim(), wasWrong = isWrong && !isAns;
            return (
              <button key={i} onClick={() => handleAnswer(opt)} disabled={!!feedback}
                style={{ background: isAns && feedback ? `linear-gradient(135deg,#22c55e,#16a34a)` : wasWrong ? `${C.red}1e` : `${C.cyan}0d`, border: isAns && feedback ? '2.5px solid #22c55e' : wasWrong ? `2.5px solid ${C.red}` : `2px solid ${C.cyan}30`, borderRadius: 17, padding: '14px 8px', cursor: feedback ? 'not-allowed' : 'pointer', textAlign: 'center', fontSize: 14, fontWeight: 900, color: isAns && feedback ? 'white' : textColor(), transition: 'all 0.18s', animation: `popIn 0.3s ease ${i * 0.06}s both` }}>
                {opt}{isAns && feedback && <div style={{ fontSize: 12, marginTop: 2 }}>✅</div>}
              </button>
            );
          })}
        </div>
        {feedback && (
          <div style={{ textAlign: 'center', marginTop: 11, padding: '10px', borderRadius: 14, background: isCorrect ? '#22c55e12' : '#ef444412', animation: 'popIn 0.35s ease' }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: isCorrect ? '#22c55e' : C.red }}>{isCorrect ? BAZAAR_REACTIONS_CORRECT[Math.floor(Math.random() * BAZAAR_REACTIONS_CORRECT.length)] : BAZAAR_REACTIONS_WRONG[Math.floor(Math.random() * BAZAAR_REACTIONS_WRONG.length)]}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  REVAMPED: BazaarHub — stunning new design
// ═══════════════════════════════════════════════════════════════════════
function BazaarHub({ child, onBack, onMarket, onDaily, onSpeed, onChallenge }) {
  const [showPassport, setShowPassport] = useState(false);
  const [showLeague, setShowLeague] = useState(false);
  const [showCustomise, setShowCustomise] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const todayChallenge = getTodayDailyChallenge();
  const dailyDone = isDailyChallengeCompletedToday(child.id);
  const totalCoins = getBazaarTotalCoins(child.id);
  const weeklyCoins = getWeeklyLeague(child.id).coins;
  const festival = getActiveFestival();
  const outfit = getBazaarOutfit(child.id);
  const earned = getEarnedAchievements(child.id);
  const stats = getBazaarStats(child.id);
  const dailyStreak = getDailyStreak(child.id);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Baloo 2','Nunito',sans-serif", paddingBottom: 60, position: 'relative', overflowX: 'hidden' }}>
      {showPassport && <BazaarPassport child={child} onClose={() => setShowPassport(false)} onMarket={m => { setShowPassport(false); onMarket(m); }} />}
      {showLeague && <WeeklyLeague child={child} onClose={() => setShowLeague(false)} />}
      {showCustomise && <BazaarCustomise child={child} onClose={() => setShowCustomise(false)} />}
      {showBadges && <BazaarBadgesWall child={child} onClose={() => setShowBadges(false)} />}
      <Starfield n={18} />

      {/* ══ HERO HEADER ══════════════════════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 2, overflow: 'hidden' }}>
        {/* Decorative top band with gradient + pattern */}
        <div style={{
          background: `linear-gradient(135deg, #f97316 0%, #ec4899 40%, #a855f7 80%, #06b6d4 100%)`,
          padding: '0 0 28px 0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -40, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 20, left: '45%', width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

          {/* Nav row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 15px 10px' }}>
            <BackBtn onClick={onBack} color="rgba(255,255,255,0.85)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 900, letterSpacing: 3, fontFamily: "'Orbitron',sans-serif" }}>REAL-LIFE MATHS</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>🛒 Bazaar Maths</div>
            </div>
            {/* Coins pill */}
            <button onClick={() => setShowLeague(true)} style={{ background: 'rgba(0,0,0,0.25)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 14, padding: '6px 11px', cursor: 'pointer', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#fde047' }}>🪙 {totalCoins}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>COINS</div>
            </button>
            {/* Avatar */}
            <button onClick={() => setShowCustomise(true)} style={{ background: 'rgba(0,0,0,0.2)', border: '2px solid rgba(255,255,255,0.35)', borderRadius: 14, padding: '4px', cursor: 'pointer' }}>
              <BazaarAvatar outfit={outfit} size={38} />
            </button>
          </div>

          {/* Hero content */}
          <div style={{ padding: '0 15px', display: 'flex', alignItems: 'flex-end', gap: 14 }}>
            <div style={{ flex: 1 }}>
              {/* Greeting */}
              <div style={{ fontSize: 22, fontWeight: 900, color: 'white', marginBottom: 4, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                Namaste, {child.name?.split(' ')[0] || 'Trader'}! 🙏
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, marginBottom: 10 }}>
                Run your stall, buy smart, earn coins!
              </div>
              {/* Streak chip */}
              {dailyStreak > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.28)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '4px 11px', backdropFilter: 'blur(6px)' }}>
                  <span style={{ fontSize: 14 }}>🔥</span>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#fde047' }}>{dailyStreak}-day streak!</span>
                </div>
              )}
            </div>
            {/* Big mascot */}
            <div style={{ fontSize: 70, animation: 'floatUp 2.5s ease-in-out infinite', filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.35))', flexShrink: 0 }}>
              🧑‍🛒
            </div>
          </div>
        </div>

        {/* Curved bottom clip */}
        <div style={{ height: 28, background: C.bg, borderRadius: '50% 50% 0 0 / 100% 100% 0 0', marginTop: -28, position: 'relative', zIndex: 1 }} />
      </div>

      {/* ══ BODY ═════════════════════════════════════════════════════ */}
      <div style={{ padding: '0 14px', position: 'relative', zIndex: 2 }}>

        {/* Festival banner */}
        {festival && (
          <div style={{ background: `linear-gradient(135deg,${festival.color}28,${festival.color}10)`, border: `2px solid ${festival.color}66`, borderRadius: 18, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, animation: 'heartbeat 2s ease-in-out infinite' }}>
            <span style={{ fontSize: 28 }}>{festival.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: festival.color }}>{festival.name}</div>
              <div style={{ fontSize: 10, color: C.dim }}>{festival.desc}</div>
            </div>
            <div style={{ background: festival.color, borderRadius: 9, padding: '3px 9px', fontSize: 12, fontWeight: 900, color: 'white' }}>{festival.bonus}× 🪙</div>
          </div>
        )}

        {/* ── Quick stat pills ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { icon: '🗺️', label: 'Passport', action: () => setShowPassport(true), color: C.cyan, sub: `${BAZAAR_PASSPORT.filter(c => totalCoins >= c.unlockCoins && !c.comingSoon).length}/${BAZAAR_PASSPORT.filter(c => !c.comingSoon).length}` },
            { icon: '🏆', label: 'League', action: () => setShowLeague(true), color: '#fbbf24', sub: `🪙${weeklyCoins}` },
            { icon: '🏅', label: 'Badges', action: () => setShowBadges(true), color: '#f97316', sub: `${earned.length}/${BAZAAR_ACHIEVEMENTS.length}` },
            { icon: '🎨', label: 'Style', action: () => setShowCustomise(true), color: C.purple, sub: 'My Trader' },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action}
              style={{ background: isDark() ? `${btn.color}18` : `${btn.color}12`, border: `1.5px solid ${btn.color}44`, borderRadius: 16, padding: '10px 4px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all 0.18s' }}>
              <div style={{ fontSize: 22 }}>{btn.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 900, color: textColor(), letterSpacing: 0.3 }}>{btn.label}</div>
              <div style={{ fontSize: 9, color: btn.color, fontWeight: 800 }}>{btn.sub}</div>
            </button>
          ))}
        </div>

        {/* ── TODAY'S DAILY CHALLENGE ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ width: 3, height: 16, borderRadius: 2, background: `linear-gradient(${todayChallenge.color},${todayChallenge.color}88)` }} />
            <span style={{ fontSize: 10, color: C.dim, fontWeight: 900, fontFamily: "'Orbitron',sans-serif", letterSpacing: 1.5 }}>TODAY'S CHALLENGE</span>
          </div>
          <button onClick={() => !dailyDone && onDaily(todayChallenge)} disabled={dailyDone}
            style={{
              width: '100%',
              background: dailyDone ? 'rgba(0,0,0,0.03)' : '#FF6B6B10',
              border: `2px solid ${dailyDone ? 'rgba(91,79,232,0.12)' : '#FF6B6B44'}`,
              borderRadius: 20, padding: '14px 16px', cursor: dailyDone ? 'not-allowed' : 'pointer',
              textAlign: 'left', display: 'flex', alignItems: 'center', gap: 13, position: 'relative', overflow: 'hidden',
              transition: 'all 0.2s',
            }}>
            {/* Shimmer on active */}
            {!dailyDone && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg,transparent,${todayChallenge.color}08,transparent)`, animation: 'shimmer 2.5s ease-in-out infinite', pointerEvents: 'none' }} />}
            <div style={{
              width: 54, height: 54, borderRadius: 16,
              background: dailyDone ? `${C.dim}18` : `linear-gradient(135deg,${todayChallenge.color}33,${todayChallenge.color}15)`,
              border: `2px solid ${dailyDone ? C.dim + '22' : todayChallenge.color + '44'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, flexShrink: 0,
              filter: dailyDone ? 'grayscale(1) opacity(0.5)' : 'none',
              animation: dailyDone ? 'none' : 'floatUp 2s ease-in-out infinite',
            }}>{todayChallenge.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: dailyDone ? C.dim : textColor() }}>{todayChallenge.title}</span>
                {!dailyDone && <span style={{ fontSize: 9, background: `${todayChallenge.color}22`, border: `1px solid ${todayChallenge.color}44`, borderRadius: 999, padding: '2px 9px', color: todayChallenge.color, fontWeight: 800, animation: 'heartbeat 1.8s ease-in-out infinite' }}>NEW</span>}
                {dailyDone && <span style={{ fontSize: 9, background: '#22c55e22', border: '1px solid #22c55e44', borderRadius: 8, padding: '2px 7px', color: '#22c55e', fontWeight: 800 }}>✅ DONE</span>}
              </div>
              <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.5 }}>{todayChallenge.desc}</div>
              {!dailyDone && (
                <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                  <span style={{ background: '#fbbf2420', border: '1px solid #fbbf2440', borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 900, color: '#fbbf24' }}>+{todayChallenge.bonus}× coins</span>
                  <span style={{ background: '#22c55e20', border: '1px solid #22c55e40', borderRadius: 8, padding: '2px 8px', fontSize: 9, fontWeight: 700, color: '#22c55e' }}>🏅 Badge</span>
                </div>
              )}
              {dailyDone && <div style={{ fontSize: 10, color: C.dim, marginTop: 3 }}>Come back tomorrow for a fresh challenge!</div>}
            </div>
          </button>
        </div>

        {/* ── CHOOSE YOUR MARKET ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: `linear-gradient(#f97316,#f9731688)` }} />
          <span style={{ fontSize: 10, color: C.dim, fontWeight: 900, fontFamily: "'Orbitron',sans-serif", letterSpacing: 1.5 }}>CHOOSE YOUR MARKET</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 14 }}>
          {BAZAAR_MARKETS.map((m, i) => {
            const rep = getBazaarReputation(m.id);
            return (
              <button key={m.id} onClick={() => !m.isPaid && onMarket(m)}
                style={{
                  background: 'white',
                  border: `1.5px solid ${m.color}${m.isPaid ? '22' : '30'}`,
                  borderRadius: 22, padding: '16px 16px 16px 20px', cursor: m.isPaid ? 'not-allowed' : 'pointer',
                  textAlign: 'left', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14,
                  opacity: m.isPaid ? 0.55 : 1,
                  animation: `slideUp 0.4s ease ${i * 0.08}s both`,
                  position: 'relative', overflow: 'hidden',
                  transition: 'all 0.2s',
                  boxShadow: m.isPaid ? 'none' : `0 4px 16px ${m.color}22, 0 2px 6px ${m.color}14`,
                }}>
                {/* Left accent bar */}
                {!m.isPaid && <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: `linear-gradient(180deg,${m.color},${m.color}66)`, borderRadius: '22px 0 0 22px' }} />}
                {m.isPaid && <div style={{ position: 'absolute', top: 8, right: 8, background: '#fbbf24', borderRadius: 8, padding: '2px 7px', fontSize: 8, fontWeight: 900, color: '#000', fontFamily: "'Orbitron',sans-serif" }}>🔒 SOON</div>}
                {/* Faint emoji watermark */}
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${m.color}18`, border: `1.5px solid ${m.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{m.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#1A1040', lineHeight: 1.2, marginBottom: 2 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: '#9890C4', lineHeight: 1.4 }}>{m.desc}</div>
                  {!m.isPaid && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                      <span style={{ fontSize: 12 }}>{m.keeperEmoji}</span>
                      <span style={{ fontSize: 10, color: m.color, fontWeight: 800 }}>{m.keeper}</span>
                      <StarRating stars={rep.stars} size={10} />
                    </div>
                  )}
                </div>
                {!m.isPaid && <div style={{ width: 32, height: 32, borderRadius: 999, background: `${m.color}15`, border: `1.5px solid ${m.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, fontSize: 16, flexShrink: 0 }}>›</div>}
              </button>
            );
          })}
        </div>

        {/* ── SPEED & CHALLENGE ROW ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(#ef4444,#ef444488)' }} />
          <span style={{ fontSize: 10, color: C.dim, fontWeight: 900, fontFamily: "'Orbitron',sans-serif", letterSpacing: 1.5 }}>BONUS MODES</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 16 }}>
          <button onClick={() => onSpeed(BAZAAR_MARKETS.find(m => !m.isPaid))}
            style={{ background: 'linear-gradient(145deg,#ef444418,#f9731610)', border: '2px solid #ef444444', borderRadius: 20, padding: '15px 13px', cursor: 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#ef4444,#f9731655)', borderRadius: '20px 20px 0 0' }} />
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#ef4444,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 8, boxShadow: '0 3px 10px #ef444444' }}>⚡</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: textColor(), marginBottom: 2 }}>Speed Round</div>
            <div style={{ fontSize: 10, color: C.dim }}>60 secs · fast fire!</div>
          </button>
          <button onClick={() => onChallenge(BAZAAR_MARKETS.find(m => !m.isPaid))}
            style={{ background: `linear-gradient(145deg,${C.cyan}18,${C.purple}08)`, border: `2px solid ${C.cyan}44`, borderRadius: 20, padding: '15px 13px', cursor: 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${C.cyan},${C.purple}55)`, borderRadius: '20px 20px 0 0' }} />
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${C.cyan},${C.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 8, boxShadow: `0 3px 10px ${C.cyan}44` }}>📤</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: textColor(), marginBottom: 2 }}>Challenge!</div>
            <div style={{ fontSize: 10, color: C.dim }}>Beat a friend!</div>
          </button>
        </div>

        {/* ── WHAT YOU LEARN ── */}
        <div style={{ background: isDark() ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `1.5px solid ${C.cyan}22`, borderRadius: 18, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>📚</span>
            <span style={{ fontSize: 10, color: C.cyan, fontWeight: 900, fontFamily: "'Orbitron',sans-serif", letterSpacing: 1 }}>WHAT YOU LEARN</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['➕ Addition', '➖ Change', '✖️ Multiply', '💰 Money', '⚖️ Weight', '📊 Compare', '💡 Budget', '🔢 Estimation'].map(t => (
              <div key={t} style={{ background: `${C.purple}10`, border: `1px solid ${C.purple}22`, borderRadius: 20, padding: '4px 10px', fontSize: 10, color: C.purple, fontWeight: 700 }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  MARKET SELECT (role picker)
// ═══════════════════════════════════════════════════════════════════════
function BazaarMarket({ market, child, onBack, onRole, isDaily, dailyChallenge }) {
  const [role, setRole] = useState(null);
  const rep = getBazaarReputation(market.id);
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Baloo 2','Nunito',sans-serif", paddingBottom: 40, overflowX: 'hidden' }}>
      {/* Coloured header */}
      <div style={{ background: `linear-gradient(135deg,${market.color}22,${market.color}0a)`, borderBottom: `2px solid ${market.color}44`, padding: '15px 15px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <BackBtn onClick={onBack} color={market.color} />
          <div style={{ fontSize: 30 }}>{market.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: market.color, fontWeight: 900, letterSpacing: 2, fontFamily: "'Orbitron',sans-serif" }}>{isDaily ? '🌟 DAILY CHALLENGE' : 'BAZAAR MATHS'}</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: textColor() }}>{market.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}><StarRating stars={rep.stars} size={12} /><div style={{ fontSize: 8, color: C.dim, marginTop: 2 }}>Reputation</div></div>
        </div>
        {isDaily && dailyChallenge && <div style={{ background: `${dailyChallenge.color}20`, border: `1.5px solid ${dailyChallenge.color}55`, borderRadius: 13, padding: '9px 13px', display: 'flex', gap: 10, alignItems: 'center' }}><span style={{ fontSize: 24 }}>{dailyChallenge.emoji}</span><div><div style={{ fontSize: 12, fontWeight: 900, color: dailyChallenge.color }}>{dailyChallenge.title}</div><div style={{ fontSize: 11, color: C.dim }}>{dailyChallenge.desc}</div></div></div>}
        {!isDaily && <div style={{ background: isDark() ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: 13, padding: '9px 13px', display: 'flex', gap: 10, alignItems: 'center' }}><div style={{ fontSize: 28, animation: 'floatUp 2s ease-in-out infinite' }}>{market.keeperEmoji}</div><div><div style={{ fontSize: 12, fontWeight: 900, color: market.color }}>{market.keeper}</div><div style={{ fontSize: 11, color: C.dim }}>Namaste! Welcome! 🙏</div></div></div>}
      </div>
      <div style={{ padding: '12px 15px' }}>
        {/* Price list */}
        <div style={{ background: C.card, border: `2px solid ${market.color}44`, borderRadius: 18, overflow: 'hidden', marginBottom: 13 }}>
          <div style={{ background: `${market.color}18`, padding: '9px 15px', borderBottom: `1px solid ${market.color}33`, display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ fontSize: 16 }}>📋</span><span style={{ fontSize: 12, fontWeight: 900, color: market.color, fontFamily: "'Orbitron',sans-serif" }}>TODAY'S PRICE LIST</span></div>
          {market.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 15px', borderBottom: i < market.items.length - 1 ? `1px solid ${isDark() ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : undefined }}>
              <div style={{ fontSize: 24, width: 30, textAlign: 'center', flexShrink: 0 }}>{item.emoji}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 800, color: textColor() }}>{item.name}</div><div style={{ fontSize: 10, color: C.dim }}>{item.unit}</div></div>
              <div style={{ background: `${market.color}16`, border: `1px solid ${market.color}44`, borderRadius: 9, padding: '4px 11px' }}><div style={{ fontSize: 14, fontWeight: 900, color: market.color }}>₹{item.price}</div></div>
            </div>
          ))}
        </div>
        {/* Role picker */}
        <div style={{ fontSize: 10, color: C.dim, fontWeight: 900, fontFamily: "'Orbitron',sans-serif", letterSpacing: 1, marginBottom: 9, textAlign: 'center' }}>👇 WHO ARE YOU TODAY?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 13 }}>
          {[{ r: 'buyer', e: '🧺', title: "I'm a BUYER", sub: 'Shop smart, budget right!', c: C.cyan }, { r: 'seller', e: '🏪', title: "I'm a SELLER", sub: 'Run shop, charge & give change!', c: '#f97316' }].map(opt => (
            <button key={opt.r} onClick={() => setRole(opt.r)} style={{ background: role === opt.r ? `linear-gradient(135deg,${opt.c}30,${opt.c}14)` : isDark() ? 'rgba(255,255,255,0.04)' : C.card, border: `2.5px solid ${role === opt.r ? opt.c : opt.c + '44'}`, borderRadius: 18, padding: '15px 10px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.2s' }}>
              <div style={{ fontSize: 38, animation: role === opt.r ? 'floatUp 1.5s ease-in-out infinite' : 'none' }}>{opt.e}</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: opt.c }}>{opt.title}</div>
              <div style={{ fontSize: 10, color: C.dim, lineHeight: 1.5 }}>{opt.sub}</div>
              {role === opt.r && <div style={{ background: opt.c, borderRadius: 18, padding: '3px 13px', fontSize: 11, color: 'white', fontWeight: 800 }}>✓ Selected</div>}
            </button>
          ))}
        </div>
        <button disabled={!role} onClick={() => role && onRole(role)} style={{ width: '100%', background: role ? `linear-gradient(135deg,${market.color},${market.color}bb)` : `${C.dim}20`, border: 'none', borderRadius: 18, padding: '16px', color: role ? 'white' : C.dim, fontSize: 15, fontWeight: 900, cursor: role ? 'pointer' : 'not-allowed', boxShadow: role ? `0 4px 22px ${market.color}44` : 'none', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🚀</span>{role ? `Start as ${role === 'buyer' ? 'Buyer 🧺' : 'Seller 🏪'}!` : 'Choose your role above'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  GAME PLAY
// ═══════════════════════════════════════════════════════════════════════
function BazaarGame({ market, role, child, onBack, onDone, isDaily, dailyChallenge }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [shuffled, setShuffled] = useState([]);
  const [keeperAnim, setKeeperAnim] = useState(null);
  const [showCoins, setShowCoins] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const [rep, setRep] = useState(() => getBazaarReputation(market.id));
  const [custEmojis] = useState(() => Array.from({ length: 8 }, () => BAZAAR_CUSTOMER_EMOJIS[Math.floor(Math.random() * BAZAAR_CUSTOMER_EMOJIS.length)]));
  const festival = getActiveFestival();
  const coinMult = (isDaily ? (dailyChallenge?.bonus || 1) : 1) * (festival ? festival.bonus : 1);

  useEffect(() => {
    fetchBazaarQuestions(market.id, role, isDaily).then(data => {
      setQuestions(data || getBazaarFallback(market, role));
      setLoading(false);
    });
  }, [market.id, role]);

  useEffect(() => {
    if (questions.length > 0 && questions[qIdx]) setShuffled([...(questions[qIdx].options || [])].sort(() => Math.random() - 0.5));
    setFeedback(null);
  }, [qIdx, questions]);

  if (loading) return <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: 44, animation: 'floatUp 1s ease-in-out infinite', marginBottom: 10 }}>{market.emoji}</div><div style={{ fontSize: 12, color: C.dim, fontFamily: "'Orbitron',sans-serif" }}>Setting up market…</div></div></div>;
  if (!questions.length) return <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: 44, marginBottom: 10 }}>🔧</div><div style={{ fontSize: 14, fontWeight: 800, color: textColor(), marginBottom: 8 }}>Questions coming soon!</div><button onClick={onBack} style={{ background: `${market.color}20`, border: `2px solid ${market.color}44`, borderRadius: 13, padding: '10px 20px', color: market.color, fontWeight: 800, cursor: 'pointer' }}>← Go Back</button></div></div>;

  const q = questions[qIdx], total = questions.length, pct = Math.round((qIdx / total) * 100), isBoss = !!q.isBoss, isCorrect = feedback === 'correct', isWrong = feedback === 'wrong';

  function handleAnswer(opt) {
    if (feedback) return;
    const correct = opt.trim() === String(q.correct_answer).trim();
    if (correct) {
      SFX.correct(); if (isBoss) setTimeout(() => SFX.bossDefeat(), 200);
      const earned = Math.round((1 + streak) * coinMult * (isBoss ? 3 : 1));
      const newRep = updateBazaarReputation(market.id, true);
      setRep(newRep); setScore(s => s + 1); setStreak(s => s + 1); setCoins(c => c + earned);
      setFeedback('correct'); setKeeperAnim('happy'); setShowCoins(true);
      setTimeout(() => { setShowCoins(false); setKeeperAnim(null); }, 1350);
      setTimeout(() => {
        if (qIdx + 1 >= total) {
          addBazaarCoins(child.id, coins + earned);
          updateWeeklyLeague(child.id, coins + earned);
          const delta = { totalCorrect: score + 1, bestStreak: 0, buyerSessions: role === 'buyer' ? 1 : 0, sellerSessions: role === 'seller' ? 1 : 0, marketsPlayed: 1, festivalSessions: festival ? 1 : 0 };
          if (score + 1 === total) delta.perfectRounds = 1;
          if (isBoss) delta.bossesBeaten = 1;
          updateBazaarStats(child.id, delta);
          setStatMax(child.id, 'bestStreak', streak + 1);
          setStatMax(child.id, 'bestReputation', newRep.stars);
          const newAch = checkAndAwardAchievements(child.id);
          setNewAchievements(newAch);
          onDone({ score: score + 1, total, coins: coins + earned, role, market, isDaily, streak: streak + 1, newAchievements: newAch });
        } else setQIdx(i => i + 1);
      }, 1350);
    } else {
      SFX.wrong(); updateBazaarReputation(market.id, false); setRep(getBazaarReputation(market.id));
      setStreak(0); setFeedback('wrong'); setKeeperAnim('sad');
      setTimeout(() => { setFeedback(null); setKeeperAnim(null); }, 1700);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Baloo 2','Nunito',sans-serif", paddingBottom: 28, position: 'relative', overflow: 'hidden' }}>
      <CoinShower active={showCoins} />
      {feedback && <div style={{ position: 'fixed', inset: 0, zIndex: 49, background: isCorrect ? 'rgba(34,197,94,0.09)' : 'rgba(239,68,68,0.09)', pointerEvents: 'none' }} />}
      {isBoss && <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse at 50% 0%,#f9731620,transparent 70%)', pointerEvents: 'none' }} />}
      <div style={{ background: isBoss ? 'linear-gradient(135deg,#f9731626,#ec489916)' : `linear-gradient(135deg,${market.color}20,${market.color}08)`, borderBottom: `2px solid ${isBoss ? '#f97316' : market.color}44`, padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <BackBtn onClick={onBack} color={market.color} />
          <div style={{ flex: 1, fontSize: 11, fontWeight: 900, color: market.color }}>{market.emoji} {market.name} · {role === 'buyer' ? '🧺 Buyer' : '🏪 Seller'}{isDaily ? ' · 🌟' : ''}{festival ? ` · ${festival.emoji}` : ''}</div>
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ background: `${market.color}20`, borderRadius: 9, padding: '3px 8px', fontSize: 12, fontWeight: 900, color: market.color }}>{score}/{total} ✅</div>
            {streak > 1 && <div style={{ background: '#fb923c20', borderRadius: 9, padding: '3px 8px', fontSize: 12, fontWeight: 900, color: '#fb923c' }}>🔥{streak}</div>}
          </div>
        </div>
        <div style={{ background: isDark() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', borderRadius: 20, height: 7, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${market.color},${C.yellow})`, borderRadius: 20, transition: 'width 0.5s ease', boxShadow: `0 0 7px ${market.color}88` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 10, color: C.dim }}>
          <span>Q {qIdx + 1}/{total}</span>
          <span>🪙{coins}{coinMult > 1 ? ` (${coinMult}×)` : ''} · <StarRating stars={rep.stars} size={10} /></span>
        </div>
      </div>
      <div style={{ background: isDark() ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderBottom: `1px solid ${isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`, padding: '5px 15px' }}>
        <CustomerQueue total={Math.min(total, 7)} current={qIdx} customerEmojis={custEmojis} />
      </div>
      <div style={{ padding: '11px 14px' }}>
        {isBoss && <div style={{ background: 'linear-gradient(135deg,#f9731620,#ec489916)', border: '2px solid #f9731688', borderRadius: 15, padding: '9px 13px', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 10, animation: 'heartbeat 1s ease-in-out infinite' }}><span style={{ fontSize: 26 }}>⚡</span><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 900, color: '#f97316' }}>BOSS CUSTOMER!</div><div style={{ fontSize: 11, color: C.dim }}>Solve for 3× coins!</div></div><span style={{ fontSize: 26 }}>⚡</span></div>}
        {festival && <div style={{ background: `${festival.color}16`, border: `1.5px solid ${festival.color}44`, borderRadius: 13, padding: '7px 12px', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 18 }}>{festival.emoji}</span><span style={{ fontSize: 11, fontWeight: 800, color: festival.color }}>{festival.name} — {festival.bonus}× coins!</span></div>}
        <div style={{ background: `${market.color}12`, border: `2px solid ${market.color}44`, borderRadius: 19, padding: '12px 12px', marginBottom: 10, animation: 'slideUp 0.35s ease', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -6, top: -6, fontSize: 52, opacity: 0.07, pointerEvents: 'none' }}>{market.emoji}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <KeeperFace market={market} reputation={rep} animate={keeperAnim} size={46} />
            <div style={{ flex: 1 }}>
              {q.customer_name && <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}><span style={{ fontSize: 16 }}>{q.customer_emoji || '🧑'}</span><span style={{ fontSize: 11, color: market.color, fontWeight: 900 }}>{q.customer_name}</span></div>}
              <div style={{ fontSize: 13, fontWeight: 700, color: textColor(), lineHeight: 1.65 }}>{q.scenario}</div>
            </div>
          </div>
        </div>
        <div style={{ background: C.card, border: `2px solid ${C.cyan}44`, borderRadius: 17, padding: '12px 14px', marginBottom: 11, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: textColor(), lineHeight: 1.5 }}>❓ {q.question}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {shuffled.map((opt, i) => {
            const isAns = String(opt).trim() === String(q.correct_answer).trim(), wasWrong = isWrong && !isAns;
            return <button key={i} onClick={() => handleAnswer(opt)} disabled={!!feedback}
              style={{ background: isAns && feedback ? `linear-gradient(135deg,#22c55e,#16a34a)` : wasWrong ? `${C.red}1e` : `${market.color}0d`, border: isAns && feedback ? '2.5px solid #22c55e' : wasWrong ? `2.5px solid ${C.red}` : `2px solid ${market.color}30`, borderRadius: 17, padding: '14px 8px', cursor: feedback ? 'not-allowed' : 'pointer', textAlign: 'center', fontSize: 14, fontWeight: 900, color: isAns && feedback ? 'white' : textColor(), transition: 'all 0.18s', animation: `popIn 0.3s ease ${i * 0.06}s both`, lineHeight: 1.3 }}>
              {opt}{isAns && feedback && <div style={{ fontSize: 13, marginTop: 2 }}>✅</div>}
            </button>;
          })}
        </div>
        {feedback && <div style={{ textAlign: 'center', marginTop: 11, padding: '10px 14px', borderRadius: 15, background: isCorrect ? '#22c55e12' : '#ef444412', border: `2px solid ${isCorrect ? '#22c55e' : '#ef4444'}44`, animation: 'popIn 0.35s ease' }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: isCorrect ? '#22c55e' : C.red }}>{isCorrect ? BAZAAR_REACTIONS_CORRECT[Math.floor(Math.random() * BAZAAR_REACTIONS_CORRECT.length)] : BAZAAR_REACTIONS_WRONG[Math.floor(Math.random() * BAZAAR_REACTIONS_WRONG.length)]}</div>
          {isCorrect && <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>+{Math.round((1 + streak) * coinMult * (isBoss ? 3 : 1))} 🪙{isBoss ? ' BOSS BONUS!' : festival ? ` (${festival.emoji}!)` : isDaily ? ' (daily!)' : ''}</div>}
          {isWrong && q.hint && <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>💡 {q.hint}</div>}
        </div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  RESULT SCREEN — revamped
// ═══════════════════════════════════════════════════════════════════════
function BazaarResult({ result, market, onReplay, onHub, onHome }) {
  const { score, total, coins, role, isDaily, isSpeed, streak, newAchievements = [] } = result;
  const stars = score === total ? 3 : score >= Math.ceil(total * 0.7) ? 2 : score > 0 ? 1 : 0;
  const rep = getBazaarReputation(market.id);
  const totalCoins = getBazaarTotalCoins(result.child?.id || '');
  const wk = getWeeklyLeague(result.child?.id || '');
  const festival = getActiveFestival();
  const nextCity = BAZAAR_PASSPORT.find(c => c.unlockCoins > totalCoins);
  const [toastDismissed, setToastDismissed] = useState(false);

  const badges = [];
  if (score === total) badges.push({ e: '💯', l: 'Perfect!', c: '#fbbf24' });
  if (isDaily) badges.push({ e: '🌟', l: 'Daily Hero!', c: '#f97316' });
  if (isSpeed) badges.push({ e: '⚡', l: 'Speed Racer!', c: '#ef4444' });
  if (festival) badges.push({ e: festival.emoji, l: festival.badge, c: festival.color });
  if (rep.stars >= 4) badges.push({ e: '⭐', l: 'Top Rated!', c: '#22c55e' });
  if ((streak || 0) > 2) badges.push({ e: '🔥', l: `${streak} Streak!`, c: '#fb923c' });

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Baloo 2','Nunito',sans-serif", paddingBottom: 50, position: 'relative', overflow: 'hidden' }}>
      <CoinShower active={true} />
      <Starfield n={16} />
      {newAchievements.length > 0 && !toastDismissed && <AchievementToast achievements={newAchievements} onClose={() => setToastDismissed(true)} />}
      <div style={{ position: 'relative', zIndex: 2, padding: '26px 18px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 390 }}>
          <div style={{ background: `linear-gradient(135deg,${market.color}22,${market.color}08)`, border: `2.5px solid ${market.color}55`, borderRadius: 26, padding: '26px 20px', textAlign: 'center', boxShadow: `0 8px 40px ${market.color}20`, marginBottom: 13, animation: 'popIn 0.5s ease' }}>
            <div style={{ fontSize: 64, marginBottom: 6, animation: 'coinBounce 0.8s ease' }}>{score === total ? '🏆' : stars >= 2 ? '🎉' : '👏'}</div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 17, fontWeight: 900, color: market.color, marginBottom: 3 }}>{score === total ? 'PERFECT SCORE!' : stars >= 2 ? 'GREAT JOB!' : 'KEEP GOING!'}</div>
            <div style={{ fontSize: 12, color: C.dim, marginBottom: 13 }}>{market.keeper} is proud of you! {market.keeperEmoji}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 13 }}>
              {[1, 2, 3].map(s => <span key={s} style={{ fontSize: 34, filter: s <= stars ? 'none' : 'grayscale(1) opacity(0.2)', animation: s <= stars ? `starPop 0.4s ease ${(s - 1) * 0.15}s both` : 'none' }}>⭐</span>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, marginBottom: 12 }}>
              {[{ e: '✅', v: `${score}/${total}`, l: 'Correct', c: '#22c55e' }, { e: '🪙', v: coins, l: 'Coins', c: '#fbbf24' }, { e: '⭐', v: rep.stars, l: 'Shop ⭐', c: '#f97316' }].map((s, i) => (
                <div key={i} style={{ background: `${s.c}12`, border: `1.5px solid ${s.c}44`, borderRadius: 13, padding: '9px 5px' }}><div style={{ fontSize: 18 }}>{s.e}</div><div style={{ fontSize: 17, fontWeight: 900, color: s.c }}>{s.v}</div><div style={{ fontSize: 9, color: C.dim }}>{s.l}</div></div>
              ))}
            </div>
            {badges.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 }}>
              {badges.map((b, i) => <div key={i} style={{ background: `${b.c}16`, border: `1.5px solid ${b.c}50`, borderRadius: 11, padding: '4px 9px', display: 'flex', alignItems: 'center', gap: 4, animation: `popIn 0.4s ease ${i * 0.1}s both` }}><span style={{ fontSize: 15 }}>{b.e}</span><span style={{ fontSize: 10, fontWeight: 800, color: b.c }}>{b.l}</span></div>)}
            </div>}
            {nextCity && <div style={{ background: `${nextCity.color}14`, border: `1.5px solid ${nextCity.color}44`, borderRadius: 13, padding: '8px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22, filter: totalCoins >= nextCity.unlockCoins ? 'none' : 'grayscale(1) opacity(0.4)' }}>{totalCoins >= nextCity.unlockCoins ? '🎉' : nextCity.emoji}</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: nextCity.color }}>{totalCoins >= nextCity.unlockCoins ? `🎉 ${nextCity.name} unlocked!` : `${nextCity.unlockCoins - totalCoins} more coins → ${nextCity.name}`}</div>
                {totalCoins < nextCity.unlockCoins && <div style={{ background: isDark() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderRadius: 10, height: 5, marginTop: 4, overflow: 'hidden' }}><div style={{ width: `${Math.min(100, Math.round((totalCoins / nextCity.unlockCoins) * 100))}%`, height: '100%', background: nextCity.color, borderRadius: 10 }} /></div>}
              </div>
            </div>}
          </div>
          <div style={{ background: C.card, border: `1.5px solid ${C.yellow}40`, borderRadius: 17, padding: '11px 14px', marginBottom: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 26 }}>🏆</span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: C.dim }}>This week's coins</div><div style={{ fontSize: 18, fontWeight: 900, color: '#fbbf24' }}>🪙 {wk.coins}</div></div>
            <LeagueBadge coins={wk.coins} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <button onClick={onReplay} style={{ background: `linear-gradient(135deg,${market.color},${market.color}aa)`, border: 'none', borderRadius: 19, padding: '14px', color: 'white', fontSize: 14, fontWeight: 900, cursor: 'pointer', boxShadow: `0 4px 18px ${market.color}44` }}>🔄 Play Again</button>
            <button onClick={onHub} style={{ background: C.card, border: `2px solid ${market.color}44`, borderRadius: 19, padding: '12px', color: textColor(), fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>🏪 Choose Another Market</button>
            <button onClick={onHome} style={{ background: 'transparent', border: `1.5px solid ${C.dim}30`, borderRadius: 19, padding: '11px', color: C.dim, fontSize: 12, cursor: 'pointer' }}>← Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  BazaarScreen — master orchestrator
// ═══════════════════════════════════════════════════════════════════════
export function BazaarScreen({ child, onBack }) {
  const [step, setStep] = useState('hub');
  const [market, setMarket] = useState(null);
  const [role, setRole] = useState(null);
  const [result, setResult] = useState(null);
  const [isDaily, setIsDaily] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [isSpeed, setIsSpeed] = useState(false);
  const [isChallenge, setIsChallenge] = useState(false);

  function startMarket(m, daily = false, dc = null) { setMarket(m); setIsDaily(daily); setDailyChallenge(dc); setIsSpeed(false); setIsChallenge(false); setStep('market'); }
  function startSpeed(m) { setMarket(m); setIsSpeed(true); setIsDaily(false); setIsChallenge(false); setStep('speed'); }
  function startChallenge(m) { setMarket(m); setIsChallenge(true); setIsSpeed(false); setIsDaily(false); setStep('challenge'); }
  function handleDailyPick(dc) { startMarket(BAZAAR_MARKETS.find(m => !m.isPaid), true, dc); }

  if (step === 'hub') return <BazaarHub child={child} onBack={onBack} onMarket={startMarket} onDaily={handleDailyPick} onSpeed={startSpeed} onChallenge={startChallenge} />;
  if (step === 'market') return <BazaarMarket market={market} child={child} isDaily={isDaily} dailyChallenge={dailyChallenge} onBack={() => setStep('hub')} onRole={r => { setRole(r); setStep('game'); }} />;
  if (step === 'speed') return <SpeedRound market={market} child={child} onBack={() => setStep('hub')} onDone={r => { addBazaarCoins(child.id, r.coins); updateWeeklyLeague(child.id, r.coins); updateBazaarStats(child.id, { speedRounds: 1 }); setStatMax(child.id, 'speedBestScore', r.score); const na = checkAndAwardAchievements(child.id); setResult({ ...r, child, newAchievements: na }); setStep('result'); }} />;
  if (step === 'challenge') return <ChallengeMode market={market} child={child} onBack={() => setStep('hub')} onDone={r => { updateBazaarStats(child.id, { challengesSent: 1 }); const na = checkAndAwardAchievements(child.id); setResult({ ...r, child, newAchievements: na }); setStep('result'); }} />;
  if (step === 'game') return <BazaarGame market={market} role={role} child={child} isDaily={isDaily} dailyChallenge={dailyChallenge} onBack={() => setStep('market')} onDone={r => { if (isDaily) markDailyChallengeComplete(child.id); setResult({ ...r, child }); setStep('result'); }} />;
  if (step === 'result') return <BazaarResult result={result} market={market} onReplay={() => isSpeed ? setStep('speed') : isChallenge ? setStep('challenge') : setStep('game')} onHub={() => setStep('hub')} onHome={onBack} />;
  return null;
}