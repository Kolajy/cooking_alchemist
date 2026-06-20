# Active Plan: Expand Thermal Skill Category and Add New Recipes

We will expand the Transform (Thermal) category to include pit cooking, hearth baking, and smoking to better reflect natural historical kitchen discoveries, and add new recipes to leverage these techniques.

## 1. Proposed Changes

### [MODIFY] [progression_config.ts](file:///Users/kolajy/pg/cooking/content/progression_config.ts)
- Already modified to include `pit_cook` (Earth & Dirt Oven), `hearth_bake` (Hearth & Clay Oven), and `smoke` (Smoke & Cure) along the technique progression.

### [MODIFY] [properties.ts](file:///Users/kolajy/pg/cooking/content/data/ingredients/properties.ts)
- Add ingredient properties for:
  - `pit_roasted_sweet_potato`
  - `smoked_fish`
  - `flour`
  - `dough`
  - `hearth_flatbread`
  - `earth_baked_shellfish`

### [NEW] [thermal_new.ts](file:///Users/kolajy/pg/cooking/content/data/recipes/techniques/thermal_new.ts)
- Add recipes using the new thermal and prep methods:
  - Sweet Potato + Pit Cook -> Pit-Roasted Sweet Potato
  - Cleaned Fish + Smoke -> Smoked Fish
  - Shellfish + Pit Cook -> Earth-Baked Shellfish
  - Wheat + Grind/Pound/Smash -> Flour
  - Flour + Water (Combine) -> Dough
  - Dough + Hearth Bake -> Hearth Flatbread

### [MODIFY] [index.ts](file:///Users/kolajy/pg/cooking/content/data/recipes/index.ts)
- Import and register the new recipes.

## 2. Verification Plan

### Automated Tests
- Run `npm test` to verify that all configurations, recipe dependencies, and engines parse successfully.
- Run `npm run export-native` to bundle the updated assets.
