/** Player-facing achievement metadata — unlock rules in achievement_rules.ts. */

import type { AchievementCategory } from "../types";

export type { AchievementCategory };

import type { AchievementDefinition } from "../types";

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first_separation",
    name: "First Cut",
    emoji: "🔪",
    description: "Separate a primal ingredient into its first raw piece.",
    hint: "Drag Berries to the counter and use Separate.",
    category: "discovery",
    steamId: "FIRST_SEPARATION"
  },
  {
    id: "first_recipe",
    name: "Plated Up",
    emoji: "🍽️",
    description: "Complete your first finalized dish.",
    hint: "Combine and cook discoveries until a recipe appears in the cabinet.",
    category: "discovery",
    steamId: "FIRST_RECIPE"
  },
  {
    id: "first_combine",
    name: "Stir the Pot",
    emoji: "🥣",
    description: "Successfully combine two ingredients on the counter.",
    hint: "Select Combine, then drag one ingredient onto another.",
    category: "technique"
  },
  {
    id: "pantry_explorer",
    name: "Pantry Explorer",
    emoji: "🧺",
    description: "Discover 10 ingredients beyond the starter pantry.",
    hint: "Separate primals, apply techniques, and merge pairs.",
    category: "discovery"
  },
  {
    id: "pantry_master",
    name: "Pantry Master",
    emoji: "🏺",
    description: "Discover 25 ingredients beyond the starter pantry.",
    hint: "Keep exploring every technique chain.",
    category: "discovery"
  },
  {
    id: "recipe_collector",
    name: "Recipe Collector",
    emoji: "📖",
    description: "Finalize 3 complete dishes.",
    hint: "Follow combine and heat paths to finished recipes.",
    category: "discovery"
  },
  {
    id: "recipe_aficionado",
    name: "Recipe Aficionado",
    emoji: "⭐",
    description: "Finalize 5 complete dishes.",
    hint: "Unlock Transform and push deeper into each cuisine chain.",
    category: "discovery"
  },
  {
    id: "map_complete",
    name: "Cartographer's Feast",
    emoji: "🗺️",
    description: "Discover every ingredient and recipe in the compendium.",
    hint: "Fill the progress map — no stone unturned.",
    category: "discovery",
    steamId: "MAP_COMPLETE"
  },
  {
    id: "skill_pound",
    name: "Heavy Hand",
    emoji: "🔨",
    description: "Unlock the Pound technique.",
    hint: "Practice Smash until Pound opens in Skills.",
    category: "technique",
    steamId: "SKILL_POUND"
  },
  {
    id: "skill_peel",
    name: "Clean Peel",
    emoji: "🧼",
    description: "Unlock the Peel technique.",
    hint: "Earn Separate experience, then train Peel.",
    category: "technique"
  },
  {
    id: "skill_hand_mix",
    name: "Hand Mixer",
    emoji: "🥄",
    description: "Unlock Hand Mix & Stir.",
    hint: "Combine ingredients repeatedly to open the structure track.",
    category: "technique"
  },
  {
    id: "transform_unlocked",
    name: "Firewalker",
    emoji: "🔥",
    description: "Unlock the Transform cooking method.",
    hint: "Finalize enough dishes to earn open-flame techniques.",
    category: "progression"
  },
  {
    id: "technique_journeyman",
    name: "Journeyman Cook",
    emoji: "👨‍🍳",
    description: "Earn 15 total technique experience across all skills.",
    hint: "Every successful chop, smash, and stir adds up.",
    category: "progression"
  },
  {
    id: "technique_master",
    name: "Master of the Hearth",
    emoji: "👑",
    description: "Earn 50 total technique experience across all skills.",
    hint: "Deep mastery takes patience — keep practicing.",
    category: "progression"
  },
  {
    id: "combine_artisan",
    name: "Combine Artisan",
    emoji: "🫕",
    description: "Earn 5 Combine experience.",
    hint: "Merge compatible ingredients again and again.",
    category: "technique"
  },
  {
    id: "journal_keeper",
    name: "Hearth Chronicler",
    emoji: "📓",
    description: "Log 10 timed entries in your kitchen journal.",
    hint: "Each new discovery is stamped automatically.",
    category: "exploration"
  },
  {
    id: "map_visitor",
    name: "Chart the Kitchen",
    emoji: "🌳",
    description: "Open the ingredient progress map.",
    hint: "Press M or use the header button.",
    category: "exploration"
  },
  {
    id: "undo_chef",
    name: "Second Thoughts",
    emoji: "↩️",
    description: "Undo a counter action.",
    hint: "Press U or use Undo after placing an ingredient.",
    category: "exploration"
  }
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(
  ACHIEVEMENTS.map(def => [def.id, def])
) as Record<string, AchievementDefinition>;
