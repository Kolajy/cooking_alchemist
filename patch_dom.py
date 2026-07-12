with open("web/src/game/dom.ts", "r") as f:
    content = f.read()

if "settingHighContrast" not in content:
    content = content.replace("settingReducedMotion: HTMLInputElement | null;", "settingReducedMotion: HTMLInputElement | null;\n  settingHighContrast: HTMLInputElement | null;")
    content = content.replace('settingReducedMotion: document.getElementById("setting-reduced-motion") as HTMLInputElement | null,', 'settingReducedMotion: document.getElementById("setting-reduced-motion") as HTMLInputElement | null,\n    settingHighContrast: document.getElementById("setting-high-contrast") as HTMLInputElement | null,')

with open("web/src/game/dom.ts", "w") as f:
    f.write(content)

print("dom patched")
