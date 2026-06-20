extends Node2D

@export var token_scene: PackedScene = preload("res://scenes/ingredient_token.tscn")
@export var particle_scene: PackedScene = preload("res://scenes/cooking_particles.tscn")

@onready var token_container = $TokenContainer
@onready var action_label = $UI/ActionBar/ActiveActionLabel

func _ready():
	GameState.connect("discovery_changed", Callable(self, "_on_discovery_changed"))
	
	# Connect buttons dynamically
	if has_node("UI/ActionBar/BtnSeparate"):
		get_node("UI/ActionBar/BtnSeparate").pressed.connect(set_active_action.bind("separate"))
	if has_node("UI/ActionBar/BtnForce"):
		get_node("UI/ActionBar/BtnForce").pressed.connect(set_active_action.bind("force"))
	if has_node("UI/ActionBar/BtnCombine"):
		get_node("UI/ActionBar/BtnCombine").pressed.connect(set_active_action.bind("combine"))
	if has_node("UI/ActionBar/BtnHeat"):
		get_node("UI/ActionBar/BtnHeat").pressed.connect(set_active_action.bind("heat"))
	if has_node("UI/ActionBar/BtnTime"):
		get_node("UI/ActionBar/BtnTime").pressed.connect(set_active_action.bind("time"))
	if has_node("UI/HeaderBar/BtnLedgerBook"):
		get_node("UI/HeaderBar/BtnLedgerBook").pressed.connect(_on_ledger_book_pressed)
		
	update_action_ui()
	update_progress_ui()
	# Spawn starters to begin
	spawn_starter_tokens()

func spawn_starter_tokens():
	var screen_size = get_viewport_rect().size
	var spawn_points = [
		Vector2(screen_size.x * 0.4, screen_size.y * 0.5),
		Vector2(screen_size.x * 0.6, screen_size.y * 0.5)
	]
	
	# Spawn berries and tubers to start
	var starters_to_spawn = ["berries", "tubers"]
	for i in range(starters_to_spawn.size()):
		var id = starters_to_spawn[i]
		var pos = spawn_points[i]
		spawn_token(id, pos)

func spawn_token(id: String, pos: Vector2):
	if not token_scene:
		return
	var token = token_scene.instantiate()
	token_container.add_child(token)
	token.global_position = pos
	token.setup(id)
	update_highlights()

func _on_discovery_changed():
	update_highlights()
	update_progress_ui()

func update_progress_ui():
	if has_node("UI/HeaderBar/LedgerProgressLabel"):
		get_node("UI/HeaderBar/LedgerProgressLabel").text = "📖 Ledger Restored: " + str(GameState.get_restored_percentage()) + "%"

func _on_ledger_book_pressed():
	var root = get_tree().root.get_child(0)
	var book = root.find_child("LedgerBook", true, false)
	if book and book.has_method("show_book"):
		book.show_book()

func set_active_action(action: String):
	GameState.active_action = action
	update_action_ui()
	update_highlights()

func update_action_ui():
	if action_label:
		action_label.text = "Active Action: " + GameState.active_action.capitalize()

func update_highlights():
	var action = GameState.active_action
	var tokens = token_container.get_children()
	
	for token in tokens:
		token.set_highlight_visible(false)
		
		# In technique modes, highlight items that can be affected
		if action != "combine" and action != "move":
			if can_apply_technique(token.item_id, action):
				token.set_highlight_visible(true, "valid")

func can_apply_technique(input_id: String, action: String) -> bool:
	# Check transitions for matching tool + input
	for t in Database.transitions:
		if t.get("kind") == "technique":
			var tools = t.get("tools", [])
			var input = t.get("input", "")
			if input == input_id:
				# Check if action maps to any tool in the transition
				if action == "separate" and ("separate" in tools or "peel" in tools or "tear" in tools):
					return true
				elif action == "force" and "smash" in tools:
					return true
				elif action == "heat" and "char" in tools:
					return true
				elif action == "time" and "rest" in tools:
					return true
	return false

