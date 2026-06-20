extends Control

const SHORTCUTS := [
	["1 – 5", "Select method and apply to counter"],
	["[ / ]", "Previous / next sub-technique"],
	["Enter", "Apply active technique to counter"],
	["U / Ctrl+Z", "Undo last counter change"],
	["C", "Clear counter"],
	["/", "Focus pantry search"],
	["P / K / J / A", "Pantry / Skills / Journal / Trophies tabs"],
	["B", "Recipe book"],
	["M", "Toggle progress map"],
	["Shift + drag / right-drag", "Pan recipe graph"],
	["Scroll / + − / 0", "Zoom and fit graph"],
	["Enter on map", "Place focused ingredient (click node too)"],
	["Double-click node", "Also places ingredient on counter"],
	["/ on map", "Focus graph search"],
	["Place / Clear", "Spawn focused node or reset graph focus"],
	[",", "Settings"],
	["S", "Toggle sound"],
	["?", "How to play"],
	["Esc", "Close dialog or leave map"]
]

@onready var card = $Card
@onready var list = $Card/VBox/ShortcutList


func _ready() -> void:
	visible = false
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	call_deferred("_apply_modal_chrome")
	$Card/VBox/BtnClose.pressed.connect(hide_dialog)
	_wrap_shortcut_list()
	_build_shortcut_list()


func _apply_modal_chrome() -> void:
	var backdrop: Panel = $Backdrop if has_node("Backdrop") else null
	CozyTheme.apply_standard_modal(card, backdrop, $Card/VBox/BtnClose)
	if has_node("Card/VBox/Title"):
		$Card/VBox/Title.add_theme_font_override("font", CozyTheme.get_display_font())
		$Card/VBox/Title.add_theme_color_override("font_color", CozyTheme.SCROLL_INK)


func _wrap_shortcut_list() -> void:
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	var parent := list.get_parent()
	var idx := list.get_index()
	parent.remove_child(list)
	scroll.add_child(list)
	parent.add_child(scroll)
	parent.move_child(scroll, idx)


func _build_shortcut_list() -> void:
	for entry in SHORTCUTS:
		var row = HBoxContainer.new()
		row.add_theme_constant_override("separation", 16)
		var keys = Label.new()
		keys.custom_minimum_size = Vector2(110, 0)
		keys.text = entry[0]
		keys.add_theme_color_override("font_color", CozyTheme.SCROLL_GOLD)
		row.add_child(keys)
		var action = Label.new()
		action.text = entry[1]
		action.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(action)
		list.add_child(row)


func toggle_dialog() -> void:
	if visible:
		hide_dialog()
	else:
		show_dialog()


func show_dialog() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	visible = true
	card.scale = Vector2(0.85, 0.85)
	create_tween().tween_property(card, "scale", Vector2.ONE, 0.25).set_trans(Tween.TRANS_BACK)


func hide_dialog() -> void:
	var tween = create_tween()
	tween.tween_property(card, "scale", Vector2(0.8, 0.8), 0.2)
	tween.tween_callback(func():
		visible = false
		mouse_filter = Control.MOUSE_FILTER_IGNORE
		if not GameState.seen_help:
			GameState.seen_help = true
			GameState.save_progress()
	)
