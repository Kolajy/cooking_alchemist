import { SoundId } from "./types";

export const SOUND_PREF_KEY = "culinary_sound_enabled";
export const AMBIENCE_PREF_KEY = "culinary_ambience_enabled";

export const SOUND_COOLDOWN_MS: Partial<Record<SoundId, number>> = {
  ui_hover: 140,
  ui_pickup: 90,
  ui_place: 90,
  ui_click: 60,
  chop: 70,
  slice: 70,
  smash: 80,
  separate: 80,
  combine: 100,
  bubble: 120,
  hint: 200,
  fail: 120,
  fail_soft: 120
};

export const state = {
  audioContext: null as AudioContext | null,
  soundEnabled: false,
  ambienceEnabled: false,
  unlockBound: false,
  lastPlayedAt: new Map<string, number>(),
  ambienceSource: null as AudioBufferSourceNode | null,
  ambienceGain: null as GainNode | null
};

export function readSoundPref(): boolean {
  try {
    const stored = localStorage.getItem(SOUND_PREF_KEY);
    if (stored === null) return true;
    return stored === "true";
  } catch {
    return true;
  }
}

export function writeSoundPref(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_PREF_KEY, enabled ? "true" : "false");
  } catch {}
}

export function readAmbiencePref(): boolean {
  try {
    const stored = localStorage.getItem(AMBIENCE_PREF_KEY);
    if (stored === null) return false;
    return stored === "true";
  } catch {
    return false;
  }
}

export function writeAmbiencePref(enabled: boolean): void {
  try {
    localStorage.setItem(AMBIENCE_PREF_KEY, enabled ? "true" : "false");
  } catch {}
}
