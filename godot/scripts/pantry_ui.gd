extends Control

@export var slot_scene: PackedScene = preload("res://scenes/pantry_item_slot.tscn")

@onready var cabinet_grid = $Layout/TabContents/CabinetScroll/CabinetGrid
@onready var cabinet_panel = $Layout/TabContents/CabinetScroll
@onready var placeholder_label = $Layout/TabContents/PlaceholderPanel/PlaceholderLabel
@onready var placeholder_panel = $Layout/TabContents/PlaceholderPanel

func _ready():
	GameState.connect("discovery_changed", Callable(self, "_on_discovery_changed"))
	
	# Connect tabs dynamically
	$Layout/TabBar/BtnCabinet.pressed.connect(_on_tab_pressed.bind("cabinet"))
	$Layout/TabBar/BtnSkills.pressed.connect(_on_tab_pressed.bind("skills"))
	$Layout/TabBar/BtnJournal.pressed.connect(_on_tab_pressed.bind("journal"))
	$Layout/TabBar/BtnTrophies.pressed.connect(_on_tab_pressed.bind("trophies"))
	
	_on_tab_pressed("cabinet")
	rebuild_cabinet()

func _on_discovery_changed():
	rebuild_cabinet()

func _on_tab_pressed(tab_name: String):
	SoundManager.play_sfx("ui_select")
	# Update active tab in state
	GameState.active_main_view = tab_name
	
	if tab_name == "cabinet":
		cabinet_panel.visible = true
		placeholder_panel.visible = false
	else:
		cabinet_panel.visible = false
		placeholder_panel.visible = true
		placeholder_label.text = tab_name.capitalize() + " Panel\n(Coming soon in Phase 4)"

func rebuild_cabinet():
	# Clear old slot nodes
	for child in cabinet_grid.get_children():
		child.queue_free()
		
	# Find all discovered items that are in Database
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
	# Tell workspace to spawn token at mouse
	var root = get_tree().root.get_child(0)
	var ws = root.find_child("Workspace", true, false)
	if ws and ws.has_method("spawn_token_at_mouse"):
		ws.spawn_token_at_mouse(id)
