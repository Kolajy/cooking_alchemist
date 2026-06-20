extends Control

@export var slot_scene: PackedScene = preload("res://scenes/pantry_item_slot.tscn")

@onready var cabinet_grid = $Layout/TabContents/CabinetScroll/CabinetGrid
@onready var cabinet_panel = $Layout/TabContents/CabinetScroll
@onready var placeholder_panel = $Layout/TabContents/PlaceholderPanel

func _ready():
	GameState.connect("discovery_changed", Callable(self, "_on_discovery_changed"))
	
	# Connect tabs dynamically
	$Layout/TabBar/BtnCabinet.pressed.connect(_on_tab_pressed.bind("cabinet"))
	$Layout/TabBar/BtnSkills.pressed.connect(_on_tab_pressed.bind("skills"))
	$Layout/TabBar/BtnJournal.pressed.connect(_on_tab_pressed.bind("journal"))
	$Layout/TabBar/BtnTrophies.pressed.connect(_on_tab_pressed.bind("trophies"))
	
	placeholder_panel.visible = false
	cabinet_panel.visible = true
	
	_on_tab_pressed("cabinet")

func _on_discovery_changed():
	rebuild_pantry_content()

func _on_tab_pressed(tab_name: String):
	SoundManager.play_sfx("ui_select")
	GameState.active_main_view = tab_name
	rebuild_pantry_content()

func rebuild_pantry_content():
	for child in cabinet_grid.get_children():
		child.queue_free()
		
	var tab_name = GameState.active_main_view
	if tab_name == "cabinet":
		cabinet_grid.columns = 2
		rebuild_cabinet()
	elif tab_name == "skills":
		cabinet_grid.columns = 1
		rebuild_skills()
	elif tab_name == "journal":
		cabinet_grid.columns = 1
		rebuild_journal()
	elif tab_name == "trophies":
		cabinet_grid.columns = 1
		rebuild_trophies()
		
	# Re-style dynamic controls
	var main_node = get_tree().root.get_child(0)
	if main_node and main_node.has_method("apply_cozy_theme"):
		main_node.apply_cozy_theme(self)

func rebuild_cabinet():
	var starters_ids = []
	for st in Database.starters:
		starters_ids.append(st.get("id"))
		
	# Populate starters
	for st in Database.starters:
		create_slot(st.get("id"), st.get("emoji", "❓"), st.get("name", "Unknown"))
		
	# Populate discovered ingredients (excluding starters)
	for id in GameState.discovered_ids.keys():
		if id in starters_ids:
			continue
		var item = Database.discoverable_items.get(id)
		if item:
			create_slot(id, item.get("emoji", "❓"), item.get("name", id))

func create_slot(id: String, emoji: String, name: String):
	if not slot_scene:
		return
	var slot = slot_scene.instantiate()
	cabinet_grid.add_child(slot)
	slot.setup(id, emoji, name)
	slot.connect("item_clicked", Callable(self, "_on_slot_clicked"))

func _on_slot_clicked(id: String):
	SoundManager.play_sfx("ui_select")
	var root = get_tree().root.get_child(0)
	var ws = root.find_child("Workspace", true, false)
	if ws and ws.has_method("spawn_token_at_mouse"):
		ws.spawn_token_at_mouse(id)

