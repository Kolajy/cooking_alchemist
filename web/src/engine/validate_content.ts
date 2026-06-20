/**
 * Content validation — run via `npm test`.
 * Checks progression config against transition index before shipping new recipes.
 */

import "../data/index";
import "../progression_config";
import { buildTransitionIndex } from "../data/transitions/index";
import { flattenTechniqueCategories } from "../progression_config";
import type { DiscoverableMap, ProgressionConfig } from "../types";

function collectActionIds(config: ProgressionConfig) {
  const tiers = flattenTechniqueCategories(config.techniqueCategories);
  const actionIds = new Set<string>();

  Object.values(tiers).forEach(skill => {
    (skill.actions || []).forEach(actionId => actionIds.add(actionId));
  });

  Object.values(config.playerActions || {}).forEach(action => {
    if (action.mode) actionIds.add(action.mode);
  });

  return { tiers, actionIds };
}

function validateTransitionCollisions(index: ReturnType<typeof buildTransitionIndex>) {
  const errors: string[] = [];
  const seen = new Map<string, string>();

  index.techniqueTransitions.forEach(transition => {
    transition.tools.forEach(tool => {
      const key = `${tool}::${transition.input}`;
      if (seen.has(key)) {
        errors.push(
          `Duplicate technique transition for ${tool} + ${transition.input} `
          + `(ids ${seen.get(key)} and ${transition.id})`
        );
      } else {
        seen.set(key, transition.id);
      }
    });
  });

  return errors;
}

function validateStarterActionsHaveTransitions(
  index: ReturnType<typeof buildTransitionIndex>,
  actionIds: Set<string>
) {
  const errors: string[] = [];
  const starterActions = ["separate", "combine", "smash", "char"];

  starterActions.forEach(actionId => {
    const inputs = index.getAffectableInputs(actionId);
    const hasCombine = actionId === "combine"
      ? index.combineTransitions.length > 0
      : false;

    if (actionId === "combine") {
      if (!hasCombine) {
        errors.push("Combine mode has no combination transitions defined.");
      }
      return;
    }

    if (inputs.length === 0) {
      errors.push(`Starter action "${actionId}" has no affectable ingredients in TRANSITION_INDEX.`);
    }
  });

  void actionIds;
  return errors;
}

function validateFinalizedRecipesExist(discoverable: DiscoverableMap) {
  const recipes = Object.values(discoverable).filter(item => item.type === "recipe");
  if (recipes.length === 0) {
    return ['No finalized recipes (type: "recipe") are registered.'];
  }
  return [];
}

function validateIngredientPackProperties(discoverable: DiscoverableMap) {
  const errors: string[] = [];
  const starters = (globalThis as any).STARTER_ELEMENTS || [];
  const unlockables = (globalThis as any).UNLOCKABLE_ELEMENTS || [];

  starters.forEach((item: any) => {
    if (!item.pack || typeof item.pack !== "string" || item.pack.trim() === "") {
      errors.push(`Starter ingredient "${item.id}" is missing a valid pack tag.`);
    }
  });

  unlockables.forEach((item: any) => {
    if (!item.pack || typeof item.pack !== "string" || item.pack.trim() === "") {
      errors.push(`Unlockable ingredient "${item.id}" is missing a valid pack tag.`);
    }
  });

  Object.values(discoverable).forEach((item: any) => {
    if (!item.pack || typeof item.pack !== "string" || item.pack.trim() === "") {
      errors.push(`Discoverable ingredient/recipe "${item.id}" is missing a valid pack tag.`);
    }
  });

  return errors;
}

export function validateContent(discoverableItems: DiscoverableMap, progressionConfig: ProgressionConfig) {
  const index = buildTransitionIndex(discoverableItems);
  const { actionIds } = collectActionIds(progressionConfig);
  const errors = [
    ...validateTransitionCollisions(index),
    ...validateStarterActionsHaveTransitions(index, actionIds),
    ...validateFinalizedRecipesExist(discoverableItems),
    ...validateIngredientPackProperties(discoverableItems)
  ];

  return { ok: errors.length === 0, errors, index };
}

const isMain = typeof process !== "undefined"
  && Boolean(process.argv[1]?.includes("validate_content"));

if (isMain) {
  const discoverable = globalThis.DISCOVERABLE_ITEMS;
  const config = globalThis.PROGRESSION_CONFIG;
  const { ok, errors, index } = validateContent(discoverable, config);

  if (!ok) {
    console.error("=== CONTENT VALIDATION FAILED ===");
    errors.forEach(msg => console.error(`❌ ${msg}`));
    process.exit(1);
  }

  console.log("=== CONTENT VALIDATION PASSED ===");
  console.log(`Technique transitions: ${index.techniqueTransitions.length}`);
  console.log(`Combine transitions: ${index.combineTransitions.length}`);
  console.log(`Finalized recipes: ${Object.values(discoverable).filter(i => i.type === "recipe").length}`);
}