# Triggered when clicking a token while an active tool is selected
func _input(event):
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		var action = GameState.active_action
		if action == "combine" or action == "move":
			return
			
		# Look for clicked token
		var space_state = get_world_2d().direct_space_state
		var query = PhysicsPointQueryParameters2D.new()
		query.position = get_global_mouse_position()
		query.collide_with_areas = true
		
		var results = space_state.intersect_point(query)
		for res in results:
			var token = res.get("collider")
			if token and token.has_method("setup"):
				# Try executing technique
				apply_technique(token)
				break

func apply_technique(token):
	var action = GameState.active_action
	var input_id = token.item_id
	
	# Find matching technique transition
	for t in Database.transitions:
		if t.get("kind") == "technique" and t.get("input") == input_id:
			var tools = t.get("tools", [])
			var matches = false
			if action == "separate" and ("separate" in tools or "peel" in tools or "tear" in tools):
				matches = true
			elif action == "force" and "smash" in tools:
				matches = true
			elif action == "heat" and "char" in tools:
				matches = true
			elif action == "time" and "rest" in tools:
				matches = true
				
			if matches:
				var outputs = t.get("outputs", [])
				if outputs.size() > 0:
					# Discover the first undiscovered output, or a random one
					var next_output = ""
					for out in outputs:
						if not GameState.is_discovered(out):
							next_output = out
							break
					if next_output == "":
						next_output = outputs[0]
						
					var old_pos = token.global_position
					token.queue_free()
					
					# Play SFX and Particle effects based on action
					if action == "separate":
						SoundManager.play_sfx("chop")
						spawn_particles("Steam", old_pos)
					elif action == "force":
						SoundManager.play_sfx("smash")
						spawn_particles("Steam", old_pos)
					elif action == "heat":
						SoundManager.play_sfx("sizzle")
						spawn_particles("Embers", old_pos)
					elif action == "time":
						SoundManager.play_sfx("ui_select")
						spawn_particles("Sparkles", old_pos)
					
					# Spawn result at the same position
					GameState.discover_ingredient(next_output)
					spawn_token(next_output, old_pos)
					return

func on_token_released(dragged_token):
	if GameState.active_action != "combine":
		return
		
	var overlaps = dragged_token.get_overlapping_areas()
	var target_token = null
	
	# Find the closest overlapping token
	var min_dist = 99999.0
	for other in overlaps:
		if other != dragged_token and other.has_method("setup"):
			var dist = dragged_token.global_position.distance_to(other.global_position)
			if dist < min_dist:
				min_dist = dist
				target_token = other
				
	if target_token:
		# Check if they can combine
		var inputs = [dragged_token.item_id, target_token.item_id]
		var result = get_combine_result(inputs)
		if result != "":
			var spawn_pos = target_token.global_position
			dragged_token.queue_free()
			target_token.queue_free()
			
			# Play Sound & Particles for successful combination
			SoundManager.play_sfx("discovery")
			spawn_particles("Sparkles", spawn_pos)
			
			GameState.discover_ingredient(result)
			spawn_token(result, spawn_pos)
		else:
			# Bounce back if invalid
			dragged_token.target_position = dragged_token.global_position - dragged_token.velocity * 0.1
	else:
		# Ensure target highlights are cleared
		update_highlights()

func get_combine_result(inputs: Array) -> String:
	inputs.sort()
	var input_key = ",".join(inputs)
	
	for t in Database.transitions:
		if t.get("kind") == "combine":
			var t_inputs = t.get("inputs", [])
			t_inputs.sort()
			var key = ",".join(t_inputs)
			if key == input_key:
				var outputs = t.get("outputs", [])
				if outputs.size() > 0:
					return outputs[0]
	return ""

func spawn_token_at_mouse(id: String):
	var pos = get_global_mouse_position()
	spawn_token(id, pos)
	# Find the newly spawned token to start dragging immediately
	var tokens = token_container.get_children()
	if tokens.size() > 0:
		var last_token = tokens[tokens.size() - 1]
		last_token.dragging = true
		last_token.grab_offset = Vector2.ZERO

func spawn_particles(type: String, pos: Vector2):
	if particle_scene:
		var node = particle_scene.instantiate()
		add_child(node)
		node.global_position = pos
		node.play_effect(type)
