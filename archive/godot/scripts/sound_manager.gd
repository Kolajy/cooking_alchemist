extends Node

const ProceduralAudio = preload("res://scripts/procedural_audio.gd")

var bgm_player: AudioStreamPlayer
var ambience_enabled: bool = false
var _cooldowns: Dictionary = {}
var _hearth_stream: AudioStreamWAV

const COOLDOWN_MS := {
	"ui_hover": 140,
	"ui_pickup": 90,
	"ui_place": 90,
	"ui_click": 60,
	"chop": 70,
	"slice": 70,
	"smash": 80,
	"separate": 80,
	"combine": 100,
	"bubble": 120,
	"hint": 200,
	"fail": 120,
	"fail_soft": 120
}

const SKILL_SOUND_MAP := {
	"separate": "separate",
	"peel": "peel",
	"core_seed": "peel",
	"fillet_debone": "slice",
	"tear": "tear",
	"structured_tear": "tear",
	"chunking": "chop",
	"cutting": "chop",
	"slicing": "slice",
	"dicing": "dice",
	"julienne": "slice",
	"smash": "smash",
	"pound": "pound",
	"press": "press",
	"grind": "grind",
	"knead": "knead",
	"emulsify": "emulsify",
	"char": "char",
	"cook": "cook",
	"precision": "precision",
	"hand_mix": "mix",
	"whisk_churn": "whisk",
	"gel_foam": "gel",
	"rest": "bubble",
	"steep": "bubble",
	"ferment": "bubble",
	"combine": "combine"
}

const ACTION_SOUND_MAP := {
	"separate": "separate",
	"force": "smash",
	"heat": "char",
	"time": "bubble",
	"combine": "combine",
	"change": "char"
}


func _ready() -> void:
	bgm_player = AudioStreamPlayer.new()
	add_child(bgm_player)
	bgm_player.bus = &"Master"
	bgm_player.volume_db = -16.0
	_hearth_stream = ProceduralAudio.make_hearth_loop()
	if GameState.ambience_enabled:
		start_ambience()


func resolve_technique_sound(skill_id: String, ui_action: String = "") -> String:
	if skill_id != "" and SKILL_SOUND_MAP.has(skill_id):
		return SKILL_SOUND_MAP[skill_id]
	if ui_action != "" and ACTION_SOUND_MAP.has(ui_action):
		return ACTION_SOUND_MAP[ui_action]
	if ui_action == "combine":
		return "combine"
	if ui_action == "separate":
		return "separate"
	return "chop"


func play_technique_sound(skill_id: String = "", ui_action: String = "") -> void:
	play_sfx(resolve_technique_sound(skill_id, ui_action))


func play_action_select_sound(ui_action: String) -> void:
	play_sfx(ACTION_SOUND_MAP.get(ui_action, "ui_click"))


func _can_play(name: String) -> bool:
	var cooldown = COOLDOWN_MS.get(name, 0)
	if cooldown <= 0:
		return true
	var now := Time.get_ticks_msec()
	var last := int(_cooldowns.get(name, 0))
	if now - last < cooldown:
		return false
	_cooldowns[name] = now
	return true


func play_sfx(name: String) -> void:
	if not GameState.sound_enabled:
		return
	if not _can_play(name):
		return
	var stream := _stream_for(name)
	if stream == null:
		return
	var player := AudioStreamPlayer.new()
	add_child(player)
	player.stream = stream
	player.volume_db = -4.0
	player.play()
	player.finished.connect(player.queue_free)


