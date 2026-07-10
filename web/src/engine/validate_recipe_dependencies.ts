/**
 * Recipe dependency validation — reachability, reference integrity, orphan detection.
 * Run via `npm test` or `tsx src/engine/validate_recipe_dependencies.ts`.
 */

import "../data/index";
import starters from "../data/ingredients/starters";
import unlockables from "../data/ingredients/unlockables";
import { buildTransitionIndex } from "../data/transitions/index";
import type {
  CombineRecipe,
  DiscoverableMap,
  TechniqueRecipe,
  TransitionIndex
} from "../types";

export type DependencySeverity = "error" | "warning";

export interface DependencyIssue {
  severity: DependencySeverity;
  code: string;
  message: string;
  itemId?: string;
}

export interface DependencyValidationOptions {
  discoverable: DiscoverableMap;
  primitiveIds?: Set<string>;
  /** Extra ids treated as already obtainable when checking craft paths (e.g. base-game pantry). */
  craftableSeeds?: Set<string>;
  includeWarnings?: boolean;
}

export interface DependencyValidationResult {
  ok: boolean;
  errors: DependencyIssue[];
  warnings: DependencyIssue[];
  stats: {
    primitives: number;
    discoverable: number;
    craftable: number;
    unreachable: number;
    finalizedRecipes: number;
    unreachableRecipes: number;
    unusedIntermediates: number;
  };
}

function issue(
  severity: DependencySeverity,
  code: string,
  message: string,
  itemId?: string
): DependencyIssue {
  return itemId ? { severity, code, message, itemId } : { severity, code, message };
}

function isTechniqueRecipe(recipe: unknown): recipe is TechniqueRecipe {
  return Boolean(recipe && typeof recipe === "object" && "input" in recipe);
}

function isCombineRecipe(recipe: unknown): recipe is CombineRecipe {
  return Boolean(
    recipe
    && typeof recipe === "object"
    && "inputs" in recipe
    && Array.isArray((recipe as CombineRecipe).inputs)
  );
}

function collectRegistryIds(
  discoverable: DiscoverableMap,
  primitiveIds: Set<string>
): Set<string> {
  return new Set([...primitiveIds, ...Object.keys(discoverable)]);
}

function validateDuplicateIds(
  discoverable: DiscoverableMap,
  primitiveIds: Set<string>
): DependencyIssue[] {
  const errors: DependencyIssue[] = [];
  const seen = new Map<string, string>();

  [...starters, ...unlockables].forEach(item => {
    if (discoverable[item.id]) {
      errors.push(issue(
        "error",
        "DUPLICATE_ID",
        `Primitive "${item.id}" is also defined in DISCOVERABLE_ITEMS.`,
        item.id
      ));
    }
    seen.set(item.id, "primitive");
  });

  Object.keys(discoverable).forEach(id => {
    if (seen.has(id)) {
      errors.push(issue(
        "error",
        "DUPLICATE_ID",
        `Duplicate ingredient id "${id}" in content registries.`,
        id
      ));
    }
    seen.set(id, "discoverable");
  });

  void primitiveIds;
  return errors;
}

function validateRecipeReferences(
  discoverable: DiscoverableMap,
  registryIds: Set<string>
): DependencyIssue[] {
  const errors: DependencyIssue[] = [];

  const checkRef = (id: string, context: string) => {
    if (!registryIds.has(id)) {
      errors.push(issue(
        "error",
        "UNKNOWN_REFERENCE",
        `${context} references unknown ingredient "${id}".`,
        id
      ));
    }
  };

  Object.entries(discoverable).forEach(([hostId, item]) => {
    const recipes = Array.isArray(item.recipes) ? item.recipes : [];

    recipes.forEach((recipe, recipeIndex) => {
      if (isTechniqueRecipe(recipe)) {
        if (!recipe.input) {
          errors.push(issue(
            "error",
            "INVALID_TECHNIQUE_RECIPE",
            `Technique recipe #${recipeIndex} on "${hostId}" is missing input.`,
            hostId
          ));
        } else {
          checkRef(recipe.input, `Technique recipe #${recipeIndex} on "${hostId}"`);
        }

        const tools = Array.isArray(recipe.tools) ? recipe.tools : recipe.tool ? [recipe.tool] : [];
        if (tools.length === 0) {
          errors.push(issue(
            "error",
            "MISSING_TECHNIQUE_TOOLS",
            `Technique recipe #${recipeIndex} on "${hostId}" has no tools.`,
            hostId
          ));
        }

        const outputs = Array.isArray(recipe.outputs) && recipe.outputs.length > 0
          ? recipe.outputs
          : [hostId];
        outputs.forEach(outputId => {
          checkRef(outputId, `Technique output from "${hostId}"`);
        });
      }

      if (isCombineRecipe(recipe)) {
        if (recipe.inputs.length < 2) {
          errors.push(issue(
            "error",
            "INVALID_COMBINE_RECIPE",
            `Combine recipe #${recipeIndex} on "${hostId}" needs at least two inputs.`,
            hostId
          ));
        }
        recipe.inputs.forEach(inputId => {
          checkRef(inputId, `Combine recipe #${recipeIndex} on "${hostId}"`);
        });
        checkRef(hostId, `Combine output host "${hostId}"`);
      }
    });
  });

  return errors;
}

