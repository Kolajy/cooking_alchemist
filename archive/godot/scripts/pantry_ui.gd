extends Control

const IngredientUILib = preload("res://scripts/ingredient_ui.gd")

@export var slot_scene: PackedScene = preload("res://scenes/pantry_item_slot.tscn")

const STATE_ORDER := {"primal": 0, "raw": 1, "prepared": 2, "recipe": 3}
const STATE_FILTER_KEYS := ["all", "recent", "primal", "raw", "prepared", "recipe"]
const ACHIEVEMENT_CATEGORY_LABELS := {
	"discovery": "Discovery",
	"technique": "Technique",
	"progression": "Progression",
	"exploration": "Exploration"
}

@onready var layout = $Layout
@onready var cabinet_grid = $Layout/TabContents/CabinetScroll/CabinetGrid
@onready var search_field = $Layout/SearchRow/SearchField
@onready var search_row = $Layout/SearchRow
@onready var footer_label = $Layout/FooterHint
@onready var tab_buttons = {
	"cabinet": $Layout/TabBar/BtnCabinet,
	"skills": $Layout/TabBar/BtnSkills,
	"journal": $Layout/TabBar/BtnJournal,
	"trophies": $Layout/TabBar/BtnTrophies
}

var _highlight_timers: Dictionary = {}
var _state_filter_includes: Dictionary = {}
var _state_filter_excludes: Dictionary = {}
var _category_filter_includes: Dictionary = {}
var _category_filter_excludes: Dictionary = {}
var _state_filter_row: ScrollContainer
var _category_filter_row: ScrollContainer
var _state_filter_flow: HBoxContainer
var _category_filter_flow: HBoxContainer
var _state_filter_heading: Label
var _category_filter_heading: Label
var _state_filter_buttons: Dictionary = {}
var _category_filter_buttons: Dictionary = {}


func _ready() -> void:
	GameState.connect("discovery_changed", Callable(self, "_on_discovery_changed"))
	for tab_name in tab_buttons.keys():
		tab_buttons[tab_name].add_to_group("pantry_tab")
		var labels := {
			"cabinet": "🗄️ CABINET",
			"skills": "🎓 SKILLS",
			"journal": "📓 JOURNAL",
			"trophies": "🏆 TROPHIES"
		}
		tab_buttons[tab_name].text = labels.get(tab_name, tab_name.capitalize())
	$Layout/TabBar/BtnCabinet.pressed.connect(_on_tab_pressed.bind("cabinet"))
	$Layout/TabBar/BtnSkills.pressed.connect(_on_tab_pressed.bind("skills"))
	$Layout/TabBar/BtnJournal.pressed.connect(_on_tab_pressed.bind("journal"))
	$Layout/TabBar/BtnTrophies.pressed.connect(_on_tab_pressed.bind("trophies"))
	if search_field:
		search_field.placeholder_text = "Search name or :tags (e.g. :raw, :recent)…"
		search_field.text_changed.connect(_on_search_changed)
	_build_filter_rows()
	get_viewport().size_changed.connect(_sync_viewport_layout)
	call_deferred("_sync_viewport_layout")
	call_deferred("_style_pantry_chrome")
	_on_tab_pressed("cabinet")
	_schedule_recent_highlight_clears()


func _style_pantry_chrome() -> void:
	if has_node("Layout/Header"):
		var header: Label = $Layout/Header
		header.add_theme_font_override("font", CozyTheme.get_display_font())
		header.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
	if search_field:
		search_field.add_theme_stylebox_override("normal", CozyTheme.make_search_field())
		search_field.add_theme_stylebox_override("focus", CozyTheme.make_search_field())
		search_field.add_theme_color_override("font_color", CozyTheme.SCROLL_INK)
		search_field.add_theme_color_override("font_placeholder_color", CozyTheme.SCROLL_INK_MUTED)
	_refresh_filter_styles()


func _get_shell_content_rect() -> Rect2:
	var main = get_tree().root.get_child(0)
	if main and main.has_method("get_shell_content_rect"):
		return main.get_shell_content_rect()
	var size := get_viewport_rect().size
	return Rect2(0.0, 0.0, size.x, size.y)


