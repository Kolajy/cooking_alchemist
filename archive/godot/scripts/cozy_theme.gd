extends Node

# Shared cozy parchment theme — mirrors web/src/styles/tokens.css
static var PARCHMENT_BASE := Color(0.961, 0.902, 0.784)       # #F5E6C8
static var PARCHMENT_SHEET := Color(0.941, 0.918, 0.878)      # warm sheet
static var PARCHMENT_DEEP := Color(0.878, 0.831, 0.749)
static var SCROLL_INK := Color(0.251, 0.200, 0.180)
static var SCROLL_INK_MUTED := Color(0.420, 0.360, 0.320)
static var SCROLL_GOLD := Color(0.780, 0.600, 0.322)
static var SCROLL_EMBER := Color(0.922, 0.576, 0.353)
static var SCROLL_COPPER := Color(0.620, 0.470, 0.360)
static var SAGE_VALID := Color(0.294, 0.439, 0.333)
static var COMBINE_GOLD := Color(0.753, 0.541, 0.243)
static var WORKSPACE_TOP := Color(0.941, 0.902, 0.867)
static var WORKSPACE_BOTTOM := Color(0.878, 0.831, 0.749)
static var GUIDE_NOTE := Color(0.992, 0.976, 0.878)
static var GUIDE_BORDER := Color(0.902, 0.820, 0.541)
static var SCORCH := Color(0.149, 0.078, 0.024, 0.35)
static var BACKDROP_VIGNETTE := Color(0.118, 0.071, 0.024, 0.55)
static var BTN_ACTIVE := Color(0.478, 0.302, 0.231)
static var BTN_ACTIVE_BORDER := Color(0.349, 0.220, 0.169)

static var _display_font: Font
static var _body_font: Font
static var _charm_font: Font


static func _load_font_file(path: String) -> Font:
	if not ResourceLoader.exists(path):
		return null
	var file := FontFile.new()
	file.load_dynamic_font(path)
	return file


static func get_display_font() -> Font:
	if _display_font == null:
		_display_font = _load_font_file("res://assets/fonts/Cinzel-SemiBold.woff2")
		if _display_font == null:
			_display_font = _load_font_file("res://assets/fonts/Cinzel-SemiBold.ttf")
		if _display_font == null:
			var font := SystemFont.new()
			font.font_names = PackedStringArray(["Cinzel", "Palatino", "Georgia", "serif"])
			font.font_weight = 600
			_display_font = font
	return _display_font


static func get_body_font() -> Font:
	if _body_font == null:
		_body_font = _load_font_file("res://assets/fonts/PlusJakartaSans-Regular.woff2")
		if _body_font == null:
			_body_font = _load_font_file("res://assets/fonts/PlusJakartaSans-Regular.ttf")
		if _body_font == null:
			var font := SystemFont.new()
			font.font_names = PackedStringArray(["Plus Jakarta Sans", "Segoe UI", "Helvetica Neue", "sans-serif"])
			_body_font = font
	return _body_font


static func get_charm_font() -> Font:
	if _charm_font == null:
		_charm_font = _load_font_file("res://assets/fonts/Caveat-SemiBold.woff2")
		if _charm_font == null:
			_charm_font = _load_font_file("res://assets/fonts/Caveat-SemiBold.ttf")
		if _charm_font == null:
			var font := SystemFont.new()
			font.font_names = PackedStringArray(["Caveat", "Bradley Hand", "Snell Roundhand", "Marker Felt", "cursive"])
			font.font_weight = 600
			_charm_font = font
	return _charm_font


static func apply_fonts(node: Node) -> void:
	if node is Label:
		var label := node as Label
		if "Guide" in label.text or "Ledger Guide" in label.text:
			label.add_theme_font_override("font", get_charm_font())
		elif label.name in ["Header", "Title"] or "PANTRY" in label.text or "Progress Map" in label.text:
			label.add_theme_font_override("font", get_display_font())
		else:
			label.add_theme_font_override("font", get_body_font())
	if node is Button:
		node.add_theme_font_override("font", get_body_font())
	if node is LineEdit:
		node.add_theme_font_override("font", get_body_font())
	for child in node.get_children():
		apply_fonts(child)


static func make_flat_panel(bg: Color, border: Color = SCROLL_COPPER, radius: int = 12, border_w: int = 2) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.border_color = border
	sb.border_width_left = border_w
	sb.border_width_top = border_w
	sb.border_width_right = border_w
	sb.border_width_bottom = border_w
	sb.set_corner_radius_all(radius)
	sb.shadow_color = Color(0, 0, 0, 0.18)
	sb.shadow_size = 8
	sb.shadow_offset = Vector2(0, 4)
	return sb


