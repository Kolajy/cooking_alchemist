# Godot Pantry Tabs & Visual Fix — 2026-06-20

## Root causes
- Filter rows inserted at index 2 pushed TabBar below filters/footer (tabs off-screen)
- `apply_cozy_theme()` overwrote `IngredientToken` Background panels with flat parchment
- Workspace used flat ColorRect instead of web-like gradient counter

## Fixes
- Pantry layout: Header → TabBar → Search → Filters → TabContents → Footer
- Pantry on CanvasLayer; semi-transparent sidebar panel
- Skip token panels in theme pass; `refresh_token_styles()` after theme
- Workspace gradient surface; origin-tinted pantry cards and tokens
