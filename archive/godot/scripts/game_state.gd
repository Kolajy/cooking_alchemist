extends Node

const AchievementEngine = preload("res://scripts/achievement_engine.gd")
const SaveValidationLib = preload("res://scripts/save_validation.gd")
const WorkspaceHintsLib = preload("res://scripts/workspace_hints.gd")

var discovered_ids: Dictionary = {}
var recently_discovered_ids: Array = []
var discovery_log: Array = []
var recent_highlight_ids: Dictionary = {}
var skills_xp: Dictionary = {}
var discovery_queue: Array = []
var mechanic_queue: Array = []
var achievement_queue: Array = []
var pending_popup_id: String = ""
var achievement_unlocks: Dictionary = {}
var achievement_flags: Dictionary = {}
var milestones_reached: Array = []
var _notified_action_unlocks: Dictionary = {}
var _skill_levels: Dictionary = {}

var active_action: String = "separate"
var active_skill_id: String = ""
var active_main_view: String = "cook"
var active_sidebar_tab: String = "cabinet"
var sound_enabled: bool = true
var reduced_motion: bool = false
var ambience_enabled: bool = false
var seen_help: bool = false

const SAVE_VERSION := 1
const SAVE_GAME_ID := "culinary-alchemy"

signal discovery_changed
signal action_changed
signal discovery_queued(id: String)
signal mechanic_queued
signal achievement_queued

func _ready() -> void:
	load_progress()


func reset_to_starters() -> void:
	discovered_ids.clear()
	recently_discovered_ids.clear()
	discovery_log.clear()
	recent_highlight_ids.clear()
	skills_xp.clear()
	discovery_queue.clear()
	mechanic_queue.clear()
	achievement_queue.clear()
	pending_popup_id = ""
	achievement_unlocks.clear()
	achievement_flags.clear()
	milestones_reached.clear()
	_notified_action_unlocks.clear()
	_skill_levels.clear()

	for item in Database.starters:
		var id = item.get("id")
		if id:
			discovered_ids[id] = true

	active_action = "separate"
	active_skill_id = ""
	active_main_view = "cook"
	active_sidebar_tab = "cabinet"
	emit_signal("discovery_changed")
	print("Game state reset to starter ingredients.")
	save_progress()
	call_deferred("_sync_ambience")


func is_discovered(id: String) -> bool:
	return discovered_ids.has(id)


func is_starter(id: String) -> bool:
	for item in Database.starters:
		if item.get("id") == id:
			return true
	return false


func discover_ingredient(id: String, queue_popup: bool = true) -> bool:
	if not id or discovered_ids.has(id):
		return false

	discovered_ids[id] = true
	recently_discovered_ids.push_front(id)
	if recently_discovered_ids.size() > 5:
		recently_discovered_ids.pop_back()
	recent_highlight_ids[id] = true

	discovery_log.append({
		"id": id,
		"discoveredAt": Time.get_unix_time_from_system() * 1000
	})

	if queue_popup and not is_starter(id):
		discovery_queue.append(id)
		pending_popup_id = id
		emit_signal("discovery_queued", id)

	check_milestones()
	check_achievements()
	save_progress()
	emit_signal("discovery_changed")
	print("Discovered new ingredient: ", id)
	call_deferred("check_player_action_unlocks")
	return true


func pop_discovery_queue() -> String:
	if discovery_queue.is_empty():
		pending_popup_id = ""
		return ""
	var id: String = discovery_queue.pop_front()
	if discovery_queue.is_empty():
		pending_popup_id = ""
	return id


func queue_mechanic_popup(emoji: String, name: String, desc: String, is_subaction: bool = false) -> void:
	mechanic_queue.append({
		"emoji": emoji,
		"name": name,
		"desc": desc,
		"is_subaction": is_subaction
	})
	emit_signal("mechanic_queued")


func pop_mechanic_queue() -> Dictionary:
	if mechanic_queue.is_empty():
		return {}
	return mechanic_queue.pop_front()


func queue_achievement_popup(def: Dictionary) -> void:
	achievement_queue.append(def)
	emit_signal("achievement_queued")


func pop_achievement_queue() -> Dictionary:
	if achievement_queue.is_empty():
		return {}
	return achievement_queue.pop_front()


func is_pantry_available(id: String) -> bool:
	if is_starter(id):
		return true
	if id in get_milestone_unlocked_ids():
		return true
	if id in get_dynamic_unlock_ids():
		return true
	return is_discovered(id)


