extends Node

var sfx_streams: Dictionary = {}
var bgm_player: AudioStreamPlayer

# Define paths to audio resource assets (placeholders can map to standard beep/boops initially)
var sfx_resources = {
	"ui_select": "res://assets/audio/select.wav",
	"ui_hover": "res://assets/audio/hover.wav",
	"chop": "res://assets/audio/chop.wav",
	"smash": "res://assets/audio/smash.wav",
	"sizzle": "res://assets/audio/sizzle.wav",
	"discovery": "res://assets/audio/discovery.wav"
}

func _ready():
	# Initialize BGM Player for hearth ambience
	bgm_player = AudioStreamPlayer.new()
	add_child(bgm_player)
	bgm_player.bus = "Music"
	
	# Load sfx files if they exist
	preload_sfx()

func preload_sfx():
	for name in sfx_resources.keys():
		var path = sfx_resources[name]
		if ResourceLoader.exists(path):
			sfx_streams[name] = load(path)

func play_sfx(name: String):
	if sfx_streams.has(name):
		var player = AudioStreamPlayer.new()
		add_child(player)
		player.stream = sfx_streams[name]
		player.bus = "SFX"
		player.play()
		# Automatically remove player node after audio ends to prevent leaks
		player.finished.connect(player.queue_free)
	else:
		# Fallback print statement when sound assets are not present
		print("[SoundManager] SFX played: ", name)

func play_ambience(path: String):
	if ResourceLoader.exists(path):
		bgm_player.stream = load(path)
		bgm_player.play()
		print("[SoundManager] Started looping background ambience: ", path)
