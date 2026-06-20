# Plan: Swapped Starters & Custom Cabinet Unlocks

We swapped **Roots** and **Tubers** in the progression chain and introduced dynamic unlocks for cabinet elements based on sorting results:
1. **Roots Swapped to Starter**: `roots` is now available immediately in the cabinet at start, and `tubers` is a progress-unlocked element.
2. **Dynamic Cabinet Unlocks**:
   - Separating `berries` (discovering any of: strawberry, raspberry, blueberry, blackberry, or smashed_berries) automatically unlocks **Fruits** in the cabinet.
   - Separating `roots` (discovering any of: carrot, ginger, beet, radish, or turnip) automatically unlocks **Tubers** in the cabinet.
3. **Milestones Adjusted**: Shifted milestones down to compensate for these custom unlocks (Milestone 1 now unlocks `seeds` and `mushrooms` at 3 discoveries, Milestone 2 unlocks `whole_fish` and `shoots` at 8 discoveries, etc.).

## Proposed Changes

### Ingredient Configuration

#### [MODIFY] [starters.ts](file:///Users/kolajy/pg/cooking/content/data/ingredients/starters.ts)
Replaced `tubers` with `roots` in the starting inventory.

#### [MODIFY] [unlockables.ts](file:///Users/kolajy/pg/cooking/content/data/ingredients/unlockables.ts)
Replaced `roots` with `tubers` in the locked milestone inventory.

#### [MODIFY] [progression_config.ts](file:///Users/kolajy/pg/cooking/content/progression_config.ts)
Modified the milestones list to align unlocks with the new discovery-based progression schema.

---

### Cabinet Logic

#### [MODIFY] [ingredients.ts](file:///Users/kolajy/pg/cooking/web/src/game/ingredients.ts)
Updated `getPlayableIngredientCatalog` to dynamically check if berry outcomes are discovered to unlock `fruits`, and if root outcomes are discovered to unlock `tubers`.

---

### Tests

#### [MODIFY] [cli_test.ts](file:///Users/kolajy/pg/cooking/web/src/engine/cli_test.ts)
Updated the milestone unit tests to assert `seeds` instead of `fruits` is unlocked by the first milestone (3 discoveries).

## Verification Plan

### Automated Tests
- Run `npm run test` to verify logic passes.
- Verify `npm run test:packs` checks are green.
- Run `npm run export-native` to bundle the new assets.
