import { state, SOUND_COOLDOWN_MS, readSoundPref, writeSoundPref } from "./state";
import { SoundId } from "./types";
import { ensureAudioReady } from "./core";
import { startHearthAmbience } from "./ambience";
import * as sfx from "./sfx";

export function isSoundEnabled(): boolean {
  return state.soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  state.soundEnabled = enabled;
  writeSoundPref(enabled);
  if (enabled) ensureAudioReady();
}

export function loadSoundPreference(): boolean {
  state.soundEnabled = readSoundPref();
  return state.soundEnabled;
}

export function unlockAudioOnGesture(): void {
  if (state.unlockBound) return;

  const unlock = () => {
    if (state.soundEnabled || state.ambienceEnabled) {
      ensureAudioReady();
      if (state.ambienceEnabled) startHearthAmbience();
    }
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("keydown", unlock);
  };

  document.addEventListener("pointerdown", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });
  state.unlockBound = true;
}

export function canPlaySound(name: SoundId): boolean {
  if (!state.soundEnabled) return false;

  const cooldown = SOUND_COOLDOWN_MS[name];
  if (cooldown) {
    const now = performance.now();
    const last = state.lastPlayedAt.get(name) || 0;
    if (now - last < cooldown) return false;
    state.lastPlayedAt.set(name, now);
  }
  return true;
}

export function resolveTechniqueSoundId(
  action: string,
  variant?: string,
  elementCount = 1
): SoundId | null {
  if (action === "combine") {
    if (variant === "whisk") return "whisk";
    if (variant === "mix") return "mix";
    if (variant === "gel") return "gel";
    return elementCount > 2 ? "bubble" : "combine";
  }

  const validIds: Record<string, SoundId> = {
    separate: "separate", peel: "peel", tear: "tear",
    smash: "smash", pound: "pound", press: "press", grind: "grind", knead: "knead", emulsify: "emulsify",
    chop: "chop", slice: "slice", dice: "dice",
    char: "char", cook: "cook", precision: "precision"
  };

  return validIds[action] || null;
}

export function playTechniqueSound(
  action: string,
  variant?: string,
  elementCount = 1
): void {
  const soundId = resolveTechniqueSoundId(action, variant, elementCount);
  if (soundId) playSound(soundId);
}

export function playActionSelectSound(action: string): void {
  playSound("ui_click");
}

export function playSound(name: SoundId): void {
  if (!canPlaySound(name)) return;

  const fnMap: Record<SoundId, () => void> = {
    success: sfx.sfxSuccess, fail: sfx.sfxFail, fail_soft: sfx.sfxFailSoft,
    discovery: sfx.sfxDiscovery, recipe_complete: sfx.sfxRecipeComplete,
    level_up: sfx.sfxLevelUp, unlock: sfx.sfxUnlock, milestone: sfx.sfxMilestone,
    hint: sfx.sfxHint, ui_click: sfx.sfxUiClick, ui_pickup: sfx.sfxUiPickup,
    ui_place: sfx.sfxUiPlace, ui_remove: sfx.sfxUiRemove, ui_hover: sfx.sfxUiHover,
    ui_undo: sfx.sfxUiUndo, ui_clear: sfx.sfxUiClear, ui_tab: sfx.sfxUiTab,
    ui_locked: sfx.sfxUiLocked, combine: sfx.sfxCombine, mix: sfx.sfxMix,
    whisk: sfx.sfxWhisk, gel: sfx.sfxGel, separate: sfx.sfxSeparate, peel: sfx.sfxPeel,
    tear: sfx.sfxTear, smash: sfx.sfxSmash, pound: sfx.sfxPound, press: sfx.sfxPress,
    grind: sfx.sfxGrind, knead: sfx.sfxKnead, emulsify: sfx.sfxEmulsify, chop: sfx.sfxChop,
    slice: sfx.sfxSlice, dice: sfx.sfxDice, char: sfx.sfxChar, cook: sfx.sfxCook,
    precision: sfx.sfxPrecision, bubble: sfx.sfxBubble
  };

  const fn = fnMap[name];
  if (fn) fn();
}

export function updateSoundToggleButton(btn: HTMLButtonElement | null): void {
  if (!btn) return;
  const isEnabled = isSoundEnabled();

  btn.classList.toggle("btn-active", isEnabled);
  btn.setAttribute("aria-pressed", isEnabled.toString());

  const icon = btn.querySelector(".icon");
  if (icon) icon.textContent = isEnabled ? "🔊" : "🔇";
}

export function syncSoundUi(enabled = state.soundEnabled): void {
  const btnSound = document.getElementById("btn-sound") as HTMLButtonElement | null;
  updateSoundToggleButton(btnSound);
}
