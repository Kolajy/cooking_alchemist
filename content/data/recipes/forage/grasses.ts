import { buildSeparationGroup, createPrimalSeparation } from "../_separationRecipe";

const recipe = createPrimalSeparation(
  "grasses",
  ["wheat", "barley", "oats", "rice", "rye", "corn"],
  "You threshed out a single grain from the wild grasses.",
  "A handful of grasses holds many cereals — separate them stalk by stalk."
);

export default buildSeparationGroup(recipe, [
  {
    id: "wheat",
    name: "Wheat",
    emoji: "🌾",
    category: "Forage",
    description: "Golden grain that forms the backbone of bread.",
    blurb: "Wheat agriculture began in the Fertile Crescent around 10,000 years ago and reshaped human settlement into cities."
  },
  {
    id: "barley",
    name: "Barley",
    emoji: "🌾",
    category: "Forage",
    description: "Chewy grain with malty depth — beer's oldest base.",
    blurb: "Ancient Sumerian brewers fermented barley bread into beer; monks and farmers alike relied on barley soups through harsh winters."
  },
  {
    id: "oats",
    name: "Oats",
    emoji: "🥣",
    category: "Forage",
    description: "Mild, creamy grain prized for porridge.",
    blurb: "Oats were once considered weed grain in wheat fields until Scottish highlanders turned them into a staple porridge culture."
  },
  {
    id: "rice",
    name: "Rice",
    emoji: "🍚",
    category: "Forage",
    description: "Starchy kernel that feeds billions across humid climates.",
    blurb: "Terraced rice paddies sculpt Asian landscapes — flooded fields suppress weeds while the grain sustains more than half the world."
  },
  {
    id: "rye",
    name: "Rye",
    emoji: "🌾",
    category: "Forage",
    description: "Hardy dark grain with tangy, robust flavor.",
    blurb: "Rye thrives where wheat struggles — Nordic rye breads and Russian black bread survived winters that killed other crops."
  },
  {
    id: "corn",
    name: "Corn",
    emoji: "🌽",
    category: "Produce",
    description: "Sweet golden maize ears.",
    blurb: "Native to Mesoamerica, corn was domesticated from wild teosinte grass and became the foundation of modern agriculture."
  }
]);
