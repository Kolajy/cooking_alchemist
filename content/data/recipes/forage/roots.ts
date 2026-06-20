import { buildSeparationGroup, createPrimalSeparation } from "../_separationRecipe";

const recipe = createPrimalSeparation(
  "roots",
  ["carrot", "ginger", "beet", "radish", "turnip"],
  "You unearthed a single edible root from the tangle below.",
  "Root patches hide many species — separate them carefully one at a time."
);

export default buildSeparationGroup(recipe, [
  {
    id: "carrot",
    name: "Carrot",
    emoji: "🥕",
    category: "Forage",
    description: "Sweet, crunchy orange taproot.",
    blurb: "Carrots were purple and yellow long before Dutch growers popularized the orange varieties we know today."
  },
  {
    id: "ginger",
    name: "Ginger",
    emoji: "🫚",
    category: "Forage",
    description: "Knobby rhizome with sharp, warming heat.",
    blurb: "Ginger traveled from Southeast Asia along trade routes and became essential in medicines, candies, and curries worldwide."
  },
  {
    id: "beet",
    name: "Beet",
    emoji: "🟣",
    category: "Forage",
    description: "Earthy, jewel-toned root with dense sweetness.",
    blurb: "Beet sugar once rivaled cane sugar in Europe; the same root that sweetens also stains borscht a vivid crimson."
  },
  {
    id: "radish",
    name: "Radish",
    emoji: "🔴",
    category: "Forage",
    description: "Crisp, peppery root that bites back.",
    blurb: "Ancient Egyptians fed radishes to workers building the pyramids — cheap, fast-growing fuel for massive labor crews."
  },
  {
    id: "turnip",
    name: "Turnip",
    emoji: "🟡",
    category: "Forage",
    description: "Sturdy pale root with mild cabbage notes.",
    blurb: "Turnips kept European villages fed through winter centuries before potatoes arrived from the Americas."
  }
]);
