import { getCtx } from "../context";
import { METHOD_ORDER } from "../constants";
import {
  applyActiveTechniqueToCounter,
  cycleActiveSkill,
  selectMethodById
} from "../actions/toolbar";
import { clearWorkspace } from "../canvas/workspace";
import { applyUndo } from "../feedback/undo";
import {
  isSoundEnabled,
  setSoundEnabled,
  syncSoundUi,
  playSound
} from "../feedback/audio";
import { openDialog, renderRecipeBook } from "./dialogs";
import { switchMainView, switchSidebarTab } from "./views";
import { toggleSettingsDialog } from "./settings";

export interface KeyboardShortcut {
  keys: string;
  action: string;
  context?: string;
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { keys: "1 – 5", action: "Select cooking method (Combine → Separate → Force → Heat → Time)", context: "Kitchen" },
  { keys: "[ / ]", action: "Previous / next sub-technique", context: "Kitchen" },
  { keys: "Enter", action: "Apply active technique to counter items", context: "Kitchen" },
  { keys: "U", action: "Undo last counter change", context: "Kitchen" },
  { keys: "⌘/Ctrl + Z", action: "Undo last counter change", context: "Kitchen" },
  { keys: "C", action: "Clear counter", context: "Kitchen" },
  { keys: "/", action: "Focus pantry search", context: "Kitchen" },
  { keys: "P", action: "Pantry tab", context: "Sidebar" },
  { keys: "K", action: "Skills tab", context: "Sidebar" },
  { keys: "J", action: "Journal tab", context: "Sidebar" },
  { keys: "A", action: "Trophies tab", context: "Sidebar" },
  { keys: "B", action: "Recipe book", context: "Global" },
  { keys: "M", action: "Toggle progress map", context: "Global" },
  { keys: ",", action: "Open settings", context: "Global" },
  { keys: "S", action: "Toggle sound", context: "Global" },
  { keys: "?", action: "How to play (this dialog)", context: "Global" },
  { keys: "Esc", action: "Close dialog or leave progress map", context: "Global" }
];

function isTypingTarget(target: EventTarget | null): boolean {
  return Boolean((target as Element | null)?.closest?.("input, textarea, select, [contenteditable='true']"));
}

function hasPrimaryModifier(event: KeyboardEvent): boolean {
  return event.metaKey || event.ctrlKey || event.altKey;
}

function isDialogOpen(dialog: HTMLDialogElement | null | undefined): boolean {
  if (!dialog) return false;
  return dialog.open || dialog.hasAttribute("open");
}

function dismissDiscoveryIfOpen(): boolean {
  const { dom } = getCtx();
  if (!isDialogOpen(dom.discoveryDialog)) return false;
  dom.btnDiscoveryOk?.click();
  return true;
}

function closeOpenDialogs(): boolean {
  const { dom } = getCtx();
  if (dismissDiscoveryIfOpen()) return true;

  const closable = [dom.helpModal, dom.recipeBookModal, dom.settingsModal];
  for (const dialog of closable) {
    if (isDialogOpen(dialog)) {
      dialog?.close();
      return true;
    }
  }
  return false;
}

function focusCabinetSearch(): void {
  const { dom } = getCtx();
  switchMainView("cook");
  switchSidebarTab("cabinet");
  const input = dom.cabinetSearch;
  if (!input) return;
  input.focus();
  input.select();
}

function toggleHelpDialog(): void {
  const { dom } = getCtx();
  if (isDialogOpen(dom.helpModal)) {
    dom.helpModal?.close();
    return;
  }
  openDialog(dom.helpModal);
}

function toggleRecipeBook(): void {
  const { dom } = getCtx();
  if (isDialogOpen(dom.recipeBookModal)) {
    dom.recipeBookModal?.close();
    return;
  }
  renderRecipeBook();
  openDialog(dom.recipeBookModal);
}

function toggleProgressMap(): void {
  const { state } = getCtx();
  switchMainView(state.activeMainView === "map" ? "cook" : "map");
}

function toggleSound(): void {
  const next = !isSoundEnabled();
  setSoundEnabled(next);
  syncSoundUi(next);
  if (next) playSound("ui_click");
}

function handleKitchenShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();

  if (key === "enter") {
    if (applyActiveTechniqueToCounter() !== null) {
      event.preventDefault();
      return true;
    }
    return false;
  }

  if (key === "u") {
    if (applyUndo()) {
      event.preventDefault();
      return true;
    }
    return false;
  }

  if (key === "c") {
    clearWorkspace();
    event.preventDefault();
    return true;
  }

  if (key === "[") {
    if (cycleActiveSkill(-1)) {
      event.preventDefault();
      return true;
    }
    return false;
  }

  if (key === "]") {
    if (cycleActiveSkill(1)) {
      event.preventDefault();
      return true;
    }
    return false;
  }

  const methodIndex = Number.parseInt(event.key, 10);
  if (methodIndex >= 1 && methodIndex <= METHOD_ORDER.length) {
    selectMethodById(METHOD_ORDER[methodIndex - 1]);
    event.preventDefault();
    return true;
  }

  return false;
}

function handleGlobalShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();

  if (key === "escape") {
    const { state } = getCtx();
    if (closeOpenDialogs()) {
      event.preventDefault();
      return true;
    }
    if (state.activeMainView === "map") {
      switchMainView("cook");
      event.preventDefault();
      return true;
    }
    return false;
  }

  if (event.key === "?" || (event.key === "/" && event.shiftKey)) {
    toggleHelpDialog();
    event.preventDefault();
    return true;
  }

  if (key === "b") {
    toggleRecipeBook();
    event.preventDefault();
    return true;
  }

  if (key === "m") {
    toggleProgressMap();
    event.preventDefault();
    return true;
  }

  if (event.key === ",") {
    toggleSettingsDialog();
    event.preventDefault();
    return true;
  }

  if (key === "s") {
    toggleSound();
    event.preventDefault();
    return true;
  }

  if (key === "p") {
    switchSidebarTab("cabinet");
    event.preventDefault();
    return true;
  }

  if (key === "k") {
    switchSidebarTab("skills");
    event.preventDefault();
    return true;
  }

  if (key === "j") {
    switchSidebarTab("journal");
    event.preventDefault();
    return true;
  }

  if (key === "a") {
    switchSidebarTab("achievements");
    event.preventDefault();
    return true;
  }

  if (event.key === "/" && !event.shiftKey) {
    focusCabinetSearch();
    event.preventDefault();
    return true;
  }

  return false;
}

export function handleKeyboardShortcut(event: KeyboardEvent): void {
  if (isTypingTarget(event.target)) return;

  const { state, dom } = getCtx();

  if (isDialogOpen(dom.discoveryDialog)) {
    if (event.key === "Enter" || event.key === "Escape") {
      dismissDiscoveryIfOpen();
      event.preventDefault();
    }
    return;
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
    if (state.activeMainView === "cook") {
      event.preventDefault();
      applyUndo();
    }
    return;
  }

  if (hasPrimaryModifier(event)) return;

  if (isDialogOpen(dom.recipeBookModal) || isDialogOpen(dom.helpModal) || isDialogOpen(dom.settingsModal)) {
    if (event.key === "Escape" || event.key === "?" || (event.key === "/" && event.shiftKey)) {
      handleGlobalShortcut(event);
    }
    return;
  }

  if (handleGlobalShortcut(event)) return;

  if (state.activeMainView !== "cook") return;

  handleKitchenShortcut(event);
}

export function setupKeyboardShortcuts(): void {
  document.addEventListener("keydown", handleKeyboardShortcut);
}
