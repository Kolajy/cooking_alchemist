# Shared Data Layer

All platforms — **web**, **desktop (Steam)**, **iOS**, and **Android** — share one data contract and one game-logic implementation.

## Architecture

```
content/               Platform-neutral authoring (TypeScript)
        │
        ▼
scripts/export_native_bundle.ts
        │
        ▼
┌───────────────────────────────────────────────────────┐
│  game_bundle.json   — starters, discoverable,           │
│                       progression, achievements,      │
│                       achievementRules                  │
│  transitions.json — flat technique + combine          │
└───────────────────────────────────────────────────────┘
        │
        ├─► culinary-core::GameBundle   (parse JSON)
        ├─► culinary-core::GameRuntime  (state + logic)
        ├─► content/achievement_engine.ts (TS rule evaluation)
        │
        ├── desktop/     direct Rust API
        ├── ios/         C FFI (culinary_init_json) → Swift wrapper (planned)
        ├── android/     assets JSON + Kotlin engine
        └── web/         fetch /game/*.json → globals + TS engines
```

## Authoring

Edit files under [`content/`](../content/README.md) — not `web/src/`. The web package keeps thin re-export shims at `web/src/data/` and `web/src/progression_config.ts` for legacy import paths.

Run after any content change:

```bash
npm run export-native
```

## Asset files

| File | Contents |
|------|----------|
| `game_bundle.json` | `starters`, `unlockables`, `discoverable` (with optional `properties` per item), `progression`, `achievements`, `achievementRules` |
| `transitions.json` | Flat array of technique/combine transitions (from `TRANSITION_INDEX.all`) |

### Locations after export

| Platform | Path |
|----------|------|
| Rust tests / desktop | `core/assets/` |
| Web dev server | `web/src/public/game/` |
| iOS | `ios/CulinaryAlchemy/Resources/game/` |
| Android | `android/app/src/main/assets/game/` |

## Achievements (global)

| Piece | Location |
|-------|----------|
| Definitions | `content/data/achievements.ts` |
| Declarative rules | `content/data/achievement_rules.ts` |
| TS evaluator | `content/achievement_engine.ts` |
| Rust evaluator | `core/src/achievements.rs` |
| Web UI / persistence | `web/src/game/progression/achievements.ts` |

Rules use a tagged JSON shape, e.g. `{ "type": "raw_discoveries", "min": 1 }` or `{ "type": "flag", "flag": "combine_success" }`. Both TypeScript and Rust interpret the same rules from the exported bundle.

## Rust API (`culinary-core`)

| Type | Role |
|------|------|
| `GameBundle` | Immutable content: items, progression, achievements, transition index |
| `GameRuntime` | Mutable session: discovered set, XP, discovery log, achievement unlocks |
| `AchievementEngine` | Evaluates `achievementRules` against runtime state |
| `GameSaveFile` | Portable save JSON (version 1) |

```rust
let mut rt = GameRuntime::load(path)?;
let result = rt.apply_combine("seeds", "water");
let save = rt.build_save(); // includes achievements
```

## Web API (`web/src/core/`)

| Module | Role |
|--------|------|
| `load_bundle.ts` | Fetch `/game/*.json`, populate `globalThis` |
| `build_index.ts` | Build `TRANSITION_INDEX` from exported transitions |
| `types.ts` | Shared types matching Rust save/bundle schema |

Boot sequence (`main.ts`):

1. `bootstrapSharedData()` — load JSON bundle (fallback: compiled `content/` modules)
2. Existing game UI uses `globalThis` + engines

## Save file schema

```json
{
  "version": 1,
  "game": "culinary-alchemy",
  "exportedAt": 1234567890,
  "discovery": { "discovered": [], "recent": [], "highlights": [], "discoveryLog": [] },
  "progression": { "xp": {}, "milestonesReached": [] },
  "achievements": { "unlocked": [], "flags": [] },
  "settings": { "soundEnabled": true, "reducedMotion": false }
}
```

Saves are interchangeable across web export, desktop, iOS, and Android (when native clients implement achievement persistence).

## Validation

```bash
npm test                              # cli_test + content + dependency + properties + save-import
npm run test:packs                    # optional cultural pack content
cargo test -p culinary-core           # Rust cli_test
```

When changing game data or rules, update authoring in `content/`, run `npm run export-native`, then run both test suites.

## Related documentation

| Doc | Topic |
|-----|-------|
| [README.md](../README.md) | Monorepo quick start |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Module boundaries and boot flow |
| [DATA_SCHEMA.md](./DATA_SCHEMA.md) | Type definitions and save fields |
| [ROADMAP.md](./ROADMAP.md) | Platform parity and shipping phases |
| [content/README.md](../content/README.md) | Authoring workflow |
| [generated/CONTENT_REFERENCE.md](./generated/CONTENT_REFERENCE.md) | Shipped ingredients, techniques, transitions |
