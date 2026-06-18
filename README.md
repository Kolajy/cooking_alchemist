# Culinary Alchemy

An educational ingredient-discovery cooking game. Experiment on a kitchen counter with real techniques (separate, smash, heat, combine) to unlock ingredients, dishes, and trophies.

**Monorepo layout:** shared content and engines as **git submodules**, web dev client, native shipping targets. See [docs/MONOREPO.md](docs/MONOREPO.md).

```bash
git clone --recurse-submodules <repo-url>
cd culinary-alchemy
npm install
```

If submodules are missing: `npm run submodules:sync`

---

## Quick start

```bash
npm install
cp .env.example .env   # optional — agent tooling only

npm run dev            # web game → https://localhost:5173
npm test               # engine + content + save validation
npm run export-native  # refresh JSON bundles + content reference docs
```

**Native desktop (egui):** `npm run steam:dev`  
**iOS assets:** `npm run ios:assets` → open `ios/CulinaryAlchemy.xcodeproj`  
**Android:** `npm run android:build`

---

## Repository structure

Meta repo (`culinary-alchemy`) + **git submodules** (each platform is its own repo):

```
cooking/                 # meta repo — orchestration, docs, scripts
├── content/             # submodule → culinary-content
├── core/                # submodule → culinary-core
├── web/                 # submodule → culinary-web
├── desktop/             # submodule → culinary-desktop
├── ios/                 # submodule → culinary-ios
├── android/             # submodule → culinary-android
├── wasm/                # submodule → culinary-wasm (optional web bridge)
├── scripts/             # export_native_bundle.ts, submodule setup
├── docs/                # Architecture, schema, MONOREPO.md
└── skills/              # Agent skill packs
```

First-time submodule setup on a flat checkout: `npm run submodules:init`

Authoring lives in **`content/`**, not `web/src/`. Run `npm run export-native` after content changes.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, modules, boot flow |
| [docs/DATA_LAYER.md](docs/DATA_LAYER.md) | Shared bundle, save format, per-platform APIs |
| [docs/DATA_SCHEMA.md](docs/DATA_SCHEMA.md) | Ingredient, progression, achievement schemas |
| [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) | Player-facing design intent |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phases, status, next steps |
| [docs/ART_DIRECTION.md](docs/ART_DIRECTION.md) | Visual identity |
| [docs/RECIPES_REFERENCE.md](docs/RECIPES_REFERENCE.md) | Historical recipe inspiration catalog |
| [docs/generated/CONTENT_REFERENCE.md](docs/generated/CONTENT_REFERENCE.md) | **Shipped** ingredients, techniques, transitions (auto-generated) |
| [docs/MONOREPO.md](docs/MONOREPO.md) | Git submodules, clone, publish remotes |
| [content/README.md](content/README.md) | Content authoring workflow |

---

## Current snapshot

| Area | Status |
|------|--------|
| Core loop (separate, combine, smash, char) | ✅ |
| 66 discoverable items, 5 finalized recipes | ✅ |
| Shared `content/` package + `npm run export-native` | ✅ |
| 18 global achievements (TS + Rust rule engines) | ✅ |
| Web: discovery journal, trophies, hints, sounds, save export | ✅ |
| Rust `GameRuntime` + native desktop MVP | ✅ |
| iOS / Android native scaffolds | 🟡 |
| Steamworks (achievements sync, cloud saves) | ⬜ |

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full phase plan.
