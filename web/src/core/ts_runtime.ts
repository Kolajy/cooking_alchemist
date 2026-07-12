import { CombinationEngine } from "../engine/combination_engine";
import { ProgressionEngine } from "../engine/progression_engine";
import type { ProgressionState } from "../types";
import type {
  ActionResult,
  MatchResult,
  SharedGameRuntime
} from "./types";

/**
 * TypeScript implementation of SharedGameRuntime — uses the same JSON-fed globals
 * as native clients. Logic mirrors `culinary-core::GameRuntime`.
 */
export class TypeScriptRuntime implements SharedGameRuntime {
  private progression: ProgressionEngine;
  private combination: CombinationEngine;
  private discovered: Set<string>;

  constructor(initialSave?: ProgressionState) {
    this.progression = new ProgressionEngine(
      globalThis.PROGRESSION_CONFIG,
      initialSave || null
    );
    this.combination = new CombinationEngine(
      globalThis.DISCOVERABLE_ITEMS,
      globalThis.TRANSITION_INDEX
    );
    this.discovered = new Set(globalThis.STARTER_ELEMENTS.map(i => i.id));
  }

  matchCombine(idA: string, idB: string): MatchResult {
    const r = this.combination.matchCombinationRecipe([idA, idB]);
    return {
      success: r.success,
      resultId: r.recipe?.result.id ?? null,
      resultIds: r.recipe?.result.id ? [r.recipe.result.id] : [],
      lockedSkillId: null
    };
  }

  applyCombine(idA: string, idB: string): ActionResult {
    const match = this.combination.matchCombinationRecipe([idA, idB]);
    if (!match.success || !match.recipe?.result.id) {
      return {
        success: false,
        outputIds: [],
        newDiscoveryIds: [],
        xpAwards: [],
        newlyUnlockedSkills: [],
        lockedSkillId: null,
        message: "Those ingredients do not combine."
      };
    }
    const resultId = match.recipe.result.id;
    const isNew = !this.discovered.has(resultId);
    const xpAwards: Array<[string, number]> = [["combine", 1]];
    let newlyUnlocked = this.progression.addXP("combine", 1).newlyUnlockedSkills.map(s => s.id);
    if (isNew) {
      const sep = this.progression.addXP("separate", 1);
      newlyUnlocked = [...newlyUnlocked, ...sep.newlyUnlockedSkills.map(s => s.id)];
      xpAwards.push(["separate", 1]);
      this.discovered.add(resultId);
    }
    return {
      success: true,
      outputIds: [resultId],
      newDiscoveryIds: isNew ? [resultId] : [],
      xpAwards,
      newlyUnlockedSkills: newlyUnlocked,
      lockedSkillId: null,
      message: ""
    };
  }

  applyTechnique(inputId: string, toolId: string): ActionResult {
    const match = this.combination.matchToolRecipe(inputId, toolId, this.progression, {
      discoveredIds: this.discovered
    });
    if (!match.success) {
      return {
        success: false,
        outputIds: [],
        newDiscoveryIds: [],
        xpAwards: [],
        newlyUnlockedSkills: [],
        lockedSkillId: match.lockedSkillId,
        message: match.lockedSkillId
          ? `${match.lockedSkillId} is locked`
          : `${toolId} does not work on ${inputId}`
      };
    }
    const results = match.recipe?.results?.length
      ? match.recipe.results
      : match.recipe?.result
        ? [match.recipe.result]
        : [];
    const outputIds = results.map(r => r.id);
    const newIds = outputIds.filter(id => !this.discovered.has(id));
    const xpAwards: Array<[string, number]> = [];
    let newlyUnlocked: string[] = [];
    if (toolId !== "combine" && toolId !== "separate") {
      newlyUnlocked = this.progression.addXP(toolId, 1).newlyUnlockedSkills.map(s => s.id);
      xpAwards.push([toolId, 1]);
    }
    if (newIds.length > 0) {
      const sep = this.progression.addXP("separate", 1);
      newlyUnlocked = [...newlyUnlocked, ...sep.newlyUnlockedSkills.map(s => s.id)];
      xpAwards.push(["separate", 1]);
      newIds.forEach(id => this.discovered.add(id));
    }
    return {
      success: true,
      outputIds,
      newDiscoveryIds: newIds,
      xpAwards,
      newlyUnlockedSkills: newlyUnlocked,
      lockedSkillId: null,
      message: ""
    };
  }

  isPlayerActionUnlocked(actionId: string): boolean {
    const cfg = globalThis.PLAYER_ACTIONS[actionId];
    if (!cfg?.unlockCriteria?.discoveredRecipes) return true;
    let count = 0;
    for (const id of this.discovered) {
      const item = globalThis.DISCOVERABLE_ITEMS[id];
      if (item?.type === "recipe") count++;
    }
    return count >= cfg.unlockCriteria.discoveredRecipes;
  }

  discoveredRecipeCount(): number {
    let count = 0;
    for (const id of this.discovered) {
      if (globalThis.DISCOVERABLE_ITEMS[id]?.type === "recipe") count++;
    }
    return count;
  }

  statsText(): string {
    const total = Object.keys(globalThis.DISCOVERABLE_ITEMS).length;
    let count = 0;
    for (const id of this.discovered) {
      if (globalThis.DISCOVERABLE_ITEMS[id]) count++;
    }
    return `${count} / ${total} discovered`;
  }

  playableItemIds(): string[] {
    const ids = globalThis.STARTER_ELEMENTS.map(i => i.id);
    for (const id of this.discovered) {
      if (globalThis.DISCOVERABLE_ITEMS[id] && !ids.includes(id)) ids.push(id);
    }
    return ids.sort();
  }

  exportSave(): string {
    return JSON.stringify({
      version: 1,
      game: "culinary-alchemy",
      exportedAt: Date.now(),
      discovery: {
        discovered: [...this.discovered],
        recent: [],
        highlights: [],
        discoveryLog: []
      },
      progression: this.progression.getState(),
      settings: { soundEnabled: true }
    });
  }

  importSave(json: string): void {
    const save = JSON.parse(json) as {
      discovery: { discovered: string[] };
      progression: ProgressionState;
    };
    this.discovered = new Set(save.discovery.discovered);
    globalThis.STARTER_ELEMENTS.forEach(s => this.discovered.add(s.id));
    this.progression = new ProgressionEngine(globalThis.PROGRESSION_CONFIG, save.progression);
  }

  resetToStarters(): void {
    this.discovered = new Set(globalThis.STARTER_ELEMENTS.map(i => i.id));
    this.progression = new ProgressionEngine(globalThis.PROGRESSION_CONFIG, null);
  }
}

let sharedRuntime: TypeScriptRuntime | null = null;

export function getSharedRuntime(): TypeScriptRuntime {
  if (!sharedRuntime) {
    sharedRuntime = new TypeScriptRuntime();
  }
  return sharedRuntime;
}

export function setSharedRuntime(runtime: TypeScriptRuntime): void {
  sharedRuntime = runtime;
}
