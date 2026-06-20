# Godot Header Design Parity

## Goal
Bring the Godot header in line with the web client's branded header (header.css / index.html).

## Web reference
- Logo emoji 🍳 with radial glow
- Title "Culinary Alchemy" (Cinzel / display font)
- Tagline "A cozy hearth of discoveries" (Caveat / charm font)
- Stats pill: "📖 Ledger Restored: X%" (rounded cream pill)
- Decorative divider under header: ✦ ─── ❧ ─── ✦
- Actions pushed to the right

## Changes
1. `godot/scenes/workspace.tscn` — added LogoEmoji + LogoText (Title + Tagline) and an
   expanding `HeaderSpacer` at the start of `HeaderBar`; restyled `LedgerProgressLabel` to
   "📖 Ledger Restored: X%"; added a centered `HeaderFlourish` divider label; grew header height.
2. `godot/scripts/workspace.gd`
   - `update_progress_ui()` wording → "📖 Ledger Restored: X%".
   - Added `_style_header_branding()` (display font + ink title, charm + tan tagline,
     rounded cream pill for the ledger label, faint flourish color) called from `_style_workspace()`.
   - `_layout_workspace_chrome()` repositions `HeaderFlourish` to the workspace width on resize.

## Validation
- `godot --headless --rendering-driver dummy --audio-driver Dummy --quit-after 120` → exit 0,
  database + theme load, no script/parse errors.

## Status
Completed.
