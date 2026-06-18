---
name: steam-porting
description: "Expert skill in native desktop builds (egui/Rust), compiling for Steam, and integrating Steamworks."
---

# Steam Porting & Native Packaging Skill

This skill covers shipping **Culinary Alchemy** as a native desktop game on Steam — no webview wrapper.

---

## 1. Architecture

| Component | Path | Role |
|-----------|------|------|
| Shared content | `content/` | Ingredients, recipes, progression, achievements (authoring) |
| Shared runtime | `core/` | `GameRuntime`, `AchievementEngine`, JSON assets |
| Desktop UI | `desktop/` | egui/winit native kitchen |
| Data export | `scripts/export_native_bundle.ts` | `content/` → `game_bundle.json` + `transitions.json` |
| Web dev client | `web/` | Vite browser client for rapid iteration only |

**Build commands:**

```bash
npm run export-native    # refresh core/assets + web/ios/android bundles
npm run steam:dev        # export + run egui app
npm run steam:build      # release binary → target/release/culinary-alchemy
npm test                 # TypeScript engine + content validation
cargo test -p culinary-core
```

---

## 2. Asset pipeline

Native clients do **not** bundle `web/dist`. They load exported JSON:

- `game_bundle.json` — starters, discoverable, progression, **achievements**, **achievementRules**
- `transitions.json` — flat technique + combine transitions

Run `npm run export-native` after changing anything under `content/`.

Asset locations after export:

| Platform | Path |
|----------|------|
| Rust / desktop | `core/assets/` |
| Web | `web/src/public/game/` |
| iOS | `ios/CulinaryAlchemy/Resources/game/` |
| Android | `android/app/src/main/assets/game/` |

---

## 3. Achievements

18 trophies are defined in `content/data/achievements.ts` with rules in `achievement_rules.ts`. Each definition may include a `steamId` for Steam partner mapping.

Rust runtime:

```rust
let mut rt = GameRuntime::load(&assets_dir)?;
let result = rt.apply_combine("seeds", "water");
// result.new_achievement_ids may contain "first_combine"
```

Steamworks integration should call `SteamUserStats().setAchievement(steam_id)` when `new_achievement_ids` is non-empty.

---

## 4. Steamworks integration (Rust)

Use the [`steamworks`](https://crates.io/crates/steamworks) crate in `desktop/` (not JS bindings).

Planned hooks:

- Initialize Steam API at app startup
- Map `steamId` from achievement definitions → Steam partner achievements
- Cloud sync for portable save JSON (`docs/DATA_SCHEMA.md`)
- Overlay-friendly window (egui/winit)

Place `steam_appid.txt` beside the binary during local dev (e.g. `desktop/steam_appid.txt`).

---

## 5. Saves

- Web dev client: `localStorage` + portable JSON export
- Native desktop: platform-specific app data directory (TBD — wire in `desktop/`)
- Format: version 1 JSON with `discovery`, `progression`, `achievements`, `settings` — see `docs/DATA_SCHEMA.md`

Saves are designed to be interchangeable across web export and native clients once file I/O is wired.

---

## 6. Release checklist

- [ ] `npm run export-native` run and assets committed or bundled in CI
- [ ] `npm test` and `cargo test -p culinary-core` pass
- [ ] `npm run steam:build` produces binaries for target OSes
- [ ] Achievements defined in Steamworks partner site match `steamId` fields in content
- [ ] Steam depots configured per platform
- [ ] Cloud save path tested (upload/download portable JSON)
