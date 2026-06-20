# Godot Visual Parity Pass 2 (tabs + token bounds)

## Changes
- `godot/scripts/ingredient_token.gd` — tokens now clamp their target position to the
  workspace bounds each frame (`_clamp_target_to_workspace`), so they can't be dragged
  off-screen or under the pantry.
- `godot/scripts/workspace.gd` — added `get_workspace_bounds()` (inset-based playable rect).
- `godot/scripts/pantry_ui.gd` — pantry tabs restyled to the web look: transparent background,
  copper text + 2px copper underline for the active tab, muted text otherwise
  (`_style_tab`); tabs added to the `pantry_tab` group.
- `godot/scripts/main.gd` — generic button theming now skips `pantry_tab` buttons so the
  custom underline style survives the global theme pass.

## Validation
- `godot --headless --rendering-driver dummy --audio-driver Dummy --quit-after 150` → exit 0,
  no script/parse errors.

## Status
Completed.
