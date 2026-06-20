extends RefCounted
class_name AchievementEngine


static func check_pending(ctx: Dictionary, rules: Dictionary, achievements: Array) -> Array:
	var pending: Array = []
	var unlocked: Dictionary = ctx.get("unlocked_achievements", {})
	for achievement in achievements:
		var id = str(achievement.get("id", ""))
		if id.is_empty() or unlocked.has(id):
			continue
		var rule: Dictionary = rules.get(id, {})
		if rule.is_empty():
			continue
		if evaluate_rule(rule, ctx):
			pending.append(id)
	return pending


static func evaluate_rule(rule: Dictionary, ctx: Dictionary) -> bool:
	match str(rule.get("type", "")):
		"raw_discoveries":
			return _count_raw_discoveries(ctx) >= int(rule.get("min", 0))
		"recipe_discoveries":
			return _count_recipe_discoveries(ctx) >= int(rule.get("min", 0))
		"non_primitive_discoveries":
			return _count_non_primitive_discoveries(ctx) >= int(rule.get("min", 0))
		"map_complete":
			var discoverable: Dictionary = ctx.get("discoverable", {})
			var total = discoverable.size()
			if total <= 0:
				return false
			return _count_discovered_in_discoverable(ctx) >= total
		"skill_unlocked":
			return _is_skill_unlocked(str(rule.get("skillId", "")), ctx)
		"action_unlocked":
			return TechniqueTools.is_player_action_unlocked(str(rule.get("actionId", "")))
		"total_xp":
			return _total_xp(ctx) >= int(rule.get("min", 0))
		"skill_xp":
			var skills: Dictionary = ctx.get("skills_xp", {})
			return int(skills.get(str(rule.get("skillId", "")), 0)) >= int(rule.get("min", 0))
		"flag":
			var flags: Dictionary = ctx.get("achievement_flags", {})
			return flags.has(str(rule.get("flag", "")))
		"journal_entries":
			return int(ctx.get("discovery_log_length", 0)) >= int(rule.get("min", 0))
	return false


static func is_earned(id: String, ctx: Dictionary, rules: Dictionary) -> bool:
	var unlocked: Dictionary = ctx.get("unlocked_achievements", {})
	if unlocked.has(id):
		return true
	return evaluate_rule(rules.get(id, {}), ctx)


static func _count_discovered_in_discoverable(ctx: Dictionary) -> int:
	var count := 0
	var discovered: Dictionary = ctx.get("discovered_ids", {})
	var discoverable: Dictionary = ctx.get("discoverable", {})
	for id in discovered.keys():
		if discoverable.has(id):
			count += 1
	return count


static func _count_raw_discoveries(ctx: Dictionary) -> int:
	var count := 0
	var discovered: Dictionary = ctx.get("discovered_ids", {})
	var discoverable: Dictionary = ctx.get("discoverable", {})
	for id in discovered.keys():
		var item: Dictionary = discoverable.get(id, {})
		if item.get("origin", "") == "raw":
			count += 1
	return count


static func _count_recipe_discoveries(ctx: Dictionary) -> int:
	var count := 0
	var discovered: Dictionary = ctx.get("discovered_ids", {})
	var discoverable: Dictionary = ctx.get("discoverable", {})
	for id in discovered.keys():
		if discoverable.get(id, {}).get("type", "") == "recipe":
			count += 1
	return count


static func _count_non_primitive_discoveries(ctx: Dictionary) -> int:
	var count := 0
	var discovered: Dictionary = ctx.get("discovered_ids", {})
	var primitive_ids: Dictionary = ctx.get("primitive_ids", {})
	var discoverable: Dictionary = ctx.get("discoverable", {})
	for id in discovered.keys():
		if primitive_ids.has(id):
			continue
		if discoverable.has(id):
			count += 1
	return count


static func _total_xp(ctx: Dictionary) -> int:
	var total := 0
	for value in ctx.get("skills_xp", {}).values():
		total += int(value)
	return total


static func _is_skill_unlocked(skill_id: String, _ctx: Dictionary) -> bool:
	return TechniqueTools.is_skill_unlocked_by_id(skill_id)
