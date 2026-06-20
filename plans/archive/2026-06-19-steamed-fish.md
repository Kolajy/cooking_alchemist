# Plan: Add Steamed Fish Recipe & Ingredients (Archived)

We integrated Cantonese Steamed Fish along with its complete agricultural and preparation transitions into the Culinary Alchemy content base.

## 1. Proposed Changes

### [MODIFY] [starters.ts](file:///Users/kolajy/pg/cooking/content/data/ingredients/starters.ts)
- Add `whole_fish` (🐟) to Proteins category.
- Add `soy_sauce` (🍶) to Pantry category.

### [MODIFY] [properties.ts](file:///Users/kolajy/pg/cooking/content/data/ingredients/properties.ts)
- Add properties registry entries for all new and intermediate ingredients.

### [NEW] [fish.ts](file:///Users/kolajy/pg/cooking/content/data/recipes/proteins/fish.ts)
- Add fish cleaning, prepared combine, steaming, and seasoning transitions.

### [NEW] [oil.ts](file:///Users/kolajy/pg/cooking/content/data/recipes/pantry/oil.ts)
- Add press oil and heat oil transitions.

### [NEW] [ginger_recipes.ts](file:///Users/kolajy/pg/cooking/content/data/recipes/forage/ginger_recipes.ts)
- Add ginger peeling and julienning transitions.

### [NEW] [scallions_recipes.ts](file:///Users/kolajy/pg/cooking/content/data/recipes/forage/scallions_recipes.ts)
- Add scallions julienning transitions.

### [MODIFY] [index.ts](file:///Users/kolajy/pg/cooking/content/data/recipes/index.ts)
- Import and register the new recipe collections.

## 2. Verification Plan

### Automated Tests
- Run `npm test` and `npm run export-native` to verify.
