# Culinary Alchemy — Data Schema

Reference for all content and save-game structures. Canonical TypeScript definitions live in [`content/types.ts`](../content/types.ts); the web package re-exports them from `web/src/types/`.

---

## Ingredient item

The atomic content unit. Used for starters, separation outputs, processed ingredients, and finalized dishes.

```ts
interface IngredientItem {
  id: string;                    // unique snake_case key
  name: string;
  emoji: string;
  type?: "ingredient" | "recipe"; // "recipe" = finalized dish
  origin?: string;               // "primitive" | "raw" | "processed"
  category?: string;             // "Produce" | "Forage" | "Pantry" | …
  description?: string;          // gameplay / UI description
  blurb?: string;                // historical or educational flavor text
  tip?: string;                  // cooking tip shown in discovery
  recipes?: RecipeDefinition[];  // how this item is created (on host item)
  xpCategory?: string;
  xpAwarded?: number;
  properties?: IngredientProperties;  // optional food-science tags (see below)
}
```

### Ingredient properties (optional)

Food-science metadata for future technique rules and native clients. Defined in `content/data/ingredients/properties.ts` and **auto-attached at load** by `content/data/index.ts` (recipe files do not need inline `properties` fields).

```ts
interface IngredientProperties {
  edibleRaw: boolean;
  moisture: "high" | "medium" | "low";
  fat: "high" | "medium" | "low";
  structure: "hard" | "soft" | "liquid";
  hasOuterLayer: boolean;
  hasBones: boolean;
  hasSeeds: boolean;
  toxic: boolean;
}
```

All **77** current ingredients (11 starters + 66 discoverable) have property definitions. Validated by `web/src/engine/validate_ingredient_properties.ts` in `npm test`.

### Origin semantics

| `origin` | Meaning | Cabinet state badge |
|----------|---------|---------------------|
| `primitive` | Broad starter category (berries, tubers, water) | Primal |
| `raw` | Separated single ingredient | Raw |
| `processed` | Made via technique or combine | Prepared |
| *(finalized)* | `type: "recipe"` + discovered | Recipe |

Resolved at runtime by `getIngredientOrigin()` in `content/data/index.ts` when omitted.

---

## Recipe definitions

Recipes are **embedded on the output item** (the discoverable entry), not in a separate recipes table.

### Technique recipe (1 → 1 or 1 → many)

```ts
interface TechniqueRecipe {
  input: string;           // counter item id
  tool?: string;           // single action id (legacy)
  tools?: string[];        // action ids: "separate", "smash", "char", …
  outputs?: string[];      // result ids; defaults to host item id
  onePerAction?: boolean;  // separation: one undiscovered output per use
  description?: string;
  tip?: string;
  blurb?: string;
}
```

**Example** — smash potato:

```ts
{
  input: "potato",
  tools: ["smash", "pound"],
  outputs: ["mashed_potato"],
  description: "You crushed the potato into a rough, starchy mash.",
  tip: "Smash starchy tubers to break down fibers before mixing or cooking."
}
```

### Combine recipe (n → 1)

```ts
interface CombineRecipe {
  inputs: string[];        // two or more ingredient ids (order-independent)
  description?: string;
  tip?: string;
  blurb?: string;
}
```

**Example** — sprouted seeds:

```ts
{ inputs: ["seeds", "water"], description: "…", tip: "…" }
```

### Separation group pattern

Primal categories use `createPrimalSeparation` + `buildSeparationGroup`:

- First item in the group holds the recipe
- Sibling items have empty `recipes: []`
- `tools: ["separate", "peel", "tear"]`, `onePerAction: true`

---

## Ingredient registries

### Starters (`content/data/ingredients/starters.ts`)

Available at game start. All `origin: "primitive"`.

| ID | Category |
|----|----------|
| water | Liquids |
| fruits | Produce |
| berries | Produce |
| roots | Forage |
| tubers | Forage |
| nuts | Forage |
| shellfish | Proteins |
| mushrooms | Forage |
| seeds | Pantry |
| grasses | Forage |
| shoots | Forage |

