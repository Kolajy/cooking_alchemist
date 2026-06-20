# Plan: Mechanic Discovery Popup Modal

Introduce a beautiful, premium discovery popup modal for main actions and subactions (techniques). This ensures players are immediately notified and celebrate their gameplay unlocks with a rich popup, rather than a transient toast.

## Proposed Changes

### UI & Styling

#### [MODIFY] [index.html](file:///Users/kolajy/pg/cooking/web/src/index.html)
Add a `<dialog id="mechanic-discovery-dialog">` modal markup to display newly discovered mechanics (main actions and subactions) with high-quality visual representation (sparkles, name, description, emoji, and "Begin Using!" button).

#### [MODIFY] [dom.ts](file:///Users/kolajy/pg/cooking/web/src/game/dom.ts)
Expose the new dialog elements in the `queryDom()` mapping:
- `mechanicDiscoveryDialog`
- `mechanicSparkles`
- `mechanicKicker`
- `mechanicTitle`
- `mechanicEmoji`
- `mechanicName`
- `mechanicDescription`
- `btnMechanicOk`

#### [MODIFY] [types/index.ts](file:///Users/kolajy/pg/cooking/web/src/types/index.ts)
Extend `GameDom` to include the new DOM fields.

---

### Logic & State Management

#### [MODIFY] [discovery.ts](file:///Users/kolajy/pg/cooking/web/src/game/ui/discovery.ts)
- Modify the queue logic to handle a union type: `QueueEntry = IngredientEntry | MechanicEntry`.
- Refactor the queue consumer `pumpDiscoveryQueue` and the dismiss logic to cleanly alternate between showing the ingredient dialog and the new mechanic dialog.
- Export `queueMechanicDiscovery(id, name, emoji, desc, isSubaction)` to queue mechanic notifications.

#### [MODIFY] [notifications.ts](file:///Users/kolajy/pg/cooking/web/src/game/progression/notifications.ts)
Replace the simple fading toasts for main action unlocks and technique/skill unlocks with calls to the new `queueMechanicDiscovery` function.

## Verification Plan

### Automated Tests
- Run `npm run test` to verify that there are no compilation or logic errors.

### Manual Verification
- Reset game progress, discover items, and check that when the first milestone (3 discoveries) unlocks Fruits and the main action **Force** (and its starting technique **Smash**), the new modal discovery popups show sequentially.
