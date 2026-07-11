export const SAVE_FILE_VERSION = 1 as const;
export const SAVE_GAME_ID = "culinary-alchemy" as const;

export function formatExportDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function showSaveToast(message: string): void {
  const toast = document.createElement("div");
  toast.className = "save-export-toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("save-export-toast--visible"));

  window.setTimeout(() => {
    toast.classList.remove("save-export-toast--visible");
    window.setTimeout(() => toast.remove(), 300);
  }, 2800);
}
