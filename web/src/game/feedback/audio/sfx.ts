import { playTone, playNoise, playImpact, playChime, jitterHz } from "./core";

export function sfxSuccess(): void {
  playChime([440, 554, 659, 880], 0.08, 0.04);
}

export function sfxFail(): void {
  playTone({ frequency: 220, freqEnd: 180, duration: 0.3, type: "sawtooth", gain: 0.02 });
  playNoise({ duration: 0.2, gain: 0.03, filterFreq: 300, filterType: "lowpass" });
}

export function sfxFailSoft(): void {
  playTone({ frequency: 300, freqEnd: 280, duration: 0.15, type: "triangle", gain: 0.02 });
}

export function sfxDiscovery(): void {
  playChime([523.25, 659.25, 783.99, 1046.50], 0.1, 0.05); // C E G C
}

export function sfxRecipeComplete(): void {
  playChime([440, 554, 659, 880, 1108.73], 0.08, 0.05);
}

export function sfxLevelUp(): void {
  playChime([440, 554, 659, 880, 1108, 1318], 0.07, 0.05);
}

export function sfxUnlock(): void {
  playChime([587.33, 739.99, 880], 0.1, 0.03); // D F# A
}

export function sfxMilestone(): void {
  playChime([392, 493.88, 587.33, 783.99, 987.77], 0.12, 0.04); // G B D G B
}

export function sfxHint(): void {
  playTone({ frequency: 880, duration: 0.15, type: "sine", gain: 0.02 });
  playTone({ frequency: 1760, duration: 0.3, type: "sine", gain: 0.01, when: 0.1 });
}

export function sfxUiClick(): void {
  playTone({ frequency: jitterHz(600), duration: 0.04, type: "sine", gain: 0.02 });
}

export function sfxUiPickup(): void {
  playTone({ frequency: 400, freqEnd: 600, duration: 0.05, type: "sine", gain: 0.02 });
}

export function sfxUiPlace(): void {
  playTone({ frequency: 600, freqEnd: 400, duration: 0.05, type: "sine", gain: 0.02 });
}

export function sfxUiRemove(): void {
  playNoise({ duration: 0.08, gain: 0.015, filterFreq: 800, filterType: "highpass" });
}

export function sfxUiHover(): void {
  playTone({ frequency: jitterHz(800), duration: 0.02, type: "sine", gain: 0.005 });
}

export function sfxUiUndo(): void {
  playTone({ frequency: 500, freqEnd: 400, duration: 0.1, type: "sine", gain: 0.02 });
  playTone({ frequency: 400, freqEnd: 300, duration: 0.15, type: "sine", gain: 0.02, when: 0.1 });
}

export function sfxUiClear(): void {
  playNoise({ duration: 0.2, gain: 0.02, filterFreq: 600, filterType: "lowpass" });
  playTone({ frequency: 300, freqEnd: 150, duration: 0.2, type: "triangle", gain: 0.02 });
}

export function sfxUiTab(): void {
  playTone({ frequency: 700, duration: 0.05, type: "triangle", gain: 0.015 });
}

export function sfxUiLocked(): void {
  playTone({ frequency: 200, duration: 0.08, type: "square", gain: 0.015 });
}

export function sfxCombine(): void {
  playTone({ frequency: jitterHz(400), duration: 0.1, type: "sine", gain: 0.03 });
  playTone({ frequency: jitterHz(600), duration: 0.15, type: "sine", gain: 0.03, when: 0.05 });
  playNoise({ duration: 0.1, gain: 0.01, filterFreq: 1200 });
}

export function sfxMix(): void {
  playTone({ frequency: jitterHz(350), duration: 0.12, type: "sine", gain: 0.02 });
  playNoise({ duration: 0.15, gain: 0.02, filterFreq: 800, filterType: "lowpass" });
}

export function sfxWhisk(): void {
  for (let i = 0; i < 3; i++) {
    playTone({ frequency: jitterHz(800), duration: 0.05, type: "triangle", gain: 0.01, when: i * 0.06 });
    playNoise({ duration: 0.05, gain: 0.02, filterFreq: 2000, filterType: "highpass", when: i * 0.06 });
  }
}

