import { buildSeparationGroup, createPrimalSeparation } from "../_separationRecipe";

const recipe = createPrimalSeparation(
  "shoots",
  ["asparagus", "bamboo_shoot", "pea_shoot", "alfalfa_sprout", "watercress", "scallions"],
  "You clipped a single tender shoot from the bundle.",
  "Young shoots look alike at a glance — separate them gently one by one."
);

export default buildSeparationGroup(recipe, [
  {
    id: "asparagus",
    name: "Asparagus",
    emoji: "🌿",
    category: "Forage",
    description: "Spears with grassy sweetness and delicate snap.",
    blurb: "Asparagus beds take three years to mature but can produce for decades — Roman emperors had special fleets fetch fresh spears."
  },
  {
    id: "bamboo_shoot",
    name: "Bamboo Shoot",
    emoji: "🎋",
    category: "Forage",
    description: "Crisp, mild shoot harvested before the cane hardens.",
    blurb: "Bamboo grows so fast you can almost hear it — shoots must be boiled to remove bitterness before stir-frying."
  },
  {
    id: "scallions",
    name: "Scallions",
    emoji: "🌿",
    category: "Forage",
    description: "Mild, hollow green shoots with a white bulb.",
    blurb: "Also known as green onions, scallions are harvested young before the bulb fully swells, providing a crisp texture and a sweet, peppery bite."
  },
  {
    id: "pea_shoot",
    name: "Pea Shoot",
    emoji: "🌱",
    category: "Forage",
    description: "Curly tendrils with fresh pea flavor.",
    blurb: "Chefs prize pea shoots in spring — the same plant gives peas later, but the tips are sweetest while still climbing."
  },
  {
    id: "alfalfa_sprout",
    name: "Alfalfa Sprout",
    emoji: "🌱",
    category: "Forage",
    description: "Mild, crunchy sprout packed with green flavor.",
    blurb: "Sprouted seeds multiply vitamins and enzymes — alfalfa sprouts became a health-food icon on 1970s sandwiches."
  },
  {
    id: "watercress",
    name: "Watercress",
    emoji: "💧",
    category: "Forage",
    description: "Peppery aquatic green with bright bite.",
    blurb: "Watercress grows in clean running water — Victorian London sold it street-side as a cheap, vitamin-rich working-class green."
  }
]);
