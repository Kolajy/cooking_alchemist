shader_type canvas_item;

// Procedural rustic-fantasy parchment — mirrors web `.fantasy-backdrop`
// (aged amber sepia field, paper grain, crinkle creases, scorched vignette).

float hash(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	float a = hash(i);
	float b = hash(i + vec2(1.0, 0.0));
	float c = hash(i + vec2(0.0, 1.0));
	float d = hash(i + vec2(1.0, 1.0));
	return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
	float v = 0.0;
	float amp = 0.5;
	for (int i = 0; i < 5; i++) {
		v += amp * vnoise(p);
		p *= 2.03;
		amp *= 0.5;
	}
	return v;
}

void fragment() {
	vec2 uv = UV;

	// Aged parchment base — warm amber sepia gradient (#F5E6C8 -> #ECD6AC -> #DCBF8D).
	vec3 c_light = vec3(0.961, 0.902, 0.784);
	vec3 c_mid = vec3(0.925, 0.839, 0.675);
	vec3 c_deep = vec3(0.863, 0.749, 0.553);
	float d = distance(uv, vec2(0.5, 0.42));
	vec3 col = mix(c_light, c_mid, smoothstep(0.0, 0.55, d));
	col = mix(col, c_deep, smoothstep(0.45, 0.95, d));

	// Uneven tonal mottling — amber/brown blotches like manuscript stock.
	vec3 amber = vec3(0.831, 0.659, 0.263);
	vec3 brown = vec3(0.545, 0.412, 0.078);
	col = mix(col, amber, smoothstep(0.5, 0.0, distance(uv, vec2(0.18, 0.24))) * 0.20);
	col = mix(col, brown, smoothstep(0.5, 0.0, distance(uv, vec2(0.82, 0.28))) * 0.16);
	col = mix(col, amber, smoothstep(0.5, 0.0, distance(uv, vec2(0.74, 0.80))) * 0.18);
	col = mix(col, brown, smoothstep(0.5, 0.0, distance(uv, vec2(0.22, 0.84))) * 0.14);
	float center = smoothstep(0.6, 0.0, distance(uv, vec2(0.5, 0.52)));
	col = mix(col, c_light, center * 0.25);

	// Large-scale aged mottle (multiply).
	float blot = fbm(uv * 4.0);
	col *= mix(0.93, 1.04, blot);

	// Fine paper grain.
	float grain = vnoise(uv * vec2(560.0, 560.0));
	col *= mix(0.90, 1.0, grain);

	// Crinkle / fold creases — two faint diagonal sets (~118deg, ~28deg).
	float cr1 = sin((uv.x * cos(2.06) + uv.y * sin(2.06)) * 220.0);
	col += vec3(0.06) * (smoothstep(0.96, 1.0, cr1) * 0.05);
	float cr2 = sin((uv.x * cos(0.489) + uv.y * sin(0.489)) * 150.0);
	col -= vec3(0.05) * (smoothstep(0.97, 1.0, cr2) * 0.04);
	float fold = abs(sin(fbm(uv * 2.5) * 9.4248));
	col *= mix(1.0, 0.97, smoothstep(0.85, 1.0, fold));

	// Singed manuscript vignette.
	float vig = smoothstep(0.48, 1.0, distance(uv, vec2(0.5, 0.5)));
	col = mix(col, vec3(0.149, 0.078, 0.024), vig * 0.5);

	// Scorched corners.
	float corner = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
	col = mix(col, vec3(0.106, 0.055, 0.016), smoothstep(0.16, 0.0, corner) * 0.45);

	COLOR = vec4(col, 1.0);
}
