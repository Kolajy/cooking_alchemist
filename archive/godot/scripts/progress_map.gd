extends Control

@onready var panel = $Panel
@onready var summary = $Panel/Header/SummaryLabel
@onready var show_all_toggle = $Panel/Header/ShowAllToggle
@onready var view_toggle = $Panel/Header/ViewToggle
@onready var category_search = $Panel/Header/CategorySearch
@onready var category_scroll = $Panel/CategoryScroll
@onready var category_content = $Panel/CategoryScroll/Content
@onready var graph_host = $Panel/GraphHost
@onready var graph_toolbar = $Panel/GraphHost/Toolbar
@onready var graph_search = $Panel/GraphHost/Toolbar/SearchField
@onready var graph_depth = $Panel/GraphHost/Toolbar/DepthOption
@onready var focus_label = $Panel/GraphHost/FocusLabel
@onready var graph_viewport_host = $Panel/GraphHost/ViewportHost
@onready var graph_paths_host = $Panel/GraphHost/PathsHost

var _graph_canvas: Control
var _graph_viewport: Control
var _graph_paths_panel: Control
var _graph_mode := false
var _focus_id := ""


func _ready() -> void:
	visible = false
	GameState.connect("discovery_changed", Callable(self, "_rebuild"))
	show_all_toggle.toggled.connect(func(_v): _rebuild())
	if view_toggle:
		view_toggle.item_selected.connect(_on_view_changed)
		view_toggle.add_item("Browse by category")
		view_toggle.add_item("Recipe graph")
	if graph_search:
		graph_search.text_changed.connect(_on_graph_search_changed)
		graph_search.text_submitted.connect(_on_graph_search_submitted)
	if category_search:
		category_search.text_changed.connect(func(_t): _rebuild_category_only())
	if graph_depth:
		graph_depth.clear()
		graph_depth.add_item("1 degree", 1)
		graph_depth.add_item("2 degrees", 2)
		graph_depth.add_item("Everything", 9999)
		graph_depth.select(1)
		graph_depth.item_selected.connect(func(_i): _rebuild_graph_only())
	if graph_toolbar:
		graph_toolbar.get_node("BtnZoomIn").pressed.connect(_zoom_in)
		graph_toolbar.get_node("BtnZoomOut").pressed.connect(_zoom_out)
		graph_toolbar.get_node("BtnFit").pressed.connect(_fit_graph)
		graph_toolbar.get_node("BtnPlace").pressed.connect(_place_focus_on_counter)
		graph_toolbar.get_node("BtnClearFocus").pressed.connect(_clear_graph_focus)
	_update_mode_visibility()
	_rebuild()


func set_visible_map(show_map: bool) -> void:
	visible = show_map
	if show_map:
		if not GameState.achievement_flags.has("map_opened"):
			GameState.set_achievement_flag("map_opened")
		_rebuild()


func focus_graph_node(id: String) -> void:
	if id.is_empty() or not _map_item_interactive(id):
		return
	_focus_id = id
	_rebuild_graph_only()
	call_deferred("_center_graph_node", id)


func _clear_graph_focus() -> void:
	_focus_id = ""
	_rebuild_graph_only()
	SoundManager.play_sfx("ui_click")


func _place_focus_on_counter() -> void:
	if _focus_id.is_empty() or not _map_item_interactive(_focus_id):
		return
	place_graph_node_on_counter(_focus_id)


func place_graph_node_on_counter(id: String) -> void:
	if id.is_empty() or not _map_item_interactive(id):
		return
	GameState.active_main_view = "cook"
	var ws = get_tree().root.get_child(0).find_child("Workspace", true, false)
	if ws and ws.has_method("spawn_token_at_center"):
		ws.spawn_token_at_center(id)
	set_visible_map(false)
	if ws and ws.has_method("update_map_button"):
		ws.update_map_button()
	SoundManager.play_sfx("ui_pickup")


func _on_view_changed(index: int) -> void:
	_graph_mode = index == 1
	_update_mode_visibility()
	_rebuild()


