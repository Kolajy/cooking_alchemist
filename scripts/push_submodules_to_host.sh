#!/usr/bin/env bash
# Mirror local bare submodule remotes to hosted git repos (create empty repos first).
# Usage: ./scripts/push_submodules_to_host.sh git@github.com:myorg
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PREFIX="${1:?Usage: $0 <remote-prefix> e.g. git@github.com:myorg}"
BARE_DIR="$ROOT/.git-submodule-bare"

declare -A REPOS=(
  [content]=culinary-content
  [core]=culinary-core
  [web]=culinary-web
  [desktop]=culinary-desktop
  [ios]=culinary-ios
  [android]=culinary-android
  [wasm]=culinary-wasm
)

for path in "${!REPOS[@]}"; do
  name="${REPOS[$path]}"
  bare="$BARE_DIR/${path}.git"
  remote="${PREFIX}/${name}.git"
  if [ -d "$bare" ]; then
    echo "==> $name"
    git push --mirror "$remote"
  else
    echo "skip $path (no bare repo at $bare)"
  fi
done

./scripts/set_submodule_remotes.sh "$PREFIX"
