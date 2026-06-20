# Godot Visual Parity Pass 3 (modals + chrome)

## Goal
Close major visual gaps vs web screenshots: cream discovery modals, header layout,
pantry search/filters, workspace tools.

## Changes
- `cozy_theme.gd` — discovery modal backdrop/card/item-box/exp/tip styles, primary CTA,
  map CTA (green), icon circle buttons, search field, filter chips, technique strip.
- `discovery_popup.tscn` + `discovery_popup.gd` — restructured to web layout (kicker,
  modal title, item highlight box, exp panel, Did You Know block, Cook Onwards CTA);
  cream parchment card instead of dark panel.
- `workspace.tscn` + `workspace.gd` — header order matches web (ledger → icon buttons →
  Recipe Book → Progress Map); Undo/Clear moved to top-right workspace tools; green Map CTA;
  technique strip on action bar.
- `pantry_ui.gd` — light search field, filter pill styling, display-font pantry header.

## Validation
- Headless load exit 0, no script errors.

## Status
Completed.
