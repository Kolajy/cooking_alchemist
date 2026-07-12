import { performance } from "perf_hooks";

// Mock document for DOM operations in CLI before any imports
if (!globalThis.document) {
  const createMockElement = (tag: string) => {
    const el: any = {
      tagName: tag,
      className: "",
      innerHTML: "",
      appendChild: () => {},
      setAttribute: () => {},
      addEventListener: () => {},
      querySelector: () => createMockElement("div"),
      querySelectorAll: () => [],
      closest: () => null,
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {},
        contains: () => false,
      },
      getBoundingClientRect: () => ({ x: 0, y: 0, width: 0, height: 0 }),
    };
    return el;
  };

  globalThis.document = {
    createElement: createMockElement,
    createElementNS: (ns: string, tag: string) => createMockElement(tag),
    getElementById: () => createMockElement("div"),
    querySelector: () => createMockElement("div"),
    querySelectorAll: () => [],
    body: createMockElement("body"),
  } as any;
}

import "../data/index";
import "../progression_config";
import { ProgressionEngine } from "./progression_engine";
import { CombinationEngine } from "./combination_engine";
import { getPlayableIngredientCatalog } from "../game/ingredients";
import { buildGameSaveFile } from "../game/save/save-export";
import { renderIngredientGraph } from "../ingredient_graph";

// Mock progression state BEFORE creating context
const progressionEngine = new ProgressionEngine(globalThis.PROGRESSION_CONFIG);
(globalThis as any).Progression = {
  load: () => {},
  save: () => {},
  getUnlockedIngredients: () => [],
  getState: () => progressionEngine.state, // use state instead of serialize()
  engine: progressionEngine
};

import { createContext } from "../game/context";

// Create context for any functions that might call getCtx()
createContext();

const ITERATIONS = 1000;

function runProfile(name: string, fn: () => void) {
  const times: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  times.sort((a, b) => a - b);
  const total = times.reduce((a, b) => a + b, 0);
  const avg = total / ITERATIONS;
  const p95 = times[Math.floor(ITERATIONS * 0.95)];
  const p99 = times[Math.floor(ITERATIONS * 0.99)];

  return { name, avg, p95, p99 };
}

function runBenchmark() {
  const combination = new CombinationEngine(
    globalThis.DISCOVERABLE_ITEMS,
    globalThis.TRANSITION_INDEX
  );

  const results = [];

  // 1. Combination lookups
  results.push(runProfile("Combination Lookups", () => {
    combination.matchCombinationRecipe(["water", "fire"]);
  }));

  // 2. Graph rendering
  const dummyContainer = document.createElement("div");
  results.push(runProfile("Graph Rendering", () => {
    renderIngredientGraph(dummyContainer, {
      discoveredIds: new Set(["water", "fire", "earth", "air", "steam", "mud"]),
      focusId: "water",
      focusDepth: 2,
      showLocked: true,
      searchTerm: "",
    });
  }));

  // 3. Pantry filtering
  results.push(runProfile("Pantry Filtering", () => {
    getPlayableIngredientCatalog();
  }));

  // 4. Save serialization
  results.push(runProfile("Save Serialization", () => {
    const save = buildGameSaveFile();
    JSON.stringify(save);
  }));

  console.table(results.map(r => ({
    "Task": r.name,
    "Avg (ms)": r.avg.toFixed(3),
    "P95 (ms)": r.p95.toFixed(3),
    "P99 (ms)": r.p99.toFixed(3),
  })));

  let hasError = false;
  for (const r of results) {
    if (r.p99 > 16) {
      console.error(`❌ FAIL: ${r.name} P99 time (${r.p99.toFixed(3)}ms) exceeds 16ms target.`);
      hasError = true;
    }
  }

  if (hasError) {
    process.exit(1);
  } else {
    console.log("✅ PASS: All P99 times are within the 16ms budget.");
    process.exit(0);
  }
}

runBenchmark();
