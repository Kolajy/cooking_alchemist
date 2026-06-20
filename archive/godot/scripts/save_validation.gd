extends RefCounted
class_name SaveValidation

const MAX_FILE_BYTES := 2 * 1024 * 1024
const MAX_DISCOVERED := 512
const MAX_LOG_ENTRIES := 512
const MAX_RECENT := 32
const MAX_HIGHLIGHTS := 64
const MAX_ACHIEVEMENTS := 64
const MAX_FLAGS := 32
const MAX_XP_TRACKS := 64
const MAX_ID_LENGTH := 64

static var _id_regex := RegEx.new()


static func _ensure_regex() -> void:
	if _id_regex.get_pattern().is_empty():
		_id_regex.compile("^[a-z][a-z0-9_]*$")


static func is_valid_save_id(id: String) -> bool:
	_ensure_regex()
	return not id.is_empty() and id.length() <= MAX_ID_LENGTH and _id_regex.search(id) != null


static func parse_bounded_string_array(value: Variant, max_items: int) -> Variant:
	if typeof(value) != TYPE_ARRAY:
		return null
	var arr: Array = value
	if arr.size() > max_items:
		return null
	var ids: Array = []
	for item in arr:
		if typeof(item) != TYPE_STRING or not is_valid_save_id(item):
			return null
		ids.append(item)
	return ids


static func parse_bounded_xp_map(value: Variant) -> Variant:
	if typeof(value) != TYPE_DICTIONARY:
		return null
	var raw: Dictionary = value
	if raw.size() > MAX_XP_TRACKS:
		return null
	var xp: Dictionary = {}
	for skill_id in raw.keys():
		if str(skill_id) in ["__proto__", "constructor", "prototype"]:
			return null
		if not is_valid_save_id(str(skill_id)):
			return null
		var amount = raw[skill_id]
		if typeof(amount) not in [TYPE_INT, TYPE_FLOAT]:
			return null
		var n := float(amount)
		if n < 0.0 or n > 1000000.0:
			return null
		xp[skill_id] = int(n)
	return xp


static func validate_file_size(path: String) -> bool:
	if not FileAccess.file_exists(path):
		return false
	return FileAccess.get_file_as_bytes(path).size() <= MAX_FILE_BYTES
