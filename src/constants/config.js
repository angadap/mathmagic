// src/constants/config.js — App-wide config & feature flags

export const APP_NAME    = 'MathMagic';
export const APP_VERSION = '2.0.0';

// LocalStorage keys — centralised so nothing drifts out of sync
export const LS_THEME      = 'mm_theme';
export const LS_PROGRESS   = 'mm_progress_v2';
export const LS_CHILDREN   = 'mm_children_v2';
export const LS_DAILY      = 'mm_daily_v2';
export const LS_PURCHASED  = 'mm_purchased';
export const LS_MUTE       = 'mm_mute';

// Question cache config
export const Q_CACHE_MAX = 200;
export const Q_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 h
export const Q_LS_KEY    = 'mm_qcache_v2';

// Admin password placeholder (override via environment / server)
export const ADMIN_PASSWORD = '';
