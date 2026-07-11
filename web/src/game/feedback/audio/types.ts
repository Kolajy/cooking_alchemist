export type OscType = OscillatorType;

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

export type ToneSpec = {
  frequency: number;
  duration?: number;
  type?: OscType;
  gain?: number;
  when?: number;
  freqEnd?: number;
};

export type NoiseSpec = {
  duration?: number;
  gain?: number;
  filterFreq?: number;
  filterQ?: number;
  filterType?: BiquadFilterType;
  when?: number;
};
