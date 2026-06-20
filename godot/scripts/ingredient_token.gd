extends Area2D

var item_id: String = ""
var dragging: bool = false
var velocity: Vector2 = Vector2.ZERO
var target_position: Vector2 = Vector2.ZERO
var grab_offset: Vector2 = Vector2.ZERO

@onready var label: Label = $Label
@onready var sprite: Sprite2D = $Sprite2D
@onready var highlight: Panel = $Highlight

# Spring config
const SPRING_SPEED: float = 22.0
const ROTATION_CLAMP: float = 0.28
const VELOCITY_TILT: float = 0.0018

func _ready():
	target_position = global_position
	# Disable highlights initially
	if highlight:
		highlight.visible = false

func setup(id: String):
	item_id = id
	var data = Database.discoverable_items.get(id)
	if not data:
		# Check starters
		for starter in Database.starters:
			if starter.get("id") == id:
				data = starter
				break
				
	if data:
		var name = data.get("name", id)
		var emoji = data.get("emoji", "❓")
		if label:
			label.text = emoji + "\n" + name
		name = id
	else:
		if label:
			label.text = id

func _process(delta: float):
	if dragging:
		target_position = get_global_mouse_position() - grab_offset
		
	# Apply spring-lag interpolation
	var prev_pos = global_position
	global_position = global_position.lerp(target_position, SPRING_SPEED * delta)
	
	# Calculate drag velocity and sways
	velocity = (global_position - prev_pos) / delta
	
	# Rotate token based on velocity
	var target_rotation = velocity.x * VELOCITY_TILT
	target_rotation = clamp(target_rotation, -ROTATION_CLAMP, ROTATION_CLAMP)
	rotation = lerp(rotation, target_rotation, 15.0 * delta)

func _input_event(viewport: Viewport, event: InputEvent, shape_idx: int):
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		if event.pressed:
			dragging = true
			grab_offset = get_global_mouse_position() - global_position
			get_viewport().set_input_as_handled()

func _input(event: InputEvent):
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		if not event.pressed and dragging:
			dragging = false
			# Resolve workspace grandparent safely
			var ws = get_parent()
			while ws and not ws.has_method("on_token_released"):
				ws = ws.get_parent()
			if ws:
				ws.on_token_released(self)

func set_highlight_visible(is_visible: bool, type: String = "valid"):
	if not highlight:
		return
	highlight.visible = is_visible
	# Adjust border colors based on highlight type
	var style = highlight.get_theme_stylebox("panel") as StyleBoxFlat
	if style:
		if type == "valid": # Sage/Green for technique target
			style.border_color = Color("4b7055", 0.8)
		elif type == "combine": # Gold for combination match
			style.border_color = Color("c08a3e", 0.8)
		elif type == "hover": # Glowing gold for merge collision
			style.border_color = Color("e5a93b", 1.0)