func _on_graph_search_changed(_text: String) -> void:
	if _graph_mode:
		_rebuild_graph_only()


func _on_graph_search_submitted(_text: String) -> void:
	if not _graph_mode:
		return
	var query: String = graph_search.text.strip_edges().to_lower()
	if query.is_empty():
		return
	for id in Database.discoverable_items.keys():
		if not GameState.is_discovered(id):
			continue
		var item: Dictionary = Database.discoverable_items[id]
		var name: String = str(item.get("name", "")).to_lower()
		if query in name or query in id:
			focus_graph_node(id)
			break


func _focus_depth_value() -> int:
	if graph_depth == null:
		return 2
	return int(graph_depth.get_selected_id())


func _update_focus_label() -> void:
	if focus_label == null:
		return
	if _focus_id.is_empty():
		focus_label.text = "Search or click a node to explore its recipe web."
		return
	var item := _item_for(_focus_id)
	focus_label.text = "Focused: %s %s" % [item.get("emoji", "❓"), item.get("name", _focus_id)]


func _item_for(id: String) -> Dictionary:
	if Database.discoverable_items.has(id):
		return Database.discoverable_items[id]
	for starter in Database.starters:
		if starter.get("id", "") == id:
			return starter
	return {}


func focus_graph_search() -> void:
	if graph_search:
		graph_search.grab_focus()
		graph_search.select_all()


func _rebuild_category_only() -> void:
	if visible and not _graph_mode:
		_build_category_view()


func _update_mode_visibility() -> void:
	category_scroll.visible = not _graph_mode
	graph_host.visible = _graph_mode
	show_all_toggle.visible = true
	if category_search:
		category_search.visible = not _graph_mode


func _rebuild() -> void:
	if not visible:
		return

	var discovered_count = GameState.get_discovered_item_count()
	var recipe_count = GameState.get_finalized_recipe_count()
	var total = Database.discoverable_items.size()
	var ach = GameState.get_achievement_summary()
	summary.text = "Ledger restored: %d recipes · %d / %d items (%d%%). Trophies: %d / %d." % [
		recipe_count, discovered_count, total, GameState.get_restored_percentage(), ach.unlocked, ach.total
	]

	_update_mode_visibility()
	if _graph_mode:
		_build_graph_view()
	else:
		_build_category_view()


func _rebuild_graph_only() -> void:
	if visible and _graph_mode:
		_build_graph_view()


func _build_graph_view() -> void:
	_update_focus_label()
	for child in graph_viewport_host.get_children():
		child.queue_free()
	_graph_viewport = Control.new()
	_graph_viewport.set_script(load("res://scripts/progress_graph_viewport.gd"))
	_graph_viewport.set_anchors_preset(Control.PRESET_FULL_RECT)
	_graph_viewport.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_graph_viewport.size_flags_vertical = Control.SIZE_EXPAND_FILL
	graph_viewport_host.add_child(_graph_viewport)

	_graph_canvas = Control.new()
	_graph_canvas.set_script(load("res://scripts/progress_graph_canvas.gd"))
	var search_text: String = graph_search.text if graph_search else ""
	_graph_canvas.rebuild(
		show_all_toggle.button_pressed,
		search_text,
		_focus_id,
		_focus_depth_value()
	)
	_graph_viewport.mount_canvas(_graph_canvas)

	for child in graph_paths_host.get_children():
		child.queue_free()
	_graph_paths_panel = PanelContainer.new()
	_graph_paths_panel.set_script(load("res://scripts/progress_graph_paths_panel.gd"))
	graph_paths_host.add_child(_graph_paths_panel)
	_graph_paths_panel.rebuild(_focus_id, show_all_toggle.button_pressed, _focus_depth_value())

	if _focus_id != "":
		call_deferred("_center_graph_node", _focus_id)


func _center_graph_node(id: String) -> void:
	if _graph_canvas == null or _graph_viewport == null:
		return
	if _graph_canvas.has_method("get_node_center"):
		var center: Vector2 = _graph_canvas.get_node_center(id)
		if center != Vector2.ZERO and _graph_viewport.has_method("center_on_graph_point"):
			_graph_viewport.center_on_graph_point(center)


