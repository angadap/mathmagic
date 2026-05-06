// theme.js — MathMagic Space Academy
// src/theme.js

export const THEMES = {
  candy:  { name:"Candy Pop",    icon:"🍭", bg:"#1a0628", card:"#2d0a3e",  card2:"#3d1050", cyan:"#f472b6", purple:"#c084fc", pink:"#fb7185", orange:"#fb923c", yellow:"#fde047", green:"#4ade80", red:"#f43f5e", dim:"#9d6db5" },
  space:  { name:"Space Dark",   icon:"🌌", bg:"#04040f", card:"#0d0d2b",  card2:"#10102e", cyan:"#00f5ff", purple:"#a855f7", pink:"#ec4899", orange:"#f97316", yellow:"#fbbf24", green:"#22c55e", red:"#ef4444", dim:"#6b7db3" },
  jungle: { name:"Jungle Fun",   icon:"🦁", bg:"#0a1f0a", card:"#122212",  card2:"#1a2e18", cyan:"#86efac", purple:"#a3e635", pink:"#fb923c", orange:"#fbbf24", yellow:"#fde047", green:"#4ade80", red:"#f87171", dim:"#5a7a52" },
  ocean:  { name:"Ocean Splash", icon:"🐬", bg:"#020f20", card:"#051c38",  card2:"#072548", cyan:"#38bdf8", purple:"#818cf8", pink:"#f472b6", orange:"#fb923c", yellow:"#fde047", green:"#34d399", red:"#f87171", dim:"#3a6080" },
  sunset: { name:"Sunset Glow",  icon:"🌈", bg:"#1f0a00", card:"#2d1200",  card2:"#3d1a00", cyan:"#fb923c", purple:"#e879f9", pink:"#fb7185", orange:"#fbbf24", yellow:"#fde047", green:"#4ade80", red:"#f43f5e", dim:"#8a4a20" },
};

export function getThemeColors() {
  return THEMES[localStorage.getItem("mm_theme") || "candy"] || THEMES.candy;
}

export function setTheme(key) {
  if (THEMES[key]) localStorage.setItem("mm_theme", key);
}
