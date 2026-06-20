/**
 * Client-only game settings (localStorage + document attributes).
 */

const REDUCED_MOTION_KEY = "culinary_reduced_motion";

let reducedMotion = false;

export interface GameSettingsSnapshot {
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export function prefersReducedMotionSystem(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
}

export function getSettingsSnapshot(soundEnabled: boolean): GameSettingsSnapshot {
  return {
    soundEnabled,
    reducedMotion: isReducedMotionEnabled()
  };
}
