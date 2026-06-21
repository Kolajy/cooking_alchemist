import { getCtx } from "../context";
import { getActiveSlot, setActiveSlot, getSlotInfo, deleteSlot, migrateLegacySave, getSlotKeys } from "../slots";
import { loadProgress, resetToStarters, updateStats } from "../persistence";
import { loadAchievements } from "../progression/achievements";
import { openDialog } from "./dialogs";
import { refreshGameSessionUi, hydrateGameSession } from "../save-repository";
import { playSound } from "../feedback/sounds";

export function initStartMenu(): void {
  // Ensure legacy saves are migrated to Slot 1 if they exist
  migrateLegacySave();

  const overlay = document.getElementById("start-menu-overlay") as HTMLElement | null;
  const btnContinue = document.getElementById("menu-btn-continue") as HTMLButtonElement | null;
  const btnPlay = document.getElementById("menu-btn-play") as HTMLButtonElement | null;
  const btnSettings = document.getElementById("menu-btn-settings") as HTMLButtonElement | null;
  const btnBack = document.getElementById("menu-btn-back") as HTMLButtonElement | null;
  const viewMain = document.getElementById("start-menu-main") as HTMLElement | null;
  const viewSlots = document.getElementById("start-menu-slots") as HTMLElement | null;
  const btnSettingsToMenu = document.getElementById("settings-to-menu") as HTMLButtonElement | null;

  if (!overlay) return;

  // Find the most recently played slot to use for "Continue"
  const slots = ["slot1", "slot2", "slot3"];
  let mostRecentSlot: string | null = null;
  let maxTime = -1;

  slots.forEach(slotId => {
    const info = getSlotInfo(slotId);
    if (!info.isEmpty && info.lastSaved && info.lastSaved > maxTime) {
      maxTime = info.lastSaved;
      mostRecentSlot = slotId;
    }
  });

  // Enable/disable Continue button
  if (btnContinue) {
    if (mostRecentSlot) {
      btnContinue.disabled = false;
      const recentInfo = getSlotInfo(mostRecentSlot);
      btnContinue.textContent = `Continue (${recentInfo.name})`;
    } else {
      btnContinue.disabled = true;
      btnContinue.textContent = "Continue";
    }
  }

  // Bind Continue button
  btnContinue?.addEventListener("click", () => {
    if (mostRecentSlot) {
      playSound("ui_click");
      setActiveSlot(mostRecentSlot);
      bootActiveSlot();
    }
  });

  // Bind Play/Slots button
  btnPlay?.addEventListener("click", () => {
    playSound("ui_click");
    if (viewMain && viewSlots) {
      viewMain.hidden = true;
      viewSlots.hidden = false;
      renderSlotsGrid();
    }
  });

  // Bind Back button
  btnBack?.addEventListener("click", () => {
    playSound("ui_click");
    if (viewMain && viewSlots) {
      viewMain.hidden = false;
      viewSlots.hidden = true;
      // Refresh continue button in case slot was deleted
      initStartMenu();
    }
  });

  // Bind Settings button
  btnSettings?.addEventListener("click", () => {
    playSound("ui_click");
    const settingsModal = document.getElementById("settings-modal");
    if (settingsModal) {
      openDialog(settingsModal);
    }
  });

  // Bind Return to Menu button from Settings dialog
  btnSettingsToMenu?.addEventListener("click", () => {
    playSound("ui_click");
    // Close the settings modal
    const settingsModal = document.getElementById("settings-modal") as any;
    if (settingsModal && typeof settingsModal.close === "function") {
      settingsModal.close();
    }
    
    // Show start menu
    overlay.removeAttribute("hidden");
    if (viewMain && viewSlots) {
      viewMain.hidden = false;
      viewSlots.hidden = true;
    }
    
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
        playBtn.textContent = "New Game";
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
        statusEl.innerHTML = `<strong>${info.percent}%</strong> Ledger • ${info.achievementsCount}🏆<br><span style="font-size: 0.8rem; opacity: 0.8;">Saved: ${dateStr}</span>`;
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
        // Just reset to starters and boot
        bootNewSlot();
      } else {
        // Load the existing progress and boot
        bootActiveSlot();
      }
    });

    deleteBtn?.replaceWith(deleteBtn.cloneNode(true));
    const newDeleteBtn = card.querySelector(".slot-btn-delete") as HTMLButtonElement | null;
    newDeleteBtn?.addEventListener("click", () => {
      playSound("ui_click");
      if (confirm(`Are you sure you want to permanently delete Save Slot ${slotId.replace("slot", "")}? All progress will be lost.`)) {
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
  localStorage.setItem(getSlotKeys(getActiveSlot()).achievements, JSON.stringify({ unlocked: [], flags: [] }));
  loadAchievements();

  // Refresh UI
  refreshGameSessionUi({ clearWorkspace: true, silentAchievements: true });
}