static func make_parchment_panel() -> StyleBoxFlat:
	var sb := make_flat_panel(PARCHMENT_SHEET, Color(0.780, 0.690, 0.560, 0.55), 14, 1)
	sb.shadow_color = Color(0.090, 0.060, 0.040, 0.35)
	sb.shadow_size = 24
	sb.shadow_offset = Vector2(0, 10)
	return sb


static func make_button_normal() -> StyleBoxFlat:
	var sb := make_flat_panel(Color(0.957, 0.929, 0.878), Color(0.659, 0.580, 0.490, 0.55), 10, 1)
	sb.shadow_size = 3
	sb.shadow_color = Color(0.090, 0.060, 0.040, 0.10)
	return sb


static func make_button_hover() -> StyleBoxFlat:
	var sb := make_flat_panel(Color(0.984, 0.965, 0.929), Color(0.620, 0.470, 0.360, 0.75), 10, 1)
	sb.shadow_size = 5
	sb.shadow_color = Color(0.090, 0.060, 0.040, 0.12)
	return sb


static func make_button_pressed() -> StyleBoxFlat:
	return make_flat_panel(BTN_ACTIVE, BTN_ACTIVE_BORDER, 8, 1)


static func make_button_focus() -> StyleBoxFlat:
	var sb := make_flat_panel(Color(0, 0, 0, 0), SCROLL_GOLD, 8, 2)
	return sb


static func make_guide_note() -> StyleBoxFlat:
	var sb := make_flat_panel(GUIDE_NOTE, GUIDE_BORDER, 10, 2)
	sb.shadow_color = Color(0.180, 0.120, 0.060, 0.12)
	sb.shadow_size = 6
	return sb


static func make_sidebar_panel() -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.941, 0.902, 0.867, 0.72)
	sb.border_width_left = 1
	sb.border_color = Color(0.620, 0.560, 0.470, 0.35)
	sb.shadow_color = Color(0.090, 0.060, 0.040, 0.08)
	sb.shadow_size = 12
	sb.shadow_offset = Vector2(-4, 0)
	return sb


static func make_workspace_panel() -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.878, 0.824, 0.749)
	sb.set_corner_radius_all(8)
	sb.border_width_top = 2
	sb.border_color = Color(0.992, 0.976, 0.929, 0.55)
	sb.shadow_color = Color(0.090, 0.060, 0.040, 0.12)
	sb.shadow_size = 10
	sb.shadow_offset = Vector2(0, 3)
	return sb


static func make_scroll_frame() -> StyleBoxFlat:
	var sb := make_parchment_panel()
	sb.bg_color = Color(0.961, 0.902, 0.784, 0.98)
	sb.border_color = Color(0.620, 0.470, 0.360, 0.40)
	sb.border_width_left = 1
	sb.border_width_top = 1
	sb.border_width_right = 1
	sb.border_width_bottom = 1
	sb.set_corner_radius_all(16)
	sb.shadow_color = Color(0.090, 0.060, 0.040, 0.42)
	sb.shadow_size = 28
	sb.shadow_offset = Vector2(0, 14)
	return sb


static func make_discovery_card() -> StyleBoxFlat:
	return make_discovery_modal_card()


static func make_modal_backdrop() -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.118, 0.071, 0.024, 0.55)
	return sb


static func make_discovery_modal_card() -> StyleBoxFlat:
	var sb := make_flat_panel(Color(0.969, 0.937, 0.871, 0.98), Color(0.780, 0.600, 0.322, 0.85), 14, 2)
	sb.shadow_color = Color(0.090, 0.060, 0.040, 0.35)
	sb.shadow_size = 28
	sb.shadow_offset = Vector2(0, 12)
	return sb


static func make_discovery_item_box() -> StyleBoxFlat:
	var sb := make_flat_panel(Color(0.992, 0.984, 0.961, 0.98), Color(0.780, 0.600, 0.322, 0.75), 12, 2)
	sb.content_margin_left = 16
	sb.content_margin_right = 16
	sb.content_margin_top = 10
	sb.content_margin_bottom = 10
	sb.shadow_size = 6
	sb.shadow_color = Color(0.780, 0.600, 0.322, 0.12)
	return sb