### Unlockables (`content/data/ingredients/unlockables.ts`)

Milestone-gated primitives. **Currently empty** — schema ready for future shipments.

### Discoverable items (`content/data/recipes/index.ts`)

Merged map of all processed content. **Current scale (validated by tests):**

| Metric | Count |
|--------|-------|
| Discoverable items | 66 |
| Technique transitions | 13 |
| Combine transitions | 6 |
| Finalized recipes (`type: "recipe"`) | 5 |

**Categories in registry:**

- `produce/` — berries, fruits
- `liquids/` — water separation chain
- `forage/` — roots, tubers, nuts, mushrooms, grasses, shoots
- `pantry/` — seeds
- `proteins/` — shellfish
- `techniques/` — smash, thermal
- `combines/` — starter vertical-slice dishes

---

## Transition index (runtime)

Built by `buildTransitionIndex(discoverableItems)`. Not hand-authored.

### Technique transition

```ts
interface TechniqueTransition {
  id: string;              // "{resultItemId}__technique__{index}"
  kind: "technique";
  tools: string[];
  input: string;
  outputs: string[];
  onePerAction: boolean;
  resultItemId: string;    // host item in DISCOVERABLE_ITEMS
  recipe: TechniqueRecipe;
}
```

### Combine transition

```ts
interface CombineTransition {
  id: string;              // "{resultItemId}__combine__{index}"
  kind: "combine";
  inputs: string[];
  outputs: string[];       // typically one id
  resultItemId: string;
  recipe: CombineRecipe;
}
```

### Lookup helpers

| Method | Use |
|--------|-----|
| `getTechniqueTransition(toolId, inputId)` | Apply technique to counter item |
| `getCombineTransition(inputIds)` | Merge two+ items |
| `getAffectableInputs(toolId)` | Toolbar / highlight valid inputs |
| `graphEdges` | Progress map rendering |

Combine keys are **sorted, comma-joined** input ids.

---

## Progression config

Defined in `content/progression_config.ts` → `PROGRESSION_CONFIG`.

### Technique tier (skill node)

```ts
interface TechniqueTier {
  name: string;
  emoji: string;
  category: string;        // smash | peel | tear | thermal | structure
  dependsOn?: string[];    // parent skills in tree
  leadsTo?: string[];
  actions: string[];       // tool ids used in recipes
  desc?: string;
  unlockCriteria?: {
    prerequisites?: Record<string, number>;  // e.g. { smash: 3 }
    discoveredRecipes?: number;
  };
}
```

### Technique categories (current)

| Category | Chain (starter → advanced) |
|----------|----------------------------|
| **smash** | smash → pound → press → grind → knead → emulsify |
| **tear** | tear → shred → … |
| **peel** | peel → slice → … |
| **thermal** | char → roast → boil → … |
| **structure** | hand_mix → fold → … |

### Player actions (toolbar)

```ts
interface PlayerAction {
  name: string;
  emoji: string;
  mode?: string;              // "separate" | "combine" — direct mode id
  categories?: string[];      // technique categories for sub-skills
  starterSkill?: string;      // default sub-skill when method selected
  unlockCriteria?: { discoveredRecipes?: number };
  desc?: string;
}
```

| Action ID | Label | Default / unlock |
|-----------|-------|------------------|
| `separate` | Separate | Always available; mode `separate` |
| `force` | Force | Starter skill `smash` |
| `combine` | Combine | Mode `combine` |
| `change` | Transform | Starter `char`; unlocks at 5 finalized recipe discoveries |

### Milestones

```ts
interface IngredientMilestone {
  recipesCount: number;
  unlocks: string[];       // ingredient ids added to pantry
  name?: string;
  emoji?: string;
}
```

**Currently:** `milestones: []` (no shipment unlocks configured).

---

## Achievements

Authoring lives in `content/data/achievements.ts` (definitions) and `content/data/achievement_rules.ts` (declarative unlock rules). Both are exported in `game_bundle.json` as `achievements` and `achievementRules`.

