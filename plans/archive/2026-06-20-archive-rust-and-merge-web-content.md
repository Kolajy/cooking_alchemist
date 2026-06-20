# Archive Core & Desktop, Merge Web & Content into Main Repo

This plan details the steps to transition the repository from a submodule-based setup to a single unified repository containing the active code directly, while archiving the unused Rust-based platforms (`core`, `desktop`, `wasm`).

## Proposed Changes

### Submodule De-registration and Archiving

#### [MOVE] `core/` -> `archive/core/`
- Clone the static main branch of the `core` submodule into `archive/core` and strip git metadata.
- Deinitialize and remove `core` as a submodule.

#### [MOVE] `desktop/` -> `archive/desktop/`
- Clone the static main branch of the `desktop` submodule into `archive/desktop` and strip git metadata.
- Deinitialize and remove `desktop` as a submodule.

#### [MOVE] `wasm/` -> `archive/wasm/`
- Clone the static main branch of the `wasm` submodule into `archive/wasm` and strip git metadata.
- Deinitialize and remove `wasm` as a submodule.

### Submodule Merging (Ingesting into Main Repo)

#### [MODIFY] `web/` and `content/`
- We will deinitialize the submodules `web` and `content`.
- Clone their contents into the local working directory (replacing the submodule references).
- Commit the folders and all their files directly into the `cooking_alchemist` main repository as normal tracked files.

### Configuration & Scripts Cleanups

#### [DELETE] `.gitmodules`
- Delete the `.gitmodules` file since there will be no active submodules left.

#### [MODIFY] [package.json](file:///Users/kolajy/pg/cooking/package.json)
- Remove `desktop:dev`, `desktop:build`, `steam:dev`, `steam:build` scripts.
- Remove all `submodules:*` commands.
- Update the description to reflect the new structure.

#### [DELETE] Submodule Helper Scripts
- Delete `scripts/setup_submodules.sh`, `scripts/restore_submodules.sh`, `scripts/set_submodule_remotes.sh`, and `scripts/push_submodules_to_host.sh` since submodules are removed.

---

## Verification Plan

### Automated Tests
- Verify the project builds cleanly by running `npm run build`.
- Check git status to ensure `web/` and `content/` files are fully tracked by git.
