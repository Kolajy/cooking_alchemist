extends Control

var _layout: Dictionary = {}
var _node_buttons: Dictionary = {}
var _search_text := ""
var _focus_id := ""
var _focus_depth := 2


func rebuild(show_hidden: bool, search_text: String = "", focus_id: String = "", focus_depth: int = 2) -> void:
	_search_text = search_text.strip_edges().to_lower()
	_focus_id = focus_id
	_focus_depth = focus_depth
	for child in get_children():
		child.queue_free()
	_node_buttons.clear()

	if _focus_id != "":
		_layout = GraphLayout.build_focus_layout(_focus_id, show_hidden, _focus_depth)
	else:
		_layout = GraphLayout.build_layout(show_hidden)

	custom_minimum_size = _layout.get("size", Vector2(640, 420))
	queue_redraw()

	for id in _layout.get("visible_ids", []):
		if _search_text != "" and not _matches_search(id):
			continue
		var pos: Vector2 = _layout.positions[id]
		var discovered := GameState.is_discovered(id)
		var available := GameState.is_pantry_available(id)
		var item: Dictionary = _item_for(id)
		var btn := Button.new()
		btn.position = pos
		btn.custom_minimum_size = Vector2(GraphLayout.NODE_W, GraphLayout.NODE_H)
		if discovered or available:
			btn.text = "%s\n%s" % [item.get("emoji", "❓"), item.get("name", id)]
		else:
			btn.text = "???\nHidden"
			btn.disabled = true
			btn.modulate = Color(1, 1, 1, 0.45)
		if not available:
			btn.disabled = true
		if id == _focus_id:
			CozyTheme.apply_button(btn, true)
		else:
			CozyTheme.apply_button(btn)
			_style_node_origin(btn, item, discovered or available)
		btn.pressed.connect(_on_node_pressed.bind(id))
		btn.gui_input.connect(_on_node_gui_input.bind(id))
		add_child(btn)
		_node_buttons[id] = btn


func _matches_search(id: String) -> bool:
	if _search_text.is_empty():
		return true
	if id.to_lower().contains(_search_text):
		return true
	var item := _item_for(id)
	return str(item.get("name", "")).to_lower().contains(_search_text)


func _item_for(id: String) -> Dictionary:
	return Database.get_item(id)


func _style_node_origin(btn: Button, item: Dictionary, discovered: bool) -> void:
	if not discovered:
		return
	var origin = str(item.get("origin", "raw"))
	var tint := CozyTheme.make_token_panel(origin)
	btn.add_theme_stylebox_override("normal", tint)
	btn.add_theme_stylebox_override("hover", tint)


func get_node_center(id: String) -> Vector2:
	if _layout.positions.has(id):
		return _layout.positions[id] + Vector2(GraphLayout.NODE_W * 0.5, GraphLayout.NODE_H * 0.5)
	return Vector2.ZERO


func _draw() -> void:
	if _layout.is_empty():
		return

	var font := CozyTheme.get_body_font()
	var row_labels: Dictionary = _layout.get("row_labels", {})
	for depth in _layout.get("sorted_depths", []):
		if not row_labels.has(depth):
			continue
		var label: Dictionary = row_labels[depth]
		draw_string(
			font,
			Vector2(GraphLayout.PADDING, label.y),
			label.text,
			HORIZONTAL_ALIGNMENT_LEFT,
			-1,
			12,
			Color(CozyTheme.SCROLL_INK_MUTED, 0.85)
		)

	_draw_legend()

	var positions: Dictionary = _layout.get("positions", {})
	for transition in _layout.get("transitions", []):
		_draw_transition(positions, transition)


func _draw_transition(positions: Dictionary, transition: Dictionary) -> void:
	var kind := str(transition.get("kind", ""))
	if kind == "combine":
		_draw_combine_transition(positions, transition)
	else:
		_draw_technique_transition(positions, transition)


