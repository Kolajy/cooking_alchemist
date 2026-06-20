import { buildSeparationGroup, createPrimalSeparation } from "../_separationRecipe";

const recipe = createPrimalSeparation(
  "tubers",
  ["potato", "sweet_potato", "roots"],
  "You dug up one starchy tuber or wild root from the mound.",
  "Tuber piles look alike underground — separate them to sort each variety."
);

export default buildSeparationGroup(recipe, [
  {
    id: "potato",
    name: "Potato",
    emoji: "🥔",
    category: "Forage",
    description: "Neutral, fluffy starch that loves heat and fat.",
    blurb: "Potatoes from the Andes transformed European agriculture — a single plant that could feed whole villages through winter."
  },
  {
    id: "sweet_potato",
    name: "Sweet Potato",
    emoji: "🍠",
    category: "Forage",
    description: "Orange flesh with caramel sweetness when roasted.",
    blurb: "Despite the name, sweet potatoes are only distantly related to potatoes — Polynesian voyagers carried them across the Pacific."
  }
]);
