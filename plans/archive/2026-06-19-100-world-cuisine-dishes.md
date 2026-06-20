# Active Plan: Add 100 World Cuisine Dishes

We will add the 100 global culinary dishes requested by the user. This includes dishes from East Asia, Southeast Asia, South Asia, Middle East, Mediterranean, French, African, Latin American, Eastern European, North American, and Universal/Ancient categories.

## Proposed Changes

### [MODIFY] [properties.ts](file:///Users/kolajy/pg/cooking/content/data/ingredients/properties.ts)
- Add property entries for all new intermediate ingredients and finalized dishes.

### [NEW] [world_cuisine.ts](file:///Users/kolajy/pg/cooking/content/data/recipes/world_cuisine.ts)
- Implement recipes/transitions for the 100 dishes.
- We will group them by regional packs within the file or separate sub-files, defining the required inputs, tools, and output states.

### [MODIFY] [index.ts](file:///Users/kolajy/pg/cooking/content/data/recipes/index.ts)
- Import and register the new world cuisine recipes.

### [MODIFY] [cli_test.ts](file:///Users/kolajy/pg/cooking/web/src/engine/cli_test.ts)
- Update the expected count of discoverable items.

## Verification Plan

### Automated Tests
- Run `npm test` to verify recipe dependencies, properties, and compilation.
- Run `npm run export-native` to update native assets.
