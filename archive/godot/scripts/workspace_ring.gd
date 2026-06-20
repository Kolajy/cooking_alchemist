extends Node2D

var _size := Vector2(920.0, 526.0)
var _pulse := 0.0


func set_surface_rect(origin: Vector2, size: Vector2) -> void:
	position = origin
	_size = size
	queue_redraw()


func _process(delta: float) -> void:
	if not is_inside_tree() or GameState == null:
		return
	if GameState.reduced_motion:
		modulate.a = 0.65
		return
	_pulse += delta
	modulate.a = 0.55 + sin(_pulse * 0.75) * 0.12
	queue_redraw()


func _draw() -> void:
	if _size.x <= 1.0 or _size.y <= 1.0:
		return
	var center := _size * 0.5
	var radius: float = min(_size.x, _size.y) * 0.28
	var color := Color(0.502, 0.439, 0.345, 0.22)
	var segments := 48
	for i in range(0, segments, 2):
		var a1 := float(i) / float(segments) * TAU
		var a2 := float(i + 1) / float(segments) * TAU
		draw_line(
			center + Vector2(cos(a1), sin(a1)) * radius,
			center + Vector2(cos(a2), sin(a2)) * radius,
			color,
			2.0
		)
	draw_arc(center, radius + 8.0, 0.0, TAU, 64, Color(0.941, 0.902, 0.867, 0.12), 8.0, true)
	draw_arc(center, radius, 0.0, TAU, 64, Color(0.831, 0.659, 0.290, 0.06), 1.5, true)
