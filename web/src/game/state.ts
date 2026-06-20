/** Mutable runtime game state. */

import type { GameState } from "../types";

export function createInitialState(): GameState {
  return {
    discoveredIds: new Set(),
    discoveryLog: [],
    recentlyDiscoveredIds: [],
    recentHighlightIds: new Set(),
    undoEntry: null,
    activeElements: [],
    draggedElement: null,
    dragMoved: false,
    dragStart: { x: 0, y: 0 },
    dragGrabOffset: { x: 0, y: 0 },
    cabinetDrag: null,
    mergeTarget: null,
    searchTerm: "",
    stateFilterIncludes: new Set(),
    stateFilterExcludes: new Set(),
    typeFilterIncludes: new Set(),
    typeFilterExcludes: new Set(),
    activeAction: "move",
    activeSkillId: null,
    activeSidebarTab: "cabinet",
    activeMainView: "cook",
    graphFocusIngredientId: null,
    graphFocusDepth: 2,
    graphSearchTerm: "",
    notifiedForceUnlock: false,
    notifiedCombineUnlock: false,
    notifiedChangeUnlock: false,
    notifiedTimeUnlock: false,
    achievementUnlocks: new Map(),
    achievementFlags: new Set()
  };
}
