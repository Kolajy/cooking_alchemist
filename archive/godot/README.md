# Culinary Alchemy — Godot Client

Native Godot 4 client for **Culinary Alchemy**, targeting visual and gameplay parity with the web game.

## Prerequisites

- [Godot 4.2+](https://godotengine.org/download) (project tested on 4.7)
- Node.js (for refreshing shared game data from `content/`)

## Refresh game data

Authoring lives in `content/` at the repo root. After content changes, export bundles to all native targets including Godot:

```bash
cd ..   # repo root
npm run export-native
```

This writes `game_bundle.json` and `transitions.json` into `godot/data/`.

## Run locally

1. Open `godot/project.godot` in the Godot editor, or:
2. From this directory:

```bash
godot --path . 
```

Headless smoke check:

```bash
godot --headless --quit-after 3
```

## Export builds

Presets are defined in `export_presets.cfg`:

| Preset | Output |
|--------|--------|
| Web | `../godot_web_dist/index.html` |
| macOS | `../godot_dist/macos/Culinary Alchemist.app` |
| Linux | `../godot_dist/linux/culinary-alchemy.x86_64` |
| Windows Desktop | `../godot_dist/windows/Culinary Alchemist.exe` |

Export from the editor (**Project → Export**) or CLI:

```bash
godot --headless --export-release "macOS" ../godot_dist/macos/Culinary\ Alchemist.app
```

## Save location

Progress is stored at `user://culinary_discovered.json` (Godot user data dir). Settings and import/export use the portable save format shared with the web client.

## Keyboard shortcuts

Press `?` in-game for the full list. Highlights:

- `1–5` — cooking methods
- `M` — progress map
- `B` — recipe book
- `,` — settings
- `S` — mute/unmute (header 🔊 button too)
- Hover pantry items or counter tokens for ingredient detail cards
- Drag pantry items onto the counter (or click to spawn at cursor)
- Filter pantry: click chips to include, shift-click to exclude; `:recent` and property tags in search

## Fonts

Bundled web fonts live in `assets/fonts/` (woff2). System fallbacks apply if files are missing.
