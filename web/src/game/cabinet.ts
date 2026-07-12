import { getCtx } from "./context";
import {
  getPlayableIngredientCatalog,
  buildCabinetItemMarkup,
  matchesCabinetStateFilter,
  matchesCabinetTypeFilter
} from "./ingredients";
import { onCabinetPointerDown, handleCabinetItemKeyboardSpawn } from "./canvas/cabinet-drag";
import { bindHoverPanelEvents } from "./ui/hover-panel";
import { INGREDIENT_PROPERTIES } from "../data/ingredients/properties";

const recentHighlightTimers = new Map<string, ReturnType<typeof setTimeout>>();
const STATE_SORT_ORDER: Record<string, number> = { primal: 0, raw: 1, prepared: 2, recipe: 3 };

function scheduleRecentHighlightClear(id: string): void {
  if (recentHighlightTimers.has(id)) return;

  const timer = setTimeout(() => {
    const { state, dom } = getCtx();
    state.recentHighlightIds.delete(id);
    recentHighlightTimers.delete(id);
    dom.cabinetItems
      ?.querySelector(`[data-id="${id}"]`)
      ?.classList.remove("cabinet-item--recent-new");
  }, 2600);

  recentHighlightTimers.set(id, timer);
}

export function renderCabinet(): void {
  const { state, dom } = getCtx();
  const { cabinetItems } = dom;
  if (!cabinetItems) return;

  cabinetItems.innerHTML = "";
  const term = state.searchTerm.toLowerCase();

  // Parse special tags/type queries from search input (e.g. ":raw", ":liquid", ":protein")
  let parsedSearchTerm = term;
  const queries: string[] = [];
  const tagRegex = /:([a-zA-Z0-9_-]+)/g;
  let match;
  while ((match = tagRegex.exec(term)) !== null) {
    queries.push(match[1].toLowerCase());
  }
  parsedSearchTerm = term.replace(tagRegex, "").trim();

  const filtered = getPlayableIngredientCatalog().filter(item => {
    // 1. Text Search
    if (parsedSearchTerm && !item.name.toLowerCase().includes(parsedSearchTerm) && !(item.description || "").toLowerCase().includes(parsedSearchTerm)) {
      return false;
    }

    // 2. Tag Queries
    for (const query of queries) {
      const props = item.properties || INGREDIENT_PROPERTIES[item.id] || {};

      if (query === "raw") {
        if (item.stateKey !== "raw" && props.edibleRaw !== true) return false;
      } else if (query === "edibleraw" || query === "edible") {
        if (props.edibleRaw !== true) return false;
      } else if (query === "needcook" || query === "cook") {
        if (props.edibleRaw !== false) return false;
      } else if (query === "toxic") {
        if (props.toxic !== true) return false;
      } else if (query === "seed" || query === "seeds" || query === "hasseeds") {
        if (props.hasSeeds !== true) return false;
      } else if (query === "bone" || query === "bones" || query === "hasbones") {
        if (props.hasBones !== true) return false;
      } else if (query === "peel" || query === "outer" || query === "hasouterlayer" || query === "peelable") {
        if (props.hasOuterLayer !== true) return false;
      } else if (query === "liquid" || query === "soft" || query === "hard") {
        if (props.structure !== query) return false;
      } else if (query === "moist" || query === "moisture") {
        if (props.moisture !== "high" && props.moisture !== "medium") return false;
      } else if (query === "dry") {
        if (props.moisture !== "low" && props.moisture !== "none") return false;
      } else if (query === "fat" || query === "fatty") {
        if (props.fat !== "high" && props.fat !== "medium") return false;
      } else if (query === "lean") {
        if (props.fat !== "low" && props.fat !== "none") return false;
      } else {
        const cat = (item.category || "").toLowerCase();
        const stateKey = (item.stateKey || "").toLowerCase();
        if (!cat.includes(query) && !stateKey.includes(query)) {
          return false;
        }
      }
    }

    return matchesCabinetStateFilter(item) && matchesCabinetTypeFilter(item);
  });

  filtered.sort((a, b) => {
    if (state.stateFilterIncludes.has("recent")) {
      const order = new Map(state.recentlyDiscoveredIds.map((id, index) => [id, index]));
      return (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999);
    }

    const stateDiff = (STATE_SORT_ORDER[a.stateKey] ?? 2) - (STATE_SORT_ORDER[b.stateKey] ?? 2);
    if (stateDiff !== 0) return stateDiff;
    return a.name.localeCompare(b.name);
  });

  const fragment = document.createDocumentFragment();

  filtered.forEach(item => {
    const el = document.createElement("div");
    el.className = "alchemy-element";
    el.setAttribute("role", "listitem");
    el.setAttribute("tabindex", "0");
    el.dataset.id = item.id;
    el.dataset.origin = item.origin || "";
    el.dataset.state = item.stateKey;

    if (state.recentHighlightIds.has(item.id)) {
      el.classList.add("cabinet-item--recent-new");
      scheduleRecentHighlightClear(item.id);
    }

    el.innerHTML = buildCabinetItemMarkup(item);
    el.title = item.description ? `${item.name} — ${item.description}` : `Drag or click to add ${item.name}`;
    el.addEventListener("pointerdown", onCabinetPointerDown);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCabinetItemKeyboardSpawn(item);
      }
    });

    bindHoverPanelEvents(el, item.id);
    fragment.appendChild(el);
  });

  cabinetItems.appendChild(fragment);

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "cabinet-empty-hint";
    empty.textContent = "No ingredients match this filter.";
    cabinetItems.appendChild(empty);
  }
}
