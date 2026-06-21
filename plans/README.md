# Culinary Alchemy - Implementation Plans

This directory contains the historic and active implementation plans for the project. Putting plans here ensures they are tracked in git and persist across agent sessions and token resets.

## How to use this directory

1. **Active Plan**: The currently active plan is stored in `plans/active_plan.md`. Before running any modifying commands or making source code edits, the agent must write the detailed architecture, file modification list, and testing strategy there.
2. **Review & Approval**: The user reviews the plan in `plans/active_plan.md` and provides approval in the chat.
3. **Archiving**: Once a feature is complete and verified, move it to the `plans/archive/` directory using the naming convention: `YYYY-MM-DD-feature-name.md` and add it to the index below.

---

## Historical Archive Index

| Date | Plan | Description | Status |
| :--- | :--- | :--- | :--- |
| 2026-06-18 | [decoupled-engines.md](archive/2026-06-18-decoupled-engines.md) | Decoupled combination/progression rules into DOM-free engine modules with CLI unit testing. | Completed |
| 2026-06-18 | [fireplace-audio.md](archive/2026-06-18-fireplace-audio.md) | Replaced synthetic hearth ambience with a looping pre-recorded MP3 and a volume fade transition. | Completed |
| 2026-06-19 | [steamed-fish.md](archive/2026-06-19-steamed-fish.md) | Added whole fish, soy sauce, oil-pressing, ginger/scallion prep, and Cantonese Steamed Fish transitions. | Completed |
| 2026-06-19 | [simplified-actions.md](archive/2026-06-19-simplified-actions.md) | Simplified cooking toolbar to 5 main actions (adding Time) and automated subaction matching. | Completed |
| 2026-06-19 | [progression-alignment.md](archive/2026-06-19-progression-alignment.md) | Aligned skill chains with historical culinary discovery and removed unused intermediate nodes. | Completed |
| 2026-06-19 | [thermal-expansion-and-recipes.md](archive/2026-06-19-thermal-expansion-and-recipes.md) | Expanded thermal techniques (pit cooking, hearth baking, smoking) and added matching recipes. | Completed |
| 2026-06-19 | [stone-age-foods.md](archive/2026-06-19-stone-age-foods.md) | Added Stone Age recipes (ash cakes, stone-boiled stews, nut pastes, roasted seeds) resolving unused intermediates. | Completed |
| 2026-06-19 | [100-world-cuisine-dishes.md](archive/2026-06-19-100-world-cuisine-dishes.md) | Added 100 global culinary dishes spanning major world regions and universal/ancient classics. | Completed |
| 2026-06-19 | [properties-validation-fix.md](archive/2026-06-19-properties-validation-fix.md) | Fixed ingredient properties validation failures for beans and rice_flour. | Completed |
| 2026-06-19 | [enforce-pack-tags.md](archive/2026-06-19-enforce-pack-tags.md) | Enforced pack tags on all ingredients in the exported bundle and validation suite. | Completed |
| 2026-06-19 | [mechanic-discovery-popup.md](archive/2026-06-19-mechanic-discovery-popup.md) | Implemented modal popup dialogs celebrating core action and technique subaction discoveries. | Completed |
| 2026-06-19 | [force-and-time-unlocks.md](archive/2026-06-19-force-and-time-unlocks.md) | Implemented specific custom discovery conditions to unlock the Force and Time player actions. | Completed |
| 2026-06-19 | [swapped-starters-progression.md](archive/2026-06-19-swapped-starters-progression.md) | Swapped Roots/Tubers starter roles and set dynamic cabinet unlocks for Fruits and Tubers on separation. | Completed |
| 2026-06-20 | [grandma-ledger-onboarding.md](archive/2026-06-20-grandma-ledger-onboarding.md) | Restructured progression to use a Grandmother's Ledger restored percentage, and added a sticky guide note onboarding system. | Completed |
| 2026-06-20 | [godot-parity-pass-2.md](archive/2026-06-20-godot-parity-pass-2.md) | Godot client parity: achievement popups, sound toggle, combine graph junctions, README. | Completed |
| 2026-06-20 | [godot-parity-pass-3.md](archive/2026-06-20-godot-parity-pass-3.md) | Discovery sparkles, XP bar in popup, ring pulse, achievement audio fix. | Completed |
| 2026-06-20 | [godot-parity-pass-4.md](archive/2026-06-20-godot-parity-pass-4.md) | Discovery stagger reveal, toolbar feedback, hearth pulse, pantry highlight fade. | Completed |
| 2026-06-20 | [godot-parity-pass-5.md](archive/2026-06-20-godot-parity-pass-5.md) | Hover ingredient cards, highlight pulse, level-up toast path, hint pulse. | Completed |
| 2026-06-20 | [godot-parity-pass-6.md](archive/2026-06-20-godot-parity-pass-6.md) | Milestone pantry unlocks, shipment toasts, contextual hints, unlockables data. | Completed |
| 2026-06-20 | [godot-parity-pass-7.md](archive/2026-06-20-godot-parity-pass-7.md) | Recipe count fix, pantry badges, hint cooldown, shutdown guards. | Completed |
| 2026-06-20 | [godot-parity-pass-8.md](archive/2026-06-20-godot-parity-pass-8.md) | Pantry filters, search tags, journal badges, guide onboarding. | Completed |
| 2026-06-20 | [godot-parity-pass-9.md](archive/2026-06-20-godot-parity-pass-9.md) | Pantry drag-to-counter, map unlockables, shift exclude filters. | Completed |
| 2026-06-20 | [godot-parity-pass-10.md](archive/2026-06-20-godot-parity-pass-10.md) | Multi-include filters, Recent chip, full search tags, drag polish. | Completed |
| 2026-06-20 | [godot-parity-pass-11.md](archive/2026-06-20-godot-parity-pass-11.md) | Pantry search placeholder and sidebar footer hint. | Completed |
| 2026-06-20 | [godot-parity-pass-12.md](archive/2026-06-20-godot-parity-pass-12.md) | Full parity backlog: undo remove, help, toasts, skills/trophies/journal UI. | Completed |
| 2026-06-20 | [godot-parity-pass-13.md](archive/2026-06-20-godot-parity-pass-13.md) | Auto-apply methods, drag thresholds, save validation, achievement toasts. | Completed |
| 2026-06-20 | [google-analytics-setup.md](archive/2026-06-20-google-analytics-setup.md) | GA4 for web client via `VITE_GA_MEASUREMENT_ID`, env loading, gameplay events. | Completed |
| 2026-06-20 | [godot-pantry-visual-fix.md](archive/2026-06-20-godot-pantry-visual-fix.md) | Pantry tab order, sidebar layout, token/card styling, workspace gradient. | Completed |
| 2026-06-20 | [godot-settings-countertop-fix.md](archive/2026-06-20-godot-settings-countertop-fix.md) | Modal layer for settings popup; inset rounded countertop chrome. | Completed |
| 2026-06-20 | [godot-app-stabilization.md](archive/2026-06-20-godot-app-stabilization.md) | Sidebar tab state split, token click-through, theme/countertop fixes. | Completed |
| 2026-06-20 | [godot-header-branding.md](archive/2026-06-20-godot-header-branding.md) | Branded Godot header: logo + title + tagline, Ledger Restored pill, flourish divider. | Completed |
| 2026-06-20 | [godot-parchment-backdrop.md](archive/2026-06-20-godot-parchment-backdrop.md) | Procedural parchment shader backdrop: gradient, mottle, grain, creases, scorched vignette. | Completed |
| 2026-06-20 | [godot-visual-parity-pass.md](archive/2026-06-20-godot-visual-parity-pass.md) | Visible button text, 3-col compact pantry cards w/ state dots, Recipe Book CTA, right-dock + drag fixes. | Completed |
| 2026-06-20 | [godot-visual-parity-pass-2.md](archive/2026-06-20-godot-visual-parity-pass-2.md) | Web-style underline pantry tabs; counter tokens clamped to workspace bounds. | Completed |
| 2026-06-20 | [godot-visual-parity-pass-3.md](archive/2026-06-20-godot-visual-parity-pass-3.md) | Cream discovery/technique modals, header chrome, search/filters, workspace Undo/Clear tools. | Completed |
| 2026-06-20 | [godot-visual-parity-pass-4.md](archive/2026-06-20-godot-visual-parity-pass-4.md) | Compact counter tokens w/ state dots, locked toolbar styling, pantry tab polish, settings/help modals. | Completed |
| 2026-06-20 | [godot-visual-parity-pass-5.md](archive/2026-06-20-godot-visual-parity-pass-5.md) | Centered compact action bar, web-style method chips, hide sub-technique row, 3-col pantry. | Completed |
| 2026-06-20 | [godot-visual-parity-pass-6.md](archive/2026-06-20-godot-visual-parity-pass-6.md) | Readable locked toolbar buttons, hint text fix, active-method highlight, scroll sheet depth. | Completed |
| 2026-06-20 | [electron-port.md](archive/2026-06-20-electron-port.md) | Electron desktop shell wrapping the Vite web game with dev hot-reload and electron-builder packaging. | Completed |
| 2026-06-20 | [archive-godot-and-mobile.md](archive/2026-06-20-archive-godot-and-mobile.md) | Archived the Godot project, Godot web build distribution, iOS submodule, and Android submodule to archive/. | Completed |
| 2026-06-20 | [archive-rust-and-merge-web-content.md](archive/2026-06-20-archive-rust-and-merge-web-content.md) | Archived Rust core, native desktop, and wasm, and ingested web and content submodules into the main monorepo. | Completed |
| 2026-06-21 | [start-menu-and-save-slots.md](archive/2026-06-21-start-menu-and-save-slots.md) | Cozy Start Menu overlay with Continue, Save Slot select/delete, and dynamic Slot storage adapter. | Completed |