export function sfxGel(): void {
  playTone({ frequency: 300, freqEnd: 500, duration: 0.3, type: "sine", gain: 0.03 });
  playTone({ frequency: 450, freqEnd: 600, duration: 0.3, type: "sine", gain: 0.02, when: 0.1 });
  playNoise({ duration: 0.2, gain: 0.01, filterFreq: 400, filterType: "lowpass" });
}

export function sfxSeparate(): void {
  playTone({ frequency: jitterHz(700), freqEnd: jitterHz(900), duration: 0.08, type: "triangle", gain: 0.02 });
  playNoise({ duration: 0.08, gain: 0.02, filterFreq: 2000, filterType: "highpass" });
}

export function sfxPeel(): void {
  playNoise({ duration: 0.15, gain: 0.03, filterFreq: 1500, filterType: "bandpass" });
  playTone({ frequency: 600, duration: 0.1, type: "triangle", gain: 0.01 });
}

export function sfxTear(): void {
  playNoise({ duration: 0.2, gain: 0.04, filterFreq: 800, filterType: "lowpass" });
}

export function sfxSmash(): void {
  playImpact({ base: jitterHz(80), gain: 0.08, duration: 0.15 });
}

export function sfxPound(): void {
  playImpact({ base: jitterHz(60), gain: 0.1, duration: 0.2 });
  playNoise({ duration: 0.1, gain: 0.04, filterFreq: 300, filterType: "lowpass" });
}

export function sfxPress(): void {
  playTone({ frequency: 150, freqEnd: 100, duration: 0.25, type: "sawtooth", gain: 0.02 });
  playNoise({ duration: 0.25, gain: 0.02, filterFreq: 500, filterType: "lowpass" });
}

export function sfxGrind(): void {
  playNoise({ duration: 0.3, gain: 0.03, filterFreq: 1000, filterType: "bandpass" });
}

export function sfxKnead(): void {
  playTone({ frequency: 200, freqEnd: 150, duration: 0.2, type: "sine", gain: 0.03 });
  playNoise({ duration: 0.15, gain: 0.02, filterFreq: 400, filterType: "lowpass" });
}

export function sfxEmulsify(): void {
  for (let i = 0; i < 4; i++) {
    playTone({ frequency: jitterHz(400 + i * 50), duration: 0.08, type: "sine", gain: 0.02, when: i * 0.04 });
  }
}

export function sfxChop(): void {
  playTone({ frequency: jitterHz(1200), duration: 0.03, type: "square", gain: 0.015 });
  playNoise({ duration: 0.04, gain: 0.02, filterFreq: 3000, filterType: "highpass" });
}

export function sfxSlice(): void {
  playNoise({ duration: 0.12, gain: 0.015, filterFreq: 2500, filterType: "highpass" });
  playTone({ frequency: 900, duration: 0.05, type: "triangle", gain: 0.01 });
}

export function sfxDice(): void {
  for (let i = 0; i < 3; i++) {
    playTone({ frequency: jitterHz(1000), duration: 0.02, type: "square", gain: 0.01, when: i * 0.05 });
    playNoise({ duration: 0.03, gain: 0.015, filterFreq: 2000, filterType: "highpass", when: i * 0.05 });
  }
}

export function sfxChar(): void {
  playNoise({ duration: 0.3, gain: 0.04, filterFreq: 800, filterType: "lowpass" });
  playNoise({ duration: 0.2, gain: 0.02, filterFreq: 4000, filterType: "highpass", when: 0.1 });
}

export function sfxCook(): void {
  playNoise({ duration: 0.4, gain: 0.03, filterFreq: 1200, filterType: "bandpass" });
  playTone({ frequency: 250, freqEnd: 300, duration: 0.3, type: "sine", gain: 0.02 });
}

export function sfxPrecision(): void {
  playTone({ frequency: 1200, duration: 0.08, type: "sine", gain: 0.02 });
  playTone({ frequency: 1500, duration: 0.1, type: "sine", gain: 0.015, when: 0.04 });
}

export function sfxBubble(): void {
  playTone({ frequency: jitterHz(400, 0.2), freqEnd: jitterHz(600, 0.2), duration: 0.08, type: "sine", gain: 0.02 });
}