func _draw_technique_transition(positions: Dictionary, transition: Dictionary) -> void:
	var inputs: Array = transition.get("inputs", [])
	if inputs.is_empty():
		return
	var from_id: String = str(inputs[0])
	var to_id: String = str(transition.get("output", ""))
	if not _node_buttons.has(from_id) or not _node_buttons.has(to_id):
		return
	if not positions.has(from_id) or not positions.has(to_id):
		return
	var from_pos: Vector2 = positions[from_id] + Vector2(GraphLayout.NODE_W * 0.5, GraphLayout.NODE_H)
	var to_pos: Vector2 = positions[to_id] + Vector2(GraphLayout.NODE_W * 0.5, 0.0)
	var discovered := GraphLayout.is_edge_discovered(from_id, to_id)
	var alpha := 0.42 if discovered else 0.14
	var color := Color(CozyTheme.SCROLL_COPPER, alpha)
	var width := 2.0 if discovered else 1.5
	GraphDraw.draw_bezier(self, from_pos, to_pos, color, width)
	if discovered:
		GraphDraw.draw_arrow_on_bezier(self, from_pos, to_pos, color)
		var marker := GraphLayout._tool_emoji(GraphLayout._tool_for_transition(transition))
		var mid := GraphDraw.bezier_midpoint(from_pos, to_pos)
		GraphDraw.draw_transition_marker(self, mid, marker, color, true)


func _draw_combine_transition(positions: Dictionary, transition: Dictionary) -> void:
	var output_id: String = str(transition.get("output", ""))
	if not _node_buttons.has(output_id) or not positions.has(output_id):
		return

	var input_bottoms: Array = []
	for input_id in transition.get("inputs", []):
		var id := str(input_id)
		if not _node_buttons.has(id) or not positions.has(id):
			return
		input_bottoms.append(positions[id] + Vector2(GraphLayout.NODE_W * 0.5, GraphLayout.NODE_H))

	if input_bottoms.is_empty():
		return

	var junction := Vector2.ZERO
	for point in input_bottoms:
		junction.x += point.x
	junction.x /= float(input_bottoms.size())
	junction.y = input_bottoms[0].y
	for point in input_bottoms:
		junction.y = max(junction.y, point.y)
	junction.y += 28.0

	var to_pos: Vector2 = positions[output_id] + Vector2(GraphLayout.NODE_W * 0.5, 0.0)
	var all_discovered := GraphLayout._transition_discovered(transition)
	var alpha := 0.5 if all_discovered else 0.14
	var color := Color(CozyTheme.COMBINE_GOLD, alpha)
	var width := 2.0 if all_discovered else 1.5

	for start in input_bottoms:
		GraphDraw.draw_bezier(self, start, junction - Vector2(0, 16), color, width)
	if all_discovered:
		GraphDraw.draw_transition_marker(self, junction, "+", color, true)
	GraphDraw.draw_bezier(self, junction + Vector2(0, 16), to_pos, color, width)
	if all_discovered:
		GraphDraw.draw_arrow_on_bezier(self, junction + Vector2(0, 16), to_pos, color)


func _draw_legend() -> void:
	var y := 8.0
	var entries := [
		{"color": Color(0.961, 0.949, 0.992), "label": "Primal"},
		{"color": Color(0.992, 0.984, 0.961), "label": "Raw"},
		{"color": Color(0.992, 0.976, 0.929), "label": "Prepared"},
		{"color": Color(0.992, 0.941, 0.941), "label": "Recipe"}
	]
	var x := max(8.0, size.x - 320.0)
	for entry in entries:
		draw_rect(Rect2(x, y, 10, 10), entry.color, true)
		draw_string(CozyTheme.get_body_font(), Vector2(x + 16, y + 9), entry.label, HORIZONTAL_ALIGNMENT_LEFT, -1, 11, CozyTheme.SCROLL_INK_MUTED)
		x += 72.0


func _on_node_pressed(id: String) -> void:
	if not GameState.is_pantry_available(id):
		return
	var map_view = get_tree().root.get_child(0).find_child("ProgressMap", true, false)
	if map_view and map_view.has_method("focus_graph_node"):
		map_view.focus_graph_node(id)
	if map_view and map_view.has_method("place_graph_node_on_counter"):
		map_view.place_graph_node_on_counter(id)


func _on_node_gui_input(event: InputEvent, id: String) -> void:
	if not GameState.is_pantry_available(id):
		return
	if event is InputEventMouseButton:
		var mouse := event as InputEventMouseButton
		if mouse.pressed and mouse.double_click and mouse.button_index == MOUSE_BUTTON_LEFT:
			var map_view = get_tree().root.get_child(0).find_child("ProgressMap", true, false)
			if map_view and map_view.has_method("place_graph_node_on_counter"):
				map_view.place_graph_node_on_counter(id)
