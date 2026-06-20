import type { IngredientItem, TechniqueRecipe } from "../../types";

/** Shared separate recipe shape for primal ingredient discovery chains. */
export function createPrimalSeparation(
  input: string,
  outputs: string[],
  description?: string,
  tip?: string
): TechniqueRecipe {
  return {
    input,
    tools: ["separate", "peel", "tear"],
    outputs,
    onePerAction: true,
    description,
    tip
  };
}

export function buildSeparationGroup(
  recipe: TechniqueRecipe,
  items: Array<Omit<IngredientItem, "recipes"> & Partial<IngredientItem>>
): Record<string, IngredientItem> {
  const group: Record<string, IngredientItem> = {};
  items.forEach((item, index) => {
    group[item.id] = {
      type: "ingredient",
      recipes: index === 0 ? [recipe] : [],
      ...item,
      origin: "raw"
    };
  });
  return group;
}
