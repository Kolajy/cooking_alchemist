extends Node

var _typing_focus: Control = null


func _ready() -> void:
	set_process_unhandled_input(true)


func _unhandled_input(event: InputEvent) -> void:
	if not event is InputEventKey or not event.pressed or event.echo:
		return
	if _is_typing():
		return

	var key_event := event as InputEventKey
	var key := key_event.keycode

	if _handle_discovery_or_modal(key_event):
		return

	if key_event.ctrl_pressed or key_event.meta_pressed:
		if key == KEY_Z:
			var ws = _get_workspace()
			if ws:
				ws.apply_undo()
			get_viewport().set_input_as_handled()
		return

	if GameState.active_main_view == "map":
		if _handle_map(key_event):
			get_viewport().set_input_as_handled()
		return

	if _handle_global(key_event):
		return

	if GameState.active_main_view != "cook":
		return

	_handle_kitchen(key_event)


func _is_typing() -> bool:
	var focus = get_viewport().gui_get_focus_owner()
	return focus is LineEdit or focus is TextEdit


func _handle_discovery_or_modal(event: InputEventKey) -> bool:
	var popup = _find_node("DiscoveryPopup")
	if popup and popup.visible:
		if event.keycode in [KEY_ENTER, KEY_ESCAPE, KEY_SPACE]:
			if popup.has_method("_dismiss_popup"):
				popup._dismiss_popup()
			get_viewport().set_input_as_handled()
			return true
		return true

	for dialog_name in ["SettingsDialog", "HelpDialog", "LedgerBook"]:
		var dialog = _find_node(dialog_name)
		if dialog and dialog.visible:
			if event.keycode == KEY_ESCAPE:
				if dialog.has_method("hide_dialog"):
					dialog.hide_dialog()
				elif dialog.has_method("hide_book"):
					dialog.hide_book()
				get_viewport().set_input_as_handled()
				return true
			if dialog_name == "HelpDialog" and event.keycode == KEY_QUESTION:
				dialog.hide_dialog()
				get_viewport().set_input_as_handled()
				return true
			return event.keycode == KEY_ESCAPE
	return false


func _handle_map(event: InputEventKey) -> bool:
	match event.keycode:
		KEY_ESCAPE:
			_switch_main_view("cook")
			return true
		KEY_M:
			_switch_main_view("cook")
			return true
		KEY_ENTER, KEY_KP_ENTER:
			var map_view = _find_node("ProgressMap")
			if map_view and map_view.has_method("_place_focus_on_counter"):
				map_view._place_focus_on_counter()
			return true
		KEY_SLASH:
			if not event.shift_pressed:
				var map_view = _find_node("ProgressMap")
				if map_view and map_view.has_method("focus_graph_search"):
					map_view.focus_graph_search()
				return true
		KEY_EQUAL, KEY_KP_ADD:
			var map_view = _find_node("ProgressMap")
			if map_view and map_view.has_method("_zoom_in"):
				map_view._zoom_in()
			return true
		KEY_MINUS, KEY_KP_SUBTRACT:
			var map_view = _find_node("ProgressMap")
			if map_view and map_view.has_method("_zoom_out"):
				map_view._zoom_out()
			return true
		KEY_0:
			var map_view = _find_node("ProgressMap")
			if map_view and map_view.has_method("_fit_graph"):
				map_view._fit_graph()
			return true
	return false


func _handle_global(event: InputEventKey) -> bool:
	var key := event.keycode
	match key:
		KEY_ESCAPE:
			if _close_any_dialog():
				get_viewport().set_input_as_handled()
				return true
			if GameState.active_main_view == "map":
				_switch_main_view("cook")
				get_viewport().set_input_as_handled()
				return true
		KEY_QUESTION:
			_toggle_help()
			get_viewport().set_input_as_handled()
			return true
		KEY_SLASH:
			if event.shift_pressed:
				_toggle_help()
			else:
				_focus_pantry_search()
			get_viewport().set_input_as_handled()
			return true
		KEY_B:
			_toggle_recipe_book()
			get_viewport().set_input_as_handled()
			return true
		KEY_M:
			_toggle_progress_map()
			get_viewport().set_input_as_handled()
			return true
		KEY_COMMA:
			_toggle_settings()
			get_viewport().set_input_as_handled()
			return true
		KEY_S:
			_toggle_sound()
			get_viewport().set_input_as_handled()
			return true
		KEY_P:
			_switch_sidebar_tab("cabinet")
			get_viewport().set_input_as_handled()
			return true
		KEY_K:
			_switch_sidebar_tab("skills")
			get_viewport().set_input_as_handled()
			return true
		KEY_J:
			_switch_sidebar_tab("journal")
			get_viewport().set_input_as_handled()
			return true
		KEY_A:
			_switch_sidebar_tab("trophies")
			get_viewport().set_input_as_handled()
			return true
	return false


