# Culinary Alchemy — Techniques & Progression

> **Auto-generated** from `content/` on 2026-06-18. Do not edit by hand.
> Regenerate with `npm run docs:generate` after content changes.

## Player toolbar actions

Four top-level methods shown on the counter. Sub-skills come from linked technique categories.

| ID | | Name | Mode / categories | Unlock | Description |
|----|---|------|-------------------|--------|-------------|
| `separate` | 🔪 | Separate | `separate` | Always available | Split, peel, and pull ingredients apart. |
| `force` | ✊ | Force | `smash` (default: `smash`) | Always available | Crush, grind, and break ingredients down. |
| `combine` | 🥣 | Combine | `combine` | Always available | Merge ingredients together and mix them into unified blends. |
| `change` | 🔥 | Transform | `thermal` (default: `char`) | 5 recipes discovered | Heat, cook, and transform ingredients. |

## Technique categories

Max XP per skill track: **99**

### Smash (`smash`)

#### ✊ Smash (`smash`)

| Field | Value |
|-------|-------|
| Category | smash |
| Toolbar actions | `smash` |
| Depends on | — |
| Leads to | `pound` |
| Unlock | Unlocked at start |

Crush tubers, roots, or nuts with raw manual force.

#### 🔨 Pound (`pound`)

| Field | Value |
|-------|-------|
| Category | smash |
| Toolbar actions | `pound` |
| Depends on | `smash` |
| Leads to | `press` |
| Unlock | smash ≥ 3 |

Pound ingredients into pastes using a mortar and pestle.

#### 🪵 Press (`press`)

| Field | Value |
|-------|-------|
| Category | smash |
| Toolbar actions | `press` |
| Depends on | `pound` |
| Leads to | `grind` |
| Unlock | pound ≥ 3 |

Extract liquids and oils by applying continuous pressure.

#### 🪨 Grind (`grind`)

| Field | Value |
|-------|-------|
| Category | smash |
| Toolbar actions | `grind`, `chop`, `dice`, `mince` |
| Depends on | `press` |
| Leads to | `knead` |
| Unlock | press ≥ 4 |

Grind or chop grains, seeds, and vegetables into fine textures.

#### 👐 Knead (`knead`)

| Field | Value |
|-------|-------|
| Category | smash |
| Toolbar actions | `knead` |
| Depends on | `grind` |
| Leads to | `emulsify` |
| Unlock | grind ≥ 4 |

Stagger, fold, and knead dough to develop gluten structures.

#### 🌪️ Emulsify (`emulsify`)

| Field | Value |
|-------|-------|
| Category | smash |
| Toolbar actions | `emulsify`, `blend` |
| Depends on | `knead` |
| Leads to | — |
| Unlock | knead ≥ 5 |

Emulsify oils and liquids into unified sauces and dressings.

### Tear & Cut (`tear`)

#### 🖐️ Tear (`tear`)

| Field | Value |
|-------|-------|
| Category | tear |
| Toolbar actions | `tear` |
| Depends on | — |
| Leads to | `structured_tear` |
| Unlock | separate ≥ 4 |

Tear leafy herbs, greens, or cooked meats by hand.

#### 🥗 Structured Tear (`structured_tear`)

| Field | Value |
|-------|-------|
| Category | tear |
| Toolbar actions | `structured_tear`, `shred` |
| Depends on | `tear` |
| Leads to | `chunking` |
| Unlock | tear ≥ 3 |

Tear along grain lines or predefined lines with careful handling.

#### 🪵 Chunking (`chunking`)

| Field | Value |
|-------|-------|
| Category | tear |
| Toolbar actions | `chunk` |
| Depends on | `structured_tear` |
| Leads to | `cutting` |
| Unlock | structured_tear ≥ 3 |

Break down food into large, rough pieces or chunks.

#### 🔪 Cutting (`cutting`)

| Field | Value |
|-------|-------|
| Category | tear |
| Toolbar actions | `cut`, `chop` |
| Depends on | `chunking` |
| Leads to | `slicing` |
| Unlock | chunking ≥ 4 |

Cut foods cleanly using basic knife strokes.

#### 🥓 Slicing (`slicing`)

| Field | Value |
|-------|-------|
| Category | tear |
| Toolbar actions | `slice` |
| Depends on | `cutting` |
| Leads to | `dicing` |
| Unlock | cutting ≥ 4 |

Slice meats and vegetables into thin, even strips.

#### 🎲 Dicing (`dicing`)

| Field | Value |
|-------|-------|
| Category | tear |
| Toolbar actions | `dice` |
| Depends on | `slicing` |
| Leads to | `julienne` |
| Unlock | slicing ≥ 5 |

Cut ingredients into precise, small cubes.

#### 🥢 Julienne (`julienne`)

