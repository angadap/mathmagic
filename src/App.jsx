// src/App.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Root router. Owns global state (screen, user, child, world, lesson).
// Every component lives in its own file; nothing is defined here.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Theme / colours ──────────────────────────────────────────────────────────
import { THEMES, C, updateC }                  from './constants/themes.js';

// ── Game data ─────────────────────────────────────────────────────────────────
import { WORLDS }                               from './constants/gameData.js';

// ── API client ────────────────────────────────────────────────────────────────
import { db }                                   from './lib/db.js';

// ── Layout / global chrome ────────────────────────────────────────────────────
import { GlobalStyles, OfflineBanner }          from './components/layout/layout.jsx';

// ── Entry / Auth ──────────────────────────────────────────────────────────────
import { Splash }                               from './components/screens/Entry.jsx';
import { EntryScreen, StudentEntry }            from './components/screens/Entry.jsx';
import { Welcome, Register, Login, HomeStudentLogin }             from './components/screens/Auth.jsx';
import { RegPayment, LessonPayment, Paywall }   from './components/screens/Payment.jsx';

// ── Main screens ──────────────────────────────────────────────────────────────
import { Home }                                 from './components/screens/Home.jsx';
import { LessonMap }                            from './components/screens/LessonMap.jsx';
import { Game }                                 from './components/screens/Game.jsx';
import { Abacus }                               from './components/screens/Abacus.jsx';
import { Olympiad }                             from './components/screens/Olympiad.jsx';
import { ParentDash }                           from './components/screens/ParentDash.jsx';
import { BazaarScreen }                         from './components/bazaar/BazaarScreen.jsx';
import { FeedbackScreen }                       from './components/screens/Feedback.jsx';
import { RatingPrompt }                         from './components/screens/Feedback.jsx';
import { DailyQuestHub }                        from './components/screens/Daily.jsx';
import { Settings, TermsOfService, DataPolicy, PrivacyPolicy } from './components/screens/Settings.jsx';
import { ShopScreen, BadgesScreen, CharacterScreen } from './components/screens/ShopBadgesCharacter.jsx';

// ── Games hub ─────────────────────────────────────────────────────────────────
import { GamesHub }                             from './components/games/GamesHub.jsx';

// ── Teacher / school ──────────────────────────────────────────────────────────
import { TeacherLogin, TeacherDashboard }       from './components/teacher/TeacherScreens.jsx';
import { StudentLogin }                         from './components/teacher/TeacherExtras.jsx';
import { AdminPanel }                           from './components/admin/AdminPanel.jsx';

