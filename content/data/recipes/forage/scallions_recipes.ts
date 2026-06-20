import { buildTechniqueItem, createTechniqueTransition } from "../_techniqueRecipe";

const juliennedScallions = buildTechniqueItem(
  {
    id: "julienned_scallions",
    name: "Julienned Scallions",
    emoji: "🌿",
    category: "Forage",
    description: "Green onions shredded into fine matchstick curls.",
    blurb: "Slicing scallions thin along their length opens up their hollow tubes, creating delicate curls that cook instantly under hot oil."
  },
  createTechniqueTransition("scallions", ["slice", "dice", "julienne"], "julienned_scallions", {
    description: "You shredded the green onion shoots into fine julienne curls.",
    tip: "Use knife skills on fresh scallions to prep them for flash cooking."
  })
);

export default {
  ...juliennedScallions
};
