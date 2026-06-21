/**
 * Cross-platform content & save types — shared by web, export pipeline, and native clients.
 */

export interface TechniqueTier {
  name: string;
  emoji: string;
  category: string;
  dependsOn?: string[];
  leadsTo?: string[];
  actions: string[];
  desc?: string;
  unlockCriteria?: {
    prerequisites?: Record<string, number>;
    discoveredRecipes?: number;
  };
}

export interface TechniqueCategory {
  label: string;
  techniques: Record<string, Omit<TechniqueTier, "category">>;
}

export interface PlayerAction {
  name: string;
  emoji: string;
  mode?: string;
  categories?: string[];
  starterSkill?: string;
  unlockCriteria?: {
    discoveredRecipes?: number;
    requiredIngredients?: string[];
  };
  desc?: string;
}

export interface IngredientMilestone {
  recipesCount: number;
  unlocks: string[];
  name?: string;
  emoji?: string;
}

export interface ProgressionConfig {
  techniqueCategories: Record<string, TechniqueCategory>;
  techniques: Record<string, TechniqueTier & { category?: string }>;
  playerActions: Record<string, PlayerAction>;
  milestones: IngredientMilestone[];
  maxSkillExp: number;
}

export interface TechniqueRecipe {
  input: string;
  tool?: string;
  tools?: string[];
  outputs?: string[];
  onePerAction?: boolean;
  description?: string;
  tip?: string;
  blurb?: string;
}

export interface CombineRecipe {
  inputs: string[];
  description?: string;
  tip?: string;
  blurb?: string;
}

export type RecipeDefinition = TechniqueRecipe | CombineRecipe;

export type IngredientMoisture = "high" | "medium" | "low";
export type IngredientFat = "high" | "medium" | "low";
export type IngredientStructure = "hard" | "soft" | "liquid";

export interface IngredientProperties {
  edibleRaw: boolean;
  moisture: IngredientMoisture;
  fat: IngredientFat;
  structure: IngredientStructure;
  hasOuterLayer: boolean;
  hasBones: boolean;
  hasSeeds: boolean;
  toxic: boolean;
}

export interface IngredientItem {
  id: string;
  name: string;
  emoji: string;
  type?: "ingredient" | "recipe";
  origin?: string;
  category?: string;
  description?: string;
  blurb?: string;
  tip?: string;
  recipes?: RecipeDefinition[];
  xpCategory?: string;
  xpAwarded?: number;
  properties?: IngredientProperties;
  pack?: string;
}

export type DiscoverableMap = Record<string, IngredientItem>;

export interface TechniqueTransition {
  id: string;
  kind: "technique";
  tools: string[];
  input: string;
  outputs: string[];
  onePerAction: boolean;
  resultItemId: string;
  recipe: TechniqueRecipe;
}

export interface CombineTransition {
  id: string;
  kind: "combine";
  inputs: string[];
  outputs: string[];
  resultItemId: string;
  recipe: CombineRecipe;
}

export type Transition = TechniqueTransition | CombineTransition;

export interface GraphEdge {
  id: string;
  kind: "technique" | "combine";
  inputs: string[];
  output: string;
  tool: string | null;
}

export interface ProgressionState {
  xp: Record<string, number>;
  milestonesReached: number[];
}

export type AchievementCategory = "discovery" | "technique" | "progression" | "exploration";

export interface AchievementDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  hint: string;
  category: AchievementCategory;
  steamId?: string;
}

export type AchievementRule =
  | { type: "raw_discoveries"; min: number }
  | { type: "recipe_discoveries"; min: number }
  | { type: "non_primitive_discoveries"; min: number }
  | { type: "map_complete" }
  | { type: "skill_unlocked"; skillId: string }
  | { type: "action_unlocked"; actionId: string }
  | { type: "total_xp"; min: number }
  | { type: "skill_xp"; skillId: string; min: number }
  | { type: "flag"; flag: string }
  | { type: "journal_entries"; min: number };

export interface AchievementUnlock {
  id: string;
  unlockedAt: number;
}

export interface AchievementsSaveData {
  unlocked: AchievementUnlock[];
  flags: string[];
}

export interface DiscoveryLogEntry {
  id: string;
  discoveredAt: number;
}

export interface DiscoverySaveData {
  discovered: string[];
  recent: string[];
  highlights: string[];
  discoveryLog: DiscoveryLogEntry[];
  lastSaved?: number;
}

export interface GameSaveFile {
  version: 1;
  game: "culinary-alchemy";
  exportedAt: number;
  discovery: DiscoverySaveData;
  progression: ProgressionState;
  achievements?: AchievementsSaveData;
  settings: {
    soundEnabled: boolean;
    reducedMotion?: boolean;
  };
}

/** Portable game bundle written by `npm run export-native`. */
export interface ExportedGameBundle {
  version: number;
  starters: IngredientItem[];
  unlockables: IngredientItem[];
  discoverable: DiscoverableMap;
  progression: ProgressionConfig;
  achievements: AchievementDefinition[];
  achievementRules: Record<string, AchievementRule>;
}
