package com.culinaryalchemy.app

import android.content.Context
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.io.IOException

@Serializable
data class IngredientItem(
    val id: String,
    val name: String,
    val emoji: String,
    val type: String? = null,
    val origin: String? = null,
    val category: String? = null,
    val description: String? = null
) {
    val isRecipe: Boolean get() = type == "recipe"
}

@Serializable
data class TechniqueTier(
    val name: String,
    val emoji: String,
    val category: String,
    val dependsOn: List<String> = emptyList(),
    val actions: List<String> = emptyList(),
    val unlockCriteria: UnlockCriteria? = null
)

@Serializable
data class UnlockCriteria(
    val prerequisites: Map<String, Int> = emptyMap()
)

@Serializable
data class PlayerAction(
    val name: String,
    val emoji: String,
    val mode: String? = null
)

@Serializable
data class ProgressionConfig(
    val techniques: Map<String, TechniqueTier>,
    val playerActions: Map<String, PlayerAction>,
    val maxSkillExp: Int
)

@Serializable
data class GameBundleFile(
    val version: Int,
    val starters: List<IngredientItem>,
    val unlockables: List<IngredientItem>,
    val discoverable: Map<String, IngredientItem>,
    val progression: ProgressionConfig
)

@Serializable
data class RawTransition(
    val id: String,
    val kind: String,
    val tools: List<String> = emptyList(),
    val input: String? = null,
    val inputs: List<String> = emptyList(),
    val outputs: List<String> = emptyList(),
    val onePerAction: Boolean = false,
    val resultItemId: String
)

private data class MatchResult(
    val success: Boolean,
    val resultId: String? = null,
    val resultIds: List<String> = emptyList(),
    val lockedSkillId: String? = null
)

private data class TechniqueTransition(
    val tools: List<String>,
    val input: String,
    val outputs: List<String>,
    val onePerAction: Boolean,
    val resultItemId: String
)

private data class CombineTransition(
    val inputs: List<String>,
    val resultItemId: String
)

private data class TransitionIndex(
    val byTechnique: MutableMap<String, MutableMap<String, TechniqueTransition>> = mutableMapOf(),
    val byCombine: MutableMap<String, CombineTransition> = mutableMapOf()
)

class GameEngine(context: Context) {
    private val json = Json { ignoreUnknownKeys = true }

    private lateinit var bundle: GameBundleFile
    private var index = TransitionIndex()
    private val xp = mutableMapOf<String, Int>()
    private val unlockCache = mutableMapOf<String, Boolean>()

    var discovered: MutableSet<String> = mutableSetOf()
        private set

    var counter: MutableList<String> = mutableListOf()
    var selectedCounterIndex: Int? = null
    var activeTool: String = "smash"
    var message: String = "Native Android — no webview."

    val cabinetItems: List<String>
        get() = discovered.sorted()

    val unlockedTools: List<Pair<String, String>>
        get() {
            val tools = mutableListOf<Pair<String, String>>()
            bundle.progression.techniques.forEach { (id, tier) ->
                if (isUnlocked(id)) {
                    tools += id to "${tier.emoji} ${tier.name}"
                }
            }
            bundle.progression.playerActions.forEach { (_, action) ->
                action.mode?.let { mode ->
                    tools += mode to "${action.emoji} ${action.name}"
                }
            }
            return tools
        }

    init {
        load(context)
    }

    private fun load(context: Context) {
        try {
            val bundleText = readAsset(context, "game/game_bundle.json")
            val decoded = json.decodeFromString<GameBundleFile>(bundleText)
            bundle = decoded
            discovered = decoded.starters.map { it.id }.toMutableSet()
            decoded.progression.techniques.keys.forEach { xp[it] = 0 }
            decoded.progression.playerActions.values.forEach { action ->
                action.mode?.let { xp[it] = 0 }
            }

            val transitionsText = readAsset(context, "game/transitions.json")
            val raw = json.decodeFromString<List<RawTransition>>(transitionsText)
            index = buildIndex(raw)
            message = "Loaded ${decoded.discoverable.size} discoverable items."
        } catch (error: Exception) {
            message = when (error) {
                is IOException -> "Failed to load game assets. Run npm run android:assets."
                else -> "Failed to load game data: ${error.message}"
            }
        }
    }

    private fun readAsset(context: Context, path: String): String {
        return context.assets.open(path).bufferedReader().use { it.readText() }
    }

    fun item(id: String): IngredientItem? {
        if (!::bundle.isInitialized) return null
        return bundle.discoverable[id]
            ?: bundle.starters.firstOrNull { it.id == id }
            ?: bundle.unlockables.firstOrNull { it.id == id }
    }

    fun label(id: String): String {
        val ingredient = item(id) ?: return id
        return "${ingredient.emoji} ${ingredient.name}"
    }

