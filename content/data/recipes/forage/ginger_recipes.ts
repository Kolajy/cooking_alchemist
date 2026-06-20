import { buildTechniqueItem, createTechniqueTransition } from "../_techniqueRecipe";

const peeledGinger = buildTechniqueItem(
  {
    id: "peeled_ginger",
    name: "Peeled Ginger",
    emoji: "🫚",
    category: "Forage",
    description: "Ginger root stripped of its paper-thin skin.",
    blurb: "Peeling ginger removes the woody, slightly bitter skin, exposing the clean, vibrant yellow flesh underneath."
  },
  createTechniqueTransition("ginger", "peel", "peeled_ginger", {
    description: "You scraped away the thin outer skin of the ginger.",
    tip: "Use the peel technique to prep fibrous roots before cutting."
  })
);

const juliennedGinger = buildTechniqueItem(
  {
    id: "julienned_ginger",
    name: "Julienned Ginger",
    emoji: "🥢",
    category: "Forage",
    description: "Ginger sliced into fine, aromatic matchsticks.",
    blurb: "Cutting ginger into fine matchsticks allows its spicy juice to cook out quickly and mingle with delicate ingredients."
  },
  createTechniqueTransition("peeled_ginger", ["slice", "dice", "julienne"], "julienned_ginger", {
    description: "You cut the peeled ginger into paper-thin matchstick julienne.",
    tip: "Julienne aromatics to release their flavorful oils rapidly."
  })
);

export default {
  ...peeledGinger,
  ...juliennedGinger
};
