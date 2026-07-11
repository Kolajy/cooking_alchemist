# Active Plan - Remove Rust-Based Infrastructure

This plan outlines the removal of legacy Rust-based components (`core`, `desktop`, `wasm`) and Cargo configurations since the desktop platform has migrated entirely to Electron.

## Proposed Changes

### Deletions

#### [DELETE] Root Rust Configuration Files
- Remove [Cargo.toml](file:///Users/kolajy/pg/cooking/Cargo.toml)
- Remove `Cargo.lock`

#### [DELETE] Root Rust Assets & Build Output
- Remove [core/](file:///Users/kolajy/pg/cooking/core) directory (which only contains the generated JSON assets in `core/assets`)

#### [DELETE] Legacy Archived Rust Code
- Remove `archive/core/`
- Remove `archive/desktop/`
- Remove `archive/wasm/`

---

### Modifications

#### [MODIFY] [scripts/export_native_bundle.ts](file:///Users/kolajy/pg/cooking/scripts/export_native_bundle.ts)
- Remove references and write operations to the `core/assets` directory.
- Ensure the script only generates the JSON bundles into the `web/src/public/game` directory.

#### [MODIFY] [package.json](file:///Users/kolajy/pg/cooking/package.json)
- Update description to remove "native Steam (egui)" reference.

#### [MODIFY] [agents_config.py](file:///Users/kolajy/pg/cooking/agents_config.py)
- Update the system instructions for the `porting` agent to refer to Electron packaging instead of `egui` + `Rust` / `steamworks` Rust crate.

#### [MODIFY] [agents.md](file:///Users/kolajy/pg/cooking/agents.md)
- Update the "Steam Integration & Packaging Agent" description.
- Remove `core/` and `desktop/` from the Directory Structure diagram.
- Remove references to `cargo test` and `steam:dev` from the workflow and scoping sections.

#### [MODIFY] [skills/steam_porting/SKILL.md](file:///Users/kolajy/pg/cooking/skills/steam_porting/SKILL.md)
- Rewrite to focus on the Electron-based porting, packaging (electron-builder), and future JS-based Steamworks integrations instead of Rust egui.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify the project and its Web assets compile and bundle successfully.
- Check that `npm run export-native` no longer tries to write to the non-existent `core/assets` path but still correctly populates the Web public assets.
