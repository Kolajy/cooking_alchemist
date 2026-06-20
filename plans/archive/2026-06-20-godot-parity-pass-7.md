# Godot Parity Pass 7 (2026-06-20)

## Completed
- Fixed recipe vs item counts: milestones/action unlocks use finalized recipes only; header uses all discovered items
- Pantry slots show origin/state badges (Primal, Raw, Prepared, Recipe)
- `IngredientUI` helper for shared state labels and badge colors
- Workspace hint cooldown (4.5s) to reduce spam
- Shutdown-safe `_process` guards (backdrop motes, workspace ring, hearth warmth)
- Progress map summary shows recipe count separately
- Headless smoke test passes cleanly
