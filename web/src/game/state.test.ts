import { createInitialState } from "./state";
import type { GameState } from "../types";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function testCreateInitialState() {
  const state: GameState = createInitialState();

  // Test basic instantiation
  assert(state !== null && typeof state === "object", "State should be an object");

  // Test Set properties
  assert(state.discoveredIds instanceof Set, "discoveredIds should be a Set");
  assert(state.discoveredIds.size === 0, "discoveredIds should be empty");

  assert(state.recentHighlightIds instanceof Set, "recentHighlightIds should be a Set");
  assert(state.recentHighlightIds.size === 0, "recentHighlightIds should be empty");

  assert(state.stateFilterIncludes instanceof Set, "stateFilterIncludes should be a Set");
  assert(state.stateFilterIncludes.size === 0, "stateFilterIncludes should be empty");

  assert(state.stateFilterExcludes instanceof Set, "stateFilterExcludes should be a Set");
  assert(state.stateFilterExcludes.size === 0, "stateFilterExcludes should be empty");

  assert(state.typeFilterIncludes instanceof Set, "typeFilterIncludes should be a Set");
  assert(state.typeFilterIncludes.size === 0, "typeFilterIncludes should be empty");

  assert(state.typeFilterExcludes instanceof Set, "typeFilterExcludes should be a Set");
  assert(state.typeFilterExcludes.size === 0, "typeFilterExcludes should be empty");

  assert(state.achievementFlags instanceof Set, "achievementFlags should be a Set");
  assert(state.achievementFlags.size === 0, "achievementFlags should be empty");

  // Test Array properties
  assert(Array.isArray(state.discoveryLog), "discoveryLog should be an array");
  assert(state.discoveryLog.length === 0, "discoveryLog should be empty");

  assert(Array.isArray(state.recentlyDiscoveredIds), "recentlyDiscoveredIds should be an array");
  assert(state.recentlyDiscoveredIds.length === 0, "recentlyDiscoveredIds should be empty");

  assert(Array.isArray(state.activeElements), "activeElements should be an array");
  assert(state.activeElements.length === 0, "activeElements should be empty");

  // Test Map properties
  assert(state.achievementUnlocks instanceof Map, "achievementUnlocks should be a Map");
  assert(state.achievementUnlocks.size === 0, "achievementUnlocks should be empty");

  // Test primitive properties
  assert(state.undoEntry === null, "undoEntry should be null");
  assert(state.draggedElement === null, "draggedElement should be null");
  assert(state.dragMoved === false, "dragMoved should be false");
  assert(state.cabinetDrag === null, "cabinetDrag should be null");
  assert(state.mergeTarget === null, "mergeTarget should be null");
  assert(state.searchTerm === "", "searchTerm should be empty string");

  assert(state.activeAction === "move", "activeAction should be 'move'");
  assert(state.activeSkillId === null, "activeSkillId should be null");
  assert(state.activeSidebarTab === "cabinet", "activeSidebarTab should be 'cabinet'");
  assert(state.activeMainView === "cook", "activeMainView should be 'cook'");

  assert(state.graphFocusIngredientId === null, "graphFocusIngredientId should be null");
  assert(state.graphFocusDepth === 2, "graphFocusDepth should be 2");
  assert(state.graphSearchTerm === "", "graphSearchTerm should be empty string");

  assert(state.notifiedForceUnlock === false, "notifiedForceUnlock should be false");
  assert(state.notifiedCombineUnlock === false, "notifiedCombineUnlock should be false");
  assert(state.notifiedChangeUnlock === false, "notifiedChangeUnlock should be false");
  assert(state.notifiedTimeUnlock === false, "notifiedTimeUnlock should be false");

  // Test coordinate objects
  assert(typeof state.dragStart === "object" && state.dragStart.x === 0 && state.dragStart.y === 0, "dragStart should be {x: 0, y: 0}");
  assert(typeof state.dragGrabOffset === "object" && state.dragGrabOffset.x === 0 && state.dragGrabOffset.y === 0, "dragGrabOffset should be {x: 0, y: 0}");

  // Test distinct instances (calling it twice shouldn't share sets/arrays)
  const state2: GameState = createInitialState();
  assert(state.discoveredIds !== state2.discoveredIds, "Sets should be distinct instances");
  assert(state.discoveryLog !== state2.discoveryLog, "Arrays should be distinct instances");
  assert(state.achievementUnlocks !== state2.achievementUnlocks, "Maps should be distinct instances");
}

function testStateTransitions() {
  const state: GameState = createInitialState();

  // Test set mutation
  state.discoveredIds.add("water");
  assert(state.discoveredIds.has("water"), "discoveredIds should contain added element");
  assert(state.discoveredIds.size === 1, "discoveredIds size should be 1");

  state.discoveredIds.delete("water");
  assert(!state.discoveredIds.has("water"), "discoveredIds should not contain removed element");
  assert(state.discoveredIds.size === 0, "discoveredIds size should be 0");

  // Test array mutation
  state.activeElements.push({ id: "fire", x: 10, y: 20 });
  assert(state.activeElements.length === 1, "activeElements should contain 1 item");
  assert(state.activeElements[0].id === "fire", "activeElements item should be 'fire'");
  assert(state.activeElements[0].x === 10, "activeElements item x should be 10");

  state.activeElements.pop();
  assert(state.activeElements.length === 0, "activeElements should be empty after pop");

  // Test primitive updates
  state.activeAction = "combine";
  assert(state.activeAction === "combine", "activeAction should update to 'combine'");

  state.activeSidebarTab = "graph";
  assert(state.activeSidebarTab === "graph", "activeSidebarTab should update to 'graph'");

  // Test map mutation
  state.achievementUnlocks.set("first_discovery", 1620000000);
  assert(state.achievementUnlocks.has("first_discovery"), "achievementUnlocks should have 'first_discovery'");
  assert(state.achievementUnlocks.get("first_discovery") === 1620000000, "achievementUnlocks should return correct timestamp");

  state.achievementUnlocks.delete("first_discovery");
  assert(!state.achievementUnlocks.has("first_discovery"), "achievementUnlocks should not have 'first_discovery' after deletion");
}

testCreateInitialState();
testStateTransitions();

console.log("=== STATE TESTS PASSED ===");
