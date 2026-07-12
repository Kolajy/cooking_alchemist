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

for (let i = 0; i < 5000; i++) {
  globalThis.DISCOVERABLE_ITEMS[`item_${i}`] = { type: i % 2 === 0 ? "recipe" : "ingredient" };
}

class OptTypeScriptRuntime extends TypeScriptRuntime {
  statsTextOpt(): string {
    const total = Object.keys(globalThis.DISCOVERABLE_ITEMS).length;
    let count = 0;
    for (const id of (this as any).discovered) {
      if (globalThis.DISCOVERABLE_ITEMS[id]) count++;
    }
    return `${count} / ${total} discovered`;
  }
}

const runtime = new OptTypeScriptRuntime();

for (let i = 0; i < 1000; i++) {
  (runtime as any).discovered.add(`item_${i}`);
  (runtime as any).discovered.add(`invalid_${i}`);
}

const start = performance.now();
for (let i = 0; i < 10000; i++) {
  runtime.statsTextOpt();
}
const end = performance.now();

console.log(`statsText optimized benchmark: ${end - start} ms`);
