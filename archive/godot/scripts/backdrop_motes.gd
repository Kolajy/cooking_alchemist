extends Control

const MOTE_COUNT := 18

var _motes: Array = []


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_anchors_preset(Control.PRESET_FULL_RECT)
	if GameState == null or GameState.reduced_motion:
		visible = false
		return
	_seed_motes()


func _seed_motes() -> void:
	_motes.clear()
	for i in range(MOTE_COUNT):
		_motes.append({
			"x": randf(),
			"y": randf(),
			"size": randf_range(2.0, 5.0),
			"speed": randf_range(0.015, 0.045),
			"phase": randf_range(0.0, TAU),
			"alpha": randf_range(0.08, 0.22)
		})


func _process(delta: float) -> void:
	if not is_inside_tree() or GameState == null:
		return
	if GameState.reduced_motion:
		visible = false
		return
	visible = true
	for mote in _motes:
		mote.y -= mote.speed * delta
		mote.x += sin(mote.phase + Time.get_ticks_msec() * 0.0004) * 0.00008
		if mote.y < -0.05:
			mote.y = 1.05
			mote.x = randf()
	queue_redraw()


func _draw() -> void:
	for mote in _motes:
		var pos := Vector2(mote.x * size.x, mote.y * size.y)
		var color := Color(0.922, 0.576, 0.353, mote.alpha)
		draw_circle(pos, mote.size, color)
