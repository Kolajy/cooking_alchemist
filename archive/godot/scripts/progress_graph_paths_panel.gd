extends PanelContainer

var _list: VBoxContainer


func _ready() -> void:
	custom_minimum_size = Vector2(0, 88)
	add_theme_stylebox_override("panel", CozyTheme.make_flat_panel(Color(0.961, 0.945, 0.914, 0.94), CozyTheme.SCROLL_COPPER, 8, 1))
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 10)
	margin.add_theme_constant_override("margin_top", 8)
	margin.add_theme_constant_override("margin_right", 10)
	margin.add_theme_constant_override("margin_bottom", 8)
	add_child(margin)

	var outer := VBoxContainer.new()
	outer.add_theme_constant_override("separation", 6)
	margin.add_child(outer)

	var title := Label.new()
	title.text = "Known paths"
	title.add_theme_color_override("font_color", CozyTheme.SCROLL_GOLD)
	title.add_theme_font_size_override("font_size", 13)
	outer.add_child(title)

	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(0, 64)
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	outer.add_child(scroll)

	_list = VBoxContainer.new()
	_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_list.add_theme_constant_override("separation", 4)
	scroll.add_child(_list)


func rebuild(focus_id: String, show_hidden: bool, max_depth: int) -> void:
	for child in _list.get_children():
		child.queue_free()

	var paths: Array = GraphLayout.get_known_paths(focus_id, show_hidden, max_depth)
	if paths.is_empty():
		var empty := Label.new()
		empty.text = "Discover more ingredients to reveal crafting paths here."
		empty.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		empty.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
		empty.add_theme_font_size_override("font_size", 11)
		_list.add_child(empty)
		return

	for path in paths:
		_list.add_child(_make_path_row(path))


func _make_path_row(path: Dictionary) -> Control:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)

	var from_label := Label.new()
	from_label.text = str(path.get("from", ""))
	from_label.add_theme_font_size_override("font_size", 11)
	from_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(from_label)

	var via_label := Label.new()
	via_label.text = str(path.get("via", ""))
	via_label.add_theme_color_override("font_color", CozyTheme.SCROLL_GOLD)
	via_label.add_theme_font_size_override("font_size", 11)
	via_label.custom_minimum_size = Vector2(110, 0)
	row.add_child(via_label)

	var to_label := Label.new()
	to_label.text = str(path.get("to", ""))
	to_label.add_theme_font_size_override("font_size", 11)
	to_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	to_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	row.add_child(to_label)

	return row
