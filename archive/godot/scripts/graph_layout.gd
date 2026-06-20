extends RefCounted
class_name GraphLayout

const NODE_W := 108.0
const NODE_H := 72.0
const GAP_X := 20.0
const GAP_Y := 110.0
const PADDING := 48.0


static func build_edges() -> Array:
	var edges: Array = []
	for transition in Database.transitions:
		var kind = str(transition.get("kind", ""))
		if kind == "technique":
			var input_id = str(transition.get("input", ""))
			for output_id in transition.get("outputs", []):
				edges.append({"from": input_id, "to": str(output_id), "kind": "technique"})
		elif kind == "combine":
			var outputs: Array = transition.get("outputs", [])
			if outputs.is_empty():
				continue
			var output_id = str(outputs[0])
			for input_id in transition.get("inputs", []):
				edges.append({"from": str(input_id), "to": output_id, "kind": "combine"})
	return edges


static func _collect_ingredient_ids(edges: Array) -> Array:
	var ids: Dictionary = {}
	for starter in Database.starters:
		var id = starter.get("id", "")
		if id:
			ids[id] = true
	for id in Database.discoverable_items.keys():
		ids[id] = true
	for edge in edges:
		ids[edge.from] = true
		ids[edge.to] = true
	return ids.keys()


static func _graph_transitions() -> Array:
	var rows: Array = []
	for transition in Database.transitions:
		var kind = str(transition.get("kind", ""))
		if kind == "technique":
			var input_id = str(transition.get("input", ""))
			for output_id in transition.get("outputs", []):
				rows.append({
					"inputs": [input_id],
					"output": str(output_id),
					"kind": "technique",
					"tools": transition.get("tools", [])
				})
		elif kind == "combine":
			var outputs: Array = transition.get("outputs", [])
			if outputs.is_empty():
				continue
			var inputs: Array = []
			for input_id in transition.get("inputs", []):
				inputs.append(str(input_id))
			inputs.sort()
			rows.append({"inputs": inputs, "output": str(outputs[0]), "kind": "combine", "tools": []})
	return rows


static func _compute_depths(ingredient_ids: Array, transitions: Array) -> Dictionary:
	var depths: Dictionary = {}
	for starter in Database.starters:
		var id = starter.get("id", "")
		if id:
			depths[id] = 0

	var changed := true
	var guard := 0
	while changed and guard < ingredient_ids.size() + 5:
		changed = false
		guard += 1
		for transition in transitions:
			var parent_depths: Array = []
			for input_id in transition.inputs:
				if depths.has(input_id):
					parent_depths.append(depths[input_id])
			if parent_depths.size() != transition.inputs.size():
				continue
			var next_depth: int = int(parent_depths.max()) + 1
			var output_id: String = transition.output
			if not depths.has(output_id) or depths[output_id] < next_depth:
				depths[output_id] = next_depth
				changed = true

	for id in ingredient_ids:
		if not depths.has(id):
			depths[id] = 1
	return depths


static func _item_name(id: String) -> String:
	if Database.discoverable_items.has(id):
		return str(Database.discoverable_items[id].get("name", id))
	for starter in Database.starters:
		if starter.get("id", "") == id:
			return str(starter.get("name", id))
	return id


static func _row_label(depth: int, min_depth: int, focus_id: String = "") -> String:
	if focus_id != "":
		if depth < 0:
			return "Sources"
		if depth == 0:
			return "Focused ingredient"
		if depth == 1:
			return "Direct results"
		return "Further results (tier %d)" % depth
	if depth == 0:
		return "Starting ingredients"
	if depth == 1:
		return "First transformations"
	return "Tier %d" % (depth - min_depth + 1)


static func _layout_from_depths(ingredient_ids: Array, depths: Dictionary, edges: Array, focus_id: String = "") -> Dictionary:
	var layers: Dictionary = {}
	for id in ingredient_ids:
		var depth: int = depths.get(id, 1)
		if not layers.has(depth):
			layers[depth] = []
		layers[depth].append(id)

	var sorted_depths: Array = layers.keys()
	sorted_depths.sort()
	var min_depth: int = sorted_depths[0] if sorted_depths.size() > 0 else 0

	var positions: Dictionary = {}
	var row_labels: Dictionary = {}
	var max_width := 0.0
	var max_height := PADDING

	for depth in sorted_depths:
		var row: Array = layers[depth]
		row.sort_custom(func(a, b): return _item_name(a) < _item_name(b))
		var row_width := row.size() * NODE_W + max(0, row.size() - 1) * GAP_X
		max_width = max(max_width, row_width)
		var row_y := PADDING + (depth - min_depth) * GAP_Y
		row_labels[depth] = {"text": _row_label(depth, min_depth, focus_id), "y": row_y - 18.0}
		var row_start_x := PADDING
		for index in range(row.size()):
			var node_id: String = row[index]
			positions[node_id] = Vector2(row_start_x + index * (NODE_W + GAP_X), row_y)
		max_height = max(max_height, row_y + NODE_H)

	var size := Vector2(max(max_width + PADDING * 2.0, 720.0), max(max_height + PADDING, 420.0))
	return {
		"positions": positions,
		"edges": edges,
		"depths": depths,
		"row_labels": row_labels,
		"sorted_depths": sorted_depths,
		"size": size,
		"ingredient_ids": ingredient_ids
	}