func rebuild_skills():
	var skills = [
		{"id": "prep", "name": " Prep Techniques", "icon": "🔪"},
		{"id": "force", "name": " Force Techniques", "icon": "✊"},
		{"id": "heat", "name": " Heat Techniques", "icon": "🍳"},
		{"id": "time", "name": " Time Techniques", "icon": "⏳"}
	]
	
	for s in skills:
		var xp = GameState.skills_xp.get(s.id, 0)
		var level = int(xp / 10) + 1
		var current_xp = int(xp) % 10
		
		var panel = PanelContainer.new()
		panel.custom_minimum_size = Vector2(300, 70)
		
		var vbox = VBoxContainer.new()
		vbox.alignment = BoxContainer.ALIGNMENT_CENTER
		vbox.theme_override_constants.separation = 4
		panel.add_child(vbox)
		
		var label_title = Label.new()
		label_title.text = s.icon + s.name + " (Lvl " + str(level) + ")"
		label_title.theme_override_font_sizes.font_size = 12
		vbox.add_child(label_title)
		
		var progress = ProgressBar.new()
		progress.min_value = 0
		progress.max_value = 10
		progress.value = current_xp
		progress.custom_minimum_size = Vector2(0, 10)
		progress.show_percentage = false
		vbox.add_child(progress)
		
		var label_xp = Label.new()
		label_xp.text = "XP: " + str(current_xp) + " / 10"
		label_xp.theme_override_font_sizes.font_size = 10
		label_xp.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		vbox.add_child(label_xp)
		
		cabinet_grid.add_child(panel)

func rebuild_journal():
	var log_entries = GameState.discovery_log.duplicate()
	log_entries.reverse()
	
	if log_entries.size() == 0:
		var empty_label = Label.new()
		empty_label.text = "Kitchen Journal is empty.\nDiscover ingredients to log them here!"
		empty_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		cabinet_grid.add_child(empty_label)
		return
		
	for entry in log_entries:
		var id = entry.get("id", "")
		var item = Database.discoverable_items.get(id)
		var emoji = "❓"
		var name = id
		if item:
			emoji = item.get("emoji", "❓")
			name = item.get("name", id)
		else:
			for st in Database.starters:
				if st.get("id") == id:
					emoji = st.get("emoji", "❓")
					name = st.get("name", id)
					break
					
		var panel = PanelContainer.new()
		panel.custom_minimum_size = Vector2(300, 48)
		
		var hbox = HBoxContainer.new()
		hbox.theme_override_constants.separation = 12
		hbox.alignment = BoxContainer.ALIGNMENT_BEGIN
		panel.add_child(hbox)
		
		var label_emoji = Label.new()
		label_emoji.text = emoji
		label_emoji.theme_override_font_sizes.font_size = 20
		hbox.add_child(label_emoji)
		
		var label_text = Label.new()
		label_text.text = name + "\nDiscovered"
		label_text.theme_override_font_sizes.font_size = 11
		hbox.add_child(label_text)
		
		cabinet_grid.add_child(panel)

func rebuild_trophies():
	var trophies = [
		{"id": "student", "title": "🎓 Culinary Student", "desc": "Unlock 10 recipes in your Ledger", "req": 10},
		{"id": "cozy", "title": "🏡 Cozy Cook", "desc": "Unlock 30 recipes in your Ledger", "req": 30},
		{"id": "adept", "title": "🥣 Master Combiner", "desc": "Unlock 60 recipes in your Ledger", "req": 60},
		{"id": "chef", "title": "🏆 Master Chef", "desc": "Unlock 100 recipes in your Ledger", "req": 100}
	]
	
	var count = GameState.get_unlocked_recipes_count()
	
	for t in trophies:
		var unlocked = count >= t.req
		
		var panel = PanelContainer.new()
		panel.custom_minimum_size = Vector2(300, 56)
		
		var vbox = VBoxContainer.new()
		vbox.theme_override_constants.separation = 4
		panel.add_child(vbox)
		
		var title_label = Label.new()
		title_label.text = t.title if unlocked else "🔒 Locked Trophy"
		title_label.theme_override_font_sizes.font_size = 12
		vbox.add_child(title_label)
		
		var desc_label = Label.new()
		desc_label.text = t.desc
		desc_label.theme_override_font_sizes.font_size = 10
		vbox.add_child(desc_label)
		
		if not unlocked:
			panel.modulate = Color(1, 1, 1, 0.5)
			
		cabinet_grid.add_child(panel)
