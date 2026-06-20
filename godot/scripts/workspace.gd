extends Node2D

@export var token_scene: PackedScene = preload("res://scenes/ingredient_token.tscn")
@export var particle_scene: PackedScene = preload("res://scenes/cooking_particles.tscn")

@onready var token_container = $TokenContainer
@onready var action_label = $UI/ActionBar/ActiveActionLabel

var undo_entry: Dictionary = {}

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
	if has_node("UI/HeaderBar/BtnUndo"):
		get_node("UI/HeaderBar/BtnUndo").pressed.connect(apply_undo)
		
	update_action_ui()
	update_progress_ui()
	update_action_locks()
	update_guide_note()
	update_undo_button()
	# Spawn starters to begin
	spawn_starter_tokens()

func spawn_starter_tokens():
	var screen_size = get_viewport_rect().size
	if screen_size.x < 200 or screen_size.y < 200:
		screen_size = Vector2(1280, 720)
		
	# Shift layout center to the left to avoid spawning starters under the 340px right sidebar
	var workspace_width = screen_size.x - 340
	var spawn_points = [
		Vector2(workspace_width * 0.35, screen_size.y * 0.5),
		Vector2(workspace_width * 0.65, screen_size.y * 0.5)
	]
	
	var starters_to_spawn = ["berries", "tubers"]
	for i in range(starters_to_spawn.size()):
		var id = starters_to_spawn[i]
		var pos = spawn_points[i]
		spawn_token(id, pos, false)

func spawn_token(id: String, pos: Vector2, push_undo: bool = true):
	if not token_scene:
		return
	var token = token_scene.instantiate()
	token.global_position = pos
	token_container.add_child(token)
	token.setup(id)
	update_highlights()
	
	if push_undo:
		push_undo_spawn(id, pos)

func _on_discovery_changed():
	update_highlights()
	update_progress_ui()
	update_action_locks()
	update_guide_note()

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
	
	var action = GameState.active_action
	if has_node("UI/ActionBar/BtnSeparate"):
		_set_button_selected_style(get_node("UI/ActionBar/BtnSeparate"), action == "separate")
	if has_node("UI/ActionBar/BtnForce"):
		_set_button_selected_style(get_node("UI/ActionBar/BtnForce"), action == "force")
	if has_node("UI/ActionBar/BtnCombine"):
		_set_button_selected_style(get_node("UI/ActionBar/BtnCombine"), action == "combine")
	if has_node("UI/ActionBar/BtnHeat"):
		_set_button_selected_style(get_node("UI/ActionBar/BtnHeat"), action == "heat")
	if has_node("UI/ActionBar/BtnTime"):
		_set_button_selected_style(get_node("UI/ActionBar/BtnTime"), action == "time")

func _set_button_selected_style(button: Button, is_selected: bool):
	if is_selected:
		var sb_active = StyleBoxFlat.new()
		sb_active.bg_color = Color(0.48, 0.30, 0.23)
		sb_active.border_width_left = 1
		sb_active.border_width_top = 1
		sb_active.border_width_right = 1
		sb_active.border_width_bottom = 1
		sb_active.border_color = Color(0.35, 0.22, 0.17)
		sb_active.set_corner_radius_all(8)
		button.add_theme_stylebox_override("normal", sb_active)
		button.add_theme_stylebox_override("hover", sb_active)
		button.add_theme_color_override("font_color", Color(0.99, 0.98, 0.96))
		button.add_theme_color_override("font_hover_color", Color(0.99, 0.98, 0.96))
	else:
		button.remove_theme_stylebox_override("normal")
		button.remove_theme_stylebox_override("hover")
		button.remove_theme_color_override("font_color")
		button.remove_theme_color_override("font_hover_color")

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
					var old_id = token.item_id
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
					spawn_token(next_output, old_pos, false)
					push_undo_technique(old_id, next_output, old_pos)
					
					var skill_key = action
					if action == "separate":
						skill_key = "prep"
					GameState.add_skill_xp(skill_key, 1)
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
		var id1 = dragged_token.item_id
		var id2 = target_token.item_id
		var inputs = [id1, id2]
		var result = get_combine_result(inputs)
		if result != "":
			var spawn_pos = target_token.global_position
			dragged_token.queue_free()
			target_token.queue_free()
			
			# Play Sound & Particles for successful combination
			SoundManager.play_sfx("discovery")
			spawn_particles("Sparkles", spawn_pos)
			
			GameState.discover_ingredient(result)
			spawn_token(result, spawn_pos, false)
			push_undo_combine(id1, id2, result, spawn_pos)
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
	spawn_token(id, pos, true)
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

func push_undo_spawn(item_id: String, pos: Vector2):
	undo_entry = {
		"type": "spawn",
		"item_id": item_id,
		"pos": pos
	}
	update_undo_button()

func push_undo_technique(input_id: String, output_id: String, pos: Vector2):
	undo_entry = {
		"type": "technique",
		"input_id": input_id,
		"output_id": output_id,
		"pos": pos
	}
	update_undo_button()

