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




