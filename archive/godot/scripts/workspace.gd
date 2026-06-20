extends Node2D

const WorkspaceHintsLib = preload("res://scripts/workspace_hints.gd")

@export var token_scene: PackedScene = preload("res://scenes/ingredient_token.tscn")
@export var particle_scene: PackedScene = preload("res://scenes/cooking_particles.tscn")

@onready var token_container = $TokenContainer
@onready var action_label = $UI/ActionBar/StripMargin/StripLayout/ActiveActionLabel
@onready var countertop = $WorkspaceSurface
@onready var workspace_ring = $WorkspaceRing

const SIDEBAR_WIDTH := 340.0
const WORKSPACE_PAD := 12.0
const HEADER_BAND := 58.0
const WORKSPACE_BOTTOM_PAD := 16.0

const ACTION_BAR_WIDTH := 520.0
const ACTION_BAR_HEIGHT := 94.0
const ACTION_BAR_BOTTOM_GAP := 16.0

const WORKSPACE_HINT_EMPTY := "Drag ingredients from the Pantry onto the counter to begin experimenting."

const ACTION_BUTTONS := {
	"separate": "BtnSeparate",
	"force": "BtnForce",
	"combine": "BtnCombine",
	"heat": "BtnHeat",
	"time": "BtnTime"
}

var undo_entry: Dictionary = {}
var _flash_overlay: ColorRect
var _shake_tween: Tween
var _hint_panel: PanelContainer
var _hint_label: Label
var _hint_tween: Tween
var _last_hint_text := ""
var _last_hint_at := 0.0
var _drop_target_active := false


func _ready() -> void:
	GameState.connect("discovery_changed", Callable(self, "_on_discovery_changed"))
	GameState.connect("action_changed", Callable(self, "_on_action_changed"))
	_connect_ui()
	_style_workspace()
	_setup_flash_overlay()
	_setup_hearth_warmth()
	_setup_hint_label()
	TechniqueTools.set_default_skill_for_action(GameState.active_action)
	update_action_ui()
	update_progress_ui()
	update_action_locks()
	update_guide_note()
	update_undo_button()
	update_workspace_hint()
	update_sub_technique_ui()
	update_map_button()
	spawn_starter_tokens()
	update_sound_button()
	get_viewport().size_changed.connect(_on_viewport_resized)
	call_deferred("_on_viewport_resized")


func _on_viewport_resized() -> void:
	var size := get_viewport_rect().size
	if size.x < 200.0:
		size = Vector2(1280.0, 720.0)
	_layout_workspace_chrome(size)


func _get_shell_content_rect() -> Rect2:
	var parent := get_parent()
	if parent and parent.has_method("get_shell_content_rect"):
		return parent.get_shell_content_rect()
	var size := get_viewport_rect().size
	return Rect2(0.0, 0.0, size.x, size.y)


func _layout_workspace_chrome(size: Vector2) -> void:
	var content := _get_shell_content_rect()
	var left := content.position.x + WORKSPACE_PAD
	var top := content.position.y + HEADER_BAND
	var right := content.position.x + content.size.x - SIDEBAR_WIDTH - WORKSPACE_PAD
	var bottom := content.position.y + content.size.y - WORKSPACE_BOTTOM_PAD
	var surface_size := Vector2(maxf(right - left, 1.0), maxf(bottom - top, 1.0))
	var surface_origin := Vector2(left, top)
	if countertop and countertop.has_method("set_surface_rect"):
		countertop.set_surface_rect(surface_origin, surface_size)
	if workspace_ring and workspace_ring.has_method("set_surface_rect"):
		workspace_ring.set_surface_rect(surface_origin, surface_size)
	if _flash_overlay:
		_flash_overlay.offset_left = left
		_flash_overlay.offset_top = top
		_flash_overlay.offset_right = right
		_flash_overlay.offset_bottom = bottom
	if has_node("UI/HeaderBar"):
		var header: Control = get_node("UI/HeaderBar")
		header.offset_left = content.position.x + 20.0
		header.offset_top = content.position.y + 12.0
		header.offset_right = right - 8.0
	if has_node("UI/HeaderFlourish"):
		var flourish: Control = get_node("UI/HeaderFlourish")
		flourish.offset_left = left
		flourish.offset_right = right - 8.0
		flourish.offset_top = content.position.y + 52.0
	if has_node("UI/WorkspaceTools"):
		var tools: Control = get_node("UI/WorkspaceTools")
		tools.offset_right = right - 16.0
		tools.offset_left = right - 120.0
		tools.offset_top = top + 8.0
	if has_node("UI/GuideNote"):
		var guide: Control = get_node("UI/GuideNote")
		guide.offset_left = left + 8.0
		guide.offset_top = top + 8.0
	if has_node("UI/ActionBar"):
		var bar: Control = get_node("UI/ActionBar")
		var bar_width := minf(ACTION_BAR_WIDTH, surface_size.x - 32.0)
		var half := bar_width * 0.5
		var center_shift := (left + right) * 0.5 - size.x * 0.5
		var bar_bottom_y := bottom - ACTION_BAR_BOTTOM_GAP
		bar.offset_left = -half + center_shift
		bar.offset_right = half + center_shift
		bar.offset_bottom = -(size.y - bar_bottom_y)
		bar.offset_top = bar.offset_bottom - ACTION_BAR_HEIGHT