### Definition

```ts
interface AchievementDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category?: "discovery" | "technique" | "recipe" | "meta";
}
```

### Rule (tagged union)

```ts
type AchievementRule =
  | { type: "raw_discoveries"; min: number }
  | { type: "recipe_discoveries"; min: number }
  | { type: "non_primitive_discoveries"; min: number }
  | { type: "map_complete" }
  | { type: "skill_unlocked"; skillId: string }
  | { type: "action_unlocked"; actionId: string }
  | { type: "total_xp"; min: number }
  | { type: "skill_xp"; skillId: string; min: number }
  | { type: "flag"; flag: string }
  | { type: "journal_entries"; min: number };
```

Evaluated by `content/achievement_engine.ts` (web) and `core/src/achievements.rs` (native). UI-only flags (`map_opened`, `undo_used`) are set by the client; gameplay flags (`combine_success`) are set by the runtime on successful actions.

---

## Match result (engine output)

```ts
interface MatchRecipeResult {
  success: boolean;
  recipe?: MatchedRecipe;
  lockedSkillId?: string | null;
  requiredSkillName?: string;
}

interface MatchedRecipe {
  result: IngredientItem;
  results?: IngredientItem[];
  tool?: string;
  outputs?: string[];
  onePerAction?: boolean;
  description?: string;
  tip?: string;
  blurb?: string;
  xpAwarded?: number;
}
```

---

## Save game schemas

### Discovery save — `localStorage.culinary_discovered`

