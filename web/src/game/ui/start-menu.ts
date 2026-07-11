import { getCtx } from "../context";
import { getActiveSlot, setActiveSlot, getSlotInfo, deleteSlot, migrateLegacySave, getSlotKeys } from "../save/slots";
import { loadProgress, resetToStarters, updateStats } from "../save/persistence";
import { gameStorage } from "../save/storage";
import { loadAchievements } from "../progression/achievements";
import { openDialog, showCustomConfirm } from "./dialogs";
import { refreshGameSessionUi } from "../save/save-repository";
import { playSound } from "../feedback/audio";


export function initStartMenu(): void {
  // Ensure legacy saves are migrated to Slot 1 if they exist
  migrateLegacySave();

  const overlay = document.getElementById("start-menu-overlay") as HTMLElement | null;
  const btnSettings = document.getElementById("menu-btn-settings") as HTMLButtonElement | null;
  const btnSettingsToMenu = document.getElementById("settings-to-menu") as HTMLButtonElement | null;

  if (!overlay) return;

  // Render the slots directly on the main screen
  renderSlotsGrid();

  // Bind Settings button
  btnSettings?.replaceWith(btnSettings.cloneNode(true));
  const newBtnSettings = document.getElementById("menu-btn-settings") as HTMLButtonElement | null;
  newBtnSettings?.addEventListener("click", () => {
    playSound("ui_click");
    const settingsModal = document.getElementById("settings-modal");
    if (settingsModal) {
      openDialog(settingsModal);
    }
  });

  // Bind Return to Menu button from Settings dialog
  btnSettingsToMenu?.replaceWith(btnSettingsToMenu.cloneNode(true));
  const newBtnSettingsToMenu = document.getElementById("settings-to-menu") as HTMLButtonElement | null;
  newBtnSettingsToMenu?.addEventListener("click", () => {
    playSound("ui_click");
    // Close settings modal
    const settingsModal = document.getElementById("settings-modal") as any;
    if (settingsModal && typeof settingsModal.close === "function") {
      settingsModal.close();
    }
    
    // Show start menu
    overlay.removeAttribute("hidden");
    initStartMenu();
  });
}

function renderSlotsGrid(): void {
  const slots = ["slot1", "slot2", "slot3"];

  slots.forEach(slotId => {
    const card = document.querySelector(`.slot-card[data-slot="${slotId}"]`) as HTMLElement | null;
    if (!card) return;

    const info = getSlotInfo(slotId);
    const statusEl = card.querySelector(".slot-card__status") as HTMLElement | null;
    const playBtn = card.querySelector(".slot-btn-play") as HTMLButtonElement | null;
    const deleteBtn = card.querySelector(".slot-btn-delete") as HTMLButtonElement | null;

    if (info.isEmpty) {
      card.classList.remove("slot-card--active");
      if (statusEl) statusEl.textContent = "Empty Slot";
      if (playBtn) {
        playBtn.textContent = "Start New";
        playBtn.className = "btn btn-primary slot-btn-play";
      }
      if (deleteBtn) deleteBtn.hidden = true;
    } else {
      const activeSlot = getActiveSlot();
      if (slotId === activeSlot) {
        card.classList.add("slot-card--active");
      } else {
        card.classList.remove("slot-card--active");
      }

      if (statusEl) {
        const dateStr = info.lastSaved
          ? new Date(info.lastSaved).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })
          : "Unknown";
        statusEl.innerHTML = `<strong>${info.percent}%</strong> Ledger • ${info.achievementsCount}🏆<br><span style="font-size: 0.75rem; opacity: 0.85;">Saved: ${dateStr}</span>`;
      }

      if (playBtn) {
        playBtn.textContent = "Load Slot";
        playBtn.className = "btn btn-secondary slot-btn-play";
      }
      if (deleteBtn) deleteBtn.hidden = false;
    }

    // Rebind action buttons
    playBtn?.replaceWith(playBtn.cloneNode(true));
    const newPlayBtn = card.querySelector(".slot-btn-play") as HTMLButtonElement | null;
    newPlayBtn?.addEventListener("click", () => {
      playSound("ui_click");
      setActiveSlot(slotId);
      if (info.isEmpty) {
        bootNewSlot();
      } else {
        bootActiveSlot();
      }
    });

    deleteBtn?.replaceWith(deleteBtn.cloneNode(true));
    const newDeleteBtn = card.querySelector(".slot-btn-delete") as HTMLButtonElement | null;
    newDeleteBtn?.addEventListener("click", async () => {
      playSound("ui_click");
      const confirmed = await showCustomConfirm(
        "Delete Save Slot",
        `Are you sure you want to permanently delete Save Slot ${slotId.replace("slot", "")}? All progress will be lost.`,
        true
      );
      if (confirmed) {
        deleteSlot(slotId);
        renderSlotsGrid();
      }
    });

  });
}

function bootActiveSlot(): void {
  const overlay = document.getElementById("start-menu-overlay");
  if (overlay) {
    overlay.setAttribute("hidden", "true");
  }

  const { data } = getCtx();
  // Hydrate states
  data.Progression.load();
  loadProgress();
  loadAchievements();

  // Refresh GUI elements
  refreshGameSessionUi({ clearWorkspace: true, silentAchievements: false });
}

function bootNewSlot(): void {
  const overlay = document.getElementById("start-menu-overlay");
  if (overlay) {
    overlay.setAttribute("hidden", "true");
  }

  const { data } = getCtx();
  // Reset engine states
  data.Progression.reset();
  resetToStarters();
  gameStorage.setItem(getSlotKeys(getActiveSlot()).achievements, JSON.stringify({ unlocked: [], flags: [] }));
  loadAchievements();

  // Refresh UI
  refreshGameSessionUi({ clearWorkspace: true, silentAchievements: true });
}