func get_workspace_bounds() -> Rect2:
	var content := _get_shell_content_rect()
	var left: float = content.position.x + WORKSPACE_PAD + 44.0
	var top: float = content.position.y + HEADER_BAND + 44.0
	var right: float = content.position.x + content.size.x - SIDEBAR_WIDTH - WORKSPACE_PAD - 44.0
	var bottom: float = content.position.y + content.size.y - WORKSPACE_BOTTOM_PAD - 24.0
	return Rect2(left, top, maxf(right - left, 1.0), maxf(bottom - top, 1.0))


func _on_action_changed() -> void:
	update_sub_technique_ui()
	update_highlights()


func _toggle_progress_map() -> void:
	InputManager._toggle_progress_map()


func _toggle_settings() -> void:
	InputManager._toggle_settings()


func _toggle_help() -> void:
	InputManager._toggle_help()


func _toggle_sound() -> void:
	InputManager._toggle_sound()
	update_sound_button()


func update_sound_button() -> void:
	if not has_node("UI/HeaderBar/BtnSound"):
		return
	get_node("UI/HeaderBar/BtnSound").text = "🔊" if GameState.sound_enabled else "🔇"


func _cycle_skill(direction: int) -> void:
	if TechniqueTools.cycle_skill(direction):
		update_sub_technique_ui()
		update_highlights()
		SoundManager.play_sfx("ui_click")


func update_map_button() -> void:
	if not has_node("UI/HeaderBar/BtnMap"):
		return
	var btn = get_node("UI/HeaderBar/BtnMap")
	btn.text = "🍳 Kitchen" if GameState.active_main_view == "map" else "🌳 Progress Map"


func update_sub_technique_ui() -> void:
	if not has_node("UI/ActionBar/SubTechniqueRow/SubTechniqueLabel"):
		return
	var label = get_node("UI/ActionBar/SubTechniqueRow/SubTechniqueLabel")
	if GameState.active_action == "combine":
		label.text = "Drag one ingredient onto another"
		return
	var skill_label = TechniqueTools.get_active_skill_label()
	label.text = "Technique: %s  ·  [ ] to cycle" % skill_label if skill_label != "" else ""


func apply_active_technique_to_counter() -> bool:
	if GameState.active_action == "combine":
		return false
	for token in token_container.get_children():
		if can_apply_technique(token.item_id, GameState.active_action):
			apply_technique(token)
			return true
	return false


func spawn_token_at_center(id: String) -> void:
	var bounds := get_workspace_bounds()
	spawn_token(id, bounds.position + bounds.size * 0.5, true)


func _connect_ui() -> void:
	var bar = "UI/ActionBar/Buttons/"
	if has_node(bar + "BtnSeparate"):
		get_node(bar + "BtnSeparate").pressed.connect(set_active_action.bind("separate"))
	if has_node(bar + "BtnForce"):
		get_node(bar + "BtnForce").pressed.connect(set_active_action.bind("force"))
	if has_node(bar + "BtnCombine"):
		get_node(bar + "BtnCombine").pressed.connect(set_active_action.bind("combine"))
	if has_node(bar + "BtnHeat"):
		get_node(bar + "BtnHeat").pressed.connect(set_active_action.bind("heat"))
	if has_node(bar + "BtnTime"):
		get_node(bar + "BtnTime").pressed.connect(set_active_action.bind("time"))
	if has_node("UI/HeaderBar/BtnLedgerBook"):
		get_node("UI/HeaderBar/BtnLedgerBook").pressed.connect(_on_ledger_book_pressed)
	if has_node("UI/WorkspaceTools/BtnUndo"):
		get_node("UI/WorkspaceTools/BtnUndo").pressed.connect(apply_undo)
	if has_node("UI/WorkspaceTools/BtnClear"):
		get_node("UI/WorkspaceTools/BtnClear").pressed.connect(clear_workspace)
	if has_node("UI/HeaderBar/BtnMap"):
		get_node("UI/HeaderBar/BtnMap").pressed.connect(_toggle_progress_map)
	if has_node("UI/HeaderBar/BtnSettings"):
		get_node("UI/HeaderBar/BtnSettings").pressed.connect(_toggle_settings)
	if has_node("UI/HeaderBar/BtnHelp"):
		get_node("UI/HeaderBar/BtnHelp").pressed.connect(_toggle_help)
	if has_node("UI/HeaderBar/BtnSound"):
		get_node("UI/HeaderBar/BtnSound").pressed.connect(_toggle_sound)
	if has_node("UI/ActionBar/SubTechniqueRow/BtnPrevSkill"):
		get_node("UI/ActionBar/SubTechniqueRow/BtnPrevSkill").pressed.connect(_cycle_skill.bind(-1))
	if has_node("UI/ActionBar/SubTechniqueRow/BtnNextSkill"):
		get_node("UI/ActionBar/SubTechniqueRow/BtnNextSkill").pressed.connect(_cycle_skill.bind(1))

