import { getCtx } from "./context";
import type { IngredientItem } from "../types";

export interface CabinetItem extends IngredientItem {
  stateKey: string;
  description: string;
}

const STATE_META: Record<string, { label: string; title: string; badgeClass: string }> = {
  primal: {
    label: "Primal",
    title: "Primal — broad source ingredient",
    badgeClass: "origin-badge--primitive"
  },
  raw: {
    label: "Raw",
    title: "Raw — separated, unprocessed ingredient",
    badgeClass: "origin-badge--raw"
  },
  prepared: {
    label: "Prepared",
    title: "Prepared — intermediate ingredient made from others",
    badgeClass: "origin-badge--processed"
  },
  recipe: {
    label: "Recipe",
    title: "Recipe — finalized dish ready to serve",
    badgeClass: "origin-badge--recipe"
  }
};

let catalogCache: CabinetItem[] | null = null;
let catalogCacheKey = "";

export function invalidateIngredientCatalog(): void {
  catalogCache = null;
  catalogCacheKey = "";
}

export function enrichItem(item: IngredientItem): IngredientItem {
  const { data } = getCtx();
  return {
    ...item,
    origin: item.origin || data.getIngredientOrigin(item.id)
  };
}

export function isFinalizedRecipe(item: IngredientItem | null | undefined): boolean {
  return item?.type === "recipe";
}

export function getStateLabel(stateKey: string): string {
  return STATE_META[stateKey]?.label || STATE_META.prepared.label;
}

function getStateBadgeTitle(stateKey: string): string {
  return STATE_META[stateKey]?.title || STATE_META.prepared.title;
}

function getStateBadgeClass(stateKey: string): string {
  return STATE_META[stateKey]?.badgeClass || STATE_META.prepared.badgeClass;
}

export function getIngredientState(item: IngredientItem): string {
  const { state, data } = getCtx();
  const origin = item.origin || data.getIngredientOrigin(item.id);

  if (origin === "primitive") return "primal";
  if (origin === "raw") return "raw";
  if (isFinalizedRecipe(item) && state.discoveredIds.has(item.id)) return "recipe";
  if (data.DISCOVERABLE_ITEMS[item.id] && state.discoveredIds.has(item.id)) return "prepared";
  if (origin === "processed") return "prepared";
  return "primal";
}

function describeItem(item: IngredientItem): string {
  return item.description || item.tip || item.blurb || "";
}

function toCabinetItem(item: IngredientItem): CabinetItem {
  const enriched = enrichItem(item);
  return {
    ...enriched,
    stateKey: getIngredientState(enriched),
    description: describeItem(enriched)
  };
}

function getCatalogCacheKey(): string {
  const { state, data } = getCtx();
  return `${state.discoveredIds.size}:${data.Progression.getUnlockedIngredients().join(",")}`;
}

/** All pantry items the player can use, enriched once and cached until discoveries change. */
export function getPlayableIngredientCatalog(): CabinetItem[] {
  const key = getCatalogCacheKey();
  if (catalogCache && catalogCacheKey === key) return catalogCache;

  const { state, data } = getCtx();
  const unlockedMilestoneIngs = data.Progression.getUnlockedIngredients();
  const customUnlocked = [...unlockedMilestoneIngs];
  const fruitTriggers = ["strawberry", "raspberry", "blueberry", "blackberry", "smashed_berries"];
  if (fruitTriggers.some(id => state.discoveredIds.has(id))) {
    customUnlocked.push("fruits");
  }
  const tuberTriggers = ["carrot", "ginger", "beet", "radish", "turnip"];
  if (tuberTriggers.some(id => state.discoveredIds.has(id))) {
    customUnlocked.push("tubers");
  }

  const catalog: CabinetItem[] = [
    ...data.STARTER_ELEMENTS.map(toCabinetItem),
    ...data.UNLOCKABLE_ELEMENTS
      .filter(item => customUnlocked.includes(item.id))
      .map(toCabinetItem)
  ];

  for (const id of state.discoveredIds) {
    const item = data.DISCOVERABLE_ITEMS[id];
    if (item) catalog.push(toCabinetItem({ id, ...item }));
  }

  catalogCache = catalog;
  catalogCacheKey = key;
  return catalog;
}

