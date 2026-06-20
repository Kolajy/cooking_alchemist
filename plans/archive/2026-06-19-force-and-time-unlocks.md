# Plan: Implement Force and Time Unlock Conditions

Implement the custom unlock conditions for **Force** and **Time**:
1. **Force**: Discovered when the player separates berries and gets `smashed_berries`.
2. **Time**: Discovered once the player reaches 200 total discoveries AND has discovered `berry_pulp` (produced by straining `smashed_berries`).

## Proposed Changes

### Types & Data Schema

#### [MODIFY] [types.ts](file:///Users/kolajy/pg/cooking/content/types.ts)
Update `PlayerAction`'s `unlockCriteria` definition to support `requiredIngredients?: string[]`.

---

### Ingredient & Recipe Data

#### [MODIFY] [berries.ts](file:///Users/kolajy/pg/cooking/content/data/recipes/produce/berries.ts)
- Add `smashed_berries` to the `berries` primal separation outputs.
- Define the `smashed_berries` ingredient item.

#### [NEW] [berry_pulp.ts](file:///Users/kolajy/pg/cooking/content/data/recipes/produce/berry_pulp.ts)
Define the `berry_pulp` ingredient and its technique transition: `smashed_berries` strained using `separate` -> `berry_pulp`.

#### [MODIFY] [index.ts](file:///Users/kolajy/pg/cooking/content/data/recipes/index.ts)
Import and register the new `berry_pulp` recipe in the default export.

#### [MODIFY] [properties.ts](file:///Users/kolajy/pg/cooking/content/data/ingredients/properties.ts)
Add properties for the two new ingredients: `smashed_berries` and `berry_pulp`.

---

### Progression Configuration

#### [MODIFY] [progression_config.ts](file:///Users/kolajy/pg/cooking/content/progression_config.ts)
- Update the `force` action config's `unlockCriteria` to use `requiredIngredients: ["smashed_berries"]`.
- Update the `time` action config's `unlockCriteria` to use `discoveredRecipes: 200` and `requiredIngredients: ["berry_pulp"]`.

---

### Runtime Unlock Checks

#### [MODIFY] [skills.ts](file:///Users/kolajy/pg/cooking/web/src/game/progression/skills.ts)
Modify `isPlayerActionUnlocked` to check for `requiredIngredients` matches in `state.discoveredIds` in addition to discovery counts.

## Verification Plan

### Automated Tests
- Run `npm run test` to verify logic passes.
- Verify `npm run test:packs` checks are green.
- Run `npm run export-native` to bundle the new ingredients.
