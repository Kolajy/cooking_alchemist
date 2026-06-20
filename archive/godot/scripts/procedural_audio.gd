class_name ProceduralAudio
extends RefCounted

const MIX_RATE := 22050


static func _write_sample(data: PackedByteArray, index: int, sample: float) -> void:
	var s16 := int(clamp(sample * 32767.0, -32768.0, 32767.0))
	data[index * 2] = s16 & 0xFF
	data[index * 2 + 1] = (s16 >> 8) & 0xFF


static func _wave(phase: float, wave_type: String) -> float:
	match wave_type:
		"triangle":
			var p: float = phase - floor(phase + 0.5)
			return 2.0 * abs(2.0 * p) - 1.0
		"square":
			return 1.0 if sin(TAU * phase) >= 0.0 else -1.0
	return sin(TAU * phase)


static func make_tone(
	frequency: float,
	duration: float = 0.08,
	gain: float = 0.04,
	wave_type: String = "sine",
	delay: float = 0.0,
	freq_end: float = -1.0
) -> AudioStreamWAV:
	var total := delay + duration + 0.02
	var sample_count := maxi(1, int(total * MIX_RATE))
	var data := PackedByteArray()
	data.resize(sample_count * 2)
	var delay_samples := int(delay * MIX_RATE)
	for i in range(sample_count):
		var t := float(i) / float(MIX_RATE)
		var sample := 0.0
		if i >= delay_samples:
			var local_t := t - delay
			if local_t <= duration:
				var progress: float = local_t / maxf(duration, 0.001)
				var freq: float = frequency
				if freq_end > 0.0:
					freq = lerpf(frequency, freq_end, progress)
				var env_in: float = clampf(local_t / 0.01, 0.0, 1.0)
				var env_out: float = 1.0 - progress
				var env: float = env_in * env_out
				sample = _wave(freq * local_t, wave_type) * gain * env
		_write_sample(data, i, sample)
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = MIX_RATE
	stream.stereo = false
	stream.data = data
	return stream


static func mix_streams(streams: Array) -> AudioStreamWAV:
	var max_len := 0
	var buffers: Array = []
	for stream in streams:
		if stream is AudioStreamWAV:
			var count: int = stream.data.size() / 2
			buffers.append(stream.data)
			max_len = maxi(max_len, count)
	var mixed := PackedByteArray()
	mixed.resize(max_len * 2)
	for i in range(max_len):
		var sum := 0.0
		for buffer in buffers:
			if i * 2 + 1 >= buffer.size():
				continue
			var lo: int = buffer[i * 2]
			var hi: int = buffer[i * 2 + 1]
			var s16 := (hi << 8) | lo
			if s16 >= 32768:
				s16 -= 65536
			sum += float(s16) / 32767.0
		_write_sample(mixed, i, clampf(sum, -1.0, 1.0))
	var out := AudioStreamWAV.new()
	out.format = AudioStreamWAV.FORMAT_16_BITS
	out.mix_rate = MIX_RATE
	out.stereo = false
	out.data = mixed
	return out


static func make_chime(notes: Array, spacing: float = 0.09, gain: float = 0.028) -> AudioStreamWAV:
	var streams: Array = []
	for i in range(notes.size()):
		streams.append(make_tone(float(notes[i]), 0.14 + i * 0.02, gain, "sine", i * spacing))
	return mix_streams(streams)


static func make_noise_burst(duration: float = 0.06, gain: float = 0.03) -> AudioStreamWAV:
	var sample_count := maxi(1, int(duration * MIX_RATE))
	var data := PackedByteArray()
	data.resize(sample_count * 2)
	for i in range(sample_count):
		var progress := float(i) / float(sample_count)
		var env := 1.0 - progress
		var sample := randf_range(-1.0, 1.0) * gain * env
		_write_sample(data, i, sample)
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = MIX_RATE
	stream.stereo = false
	stream.data = data
	return stream


static func make_impact(base_freq: float = 90.0, gain: float = 0.07) -> AudioStreamWAV:
	return mix_streams([
		make_noise_burst(0.05, gain * 0.9),
		make_tone(base_freq, 0.12, gain * 1.1, "triangle", 0.0, 40.0)
	])


static func make_hearth_loop(duration: float = 3.0) -> AudioStreamWAV:
	var sample_count := int(duration * MIX_RATE)
	var data := PackedByteArray()
	data.resize(sample_count * 2)
	var brown := 0.0
	for i in range(sample_count):
		brown = (brown + randf_range(-1.0, 1.0) * 0.015) * 0.995
		var crackle := 0.0
		if randf() < 0.002:
			crackle = randf_range(0.02, 0.05)
		var sample := clampf(brown * 0.12 + crackle, -1.0, 1.0)
		_write_sample(data, i, sample)
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = MIX_RATE
	stream.stereo = false
	stream.loop_mode = AudioStreamWAV.LOOP_FORWARD
	stream.data = data
	return stream
