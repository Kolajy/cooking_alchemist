# Active Plan: Add Stone Age Dishes and Resolve Unused Intermediates

We will add new Stone Age dishes to the game, utilizing early cooking methods (open coals, pit ovens, pot boiling, grinding) and using previously unused intermediate ingredients (`almond`, `button_mushroom`, `sunflower_seed`, `shrimp`).

## 1. Proposed Changes

### [MODIFY] [properties.ts](file:///Users/kolajy/pg/cooking/content/data/ingredients/properties.ts)
- Add ingredient properties for:
  - `ash_cake`
  - `almond_paste`
  - `roasted_sunflower_seeds`
  - `pit_cooked_shrimp`
  - `raw_stew_pot`
  - `stone_boiled_stew`

### [MODIFY] [thermal_new.ts](file:///Users/kolajy/pg/cooking/content/data/recipes/techniques/thermal_new.ts)
- Add new recipes:
  - `dough` + `char`/`roast` -> `ash_cake`
  - `almond` + `grind`/`pound` -> `almond_paste`
  - `sunflower_seed` + `char`/`roast` -> `roasted_sunflower_seeds`
  - `shrimp` + `pit_cook`/`bake` -> `pit_cooked_shrimp`
  - Combine: `water` + `button_mushroom` + `carrot` -> `raw_stew_pot`
  - `raw_stew_pot` + `cook`/`simmer`/`boil` -> `stone_boiled_stew`

## 2. Verification Plan

### Automated Tests
- Run `npm test` to verify that all configurations, recipe dependencies, and engines parse successfully.
- Run `npm run export-native` to bundle the updated assets.