function validateSeparationInputs(
  discoverable: DiscoverableMap,
  primitiveIds: Set<string>
): DependencyIssue[] {
  const errors: DependencyIssue[] = [];

  Object.entries(discoverable).forEach(([hostId, item]) => {
    const recipes = Array.isArray(item.recipes) ? item.recipes : [];
    recipes.forEach((recipe, recipeIndex) => {
      if (!isTechniqueRecipe(recipe) || !recipe.onePerAction) return;
      if (!primitiveIds.has(recipe.input)) {
        errors.push(issue(
          "error",
          "INVALID_SEPARATION_INPUT",
          `Separation recipe #${recipeIndex} on "${hostId}" must start from a primitive ingredient, not "${recipe.input}".`,
          hostId
        ));
      }
    });
  });

  return errors;
}

function computeCraftableIds(
  index: TransitionIndex,
  primitiveIds: Set<string>
): Set<string> {
  const craftable = new Set(primitiveIds);
  let changed = true;
  let guard = 0;

  while (changed && guard < 5000) {
    changed = false;
    guard += 1;

    index.techniqueTransitions.forEach(transition => {
      if (!craftable.has(transition.input)) return;
      transition.outputs.forEach(outputId => {
        if (!craftable.has(outputId)) {
          craftable.add(outputId);
          changed = true;
        }
      });
    });

    index.combineTransitions.forEach(transition => {
      if (!transition.inputs.every(inputId => craftable.has(inputId))) return;
      transition.outputs.forEach(outputId => {
        if (!craftable.has(outputId)) {
          craftable.add(outputId);
          changed = true;
        }
      });
    });
  }

  return craftable;
}

function collectConsumedIds(index: TransitionIndex): Set<string> {
  const consumed = new Set<string>();

  index.techniqueTransitions.forEach(transition => {
    consumed.add(transition.input);
  });

  index.combineTransitions.forEach(transition => {
    transition.inputs.forEach(inputId => consumed.add(inputId));
  });

  return consumed;
}

function validateReachability(
  discoverable: DiscoverableMap,
  index: TransitionIndex,
  craftable: Set<string>
): { errors: DependencyIssue[]; warnings: DependencyIssue[] } {
  const errors: DependencyIssue[] = [];
  const warnings: DependencyIssue[] = [];

  Object.entries(discoverable).forEach(([id, item]) => {
    if (craftable.has(id)) return;

    if (item.type === "recipe") {
      errors.push(issue(
        "error",
        "UNREACHABLE_RECIPE",
        `Finalized recipe "${id}" cannot be crafted from starter primitives.`,
        id
      ));
      return;
    }

    warnings.push(issue(
      "warning",
      "UNREACHABLE_ITEM",
      `Discoverable item "${id}" has no craft path from starter primitives.`,
      id
    ));
  });

  return { errors, warnings };
}

function validateUnusedIntermediates(
  discoverable: DiscoverableMap,
  craftable: Set<string>,
  consumed: Set<string>
): DependencyIssue[] {
  const warnings: DependencyIssue[] = [];

  Object.entries(discoverable).forEach(([id, item]) => {
    if (!craftable.has(id)) return;
    if (item.type === "recipe") return;
    if (consumed.has(id)) return;

    const hasOwnRecipes = Array.isArray(item.recipes) && item.recipes.length > 0;
    if (!hasOwnRecipes) return;

    warnings.push(issue(
      "warning",
      "UNUSED_INTERMEDIATE",
      `"${id}" is craftable but never used as input to another transition.`,
      id
    ));
  });

  return warnings;
}