static func make_discovery_exp_panel() -> StyleBoxFlat:
	var sb := make_flat_panel(Color(0.984, 0.965, 0.929, 0.95), Color(0.780, 0.600, 0.322, 0.35), 10, 1)
	sb.content_margin_left = 10
	sb.content_margin_right = 10
	sb.content_margin_top = 8
	sb.content_margin_bottom = 8
	return sb


static func make_discovery_tip_block() -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.961, 0.929, 0.878, 0.75)
	sb.border_width_left = 4
	sb.border_color = Color(0.753, 0.541, 0.243, 0.85)
	sb.corner_radius_top_right = 10
	sb.corner_radius_bottom_right = 10
	sb.content_margin_left = 12
	sb.content_margin_right = 10
	sb.content_margin_top = 8
	sb.content_margin_bottom = 8
	return sb


static func make_exp_gain_pill() -> StyleBoxFlat:
	var sb := make_flat_panel(Color(0.780, 0.600, 0.322, 0.14), Color(0.780, 0.600, 0.322, 0.35), 999, 1)
	sb.content_margin_left = 8
	sb.content_margin_right = 8
	sb.content_margin_top = 2
	sb.content_margin_bottom = 2
	return sb


static func make_primary_cta_button() -> StyleBoxFlat:
	var sb := make_flat_panel(Color(0.671, 0.439, 0.282), Color(0.561, 0.325, 0.192), 10, 1)
	sb.content_margin_top = 10
	sb.content_margin_bottom = 10
	sb.shadow_size = 8
	sb.shadow_color = Color(0.090, 0.060, 0.040, 0.22)
	return sb


static func apply_primary_cta(node: Button) -> void:
	var normal := make_primary_cta_button()
	var hover := make_flat_panel(Color(0.733, 0.478, 0.314), Color(0.561, 0.325, 0.192), 10, 1)
	hover.content_margin_top = 10
	hover.content_margin_bottom = 10
	node.add_theme_stylebox_override("normal", normal)
	node.add_theme_stylebox_override("hover", hover)
	node.add_theme_stylebox_override("pressed", normal)
	node.add_theme_stylebox_override("focus", make_button_focus())
	node.add_theme_color_override("font_color", Color(0.992, 0.969, 0.925))
	node.add_theme_color_override("font_hover_color", Color(1, 1, 1))
	node.add_theme_color_override("font_pressed_color", Color(0.992, 0.969, 0.925))


static func apply_map_cta(node: Button) -> void:
	var normal := make_flat_panel(Color(0.420, 0.561, 0.416), Color(0.294, 0.439, 0.333), 999, 1)
	normal.content_margin_left = 14
	normal.content_margin_right = 14
	normal.content_margin_top = 6
	normal.content_margin_bottom = 6
	var hover := make_flat_panel(Color(0.478, 0.620, 0.478), Color(0.294, 0.439, 0.333), 999, 1)
	hover.content_margin_left = 14
	hover.content_margin_right = 14
	hover.content_margin_top = 6
	hover.content_margin_bottom = 6
	node.add_theme_stylebox_override("normal", normal)
	node.add_theme_stylebox_override("hover", hover)
	node.add_theme_stylebox_override("pressed", normal)
	node.add_theme_color_override("font_color", Color(0.992, 0.976, 0.929))
	node.add_theme_color_override("font_hover_color", Color(1, 1, 1))


static func apply_icon_circle_button(node: Button) -> void:
	var normal := make_flat_panel(Color(0.969, 0.937, 0.871, 0.92), Color(0.620, 0.470, 0.360, 0.40), 999, 1)
	normal.content_margin_left = 8
	normal.content_margin_right = 8
	normal.content_margin_top = 4
	normal.content_margin_bottom = 4
	node.add_theme_stylebox_override("normal", normal)
	node.add_theme_stylebox_override("hover", make_button_hover())
	node.add_theme_stylebox_override("pressed", make_button_pressed())
	node.add_theme_color_override("font_color", SCROLL_INK)
	node.add_theme_color_override("font_hover_color", SCROLL_INK)


static func make_search_field() -> StyleBoxFlat:
	return make_flat_panel(Color(0.984, 0.969, 0.929, 0.95), Color(0.620, 0.470, 0.360, 0.35), 8, 1)


static func make_filter_chip() -> StyleBoxFlat:
	return make_flat_panel(Color(0.957, 0.929, 0.878, 0.85), Color(0.659, 0.580, 0.490, 0.45), 999, 1)


