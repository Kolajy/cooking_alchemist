extends Control

@onready var kicker_label = $Card/VBoxContainer/Header
@onready var modal_title_label = $Card/VBoxContainer/ModalTitle
@onready var item_box = $Card/VBoxContainer/ItemBox
@onready var item_emoji_label = $Card/VBoxContainer/ItemBox/HBox/ItemEmoji
@onready var item_name_label = $Card/VBoxContainer/ItemBox/HBox/ItemName
@onready var desc_label = $Card/VBoxContainer/Description
@onready var tip_panel = $Card/VBoxContainer/TipPanel
@onready var tip_heading = $Card/VBoxContainer/TipPanel/TipInner/TipHeading
@onready var tip_label = $Card/VBoxContainer/TipPanel/TipInner/ScienceTip
@onready var exp_panel = $Card/VBoxContainer/ExpPanel
@onready var exp_skill_label = $Card/VBoxContainer/ExpPanel/ExpInner/ExpHeader/ExpSkillLabel
@onready var exp_gain_label = $Card/VBoxContainer/ExpPanel/ExpInner/ExpHeader/ExpGainLabel
@onready var exp_bar = $Card/VBoxContainer/ExpPanel/ExpInner/ExpBar
@onready var exp_detail_label = $Card/VBoxContainer/ExpPanel/ExpInner/ExpDetailLabel
@onready var ok_button = $Card/VBoxContainer/BtnClose
@onready var card = $Card
@onready var backdrop = $Backdrop
@onready var glow = $Glow
@onready var sparkles = $Card/Sparkles

var showing: bool = false


func _ready() -> void:
	visible = false
	GameState.connect("discovery_queued", Callable(self, "_on_discovery_queued"))
	GameState.connect("mechanic_queued", Callable(self, "_on_mechanic_queued"))
	GameState.connect("achievement_queued", Callable(self, "_on_achievement_queued"))
	ok_button.pressed.connect(_dismiss_popup)
	if backdrop:
		backdrop.gui_input.connect(_on_backdrop_input)
	call_deferred("_apply_modal_chrome")


func _apply_modal_chrome() -> void:
	if backdrop:
		backdrop.add_theme_stylebox_override("panel", CozyTheme.make_modal_backdrop())
	if card:
		card.add_theme_stylebox_override("panel", CozyTheme.make_discovery_modal_card())
	if item_box:
		item_box.add_theme_stylebox_override("panel", CozyTheme.make_discovery_item_box())
	if exp_panel:
		exp_panel.add_theme_stylebox_override("panel", CozyTheme.make_discovery_exp_panel())
	if tip_panel:
		tip_panel.add_theme_stylebox_override("panel", CozyTheme.make_discovery_tip_block())
	if kicker_label:
		kicker_label.add_theme_font_override("font", CozyTheme.get_body_font())
	if modal_title_label:
		modal_title_label.add_theme_font_override("font", CozyTheme.get_display_font())
	if item_name_label:
		item_name_label.add_theme_font_override("font", CozyTheme.get_display_font())
	if tip_heading:
		tip_heading.add_theme_font_override("font", CozyTheme.get_body_font())
	if tip_label:
		tip_label.add_theme_font_override("font", CozyTheme.get_body_font())
		tip_label.add_theme_color_override("font_color", CozyTheme.SCROLL_INK_MUTED)
	if exp_bar:
		exp_bar.add_theme_stylebox_override(
			"fill",
			CozyTheme.make_flat_panel(Color(0.733, 0.451, 0.282, 0.95), Color(0.671, 0.439, 0.282), 4, 0)
		)
		exp_bar.add_theme_stylebox_override(
			"background",
			CozyTheme.make_flat_panel(Color(0.941, 0.902, 0.867, 0.7), CozyTheme.SCROLL_COPPER, 4, 1)
		)
	if exp_gain_label:
		exp_gain_label.add_theme_stylebox_override("normal", CozyTheme.make_exp_gain_pill())
	CozyTheme.apply_primary_cta(ok_button)


