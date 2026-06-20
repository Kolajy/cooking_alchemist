# Culinary Alchemy — Shared Content

Platform-neutral authoring for ingredients, recipes, progression, and achievements.

## Layout

```
content/
  types.ts                 # Cross-platform domain & save types
  progression_config.ts    # Technique trees and toolbar actions
  achievement_engine.ts    # Shared achievement rule evaluation (TypeScript)
  data/
    index.ts               # Ingredient loader + global bridge for web export
    achievements.ts        # Trophy definitions (18 shipped)
    achievement_rules.ts   # Declarative unlock rules
    ingredients/           # Starters, unlockables, properties
    recipes/               # Discoverable items by category
    transitions/           # Transition index builder
    packs/                 # Cultural content packs (optional merge)
```

## Workflow

1. Edit content under `content/`
2. Run `npm run export-native` from the repo root
3. JSON lands in `core/assets/`, `web/src/public/game/`, `ios/`, and `android/`
4. Run `npm test` and `cargo test -p culinary-core`
5. Human-readable catalogs regenerate to `docs/generated/` (also via `npm run docs:generate`)

Exported `game_bundle.json` includes:

- `starters`, `unlockables`, `discoverable`, `progression`
- `achievements` — player-facing trophy metadata (name, emoji, `steamId`)
- `achievementRules` — declarative unlock conditions (interpreted by web + Rust)

## Adding an achievement

1. Add a definition to `data/achievements.ts`
2. Add a matching rule to `data/achievement_rules.ts`
3. Export and test — both `content/achievement_engine.ts` and `core/src/achievements.rs` evaluate the same rule shapes

## Consumers

| Platform | How it loads content |
|----------|----------------------|
| Web dev | `fetch /game/game_bundle.json` or compiled `content/data` modules |
| Rust (`culinary-core`) | `GameBundle::load(dir)` → `GameRuntime` |
| iOS / Android | Bundled `assets/game/*.json` |

## Documentation

| Doc | Topic |
|-----|-------|
| [docs/DATA_LAYER.md](../docs/DATA_LAYER.md) | Bundle format, save schema, APIs |
| [docs/DATA_SCHEMA.md](../docs/DATA_SCHEMA.md) | Type definitions and authoring checklist |
| [docs/ROADMAP.md](../docs/ROADMAP.md) | Content expansion phases |
| [docs/generated/CONTENT_REFERENCE.md](../docs/generated/CONTENT_REFERENCE.md) | Shipped ingredients, techniques, transitions |
