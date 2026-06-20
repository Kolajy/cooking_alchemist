# Plan: Grandmother's Ledger Theme & Cozy Onboarding Guide

Implement the "Grandmother's Ledger" completionist theme and add a dynamic, cozy pinned guide note to the workspace to guide new players step-by-step through the opening hours of the game.

## Proposed Changes

### UI & Styling

#### [MODIFY] [index.html](file:///Users/kolajy/pg/cooking/web/src/index.html)
- Change the header progress label from "Discovered: X / Y" to "📖 Ledger Restored: X%".
- Add the `#grandma-guide` sticky note element inside the `#workspace` canvas.

#### [MODIFY] [workspace.css](file:///Users/kolajy/pg/cooking/web/src/styles/workspace.css)
Add CSS styles for `.grandma-guide`, `.grandma-guide__pin`, `.grandma-guide__title`, and `.grandma-guide__text` representing a cozy, hand-written yellow parchment note pinned to the workspace canvas background.

---

### Logic & Onboarding Flow

#### [MODIFY] [persistence.ts](file:///Users/kolajy/pg/cooking/web/src/game/persistence.ts)
- Update `updateStats()` to compute discoveries as a percentage of total possible recipes.
- Update `updateStats()` to dynamically change the onboarding guide text inside `#grandma-guide-text` based on the player's discoveries and action unlocks.

## Verification Plan

### Automated Tests
- Run `npm run test` to verify that there are no compilation or logic errors.

### Manual Verification
- Reset game progress and verify the guide card displays: *"Tap Berries in the Pantry to place them on the counter, then select the Separate action bar button!"*.
- Perform a separation and verify the note dynamically updates.
