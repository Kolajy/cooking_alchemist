import { state } from "./state";
import { ToneSpec, NoiseSpec } from "./types";
import { secureRandom } from "../../security/math";

export function getContext(): AudioContext | null {
  if (!state.audioContext) {
    try {
      state.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("AudioContext not supported", e);
      return null;
    }
  }
  return state.audioContext;
}

export function jitterHz(base: number, spread = 0.06): number {
  return base * (1 - spread + secureRandom() * spread * 2);
}

export function ensureAudioReady(): AudioContext | null {
  const ctx = getContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function getResumableContext(): AudioContext | null {
  const ctx = getContext();
  if (!ctx) return null;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function playTone({
  frequency,
  duration = 0.1,
  type = "sine",
  gain = 0.1,
  when = 0,
  freqEnd
}: ToneSpec): void {
  const ctx = getResumableContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  const startTime = ctx.currentTime + when;
  osc.frequency.setValueAtTime(frequency, startTime);
  if (freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);
  }

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + duration * 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playNoise({
  duration = 0.1,
  gain = 0.1,
  filterFreq = 1000,
  filterQ = 1,
  filterType = "bandpass",
  when = 0
}: NoiseSpec): void {
  const ctx = getResumableContext();
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = secureRandom() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFreq;
  filter.Q.value = filterQ;

  const gainNode = ctx.createGain();

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  const startTime = ctx.currentTime + when;
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + duration * 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  noise.start(startTime);
}

export function playImpact({ base = 90, gain = 0.07, duration = 0.12 }: { base?: number; gain?: number; duration?: number } = {}): void {
  playTone({ frequency: base, duration, type: "triangle", gain, freqEnd: base * 0.5 });
  playNoise({ duration: duration * 0.8, gain: gain * 0.8, filterType: "lowpass", filterFreq: 400 });
}

export function playChime(notes: number[], spacing = 0.09, gain = 0.028): void {
  notes.forEach((freq, i) => {
    playTone({
      frequency: freq,
      duration: 0.6,
      type: "sine",
      gain,
      when: i * spacing
    });
  });
}
