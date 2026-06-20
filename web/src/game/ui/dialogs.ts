import { getCtx } from "../context";
import { enrichItem, isFinalizedRecipe, getStateLabel, getIngredientState } from "../ingredients";
import { escapeHtml } from "../security/html";

export function openDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
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

  discoveredRecipesList.innerHTML = "";

  const uniqueRecipes = [];
  Object.keys(data.DISCOVERABLE_ITEMS).forEach(id => {
    const item = data.DISCOVERABLE_ITEMS[id];
    if (state.discoveredIds.has(id) && isFinalizedRecipe(item)) {
      uniqueRecipes.push({ id, ...item });
    }
  });

  if (uniqueRecipes.length === 0) {
    discoveredRecipesList.innerHTML = `<p class="dialog-intro" style="grid-column: 1/-1; text-align: center;">No finalized recipes yet. Separate primal ingredients, then combine and cook what you discover.</p>`;
    return;
  }

  uniqueRecipes.sort((a, b) => a.name.localeCompare(b.name));

  uniqueRecipes.forEach(item => {
    const itemData = enrichItem({ id: item.id, ...item });
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.dataset.origin = itemData.origin;

    const stateKey = getIngredientState(itemData);

    card.innerHTML = `
      <span class="recipe-card-emoji">${escapeHtml(itemData.emoji)}</span>
      <span class="recipe-card-name">${escapeHtml(itemData.name)}</span>
      <span class="recipe-card-meta">
        <span class="recipe-card-category">${escapeHtml(itemData.category || "")}</span>
        <span class="origin-badge origin-badge--recipe">${escapeHtml(getStateLabel(stateKey))}</span>
      </span>
      <div class="tooltip" role="tooltip">
        <h4>📜 Did You Know?</h4>
        <p>${escapeHtml(itemData.blurb || itemData.tip || itemData.description || "Keep experimenting to learn more.")}</p>
      </div>
    `;

    discoveredRecipesList.appendChild(card);
  });
}
