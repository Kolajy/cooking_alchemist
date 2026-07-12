import {
  prefersReducedMotionSystem,
  isHighContrastEnabled,
  setHighContrast,
  loadHighContrastPreference,
  isReducedMotionEnabled,
  setReducedMotion,
  loadReducedMotionPreference,
  loadSettings,
  getSettingsSnapshot
} from "./settings";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

console.log("Mocking DOM for settings test...");
let mockStorage: Record<string, string> = {};
global.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { mockStorage = {}; },
  length: 0,
  key: () => null,
} as unknown as Storage;

global.document = {
  documentElement: {
    dataset: {},
    classList: {
      _classes: new Set<string>(),
      add: function(c: string) { this._classes.add(c); },
      remove: function(c: string) { this._classes.delete(c); },
      contains: function(c: string) { return this._classes.has(c); }
    }
  }
} as unknown as Document;

global.window = {
  matchMedia: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  })
} as unknown as Window & typeof globalThis;

console.log("=== Testing Game Settings ===");

// Reduced Motion Tests
console.log("Testing Reduced Motion...");
mockStorage = {};
setReducedMotion(true);
assert(isReducedMotionEnabled() === true, "Reduced motion should be enabled");
assert(mockStorage["culinary_reduced_motion"] === "true", "Reduced motion should be saved to localStorage as 'true'");
assert(document.documentElement.dataset.motion === "reduced", "Reduced motion dataset should be set");

setReducedMotion(false);
assert(isReducedMotionEnabled() === false, "Reduced motion should be disabled");
assert(mockStorage["culinary_reduced_motion"] === "false", "Reduced motion should be saved to localStorage as 'false'");
assert(document.documentElement.dataset.motion === "full", "Reduced motion dataset should be 'full'");

// Test loading from preference
mockStorage["culinary_reduced_motion"] = "true";
let loadedReducedMotion = loadReducedMotionPreference();
assert(loadedReducedMotion === true, "Should load true from preference");

mockStorage["culinary_reduced_motion"] = "false";
loadedReducedMotion = loadReducedMotionPreference();
assert(loadedReducedMotion === false, "Should load false from preference");

// Test default when no preference
delete mockStorage["culinary_reduced_motion"];
global.window.matchMedia = (query: string) => ({ matches: query === "(prefers-reduced-motion: reduce)", media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true }) as unknown as MediaQueryList;
loadedReducedMotion = loadReducedMotionPreference();
assert(loadedReducedMotion === true, "Should load system preference (true) when no storage");

global.window.matchMedia = (query: string) => ({ matches: false, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true }) as unknown as MediaQueryList;
loadedReducedMotion = loadReducedMotionPreference();
assert(loadedReducedMotion === false, "Should load system preference (false) when no storage");

// High Contrast Tests
console.log("Testing High Contrast...");
mockStorage = {};
setHighContrast(true);
assert(isHighContrastEnabled() === true, "High contrast should be enabled");
assert(mockStorage["culinary_high_contrast"] === "true", "High contrast should be saved to localStorage as 'true'");
assert(document.documentElement.dataset.contrast === "high", "High contrast dataset should be set");
assert((document.documentElement.classList as any).contains("high-contrast"), "High contrast class should be added");

setHighContrast(false);
assert(isHighContrastEnabled() === false, "High contrast should be disabled");
assert(mockStorage["culinary_high_contrast"] === "false", "High contrast should be saved to localStorage as 'false'");
assert(document.documentElement.dataset.contrast === "normal", "High contrast dataset should be 'normal'");
assert(!(document.documentElement.classList as any).contains("high-contrast"), "High contrast class should be removed");

// Test loading from preference
mockStorage["culinary_high_contrast"] = "true";
let loadedHighContrast = loadHighContrastPreference();
assert(loadedHighContrast === true, "Should load true from preference");

mockStorage["culinary_high_contrast"] = "false";
loadedHighContrast = loadHighContrastPreference();
assert(loadedHighContrast === false, "Should load false from preference");

// Test default when no preference
delete mockStorage["culinary_high_contrast"];
global.window.matchMedia = (query: string) => ({ matches: query === "(prefers-contrast: more)", media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true }) as unknown as MediaQueryList;
loadedHighContrast = loadHighContrastPreference();
assert(loadedHighContrast === true, "Should load system preference (true) when no storage");

global.window.matchMedia = (query: string) => ({ matches: false, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true }) as unknown as MediaQueryList;
loadedHighContrast = loadHighContrastPreference();
assert(loadedHighContrast === false, "Should load system preference (false) when no storage");

// General settings load test
console.log("Testing General Settings...");
mockStorage = {
  "culinary_reduced_motion": "true",
  "culinary_high_contrast": "false"
};
loadSettings();
assert(isReducedMotionEnabled() === true, "Reduced motion loaded successfully");
assert(isHighContrastEnabled() === false, "High contrast loaded successfully");

const snapshot = getSettingsSnapshot(true, 1.0);
assert(snapshot.soundEnabled === true, "Snapshot sound correct");
assert(snapshot.soundVolume === 1.0, "Snapshot sound volume correct");
assert(snapshot.reducedMotion === true, "Snapshot motion correct");
assert(snapshot.highContrast === false, "Snapshot contrast correct");

console.log("=== GAME SETTINGS TESTS PASSED ===");
