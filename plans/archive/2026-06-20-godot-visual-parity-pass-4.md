# Godot Visual Parity Pass 4 (tokens, toolbar, modals)

## Changes
- `ingredient_token.tscn` + `ingredient_token.gd` — compact 88×88 counter cards with large
  emoji, name label, and colored state dot (matches pantry + web canvas tiles).
- `cozy_theme.gd` — `apply_toolbar_button`, `make_locked_toolbar_button`,
  `apply_standard_modal` helpers.
- `workspace.gd` — unified toolbar refresh with lock icons/thresholds, muted locked styling,
  charm font on workspace hint + action bar title, guide note typography.
- `main.gd` — skip `toolbar_btn` group from generic button theming; protect token Dot panel.
- `pantry_ui.gd` — uppercase tab labels, ember active underline + subtle tab background.
- `settings_dialog.gd` + `help_dialog.gd` — cream parchment modal chrome + primary CTA button.

## Validation
- Headless load exit 0, no script errors.

## Status
Completed.
