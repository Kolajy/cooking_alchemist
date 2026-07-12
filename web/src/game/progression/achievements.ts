import { ACHIEVEMENTS, ACHIEVEMENT_BY_ID } from "@culinary-alchemy/content/data/achievements";
import {
  checkAchievementsForContext,
  sanitizeAchievementsSaveData,
  type AchievementEvaluationContext
} from "@culinary-alchemy/content/achievement_engine";
import type { AchievementFlagId } from "@culinary-alchemy/content/data/achievement_rules";
import { getCtx } from "../context";
import { isPlayerActionUnlocked } from "./skills";
import { triggerAchievementNotification } from "./notifications";
import type { AchievementsSaveData } from "../../types";
import { getActiveSlot, getSlotKeys } from "../save/slots";
import { gameStorage } from "../save/storage";

export type AchievementFlag = AchievementFlagId;

function buildAchievementContext(): AchievementEvaluationContext {
  const { state, data } = getCtx();
  return {
    discoveredIds: state.discoveredIds,
    discoveryLogLength: state.discoveryLog.length,
    primitiveIds: data.PRIMITIVE_INGREDIENT_IDS,
    discoverable: data.DISCOVERABLE_ITEMS,
    getIngredientOrigin: data.getIngredientOrigin,
    progressionXp: data.Progression.getState().xp,
    isSkillUnlocked: skillId => data.Progression.isUnlocked(skillId),
    isActionUnlocked: actionId => isPlayerActionUnlocked(actionId),
    flags: state.achievementFlags,
    unlockedAchievementIds: new Set(state.achievementUnlocks.keys())
  };
}

export function getAchievementsSaveData(): AchievementsSaveData {
  const { state } = getCtx();
  return {
    unlocked: [...state.achievementUnlocks.entries()].map(([id, unlockedAt]) => ({ id, unlockedAt })),
    flags: [...state.achievementFlags]
  };
}

export function applyAchievementsSaveData(data: AchievementsSaveData): void {
  const { state, data: layer } = getCtx();
  const sanitized = sanitizeAchievementsSaveData(data, layer.ACHIEVEMENT_RULES);

  state.achievementUnlocks = new Map();
  state.achievementFlags = new Set();

  sanitized.unlocked.forEach(entry => {
    state.achievementUnlocks.set(entry.id, entry.unlockedAt);
  });
  sanitized.flags.forEach(flag => state.achievementFlags.add(flag));
}

export function loadAchievements(): void {
  const { state } = getCtx();
  try {
    const keys = getSlotKeys(getActiveSlot());
    const saved = gameStorage.getItem(keys.achievements);
    if (!saved) {
      state.achievementUnlocks = new Map();
      state.achievementFlags = new Set();
      return;
    }

    applyAchievementsSaveData(JSON.parse(saved) as AchievementsSaveData);

    // Sync already unlocked achievements to Steam upon loading
    if ((window as any).culinaryDesktop?.isElectron) {
      for (const id of state.achievementUnlocks.keys()) {
        try {
          const steamId = ACHIEVEMENT_BY_ID[id]?.steamId;
          if (steamId) {
            (window as any).culinaryDesktop.unlockAchievement(steamId);
          }
        } catch (err) {
          console.error("[steam] Failed to sync achievement to Steam on load:", err);
        }
      }
    }
  } catch (error) {
    console.error("Failed to load achievements", error);
    state.achievementUnlocks = new Map();
    state.achievementFlags = new Set();
  }
}

export function saveAchievements(): void {
  try {
    const keys = getSlotKeys(getActiveSlot());
    gameStorage.setItem(keys.achievements, JSON.stringify(getAchievementsSaveData()));
  } catch (error) {
    console.error("Failed to save achievements", error);
  }
}

export function resetAchievements(): void {
  const { state } = getCtx();
  state.achievementUnlocks = new Map();
  state.achievementFlags = new Set();
  saveAchievements();
}

export function setAchievementFlag(flag: AchievementFlag): void {
  const { state } = getCtx();
  if (state.achievementFlags.has(flag)) return;
  state.achievementFlags.add(flag);
  saveAchievements();
  checkAchievements();
}

export function unlockAchievement(id: string, options: { silent?: boolean } = {}): boolean {
  const { state } = getCtx();
  if (!ACHIEVEMENT_BY_ID[id] || state.achievementUnlocks.has(id)) return false;

  state.achievementUnlocks.set(id, Date.now());
  saveAchievements();

  if (!options.silent) {
    triggerAchievementNotification(ACHIEVEMENT_BY_ID[id]);
  }

  if ((window as any).culinaryDesktop?.isElectron) {
    try {
      const steamId = ACHIEVEMENT_BY_ID[id]?.steamId;
      if (steamId) {
        (window as any).culinaryDesktop.unlockAchievement(steamId);
      }
    } catch (err) {
      console.error("[steam] Failed to unlock achievement on Steam:", err);
    }
  }

  refreshAchievementsPanelIfOpen();
  return true;
}

export function checkAchievements(options: { silent?: boolean } = {}): string[] {
  const { data } = getCtx();
  const pending = checkAchievementsForContext(
    buildAchievementContext(),
    data.ACHIEVEMENT_RULES,
    data.ACHIEVEMENTS
  );

  const newlyUnlocked: string[] = [];
  pending.forEach(id => {
    if (unlockAchievement(id, { silent: options.silent })) {
      newlyUnlocked.push(id);
    }
  });
  return newlyUnlocked;
}

export function getAchievementProgressSummary(): { unlocked: number; total: number } {
  const { state, data } = getCtx();
  return {
    unlocked: state.achievementUnlocks.size,
    total: data.ACHIEVEMENTS.length
  };
}

export function refreshAchievementsPanelIfOpen(): void {
  const { state } = getCtx();
  if (state.activeSidebarTab === "achievements") {
    import("../ui/achievements").then(({ renderAchievementsPanel }) => renderAchievementsPanel());
  }
}

export function recordDiscoveryAchievements(_newIds: string[]): void {
  checkAchievements();
}

/** @deprecated Use data.ACHIEVEMENTS — kept for imports that expect a static list. */
export { ACHIEVEMENTS };
