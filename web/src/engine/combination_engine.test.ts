import { CombinationEngine } from "./combination_engine";
import type { ProgressionEngine } from "./progression_engine";
import type { DiscoverableMap, TransitionIndex, RecipeDefinition, MatchRecipeResult, IngredientItem } from "../types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Mock DiscoverableMap
const mockDiscoverableItems = {
  "apple": { id: "apple", name: "Apple", type: "ingredient", emoji: "🍎" } as unknown as IngredientItem,
  "chopped_apple": { id: "chopped_apple", name: "Chopped Apple", type: "ingredient", emoji: "🍎", xpCategory: "chop", xpAwarded: 1 } as unknown as IngredientItem,
  "apple_pie": { id: "apple_pie", name: "Apple Pie", type: "recipe", emoji: "🥧", description: "A delicious pie." } as unknown as IngredientItem,
} as DiscoverableMap;

// Mock TransitionIndex
const mockTransitionIndex = {
  byTechnique: {
    "chop": {
      "apple": {
        resultItemId: "chopped_apple",
        recipe: { input: "apple", tools: ["chop"], outputs: ["chopped_apple"] }
      }
    },
    "locked_tool": {
      "apple": {
        resultItemId: "chopped_apple",
        recipe: { input: "apple", tools: ["locked_tool"], outputs: ["chopped_apple"] }
      }
    }
  },
  getTechniqueTransition: (toolId: string, inputId: string) => {
    // @ts-ignore
    return mockTransitionIndex.byTechnique[toolId]?.[inputId] || null;
  },
  getCombineTransition: (inputIds: string[]) => {
    if (inputIds.includes("chopped_apple") && inputIds.includes("dough")) {
      return {
        resultItemId: "apple_pie",
        recipe: { inputs: ["chopped_apple", "dough"] }
      };
    }
    return null;
  }
} as unknown as TransitionIndex;

// Mock ProgressionEngine
const mockProgressionEngine = {
  isActionMode: (activeSkillId: string) => activeSkillId === "action_mode" || activeSkillId === "locked_action",
  isUnlocked: (toolId: string) => toolId === "chop",
  getToolCategory: (toolId: string) => "cutting",
  tiers: {
    "chop": { name: "Chop", category: "cutting" },
    "locked_tool": { name: "Locked Tool", category: "cutting" },
    "some_skill": { name: "Some Skill", category: "cutting" }
  },
  config: {
    playerActions: {
      "action_mode": {
        name: "Action Mode",
        mode: "chop",
        categories: []
      },
      "locked_action": {
        name: "Locked Action",
        mode: "locked_tool",
        categories: [],
        unlockCriteria: { discoveredRecipes: 999 } // So it registers as locked
      }
    },
    techniqueCategories: {}
  }
} as unknown as ProgressionEngine;

console.log("Mocks initialized.");

// --- Internal Helper Method Tests ---

console.log("=== Testing Internal Helpers ===");
const engine = new CombinationEngine(mockDiscoverableItems, mockTransitionIndex);

// _getToolsForRecipe
assert(engine._getToolsForRecipe({ input: "a", tools: ["chop", "slice"], outputs: [] }).includes("chop"), "_getToolsForRecipe arrays");
assert(engine._getToolsForRecipe({ input: "a", tool: "chop", outputs: [] }).includes("chop"), "_getToolsForRecipe single tool");
assert(engine._getToolsForRecipe({ input: "a", outputs: [] }).length === 0, "_getToolsForRecipe no tools");

// _findTechniqueTransition
const transition = engine._findTechniqueTransition("apple", ["chop"]);
assert(transition !== null, "_findTechniqueTransition should find chop for apple");
assert(transition?.resultItemId === "chopped_apple", "_findTechniqueTransition result id should be chopped_apple");

const nullTransition = engine._findTechniqueTransition("apple", ["unknown_tool"]);
assert(nullTransition === null, "_findTechniqueTransition should return null for unknown tool");

// _findLockedTechniqueHint
const lockedHint = engine._findLockedTechniqueHint("apple", { category: "cutting" }, mockProgressionEngine);
assert(lockedHint !== null, "_findLockedTechniqueHint should find a locked hint");
assert(lockedHint?.lockedSkillId === "locked_tool", "_findLockedTechniqueHint locked skill id is locked_tool");
assert(lockedHint?.requiredSkillName === "Locked Tool", "_findLockedTechniqueHint requires Locked Tool");

console.log("Internal helpers passed.");

// --- Match Method Tests ---

console.log("=== Testing Match Methods ===");

// matchToolRecipe
// Happy path: Unlocked tool
const unlockedResult = engine.matchToolRecipe("apple", "chop", mockProgressionEngine);
assert(unlockedResult.success === true, "matchToolRecipe should succeed for unlocked tool");
assert(unlockedResult.recipe?.tool === "chop", "matchToolRecipe result should have the correct tool");
assert(unlockedResult.recipe?.result?.id === "chopped_apple", "matchToolRecipe result should map to chopped_apple");
assert(unlockedResult.recipe?.xpAwarded === 1, "matchToolRecipe should copy item properties to recipe");

// Action mode path: unlocked via action mode config
const actionResult = engine.matchToolRecipe("apple", "action_mode", mockProgressionEngine);
assert(actionResult.success === true, "matchToolRecipe should succeed via action_mode");
assert(actionResult.recipe?.tool === "chop", "matchToolRecipe via action_mode should map to 'chop' tool");

// Locked action path
const lockedResult = engine.matchToolRecipe("apple", "locked_action", mockProgressionEngine);
assert(lockedResult.success === false, "matchToolRecipe should fail for locked tool");
assert(lockedResult.lockedSkillId === "locked_tool", "matchToolRecipe should return the locked skill id");

// Category hint path (regular mode, active skill missing transition but category has locked hint)
// We already tested _findLockedTechniqueHint, but here we invoke it via matchToolRecipe when allowedTools only has 'some_skill'
const hintResult = engine.matchToolRecipe("apple", "some_skill", mockProgressionEngine);
assert(hintResult.success === false, "matchToolRecipe should fail for some_skill");
assert(hintResult.lockedSkillId === "locked_tool", "matchToolRecipe should fall back to hint and return locked_tool");

// No allowed tools / totally unknown
const unknownResult = engine.matchToolRecipe("unknown_input", "unknown_skill", mockProgressionEngine);
assert(unknownResult.success === false, "matchToolRecipe should fail for completely unknown inputs/skills");


// matchCombinationRecipe
// Happy path
const combineResult = engine.matchCombinationRecipe(["chopped_apple", "dough"]);
assert(combineResult.success === true, "matchCombinationRecipe should succeed for valid combination");
assert(combineResult.recipe?.result?.id === "apple_pie", "matchCombinationRecipe should result in apple_pie");
assert(combineResult.recipe?.description === "A delicious pie.", "matchCombinationRecipe should include mapped description");

// Failure path
const failedCombine = engine.matchCombinationRecipe(["chopped_apple", "stone"]);
assert(failedCombine.success === false, "matchCombinationRecipe should fail for invalid combination");

console.log("Match methods passed.");
console.log("=== COMBINATION ENGINE TESTS COMPLETED SUCCESSFULLY ===");
