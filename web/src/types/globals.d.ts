import type {
  CombinationEngine,
  DiscoverableMap,
  IngredientItem,
  IngredientMilestone,
  PlayerAction,
  ProgressionApi,
  ProgressionConfig,
  TechniqueCategory,
  TechniqueTier,
  TransitionIndex
} from "./index";

declare global {
  interface Window {
    __culinaryGameStarted?: boolean;
    PROGRESSION_CONFIG: ProgressionConfig;
    PROGRESSION_TECHNIQUE_CATEGORIES: Record<string, TechniqueCategory>;
    PROGRESSION_TIERS: Record<string, TechniqueTier>;
    PLAYER_ACTIONS: Record<string, PlayerAction>;
    INGREDIENT_MILESTONES: IngredientMilestone[];
    Progression: ProgressionApi;
    ProgressionEngine: typeof import("../engine/progression_engine").ProgressionEngine;
    CombinationEngine: typeof import("../engine/combination_engine").CombinationEngine;
    STARTER_ELEMENTS: IngredientItem[];
    UNLOCKABLE_ELEMENTS: IngredientItem[];
    DISCOVERABLE_ITEMS: DiscoverableMap;
    PRIMITIVE_INGREDIENT_IDS: Set<string>;
    TRANSITION_INDEX: TransitionIndex;
    getIngredientOrigin: (id: string) => string;
    IngredientGraph?: {
      render: (container: HTMLElement, options?: Record<string, unknown>) => void;
    };
  }

  // eslint-disable-next-line no-var
  var PROGRESSION_CONFIG: ProgressionConfig;
  // eslint-disable-next-line no-var
  var PROGRESSION_TECHNIQUE_CATEGORIES: Record<string, TechniqueCategory>;
  // eslint-disable-next-line no-var
  var PROGRESSION_TIERS: Record<string, TechniqueTier>;
  // eslint-disable-next-line no-var
  var PLAYER_ACTIONS: Record<string, PlayerAction>;
  // eslint-disable-next-line no-var
  var INGREDIENT_MILESTONES: IngredientMilestone[];
  // eslint-disable-next-line no-var
  var Progression: ProgressionApi;
  // eslint-disable-next-line no-var
  var ProgressionEngine: typeof import("../engine/progression_engine").ProgressionEngine;
  // eslint-disable-next-line no-var
  var CombinationEngine: typeof import("../engine/combination_engine").CombinationEngine;
  // eslint-disable-next-line no-var
  var STARTER_ELEMENTS: IngredientItem[];
  // eslint-disable-next-line no-var
  var UNLOCKABLE_ELEMENTS: IngredientItem[];
  // eslint-disable-next-line no-var
  var DISCOVERABLE_ITEMS: DiscoverableMap;
  // eslint-disable-next-line no-var
  var PRIMITIVE_INGREDIENT_IDS: Set<string>;
  // eslint-disable-next-line no-var
  var TRANSITION_INDEX: TransitionIndex;
  // eslint-disable-next-line no-var
  var getIngredientOrigin: (id: string) => string;
}

export {};
