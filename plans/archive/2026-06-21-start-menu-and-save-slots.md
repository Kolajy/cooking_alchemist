# Start Menu & Multiple Save Slots

This plan details the implementation of a beautiful, consistent, and highly functional Start Menu at launch. It introduces slot-based local storage keys (supporting 3 slots) with full backwards compatibility/migration for existing players.

## Proposed Changes

### Save Slots System
1. **[NEW] [slots.ts](file:///Users/kolajy/pg/cooking/web/src/game/slots.ts)**:
   - Provide helper functions to get current slot, set current slot, and obtain slot metadata.
   - Detect legacy save keys (`culinary_discovered`, `culinary_progression`, `culinary_achievements`) and automatically migrate them to Slot 1 if Slot 1 is empty.
   - Functions: `getCurrentSlot()`, `setCurrentSlot(slotId)`, `getSlotKeys(slotId)`, `getSlotInfo(slotId)`, `deleteSlot(slotId)`, `migrateLegacySave()`.
2. **[MODIFY] [persistence.ts](file:///Users/kolajy/pg/cooking/web/src/game/persistence.ts)**:
   - Change `loadProgress()` and `saveProgress()` to use slot-specific localStorage keys: `culinary_${slotId}_discovered`.
3. **[MODIFY] [progression.ts](file:///Users/kolajy/pg/cooking/web/src/progression.ts)**:
   - Change `load()` and `save()` to use slot-specific localStorage keys: `culinary_${slotId}_progression`.
4. **[MODIFY] [achievements.ts](file:///Users/kolajy/pg/cooking/web/src/game/progression/achievements.ts)**:
   - Change `loadAchievements()` and `saveAchievements()` to use slot-specific localStorage keys: `culinary_${slotId}_achievements`.

### UI & Start Menu Layout
1. **[MODIFY] [index.html](file:///Users/kolajy/pg/cooking/web/src/index.html)**:
   - Insert the Start Menu overlay HTML container (`#start-menu-overlay`) at the beginning of `<body>`.
   - The menu contains the title, subtitles, Continue button, Play/Slots button, and Settings button.
   - Include a Slots Panel modal/view listing the 3 slots, details, load button, and delete/reset buttons.
2. **[NEW] [start-menu.css](file:///Users/kolajy/pg/cooking/web/src/styles/start-menu.css)**:
   - Aesthetic styles matching cozy hearth / parchment design.
   - Glassmorphism overlay blurs the background.
   - Button animations, slot cards.
3. **[NEW] [start-menu.ts](file:///Users/kolajy/pg/cooking/web/src/game/ui/start-menu.ts)**:
   - Initialize Start Menu UI event listeners.
   - Handle continue, slot selection, slot delete, new game confirmations.
4. **[MODIFY] [index.css](file:///Users/kolajy/pg/cooking/web/src/styles/index.css)**:
   - Import `start-menu.css`.
5. **[MODIFY] [events.ts](file:///Users/kolajy/pg/cooking/web/src/game/ui/events.ts)**:
   - Initialize Start Menu when game starts instead of booting the workspace directly.