func _style_workspace() -> void:
	if countertop and countertop.has_method("set_surface_rect"):
		var size := get_viewport_rect().size
		if size.x < 200.0:
			size = Vector2(1280.0, 720.0)
		_layout_workspace_chrome(size)
	if has_node("UI/GuideNote"):
		get_node("UI/GuideNote").add_theme_stylebox_override("panel", CozyTheme.make_guide_note())
	if has_node("UI/GuideNote/GuideText"):
		var guide: Label = get_node("UI/GuideNote/GuideText")
		guide.add_theme_font_override("font", CozyTheme.get_charm_font())
		guide.add_theme_color_override("font_color", CozyTheme.SCROLL_INK)
	if has_node("UI/WorkspaceHint"):
		var hint: Label = get_node("UI/WorkspaceHint")
		hint.add_theme_font_override("font", CozyTheme.get_charm_font())
		hint.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
	if has_node("UI/ActionBar/StripMargin/StripLayout/ActiveActionLabel"):
		var sub: Label = get_node("UI/ActionBar/StripMargin/StripLayout/ActiveActionLabel")
		sub.add_theme_color_override("font_color", CozyTheme.SCROLL_EMBER)
	_style_header_branding()
	if has_node("UI/ActionBar"):
		get_node("UI/ActionBar").add_theme_stylebox_override("panel", CozyTheme.make_technique_strip())
	if workspace_ring:
		workspace_ring.queue_redraw()


func _style_header_branding() -> void:
	if has_node("UI/HeaderBar/LogoText/Title"):
		var title: Label = get_node("UI/HeaderBar/LogoText/Title")
		title.text = "CULINARY ALCHEMY"
		title.add_theme_font_override("font", CozyTheme.get_display_font())
		title.add_theme_font_size_override("font_size", 22)
		title.add_theme_color_override("font_color", Color(0.251, 0.2, 0.18))
	if has_node("UI/HeaderBar/LogoText/Tagline"):
		var tagline: Label = get_node("UI/HeaderBar/LogoText/Tagline")
		tagline.add_theme_font_override("font", CozyTheme.get_charm_font())
		tagline.add_theme_color_override("font_color", Color(0.722, 0.557, 0.357))
	if has_node("UI/HeaderBar/LedgerProgressLabel"):
		var pill: Label = get_node("UI/HeaderBar/LedgerProgressLabel")
		var sb := CozyTheme.make_flat_panel(Color(0.969, 0.937, 0.871, 0.95), Color(0.620, 0.470, 0.360, 0.45), 999, 1)
		sb.content_margin_left = 12
		sb.content_margin_right = 12
		sb.content_margin_top = 5
		sb.content_margin_bottom = 5
		sb.shadow_size = 4
		sb.shadow_color = Color(0.090, 0.060, 0.040, 0.10)
		pill.add_theme_stylebox_override("normal", sb)
		pill.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
	if has_node("UI/HeaderFlourish"):
		get_node("UI/HeaderFlourish").add_theme_color_override("font_color", Color(0.42, 0.36, 0.32, 0.4))
	if has_node("UI/HeaderBar/BtnLedgerBook"):
		_style_cta_button(get_node("UI/HeaderBar/BtnLedgerBook"))
	if has_node("UI/HeaderBar/BtnMap"):
		CozyTheme.apply_map_cta(get_node("UI/HeaderBar/BtnMap"))
	for icon_name in ["BtnSound", "BtnSettings", "BtnHelp"]:
		var path := "UI/HeaderBar/%s" % icon_name
		if has_node(path):
			CozyTheme.apply_icon_circle_button(get_node(path))
	if has_node("UI/WorkspaceTools/BtnUndo"):
		CozyTheme.apply_icon_circle_button(get_node("UI/WorkspaceTools/BtnUndo"))
	if has_node("UI/WorkspaceTools/BtnClear"):
		CozyTheme.apply_icon_circle_button(get_node("UI/WorkspaceTools/BtnClear"))


func _style_cta_button(b: Button) -> void:
	var normal := CozyTheme.make_flat_panel(Color(0.733, 0.451, 0.282), Color(0.561, 0.325, 0.192), 999, 1)
	normal.content_margin_left = 14
	normal.content_margin_right = 14
	normal.content_margin_top = 6
	normal.content_margin_bottom = 6
	var hover := CozyTheme.make_flat_panel(Color(0.792, 0.494, 0.314), Color(0.561, 0.325, 0.192), 999, 1)
	hover.content_margin_left = 14
	hover.content_margin_right = 14
	hover.content_margin_top = 6
	hover.content_margin_bottom = 6
	b.add_theme_stylebox_override("normal", normal)
	b.add_theme_stylebox_override("hover", hover)
	b.add_theme_stylebox_override("pressed", normal)
	b.add_theme_color_override("font_color", Color(0.992, 0.969, 0.925))
	b.add_theme_color_override("font_hover_color", Color(1, 1, 1))
	b.add_theme_color_override("font_pressed_color", Color(0.992, 0.969, 0.925))


