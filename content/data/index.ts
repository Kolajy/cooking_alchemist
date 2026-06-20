/**
 * Ingredient & recipe data loader.
 * Aggregates categorized files and exposes the legacy window.* API used by the game.
 */

import starters from "./ingredients/starters";
import unlockables from "./ingredients/unlockables";
import discoverableRecipes from "./recipes/index";
import { INGREDIENT_PROPERTIES } from "./ingredients/properties";
import { buildTransitionIndex } from "./transitions/index";
import { ACHIEVEMENTS } from "./achievements";
import { ACHIEVEMENT_RULES } from "./achievement_rules";
import type { DiscoverableMap, IngredientItem } from "../types";

function attachIngredientProperties(item: IngredientItem): IngredientItem {
  const properties = item.properties ?? INGREDIENT_PROPERTIES[item.id];
  const itemWithProps = properties ? { ...item, properties } : item;
  return { pack: itemWithProps.pack || "base", ...itemWithProps };
}

const starterItems = starters.map(attachIngredientProperties);
const unlockableItems = (unlockables as IngredientItem[]).map(attachIngredientProperties);

function normalizeRecipeMap(
  recipes: DiscoverableMap | IngredientItem[]
): DiscoverableMap {
  const map = Array.isArray(recipes)
    ? Object.fromEntries(recipes.map(item => [item.id, item]))
    : { ...recipes };

  return Object.fromEntries(
    Object.entries(map).map(([id, item]) => [id, attachIngredientProperties({ ...item, id })])
  );
}

export function applyIngredientData(target: typeof globalThis): void {
  const discoverable = normalizeRecipeMap(discoverableRecipes);

  target.STARTER_ELEMENTS = starterItems;
  target.UNLOCKABLE_ELEMENTS = unlockableItems;
  target.DISCOVERABLE_ITEMS = discoverable;
  target.TRANSITION_INDEX = buildTransitionIndex(discoverable);
  target.PRIMITIVE_INGREDIENT_IDS = new Set(
    [...starterItems, ...unlockableItems].map(item => item.id)
  );
  target.getIngredientOrigin = function getIngredientOrigin(id: string): string {
    if (target.PRIMITIVE_INGREDIENT_IDS.has(id)) return "primitive";
    const item = target.DISCOVERABLE_ITEMS[id];
    if (item?.origin) return item.origin;
    if (item) return "raw";
    return "processed";
  };

  target.ACHIEVEMENTS = ACHIEVEMENTS;
  target.ACHIEVEMENT_RULES = ACHIEVEMENT_RULES;
}

applyIngredientData(globalThis);