func _sync_viewport_layout() -> void:
	var content := _get_shell_content_rect()
	var main = get_tree().root.get_child(0)
	var sidebar_w := 340.0
	if main != null and main.get("SIDEBAR_WIDTH") != null:
		sidebar_w = float(main.SIDEBAR_WIDTH)
	anchor_left = 0.0
	anchor_top = 0.0
	anchor_right = 0.0
	anchor_bottom = 0.0
	offset_left = content.position.x + content.size.x - sidebar_w
	offset_top = content.position.y
	offset_right = content.position.x + content.size.x
	offset_bottom = content.position.y + content.size.y
	custom_minimum_size = Vector2(sidebar_w, content.size.y)


func _layout_index_after(node: Node) -> int:
	return node.get_index() + 1


func _build_filter_rows() -> void:
	var insert_at := _layout_index_after(search_row)

	_state_filter_heading = Label.new()
	_state_filter_heading.text = "State  ·  click include · shift exclude"
	_state_filter_heading.add_theme_font_size_override("font_size", 10)
	_state_filter_heading.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
	layout.add_child(_state_filter_heading)
	layout.move_child(_state_filter_heading, insert_at)
	insert_at += 1

	_state_filter_row = ScrollContainer.new()
	_state_filter_row.custom_minimum_size = Vector2(0, 32)
	_state_filter_row.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	_state_filter_row.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	layout.add_child(_state_filter_row)
	layout.move_child(_state_filter_row, insert_at)
	insert_at += 1

	_state_filter_flow = HBoxContainer.new()
	_state_filter_flow.add_theme_constant_override("separation", 4)
	_state_filter_flow.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_state_filter_row.add_child(_state_filter_flow)

	for key in STATE_FILTER_KEYS:
		var btn := _make_filter_button(_state_filter_label(key))
		btn.pressed.connect(_on_state_filter_pressed.bind(key))
		_state_filter_flow.add_child(btn)
		_state_filter_buttons[key] = btn

	_category_filter_heading = Label.new()
	_category_filter_heading.text = "Category  ·  click include · shift exclude"
	_category_filter_heading.add_theme_font_size_override("font_size", 10)
	_category_filter_heading.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
	layout.add_child(_category_filter_heading)
	layout.move_child(_category_filter_heading, insert_at)
	insert_at += 1

	_category_filter_row = ScrollContainer.new()
	_category_filter_row.custom_minimum_size = Vector2(0, 32)
	_category_filter_row.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	_category_filter_row.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	layout.add_child(_category_filter_row)
	layout.move_child(_category_filter_row, insert_at)

	_category_filter_flow = HBoxContainer.new()
	_category_filter_flow.add_theme_constant_override("separation", 4)
	_category_filter_flow.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_category_filter_row.add_child(_category_filter_flow)

	for key in _catalog_category_keys():
		var btn := _make_filter_button(_category_filter_label(key))
		btn.pressed.connect(_on_category_filter_pressed.bind(key))
		_category_filter_flow.add_child(btn)
		_category_filter_buttons[key] = btn

	_refresh_filter_styles()


func _make_filter_button(text: String) -> Button:
	var btn := Button.new()
	btn.text = text
	btn.custom_minimum_size = Vector2(0, 24)
	btn.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	btn.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	btn.add_theme_font_size_override("font_size", 9)
	btn.add_theme_stylebox_override("normal", CozyTheme.make_filter_chip())
	btn.add_theme_stylebox_override("hover", CozyTheme.make_button_hover())
	btn.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
	btn.add_theme_color_override("font_hover_color", CozyTheme.SCROLL_INK)
	return btn


func _state_filter_label(key: String) -> String:
	if key == "all":
		return "All"
	if key == "recent":
		return "Recent"
	if key == "primal":
		return "Primal"
	return key.capitalize()


func _catalog_category_keys() -> Array:
	var preferred := ["Liquids", "Produce", "Forage", "Proteins", "Pantry"]
	var types: Dictionary = {}
	for st in Database.starters:
		var cat := str(st.get("category", ""))
		if not cat.is_empty():
			types[cat] = true
	for id in Database.discoverable_items.keys():
		var cat := str(Database.discoverable_items[id].get("category", ""))
		if not cat.is_empty():
			types[cat] = true
	for unlock in Database.unlockables:
		var cat := str(unlock.get("category", ""))
		if not cat.is_empty():
			types[cat] = true
	var result: Array = ["all"]
	for cat in preferred:
		if types.has(cat):
			result.append(cat)
	var extras: Array = []
	for cat in types.keys():
		if cat not in preferred:
			extras.append(cat)
	extras.sort()
	result.append_array(extras)
	return result