func _on_discovery_queued(_id: String) -> void:
	if not showing:
		_show_next()


func _on_mechanic_queued() -> void:
	if not showing:
		_show_next()


func _on_achievement_queued() -> void:
	if not showing:
		_show_next()


func _show_next() -> void:
	if not GameState.discovery_queue.is_empty():
		_show_ingredient_popup()
		return
	if not GameState.mechanic_queue.is_empty():
		_show_mechanic_popup()
		return
	if not GameState.achievement_queue.is_empty():
		_show_achievement_popup()
		return
	showing = false
	visible = false


func _show_ingredient_popup() -> void:
	var id = GameState.pop_discovery_queue()
	if id.is_empty():
		call_deferred("_show_next")
		return

	var data = Database.discoverable_items.get(id)
	if not data:
		call_deferred("_show_next")
		return

	showing = true
	var is_recipe := str(data.get("type", "")) == "recipe"
	var remaining := GameState.discovery_queue.size()
	if is_recipe:
		SoundManager.play_sfx("recipe_complete")
		kicker_label.text = "ANOTHER DISCOVERY!" if remaining > 0 else "RECIPE RESTORED!"
		modal_title_label.text = "Recipe Restored to the Ledger" if remaining == 0 else "Another Recipe Found"
	else:
		SoundManager.play_sfx("discovery")
		kicker_label.text = "ANOTHER DISCOVERY!" if remaining > 0 else "NEW INGREDIENT!"
		modal_title_label.text = "New Ingredient Discovered"
	if remaining > 0:
		modal_title_label.text += " (%d more)" % remaining

	var item_name = str(data.get("name", id))
	var emoji = str(data.get("emoji", "❓"))
	item_emoji_label.text = emoji
	item_name_label.text = item_name
	desc_label.text = str(data.get("description", ""))

	var tip := _find_tip_for(id)
	var blurb := str(data.get("blurb", ""))
	if tip != "":
		tip_heading.text = "📜 Did You Know?"
		tip_label.text = tip
		tip_panel.visible = true
	elif blurb != "":
		tip_heading.text = "📜 From the Ledger"
		tip_label.text = blurb
		tip_panel.visible = true
	else:
		tip_panel.visible = false

	_update_exp_panel()
	ok_button.text = "Cook Onwards!"
	_present_card()


func _show_mechanic_popup() -> void:
	var entry: Dictionary = GameState.pop_mechanic_queue()
	if entry.is_empty():
		call_deferred("_show_next")
		return

	showing = true
	SoundManager.play_sfx("unlock")
	var is_subaction := bool(entry.get("is_subaction", false))
	kicker_label.text = "NEW COOKING TECHNIQUE!"
	modal_title_label.text = "Technique Unlocked" if is_subaction else "Action Unlocked"
	item_emoji_label.text = str(entry.get("emoji", "✨"))
	item_name_label.text = str(entry.get("name", "Technique"))
	desc_label.text = str(entry.get("desc", ""))
	tip_panel.visible = false
	_hide_exp_panel()
	ok_button.text = "Begin Using!"
	_present_card()


func _show_achievement_popup() -> void:
	var def: Dictionary = GameState.pop_achievement_queue()
	if def.is_empty():
		call_deferred("_show_next")
		return

	showing = true
	SoundManager.play_sfx("level_up")
	kicker_label.text = "TROPHY EARNED!"
	modal_title_label.text = "Achievement Unlocked"
	item_emoji_label.text = str(def.get("emoji", "🏆"))
	item_name_label.text = str(def.get("name", "Achievement"))
	desc_label.text = str(def.get("description", ""))
	tip_panel.visible = false
	_hide_exp_panel()
	ok_button.text = "Continue"
	_present_card()