static func make_technique_strip() -> StyleBoxFlat:
	var sb := make_flat_panel(Color(0.941, 0.902, 0.867, 0.98), Color(0.620, 0.470, 0.360, 0.35), 12, 1)
	sb.corner_radius_top_left = 10
	sb.corner_radius_top_right = 10
	sb.corner_radius_bottom_left = 12
	sb.corner_radius_bottom_right = 16
	sb.shadow_size = 14
	sb.shadow_offset = Vector2(0, 6)
	sb.shadow_color = Color(0.090, 0.060, 0.040, 0.14)
	return sb


static func make_locked_toolbar_button() -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.941, 0.922, 0.886, 0.88)
	sb.border_color = Color(0.620, 0.580, 0.520, 0.42)
	sb.border_width_left = 1
	sb.border_width_top = 1
	sb.border_width_right = 1
	sb.border_width_bottom = 1
	sb.set_corner_radius_all(10)
	sb.shadow_size = 0
	sb.draw_center = true
	return sb


static func apply_toolbar_method_button(node: Button) -> void:
	node.custom_minimum_size = Vector2(0, 51)
	node.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	node.size_flags_stretch_ratio = 1.0
	node.add_theme_font_override("font", get_body_font())
	node.add_theme_font_size_override("font_size", 10)
	node.add_theme_constant_override("line_spacing", 1)
	node.alignment = HORIZONTAL_ALIGNMENT_CENTER


static func apply_toolbar_button(node: Button, selected: bool, locked: bool) -> void:
	apply_toolbar_method_button(node)
	if locked:
		node.add_theme_stylebox_override("normal", make_locked_toolbar_button())
		node.add_theme_stylebox_override("hover", make_locked_toolbar_button())
		node.add_theme_stylebox_override("pressed", make_locked_toolbar_button())
		node.add_theme_stylebox_override("focus", make_button_focus())
		node.add_theme_color_override("font_color", Color(SCROLL_INK_MUTED.r, SCROLL_INK_MUTED.g, SCROLL_INK_MUTED.b, 0.92))
		node.add_theme_color_override("font_hover_color", SCROLL_INK_MUTED)
		node.modulate = Color.WHITE
	elif selected:
		apply_button(node, true)
		node.modulate = Color.WHITE
	else:
		apply_button(node, false)
		node.modulate = Color.WHITE


static func apply_standard_modal(card: Panel, backdrop: Panel = null, primary_button: Button = null) -> void:
	if backdrop:
		backdrop.add_theme_stylebox_override("panel", make_modal_backdrop())
	if card:
		card.add_theme_stylebox_override("panel", make_discovery_modal_card())
	if primary_button:
		apply_primary_cta(primary_button)


static func make_modal_card() -> StyleBoxFlat:
	return make_parchment_panel()


static func make_token_panel(origin: String = "raw") -> StyleBoxFlat:
	var tint := Color(0.992, 0.984, 0.961, 0.96)
	match origin:
		"primitive", "primal":
			tint = Color(0.961, 0.949, 0.992, 0.96)
		"prepared", "processed":
			tint = Color(0.992, 0.976, 0.929, 0.96)
		"recipe":
			tint = Color(0.992, 0.941, 0.941, 0.96)
	return make_flat_panel(tint, Color(0.780, 0.690, 0.620, 0.85), 12, 2)


static func apply_button(node: Button, selected: bool = false) -> void:
	if selected:
		node.add_theme_stylebox_override("normal", make_button_pressed())
		node.add_theme_stylebox_override("hover", make_button_pressed())
		node.add_theme_color_override("font_color", Color(0.99, 0.98, 0.96))
		node.add_theme_color_override("font_hover_color", Color(0.99, 0.98, 0.96))
	else:
		node.add_theme_stylebox_override("normal", make_button_normal())
		node.add_theme_stylebox_override("hover", make_button_hover())
		node.remove_theme_stylebox_override("pressed")
		node.add_theme_color_override("font_color", SCROLL_INK)
		node.add_theme_color_override("font_hover_color", SCROLL_INK)
		node.add_theme_color_override("font_focus_color", SCROLL_INK)
	node.add_theme_stylebox_override("pressed", make_button_pressed())
	node.add_theme_stylebox_override("focus", make_button_focus())
	node.add_theme_color_override("font_pressed_color", Color(0.99, 0.98, 0.96))
	node.add_theme_color_override("font_disabled_color", Color(SCROLL_INK_MUTED.r, SCROLL_INK_MUTED.g, SCROLL_INK_MUTED.b, 0.55))
