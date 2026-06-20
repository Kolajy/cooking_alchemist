extends Control

@onready var card = $Card
@onready var sound_toggle = $Card/VBox/SoundToggle
@onready var ambience_toggle = $Card/VBox/AmbienceToggle
@onready var motion_toggle = $Card/VBox/MotionToggle
@onready var status_label = $Card/VBox/StatusLabel
@onready var save_dialog = $SaveFileDialog
@onready var load_dialog = $OpenFileDialog

var _import_confirm: ConfirmationDialog
var _reset_confirm: ConfirmationDialog
var _pending_import_path := ""


func _ready() -> void:
	visible = false
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	call_deferred("_apply_modal_chrome")
	if has_node("Backdrop"):
		$Backdrop.gui_input.connect(_on_backdrop_gui_input)
	_import_confirm = ConfirmationDialog.new()
	_import_confirm.title = "Import Save"
	_import_confirm.dialog_text = "Import this save file? Your current progress will be replaced."
	_import_confirm.ok_button_text = "Import"
	_import_confirm.cancel_button_text = "Cancel"
	_import_confirm.confirmed.connect(_confirm_import)
	add_child(_import_confirm)
	_reset_confirm = ConfirmationDialog.new()
	_reset_confirm.title = "Reset Progress"
	_reset_confirm.dialog_text = "Delete all unlocked recipes and progress? This cannot be undone!"
	_reset_confirm.ok_button_text = "Reset"
	_reset_confirm.cancel_button_text = "Cancel"
	_reset_confirm.confirmed.connect(_do_reset)
	add_child(_reset_confirm)
	$Card/VBox/BtnClose.pressed.connect(hide_dialog)
	$Card/VBox/BtnReset.pressed.connect(_reset_progress)
	$Card/VBox/BtnExport.pressed.connect(_export_save)
	$Card/VBox/BtnImport.pressed.connect(_import_save)
	sound_toggle.toggled.connect(_on_sound_toggled)
	ambience_toggle.toggled.connect(_on_ambience_toggled)
	motion_toggle.toggled.connect(_on_motion_toggled)
	save_dialog.file_selected.connect(_on_save_selected)
	load_dialog.file_selected.connect(_on_load_selected)


func _apply_modal_chrome() -> void:
	var backdrop: Panel = $Backdrop if has_node("Backdrop") else null
	CozyTheme.apply_standard_modal(card, backdrop, $Card/VBox/BtnClose)
	if has_node("Card/VBox/Title"):
		$Card/VBox/Title.add_theme_font_override("font", CozyTheme.get_display_font())
		$Card/VBox/Title.add_theme_color_override("font_color", CozyTheme.SCROLL_INK)


func toggle_dialog() -> void:
	if visible:
		hide_dialog()
	else:
		show_dialog()


func show_dialog() -> void:
	sound_toggle.button_pressed = GameState.sound_enabled
	ambience_toggle.button_pressed = GameState.ambience_enabled
	motion_toggle.button_pressed = GameState.reduced_motion
	status_label.text = "Discovered: %d items · %d recipes · Trophies: %d/%d · Progress saves automatically." % [
		GameState.get_discovered_item_count(),
		GameState.get_finalized_recipe_count(),
		GameState.get_achievement_summary().unlocked,
		GameState.get_achievement_summary().total
	]
	mouse_filter = Control.MOUSE_FILTER_STOP
	visible = true
	card.scale = Vector2(0.85, 0.85)
	create_tween().tween_property(card, "scale", Vector2.ONE, 0.25).set_trans(Tween.TRANS_BACK)
	SoundManager.play_sfx("ui_click")


func hide_dialog() -> void:
	var tween = create_tween()
	tween.tween_property(card, "scale", Vector2(0.8, 0.8), 0.2)
	tween.tween_callback(func():
		visible = false
		mouse_filter = Control.MOUSE_FILTER_IGNORE
	)


func _on_backdrop_gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		hide_dialog()


func _on_sound_toggled(enabled: bool) -> void:
	GameState.sound_enabled = enabled
	GameState.save_progress()
	if enabled:
		SoundManager.play_sfx("ui_click")
	InputManager._sync_sound_button()


func _on_ambience_toggled(enabled: bool) -> void:
	SoundManager.set_ambience_enabled(enabled)


func _on_motion_toggled(enabled: bool) -> void:
	GameState.reduced_motion = enabled
	GameState.save_progress()


func _export_save() -> void:
	var stamp := Time.get_datetime_string_from_system().replace(":", "-").replace(" ", "_")
	save_dialog.current_file = "culinary-alchemy-save-%s.json" % stamp
	save_dialog.popup_centered()


func _import_save() -> void:
	load_dialog.popup_centered()


func _on_save_selected(path: String) -> void:
	if GameState.export_save_to_path(path):
		var msg := "Save exported (%d discoveries)" % GameState.get_discovered_item_count()
		status_label.text = msg
		ToastNotifications.show_save_status(msg, true)
		SoundManager.play_sfx("success")
	else:
		status_label.text = "Could not export save."
		ToastNotifications.show_save_status("Could not export save.", false)


func _on_load_selected(path: String) -> void:
	_pending_import_path = path
	_import_confirm.popup_centered()


func _confirm_import() -> void:
	if _pending_import_path.is_empty():
		return
	var result := GameState.import_save_from_path(_pending_import_path)
	_pending_import_path = ""
	if result.get("ok", false):
		var count := int(result.get("count", 0))
		var msg := "Save imported (%d discoveries)" % count
		status_label.text = msg
		ToastNotifications.show_save_status(msg, true)
		GameState.sync_notified_action_unlocks()
		GameState.check_achievements(true)
		SoundManager.play_sfx("success")
		_clear_workspace()
		_refresh_ui()
	else:
		status_label.text = str(result.get("error", "Import failed."))
		ToastNotifications.show_save_status(str(result.get("error", "Import failed.")), false)


func _reset_progress() -> void:
	_reset_confirm.popup_centered()


func _do_reset() -> void:
	GameState.reset_to_starters()
	GameState.save_progress()
	GameState._sync_ambience()
	_clear_workspace()
	hide_dialog()


func _clear_workspace() -> void:
	var ws = get_tree().root.get_child(0).find_child("Workspace", true, false)
	if ws and ws.has_method("clear_workspace"):
		ws.clear_workspace()


func _refresh_ui() -> void:
	var ws = get_tree().root.get_child(0).find_child("Workspace", true, false)
	if ws:
		if ws.has_method("update_progress_ui"):
			ws.update_progress_ui()
		if ws.has_method("update_action_locks"):
			ws.update_action_locks()
		if ws.has_method("update_guide_note"):
			ws.update_guide_note()
	var pantry = get_tree().root.get_child(0).find_child("PantryUI", true, false)
	if pantry and pantry.has_method("rebuild_pantry_content"):
		pantry.rebuild_pantry_content()