func _update_exp_panel() -> void:
	var skill_id := _active_skill_id_for_xp()
	if skill_id.is_empty():
		_hide_exp_panel()
		return

	var xp := int(GameState.skills_xp.get(skill_id, 0))
	var current := xp % 10
	exp_skill_label.text = _skill_label_for(skill_id)
	exp_gain_label.text = "+1 EXP"
	exp_bar.value = float(current)
	exp_detail_label.text = "%d / 10 exp" % current
	exp_panel.visible = true


func _hide_exp_panel() -> void:
	if exp_panel:
		exp_panel.visible = false


func _active_skill_id_for_xp() -> String:
	if GameState.active_action == "combine":
		return "combine"
	if GameState.active_skill_id != "":
		return GameState.active_skill_id
	match GameState.active_action:
		"separate":
			return "separate"
		"force":
			return "smash"
		"heat":
			return "char"
		"time":
			return "rest"
	return ""


func _skill_label_for(skill_id: String) -> String:
	var skill := TechniqueTools.get_skill_definition(skill_id)
	if not skill.is_empty():
		return "%s %s" % [skill.get("emoji", "✨"), skill.get("name", skill_id)]
	var defaults := {
		"separate": "🔪 Separate",
		"combine": "🥣 Combine",
		"smash": "✊ Force",
		"heat": "🍳 Heat",
		"time": "⏳ Time"
	}
	return defaults.get(skill_id, skill_id.capitalize())


func _present_card() -> void:
	visible = true
	_play_celebration_fx()
	if GameState.reduced_motion:
		card.scale = Vector2.ONE
		_reset_reveal_nodes()
	else:
		card.scale = Vector2(0.82, 0.82)
		card.modulate.a = 0.0
		_prepare_reveal_nodes()
		var tween = create_tween()
		tween.set_parallel(true)
		tween.tween_property(card, "scale", Vector2.ONE, 0.55).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
		tween.tween_property(card, "modulate:a", 1.0, 0.45)
		tween.chain().tween_callback(_play_content_reveal)


func _reveal_targets() -> Array:
	return [
		kicker_label,
		modal_title_label,
		item_box,
		desc_label,
		exp_panel if exp_panel and exp_panel.visible else null,
		tip_panel if tip_panel and tip_panel.visible else null,
		ok_button
	]


func _prepare_reveal_nodes() -> void:
	for node in _reveal_targets():
		if node == null:
			continue
		node.modulate.a = 0.0


func _reset_reveal_nodes() -> void:
	for node in _reveal_targets():
		if node == null:
			continue
		node.modulate.a = 1.0


func _play_content_reveal() -> void:
	if GameState.reduced_motion:
		_reset_reveal_nodes()
		return
	var delay := 0.08
	for node in _reveal_targets():
		if node == null:
			continue
		var tween := create_tween()
		tween.tween_interval(delay)
		tween.tween_property(node, "modulate:a", 1.0, 0.4).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
		delay += 0.07


func _play_celebration_fx() -> void:
	if sparkles and sparkles.has_method("burst"):
		sparkles.burst()
	if glow == null or GameState.reduced_motion:
		return
	glow.color = Color(CozyTheme.SCROLL_GOLD, 0.0)
	var tween := create_tween()
	tween.tween_property(glow, "color", Color(CozyTheme.SCROLL_GOLD, 0.22), 0.35)
	tween.tween_property(glow, "color", Color(CozyTheme.SCROLL_GOLD, 0.0), 0.85)


func _find_tip_for(id: String) -> String:
	for t in Database.transitions:
		if t.get("outputs", []).has(id):
			var tip = t.get("tip", "")
			if tip != "":
				return tip
	return ""


func _dismiss_popup() -> void:
	SoundManager.play_sfx("ui_select")
	if GameState.reduced_motion:
		_finish_dismiss()
		return
	var tween = create_tween()
	tween.tween_property(card, "scale", Vector2(0.85, 0.85), 0.2).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_IN)
	tween.parallel().tween_property(card, "modulate:a", 0.0, 0.2)
	tween.tween_callback(_finish_dismiss)


func _finish_dismiss() -> void:
	showing = false
	call_deferred("_show_next")


func _on_backdrop_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		_dismiss_popup()