| Field | Value |
|-------|-------|
| Category | tear |
| Toolbar actions | `julienne` |
| Depends on | `dicing` |
| Leads to | — |
| Unlock | dicing ≥ 5 |

Precision matchstick cuts and micro-garnishes.

### Peel (`peel`)

#### 🧼 Peel (`peel`)

| Field | Value |
|-------|-------|
| Category | peel |
| Toolbar actions | `peel` |
| Depends on | — |
| Leads to | `core_seed` |
| Unlock | separate ≥ 2 |

Strip tough outer layers from roots, tubers, or fruits.

#### 🥑 Core & Seed (`core_seed`)

| Field | Value |
|-------|-------|
| Category | peel |
| Toolbar actions | `core`, `seed` |
| Depends on | `peel` |
| Leads to | `fillet_debone` |
| Unlock | peel ≥ 3 |

Remove tough cores, seeds, or pits from produce.

#### 👑 Fillet & Debone (`fillet_debone`)

| Field | Value |
|-------|-------|
| Category | peel |
| Toolbar actions | `fillet`, `debone`, `zest` |
| Depends on | `core_seed` |
| Leads to | — |
| Unlock | core_seed ≥ 4 |

Cleanly separate fish meat from bones and debone red meats.

### Thermal (`thermal`)

#### 🔥 Uncontrolled Heat (`char`)

| Field | Value |
|-------|-------|
| Category | thermal |
| Toolbar actions | `char`, `roast` |
| Depends on | — |
| Leads to | `cook` |
| Unlock | Unlocked at start |

Cooking directly on open fire, coals, or hot ash.

#### 🍳 Controlled Heat (`cook`)

| Field | Value |
|-------|-------|
| Category | thermal |
| Toolbar actions | `cook`, `fry`, `boil`, `simmer` |
| Depends on | `char` |
| Leads to | `precision` |
| Unlock | char ≥ 3 |

Stovetop cooking: medium heat boil, simmer, and pan-fry.

#### 🌡️ Oven & Precision (`precision`)

| Field | Value |
|-------|-------|
| Category | thermal |
| Toolbar actions | `precision`, `bake`, `sous_vide`, `reduce` |
| Depends on | `cook` |
| Leads to | — |
| Unlock | cook ≥ 5 |

Oven baking, roasting, and precise temperature cook profiles.

### Structure & Mix (`structure`)

#### 🥄 Hand Mix & Stir (`hand_mix`)

| Field | Value |
|-------|-------|
| Category | structure |
| Toolbar actions | `hand_mix`, `stir` |
| Depends on | — |
| Leads to | `whisk_churn` |
| Unlock | combine ≥ 3 |

Stirring, blending, and combining ingredients by hand.

#### 🥣 Whisk & Churn (`whisk_churn`)

| Field | Value |
|-------|-------|
| Category | structure |
| Toolbar actions | `whisk`, `churn` |
| Depends on | `hand_mix` |
| Leads to | `gel_foam` |
| Unlock | hand_mix ≥ 3 |

Incorporate air or butter fat clump formation.

#### 🫧 Gel & Foam (`gel_foam`)

| Field | Value |
|-------|-------|
| Category | structure |
| Toolbar actions | `gel`, `foam` |
| Depends on | `whisk_churn` |
| Leads to | — |
| Unlock | whisk_churn ≥ 4 |

Chemical gelification and culinary foam stabilization.

## Action IDs used in recipes

Union of all `actions` arrays across skills — these are the tool ids referenced in recipe transitions.

`bake` · `blend` · `boil` · `char` · `chop` · `chunk` · `churn` · `combine` · `cook` · `core` · `cut` · `debone` · `dice` · `emulsify` · `fillet` · `foam` · `fry` · `gel` · `grind` · `hand_mix` · `julienne` · `knead` · `mince` · `peel` · `pound` · `precision` · `press` · `reduce` · `roast` · `seed` · `separate` · `shred` · `simmer` · `slice` · `smash` · `sous_vide` · `stir` · `structured_tear` · `tear` · `whisk` · `zest`


### Coverage in current content

| Status | Action IDs |
|--------|------------|
| Used in at least one transition | `char`, `peel`, `pound`, `roast`, `separate`, `smash`, `tear` |
| Defined in progression, not yet in recipes | `bake`, `blend`, `boil`, `chop`, `chunk`, `churn`, `combine`, `cook`, `core`, `cut`, `debone`, `dice`, `emulsify`, `fillet`, `foam`, `fry`, `gel`, `grind`, `hand_mix`, `julienne`, `knead`, `mince`, `precision`, `press`, `reduce`, `seed`, `shred`, `simmer`, `slice`, `sous_vide`, `stir`, `structured_tear`, `whisk`, `zest` |
