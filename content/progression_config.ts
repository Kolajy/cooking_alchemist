/**
 * Culinary Alchemy - Progression Configurations
 * Edit this file to customize technique categories, player actions, and cabinet milestones.
 *
 * Each technique category groups a dependency chain of skills.
 * Player actions reference one or more categories to define their toolbar + skills panel.
 */

import type { ProgressionConfig, TechniqueCategory, TechniqueTier } from "./types";

const smashCategory = {
  label: "Smash",
  techniques: {
    smash: {
      name: "Smash",
      emoji: "✊",
      dependsOn: [],
      leadsTo: ["pound"],
      actions: ["smash"],
      desc: "Crush tubers, roots, or nuts with raw manual force."
    },
    pound: {
      name: "Pound",
      emoji: "🔨",
      dependsOn: ["smash"],
      leadsTo: ["grind"],
      unlockCriteria: {
        prerequisites: { smash: 3 }
      },
      actions: ["pound"],
      desc: "Pound ingredients into pastes using a mortar and pestle."
    },
    grind: {
      name: "Grind",
      emoji: "🪨",
      dependsOn: ["pound"],
      leadsTo: ["press"],
      unlockCriteria: {
        prerequisites: { pound: 3 }
      },
      actions: ["grind", "chop", "dice", "mince"],
      desc: "Grind or chop grains, seeds, and vegetables into fine textures."
    },
    press: {
      name: "Press",
      emoji: "🪵",
      dependsOn: ["grind"],
      leadsTo: ["knead"],
      unlockCriteria: {
        prerequisites: { grind: 3 }
      },
      actions: ["press"],
      desc: "Extract liquids and oils by applying continuous pressure."
    },
    knead: {
      name: "Knead",
      emoji: "👐",
      dependsOn: ["press"],
      leadsTo: ["emulsify"],
      unlockCriteria: {
        prerequisites: { press: 3 }
      },
      actions: ["knead"],
      desc: "Stagger, fold, and knead dough to develop gluten structures."
    },
    emulsify: {
      name: "Emulsify",
      emoji: "🌪️",
      dependsOn: ["knead"],
      leadsTo: [],
      unlockCriteria: {
        prerequisites: { knead: 4 }
      },
      actions: ["emulsify", "blend"],
      desc: "Emulsify oils and liquids into unified sauces and dressings."
    }
  }
};

const tearCategory = {
  label: "Tear & Cut",
  techniques: {
    tear: {
      name: "Tear",
      emoji: "🖐️",
      dependsOn: [],
      leadsTo: ["cutting"],
      unlockCriteria: {
        prerequisites: { separate: 2 }
      },
      actions: ["tear"],
      desc: "Tear leafy herbs, greens, or cooked meats by hand."
    },
    cutting: {
      name: "Cutting",
      emoji: "🔪",
      dependsOn: ["tear"],
      leadsTo: ["slicing"],
      unlockCriteria: {
        prerequisites: { tear: 2 }
      },
      actions: ["cut", "chop"],
      desc: "Cut foods cleanly using basic knife strokes."
    },
    slicing: {
      name: "Slicing",
      emoji: "🥓",
      dependsOn: ["cutting"],
      leadsTo: ["dicing"],
      unlockCriteria: {
        prerequisites: { cutting: 3 }
      },
      actions: ["slice"],
      desc: "Slice meats and vegetables into thin, even strips."
    },
    dicing: {
      name: "Dicing",
      emoji: "🎲",
      dependsOn: ["slicing"],
      leadsTo: ["julienne"],
      unlockCriteria: {
        prerequisites: { slicing: 4 }
      },
      actions: ["dice"],
      desc: "Cut ingredients into precise, small cubes."
    },
    julienne: {
      name: "Julienne",
      emoji: "🥢",
      dependsOn: ["dicing"],
      leadsTo: [],
      unlockCriteria: {
        prerequisites: { dicing: 5 }
      },
      actions: ["julienne"],
      desc: "Precision matchstick cuts and micro-garnishes."
    }
  }
};

