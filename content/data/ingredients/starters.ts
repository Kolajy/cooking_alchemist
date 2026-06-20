import type { IngredientItem } from "../../types";

/** Primal ingredients available at game start — broad foraging & gathering categories. */
const starters: IngredientItem[] = [
  { id: "water", name: "Water", emoji: "💧", type: "ingredient", origin: "primitive", category: "Liquids", description: "Fresh water for drinking, boiling, and mixing." },
  { id: "berries", name: "Berries", emoji: "🫐", type: "ingredient", origin: "primitive", category: "Produce", description: "Small sweet or tart berries gathered in clusters." },
  { id: "tubers", name: "Tubers", emoji: "🥔", type: "ingredient", origin: "primitive", category: "Forage", description: "Starchy tubers — dense energy stored underground." },
  { id: "shellfish", name: "Shellfish", emoji: "🦪", type: "ingredient", origin: "primitive", category: "Proteins", description: "Mollusks and crustaceans harvested from shore or shallows." }
];

export default starters;
