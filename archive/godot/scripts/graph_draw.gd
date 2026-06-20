extends RefCounted
class_name GraphDraw


static func cubic_point(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, t: float) -> Vector2:
	var u := 1.0 - t
	return (
		u * u * u * p0
		+ 3.0 * u * u * t * p1
		+ 3.0 * u * t * t * p2
		+ t * t * t * p3
	)


static func bezier_controls(from: Vector2, to: Vector2) -> Array:
	var mid_y := (from.y + to.y) * 0.5
	return [from, Vector2(from.x, mid_y), Vector2(to.x, mid_y), to]


static func draw_bezier(canvas: Control, from: Vector2, to: Vector2, color: Color, width: float, segments: int = 24) -> void:
	var controls := bezier_controls(from, to)
	for i in range(segments):
		var t0 := float(i) / float(segments)
		var t1 := float(i + 1) / float(segments)
		canvas.draw_line(
			cubic_point(controls[0], controls[1], controls[2], controls[3], t0),
			cubic_point(controls[0], controls[1], controls[2], controls[3], t1),
			color,
			width,
			true
		)


static func bezier_midpoint(from: Vector2, to: Vector2) -> Vector2:
	var controls := bezier_controls(from, to)
	return cubic_point(controls[0], controls[1], controls[2], controls[3], 0.5)


static func draw_arrow_on_bezier(canvas: Control, from: Vector2, to: Vector2, color: Color) -> void:
	var controls := bezier_controls(from, to)
	var tip := cubic_point(controls[0], controls[1], controls[2], controls[3], 0.92)
	var prev := cubic_point(controls[0], controls[1], controls[2], controls[3], 0.86)
	var dir := (tip - prev).normalized()
	if dir.length_squared() < 0.001:
		return
	var left := tip - dir.rotated(PI * 0.75) * 8.0
	var right := tip - dir.rotated(-PI * 0.75) * 8.0
	canvas.draw_line(tip, left, color, 2.0, true)
	canvas.draw_line(tip, right, color, 2.0, true)


static func draw_transition_marker(canvas: Control, center: Vector2, symbol: String, color: Color, unlocked: bool) -> void:
	var alpha := 0.95 if unlocked else 0.45
	canvas.draw_circle(center, 11.0, Color(color, alpha * 0.22))
	canvas.draw_arc(center, 11.0, 0.0, TAU, 24, Color(color, alpha), 1.5, true)
	canvas.draw_string(
		CozyTheme.get_body_font(),
		center - Vector2(6, -4),
		symbol,
		HORIZONTAL_ALIGNMENT_LEFT,
		-1,
		12,
		Color(color, alpha)
	)