func refresh_token_styles() -> void:
	for child in token_container.get_children():
		if child.has_method("refresh_style"):
			child.refresh_style()


func spawn_starter_tokens() -> void:
	var content := _get_shell_content_rect()
	var left := content.position.x + WORKSPACE_PAD
	var top := content.position.y + HEADER_BAND
	var right := content.position.x + content.size.x - SIDEBAR_WIDTH - WORKSPACE_PAD
	var bottom := content.position.y + content.size.y - WORKSPACE_BOTTOM_PAD
	var center_x: float = (left + right) * 0.5
	var center_y: float = top + (bottom - top) * 0.46
	var starter_ids: Array = []
	for starter in Database.starters:
		var id = starter.get("id", "")
		if id:
			starter_ids.append(id)
	var count = starter_ids.size()
	for i in range(count):
		var x = center_x + ((float(i) - float(count - 1) * 0.5) * 96.0)
		spawn_token(starter_ids[i], Vector2(x, center_y), false)


func spawn_token(id: String, pos: Vector2, push_undo: bool = true) -> void:
	if not GameState.is_pantry_available(id):
		return
	if not token_scene:
		return
	var token = token_scene.instantiate()
	token.global_position = pos
	token_container.add_child(token)
	token.setup(id)
	if token.has_method("play_spawn_animation"):
		token.play_spawn_animation()
	update_highlights()
	if push_undo:
		push_undo_spawn(id, pos)
		SoundManager.play_sfx("ui_place")


func _on_discovery_changed() -> void:
	update_highlights()
	update_progress_ui()
	update_action_locks()
	update_guide_note()
	update_workspace_hint()
	update_sound_button()


func update_workspace_hint() -> void:
	if not has_node("UI/WorkspaceHint"):
		return
	var hint = get_node("UI/WorkspaceHint")
	hint.visible = token_container.get_child_count() == 0
	hint.text = WORKSPACE_HINT_EMPTY
	_sync_workspace_hint_pulse(hint)


func _sync_workspace_hint_pulse(hint: Control) -> void:
	if _hint_tween and _hint_tween.is_running():
		_hint_tween.kill()
	if not hint.visible or GameState.reduced_motion:
		hint.modulate = Color(1, 1, 1, 0.88)
		hint.scale = Vector2.ONE
		return
	hint.modulate = Color(1, 1, 1, 0.78)
	hint.scale = Vector2.ONE
	_hint_tween = create_tween()
	_hint_tween.set_loops()
	_hint_tween.tween_property(hint, "modulate:a", 1.0, 3.5).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	_hint_tween.parallel().tween_property(hint, "scale", Vector2(1.008, 1.008), 3.5).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	_hint_tween.tween_property(hint, "modulate:a", 0.78, 3.5).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	_hint_tween.parallel().tween_property(hint, "scale", Vector2.ONE, 3.5).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)


func update_progress_ui() -> void:
	if has_node("UI/HeaderBar/LedgerProgressLabel"):
		get_node("UI/HeaderBar/LedgerProgressLabel").text = "📖 Ledger Restored: %d%%" % [
			GameState.get_restored_percentage()
		]


func _on_ledger_book_pressed() -> void:
	var root = get_tree().root.get_child(0)
	var book = root.find_child("LedgerBook", true, false)
	if book and book.has_method("show_book"):
		book.show_book()


func set_active_action(action: String) -> void:
	if TechniqueTools.is_method_locked(action):
		SoundManager.play_sfx("ui_locked")
		flash_toolbar_button("fail")
		return
	GameState.active_action = action
	TechniqueTools.set_default_skill_for_action(action)
	SoundManager.play_action_select_sound(action)
	GameState.emit_signal("action_changed")
	update_action_ui()
	update_sub_technique_ui()
	update_highlights()
	var had_tokens := token_container.get_child_count() > 0
	if had_tokens:
		var did_work := apply_active_technique_to_counter() if action != "combine" else false
		flash_workspace(did_work)
		flash_toolbar_button("success" if did_work else "fail")
		if not did_work:
			var hint: String = WorkspaceHintsLib.get_failure_hint(token_container.get_children())
			if hint.is_empty():
				hint = "That technique doesn't work here — try another method."
			show_workspace_hint(hint)
	else:
		flash_toolbar_button("press")


