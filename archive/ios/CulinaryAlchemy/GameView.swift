import SwiftUI
import UniformTypeIdentifiers

struct GameView: View {
    @StateObject private var engine = GameEngine()
    @State private var showImportPicker = false

    var body: some View {
        NavigationStack {
            HStack(spacing: 0) {
                sidebar
                counterPanel
            }
            .navigationTitle("Culinary Alchemy")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { bottomToolbar }
            .overlay(alignment: .top) {
                if !engine.toast.isEmpty {
                    Text(engine.toast)
                        .font(.footnote)
                        .padding(8)
                        .background(.green.opacity(0.2))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .padding()
                        .onTapGesture { engine.toast = "" }
                }
            }
            .sheet(item: $engine.pendingDiscovery) { discovery in
                discoverySheet(discovery)
            }
            .sheet(item: $engine.pendingAchievement) { achievement in
                achievementSheet(achievement)
            }
            .fileImporter(isPresented: $showImportPicker, allowedContentTypes: [.json]) { result in
                if case .success(let url) = result { engine.importSave(from: url) }
            }
        }
    }

    private var sidebar: some View {
        VStack(alignment: .leading, spacing: 8) {
            Picker("Tab", selection: $engine.sidebarTab) {
                ForEach(SidebarTab.allCases, id: \.self) { tab in
                    Text(tab.rawValue).tag(tab)
                }
            }
            .pickerStyle(.segmented)

            Text(engine.statsText)
                .font(.caption)
                .foregroundStyle(.secondary)

            switch engine.sidebarTab {
            case .cabinet: cabinetContent
            case .skills: skillsContent
            case .journal: journalContent
            case .trophies: trophiesContent
            }

            let trophies = engine.achievementSummary()
            Text("Trophies: \(trophies.unlocked) / \(trophies.total)")
                .font(.caption2)
                .foregroundStyle(.secondary)

            Divider()
            HStack {
                Button("Export") {
                    if engine.exportSave() != nil {
                        engine.toast = "Save ready to share from Files."
                    }
                }
                Button("Import") { showImportPicker = true }
                Button("Reset") { engine.resetProgress() }
            }
            .font(.caption)
        }
        .padding()
        .frame(width: 280)
        .background(Color(.secondarySystemBackground))
    }

