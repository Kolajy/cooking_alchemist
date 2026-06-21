# Start Menu UX Polish

This plan addresses feedback regarding the Start Menu usability and sizes:
- Simplifying the menu options to: **Continue**, **New Game**, **Load Game**, and **Settings**.
- Improving the slot selection flow (distinguishing between entering to start a New Game vs. Loading a Game).
- Renaming "Back to Menu" to a simpler "← Back".
- Reducing the overall size of the menu container to be more compact (`max-width: 440px`).

## Proposed Changes

### UI & Sizing
- **[MODIFY] [start-menu.css](file:///Users/kolajy/pg/cooking/web/src/styles/start-menu.css)**: Reduce `max-width` from `620px` to `440px`, and shrink font sizes, margins, and padding.
- **[MODIFY] [index.html](file:///Users/kolajy/pg/cooking/web/src/index.html)**: Rename/add the main menu buttons to match the standard UX.

### Logic Polish
- **[MODIFY] [start-menu.ts](file:///Users/kolajy/pg/cooking/web/src/game/ui/start-menu.ts)**:
  - Wire up Continue, New Game, Load Game, and Settings.
  - Track whether user is in "New Game" mode or "Load Game" mode when choosing slots.
  - In "New Game" mode, slot actions show "Start New" (or warn if overwriting a populated slot).
  - In "Load Game" mode, slot actions show "Load Game" (and show empty slots as "Empty").