const peelCategory = {
  label: "Peel",
  techniques: {
    peel: {
      name: "Peel",
      emoji: "🧼",
      dependsOn: [],
      leadsTo: ["core_seed"],
      unlockCriteria: {
        prerequisites: { separate: 2 }
      },
      actions: ["peel"],
      desc: "Strip tough outer layers from roots, tubers, or fruits."
    },
    core_seed: {
      name: "Core & Seed",
      emoji: "🥑",
      dependsOn: ["peel"],
      leadsTo: ["fillet_debone"],
      unlockCriteria: {
        prerequisites: { peel: 2 }
      },
      actions: ["core", "seed"],
      desc: "Remove tough cores, seeds, or pits from produce."
    },
    fillet_debone: {
      name: "Fillet & Debone",
      emoji: "👑",
      dependsOn: ["core_seed"],
      leadsTo: [],
      unlockCriteria: {
        prerequisites: { core_seed: 3 }
      },
      actions: ["fillet", "debone", "zest"],
      desc: "Cleanly separate fish meat from bones and debone red meats."
    }
  }
};

const thermalCategory = {
  label: "Thermal",
  techniques: {
    char: {
      name: "Ash & Embers",
      emoji: "🔥",
      dependsOn: [],
      leadsTo: ["pit_cook"],
      actions: ["char", "roast"],
      desc: "Cooking directly on open fire, coals, or hot ash."
    },
    pit_cook: {
      name: "Earth & Dirt Oven",
      emoji: "🛖",
      dependsOn: ["char"],
      leadsTo: ["hearth_bake"],
      unlockCriteria: {
        prerequisites: { char: 2 }
      },
      actions: ["pit_cook", "bake"],
      desc: "Slow roasting underground using heated stone pits."
    },
    hearth_bake: {
      name: "Hearth & Clay Oven",
      emoji: "🧱",
      dependsOn: ["pit_cook"],
      leadsTo: ["cook"],
      unlockCriteria: {
        prerequisites: { pit_cook: 2 }
      },
      actions: ["hearth_bake", "bake"],
      desc: "Baking bread and roasting in clay tandoors or stone hearths."
    },
    cook: {
      name: "Controlled Heat",
      emoji: "🍳",
      dependsOn: ["hearth_bake"],
      leadsTo: ["smoke"],
      unlockCriteria: {
        prerequisites: { hearth_bake: 3 }
      },
      actions: ["cook", "fry", "boil", "simmer", "steam"],
      desc: "Stovetop cooking: boiling, simmering, steaming, and pan-frying."
    },
    smoke: {
      name: "Smoke & Cure",
      emoji: "💨",
      dependsOn: ["cook"],
      leadsTo: ["precision"],
      unlockCriteria: {
        prerequisites: { cook: 3 }
      },
      actions: ["smoke"],
      desc: "Exposing ingredients to aromatic hardwood smoke for flavor."
    },
    precision: {
      name: "Modern Precision",
      emoji: "🌡️",
      dependsOn: ["smoke"],
      leadsTo: [],
      unlockCriteria: {
        prerequisites: { smoke: 4 }
      },
      actions: ["precision", "sous_vide", "reduce"],
      desc: "Oven baking, temperature-controlled sous-vide, and precise reductions."
    }
  }
};

const structureCategory = {
  label: "Structure & Mix",
  techniques: {
    hand_mix: {
      name: "Hand Mix & Stir",
      emoji: "🥄",
      dependsOn: [],
      leadsTo: ["whisk_churn"],
      unlockCriteria: {
        prerequisites: { combine: 2 }
      },
      actions: ["hand_mix", "stir"],
      desc: "Stirring, blending, and combining ingredients by hand."
    },
    whisk_churn: {
      name: "Whisk & Churn",
      emoji: "🥣",
      dependsOn: ["hand_mix"],
      leadsTo: ["gel_foam"],
      unlockCriteria: {
        prerequisites: { hand_mix: 2 }
      },
      actions: ["whisk", "churn"],
      desc: "Incorporate air or butter fat clump formation."
    },
    gel_foam: {
      name: "Gel & Foam",
      emoji: "🫧",
      dependsOn: ["whisk_churn"],
      leadsTo: [],
      unlockCriteria: {
        prerequisites: { whisk_churn: 3 }
      },
      actions: ["gel", "foam"],
      desc: "Chemical gelification and culinary foam stabilization."
    }
  }
};

