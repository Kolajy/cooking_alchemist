import { buildSeparationGroup, createPrimalSeparation } from "../_separationRecipe";

const recipe = createPrimalSeparation(
  "water",
  ["spring_water", "mineral_water", "rainwater", "seawater"],
  "You drew off a distinct kind of water from the wild source.",
  "Water looks uniform until you separate it — spring, mineral, rain, and sea each behave differently in the pot."
);

export default buildSeparationGroup(recipe, [
  {
    id: "spring_water",
    name: "Spring Water",
    emoji: "⛲",
    category: "Liquids",
    description: "Naturally filtered water rising cool from underground.",
    blurb: "Springs were sacred sites in many cultures — clean, mineral-rich water bubbling up without a river in sight."
  },
  {
    id: "mineral_water",
    name: "Mineral Water",
    emoji: "🫧",
    category: "Liquids",
    description: "Water carrying dissolved salts and trace minerals.",
    blurb: "European spa towns built fortunes on mineral springs; the dissolved limestone and salts were thought to cure ailments."
  },
  {
    id: "rainwater",
    name: "Rainwater",
    emoji: "🌧️",
    category: "Liquids",
    description: "Soft, slightly acidic water collected from the sky.",
    blurb: "Before wells and pipes, cisterns caught rainwater for brewing and baking — bakers prized its softness for tender crumb."
  },
  {
    id: "seawater",
    name: "Seawater",
    emoji: "🌊",
    category: "Liquids",
    description: "Salty ocean water — briny and dense.",
    blurb: "Roman fish sauce factories boiled seawater into garum; today chefs still use a pinch of sea water to season shellfish."
  }
]);
