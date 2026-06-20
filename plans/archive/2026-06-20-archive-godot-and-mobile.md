# Archive Godot and Mobile Versions

This plan details the steps to archive the Godot, iOS, and Android versions of the game by moving their directories to a root `archive/` folder and cleaning up scripts/configurations referencing them.

## Proposed Changes

### Configuration and Build Scripts

#### [MODIFY] [export_native_bundle.ts](file:///Users/kolajy/pg/cooking/scripts/export_native_bundle.ts)
- Remove export targets for iOS, Android, and Godot.
- Only export to `core/assets` and `web/src/public/game`.
- Clean up directory creation (`mkdirSync`) and file writing (`writeFileSync`) for the archived platforms.

#### [MODIFY] [package.json](file:///Users/kolajy/pg/cooking/package.json)
- Remove `ios:*` and `android:*` script commands.
- Remove references in the description or comments if necessary.

### Directory Migration

#### [MOVE] `godot/` -> `archive/godot/`
- Move the Godot project source to the archive directory.

#### [MOVE] `godot_web_dist/` -> `archive/godot_web_dist/`
- Move the Godot web build distribution to the archive directory.

#### [MOVE] `android/` -> `archive/android/`
- Since `android` is a git submodule, we should move it cleanly. We will deinitialize/remove it from active git submodules, and move its contents to `archive/android`.

#### [MOVE] `ios/` -> `archive/ios/`
- Deinitialize/remove `ios` from active git submodules, and move its contents to `archive/ios`.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure the project still builds cleanly without attempting to write to the missing/archived directories.
- Run `git status` to verify the new layout and clean untracked state.
