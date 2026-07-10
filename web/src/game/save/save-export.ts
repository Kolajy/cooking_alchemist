import { isSoundEnabled } from "../feedback/sounds";
import { buildPortableSave } from "./save-repository";
import { formatExportDate, showSaveToast } from "./save-io";

export function buildGameSaveFile() {
  return buildPortableSave(isSoundEnabled());
}

export function exportGameSave(): boolean {
  const save = buildGameSaveFile();
  const json = JSON.stringify(save, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const filename = `culinary-alchemy-save-${formatExportDate(new Date(save.exportedAt))}.json`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  const count = save.discovery.discovered.length;
  showSaveToast(`Save exported (${count} discoveries)`);
  return true;
}
