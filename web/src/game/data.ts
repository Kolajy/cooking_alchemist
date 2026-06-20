/** Bridges browser globals (engines, ingredient data) into the game layer. */

import { CombinationEngine } from "../engine/combination_engine";
import { ProgressionEngine } from "../engine/progression_engine";
import type { DataLayer, DiscoverableMap, ProgressionApi } from "../types";

function readGlobal<K extends keyof typeof globalThis>(key: K, fallback: unknown): unknown {
  const value = globalThis[key];
  if (value === undefined || value === null) {
    console.warn(`[Culinary Alchemy] Missing global ${String(key)}`);
    return fallback;
  }
  return value;
}

export function createDataLayer(): DataLayer {
  const discoverable = readGlobal("DISCOVERABLE_ITEMS", {}) as DiscoverableMap;

  return {
    STARTER_ELEMENTS: readGlobal("STARTER_ELEMENTS", []) as DataLayer["STARTER_ELEMENTS"],
    UNLOCKABLE_ELEMENTS: readGlobal("UNLOCKABLE_ELEMENTS", []) as DataLayer["UNLOCKABLE_ELEMENTS"],
    DISCOVERABLE_ITEMS: discoverable,
    PROGRESSION_TIERS: readGlobal("PROGRESSION_TIERS", {}) as DataLayer["PROGRESSION_TIERS"],
    INGREDIENT_MILESTONES: readGlobal("INGREDIENT_MILESTONES", []) as DataLayer["INGREDIENT_MILESTONES"],
    PLAYER_ACTIONS: readGlobal("PLAYER_ACTIONS", {}) as DataLayer["PLAYER_ACTIONS"],
    PROGRESSION_CONFIG: readGlobal("PROGRESSION_CONFIG", {}) as DataLayer["PROGRESSION_CONFIG"],
    PRIMITIVE_INGREDIENT_IDS: readGlobal("PRIMITIVE_INGREDIENT_IDS", new Set()) as Set<string>,
    transitionIndex: readGlobal("TRANSITION_INDEX", null) as DataLayer["transitionIndex"],
    Progression: readGlobal("Progression", {
      load() {},
      save() {},
      getUnlockedIngredients: () => []
    }) as ProgressionApi,
    combinationEngine: new CombinationEngine(discoverable, globalThis.TRANSITION_INDEX),
    getIngredientOrigin: readGlobal("getIngredientOrigin", () => "processed") as DataLayer["getIngredientOrigin"],
    ACHIEVEMENTS: readGlobal("ACHIEVEMENTS", []) as DataLayer["ACHIEVEMENTS"],
    ACHIEVEMENT_RULES: readGlobal("ACHIEVEMENT_RULES", {}) as DataLayer["ACHIEVEMENT_RULES"]
  };
}

/** ProgressionEngine instance used by combination matching (not the browser adapter). */
export function getProgressionEngine(data: DataLayer | null = null): ProgressionEngine | null {
  const layer = data || createDataLayer();
  return layer.Progression?.engine || null;
}