func _category_filter_label(key: String) -> String:
	if key == "all":
		return "All"
	return key


func _on_state_filter_pressed(key: String) -> void:
	if Input.is_key_pressed(KEY_SHIFT) and key != "all":
		_state_filter_includes.erase(key)
		if _state_filter_excludes.has(key):
			_state_filter_excludes.erase(key)
		else:
			_state_filter_excludes[key] = true
	elif key == "all":
		_state_filter_includes.clear()
		_state_filter_excludes.clear()
	else:
		_state_filter_excludes.erase(key)
		if _state_filter_includes.has(key):
			_state_filter_includes.erase(key)
		else:
			_state_filter_includes[key] = true
	_refresh_filter_styles()
	if GameState.active_sidebar_tab == "cabinet":
		rebuild_cabinet()
	SoundManager.play_sfx("ui_click")


func _on_category_filter_pressed(key: String) -> void:
	if Input.is_key_pressed(KEY_SHIFT) and key != "all":
		_category_filter_includes.erase(key)
		if _category_filter_excludes.has(key):
			_category_filter_excludes.erase(key)
		else:
			_category_filter_excludes[key] = true
	elif key == "all":
		_category_filter_includes.clear()
		_category_filter_excludes.clear()
	else:
		_category_filter_excludes.erase(key)
		if _category_filter_includes.has(key):
			_category_filter_includes.erase(key)
		else:
			_category_filter_includes[key] = true
	_refresh_filter_styles()
	if GameState.active_sidebar_tab == "cabinet":
		rebuild_cabinet()
	SoundManager.play_sfx("ui_click")


func _filter_mode(includes: Dictionary, excludes: Dictionary, key: String) -> String:
	if key == "all":
		return "all" if includes.is_empty() and excludes.is_empty() else "neutral"
	if includes.has(key):
		return "include"
	if excludes.has(key):
		return "exclude"
	return "neutral"


func _refresh_filter_styles() -> void:
	for key in _state_filter_buttons.keys():
		var mode: String = _filter_mode(_state_filter_includes, _state_filter_excludes, key)
		var btn: Button = _state_filter_buttons[key]
		CozyTheme.apply_button(btn, mode == "include" or mode == "all")
		if mode == "exclude":
			btn.modulate = Color(0.85, 0.55, 0.55)
		else:
			btn.modulate = Color.WHITE
	for key in _category_filter_buttons.keys():
		var mode: String = _filter_mode(_category_filter_includes, _category_filter_excludes, key)
		var btn: Button = _category_filter_buttons[key]
		CozyTheme.apply_button(btn, mode == "include" or mode == "all")
		if mode == "exclude":
			btn.modulate = Color(0.85, 0.55, 0.55)
		else:
			btn.modulate = Color.WHITE


func _update_filter_visibility(show_cabinet: bool) -> void:
	if search_row:
		search_row.visible = show_cabinet
	if _state_filter_heading:
		_state_filter_heading.visible = show_cabinet
	if _state_filter_row:
		_state_filter_row.visible = show_cabinet
	if _category_filter_heading:
		_category_filter_heading.visible = show_cabinet
	if _category_filter_row:
		_category_filter_row.visible = show_cabinet
	if footer_label:
		match GameState.active_sidebar_tab:
			"cabinet":
				footer_label.text = "Drag something onto the counter to begin."
			"skills":
				footer_label.text = "Practice techniques to earn exp and unlock new actions."
			"journal":
				footer_label.text = "Revisit what you have learned at the hearth."
			"trophies":
				footer_label.text = "Every hearth has stories worth remembering."
			_:
				footer_label.text = ""


func _on_discovery_changed() -> void:
	rebuild_pantry_content()
	_schedule_recent_highlight_clears()


func _on_tab_pressed(tab_name: String) -> void:
	SoundManager.play_sfx("ui_tab")
	GameState.active_sidebar_tab = tab_name
	_update_tab_styles(tab_name)
	_update_filter_visibility(tab_name == "cabinet")
	rebuild_pantry_content()


func _update_tab_styles(active_tab: String) -> void:
	for tab_name in tab_buttons.keys():
		_style_tab(tab_buttons[tab_name], tab_name == active_tab)


