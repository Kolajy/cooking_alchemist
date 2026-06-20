# Culinary Alchemy — Android

**Native Android client** — Jetpack Compose + Kotlin `GameEngine`, matching the iOS SwiftUI app. No WebView.

## Prerequisites

- [Android Studio](https://developer.android.com/studio) Ladybug (2024.2+) or newer
- JDK 17 (bundled with Android Studio)
- Node.js (for asset export from `content/`)

## Export game assets

From the repo root:

```bash
npm run android:assets
```

Writes `game_bundle.json` and `transitions.json` to `app/src/main/assets/game/`, including achievements and achievement rules.

Re-run whenever `content/` or progression config changes.

## Open in Android Studio

1. **File → Open** → select the `android/` folder.
2. Let Gradle sync finish (Android Studio downloads SDK components on first open).
3. Choose a device or emulator.
4. Click **Run**.

## Command-line build

After Android Studio has installed the SDK (or with `ANDROID_HOME` set):

```bash
# From repo root — exports assets, then builds debug APK
npm run android:build
```

APK output:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Install on a connected device/emulator:

```bash
npm run android:install
```

### First-time CLI setup

If `./gradlew` is missing, generate the wrapper from Android Studio (**Gradle → wrapper**) or install Gradle and run:

```bash
cd android
gradle wrapper --gradle-version 8.9
```

Set `ANDROID_HOME` if needed (macOS default):

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
```

## Layout

```
android/
├── app/src/main/
│   ├── assets/game/          # exported JSON (game_bundle + transitions)
│   ├── java/com/culinaryalchemy/app/
│   │   ├── MainActivity.kt
│   │   ├── GameEngine.kt     # native game logic (parity with iOS)
│   │   └── GameScreen.kt     # Compose kitchen UI
│   └── AndroidManifest.xml
└── README.md
```

## Shared logic

- Assets are exported from `content/` via `scripts/export_native_bundle.ts`.
- `GameEngine.kt` mirrors `ios/CulinaryAlchemy/GameEngine.swift`.
- Rust `culinary-core` provides `GameRuntime` + `AchievementEngine`; linking via JNI/FFI is planned.

## Parity notes

The Android MVP matches the iOS native prototype: cabinet, counter, tool bar, separate/combine/technique matching.

**Web-only until ported:** discovery journal, trophies panel, save export/import, progress map, procedural sounds, failure hints.

See [docs/DATA_LAYER.md](../docs/DATA_LAYER.md) for the cross-platform save and bundle contract.
