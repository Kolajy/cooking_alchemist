import type { IngredientItem } from "../../types";

/** Primal ingredients unlocked via progression milestones. */
const unlockables: IngredientItem[] = [
  { id: "fruits", name: "Fruits", emoji: "🍎", type: "ingredient", origin: "primitive", category: "Produce", description: "Tree and vine fruits picked ripe from the wild or grove." },
  { id: "roots", name: "Roots", emoji: "🫚", type: "ingredient", origin: "primitive", category: "Forage", description: "Edible roots and rhizomes dug from the soil." },
  { id: "nuts", name: "Nuts", emoji: "🥜", type: "ingredient", origin: "primitive", category: "Forage", description: "Hard-shelled nuts and kernels rich in fat and protein." },
  { id: "whole_fish", name: "Whole Fish", emoji: "🐟", type: "ingredient", origin: "primitive", category: "Proteins", description: "Freshly caught whole scale fish." },
  { id: "mushrooms", name: "Mushrooms", emoji: "🍄", type: "ingredient", origin: "primitive", category: "Forage", description: "Wild fungi foraged from forest floor and decaying wood." },
  { id: "seeds", name: "Seeds", emoji: "🌻", type: "ingredient", origin: "primitive", category: "Pantry", description: "Dried seeds and grains — compact stores of starch and oil." },
  { id: "grasses", name: "Grasses", emoji: "🌾", type: "ingredient", origin: "primitive", category: "Forage", description: "Edible grasses and cereal stalks — fibrous greens and grains." },
  { id: "shoots", name: "Shoots", emoji: "🌱", type: "ingredient", origin: "primitive", category: "Forage", description: "Tender young shoots and sprouts — soft, fast-growing greens." },
  { id: "livestock", name: "Livestock", emoji: "🐄", type: "ingredient", origin: "primitive", category: "Proteins", description: "Domestic farm animals kept for meat and milk." },
  { id: "garden_produce", name: "Wild Flora", emoji: "🥬", type: "ingredient", origin: "primitive", category: "Produce", description: "Wild leafy greens, nightshades, herbs, and tart crops." },
  { id: "wild_hives", name: "Wild Hives", emoji: "🐝", type: "ingredient", origin: "primitive", category: "Forage", description: "Nests of wild honeybees." }
];

export default unlockables;
