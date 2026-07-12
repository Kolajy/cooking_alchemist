---
name: steam-porting
description: "Expert skill in Electron-based desktop packaging, building for Steam, and configuring desktop integration."
---

# Steam Porting & Electron Packaging Skill

This skill covers shipping **Culinary Alchemy** as a native desktop game on Steam using an Electron-based wrapper.

---

## 1. Architecture

| Component | Path | Role |
|-----------|------|------|
| Shared content | `content/` | Ingredients, recipes, progression, achievements (authoring) |
| Web app | `web/` | Vite frontend game client |
| Electron shell | `electron/` | Electron desktop wrapper |
| Data export | `scripts/export_native_bundle.ts` | Exports content/ to web assets (`web/src/public/game/`) |

**Build commands:**

```bash
npm run export-native    # refresh web public assets from content/
npm run electron:dev     # run Electron app with dev hot-reload
npm run electron:pack    # package Electron app for current platform
npm run electron:build   # build release binaries for all configured targets
npm test                 # run vitest engine + content validation suite
```

---

## 2. Asset Pipeline

The desktop client runs the built web assets located in the app's resources folder. These assets load:

- `game_bundle.json` — starters, unlockables, discoverable, progression config, achievements, and rules.
- `transitions.json` — compiled flat transitions.

Run `npm run export-native` after modifying raw files in `content/` to update both the web client and the packaged assets.

---

## 3. Saves & Persistence

- **Save Location**: Electron uses standard platform-specific app data directories for persistent local storage, isolated from regular web browser cache.
- **Saves Format**: JSON format version 1 containing `discovery`, `progression`, `achievements`, and `settings` (refer to `docs/DATA_SCHEMA.md`).

---

## 4. Steamworks Integration

For Electron apps, Steamworks integration (Steam Overlay, Achievements, Cloud Saves) can be implemented using node bindings like [`steamworks.js`](https://github.com/ceifa/steamworks.js) or similar JavaScript modules running in the main Electron process and exposed to the renderer via `preload.js`.

---

## 5. Release Checklist

- [ ] Run `npm run export-native` and commit/verify generated JSON bundles.
- [ ] Ensure all tests pass via `npm test`.
- [ ] Run `npm run electron:build` to produce production binaries (`out/` directory).
- [ ] Verify window sizes, layout scaling, and fullscreen toggles.
- [ ] Ensure local filesystem storage adapter functions correctly under Electron.
