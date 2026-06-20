extends Control

const SPARK_MARKS := ["✨", "⭐", "✦", "🌟", "·", "✧"]
const SPARK_COUNT := 14


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE


func burst() -> void:
	if GameState.reduced_motion:
		return
	for child in get_children():
		child.queue_free()
	var center := size * 0.5
	for i in range(SPARK_COUNT):
		var spark := Label.new()
		spark.text = SPARK_MARKS[i % SPARK_MARKS.size()]
		spark.add_theme_font_size_override("font_size", 14)
		spark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		spark.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		spark.position = center - Vector2(8, 8)
		spark.modulate.a = 0.0
		add_child(spark)
		var angle := (TAU / float(SPARK_COUNT)) * float(i)
		var distance := 48.0 + float(i % 5) * 14.0
		var target := center + Vector2(cos(angle), sin(angle)) * distance - Vector2(8, 8)
		var delay := 0.12 + float(i) * 0.035
		var tween := create_tween()
		tween.tween_interval(delay)
		tween.tween_property(spark, "modulate:a", 1.0, 0.18)
		tween.parallel().tween_property(spark, "position", target, 0.95).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
		tween.parallel().tween_property(spark, "modulate:a", 0.0, 0.5).set_delay(0.55)
		tween.tween_callback(spark.queue_free)