func _handle_kitchen(event: InputEventKey) -> void:
	var ws = _get_workspace()
	if not ws:
		return
	match event.keycode:
		KEY_ENTER, KEY_KP_ENTER:
			ws.apply_active_technique_to_counter()
			get_viewport().set_input_as_handled()
		KEY_U:
			ws.apply_undo()
			get_viewport().set_input_as_handled()
		KEY_C:
			ws.clear_workspace()
			get_viewport().set_input_as_handled()
		KEY_BRACKETLEFT:
			if TechniqueTools.cycle_skill(-1):
				ws.update_sub_technique_ui()
				ws.update_highlights()
				get_viewport().set_input_as_handled()
		KEY_BRACKETRIGHT:
			if TechniqueTools.cycle_skill(1):
				ws.update_sub_technique_ui()
				ws.update_highlights()
				get_viewport().set_input_as_handled()
		KEY_1:
			ws.set_active_action("separate")
			get_viewport().set_input_as_handled()
		KEY_2:
			ws.set_active_action("force")
			get_viewport().set_input_as_handled()
		KEY_3:
			ws.set_active_action("combine")
			get_viewport().set_input_as_handled()
		KEY_4:
			ws.set_active_action("heat")
			get_viewport().set_input_as_handled()
		KEY_5:
			ws.set_active_action("time")
			get_viewport().set_input_as_handled()


func _get_workspace():
	return _find_node("Workspace")


func _find_node(node_name: String):
	var root = get_tree().root.get_child(0)
	return root.find_child(node_name, true, false)


func _switch_sidebar_tab(tab: String) -> void:
	var pantry = _find_node("PantryUI")
	if pantry and pantry.has_method("_on_tab_pressed"):
		pantry._on_tab_pressed(tab)


func _switch_main_view(view: String) -> void:
	GameState.active_main_view = view
	var ws = _get_workspace()
	var map_view = _find_node("ProgressMap")
	if ws:
		ws.visible = view == "cook"
	if map_view and map_view.has_method("set_visible_map"):
		map_view.set_visible_map(view == "map")
	if ws and ws.has_method("update_map_button"):
		ws.update_map_button()


func _toggle_progress_map() -> void:
	if GameState.active_main_view != "map":
		GameState.set_achievement_flag("map_opened")
	_switch_main_view("map" if GameState.active_main_view != "map" else "cook")


func _toggle_recipe_book() -> void:
	var book = _find_node("LedgerBook")
	if not book:
		return
	if book.visible:
		book.hide_book()
	else:
		book.show_book()


func _toggle_settings() -> void:
	var dialog = _find_node("SettingsDialog")
	if dialog and dialog.has_method("toggle_dialog"):
		dialog.toggle_dialog()


func _toggle_help() -> void:
	var dialog = _find_node("HelpDialog")
	if dialog and dialog.has_method("toggle_dialog"):
		dialog.toggle_dialog()


func _toggle_sound() -> void:
	GameState.sound_enabled = not GameState.sound_enabled
	GameState.save_progress()
	if GameState.sound_enabled:
		SoundManager.play_sfx("ui_click")
	_sync_sound_button()


func _sync_sound_button() -> void:
	var ws = _get_workspace()
	if ws and ws.has_method("update_sound_button"):
		ws.update_sound_button()


func _focus_pantry_search() -> void:
	_switch_main_view("cook")
	_switch_sidebar_tab("cabinet")
	var pantry = _find_node("PantryUI")
	if pantry and pantry.has_method("focus_search"):
		pantry.focus_search()


func _close_any_dialog() -> bool:
	for dialog_name in ["SettingsDialog", "HelpDialog", "LedgerBook"]:
		var dialog = _find_node(dialog_name)
		if dialog and dialog.visible:
			if dialog.has_method("hide_dialog"):
				dialog.hide_dialog()
			elif dialog.has_method("hide_book"):
				dialog.hide_book()
			return true
	return false