export function getIngredientTypes(): string[] {
  const { data } = getCtx();
  const types = new Set<string>();
  const collect = (item: IngredientItem) => {
    if (item.category) types.add(item.category);
  };

  data.STARTER_ELEMENTS.forEach(collect);
  data.UNLOCKABLE_ELEMENTS.forEach(collect);
  Object.values(data.DISCOVERABLE_ITEMS).forEach(collect);

  const preferredOrder = ["Liquids", "Produce", "Forage", "Proteins", "Pantry"];
  return [
    ...preferredOrder.filter(type => types.has(type)),
    ...Array.from(types).filter(type => !preferredOrder.includes(type)).sort()
  ];
}

export function isCabinetTypeFilterClear(): boolean {
  const { state } = getCtx();
  return state.typeFilterIncludes.size === 0 && state.typeFilterExcludes.size === 0;
}

export function isCabinetStateFilterClear(): boolean {
  const { state } = getCtx();
  return state.stateFilterIncludes.size === 0 && state.stateFilterExcludes.size === 0;
}

function getCabinetFilterMode(includes: Set<string>, excludes: Set<string>, key: string): string {
  if (includes.has(key)) return "include";
  if (excludes.has(key)) return "exclude";
  return "neutral";
}

function applyCabinetFilterButtonState(btn: Element, mode: string, isAllButton = false): void {
  const el = btn as HTMLElement;
  el.classList.remove("subtab-btn--include", "subtab-btn--exclude", "active");
  if (isAllButton) {
    el.classList.toggle("active", mode === "all");
    el.setAttribute("aria-pressed", mode === "all" ? "true" : "false");
    return;
  }

  if (mode === "include") {
    el.classList.add("subtab-btn--include");
    el.setAttribute("aria-pressed", "true");
  } else if (mode === "exclude") {
    el.classList.add("subtab-btn--exclude");
    el.setAttribute("aria-pressed", "true");
  } else {
    el.setAttribute("aria-pressed", "false");
  }
}

function toggleCabinetFilter(
  includes: Set<string>,
  excludes: Set<string>,
  key: string,
  mode: "include" | "exclude" = "include"
): void {
  if (key === "all") {
    includes.clear();
    excludes.clear();
    return;
  }

  if (mode === "exclude") {
    includes.delete(key);
    if (excludes.has(key)) excludes.delete(key);
    else excludes.add(key);
    return;
  }

  excludes.delete(key);
  if (includes.has(key)) includes.delete(key);
  else includes.add(key);
}

export function toggleCabinetStateFilter(key: string, mode: "include" | "exclude" = "include"): void {
  const { state } = getCtx();
  toggleCabinetFilter(state.stateFilterIncludes, state.stateFilterExcludes, key, mode);
}

export function toggleCabinetTypeFilter(key: string, mode: "include" | "exclude" = "include"): void {
  const { state } = getCtx();
  toggleCabinetFilter(state.typeFilterIncludes, state.typeFilterExcludes, key, mode);
}

export function matchesCabinetStateFilter(item: CabinetItem): boolean {
  const { state } = getCtx();

  if (state.stateFilterExcludes.has("recent") && state.recentlyDiscoveredIds.includes(item.id)) {
    return false;
  }
  if (state.stateFilterExcludes.has(item.stateKey)) return false;

  if (state.stateFilterIncludes.has("recent") && !state.recentlyDiscoveredIds.includes(item.id)) {
    return false;
  }

  const stateIncludes = [...state.stateFilterIncludes].filter(key => key !== "recent");
  if (stateIncludes.length > 0 && !stateIncludes.includes(item.stateKey)) return false;

  return true;
}

export function matchesCabinetTypeFilter(item: CabinetItem): boolean {
  const { state } = getCtx();
  const category = item.category || "";

  if (state.typeFilterExcludes.has(category)) return false;
  if (state.typeFilterIncludes.size > 0 && !state.typeFilterIncludes.has(category)) return false;

  return true;
}

