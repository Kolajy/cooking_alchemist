extends Control

const IngredientUILib = preload("res://scripts/ingredient_ui.gd")

const DRAG_THRESHOLD := 3.0
const PANTRY_WIDTH := 340.0

signal item_clicked(id: String)

var item_id: String = ""
var _item_emoji := "❓"
var _item_name := ""

var _pointer_down := false
var _dragging := false
var _press_pos := Vector2.ZERO
var _grab_offset := Vector2.ZERO
var _ghost_layer: CanvasLayer
var _ghost: PanelContainer

@onready var btn: Button = $Btn
@onready var emoji_label: Label = $Emoji
@onready var name_label: Label = $Name
@onready var dot: Panel = $Dot


func _ready() -> void:
	if btn:
		btn.mouse_entered.connect(_on_mouse_entered)
		btn.mouse_exited.connect(_on_mouse_exited)
		btn.gui_input.connect(_on_btn_gui_input)


func setup(id: String, emoji: String, item_name: String) -> void:
	item_id = id
	_item_emoji = emoji
	_item_name = item_name
	var item := Database.get_item(id)
	var state: String = IngredientUILib.state_key(item, id)
	if emoji_label:
		emoji_label.text = emoji
	if name_label:
		name_label.text = item_name
		name_label.add_theme_color_override("font_color", CozyTheme.SCROLL_INK)
		name_label.tooltip_text = "%s · %s" % [item_name, IngredientUILib.state_label(state)]
	if dot:
		dot.tooltip_text = IngredientUILib.state_label(state)
		var dot_sb := StyleBoxFlat.new()
		dot_sb.bg_color = IngredientUILib.badge_color(state)
		dot_sb.set_corner_radius_all(6)
		dot_sb.border_width_left = 1
		dot_sb.border_width_top = 1
		dot_sb.border_width_right = 1
		dot_sb.border_width_bottom = 1
		dot_sb.border_color = Color(1, 1, 1, 0.55)
		dot.add_theme_stylebox_override("panel", dot_sb)
	if btn:
		btn.text = ""
		_apply_card_style(state)


func _apply_card_style(state: String) -> void:
	if not btn:
		return
	var normal := CozyTheme.make_token_panel(state)
	var hover := CozyTheme.make_flat_panel(
		Color(1.0, 0.985, 0.96, 0.98),
		CozyTheme.SCROLL_GOLD,
		10,
		2
	)
	btn.add_theme_stylebox_override("normal", normal)
	btn.add_theme_stylebox_override("hover", hover)
	btn.add_theme_stylebox_override("pressed", normal)


func set_recent_highlight(active: bool) -> void:
	if not btn:
		return
	if active:
		btn.add_theme_stylebox_override(
			"normal",
			CozyTheme.make_flat_panel(Color(1.02, 0.965, 0.88, 0.98), CozyTheme.SCROLL_GOLD, 8, 2)
		)
		btn.add_theme_stylebox_override(
			"hover",
			CozyTheme.make_flat_panel(Color(1.04, 0.975, 0.9, 0.98), CozyTheme.SCROLL_GOLD, 8, 2)
		)
		_play_recent_glow()
	else:
		_apply_card_style(IngredientUILib.state_key(Database.get_item(item_id), item_id))


func _play_recent_glow() -> void:
	if GameState == null or GameState.reduced_motion or not btn:
		return
	btn.modulate = Color(1.08, 1.02, 0.92)
	var tween := create_tween()
	tween.set_loops(2)
	tween.tween_property(btn, "modulate", Color(1.12, 1.04, 0.88), 0.55).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(btn, "modulate", Color(1.05, 0.98, 0.88), 0.55).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)


func _on_btn_gui_input(event: InputEvent) -> void:
	# Only the initial press is captured here (it always lands on the button).
	# The drag motion + release are handled in _input() so they keep arriving
	# even after the pointer leaves the button toward the counter.
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		HoverPanel.hide_panel()
		_pointer_down = true
		_dragging = false
		_press_pos = event.global_position
		if btn:
			_grab_offset = event.global_position - btn.global_position
		btn.accept_event()


func _input(event: InputEvent) -> void:
	if not _pointer_down:
		return
	if event is InputEventMouseMotion:
		var pos: Vector2 = (event as InputEventMouseMotion).global_position
		if not _dragging and pos.distance_to(_press_pos) >= DRAG_THRESHOLD:
			_start_drag()
		if _dragging:
			_move_ghost(pos)
			_set_workspace_drop_target(_is_over_workspace(pos))
			get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and not event.pressed:
		var release_pos: Vector2 = (event as InputEventMouseButton).global_position
		if _dragging:
			_finish_drag(release_pos)
		elif _pointer_down:
			emit_signal("item_clicked", item_id)
		_reset_drag_state()
		get_viewport().set_input_as_handled()


func _start_drag() -> void:
	_dragging = true
	_create_ghost()
	_move_ghost(_press_pos)
	Input.set_default_cursor_shape(Input.CURSOR_DRAG)
	SoundManager.play_sfx("ui_pickup")


func _finish_drag(global_pos: Vector2) -> void:
	_set_workspace_drop_target(false)
	if _is_over_workspace(global_pos):
		var ws = _find_workspace()
		if ws and ws.has_method("spawn_token_from_pantry"):
			ws.spawn_token_from_pantry(item_id, global_pos)
	_clear_ghost()


func _reset_drag_state() -> void:
	_pointer_down = false
	_dragging = false
	Input.set_default_cursor_shape(Input.CURSOR_ARROW)
	_set_workspace_drop_target(false)
	_clear_ghost()


func _create_ghost() -> void:
	_clear_ghost()
	_ghost_layer = CanvasLayer.new()
	_ghost_layer.layer = 120
	get_tree().root.add_child(_ghost_layer)
	_ghost = PanelContainer.new()
	if btn:
		_ghost.custom_minimum_size = btn.size
	else:
		_ghost.custom_minimum_size = Vector2(120, 56)
	_ghost.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var origin := IngredientUILib.state_key(Database.get_item(item_id), item_id)
	_ghost.add_theme_stylebox_override("panel", CozyTheme.make_token_panel(origin))
	var label := Label.new()
	label.text = "%s\n%s" % [_item_emoji, _item_name]
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", 11)
	_ghost.add_child(label)
	_ghost.modulate = Color(1.02, 0.98, 0.92, 0.95)
	_ghost_layer.add_child(_ghost)


func _move_ghost(global_pos: Vector2) -> void:
	if _ghost:
		_ghost.global_position = global_pos - _grab_offset


func _clear_ghost() -> void:
	if _ghost_layer and is_instance_valid(_ghost_layer):
		_ghost_layer.queue_free()
	_ghost_layer = null
	_ghost = null


func _is_over_workspace(global_pos: Vector2) -> bool:
	var vp_size := get_viewport().get_visible_rect().size
	return global_pos.x < vp_size.x - PANTRY_WIDTH and global_pos.y > 60.0


func _set_workspace_drop_target(active: bool) -> void:
	var ws = _find_workspace()
	if ws and ws.has_method("set_pantry_drop_target"):
		ws.set_pantry_drop_target(active)


func _find_workspace():
	var root = get_tree().root.get_child(0)
	return root.find_child("Workspace", true, false)


func _on_mouse_entered() -> void:
	if _dragging:
		return
	HoverPanel.show_for_item(item_id, btn.get_global_mouse_position())


func _on_mouse_exited() -> void:
	if not _dragging:
		HoverPanel.hide_panel()
