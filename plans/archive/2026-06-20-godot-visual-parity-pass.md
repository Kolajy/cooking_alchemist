# Godot Visual Parity Pass (buttons + pantry cards)

## Goal
Close the visual gap with the web client after side-by-side screenshots.

## Issues found
1. All non-selected buttons rendered as empty boxes — `apply_button()` removed the
   `font_color` override, falling back to Godot's near-white default (invisible on light
   parchment surfaces).
2. Pantry cabinet used 2 wide cards with a bottom text badge; web uses 3 compact cards with a
   large centered emoji, small name, and a colored state dot in the top-right corner.
3. "Recipe Book" was a plain button; web styles it as a filled copper call-to-action.

## Changes
- `godot/scripts/cozy_theme.gd`
  - `apply_button()` non-selected branch sets dark-ink `font_color` / hover / focus +
    muted disabled color.
  - Brightened `make_button_normal()` / `make_button_hover()` to crisp warm-cream cards.
- `godot/scenes/pantry_item_slot.tscn` — redesigned into a compact card: background Button +
  centered Emoji label + bottom Name label + top-right Dot panel.
- `godot/scripts/pantry_item_slot.gd` — `setup()` populates emoji/name/dot (dot color from
  `IngredientUI.badge_color`); removed the old single-button text + badge.
- `godot/scripts/pantry_ui.gd` — cabinet grid now 3 columns; empty state collapses to 1 col.
- `godot/scripts/workspace.gd` — `_style_cta_button()` styles `BtnLedgerBook` as a filled
  copper pill with cream text.
- `godot/scripts/main.gd` — `_should_theme_panel()` skips panels inside `pantry_slot`
  (protects the colored dot from the global theme pass).

## Validation
- `godot --headless --rendering-driver dummy --audio-driver Dummy --quit-after 150` → exit 0,
  no script/parse errors.

## Status
Completed.
