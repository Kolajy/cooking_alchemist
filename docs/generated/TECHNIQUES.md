# Culinary Alchemy — Techniques & Progression

> **Auto-generated** from `content/` on 2026-07-10. Do not edit by hand.
> Regenerate with `npm run docs:generate` after content changes.

## Player toolbar actions

Four top-level methods shown on the counter. Sub-skills come from linked technique categories.

| ID | | Name | Mode / categories | Unlock | Description |
|----|---|------|-------------------|--------|-------------|
| `separate` | 🔪 | Separate | `separate` | Always available | Split, peel, and pull ingredients apart. |
| `force` | ✊ | Force | `smash` (default: `smash`) | Always available | Crush, grind, and break ingredients down. |
| `combine` | 🥣 | Combine | `combine` | 15 recipes discovered | Merge ingredients together and mix them into unified blends. |
| `change` | 🔥 | Heat | `thermal` (default: `char`) | 40 recipes discovered | Heat, cook, and transform ingredients. |
| `time` | ⏳ | Time | `time` (default: `rest`) | 200 recipes discovered | Steep, rest, ferment, or age ingredients. |

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
| Leads to | `grind` |
| Unlock | smash ≥ 3 |

Pound ingredients into pastes using a mortar and pestle.

#### 🪨 Grind (`grind`)

| Field | Value |
|-------|-------|
| Category | smash |
| Toolbar actions | `grind`, `chop`, `dice`, `mince` |
| Depends on | `pound` |
| Leads to | `press` |
| Unlock | pound ≥ 3 |

Grind or chop grains, seeds, and vegetables into fine textures.

#### 🪵 Press (`press`)

| Field | Value |
|-------|-------|
| Category | smash |
| Toolbar actions | `press` |
| Depends on | `grind` |
| Leads to | `knead` |
| Unlock | grind ≥ 4 |

Extract liquids and oils by applying continuous pressure.

#### 👐 Knead (`knead`)

| Field | Value |
|-------|-------|
| Category | smash |
| Toolbar actions | `knead` |
| Depends on | `press` |
| Leads to | `emulsify` |
| Unlock | press ≥ 4 |

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
| Leads to | `cutting` |
| Unlock | separate ≥ 4 |

Tear leafy herbs, greens, or cooked meats by hand.

#### 🔪 Cutting (`cutting`)

| Field | Value |
|-------|-------|
| Category | tear |
| Toolbar actions | `cut`, `chop` |
| Depends on | `tear` |
| Leads to | `slicing` |
| Unlock | tear ≥ 3 |

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
| Unlock | slicing ≥ 4 |

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

#### 🔥 Ash & Embers (`char`)

| Field | Value |
|-------|-------|
| Category | thermal |
| Toolbar actions | `char`, `roast` |
| Depends on | — |
| Leads to | `pit_cook` |
| Unlock | Unlocked at start |

Cooking directly on open fire, coals, or hot ash.

#### 🛖 Earth & Dirt Oven (`pit_cook`)

| Field | Value |
|-------|-------|
| Category | thermal |
| Toolbar actions | `pit_cook`, `bake` |
| Depends on | `char` |
| Leads to | `hearth_bake` |
| Unlock | char ≥ 3 |

Slow roasting underground using heated stone pits.

#### 🧱 Hearth & Clay Oven (`hearth_bake`)

| Field | Value |
|-------|-------|
| Category | thermal |
| Toolbar actions | `hearth_bake`, `bake` |
| Depends on | `pit_cook` |
| Leads to | `cook` |
| Unlock | pit_cook ≥ 3 |

Baking bread and roasting in clay tandoors or stone hearths.

#### 🍳 Controlled Heat (`cook`)

| Field | Value |
|-------|-------|
| Category | thermal |
| Toolbar actions | `cook`, `fry`, `boil`, `simmer`, `steam` |
| Depends on | `hearth_bake` |
| Leads to | `smoke` |
| Unlock | hearth_bake ≥ 4 |

Stovetop cooking: boiling, simmering, steaming, and pan-frying.

#### 💨 Smoke & Cure (`smoke`)

| Field | Value |
|-------|-------|
| Category | thermal |
| Toolbar actions | `smoke` |
| Depends on | `cook` |
| Leads to | `precision` |
| Unlock | cook ≥ 4 |

Exposing ingredients to aromatic hardwood smoke for flavor.

#### 🌡️ Modern Precision (`precision`)

| Field | Value |
|-------|-------|
| Category | thermal |
| Toolbar actions | `precision`, `sous_vide`, `reduce` |
| Depends on | `smoke` |
| Leads to | — |
| Unlock | smoke ≥ 5 |

Oven baking, temperature-controlled sous-vide, and precise reductions.

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

### Time & Age (`time`)

#### ⏳ Rest & Steep (`rest`)

| Field | Value |
|-------|-------|
| Category | time |
| Toolbar actions | `rest`, `steep` |
| Depends on | — |
| Leads to | `ferment` |
| Unlock | Unlocked at start |

Let dough relax, tea steep, or marinades settle.

#### 🦠 Ferment & Culture (`ferment`)

| Field | Value |
|-------|-------|
| Category | time |
| Toolbar actions | `ferment`, `culture` |
| Depends on | `rest` |
| Leads to | `age` |
| Unlock | rest ≥ 3 |

Cultivate yeast or bacteria to ferment doughs, brews, or batters.

#### 🏺 Age & Cure (`age`)

| Field | Value |
|-------|-------|
| Category | time |
| Toolbar actions | `age`, `cure` |
| Depends on | `ferment` |
| Leads to | — |
| Unlock | ferment ≥ 4 |

Cure or age ingredients over longer time spans.

## Action IDs used in recipes

Union of all `actions` arrays across skills — these are the tool ids referenced in recipe transitions.

`age` · `bake` · `blend` · `boil` · `char` · `chop` · `churn` · `combine` · `cook` · `core` · `culture` · `cure` · `cut` · `debone` · `dice` · `emulsify` · `ferment` · `fillet` · `foam` · `fry` · `gel` · `grind` · `hand_mix` · `hearth_bake` · `julienne` · `knead` · `mince` · `peel` · `pit_cook` · `pound` · `precision` · `press` · `reduce` · `rest` · `roast` · `seed` · `separate` · `simmer` · `slice` · `smash` · `smoke` · `sous_vide` · `steam` · `steep` · `stir` · `tear` · `whisk` · `zest`


### Coverage in current content

| Status | Action IDs |
|--------|------------|
| Used in at least one transition | `bake`, `boil`, `char`, `cook`, `dice`, `ferment`, `fillet`, `grind`, `hearth_bake`, `julienne`, `peel`, `pit_cook`, `pound`, `precision`, `press`, `roast`, `separate`, `simmer`, `slice`, `smash`, `smoke`, `tear` |
| Defined in progression, not yet in recipes | `age`, `blend`, `chop`, `churn`, `combine`, `core`, `culture`, `cure`, `cut`, `debone`, `emulsify`, `foam`, `fry`, `gel`, `hand_mix`, `knead`, `mince`, `reduce`, `rest`, `seed`, `sous_vide`, `steam`, `steep`, `stir`, `whisk`, `zest` |