func _stream_for(name: String) -> AudioStream:
	match name:
		"ui_select", "ui_click":
			return ProceduralAudio.make_tone(_jitter(720.0), 0.03, 0.012)
		"ui_tab":
			return ProceduralAudio.make_tone(_jitter(540.0), 0.04, 0.014)
		"ui_pickup":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_tone(_jitter(420.0), 0.04, 0.016),
				ProceduralAudio.make_tone(_jitter(620.0), 0.05, 0.012, "sine", 0.03)
			])
		"ui_place":
			return ProceduralAudio.make_tone(_jitter(280.0), 0.05, 0.018, "sine", 0.0, 180.0)
		"ui_remove":
			return ProceduralAudio.make_tone(_jitter(220.0), 0.05, 0.016, "triangle", 0.0, 120.0)
		"ui_clear":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_tone(_jitter(360.0), 0.05, 0.014),
				ProceduralAudio.make_tone(_jitter(240.0), 0.06, 0.012, "sine", 0.04)
			])
		"ui_undo":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_tone(420.0, 0.06, 0.02, "sine", 0.0, 300.0),
				ProceduralAudio.make_tone(330.0, 0.07, 0.016, "sine", 0.05, 260.0)
			])
		"ui_locked":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_tone(120.0, 0.07, 0.012, "square"),
				ProceduralAudio.make_tone(90.0, 0.08, 0.01, "square", 0.07)
			])
		"ui_hover":
			return ProceduralAudio.make_tone(_jitter(880.0), 0.02, 0.008)
		"discovery", "unlock":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_chime([523, 659, 784, 988], 0.1, 0.03),
				ProceduralAudio.make_noise_burst(0.08, 0.012)
			])
		"recipe_complete", "milestone":
			return ProceduralAudio.make_chime([392, 494, 587, 740], 0.11, 0.03)
		"success":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_tone(392.0, 0.08, 0.03),
				ProceduralAudio.make_tone(523.0, 0.1, 0.025, "sine", 0.06)
			])
		"fail":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_tone(140.0, 0.1, 0.04, "triangle"),
				ProceduralAudio.make_tone(98.0, 0.12, 0.03, "triangle", 0.08)
			])
		"fail_soft":
			return ProceduralAudio.make_tone(_jitter(180.0), 0.08, 0.02, "triangle", 0.0, 120.0)
		"combine":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_noise_burst(0.05, 0.018),
				ProceduralAudio.make_tone(_jitter(240.0), 0.07, 0.02, "sine", 0.0, 320.0),
				ProceduralAudio.make_tone(_jitter(360.0), 0.08, 0.018, "sine", 0.05)
			])
		"mix", "knead", "emulsify":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_noise_burst(0.08, 0.016),
				ProceduralAudio.make_tone(_jitter(180.0), 0.1, 0.018, "sine", 0.02, 120.0)
			])
		"whisk", "gel":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_tone(_jitter(520.0), 0.04, 0.014, "sine", 0.0),
				ProceduralAudio.make_tone(_jitter(780.0), 0.05, 0.012, "sine", 0.03),
				ProceduralAudio.make_tone(_jitter(980.0), 0.05, 0.01, "sine", 0.06)
			])
		"chop", "separate", "slice":
			return ProceduralAudio.make_impact(_jitter(110.0), 0.06)
		"dice":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_impact(_jitter(130.0), 0.05),
				ProceduralAudio.make_impact(_jitter(150.0), 0.04)
			])
		"smash", "pound":
			return ProceduralAudio.make_impact(_jitter(70.0), 0.08)
		"press", "grind":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_noise_burst(0.1, 0.022),
				ProceduralAudio.make_tone(_jitter(90.0), 0.12, 0.02, "triangle", 0.0, 45.0)
			])
		"peel", "tear":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_noise_burst(0.05, 0.014),
				ProceduralAudio.make_tone(_jitter(260.0), 0.06, 0.016, "sine", 0.0, 180.0)
			])
		"sizzle", "cook", "char":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_noise_burst(0.12, 0.035),
				ProceduralAudio.make_tone(_jitter(180.0), 0.14, 0.02, "triangle", 0.0, 90.0)
			])
		"precision":
			return ProceduralAudio.make_chime([880, 988, 1174], 0.05, 0.018)
		"bubble", "hint":
			return ProceduralAudio.mix_streams([
				ProceduralAudio.make_tone(_jitter(320.0), 0.05, 0.022),
				ProceduralAudio.make_tone(_jitter(480.0), 0.06, 0.018, "sine", 0.04),
				ProceduralAudio.make_tone(_jitter(620.0), 0.05, 0.014, "sine", 0.08)
			])
		"level_up":
			return ProceduralAudio.make_chime([392, 494, 587, 740, 880], 0.09, 0.032)
	return ProceduralAudio.make_tone(_jitter(520.0), 0.05, 0.015)


func _jitter(base: float, spread: float = 0.06) -> float:
	return base * (1.0 + randf_range(-spread, spread))


func set_ambience_enabled(enabled: bool) -> void:
	ambience_enabled = enabled
	GameState.ambience_enabled = enabled
	GameState.save_progress()
	if enabled:
		start_ambience()
	else:
		stop_ambience()


func start_ambience() -> void:
	if bgm_player == null:
		return
	if not _hearth_stream:
		_hearth_stream = ProceduralAudio.make_hearth_loop()
	bgm_player.stream = _hearth_stream
	if not bgm_player.playing:
		bgm_player.play()


func stop_ambience() -> void:
	if bgm_player:
		bgm_player.stop()
