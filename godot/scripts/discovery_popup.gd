extends Control

@onready var title_label = $Card/VBoxContainer/Title
@onready var desc_label = $Card/VBoxContainer/Description
@onready var tip_label = $Card/VBoxContainer/ScienceTip
@onready var card = $Card

func _ready():
	visible = false
	GameState.connect("discovery_changed", Callable(self, "_on_discovery_changed"))
	
	# Connect close button
	$Card/VBoxContainer/BtnClose.pressed.connect(hide_popup)

func _on_discovery_changed():
	var highlights = GameState.recent_highlight_ids.keys()
	if highlights.size() > 0:
		var newest_id = highlights[highlights.size() - 1]
		show_discovery(newest_id)
		# Clear the highlight tracking once viewed
		GameState.recent_highlight_ids.clear()

func show_discovery(id: String):
	SoundManager.play_sfx("discovery")
	var data = Database.discoverable_items.get(id)
	if not data:
		return
		
	var name = data.get("name", id)
	var emoji = data.get("emoji", "❓")
	var desc = data.get("description", "")
	var blurb = data.get("blurb", "")
	
	# Build content markup
	title_label.text = emoji + " " + name + " " + emoji
	desc_label.text = desc + "\n\n" + blurb
	
	# Fetch science tip if available in transition tip
	var tip = ""
	for t in Database.transitions:
		if t.get("outputs", []).has(id):
			tip = t.get("tip", "")
			if tip != "":
				break
				
	if tip != "":
		tip_label.text = "Science Tip: " + tip
		tip_label.visible = true
	else:
		tip_label.visible = false
		
	# Scale animation
	visible = true
	card.scale = Vector2(0.3, 0.3)
	var tween = create_tween()
	tween.tween_property(card, "scale", Vector2(1.0, 1.0), 0.35).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

func hide_popup():
	SoundManager.play_sfx("ui_select")
	var tween = create_tween()
	tween.tween_property(card, "scale", Vector2(0.2, 0.2), 0.25).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_IN)
	tween.tween_callback(self.set.bind("visible", false))
