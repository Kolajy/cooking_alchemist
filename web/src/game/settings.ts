/**
 * Client-only game settings (localStorage + document attributes).
 */

const REDUCED_MOTION_KEY = "culinary_reduced_motion";
const HIGH_CONTRAST_KEY = "culinary_high_contrast";

let highContrast = false;

let reducedMotion = false;

export interface GameSettingsSnapshot {
  highContrast: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export function prefersReducedMotionSystem(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readHighContrastPref(): boolean | null {
  try {
    const stored = localStorage.getItem(HIGH_CONTRAST_KEY);
    if (stored === null) return null;
    return stored === "true";
  } catch {
    return null;
  }
}

function writeHighContrastPref(enabled: boolean): void {
  try {
    localStorage.setItem(HIGH_CONTRAST_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore storage failures.
  }
}

export function isHighContrastEnabled(): boolean {
  return highContrast;
}

export function setHighContrast(enabled: boolean): void {
  highContrast = Boolean(enabled);
  writeHighContrastPref(highContrast);
  applyHighContrastAttribute();
}

export function loadHighContrastPreference(): boolean {
  const stored = readHighContrastPref();
  // Check system pref for high contrast
  const prefersHighContrast = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-contrast: more)").matches;
  highContrast = stored !== null ? stored : prefersHighContrast;
  applyHighContrastAttribute();
  return highContrast;
}

function applyHighContrastAttribute(): void {
  document.documentElement.dataset.contrast = highContrast ? "high" : "normal";
  if (highContrast) {
    document.documentElement.classList.add("high-contrast");
  } else {
    document.documentElement.classList.remove("high-contrast");
  }
}

function readReducedMotionPref(): boolean | null {
  try {
    const stored = localStorage.getItem(REDUCED_MOTION_KEY);
    if (stored === null) return null;
    return stored === "true";
  } catch {
    return null;
  }
}

function writeReducedMotionPref(enabled: boolean): void {
  try {
    localStorage.setItem(REDUCED_MOTION_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore storage failures.
  }
}

export function isReducedMotionEnabled(): boolean {
  return reducedMotion;
}

export function setReducedMotion(enabled: boolean): void {
  reducedMotion = Boolean(enabled);
  writeReducedMotionPref(reducedMotion);
  applyReducedMotionAttribute();
}

export function loadReducedMotionPreference(): boolean {
  const stored = readReducedMotionPref();
  reducedMotion = stored !== null ? stored : prefersReducedMotionSystem();
  applyReducedMotionAttribute();
  return reducedMotion;
}

function applyReducedMotionAttribute(): void {
  document.documentElement.dataset.motion = reducedMotion ? "reduced" : "full";
}

export function loadSettings(): void {
  loadReducedMotionPreference();
  loadHighContrastPreference();
}

export function getSettingsSnapshot(soundEnabled: boolean): GameSettingsSnapshot {
  return {
    soundEnabled,
    reducedMotion: isReducedMotionEnabled(),
    highContrast: isHighContrastEnabled()
  };
}
