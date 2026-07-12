import { getCtx } from "../context";
import { saveProgress } from "./persistence";
import { saveAchievements } from "../progression/achievements";
import { emitGameplayEvent } from "../events/gameplay-events";

const AUTO_SAVE_INTERVAL_MS = 60000; // 1 minute
let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

export function startAutoSave(): void {
  if (autoSaveTimer) return;
  autoSaveTimer = setInterval(() => {
    performAutoSave();
  }, AUTO_SAVE_INTERVAL_MS);
}

export function stopAutoSave(): void {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}

export function performAutoSave(): void {
  const { data } = getCtx();
  saveProgress();
  if (data.Progression && data.Progression.save) {
    data.Progression.save();
  }
  saveAchievements();
  emitGameplayEvent("autoSaved", { timestamp: Date.now() });
  console.log("[Culinary Alchemy] Auto-save complete at", new Date().toLocaleTimeString());
}
