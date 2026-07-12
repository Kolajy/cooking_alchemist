import { TypeScriptRuntime } from "./src/core/ts_runtime";

// Mock globals
globalThis.PROGRESSION_CONFIG = {
  skills: [],
  milestones: [],
  actions: []
};
globalThis.DISCOVERABLE_ITEMS = {};
globalThis.STARTER_ELEMENTS = [];
globalThis.TRANSITION_INDEX = {};
globalThis.PLAYER_ACTIONS = {};

// Populate globals with some dummy data to make benchmark realistic
for (let i = 0; i < 5000; i++) {
  globalThis.DISCOVERABLE_ITEMS[`item_${i}`] = { type: i % 2 === 0 ? "recipe" : "ingredient" };
}

const runtime = new TypeScriptRuntime();

// Populate discovered
for (let i = 0; i < 1000; i++) {
  // Access private member via any cast to set up state
  (runtime as any).discovered.add(`item_${i}`);
  (runtime as any).discovered.add(`invalid_${i}`);
}

const start = performance.now();
for (let i = 0; i < 10000; i++) {
  runtime.statsText();
}
const end = performance.now();

console.log(`statsText benchmark: ${end - start} ms`);
