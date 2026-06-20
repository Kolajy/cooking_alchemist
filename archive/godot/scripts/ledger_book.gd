extends Control

@onready var tab_container = $BookFrame/TabContainer
@onready var book_frame = $BookFrame
@onready var title_label = $BookFrame/Header

const BOOK_CATEGORIES := ["Produce", "Forage", "Proteins", "Liquids", "Pantry"]


func _ready() -> void:
	visible = false
	$BookFrame/BtnClose.pressed.connect(hide_book)
	GameState.connect("discovery_changed", Callable(self, "_on_discovery_changed"))
	rebuild_book()


func _on_discovery_changed() -> void:
	if visible:
		rebuild_book()


func show_book() -> void:
	rebuild_book()
	visible = true
	book_frame.add_theme_stylebox_override("panel", CozyTheme.make_parchment_panel())
	if title_label:
		title_label.text = "📖 Grandmother's Recipe Ledger"
	var main_node = get_tree().root.get_child(0)
	if main_node and main_node.has_method("apply_cozy_theme"):
		main_node.apply_cozy_theme(self)
	if GameState.reduced_motion:
		book_frame.scale = Vector2.ONE
	else:
		book_frame.scale = Vector2(0.4, 0.4)
		var tween = create_tween()
		tween.tween_property(book_frame, "scale", Vector2.ONE, 0.35).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	SoundManager.play_sfx("ui_tab")


func hide_book() -> void:
	var tween = create_tween()
	tween.tween_property(book_frame, "scale", Vector2(0.2, 0.2), 0.25).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_IN)
	tween.tween_callback(func(): visible = false)
	SoundManager.play_sfx("ui_click")


func rebuild_book() -> void:
	for category in BOOK_CATEGORIES:
		var grid_path = "BookFrame/TabContainer/" + category + "/Scroll/Grid"
		if not has_node(grid_path):
			continue
		var grid = get_node(grid_path)
		for child in grid.get_children():
			child.queue_free()

		var recipes: Array = []
		for id in Database.discoverable_items.keys():
			var item: Dictionary = Database.discoverable_items[id]
			if str(item.get("category", "")) != category:
				continue
			if str(item.get("type", "")) != "recipe":
				continue
			if not GameState.is_discovered(id):
				continue
			recipes.append({"id": id, "item": item})

		recipes.sort_custom(func(a, b): return str(a.item.get("name", "")) < str(b.item.get("name", "")))

		if recipes.is_empty():
			grid.add_child(_make_empty_label("No finalized recipes in this category yet."))
			continue

		for entry in recipes:
			grid.add_child(_make_recipe_card(entry.id, entry.item))


func _make_empty_label(text: String) -> Label:
	var label := Label.new()
	label.text = text
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
	return label


func _make_recipe_card(id: String, item: Dictionary) -> Control:
	var card = PanelContainer.new()
	card.custom_minimum_size = Vector2(200, 96)
	card.add_theme_stylebox_override("panel", CozyTheme.make_token_panel("recipe"))

	var margin = MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 10)
	margin.add_theme_constant_override("margin_top", 10)
	margin.add_theme_constant_override("margin_right", 10)
	margin.add_theme_constant_override("margin_bottom", 10)
	card.add_child(margin)

	var vbox = VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	margin.add_child(vbox)

	var title = Label.new()
	title.add_theme_font_size_override("font_size", 14)
	title.text = "%s %s" % [item.get("emoji", "❓"), item.get("name", "Unknown")]
	title.add_theme_color_override("font_color", CozyTheme.SCROLL_INK)
	vbox.add_child(title)

	var meta = Label.new()
	meta.add_theme_font_size_override("font_size", 11)
	meta.text = "%s · Finalized recipe" % item.get("category", "")
	meta.add_theme_color_override("font_color", CozyTheme.SCROLL_GOLD)
	vbox.add_child(meta)

	var body = Label.new()
	body.add_theme_font_size_override("font_size", 11)
	body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	body.text = item.get("blurb", item.get("description", "Keep experimenting to learn more."))
	body.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
	vbox.add_child(body)

	var tip_panel = PanelContainer.new()
	tip_panel.add_theme_stylebox_override(
		"panel",
		CozyTheme.make_flat_panel(Color(0.945, 0.935, 0.905), CozyTheme.SCROLL_COPPER, 6, 1)
	)
	var tip_box = VBoxContainer.new()
	tip_panel.add_child(tip_box)
	var tip_title = Label.new()
	tip_title.text = "📜 Did You Know?"
	tip_title.add_theme_font_size_override("font_size", 11)
	tip_title.add_theme_color_override("font_color", CozyTheme.SCROLL_GOLD)
	tip_box.add_child(tip_title)
	var tip_body = Label.new()
	tip_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	tip_body.add_theme_font_size_override("font_size", 10)
	tip_body.text = item.get("scienceTip", item.get("tip", item.get("blurb", item.get("description", "Keep experimenting to learn more."))))
	tip_body.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
	tip_box.add_child(tip_body)
	vbox.add_child(tip_panel)

	var btn = Button.new()
	btn.text = "Place on counter"
	btn.pressed.connect(_place_on_counter.bind(id))
	CozyTheme.apply_button(btn)
	vbox.add_child(btn)

	return card


func _place_on_counter(id: String) -> void:
	hide_book()
	GameState.active_main_view = "cook"
	var ws = get_tree().root.get_child(0).find_child("Workspace", true, false)
	if ws and ws.has_method("spawn_token_at_center"):
		ws.spawn_token_at_center(id)
	SoundManager.play_sfx("ui_pickup")
