extends Area2D

const IngredientUILib = preload("res://scripts/ingredient_ui.gd")

var item_id: String = ""
var dragging: bool = false
var velocity: Vector2 = Vector2.ZERO
var target_position: Vector2 = Vector2.ZERO
var grab_offset: Vector2 = Vector2.ZERO

@onready var emoji_label: Label = $Emoji
@onready var name_label: Label = $Name
@onready var dot: Panel = $Dot
@onready var background: Panel = $Background
@onready var highlight: Panel = $Highlight

const SPRING_SPEED: float = 22.0
const ROTATION_CLAMP: float = 0.28
const VELOCITY_TILT: float = 0.0018
const DRAG_THRESHOLD := 3.0

var _highlight_tween: Tween
var _pointer_down := false
var _drag_moved := false
var _press_global := Vector2.ZERO


func _ready() -> void:
	target_position = global_position
	if highlight:
		highlight.visible = false
	mouse_entered.connect(_on_mouse_entered)
	mouse_exited.connect(_on_mouse_exited)


func setup(id: String) -> void:
	item_id = id
	target_position = global_position
	var data = _get_item_data(id)
	if data:
		var item_name = str(data.get("name", id))
		var emoji = str(data.get("emoji", "❓"))
		if emoji_label:
			emoji_label.text = emoji
		if name_label:
			name_label.text = item_name
			name_label.add_theme_color_override("font_color", CozyTheme.SCROLL_INK)
		_apply_state_dot(data, id)
		refresh_style()
	else:
		if name_label:
			name_label.text = id
		if emoji_label:
			emoji_label.text = "❓"


func _apply_state_dot(item: Dictionary, id: String) -> void:
	if dot == null:
		return
	var state := IngredientUILib.state_key(item, id)
	var dot_sb := StyleBoxFlat.new()
	dot_sb.bg_color = IngredientUILib.badge_color(state)
	dot_sb.set_corner_radius_all(6)
	dot_sb.border_width_left = 1
	dot_sb.border_width_top = 1
	dot_sb.border_width_right = 1
	dot_sb.border_width_bottom = 1
	dot_sb.border_color = Color(1, 1, 1, 0.55)
	dot.add_theme_stylebox_override("panel", dot_sb)


func refresh_style() -> void:
	if not background:
		return
	var data := _get_item_data(item_id)
	if data.is_empty():
		return
	var state := IngredientUILib.state_key(data, item_id)
	background.add_theme_stylebox_override("panel", CozyTheme.make_token_panel(state))


func play_spawn_animation() -> void:
	if GameState.reduced_motion:
		scale = Vector2.ONE
		return
	scale = Vector2(0.35, 0.35)
	var tween := create_tween()
	tween.tween_property(self, "scale", Vector2(1.08, 1.08), 0.18).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tween.tween_property(self, "scale", Vector2.ONE, 0.12).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)


func _get_item_data(id: String) -> Dictionary:
	return Database.get_item(id)


func _process(delta: float) -> void:
	if dragging:
		target_position = get_global_mouse_position() - grab_offset
		_update_combine_highlights()

	_clamp_target_to_workspace()

	var prev_pos = global_position
	global_position = global_position.lerp(target_position, SPRING_SPEED * delta)
	velocity = (global_position - prev_pos) / max(delta, 0.0001)

	var target_rotation = clamp(velocity.x * VELOCITY_TILT, -ROTATION_CLAMP, ROTATION_CLAMP)
	rotation = lerp(rotation, target_rotation, 15.0 * delta)


func _update_combine_highlights() -> void:
	if GameState.active_action != "combine":
		return
	var ws = _find_workspace()
	if not ws:
		return
	ws.clear_combine_highlights()
	var overlaps = get_overlapping_areas()
	for other in overlaps:
		if other != self and other.has_method("setup"):
			if ws.can_combine(item_id, other.item_id):
				other.set_highlight_visible(true, "combine")


func _find_workspace():
	var node = get_parent()
	while node:
		if node.has_method("on_token_released"):
			return node
		node = node.get_parent()
	return null


func _clamp_target_to_workspace() -> void:
	var ws = _find_workspace()
	if ws == null or not ws.has_method("get_workspace_bounds"):
		return
	var b: Rect2 = ws.get_workspace_bounds()
	target_position.x = clampf(target_position.x, b.position.x, b.position.x + b.size.x)
	target_position.y = clampf(target_position.y, b.position.y, b.position.y + b.size.y)


func _input_event(_viewport: Viewport, event: InputEvent, _shape_idx: int) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		var mouse := event as InputEventMouseButton
		if mouse.pressed:
			HoverPanel.hide_panel()
			_pointer_down = true
			_drag_moved = false
			dragging = false
			_press_global = mouse.global_position
			grab_offset = _press_global - global_position
			get_viewport().set_input_as_handled()
		elif _pointer_down:
			_finish_pointer(mouse.global_position)
			get_viewport().set_input_as_handled()


func _input(event: InputEvent) -> void:
	if not _pointer_down:
		return
	if event is InputEventMouseMotion:
		var motion := event as InputEventMouseMotion
		if not _drag_moved and motion.global_position.distance_to(_press_global) >= DRAG_THRESHOLD:
			_drag_moved = true
			dragging = true
			SoundManager.play_sfx("ui_pickup")
	elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and not event.pressed:
		_finish_pointer((event as InputEventMouseButton).global_position)


func _finish_pointer(global_pos: Vector2) -> void:
	var was_drag := dragging or _drag_moved
	_pointer_down = false
	_drag_moved = false
	dragging = false
	var ws = _find_workspace()
	if ws == null:
		return
	if was_drag:
		ws.on_token_released(self)
	elif global_pos.distance_to(_press_global) < DRAG_THRESHOLD:
		ws.on_token_clicked(self)


func set_highlight_visible(is_visible: bool, type: String = "valid") -> void:
	if not highlight:
		return
	if _highlight_tween and _highlight_tween.is_running():
		_highlight_tween.kill()
		highlight.modulate.a = 1.0
	highlight.visible = is_visible
	var style := highlight.get_theme_stylebox("panel") as StyleBoxFlat
	if not style:
		return
	match type:
		"valid":
			style.border_color = Color(CozyTheme.SAGE_VALID, 0.85)
		"combine", "hover":
			style.border_color = Color(CozyTheme.COMBINE_GOLD, 0.95)
		_:
			style.border_color = Color(CozyTheme.SCROLL_GOLD, 0.8)
	if is_visible and type == "valid" and not GameState.reduced_motion:
		_pulse_valid_highlight()


func _pulse_valid_highlight() -> void:
	if not highlight:
		return
	_highlight_tween = create_tween()
	_highlight_tween.set_loops()
	_highlight_tween.tween_property(highlight, "modulate:a", 0.55, 0.45).set_trans(Tween.TRANS_SINE)
	_highlight_tween.tween_property(highlight, "modulate:a", 1.0, 0.45).set_trans(Tween.TRANS_SINE)


func _on_mouse_entered() -> void:
	if dragging:
		return
	HoverPanel.show_for_item(item_id, get_viewport().get_mouse_position())


func _on_mouse_exited() -> void:
	HoverPanel.hide_panel()