func update_action_ui() -> void:
	var active_method := TechniqueTools.get_active_method()
	if action_label:
		action_label.add_theme_font_override("font", CozyTheme.get_charm_font())
		action_label.add_theme_font_size_override("font_size", 19)
		action_label.add_theme_color_override("font_color", CozyTheme.SCROLL_EMBER)
		action_label.text = "Action Bar"
	var bar := "UI/ActionBar/Buttons/"
	for action in ACTION_BUTTONS.keys():
		var btn_name: String = ACTION_BUTTONS[action]
		if not has_node(bar + btn_name):
			continue
		var method := TechniqueTools.get_method_for_ui_action(action)
		var btn: Button = get_node(bar + btn_name)
		btn.add_to_group("toolbar_btn")
		btn.focus_mode = Control.FOCUS_NONE
		var locked := TechniqueTools.is_method_locked(action)
		var has_content := TechniqueTools.method_has_playable_content(method)
		if not locked and not has_content:
			btn.visible = false
			continue
		btn.visible = true
		btn.disabled = false
		btn.mouse_default_cursor_shape = Control.CURSOR_ARROW if locked else Control.CURSOR_POINTING_HAND
		btn.tooltip_text = TechniqueTools.get_method_lock_hint(action) if locked else _method_button_desc(method)
		btn.text = _method_button_label(method)
		var is_active := method == active_method
		CozyTheme.apply_toolbar_button(btn, is_active, locked)


func _method_button_label(method_id: String) -> String:
	var cfg: Dictionary = Database.player_actions.get(method_id, {})
	var emoji := str(cfg.get("emoji", ""))
	var name := str(cfg.get("name", method_id.capitalize()))
	if emoji.is_empty():
		return name
	return "%s\n%s" % [emoji, name]


func _method_button_desc(method_id: String) -> String:
	var cfg: Dictionary = Database.player_actions.get(method_id, {})
	return str(cfg.get("desc", cfg.get("name", method_id.capitalize())))


func update_action_locks() -> void:
	update_action_ui()


func update_highlights() -> void:
	var action = GameState.active_action
	for token in token_container.get_children():
		token.set_highlight_visible(false)
		if action != "combine" and can_apply_technique(token.item_id, action):
			token.set_highlight_visible(true, "valid")


func clear_combine_highlights() -> void:
	for token in token_container.get_children():
		token.set_highlight_visible(false)


func can_apply_technique(input_id: String, action: String) -> bool:
	return not _find_technique_transition(input_id, action).is_empty()


func can_combine(id1: String, id2: String) -> bool:
	return get_combine_result([id1, id2]) != ""


func _find_technique_transition(input_id: String, _action: String) -> Dictionary:
	for t in Database.transitions:
		if t.get("kind") != "technique" or t.get("input") != input_id:
			continue
		if TechniqueTools.transition_matches(t):
			return t
	return {}


func on_token_clicked(token) -> void:
	if GameState.active_action == "combine":
		return
	if can_apply_technique(token.item_id, GameState.active_action):
		apply_technique(token)
	else:
		var remove_pos: Vector2 = token.global_position
		remove_token(token, true)
		show_floating_warning(remove_pos, "Removed from counter")
		SoundManager.play_sfx("ui_remove")


func _token_at_mouse():
	var query = PhysicsPointQueryParameters2D.new()
	query.position = get_global_mouse_position()
	query.collide_with_areas = true
	var results = get_world_2d().direct_space_state.intersect_point(query)
	for res in results:
		var token = res.get("collider")
		if token and token.has_method("setup"):
			return token
	return null


func apply_technique(token) -> void:
	var action = GameState.active_action
	var transition = _find_technique_transition(token.item_id, action)
	if transition.is_empty():
		remove_token(token)
		return

	var outputs: Array = transition.get("outputs", [])
	if outputs.is_empty():
		_fail_action(token.global_position)
		return

	var old_pos = token.global_position
	var old_id = token.item_id
	var new_outputs: Array = []
	var known_outputs: Array = []
	for out_id in outputs:
		if GameState.is_discovered(out_id):
			known_outputs.append(out_id)
		else:
			new_outputs.append(out_id)

	if new_outputs.size() > 0:
		token.queue_free()
		for out_id in new_outputs:
			GameState.discover_ingredient(out_id, true)
			var skill = _skill_for_action(action, transition)
			GameState.add_skill_xp(skill, 1)
			if skill != "separate":
				GameState.add_skill_xp("separate", 1)
		_play_success(_skill_for_action(action, transition), action, old_pos)
		undo_entry.clear()
		update_undo_button()
		update_highlights()
		return

	token.queue_free()
	var positions = _centered_spawn_positions(old_pos, known_outputs.size())
	for i in range(known_outputs.size()):
		spawn_token(known_outputs[i], positions[i], false)
	push_undo_technique(old_id, known_outputs, old_pos)
	_play_success(_skill_for_action(action, transition), action, old_pos)
	update_highlights()


func on_token_released(dragged_token) -> void:
	clear_combine_highlights()
	if GameState.active_action != "combine":
		return
	var overlaps = dragged_token.get_overlapping_areas()
	var target_token = null
	var min_dist = INF
	for other in overlaps:
		if other != dragged_token and other.has_method("setup"):
			var dist = dragged_token.global_position.distance_to(other.global_position)
			if dist < min_dist:
				min_dist = dist
				target_token = other
	if target_token:
		try_combine(dragged_token, target_token)
	else:
		update_highlights()


