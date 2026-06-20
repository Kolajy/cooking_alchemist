extends Node

func _ready():
	print("--- Culinary Alchemist: Launching Native Client ---")
	# Ensure Database is fully loaded
	if Database.discoverable_items.size() > 0:
		print("✅ Database verification passed.")
		print("   Total Discoverables: ", Database.discoverable_items.size())
		print("   Total Starters: ", Database.starters.size())
		print("   Total Transitions: ", Database.transitions.size())
		print("   Player Ledger Progress: ", GameState.get_restored_percentage(), "%")
		
		# Load workspace countertop
		var ws_scene = preload("res://scenes/workspace.tscn")
		if ws_scene:
			var ws = ws_scene.instantiate()
			add_child(ws)
			print("✅ Workspace countertop loaded.")
			
		# Load Pantry/Cabinet UI
		var ui_scene = preload("res://scenes/pantry_ui.tscn")
		if ui_scene:
			var ui = ui_scene.instantiate()
			add_child(ui)
			print("✅ Pantry UI loaded.")
			
		# Load Discovery Popup Overlay
		var popup_scene = preload("res://scenes/discovery_popup.tscn")
		if popup_scene:
			var popup = popup_scene.instantiate()
			add_child(popup)
			print("✅ Discovery Popup loaded.")
			
		# Load Ledger Book Overlay
		var book_scene = preload("res://scenes/ledger_book.tscn")
		if book_scene:
			var book = book_scene.instantiate()
			add_child(book)
			print("✅ Ledger Book loaded.")
			
		# Apply Cozy Theme to all generated nodes
		apply_cozy_theme(self)
		print("🎨 Applied cozy parchment theme to all UI elements.")
	else:
		print("❌ Database verification failed. No items loaded.")

func apply_cozy_theme(node: Node):
	var sb_panel = StyleBoxFlat.new()
	sb_panel.bg_color = Color(0.94, 0.92, 0.88, 0.98) # Warm parchment
	sb_panel.border_width_left = 2
	sb_panel.border_color = Color(0.78, 0.70, 0.62, 0.9)
	sb_panel.set_corner_radius_all(12)
	
	var sb_btn_normal = StyleBoxFlat.new()
	sb_btn_normal.bg_color = Color(0.90, 0.86, 0.80) # Sepia cream
	sb_btn_normal.border_width_left = 1
	sb_btn_normal.border_width_top = 1
	sb_btn_normal.border_width_right = 1
	sb_btn_normal.border_width_bottom = 1
	sb_btn_normal.border_color = Color(0.70, 0.62, 0.54)
	sb_btn_normal.set_corner_radius_all(8)
	
	var sb_btn_hover = StyleBoxFlat.new()
	sb_btn_hover.bg_color = Color(0.94, 0.90, 0.85)
	sb_btn_hover.border_width_left = 1
	sb_btn_hover.border_width_top = 1
	sb_btn_hover.border_width_right = 1
	sb_btn_hover.border_width_bottom = 1
	sb_btn_hover.border_color = Color(0.60, 0.50, 0.40)
	sb_btn_hover.set_corner_radius_all(8)
	
	var sb_btn_pressed = StyleBoxFlat.new()
	sb_btn_pressed.bg_color = Color(0.48, 0.30, 0.23) # Terracotta active
	sb_btn_pressed.border_width_left = 1
	sb_btn_pressed.border_width_top = 1
	sb_btn_pressed.border_width_right = 1
	sb_btn_pressed.border_width_bottom = 1
	sb_btn_pressed.border_color = Color(0.35, 0.22, 0.17)
	sb_btn_pressed.set_corner_radius_all(8)
	
	var sb_btn_focus = StyleBoxFlat.new()
	sb_btn_focus.bg_color = Color(0, 0, 0, 0)
	sb_btn_focus.border_width_left = 2
	sb_btn_focus.border_width_top = 2
	sb_btn_focus.border_width_right = 2
	sb_btn_focus.border_width_bottom = 2
	sb_btn_focus.border_color = Color(0.78, 0.60, 0.32, 0.5) # Golden focus ring
	sb_btn_focus.set_corner_radius_all(8)
	
	_apply_styles_recursive(node, sb_panel, sb_btn_normal, sb_btn_hover, sb_btn_pressed, sb_btn_focus)

func _apply_styles_recursive(node: Node, sb_panel: StyleBox, sb_btn_normal: StyleBox, sb_btn_hover: StyleBox, sb_btn_pressed: StyleBox, sb_btn_focus: StyleBox):
	if node is Panel and node.name != "Highlight":
		node.add_theme_stylebox_override("panel", sb_panel)
	
	if node is Button:
		node.add_theme_stylebox_override("normal", sb_btn_normal)
		node.add_theme_stylebox_override("hover", sb_btn_hover)
		node.add_theme_stylebox_override("pressed", sb_btn_pressed)
		node.add_theme_stylebox_override("focus", sb_btn_focus)
		node.add_theme_color_override("font_color", Color(0.25, 0.20, 0.18))
		node.add_theme_color_override("font_hover_color", Color(0.20, 0.15, 0.12))
		node.add_theme_color_override("font_pressed_color", Color(0.99, 0.98, 0.96))
		
	if node is Label:
		if not "Restored" in node.text:
			node.add_theme_color_override("font_color", Color(0.25, 0.20, 0.18))
			
	for child in node.get_children():
		_apply_styles_recursive(child, sb_panel, sb_btn_normal, sb_btn_hover, sb_btn_pressed, sb_btn_focus)