    private var cabinetContent: some View {
        VStack(alignment: .leading, spacing: 6) {
            TextField("Search pantry…", text: $engine.searchTerm)
                .textFieldStyle(.roundedBorder)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack {
                    ForEach(["primal", "raw", "prepared", "recipe", "recent"], id: \.self) { state in
                        filterChip(state, selected: engine.stateFilters.contains(state)) {
                            toggleFilter(&engine.stateFilters, state)
                        }
                    }
                }
            }
            ScrollView(.horizontal, showsIndicators: false) {
                HStack {
                    ForEach(engine.ingredientTypes, id: \.self) { type in
                        filterChip(type, selected: engine.typeFilters.contains(type)) {
                            toggleFilter(&engine.typeFilters, type)
                        }
                    }
                }
            }
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 6) {
                    ForEach(engine.cabinetItems) { item in
                        Button {
                            engine.addToCounter(item.id)
                        } label: {
                            VStack(alignment: .leading, spacing: 2) {
                                HStack {
                                    Text(item.emoji)
                                    Text(item.name).fontWeight(item.isRecent ? .bold : .regular)
                                    Text("[\(item.stateKey)]").font(.caption2).foregroundStyle(.secondary)
                                }
                                if !item.description.isEmpty {
                                    Text(item.description).font(.caption2).foregroundStyle(.secondary)
                                }
                            }
                        }
                        .buttonStyle(.bordered)
                    }
                }
            }
        }
    }

    private var skillsContent: some View {
        ScrollView {
            ForEach(Array(engine.skillGroups().enumerated()), id: \.offset) { _, group in
                Text(group.title).font(.headline)
                ForEach(group.cards) { card in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(card.title)
                        Text(card.detail).font(.caption).foregroundStyle(.secondary)
                        ProgressView(value: Double(card.percent))
                    }
                    .padding(8)
                    .background(Color(.tertiarySystemFill))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
                Divider()
            }
        }
    }

    private var journalContent: some View {
        ScrollView {
            if engine.discoveryLog.isEmpty {
                Text("Your hearth journal is blank.")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(engine.discoveryLog) { entry in
                    if let item = engine.item(entry.id) {
                        HStack {
                            Text(item.emoji)
                            VStack(alignment: .leading) {
                                Text(item.name)
                                if entry.discoveredAt > 0 {
                                    Text("discovered").font(.caption2).foregroundStyle(.secondary)
                                }
                            }
                        }
                        Divider()
                    }
                }
            }
        }
    }

    private var trophiesContent: some View {
        ScrollView {
            ForEach(engine.trophyCards()) { trophy in
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(trophy.unlocked ? trophy.emoji : "🏆")
                            .opacity(trophy.unlocked ? 1 : 0.35)
                        VStack(alignment: .leading) {
                            Text(trophy.name)
                                .fontWeight(trophy.unlocked ? .semibold : .regular)
                            Text(trophy.description)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        if trophy.unlocked {
                            Text("✓").foregroundStyle(.green)
                        }
                    }
                    if !trophy.unlocked, !trophy.hint.isEmpty {
                        Text(trophy.hint)
                            .font(.caption2)
                            .italic()
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(8)
                .background(Color(.tertiarySystemFill))
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
    }

    private var counterPanel: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Counter").font(.headline)
            Text("Move: select items · Combine: pick two · Techniques: tap item")
                .font(.caption).foregroundStyle(.secondary)
            ScrollView {
                FlowLayout(spacing: 8) {
                    ForEach(Array(engine.counter.enumerated()), id: \.offset) { index, id in
                        HStack(spacing: 4) {
                            Button {
                                engine.onCounterTap(at: index)
                            } label: {
                                Text(engine.label(id))
                                    .padding(8)
                                    .background(engine.selectedCounterIndex == index ? Color.accentColor.opacity(0.2) : Color(.tertiarySystemFill))
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                            }
                            .buttonStyle(.plain)
                            Button("×") { engine.removeFromCounter(at: index) }
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
            HStack {
                Button("Apply to counter") { engine.applyActionToCounter() }
                    .buttonStyle(.borderedProminent)
                Button("Clear") { engine.clearCounter() }
            }
            if let method = activeMethodForSkills() {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack {
                        ForEach(engine.methodSkillOptions(method), id: \.id) { opt in
                            Button {
                                engine.activeSkillId = opt.id
                                engine.activeAction = opt.category
                            } label: {
                                Text("\(opt.emoji) \(opt.name)")
                                    .padding(6)
                                    .background(engine.activeSkillId == opt.id ? Color.accentColor.opacity(0.2) : Color.clear)
                                    .clipShape(Capsule())
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            Text(engine.message).font(.footnote).foregroundStyle(.secondary)
            Spacer()
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var bottomToolbar: some ToolbarContent {
        ToolbarItemGroup(placement: .bottomBar) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack {
                    Button("✋ Move") {
                        engine.setMoveMode()
                    }
                    .padding(6)
                    .background(engine.activeAction == "move" ? Color.accentColor.opacity(0.2) : Color.clear)
                    .clipShape(Capsule())

                    ForEach(GameEngine.methodOrder, id: \.self) { method in
                        let unlocked = engine.isPlayerActionUnlocked(method)
                        let selected = isMethodSelected(method)
                        Button {
                            engine.selectMethod(method, userInitiated: true)
                        } label: {
                            HStack {
                                if let action = actionLabel(method) { Text(action) }
                                if !unlocked { Text("🔒") }
                            }
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(selected ? Color.accentColor.opacity(0.25) : Color.clear)
                            .clipShape(Capsule())
                        }
                        .disabled(!unlocked)
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private func discoverySheet(_ d: PendingDiscovery) -> some View {
        NavigationStack {
            VStack(spacing: 16) {
                Text(d.remaining > 0 ? "New Ingredient (\(d.remaining) more)" : "Congratulations!")
                    .font(.title2)
                Text(d.emoji).font(.system(size: 64))
                Text(d.name).font(.title)
                Text(d.description)
                Text(d.blurb).italic().foregroundStyle(.secondary)
                let s = engine.trackExpSummary(d.trackId)
                Text("\(s.label) +\(d.expAwarded) exp")
                ProgressView(value: Double(s.percent))
                Text("\(s.current) / \(s.max) exp")
                Button("Continue") { engine.dismissDiscovery() }
                    .buttonStyle(.borderedProminent)
            }
            .padding()
        }
        .presentationDetents([.medium])
    }

    private func achievementSheet(_ achievement: AchievementDefinition) -> some View {
        NavigationStack {
            VStack(spacing: 16) {
                Text("Trophy Unlocked!")
                    .font(.title2)
                Text(achievement.emoji).font(.system(size: 64))
                Text(achievement.name).font(.title)
                Text(achievement.description)
                    .multilineTextAlignment(.center)
                Button("Continue") { engine.dismissAchievement() }
                    .buttonStyle(.borderedProminent)
            }
            .padding()
        }
        .presentationDetents([.medium])
    }

    private func activeMethodForSkills() -> CookingMethod? {
        switch engine.activeAction {
        case "combine": return .combine
        case "separate": return .separate
        case "smash": return .force
        case "thermal": return .change
        default: return nil
        }
    }

    private func isMethodSelected(_ method: CookingMethod) -> Bool {
        switch method {
        case .combine, .separate: return engine.activeAction == method.rawValue
        case .force: return engine.activeAction == "smash"
        case .change: return engine.activeAction == "thermal"
        }
    }

    private func actionLabel(_ method: CookingMethod) -> String? {
        // Shown via engine — simplified labels
        switch method {
        case .combine: return "🥣 Combine"
        case .separate: return "🔪 Separate"
        case .force: return "✊ Force"
        case .change: return "🔥 Transform"
        }
    }

    private func filterChip(_ title: String, selected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.caption2)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(selected ? Color.accentColor.opacity(0.25) : Color(.tertiarySystemFill))
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    private func toggleFilter(_ set: inout Set<String>, _ key: String) {
        if set.contains(key) { set.remove(key) } else { set.insert(key) }
    }
}

#Preview {
    GameView()
}
