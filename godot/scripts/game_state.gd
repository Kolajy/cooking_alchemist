extends Node

# Player state variables
var discovered_ids: Dictionary = {}
var recently_discovered_ids: Array = []
var discovery_log: Array = []
var recent_highlight_ids: Dictionary = {}
var skills_xp: Dictionary = {}

# Active UI modes
var active_action: String = "separate"
var active_skill_id: String = ""
var active_main_view: String = "workspace"

signal discovery_changed
signal action_changed

func _ready():
	reset_to_starters()

func reset_to_starters():
	discovered_ids.clear()
	recently_discovered_ids.clear()
	discovery_log.clear()
	recent_highlight_ids.clear()
	skills_xp.clear()
	
	# Add starter elements from Database
	for item in Database.starters:
		var id = item.get("id")
		if id:
			discovered_ids[id] = true
			
	active_action = "separate"
	active_skill_id = ""
	active_main_view = "workspace"
	
	emit_signal("discovery_changed")
	print("Game state reset to starter ingredients.")

func is_discovered(id: String) -> bool:
	return discovered_ids.has(id)

func discover_ingredient(id: String):
	if id and not discovered_ids.has(id):
		discovered_ids[id] = true
		recently_discovered_ids.push_front(id)
		if recently_discovered_ids.size() > 5:
			recently_discovered_ids.pop_back()
		recent_highlight_ids[id] = true
		
		# Log discovery
		discovery_log.append({
			"id": id,
			"discoveredAt": Time.get_unix_time_from_system() * 1000
		})
		
		save_progress()
		emit_signal("discovery_changed")
		print("Discovered new ingredient: ", id)

func get_unlocked_recipes_count() -> int:
	var count = 0
	for id in discovered_ids.keys():
		if Database.discoverable_items.has(id):
			count += 1
	return count

func get_restored_percentage() -> int:
	var total = Database.discoverable_items.size()
	if total == 0:
		return 0
	var count = get_unlocked_recipes_count()
	return int(round((float(count) / float(total)) * 100.0))

# Save progress to a local file
func save_progress():
	var save_data = {
		"discovered": discovered_ids.keys(),
		"recent": recently_discovered_ids,
		"highlights": recent_highlight_ids.keys(),
		"discoveryLog": discovery_log,
		"skillsXp": skills_xp
	}
	
	var file = FileAccess.open("user://culinary_discovered.json", FileAccess.WRITE)
	if file:
		var json_string = JSON.stringify(save_data)
		file.store_string(json_string)
		print("Progress saved successfully to user://culinary_discovered.json")

# Load progress from a local file
func load_progress():
	if FileAccess.file_exists("user://culinary_discovered.json"):
		var file = FileAccess.open("user://culinary_discovered.json", FileAccess.READ)
		var content = file.get_as_text()
		var json = JSON.new()
		var error = json.parse(content)
		if error == OK:
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
			
			# Ensure starters are always unlocked
			for item in Database.starters:
				var id = item.get("id")
				if id:
					discovered_ids[id] = true
					
			emit_signal("discovery_changed")
			print("Progress loaded successfully.")
		else:
			print("Error parsing save data: ", json.get_error_message())
			reset_to_starters()
	else:
		reset_to_starters()

func add_skill_xp(skill_id: String, amount: int):
	if not skills_xp.has(skill_id):
		skills_xp[skill_id] = 0
	skills_xp[skill_id] += amount
	save_progress()
	emit_signal("discovery_changed")
