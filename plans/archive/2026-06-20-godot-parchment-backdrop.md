# Godot Parchment Backdrop Parity

## Goal
Give the Godot client the rustic-fantasy crinkled parchment background the web client has
(`base.css` `.fantasy-backdrop`), replacing the flat parchment sheet.

## Web reference
- Aged amber sepia radial gradient (#F5E6C8 -> #ECD6AC -> #DCBF8D)
- Uneven tonal mottling (amber/brown corner blotches + light center)
- Fine paper grain (fractal turbulence)
- Crinkle / fold creases (diagonal repeating lines + folds)
- Singed manuscript vignette + scorched corners

## Changes
1. `godot/shaders/parchment_backdrop.gdshader` (new) — procedural canvas_item shader
   reproducing the full parchment field: gradient, mottle blotches, fbm aged mottle,
   fine grain, dual diagonal creases + folds, vignette, scorched corners.
2. `godot/scripts/main.gd` `_build_backdrop()` — full-rect ColorRect now uses the shader
   material; removed the flat warmth + flat dark vignette ColorRects (shader handles them);
   motes kept on top.
3. `godot/scripts/main.gd` `_build_scroll_frame()` — panel renamed `ScrollFrame` and styled
   with `CozyTheme.make_scroll_frame()` (transparent fill + subtle rounded border) so the
   textured backdrop shows through instead of being covered by an opaque sheet.
4. `godot/scripts/cozy_theme.gd` — added `make_scroll_frame()`.
5. `godot/scripts/main.gd` `_should_theme_panel()` — excludes `ScrollFrame` from the generic
   opaque-panel theming.

## Validation
- `godot --headless --rendering-driver dummy --audio-driver Dummy --quit-after 120` → exit 0,
  no script errors. (Real-GPU headless crashes in MoltenVK on this machine — environment-only.)

## Status
Completed.
