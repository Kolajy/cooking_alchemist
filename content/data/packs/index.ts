/**
 * Cultural pack registry — optional DLC-style content shipments.
 * Packs are authored separately from the vertical-slice starter content.
 * Enable in game by merging into DISCOVERABLE_ITEMS and milestone unlocks.
 */

import chinesePack from "./chinese";
import frenchPack from "./french";
import greekPack from "./greek";
import indianPack from "./indian";
import italianPack from "./italian";
import japanesePack from "./japanese";
import mesoamericanPack from "./mesoamerican";
import mexicanPack from "./mexican";
import scandinavianPack from "./scandinavian";
import westAfricanPack from "./west_african";
import { mergePackDiscoverable, mergePackPrimitives } from "./helpers";
import type { CulturalPack } from "./types";

export const CULTURAL_PACKS: CulturalPack[] = [
  japanesePack,
  mexicanPack,
  westAfricanPack,
  indianPack,
  frenchPack,
  chinesePack,
  italianPack,
  greekPack,
  mesoamericanPack,
  scandinavianPack
];

export const CULTURAL_PACK_BY_ID: Record<string, CulturalPack> = Object.fromEntries(
  CULTURAL_PACKS.map(pack => [pack.meta.id, pack])
);

export const ALL_PACK_DISCOVERABLE = mergePackDiscoverable(CULTURAL_PACKS);
export const ALL_PACK_PRIMITIVES = mergePackPrimitives(CULTURAL_PACKS);

export function getPackMilestones() {
  return CULTURAL_PACKS.map((pack, index) => ({
    recipesCount: pack.meta.unlockCriteria?.discoveredRecipes ?? (index + 1) * 8,
    unlocks: [pack.primitive.id],
    name: `${pack.meta.name} Pantry`,
    emoji: pack.meta.emoji
  }));
}

export {
  chinesePack,
  frenchPack,
  greekPack,
  indianPack,
  italianPack,
  japanesePack,
  mesoamericanPack,
  mexicanPack,
  scandinavianPack,
  westAfricanPack
};

export type { CulturalPack, CulturalPackMeta } from "./types";