func push_undo_combine(input1_id: String, input2_id: String, output_id: String, pos: Vector2):
	undo_entry = {
		"type": "combine",
		"input1_id": input1_id,
		"input2_id": input2_id,
		"output_id": output_id,
		"pos": pos
	}
	update_undo_button()

func update_undo_button():
	if has_node("UI/HeaderBar/BtnUndo"):
		var btn = get_node("UI/HeaderBar/BtnUndo")
		btn.disabled = undo_entry.is_empty()

func apply_undo():
	if undo_entry.is_empty():
		return
	
	var type = undo_entry.get("type", "")
	if type == "spawn":
		var match_token = null
		for token in token_container.get_children():
			if token.item_id == undo_entry.get("item_id"):
				match_token = token
				break
		if match_token:
			match_token.queue_free()
	elif type == "technique":
		var match_token = null
		for token in token_container.get_children():
			if token.item_id == undo_entry.get("output_id") and token.global_position.distance_to(undo_entry.get("pos")) < 10.0:
				match_token = token
				break
		if not match_token:
			for token in token_container.get_children():
				if token.item_id == undo_entry.get("output_id"):
					match_token = token
					break
		if match_token:
			match_token.queue_free()
			spawn_token(undo_entry.get("input_id"), undo_entry.get("pos"), false)
	elif type == "combine":
		var match_token = null
		for token in token_container.get_children():
			if token.item_id == undo_entry.get("output_id") and token.global_position.distance_to(undo_entry.get("pos")) < 10.0:
				match_token = token
				break
		if not match_token:
			for token in token_container.get_children():
				if token.item_id == undo_entry.get("output_id"):
					match_token = token
					break
		if match_token:
			match_token.queue_free()
			var spawn_pos = undo_entry.get("pos")
			spawn_token(undo_entry.get("input1_id"), spawn_pos - Vector2(40, 0), false)
			spawn_token(undo_entry.get("input2_id"), spawn_pos + Vector2(40, 0), false)
			
	SoundManager.play_sfx("ui_select")
	undo_entry.clear()
	update_undo_button()

func update_action_locks():
	var count = GameState.get_unlocked_recipes_count()
	if has_node("UI/ActionBar/BtnCombine"):
		var btn = get_node("UI/ActionBar/BtnCombine")
		btn.disabled = count < 15
		btn.text = "Combine (🥣)" if count >= 15 else "🥣 Combine (15)"
	if has_node("UI/ActionBar/BtnHeat"):
		var btn = get_node("UI/ActionBar/BtnHeat")
		btn.disabled = count < 40
		btn.text = "Heat (🍳)" if count >= 40 else "🍳 Heat (40)"
	if has_node("UI/ActionBar/BtnTime"):
		var btn = get_node("UI/ActionBar/BtnTime")
		btn.disabled = count < 200
		btn.text = "Time (⏳)" if count >= 200 else "⏳ Time (200)"

func update_guide_note():
	if not has_node("UI/GuideNote/GuideText"):
		return
	
	var label = get_node("UI/GuideNote/GuideText")
	var count = GameState.get_unlocked_recipes_count()
	var hint = ""
	
	var has_smashed_berries = GameState.is_discovered("smashed_berries")
	var has_potato = GameState.is_discovered("potato")
	var has_mashed_potato = GameState.is_discovered("mashed_potato")
	var has_sprouted_seeds = GameState.is_discovered("sprouted_seeds")
	
	if not has_smashed_berries:
		hint = "📌 Ledger Guide: Separate 🫐 Berries on the counter to find fresh fruit and smashable pulp!"
	elif not has_potato:
		hint = "📌 Ledger Guide: Separate 🥔 Tubers on the counter to find a fresh Potato!"
	elif not has_mashed_potato:
		hint = "📌 Ledger Guide: Use your new ✊ Force action to smash the 🥔 Potato into a fluffy mash!"
	elif count < 15:
		hint = "📌 Ledger Guide: Restore 15 recipes in your Ledger to unlock the 🥣 Combine action (Current: " + str(count) + "/15)."
	elif not has_sprouted_seeds:
		hint = "📌 Ledger Guide: Combine 🌻 Seeds and 💧 Water on the counter using the 🥣 Combine action to grow sprouted greens!"
	elif count < 40:
		hint = "📌 Ledger Guide: Continue combining and discovering dishes. Reach 40 recipes to unlock 🍳 Heat (Current: " + str(count) + "/40)."
	elif count < 200 or not GameState.is_discovered("berry_pulp"):
		hint = "📌 Ledger Guide: Work towards restoring 200 recipes and finding Berry Pulp to master ⏳ Time (Current: " + str(count) + "/200)."
	else:
		hint = "📌 Ledger Guide: Grandmother's ledger is nearly restored! Search for remaining secrets in the Ledger Book."
		
	label.text = hint
