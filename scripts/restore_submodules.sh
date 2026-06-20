#!/usr/bin/env bash
# Recover platform trees from local bare remotes after a failed setup_submodules run.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODULES=(content core web desktop wasm)
BARE_DIR="$ROOT/.git-submodule-bare"
GIT=(git -c protocol.file.allow=always)

if ! "${GIT[@]}" rev-parse --verify HEAD >/dev/null 2>&1; then
  "${GIT[@]}" add -A
  "${GIT[@]}" commit -m "Monorepo root: orchestration, docs, and scripts"
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
  url="file://${bare}"
  "${GIT[@]}" submodule add -b main "$url" "$mod" || {
    echo "submodule add failed for $mod; cloning manually"
    "${GIT[@]}" clone -b main "$url" "$mod"
    "${GIT[@]}" submodule absorbgitdirs "$mod" 2>/dev/null || true
  }
done

if [ ! -f .gitmodules ]; then
  echo "error: .gitmodules was not created"
  exit 1
fi

"${GIT[@]}" add .gitmodules "${MODULES[@]}"
"${GIT[@]}" commit -m "Add platform and shared engine submodules" || true
echo "Submodules restored."
