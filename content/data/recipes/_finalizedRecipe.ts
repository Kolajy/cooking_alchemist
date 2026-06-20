import type { IngredientItem, TechniqueRecipe } from "../../types";

/** Shared shape for finalized dishes (type: "recipe"). */
export function buildFinalizedRecipe(
  item: IngredientItem,
  recipes: TechniqueRecipe[] | import("../../types").CombineRecipe[] = []
): IngredientItem {
  return {
    type: "recipe",
    origin: "processed",
    recipes,
    ...item
  };
}

export function buildFinalizedRecipeItem(
  item: IngredientItem,
  recipes: import("../../types").CombineRecipe[] = []
): Record<string, IngredientItem> {
  return {
    [item.id]: buildFinalizedRecipe(item, recipes)
  };
}
