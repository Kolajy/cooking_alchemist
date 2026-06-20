import Foundation

struct IngredientItem: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let emoji: String
    let type: String?
    let origin: String?
    let category: String?
    let description: String?
    let blurb: String?
    let tip: String?

    var isRecipe: Bool { type == "recipe" }
}

struct TechniqueTier: Codable {
    let name: String
    let emoji: String
    let category: String
    let dependsOn: [String]
    let actions: [String]
    let unlockCriteria: UnlockCriteria?
}

struct UnlockCriteria: Codable {
    let prerequisites: [String: Int]?
    let discoveredRecipes: Int?
}

struct PlayerAction: Codable {
    let name: String
    let emoji: String
    let mode: String?
    let categories: [String]?
    let starterSkill: String?
    let unlockCriteria: UnlockCriteria?
    let desc: String?
}

struct ProgressionConfig: Codable {
    let techniques: [String: TechniqueTier]
    let playerActions: [String: PlayerAction]
    let maxSkillExp: Int
}

struct GameBundleFile: Decodable {
    let version: Int
    let starters: [IngredientItem]
    let unlockables: [IngredientItem]
    let discoverable: [String: IngredientItem]
    let progression: ProgressionConfig
    let achievements: [AchievementDefinition]
    let achievementRules: [String: AchievementRule]

    enum CodingKeys: String, CodingKey {
        case version, starters, unlockables, discoverable, progression, achievements, achievementRules
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        version = try container.decode(Int.self, forKey: .version)
        starters = try container.decode([IngredientItem].self, forKey: .starters)
        unlockables = try container.decode([IngredientItem].self, forKey: .unlockables)
        discoverable = try container.decode([String: IngredientItem].self, forKey: .discoverable)
        progression = try container.decode(ProgressionConfig.self, forKey: .progression)
        achievements = try container.decodeIfPresent([AchievementDefinition].self, forKey: .achievements) ?? []
        achievementRules = try container.decodeIfPresent([String: AchievementRule].self, forKey: .achievementRules) ?? [:]
    }
}

struct RawTransition: Codable {
    let id: String
    let kind: String
    let tools: [String]
    let input: String?
    let inputs: [String]
    let outputs: [String]
    let onePerAction: Bool
    let resultItemId: String
}

struct DiscoveryLogEntry: Codable, Identifiable {
    let id: String
    var discoveredAt: UInt64
}

struct DiscoverySaveData: Codable {
    var discovered: [String]
    var recent: [String]
    var highlights: [String]
    var discoveryLog: [DiscoveryLogEntry]
}

struct ProgressionState: Codable {
    var xp: [String: Int]
    var milestonesReached: [Int]
}

struct GameSaveFile: Codable {
    let version: Int
    let game: String
    let exportedAt: UInt64
    var discovery: DiscoverySaveData
    var progression: ProgressionState
    var achievements: AchievementsSaveData?
    var settings: SaveSettings
}

struct SaveSettings: Codable {
    var soundEnabled: Bool
    var reducedMotion: Bool?

    var reducedMotionEnabled: Bool { reducedMotion ?? false }
}

struct TrophyCard: Identifiable {
    let id: String
    let name: String
    let emoji: String
    let description: String
    let hint: String
    let unlocked: Bool
}

struct MatchResult {
    let success: Bool
    let resultId: String?
    let resultIds: [String]
    let lockedSkillId: String?
}

struct TechniqueTransition {
    let tools: [String]
    let input: String
    let outputs: [String]
    let onePerAction: Bool
    let resultItemId: String
}

struct CombineTransition {
    let inputs: [String]
    let resultItemId: String
}

struct TransitionIndex {
    var byTechnique: [String: [String: TechniqueTransition]] = [:]
    var byCombine: [String: CombineTransition] = [:]
}

struct CabinetItem: Identifiable {
    let id: String
    let name: String
    let emoji: String
    let category: String
    let stateKey: String
    let description: String
    let isRecent: Bool
}

struct PendingDiscovery: Identifiable {
    let id: String
    let name: String
    let emoji: String
    let description: String
    let blurb: String
    let trackId: String
    let expAwarded: Int
    let remaining: Int
}

