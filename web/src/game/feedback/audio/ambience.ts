import { state, readAmbiencePref, writeAmbiencePref } from "./state";
import { getResumableContext, getContext } from "./core";
import { secureRandom } from "../../security/math";

export function isAmbienceEnabled(): boolean {
  return state.ambienceEnabled;
}

export function setAmbienceEnabled(enabled: boolean): void {
  state.ambienceEnabled = enabled;
  writeAmbiencePref(enabled);
  if (enabled) {
    startHearthAmbience();
  } else {
    stopHearthAmbience();
  }
}

export function loadAmbiencePreference(): boolean {
  state.ambienceEnabled = readAmbiencePref();
  return state.ambienceEnabled;
}

let lastOut = 0;

export function startHearthAmbience(): void {
  const ctx = getResumableContext();
  if (!ctx || !state.ambienceEnabled || state.ambienceSource) return;

  const duration = 2.0;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const white = secureRandom() * 2 - 1;
    const brown = (lastOut + 0.02 * white) / 1.02;
    lastOut = brown;
    data[i] = brown * 3.5;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 150;

  const gain = ctx.createGain();
  gain.gain.value = 0.015;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start();

  state.ambienceSource = source;
  state.ambienceGain = gain;
}

export function stopHearthAmbience(): void {
  if (state.ambienceGain) {
    const ctx = getContext();
    if (ctx) {
      state.ambienceGain.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
    }
  }

  setTimeout(() => {
    if (state.ambienceSource) {
      try {
        state.ambienceSource.stop();
      } catch {}
      state.ambienceSource.disconnect();
      state.ambienceSource = null;
    }
    if (state.ambienceGain) {
      state.ambienceGain.disconnect();
      state.ambienceGain = null;
    }
  }, 1000);
}