static func _collect_ancestor_ids(node_id: String, transitions: Array, max_depth: int) -> Dictionary:
	var ancestors: Dictionary = {}
	var seen: Dictionary = {node_id: true}
	var frontier: Array = [node_id]
	var depth := 0
	while frontier.size() > 0 and depth < max_depth:
		var next: Array = []
		for current in frontier:
			for transition in transitions:
				if transition.output != current:
					continue
				for input_id in transition.inputs:
					if seen.has(input_id):
						continue
					seen[input_id] = true
					ancestors[input_id] = true
					next.append(input_id)
		frontier = next
		depth += 1
	return ancestors


static func _collect_descendant_ids(node_id: String, transitions: Array, max_depth: int) -> Dictionary:
	var descendants: Dictionary = {}
	var seen: Dictionary = {node_id: true}
	var frontier: Array = [node_id]
	var depth := 0
	while frontier.size() > 0 and depth < max_depth:
		var next: Array = []
		for current in frontier:
			for transition in transitions:
				var includes_current := false
				for input_id in transition.inputs:
					if input_id == current:
						includes_current = true
						break
				if not includes_current:
					continue
				var output_id: String = transition.output
				if seen.has(output_id):
					continue
				seen[output_id] = true
				descendants[output_id] = true
				next.append(output_id)
		frontier = next
		depth += 1
	return descendants


static func _filter_ids_by_focus(all_ids: Array, transitions: Array, focus_id: String, max_depth: int) -> Array:
	if focus_id.is_empty():
		return all_ids
	var focused: Dictionary = {focus_id: true}
	if max_depth >= 0:
		for id in _collect_ancestor_ids(focus_id, transitions, max_depth).keys():
			focused[id] = true
		for id in _collect_descendant_ids(focus_id, transitions, max_depth).keys():
			focused[id] = true
	var result: Array = []
	for id in all_ids:
		if focused.has(id):
			result.append(id)
	return result


static func _filter_transitions_by_ingredients(transitions: Array, ingredient_ids: Array) -> Array:
	var allowed: Dictionary = {}
	for id in ingredient_ids:
		allowed[id] = true
	var filtered: Array = []
	for transition in transitions:
		if not allowed.has(transition.output):
			continue
		var ok := true
		for input_id in transition.inputs:
			if not allowed.has(input_id):
				ok = false
				break
		if ok:
			filtered.append(transition)
	return filtered


static func _compute_depths_from_focus(focus_id: String, ingredient_ids: Array, transitions: Array) -> Dictionary:
	var depths: Dictionary = {focus_id: 0}
	var visit_up: Array = [focus_id]
	var seen_up: Dictionary = {focus_id: true}
	while visit_up.size() > 0:
		var current: String = visit_up.pop_front()
		var current_depth: int = depths[current]
		for transition in transitions:
			if transition.output != current:
				continue
			for input_id in transition.inputs:
				if not ingredient_ids.has(input_id):
					continue
				var next_depth: int = current_depth - 1
				if not depths.has(input_id) or depths[input_id] > next_depth:
					depths[input_id] = next_depth
				if not seen_up.has(input_id):
					seen_up[input_id] = true
					visit_up.append(input_id)

	var changed := true
	var guard := 0
	while changed and guard < ingredient_ids.size() + 5:
		changed = false
		guard += 1
		for transition in transitions:
			if not ingredient_ids.has(transition.output):
				continue
			var parent_depths: Array = []
			for input_id in transition.inputs:
				if depths.has(input_id):
					parent_depths.append(depths[input_id])
			if parent_depths.size() != transition.inputs.size():
				continue
			var next_depth: int = int(parent_depths.max()) + 1
			var output_id: String = transition.output
			if not depths.has(output_id) or depths[output_id] < next_depth:
				depths[output_id] = next_depth
				changed = true

	for id in ingredient_ids:
		if not depths.has(id):
			depths[id] = 0
	return depths


static func build_layout(show_hidden: bool) -> Dictionary:
	var edges := build_edges()
	var transitions := _graph_transitions()
	var ingredient_ids := _collect_ingredient_ids(edges)
	var depths := _compute_depths(ingredient_ids, transitions)
	var layout := _layout_from_depths(ingredient_ids, depths, edges)
	layout["visible_ids"] = _visible_ids(layout.positions, show_hidden)
	layout["transitions"] = _filter_transitions_by_ingredients(transitions, ingredient_ids)
	return layout