struct SkillCard: Identifiable {
    let id: String
    let title: String
    let detail: String
    let percent: Float
    let locked: Bool
}

enum SidebarTab: String, CaseIterable {
    case cabinet = "Pantry"
    case skills = "Skills"
    case journal = "Journal"
    case trophies = "Trophies"
}

enum CookingMethod: String, CaseIterable {
    case combine, separate, force, change
}

@MainActor
final class GameEngine: ObservableObject {
    static let methodOrder: [CookingMethod] = [.combine, .separate, .force, .change]
    static let maxRecent = 5

    @Published private(set) var discovered: Set<String> = []
    @Published var counter: [String] = []
    @Published var selectedCounterIndex: Int?
    @Published var activeAction = "combine"
    @Published var activeSkillId: String?
    @Published var searchTerm = ""
    @Published var stateFilters: Set<String> = []
    @Published var typeFilters: Set<String> = []
    @Published var sidebarTab: SidebarTab = .cabinet
    @Published var message = ""
    @Published var toast = ""
    @Published var soundEnabled = true
    @Published var pendingDiscovery: PendingDiscovery?
    @Published var pendingAchievement: AchievementDefinition?
    @Published private(set) var achievementUnlocks: [String: UInt64] = [:]
    @Published var recent: [String] = []
    @Published private(set) var discoveryLog: [DiscoveryLogEntry] = []

    private var bundle: GameBundleFile!
    private var achievementEngine: AchievementEngine!
    private var index = TransitionIndex()
    private var xp: [String: Int] = [:]
    private var unlockCache: [String: Bool] = [:]
    private var achievementFlags: Set<String> = []
    private var discoveryQueue: [PendingDiscovery] = []
    private var achievementQueue: [AchievementDefinition] = []
    private var notifiedChangeUnlock = false
    private var primitiveIds: Set<String> = []

    init() {
        loadBundle()
        loadSave()
        selectMethod(.combine, userInitiated: false)
    }

