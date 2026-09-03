import { secureRandom } from "../security/math";
const SOUND_PREF_KEY = "culinary_sound_enabled";
const SOUND_VOLUME_KEY = "culinary_sound_volume";

type OscType = OscillatorType;

export type SoundId =
  | "success"
  | "fail"
  | "fail_soft"
  | "discovery"
  | "recipe_complete"
  | "level_up"
  | "unlock"
  | "milestone"
  | "hint"
  | "ui_click"
  | "ui_pickup"
  | "ui_place"
  | "ui_remove"
  | "ui_hover"
  | "ui_undo"
  | "ui_clear"
  | "ui_tab"
  | "ui_locked"
  | "combine"
  | "mix"
  | "whisk"
  | "gel"
  | "separate"
  | "peel"
  | "tear"
  | "smash"
  | "pound"
  | "press"
  | "grind"
  | "knead"
  | "emulsify"
  | "chop"
  | "slice"
  | "dice"
  | "char"
  | "cook"
  | "precision"
  | "bubble";

type ToneSpec = {
  frequency: number;
  duration?: number;
  type?: OscType;
  gain?: number;
  when?: number;
  freqEnd?: number;
};

type NoiseSpec = {
  duration?: number;
  gain?: number;
  filterFreq?: number;
  filterQ?: number;
  filterType?: BiquadFilterType;
  when?: number;
};

const SOUND_COOLDOWN_MS: Partial<Record<SoundId, number>> = {
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

let audioContext: AudioContext | null = null;
let masterGainNode: GainNode | null = null;
let soundEnabled = false;
let soundVolume = 1.0;
let unlockBound = false;
const lastPlayedAt = new Map<string, number>();

function readSoundPref(): boolean {
  try {
    const stored = localStorage.getItem(SOUND_PREF_KEY);
    if (stored === null) return true;
    return stored === "true";
  } catch {
    return true;
  }
}

function writeSoundPref(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_PREF_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore storage failures.
  }
}

function readSoundVolumePref(): number {
  try {
    const stored = localStorage.getItem(SOUND_VOLUME_KEY);
    if (stored === null) return 1.0;
    const val = parseFloat(stored);
    if (isNaN(val) || val < 0 || val > 1) return 1.0;
    return val;
  } catch {
    return 1.0;
  }
}

function writeSoundVolumePref(volume: number): void {
  try {
    localStorage.setItem(SOUND_VOLUME_KEY, volume.toString());
  } catch {
    // Ignore storage failures.
  }
}

function getContext(): AudioContext | null {
  if (!audioContext) {
    const Ctx = window.AudioContext
      || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();

    // Set up master volume for SFX
    masterGainNode = audioContext.createGain();
    masterGainNode.gain.value = 0.6 * soundVolume; // Base volume for all SFX
    masterGainNode.connect(audioContext.destination);
  }
  return audioContext;
}

function jitterHz(base: number, spread = 0.06): number {
  return base * (1 + (secureRandom() - 0.5) * spread);
}

