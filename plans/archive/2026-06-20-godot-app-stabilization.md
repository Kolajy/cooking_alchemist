# Godot App Stabilization — 2026-06-20

## Fixes
- Split `active_sidebar_tab` from `active_main_view` (cook/map) — pantry tabs no longer break keyboard shortcuts or map mode
- Skip `WorkspaceSurface` in theme pass; preserve gradient draw via `StyleBoxEmpty`
- `WorkspaceHint` and `GuideNote` use mouse_filter IGNORE so counter tokens remain clickable
- Pantry sidebar re-anchors on viewport resize
- Help dialog marks `seen_help` only when dismissed