    private var saveURL: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("culinary-save.json")
    }

    var statsText: String {
        let total = bundle.discoverable.count
        let count = discovered.filter { bundle.discoverable[$0] != nil }.count
        return "\(count) / \(total) discovered"
    }

    func item(_ id: String) -> IngredientItem? {
        bundle.discoverable[id]
            ?? bundle.starters.first { $0.id == id }
            ?? bundle.unlockables.first { $0.id == id }
    }

    func label(_ id: String) -> String {
        guard let item = item(id) else { return id }
        return "\(item.emoji) \(item.name)"
    }

    var cabinetItems: [CabinetItem] {
        var items: [CabinetItem] = []
        for starter in bundle.starters { items.append(toCabinetItem(starter)) }
        for id in discovered {
            if let item = bundle.discoverable[id] { items.append(toCabinetItem(item)) }
        }
        return items.filter { matchesSearch($0) && matchesStateFilter($0) && matchesTypeFilter($0) }
    }

    var ingredientTypes: [String] {
        var types = Set<String>()
        for item in cabinetItems { if !item.category.isEmpty { types.insert(item.category) } }
        let preferred = ["Liquids", "Produce", "Forage", "Proteins", "Pantry"]
        var out = preferred.filter { types.contains($0) }
        out.append(contentsOf: types.filter { !preferred.contains($0) }.sorted())
        return out
    }

    func isPlayerActionUnlocked(_ actionId: String) -> Bool {
        guard let action = bundle.progression.playerActions[actionId],
              let needed = action.unlockCriteria?.discoveredRecipes else { return true }
        return discoveredRecipeCount >= needed
    }

    func isPlayerActionUnlocked(_ method: CookingMethod) -> Bool {
        isPlayerActionUnlocked(method.rawValue)
    }

    private var discoveredRecipeCount: Int {
        discovered.filter { bundle.discoverable[$0]?.isRecipe == true }.count
    }

    func selectMethod(_ method: CookingMethod, userInitiated: Bool) {
        guard isPlayerActionUnlocked(method) else {
            message = methodLockHint(method)
            return
        }
        switch method {
        case .combine, .separate: activeAction = method.rawValue
        case .force: activeAction = "smash"
        case .change: activeAction = "thermal"
        }
        activeSkillId = defaultSkill(for: method)
        if userInitiated { message = "Mode: \(method.rawValue)" }
    }

    func setMoveMode() {
        activeAction = "move"
        activeSkillId = nil
    }

    func methodSkillOptions(_ method: CookingMethod) -> [(id: String, name: String, emoji: String, category: String)] {
        guard let action = bundle.progression.playerActions[method.rawValue] else { return [] }
        if method == .combine || method == .separate {
            return [(method.rawValue, action.name, action.emoji, method.rawValue)]
        }
        var options: [(String, String, String, String)] = []
        for category in action.categories ?? [] {
            for (id, tier) in bundle.progression.techniques where tier.category == category && isUnlocked(id) {
                options.append((id, tier.name, tier.emoji, category))
            }
        }
        return options
    }

    func methodLockHint(_ method: CookingMethod) -> String {
        guard let action = bundle.progression.playerActions[method.rawValue],
              let needed = action.unlockCriteria?.discoveredRecipes else {
            return "Locked"
        }
        let have = discoveredRecipeCount
        let remaining = max(0, needed - have)
        return "\(action.name) unlocks after \(remaining) more finalized recipe(s) (\(have)/\(needed))"
    }

    private func defaultSkill(for method: CookingMethod) -> String? {
        guard let action = bundle.progression.playerActions[method.rawValue] else { return nil }
        if method == .combine || method == .separate { return nil }
        if let starter = action.starterSkill, isUnlocked(starter) { return starter }
        return methodSkillOptions(method).first?.id
    }

    private func activeToolId() -> String {
        if activeAction == "combine" || activeAction == "separate" { return activeAction }
        return activeSkillId ?? "smash"
    }

    func addToCounter(_ id: String) {
        counter.append(id)
        selectedCounterIndex = nil
    }

    func clearCounter() { counter.removeAll(); selectedCounterIndex = nil }

    func removeFromCounter(at index: Int) {
        guard counter.indices.contains(index) else { return }
        counter.remove(at: index)
        selectedCounterIndex = nil
    }

    func onCounterTap(at index: Int) {
        if activeAction == "move" {
            selectedCounterIndex = selectedCounterIndex == index ? nil : index
            return
        }
        if activeAction == "combine" {
            if let first = selectedCounterIndex, first != index {
                tryCombine(a: first, b: index)
                return
            }
            selectedCounterIndex = index
            return
        }
        applyTechnique(at: index)
    }

    func applyActionToCounter() {
        if activeAction == "combine" { applyCombineAll(); return }
        if activeAction == "separate" {
            for i in (0..<counter.count).reversed() { applyTechnique(at: i) }
            return
        }
        if let skill = activeSkillId {
            for i in (0..<counter.count).reversed() {
                activeSkillId = skill
                applyTechnique(at: i)
            }
        }
    }

    private func applyCombineAll() {
        var combined = true
        while combined {
            combined = false
            let len = counter.count
            outer: for i in 0..<len {
                for j in (i + 1)..<len {
                    if tryCombine(a: i, b: j) { combined = true; break outer }
                }
            }
        }
    }

    @discardableResult
    private func tryCombine(a: Int, b: Int) -> Bool {
        guard a != b, counter.indices.contains(a), counter.indices.contains(b) else { return false }
        let result = matchCombine([counter[a], counter[b]])
        guard result.success, let resultId = result.resultId else {
            message = "Those ingredients do not combine."
            selectedCounterIndex = nil
            return false
        }
        let isNew = !discovered.contains(resultId)
        let hi = max(a, b), lo = min(a, b)
        counter.remove(at: hi)
        counter.remove(at: lo)
        counter.append(resultId)
        selectedCounterIndex = nil
        addXP("combine", 1)
        _ = setAchievementFlag("combine_success")
        if isNew {
            addXP("separate", 1)
            registerDiscovery(resultId, trackId: "combine", exp: 1)
        } else {
            message = "Combined into \(label(resultId))"
            checkAchievements()
            persist()
        }
        checkChangeUnlock()
        return true
    }

    @discardableResult
    private func applyTechnique(at index: Int) -> Bool {
        guard counter.indices.contains(index) else { return false }
        let inputId = counter[index]
        let toolId = activeToolId()
        let result = matchTechnique(inputId: inputId, toolId: toolId)
        if let locked = result.lockedSkillId {
            message = "\(locked) is locked"
            return false
        }
        guard result.success, !result.resultIds.isEmpty else {
            message = "\(toolId) does not work on \(label(inputId))"
            return false
        }
        let newIds = result.resultIds.filter { !discovered.contains($0) }
        counter.remove(at: index)
        counter.append(contentsOf: result.resultIds)
        selectedCounterIndex = nil
        if toolId != "combine" && toolId != "separate" { addXP(toolId, 1) }
        if !newIds.isEmpty {
            addXP("separate", 1)
            for id in newIds { registerDiscovery(id, trackId: toolId, exp: 1) }
        } else {
            message = "Applied \(toolId) to \(label(inputId))"
            checkAchievements()
            persist()
        }
        checkChangeUnlock()
        return true
    }

    private func registerDiscovery(_ id: String, trackId: String, exp: Int) {
        discovered.insert(id)
        recordRecent(id)
        recordLog(id)
        guard let item = item(id) else { return }
        let blurb = item.blurb ?? item.tip ?? item.description ?? "Keep experimenting."
        discoveryQueue.append(PendingDiscovery(
            id: id, name: item.name, emoji: item.emoji,
            description: item.description ?? "", blurb: blurb,
            trackId: trackId, expAwarded: exp, remaining: 0
        ))
        pumpDiscoveryQueue()
        checkAchievements()
        persist()
    }

    func achievementSummary() -> (unlocked: Int, total: Int) {
        (achievementUnlocks.count, achievementEngine.definitions.count)
    }

    func trophyCards() -> [TrophyCard] {
        achievementEngine.definitions.map { def in
            TrophyCard(
                id: def.id,
                name: def.name,
                emoji: def.emoji,
                description: def.description,
                hint: def.hint ?? "",
                unlocked: achievementUnlocks[def.id] != nil
            )
        }
    }

    func dismissDiscovery() {
        pendingDiscovery = nil
        pumpDiscoveryQueue()
        pumpAchievementQueue()
    }

    func dismissAchievement() {
        pendingAchievement = nil
        pumpAchievementQueue()
    }

    func trackExpSummary(_ trackId: String) -> (label: String, current: Int, max: Int, percent: Float) {
        let maxExp = bundle.progression.maxSkillExp == 0 ? 99 : bundle.progression.maxSkillExp
        let current = min(xp[trackId] ?? 0, maxExp)
        let label: String = {
            if let tier = bundle.progression.techniques[trackId] {
                return "\(tier.emoji) \(tier.name)"
            }
            if let action = bundle.progression.playerActions.values.first(where: { $0.mode == trackId }) {
                return "\(action.emoji) \(action.name)"
            }
            return trackId
        }()
        return (label, current, maxExp, Float(current) / Float(maxExp))
    }

    func skillGroups() -> [(title: String, cards: [SkillCard])] {
        var groups: [(String, [SkillCard])] = []
        for method in Self.methodOrder {
            guard isPlayerActionUnlocked(method),
                  let action = bundle.progression.playerActions[method.rawValue] else { continue }
            var cards: [SkillCard] = []
            if let mode = action.mode {
                let s = trackExpSummary(mode)
                cards.append(SkillCard(id: mode, title: "\(s.label) Practice", detail: "\(s.current) / \(s.max) exp", percent: s.percent, locked: false))
            }
            for opt in methodSkillOptions(method) {
                let locked = !isUnlocked(opt.id)
                let s = locked ? (opt.name, 0, 99, Float(0)) : trackExpSummary(opt.id)
                cards.append(SkillCard(
                    id: opt.id,
                    title: "\(opt.emoji) \(opt.name)",
                    detail: locked ? "Locked" : "\(s.1) / \(s.2) exp",
                    percent: s.3,
                    locked: locked
                ))
            }
            if !cards.isEmpty { groups.append(("\(action.emoji) \(action.name)", cards)) }
        }
        return groups
    }

    func resetProgress() {
        discovered = Set(bundle.starters.map(\.id))
        recent = []
        discoveryLog = []
        counter = []
        xp = [:]
        achievementUnlocks = [:]
        achievementFlags.removeAll()
        achievementQueue = []
        pendingAchievement = nil
        for key in bundle.progression.techniques.keys { xp[key] = 0 }
        for action in bundle.progression.playerActions.values {
            if let mode = action.mode { xp[mode] = 0 }
        }
        unlockCache.removeAll()
        selectMethod(.combine, userInitiated: false)
        toast = "Progress reset."
        persist()
    }

    func exportSave() -> URL? {
        let save = buildSave()
        guard let data = try? JSONEncoder().encode(save) else { return nil }
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("culinary-alchemy-save.json")
        try? data.write(to: url)
        return url
    }

    func importSave(from url: URL) {
        guard let data = try? Data(contentsOf: url),
              let save = try? JSONDecoder().decode(GameSaveFile.self, from: data) else { return }
        applySave(save)
        persist()
    }

    // MARK: - Private

    private func loadBundle() {
        guard let url = Bundle.main.url(forResource: "game_bundle", withExtension: "json", subdirectory: "game"),
              let data = try? Data(contentsOf: url),
              let decoded = try? JSONDecoder().decode(GameBundleFile.self, from: data) else {
            message = "Failed to load game_bundle.json"
            return
        }
        bundle = decoded
        achievementEngine = AchievementEngine(
            definitions: decoded.achievements,
            rules: decoded.achievementRules
        )
        discovered = Set(decoded.starters.map(\.id))
        primitiveIds = Set(decoded.starters.map(\.id) + decoded.unlockables.map(\.id))
        for key in decoded.progression.techniques.keys { xp[key] = 0 }
        for action in decoded.progression.playerActions.values {
            if let mode = action.mode { xp[mode] = 0 }
        }
        guard let tURL = Bundle.main.url(forResource: "transitions", withExtension: "json", subdirectory: "game"),
              let tData = try? Data(contentsOf: tURL),
              let raw = try? JSONDecoder().decode([RawTransition].self, from: tData) else {
            message = "Failed to load transitions.json"
            return
        }
        index = Self.buildIndex(raw)
    }

    private func toCabinetItem(_ item: IngredientItem) -> CabinetItem {
        let stateKey = ingredientState(item)
        return CabinetItem(
            id: item.id, name: item.name, emoji: item.emoji,
            category: item.category ?? "", stateKey: stateKey,
            description: item.description ?? item.tip ?? item.blurb ?? "",
            isRecent: recent.contains(item.id)
        )
    }

    private func ingredientState(_ item: IngredientItem) -> String {
        let origin = item.origin ?? "processed"
        if origin == "primitive" { return "primal" }
        if origin == "raw" { return "raw" }
        if item.isRecipe && discovered.contains(item.id) { return "recipe" }
        if bundle.discoverable[item.id] != nil && discovered.contains(item.id) { return "prepared" }
        if origin == "processed" { return "prepared" }
        return "primal"
    }

    private func matchesSearch(_ item: CabinetItem) -> Bool {
        let term = searchTerm.trimmingCharacters(in: .whitespaces).lowercased()
        guard !term.isEmpty else { return true }
        return item.name.lowercased().contains(term)
            || item.id.lowercased().contains(term)
            || item.category.lowercased().contains(term)
    }

    private func matchesStateFilter(_ item: CabinetItem) -> Bool {
        if stateFilters.isEmpty { return true }
        if stateFilters.contains("recent") && item.isRecent { return true }
        return stateFilters.contains(item.stateKey)
    }

    private func matchesTypeFilter(_ item: CabinetItem) -> Bool {
        if typeFilters.isEmpty { return true }
        return typeFilters.contains(item.category)
    }

    private func addXP(_ skillId: String, _ amount: Int) {
        let maxExp = bundle.progression.maxSkillExp == 0 ? 99 : bundle.progression.maxSkillExp
        let previouslyLocked = bundle.progression.techniques.keys.filter { !isUnlocked($0) }
        xp[skillId, default: 0] = min((xp[skillId] ?? 0) + amount, maxExp)
        unlockCache.removeAll()
        let newlyUnlocked = previouslyLocked.filter { isUnlocked($0) }
        for skillId in newlyUnlocked {
            if let tier = bundle.progression.techniques[skillId] {
                toast = "\(tier.emoji) \(tier.name) unlocked!"
            }
        }
        if !newlyUnlocked.isEmpty {
            checkAchievements()
        }
    }

    @discardableResult
    private func setAchievementFlag(_ flag: String) -> [String] {
        guard achievementFlags.insert(flag).inserted else { return [] }
        return checkAchievements()
    }

    private func achievementContext() -> AchievementEvaluationContext {
        AchievementEvaluationContext(
            discovered: discovered,
            discoveryLogLength: discoveryLog.count,
            primitiveIds: primitiveIds,
            discoverable: bundle.discoverable,
            xp: xp,
            flags: achievementFlags,
            unlockedIds: Set(achievementUnlocks.keys),
            isSkillUnlocked: { self.isUnlocked($0) },
            isActionUnlocked: { self.isPlayerActionUnlocked($0) }
        )
    }

    @discardableResult
    private func checkAchievements() -> [String] {
        let pending = achievementEngine.pendingUnlocks(achievementContext())
        guard !pending.isEmpty else { return pending }
        let now = UInt64(Date().timeIntervalSince1970 * 1000)
        for id in pending {
            achievementUnlocks[id] = now
            if let def = achievementEngine.definitions.first(where: { $0.id == id }) {
                achievementQueue.append(def)
            }
        }
        pumpAchievementQueue()
        return pending
    }

    private func pumpAchievementQueue() {
        guard pendingAchievement == nil, pendingDiscovery == nil, !achievementQueue.isEmpty else { return }
        pendingAchievement = achievementQueue.removeFirst()
    }

    private func isUnlocked(_ skillId: String) -> Bool {
        if let cached = unlockCache[skillId] { return cached }
        guard let skill = bundle.progression.techniques[skillId] else {
            unlockCache[skillId] = false
            return false
        }
        if let prereqs = skill.unlockCriteria?.prerequisites {
            for (parent, needed) in prereqs where (xp[parent] ?? 0) < needed {
                unlockCache[skillId] = false
                return false
            }
        }
        let unlocked = skill.dependsOn.isEmpty || skill.dependsOn.allSatisfy { isUnlocked($0) }
        unlockCache[skillId] = unlocked
        return unlocked
    }

    private func matchCombine(_ inputIds: [String]) -> MatchResult {
        let key = inputIds.sorted().joined(separator: ",")
        guard let t = index.byCombine[key] else {
            return MatchResult(success: false, resultId: nil, resultIds: [], lockedSkillId: nil)
        }
        return MatchResult(success: true, resultId: t.resultItemId, resultIds: [t.resultItemId], lockedSkillId: nil)
    }

    private func matchTechnique(inputId: String, toolId: String) -> MatchResult {
        let isAction = bundle.progression.playerActions.values.contains { $0.mode == toolId }
        let skill = bundle.progression.techniques[toolId]
        if skill == nil && !isAction {
            return MatchResult(success: false, resultId: nil, resultIds: [], lockedSkillId: nil)
        }
        if let skill, !isUnlocked(toolId) {
            return MatchResult(success: false, resultId: nil, resultIds: [], lockedSkillId: toolId)
        }
        let actions = isAction ? [toolId] : (skill?.actions ?? [])
        for action in actions {
            guard let byInput = index.byTechnique[action], let t = byInput[inputId] else { continue }
            var outputs = t.outputs.isEmpty ? [t.resultItemId] : t.outputs
            if t.onePerAction && outputs.count > 1 {
                let undiscovered = outputs.filter { !discovered.contains($0) }
                if undiscovered.isEmpty { continue }
                outputs = [undiscovered[0]]
            }
            let valid = outputs.filter { bundle.discoverable[$0] != nil }
            if valid.isEmpty { continue }
            return MatchResult(success: true, resultId: valid[0], resultIds: valid, lockedSkillId: nil)
        }
        return MatchResult(success: false, resultId: nil, resultIds: [], lockedSkillId: nil)
    }

    private func recordRecent(_ id: String) {
        recent.removeAll { $0 == id }
        recent.insert(id, at: 0)
        if recent.count > Self.maxRecent { recent = Array(recent.prefix(Self.maxRecent)) }
    }

    private func recordLog(_ id: String) {
        if primitiveIds.contains(id) || discoveryLog.contains(where: { $0.id == id }) { return }
        let now = UInt64(Date().timeIntervalSince1970 * 1000)
        discoveryLog.insert(DiscoveryLogEntry(id: id, discoveredAt: now), at: 0)
    }

    private func pumpDiscoveryQueue() {
        guard pendingDiscovery == nil, !discoveryQueue.isEmpty else { return }
        var next = discoveryQueue.removeFirst()
        next = PendingDiscovery(
            id: next.id, name: next.name, emoji: next.emoji,
            description: next.description, blurb: next.blurb,
            trackId: next.trackId, expAwarded: next.expAwarded,
            remaining: discoveryQueue.count
        )
        pendingDiscovery = next
    }

    private func checkChangeUnlock() {
        guard !notifiedChangeUnlock, isPlayerActionUnlocked(.change) else { return }
        notifiedChangeUnlock = true
        toast = "Transform unlocked!"
        checkAchievements()
    }

    private func buildSave() -> GameSaveFile {
        GameSaveFile(
            version: 1, game: "culinary-alchemy",
            exportedAt: UInt64(Date().timeIntervalSince1970 * 1000),
            discovery: DiscoverySaveData(
                discovered: Array(discovered), recent: recent,
                highlights: [], discoveryLog: discoveryLog
            ),
            progression: ProgressionState(xp: xp, milestonesReached: []),
            achievements: AchievementsSaveData(
                unlocked: achievementUnlocks.map { AchievementUnlock(id: $0.key, unlockedAt: $0.value) }
                    .sorted { $0.id < $1.id },
                flags: Array(achievementFlags).sorted()
            ),
            settings: SaveSettings(soundEnabled: soundEnabled, reducedMotion: nil)
        )
    }

    private func persist() {
        guard let data = try? JSONEncoder().encode(buildSave()) else { return }
        try? data.write(to: saveURL)
    }

    private func loadSave() {
        guard FileManager.default.fileExists(atPath: saveURL.path),
              let data = try? Data(contentsOf: saveURL),
              let save = try? JSONDecoder().decode(GameSaveFile.self, from: data) else { return }
        applySave(save)
    }

    private func applySave(_ save: GameSaveFile) {
        discovered = Set(save.discovery.discovered)
        for s in bundle.starters { discovered.insert(s.id) }
        for u in bundle.unlockables { discovered.insert(u.id) }
        recent = save.discovery.recent
        discoveryLog = save.discovery.discoveryLog
        xp = save.progression.xp
        soundEnabled = save.settings.soundEnabled
        if let achievements = save.achievements {
            achievementUnlocks = Dictionary(
                uniqueKeysWithValues: achievements.unlocked.map { ($0.id, $0.unlockedAt) }
            )
            achievementFlags = Set(achievements.flags)
        } else {
            achievementUnlocks = [:]
            achievementFlags = []
        }
        unlockCache.removeAll()
        toast = "Save loaded."
    }

    private static func buildIndex(_ raw: [RawTransition]) -> TransitionIndex {
        var index = TransitionIndex()
        for t in raw {
            if t.kind == "technique", let input = t.input {
                let tr = TechniqueTransition(
                    tools: t.tools, input: input, outputs: t.outputs,
                    onePerAction: t.onePerAction, resultItemId: t.resultItemId
                )
                for tool in t.tools {
                    if index.byTechnique[tool] == nil { index.byTechnique[tool] = [:] }
                    index.byTechnique[tool]?[input] = tr
                }
            } else if t.kind == "combine", !t.inputs.isEmpty {
                let key = t.inputs.sorted().joined(separator: ",")
                index.byCombine[key] = CombineTransition(inputs: t.inputs, resultItemId: t.resultItemId)
            }
        }
        return index
    }
}
