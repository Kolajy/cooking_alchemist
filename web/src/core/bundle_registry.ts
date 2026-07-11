import type { DiscoverableMap, ProgressionConfig, IngredientItem, PlayerAction, IngredientMilestone, Achievement, AchievementRules } from "../types";

export interface BundleData {
  STARTER_ELEMENTS: IngredientItem[];
  UNLOCKABLE_ELEMENTS: IngredientItem[];
  DISCOVERABLE_ITEMS: DiscoverableMap;
  TRANSITION_INDEX: any;
  PRIMITIVE_INGREDIENT_IDS: Set<string>;
  PROGRESSION_CONFIG: ProgressionConfig;
  PROGRESSION_TECHNIQUE_CATEGORIES: any;
  PROGRESSION_TIERS: any;
  PLAYER_ACTIONS: Record<string, PlayerAction>;
  INGREDIENT_MILESTONES: IngredientMilestone[];
  getIngredientOrigin: (id: string) => string;
  ACHIEVEMENTS: Achievement[];
  ACHIEVEMENT_RULES: AchievementRules;
}

export const registry: BundleData = {
  STARTER_ELEMENTS: [],
  UNLOCKABLE_ELEMENTS: [],
  DISCOVERABLE_ITEMS: {},
  TRANSITION_INDEX: null,
  PRIMITIVE_INGREDIENT_IDS: new Set(),
  PROGRESSION_CONFIG: {} as any,
  PROGRESSION_TECHNIQUE_CATEGORIES: {},
  PROGRESSION_TIERS: {},
  PLAYER_ACTIONS: {},
  INGREDIENT_MILESTONES: [],
  getIngredientOrigin: () => "processed",
  ACHIEVEMENTS: [],
  ACHIEVEMENT_RULES: {}
};

export function updateRegistry(data: Partial<BundleData>) {
  Object.assign(registry, data);
}
