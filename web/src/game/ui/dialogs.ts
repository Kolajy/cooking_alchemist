import { getCtx } from "../context";
import { enrichItem, isFinalizedRecipe, getStateLabel, getIngredientState } from "../ingredients";

export function openDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

export function showCustomConfirm(title: string, message: string, dangerAction = false): Promise<boolean> {
  return new Promise((resolve) => {
    const dialog = document.getElementById("confirm-modal") as HTMLDialogElement | null;
    if (!dialog) {
      resolve(confirm(message));
      return;
    }

    const titleEl = dialog.querySelector("#confirm-title") as HTMLElement | null;
    const msgEl = dialog.querySelector("#confirm-message") as HTMLElement | null;
    const cancelBtn = dialog.querySelector("#confirm-btn-cancel") as HTMLButtonElement | null;
    const okBtn = dialog.querySelector("#confirm-btn-ok") as HTMLButtonElement | null;
    const closeBtn = dialog.querySelector(".close-dialog-btn") as HTMLButtonElement | null;

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    if (okBtn) {
      okBtn.textContent = dangerAction ? "Delete / Reset" : "Confirm";
      if (dangerAction) {
        okBtn.className = "btn btn-primary btn-danger-action";
      } else {
        okBtn.className = "btn btn-primary";
      }
    }

    const cleanUp = () => {
      cancelBtn?.removeEventListener("click", onCancel);
      okBtn?.removeEventListener("click", onConfirm);
      closeBtn?.removeEventListener("click", onCancel);
      dialog.removeEventListener("close", onClose);
    };

    const onCancel = () => {
      cleanUp();
      dialog.close();
      resolve(false);
    };

    const onConfirm = () => {
      cleanUp();
      dialog.close();
      resolve(true);
    };

    const onClose = () => {
      cleanUp();
      resolve(false);
    };

    cancelBtn?.addEventListener("click", onCancel);
    closeBtn?.addEventListener("click", onCancel);
    okBtn?.addEventListener("click", onConfirm);
    dialog.addEventListener("close", onClose);

    openDialog(dialog);
  });
}

export function showCustomAlert(title: string, message: string): Promise<void> {
  return new Promise((resolve) => {
    const dialog = document.getElementById("confirm-modal") as HTMLDialogElement | null;
    if (!dialog) {
      alert(message);
      resolve();
      return;
    }

    const titleEl = dialog.querySelector("#confirm-title") as HTMLElement | null;
    const msgEl = dialog.querySelector("#confirm-message") as HTMLElement | null;
    const cancelBtn = dialog.querySelector("#confirm-btn-cancel") as HTMLButtonElement | null;
    const okBtn = dialog.querySelector("#confirm-btn-ok") as HTMLButtonElement | null;
    const closeBtn = dialog.querySelector(".close-dialog-btn") as HTMLButtonElement | null;

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    if (cancelBtn) cancelBtn.style.display = "none";
    if (okBtn) {
      okBtn.textContent = "OK";
      okBtn.className = "btn btn-primary";
    }

    const cleanUp = () => {
      cancelBtn?.removeEventListener("click", onCloseAlert);
      okBtn?.removeEventListener("click", onCloseAlert);
      closeBtn?.removeEventListener("click", onCloseAlert);
      dialog.removeEventListener("close", onClose);
    };

    const onCloseAlert = () => {
      cleanUp();
      dialog.close();
      if (cancelBtn) cancelBtn.style.display = "";
      resolve();
    };

    const onClose = () => {
      cleanUp();
      if (cancelBtn) cancelBtn.style.display = "";
      resolve();
    };

    okBtn?.addEventListener("click", onCloseAlert);
    closeBtn?.addEventListener("click", onCloseAlert);
    dialog.addEventListener("close", onClose);

    openDialog(dialog);
  });
}


export function setupDialogFallbacks() {
  const { dom } = getCtx();
  const dialogs = [dom.recipeBookModal, dom.helpModal, dom.settingsModal, dom.discoveryDialog];

  dialogs.forEach(dialog => {
    if (!dialog) return;

    if (!("closedBy" in HTMLDialogElement.prototype)) {
      dialog.addEventListener("click", (event) => {
        if (event.target !== dialog) return;

        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );

        if (!isDialogContent) {
          dialog.close();
        }
      });
    }

    const closeBtn = dialog.querySelector(".close-dialog-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => dialog.close());
    }
  });
}

export function renderRecipeBook() {
  const { state, dom, data } = getCtx();
  const { discoveredRecipesList } = dom;
  if (!discoveredRecipesList) return;

  discoveredRecipesList.textContent = "";

  const uniqueRecipes = [];
  Object.keys(data.DISCOVERABLE_ITEMS).forEach(id => {
    const item = data.DISCOVERABLE_ITEMS[id];
    if (state.discoveredIds.has(id) && isFinalizedRecipe(item)) {
      uniqueRecipes.push({ id, ...item });
    }
  });

  if (uniqueRecipes.length === 0) {
    const emptyP = document.createElement("p");
    emptyP.className = "dialog-intro";
    emptyP.style.gridColumn = "1/-1";
    emptyP.style.textAlign = "center";
    emptyP.textContent = "No finalized recipes yet. Separate primal ingredients, then combine and cook what you discover.";
    discoveredRecipesList.appendChild(emptyP);
    return;
  }

  uniqueRecipes.sort((a, b) => a.name.localeCompare(b.name));

  uniqueRecipes.forEach(item => {
    const itemData = enrichItem({ id: item.id, ...item });
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.dataset.origin = itemData.origin;

    const stateKey = getIngredientState(itemData);

    const emojiSpan = document.createElement("span");
    emojiSpan.className = "recipe-card-emoji";
    emojiSpan.textContent = itemData.emoji;

    const nameSpan = document.createElement("span");
    nameSpan.className = "recipe-card-name";
    nameSpan.textContent = itemData.name;

    const metaSpan = document.createElement("span");
    metaSpan.className = "recipe-card-meta";

    const catSpan = document.createElement("span");
    catSpan.className = "recipe-card-category";
    catSpan.textContent = itemData.category || "";

    const badgeSpan = document.createElement("span");
    badgeSpan.className = "origin-badge origin-badge--recipe";
    badgeSpan.textContent = getStateLabel(stateKey);
    metaSpan.append(catSpan, badgeSpan);

    const tooltipDiv = document.createElement("div");
    tooltipDiv.className = "tooltip";
    tooltipDiv.setAttribute("role", "tooltip");

    const h4 = document.createElement("h4");
    h4.textContent = "📜 Did You Know?";

    const p = document.createElement("p");
    p.textContent = itemData.blurb || itemData.tip || itemData.description || "Keep experimenting to learn more.";

    tooltipDiv.append(h4, p);

    card.append(emojiSpan, nameSpan, metaSpan, tooltipDiv);

    discoveredRecipesList.appendChild(card);
  });
}
