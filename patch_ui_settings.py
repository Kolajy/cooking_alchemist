with open("web/src/game/ui/settings.ts", "r") as f:
    content = f.read()

if "isHighContrastEnabled" not in content:
    content = content.replace('''  isReducedMotionEnabled,
  setReducedMotion
} from "../settings";''', '''  isReducedMotionEnabled,
  setReducedMotion,
  isHighContrastEnabled,
  setHighContrast
} from "../settings";''')

    content = content.replace('''  if (dom.settingReducedMotion) {''', '''  if (dom.settingHighContrast) {
    dom.settingHighContrast.checked = isHighContrastEnabled();
    dom.settingHighContrast.setAttribute(
      "aria-checked",
      dom.settingHighContrast.checked ? "true" : "false"
    );
  }

  if (dom.settingReducedMotion) {''')

    content = content.replace('''  const { btnSettings, settingSound, settingAmbience, settingReducedMotion } = dom;''', '''  const { btnSettings, settingSound, settingAmbience, settingReducedMotion, settingHighContrast } = dom;''')

    content = content.replace('''  settingReducedMotion?.addEventListener("change", () => {''', '''  settingHighContrast?.addEventListener("change", () => {
    const enabled = settingHighContrast.checked;
    setHighContrast(enabled);
    settingHighContrast.setAttribute("aria-checked", enabled ? "true" : "false");
  });

  settingReducedMotion?.addEventListener("change", () => {''')

with open("web/src/game/ui/settings.ts", "w") as f:
    f.write(content)

print("ui settings patched")
