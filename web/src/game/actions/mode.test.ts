import { createContext } from "../context";
import { isTechniqueCategory, getActiveToolId } from "./mode";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

// mock DOM for context
globalThis.document = {
  getElementById: () => null,
  querySelectorAll: () => []
} as any;

const ctx = createContext();

// Mock progression tiers for getSkillCategories()
ctx.data.PROGRESSION_TIERS = {
  "heat": { category: "heat", name: "Heat" },
  "cold": { category: "cold", name: "Cold" },
  "cut": { category: "cut", name: "Cut" },
  "mix": { category: "mix", name: "Mix" },
  "water": { category: "water", name: "Water" }
} as any;

// Test isTechniqueCategory
assert(isTechniqueCategory("heat") === true, "heat should be a technique category");
assert(isTechniqueCategory("cold") === true, "cold should be a technique category");
assert(isTechniqueCategory("cut") === true, "cut should be a technique category");
assert(isTechniqueCategory("mix") === true, "mix should be a technique category");
assert(isTechniqueCategory("water") === true, "water should be a technique category");
assert(isTechniqueCategory("not_a_technique") === false, "not_a_technique should not be a technique category");

// Test getActiveToolId
ctx.state.activeAction = "move";
assert(getActiveToolId() === "select", "move action should return select tool");

ctx.state.activeAction = "combine";
assert(getActiveToolId() === "combine", "combine action should return combine tool");

ctx.state.activeAction = "separate";
assert(getActiveToolId() === "separate", "separate action should return separate tool");

ctx.state.activeAction = "other";
ctx.state.activeSkillId = "some_skill";
assert(getActiveToolId() === "some_skill", "other action with active skill should return the skill id");

ctx.state.activeAction = "other";
ctx.state.activeSkillId = null;
assert(getActiveToolId() === "select", "other action with no active skill should return select tool");

console.log("=== MODE TESTS PASSED ===");
