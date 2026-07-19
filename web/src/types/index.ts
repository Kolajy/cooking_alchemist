/**
 * Web & engine types — re-exports cross-platform content types and adds UI/runtime shapes.
 */

export type {
  TechniqueTier,
  TechniqueCategory,
  PlayerAction,
  IngredientMilestone,
  ProgressionConfig,
  TechniqueRecipe,
  CombineRecipe,
  RecipeDefinition,
  IngredientMoisture,
  IngredientFat,
  IngredientStructure,
  IngredientProperties,
  IngredientItem,
  DiscoverableMap,
  TechniqueTransition,
  CombineTransition,
  Transition,
  GraphEdge,
  ProgressionState,
  AchievementCategory,
  AchievementDefinition,
  AchievementRule,
  AchievementUnlock,
  AchievementsSaveData,
  DiscoveryLogEntry,
  DiscoverySaveData,
  GameSaveFile,
  ExportedGameBundle
} from "../../../content/types";

import type {
  IngredientItem,
  DiscoverableMap,
  TechniqueTier,
  IngredientMilestone,
  ProgressionConfig,
  PlayerAction,
  ProgressionState,
  DiscoveryLogEntry
} from "../../../content/types";

export interface MatchRecipeResult {
  success: boolean;
  recipe?: MatchedRecipe;
  lockedSkillId?: string | null;
  requiredSkillName?: string;
}

export interface MatchedRecipe {
  input?: string;
  inputs?: string[];
  tool?: string;
  tools?: string[];
  outputs?: string[];
  onePerAction?: boolean;
  description?: string;
  tip?: string;
  blurb?: string;
  result: IngredientItem;
  results?: IngredientItem[];
  xpCategory?: string;
  xpAwarded?: number;
}

export interface TransitionIndex {
  techniqueTransitions: import("../../../content/types").TechniqueTransition[];
  combineTransitions: import("../../../content/types").CombineTransition[];
  byTechnique: Record<string, Record<string, import("../../../content/types").TechniqueTransition>>;
  byCombine: Record<string, import("../../../content/types").CombineTransition>;
  affectableByTechnique: Record<string, string[]>;
  all: import("../../../content/types").Transition[];
  graphEdges: import("../../../content/types").GraphEdge[];
  getTechniqueTransition: (toolId: string, inputId: string) => import("../../../content/types").TechniqueTransition | null;
  getCombineTransition: (inputIds: string[]) => import("../../../content/types").CombineTransition | null;
  getAffectableInputs: (toolId: string) => string[];
  listTechniqueTransitions: (toolId: string) => import("../../../content/types").TechniqueTransition[];
  getTechniqueItemMap: () => Record<string, string[]>;
  toGraphEdges: () => import("../../../content/types").GraphEdge[];
}

export interface XpResult {
  leveledUp: boolean;
  newlyUnlockedSkills: Array<TechniqueTier & { id: string }>;
}

export interface ProgressionApi {
  engine: import("../engine/progression_engine").ProgressionEngine | null;
  load: () => void;
  save: () => void;
  reset: () => void;
  getXP: (skillId: string) => number;
  isUnlocked: (skillId: string) => boolean;
  getActiveTier: (category: string) => (TechniqueTier & { id: string }) | null;
  countUnlockedAncestors: (skillId: string) => number;
  getToolCategory: (toolId: string) => string | null;
  addXP: (skillId: string, amount: number) => XpResult;
  checkMilestoneUnlocks: (discoveredCount: number) => IngredientMilestone[];
  getUnlockedIngredients: () => string[];
  getState: () => ProgressionState;
  applyState: (state: ProgressionState) => void;
}

export type UndoEntry =
  | { type: "spawn"; itemId: string; x: number; y: number }
  | { type: "remove"; itemId: string; x: number; y: number; origin?: string }
  | {
      type: "combine";
      item1Id: string;
      x1: number;
      y1: number;
      item2Id: string;
      x2: number;
      y2: number;
      outputs?: Array<{ itemId: string; x: number; y: number }>;
    }
  | {
      type: "technique";
      inputId: string;
      x: number;
      y: number;
      origin?: string;
      consumedInput: boolean;
      outputs: Array<{ itemId: string; x: number; y: number }>;
    };

export interface GameState {
  discoveredIds: Set<string>;
  discoveryLog: DiscoveryLogEntry[];
  recentlyDiscoveredIds: string[];
  recentHighlightIds: Set<string>;
  undoEntry: UndoEntry | null;
  activeElements: HTMLElement[];
  draggedElement: HTMLElement | null;
  dragMoved: boolean;
  dragStart: { x: number; y: number };
  dragGrabOffset: { x: number; y: number };
  cabinetDrag: CabinetDragState | null;
  mergeTarget: HTMLElement | null;
  searchTerm: string;
  stateFilterIncludes: Set<string>;
  stateFilterExcludes: Set<string>;
  typeFilterIncludes: Set<string>;
  typeFilterExcludes: Set<string>;
  activeAction: string;
  activeSkillId: string | null;
  activeSidebarTab: string;
  activeMainView: "cook" | "map";
  graphFocusIngredientId: string | null;
  graphFocusDepth: number | "all";
  graphSearchTerm: string;
  notifiedChangeUnlock: boolean;
  notifiedTimeUnlock: boolean;
  achievementUnlocks: Map<string, number>;
  achievementFlags: Set<string>;
}