const timeCategory = {
  label: "Time & Age",
  techniques: {
    rest: {
      name: "Rest & Steep",
      emoji: "⏳",
      dependsOn: [],
      leadsTo: ["ferment"],
      actions: ["rest", "steep"],
      desc: "Let dough relax, tea steep, or marinades settle."
    },
    ferment: {
      name: "Ferment & Culture",
      emoji: "🦠",
      dependsOn: ["rest"],
      leadsTo: ["age"],
      unlockCriteria: {
        prerequisites: { rest: 2 }
      },
      actions: ["ferment", "culture"],
      desc: "Cultivate yeast or bacteria to ferment doughs, brews, or batters."
    },
    age: {
      name: "Age & Cure",
      emoji: "🏺",
      dependsOn: ["ferment"],
      leadsTo: [],
      unlockCriteria: {
        prerequisites: { ferment: 3 }
      },
      actions: ["age", "cure"],
      desc: "Cure or age ingredients over longer time spans."
    }
  }
};

const TECHNIQUE_CATEGORIES = {
  smash: smashCategory,
  tear: tearCategory,
  peel: peelCategory,
  thermal: thermalCategory,
  structure: structureCategory,
  time: timeCategory
};

export function flattenTechniqueCategories(
  categories: Record<string, TechniqueCategory>
): Record<string, TechniqueTier & { category: string }> {
  const techniques: Record<string, TechniqueTier & { category: string }> = {};

  Object.entries(categories).forEach(([categoryId, category]) => {
    Object.entries(category.techniques).forEach(([skillId, skill]) => {
      techniques[skillId] = { ...skill, category: categoryId };
    });
  });

  return techniques;
}

const baseConfig = {
  techniqueCategories: TECHNIQUE_CATEGORIES,

  // Player-facing action groups shown in the bottom toolbar.
  // `categories` lists every technique category this action owns.
  playerActions: {
    separate: {
      name: "Separate",
      emoji: "🔪",
      mode: "separate",
      categories: ["peel", "tear"],
      desc: "Split, peel, and pull ingredients apart."
    },
    force: {
      name: "Force",
      emoji: "✊",
      categories: ["smash"],
      starterSkill: "smash",
      unlockCriteria: { requiredIngredients: ["smashed_berries"] },
      desc: "Crush, grind, and break ingredients down."
    },
    combine: {
      name: "Combine",
      emoji: "🥣",
      mode: "combine",
      categories: ["structure"],
      unlockCriteria: { discoveredRecipes: 10 },
      desc: "Merge ingredients together and mix them into unified blends."
    },
    change: {
      name: "Heat",
      emoji: "🔥",
      categories: ["thermal"],
      starterSkill: "char",
      unlockCriteria: { discoveredRecipes: 25 },
      desc: "Heat, cook, and transform ingredients."
    },
    time: {
      name: "Time",
      emoji: "⏳",
      categories: ["time"],
      starterSkill: "rest",
      unlockCriteria: { discoveredRecipes: 60 },
      desc: "Steep, rest, ferment, or age ingredients."
    }
  },

  milestones: [
    {
      recipesCount: 2,
      unlocks: ["roots", "seeds", "mushrooms"],
      label: "Undergrowth Tracker",
      desc: "You've discovered edible roots, wild seeds, and forest mushrooms."
    },
    {
      recipesCount: 6,
      unlocks: ["fruits", "whole_fish", "shoots"],
      label: "Riverfront Explorer",
      desc: "You've found wild fruits, learned to catch fish, and harvest tender shoots."
    },
    {
      recipesCount: 12,
      unlocks: ["nuts", "grasses"],
      label: "Grove Harvester",
      desc: "You've unlocked wild nuts and tall grasses."
    },
    {
      recipesCount: 20,
      unlocks: ["livestock", "garden_produce", "wild_hives"],
      label: "Master Husbandman",
      desc: "You can now tend livestock, cultivate wild flora, and raid wild bee hives."
    }
  ],

  /** Cap for per-skill / per-mode experience tracks. */
  maxSkillExp: 99
};

export const PROGRESSION_CONFIG: ProgressionConfig = {
  ...baseConfig,
  techniques: flattenTechniqueCategories(baseConfig.techniqueCategories)
};

globalThis.PROGRESSION_CONFIG = PROGRESSION_CONFIG;