// ── Shared utilities ──────────────────────────────────────────────────────────
import { SOSButton, FreezeDetector }            from './components/shared/shared.jsx';
import { ErrorBoundary, UpdatePrompt }          from './components/shared/ErrorBoundary.jsx';

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  // ── Theme ───────────────────────────────────────────────────────────────────
  const [themeKey, setThemeKey] = useState(
    localStorage.getItem('mm_theme') || 'bright'
  );
  const handleThemeChange = (key) => {
    updateC(key);
    localStorage.setItem('mm_theme', key);
    setThemeKey(key);
  };

  // ── Navigation ───────────────────────────────────────────────────────────────
  const [screen,          setScreen]          = useState('splash');
  const [prevScreen,      setPrevScreen]      = useState('home');

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const [user,            setUser]            = useState(null);
  const [child,           setChild]           = useState(null);
  const [teacher,         setTeacher]         = useState(null);
  const [schoolStudent,   setSchoolStudent]   = useState(null); // eslint-disable-line no-unused-vars

  // ── Content ──────────────────────────────────────────────────────────────────
  const [world,           setWorld]           = useState(null);
  const [lesson,          setLesson]          = useState(null);

  // ── Purchases ────────────────────────────────────────────────────────────────
  const [purchasedLessons, setPurchasedLessons] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mm_purchased') || '[]'); }
    catch { return []; }
  });
  const [lessonToBuy,     setLessonToBuy]     = useState(null);

  // ── Badge / shop ─────────────────────────────────────────────────────────────
  const [newBadges,       setNewBadges]       = useState([]);
  const [badgeTab,        setBadgeTab]        = useState('all');

  // ── UI overlays ──────────────────────────────────────────────────────────────
  const [showRating,      setShowRating]      = useState(false);
  const [feedbackPrefill, setFeedbackPrefill] = useState(null);
  const [swUpdateReady,   setSwUpdateReady]   = useState(false);
  const swRegRef = useRef(null);

  // ── Razorpay key fetch on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_rzp_key' }),
    })
      .then(r => r.json())
      .then(d => { if (d.key) window.__RZP_KEY__ = d.key; })
      .catch(() => {});
  }, []);

  // ── Service-worker update banner ─────────────────────────────────────────────
  useEffect(() => {
    const onUpdate = (e) => {
      swRegRef.current = e.detail?.reg;
      setSwUpdateReady(true);
    };
    document.addEventListener('mm_sw_update', onUpdate);
    return () => document.removeEventListener('mm_sw_update', onUpdate);
  }, []);
  const applySwUpdate = () => {
    const reg = swRegRef.current;
    if (reg?.waiting) reg.waiting.postMessage('SKIP_WAITING');
    setSwUpdateReady(false);
  };

  // ── Expose setScreen globally (needed by nested Login) ──────────────────────
  useEffect(() => {
    window._setScreen = setScreen;
    return () => { delete window._setScreen; };
  }, [setScreen]);

  // ── Scroll to top on every navigation ───────────────────────────────────────
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  // ── Android hardware-back support ────────────────────────────────────────────
  useEffect(() => {
    window.history.pushState({ mm: true }, '');
    const handleBack = (e) => {
      e.preventDefault();
      setScreen(s => {
        const backMap = {
          game: 'lessons', lessons: 'home', paywall: 'home',
          abacus: 'home', olympiad: 'home', parent: 'home',
          games: 'home', register: 'welcome', login: 'welcome',
        };
        return backMap[s] || 'welcome';
      });
      setTimeout(() => window.history.pushState({ mm: true }, ''), 0);
    };
    window.addEventListener('popstate', handleBack);
    return () => window.removeEventListener('popstate', handleBack);
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const goFeedback = (prefillCat = null) => {
    setPrevScreen(screen);
    setFeedbackPrefill(prefillCat);
    setScreen('feedback');
  };

  const logout = async () => {
    await db.signOut();
    setUser(null); setChild(null); setWorld(null); setLesson(null);
    db.track('logout', child?.id, user?.id, {});
    setScreen('entry');
  };

  const isLessonPurchased = (worldId, lessonId) => {
    if (parseInt(child?.class_num || 1) === parseInt(worldId)) return true;
    if (child?.is_premium) return true;
    return purchasedLessons.includes(lessonId);
  };

  const purchaseLesson = (lessonId, worldId, price = 300) => {
    setLessonToBuy({ lessonId, worldId, price });
    setScreen('lesson_payment');
  };

  const confirmLessonPurchased = (lessonId) => {
    const updated = [...purchasedLessons, lessonId];
    setPurchasedLessons(updated);
    localStorage.setItem('mm_purchased', JSON.stringify(updated));
  };

  const goWorld = (cw) => {
    setWorld(cw);
    setScreen('lessons');
  };

  const handleUnlock = useCallback(async () => {
    await db.setPremium(child.id);
    setChild(c => ({ ...c, is_premium: true }));
    setScreen('lessons');
  }, [child]);

  const showSOS = ['home', 'game', 'abacus', 'olympiad', 'lessons', 'games'].includes(screen);

  // ── SW update banner portal ──────────────────────────────────────────────────
  const SwUpdatePortal = swUpdateReady ? (
    <UpdatePrompt onUpdate={applySwUpdate} onDismiss={() => setSwUpdateReady(false)} />
  ) : null;

  // ── Router ───────────────────────────────────────────────────────────────────
  if (screen === 'splash')
    return <><GlobalStyles /><Splash onDone={() => setScreen('entry')} /></>;

  if (screen === 'entry')
    return <><GlobalStyles />{SwUpdatePortal}<EntryScreen onSelect={s => setScreen(s)} /></>;

  if (screen === 'student_entry')
    return <><GlobalStyles />{SwUpdatePortal}<StudentEntry onBack={() => setScreen('entry')} onSelect={s => setScreen(s)} /></>;

  if (screen === 'welcome')
    return <><GlobalStyles />{SwUpdatePortal}<Welcome
      onRegister={() => setScreen('register')}
      onLogin={() => setScreen('login')}
      onPrivacy={() => { setPrevScreen('welcome'); setScreen('privacy'); }}
    /></>;

  if (screen === 'reg_payment')
    return <><GlobalStyles />{SwUpdatePortal}<RegPayment onBack={() => setScreen('student_entry')} onPaid={() => setScreen('register')} /></>;

  if (screen === 'register')
    return <><GlobalStyles />{SwUpdatePortal}<Register
      onBack={() => setScreen('student_entry')}
      onDone={({ user: u, child: c, requirePayment }) => {
        setUser(u); setChild(c);
        setWorld(WORLDS.find(w => w.id === parseInt(c?.class_num || 1)) || WORLDS[0]);
        setScreen(requirePayment ? 'paywall' : 'home');
      }}
    /></>;

  if (screen === 'login')
    return <><GlobalStyles />{SwUpdatePortal}<Login
      onBack={() => setScreen('student_entry')}
      onDone={({ user: u, child: c }) => { setUser(u); setChild(c); setScreen('home'); }}
    /></>;

  if (screen === 'home_student_login')
    return <><GlobalStyles />{SwUpdatePortal}<HomeStudentLogin
      onBack={() => setScreen('student_entry')}
      onDone={({ user: u, child: c }) => { setUser(u); setChild(c); setScreen('home'); }}
    /></>;

  if (screen === 'home')
    return <><GlobalStyles />{SwUpdatePortal}
      <Home
        child={child} isLessonPurchased={isLessonPurchased}
        onWorld={goWorld} onAbacus={() => setScreen('abacus')}
        onGames={() => setScreen('games')} onOlympiad={() => setScreen('olympiad')}
        onParent={() => setScreen('parent')} onBazaar={() => setScreen('bazaar')}
        onRate={() => setShowRating(true)} onLogout={logout}
        onFeedback={goFeedback} onSettings={() => setScreen('settings')}
        onThemeChange={handleThemeChange} onShop={() => setScreen('shop')}
        onBadges={() => setScreen('badges')} onCharacter={() => setScreen('character')}
      />
      {showRating && <RatingPrompt child={child} onClose={() => setShowRating(false)} />}
      <FreezeDetector currentScreen={screen} child={child} onReport={goFeedback} />
    </>;

  if (screen === 'paywall')
    return <><GlobalStyles />{SwUpdatePortal}<Paywall
      world={world || WORLDS[(child?.class_num || 1) - 1] || WORLDS[0]}
      child={child} onBack={() => setScreen('home')} onUnlock={handleUnlock}
    /></>;

  if (screen === 'lesson_payment')
    return <><GlobalStyles />{SwUpdatePortal}<LessonPayment
      lessonToBuy={lessonToBuy} child={child} user={user}
      onBack={() => setScreen('lessons')}
      onPaid={lid => { confirmLessonPurchased(lid); setScreen('lessons'); }}
    /></>;

  if (screen === 'lessons')
    return <><GlobalStyles />{SwUpdatePortal}<LessonMap
      world={world} child={child}
      onBack={() => setScreen('home')}
      isLessonPurchased={isLessonPurchased}
      onPurchaseLesson={purchaseLesson}
      onLesson={l => { setLesson(l); setScreen('game'); }}
    /></>;

  if (screen === 'game')
    return <><GlobalStyles />{SwUpdatePortal}
      <Game
        lesson={lesson} world={world} child={child} setChild={setChild}
        newBadges={newBadges} setNewBadges={setNewBadges}
        onBack={() => { db.track('lesson_exit', child?.id, null, { lesson_id: lesson?.id, set_index: lesson?.setIndex }); setScreen('lessons'); }}
        onDone={() => { db.track('lesson_complete', child?.id, null, { lesson_id: lesson?.id, set_index: lesson?.setIndex }); setScreen('lessons'); }}
        onNextSet={si => { db.track('set_advance', child?.id, null, { lesson_id: lesson?.id, set_index: si }); setLesson(l => ({ ...l, setIndex: si })); }}
      />
      {showSOS && <SOSButton onClick={() => goFeedback('bug')} />}
      <FreezeDetector currentScreen={screen} child={child} onReport={goFeedback} />
    </>;

  if (screen === 'abacus')
    return <><GlobalStyles />{SwUpdatePortal}
      <Abacus onBack={() => setScreen('home')} child={child} />
      {showSOS && <SOSButton onClick={() => goFeedback('bug')} />}
      <FreezeDetector currentScreen={screen} child={child} onReport={goFeedback} />
    </>;

  if (screen === 'olympiad')
    return <><GlobalStyles />{SwUpdatePortal}
      <Olympiad child={child} setChild={setChild} onBack={() => setScreen('home')} />
      {showSOS && <SOSButton onClick={() => goFeedback('bug')} />}
      <FreezeDetector currentScreen={screen} child={child} onReport={goFeedback} />
    </>;

  if (screen === 'parent')
    return <><GlobalStyles />{SwUpdatePortal}<ParentDash child={child} onBack={() => setScreen('home')} /></>;

  if (screen === 'bazaar')
    return <><GlobalStyles />{SwUpdatePortal}<BazaarScreen child={child} onBack={() => setScreen('home')} /></>;

  if (screen === 'feedback')
    return <><GlobalStyles />{SwUpdatePortal}<FeedbackScreen
      child={child} currentScreen={prevScreen} prefillCategory={feedbackPrefill}
      onBack={() => setScreen(prevScreen)}
    /></>;

  if (screen === 'games')
    return <><GlobalStyles />{SwUpdatePortal}<GamesHub child={child} onBack={() => setScreen('home')} /></>;

  if (screen === 'student_login')
    return <><GlobalStyles />{SwUpdatePortal}<StudentLogin
      onBack={() => setScreen('student_entry')}
      onDone={async s => {
        setSchoolStudent(s);
        let schoolName = '';
        try {
          const sr = await fetch('/api/admin', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer angadadmin@2026'}, body:JSON.stringify({action:'admin_list_schools'}) });
          const sd = await sr.json();
          const found = (sd.data||[]).find(sc => sc.id === s.school_id);
          if (found) schoolName = found.name;
        } catch(e) {}
        setChild({ ...s, id: s.id, name: s.name, avatar: '🧒', class_num: s.class_num, xp: s.xp || 0, coins: s.coins || 0, level: s.level || 1, streak_days: s.streak_days || 0, is_school_student: true, school_name: schoolName, section: s.section || '' });
        setScreen('home');
      }}
    /></>;

  if (screen === 'teacher_login')
    return <><GlobalStyles />{SwUpdatePortal}<TeacherLogin
      onBack={() => setScreen('entry')}
      onDone={t => {
        const tObj = { ...t, permissions: Array.isArray(t.permissions) ? t.permissions : [] };
        setTeacher(tObj);
        localStorage.setItem('mm_teacher_session', JSON.stringify(tObj));
        setScreen('teacher_dash');
      }}
    /></>;

  if (screen === 'teacher_dash')
    return <><GlobalStyles />{SwUpdatePortal}<TeacherDashboard
      teacher={teacher}
      onLogout={() => { setTeacher(null); setScreen('entry'); }}
    /></>;

  if (screen === 'admin_panel')
    return <><GlobalStyles />{SwUpdatePortal}<AdminPanel onBack={() => setScreen('entry')} /></>;

  if (screen === 'privacy')
    return <><GlobalStyles />{SwUpdatePortal}<PrivacyPolicy onBack={() => setScreen('settings')} /></>;

  if (screen === 'terms')
    return <><GlobalStyles />{SwUpdatePortal}<TermsOfService onBack={() => setScreen('settings')} /></>;

  if (screen === 'datapolicy')
    return <><GlobalStyles />{SwUpdatePortal}<DataPolicy onBack={() => setScreen('settings')} /></>;

  if (screen === 'settings')
    return <><GlobalStyles />{SwUpdatePortal}<Settings
      child={child} user={user}
      onThemeChange={handleThemeChange}
      onBack={dest => {
        if (dest === 'rate') setShowRating(true);
        else if (dest) setScreen(dest);
        else setScreen('home');
      }}
      onLogout={logout}
    /></>;

  if (screen === 'shop')
    return <><GlobalStyles />{SwUpdatePortal}<ShopScreen child={child} setChild={setChild} onBack={() => setScreen('home')} /></>;

  if (screen === 'badges')
    return <><GlobalStyles />{SwUpdatePortal}<BadgesScreen child={child} badgeTab={badgeTab} setBadgeTab={setBadgeTab} onBack={() => setScreen('home')} /></>;

  if (screen === 'character')
    return <><GlobalStyles />{SwUpdatePortal}<CharacterScreen child={child} setChild={setChild} onBack={() => setScreen('home')} /></>;

  return <><GlobalStyles />{SwUpdatePortal}<OfflineBanner /></>;
}