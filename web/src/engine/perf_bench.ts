import { performance } from "perf_hooks";

// Mock document for context initialization
(globalThis as any).document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => []
};
(globalThis as any).window = {
  setTimeout: setTimeout,
  clearTimeout: clearTimeout
};

// Import real modules and their functions
import { updateRegistry } from "../core/bundle_registry";

async function initializeData() {
  await import("../data/index");
  await import("../progression_config");

  updateRegistry({
      STARTER_ELEMENTS: (globalThis as any).STARTER_ELEMENTS,
      UNLOCKABLE_ELEMENTS: (globalThis as any).UNLOCKABLE_ELEMENTS,
      DISCOVERABLE_ITEMS: (globalThis as any).DISCOVERABLE_ITEMS,
      TRANSITION_INDEX: (globalThis as any).TRANSITION_INDEX,
      PRIMITIVE_INGREDIENT_IDS: (globalThis as any).PRIMITIVE_INGREDIENT_IDS,
      PROGRESSION_CONFIG: (globalThis as any).PROGRESSION_CONFIG,
      PROGRESSION_TECHNIQUE_CATEGORIES: (globalThis as any).PROGRESSION_TECHNIQUE_CATEGORIES || {},
      PROGRESSION_TIERS: (globalThis as any).PROGRESSION_TIERS || {},
      PLAYER_ACTIONS: (globalThis as any).PLAYER_ACTIONS || {},
      INGREDIENT_MILESTONES: (globalThis as any).INGREDIENT_MILESTONES || [],
      getIngredientOrigin: (globalThis as any).getIngredientOrigin,
      ACHIEVEMENTS: (globalThis as any).ACHIEVEMENTS || [],
      ACHIEVEMENT_RULES: (globalThis as any).ACHIEVEMENT_RULES || {}
  });
}