func try_combine(token_a, token_b) -> void:
	var id1 = token_a.item_id
	var id2 = token_b.item_id
	var result = get_combine_result([id1, id2])
	if result == "":
		_fail_action((token_a.global_position + token_b.global_position) * 0.5)
		return

	var spawn_pos = (token_a.global_position + token_b.global_position) * 0.5
	token_a.queue_free()
	token_b.queue_free()
	var is_new = not GameState.is_discovered(result)

	if is_new:
		GameState.discover_ingredient(result, true)
		GameState.add_skill_xp("combine", 1)
		GameState.add_skill_xp("separate", 1)
		undo_entry.clear()
	else:
		spawn_token(result, spawn_pos, false)
		push_undo_combine(id1, id2, result, spawn_pos)

	_play_success("combine", "combine", spawn_pos)
	GameState.set_achievement_flag("combine_success")
	update_highlights()


func get_combine_result(inputs: Array) -> String:
	inputs.sort()
	var input_key = ",".join(inputs)
	for t in Database.transitions:
		if t.get("kind") != "combine":
			continue
		var t_inputs: Array = t.get("inputs", [])
		t_inputs.sort()
		if ",".join(t_inputs) == input_key:
			var outputs = t.get("outputs", [])
			if outputs.size() > 0:
				return outputs[0]
	return ""


func _skill_for_action(action: String, transition: Dictionary) -> String:
	var tools: Array = transition.get("tools", [])
	if tools.size() > 0:
		return str(tools[0])
	match action:
		"separate": return "separate"
		"force": return "smash"
		"heat": return "char"
		"time": return "rest"
	return action


func _centered_spawn_positions(center: Vector2, count: int) -> Array:
	if count <= 1:
		return [center]
	var positions: Array = []
	var cols = int(ceil(sqrt(float(count))))
	var spacing = 110.0
	var start_x = center.x - ((cols - 1) * spacing * 0.5)
	var row = 0
	var col = 0
	for i in range(count):
		positions.append(Vector2(start_x + col * spacing, center.y + row * spacing - 20.0))
		col += 1
		if col >= cols:
			col = 0
			row += 1
	return positions


func remove_token(token, push_undo: bool = false) -> void:
	if token:
		if push_undo:
			push_undo_remove(token.item_id, token.global_position)
		token.queue_free()
		update_highlights()
		update_workspace_hint()


func clear_workspace() -> void:
	for token in token_container.get_children():
		token.queue_free()
	undo_entry.clear()
	update_undo_button()
	update_workspace_hint()
	SoundManager.play_sfx("ui_clear")


func spawn_token_at_mouse(id: String) -> void:
	if not GameState.is_pantry_available(id):
		return
	spawn_token(id, get_global_mouse_position(), true)
	var tokens = token_container.get_children()
	if tokens.size() > 0:
		var last_token = tokens[tokens.size() - 1]
		last_token.dragging = true
		last_token.grab_offset = Vector2.ZERO
	update_workspace_hint()


func spawn_token_from_pantry(id: String, global_pos: Vector2) -> void:
	if not GameState.is_pantry_available(id):
		return
	spawn_token(id, global_pos, true)
	var tokens = token_container.get_children()
	if tokens.size() > 0:
		var last_token = tokens[tokens.size() - 1]
		last_token.dragging = true
		last_token.grab_offset = Vector2.ZERO
	update_workspace_hint()


func set_pantry_drop_target(active: bool) -> void:
	if _drop_target_active == active:
		return
	_drop_target_active = active
	if workspace_ring:
		if active:
			workspace_ring.modulate = Color(1.08, 1.04, 0.92, 1.0)
		else:
			workspace_ring.modulate = Color(1, 1, 1, 1)


func spawn_particles(type: String, pos: Vector2) -> void:
	if not particle_scene:
		return
	var node = particle_scene.instantiate()
	add_child(node)
	node.global_position = pos
	node.play_effect(type)


func _play_success(skill_id: String, action: String, pos: Vector2) -> void:
	SoundManager.play_technique_sound(skill_id, action)
	match action:
		"separate", "force":
			spawn_particles("Steam", pos)
		"heat":
			spawn_particles("Embers", pos)
		"time":
			spawn_particles("Sparkles", pos)
		"combine":
			spawn_particles("Sparkles", pos)
		_:
			spawn_particles("Steam", pos)
	flash_workspace(true)
	flash_toolbar_button("success")
	update_workspace_hint()


func _fail_action(pos: Vector2) -> void:
	spawn_particles("Steam", pos)
	SoundManager.play_sfx("fail")
	shake_workspace()
	flash_workspace(false)
	flash_toolbar_button("fail")
	var hint: String = WorkspaceHintsLib.get_failure_hint(token_container.get_children())
	if hint.is_empty():
		hint = "That technique doesn't work here — try another method."
	show_workspace_hint(hint, pos)
	SoundManager.play_sfx("hint")


