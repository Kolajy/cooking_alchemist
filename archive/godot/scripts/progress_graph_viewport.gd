extends Control

var _canvas: Control
var _zoom := 1.0
var _pan := Vector2.ZERO
var _panning := false
var _pan_start := Vector2.ZERO
var _pan_origin := Vector2.ZERO

const MIN_ZOOM := 0.35
const MAX_ZOOM := 2.5


func mount_canvas(canvas: Control) -> void:
	for child in get_children():
		child.queue_free()
	_canvas = canvas
	_canvas.top_level = false
	add_child(_canvas)
	clip_contents = true
	mouse_filter = Control.MOUSE_FILTER_STOP
	call_deferred("fit_view")


func fit_view() -> void:
	if _canvas == null:
		return
	var content_size: Vector2 = _canvas.custom_minimum_size
	if content_size.x <= 0.0 or content_size.y <= 0.0:
		content_size = _canvas.size
	if content_size.x <= 0.0:
		content_size = Vector2(720, 480)
	_zoom = clamp(min(size.x / content_size.x, size.y / content_size.y) * 0.92, MIN_ZOOM, MAX_ZOOM)
	_pan = (size - content_size * _zoom) * 0.5
	_apply_view()


func reset_view() -> void:
	fit_view()


func zoom_in() -> void:
	_zoom_at(size * 0.5, 1.15)


func zoom_out() -> void:
	_zoom_at(size * 0.5, 1.0 / 1.15)


func center_on_graph_point(point: Vector2) -> void:
	if _canvas == null:
		return
	_pan = size * 0.5 - point * _zoom
	_apply_view()


func get_canvas() -> Control:
	return _canvas


func _notification(what: int) -> void:
	if what == NOTIFICATION_RESIZED and _canvas != null and size.x > 10.0 and size.y > 10.0:
		call_deferred("fit_view")


func _gui_input(event: InputEvent) -> void:
	if _canvas == null:
		return

	if event is InputEventMouseButton:
		var mouse := event as InputEventMouseButton
		var pan_button := (
			mouse.button_index == MOUSE_BUTTON_MIDDLE
			or mouse.button_index == MOUSE_BUTTON_RIGHT
			or (mouse.button_index == MOUSE_BUTTON_LEFT and mouse.shift_pressed)
		)
		if mouse.pressed and pan_button:
			_panning = true
			_pan_start = mouse.position
			_pan_origin = _pan
			accept_event()
			return
		if not mouse.pressed and _panning:
			_panning = false
		if mouse.pressed:
			if mouse.button_index == MOUSE_BUTTON_WHEEL_UP:
				_zoom_at(mouse.position, 1.12)
				accept_event()
			elif mouse.button_index == MOUSE_BUTTON_WHEEL_DOWN:
				_zoom_at(mouse.position, 1.0 / 1.12)
				accept_event()

	if event is InputEventMouseMotion and _panning:
		var motion := event as InputEventMouseMotion
		_pan = _pan_origin + (motion.position - _pan_start)
		_apply_view()
		accept_event()


func _zoom_at(focal_point: Vector2, factor: float) -> void:
	var old_zoom := _zoom
	_zoom = clamp(_zoom * factor, MIN_ZOOM, MAX_ZOOM)
	if is_equal_approx(old_zoom, _zoom):
		return
	var graph_point := (focal_point - _pan) / old_zoom
	_pan = focal_point - graph_point * _zoom
	_apply_view()


func _apply_view() -> void:
	if _canvas == null:
		return
	_canvas.scale = Vector2.ONE * _zoom
	_canvas.position = _pan
