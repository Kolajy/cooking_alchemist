extends CanvasLayer

const IngredientUILib = preload("res://scripts/ingredient_ui.gd")

const PRIMAL_LORE := {
	"water": "The foundation of all culinary science and survival.",
	"fruits": "Humanity's first sweet delicacies from ancient orchards and wild trees.",
	"berries": "Foraged since the Paleolithic era for nutrients and vivid pigments.",
	"roots": "Valued for medicinal qualities across ancient cultures.",
	"tubers": "Starchy engines that helped tribes survive harsh winters.",
	"nuts": "High-energy stores hoarded as critical winter rations.",
	"shellfish": "Shoreline foraging left massive shell middens worldwide.",
	"whole_fish": "Fishing techniques date back over 40,000 years.",
	"mushrooms": "Wild fungi treated as sacred medicine and delicacies.",
	"seeds": "Collecting wild seeds transformed nomads into farmers.",
	"grasses": "Wild grasses bred into the grains that fed empires.",
	"shoots": "Tender shoots harvested as purifying seasonal foods.",
	"livestock": "Domestication provided milk, wool, labor, and protein.",
	"garden_produce": "Wild greens used to balance flavors and cure ailments.",
	"wild_hives": "Honey was humanity's first concentrated sweetener."
}

var _root: Control
var _panel: PanelContainer
var _emoji_label: Label
var _name_label: Label
var _state_label: Label
var _desc_label: Label
var _lore_label: Label
var _props_label: Label
var _tip_label: Label


func _ready() -> void:
	layer = 95
	_build_ui()
	hide_panel()


func _build_ui() -> void:
	_root = Control.new()
	_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_root)

	_panel = PanelContainer.new()
	_panel.custom_minimum_size = Vector2(260, 0)
	_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_panel.add_theme_stylebox_override(
		"panel",
		CozyTheme.make_flat_panel(Color(0.961, 0.945, 0.914, 0.98), CozyTheme.SCROLL_GOLD, 10, 2)
	)
	_root.add_child(_panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 12)
	margin.add_theme_constant_override("margin_right", 12)
	margin.add_theme_constant_override("margin_top", 10)
	margin.add_theme_constant_override("margin_bottom", 10)
	_panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	margin.add_child(vbox)

	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 10)
	vbox.add_child(header)

	_emoji_label = Label.new()
	_emoji_label.add_theme_font_size_override("font_size", 28)
	header.add_child(_emoji_label)

	var meta := VBoxContainer.new()
	meta.add_theme_constant_override("separation", 2)
	header.add_child(meta)

	_name_label = Label.new()
	_name_label.add_theme_font_size_override("font_size", 15)
	_name_label.add_theme_color_override("font_color", CozyTheme.SCROLL_INK)
	meta.add_child(_name_label)

	_state_label = Label.new()
	_state_label.add_theme_font_size_override("font_size", 10)
	_state_label.add_theme_color_override("font_color", CozyTheme.SCROLL_GOLD)
	meta.add_child(_state_label)

	_desc_label = Label.new()
	_desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_desc_label.add_theme_font_size_override("font_size", 11)
	_desc_label.add_theme_color_override("font_color", Color(CozyTheme.SCROLL_INK, 0.78))
	vbox.add_child(_desc_label)

	_lore_label = Label.new()
	_lore_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_lore_label.add_theme_font_size_override("font_size", 10)
	_lore_label.add_theme_color_override("font_color", Color(0.42, 0.34, 0.52, 0.92))
	vbox.add_child(_lore_label)

	_props_label = Label.new()
	_props_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_props_label.add_theme_font_size_override("font_size", 10)
	_props_label.add_theme_color_override("font_color", Color(CozyTheme.SCROLL_INK, 0.72))
	vbox.add_child(_props_label)

	_tip_label = Label.new()
	_tip_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_tip_label.add_theme_font_size_override("font_size", 10)
	_tip_label.add_theme_color_override("font_color", Color(CozyTheme.SAGE_VALID, 0.95))
	vbox.add_child(_tip_label)