func _style_tab(b: Button, active: bool) -> void:
	var ember := CozyTheme.SCROLL_EMBER
	var copper := Color(0.620, 0.404, 0.259)
	var normal := StyleBoxFlat.new()
	normal.bg_color = Color(0.941, 0.902, 0.867, 0.35) if active else Color(0, 0, 0, 0)
	normal.content_margin_top = 8
	normal.content_margin_bottom = 6
	normal.content_margin_left = 4
	normal.content_margin_right = 4
	normal.border_width_bottom = 2
	normal.border_color = ember if active else Color(0, 0, 0, 0)
	var hover := normal.duplicate() as StyleBoxFlat
	hover.bg_color = Color(0.941, 0.902, 0.867, 0.55)
	b.add_theme_stylebox_override("normal", normal)
	b.add_theme_stylebox_override("hover", hover)
	b.add_theme_stylebox_override("pressed", normal)
	b.add_theme_stylebox_override("focus", StyleBoxEmpty.new())
	b.add_theme_font_override("font", CozyTheme.get_body_font())
	b.add_theme_font_size_override("font_size", 10)
	var text_color := ember if active else CozyTheme.SCROLL_INK_MUTED
	b.add_theme_color_override("font_color", text_color)
	b.add_theme_color_override("font_hover_color", copper)
	b.add_theme_color_override("font_pressed_color", text_color)


func rebuild_pantry_content() -> void:
	for child in cabinet_grid.get_children():
		child.queue_free()

	match GameState.active_sidebar_tab:
		"cabinet":
			cabinet_grid.columns = 3
			rebuild_cabinet()
		"skills":
			cabinet_grid.columns = 1
			rebuild_skills()
		"journal":
			cabinet_grid.columns = 1
			rebuild_journal()
		"trophies":
			cabinet_grid.columns = 1
			rebuild_trophies()

	var main_node = get_tree().root.get_child(0)
	if main_node and main_node.has_method("apply_cozy_theme"):
		main_node.apply_cozy_theme(self)
	_restyle_cabinet_slots()
	call_deferred("_style_pantry_chrome")


func focus_search() -> void:
	if search_field:
		search_field.grab_focus()
		search_field.select_all()


func _on_search_changed(_text: String) -> void:
	if GameState.active_sidebar_tab == "cabinet":
		rebuild_cabinet()


func rebuild_cabinet() -> void:
	var parsed := _parse_search_query(search_field.text if search_field else "")
	var entries: Array = _collect_cabinet_entries()
	var filtered: Array = []

	for entry in entries:
		if not _matches_text_search(entry, parsed.text):
			continue
		if not _matches_tag_queries(entry, parsed.tags):
			continue
		if not _matches_state_filter(entry.id, entry.state):
			continue
		if not _matches_category_filter(str(entry.item.get("category", ""))):
			continue
		filtered.append(entry)

	filtered.sort_custom(_sort_cabinet_entries)

	if filtered.is_empty():
		cabinet_grid.columns = 1
		var empty := Label.new()
		empty.text = "No pantry items match your search or filters."
		empty.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		empty.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		cabinet_grid.add_child(empty)
		return

	cabinet_grid.columns = 3
	for entry in filtered:
		create_slot(entry.id, str(entry.item.get("emoji", "❓")), str(entry.item.get("name", entry.id)))


func _collect_cabinet_entries() -> Array:
	var entries: Array = []
	var seen: Dictionary = {}

	for st in Database.starters:
		_add_catalog_entry(str(st.get("id", "")), seen, entries)
	for id in GameState.get_milestone_unlocked_ids():
		_add_catalog_entry(str(id), seen, entries)
	for id in GameState.get_dynamic_unlock_ids():
		_add_catalog_entry(str(id), seen, entries)
	for id in GameState.discovered_ids.keys():
		_add_catalog_entry(str(id), seen, entries)
	return entries


func _add_catalog_entry(id: String, seen: Dictionary, entries: Array) -> void:
	if id.is_empty() or seen.has(id):
		return
	if not GameState.is_pantry_available(id):
		return
	var item := Database.get_item(id)
	if item.is_empty():
		return
	seen[id] = true
	entries.append({
		"id": id,
		"item": item,
		"state": IngredientUILib.state_key(item, id)
	})


