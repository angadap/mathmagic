// src/lib/sfx.js — Web Audio sound engine

// ─────────────────────────────────────────────────────────────────
// SOUND ENGINE — Web Audio API (zero bandwidth, works offline)
// Battery-aware: respects prefers-reduced-motion and low power
// ─────────────────────────────────────────────────────────────────
export const SFX = (() => {
  let ctx = null;
  let muted = localStorage.getItem("mm_muted") === "1";

  const getCtx = () => {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e) { return null; }
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  const play = (freq, type, duration, vol=0.3, decay=0.8) => {
    if (muted) return;
    // Skip sounds if battery is low (Battery API)
    const ac = getCtx();
    if (!ac) return;
    try {
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * decay, ac.currentTime + duration);
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + duration);
    } catch(e) {}
  };

  const chord = (freqs, type, dur, vol) => freqs.forEach((f,i) => setTimeout(()=>play(f,type,dur,vol), i*80));

  return {
    get muted() { return muted; },
    toggleMute() { muted = !muted; localStorage.setItem("mm_muted", muted?"1":"0"); return muted; },

    // UI interactions
    tap()        { play(600, "sine",    0.08, 0.15); },
    back()       { play(300, "sine",    0.12, 0.15); },
    select()     { play(500, "triangle",0.10, 0.20); },

    // Quiz events
    correct()    { chord([523,659,784], "sine", 0.3, 0.25); },
    wrong()      { play(180, "sawtooth", 0.25, 0.20, 0.5); },
    hint()       { play(440, "sine",    0.15, 0.18); },

    // Game events
    bossHit()    { play(120, "square",  0.2,  0.30, 0.3); },
    bossDefeat() { chord([784,988,1047,1319], "sine", 0.6, 0.30); },
    bubblePop()  { play(800, "sine",    0.08, 0.20, 0.5); },
    timerTick()  { play(1000,"square",  0.05, 0.10); },
    timerWarn()  { play(440, "square",  0.10, 0.25); },

    // Progress / rewards
    levelUp()    { chord([523,659,784,1047], "sine", 0.5, 0.35); },
    xpGain()     { play(880, "sine",    0.15, 0.20, 1.2); },
    coinGain()   { chord([1047,1319], "triangle", 0.25, 0.25); },
    starEarn()   { chord([659,784,988,1319], "sine", 0.7, 0.30); },
    unlock()     { chord([392,494,587,784], "sine", 0.5, 0.28); },

    // Navigation
    screenIn()   { play(440, "sine",    0.12, 0.12, 1.1); },
    splash()     { chord([262,330,392,523], "sine", 0.8, 0.20); },

    // Daily / special
    dailyDone()  { chord([784,988,1175,1568], "sine", 0.8, 0.30); },
    puzzleSolve(){ chord([523,784,1047,1319,1568], "sine", 1.0, 0.28); },
    ratingOpen() { chord([523,659,784], "triangle", 0.4, 0.18); },
  };
})();

// Global mute toggle button component
function MuteBtn() {
  const [muted, setMuted] = React.useState(SFX.muted);
  return (
    <button
      onClick={() => { setMuted(SFX.toggleMute()); }}
      title={muted ? "Unmute" : "Mute"}
      style={{ background:"none", border:"none", cursor:"pointer", fontSize:18,
               color: muted ? C.dim : C.cyan, padding:"4px 6px", lineHeight:1,
               transition:"color 0.2s" }}>
      {muted ? "🔇" : "🔊"}
    </button>
  );
}

