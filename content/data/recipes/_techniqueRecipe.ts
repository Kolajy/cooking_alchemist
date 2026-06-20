import type { CombineRecipe, IngredientItem, TechniqueRecipe } from "../../types";

/** Shared technique transition shape (tool + input → outputs). */
export function createTechniqueTransition(
  input: string,
  tools: string | string[],
  outputs: string | string[],
  meta: Partial<TechniqueRecipe> = {}
): TechniqueRecipe {
  const toolList = Array.isArray(tools) ? tools : [tools];
  return {
    input,
    tools: toolList,
    outputs: Array.isArray(outputs) ? outputs : [outputs],
    onePerAction: false,
    ...meta
  };
}

export function buildTechniqueItem(
  item: IngredientItem,
  recipe: TechniqueRecipe
): Record<string, IngredientItem> {
  return {
    [item.id]: {
      type: "ingredient",
      origin: "processed",
      recipes: [recipe],
      ...item
    }
  };
}

/** Combine two inputs into one discoverable output. */
export function createCombineTransition(
  inputs: string[],
  meta: Partial<CombineRecipe> = {}
): CombineRecipe {
  return {
    inputs: [...inputs],
    ...meta
  };
}

export function buildCombineItem(
  item: IngredientItem,
  recipe: CombineRecipe
): Record<string, IngredientItem> {
  return {
    [item.id]: {
      recipes: [recipe],
      ...item
    }
  };
}
