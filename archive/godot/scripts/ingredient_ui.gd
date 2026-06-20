extends RefCounted
class_name IngredientUI

const STATE_LABELS := {
	"primal": "Primal",
	"raw": "Raw",
	"prepared": "Prepared",
	"recipe": "Recipe"
}


static func state_key(item: Dictionary, id: String = "") -> String:
	if str(item.get("type", "")) == "recipe" and (id.is_empty() or GameState.is_discovered(id)):
		return "recipe"
	match str(item.get("origin", "")):
		"primitive":
			return "primal"
		"raw":
			return "raw"
		"processed":
			return "prepared"
	if not id.is_empty() and GameState.is_discovered(id):
		return "prepared"
	return "primal"


static func state_label(state: String) -> String:
	return STATE_LABELS.get(state, "Ingredient")


static func badge_color(state: String) -> Color:
	match state:
		"primal":
			return Color(0.545, 0.439, 0.780, 0.92)
		"raw":
			return Color(0.545, 0.439, 0.345, 0.85)
		"prepared":
			return Color(0.780, 0.600, 0.322, 0.9)
		"recipe":
			return Color(0.831, 0.376, 0.318, 0.9)
	return CozyTheme.SCROLL_INK_MUTED
