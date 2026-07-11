import { getCtx } from "../context";
import { getDiscoverySaveData } from "./persistence";
import {
  applyAchievementsSaveData,
  checkAchievements,
  getAchievementsSaveData,
  saveAchievements
} from "../progression/achievements";
import { isPlayerActionUnlocked } from "../progression/skills";
import { setSoundEnabled } from "../feedback/sounds";
import { getSettingsSnapshot, setReducedMotion } from "../settings";
import { syncSettingsControls } from "../ui/settings";
import { clearWorkspace } from "../canvas/workspace";
import { clearUndoEntry } from "../feedback/undo";
import {
  renderCookingToolbar,
  setToolbarMode,
  updateBodyToolAttribute
} from "../actions/toolbar";
import { updateStats } from "./persistence";
import { updateSkillsUI } from "../ui/skills-panel";
import { renderCabinet } from "../cabinet";
import { refreshProgressGraphIfOpen } from "../ui/views";
import { SAVE_FILE_VERSION } from "./save-io";
import type { GameSaveFile } from "../../types";

export type SessionRefreshOptions = {
  clearWorkspace?: boolean;
  silentAchievements?: boolean;
};

/** Apply portable save payload to runtime + localStorage (no UI refresh). */
export function hydrateGameSession(save: GameSaveFile): void {
  const { state, data } = getCtx();

  applyDiscoverySaveData(save.discovery);
  data.Progression.applyState(save.progression);
  applyAchievementsSaveData(save.achievements ?? { unlocked: [], flags: [] });
  saveAchievements();
  setSoundEnabled(save.settings.soundEnabled);
  setReducedMotion(save.settings.reducedMotion);
  syncSettingsControls();
  state.notifiedForceUnlock = isPlayerActionUnlocked("force");
  state.notifiedCombineUnlock = isPlayerActionUnlocked("combine");
  state.notifiedChangeUnlock = isPlayerActionUnlocked("change");
  state.notifiedTimeUnlock = isPlayerActionUnlocked("time");
}

/** Rebuild kitchen UI after session state changes. */
export function refreshGameSessionUi(options: SessionRefreshOptions = {}): void {
  const { clearWorkspace: shouldClear = false, silentAchievements = true } = options;

  if (shouldClear) {
    clearWorkspace();
    clearUndoEntry();
  }

  setToolbarMode("separate");
  updateStats();
  updateSkillsUI();
  renderCookingToolbar();
  updateBodyToolAttribute();
  renderCabinet();
  refreshProgressGraphIfOpen();
  checkAchievements({ silent: silentAchievements });
}

/** Build the portable save document from current session state. */
export function buildPortableSave(isSoundEnabled: boolean): GameSaveFile {
  const { data } = getCtx();

  return {
    version: SAVE_FILE_VERSION,
    game: "culinary-alchemy",
    exportedAt: Date.now(),
    discovery: getDiscoverySaveData(),
    progression: data.Progression.getState(),
    achievements: getAchievementsSaveData(),
    settings: getSettingsSnapshot(isSoundEnabled)
  };
}