func _build_category_view() -> void:
	for child in category_content.get_children():
		child.queue_free()

	var filter_text := ""
	if category_search:
		filter_text = category_search.text.strip_edges().to_lower()

	var grouped: Dictionary = {}
	for id in _browse_item_ids():
		var item: Dictionary = Database.get_item(str(id))
		if item.is_empty():
			continue
		var category = str(item.get("category", "Other"))
		if not grouped.has(category):
			grouped[category] = []
		grouped[category].append(str(id))

	var categories: Array = grouped.keys()
	categories.sort()
	for category in categories:
		var ids: Array = grouped[category]
		ids.sort()
		var visible_ids: Array = []
		for id in ids:
			if not _map_item_visible(id):
				continue
			if filter_text != "":
				var item: Dictionary = Database.get_item(id)
				var name: String = str(item.get("name", id)).to_lower()
				if filter_text not in name and filter_text not in id:
					continue
			visible_ids.append(id)
		if visible_ids.is_empty():
			continue
		category_content.add_child(_make_category_header(category, visible_ids.size()))
		var row := GridContainer.new()
		row.columns = 5
		row.add_theme_constant_override("h_separation", 8)
		row.add_theme_constant_override("v_separation", 8)
		category_content.add_child(row)
		for id in visible_ids:
			var item: Dictionary = Database.get_item(id)
			row.add_child(_make_node_button(id, item, _map_item_interactive(id)))


func _browse_item_ids() -> Array:
	var ids: Dictionary = {}
	for id in Database.discoverable_items.keys():
		ids[id] = true
	for id in Database.unlockables_by_id.keys():
		ids[id] = true
	return ids.keys()


func _map_item_visible(id: String) -> bool:
	if GameState.is_discovered(id):
		return true
	if show_all_toggle.button_pressed:
		return true
	return GameState.is_pantry_available(id) and not GameState.is_starter(id)


func _map_item_interactive(id: String) -> bool:
	return GameState.is_pantry_available(id)


func _make_category_header(category: String, count: int) -> Label:
	var label := Label.new()
	label.text = "%s  ·  %d shown" % [category.to_upper(), count]
	label.add_theme_color_override("font_color", CozyTheme.SCROLL_GOLD)
	label.add_theme_font_override("font", CozyTheme.get_display_font())
	label.add_theme_font_size_override("font_size", 14)
	return label


func _make_node_button(id: String, item: Dictionary, discovered: bool) -> Button:
	var btn := Button.new()
	btn.custom_minimum_size = Vector2(108, 72)
	if discovered:
		btn.text = "%s\n%s" % [item.get("emoji", "❓"), item.get("name", id)]
	else:
		btn.text = "???\nHidden"
		btn.disabled = true
		btn.modulate = Color(1, 1, 1, 0.45)
	btn.pressed.connect(_on_node_pressed.bind(id))
	CozyTheme.apply_button(btn)
	return btn


func _on_node_pressed(id: String) -> void:
	if not _map_item_interactive(id):
		return
	GameState.active_main_view = "cook"
	var ws = get_tree().root.get_child(0).find_child("Workspace", true, false)
	if ws and ws.has_method("spawn_token_at_center"):
		ws.spawn_token_at_center(id)
	set_visible_map(false)
	if ws and ws.has_method("update_map_button"):
		ws.update_map_button()
	SoundManager.play_sfx("ui_click")


func _zoom_in() -> void:
	if _graph_viewport and _graph_viewport.has_method("zoom_in"):
		_graph_viewport.zoom_in()
		SoundManager.play_sfx("ui_click")


func _zoom_out() -> void:
	if _graph_viewport and _graph_viewport.has_method("zoom_out"):
		_graph_viewport.zoom_out()
		SoundManager.play_sfx("ui_click")


func _fit_graph() -> void:
	if _graph_viewport and _graph_viewport.has_method("fit_view"):
		_graph_viewport.fit_view()
		SoundManager.play_sfx("ui_click")