function ensureAudioReady(): AudioContext | null {
  const ctx = getContext();
  if (!ctx || !soundEnabled) return null;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/** Like ensureAudioReady but independent of the master SFX toggle (for ambience). */
function getResumableContext(): AudioContext | null {
  const ctx = getContext();
  if (!ctx) return null;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function canPlaySound(name: SoundId): boolean {
  const cooldown = SOUND_COOLDOWN_MS[name] ?? 0;
  if (cooldown <= 0) return true;
  const now = performance.now();
  const last = lastPlayedAt.get(name) ?? 0;
  if (now - last < cooldown) return false;
  lastPlayedAt.set(name, now);
  return true;
}

function playTone({
  frequency,
  duration = 0.08,
  type = "sine",
  gain = 0.04,
  when = 0,
  freqEnd
}: ToneSpec): void {
  const ctx = ensureAudioReady();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  const start = ctx.currentTime + when;
  osc.frequency.setValueAtTime(frequency, start);
  if (freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), start + duration);
  }
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp);
  amp.connect(masterGainNode || ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function playNoise({
  duration = 0.06,
  gain = 0.03,
  filterFreq,
  filterQ = 1.2,
  filterType = "bandpass",
  when = 0
}: NoiseSpec = {}): void {
  const ctx = ensureAudioReady();
  if (!ctx) return;

  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (secureRandom() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  const amp = ctx.createGain();
  source.buffer = buffer;

  const start = ctx.currentTime + when;
  amp.gain.setValueAtTime(gain, start);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  let output: AudioNode = source;
  if (filterFreq) {
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, start);
    filter.Q.setValueAtTime(filterQ, start);
    source.connect(filter);
    output = filter;
  }

  output.connect(amp);
  amp.connect(masterGainNode || ctx.destination);
  source.start(start);
}

function playImpact({ base = 90, gain = 0.07, duration = 0.12 }: { base?: number; gain?: number; duration?: number } = {}): void {
  playNoise({ duration: duration * 0.45, gain: gain * 0.9, filterFreq: jitterHz(base * 2.2, 0.12), filterType: "lowpass" });
  playTone({ frequency: jitterHz(base, 0.08), duration, type: "triangle", gain: gain * 1.1, freqEnd: 40 });
}

function playChime(notes: number[], spacing = 0.09, gain = 0.028): void {
  notes.forEach((freq, index) => {
    playTone({
      frequency: jitterHz(freq, 0.02),
      duration: 0.14 + index * 0.02,
      type: "sine",
      gain,
      when: index * spacing
    });
  });
}

function sfxSuccess(): void {
  playTone({ frequency: 392, duration: 0.1, type: "sine", gain: 0.04 });
  playTone({ frequency: 523, duration: 0.15, type: "sine", gain: 0.03, when: 0.08 });
  playTone({ frequency: 784, duration: 0.2, type: "triangle", gain: 0.02, when: 0.12 });
}

function sfxFail(): void {
  playTone({ frequency: 140, duration: 0.15, type: "sawtooth", gain: 0.05, freqEnd: 80 });
  playNoise({ duration: 0.1, gain: 0.03, filterFreq: 400, filterType: "lowpass", when: 0.05 });
  playTone({ frequency: 98, duration: 0.2, type: "triangle", gain: 0.04, when: 0.08, freqEnd: 50 });
}

function sfxFailSoft(): void {
  playTone({ frequency: 196, duration: 0.08, type: "sine", gain: 0.022 });
}

function sfxDiscovery(): void {
  playChime([523, 659, 784, 988, 1046], 0.08, 0.04);
  playTone({ frequency: 523, duration: 0.4, type: "sine", gain: 0.02, when: 0.0 });
  playNoise({ duration: 0.2, gain: 0.02, filterFreq: 2200, filterType: "highpass", when: 0.25 });
}

function sfxRecipeComplete(): void {
  playChime([440, 554, 659, 880, 1108], 0.1, 0.035);
  playTone({ frequency: 440, duration: 0.5, type: "triangle", gain: 0.02, when: 0.0 });
  playTone({ frequency: 220, duration: 0.5, type: "sine", gain: 0.03, when: 0.0 });
}

function sfxLevelUp(): void {
  playChime([392, 494, 587, 740, 880], 0.09, 0.032);
  playNoise({ duration: 0.1, gain: 0.015, filterFreq: 2200, filterType: "highpass", when: 0.35 });
}

function sfxUnlock(): void {
  playChime([330, 415, 523, 659], 0.1, 0.03);
}

function sfxMilestone(): void {
  playChime([262, 330, 392, 523, 659], 0.11, 0.028);
  playTone({ frequency: 784, duration: 0.22, type: "sine", gain: 0.02, when: 0.45 });
}

function sfxHint(): void {
  playTone({ frequency: 660, duration: 0.05, type: "sine", gain: 0.018 });
  playTone({ frequency: 880, duration: 0.07, type: "sine", gain: 0.015, when: 0.05 });
}

function sfxUiClick(): void {
  playTone({ frequency: 720, duration: 0.04, type: "sine", gain: 0.018, freqEnd: 900 });
  playTone({ frequency: 1440, duration: 0.02, type: "triangle", gain: 0.01 });
}

function sfxUiPickup(): void {
  playTone({ frequency: 280, duration: 0.06, type: "triangle", gain: 0.025, freqEnd: 460 });
  playNoise({ duration: 0.04, gain: 0.015, filterFreq: 1200, filterType: "bandpass" });
}

function sfxUiPlace(): void {
  playTone({ frequency: 220, duration: 0.06, type: "triangle", gain: 0.03, freqEnd: 160 });
  playNoise({ duration: 0.05, gain: 0.02, filterFreq: 800, filterType: "lowpass" });
}

function sfxUiRemove(): void {
  playTone({ frequency: 360, duration: 0.05, type: "sine", gain: 0.016, freqEnd: 220 });
}

function sfxUiHover(): void {
  playTone({ frequency: 880, duration: 0.03, type: "sine", gain: 0.012, freqEnd: 1200 });
}

function sfxUiUndo(): void {
  playTone({ frequency: 420, duration: 0.06, type: "sine", gain: 0.02, freqEnd: 300 });
  playTone({ frequency: 330, duration: 0.07, type: "sine", gain: 0.016, when: 0.05, freqEnd: 260 });
}

function sfxUiClear(): void {
  playTone({ frequency: 260, duration: 0.08, type: "triangle", gain: 0.02, freqEnd: 140 });
  playNoise({ duration: 0.06, gain: 0.012, filterFreq: 700, filterType: "lowpass", when: 0.03 });
}

function sfxUiTab(): void {
  playTone({ frequency: 540, duration: 0.04, type: "sine", gain: 0.014 });
}

function sfxUiLocked(): void {
  playTone({ frequency: 120, duration: 0.07, type: "square", gain: 0.012 });
  playTone({ frequency: 90, duration: 0.08, type: "square", gain: 0.01, when: 0.07 });
}

function sfxCombine(): void {
  playNoise({ duration: 0.05, gain: 0.018, filterFreq: 500, filterType: "bandpass" });
  playTone({ frequency: 240, duration: 0.07, type: "sine", gain: 0.02, freqEnd: 320 });
  playTone({ frequency: 360, duration: 0.08, type: "sine", gain: 0.018, when: 0.05 });
}

function sfxMix(): void {
  playNoise({ duration: 0.07, gain: 0.014, filterFreq: 420, filterType: "bandpass" });
  playTone({ frequency: 300, duration: 0.06, type: "sine", gain: 0.016, when: 0.04 });
}

function sfxWhisk(): void {
  for (let i = 0; i < 4; i += 1) {
    playNoise({
      duration: 0.03,
      gain: 0.01,
      filterFreq: jitterHz(900 + i * 80, 0.1),
      filterType: "highpass",
      when: i * 0.045
    });
  }
}

function sfxGel(): void {
  playTone({ frequency: 520, duration: 0.1, type: "sine", gain: 0.018 });
  playTone({ frequency: 680, duration: 0.12, type: "sine", gain: 0.014, when: 0.06 });
  playNoise({ duration: 0.08, gain: 0.01, filterFreq: 1600, filterType: "highpass", when: 0.08 });
}

function sfxSeparate(): void {
  playNoise({ duration: 0.05, gain: 0.022, filterFreq: 1100, filterType: "bandpass" });
  playTone({ frequency: 420, duration: 0.05, type: "triangle", gain: 0.018, freqEnd: 260 });
}

function sfxPeel(): void {
  playNoise({ duration: 0.08, gain: 0.02, filterFreq: 1400, filterType: "highpass" });
  playTone({ frequency: 500, duration: 0.06, type: "sine", gain: 0.014, freqEnd: 700 });
}

function sfxTear(): void {
  playNoise({ duration: 0.06, gain: 0.024, filterFreq: 800, filterType: "bandpass" });
  playNoise({ duration: 0.05, gain: 0.016, filterFreq: 1200, filterType: "highpass", when: 0.04 });
}

function sfxSmash(): void {
  playImpact({ base: 95, gain: 0.075, duration: 0.11 });
}

function sfxPound(): void {
  playImpact({ base: 75, gain: 0.08, duration: 0.13 });
  playNoise({ duration: 0.04, gain: 0.02, filterFreq: 600, filterType: "lowpass", when: 0.11 });
  playTone({ frequency: 68, duration: 0.1, type: "triangle", gain: 0.05, when: 0.11, freqEnd: 45 });
}

function sfxPress(): void {
  playTone({ frequency: 120, duration: 0.14, type: "triangle", gain: 0.03, freqEnd: 80 });
  playNoise({ duration: 0.1, gain: 0.015, filterFreq: 350, filterType: "lowpass" });
}

function sfxGrind(): void {
  playNoise({ duration: 0.09, gain: 0.022, filterFreq: 700, filterType: "bandpass" });
  playNoise({ duration: 0.07, gain: 0.016, filterFreq: 950, filterType: "bandpass", when: 0.05 });
}

function sfxKnead(): void {
  playNoise({ duration: 0.08, gain: 0.016, filterFreq: 280, filterType: "lowpass" });
  playTone({ frequency: 160, duration: 0.1, type: "sine", gain: 0.018, freqEnd: 120, when: 0.06 });
}

function sfxEmulsify(): void {
  playNoise({ duration: 0.1, gain: 0.018, filterFreq: 1100, filterType: "bandpass" });
  playTone({ frequency: 440, duration: 0.08, type: "sine", gain: 0.016, when: 0.05 });
  playTone({ frequency: 660, duration: 0.1, type: "sine", gain: 0.014, when: 0.1 });
}

function sfxChop(): void {
  playNoise({ duration: 0.04, gain: 0.03, filterFreq: 1200, filterType: "highpass" });
  playTone({ frequency: jitterHz(180, 0.1), duration: 0.04, type: "triangle", gain: 0.028 });
}

function sfxSlice(): void {
  playNoise({ duration: 0.05, gain: 0.026, filterFreq: 1500, filterType: "highpass" });
  playTone({ frequency: jitterHz(220, 0.08), duration: 0.05, type: "triangle", gain: 0.024, freqEnd: 140 });
}

function sfxDice(): void {
  sfxChop();
  playTone({ frequency: jitterHz(260, 0.08), duration: 0.035, type: "triangle", gain: 0.02, when: 0.05 });
}

function sfxChar(): void {
  playNoise({ duration: 0.12, gain: 0.028, filterFreq: 900, filterType: "bandpass" });
  playNoise({ duration: 0.1, gain: 0.02, filterFreq: 400, filterType: "lowpass", when: 0.06 });
  playTone({ frequency: 180, duration: 0.1, type: "sawtooth", gain: 0.012, when: 0.04 });
}

function sfxCook(): void {
  playNoise({ duration: 0.14, gain: 0.022, filterFreq: 650, filterType: "bandpass" });
  playTone({ frequency: 200, duration: 0.12, type: "sine", gain: 0.014 });
  sfxBubble();
}

function sfxPrecision(): void {
  playTone({ frequency: 330, duration: 0.1, type: "sine", gain: 0.016 });
  playTone({ frequency: 440, duration: 0.12, type: "sine", gain: 0.014, when: 0.08 });
  playNoise({ duration: 0.08, gain: 0.01, filterFreq: 2000, filterType: "highpass", when: 0.1 });
}

function sfxBubble(): void {
  playTone({ frequency: jitterHz(320, 0.08), duration: 0.05, type: "sine", gain: 0.022 });
  playTone({ frequency: jitterHz(480, 0.08), duration: 0.06, type: "sine", gain: 0.018, when: 0.04 });
  playTone({ frequency: jitterHz(620, 0.08), duration: 0.05, type: "sine", gain: 0.014, when: 0.08 });
}

const SOUND_HANDLERS: Record<SoundId, () => void> = {
  success: sfxSuccess,
  fail: sfxFail,
  fail_soft: sfxFailSoft,
  discovery: sfxDiscovery,
  recipe_complete: sfxRecipeComplete,
  level_up: sfxLevelUp,
  unlock: sfxUnlock,
  milestone: sfxMilestone,
  hint: sfxHint,
  ui_click: sfxUiClick,
  ui_pickup: sfxUiPickup,
  ui_place: sfxUiPlace,
  ui_remove: sfxUiRemove,
  ui_hover: sfxUiHover,
  ui_undo: sfxUiUndo,
  ui_clear: sfxUiClear,
  ui_tab: sfxUiTab,
  ui_locked: sfxUiLocked,
  combine: sfxCombine,
  mix: sfxMix,
  whisk: sfxWhisk,
  gel: sfxGel,
  separate: sfxSeparate,
  peel: sfxPeel,
  tear: sfxTear,
  smash: sfxSmash,
  pound: sfxPound,
  press: sfxPress,
  grind: sfxGrind,
  knead: sfxKnead,
  emulsify: sfxEmulsify,
  chop: sfxChop,
  slice: sfxSlice,
  dice: sfxDice,
  char: sfxChar,
  cook: sfxCook,
  precision: sfxPrecision,
  bubble: sfxBubble
};

const SKILL_SOUND_MAP: Record<string, SoundId> = {
  separate: "separate",
  peel: "peel",
  core_seed: "peel",
  fillet_debone: "slice",
  tear: "tear",
  structured_tear: "tear",
  chunking: "chop",
  cutting: "chop",
  slicing: "slice",
  dicing: "dice",
  julienne: "slice",
  smash: "smash",
  pound: "pound",
  press: "press",
  grind: "grind",
  knead: "knead",
  emulsify: "emulsify",
  char: "char",
  cook: "cook",
  precision: "precision",
  hand_mix: "mix",
  whisk_churn: "whisk",
  gel_foam: "gel"
};

const ACTION_SOUND_MAP: Record<string, SoundId> = {
  move: "ui_click",
  combine: "combine",
  separate: "separate",
  force: "smash",
  change: "char",
  smash: "smash",
  tear: "tear",
  peel: "peel",
  thermal: "char",
  structure: "mix"
};

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = Boolean(enabled);
  writeSoundPref(soundEnabled);
  if (soundEnabled) {
    const ctx = getContext();
    if (ctx?.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }
}

export function loadSoundPreference(): boolean {
  soundEnabled = readSoundPref();
  soundVolume = readSoundVolumePref();
  return soundEnabled;
}

export function getSoundVolume(): number {
  return soundVolume;
}

export function setSoundVolume(volume: number): void {
  const v = Math.max(0, Math.min(1, volume));
  soundVolume = v;
  writeSoundVolumePref(v);
  if (masterGainNode) {
    masterGainNode.gain.value = 0.6 * v;
  }
}

export function unlockAudioOnGesture(): void {
  if (unlockBound) return;
  unlockBound = true;

  const unlock = () => {
    const ctx = getContext();
    if (ctx?.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    // Browsers block audio until a gesture — start ambience now if the player wants it.
    if (ambienceEnabled && !hearthAudio) {
      startHearthAmbience();
    }
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("keydown", unlock);
  };

  document.addEventListener("pointerdown", unlock, { once: true, passive: true });
  document.addEventListener("keydown", unlock, { once: true });
}

/* --- Hearth ambience: a pre-recorded loopable fire crackle --- */

const AMBIENCE_PREF_KEY = "culinary_ambience_enabled";

let ambienceEnabled = false;
let hearthAudio: HTMLAudioElement | null = null;
let fadeInterval: number | null = null;

function readAmbiencePref(): boolean {
  try {
    return localStorage.getItem(AMBIENCE_PREF_KEY) === "true";
  } catch {
    return false;
  }
}

function writeAmbiencePref(enabled: boolean): void {
  try {
    localStorage.setItem(AMBIENCE_PREF_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore storage failures.
  }
}

function startHearthAmbience(): void {
  if (fadeInterval !== null) {
    clearInterval(fadeInterval);
    fadeInterval = null;
  }

  if (!hearthAudio) {
    hearthAudio = new Audio("/assets/audio/hearth.mp3");
    hearthAudio.loop = true;
    hearthAudio.volume = 0.01;
  }

  hearthAudio.play().then(() => {
    // Smoother fade in with smaller steps
    const targetVolume = 0.25;
    fadeInterval = window.setInterval(() => {
      if (!hearthAudio) {
        if (fadeInterval !== null) {
          clearInterval(fadeInterval);
          fadeInterval = null;
        }
        return;
      }
      if (hearthAudio.volume < targetVolume) {
        // Linear fade that prevents volume popping
        let nextVol = hearthAudio.volume + 0.01;
        // Clamp explicitly to avoid float math overshooting
        if (nextVol > targetVolume) nextVol = targetVolume;
        hearthAudio.volume = nextVol;
      } else {
        clearInterval(fadeInterval!);
        fadeInterval = null;
      }
    }, 50);
  }).catch(err => {
    console.warn("Failed to play hearth audio:", err);
  });
}

function stopHearthAmbience(): void {
  if (fadeInterval !== null) {
    clearInterval(fadeInterval);
    fadeInterval = null;
  }
  if (!hearthAudio) return;

  const audio = hearthAudio;
  // Smoother fade out
  fadeInterval = window.setInterval(() => {
    if (audio.volume > 0.01) {
      let nextVol = audio.volume - 0.01;
      if (nextVol < 0) nextVol = 0;
      audio.volume = nextVol;
    } else {
      clearInterval(fadeInterval!);
      fadeInterval = null;
      audio.pause();
      if (hearthAudio === audio) {
        hearthAudio = null;
      }
    }
  }, 50);
}

export function isAmbienceEnabled(): boolean {
  return ambienceEnabled;
}

export function setAmbienceEnabled(enabled: boolean): void {
  ambienceEnabled = Boolean(enabled);
  writeAmbiencePref(ambienceEnabled);
  if (ambienceEnabled) {
    startHearthAmbience();
  } else {
    stopHearthAmbience();
  }
}

export function loadAmbiencePreference(): boolean {
  ambienceEnabled = readAmbiencePref();
  return ambienceEnabled;
}

export function resolveTechniqueSoundId(
  skillId: string | null | undefined,
  activeAction?: string | null
): SoundId {
  if (skillId && SKILL_SOUND_MAP[skillId]) {
    return SKILL_SOUND_MAP[skillId];
  }
  if (activeAction && ACTION_SOUND_MAP[activeAction]) {
    return ACTION_SOUND_MAP[activeAction];
  }
  if (activeAction === "combine") return "combine";
  if (activeAction === "separate") return "separate";
  return "chop";
}

export function playTechniqueSound(
  skillId: string | null | undefined,
  activeAction?: string | null
): void {
  playSound(resolveTechniqueSoundId(skillId, activeAction));
}

export function playActionSelectSound(action: string): void {
  playSound(ACTION_SOUND_MAP[action] ?? "ui_click");
}

export function playSound(name: SoundId): void {
  if (!soundEnabled) return;
  if (!canPlaySound(name)) return;

  const handler = SOUND_HANDLERS[name];
  if (!handler) return;

  ensureAudioReady();
  handler();
}

export function updateSoundToggleButton(btn: HTMLButtonElement | null): void {
  if (!btn) return;
  const on = soundEnabled;
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  btn.setAttribute("aria-label", on ? "Mute kitchen sounds" : "Enable kitchen sounds");
  btn.title = on ? "Mute sounds (S)" : "Enable sounds (S)";

  const emojiSpan = document.createElement("span");
  emojiSpan.setAttribute("aria-hidden", "true");
  emojiSpan.textContent = on ? "🔊" : "🔇";
  btn.replaceChildren(emojiSpan);
}

/** Keep header toggle and settings switch in sync. */
export function syncSoundUi(enabled = soundEnabled): void {
  const settingSound = document.getElementById("setting-sound") as HTMLInputElement | null;
  const btnSound = document.getElementById("btn-sound") as HTMLButtonElement | null;

  updateSoundToggleButton(btnSound);
  if (settingSound) {
    settingSound.checked = enabled;
    settingSound.setAttribute("aria-checked", enabled ? "true" : "false");
  }
}