static func build_focus_layout(focus_id: String, show_hidden: bool, max_depth: int = 2) -> Dictionary:
	if focus_id.is_empty():
		return build_layout(show_hidden)
	var edges := build_edges()
	var transitions := _graph_transitions()
	var all_ids := _collect_ingredient_ids(edges)
	var depth_limit := max_depth if max_depth >= 0 else 9999
	var ingredient_ids := _filter_ids_by_focus(all_ids, transitions, focus_id, depth_limit)
	var filtered_transitions := _filter_transitions_by_ingredients(transitions, ingredient_ids)
	var filtered_edges: Array = []
	for edge in edges:
		if ingredient_ids.has(edge.from) and ingredient_ids.has(edge.to):
			filtered_edges.append(edge)
	var depths := _compute_depths_from_focus(focus_id, ingredient_ids, filtered_transitions)
	var layout := _layout_from_depths(ingredient_ids, depths, filtered_edges, focus_id)
	layout["visible_ids"] = _visible_ids(layout.positions, show_hidden)
	layout["focus_id"] = focus_id
	layout["transitions"] = filtered_transitions
	return layout


static func _visible_ids(positions: Dictionary, show_hidden: bool) -> Array:
	var visible_ids: Array = []
	for id in positions.keys():
		if GameState.is_discovered(id) or show_hidden:
			visible_ids.append(id)
		elif GameState.is_pantry_available(id) and not GameState.is_starter(id):
			visible_ids.append(id)
	return visible_ids


static func _tool_for_edge(edge: Dictionary) -> String:
	for transition in Database.transitions:
		var kind = str(transition.get("kind", ""))
		if kind == "technique" and str(transition.get("input", "")) == edge.from:
			var outputs: Array = transition.get("outputs", [])
			if outputs.has(edge.to):
				var tools: Array = transition.get("tools", [])
				if tools.size() > 0:
					return str(tools[0])
	return "separate"


static func is_edge_discovered(from_id: String, to_id: String) -> bool:
	return GameState.is_discovered(from_id) and GameState.is_discovered(to_id)


static func get_known_paths(focus_id: String, show_hidden: bool, max_depth: int = 2) -> Array:
	var layout: Dictionary
	if focus_id != "":
		layout = build_focus_layout(focus_id, show_hidden, max_depth)
	else:
		layout = build_layout(show_hidden)

	var visible: Dictionary = {}
	for id in layout.get("visible_ids", []):
		visible[id] = true

	var transitions := _graph_transitions()
	if focus_id != "":
		transitions = _filter_transitions_by_ingredients(transitions, layout.get("ingredient_ids", []))

	var paths: Array = []
	for transition in transitions:
		if not _transition_discovered(transition):
			continue
		var all_visible := true
		for input_id in transition.inputs:
			if not visible.has(input_id):
				all_visible = false
				break
		if not visible.has(transition.output):
			all_visible = false
		if not all_visible:
			continue
		paths.append(format_transition_path(transition))

	paths.sort_custom(func(a, b): return str(a.get("to", "")) < str(b.get("to", "")))
	return paths


static func _transition_discovered(transition: Dictionary) -> bool:
	if not GameState.is_discovered(transition.output):
		return false
	for input_id in transition.inputs:
		if not GameState.is_discovered(input_id):
			return false
	return true


static func format_transition_path(transition: Dictionary) -> Dictionary:
	var from_parts: Array = []
	for input_id in transition.inputs:
		from_parts.append(_display_label(str(input_id)))
	var to_label := _display_label(transition.output)
	if transition.get("kind", "") == "combine":
		return {
			"from": " + ".join(from_parts),
			"via": "🥣 Combine",
			"to": to_label,
			"kind": "combine"
		}
	var tool := _tool_for_transition(transition)
	return {
		"from": from_parts[0] if from_parts.size() == 1 else ", ".join(from_parts),
		"via": "%s %s" % [_tool_emoji(tool), _tool_name(tool)],
		"to": to_label,
		"kind": "technique"
	}


static func _display_label(id: String) -> String:
	var item := _item_dict(id)
	return "%s %s" % [item.get("emoji", "❓"), item.get("name", id)]


static func _item_dict(id: String) -> Dictionary:
	var item := Database.get_item(id)
	if item.is_empty():
		return {"id": id, "name": id, "emoji": "❓"}
	return item


static func _tool_for_transition(transition: Dictionary) -> String:
	var tools: Array = transition.get("tools", [])
	if tools.size() > 0:
		return str(tools[0])
	return "separate"


static func _tool_name(tool_id: String) -> String:
	var skill := TechniqueTools.get_skill_definition(tool_id)
	if not skill.is_empty():
		return str(skill.get("name", tool_id))
	return tool_id.replace("_", " ").capitalize()


static func _tool_emoji(tool_id: String) -> String:
	var skill := TechniqueTools.get_skill_definition(tool_id)
	if not skill.is_empty():
		return str(skill.get("emoji", "⚗️"))
	return "⚗️"
