import { ACHIEVEMENTS, ACHIEVEMENT_BY_ID } from "./data/achievements";
import { ACHIEVEMENT_RULES } from "./data/achievement_rules";
import type {
  AchievementDefinition,
  AchievementRule,
  AchievementsSaveData,
  DiscoverableMap,
  IngredientItem
} from "./types";

export interface AchievementEvaluationContext {
  discoveredIds: ReadonlySet<string>;
  discoveryLogLength: number;
  primitiveIds: ReadonlySet<string>;
  discoverable: DiscoverableMap;
  getIngredientOrigin: (id: string) => string;
  progressionXp: Record<string, number>;
  isSkillUnlocked: (skillId: string) => boolean;
  isActionUnlocked: (actionId: string) => boolean;
  flags: ReadonlySet<string>;
  unlockedAchievementIds: ReadonlySet<string>;
}

function countRawDiscoveries(ctx: AchievementEvaluationContext): number {
  let count = 0;
  for (const id of ctx.discoveredIds) {
    const item = ctx.discoverable[id];
    if (!item) continue;
    const origin = item.origin || ctx.getIngredientOrigin(id);
    if (origin === "raw") count += 1;
  }
  return count;
}

function countRecipeDiscoveries(ctx: AchievementEvaluationContext): number {
  let count = 0;
  for (const id of ctx.discoveredIds) {
    const item = ctx.discoverable[id];
    if (item?.type === "recipe") count += 1;
  }
  return count;
}

function countNonPrimitiveDiscoveries(ctx: AchievementEvaluationContext): number {
  let count = 0;
  for (const id of ctx.discoveredIds) {
    if (ctx.primitiveIds.has(id)) continue;
    if (ctx.discoverable[id]) count += 1;
  }
  return count;
}

function totalSkillXp(ctx: AchievementEvaluationContext): number {
  return Object.values(ctx.progressionXp).reduce((sum, value) => sum + (value || 0), 0);
}

export function evaluateAchievementRule(
  rule: AchievementRule,
  ctx: AchievementEvaluationContext
): boolean {
  switch (rule.type) {
    case "raw_discoveries":
      return countRawDiscoveries(ctx) >= rule.min;
    case "recipe_discoveries":
      return countRecipeDiscoveries(ctx) >= rule.min;
    case "non_primitive_discoveries":
      return countNonPrimitiveDiscoveries(ctx) >= rule.min;
    case "map_complete": {
      const total = Object.keys(ctx.discoverable).length;
      const allDiscovered = [...ctx.discoveredIds].filter(id => ctx.discoverable[id]).length;
      return total > 0 && allDiscovered >= total;
    }
    case "skill_unlocked":
      return ctx.isSkillUnlocked(rule.skillId);
    case "action_unlocked":
      return ctx.isActionUnlocked(rule.actionId);
    case "total_xp":
      return totalSkillXp(ctx) >= rule.min;
    case "skill_xp":
      return (ctx.progressionXp[rule.skillId] || 0) >= rule.min;
    case "flag":
      return ctx.flags.has(rule.flag);
    case "journal_entries":
      return ctx.discoveryLogLength >= rule.min;
    default:
      return false;
  }
}

export function isAchievementEarned(
  achievementId: string,
  ctx: AchievementEvaluationContext,
  rules: Record<string, AchievementRule> = ACHIEVEMENT_RULES
): boolean {
  if (ctx.unlockedAchievementIds.has(achievementId)) return true;
  const rule = rules[achievementId];
  if (!rule) return false;
  return evaluateAchievementRule(rule, ctx);
}

export function checkAchievementsForContext(
  ctx: AchievementEvaluationContext,
  rules: Record<string, AchievementRule> = ACHIEVEMENT_RULES,
  definitions: AchievementDefinition[] = ACHIEVEMENTS
): string[] {
  const newlyUnlocked: string[] = [];
  for (const def of definitions) {
    if (ctx.unlockedAchievementIds.has(def.id)) continue;
    const rule = rules[def.id];
    if (!rule) continue;
    if (evaluateAchievementRule(rule, ctx)) {
      newlyUnlocked.push(def.id);
    }
  }
  return newlyUnlocked;
}

export function sanitizeAchievementsSaveData(
  raw: AchievementsSaveData | null | undefined,
  rules: Record<string, AchievementRule> = ACHIEVEMENT_RULES
): AchievementsSaveData {
  const unlocked = Array.isArray(raw?.unlocked)
    ? raw!.unlocked.filter(entry => (
      entry?.id
      && typeof entry.unlockedAt === "number"
      && ACHIEVEMENT_BY_ID[entry.id]
      && rules[entry.id]
    ))
    : [];

  const allowedFlags = new Set(
    Object.values(rules)
      .filter((rule): rule is Extract<AchievementRule, { type: "flag" }> => rule.type === "flag")
      .map(rule => rule.flag)
  );

  const flags = Array.isArray(raw?.flags)
    ? raw!.flags.filter(flag => typeof flag === "string" && allowedFlags.has(flag))
    : [];

  return { unlocked, flags };
}

export function itemIsFinalizedRecipe(item: IngredientItem | undefined): boolean {
  return item?.type === "recipe";
}