func show_workspace_hint(text: String, pos: Vector2 = Vector2.ZERO) -> void:
	if not _hint_panel or not _hint_label or text.is_empty():
		return
	var now := Time.get_ticks_msec() / 1000.0
	if text == _last_hint_text and now - _last_hint_at < 4.5:
		return
	_last_hint_text = text
	_last_hint_at = now
	_hint_label.text = text
	_hint_panel.visible = true
	if pos != Vector2.ZERO:
		_hint_panel.position = pos - Vector2(120, 48)
	else:
		_hint_panel.position = Vector2(280, 520)
	_hint_panel.modulate.a = 1.0
	var tween := create_tween()
	tween.tween_interval(2.8)
	tween.tween_property(_hint_panel, "modulate:a", 0.0, 0.45)
	tween.tween_callback(func(): _hint_panel.visible = false)


func show_floating_warning(pos: Vector2, text: String) -> void:
	if not has_node("UI") or text.is_empty():
		return
	var panel := PanelContainer.new()
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_theme_stylebox_override(
		"panel",
		CozyTheme.make_flat_panel(Color(0.08, 0.06, 0.05, 0.88), Color(0.831, 0.459, 0.290), 6, 1)
	)
	var label := Label.new()
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", 11)
	label.add_theme_color_override("font_color", Color(0.961, 0.706, 0.494))
	panel.add_child(label)
	panel.position = pos - Vector2(100, 40)
	panel.custom_minimum_size = Vector2(200, 0)
	get_node("UI").add_child(panel)
	var tween := create_tween()
	tween.tween_interval(1.6)
	tween.tween_property(panel, "modulate:a", 0.0, 0.45)
	tween.tween_callback(panel.queue_free)


func _setup_hint_label() -> void:
	if not has_node("UI"):
		return
	_hint_panel = PanelContainer.new()
	_hint_panel.visible = false
	_hint_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_hint_panel.add_theme_stylebox_override("panel", CozyTheme.make_flat_panel(Color(0.961, 0.945, 0.914, 0.96), CozyTheme.SCROLL_COPPER, 8, 1))
	_hint_label = Label.new()
	_hint_label.custom_minimum_size = Vector2(240, 0)
	_hint_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_hint_label.add_theme_font_size_override("font_size", 12)
	_hint_label.add_theme_color_override("font_color", CozyTheme.SCROLL_INK)
	_hint_panel.add_child(_hint_label)
	get_node("UI").add_child(_hint_panel)


func _setup_hearth_warmth() -> void:
	pass


func _process(_delta: float) -> void:
	if countertop == null or not is_inside_tree() or GameState == null:
		return
	if GameState.reduced_motion:
		countertop.modulate = Color.WHITE
		return
	var pulse := 0.96 + sin(Time.get_ticks_msec() * 0.00074) * 0.04
	countertop.modulate = Color(pulse, pulse * 0.99, pulse * 0.94, 1.0)


func flash_toolbar_button(outcome: String = "press") -> void:
	if GameState.reduced_motion:
		return
	var btn_name: String = ACTION_BUTTONS.get(GameState.active_action, "")
	if btn_name.is_empty():
		return
	var path := "UI/ActionBar/Buttons/" + btn_name
	if not has_node(path):
		return
	var btn: Control = get_node(path)
	btn.pivot_offset = btn.size * 0.5 if btn.size.length_squared() > 1.0 else Vector2(40, 16)
	var origin := btn.position
	var tween := create_tween()
	match outcome:
		"success":
			tween.tween_property(btn, "scale", Vector2(1.08, 1.08), 0.12).set_trans(Tween.TRANS_BACK)
			tween.tween_property(btn, "scale", Vector2.ONE, 0.18)
		"fail":
			tween.tween_property(btn, "position:x", origin.x - 3.0, 0.05)
			tween.tween_property(btn, "position:x", origin.x + 3.0, 0.05)
			tween.tween_property(btn, "position:x", origin.x - 2.0, 0.05)
			tween.tween_property(btn, "position:x", origin.x, 0.05)
		_:
			tween.tween_property(btn, "scale", Vector2(0.9, 0.9), 0.08)
			tween.tween_property(btn, "scale", Vector2(1.06, 1.06), 0.14).set_trans(Tween.TRANS_BACK)
			tween.tween_property(btn, "scale", Vector2.ONE, 0.12)


func _setup_flash_overlay() -> void:
	_flash_overlay = ColorRect.new()
	_flash_overlay.color = Color(1, 1, 1, 0)
	_flash_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_flash_overlay.visible = false
	_flash_overlay.z_index = 4
	if has_node("UI"):
		get_node("UI").add_child(_flash_overlay)


func flash_workspace(success: Variant = null) -> void:
	if GameState.reduced_motion or _flash_overlay == null:
		return
	var tint: Color
	match success:
		true:
			tint = Color(0.545, 0.671, 0.431, 0.22)
		false:
			tint = Color(0.831, 0.376, 0.318, 0.18)
		_:
			tint = Color(0.831, 0.659, 0.290, 0.12)
	_flash_overlay.visible = true
	_flash_overlay.color = tint
	var tween := create_tween()
	tween.tween_property(_flash_overlay, "color", Color(tint.r, tint.g, tint.b, 0.0), 0.52)
	tween.tween_callback(func(): _flash_overlay.visible = false)


