import Foundation

struct AchievementDefinition: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let emoji: String
    let description: String
    let hint: String?
    let category: String?
    let steamId: String?
}

struct AchievementRule: Codable {
    let type: String
    let min: Int?
    let skillId: String?
    let actionId: String?
    let flag: String?
}

struct AchievementUnlock: Codable, Identifiable {
    let id: String
    let unlockedAt: UInt64
}

struct AchievementsSaveData: Codable {
    var unlocked: [AchievementUnlock]
    var flags: [String]
}

struct AchievementEvaluationContext {
    let discovered: Set<String>
    let discoveryLogLength: Int
    let primitiveIds: Set<String>
    let discoverable: [String: IngredientItem]
    let xp: [String: Int]
    let flags: Set<String>
    let unlockedIds: Set<String>
    let isSkillUnlocked: (String) -> Bool
    let isActionUnlocked: (String) -> Bool
}

struct AchievementEngine {
    let definitions: [AchievementDefinition]
    let rules: [String: AchievementRule]

    func pendingUnlocks(_ ctx: AchievementEvaluationContext) -> [String] {
        var pending: [String] = []
        for def in definitions {
            if ctx.unlockedIds.contains(def.id) { continue }
            guard let rule = rules[def.id] else { continue }
            if evaluate(rule, ctx: ctx) {
                pending.append(def.id)
            }
        }
        return pending
    }

    func evaluate(_ rule: AchievementRule, ctx: AchievementEvaluationContext) -> Bool {
        switch rule.type {
        case "raw_discoveries":
            return countRaw(ctx) >= (rule.min ?? 0)
        case "recipe_discoveries":
            return countRecipes(ctx) >= (rule.min ?? 0)
        case "non_primitive_discoveries":
            return countNonPrimitive(ctx) >= (rule.min ?? 0)
        case "map_complete":
            let total = ctx.discoverable.count
            let found = ctx.discovered.filter { ctx.discoverable[$0] != nil }.count
            return total > 0 && found >= total
        case "skill_unlocked":
            guard let skillId = rule.skillId else { return false }
            return ctx.isSkillUnlocked(skillId)
        case "action_unlocked":
            guard let actionId = rule.actionId else { return false }
            return ctx.isActionUnlocked(actionId)
        case "total_xp":
            return totalXp(ctx) >= (rule.min ?? 0)
        case "skill_xp":
            guard let skillId = rule.skillId else { return false }
            return (ctx.xp[skillId] ?? 0) >= (rule.min ?? 0)
        case "flag":
            guard let flag = rule.flag else { return false }
            return ctx.flags.contains(flag)
        case "journal_entries":
            return ctx.discoveryLogLength >= (rule.min ?? 0)
        default:
            return false
        }
    }

    private func countRaw(_ ctx: AchievementEvaluationContext) -> Int {
        ctx.discovered.filter { id in
            ctx.discoverable[id]?.origin == "raw"
        }.count
    }

    private func countRecipes(_ ctx: AchievementEvaluationContext) -> Int {
        ctx.discovered.filter { id in
            ctx.discoverable[id]?.isRecipe == true
        }.count
    }

    private func countNonPrimitive(_ ctx: AchievementEvaluationContext) -> Int {
        ctx.discovered.filter { id in
            !ctx.primitiveIds.contains(id) && ctx.discoverable[id] != nil
        }.count
    }

    private func totalXp(_ ctx: AchievementEvaluationContext) -> Int {
        ctx.xp.values.reduce(0, +)
    }
}
