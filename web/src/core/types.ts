/**
 * Shared data-layer types — mirror `culinary-core` / `docs/DATA_LAYER.md`.
 */

export type {
  DiscoveryLogEntry,
  DiscoverySaveData,
  ProgressionState,
  GameSaveFile,
  ExportedGameBundle,
  AchievementDefinition,
  AchievementRule,
  AchievementsSaveData
} from "../../../content/types";

export interface ActionResult {
  success: boolean;
  outputIds: string[];
  newDiscoveryIds: string[];
  xpAwards: Array<[string, number]>;
  newlyUnlockedSkills: string[];
  lockedSkillId: string | null;
  message: string;
}

export interface MatchResult {
  success: boolean;
  resultId: string | null;
  resultIds: string[];
  lockedSkillId: string | null;
}

/** Platform-agnostic runtime API implemented by Rust (native/WASM) or TS adapter. */
export interface SharedGameRuntime {
  matchCombine(idA: string, idB: string): MatchResult;
  applyCombine(idA: string, idB: string): ActionResult;
  applyTechnique(inputId: string, toolId: string): ActionResult;
  isPlayerActionUnlocked(actionId: string): boolean;
  discoveredRecipeCount(): number;
  statsText(): string;
  playableItemIds(): string[];
  exportSave(): string;
  importSave(json: string): void;
  resetToStarters(): void;
}

export interface RawTransition {
  id: string;
  kind: "technique" | "combine";
  tools: string[];
  input?: string;
  inputs: string[];
  outputs: string[];
  onePerAction: boolean;
  resultItemId: string;
}