func _parse_search_query(raw: String) -> Dictionary:
	var text := raw.to_lower()
	var tags: Array = []
	var regex := RegEx.new()
	regex.compile(":([a-z0-9_-]+)")
	for match in regex.search_all(text):
		tags.append(match.get_string(1).to_lower())
	text = regex.sub(text, "", true).strip_edges()
	return {"text": text, "tags": tags}


func _matches_text_search(entry: Dictionary, text: String) -> bool:
	if text.is_empty():
		return true
	var item: Dictionary = entry.item
	var id: String = entry.id
	var name: String = str(item.get("name", id)).to_lower()
	var desc: String = str(item.get("description", "")).to_lower()
	return text in name or text in id or text in desc


func _matches_tag_queries(entry: Dictionary, tags: Array) -> bool:
	if tags.is_empty():
		return true
	var item: Dictionary = entry.item
	var props: Dictionary = item.get("properties", {})
	var state: String = entry.state
	var entry_id: String = entry.id
	for tag in tags:
		if tag == "raw":
			if state != "raw" and props.get("edibleRaw", null) != true:
				return false
		elif tag in ["edible", "edibleraw"]:
			if props.get("edibleRaw", null) != true:
				return false
		elif tag in ["cook", "needcook"]:
			if props.get("edibleRaw", null) != false:
				return false
		elif tag == "toxic":
			if not bool(props.get("toxic", false)):
				return false
		elif tag in ["seed", "seeds", "hasseeds"]:
			if not bool(props.get("hasSeeds", false)):
				return false
		elif tag in ["bone", "bones", "hasbones"]:
			if not bool(props.get("hasBones", false)):
				return false
		elif tag in ["peel", "outer", "hasouterlayer", "peelable"]:
			if not bool(props.get("hasOuterLayer", false)):
				return false
		elif tag in ["liquid", "soft", "hard"]:
			if str(props.get("structure", "")).to_lower() != tag:
				return false
		elif tag in ["moist", "moisture"]:
			var moisture: String = str(props.get("moisture", "")).to_lower()
			if moisture != "high" and moisture != "medium":
				return false
		elif tag == "dry":
			var moisture_dry: String = str(props.get("moisture", "")).to_lower()
			if moisture_dry != "low" and moisture_dry != "none":
				return false
		elif tag in ["fat", "fatty"]:
			var fat: String = str(props.get("fat", "")).to_lower()
			if fat != "high" and fat != "medium":
				return false
		elif tag == "lean":
			var fat_lean: String = str(props.get("fat", "")).to_lower()
			if fat_lean != "low" and fat_lean != "none":
				return false
		elif tag == "recent":
			if entry_id not in GameState.recently_discovered_ids:
				return false
		elif tag in ["recipe"]:
			if state != "recipe":
				return false
		elif tag in ["primal", "prepared"]:
			if state != tag:
				return false
		else:
			var category := str(item.get("category", "")).to_lower()
			if tag not in category and tag not in state:
				return false
	return true


func _matches_state_filter(entry_id: String, state: String) -> bool:
	if _state_filter_excludes.has("recent") and entry_id in GameState.recently_discovered_ids:
		return false
	if _state_filter_excludes.has(state):
		return false
	if _state_filter_includes.has("recent") and entry_id not in GameState.recently_discovered_ids:
		return false
	var state_includes: Array = []
	for key in _state_filter_includes.keys():
		if key != "recent":
			state_includes.append(key)
	if state_includes.size() > 0 and state not in state_includes:
		return false
	return true


func _matches_category_filter(category: String) -> bool:
	if _category_filter_excludes.has(category):
		return false
	var includes: Array = _category_filter_includes.keys()
	if includes.size() > 0 and category not in includes:
		return false
	return true


func _sort_cabinet_entries(a: Dictionary, b: Dictionary) -> bool:
	if _state_filter_includes.has("recent"):
		var order_a: int = GameState.recently_discovered_ids.find(a.id)
		var order_b: int = GameState.recently_discovered_ids.find(b.id)
		if order_a == -1:
			order_a = 999
		if order_b == -1:
			order_b = 999
		if order_a != order_b:
			return order_a < order_b
	var order_a: int = STATE_ORDER.get(a.state, 2)
	var order_b: int = STATE_ORDER.get(b.state, 2)
	if order_a != order_b:
		return order_a < order_b
	return str(a.item.get("name", a.id)) < str(b.item.get("name", b.id))


