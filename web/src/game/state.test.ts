import { createInitialState } from "./state";

function assert(condition: boolean, message: string) { if (!condition) throw new Error(message); }

const state = createInitialState();

// Core state fields
assert(state.discoveredIds instanceof Set, "discoveredIds should be a Set");
assert(state.discoveredIds.size === 0, "discoveredIds should be empty initially");
assert(Array.isArray(state.discoveryLog), "discoveryLog should be an array");
assert(state.discoveryLog.length === 0, "discoveryLog should be empty initially");
assert(Array.isArray(state.recentlyDiscoveredIds), "recentlyDiscoveredIds should be an array");
assert(state.recentlyDiscoveredIds.length === 0, "recentlyDiscoveredIds should be empty initially");
assert(state.recentHighlightIds instanceof Set, "recentHighlightIds should be a Set");
assert(state.recentHighlightIds.size === 0, "recentHighlightIds should be empty initially");

// History and drag fields
assert(state.undoEntry === null, "undoEntry should be null initially");
assert(Array.isArray(state.activeElements), "activeElements should be an array");
assert(state.activeElements.length === 0, "activeElements should be empty initially");
assert(state.draggedElement === null, "draggedElement should be null initially");
assert(state.dragMoved === false, "dragMoved should be false initially");
assert(typeof state.dragStart.x === "number" && typeof state.dragStart.y === "number", "dragStart should be a coordinate object");
assert(typeof state.dragGrabOffset.x === "number" && typeof state.dragGrabOffset.y === "number", "dragGrabOffset should be a coordinate object");
assert(state.cabinetDrag === null, "cabinetDrag should be null initially");
assert(state.mergeTarget === null, "mergeTarget should be null initially");

// Filters and search
assert(state.searchTerm === "", "searchTerm should be empty string initially");
assert(state.stateFilterIncludes instanceof Set, "stateFilterIncludes should be a Set");
assert(state.stateFilterExcludes instanceof Set, "stateFilterExcludes should be a Set");
assert(state.typeFilterIncludes instanceof Set, "typeFilterIncludes should be a Set");
assert(state.typeFilterExcludes instanceof Set, "typeFilterExcludes should be a Set");

// Active modes
assert(state.activeAction === "move", "activeAction should be 'move' initially");
assert(state.activeSkillId === null, "activeSkillId should be null initially");
assert(state.activeSidebarTab === "cabinet", "activeSidebarTab should be 'cabinet' initially");
assert(state.activeMainView === "cook", "activeMainView should be 'cook' initially");

// Graph UI
assert(state.graphFocusIngredientId === null, "graphFocusIngredientId should be null initially");
assert(state.graphFocusDepth === 2, "graphFocusDepth should be 2 initially");
assert(state.graphSearchTerm === "", "graphSearchTerm should be empty initially");

// Notifications
assert(state.notifiedForceUnlock === false, "notifiedForceUnlock should be false initially");
assert(state.notifiedCombineUnlock === false, "notifiedCombineUnlock should be false initially");
assert(state.notifiedChangeUnlock === false, "notifiedChangeUnlock should be false initially");
assert(state.notifiedTimeUnlock === false, "notifiedTimeUnlock should be false initially");

// Achievements
assert(state.achievementUnlocks instanceof Map, "achievementUnlocks should be a Map");
assert(state.achievementFlags instanceof Set, "achievementFlags should be a Set");

console.log("=== STATE TESTS PASSED ===");
