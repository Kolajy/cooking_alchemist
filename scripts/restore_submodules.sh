#!/usr/bin/env bash
# Recover platform trees from local bare remotes after a failed setup_submodules run.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODULES=(content core web desktop ios android wasm)
BARE_DIR="$ROOT/.git-submodule-bare"

git config protocol.file.allow always

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git add -A
  git commit -m "Monorepo root: orchestration, docs, and scripts"
fi

for mod in "${MODULES[@]}"; do
  bare="$BARE_DIR/${mod}.git"
  if [ ! -d "$bare" ]; then
    echo "missing bare repo for $mod"
    continue
  fi
  if [ -f "$mod/.git" ] && grep -q "gitdir:.*modules" "$mod/.git" 2>/dev/null; then
    echo "$mod already a submodule"
    continue
  fi
  if [ -d "$mod" ]; then
    rm -rf "$mod"
  fi
  git submodule add "file://${bare}" "$mod"
done

git add .gitmodules
git commit -m "Add platform and shared engine submodules" || true
echo "Submodules restored."
