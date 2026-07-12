/** Bridges registry (engines, ingredient data) into the game layer. */

import { registry } from "../core/bundle_registry";
import { CombinationEngine } from "../engine/combination_engine";
import { ProgressionEngine } from "../engine/progression_engine";
import type { DataLayer, ProgressionApi } from "../types";

export function createDataLayer(): DataLayer {
  const discoverable = registry.DISCOVERABLE_ITEMS;
  const progressionApi = (globalThis as any).Progression as ProgressionApi || {
    load() {},
    save() {},
    getUnlockedIngredients: () => []
  };

  return {
    STARTER_ELEMENTS: registry.STARTER_ELEMENTS,
    UNLOCKABLE_ELEMENTS: registry.UNLOCKABLE_ELEMENTS,
    DISCOVERABLE_ITEMS: discoverable,
    PROGRESSION_TIERS: registry.PROGRESSION_TIERS,
    INGREDIENT_MILESTONES: registry.INGREDIENT_MILESTONES,
    PLAYER_ACTIONS: registry.PLAYER_ACTIONS,
    PROGRESSION_CONFIG: registry.PROGRESSION_CONFIG,
    PRIMITIVE_INGREDIENT_IDS: registry.PRIMITIVE_INGREDIENT_IDS,
    transitionIndex: registry.TRANSITION_INDEX,
    Progression: progressionApi,
    combinationEngine: new CombinationEngine(discoverable, registry.TRANSITION_INDEX),
    getIngredientOrigin: registry.getIngredientOrigin,
    ACHIEVEMENTS: registry.ACHIEVEMENTS,
    ACHIEVEMENT_RULES: registry.ACHIEVEMENT_RULES
  };
}

/** ProgressionEngine instance used by combination matching (not the browser adapter). */
export function getProgressionEngine(data: DataLayer | null = null): ProgressionEngine | null {
  const layer = data || createDataLayer();
  return layer.Progression?.engine || null;
}
