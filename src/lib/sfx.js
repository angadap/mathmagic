export const SFX = {
  enabled: true,
  volume: 0.7,
  _ctx: null,
  _master: null,
  _reverb: null,

  init() {
    try {
      if (this._ctx) {
        if (this._ctx.state === 'suspended') this._ctx.resume();
        return;
      }
      this.enabled = localStorage.getItem('mm_sfx_enabled') !== 'false';
      const stored = parseFloat(localStorage.getItem('mm_sfx_volume'));
      if (!isNaN(stored)) this.volume = stored;

      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._master = this._ctx.createGain();
      this._master.gain.value = this.volume;
      this._master.connect(this._ctx.destination);
      this._reverb = _mkReverb(this._ctx, this._master, 2.5, 2.0);
    } catch (e) {}
  },

  setVolume(v) {
    try {
      this.volume = Math.max(0, Math.min(1, v));
      if (this._master) this._master.gain.value = this.volume;
      localStorage.setItem('mm_sfx_volume', this.volume);
    } catch (e) {}
  },

  mute() {
    try {
      this.enabled = false;
      localStorage.setItem('mm_sfx_enabled', 'false');
    } catch (e) {}
  },

  unmute() {
    try {
      this.enabled = true;
      localStorage.setItem('mm_sfx_enabled', 'true');
    } catch (e) {}
  },

  toggle() {
    try {
      if (this.enabled) this.mute(); else this.unmute();
    } catch (e) {}
  },

  // UI & Navigation
  tap() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(600, t);
      o.frequency.exponentialRampToValueAtTime(400, t + 0.08);
      const g = c.createGain(); g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      o.connect(g); g.connect(this._master);
      o.start(t); o.stop(t + 0.09);
    } catch (e) {}
  },

  transition() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(200, t);
      o.frequency.exponentialRampToValueAtTime(800, t + 0.18);
      const g = c.createGain(); g.gain.setValueAtTime(0.0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.connect(g); g.connect(this._reverb); g.connect(this._master);
      o.start(t); o.stop(t + 0.2);
    } catch (e) {}
  },

  modalOpen() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(500, t + 0.15);
      const g = c.createGain(); g.gain.setValueAtTime(0.0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g); g.connect(this._master);
      o.start(t); o.stop(t + 0.22);
      _osc(c, 'sine', 1200, t + 0.1, 0.06, 0.08, this._master);
      _osc(c, 'sine', 1600, t + 0.14, 0.04, 0.06, this._master);
    } catch (e) {}
  },

  navTab() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _osc(c, 'sine', 700, t, 0.04, 0.08, this._master);
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(400, t + 0.02);
      o.frequency.exponentialRampToValueAtTime(700, t + 0.08);
      const g = c.createGain(); g.gain.setValueAtTime(0.06, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      o.connect(g); g.connect(this._master);
      o.start(t + 0.02); o.stop(t + 0.1);
    } catch (e) {}
  },

  // Auth
  pinDigit() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _osc(c, 'sine', 440, t, 0.12, 0.15, this._master);
      _osc(c, 'sine', 880, t, 0.06, 0.12, this._master);
    } catch (e) {}
  },

  pinSuccess() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _chord(c, [523, 659, 784], 'sine', t, 0.4, 0.18, this._reverb);
      _chord(c, [523, 659, 784], 'sine', t, 0.4, 0.08, this._master);
    } catch (e) {}
  },

  pinFail() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(400, t);
      o.frequency.exponentialRampToValueAtTime(80, t + 0.45);
      const lfo = c.createOscillator(); lfo.frequency.value = 12;
      const lfoG = c.createGain(); lfoG.gain.value = 18;
      lfo.connect(lfoG); lfoG.connect(o.frequency);
      const g = c.createGain(); g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.connect(g); g.connect(this._master);
      lfo.start(t); o.start(t); lfo.stop(t + 0.52); o.stop(t + 0.52);
    } catch (e) {}
  },

  pinLocked() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      const o = c.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(80, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.28);
      const g = c.createGain(); g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g); g.connect(this._master);
      o.start(t); o.stop(t + 0.32);
    } catch (e) {}
  },

  // Home
  homeLoad() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      [55, 82, 110].forEach((f, i) => {
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = c.createGain();
        g.gain.setValueAtTime(0.0, t);
        g.gain.linearRampToValueAtTime(0.12 - i * 0.02, t + 0.6);
        g.gain.setValueAtTime(0.12 - i * 0.02, t + 0.9);
        g.gain.linearRampToValueAtTime(0.0, t + 1.5);
        o.connect(g); g.connect(this._master);
        o.start(t); o.stop(t + 1.6);
      });
    } catch (e) {}
  },

  xpShimmer() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      [659, 784, 880, 988, 1047, 1175, 1319].forEach((f, i) => {
        _osc(c, 'sine', f, t + i * 0.065, 0.09, 0.12, this._master);
      });
    } catch (e) {}
  },

  streakFire() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      const o = c.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(100, t);
      o.frequency.exponentialRampToValueAtTime(600, t + 0.35);
      const g = c.createGain(); g.gain.setValueAtTime(0.0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.connect(g); g.connect(this._master);
      o.start(t); o.stop(t + 0.42);
      _chord(c, [523, 659, 784], 'sine', t + 0.3, 0.3, 0.14, this._master);
    } catch (e) {}
  },

  worldSelect() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _osc(c, 'sine', 220, t, 0.22, 0.8, this._master);
      _osc(c, 'sine', 440, t + 0.01, 0.1, 0.6, this._master);
      _osc(c, 'sine', 660, t + 0.02, 0.06, 0.4, this._master);
      _osc(c, 'sine', 220, t, 0.15, 0.8, this._reverb);
    } catch (e) {}
  },

  // Lesson Map
  lessonNode() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _osc(c, 'sine', 880, t, 0.14, 0.2, this._master);
      _osc(c, 'sine', 1760, t, 0.06, 0.15, this._master);
    } catch (e) {}
  },

  lockedNode() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(200, t);
      o.frequency.exponentialRampToValueAtTime(60, t + 0.22);
      const g = c.createGain(); g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.connect(g); g.connect(this._master);
      o.start(t); o.stop(t + 0.27);
    } catch (e) {}
  },

  bubblePop() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _noise(c, t, 0.05, 0.06, this._master);
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(1200, t + 0.01);
      o.frequency.exponentialRampToValueAtTime(800, t + 0.14);
      const g = c.createGain(); g.gain.setValueAtTime(0.14, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.connect(g); g.connect(this._master);
      o.start(t + 0.01); o.stop(t + 0.16);
    } catch (e) {}
  },

  // Game — Quiz
  questionAppear() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      const len = Math.ceil(c.sampleRate * 0.15);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource(); src.buffer = buf;
      const filt = c.createBiquadFilter(); filt.type = 'bandpass';
      filt.frequency.setValueAtTime(400, t);
      filt.frequency.exponentialRampToValueAtTime(2000, t + 0.15);
      filt.Q.value = 1.5;
      const g = c.createGain(); g.gain.value = 0.12;
      src.connect(filt); filt.connect(g); g.connect(this._master);
      src.start(t); src.stop(t + 0.16);
    } catch (e) {}
  },

  correct() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _chord(c, [523, 659, 784], 'sine', t, 0.5, 0.15, this._reverb);
      _chord(c, [523, 659, 784], 'sine', t, 0.5, 0.08, this._master);
      [1047, 1175, 1319].forEach((f, i) => _osc(c, 'sine', f, t + 0.2 + i * 0.06, 0.06, 0.1, this._master));
    } catch (e) {}
  },

  wrong() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      [120, 90, 60].forEach((f, i) => _osc(c, 'sine', f, t + i * 0.12, 0.14, 0.15, this._master));
    } catch (e) {}
  },

  hintReveal() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(600, t);
      o.frequency.exponentialRampToValueAtTime(1200, t + 0.5);
      const lfo = c.createOscillator(); lfo.frequency.value = 6;
      const lfoG = c.createGain(); lfoG.gain.value = 30;
      lfo.connect(lfoG); lfoG.connect(o.frequency);
      const g = c.createGain(); g.gain.setValueAtTime(0.0, t);
      g.gain.linearRampToValueAtTime(0.16, t + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.connect(g); g.connect(this._master);
      lfo.start(t); o.start(t); lfo.stop(t + 0.52); o.stop(t + 0.52);
    } catch (e) {}
  },

  hintEmpty() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _osc(c, 'sine', 300, t, 0.1, 0.1, this._master);
    } catch (e) {}
  },

  timerTick() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _osc(c, 'square', 800, t, 0.05, 0.08, this._master);
    } catch (e) {}
  },

  timerUrgent() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _osc(c, 'square', 1000, t, 0.04, 0.06, this._master);
      _osc(c, 'square', 1000, t + 0.04, 0.04, 0.06, this._master);
    } catch (e) {}
  },

  timeOut() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      [880, 659, 523].forEach((f, i) => _osc(c, 'sine', f, t + i * 0.4, 0.38, 0.2, this._master));
    } catch (e) {}
  },

  // Game — Bubble
  bubbleCorrect() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _noise(c, t, 0.05, 0.08, this._master);
      _osc(c, 'sine', 1200, t + 0.02, 0.1, 0.15, this._master);
    } catch (e) {}
  },

  bubbleWrong() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _noise(c, t, 0.08, 0.12, this._master);
      _osc(c, 'sine', 80, t + 0.04, 0.16, 0.18, this._master);
    } catch (e) {}
  },

  bubblesAppear() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      for (let i = 0; i < 6; i++) {
        const delay = Math.random() * 0.4;
        const freq = 800 + Math.random() * 600;
        _noise(c, t + delay, 0.04, 0.06, this._master);
        _osc(c, 'sine', freq, t + delay + 0.01, 0.06, 0.07, this._master);
      }
    } catch (e) {}
  },

  // Result
  starAppear() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      [[784, 0], [880, 0.3], [1047, 0.6]].forEach(([f, d]) => {
        _osc(c, 'sine', f, t + d, 0.12, 0.2, this._master);
      });
    } catch (e) {}
  },

  perfectScore() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      [261, 329, 392, 523].forEach((f, i) => {
        _osc(c, 'sawtooth', f, t + i * 0.12, 1.0, 0.14, this._reverb);
        _osc(c, 'sawtooth', f, t + i * 0.12, 1.0, 0.07, this._master);
      });
    } catch (e) {}
  },

  goodScore() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      [392, 440, 494, 587, 659, 784].forEach((f, i) => {
        _osc(c, 'sine', f, t + i * 0.1, 0.15, 0.15, this._master);
      });
    } catch (e) {}
  },

  shareResult() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(300, t);
      o.frequency.exponentialRampToValueAtTime(1200, t + 0.2);
      const g = c.createGain(); g.gain.setValueAtTime(0.0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g); g.connect(this._master);
      o.start(t); o.stop(t + 0.22);
    } catch (e) {}
  },

  // Boss Battle
  bossAwakens() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      const o = c.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(40, t);
      o.frequency.linearRampToValueAtTime(120, t + 0.6);
      o.frequency.linearRampToValueAtTime(60, t + 1.2);
      const lfo = c.createOscillator(); lfo.frequency.value = 8;
      const lfoG = c.createGain(); lfoG.gain.value = 10;
      lfo.connect(lfoG); lfoG.connect(o.frequency);
      const g = c.createGain(); g.gain.setValueAtTime(0.0, t);
      g.gain.linearRampToValueAtTime(0.28, t + 0.1);
      g.gain.setValueAtTime(0.28, t + 1.0);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      o.connect(g); g.connect(this._reverb); g.connect(this._master);
      lfo.start(t); o.start(t); lfo.stop(t + 1.25); o.stop(t + 1.25);
    } catch (e) {}
  },

  bossTension() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      for (let i = 0; i < 3; i++) {
        const s = t + i * 0.5;
        _osc(c, 'sawtooth', 55, s, 0.2, 0.2, this._master);
        _osc(c, 'sawtooth', 82, s + 0.02, 0.2, 0.14, this._master);
      }
    } catch (e) {}
  },

  bossHit() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      [80, 55, 120].forEach((f, i) => _osc(c, 'sawtooth', f, t + i * 0.01, 0.25, 0.18, this._master));
      _osc(c, 'sine', 1200, t, 0.1, 0.12, this._master);
      _osc(c, 'sine', 960, t + 0.05, 0.1, 0.1, this._master);
    } catch (e) {}
  },

  bossDefeated() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _noise(c, t, 0.3, 0.28, this._master);
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
        const g = c.createGain(); g.gain.setValueAtTime(0.0, t + 0.2);
        g.gain.linearRampToValueAtTime(0.14, t + 0.4 + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        o.connect(g); g.connect(this._reverb); g.connect(this._master);
        o.start(t + 0.2); o.stop(t + 1.55);
      });
    } catch (e) {}
  },

  heartLost() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      [523, 415, 330, 262].forEach((f, i) => _osc(c, 'sine', f, t + i * 0.13, 0.14, 0.16, this._master));
    } catch (e) {}
  },

  levelUnlocked() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _osc(c, 'square', 600, t, 0.05, 0.1, this._master);
      _osc(c, 'square', 800, t + 0.04, 0.04, 0.08, this._master);
      [659, 784, 880, 1047, 1175].forEach((f, i) => {
        _osc(c, 'sine', f, t + 0.1 + i * 0.07, 0.09, 0.12, this._master);
      });
    } catch (e) {}
  },

  bossTimerWarn() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 55;
      const lfo = c.createOscillator(); lfo.frequency.value = 4;
      const lfoG = c.createGain(); lfoG.gain.value = 0.18;
      lfo.connect(lfoG);
      const g = c.createGain(); g.gain.value = 0.22;
      lfoG.connect(g.gain);
      o.connect(g); g.connect(this._master);
      lfo.start(t); o.start(t); lfo.stop(t + 0.62); o.stop(t + 0.62);
    } catch (e) {}
  },

  // Abacus
  beadSlide() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      const o = c.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(200, t);
      o.frequency.linearRampToValueAtTime(150, t + 0.08);
      const g = c.createGain(); g.gain.setValueAtTime(0.14, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      o.connect(g); g.connect(this._master);
      o.start(t); o.stop(t + 0.1);
    } catch (e) {}
  },

  // Rewards & Shop
  coinsRain() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      for (let i = 0; i < 6; i++) {
        const freq = 1400 + Math.random() * 400;
        const delay = Math.random() * 0.25;
        _osc(c, 'sine', freq, t + delay, 0.08, 0.1, this._master);
      }
    } catch (e) {}
  },

  xpLevelUp() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      [261, 329, 392, 523, 659].forEach((f, i) => {
        const o1 = c.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = f;
        const o2 = c.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = f + 4;
        const g = c.createGain(); g.gain.setValueAtTime(0.0, t + i * 0.15);
        g.gain.linearRampToValueAtTime(0.12, t + i * 0.15 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.3);
        o1.connect(g); o2.connect(g);
        g.connect(this._reverb); g.connect(this._master);
        o1.start(t + i * 0.15); o2.start(t + i * 0.15);
        o1.stop(t + i * 0.15 + 0.32); o2.stop(t + i * 0.15 + 0.32);
      });
    } catch (e) {}
  },

  badgeUnlock() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _chord(c, [523, 659, 784, 1047], 'sawtooth', t, 1.0, 0.14, this._reverb);
      _chord(c, [523, 659, 784, 1047], 'sawtooth', t, 1.0, 0.06, this._master);
      [1047, 1175, 1319, 1568].forEach((f, i) => {
        _osc(c, 'sine', f, t + 0.5 + i * 0.08, 0.1, 0.12, this._master);
      });
    } catch (e) {}
  },

  shopOpen() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _osc(c, 'sine', 1600, t, 0.05, 0.1, this._master);
      [523, 440, 392, 330].forEach((f, i) => {
        _osc(c, 'sine', f, t + 0.06 + i * 0.07, 0.1, 0.12, this._master);
      });
    } catch (e) {}
  },

  shopBuy() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      [1400, 1500, 1600, 1700].forEach((f, i) => {
        _osc(c, 'sine', f, t + i * 0.05, 0.06, 0.1, this._master);
      });
      _chord(c, [523, 659, 784], 'sine', t + 0.2, 0.3, 0.14, this._master);
    } catch (e) {}
  },

  notEnoughCoins() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      for (let i = 0; i < 3; i++) _noise(c, t + i * 0.1, 0.06, 0.1, this._master);
    } catch (e) {}
  },

  themeUnlocked() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      [261, 329, 392, 523, 659, 784].forEach((f, i) => {
        _osc(c, 'sawtooth', f, t + i * 0.18, 1.4, 0.13, this._reverb);
        _osc(c, 'sawtooth', f, t + i * 0.18, 1.4, 0.06, this._master);
      });
    } catch (e) {}
  },

  // Olympiad
  olympiadStart() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      _chord(c, [261, 329, 392], 'sawtooth', t, 0.6, 0.18, this._reverb);
      _chord(c, [261, 329, 392], 'sawtooth', t, 0.6, 0.08, this._master);
    } catch (e) {}
  },

  streakChime(n) {
    try {
      if (!this.enabled || !this._ctx) return;
      if (n >= 10) { this.xpLevelUp(); return; }
      const c = this._ctx, t = c.currentTime;
      if (n >= 5) {
        [523, 587, 659, 784, 880].forEach((f, i) => {
          _osc(c, 'sine', f, t + i * 0.1, 0.12, 0.15, this._master);
        });
      } else {
        [784, 880, 1047].forEach((f, i) => {
          _osc(c, 'sine', f, t + i * 0.12, 0.1, 0.14, this._master);
        });
      }
    } catch (e) {}
  },

  olympiadEnd() {
    try {
      if (!this.enabled || !this._ctx) return;
      const c = this._ctx, t = c.currentTime;
      [261, 329, 392, 523, 659].forEach((f, i) => {
        _osc(c, 'sawtooth', f, t + i * 0.2, 1.8, 0.15, this._reverb);
        _osc(c, 'sawtooth', f, t + i * 0.2, 1.8, 0.06, this._master);
      });
      for (let i = 0; i < 6; i++) {
        const freq = 1400 + Math.random() * 400;
        const delay = 0.8 + Math.random() * 0.8;
        _osc(c, 'sine', freq, t + delay, 0.1, 0.12, this._master);
      }
    } catch (e) {}
  },
};

// Internal helpers — not exported

function _osc(ctx, type, freq, start, dur, gainVal, dest, detune = 0) {
  try {
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.value = freq;
    if (detune) o.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gainVal, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(dest);
    o.start(start); o.stop(start + dur + 0.01);
  } catch (e) {}
}

function _chord(ctx, freqs, type, start, dur, gainVal, dest) {
  freqs.forEach(f => _osc(ctx, type, f, start, dur, gainVal, dest));
}

function _noise(ctx, start, dur, gainVal, dest) {
  try {
    const len = Math.max(1, Math.ceil(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gainVal, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(g); g.connect(dest);
    src.start(start); src.stop(start + dur + 0.01);
  } catch (e) {}
}

function _mkReverb(ctx, dest, seconds, decay) {
  try {
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    const conv = ctx.createConvolver(); conv.buffer = buf;
    const g = ctx.createGain(); g.gain.value = 0.25;
    conv.connect(g); g.connect(dest);
    return conv;
  } catch (e) { return dest; }
}

// Auto-init on any user gesture
if (typeof window !== 'undefined') {
  ['touchstart', 'mousedown', 'keydown'].forEach(ev =>
    window.addEventListener(ev, () => SFX.init(), { once: true })
  );
}
