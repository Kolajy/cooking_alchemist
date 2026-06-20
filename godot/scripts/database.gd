extends Node

var starters: Array = []
var discoverable_items: Dictionary = {}
var technique_categories: Dictionary = {}
var player_actions: Dictionary = {}
var milestones: Array = []
var transitions: Array = []

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
			
			var items = data.get("discoverables", [])
			for item in items:
				discoverable_items[item.get("id")] = item
			
			var prog = data.get("progression", {})
			technique_categories = prog.get("techniqueCategories", {})
			player_actions = prog.get("playerActions", {})
			milestones = prog.get("milestones", [])
			
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
