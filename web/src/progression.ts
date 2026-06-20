/**
 * Culinary Alchemy - Game Progression Browser Adapter
 * Coordinates between ProgressionEngine logic and browser localStorage persistence.
 */

import { ProgressionEngine } from "./engine/progression_engine";
import { PROGRESSION_CONFIG } from "./progression_config";
import { parseBoundedXpMap } from "./game/security/save-validation";
import type { ProgressionApi, ProgressionState } from "./types";

function createProgressionApi(): ProgressionApi {
  return {
    engine: null,

    load() {
      try {
        const saved = localStorage.getItem("culinary_progression");
        let initialState: ProgressionState | null = null;
        if (saved) {
          const parsed = JSON.parse(saved) as ProgressionState;
          const xp = parsed?.xp ? parseBoundedXpMap(parsed.xp) : null;
          if (xp) {
            initialState = {
              xp,
              milestonesReached: Array.isArray(parsed.milestonesReached)
                ? parsed.milestonesReached.filter(
                  item => typeof item === "number" && Number.isInteger(item) && item >= 0
                )
                : []
            };
          }
        }
        this.engine = new ProgressionEngine(PROGRESSION_CONFIG, initialState);
      } catch (e) {
        console.error("Failed to load progression state", e);
        this.reset();
      }
    },

    save() {
      try {
        if (this.engine) {
          localStorage.setItem("culinary_progression", JSON.stringify(this.engine.getState()));
        }
      } catch (e) {
        console.error("Failed to save progression state", e);
      }
    },

    reset() {
      this.engine = new ProgressionEngine(PROGRESSION_CONFIG);
      this.save();
    },

    applyState(state: ProgressionState) {
      this.engine = new ProgressionEngine(PROGRESSION_CONFIG, state);
      this.save();
    },

    getXP(skillId) {
      return this.engine ? this.engine.getXP(skillId) : 0;
    },

    isUnlocked(skillId) {
      return this.engine ? this.engine.isUnlocked(skillId) : false;
    },

    getActiveTier(category) {
      return this.engine ? this.engine.getActiveTier(category) : null;
    },

    countUnlockedAncestors(skillId) {
      return this.engine ? this.engine.countUnlockedAncestors(skillId) : 0;
    },

    getToolCategory(toolId) {
      return this.engine ? this.engine.getToolCategory(toolId) : null;
    },

    addXP(skillId, amount) {
      if (!this.engine) return { leveledUp: false, newlyUnlockedSkills: [] };
      const result = this.engine.addXP(skillId, amount);
      this.save();
      return result;
    },

    checkMilestoneUnlocks(discoveredCount) {
      if (!this.engine) return [];
      const result = this.engine.checkMilestoneUnlocks(discoveredCount);
      if (result.length > 0) {
        this.save();
      }
      return result;
    },

    getUnlockedIngredients() {
      return this.engine ? this.engine.getUnlockedIngredients() : [];
    },

    getState() {
      return this.engine
        ? this.engine.getState()
        : { xp: {}, milestonesReached: [] };
    }
  };
}

/** Wire window globals after progression config has loaded. */
export function bootstrapProgression(): void {
  const config = PROGRESSION_CONFIG;
  if (!config?.techniques || !config?.playerActions) {
    throw new Error("Progression config did not load — check script order or use npm run dev.");
  }

  globalThis.PROGRESSION_TECHNIQUE_CATEGORIES = config.techniqueCategories;
  globalThis.PROGRESSION_TIERS = config.techniques;
  globalThis.PLAYER_ACTIONS = config.playerActions;
  globalThis.INGREDIENT_MILESTONES = config.milestones;
  globalThis.Progression = createProgressionApi();
}
