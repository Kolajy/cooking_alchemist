/**
 * Ensures every starter and discoverable ingredient has food-science properties.
 * Run via `npm test`.
 */

import "../data/index";
import { INGREDIENT_PROPERTIES } from "../data/ingredients/properties";

function validateIngredientProperties(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const registryIds = new Set<string>([
    ...globalThis.STARTER_ELEMENTS.map(item => item.id),
    ...globalThis.UNLOCKABLE_ELEMENTS.map(item => item.id),
    ...Object.keys(globalThis.DISCOVERABLE_ITEMS)
  ]);

  registryIds.forEach(id => {
    const item = globalThis.DISCOVERABLE_ITEMS[id]
      ?? globalThis.STARTER_ELEMENTS.find(entry => entry.id === id)
      ?? globalThis.UNLOCKABLE_ELEMENTS.find(entry => entry.id === id);
    if (!item?.properties) {
      errors.push(`Ingredient "${id}" is missing properties.`);
    }
  });

  Object.keys(INGREDIENT_PROPERTIES).forEach(id => {
    if (!registryIds.has(id)) {
      errors.push(`Property map has orphan key "${id}" with no matching ingredient.`);
    }
  });

  return { ok: errors.length === 0, errors };
}

const result = validateIngredientProperties();

if (!result.ok) {
  console.error("=== INGREDIENT PROPERTIES VALIDATION FAILED ===");
  result.errors.forEach(msg => console.error(`❌ ${msg}`));
  process.exit(1);
}

console.log("=== INGREDIENT PROPERTIES VALIDATION PASSED ===");
console.log(`Properties: ${Object.keys(INGREDIENT_PROPERTIES).length} definitions · ${globalThis.STARTER_ELEMENTS.length} starters · ${Object.keys(globalThis.DISCOVERABLE_ITEMS).length} discoverable`);
