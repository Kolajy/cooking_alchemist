/**
 * Validates cultural packs in isolation (no collision with starter vertical slice).
 * Run: npm run test:packs
 */

import "../index";
import "../../progression_config";
import { validateContent } from "../../engine/validate_content";
import { validateRecipeDependencies } from "../../engine/validate_recipe_dependencies";
import {
  CULTURAL_PACKS,
  ALL_PACK_DISCOVERABLE,
  ALL_PACK_PRIMITIVES
} from "../../../../content/data/packs/index";
import type { ProgressionConfig } from "../../types";

function validatePackIdsUnique() {
  const errors: string[] = [];
  const seen = new Map<string, string>();

  CULTURAL_PACKS.forEach(pack => {
    Object.keys(pack.discoverable).forEach(id => {
      if (seen.has(id)) {
        errors.push(`Duplicate pack item id "${id}" in ${seen.get(id)} and ${pack.meta.id}`);
      } else {
        seen.set(id, pack.meta.id);
      }
    });

    pack.primitives.forEach(primitive => {
      if (seen.has(primitive.id)) {
        errors.push(`Duplicate primitive id "${primitive.id}" in pack ${pack.meta.id}`);
      }
      seen.set(primitive.id, pack.meta.id);
    });
  });

  return errors;
}

function validatePackStructure() {
  const errors: string[] = [];

  CULTURAL_PACKS.forEach(pack => {
    if (pack.primitives.length !== 1) {
      errors.push(`Pack ${pack.meta.id} should expose exactly one cultural primitive.`);
    }

    const finalized = Object.values(pack.discoverable).filter(item => item.type === "recipe");
    if (finalized.length < 2) {
      errors.push(`Pack ${pack.meta.id} should include at least two finalized recipes.`);
    }

    if (!pack.meta.synopsis?.trim()) {
      errors.push(`Pack ${pack.meta.id} is missing historical synopsis.`);
    }
  });

  return errors;
}

const stubConfig: ProgressionConfig = {
  techniqueCategories: {},
  techniques: {},
  playerActions: {
    separate: { name: "Separate", emoji: "🔪", mode: "separate" },
    combine: { name: "Combine", emoji: "🥣", mode: "combine" },
    force: { name: "Force", emoji: "✊", starterSkill: "smash" },
    change: { name: "Heat", emoji: "🔥", starterSkill: "char" },
    time: { name: "Time", emoji: "⏳", starterSkill: "rest" }
  },
  milestones: [],
  maxSkillExp: 99
};

const structureErrors = [
  ...validatePackIdsUnique(),
  ...validatePackStructure()
];

if (structureErrors.length > 0) {
  console.error("=== CULTURAL PACK VALIDATION FAILED ===");
  structureErrors.forEach(msg => console.error(`❌ ${msg}`));
  process.exit(1);
}

const { ok, errors, index } = validateContent(ALL_PACK_DISCOVERABLE, stubConfig);

if (!ok) {
  console.error("=== CULTURAL PACK TRANSITION VALIDATION FAILED ===");
  errors.forEach(msg => console.error(`❌ ${msg}`));
  process.exit(1);
}

const packPrimitives = new Set(ALL_PACK_PRIMITIVES.map(item => item.id));
const baseCraftableSeeds = new Set([
  ...globalThis.STARTER_ELEMENTS.map(item => item.id),
  ...globalThis.UNLOCKABLE_ELEMENTS.map(item => item.id),
  ...Object.keys(globalThis.DISCOVERABLE_ITEMS)
]);
const dependency = validateRecipeDependencies({
  discoverable: ALL_PACK_DISCOVERABLE,
  primitiveIds: packPrimitives,
  craftableSeeds: baseCraftableSeeds
});

if (!dependency.ok) {
  console.error("=== CULTURAL PACK DEPENDENCY VALIDATION FAILED ===");
  dependency.errors.forEach(entry => console.error(`❌ [${entry.code}] ${entry.message}`));
  process.exit(1);
}

console.log("=== CULTURAL PACK VALIDATION PASSED ===");
console.log(`Packs: ${CULTURAL_PACKS.length}`);
console.log(`Pack items: ${Object.keys(ALL_PACK_DISCOVERABLE).length}`);
console.log(`Technique transitions: ${index.techniqueTransitions.length}`);
console.log(`Combine transitions: ${index.combineTransitions.length}`);
console.log(`Finalized recipes: ${Object.values(ALL_PACK_DISCOVERABLE).filter(i => i.type === "recipe").length}`);
