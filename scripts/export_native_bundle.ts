import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import "../content/data/index";
import { PROGRESSION_CONFIG } from "../content/progression_config";
import { buildTransitionIndex } from "../content/data/transitions/index";
import { ACHIEVEMENTS } from "../content/data/achievements";
import { ACHIEVEMENT_RULES } from "../content/data/achievement_rules";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = join(root, "core", "assets");
const webPublicAssets = join(root, "web", "src", "public", "game");

mkdirSync(assetsDir, { recursive: true });
mkdirSync(webPublicAssets, { recursive: true });

const starters = (globalThis as any).STARTER_ELEMENTS;
const unlockables = (globalThis as any).UNLOCKABLE_ELEMENTS;
const discoverable = (globalThis as any).DISCOVERABLE_ITEMS;

const bundle = {
  version: 1,
  starters,
  unlockables,
  discoverable,
  progression: PROGRESSION_CONFIG,
  achievements: ACHIEVEMENTS,
  achievementRules: ACHIEVEMENT_RULES
};

const bundleJson = JSON.stringify(bundle, null, 2);
writeFileSync(join(assetsDir, "game_bundle.json"), bundleJson);
writeFileSync(join(webPublicAssets, "game_bundle.json"), bundleJson);

const transitionIndex = buildTransitionIndex(discoverable);
const transitionsJson = JSON.stringify(transitionIndex.all, null, 2);
writeFileSync(join(assetsDir, "transitions.json"), transitionsJson);
writeFileSync(join(webPublicAssets, "transitions.json"), transitionsJson);

const techniqueCount = transitionIndex.techniqueTransitions.length;
const combineCount = transitionIndex.combineTransitions.length;
console.log(`Exported game_bundle.json (${Object.keys(discoverable).length} discoverable items)`);
console.log(`Exported ${ACHIEVEMENTS.length} achievements + rules`);
console.log(`Exported transitions.json (${techniqueCount} technique + ${combineCount} combine)`);
console.log(`→ core/assets, web/src/public/game`);
