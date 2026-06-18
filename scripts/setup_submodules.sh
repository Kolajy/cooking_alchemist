#!/usr/bin/env bash
# Convert platform directories into git submodules with local bare remotes.
# Run once from the monorepo root: ./scripts/setup_submodules.sh
#
# After pushing bare repos to GitHub/GitLab, run:
#   ./scripts/set_submodule_remotes.sh git@github.com:YOUR_ORG
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODULES=(content core web desktop ios android wasm)
BARE_DIR="$ROOT/.git-submodule-bare"
STAGING_ROOT="$ROOT/.submodule-staging"

RSYNC_EXCLUDES=(
  --exclude node_modules
  --exclude target
  --exclude dist
  --exclude .gradle
  --exclude build
  --exclude .idea
  --exclude local.properties
  --exclude .DS_Store
  --exclude "*.log"
)

copy_module() {
  local mod="$1"
  local src="$ROOT/$mod"
  local dest="$STAGING_ROOT/$mod"
  rm -rf "$dest"
  mkdir -p "$dest"
  rsync -a "${RSYNC_EXCLUDES[@]}" "$src/" "$dest/"
}

init_bare_and_push() {
  local mod="$1"
  local bare="$BARE_DIR/${mod}.git"
  local work="$STAGING_ROOT/$mod"

  if [ ! -d "$bare" ]; then
    git init --bare "$bare" >/dev/null
  fi

  cd "$work"
  if [ ! -d .git ]; then
    GIT_CONFIG_COUNT=0 git -c init.defaultBranch=main init >/dev/null
  fi
  git add -A
  if git diff --cached --quiet; then
    echo "  $mod: no changes to commit in staging"
  else
    git commit -m "Initial ${mod} module import" >/dev/null
  fi
  git branch -M main 2>/dev/null || true
  git remote remove origin 2>/dev/null || true
  git remote add origin "$bare"
  git push -u origin main --force
  cd "$ROOT"
}

echo "==> Culinary Alchemy monorepo submodule setup"
mkdir -p "$BARE_DIR" "$STAGING_ROOT"

if [ ! -d .git ]; then
  GIT_CONFIG_COUNT=0 git -c init.defaultBranch=main init
  echo "Initialized root repository"
fi

git config protocol.file.allow always

echo "==> Staging module trees"
for mod in "${MODULES[@]}"; do
  if [ ! -d "$ROOT/$mod" ]; then
    echo "Skip missing module: $mod"
    continue
  fi
  # Skip if already registered as submodule
  if [ -f "$ROOT/$mod/.git" ] && grep -q "gitdir:.*modules" "$ROOT/$mod/.git" 2>/dev/null; then
    echo "  $mod already a submodule — skipping staging"
    continue
  fi
  echo "  staging $mod"
  copy_module "$mod"
done

echo "==> Publishing module repos to local bare remotes"
for mod in "${MODULES[@]}"; do
  if [ ! -d "$STAGING_ROOT/$mod" ]; then
    continue
  fi
  echo "  publishing $mod"
  init_bare_and_push "$mod"
done

echo "==> Committing monorepo root (orchestration only)"
cd "$ROOT"
for mod in "${MODULES[@]}"; do
  if [ -d "$ROOT/$mod" ] && ! grep -q "gitdir:.*modules" "$ROOT/$mod/.git" 2>/dev/null; then
    rm -rf "$ROOT/$mod"
  fi
done

git add -A
if ! git diff --cached --quiet; then
  git commit -m "Monorepo root: orchestration, docs, and scripts" || true
fi

echo "==> Adding submodules"
cd "$ROOT"
git config protocol.file.allow always
for mod in "${MODULES[@]}"; do
  bare="$BARE_DIR/${mod}.git"
  if [ ! -d "$bare" ]; then
    continue
  fi
  if [ -f "$ROOT/$mod/.git" ] && grep -q "gitdir:.*modules" "$ROOT/$mod/.git" 2>/dev/null; then
    echo "  $mod submodule already present"
    continue
  fi
  if [ -d "$ROOT/$mod" ]; then
    rm -rf "$ROOT/$mod"
  fi
  git submodule add "file://${bare}" "$mod"
done

git add .gitmodules
if ! git diff --cached --quiet; then
  git commit -m "Add platform and shared engine submodules"
fi

rm -rf "$STAGING_ROOT"
echo ""
echo "Done. Submodule remotes are under .git-submodule-bare/ (local only)."
echo "Clone elsewhere: git clone --recurse-submodules <root-url>"
echo "Publish remotes:  ./scripts/set_submodule_remotes.sh git@github.com:YOUR_ORG"