function validateOrphanDiscoverableItems(
  discoverable: DiscoverableMap,
  index: TransitionIndex
): DependencyIssue[] {
  const errors: DependencyIssue[] = [];
  const produced = new Set<string>();

  index.techniqueTransitions.forEach(transition => {
    transition.outputs.forEach(outputId => produced.add(outputId));
  });
  index.combineTransitions.forEach(transition => {
    transition.outputs.forEach(outputId => produced.add(outputId));
  });

  Object.entries(discoverable).forEach(([id, item]) => {
    const hasOwnRecipes = Array.isArray(item.recipes) && item.recipes.length > 0;
    if (!hasOwnRecipes && !produced.has(id)) {
      errors.push(issue(
        "error",
        "ORPHAN_ITEM",
        `"${id}" has no recipes and is not produced by any transition.`,
        id
      ));
    }
  });

  return errors;
}

export function validateRecipeDependencies(
  options: DependencyValidationOptions
): DependencyValidationResult {
  const { discoverable } = options;
  const primitiveIds = options.primitiveIds ?? new Set([
    ...starters.map(item => item.id),
    ...unlockables.map(item => item.id)
  ]);
  const includeWarnings = options.includeWarnings !== false;
  const registryIds = collectRegistryIds(
    discoverable,
    new Set([...primitiveIds, ...(options.craftableSeeds ?? [])])
  );
  const index = buildTransitionIndex(discoverable);

  const errors = [
    ...validateDuplicateIds(discoverable, primitiveIds),
    ...validateRecipeReferences(discoverable, registryIds),
    ...validateSeparationInputs(discoverable, primitiveIds),
    ...validateOrphanDiscoverableItems(discoverable, index)
  ];

  const craftable = computeCraftableIds(
    index,
    new Set([...primitiveIds, ...(options.craftableSeeds ?? [])])
  );
  const reachability = validateReachability(discoverable, index, craftable);
  errors.push(...reachability.errors);

  const warnings = includeWarnings
    ? [
        ...reachability.warnings,
        ...validateUnusedIntermediates(discoverable, craftable, collectConsumedIds(index))
      ]
    : [];

  const discoverableValues = Object.values(discoverable);
  const discoverableKeys = Object.keys(discoverable);

  let finalizedRecipesCount = 0;
  let unreachableRecipes = 0;
  for (const item of discoverableValues) {
    if (item.type === "recipe") {
      finalizedRecipesCount++;
      if (!craftable.has(item.id)) {
        unreachableRecipes++;
      }
    }
  }

  let unreachableCount = 0;
  for (const id of discoverableKeys) {
    if (!craftable.has(id)) unreachableCount++;
  }

  let unusedIntermediates = 0;
  for (const w of warnings) {
    if (w.code === "UNUSED_INTERMEDIATE") unusedIntermediates++;
  }

  let craftableCount = 0;
  for (const id of craftable) {
    if (discoverable[id] || primitiveIds.has(id)) craftableCount++;
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: {
      primitives: primitiveIds.size,
      discoverable: discoverableKeys.length,
      craftable: craftableCount,
      unreachable: unreachableCount,
      finalizedRecipes: finalizedRecipesCount,
      unreachableRecipes,
      unusedIntermediates
    }
  };
}

function printReport(result: DependencyValidationResult): void {
  if (!result.ok) {
    console.error("=== RECIPE DEPENDENCY VALIDATION FAILED ===");
    result.errors.forEach(entry => console.error(`❌ [${entry.code}] ${entry.message}`));
  } else {
    console.log("=== RECIPE DEPENDENCY VALIDATION PASSED ===");
  }

  if (result.warnings.length > 0) {
    console.warn(`⚠️  ${result.warnings.length} dependency warning(s):`);
    result.warnings.forEach(entry => console.warn(`   [${entry.code}] ${entry.message}`));
  }

  const { stats } = result;
  console.log(
    `Craftable: ${stats.craftable}/${stats.discoverable} discoverable `
    + `(${stats.primitives} primitives) · `
    + `Recipes: ${stats.finalizedRecipes} (${stats.unreachableRecipes} unreachable)`
  );
  if (stats.unusedIntermediates > 0) {
    console.log(`Unused intermediates: ${stats.unusedIntermediates}`);
  }
}

const isMain = typeof process !== "undefined"
  && Boolean(process.argv[1]?.includes("validate_recipe_dependencies"));

if (isMain) {
  const result = validateRecipeDependencies({
    discoverable: globalThis.DISCOVERABLE_ITEMS
  });

  printReport(result);
  if (!result.ok) process.exit(1);
}