func create_slot(id: String, emoji: String, item_name: String) -> void:
	if not slot_scene:
		return
	var slot = slot_scene.instantiate()
	slot.add_to_group("pantry_slot")
	cabinet_grid.add_child(slot)
	slot.setup(id, emoji, item_name)
	if GameState.recent_highlight_ids.has(id) and slot.has_method("set_recent_highlight"):
		slot.set_recent_highlight(true)
	slot.connect("item_clicked", Callable(self, "_on_slot_clicked"))


func _restyle_cabinet_slots() -> void:
	for child in cabinet_grid.get_children():
		if not child.is_in_group("pantry_slot"):
			continue
		var item_id := str(child.get("item_id"))
		if item_id.is_empty():
			continue
		var item := Database.get_item(item_id)
		if item.is_empty():
			continue
		child.setup(item_id, str(item.get("emoji", "❓")), str(item.get("name", item_id)))


func _schedule_recent_highlight_clears() -> void:
	for id in GameState.recent_highlight_ids.keys():
		if _highlight_timers.has(id):
			continue
		_highlight_timers[id] = true
		var timer := get_tree().create_timer(2.6)
		timer.timeout.connect(_clear_recent_highlight.bind(id))


func _clear_recent_highlight(id: String) -> void:
	_highlight_timers.erase(id)
	if not GameState.recent_highlight_ids.has(id):
		return
	GameState.recent_highlight_ids.erase(id)
	if GameState.active_sidebar_tab == "cabinet":
		rebuild_cabinet()


func _on_slot_clicked(id: String) -> void:
	SoundManager.play_sfx("ui_pickup")
	var root = get_tree().root.get_child(0)
	var ws = root.find_child("Workspace", true, false)
	if ws and ws.has_method("spawn_token_at_mouse"):
		ws.spawn_token_at_mouse(id)


func rebuild_skills() -> void:
	for method_id in TechniqueTools.METHOD_ORDER:
		var cfg: Dictionary = Database.player_actions.get(method_id, {})
		if cfg.is_empty():
			continue
		cabinet_grid.add_child(_make_skills_section_header(cfg))
		var track_id := str(cfg.get("mode", method_id))
		if method_id != "combine":
			cabinet_grid.add_child(_make_mode_practice_card(method_id, cfg, track_id))
		for category_id in cfg.get("categories", []):
			var cat_data: Dictionary = Database.technique_categories.get(category_id, {})
			var techniques: Dictionary = cat_data.get("techniques", {})
			for skill_id in techniques.keys():
				var skill: Dictionary = techniques[skill_id]
				if TechniqueTools.is_skill_unlocked_by_id(skill_id):
					cabinet_grid.add_child(_make_unlocked_skill_card(skill_id, skill))
				else:
					cabinet_grid.add_child(_make_locked_skill_card(skill_id, skill))


func _make_skills_section_header(cfg: Dictionary) -> Control:
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override(
		"panel",
		CozyTheme.make_flat_panel(Color(0.922, 0.878, 0.816, 0.95), CozyTheme.SCROLL_GOLD, 8, 1)
	)
	var label := Label.new()
	label.text = "%s %s" % [cfg.get("emoji", "✨"), cfg.get("name", "Skill")]
	label.add_theme_font_size_override("font_size", 13)
	panel.add_child(label)
	return panel


func _make_mode_practice_card(method_id: String, cfg: Dictionary, track_id: String) -> Control:
	var xp := int(GameState.skills_xp.get(track_id, 0))
	var level := int(xp / 10) + 1
	var current_xp := xp % 10
	var panel := _make_skill_card_panel(false)
	var vbox := panel.get_child(0) as VBoxContainer
	var title := Label.new()
	title.text = "%s %s Practice  ·  Lvl %d" % [cfg.get("emoji", "✨"), cfg.get("name", method_id), level]
	vbox.add_child(title)
	if cfg.has("desc"):
		var desc := Label.new()
		desc.text = str(cfg.desc)
		desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		desc.add_theme_font_size_override("font_size", 10)
		desc.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
		vbox.add_child(desc)
	vbox.add_child(_make_xp_bar(current_xp, 10))
	var xp_label := Label.new()
	xp_label.text = "XP %d / 10" % current_xp
	xp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	xp_label.add_theme_font_size_override("font_size", 10)
	vbox.add_child(xp_label)
	return panel


