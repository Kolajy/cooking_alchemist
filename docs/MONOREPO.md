# Monorepo & Git Submodules

The **meta repository** (`culinary-alchemy`) orchestrates builds, docs, and export scripts. Each platform and shared library lives in its **own git repository**, linked as a submodule.

---

## Submodule map

| Path | Repository name | Role |
|------|-----------------|------|
| `content/` | `culinary-content` | Shared authoring — ingredients, recipes, progression |
| `core/` | `culinary-core` | Rust `GameRuntime`, engines, tests |
| `web/` | `culinary-web` | Vite + TypeScript dev client |
| `desktop/` | `culinary-desktop` | Native egui client (Steam) |
| `ios/` | `culinary-ios` | SwiftUI native client |
| `android/` | `culinary-android` | Jetpack Compose native client |
| `wasm/` | `culinary-wasm` | Optional WASM bridge to `culinary-core` |

**Stays in the meta repo (not submodules):** `docs/`, `scripts/`, `skills/`, `agents.md`, root `package.json`, root `Cargo.toml`, CI config.

---

## First-time setup (this machine)

If you cloned before submodules existed, or have a flat checkout:

```bash
chmod +x scripts/*.sh
./scripts/setup_submodules.sh
```

This:

1. Initializes the root git repo (if needed)
2. Creates local bare remotes under `.git-submodule-bare/`
3. Commits each platform tree to its own repo
4. Re-adds them as submodules and writes `.gitmodules`

---

## Clone for development

```bash
git clone --recurse-submodules git@github.com:YOUR_ORG/culinary-alchemy.git
cd culinary-alchemy
npm install
npm run export-native
npm run dev
```

If you already cloned without submodules:

```bash
git submodule update --init --recursive
```

---

## Publish to GitHub / GitLab

1. Create **empty** remote repos (one per row in the table above) plus `culinary-alchemy` for the meta repo.
2. Push submodule histories from local bare remotes:

```bash
./scripts/push_submodules_to_host.sh git@github.com:YOUR_ORG
```

3. Push the meta repo:

```bash
git remote add origin git@github.com:YOUR_ORG/culinary-alchemy.git
git push -u origin main
```

To only update `.gitmodules` URLs without pushing:

```bash
./scripts/set_submodule_remotes.sh git@github.com:YOUR_ORG
```

---

## Day-to-day workflow

### Change content (affects all platforms)

```bash
cd content
# edit files
git add -A && git commit -m "Add recipe …"
git push
cd ..
git add content && git commit -m "Bump content submodule"
```

### Change web only

```bash
cd web
git add -A && git commit -m "Fix graph search"
git push
cd ..
git add web && git commit -m "Bump web submodule"
```

### Export JSON after content changes

Always from the **meta repo root** (needs all submodules checked out):

```bash
npm run export-native
```

### Pull latest everything

```bash
git pull
git submodule update --init --recursive
```

---

## Path dependencies

Submodules stay at fixed paths so existing tooling keeps working:

- `desktop/Cargo.toml` → `culinary-core = { path = "../core" }`
- Root `Cargo.toml` workspace → `core`, `desktop`, `wasm`
- Root npm workspaces → `web`, `content`
- `scripts/export_native_bundle.ts` → writes into `core/`, `web/`, `ios/`, `android/`

Do **not** rename submodule directories without updating these references.

---

## Local bare remotes

`.git-submodule-bare/` holds mirror repos used during initial setup. They are gitignored and safe to delete after you have pushed to a hosted remote — `.gitmodules` will point at GitHub/GitLab instead of `file://` URLs.

---

## Related docs

- [README.md](../README.md) — quick start
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design
- [DATA_LAYER.md](./DATA_LAYER.md) — shared bundle contract
