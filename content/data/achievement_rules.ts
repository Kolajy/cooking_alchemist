import type { AchievementRule } from "../types";

/** Declarative unlock rules — interpreted by content/achievement_engine.ts and culinary-core. */
export const ACHIEVEMENT_RULES: Record<string, AchievementRule> = {
  first_separation: { type: "raw_discoveries", min: 1 },
  first_recipe: { type: "recipe_discoveries", min: 1 },
  first_combine: { type: "flag", flag: "combine_success" },
  pantry_explorer: { type: "non_primitive_discoveries", min: 10 },
  pantry_master: { type: "non_primitive_discoveries", min: 25 },
  recipe_collector: { type: "recipe_discoveries", min: 3 },
  recipe_aficionado: { type: "recipe_discoveries", min: 5 },
  map_complete: { type: "map_complete" },
  skill_pound: { type: "skill_unlocked", skillId: "pound" },
  skill_peel: { type: "skill_unlocked", skillId: "peel" },
  skill_hand_mix: { type: "skill_unlocked", skillId: "hand_mix" },
  transform_unlocked: { type: "action_unlocked", actionId: "change" },
  technique_journeyman: { type: "total_xp", min: 15 },
  technique_master: { type: "total_xp", min: 50 },
  combine_artisan: { type: "skill_xp", skillId: "combine", min: 5 },
  journal_keeper: { type: "journal_entries", min: 10 },
  map_visitor: { type: "flag", flag: "map_opened" },
  undo_chef: { type: "flag", flag: "undo_used" }
};

export const ACHIEVEMENT_FLAG_IDS = [
  "combine_success",
  "undo_used",
  "map_opened"
] as const;

export type AchievementFlagId = typeof ACHIEVEMENT_FLAG_IDS[number];