func show_for_item(item_id: String, screen_pos: Vector2) -> void:
	var item := _item_data(item_id)
	if item.is_empty():
		hide_panel()
		return

	_emoji_label.text = str(item.get("emoji", "❓"))
	_name_label.text = str(item.get("name", item_id))
	_state_label.text = _state_label_for(item)

	var desc := str(item.get("description", ""))
	_desc_label.text = desc
	_desc_label.visible = desc != ""

	var lore := _lore_text(item_id, item)
	_lore_label.text = lore
	_lore_label.visible = lore != ""

	var props := _format_properties(item)
	_props_label.text = props
	_props_label.visible = props != ""

	var tip := str(item.get("tip", ""))
	if tip != "":
		_tip_label.text = "💡 " + tip
		_tip_label.visible = true
	else:
		_tip_label.visible = false

	_position_panel(screen_pos)
	_panel.visible = true
	visible = true


func update_position(screen_pos: Vector2) -> void:
	if not _panel or not _panel.visible:
		return
	_position_panel(screen_pos)


func hide_panel() -> void:
	if _panel:
		_panel.visible = false
	visible = false


func _position_panel(screen_pos: Vector2) -> void:
	var viewport_size := get_viewport().get_visible_rect().size
	var padding := 15.0
	var card_size := _panel.get_combined_minimum_size()
	if card_size.x < 10.0:
		card_size = Vector2(260, 180)

	var pos := screen_pos + Vector2(padding, padding)
	if pos.x + card_size.x > viewport_size.x:
		pos.x = screen_pos.x - card_size.x - padding
	if pos.y + card_size.y > viewport_size.y:
		pos.y = screen_pos.y - card_size.y - padding
	pos.x = max(padding, pos.x)
	pos.y = max(padding, pos.y)
	_panel.position = pos
	call_deferred("_clamp_panel_position", screen_pos, padding)


func _clamp_panel_position(screen_pos: Vector2, padding: float) -> void:
	if not _panel.visible:
		return
	var viewport_size := get_viewport().get_visible_rect().size
	var card_size := _panel.size
	var pos := _panel.position
	if pos.x + card_size.x > viewport_size.x:
		pos.x = max(padding, screen_pos.x - card_size.x - padding)
	if pos.y + card_size.y > viewport_size.y:
		pos.y = max(padding, screen_pos.y - card_size.y - padding)
	_panel.position = pos


func _item_data(item_id: String) -> Dictionary:
	return Database.get_item(item_id)


func _state_label_for(item: Dictionary) -> String:
	return IngredientUILib.state_label(IngredientUILib.state_key(item))


func _lore_text(item_id: String, item: Dictionary) -> String:
	if str(item.get("origin", "")) == "primitive" and PRIMAL_LORE.has(item_id):
		return PRIMAL_LORE[item_id]
	return str(item.get("blurb", ""))


func _format_properties(item: Dictionary) -> String:
	var props: Dictionary = item.get("properties", {})
	if props.is_empty():
		return ""
	var lines: Array = []
	if props.has("edibleRaw"):
		lines.append("🥦 Raw: %s" % ("Edible" if props.edibleRaw else "Need cook"))
	if props.has("moisture") and str(props.moisture) != "none":
		lines.append("💧 Moisture: %s" % str(props.moisture).capitalize())
	if props.has("fat") and str(props.fat) != "none":
		lines.append("🧈 Fat: %s" % str(props.fat).capitalize())
	if props.has("structure"):
		lines.append("🪵 Structure: %s" % str(props.structure).capitalize())
	if bool(props.get("hasOuterLayer", false)):
		lines.append("🍊 Has peel")
	if bool(props.get("hasSeeds", false)):
		lines.append("🌱 Has seeds")
	if bool(props.get("hasBones", false)):
		lines.append("🦴 Has bones")
	if bool(props.get("toxic", false)):
		lines.append("⚠️ Toxic if raw!")
	return "\n".join(lines)
