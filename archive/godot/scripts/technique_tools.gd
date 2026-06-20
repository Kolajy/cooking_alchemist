extends Node

const UI_TO_METHOD := {
	"separate": "separate",
	"force": "force",
	"combine": "combine",
	"heat": "change",
	"time": "time"
}

const METHOD_ORDER := ["separate", "force", "combine", "heat", "time"]
const MAIN_UI_ACTIONS := ["separate", "force", "combine", "heat", "time"]


func get_method_for_ui_action(ui_action: String) -> String:
	return UI_TO_METHOD.get(ui_action, ui_action)


func get_active_method() -> String:
	var action := GameState.active_action
	if action in MAIN_UI_ACTIONS:
		return get_method_for_ui_action(action)
	return get_method_for_category(action)


func get_method_for_category(category: String) -> String:
	for ui_action in MAIN_UI_ACTIONS:
		var method := get_method_for_ui_action(ui_action)
		if method == category:
			return method
		var cfg: Dictionary = Database.player_actions.get(method, {})
		if category in cfg.get("categories", []):
			return method
	return category


func is_player_action_unlocked(action_id: String) -> bool:
	var cfg: Dictionary = Database.player_actions.get(action_id, {})
	var criteria: Dictionary = cfg.get("unlockCriteria", {})
	if criteria.is_empty():
		return true
	if criteria.has("discoveredRecipes"):
		if GameState.get_unlocked_recipes_count() < int(criteria.discoveredRecipes):
			return false
	for req_id in criteria.get("requiredIngredients", []):
		if not GameState.is_discovered(str(req_id)):
			return false
	return true


func is_skill_unlocked_by_id(skill_id: String) -> bool:
	var skill := _find_skill_definition(skill_id)
	if skill.is_empty():
		return false
	return _is_skill_unlocked(skill_id, skill)


func is_method_locked(ui_action: String) -> bool:
	var method = get_method_for_ui_action(ui_action)
	var cfg: Dictionary = Database.player_actions.get(method, {})
	var criteria: Dictionary = cfg.get("unlockCriteria", {})
	if criteria.has("discoveredRecipes"):
		if GameState.get_unlocked_recipes_count() < int(criteria.discoveredRecipes):
			return true
	for req_id in criteria.get("requiredIngredients", []):
		if not GameState.is_discovered(str(req_id)):
			return true
	return false


func get_skill_options(ui_action: String) -> Array:
	var method = get_method_for_ui_action(ui_action)
	var cfg: Dictionary = Database.player_actions.get(method, {})
	var options: Array = []

	if method == "separate":
		options.append({
			"id": "separate",
			"name": cfg.get("name", "Separate"),
			"emoji": cfg.get("emoji", "🔪"),
			"tools": ["separate"]
		})
	elif method == "combine":
		return options

	for category in cfg.get("categories", []):
		var cat_data: Dictionary = Database.technique_categories.get(category, {})
		var techniques: Dictionary = cat_data.get("techniques", {})
		for skill_id in techniques.keys():
			var skill: Dictionary = techniques[skill_id]
			if not _is_skill_unlocked(skill_id, skill):
				continue
			options.append({
				"id": skill_id,
				"name": skill.get("name", skill_id),
				"emoji": skill.get("emoji", "✨"),
				"tools": skill.get("actions", [])
			})

	if options.is_empty() and cfg.has("starterSkill"):
		var starter_id = str(cfg.starterSkill)
		var starter = _find_skill_definition(starter_id)
		if not starter.is_empty():
			options.append({
				"id": starter_id,
				"name": starter.get("name", starter_id),
				"emoji": starter.get("emoji", "✨"),
				"tools": starter.get("actions", [starter_id])
			})

	return options


func get_skill_definition(skill_id: String) -> Dictionary:
	return _find_skill_definition(skill_id)


func _find_skill_definition(skill_id: String) -> Dictionary:
	for category in Database.technique_categories.values():
		var techniques: Dictionary = category.get("techniques", {})
		if techniques.has(skill_id):
			return techniques[skill_id]
	return {}


