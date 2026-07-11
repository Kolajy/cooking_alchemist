# Active Plan - Integrate Steamworks into Electron

Integrate Steamworks API for achievements and overlay support in the Electron desktop shell, allowing the web frontend to unlock Steam achievements via secure Electron IPC channels.

## Proposed Changes

### Configuration

#### [MODIFY] [electron/package.json](file:///Users/kolajy/pg/cooking/electron/package.json)
- Add `"asarUnpack": ["**/node_modules/steamworks.js/**/*"]` under the `"build"` configuration to ensure native libraries are accessible.

#### [CREATE] `steam_appid.txt` and `electron/steam_appid.txt`
- Create both files containing `480` (Valve's Spacewar testing ID) to enable local Steamworks development/testing.

---

### Electron Main Process

#### [MODIFY] [electron/main.js](file:///Users/kolajy/pg/cooking/electron/main.js)
- Import and initialize `steamworks.js` fail-safely.
- Set a periodic interval (100ms) to run Steamworks callbacks.
- Setup an IPC listener for `"steam-unlock-achievement"`.
- Setup an IPC handler for `"steam-get-username"`.

---

### Preload Script

#### [MODIFY] [electron/preload.js](file:///Users/kolajy/pg/cooking/electron/preload.js)
- Expose `unlockAchievement` and `getSteamUsername` on the `culinaryDesktop` object using `contextBridge`.

---

### Web Frontend Integration

#### [MODIFY] [web/src/game/progression/achievements.ts](file:///Users/kolajy/pg/cooking/web/src/game/progression/achievements.ts)
- Update `unlockAchievement` to send the unlocked ID to `window.culinaryDesktop.unlockAchievement` if running in Electron.
- Update `loadAchievements` to sync previously unlocked achievements to Steam upon loading save data.

---

## Verification Plan

### Automated Build Verification
- Run `npm run build` to verify the TypeScript compilation and bundle.
- Launch the Electron app in dev mode (`npm run electron:dev`) to verify it loads without crashing.
- Check logs to confirm Steamworks initializes successfully (or handles fallback gracefully if Steam is not running).