func _make_unlocked_skill_card(skill_id: String, skill: Dictionary) -> Control:
	var xp := int(GameState.skills_xp.get(skill_id, 0))
	var level := int(xp / 10) + 1
	var current_xp := xp % 10
	var panel := _make_skill_card_panel(false)
	var vbox := panel.get_child(0) as VBoxContainer
	var title := Label.new()
	title.text = "%s %s  ·  Lvl %d" % [skill.get("emoji", "✨"), skill.get("name", skill_id), level]
	vbox.add_child(title)
	if skill.has("desc"):
		var desc := Label.new()
		desc.text = str(skill.desc)
		desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		desc.add_theme_font_size_override("font_size", 10)
		desc.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
		vbox.add_child(desc)
	vbox.add_child(_make_xp_bar(current_xp, 10))
	var xp_label := Label.new()
	xp_label.text = "XP %d / 10" % current_xp
	xp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	xp_label.add_theme_font_size_override("font_size", 10)
	vbox.add_child(xp_label)
	return panel


func _make_locked_skill_card(skill_id: String, skill: Dictionary) -> Control:
	var panel := _make_skill_card_panel(true)
	panel.modulate = Color(1, 1, 1, 0.72)
	var vbox := panel.get_child(0) as VBoxContainer
	var title := Label.new()
	title.text = "🔒 %s %s" % [skill.get("emoji", "✨"), skill.get("name", skill_id)]
	vbox.add_child(title)
	var progress_text := "Locked"
	var bar_percent := 0.0
	var prerequisites: Dictionary = skill.get("unlockCriteria", {}).get("prerequisites", {})
	if not prerequisites.is_empty():
		var parent_id: String = str(prerequisites.keys()[0])
		var needed := int(prerequisites[parent_id])
		var parent_xp := int(GameState.skills_xp.get(parent_id, 0))
		var parent_level := int(parent_xp / 10) + 1
		bar_percent = clampf(float(parent_level) / float(needed), 0.0, 1.0) * 100.0
		var parent_skill := TechniqueTools.get_skill_definition(parent_id)
		var parent_label: String = str(parent_skill.get("name", parent_id))
		progress_text = "Requires %s: level %d / %d" % [parent_label, parent_level, needed]
	vbox.add_child(_make_xp_bar(bar_percent, 100.0))
	var status := Label.new()
	status.text = progress_text
	status.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	status.add_theme_font_size_override("font_size", 10)
	status.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
	vbox.add_child(status)
	return panel


func _make_skill_card_panel(muted: bool) -> PanelContainer:
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(300, 72)
	var bg := Color(0.961, 0.945, 0.914)
	if muted:
		bg = Color(0.945, 0.935, 0.905)
	panel.add_theme_stylebox_override("panel", CozyTheme.make_flat_panel(bg, CozyTheme.SCROLL_COPPER, 8, 1))
	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	panel.add_child(vbox)
	return panel


func _make_xp_bar(value: float, max_value: float) -> ProgressBar:
	var bar := ProgressBar.new()
	bar.min_value = 0
	bar.max_value = max_value
	bar.value = value
	bar.custom_minimum_size = Vector2(0, 12)
	bar.show_percentage = false
	return bar


func _format_discovered_at(ms: int) -> String:
	if ms <= 0:
		return "Earlier session"
	return Time.get_datetime_string_from_unix_time(int(ms / 1000), true)


