// sounds.js — MathMagic Space Academy Sound Engine v2
// Import: import SFX from './sounds'

const SFX = (() => {
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

  const play = (freq, type, duration, vol=0.3, decay=0.8, vibrato=0) => {
    if (muted) return;
    const ac = getCtx();
    if (!ac) return;
    try {
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      if (vibrato > 0) {
        const lfo = ac.createOscillator(), lfoG = ac.createGain();
        lfo.frequency.value = vibrato; lfoG.gain.value = freq * 0.03;
        lfo.connect(lfoG); lfoG.connect(osc.frequency);
        lfo.start(ac.currentTime); lfo.stop(ac.currentTime + duration);
      }
      osc.frequency.exponentialRampToValueAtTime(freq * decay, ac.currentTime + duration);
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      osc.start(ac.currentTime); osc.stop(ac.currentTime + duration);
    } catch(e) {}
  };

  const arp = (freqs, type, noteDur, vol, gap=55) =>
    freqs.forEach((f,i) => setTimeout(()=>play(f,type,noteDur,vol), i*gap));

  const strum = (freqs, type, dur, vol) =>
    freqs.forEach((f,i) => setTimeout(()=>play(f,type,dur,vol,0.9), i*30));

  const noise = (dur, vol=0.15) => {
    const ac = getCtx();
    if (!ac || muted) return;
    try {
      const bufSize = ac.sampleRate * dur;
      const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i=0; i<bufSize; i++) d[i] = (Math.random()*2-1);
      const src = ac.createBufferSource(); src.buffer = buf;
      const gain = ac.createGain();
      src.connect(gain); gain.connect(ac.destination);
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      src.start(ac.currentTime);
    } catch(e) {}
  };

  return {
    get muted() { return muted; },
    toggleMute() { muted = !muted; localStorage.setItem("mm_muted", muted?"1":"0"); return muted; },
    tap()        { play(900,"sine",0.06,0.18,0.6); },
    back()       { arp([400,300],"sine",0.08,0.15,60); },
    select()     { arp([500,650],"triangle",0.09,0.18,50); },
    correct()    { arp([523,659,784,1047],"sine",0.18,0.28,80); setTimeout(()=>play(1047,"sine",0.3,0.18,0.8,6),300); },
    wrong()      { arp([400,300,220,160],"sawtooth",0.12,0.18,60); setTimeout(()=>noise(0.08,0.10),0); },
    hint()       { play(1200,"sine",0.1,0.18); setTimeout(()=>play(900,"sine",0.1,0.14),120); },
    bossHit()    { noise(0.12,0.25); play(80,"square",0.2,0.35,0.3); },
    bossDefeat() { const m=[523,587,659,698,784,880,988,1047]; m.forEach((f,i)=>setTimeout(()=>play(f,"sine",0.22,0.28,0.95),i*90)); setTimeout(()=>strum([523,659,784,1047],"sine",0.6,0.22),780); },
    bubblePop()  { play(1400,"sine",0.04,0.22,0.2); setTimeout(()=>noise(0.04,0.08),0); },
    timerTick()  { play(1200,"square",0.04,0.08,0.5); },
    timerWarn()  { arp([880,880,880],"square",0.07,0.22,150); },
    levelUp()    { arp([262,330,392,523,659,784,1047],"sine",0.2,0.30,70); setTimeout(()=>strum([523,659,784,1047,1319],"triangle",0.5,0.25),550); },
    xpGain()     { arp([1047,1319,1568],"sine",0.1,0.18,60); },
    coinGain()   { arp([1319,1568,2093],"triangle",0.12,0.22,50); },
    starEarn()   { [659,784,988,1175,1319,1568].forEach((f,i)=>setTimeout(()=>{play(f,"sine",0.18,0.25,0.9);play(f*2,"triangle",0.1,0.10);},i*80)); },
    unlock()     { arp([392,494,587,659,784,988,1175],"sine",0.18,0.28,65); setTimeout(()=>noise(0.15,0.12),100); },
    screenIn()   { arp([220,330,440,550],"sine",0.09,0.14,40); },
    splash()     { setTimeout(()=>arp([262,330,392,523,659,784,1047],"sine",0.25,0.22,90),0); setTimeout(()=>strum([262,330,392,523],"triangle",0.5,0.15),700); },
    dailyDone()  { const m=[523,659,784,659,784,988,1047]; m.forEach((f,i)=>setTimeout(()=>play(f,"sine",0.2,0.25,0.9),i*100)); setTimeout(()=>strum([523,659,784,1047],"sine",0.6,0.20),750); },
    puzzleSolve(){ arp([392,523,659,784,988,1175,1319,1568],"sine",0.2,0.28,70); setTimeout(()=>strum([523,659,784,1047,1319],"triangle",0.7,0.22),600); },
    ratingOpen() { strum([523,659,784,1047],"sine",0.4,0.20); },
    paySuccess() { arp([523,659,784,1047,1319,1568,2093],"sine",0.22,0.30,75); setTimeout(()=>{strum([523,659,784,1047],"sine",0.6,0.25);noise(0.2,0.12);},600); },
  };
})();

export default SFX;
