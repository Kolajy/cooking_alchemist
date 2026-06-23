import { getCtx } from "../context";
import { exportGameSave } from "../save-export";
import { importGameSaveFromFile } from "../save-import";
import { resetGameProgress } from "../reset-progress";

function exportSaveWithFeedback(): void {
  try {
    exportGameSave();
  } catch (error) {
    console.error("Failed to export game save", error);
    alert("Could not export your save. Please try again.");
  }
}

async function importSaveFromInput(input: HTMLInputElement): Promise<void> {
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  try {
    const result = await importGameSaveFromFile(file);
    if (!result.ok && result.error !== "Import cancelled.") {
      alert(result.error);
    }
  } catch (error) {
    console.error("Failed to import game save", error);
    alert("Could not import your save. Please try again.");
  }
}

/** Wire export, import, and reset controls (settings panel). */
export function wireSaveDataControls(): void {
  const { dom } = getCtx();
  const { saveFileInput, settingsExport, settingsImport, settingsReset, settingsModal } = dom;

  settingsExport?.addEventListener("click", exportSaveWithFeedback);

  settingsImport?.addEventListener("click", () => {
    saveFileInput?.click();
  });

  saveFileInput?.addEventListener("change", () => {
    if (saveFileInput) void importSaveFromInput(saveFileInput);
  });

  settingsReset?.addEventListener("click", async () => {
    const success = await resetGameProgress();
    if (success) {
      settingsModal?.close();
    }
  });

}
