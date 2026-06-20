extends Node2D

var _size := Vector2(920.0, 526.0)


func set_surface_rect(origin: Vector2, size: Vector2) -> void:
	position = origin
	_size = size
	queue_redraw()


func _draw() -> void:
	if _size.x <= 1.0 or _size.y <= 1.0:
		return

	var rect := Rect2(Vector2.ZERO, _size)
	var base := CozyTheme.make_workspace_panel()
	draw_style_box(base, rect)

	var steps := 24
	for i in range(steps):
		var t := float(i) / float(steps)
		var y0 := _size.y * t
		var y1 := _size.y * float(i + 1) / float(steps)
		var color := CozyTheme.WORKSPACE_TOP.lerp(CozyTheme.WORKSPACE_BOTTOM, t)
		color.a = 0.72
		draw_rect(Rect2(4.0, y0 + 4.0, _size.x - 8.0, y1 - y0 + 1.0), color)

	var center := _size * 0.5
	var radius: float = min(_size.x, _size.y) * 0.36
	draw_circle(center, radius, Color(1.0, 0.98, 0.94, 0.18))
	draw_circle(center, radius * 0.58, Color(0.922, 0.576, 0.353, 0.07))
	draw_circle(Vector2(_size.x * 0.18, _size.y * 0.78), radius * 0.26, Color(0.831, 0.659, 0.290, 0.06))
	draw_circle(Vector2(_size.x * 0.82, _size.y * 0.22), radius * 0.22, Color(0.545, 0.620, 0.502, 0.05))

	draw_rect(
		Rect2(4.0, 4.0, _size.x - 8.0, _size.y - 8.0),
		Color(0.902, 0.863, 0.804, 0.12),
		false,
		1.0
	)
