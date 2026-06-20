extends Control

signal item_clicked(id: String)

var item_id: String = ""

@onready var btn: Button = $Btn

func setup(id: String, emoji: String, name: String):
	item_id = id
	if btn:
		btn.text = emoji + " " + name

func _on_btn_pressed():
	emit_signal("item_clicked", item_id)
