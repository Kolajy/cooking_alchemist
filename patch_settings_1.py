with open("web/src/game/settings.ts", "r") as f:
    content = f.read()

if "isHighContrastEnabled" not in content:
    content = content.replace('export interface GameSettingsSnapshot {', '''export interface GameSettingsSnapshot {
  highContrast: boolean;''')

    content = content.replace('const REDUCED_MOTION_KEY = "culinary_reduced_motion";', '''const REDUCED_MOTION_KEY = "culinary_reduced_motion";
const HIGH_CONTRAST_KEY = "culinary_high_contrast";

let highContrast = false;''')

    content = content.replace('''function readReducedMotionPref(): boolean | null {''', '''function readHighContrastPref(): boolean | null {
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

function readReducedMotionPref(): boolean | null {''')

    content = content.replace('''export function loadSettings(): void {
  loadReducedMotionPreference();
}''', '''export function loadSettings(): void {
  loadReducedMotionPreference();
  loadHighContrastPreference();
}''')

    content = content.replace('''    reducedMotion: isReducedMotionEnabled()
  };''', '''    reducedMotion: isReducedMotionEnabled(),
    highContrast: isHighContrastEnabled()
  };''')

with open("web/src/game/settings.ts", "w") as f:
    f.write(content)

print("settings.ts patched")
