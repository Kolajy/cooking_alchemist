# Content Authoring Guide

This guide explains how to add new ingredients, recipes, and techniques to the game.

The data layer separates platform-neutral content configurations from the logic engine. Once content is written in `content/`, it is exported into cross-platform JSON assets via `npm run export-native`.

## 1. Schemas

The canonical type definitions reside in `content/types.ts`. All content revolves around `IngredientItem` and the attached `RecipeDefinition`.

### IngredientItem
An `IngredientItem` represents an atomic content unit—it could be a raw material or a finalized recipe dish.
```typescript
interface IngredientItem {
  id: string;                    // Unique snake_case identifier
  name: string;                  // Display name
  emoji: string;                 // UI icon
  type?: "ingredient" | "recipe"; // Use "recipe" for finalized dishes
  origin?: "primitive" | "raw" | "processed";
  category?: string;             // UI category (e.g., "Produce", "Pantry")
  description?: string;          // Gameplay description
  blurb?: string;                // Educational/flavor text
  recipes?: RecipeDefinition[];  // Recipes that result in this item
  properties?: IngredientProperties; // Food-science properties
}
```

### Recipes
Instead of maintaining a global list of recipes, recipes are **embedded within the output `IngredientItem`**.

**Technique Recipe (1 → 1 or 1 → Many)**
Requires a tool action applied to an input.
```typescript
interface TechniqueRecipe {
  input: string;      // The item being acted upon
  tools: string[];    // Array of action IDs (e.g., ["smash", "pound"])
  outputs?: string[]; // Resulting item IDs (defaults to the host item ID)
  description?: string;
}
```

**Combine Recipe (N → 1)**
Merging multiple items together.
```typescript
interface CombineRecipe {
  inputs: string[];   // Two or more item IDs
  description?: string;
}
```

## 2. Step-by-Step Addition

### Adding a New Ingredient & Recipe

**Step A: Define Food-Science Properties**
All items need baseline food-science properties. Add the item ID to `content/data/ingredients/properties.ts`.
```typescript
  my_new_item: {
    edibleRaw: true,
    moisture: "medium",
    fat: "low",
    structure: "soft",
    hasOuterLayer: false,
    hasBones: false,
    hasSeeds: false,
    toxic: false
  },
```

**Step B: Define the Output Item and Recipe**
Create or edit a file inside `content/data/recipes/` (e.g., `content/data/recipes/techniques/smash.ts` or a new file).

Use the builder helpers in `_techniqueRecipe.ts` or `_finalizedRecipe.ts`.

*Technique Example:*
```typescript
import { buildTechniqueItem, createTechniqueTransition } from "../_techniqueRecipe";

const myNewItem = buildTechniqueItem(
  {
    id: "mashed_potato",
    name: "Mashed Potato",
    emoji: "🥣",
    category: "Forage",
    description: "Soft and dense.",
  },
  createTechniqueTransition("potato", ["smash", "pound"], ["mashed_potato"])
);
```

*Combine Example:*
```typescript
import { buildCombineItem, createCombineTransition } from "../_techniqueRecipe";

const myNewCombine = buildCombineItem(
  {
    id: "sprouted_seeds",
    name: "Sprouted Seeds",
    emoji: "🌱",
    category: "Pantry",
    description: "Water and seeds.",
  },
  createCombineTransition(["seeds", "water"])
);
```

**Step C: Register the Item**
Export your item in the respective file and ensure it is registered in the main registry at `content/data/recipes/index.ts`.

### Adding a New Technique

1. **Add to Progression Configuration:** Open `content/progression_config.ts`.
2. **Define TechniqueTier:** Add your new technique to the `techniques` object under an existing category (or a new one). You specify its prerequisites (`dependsOn`, `unlockCriteria`), actions (which tie back to `tools` in recipes), and what it leads to.

```typescript
    my_new_technique: {
      name: "New Technique",
      emoji: "✨",
      dependsOn: ["some_earlier_technique"],
      leadsTo: [],
      unlockCriteria: { prerequisites: { some_earlier_technique: 3 } },
      actions: ["my_new_action"], // This string is used in recipes
      desc: "A cool new way to process food."
    }
```

## 3. Dependency Checks and Validation

The content pipeline heavily relies on robust validation to prevent broken progressions or orphaned recipes.

### Running Validations

Run the testing suite from the repository root:
```bash
npm test
```
This runs `validate_content.ts`, `validate_recipe_dependencies.ts`, and `validate_ingredient_properties.ts` internally.

### Common Validation Errors & Warnings
- **Missing Properties Error:** Thrown if an item exists in the registry but lacks food-science properties in `properties.ts`.
- **Unreachable Recipe Error:** Thrown if a recipe requires an input that has no valid recipe path to be discovered from starters.
- **Unused Intermediate Warning:** `[UNUSED_INTERMEDIATE]` warns when a craftable ingredient is never used as an input for any downstream recipe or technique.
- **Invalid Reference Error:** Thrown if a recipe references an `input` or `output` string that does not exist in the discoverable maps or primitives.

### Finalizing Changes

After successfully passing tests, generate the final cross-platform JSON assets and documentation:
```bash
npm run export-native
```
This updates `game_bundle.json` and `transitions.json` so they can be consumed by the native clients and the web engine.
