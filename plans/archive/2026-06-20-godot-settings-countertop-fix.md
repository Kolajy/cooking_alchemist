# Godot Settings & Countertop Fix — 2026-06-20

## Settings popup
- Root cause: modals on layer 0, pantry on CanvasLayer 10 → hidden behind sidebar
- Fix: modal CanvasLayer (50) for settings/help/discovery/ledger/map
- Styled settings card with parchment panel; backdrop click closes

## Countertop
- Moved surface + ring to UI CanvasLayer with inset margins and 8px rounded panel
- Gradient + radial warmth overlays matching web workspace chrome