    fun addToCounter(id: String) {
        counter.add(id)
    }

    fun removeFromCounter(index: Int) {
        if (index !in counter.indices) return
        counter.removeAt(index)
        selectedCounterIndex = null
    }

    fun selectCounter(index: Int) {
        val first = selectedCounterIndex
        if (first != null && first != index) {
            tryCombine(first, index)
            return
        }
        selectedCounterIndex = if (selectedCounterIndex == index) null else index
    }

    fun applyTool(index: Int) {
        if (index !in counter.indices) return
        val inputId = counter[index]
        val result = matchTechnique(inputId, activeTool)
        if (result.success && result.resultId != null) {
            discovered.addAll(result.resultIds)
            message = "Discovered ${label(result.resultId)}"
        } else if (result.lockedSkillId != null) {
            message = "${result.lockedSkillId} is locked"
        } else {
            message = "$activeTool does not work on ${label(inputId)}"
        }
    }

    private fun tryCombine(a: Int, b: Int) {
        if (a == b || a !in counter.indices || b !in counter.indices) return
        val result = matchCombine(listOf(counter[a], counter[b]))
        if (result.success && result.resultId != null) {
            discovered.add(result.resultId)
            val hi = maxOf(a, b)
            val lo = minOf(a, b)
            counter.removeAt(hi)
            counter.removeAt(lo)
            counter.add(result.resultId)
            selectedCounterIndex = null
            message = "Combined into ${label(result.resultId)}"
        } else {
            selectedCounterIndex = null
            message = "Those ingredients do not combine."
        }
    }

    private fun isActionMode(skillId: String): Boolean {
        return bundle.progression.playerActions.values.any { it.mode == skillId }
    }

    private fun isUnlocked(skillId: String): Boolean {
        unlockCache[skillId]?.let { return it }
        val skill = bundle.progression.techniques[skillId]
        if (skill == null) {
            unlockCache[skillId] = false
            return false
        }
        skill.unlockCriteria?.prerequisites?.forEach { (parent, needed) ->
            if ((xp[parent] ?: 0) < needed) {
                unlockCache[skillId] = false
                return false
            }
        }
        val unlocked = skill.dependsOn.isEmpty() || skill.dependsOn.all { isUnlocked(it) }
        unlockCache[skillId] = unlocked
        return unlocked
    }

    private fun matchCombine(inputIds: List<String>): MatchResult {
        val key = inputIds.sorted().joinToString(",")
        val transition = index.byCombine[key]
            ?: return MatchResult(success = false)
        return MatchResult(
            success = true,
            resultId = transition.resultItemId,
            resultIds = listOf(transition.resultItemId)
        )
    }

    private fun matchTechnique(inputId: String, toolId: String): MatchResult {
        val isAction = isActionMode(toolId)
        val skill = bundle.progression.techniques[toolId]
        if (skill == null && !isAction) {
            return MatchResult(success = false)
        }
        if (skill != null && !isUnlocked(toolId)) {
            return MatchResult(success = false, lockedSkillId = toolId)
        }
        val actions = if (isAction) listOf(toolId) else skill?.actions.orEmpty()
        for (action in actions) {
            val transition = index.byTechnique[action]?.get(inputId) ?: continue
            var outputs = transition.outputs.ifEmpty { listOf(transition.resultItemId) }
            if (transition.onePerAction && outputs.size > 1) {
                val undiscovered = outputs.filter { it !in discovered }
                if (undiscovered.isEmpty()) continue
                outputs = listOf(undiscovered.first())
            }
            val valid = outputs.filter { bundle.discoverable.containsKey(it) }
            if (valid.isEmpty()) continue
            return MatchResult(
                success = true,
                resultId = valid.first(),
                resultIds = valid
            )
        }
        return MatchResult(success = false)
    }

    private fun buildIndex(raw: List<RawTransition>): TransitionIndex {
        val built = TransitionIndex()
        raw.forEach { transition ->
            when (transition.kind) {
                "technique" -> {
                    val input = transition.input ?: return@forEach
                    val technique = TechniqueTransition(
                        tools = transition.tools,
                        input = input,
                        outputs = transition.outputs,
                        onePerAction = transition.onePerAction,
                        resultItemId = transition.resultItemId
                    )
                    transition.tools.forEach { tool ->
                        val byInput = built.byTechnique.getOrPut(tool) { mutableMapOf() }
                        byInput[input] = technique
                    }
                }
                "combine" -> {
                    if (transition.inputs.isEmpty()) return@forEach
                    val key = transition.inputs.sorted().joinToString(",")
                    built.byCombine[key] = CombineTransition(
                        inputs = transition.inputs,
                        resultItemId = transition.resultItemId
                    )
                }
            }
        }
        return built
    }
}