export interface CabinetDragState {
  active: boolean;
  item: IngredientItem;
  ghost: HTMLElement;
  pointerId: number;
  sourceEl: HTMLElement;
  grabOffset: { x: number; y: number };
  startX: number;
  startY: number;
  overWorkspace?: boolean;
  raf: number | null;
  pendingX?: number;
  pendingY?: number;
  workspaceRect?: DOMRect;
}

export interface GameDom {
  workspace: HTMLElement | null;
  cabinetItems: HTMLElement | null;
  unlockedCountEl: HTMLElement | null;
  cabinetSearch: HTMLInputElement | null;
  cabinetSearchSuggestions: HTMLElement | null;
  ingredientTypesContainer: HTMLElement | null;
  ingredientStatesContainer: HTMLElement | null;
  cookingToolbar: HTMLElement | null;
  sidebarTabButtons: NodeListOf<HTMLElement>;
  cabinetPanel: HTMLElement | null;
  skillsPanel: HTMLElement | null;
  skillsList: HTMLElement | null;
  journalPanel: HTMLElement | null;
  discoveryLogList: HTMLElement | null;
  discoveryLogCountEl: HTMLElement | null;
  achievementsPanel: HTMLElement | null;
  achievementsList: HTMLElement | null;
  achievementsCountEl: HTMLElement | null;
  achievementsProgressEl: HTMLElement | null;
  recipeBookModal: HTMLDialogElement | null;
  helpModal: HTMLDialogElement | null;
  keyboardShortcutsModal: HTMLDialogElement | null;
  keyboardShortcutsList: HTMLElement | null;
  settingsModal: HTMLDialogElement | null;
  discoveryDialog: HTMLDialogElement | null;
  discoverySparkles: HTMLElement | null;
  discoveryKicker: HTMLElement | null;
  discoveryTitle: HTMLElement | null;
  discoveryItemContainer: HTMLElement | null;
  ingredientGraphContainer: HTMLElement | null;
  progressMapView: HTMLElement | null;
  btnRecipeBook: HTMLButtonElement | null;
  btnHelp: HTMLButtonElement | null;
  btnSettings: HTMLButtonElement | null;
  btnSound: HTMLButtonElement | null;
  btnUndoWorkspace: HTMLButtonElement | null;
  btnProgressGraph: HTMLButtonElement | null;
  btnClearWorkspace: HTMLButtonElement | null;
  saveFileInput: HTMLInputElement | null;
  btnDiscoveryOk: HTMLButtonElement | null;
  discoveredRecipesList: HTMLElement | null;
  settingSound: HTMLInputElement | null;
  settingVolume: HTMLInputElement | null;
  settingAmbience: HTMLInputElement | null;
  settingReducedMotion: HTMLInputElement | null;
  settingsExport: HTMLButtonElement | null;
  settingsImport: HTMLButtonElement | null;
  settingsReset: HTMLButtonElement | null;

  mechanicDiscoveryDialog: HTMLDialogElement | null;
  mechanicSparkles: HTMLElement | null;
  mechanicKicker: HTMLElement | null;
  mechanicTitle: HTMLElement | null;
  mechanicEmoji: HTMLElement | null;
  mechanicName: HTMLElement | null;
  mechanicDescription: HTMLElement | null;
  btnMechanicOk: HTMLButtonElement | null;
}

export interface DataLayer {
  STARTER_ELEMENTS: IngredientItem[];
  UNLOCKABLE_ELEMENTS: IngredientItem[];
  DISCOVERABLE_ITEMS: DiscoverableMap;
  PROGRESSION_TIERS: Record<string, TechniqueTier>;
  INGREDIENT_MILESTONES: IngredientMilestone[];
  PLAYER_ACTIONS: Record<string, PlayerAction>;
  PROGRESSION_CONFIG: ProgressionConfig;
  PRIMITIVE_INGREDIENT_IDS: Set<string>;
  transitionIndex: TransitionIndex | null;
  Progression: ProgressionApi;
  combinationEngine: import("../engine/combination_engine").CombinationEngine;
  getIngredientOrigin: (id: string) => string;
  ACHIEVEMENTS: import("../../../content/types").AchievementDefinition[];
  ACHIEVEMENT_RULES: Record<string, import("../../../content/types").AchievementRule>;
}

export interface GameActions {
  applyActionToCanvas?: () => boolean | null;
  combineElements?: (el1: HTMLElement, el2: HTMLElement) => boolean;
  applyToolToElement?: (el: HTMLElement, skillIdOverride?: string | null) => boolean;
}

export interface GameContext {
  state: GameState;
  dom: GameDom;
  data: DataLayer;
  actions: GameActions;
}

export interface DiscoveryActionContext {
  trackId: string;
  expAwarded?: number;
}
