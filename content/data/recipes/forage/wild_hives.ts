import { buildSeparationGroup, createPrimalSeparation } from "../_separationRecipe";

const recipe = createPrimalSeparation(
  "wild_hives",
  ["honey"],
  "You carefully extracted sweet honey from the nest.",
  "Wild hives hold liquid honey — separate them carefully to avoid bee stings."
);

export default buildSeparationGroup(recipe, [
  {
    id: "honey",
    name: "Honey",
    emoji: "🍯",
    category: "Produce",
    description: "Sweet, sticky wild honey.",
    blurb: "Pure concentrated sugar nectar harvested by wild bees."
  }
]);