```json
{
  "discovered": ["water", "berries", "strawberry", "mashed_potato"],
  "recent": ["strawberry", "mashed_potato"],
  "highlights": ["strawberry"],
  "discoveryLog": [
    { "id": "strawberry", "discoveredAt": 1718640000000 },
    { "id": "mashed_potato", "discoveredAt": 1718643600000 }
  ]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `discovered` | `string[]` | All known ingredient/recipe ids |
| `recent` | `string[]` | Last 5 discoveries (for "Recent" filter) |
| `highlights` | `string[]` | Pantry glow ids (persisted across sessions) |
| `discoveryLog` | `{ id: string; discoveredAt: number }[]` | Timestamped journal entries; `discoveredAt: 0` = migrated from pre-journal saves ("Earlier session" in UI); starter primitives are not logged |

Legacy format: bare `string[]` array (still supported on load).

### Progression save — `localStorage.culinary_progression`

```json
{
  "xp": {
    "smash": 3,
    "separate": 2,
    "combine": 1,
    "pound": 0
  },
  "milestonesReached": []
}
```

| Field | Type | Notes |
|-------|------|-------|
| `xp` | `Record<string, number>` | Per-skill and per-mode tracks; capped at `maxSkillExp` (99) |
| `milestonesReached` | `number[]` | Indices into `PROGRESSION_CONFIG.milestones` |

### Settings (client-only)

| Key | Purpose |
|-----|---------|
| `culinary_sound_enabled` | Sound on/off (default on) |
| `culinary_reduced_motion` | User override for reduced motion (`"true"` / `"false"`); defaults from `prefers-reduced-motion` when unset |
| `culinary_seen_help` | First-visit help dialog flag |
| `culinary_achievements` | Achievement unlocks + flags (web localStorage; also in portable export) |

Settings are edited in the **Kitchen Settings** dialog (`⚙️` header button or `,` shortcut): sound, reduced motion, export/import save, reset progress.

### Achievements save — `localStorage.culinary_achievements`

```json
{
  "unlocked": [
    { "id": "first_combine", "unlockedAt": 1718640000000 }
  ],
  "flags": ["combine_success", "map_opened"]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `unlocked` | `{ id: string; unlockedAt: number }[]` | Trophy ids with Unix ms unlock time |
| `flags` | `string[]` | Client/runtime flags referenced by achievement rules |

### Portable export — `culinary-alchemy-save-YYYY-MM-DD.json`

Triggered from **Settings → Save data → Export save**. Bundles discovery, progression, achievements, and settings into one JSON file for backup or transfer.

```json
{
  "version": 1,
  "game": "culinary-alchemy",
  "exportedAt": 1718640000000,
  "discovery": {
    "discovered": ["water", "berries", "strawberry"],
    "recent": ["strawberry"],
    "highlights": ["strawberry"],
    "discoveryLog": [{ "id": "strawberry", "discoveredAt": 1718640000000 }]
  },
  "progression": {
    "xp": { "smash": 3, "separate": 2 },
    "milestonesReached": []
  },
  "achievements": {
    "unlocked": [{ "id": "first_combine", "unlockedAt": 1718640000000 }],
    "flags": ["combine_success"]
  },
  "settings": {
    "soundEnabled": true,
    "reducedMotion": false
  }
}
```

| Field | Type | Notes |
|-------|------|-------|
| `version` | `1` | Save file format version |
| `game` | `"culinary-alchemy"` | Product identifier |
| `exportedAt` | `number` | Unix ms timestamp when export was created |
| `discovery` | `DiscoverySaveData` | Same shape as `localStorage.culinary_discovered` |
| `progression` | `ProgressionState` | Same shape as `localStorage.culinary_progression` |
| `achievements` | `AchievementsSaveData` | Same shape as `localStorage.culinary_achievements` |
| `settings.soundEnabled` | `boolean` | Kitchen sound preference at export time |
| `settings.reducedMotion` | `boolean` | Reduced motion preference at export time |

Import via **Settings → Import save** (or drag a `.json` file). Older saves without `settings.reducedMotion` default to `false`; missing `achievements` defaults to empty.

---

## Runtime game state (not persisted)

`GameState` in `web/src/types/index.ts` — highlights:

| Field | Purpose |
|-------|---------|
| `discoveredIds` | In-memory discovery set |
| `discoveryLog` | Timestamped discovery journal (newest first) |
| `activeElements` | DOM nodes on counter |
| `activeAction` / `activeSkillId` | Toolbar selection |
| `mergeTarget` | Drag-to-combine hover target |
| `undoEntry` | Single-step undo payload |
| `*FilterIncludes/Excludes` | Pantry filter state |
| `achievementUnlocks` / `achievementFlags` | Trophy progress (also in localStorage + portable save) |
| `activeSidebarTab` | Cabinet / skills / journal / trophies / map |

---

## Content authoring checklist

1. Assign unique `id` across all registries.
2. Set `origin` and `category` appropriately.
3. Add a `properties` entry in `content/data/ingredients/properties.ts` for every new ingredient id.
4. For separation chains: first sibling owns recipe, `onePerAction: true`.
5. For finalized dishes: `type: "recipe"` via `buildFinalizedRecipeItem`.
6. Run `npm test` — engine regression, content validation, recipe dependency checks, ingredient properties completeness, save import parsing.
7. Run `npm run export-native` before native/desktop builds (also refreshes `docs/generated/`).
8. Verify progress map shows new edges (uses `graphEdges`).

### Validators (`npm test`)

| Script | Checks |
|--------|--------|
| `cli_test.ts` | XP, unlocks, separation, combine, vertical-slice recipes |
| `validate_content.ts` | Transition collisions, starter action coverage, finalized recipes |
| `validate_recipe_dependencies.ts` | Reference integrity, reachability, orphans, duplicate ids |
| `validate_ingredient_properties.ts` | Every ingredient has properties; no orphan property keys |
| `save-import.test.ts` | Portable save JSON parsing |

Cultural packs (optional DLC content): `npm run test:packs` — structure, transitions, and dependency checks in isolation.

---

## Vertical slice reference chain

End-to-end path currently playable in content:

```
tubers --separate--> potato --smash--> mashed_potato
apple --char--> charred_apple
seeds + water --combine--> sprouted_seeds
mashed_potato + charred_apple --combine--> hearth_mash (recipe)
strawberry + spring_water --combine--> berry_brew (recipe)
```

This chain exercises separate, smash, thermal, combine, and finalized recipe discovery.
