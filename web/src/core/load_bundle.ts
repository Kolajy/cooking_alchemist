import type { DiscoverableMap, ProgressionConfig } from "../types";
import { buildIndexFromExported } from "./build_index";
import type { ExportedGameBundle, RawTransition } from "./types";

const BUNDLE_URL = "/game/game_bundle.json";
const TRANSITIONS_URL = "/game/transitions.json";

export interface LoadedBundle {
  bundle: ExportedGameBundle;
  transitions: RawTransition[];
}

export async function fetchExportedBundle(): Promise<LoadedBundle> {
  const [bundleRes, transitionsRes] = await Promise.all([
    fetch(BUNDLE_URL),
    fetch(TRANSITIONS_URL)
  ]);
  if (!bundleRes.ok || !transitionsRes.ok) {
    throw new Error(
      "Shared game bundle not found. Run `npm run export-native` to generate /game/*.json"
    );
  }
  const bundle = (await bundleRes.json()) as ExportedGameBundle;
  const transitions = (await transitionsRes.json()) as RawTransition[];
  return { bundle, transitions };
}

/**
 * Apply exported JSON to globalThis — same data all native platforms load from disk.
 * Replaces the TS module graph as the runtime data source when bundle files exist.
 */
export function applyExportedBundle(bundle: ExportedGameBundle, transitions: RawTransition[]): void {
  const discoverable = bundle.discoverable as DiscoverableMap;
  const progression = bundle.progression as ProgressionConfig;

  globalThis.STARTER_ELEMENTS = bundle.starters;
  globalThis.UNLOCKABLE_ELEMENTS = bundle.unlockables;
  globalThis.DISCOVERABLE_ITEMS = discoverable;
  globalThis.TRANSITION_INDEX = buildIndexFromExported(transitions);
  globalThis.PRIMITIVE_INGREDIENT_IDS = new Set(
    [...bundle.starters, ...bundle.unlockables].map(item => item.id)
  );

  globalThis.PROGRESSION_CONFIG = progression;
  globalThis.PROGRESSION_TECHNIQUE_CATEGORIES = progression.techniqueCategories || {};
  globalThis.PROGRESSION_TIERS = progression.techniques;
  globalThis.PLAYER_ACTIONS = progression.playerActions;
  globalThis.INGREDIENT_MILESTONES = progression.milestones || [];

  globalThis.getIngredientOrigin = function getIngredientOrigin(id: string): string {
    if (globalThis.PRIMITIVE_INGREDIENT_IDS.has(id)) return "primitive";
    const item = globalThis.DISCOVERABLE_ITEMS[id];
    if (item?.origin) return item.origin;
    if (item) return "raw";
    return "processed";
  };

  globalThis.ACHIEVEMENTS = bundle.achievements || [];
  globalThis.ACHIEVEMENT_RULES = bundle.achievementRules || {};
}

/**
 * Bootstrap the shared data layer for web. Falls back to compiled TS modules if fetch fails.
 */
export async function bootstrapSharedData(): Promise<"shared" | "compiled"> {
  try {
    const { bundle, transitions } = await fetchExportedBundle();
    applyExportedBundle(bundle, transitions);
    console.info("[Culinary Alchemy] Loaded shared game bundle from /game/");
    return "shared";
  } catch (error) {
    console.warn("[Culinary Alchemy] Using compiled TS data modules:", error);
    await import("../data/index");
    await import("../progression_config");
    return "compiled";
  }
}