// execute
(async () => {
  await initializeData();

  // Import real modules and their functions AFTER registry update
  const { CombinationEngine } = await import("./combination_engine");
  const { getProgressionEngine, createDataLayer } = await import("../game/data");
  const { buildPortableSave } = await import("../game/save/save-repository");
  const { getPlayableIngredientCatalog } = await import("../game/ingredients");
  // Also import the renderCabinet to test the filtering
  const { renderCabinet } = await import("../game/cabinet");
  const contextModule = await import("../game/context");
  const { createInitialState } = await import("../game/state");
  const { ProgressionEngine } = await import("./progression_engine");

  // Setup global context so game modules work
  const data = createDataLayer();

  const progEngine = new ProgressionEngine(data.PROGRESSION_CONFIG, { xp: {}, milestonesReached: [] });
  // We mock a progression engine instance into data.Progression because some methods depend on it
  data.Progression = {
     engine: progEngine,
     getUnlockedIngredients: () => [],
     getState: () => ({ xp: {}, milestonesReached: [] }),
     load: () => {},
     save: () => {}
  } as any;

  const state = createInitialState();

  // Initialize all available ingredients in state discovered so graph / cabinet is populated
  const allItems = Object.keys(data.DISCOVERABLE_ITEMS);
  allItems.forEach(id => state.discoveredIds.add(id));

  const mockDom = {
    workspace: null,
    cabinetItems: {
        innerHTML: "",
        querySelector: () => null,
        appendChild: () => null
    },
    unlockedCountEl: null,
    cabinetSearch: null,
    cabinetSearchSuggestions: { innerHTML: "", appendChild: () => null },
    ingredientTypesContainer: null,
    ingredientStatesContainer: null,
    cookingToolbar: null,
    sidebarTabButtons: [],
    cabinetPanel: null,
    skillsPanel: null,
    skillsList: null,
    journalPanel: null,
    discoveryLogList: null,
    discoveryLogCountEl: null,
    achievementsPanel: null,
    achievementsList: null,
    achievementsCountEl: null,
    achievementsProgressEl: null,
    recipeBookModal: null,
    helpModal: null,
    keyboardShortcutsModal: null,
    keyboardShortcutsList: null,
    settingsModal: null,
    discoveryDialog: null,
    discoverySparkles: null,
    discoveryKicker: null,
    discoveryTitle: null,
    discoveryItemContainer: null,
    ingredientGraphContainer: null,
    progressMapView: null,
    btnRecipeBook: null,
    btnHelp: null,
    btnSettings: null,
    btnSound: null,
    btnUndoWorkspace: null,
    btnProgressGraph: null,
    btnClearWorkspace: null,
    saveFileInput: null,
    btnDiscoveryOk: null,
    discoveredRecipesList: null,
    settingSound: null,
    settingVolume: null,
    settingAmbience: null,
    settingReducedMotion: null,
    settingsExport: null,
    settingsImport: null,
    settingsReset: null,
    mechanicDiscoveryDialog: null,
    mechanicSparkles: null,
    mechanicKicker: null,
    mechanicTitle: null,
    mechanicEmoji: null,
    mechanicName: null,
    mechanicDescription: null,
    btnMechanicOk: null,
  } as any;

  // Add dummy functions to global document
  (globalThis as any).document.createElement = (type: string) => ({
      className: "",
      setAttribute: () => {},
      dataset: {},
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {},
      addEventListener: () => {},
      style: {}
  });
  (globalThis as any).document.createDocumentFragment = () => ({
      appendChild: () => {},
      append: () => {}
  });

  const mockContext = {
    state,
    data,
    dom: mockDom,
    actions: {}
  };

  // We actually need to initialize the true context so internal variables are set.
  contextModule.createContext();
  // Override getCtx
  (contextModule as any).getCtx = () => mockContext;
  // Let's also patch the actual exported ctx object just in case
  Object.assign(contextModule.getCtx(), mockContext);


  const RUNS = 1000;

  function measure(fn: () => void): number[] {
    const times: number[] = [];
    for (let i = 0; i < RUNS; i++) {
      const start = performance.now();
      fn();
      const end = performance.now();
      times.push(end - start);
    }
    return times.sort((a, b) => a - b);
  }

  function getP99(times: number[]): number {
    const idx = Math.floor(times.length * 0.99);
    return times[idx];
  }

  console.log("Running Engine Performance Benchmarks...");
  let failed = false;

  // 1. Combination Engine Lookup
  // Use real data engine
  const combinationEngine = data.combinationEngine;

  const combTimes = measure(() => {
    // Pick real known IDs and tools to lookup
    combinationEngine.matchToolRecipe("potato", "chop", progEngine);
    combinationEngine.matchCombinationRecipe(["chopped_apple", "dough"]);
  });

  const combP99 = getP99(combTimes);
  console.log(`Combination Lookups - P99: ${combP99.toFixed(3)}ms`);
  if (combP99 > 16) {
    console.error("❌ Combination Lookups failed 16ms budget");
    failed = true;
  }

  // 2. Graph Rendering Layout - we'll simulate the real graph operations from the real files
  // by grabbing the transition index and parsing
  const allTransitions = data.transitionIndex?.toGraphEdges() || [];
  const allIngredientIds = Array.from(new Set(allTransitions.flatMap((t: any) => [...(t.inputs || [t.input]), t.output])));

  // Provide a function replicating graph layout loops locally to run benchmark logic over the actual graph dataset
  function simulateGraphLayout() {
    function filterTransitionsByIngredients(transitions: any[], ingredientIds: string[]) {
      const idSet = new Set(ingredientIds);
      return transitions.filter(t => (t.inputs || [t.input]).every((id: string) => idSet.has(id)) && idSet.has(t.output));
    }

    function filterIngredientIdsByFocus(allIds: string[], transitions: any[], focusId: string, maxDepth: number) {
      if (!focusId) return allIds;
      const idSet = new Set<string>();
      const queue = [{ id: focusId, depth: 0 }];
      const visited = new Set<string>();

      while(queue.length > 0) {
         const { id, depth } = queue.shift()!;
         if (visited.has(id)) continue;
         visited.add(id);
         idSet.add(id);
         if (depth >= maxDepth) continue;

         const connectedEdges = transitions.filter(t => (t.inputs || [t.input]).includes(id) || t.output === id);
         connectedEdges.forEach(t => {
            (t.inputs || [t.input]).forEach((iId: string) => queue.push({ id: iId, depth: depth + 1}));
            queue.push({ id: t.output, depth: depth + 1});
         });
      }
      return Array.from(idSet);
    }

    const maxDepth = Infinity;
    const focusId = "potato";
    const ingredientIds = filterIngredientIdsByFocus(allIngredientIds, allTransitions, focusId, maxDepth);
    const transitions = filterTransitionsByIngredients(allTransitions, ingredientIds);
    // basic loops
    transitions.length;
  }

  const graphTimes = measure(() => {
     simulateGraphLayout();
  });
  const graphP99 = getP99(graphTimes);
  console.log(`Graph Rendering Mock - P99: ${graphP99.toFixed(3)}ms`);
  if (graphP99 > 16) {
    console.error("❌ Graph Rendering Mock failed 16ms budget");
    failed = true;
  }

  // 3. Pantry Filtering
  const pantryTimes = measure(() => {
     // Run real ingredient fetching logic which sorts and filters
     // To avoid the `getPlayableIngredientCatalog` being cached to 0ms every iteration,
     // we clear the cache via context size change, or simply use `renderCabinet` which loops over everything anyway.
     state.searchTerm = "test"; // this will force the filter loops inside renderCabinet
     renderCabinet();
  });
  const pantryP99 = getP99(pantryTimes);
  console.log(`Pantry Filtering Mock - P99: ${pantryP99.toFixed(3)}ms`);
  if (pantryP99 > 16) {
     console.error("❌ Pantry Filtering failed 16ms budget");
     failed = true;
  }

  // 4. Save Serialization
  // using buildPortableSave requires global ctx, which we mocked above.
  const saveTimes = measure(() => {
     // True portable save generating actual JS structures with achievements, maps, state and then serializing.
     const save = buildPortableSave(true);
     JSON.stringify(save);
  });
  const saveP99 = getP99(saveTimes);
  console.log(`Save Serialization - P99: ${saveP99.toFixed(3)}ms`);
  if (saveP99 > 16) {
     console.error("❌ Save Serialization failed 16ms budget");
     failed = true;
  }

  if (failed) {
    process.exit(1);
  } else {
    console.log("✅ All benchmarks passed 16ms P99 budget");
  }
})();