func get_milestone_unlocked_ids() -> Array:
	var ids: Dictionary = {}
	for index in milestones_reached:
		if int(index) >= Database.milestones.size():
			continue
		var milestone: Dictionary = Database.milestones[int(index)]
		for unlock_id in milestone.get("unlocks", []):
			ids[str(unlock_id)] = true
	return ids.keys()


func get_dynamic_unlock_ids() -> Array:
	var ids: Array = []
	for trigger in WorkspaceHintsLib.FRUIT_TRIGGERS:
		if is_discovered(trigger):
			ids.append("fruits")
			break
	for trigger in WorkspaceHintsLib.TUBER_TRIGGERS:
		if is_discovered(trigger):
			ids.append("tubers")
			break
	return ids


func check_milestones() -> void:
	var count := get_unlocked_recipes_count()
	var newly_reached: Array = []
	for index in range(Database.milestones.size()):
		if milestones_reached.has(index):
			continue
		var milestone: Dictionary = Database.milestones[index]
		if count < int(milestone.get("recipesCount", 0)):
			continue
		milestones_reached.append(index)
		newly_reached.append(milestone)
		for unlock_id in milestone.get("unlocks", []):
			recent_highlight_ids[str(unlock_id)] = true

	for milestone in newly_reached:
		_notify_milestone_shipment(milestone)

	if newly_reached.size() > 0:
		save_progress()
		emit_signal("discovery_changed")


func _notify_milestone_shipment(milestone: Dictionary) -> void:
	var label := str(milestone.get("label", "New ingredients"))
	var desc := str(milestone.get("desc", "Fresh pantry stock has arrived."))
	ToastNotifications.show_milestone_shipment(label, desc)
	SoundManager.play_sfx("milestone")


func _sync_milestones_from_count() -> void:
	var count := get_unlocked_recipes_count()
	for index in range(Database.milestones.size()):
		if milestones_reached.has(index):
			continue
		var milestone: Dictionary = Database.milestones[index]
		if count >= int(milestone.get("recipesCount", 0)):
			milestones_reached.append(index)


func get_finalized_recipe_count() -> int:
	var count := 0
	for id in discovered_ids.keys():
		var item: Dictionary = Database.discoverable_items.get(id, {})
		if str(item.get("type", "")) == "recipe":
			count += 1
	return count


func get_discovered_item_count() -> int:
	var count := 0
	for id in discovered_ids.keys():
		if Database.discoverable_items.has(id):
			count += 1
	return count


func get_unlocked_recipes_count() -> int:
	return get_finalized_recipe_count()


func get_restored_percentage() -> int:
	var total := Database.discoverable_items.size()
	if total == 0:
		return 0
	return int(round((float(get_discovered_item_count()) / float(total)) * 100.0))


func save_progress() -> void:
	var save_data = {
		"discovered": discovered_ids.keys(),
		"recent": recently_discovered_ids,
		"highlights": recent_highlight_ids.keys(),
		"discoveryLog": discovery_log,
		"skillsXp": skills_xp,
		"soundEnabled": sound_enabled,
		"reducedMotion": reduced_motion,
		"ambienceEnabled": ambience_enabled,
		"seenHelp": seen_help,
		"achievementUnlocks": achievement_unlocks,
		"achievementFlags": achievement_flags.keys(),
		"milestonesReached": milestones_reached,
		"notifiedActionUnlocks": _notified_action_unlocks.keys()
	}

	var file = FileAccess.open("user://culinary_discovered.json", FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(save_data))
		print("Progress saved successfully.")


