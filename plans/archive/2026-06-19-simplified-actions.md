# Plan: 5-Action Toolbar & Automated Subaction Unlocking (Archived)

We simplified the toolbar into 5 main action modes (`Combine`, `Separate`, `Force`, `Transform`, `Time`) and automated subaction matching based on the player's unlocked technique levels.

## 1. Proposed Changes

### [MODIFY] [progression_config.ts](file:///Users/kolajy/pg/cooking/content/progression_config.ts)
- Add the `time` category with techniques: `rest` (Rest & Steep), `ferment` (Ferment & Culture), `age` (Age & Cure).
- Add the `time` player action to the toolbar configuration under `playerActions`.

### [MODIFY] [constants.ts](file:///Users/kolajy/pg/cooking/web/src/game/constants.ts)
- Update `METHOD_ORDER` to include `"time"`.
- Update `METHODS_WITH_OWN_ACTION` to include all 5 actions.

### [MODIFY] [combination_engine.ts](file:///Users/kolajy/pg/cooking/web/src/engine/combination_engine.ts)
- Update `matchToolRecipe` to resolve the transition when a main action is selected:
  1. Determine the categories owned by the selected main action.
  2. Identify all technique/tool IDs under those categories.
  3. Scan the recipe transition index for a matching technique for the input ingredient.
  4. Check if the player has unlocked the required technique. If unlocked, return success; if locked, return failure with the required skill name for the UI.

### [MODIFY] [cli_test.ts](file:///Users/kolajy/pg/cooking/web/src/engine/cli_test.ts)
- Update the assertions in the CLI test runner to match the new 5-action system.

## 2. Verification Plan

### Automated Tests
- Run `npm test` and `npm run export-native` to verify.
