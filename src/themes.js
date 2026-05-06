// theme.js — MathMagic Space Academy
// All colors, themes, and theme-selector hook
// Usage: import { C, useTheme, THEMES } from './theme'

export const THEMES = {
  space: {
    name: "Space Dark",
    icon: "🌌",
    bg:      "#04040f",
    card:    "#07071a",
    card2:   "#0d0d24",
    purple:  "#a855f7",
    cyan:    "#06b6d4",
    yellow:  "#fbbf24",
    orange:  "#f97316",
    green:   "#22c55e",
    red:     "#ef4444",
    pink:    "#ec4899",
    dim:     "#4b5580",
    white:   "#ffffff",
    grad:    "linear-gradient(135deg,#a855f7,#06b6d4)",
  },
  ocean: {
    name: "Ocean Blue",
    icon: "🌊",
    bg:      "#020b18",
    card:    "#041525",
    card2:   "#071d30",
    purple:  "#3b82f6",
    cyan:    "#06d6a0",
    yellow:  "#ffd166",
    orange:  "#ef8c3a",
    green:   "#2ec4b6",
    red:     "#ef4444",
    pink:    "#f72585",
    dim:     "#2d4a6a",
    white:   "#e0f4ff",
    grad:    "linear-gradient(135deg,#3b82f6,#06d6a0)",
  },
  sunset: {
    name: "Sunset",
    icon: "🌅",
    bg:      "#0f0508",
    card:    "#1a0a10",
    card2:   "#220d14",
    purple:  "#f72585",
    cyan:    "#ff9500",
    yellow:  "#ffdd00",
    orange:  "#ff6b35",
    green:   "#43aa8b",
    red:     "#e63946",
    pink:    "#ff4d6d",
    dim:     "#5a2a3a",
    white:   "#fff0f3",
    grad:    "linear-gradient(135deg,#f72585,#ff9500)",
  },
  forest: {
    name: "Forest",
    icon: "🌿",
    bg:      "#030d05",
    card:    "#061409",
    card2:   "#081a0c",
    purple:  "#52b788",
    cyan:    "#74c69d",
    yellow:  "#d4a017",
    orange:  "#e07a5f",
    green:   "#40916c",
    red:     "#e63946",
    pink:    "#f4978e",
    dim:     "#2d4a35",
    white:   "#f0fff4",
    grad:    "linear-gradient(135deg,#52b788,#d4a017)",
  },
};

const THEME_KEY = "mm_theme";

// Get current theme colors
export function getTheme() {
  const key = localStorage.getItem(THEME_KEY) || "space";
  return THEMES[key] || THEMES.space;
}

// Set theme by key
export function setTheme(key) {
  if (THEMES[key]) {
    localStorage.setItem(THEME_KEY, key);
    // Dispatch event so app re-renders
    window.dispatchEvent(new CustomEvent("mm_theme_change", { detail: key }));
  }
}

// Current theme colors (C) — reactive singleton
// Import this wherever you need colors
export let C = getTheme();

// Call this once in App to keep C in sync
export function syncTheme() {
  C = getTheme();
}

// Theme Selector Component (inline JSX — used inside App.jsx)
// Renders a row of theme buttons
export const THEME_SELECTOR_DATA = Object.entries(THEMES).map(([key, t]) => ({ key, ...t }));
