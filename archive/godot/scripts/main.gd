extends Node

const SIDEBAR_WIDTH := 340.0
const SHELL_MARGIN_LEFT := 16.0
const SHELL_MARGIN_TOP := 12.0
const SHELL_MARGIN_RIGHT := 16.0
const SHELL_MARGIN_BOTTOM := 16.0


func get_shell_content_rect() -> Rect2:
	var vp := get_viewport()
	var size := vp.get_visible_rect().size if vp else Vector2(1280.0, 720.0)
	return Rect2(
		SHELL_MARGIN_LEFT,
		SHELL_MARGIN_TOP,
		size.x - SHELL_MARGIN_LEFT - SHELL_MARGIN_RIGHT,
		size.y - SHELL_MARGIN_TOP - SHELL_MARGIN_BOTTOM
	)


func _ready() -> void:
	print("--- Culinary Alchemy: Launching Native Client ---")
	if Database.discoverable_items.is_empty():
		print("❌ Database verification failed.")
		return

	print("✅ Database loaded: %d discoverables, %d starters" % [
		Database.discoverable_items.size(),
		Database.starters.size()
	])

	_build_backdrop()
	_build_scroll_frame()

	var ws_scene = preload("res://scenes/workspace.tscn")
	if ws_scene:
		add_child(ws_scene.instantiate())

	var ui_layer := CanvasLayer.new()
	ui_layer.layer = 10
	add_child(ui_layer)

	var ui_scene = preload("res://scenes/pantry_ui.tscn")
	if ui_scene:
		ui_layer.add_child(ui_scene.instantiate())

	var modal_layer := CanvasLayer.new()
	modal_layer.layer = 50
	add_child(modal_layer)

	var popup_scene = preload("res://scenes/discovery_popup.tscn")
	if popup_scene:
		modal_layer.add_child(popup_scene.instantiate())

	var book_scene = preload("res://scenes/ledger_book.tscn")
	if book_scene:
		modal_layer.add_child(book_scene.instantiate())

	var map_scene = preload("res://scenes/progress_map.tscn")
	if map_scene:
		modal_layer.add_child(map_scene.instantiate())

	var settings_scene = preload("res://scenes/settings_dialog.tscn")
	if settings_scene:
		modal_layer.add_child(settings_scene.instantiate())

	var help_scene = preload("res://scenes/help_dialog.tscn")
	if help_scene:
		modal_layer.add_child(help_scene.instantiate())

	apply_cozy_theme(self)
	CozyTheme.apply_fonts(self)
	var ws = find_child("Workspace", true, false)
	if ws and ws.has_method("_style_workspace"):
		ws._style_workspace()
	if ws and ws.has_method("refresh_token_styles"):
		ws.refresh_token_styles()
	print("🎨 Cozy parchment theme applied.")
	call_deferred("_maybe_show_first_run_help")


func _maybe_show_first_run_help() -> void:
	if GameState.seen_help:
		return
	var help = find_child("HelpDialog", true, false)
	if help == null:
		for child in get_children():
			if child.has_method("show_dialog") and child.name.to_lower().contains("help"):
				help = child
				break
	if help and help.has_method("show_dialog"):
		help.show_dialog()


func _build_backdrop() -> void:
	var layer = CanvasLayer.new()
	layer.layer = -20
	add_child(layer)

	var root = Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	layer.add_child(root)

	var base = ColorRect.new()
	base.set_anchors_preset(Control.PRESET_FULL_RECT)
	base.color = CozyTheme.PARCHMENT_BASE
	root.add_child(base)

	var parchment_shader: Shader = load("res://shaders/parchment_backdrop.gdshader")
	if parchment_shader:
		var mat := ShaderMaterial.new()
		mat.shader = parchment_shader
		var parchment = ColorRect.new()
		parchment.set_anchors_preset(Control.PRESET_FULL_RECT)
		parchment.material = mat
		parchment.mouse_filter = Control.MOUSE_FILTER_IGNORE
		root.add_child(parchment)

	var vignette = ColorRect.new()
	vignette.set_anchors_preset(Control.PRESET_FULL_RECT)
	vignette.color = Color(0.149, 0.078, 0.024, 0.12)
	vignette.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(vignette)

	var motes_script = load("res://scripts/backdrop_motes.gd")
	var motes = Control.new()
	motes.set_script(motes_script)
	motes.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.add_child(motes)


func _build_scroll_frame() -> void:
	var layer = CanvasLayer.new()
	layer.layer = -10
	add_child(layer)

	var margin = MarginContainer.new()
	margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", int(SHELL_MARGIN_LEFT))
	margin.add_theme_constant_override("margin_top", int(SHELL_MARGIN_TOP))
	margin.add_theme_constant_override("margin_right", int(SHELL_MARGIN_RIGHT))
	margin.add_theme_constant_override("margin_bottom", int(SHELL_MARGIN_BOTTOM))
	layer.add_child(margin)

	var panel = Panel.new()
	panel.name = "ScrollFrame"
	panel.set_anchors_preset(Control.PRESET_FULL_RECT)
	panel.add_theme_stylebox_override("panel", CozyTheme.make_scroll_frame())
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	margin.add_child(panel)


const MODAL_ROOTS := ["DiscoveryPopup", "HelpDialog", "SettingsDialog", "LedgerBook", "ProgressMap"]


func apply_cozy_theme(node: Node) -> void:
	_apply_styles_recursive(node, false)


func _apply_styles_recursive(node: Node, in_modal: bool) -> void:
	if node.name in MODAL_ROOTS:
		in_modal = true

	if not in_modal:
		if node is Panel and _should_theme_panel(node):
			if node.name == "Background" and node.get_parent() and node.get_parent().name == "PantryUI":
				node.add_theme_stylebox_override("panel", CozyTheme.make_sidebar_panel())
			elif node.name == "GuideNote":
				node.add_theme_stylebox_override("panel", CozyTheme.make_guide_note())
			elif node.name == "ActionBar":
				node.add_theme_stylebox_override("panel", CozyTheme.make_technique_strip())
			else:
				node.add_theme_stylebox_override("panel", CozyTheme.make_flat_panel(CozyTheme.PARCHMENT_SHEET))

		if node is Button:
			var slot_parent := node.get_parent()
			if (slot_parent and slot_parent.is_in_group("pantry_slot")) or node.is_in_group("pantry_tab") or node.is_in_group("toolbar_btn"):
				pass
			else:
				CozyTheme.apply_button(node)

		if node is Label and not "Discovered" in node.text:
			node.add_theme_color_override("font_color", CozyTheme.SCROLL_INK)
	elif node is Button:
		CozyTheme.apply_button(node)

	for child in node.get_children():
		_apply_styles_recursive(child, in_modal)
	CozyTheme.apply_fonts(node)


func _should_theme_panel(node: Panel) -> bool:
	if node.name in ["Highlight", "Backdrop", "WorkspaceSurface", "ScrollFrame"]:
		return false
	var parent = node.get_parent()
	if parent and parent.is_in_group("pantry_slot"):
		return false
	if parent and parent.name == "IngredientToken" and node.name in ["Background", "Dot"]:
		return false
	return true
