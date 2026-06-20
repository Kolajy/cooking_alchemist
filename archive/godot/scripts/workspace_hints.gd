extends RefCounted
class_name WorkspaceHints

const FRUIT_TRIGGERS := ["strawberry", "raspberry", "blueberry", "blackberry", "smashed_berries"]
const TUBER_TRIGGERS := ["carrot", "ginger", "beet", "radish", "turnip"]


static func get_failure_hint(tokens: Array) -> String:
	if tokens.is_empty():
		return "Try a different action or ingredient from the pantry."

	var action := GameState.active_action
	if action == "combine":
		return _combine_hint(tokens)
	if action == "separate":
		return _separate_hint(tokens)
	if action in ["force", "heat", "time"]:
		return _technique_hint(tokens, action)
	return "Try a different action or ingredient from the pantry."


static func _item_label(id: String) -> String:
	var item := Database.get_item(id)
	if item.is_empty():
		return id
	return "%s %s" % [item.get("emoji", "❓"), item.get("name", id)]


static func _separate_hint(tokens: Array) -> String:
	for token in tokens:
		var item := Database.get_item(token.item_id)
		if str(item.get("origin", "")) == "primitive":
			return "Click Separate on %s to pull out a raw ingredient." % _item_label(token.item_id)
	return "Separate works on primal pantry items like Berries or Tubers."


static func _combine_hint(tokens: Array) -> String:
	var ids: Array = []
	for token in tokens:
		ids.append(token.item_id)
	for i in range(ids.size()):
		for j in range(i + 1, ids.size()):
			if _combine_result([ids[i], ids[j]]) != "":
				return "Drag %s onto %s to combine them." % [_item_label(ids[i]), _item_label(ids[j])]
	if ids.size() >= 2:
		return "Those ingredients don't combine — prepare them with Separate or Force first."
	return "Pick two ingredients that share a recipe — check the Progress Map."


static func _technique_hint(tokens: Array, action: String) -> String:
	var skill_id := _active_skill_id(action)
	for token in tokens:
		if _technique_matches(token.item_id, action):
			return "Click %s on the highlighted ingredient." % _skill_label(skill_id)
	for token in tokens:
		var hint := _technique_failure_hint(token.item_id, skill_id)
		if hint != "":
			return hint
	return "Try a different action or ingredient from the pantry."


static func _active_skill_id(action: String) -> String:
	if GameState.active_skill_id != "":
		return GameState.active_skill_id
	match action:
		"force":
			return "smash"
		"heat":
			return "char"
		"time":
			return "rest"
	return action


static func _skill_label(skill_id: String) -> String:
	var skill := TechniqueTools.get_skill_definition(skill_id)
	if not skill.is_empty():
		return "%s %s" % [skill.get("emoji", "✨"), skill.get("name", skill_id)]
	return skill_id.capitalize()


static func _technique_matches(input_id: String, _action: String) -> bool:
	for transition in Database.transitions:
		if transition.get("kind") != "technique" or transition.get("input") != input_id:
			continue
		if TechniqueTools.transition_matches(transition):
			return true
	return false


static func _technique_failure_hint(input_id: String, skill_id: String) -> String:
	var item := Database.get_item(input_id)
	var origin := str(item.get("origin", ""))
	if origin == "primitive" and skill_id != "separate":
		return "%s is still primal — Separate it first." % _item_label(input_id)
	return ""


static func _combine_result(inputs: Array) -> String:
	var sorted_inputs: Array = inputs.duplicate()
	sorted_inputs.sort()
	var input_key := ",".join(sorted_inputs)
	for transition in Database.transitions:
		if transition.get("kind") != "combine":
			continue
		var t_inputs: Array = transition.get("inputs", []).duplicate()
		t_inputs.sort()
		if ",".join(t_inputs) == input_key:
			var outputs: Array = transition.get("outputs", [])
			if outputs.size() > 0:
				return str(outputs[0])
	return ""