func load_progress() -> void:
	if not FileAccess.file_exists("user://culinary_discovered.json"):
		reset_to_starters()
		return

	var file = FileAccess.open("user://culinary_discovered.json", FileAccess.READ)
	var json = JSON.new()
	if json.parse(file.get_as_text()) != OK:
		print("Error parsing save data: ", json.get_error_message())
		reset_to_starters()
		return

	var save_data = json.data
	discovered_ids.clear()
	for id in save_data.get("discovered", []):
		discovered_ids[id] = true
	recently_discovered_ids = save_data.get("recent", [])
	recent_highlight_ids.clear()
	for id in save_data.get("highlights", []):
		recent_highlight_ids[id] = true
	discovery_log = save_data.get("discoveryLog", [])
	skills_xp = save_data.get("skillsXp", {})
	sound_enabled = save_data.get("soundEnabled", true)
	reduced_motion = save_data.get("reducedMotion", false)
	ambience_enabled = save_data.get("ambienceEnabled", false)
	seen_help = save_data.get("seenHelp", false)
	milestones_reached = save_data.get("milestonesReached", [])
	_notified_action_unlocks.clear()
	for action_id in save_data.get("notifiedActionUnlocks", []):
		_notified_action_unlocks[str(action_id)] = true
	_load_achievement_save(save_data)
	_sync_milestones_from_count()

	for item in Database.starters:
		var starter_id = item.get("id")
		if starter_id:
			discovered_ids[starter_id] = true

	emit_signal("discovery_changed")
	print("Progress loaded successfully.")
	_rebuild_skill_levels()
	call_deferred("_sync_ambience")
	call_deferred("sync_notified_action_unlocks")
	call_deferred("check_achievements", true)


func add_skill_xp(skill_id: String, amount: int) -> void:
	if skill_id.is_empty() or amount <= 0:
		return
	var old_level := _skill_level_for(skill_id)
	if not skills_xp.has(skill_id):
		skills_xp[skill_id] = 0
	skills_xp[skill_id] += amount
	var new_level := _skill_level_for(skill_id)
	if new_level > old_level:
		_notify_skill_level_up(skill_id, new_level)
	save_progress()
	check_achievements()
	emit_signal("discovery_changed")


func _skill_level_for(skill_id: String) -> int:
	return int(skills_xp.get(skill_id, 0)) / 10 + 1


func _rebuild_skill_levels() -> void:
	_skill_levels.clear()
	for skill_id in skills_xp.keys():
		_skill_levels[skill_id] = _skill_level_for(skill_id)


func _notify_skill_level_up(skill_id: String, level: int) -> void:
	var skill := TechniqueTools.get_skill_definition(skill_id)
	if skill.is_empty():
		for label in [
			{"id": "separate", "name": "Separate", "emoji": "🔪"},
			{"id": "combine", "name": "Combine", "emoji": "🥣"},
			{"id": "smash", "name": "Force", "emoji": "✊"},
			{"id": "char", "name": "Heat", "emoji": "🍳"},
			{"id": "rest", "name": "Time", "emoji": "⏳"}
		]:
			if label.id == skill_id:
				skill = label
				break
	if reduced_motion:
		ToastNotifications.show_level_up(
			str(skill.get("emoji", "✨")),
			str(skill.get("name", skill_id)),
			level
		)
	else:
		queue_mechanic_popup(
			skill.get("emoji", "✨"),
			"%s · Level %d" % [skill.get("name", skill_id), level],
			"Your kitchen craft grows sharper with every experiment.",
			true
		)
	SoundManager.play_sfx("level_up")


func evaluate_achievement_context() -> Dictionary:
	var primitive_ids := {}
	for starter in Database.starters:
		var sid = starter.get("id", "")
		if sid:
			primitive_ids[sid] = true
	for id in Database.discoverable_items.keys():
		var item: Dictionary = Database.discoverable_items[id]
		if item.get("origin", "") == "primitive":
			primitive_ids[id] = true

	return {
		"discovered_ids": discovered_ids,
		"discovery_log_length": discovery_log.size(),
		"primitive_ids": primitive_ids,
		"discoverable": Database.discoverable_items,
		"skills_xp": skills_xp,
		"achievement_flags": achievement_flags,
		"unlocked_achievements": achievement_unlocks
	}


func set_achievement_flag(flag: String) -> void:
	if flag.is_empty() or achievement_flags.has(flag):
		return
	achievement_flags[flag] = true
	save_progress()
	check_achievements()


func is_achievement_unlocked(id: String) -> bool:
	return achievement_unlocks.has(id)


func check_achievements(silent: bool = false) -> Array:
	var ctx := evaluate_achievement_context()
	var pending: Array = AchievementEngine.check_pending(ctx, Database.achievement_rules, Database.achievements)
	var newly: Array = []
	for achievement_id in pending:
		if unlock_achievement(achievement_id, silent):
			newly.append(achievement_id)
	return newly


func unlock_achievement(id: String, silent: bool = false) -> bool:
	if achievement_unlocks.has(id):
		return false
	achievement_unlocks[id] = Time.get_unix_time_from_system() * 1000
	save_progress()
	if not silent:
		var def := _find_achievement_def(id)
		ToastNotifications.show_achievement(def)
		SoundManager.play_sfx("level_up")
	emit_signal("discovery_changed")
	return true