func rebuild_journal() -> void:
	var log_entries = GameState.discovery_log.duplicate()
	log_entries.reverse()
	if log_entries.is_empty():
		var empty = Label.new()
		empty.text = "Your hearth journal is blank.\nSeparate, combine, and cook on the counter — each new find is recorded here."
		empty.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		empty.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		cabinet_grid.add_child(empty)
		return
	var count_label := Label.new()
	count_label.text = "%d discoveries recorded" % log_entries.size()
	count_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	count_label.add_theme_font_size_override("font_size", 11)
	count_label.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
	cabinet_grid.add_child(count_label)
	for entry in log_entries:
		var id: String = str(entry.get("id", ""))
		var item := Database.get_item(id)
		if item.is_empty():
			continue
		var state: String = IngredientUILib.state_key(item, id)
		var is_recipe := state == "recipe"
		var panel = PanelContainer.new()
		panel.custom_minimum_size = Vector2(300, 72)
		var border_color := CozyTheme.SCROLL_COPPER
		if is_recipe:
			border_color = CozyTheme.SCROLL_GOLD
		panel.add_theme_stylebox_override("panel", CozyTheme.make_flat_panel(Color(0.961, 0.945, 0.914), border_color, 8, 1))
		var row = HBoxContainer.new()
		row.add_theme_constant_override("separation", 10)
		panel.add_child(row)
		var emoji_label = Label.new()
		emoji_label.text = str(item.get("emoji", "❓"))
		emoji_label.add_theme_font_size_override("font_size", 22)
		row.add_child(emoji_label)
		var meta = VBoxContainer.new()
		meta.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		meta.add_theme_constant_override("separation", 2)
		row.add_child(meta)
		var name_label = Label.new()
		name_label.text = str(item.get("name", id))
		meta.add_child(name_label)
		var sub = HBoxContainer.new()
		sub.add_theme_constant_override("separation", 6)
		meta.add_child(sub)
		var badge = Label.new()
		badge.text = IngredientUILib.state_label(state)
		badge.add_theme_font_size_override("font_size", 10)
		badge.add_theme_color_override("font_color", IngredientUILib.badge_color(state))
		sub.add_child(badge)
		var category := str(item.get("category", ""))
		if not category.is_empty():
			var cat_label = Label.new()
			cat_label.text = category
			cat_label.add_theme_font_size_override("font_size", 10)
			cat_label.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
			sub.add_child(cat_label)
		var time_label = Label.new()
		time_label.text = _format_discovered_at(int(entry.get("discoveredAt", 0)))
		time_label.add_theme_font_size_override("font_size", 10)
		time_label.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
		row.add_child(time_label)
		cabinet_grid.add_child(panel)


func rebuild_trophies() -> void:
	var summary = GameState.get_achievement_summary()
	var header = Label.new()
	header.text = "Trophies unlocked: %d / %d" % [summary.unlocked, summary.total]
	header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	cabinet_grid.add_child(header)
	var progress_bar := ProgressBar.new()
	progress_bar.custom_minimum_size = Vector2(300, 10)
	progress_bar.min_value = 0
	progress_bar.max_value = 100
	var pct: float = 0.0
	if summary.total > 0:
		pct = float(summary.unlocked) / float(summary.total) * 100.0
	progress_bar.value = pct
	progress_bar.show_percentage = false
	cabinet_grid.add_child(progress_bar)
	var grouped: Dictionary = {}
	for achievement in Database.achievements:
		var category := str(achievement.get("category", "other"))
		if not grouped.has(category):
			grouped[category] = []
		grouped[category].append(achievement)
	for category in grouped.keys():
		var section := Label.new()
		section.text = ACHIEVEMENT_CATEGORY_LABELS.get(category, category.capitalize())
		section.add_theme_font_size_override("font_size", 12)
		section.add_theme_color_override("font_color", CozyTheme.SCROLL_GOLD)
		cabinet_grid.add_child(section)
		for achievement in grouped[category]:
			var ach_id := str(achievement.get("id", ""))
			var unlocked = GameState.is_achievement_unlocked(ach_id)
			var panel = PanelContainer.new()
			panel.custom_minimum_size = Vector2(300, 72)
			panel.add_theme_stylebox_override("panel", CozyTheme.make_flat_panel(Color(0.961, 0.945, 0.914), CozyTheme.SCROLL_COPPER, 8, 1))
			if not unlocked:
				panel.modulate = Color(1, 1, 1, 0.55)
			var vbox = VBoxContainer.new()
			vbox.add_theme_constant_override("separation", 3)
			panel.add_child(vbox)
			var title = Label.new()
			if unlocked:
				title.text = "%s %s" % [achievement.get("emoji", "🏆"), achievement.get("name", "Trophy")]
			else:
				title.text = "🔒 Locked Trophy"
			vbox.add_child(title)
			var desc = Label.new()
			if unlocked:
				desc.text = achievement.get("description", "")
			else:
				desc.text = achievement.get("hint", achievement.get("description", ""))
			desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
			desc.add_theme_font_size_override("font_size", 10)
			desc.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
			vbox.add_child(desc)
			if unlocked and GameState.achievement_unlocks.has(ach_id):
				var when := Label.new()
				when.text = "Unlocked %s" % _format_discovered_at(int(GameState.achievement_unlocks[ach_id]))
				when.add_theme_font_size_override("font_size", 9)
				when.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
				vbox.add_child(when)
			cabinet_grid.add_child(panel)