export function syncCabinetFilterButtons(): void {
  const { state, dom } = getCtx();
  const { ingredientTypesContainer, ingredientStatesContainer } = dom;

  if (ingredientTypesContainer) {
    ingredientTypesContainer.querySelectorAll(".subtab-btn[data-type]").forEach(btn => {
      const key = (btn as HTMLElement).dataset.type || "";
      if (key === "all") {
        applyCabinetFilterButtonState(btn, isCabinetTypeFilterClear() ? "all" : "neutral", true);
        return;
      }
      applyCabinetFilterButtonState(
        btn,
        getCabinetFilterMode(state.typeFilterIncludes, state.typeFilterExcludes, key)
      );
    });
  }

  if (ingredientStatesContainer) {
    ingredientStatesContainer.querySelectorAll(".subtab-btn[data-state]").forEach(btn => {
      const key = (btn as HTMLElement).dataset.state || "";
      if (key === "all") {
        applyCabinetFilterButtonState(btn, isCabinetStateFilterClear() ? "all" : "neutral", true);
        return;
      }
      applyCabinetFilterButtonState(
        btn,
        getCabinetFilterMode(state.stateFilterIncludes, state.stateFilterExcludes, key)
      );
    });
  }
}

export function buildCabinetFilterButtons(): void {
  const { dom } = getCtx();
  const { ingredientTypesContainer } = dom;

  if (ingredientTypesContainer) {
    ingredientTypesContainer.textContent = "";
    const allTypeBtn = document.createElement("button");
    allTypeBtn.type = "button";
    allTypeBtn.className = "subtab-btn";
    allTypeBtn.dataset.type = "all";
    allTypeBtn.textContent = "All Categories";
    ingredientTypesContainer.appendChild(allTypeBtn);

    getIngredientTypes().forEach(type => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "subtab-btn";
      btn.dataset.type = type;
      btn.textContent = type;
      ingredientTypesContainer.appendChild(btn);
    });
  }

  syncCabinetFilterButtons();
}

export function appendIngredientMarkup(el: HTMLElement, item: IngredientItem, showBadge = true): void {
  const itemData = enrichItem(item);
  const stateKey = getIngredientState(itemData);

  const emojiSpan = document.createElement("span");
  emojiSpan.className = "element-emoji";
  emojiSpan.textContent = itemData.emoji;

  const nameSpan = document.createElement("span");
  nameSpan.className = "element-name";
  nameSpan.textContent = itemData.name;

  el.appendChild(emojiSpan);
  el.appendChild(nameSpan);

  if (showBadge) {
    const badgeSpan = document.createElement("span");
    badgeSpan.className = `origin-badge ${getStateBadgeClass(stateKey)}`;
    badgeSpan.title = getStateBadgeTitle(stateKey);
    badgeSpan.textContent = getStateLabel(stateKey);
    el.appendChild(badgeSpan);
  }
}

export function appendCabinetItemMarkup(el: HTMLElement, item: CabinetItem): void {
  const headDiv = document.createElement("div");
  headDiv.className = "cabinet-item__head";

  const emojiSpan = document.createElement("span");
  emojiSpan.className = "element-emoji";
  emojiSpan.textContent = item.emoji;

  const metaDiv = document.createElement("div");
  metaDiv.className = "cabinet-item__meta";

  const nameSpan = document.createElement("span");
  nameSpan.className = "element-name";
  nameSpan.textContent = item.name;

  const badgeSpan = document.createElement("span");
  badgeSpan.className = `origin-badge ${getStateBadgeClass(item.stateKey)}`;
  badgeSpan.title = getStateBadgeTitle(item.stateKey);
  badgeSpan.textContent = getStateLabel(item.stateKey);

  metaDiv.appendChild(nameSpan);
  metaDiv.appendChild(badgeSpan);
  headDiv.appendChild(emojiSpan);
  headDiv.appendChild(metaDiv);

  el.appendChild(headDiv);

  if (item.description) {
    const descP = document.createElement("p");
    descP.className = "element-desc";
    descP.textContent = item.description;
    el.appendChild(descP);
  }
}

export function resolvePlayableIngredient(itemId: string): IngredientItem | undefined {
  return getPlayableIngredientCatalog().find(item => item.id === itemId);
}

export function getProcessedDiscoveryCount(): number {
  const { state, data } = getCtx();
  return Array.from(state.discoveredIds).filter(id => {
    const item = data.DISCOVERABLE_ITEMS[id];
    return item && isFinalizedRecipe(item);
  }).length;
}