func _find_achievement_def(id: String) -> Dictionary:
	for achievement in Database.achievements:
		if achievement.get("id", "") == id:
			return achievement
	return {"id": id, "name": id, "emoji": "🏆", "description": ""}


func get_achievement_summary() -> Dictionary:
	return {"unlocked": achievement_unlocks.size(), "total": Database.achievements.size()}


func check_player_action_unlocks() -> void:
	for action_id in ["force", "combine", "change", "time"]:
		if _notified_action_unlocks.has(action_id):
			continue
		if not TechniqueTools.is_player_action_unlocked(action_id):
			continue
		_notified_action_unlocks[action_id] = true
		var cfg: Dictionary = Database.player_actions.get(action_id, {})
		queue_mechanic_popup(
			cfg.get("emoji", "✨"),
			cfg.get("name", action_id),
			cfg.get("desc", ""),
			false
		)
		SoundManager.play_sfx("discovery")


func sync_notified_action_unlocks() -> void:
	for action_id in ["force", "combine", "change", "time"]:
		if TechniqueTools.is_player_action_unlocked(action_id):
			_notified_action_unlocks[action_id] = true


func _load_achievement_save(save_data: Dictionary) -> void:
	achievement_unlocks.clear()
	achievement_flags.clear()
	if save_data.has("achievementUnlocks") and typeof(save_data.achievementUnlocks) == TYPE_DICTIONARY:
		achievement_unlocks = save_data.achievementUnlocks.duplicate()
	if save_data.has("achievements"):
		var ach: Dictionary = save_data.get("achievements", {})
		for entry in ach.get("unlocked", []):
			if typeof(entry) == TYPE_DICTIONARY:
				var entry_id = entry.get("id", "")
				if entry_id:
					achievement_unlocks[entry_id] = entry.get("unlockedAt", Time.get_unix_time_from_system() * 1000)
		for flag in ach.get("flags", []):
			achievement_flags[str(flag)] = true
	for flag in save_data.get("achievementFlags", []):
		achievement_flags[str(flag)] = true


func _achievement_save_for_portable() -> Dictionary:
	var unlocked: Array = []
	for id in achievement_unlocks.keys():
		unlocked.append({"id": id, "unlockedAt": achievement_unlocks[id]})
	return {
		"unlocked": unlocked,
		"flags": achievement_flags.keys()
	}


func build_portable_save() -> Dictionary:
	return {
		"version": SAVE_VERSION,
		"game": SAVE_GAME_ID,
		"exportedAt": Time.get_unix_time_from_system() * 1000,
		"discovery": {
			"discovered": discovered_ids.keys(),
			"recent": recently_discovered_ids,
			"highlights": recent_highlight_ids.keys(),
			"discoveryLog": discovery_log
		},
		"progression": {
			"xp": skills_xp,
			"milestonesReached": milestones_reached
		},
		"achievements": _achievement_save_for_portable(),
		"settings": {
			"soundEnabled": sound_enabled,
			"reducedMotion": reduced_motion,
			"ambienceEnabled": ambience_enabled
		}
	}


func export_save_to_path(path: String) -> bool:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		return false
	file.store_string(JSON.stringify(build_portable_save(), "\t"))
	return true