func shake_workspace() -> void:
	if GameState.reduced_motion:
		return
	if _shake_tween and _shake_tween.is_running():
		_shake_tween.kill()
	var original := position
	_shake_tween = create_tween()
	_shake_tween.tween_property(self, "position", original + Vector2(-8, 0), 0.05)
	_shake_tween.tween_property(self, "position", original + Vector2(8, 0), 0.05)
	_shake_tween.tween_property(self, "position", original + Vector2(-5, 0), 0.05)
	_shake_tween.tween_property(self, "position", original, 0.05)


func push_undo_spawn(item_id: String, pos: Vector2) -> void:
	undo_entry = {"type": "spawn", "item_id": item_id, "pos": pos}
	update_undo_button()


func push_undo_remove(item_id: String, pos: Vector2) -> void:
	undo_entry = {"type": "remove", "item_id": item_id, "pos": pos}
	update_undo_button()


func push_undo_technique(input_id: String, outputs: Array, pos: Vector2) -> void:
	undo_entry = {"type": "technique", "input_id": input_id, "outputs": outputs, "pos": pos}
	update_undo_button()


func push_undo_combine(input1_id: String, input2_id: String, output_id: String, pos: Vector2) -> void:
	undo_entry = {
		"type": "combine",
		"input1_id": input1_id,
		"input2_id": input2_id,
		"output_id": output_id,
		"pos": pos
	}
	update_undo_button()


func update_undo_button() -> void:
	if not has_node("UI/WorkspaceTools/BtnUndo"):
		return
	var btn: Button = get_node("UI/WorkspaceTools/BtnUndo")
	btn.disabled = undo_entry.is_empty()
	btn.tooltip_text = _undo_tooltip()


func _undo_tooltip() -> String:
	if undo_entry.is_empty():
		return "Nothing to undo"
	match undo_entry.get("type", ""):
		"spawn":
			return "Take it off the counter"
		"remove":
			return "Put that ingredient back"
		"combine":
			return "Undo last combine"
		"technique":
			return "Undo last technique"
		_:
			return "Undo last action"


func apply_undo() -> void:
	if undo_entry.is_empty():
		return
	var type = undo_entry.get("type", "")
	match type:
		"spawn":
			_remove_token_by_id(undo_entry.get("item_id", ""))
		"remove":
			spawn_token(undo_entry.get("item_id", ""), undo_entry.get("pos", Vector2.ZERO), false)
		"technique":
			for out_id in undo_entry.get("outputs", []):
				_remove_token_by_id(out_id)
			spawn_token(undo_entry.get("input_id", ""), undo_entry.get("pos", Vector2.ZERO), false)
		"combine":
			_remove_token_by_id(undo_entry.get("output_id", ""))
			var pos: Vector2 = undo_entry.get("pos", Vector2.ZERO)
			spawn_token(undo_entry.get("input1_id", ""), pos - Vector2(50, 0), false)
			spawn_token(undo_entry.get("input2_id", ""), pos + Vector2(50, 0), false)
	SoundManager.play_sfx("ui_undo")
	GameState.set_achievement_flag("undo_used")
	undo_entry.clear()
	update_undo_button()
	update_workspace_hint()


func _remove_token_by_id(item_id: String) -> void:
	for token in token_container.get_children():
		if token.item_id == item_id:
			token.queue_free()
			return


func _is_action_locked(action: String) -> bool:
	return TechniqueTools.is_method_locked(action)


func update_guide_note() -> void:
	if not has_node("UI/GuideNote/GuideText"):
		return
	var label = get_node("UI/GuideNote/GuideText")
	var count = GameState.get_discovered_item_count()
	var hint = "📌 Ledger Guide: Separate 🫐 Berries on the counter to find fresh fruit and smashable pulp!"
	if not GameState.is_discovered("smashed_berries"):
		pass
	elif not GameState.is_discovered("potato"):
		hint = "📌 Ledger Guide: Separate 🥔 Tubers to find a fresh Potato!"
	elif not GameState.is_discovered("mashed_potato"):
		hint = "📌 Ledger Guide: Use ✊ Force to smash the 🥔 Potato into fluffy mash!"
	elif count < 15:
		hint = "📌 Ledger Guide: Restore 15 recipes to unlock 🥣 Combine (%d/15)." % count
	elif not GameState.is_discovered("sprouted_seeds"):
		hint = "📌 Ledger Guide: Combine 🌻 Seeds and 💧 Water to grow sprouted greens!"
	elif count < 40:
		hint = "📌 Ledger Guide: Reach 40 recipes to unlock 🍳 Heat (%d/40)." % count
	elif count < 200 or not GameState.is_discovered("berry_pulp"):
		hint = "📌 Ledger Guide: Restore 200 recipes and find Berry Pulp to master ⏳ Time (%d/200)." % count
	else:
		hint = "📌 Ledger Guide: The ledger is nearly whole. Hunt remaining secrets in the Progress Map!"
	label.text = hint
