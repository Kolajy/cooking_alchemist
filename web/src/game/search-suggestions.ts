import { getCtx } from "./context";
import { gameStorage } from "./save/storage";
import { renderCabinet } from "./cabinet";

const SEARCH_HISTORY_KEY = "culinary_search_history";
const MAX_HISTORY = 5;

export function getSearchHistory(): string[] {
  const historyStr = gameStorage.getItem(SEARCH_HISTORY_KEY);
  if (!historyStr) return [];
  try {
    const parsed = JSON.parse(historyStr);
    if (Array.isArray(parsed)) {
      return parsed.filter(item => typeof item === "string");
    }
  } catch (e) {
    console.error("Failed to parse search history:", e);
  }
  return [];
}

export function addSearchHistory(term: string): void {
  const t = term.trim();
  if (!t) return;

  let history = getSearchHistory();
  // Remove if it exists to move it to the front
  history = history.filter(item => item.toLowerCase() !== t.toLowerCase());
  // Add to front
  history.unshift(t);
  // Keep only up to MAX_HISTORY
  history = history.slice(0, MAX_HISTORY);

  gameStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  renderSearchSuggestions();
}

export function renderSearchSuggestions(): void {
  const { dom } = getCtx();
  const { cabinetSearchSuggestions, cabinetSearch } = dom;
  if (!cabinetSearchSuggestions || !cabinetSearch) return;

  const history = getSearchHistory();
  if (history.length === 0) {
    cabinetSearchSuggestions.innerHTML = "";
    cabinetSearchSuggestions.hidden = true;
    return;
  }

  cabinetSearchSuggestions.hidden = false;
  cabinetSearchSuggestions.innerHTML = "";

  const fragment = document.createDocumentFragment();
  history.forEach(term => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "search-suggestion-btn";
    btn.textContent = term;

    btn.addEventListener("click", () => {
      const { state } = getCtx();
      cabinetSearch.value = term;
      state.searchTerm = term;
      renderCabinet();

      // Focus back on the input for a better UX
      cabinetSearch.focus();
    });

    fragment.appendChild(btn);
  });

  cabinetSearchSuggestions.appendChild(fragment);
}