func import_save_from_path(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		return {"ok": false, "error": "File not found."}
	if not SaveValidationLib.validate_file_size(path):
		return {"ok": false, "error": "Save file is too large."}
	var file := FileAccess.open(path, FileAccess.READ)
	var json := JSON.new()
	if json.parse(file.get_as_text()) != OK:
		return {"ok": false, "error": "Invalid JSON save file."}
	return apply_imported_save(json.data)


func apply_imported_save(raw: Variant) -> Dictionary:
	if typeof(raw) != TYPE_DICTIONARY:
		return {"ok": false, "error": "Save file must be a JSON object."}

	var data: Dictionary = raw
	if data.has("version") and data.has("discovery"):
		return _apply_portable_save(data)

	if data.has("discovered"):
		var discovered = SaveValidationLib.parse_bounded_string_array(data.get("discovered", []), SaveValidationLib.MAX_DISCOVERED)
		if discovered == null:
			return {"ok": false, "error": "Invalid discovered list in save."}
		var recent = SaveValidationLib.parse_bounded_string_array(data.get("recent", []), SaveValidationLib.MAX_RECENT)
		if recent == null:
			return {"ok": false, "error": "Invalid recent list in save."}
		var highlights = SaveValidationLib.parse_bounded_string_array(data.get("highlights", []), SaveValidationLib.MAX_HIGHLIGHTS)
		if highlights == null:
			return {"ok": false, "error": "Invalid highlights list in save."}
		var raw_log: Array = data.get("discoveryLog", [])
		if raw_log.size() > SaveValidationLib.MAX_LOG_ENTRIES:
			return {"ok": false, "error": "Discovery log is too large."}
		var xp_map = SaveValidationLib.parse_bounded_xp_map(data.get("skillsXp", {}))
		if xp_map == null:
			return {"ok": false, "error": "Invalid skills XP in save."}
		discovered_ids.clear()
		for id in discovered:
			discovered_ids[id] = true
		recently_discovered_ids = recent
		recent_highlight_ids.clear()
		for id in highlights:
			recent_highlight_ids[id] = true
		discovery_log = raw_log
		skills_xp = xp_map
		sound_enabled = data.get("soundEnabled", true)
		reduced_motion = data.get("reducedMotion", false)
		ambience_enabled = data.get("ambienceEnabled", false)
		_load_achievement_save(data)
	else:
		return {"ok": false, "error": "Unrecognized save format."}

	for item in Database.starters:
		var starter_id = item.get("id")
		if starter_id:
			discovered_ids[starter_id] = true

	save_progress()
	_sync_ambience()
	_rebuild_skill_levels()
	emit_signal("discovery_changed")
	return {"ok": true, "count": get_unlocked_recipes_count()}


func _apply_portable_save(data: Dictionary) -> Dictionary:
	if data.get("game", "") != SAVE_GAME_ID:
		return {"ok": false, "error": "This file is not a Culinary Alchemy save."}
	if int(data.get("version", 0)) != SAVE_VERSION:
		return {"ok": false, "error": "Unsupported save version."}

	var discovery: Dictionary = data.get("discovery", {})
	var progression: Dictionary = data.get("progression", {})
	var settings: Dictionary = data.get("settings", {})
	var achievements: Dictionary = data.get("achievements", {})

	var discovered = SaveValidationLib.parse_bounded_string_array(discovery.get("discovered", []), SaveValidationLib.MAX_DISCOVERED)
	if discovered == null:
		return {"ok": false, "error": "Invalid discovered list in save."}
	var recent = SaveValidationLib.parse_bounded_string_array(discovery.get("recent", []), SaveValidationLib.MAX_RECENT)
	if recent == null:
		return {"ok": false, "error": "Invalid recent list in save."}
	var highlights = SaveValidationLib.parse_bounded_string_array(discovery.get("highlights", []), SaveValidationLib.MAX_HIGHLIGHTS)
	if highlights == null:
		return {"ok": false, "error": "Invalid highlights list in save."}
	var xp_map = SaveValidationLib.parse_bounded_xp_map(progression.get("xp", {}))
	if xp_map == null:
		return {"ok": false, "error": "Invalid skills XP in save."}
	var raw_log: Array = discovery.get("discoveryLog", [])
	if raw_log.size() > SaveValidationLib.MAX_LOG_ENTRIES:
		return {"ok": false, "error": "Discovery log is too large."}

	discovered_ids.clear()
	for id in discovered:
		discovered_ids[id] = true
	recently_discovered_ids = recent
	recent_highlight_ids.clear()
	for id in highlights:
		recent_highlight_ids[id] = true
	discovery_log = raw_log
	skills_xp = xp_map
	milestones_reached = progression.get("milestonesReached", [])
	sound_enabled = settings.get("soundEnabled", true)
	reduced_motion = settings.get("reducedMotion", false)
	ambience_enabled = settings.get("ambienceEnabled", false)
	_load_achievement_save({
		"achievements": achievements
	})
	_sync_milestones_from_count()
	sync_notified_action_unlocks()

	for item in Database.starters:
		var starter_id = item.get("id")
		if starter_id:
			discovered_ids[starter_id] = true

	save_progress()
	_sync_ambience()
	_rebuild_skill_levels()
	emit_signal("discovery_changed")
	return {"ok": true, "count": get_unlocked_recipes_count()}


func _sync_ambience() -> void:
	if ambience_enabled:
		SoundManager.start_ambience()
	else:
		SoundManager.stop_ambience()
