// src/components/bazaar/BazaarScreen.jsx — Real-Life Maths Adventures
import React, { useState, useEffect, useRef } from 'react';
import { C, textColor, isDark } from '../../constants/themes.js';
import { db } from '../../lib/db.js';
import { SFX } from '../../lib/sfx.js';
import { BackBtn } from '../ui/primitives.jsx';
import {
  BAZAAR_ADVENTURES, CLASS_GROUP_LABELS, getClassGroup,
  getAdventureQuestions, getAdventureQuestionsForChild, getSpeedBlitzQuestions,
  getTodayDailyScenario, DAILY_SCENARIOS,
  BAZAAR_ACHIEVEMENTS,
  getBazaarStats, updateBazaarStats, setStatMax,
  getEarnedAchievements, checkAndAwardAchievements,
  getBazaarTotalCoins, addBazaarCoins,
  isDailyChallengeCompletedToday, markDailyChallengeComplete,
  getDailyStreak, getWeeklyLeague, updateWeeklyLeague,
  BAZAAR_REACTIONS_CORRECT, BAZAAR_REACTIONS_WRONG,
} from '../../constants/bazaarData.js';
import { Starfield } from '../layout/layout.jsx';

// ─── Coin shower ─────────────────────────────────────────────────────
function CoinShower({ active }) {
  if (!active) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none' }}>
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${6 + (i * 5.8) % 88}%`, top: '-24px',
          fontSize: i % 3 === 0 ? 24 : 16,
          animation: `confettiFall ${0.8 + (i % 4) * 0.22}s ease-in ${(i % 6) * 0.08}s forwards`,
        }}>
          {i % 4 === 0 ? '🪙' : i % 4 === 1 ? '⭐' : i % 4 === 2 ? '✨' : '🎉'}
        </div>
      ))}
    </div>
  );
}

// ─── Achievement toast ────────────────────────────────────────────────
function AchievementToast({ achievements, onClose }) {
  if (!achievements?.length) return null;
  const a = achievements[0];
  return (
    <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 500, animation: 'mmSlideUp 0.5s ease', maxWidth: 340, width: 'calc(100% - 32px)' }}>
      <div style={{ background: `linear-gradient(135deg,${a.color}33,${a.color}18)`, border: `2.5px solid ${a.color}66`, borderRadius: 20, padding: '14px 16px', boxShadow: `0 8px 30px ${a.color}33`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 36, animation: 'mmBounce 0.8s ease', flexShrink: 0 }}>{a.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: a.color, fontWeight: 900, letterSpacing: 1, fontFamily: 'Nunito, sans-serif' }}>🏅 BADGE UNLOCKED!</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: a.color, marginTop: 2 }}>{a.name}</div>
          <div style={{ fontSize: 11, color: isDark() ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', marginTop: 2 }}>{a.desc}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: a.color }}>✕</button>
      </div>
    </div>
  );
}

// ─── Skill chip ──────────────────────────────────────────────────────
function SkillChip({ label, color }) {
  return (
    <div style={{ background: `${color}18`, border: `1.5px solid ${color}33`, borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 800, color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {label}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  HUB — Adventure selection screen
// ═══════════════════════════════════════════════════════════════════════
function AdventureHub({ child, onBack, onAdventure, onDaily, onSpeedBlitz, onBadges }) {
  const totalCoins = getBazaarTotalCoins(child.id);
  const dailyDone = isDailyChallengeCompletedToday(child.id);
  const dailyStreak = getDailyStreak(child.id);
  const todayScenario = getTodayDailyScenario();
  const earned = getEarnedAchievements(child.id);
  const stats = getBazaarStats(child.id);
  const weeklyCoins = getWeeklyLeague(child.id).coins;
  const classGroup = getClassGroup(child.class_num);
  const groupInfo = CLASS_GROUP_LABELS[classGroup];

  const freeAdventures = BAZAAR_ADVENTURES.filter(a => !a.isPaid);
  const paidAdventures = BAZAAR_ADVENTURES.filter(a => a.isPaid);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Nunito', sans-serif", paddingBottom: 60, position: 'relative', overflowX: 'hidden' }}>
      <Starfield n={20} />

      {/* ─── HERO HEADER ─── */}
      <div style={{ position: 'relative', zIndex: 2, background: 'linear-gradient(155deg, #5B4FE8 0%, #9B59F5 50%, #FF5FA0 100%)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px' }}>
          <BackBtn onClick={onBack} color="rgba(255,255,255,0.85)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 900, letterSpacing: 3 }}>MATHMAGIC</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>Real Life Maths 🌍</div>
          </div>
          <button onClick={onBadges} style={{ background: 'rgba(0,0,0,0.22)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 14, padding: '7px 11px', cursor: 'pointer', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#fde047' }}>🪙 {totalCoins}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>COINS</div>
          </button>
        </div>

        <div style={{ padding: '0 16px 24px' }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: 'white', marginBottom: 4, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            Namaste, {child.name?.split(' ')[0] || 'Friend'}! 🙏
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, marginBottom: 10 }}>
            Real-life maths for <strong style={{color:'#fde047'}}>{groupInfo.label}</strong> — {groupInfo.desc}!
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: 20, padding: '4px 11px' }}>
              <span style={{ fontSize: 11 }}>{groupInfo.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 900, color: 'white' }}>{groupInfo.label}</span>
            </div>
            {dailyStreak > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.25)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '4px 11px' }}>
                <span style={{ fontSize: 13 }}>🔥</span>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#fde047' }}>{dailyStreak}-day streak!</span>
              </div>
            )}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.25)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '4px 11px' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>🏅 {earned.length}/{BAZAAR_ACHIEVEMENTS.length} badges</span>
            </div>
          </div>
        </div>
        <div style={{ height: 24, background: C.bg, borderRadius: '50% 50% 0 0 / 100% 100% 0 0', marginTop: -24 }} />
      </div>

      <div style={{ padding: '0 16px', position: 'relative', zIndex: 2 }}>

        {/* ─── TODAY'S DAILY SCENARIO ─── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <div style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(#FF6B6B, #FF6B6B88)' }} />
            <span style={{ fontSize: 10, color: '#9890C4', fontWeight: 900, letterSpacing: 1.5 }}>TODAY'S SCENARIO</span>
          </div>
          <button
            onClick={() => !dailyDone && onDaily(todayScenario)}
            disabled={dailyDone}
            style={{ width: '100%', background: dailyDone ? 'rgba(0,0,0,0.03)' : 'white', border: `2px solid ${dailyDone ? 'rgba(91,79,232,0.12)' : todayScenario.color + '44'}`, borderRadius: 24, padding: '16px', cursor: dailyDone ? 'not-allowed' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden', boxShadow: dailyDone ? 'none' : `0 8px 30px ${todayScenario.color}22`, transition: 'all 0.2s' }}
          >
            {!dailyDone && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg,transparent,${todayScenario.color}06,transparent)`, animation: 'mmShimmer 2.5s ease-in-out infinite', pointerEvents: 'none' }} />}
            <div style={{ width: 56, height: 56, borderRadius: 18, background: dailyDone ? '#F0ECFF' : `linear-gradient(135deg,${todayScenario.color}33,${todayScenario.color}15)`, border: `2px solid ${dailyDone ? '#E5E3F0' : todayScenario.color + '44'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, filter: dailyDone ? 'grayscale(1) opacity(0.5)' : 'none', animation: dailyDone ? 'none' : 'mmFloat 2s ease-in-out infinite' }}>
              {todayScenario.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: dailyDone ? '#9890C4' : '#1A1040' }}>{todayScenario.title}</span>
                {!dailyDone && <span style={{ fontSize: 9, background: `${todayScenario.color}22`, border: `1px solid ${todayScenario.color}44`, borderRadius: 999, padding: '2px 8px', color: todayScenario.color, fontWeight: 800, animation: 'mmPulse 1.8s infinite' }}>NEW</span>}
                {dailyDone && <span style={{ fontSize: 9, background: '#2ECC9A22', border: '1px solid #2ECC9A44', borderRadius: 8, padding: '2px 7px', color: '#2ECC9A', fontWeight: 800 }}>✅ DONE</span>}
              </div>
              <div style={{ fontSize: 11, color: '#9890C4', lineHeight: 1.5, marginBottom: 6 }}>{todayScenario.desc}</div>
              {!dailyDone && (
                <div style={{ display: 'flex', gap: 5 }}>
                  <span style={{ background: '#FFC84720', border: '1px solid #FFC84740', borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 900, color: '#FFC847' }}>+{todayScenario.bonus}× coins</span>
                  <span style={{ background: '#2ECC9A20', border: '1px solid #2ECC9A40', borderRadius: 8, padding: '2px 8px', fontSize: 9, fontWeight: 700, color: '#2ECC9A' }}>🏅 Badge</span>
                </div>
              )}
              {dailyDone && <div style={{ fontSize: 10, color: '#9890C4', marginTop: 2 }}>Come back tomorrow for a fresh scenario!</div>}
            </div>
          </button>
        </div>

        {/* ─── SPEED BLITZ ─── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <div style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(#ef4444, #ef444488)' }} />
            <span style={{ fontSize: 10, color: '#9890C4', fontWeight: 900, letterSpacing: 1.5 }}>QUICK CHALLENGE</span>
          </div>
          <button
            onClick={onSpeedBlitz}
            style={{ width: '100%', background: 'linear-gradient(145deg,#ef444412,#f9731608)', border: '2px solid #ef444444', borderRadius: 20, padding: '15px 16px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#ef4444,#f9731655)', borderRadius: '20px 20px 0 0' }} />
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#ef4444,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, boxShadow: '0 4px 12px #ef444444' }}>⚡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#1A1040', marginBottom: 2 }}>Speed Blitz!</div>
              <div style={{ fontSize: 11, color: '#9890C4' }}>Mix of ALL real-life scenarios — 60 seconds!</div>
            </div>
            <div style={{ background: '#ef444415', border: '1.5px solid #ef444433', borderRadius: 10, padding: '4px 10px', fontSize: 10, fontWeight: 900, color: '#ef4444' }}>60s</div>
          </button>
        </div>

        {/* ─── ADVENTURES GRID ─── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(#5B4FE8, #5B4FE888)' }} />
          <span style={{ fontSize: 10, color: '#9890C4', fontWeight: 900, letterSpacing: 1.5 }}>CHOOSE YOUR ADVENTURE</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 20 }}>
          {freeAdventures.map((adv, i) => {
            const played = (getBazaarStats(child.id).adventuresPlayed || []).includes(adv.id);
            return (
              <button key={adv.id} onClick={() => onAdventure(adv)}
                style={{ background: 'white', border: `1.5px solid ${adv.color}33`, borderRadius: 22, padding: '16px 16px 16px 20px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden', animation: `mmSlideUp 0.4s ease ${i * 0.07}s both`, boxShadow: `0 4px 16px ${adv.color}18, 0 2px 6px ${adv.color}10`, transition: 'all 0.2s' }}>
                {/* Left color bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: `linear-gradient(180deg,${adv.color},${adv.color}66)`, borderRadius: '22px 0 0 22px' }} />
                {/* Icon */}
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${adv.color}18`, border: `1.5px solid ${adv.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{adv.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: '#1A1040' }}>{adv.name}</span>
                    {played && <span style={{ fontSize: 9, background: '#2ECC9A18', border: '1px solid #2ECC9A44', borderRadius: 999, padding: '2px 7px', color: '#2ECC9A', fontWeight: 800 }}>✅ Played</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#9890C4', lineHeight: 1.4, marginBottom: 5 }}>{adv.tagline}</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {adv.skills.slice(0, 3).map(s => <SkillChip key={s} label={s} color={adv.color} />)}
                  </div>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: 999, background: `${adv.color}15`, border: `1.5px solid ${adv.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: adv.color, fontSize: 16, flexShrink: 0 }}>›</div>
              </button>
            );
          })}

          {/* Paid/locked adventures */}
          {paidAdventures.map((adv, i) => (
            <button key={adv.id} disabled style={{ background: 'rgba(0,0,0,0.02)', border: `1.5px solid rgba(91,79,232,0.1)`, borderRadius: 22, padding: '16px', cursor: 'not-allowed', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, opacity: 0.55 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: '#F0ECFF', border: '1.5px solid #E5E3F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, filter: 'grayscale(1) opacity(0.5)' }}>{adv.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#9890C4', marginBottom: 2 }}>{adv.name}</div>
                <div style={{ fontSize: 11, color: '#9890C4' }}>{adv.tagline}</div>
              </div>
              <div style={{ background: '#FFC84722', border: '1px solid #FFC84755', borderRadius: 8, padding: '3px 8px', fontSize: 9, fontWeight: 900, color: '#FFC847' }}>🔒 SOON</div>
            </button>
          ))}
        </div>

        {/* ─── WHAT YOU LEARN ─── */}
        <div style={{ background: isDark() ? 'rgba(255,255,255,0.04)' : '#F5F0FF', border: '1.5px solid rgba(91,79,232,0.12)', borderRadius: 20, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>🎓</span>
            <span style={{ fontSize: 11, color: '#5B4FE8', fontWeight: 900, letterSpacing: 1 }}>REAL MATHS SKILLS YOU BUILD</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['🛒 Budgeting', '💰 Money', '➕ Addition', '✖️ Multiply', '➗ Division', '⏰ Time', '📊 Compare', '💡 Estimation', '% Percentages', '🔢 Problem Solving'].map(t => (
              <div key={t} style={{ background: 'rgba(91,79,232,0.08)', border: '1px solid rgba(91,79,232,0.15)', borderRadius: 20, padding: '4px 10px', fontSize: 10, color: '#5B4FE8', fontWeight: 700 }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  ADVENTURE INTRO — Story setup before questions
// ═══════════════════════════════════════════════════════════════════════
function AdventureIntro({ adventure, child, onStart, onBack, isDaily, dailyScenario }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Nunito', sans-serif", display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Starfield n={14} />

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${adventure.color}22,${adventure.color}08)`, borderBottom: `2px solid ${adventure.color}44`, padding: '15px 16px 14px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackBtn onClick={onBack} color={adventure.color} />
          <div style={{ fontSize: 30 }}>{adventure.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: adventure.color, fontWeight: 900, letterSpacing: 2 }}>{isDaily ? '🌟 DAILY SCENARIO' : 'REAL LIFE MATHS'}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#1A1040' }}>{isDaily ? dailyScenario?.title : adventure.name}</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 18px', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 420, margin: '0 auto', width: '100%' }}>

        {/* Big situation card */}
        <div style={{ background: 'white', border: `2px solid ${adventure.color}44`, borderRadius: 28, padding: '28px 22px', marginBottom: 20, textAlign: 'center', boxShadow: `0 8px 30px ${adventure.color}22, inset 0 1px 0 rgba(255,255,255,0.8)`, width: '100%', animation: 'mmPop 0.5s ease' }}>
          <div style={{ fontSize: 72, marginBottom: 12, animation: 'mmFloat 2.5s ease-in-out infinite' }}>{adventure.coverEmoji || adventure.emoji}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: adventure.color, marginBottom: 8, fontFamily: "'Fredoka One', sans-serif" }}>{adventure.name}</div>
          <div style={{ fontSize: 14, color: '#5A4E8A', lineHeight: 1.7, marginBottom: 12 }}>{adventure.situation}</div>
          {/* Class level badge */}
          {(() => { const g = getClassGroup(child.class_num); const gi = CLASS_GROUP_LABELS[g]; return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${adventure.color}14`, border: `1.5px solid ${adventure.color}44`, borderRadius: 999, padding: '5px 14px', marginBottom: 12 }}>
              <span style={{ fontSize: 14 }}>{gi.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 900, color: adventure.color }}>{gi.label} Level</span>
              <span style={{ fontSize: 10, color: '#9890C4' }}>· {gi.desc}</span>
            </div>
          ); })()}
          {/* Skills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 10 }}>
            {adventure.skills.map(s => <SkillChip key={s} label={s} color={adventure.color} />)}
          </div>
        </div>

        {/* What to expect */}
        <div style={{ background: `${adventure.color}10`, border: `1.5px solid ${adventure.color}33`, borderRadius: 20, padding: '14px 16px', marginBottom: 20, width: '100%' }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: adventure.color, marginBottom: 8, letterSpacing: 0.5 }}>📋 WHAT YOU'LL DO</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              '🧮 Solve 6–8 real-life maths problems',
              '💡 Every question has a hint if needed',
              '✅ See the working after each answer',
              '🪙 Earn coins for correct answers',
            ].map((item, i) => (
              <div key={i} style={{ fontSize: 12, color: '#1A1040', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onStart}
          style={{ width: '100%', background: `linear-gradient(155deg, ${adventure.color}EE, ${adventure.color}CC)`, border: 'none', borderRadius: 20, padding: '16px', color: 'white', fontSize: 16, fontWeight: 900, cursor: 'pointer', boxShadow: `0 4px 0 ${adventure.color}CC, 0 6px 16px ${adventure.color}35`, fontFamily: "'Nunito', sans-serif" }}
        >
          🚀 Start Adventure!
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  GAME — Question-by-question play
// ═══════════════════════════════════════════════════════════════════════
function AdventureGame({ adventure, questions, child, onBack, onDone, isDaily, dailyScenario }) {
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [showHint, setShowHint] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [shuffledOpts, setShuffledOpts] = useState([]);
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const streakRef = useRef(0);
  const coinMult = isDaily ? (dailyScenario?.bonus || 1) : 1;

  useEffect(() => {
    if (questions[qIdx]) {
      setShuffledOpts([...(questions[qIdx].options || [])].sort(() => Math.random() - 0.5));
    }
    setFeedback(null);
    setShowHint(false);
    setShowExplain(false);
  }, [qIdx]);

  if (!questions.length) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>🔧</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1040', marginBottom: 8 }}>Questions coming soon!</div>
        <button onClick={onBack} style={{ background: '#F0ECFF', border: 'none', borderRadius: 13, padding: '10px 20px', color: '#5B4FE8', fontWeight: 800, cursor: 'pointer' }}>← Go Back</button>
      </div>
    </div>
  );

  const q = questions[qIdx];
  const total = questions.length;
  const pct = Math.round((qIdx / total) * 100);
  const isCorrect = feedback === 'correct';
  const isWrong = feedback === 'wrong';

  function handleAnswer(opt) {
    if (feedback) return;
    const correct = String(opt).trim() === String(q.correct_answer).trim();
    if (correct) {
      SFX.correct();
      const earned = Math.round((1 + Math.floor(streakRef.current / 2)) * coinMult);
      scoreRef.current += 1; coinsRef.current += earned; streakRef.current += 1;
      setScore(scoreRef.current); setCoins(coinsRef.current); setStreak(streakRef.current);
      setFeedback('correct'); setShowExplain(true); setShowCoins(true);
      setTimeout(() => setShowCoins(false), 1200);
    } else {
      SFX.wrong(); streakRef.current = 0; setStreak(0);
      setFeedback('wrong'); setShowExplain(true);
    }
  }

  function handleNext() {
    if (qIdx + 1 >= total) {
      onDone({ score: scoreRef.current, total, coins: coinsRef.current, streak: streakRef.current });
    } else {
      setQIdx(i => i + 1);
    }
  }

  const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Nunito', sans-serif", paddingBottom: 28, position: 'relative', overflow: 'hidden' }}>
      <CoinShower active={showCoins} />
      {feedback && <div style={{ position: 'fixed', inset: 0, zIndex: 49, background: isCorrect ? 'rgba(46,204,154,0.08)' : 'rgba(255,107,107,0.08)', pointerEvents: 'none' }} />}

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${adventure.color}20,${adventure.color}08)`, borderBottom: `2px solid ${adventure.color}44`, padding: '12px 15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <BackBtn onClick={onBack} color={adventure.color} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: adventure.color }}>{adventure.emoji} {adventure.name}</div>
            {(() => { const gi = CLASS_GROUP_LABELS[getClassGroup(child.class_num)]; return <div style={{ fontSize: 9, color: '#9890C4', marginTop: 1 }}>{gi.emoji} {gi.label}</div>; })()}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ background: `${adventure.color}20`, borderRadius: 10, padding: '3px 9px', fontSize: 12, fontWeight: 900, color: adventure.color }}>{score}/{total} ✅</div>
            {streak > 1 && <div style={{ background: '#f9731620', borderRadius: 10, padding: '3px 9px', fontSize: 12, fontWeight: 900, color: '#f97316' }}>🔥{streak}</div>}
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ background: 'rgba(91,79,232,0.08)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${adventure.color},${adventure.color}bb)`, borderRadius: 999, transition: 'width 0.5s ease', boxShadow: `0 0 8px ${adventure.color}66` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 10, color: '#9890C4' }}>
          <span>Question {qIdx + 1} of {total}</span>
          <span>🪙 {coins}{coinMult > 1 ? ` (${coinMult}×)` : ''}</span>
        </div>
      </div>

      <div style={{ padding: '14px 15px', maxWidth: 480, margin: '0 auto' }}>

        {/* Situation card — the STORY */}
        <div style={{ background: 'white', border: `2px solid ${adventure.color}44`, borderRadius: 22, padding: '16px 16px', marginBottom: 12, position: 'relative', overflow: 'hidden', boxShadow: `0 4px 16px ${adventure.color}18` }}>
          <div style={{ position: 'absolute', right: -8, top: -8, fontSize: 52, opacity: 0.06, pointerEvents: 'none' }}>{adventure.emoji}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${adventure.color}18`, border: `1.5px solid ${adventure.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{adventure.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: adventure.color, fontWeight: 900, letterSpacing: 1, marginBottom: 5 }}>🌍 REAL LIFE SITUATION</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1040', lineHeight: 1.7 }}>{q.scenario}</div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div style={{ background: 'white', border: '2px solid rgba(91,79,232,0.2)', borderRadius: 18, padding: '14px 16px', marginBottom: 12, textAlign: 'center', boxShadow: '0 4px 12px rgba(91,79,232,0.1)' }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#1A1040', lineHeight: 1.5 }}>❓ {q.question}</div>
        </div>

        {/* Answer options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {shuffledOpts.map((opt, i) => {
            const isAns = String(opt).trim() === String(q.correct_answer).trim();
            const wasWrong = isWrong && !isAns;
            const isChosen = isCorrect && isAns;
            return (
              <button key={i} onClick={() => handleAnswer(opt)} disabled={!!feedback}
                style={{
                  background: isChosen ? 'linear-gradient(135deg,#2ECC9A,#27ae78)' : wasWrong ? '#FFF0F0' : feedback && isAns ? 'linear-gradient(135deg,#2ECC9A,#27ae78)' : 'white',
                  border: isChosen || (feedback && isAns) ? '2.5px solid #2ECC9A' : wasWrong ? '2.5px solid #FF6B6B' : '2px solid rgba(91,79,232,0.2)',
                  borderRadius: 18, padding: '14px 10px', cursor: feedback ? 'not-allowed' : 'pointer',
                  textAlign: 'center', fontSize: 14, fontWeight: 900,
                  color: isChosen || (feedback && isAns) ? 'white' : wasWrong ? '#FF6B6B' : '#1A1040',
                  transition: 'all 0.18s', animation: `mmPop 0.3s ease ${i * 0.06}s both`,
                  boxShadow: isChosen || (feedback && isAns) ? '0 0 20px #2ECC9A44' : wasWrong ? '0 0 20px #FF6B6B33' : '0 2px 8px rgba(91,79,232,0.08)',
                  position: 'relative',
                }}>
                <div style={{ position: 'absolute', top: 4, left: 7, fontSize: 9, fontWeight: 900, color: isChosen || (feedback && isAns) ? 'rgba(255,255,255,0.7)' : wasWrong ? '#FF6B6B88' : '#9890C4' }}>{OPTION_LETTERS[i]}</div>
                {opt}
                {(isChosen || (feedback && isAns)) && <div style={{ fontSize: 14, marginTop: 2 }}>✅</div>}
                {wasWrong && <div style={{ fontSize: 14, marginTop: 2 }}>❌</div>}
              </button>
            );
          })}
        </div>

        {/* Hint button */}
        {!feedback && !showHint && q.hint && (
          <button onClick={() => setShowHint(true)}
            style={{ width: '100%', background: 'rgba(255,200,71,0.1)', border: '1.5px solid rgba(255,200,71,0.3)', borderRadius: 14, padding: '10px', fontSize: 12, fontWeight: 700, color: '#FFC847', cursor: 'pointer', marginBottom: 10 }}>
            💡 Show Hint
          </button>
        )}
        {showHint && !feedback && (
          <div style={{ background: '#FFC84716', border: '1.5px solid #FFC84744', borderRadius: 14, padding: '10px 14px', marginBottom: 10, animation: 'mmPop 0.3s ease' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#b45309' }}>💡 Hint: {q.hint}</span>
          </div>
        )}

        {/* Feedback + Explanation */}
        {feedback && (
          <div style={{ background: isCorrect ? '#E8FFF4' : '#FFF0F0', border: `2px solid ${isCorrect ? '#2ECC9A' : '#FF6B6B'}44`, borderRadius: 18, padding: '14px 16px', marginBottom: 12, animation: 'mmPop 0.35s ease' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: isCorrect ? '#2ECC9A' : '#FF6B6B', marginBottom: isCorrect ? 6 : 4 }}>
              {isCorrect ? BAZAAR_REACTIONS_CORRECT[Math.floor(Math.random() * BAZAAR_REACTIONS_CORRECT.length)] : BAZAAR_REACTIONS_WRONG[Math.floor(Math.random() * BAZAAR_REACTIONS_WRONG.length)]}
            </div>
            {isCorrect && coins > 0 && <div style={{ fontSize: 11, color: '#27ae78', fontWeight: 700, marginBottom: 6 }}>+{Math.round((1 + Math.floor((streak - 1) / 2)) * coinMult)} 🪙 earned!</div>}
            {/* Working explanation */}
            <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, fontWeight: 900, color: '#5A4E8A', marginBottom: 4, letterSpacing: 1 }}>📐 HOW TO SOLVE IT</div>
              <div style={{ fontSize: 12, color: '#1A1040', lineHeight: 1.7, fontWeight: 600 }}>{q.explain || q.hint}</div>
            </div>
            <button onClick={handleNext}
              style={{ width: '100%', marginTop: 12, background: `linear-gradient(155deg,${adventure.color}EE,${adventure.color}CC)`, border: 'none', borderRadius: 16, padding: '13px', color: 'white', fontSize: 14, fontWeight: 900, cursor: 'pointer', boxShadow: `0 4px 0 ${adventure.color}CC` }}>
              {qIdx + 1 >= total ? '🏁 See Results!' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  SPEED BLITZ — Timed mode with mixed scenarios
// ═══════════════════════════════════════════════════════════════════════
function SpeedBlitz({ child, onBack, onDone }) {
  const TOTAL_TIME = 60;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [questions] = useState(() => getSpeedBlitzQuestions(child.class_num, 15));
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [frozen, setFrozen] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [shuffled, setShuffled] = useState([]);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); onDone({ score: scoreRef.current, coins: coinsRef.current, total: qIdx, isSpeed: true }); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (questions[qIdx]) setShuffled([...(questions[qIdx].options || [])].sort(() => Math.random() - 0.5));
    setFeedback(null);
  }, [qIdx]);

  const q = questions[qIdx % questions.length] || questions[0];
  const pct = (timeLeft / TOTAL_TIME) * 100;
  const urgentColor = timeLeft <= 10 ? '#FF6B6B' : timeLeft <= 20 ? '#FFC847' : '#2ECC9A';

  function handleAnswer(opt) {
    if (feedback || frozen) return;
    const correct = String(opt).trim() === String(q.correct_answer).trim();
    if (correct) {
      SFX.correct();
      const earned = 1 + Math.floor(streak / 2);
      scoreRef.current += 1; coinsRef.current += earned;
      setScore(s => s + 1); setCoins(c => c + earned); setStreak(s => s + 1);
      setFeedback('correct'); setShowCoins(true);
      setTimeLeft(t => Math.min(TOTAL_TIME, t + 3));
      setTimeout(() => { setShowCoins(false); setFeedback(null); setQIdx(i => i + 1); }, 650);
    } else {
      SFX.wrong(); setStreak(0); setFeedback('wrong'); setFrozen(true);
      setTimeout(() => { setFeedback(null); setFrozen(false); }, 1800);
    }
  }

  const adv = BAZAAR_ADVENTURES.find(a => a.id === q.adventureId) || BAZAAR_ADVENTURES[0];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Nunito', sans-serif", paddingBottom: 20, position: 'relative', overflow: 'hidden' }}>
      <CoinShower active={showCoins} />
      {frozen && <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(59,130,246,0.1)', pointerEvents: 'none' }} />}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#ef444422,#f9731608)', borderBottom: '2px solid #ef444444', padding: '13px 15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <BackBtn onClick={onBack} color="#ef4444" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#ef4444' }}>⚡ SPEED BLITZ</div>
            {(() => { const gi = CLASS_GROUP_LABELS[getClassGroup(child.class_num)]; return <div style={{ fontSize: 10, color: '#9890C4', marginTop: 1 }}>{gi.emoji} {gi.label} · {gi.desc}</div>; })()}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ background: '#ef444420', borderRadius: 10, padding: '3px 9px', fontSize: 12, fontWeight: 900, color: '#ef4444' }}>{score} ✅</div>
            {streak > 1 && <div style={{ background: '#f9731620', borderRadius: 10, padding: '3px 9px', fontSize: 12, fontWeight: 900, color: '#f97316' }}>🔥{streak}</div>}
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: 999, height: 10, overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${urgentColor},${urgentColor}bb)`, borderRadius: 999, transition: 'width 1s linear', boxShadow: `0 0 8px ${urgentColor}88` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
          <span style={{ color: urgentColor, fontWeight: 900, fontSize: 15 }}>⏱ {timeLeft}s</span>
          <span style={{ color: '#9890C4' }}>+3s correct · freeze 2s wrong</span>
          <span style={{ color: '#FFC847', fontWeight: 900 }}>🪙{coins}</span>
        </div>
      </div>

      <div style={{ padding: '14px 15px', maxWidth: 480, margin: '0 auto' }}>
        {frozen && <div style={{ background: '#3b82f622', border: '2px solid #3b82f655', borderRadius: 14, padding: '10px', marginBottom: 12, textAlign: 'center', animation: 'mmPop 0.3s ease' }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#3b82f6' }}>❄️ Frozen for 2 seconds!</span>
        </div>}

        {/* Mini scene tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{ background: `${adv.color}18`, border: `1px solid ${adv.color}33`, borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 800, color: adv.color }}>{adv.emoji} {adv.name}</div>
        </div>

        {/* Scenario */}
        <div style={{ background: `${adv.color}14`, border: `2px solid ${adv.color}44`, borderRadius: 20, padding: '18px 16px', marginBottom: 12, textAlign: 'center', animation: 'mmSlideUp 0.25s ease' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1040', lineHeight: 1.65, marginBottom: 6 }}>{q.scenario}</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: adv.color }}>{q.question}</div>
        </div>

        {/* Options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {(shuffled.length ? shuffled : q.options).map((opt, i) => {
            const isAns = String(opt) === String(q.correct_answer);
            const wasWrong = feedback === 'wrong' && !isAns;
            return (
              <button key={i} onClick={() => handleAnswer(opt)} disabled={!!feedback || frozen}
                style={{ background: isAns && feedback === 'correct' ? 'linear-gradient(135deg,#2ECC9A,#27ae78)' : wasWrong ? '#FF6B6B1e' : `${adv.color}0d`, border: isAns && feedback === 'correct' ? '2.5px solid #2ECC9A' : wasWrong ? '2.5px solid #FF6B6B' : `2px solid ${adv.color}33`, borderRadius: 18, padding: '16px 8px', cursor: (feedback || frozen) ? 'not-allowed' : 'pointer', textAlign: 'center', fontSize: 17, fontWeight: 900, color: isAns && feedback === 'correct' ? 'white' : wasWrong ? '#FF6B6B' : '#1A1040', transition: 'all 0.15s', animation: `mmPop 0.25s ease ${i * 0.04}s both` }}>
                {opt}
              </button>
            );
          })}
        </div>

        {feedback === 'correct' && <div style={{ textAlign: 'center', marginTop: 10, padding: '8px', borderRadius: 12, background: '#2ECC9A14', animation: 'mmPop 0.3s ease' }}><span style={{ fontSize: 14, fontWeight: 900, color: '#2ECC9A' }}>⚡ +3 seconds bonus!</span></div>}
        {feedback === 'wrong' && q.hint && <div style={{ textAlign: 'center', marginTop: 10, padding: '8px 12px', borderRadius: 12, background: '#FF6B6B10', animation: 'mmPop 0.3s ease' }}><span style={{ fontSize: 12, fontWeight: 700, color: '#FF6B6B' }}>💡 Hint: {q.hint}</span></div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  RESULT SCREEN
// ═══════════════════════════════════════════════════════════════════════
function AdventureResult({ adventure, result, child, onReplay, onHub, onHome, isSpeed }) {
  const { score, total, coins, streak = 0, newAchievements = [] } = result;
  const stars = score === total ? 3 : score >= Math.ceil(total * 0.65) ? 2 : score > 0 ? 1 : 0;
  const [toastDismissed, setToastDismissed] = useState(false);
  const totalCoins = getBazaarTotalCoins(child.id);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Nunito', sans-serif", paddingBottom: 50, position: 'relative', overflow: 'hidden' }}>
      <CoinShower active={true} />
      <Starfield n={16} />
      {newAchievements.length > 0 && !toastDismissed && <AchievementToast achievements={newAchievements} onClose={() => setToastDismissed(true)} />}

      <div style={{ position: 'relative', zIndex: 2, padding: '30px 18px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 390 }}>

          {/* Main result card */}
          <div style={{ background: 'white', border: `2.5px solid ${adventure.color}44`, borderRadius: 28, padding: '28px 22px', textAlign: 'center', boxShadow: `0 8px 40px ${adventure.color}22, inset 0 1px 0 rgba(255,255,255,0.8)`, marginBottom: 14, animation: 'mmPop 0.5s ease' }}>
            <div style={{ fontSize: 72, marginBottom: 8, animation: 'mmBounce 1s ease' }}>
              {score === total ? '🏆' : stars >= 2 ? '🎉' : '👏'}
            </div>
            <div style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: 24, color: adventure.color, marginBottom: 4 }}>
              {score === total ? 'Perfect Score!' : stars >= 2 ? 'Great Job!' : 'Keep Going!'}
            </div>
            <div style={{ fontSize: 12, color: '#9890C4', marginBottom: 14 }}>
              {isSpeed ? 'Speed Blitz complete! 🔥' : `${adventure.name} complete!`}
            </div>

            {/* Stars */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
              {[1, 2, 3].map(s => (
                <span key={s} style={{ fontSize: 36, filter: s <= stars ? 'none' : 'grayscale(1) opacity(0.2)', animation: s <= stars ? `mmStarPop 0.4s ease ${(s - 1) * 0.15}s both` : 'none' }}>⭐</span>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[
                { e: '✅', v: `${score}${total ? '/' + total : ''}`, l: 'Correct', c: '#2ECC9A' },
                { e: '🪙', v: coins, l: 'Coins Earned', c: '#FFC847' },
                { e: '🔥', v: streak, l: 'Best Streak', c: '#f97316' },
              ].map((s, i) => (
                <div key={i} style={{ background: `${s.c}14`, border: `1.5px solid ${s.c}44`, borderRadius: 14, padding: '10px 6px' }}>
                  <div style={{ fontSize: 20 }}>{s.e}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 9, color: '#9890C4' }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Class level + what maths you used */}
            {!isSpeed && (
              <div style={{ background: '#F5F0FF', border: '1.5px solid rgba(91,79,232,0.15)', borderRadius: 14, padding: '10px 12px', marginBottom: 10, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#5B4FE8', letterSpacing: 0.5 }}>🎓 MATHS SKILLS USED TODAY</div>
                  {(() => { const gi = CLASS_GROUP_LABELS[getClassGroup(child.class_num)]; return (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(91,79,232,0.1)', borderRadius: 999, padding: '2px 8px' }}>
                      <span style={{ fontSize: 10 }}>{gi.emoji}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#5B4FE8' }}>{gi.label}</span>
                    </div>
                  ); })()}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {adventure.skills.map(s => <SkillChip key={s} label={s} color="#5B4FE8" />)}
                </div>
              </div>
            )}

            {/* Total coins so far */}
            <div style={{ background: '#FFC84714', border: '1px solid #FFC84744', borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🪙</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 10, color: '#9890C4' }}>Total coins earned</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#FFC847' }}>{totalCoins}</div>
              </div>
            </div>
          </div>

          {/* New achievements */}
          {newAchievements.length > 0 && (
            <div style={{ background: 'white', border: '1.5px solid #FFC84744', borderRadius: 20, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#FFC847', marginBottom: 10, letterSpacing: 1 }}>🏅 NEW BADGES EARNED!</div>
              {newAchievements.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${a.color}12`, border: `1.5px solid ${a.color}44`, borderRadius: 14, padding: '10px 12px', marginBottom: 8, animation: 'mmPop 0.4s ease' }}>
                  <span style={{ fontSize: 26 }}>{a.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: a.color }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: '#9890C4' }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Encouragement */}
          <div style={{ background: `${adventure.color}0a`, border: `1.5px solid ${adventure.color}22`, borderRadius: 16, padding: '12px 14px', marginBottom: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#5A4E8A', lineHeight: 1.7, fontWeight: 600 }}>
              {score === total
                ? '🌟 Excellent! You can solve real-life maths problems perfectly!'
                : stars >= 2
                ? '💪 Great work! Keep practising to become a real-life maths expert!'
                : '🚀 Good try! Every question you attempt makes you better at real-life maths!'}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={onReplay} style={{ background: `linear-gradient(155deg,${adventure.color}EE,${adventure.color}CC)`, border: 'none', borderRadius: 20, padding: '15px', color: 'white', fontSize: 14, fontWeight: 900, cursor: 'pointer', boxShadow: `0 4px 0 ${adventure.color}CC, 0 6px 16px ${adventure.color}35` }}>
              🔄 Play Again
            </button>
            <button onClick={onHub} style={{ background: 'white', border: `2px solid ${adventure.color}44`, borderRadius: 20, padding: '13px', color: '#1A1040', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(91,79,232,0.08)' }}>
              🌍 Try Another Adventure
            </button>
            <button onClick={onHome} style={{ background: 'transparent', border: '1.5px solid rgba(91,79,232,0.15)', borderRadius: 20, padding: '12px', color: '#9890C4', fontSize: 12, cursor: 'pointer' }}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  BADGES WALL
// ═══════════════════════════════════════════════════════════════════════
function BadgesWall({ child, onClose }) {
  const earned = getEarnedAchievements(child.id);
  const stats = getBazaarStats(child.id);
  const totalCoins = getBazaarTotalCoins(child.id);
  const pct = Math.round((earned.length / BAZAAR_ACHIEVEMENTS.length) * 100);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: C.bg, borderRadius: '24px 24px 0 0', padding: '20px 16px 40px', maxHeight: '92vh', overflowY: 'auto', animation: 'mmSlideUp 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 26 }}>🏅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: '#FFC847', fontWeight: 900, letterSpacing: 2, fontFamily: 'Nunito, sans-serif' }}>REAL LIFE MATHS</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: '#1A1040' }}>Badges Wall</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(91,79,232,0.2)', borderRadius: 8, padding: '5px 12px', color: '#9890C4', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>✕</button>
        </div>

        {/* Progress */}
        <div style={{ background: 'white', border: '1.5px solid rgba(255,200,71,0.4)', borderRadius: 14, padding: '12px 16px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
            <span style={{ fontWeight: 800, color: '#1A1040' }}>Badges Earned</span>
            <span style={{ color: '#FFC847', fontWeight: 900 }}>{earned.length}/{BAZAAR_ACHIEVEMENTS.length}</span>
          </div>
          <div style={{ background: '#F0ECFF', borderRadius: 999, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#5B4FE8,#9B59F5,#4BBDF5)', borderRadius: 999, transition: 'width 0.8s ease', boxShadow: '0 0 8px #5B4FE855' }} />
          </div>
          <div style={{ fontSize: 10, color: '#9890C4', marginTop: 4, textAlign: 'center' }}>{pct}% complete</div>
        </div>

        {/* Class level info */}
        {(() => {
          const g = getClassGroup(child.class_num); const gi = CLASS_GROUP_LABELS[g];
          const nextGi = CLASS_GROUP_LABELS[g + 1];
          return (
            <div style={{ background: 'linear-gradient(135deg,rgba(91,79,232,0.1),rgba(155,89,245,0.06))', border: '1.5px solid rgba(91,79,232,0.2)', borderRadius: 16, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(91,79,232,0.12)', border: '1.5px solid rgba(91,79,232,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{gi.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: '#9890C4', fontWeight: 900, letterSpacing: 1 }}>YOUR LEVEL</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#5B4FE8', marginTop: 1 }}>{gi.label}</div>
                <div style={{ fontSize: 10, color: '#9890C4', marginTop: 2 }}>{gi.desc}</div>
              </div>
              {nextGi && <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 8, color: '#9890C4', marginBottom: 2 }}>NEXT LEVEL</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#9890C4' }}>{nextGi.emoji} {nextGi.label}</div>
              </div>}
            </div>
          );
        })()}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
          {[
            { e: '✅', v: stats.totalCorrect, l: 'Correct', c: '#2ECC9A' },
            { e: '🔥', v: stats.bestStreak, l: 'Best Streak', c: '#f97316' },
            { e: '⚡', v: stats.speedRounds, l: 'Speed Blitz', c: '#ef4444' },
            { e: '🌍', v: (stats.adventuresPlayed || []).length, l: 'Adventures', c: '#5B4FE8' },
            { e: '📅', v: stats.dailyStreak, l: 'Day Streak', c: '#4BBDF5' },
            { e: '🪙', v: totalCoins, l: 'Total Coins', c: '#FFC847' },
          ].map((s, i) => (
            <div key={i} style={{ background: `${s.c}10`, border: `1px solid ${s.c}33`, borderRadius: 12, padding: '8px 5px', textAlign: 'center' }}>
              <div style={{ fontSize: 16 }}>{s.e}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 9, color: '#9890C4' }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 10, color: '#9890C4', fontWeight: 900, letterSpacing: 1, marginBottom: 10 }}>ALL BADGES ({BAZAAR_ACHIEVEMENTS.length})</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {BAZAAR_ACHIEVEMENTS.map((a, i) => {
            const isEarned = earned.includes(a.id);
            return (
              <div key={a.id} style={{ background: isEarned ? `${a.color}16` : 'rgba(0,0,0,0.03)', border: `1.5px solid ${isEarned ? a.color + '55' : a.color + '18'}`, borderRadius: 16, padding: '12px 8px', textAlign: 'center', opacity: isEarned ? 1 : 0.5, transition: 'all 0.2s', animation: isEarned ? `mmPop 0.4s ease ${(i % 6) * 0.05}s both` : 'none' }}>
                <div style={{ fontSize: 28, marginBottom: 4, filter: isEarned ? 'none' : 'grayscale(1) opacity(0.35)' }}>{a.emoji}</div>
                <div style={{ fontSize: 10, fontWeight: 900, color: isEarned ? a.color : '#9890C4', lineHeight: 1.3 }}>{a.name}</div>
                {isEarned ? <div style={{ fontSize: 8, color: '#9890C4', marginTop: 3, lineHeight: 1.4 }}>{a.desc}</div>
                  : <div style={{ fontSize: 9, color: '#9890C4', marginTop: 3 }}>🔒 Locked</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  MASTER ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════
export function BazaarScreen({ child, onBack }) {
  const [step, setStep] = useState('hub');
  const [adventure, setAdventure] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [isDaily, setIsDaily] = useState(false);
  const [dailyScenario, setDailyScenario] = useState(null);
  const [isSpeed, setIsSpeed] = useState(false);
  const [showBadges, setShowBadges] = useState(false);

  function startAdventure(adv, daily = false, ds = null) {
    setAdventure(adv);
    setIsDaily(daily);
    setDailyScenario(ds);
    setIsSpeed(false);
    const qs = getAdventureQuestionsForChild(adv.id, child.class_num, child.id, 8);
    setQuestions(qs);
    setStep('intro');
  }

  function startDaily(ds) {
    const adv = BAZAAR_ADVENTURES.find(a => a.id === ds.adventure) || BAZAAR_ADVENTURES[0];
    startAdventure(adv, true, ds);
  }

  function startSpeedBlitz() {
    setIsSpeed(true);
    setAdventure({ id: 'speed', name: 'Speed Blitz', emoji: '⚡', color: '#ef4444', skills: ['All'] });
    setStep('speed');
  }

  function handleGameDone(r) {
    const ad = adventure || BAZAAR_ADVENTURES[0];
    addBazaarCoins(child.id, r.coins || 0);
    updateWeeklyLeague(child.id, r.coins || 0);
    if (isSpeed) {
      updateBazaarStats(child.id, { speedRounds: 1 });
      setStatMax(child.id, 'speedBestScore', r.score || 0);
    } else {
      updateBazaarStats(child.id, {
        totalCorrect: r.score || 0,
        perfectRounds: r.score === r.total ? 1 : 0,
        adventuresPlayed: ad.id,
      });
      setStatMax(child.id, 'bestStreak', r.streak || 0);
    }
    if (isDaily) markDailyChallengeComplete(child.id);
    const newAch = checkAndAwardAchievements(child.id);
    setResult({ ...r, child, newAchievements: newAch });
    setStep('result');
  }

  const currentAdventure = adventure || BAZAAR_ADVENTURES[0];

  if (showBadges) return <><BadgesWall child={child} onClose={() => setShowBadges(false)} /></>;

  if (step === 'hub') return <AdventureHub child={child} onBack={onBack} onAdventure={a => startAdventure(a)} onDaily={startDaily} onSpeedBlitz={startSpeedBlitz} onBadges={() => setShowBadges(true)} />;
  if (step === 'intro') return <AdventureIntro adventure={currentAdventure} child={child} isDaily={isDaily} dailyScenario={dailyScenario} onBack={() => setStep('hub')} onStart={() => setStep('game')} />;
  if (step === 'game') return <AdventureGame adventure={currentAdventure} questions={questions} child={child} isDaily={isDaily} dailyScenario={dailyScenario} onBack={() => setStep('intro')} onDone={handleGameDone} />;
  if (step === 'speed') return <SpeedBlitz child={child} onBack={() => setStep('hub')} onDone={handleGameDone} />;
  if (step === 'result') return <AdventureResult adventure={currentAdventure} result={result} child={child} isSpeed={isSpeed} onReplay={() => isSpeed ? setStep('speed') : setStep('game')} onHub={() => setStep('hub')} onHome={onBack} />;
  return null;
}