import { buildSeparationGroup, createPrimalSeparation } from "../_separationRecipe";

const recipe = createPrimalSeparation(
  "garden_produce",
  ["cabbage", "tomato", "onion", "eggplant", "chili", "citrus", "basil"],
  "You gathered one ripe item from the wild patch.",
  "Wild flora patches hold various herbs and crops — separate them to sort cabbage, tomato, onion, eggplant, chili, citrus, and basil."
);

export default buildSeparationGroup(recipe, [
  {
    id: "cabbage",
    name: "Cabbage",
    emoji: "🥬",
    category: "Produce",
    description: "Fresh leafy cabbage.",
    blurb: "Leafy brassica cabbage, rich in moisture and crunch."
  },
  {
    id: "tomato",
    name: "Tomato",
    emoji: "🍅",
    category: "Produce",
    description: "Ripe red tomato.",
    blurb: "Juicy, acidic red nightshade fruit."
  },
  {
    id: "onion",
    name: "Onion",
    emoji: "🧅",
    category: "Produce",
    description: "Pungent layered onion bulb.",
    blurb: "Pungent allium onion bulb, rich in sweet sugars when cooked."
  },
  {
    id: "eggplant",
    name: "Eggplant",
    emoji: "🍆",
    category: "Produce",
    description: "Spongy purple eggplant.",
    blurb: "Fleshy purple nightshade vegetable, excellent at absorbing cooking fats."
  },
  {
    id: "chili",
    name: "Chili",
    emoji: "🌶️",
    category: "Produce",
    description: "Spicy chili pepper.",
    blurb: "Hot capsaicin pods that transformed global cuisines after spreading from the Americas."
  },
  {
    id: "citrus",
    name: "Citrus",
    emoji: "🍋",
    category: "Produce",
    description: "Sour citrus fruit.",
    blurb: "Bright, acidic citrus fruits containing essential vitamin C."
  },
  {
    id: "basil",
    name: "Basil",
    emoji: "🌿",
    category: "Produce",
    description: "Fragrant sweet basil herbs.",
    blurb: "Fragrant sweet herb prized in Italian and Southeast Asian cuisines."
  }
]);
