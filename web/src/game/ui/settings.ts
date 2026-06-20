import { getCtx } from "../context";
import {
  isSoundEnabled,
  setSoundEnabled,
  syncSoundUi,
  playSound,
  isAmbienceEnabled,
  setAmbienceEnabled
} from "../feedback/sounds";
import {
  isReducedMotionEnabled,
  setReducedMotion
} from "../settings";
import { openDialog } from "./dialogs";
import { wireSaveDataControls } from "./save-controls";

export function syncSettingsControls(): void {
  const { dom } = getCtx();
  syncSoundUi();

  if (dom.settingAmbience) {
    dom.settingAmbience.checked = isAmbienceEnabled();
    dom.settingAmbience.setAttribute(
      "aria-checked",
      dom.settingAmbience.checked ? "true" : "false"
    );
  }

  if (dom.settingReducedMotion) {
    dom.settingReducedMotion.checked = isReducedMotionEnabled();
    dom.settingReducedMotion.setAttribute(
      "aria-checked",
      dom.settingReducedMotion.checked ? "true" : "false"
    );
  }
}

export function openSettingsDialog(): void {
  const { dom } = getCtx();
  syncSettingsControls();
  openDialog(dom.settingsModal);
}

export function toggleSettingsDialog(): void {
  const { dom } = getCtx();
  const dialog = dom.settingsModal;
  if (!dialog) return;

  if (dialog.open || dialog.hasAttribute("open")) {
    dialog.close();
    return;
  }

  openSettingsDialog();
}

export function setupSettingsPanel(): void {
  const { dom } = getCtx();
  const { btnSettings, settingSound, settingAmbience, settingReducedMotion } = dom;

  btnSettings?.addEventListener("click", () => openSettingsDialog());

  settingSound?.addEventListener("change", () => {
    const enabled = settingSound.checked;
    setSoundEnabled(enabled);
    syncSoundUi(enabled);
    if (enabled) playSound("ui_click");
  });

  settingAmbience?.addEventListener("change", () => {
    const enabled = settingAmbience.checked;
    setAmbienceEnabled(enabled);
    settingAmbience.setAttribute("aria-checked", enabled ? "true" : "false");
  });

  settingReducedMotion?.addEventListener("change", () => {
    const enabled = settingReducedMotion.checked;
    setReducedMotion(enabled);
    settingReducedMotion.setAttribute("aria-checked", enabled ? "true" : "false");
  });

  wireSaveDataControls();
}
