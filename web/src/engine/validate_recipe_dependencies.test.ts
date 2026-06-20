import { validateRecipeDependencies } from "./validate_recipe_dependencies";
import type { DiscoverableMap } from "../types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const baseDiscoverable: DiscoverableMap = {
  mashed_potato: {
    id: "mashed_potato",
    name: "Mashed Potato",
    emoji: "🥣",
    type: "ingredient",
    origin: "processed",
    recipes: [{
      input: "potato",
      tools: ["smash"],
      outputs: ["mashed_potato"]
    }]
  },
  hearth_mash: {
    id: "hearth_mash",
    name: "Hearth Mash",
    emoji: "🔥",
    type: "recipe",
    recipes: [{
      inputs: ["mashed_potato", "charred_apple"]
    }]
  }
};

const missingRef = validateRecipeDependencies({
  discoverable: {
    bad_combine: {
      id: "bad_combine",
      name: "Bad",
      emoji: "❌",
      recipes: [{ inputs: ["potato", "ghost_item"] }]
    }
  },
  primitiveIds: new Set(["potato"])
});

assert(!missingRef.ok, "Unknown references should fail");
assert(
  missingRef.errors.some(error => error.code === "UNKNOWN_REFERENCE"),
  "Should report UNKNOWN_REFERENCE"
);

const unreachableRecipe = validateRecipeDependencies({
  discoverable: {
    locked_dish: {
      id: "locked_dish",
      name: "Locked",
      emoji: "🔒",
      type: "recipe",
      recipes: [{ inputs: ["mashed_potato", "unicorn_dust"] }]
    },
    mashed_potato: baseDiscoverable.mashed_potato
  },
  primitiveIds: new Set(["potato", "tubers"])
});

assert(!unreachableRecipe.ok, "Unreachable finalized recipe should fail");
assert(
  unreachableRecipe.errors.some(error => error.code === "UNREACHABLE_RECIPE"),
  "Should report UNREACHABLE_RECIPE"
);

const validChain = validateRecipeDependencies({
  discoverable: {
    ...baseDiscoverable,
    charred_apple: {
      id: "charred_apple",
      name: "Charred Apple",
      emoji: "🍎",
      type: "ingredient",
      origin: "processed",
      recipes: [{ input: "apple", tools: ["char"], outputs: ["charred_apple"] }]
    }
  },
  primitiveIds: new Set(["potato", "apple"])
});

assert(validChain.ok, "Valid dependency chain should pass");
assert(validChain.stats.unreachableRecipes === 0, "Hearth mash should be reachable");

console.log("=== RECIPE DEPENDENCY UNIT TESTS PASSED ===");
