# Culinary Alchemy — Desktop (Steam)

**Native desktop client** for Steam — no embedded webview.

## Run locally

```bash
npm run steam:dev
```

Exports JSON assets from `content/` via `scripts/export_native_bundle.ts`, then runs the egui app (`culinary-desktop`).

## Release build

```bash
npm run steam:build
```

Binary: `target/release/culinary-alchemy`

## Architecture

| Crate | Role |
|-------|------|
| `core/` | `GameRuntime` — combine/technique, XP, achievements, saves |
| `desktop/` | egui/winit native UI |

`GameRuntime` loads `core/assets/game_bundle.json` and `transitions.json`, including `achievements` and `achievementRules`. Action results include `new_achievement_ids` when trophies unlock.

## Steamworks (planned)

- Map in-game achievement `steamId` fields → Steam partner achievements
- Cloud sync for portable save JSON (see `docs/DATA_SCHEMA.md`)
- Rust `steamworks` crate in `desktop/` — not yet wired

See `skills/steam_porting/SKILL.md` for the full release checklist.
