extends Control

@onready var tab_container = $BookFrame/TabContainer
@onready var book_frame = $BookFrame

func _ready():
	visible = false
	$BookFrame/BtnClose.pressed.connect(hide_book)
	GameState.connect("discovery_changed", Callable(self, "_on_discovery_changed"))
	rebuild_book()

func _on_discovery_changed():
	if visible:
		rebuild_book()

func show_book():
	rebuild_book()
	visible = true
	book_frame.scale = Vector2(0.4, 0.4)
	var tween = create_tween()
	tween.tween_property(book_frame, "scale", Vector2(1.0, 1.0), 0.35).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

func hide_book():
	var tween = create_tween()
	tween.tween_property(book_frame, "scale", Vector2(0.2, 0.2), 0.25).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_IN)
	tween.tween_callback(self.set.bind("visible", false))

func rebuild_book():
	# For each tab in the TabContainer, clear the grids and populate discovered items matching that category
	var categories = ["Produce", "Forage", "Proteins", "Liquids", "Pantry"]
	for category in categories:
		var grid_path = "BookFrame/TabContainer/" + category + "/Scroll/Grid"
		if not has_node(grid_path):
			continue
		var grid = get_node(grid_path)
		
		# Clear existing
		for child in grid.get_children():
			child.queue_free()
			
		# Find discoverable items matching this category
		for id in Database.discoverable_items.keys():
			var item = Database.discoverable_items[id]
			if item.get("category") == category:
				var is_disc = GameState.is_discovered(id)
				var card = create_recipe_card(item, is_disc)
				grid.add_child(card)

func create_recipe_card(item: Dictionary, discovered: bool) -> Control:
	var card = PanelContainer.new()
	card.custom_minimum_size = Vector2(180, 80)
	
	var style = StyleBoxFlat.new()
	style.bg_color = Color("2e241c") if discovered else Color("1b1511")
	style.border_width_left = 1
	style.border_width_top = 1
	style.border_width_right = 1
	style.border_width_bottom = 1
	style.border_color = Color("c79952") if discovered else Color("4d392a")
	style.corner_radius_top_left = 6
	style.corner_radius_top_right = 6
	style.corner_radius_bottom_right = 6
	style.corner_radius_bottom_left = 6
	card.add_theme_stylebox_override("panel", style)
	
	var margin = MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 8)
	margin.add_theme_constant_override("margin_top", 8)
	margin.add_theme_constant_override("margin_right", 8)
	margin.add_theme_constant_override("margin_bottom", 8)
	card.add_child(margin)
	
	var vbox = VBoxContainer.new()
	margin.add_child(vbox)
	
	var title = Label.new()
	title.add_theme_font_size_override("font_size", 12)
	if discovered:
		title.text = item.get("emoji", "❓") + " " + item.get("name", "Unknown")
		title.add_theme_color_override("font_color", Color("fce2a6"))
	else:
		title.text = "❓ Hidden Recipe"
		title.add_theme_color_override("font_color", Color("7d624a"))
	vbox.add_child(title)
	
	var desc = Label.new()
	desc.add_theme_font_size_override("font_size", 9)
	desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	desc.size_flags_vertical = Control.SIZE_EXPAND_FILL
	if discovered:
		desc.text = item.get("description", "")
		desc.add_theme_color_override("font_color", Color("e0dad2"))
	else:
		desc.text = "Discover ingredients to unlock this recipe page."
		desc.add_theme_color_override("font_color", Color("5c4939"))
	vbox.add_child(desc)
	
	return card
