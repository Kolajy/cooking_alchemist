# Culinary Alchemy — iOS

**Native SwiftUI client** — no `WKWebView`. Game logic runs in `GameEngine.swift` against bundled JSON assets exported from the shared `content/` package.

## Prerequisites

- Xcode 15+ with iOS 16 SDK
- Node.js (for asset export)

## Export game assets

```bash
npm run ios:assets
```

This writes `game_bundle.json` and `transitions.json` to `CulinaryAlchemy/Resources/game/`. The bundle includes achievements and achievement rules.

## Open in Xcode

```bash
open ios/CulinaryAlchemy.xcodeproj
```

Select the **CulinaryAlchemy** scheme, pick a simulator or device, and run.

### First-time setup

1. Set your **Development Team** in Signing & Capabilities.
2. Re-run `npm run ios:assets` when `content/` or progression config changes.

## Layout

```
ios/
├── CulinaryAlchemy.xcodeproj/
├── CulinaryAlchemy/
│   ├── CulinaryAlchemyApp.swift
│   ├── ContentView.swift
│   ├── GameView.swift           # SwiftUI kitchen UI
│   ├── GameEngine.swift         # Game runtime (combine, technique, XP, saves)
│   ├── AchievementEngine.swift  # Shared achievement rule evaluation
│   ├── Info.plist
│   └── Resources/game/          # exported JSON (game_bundle + transitions)
```

## Runtime parity

| Feature | Status |
|---------|--------|
| Combine / technique / separation | ✅ |
| Skill XP + unlock trees | ✅ |
| Discovery journal | ✅ |
| Portable save export/import (v1 JSON) | ✅ |
| Achievements (18 trophies, rule engine) | ✅ |
| Achievement save round-trip | ✅ |
| Trophies sidebar + unlock sheet | ✅ |
| Skill unlock toasts | ✅ |
| Progress map | ⬜ web-only |
| Failure hints | ⬜ web-only |
| Undo | ⬜ web-only |
| Procedural sounds | ⬜ web-only |

Achievement rules match `content/achievement_engine.ts` and `culinary-core::AchievementEngine`. Flags such as `map_opened` and `undo_used` unlock when those features ship on iOS.

The Rust crate `culinary-core` provides an alternate runtime path; linking via FFI is planned for a single binary source of truth.

See [docs/DATA_LAYER.md](../docs/DATA_LAYER.md) for the cross-platform contract.
