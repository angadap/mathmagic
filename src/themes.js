// theme.js — MathMagic Space Academy
// Place in: src/theme.js
// Import in App.jsx: import { THEMES, getThemeColors } from './theme.js'

export const THEMES = {
  space:  { name:"Space Dark", icon:"🌌", bg:"#04040f", card:"#0d0d2b", card2:"#10102e", cyan:"#00f5ff", purple:"#a855f7", pink:"#ec4899", orange:"#f97316", yellow:"#fbbf24", green:"#22c55e", red:"#ef4444", dim:"#6b7db3" },
  ocean:  { name:"Ocean Blue",  icon:"🌊", bg:"#020b18", card:"#041525", card2:"#071d30", cyan:"#06d6a0", purple:"#3b82f6", pink:"#f72585", orange:"#ef8c3a", yellow:"#ffd166", green:"#2ec4b6", red:"#ef4444", dim:"#2d4a6a" },
  sunset: { name:"Sunset",      icon:"🌅", bg:"#0f0508", card:"#1a0a10", card2:"#220d14", cyan:"#ff9500", purple:"#f72585", pink:"#ff4d6d", orange:"#ff6b35", yellow:"#ffdd00", green:"#43aa8b", red:"#e63946", dim:"#5a2a3a" },
  forest: { name:"Forest",      icon:"🌿", bg:"#030d05", card:"#061409", card2:"#081a0c", cyan:"#74c69d", purple:"#52b788", pink:"#f4978e", orange:"#e07a5f", yellow:"#d4a017", green:"#40916c", red:"#e63946", dim:"#2d4a35" },
};

// Used by App.jsx: let C = getThemeColors();
export function getThemeColors() {
  return THEMES[localStorage.getItem("mm_theme") || "space"] || THEMES.space;
}

// Set theme and reload
export function setTheme(key) {
  if (THEMES[key]) {
    localStorage.setItem("mm_theme", key);
    window.location.reload();
  }
}
