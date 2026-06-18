#!/usr/bin/env bash
# Point submodules at real hosted remotes after creating empty repos on GitHub/GitLab.
# Usage: ./scripts/set_submodule_remotes.sh git@github.com:myorg
#        ./scripts/set_submodule_remotes.sh https://github.com/myorg
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PREFIX="${1:?Usage: $0 <remote-prefix> e.g. git@github.com:myorg}"

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
  url="${PREFIX}/${name}.git"
  if git config -f .gitmodules --get "submodule.${path}.url" >/dev/null 2>&1; then
    git submodule set-url "$path" "$url"
    echo "set $path -> $url"
  fi
done

git add .gitmodules
git commit -m "Point submodules at hosted remotes" || echo "No .gitmodules changes to commit"

echo ""
echo "Push each bare repo to its remote (one-time), e.g.:"
echo "  git -C .git-submodule-bare/content.git push --mirror ${PREFIX}/culinary-content.git"
