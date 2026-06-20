extends Node

var starters: Array = []
var unlockables: Array = []
var unlockables_by_id: Dictionary = {}
var discoverable_items: Dictionary = {}
var technique_categories: Dictionary = {}
var player_actions: Dictionary = {}
var milestones: Array = []
var transitions: Array = []
var achievements: Array = []
var achievement_rules: Dictionary = {}

func _ready():
	load_data()

func load_data():
	# Load game_bundle.json
	if FileAccess.file_exists("res://data/game_bundle.json"):
		var file = FileAccess.open("res://data/game_bundle.json", FileAccess.READ)
		var content = file.get_as_text()
		var json = JSON.new()
		var error = json.parse(content)
		if error == OK:
			var data = json.data
			starters = data.get("starters", [])
			unlockables = data.get("unlockables", [])
			unlockables_by_id.clear()
			for item in unlockables:
				var uid = item.get("id", "")
				if uid:
					unlockables_by_id[uid] = item

			discoverable_items = data.get("discoverable", {})
			
			var prog = data.get("progression", {})
			technique_categories = prog.get("techniqueCategories", {})
			player_actions = prog.get("playerActions", {})
			milestones = prog.get("milestones", [])
			achievements = data.get("achievements", [])
			achievement_rules = data.get("achievementRules", {})
			
			print("Loaded game_bundle.json successfully: ", discoverable_items.size(), " items loaded.")
		else:
			print("Error parsing game_bundle.json: ", json.get_error_message())
	else:
		print("Error: res://data/game_bundle.json does not exist.")

	# Load transitions.json
	if FileAccess.file_exists("res://data/transitions.json"):
		var file = FileAccess.open("res://data/transitions.json", FileAccess.READ)
		var content = file.get_as_text()
		var json = JSON.new()
		var error = json.parse(content)
		if error == OK:
			transitions = json.data
			print("Loaded transitions.json successfully: ", transitions.size(), " transitions loaded.")
		else:
			print("Error parsing transitions.json: ", json.get_error_message())
	else:
		print("Error: res://data/transitions.json does not exist.")


func get_item(id: String) -> Dictionary:
	if discoverable_items.has(id):
		return discoverable_items[id]
	if unlockables_by_id.has(id):
		return unlockables_by_id[id]
	for starter in starters:
		if starter.get("id", "") == id:
			return starter
	return {}
