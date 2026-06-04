// src/constants/themes.js — All theme definitions and colour helpers

export const THEMES = {
  // ── DEFAULT: Bright Sky — Duolingo-style, white + lavender, child-friendly ──
  bright: { name:"Bright Sky",     icon:"☀️",  bg:"#f0f4ff", card:"#ffffff",  card2:"#f5f0ff", cyan:"#7c6fe0", purple:"#a855f7", pink:"#f76fd1", orange:"#fb923c", yellow:"#ffd53d", green:"#2ed97a", red:"#ff6b6b", dim:"#9b8ec4", text:"#2d1f6e", text2:"#6b5b9e", border:"#ece8ff" },
  // ── Space Dark — original deep purple theme ──
  royal:  { name:"Royal Academy",  icon:"👑",  bg:"#12002e", card:"#1e0045",  card2:"#2a0060", cyan:"#a78bfa", purple:"#7c3aed", pink:"#f472b6", orange:"#fb923c", yellow:"#fbbf24", green:"#34d399", red:"#f87171", dim:"#7c6b9e", text:"white", text2:"#ccc", border:"#3a1a70" },
  // ── Cosmic Teal ──
  cosmic: { name:"Cosmic Teal",    icon:"🚀",  bg:"#00101e", card:"#001c30",  card2:"#00253d", cyan:"#06d6c7", purple:"#818cf8", pink:"#f472b6", orange:"#fb923c", yellow:"#fcd34d", green:"#4ade80", red:"#f87171", dim:"#4a8099", text:"white", text2:"#ccc", border:"#003d5a" },
  // ── Sunset Blaze ──
  sunset: { name:"Sunset Blaze",   icon:"🌅",  bg:"#1a0800", card:"#2d1000",  card2:"#3d1800", cyan:"#fb923c", purple:"#e879f9", pink:"#fb7185", orange:"#fbbf24", yellow:"#fde047", green:"#4ade80", red:"#f43f5e", dim:"#9a5a30", text:"white", text2:"#ccc", border:"#5a2a00" },
  // ── Candy Pop ──
  candy:  { name:"Candy Pop",      icon:"🍭",  bg:"#1a0628", card:"#2d0a3e",  card2:"#3d1050", cyan:"#f472b6", purple:"#c084fc", pink:"#fb7185", orange:"#fb923c", yellow:"#fde047", green:"#4ade80", red:"#f43f5e", dim:"#9d6db5", text:"white", text2:"#ccc", border:"#5a2070" },
};

export function getThemeColors() {
  return THEMES[localStorage.getItem("mm_theme") || "bright"] || THEMES.bright;
}

// Mutable reference — updated when user switches theme
export let C = getThemeColors();
export function updateC(key) {
  C = THEMES[key] || THEMES.bright;
  return C;
}

export const isDark    = () => !C.bg.startsWith('#f') && !C.bg.startsWith('#e') && !C.bg.startsWith('#FF') && !C.bg.startsWith('#EE');
export const textColor  = () => C.text  || (isDark() ? 'white' : '#2d1f6e');
export const text2Color = () => C.text2 || (isDark() ? '#ccc'  : '#6b5b9e');