func _is_skill_unlocked(skill_id: String, skill: Dictionary) -> bool:
	if skill.get("dependsOn", []).is_empty() and not skill.has("unlockCriteria"):
		return true
	var criteria: Dictionary = skill.get("unlockCriteria", {})
	var prerequisites: Dictionary = criteria.get("prerequisites", {})
	for prereq in prerequisites.keys():
		var needed = int(prerequisites[prereq])
		var level = int(GameState.skills_xp.get(prereq, 0)) / 10 + 1
		if level < needed:
			return false
	return true


func get_active_tools() -> Array:
	if GameState.active_action == "combine":
		return []
	var options = get_skill_options(GameState.active_action)
	if options.is_empty():
		return _default_tools_for_action(GameState.active_action)
	for option in options:
		if str(option.id) == GameState.active_skill_id:
			return option.tools
	return options[0].tools if options.size() > 0 else _default_tools_for_action(GameState.active_action)


func _default_tools_for_action(ui_action: String) -> Array:
	match ui_action:
		"separate": return ["separate", "peel", "tear"]
		"force": return ["smash", "pound", "grind"]
		"heat": return ["char", "pan", "oven", "boil"]
		"time": return ["rest", "steep", "ferment"]
	return []


func get_active_skill_label() -> String:
	var options = get_skill_options(GameState.active_action)
	if options.is_empty():
		return ""
	for option in options:
		if str(option.id) == GameState.active_skill_id:
			return "%s %s" % [option.emoji, option.name]
	if options.size() > 0:
		return "%s %s" % [options[0].emoji, options[0].name]
	return ""


func set_default_skill_for_action(ui_action: String) -> void:
	var options = get_skill_options(ui_action)
	GameState.active_skill_id = str(options[0].id) if options.size() > 0 else ""


func cycle_skill(direction: int) -> bool:
	var options = get_skill_options(GameState.active_action)
	if options.size() <= 1:
		return false
	var index = 0
	for i in range(options.size()):
		if str(options[i].id) == GameState.active_skill_id:
			index = i
			break
	index = posmod(index + direction, options.size())
	GameState.active_skill_id = str(options[index].id)
	GameState.emit_signal("action_changed")
	return true


func transition_matches(transition: Dictionary) -> bool:
	var tools: Array = transition.get("tools", [])
	var active_tools = get_active_tools()
	for tool in active_tools:
		if tool in tools:
			return true
	return false


func method_has_playable_content(method_id: String) -> bool:
	var cfg: Dictionary = Database.player_actions.get(method_id, {})
	if cfg.is_empty():
		return true
	if method_id == "combine":
		for transition in Database.transitions:
			if transition.get("kind") == "combine":
				return true
		return false
	if method_id == "separate":
		for transition in Database.transitions:
			if transition.get("kind") != "technique":
				continue
			for tool in transition.get("tools", []):
				if str(tool) in ["separate", "peel", "tear"]:
					return true
		return false
	var tool_ids: Dictionary = {}
	for category in cfg.get("categories", []):
		var cat_data: Dictionary = Database.technique_categories.get(category, {})
		var techniques: Dictionary = cat_data.get("techniques", {})
		for skill_id in techniques.keys():
			var skill: Dictionary = techniques[skill_id]
			for action_id in skill.get("actions", []):
				tool_ids[str(action_id)] = true
	if cfg.has("starterSkill"):
		var starter := _find_skill_definition(str(cfg.starterSkill))
		for action_id in starter.get("actions", []):
			tool_ids[str(action_id)] = true
	for transition in Database.transitions:
		if transition.get("kind") != "technique":
			continue
		for tool in transition.get("tools", []):
			if tool_ids.has(str(tool)):
				return true
	return false


func get_method_lock_hint(ui_action: String) -> String:
	var method := get_method_for_ui_action(ui_action)
	var cfg: Dictionary = Database.player_actions.get(method, {})
	var criteria: Dictionary = cfg.get("unlockCriteria", {})
	if criteria.has("discoveredRecipes"):
		var needed := int(criteria.discoveredRecipes)
		var discovered := GameState.get_unlocked_recipes_count()
		var remaining := maxi(needed - discovered, 0)
		return "%s unlocks after %d more finalized recipe%s (%d/%d)." % [
			cfg.get("name", ui_action),
			remaining,
			"" if remaining == 1 else "s",
			discovered,
			needed
		]
	return "%s is locked." % cfg.get("name", ui_action)
