extends CanvasLayer

const MAX_TOASTS := 4
const TOAST_LIFETIME := 3.6

var _stack: VBoxContainer
var _toasts: Array = []


func _ready() -> void:
	layer = 90
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(root)

	_stack = VBoxContainer.new()
	_stack.set_anchors_preset(Control.PRESET_TOP_WIDE)
	_stack.offset_top = 72.0
	_stack.offset_left = 360.0
	_stack.offset_right = -24.0
	_stack.add_theme_constant_override("separation", 8)
	_stack.alignment = BoxContainer.ALIGNMENT_END
	root.add_child(_stack)


func show_achievement(def: Dictionary) -> void:
	_show_toast(
		"🏆 Achievement Unlocked",
		"%s %s" % [def.get("emoji", "🏆"), def.get("name", "Trophy")],
		def.get("description", ""),
		Color(0.831, 0.659, 0.290, 0.95)
	)


func show_level_up(emoji: String, name: String, level: int) -> void:
	_show_toast(
		"✨ Technique Level Up",
		"%s %s · Level %d" % [emoji, name, level],
		"Your kitchen craft grows sharper with every experiment.",
		Color(0.545, 0.671, 0.431, 0.95)
	)


func show_milestone_shipment(label: String, body: String) -> void:
	_show_toast(
		"📦 Ingredients Shipment!",
		label,
		body,
		Color(0.545, 0.671, 0.431, 0.95)
	)


func show_save_status(message: String, success: bool = true) -> void:
	_show_toast(
		"💾 Save",
		message,
		"",
		Color(0.545, 0.671, 0.431, 0.95) if success else Color(0.831, 0.459, 0.290, 0.95)
	)


func show_mechanic_unlock(emoji: String, name: String, desc: String) -> void:
	_show_toast(
		"🔓 New Technique Unlocked",
		"%s %s" % [emoji, name],
		desc,
		Color(0.831, 0.659, 0.290, 0.95)
	)


func _show_toast(header: String, title: String, body: String, accent: Color) -> void:
	while _toasts.size() >= MAX_TOASTS:
		_dismiss_toast(_toasts[0])

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(320, 0)
	panel.modulate.a = 1.0 if GameState.reduced_motion else 0.0
	panel.add_theme_stylebox_override("panel", CozyTheme.make_flat_panel(Color(0.961, 0.945, 0.914, 0.96), accent, 10, 2))

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	panel.add_child(vbox)

	var header_label := Label.new()
	header_label.text = header
	header_label.add_theme_color_override("font_color", accent)
	header_label.add_theme_font_size_override("font_size", 12)
	vbox.add_child(header_label)

	var title_label := Label.new()
	title_label.text = title
	title_label.add_theme_font_size_override("font_size", 16)
	vbox.add_child(title_label)

	if body != "":
		var body_label := Label.new()
		body_label.text = body
		body_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		body_label.add_theme_font_size_override("font_size", 12)
		body_label.add_theme_color_override("font_color", Color(CozyTheme.SCROLL_INK, 0.82))
		vbox.add_child(body_label)

	_stack.add_child(panel)
	_toasts.append(panel)

	if GameState.reduced_motion:
		var timer := get_tree().create_timer(TOAST_LIFETIME)
		timer.timeout.connect(_dismiss_toast.bind(panel))
		return

	var tween := create_tween()
	tween.tween_property(panel, "modulate:a", 1.0, 0.22)
	tween.tween_interval(TOAST_LIFETIME)
	tween.tween_property(panel, "modulate:a", 0.0, 0.35)
	tween.tween_callback(_dismiss_toast.bind(panel))


func _dismiss_toast(panel: Control) -> void:
	if panel == null or not is_instance_valid(panel):
		return
	_toasts.erase(panel)
	panel.queue_free()
