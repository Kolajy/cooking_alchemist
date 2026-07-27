import { getCtx } from "../context";
import { escapeHtml } from "../security/html";
import type { IngredientItem } from "../../types";
import { INGREDIENT_PROPERTIES } from "../../data/ingredients/properties";

const PRIMAL_HISTORICAL_INFO: Record<string, string> = {
  water: "The foundation of all culinary science and survival. Historically, settlements arose purely around clean freshwater springs.",
  fruits: "Drawn from ancient orchards and wild trees, fruits were humanity's first sweet delicacies, celebrated in ancient mythology as gifts of nature.",
  berries: "Foraged since the Paleolithic era, berries provided vital nutrients and vivid pigments used in early cave paintings and dye-making.",
  roots: "Valued for their medicinal qualities and resilience. In many ancient cultures, roots were considered anchors of grounding energy.",
  tubers: "The starchy engines of early human civilizations. Cultivating tubers allowed ancient tribes to survive harsh winters and dry seasons.",
  nuts: "High-energy powerhouses gathered by foragers for millennia. Ancient storage pits reveal nuts were hoarded as critical winter survival rations.",
  shellfish: "Ancient coastal societies left massive shell middens, proving that shoreline foraging was one of the earliest reliable food sources.",
  whole_fish: "Fishing techniques date back over 40,000 years, using bone hooks and woven nets. Fish were often dried or salted for trade.",
  mushrooms: "Wild fungi have a mysterious history, treated as both sacred medicine and gourmet delicacies in ancient Roman and Chinese dynasties.",
  seeds: "The birth of agriculture. Collecting and planting wild seeds transformed humans from nomadic foragers to settled farmers.",
  grasses: "Grown along great river valleys, wild grasses were carefully bred over centuries into the staple grains (wheat, rice) that fed empires.",
  shoots: "Representing spring and rebirth, tender shoots have been harvested across East Asia for centuries as purifying, cleansing seasonal foods.",
  livestock: "Animal husbandry marked a massive societal shift. Domesticating livestock provided reliable milk, wool, labor, and protein.",
  garden_produce: "Foraged flora and wild leafy greens were the original garden herbs, used by early healers and cooks to balance flavors and cure ailments.",
  wild_hives: "Honey was the first concentrated sweetener known to humanity. Ancient rock art depicts daring honey hunters scaling cliffs to raid hives."
};

let hoverCardEl: HTMLElement | null = null;
let activeHoverTarget: HTMLElement | null = null;

let cachedCardWidth = 260;
let cachedCardHeight = 180;

export function setupHoverPanel(): void {
  if (hoverCardEl) return;

  hoverCardEl = document.createElement("div");
  hoverCardEl.className = "ingredient-hover-card";
  hoverCardEl.setAttribute("aria-live", "polite");
  hoverCardEl.style.left = "0px";
  hoverCardEl.style.top = "0px";
  document.body.appendChild(hoverCardEl);
}

export function hideHoverPanel(): void {
  if (!hoverCardEl) return;
  hoverCardEl.classList.remove("visible");
  activeHoverTarget = null;
}

function getIngredientStateKey(item: IngredientItem): string {
  if (item.type === "recipe") return "recipe";
  if (item.origin === "primitive") return "primal";
  if (item.origin === "raw") return "raw";
  if (item.origin === "processed") return "prepared";
  return "prepared";
}

function getFriendlyStateLabel(stateKey: string): string {
  const labels: Record<string, string> = {
    primal: "Primal Source",
    raw: "Raw Crop",
    prepared: "Prepared",
    recipe: "Completed Recipe"
  };
  return labels[stateKey] || "Ingredient";
}

function updateHoverPanelPosition(clientX: number, clientY: number): void {
  if (!hoverCardEl) return;

  const padding = 15;

  let x = clientX + padding;
  let y = clientY + padding;

  // Clamp inside the window boundary so it never runs off-screen
  if (x + cachedCardWidth > window.innerWidth) {
    x = clientX - cachedCardWidth - padding;
  }
  if (y + cachedCardHeight > window.innerHeight) {
    y = clientY - cachedCardHeight - padding;
  }

  // Ensure it doesn't clip past top/left
  x = Math.max(padding, x);
  y = Math.max(padding, y);

  hoverCardEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function resolveHoverItem(itemId: string): IngredientItem | null {
  const { data } = getCtx();
  let item = data.DISCOVERABLE_ITEMS[itemId] || null;
  if (!item) {
    item = (data.STARTER_ELEMENTS.find(i => i.id === itemId) as IngredientItem) || null;
  }
  if (!item) {
    item = (data.UNLOCKABLE_ELEMENTS.find(i => i.id === itemId) as IngredientItem) || null;
  }
  return item;
}

function buildHoverProperties(props: Record<string, any>, isPrimal: boolean): HTMLElement[] {
  // Build properties list
  const propList: HTMLElement[] = [];

  const buildPropItem = (icon: string, labelHtmlParts: Array<string | { value: string; capitalize?: boolean }>, isToxic = false) => {
    const div = document.createElement("div");
    div.className = "hover-card__prop-item";
    if (isToxic) {
      div.style.gridColumn = "span 2";
      div.style.color = "var(--color-danger)";
      div.style.fontWeight = "bold";
    }

    const iconSpan = document.createElement("span");
    iconSpan.className = "hover-card__prop-icon";
    iconSpan.setAttribute("aria-hidden", "true");
    iconSpan.textContent = icon;
    div.appendChild(iconSpan);

    const textSpan = document.createElement("span");
    labelHtmlParts.forEach(part => {
      if (typeof part === "string") {
        textSpan.appendChild(document.createTextNode(part));
      } else {
        const valSpan = document.createElement("span");
        valSpan.className = "hover-card__prop-value";
        if (part.capitalize) {
          valSpan.style.textTransform = "capitalize";
        }
        valSpan.textContent = part.value;
        textSpan.appendChild(valSpan);
      }
    });
    div.appendChild(textSpan);
    return div;
  };

  if (!isPrimal) {
    if (props.edibleRaw !== undefined) {
      propList.push(buildPropItem("🥦", ["Raw: ", { value: props.edibleRaw ? "Edible" : "Need Cook" }]));
    }

    if (props.moisture && props.moisture !== "none") {
      propList.push(buildPropItem("💧", ["Moisture: ", { value: String(props.moisture), capitalize: true }]));
    }

    if (props.fat && props.fat !== "none") {
      propList.push(buildPropItem("🧈", ["Fat: ", { value: String(props.fat), capitalize: true }]));
    }

    if (props.structure) {
      propList.push(buildPropItem("🪵", ["Structure: ", { value: String(props.structure), capitalize: true }]));
    }

    if (props.hasOuterLayer) {
      propList.push(buildPropItem("🍊", ["Has Peel"]));
    }

    if (props.hasSeeds) {
      propList.push(buildPropItem("🌱", ["Has Seeds"]));
    }

    if (props.hasBones) {
      propList.push(buildPropItem("🦴", ["Has Bones"]));
    }

    if (props.toxic) {
      propList.push(buildPropItem("⚠️", ["Toxic if raw!"], true));
    }
  }

  return propList;
}

function renderHoverCardContent(item: IngredientItem, itemId: string, stateKey: string, props: Record<string, any>): void {
  const isPrimal = stateKey === "primal";
  const propList = buildHoverProperties(props, isPrimal);
  const stateClass = `hover-card__state hover-card__state--${stateKey}`;
  const stateLabel = getFriendlyStateLabel(stateKey);
  const historicalText = isPrimal ? PRIMAL_HISTORICAL_INFO[itemId] : null;

  // Construct HTML
  hoverCardEl.replaceChildren();

  const header = document.createElement("div");
  header.className = "hover-card__header";
  const emoji = document.createElement("span");
  emoji.className = "hover-card__emoji";
  emoji.setAttribute("aria-hidden", "true");
  emoji.textContent = item.emoji;

  const meta = document.createElement("div");
  meta.className = "hover-card__meta";
  const nameSpan = document.createElement("span");
  nameSpan.className = "hover-card__name";
  nameSpan.textContent = item.name;

  const stateBadge = document.createElement("span");
  stateBadge.className = stateClass;
  stateBadge.textContent = stateLabel;

  meta.append(nameSpan, stateBadge);
  header.append(emoji, meta);
  hoverCardEl.appendChild(header);

  if (item.description) {
    const p = document.createElement("p");
    p.className = "hover-card__description";
    p.textContent = item.description;
    hoverCardEl.appendChild(p);
  }

  if (historicalText) {
    const lore = document.createElement("div");
    lore.className = "hover-card__lore";
    lore.style.borderLeftColor = "hsl(265, 40%, 65%)";
    lore.style.background = "hsla(265, 30%, 93%, 0.45)";
    lore.style.color = "hsl(265, 25%, 36%)";
    lore.style.marginTop = "0.85rem";
    lore.textContent = historicalText;
    hoverCardEl.appendChild(lore);
  }

  if (propList.length > 0) {
    const propsDiv = document.createElement("div");
    propsDiv.className = "hover-card__props";
    propList.forEach(el => propsDiv.appendChild(el));
    hoverCardEl.appendChild(propsDiv);
  }

  if (item.blurb) {
    const blurb = document.createElement("div");
    blurb.className = "hover-card__lore";
    blurb.textContent = item.blurb;
    hoverCardEl.appendChild(blurb);
  }

  if (item.tip) {
    const tipBox = document.createElement("div");
    tipBox.className = "hover-card__tip-box";
    const tipIcon = document.createElement("span");
    tipIcon.className = "hover-card__tip-icon";
    tipIcon.setAttribute("aria-hidden", "true");
    tipIcon.textContent = "💡";
    const tipSpan = document.createElement("span");
    tipSpan.textContent = item.tip;
    tipBox.append(tipIcon, tipSpan);
    hoverCardEl.appendChild(tipBox);
  }
}

export function showHoverPanelForElement(el: HTMLElement, itemId: string, e: MouseEvent): void {
  if (!hoverCardEl || activeHoverTarget === el) return;

  const item = resolveHoverItem(itemId);
  if (!item) return;

  const { data } = getCtx();
  const origin = item.origin || data.getIngredientOrigin(itemId);
  const stateKey = getIngredientStateKey({ ...item, origin });
  const props = item.properties || INGREDIENT_PROPERTIES[itemId] || {};

  activeHoverTarget = el;
  renderHoverCardContent(item, itemId, stateKey, props);
  hoverCardEl.classList.add("visible");

  cachedCardWidth = hoverCardEl.offsetWidth || 260;
  cachedCardHeight = hoverCardEl.offsetHeight || 180;

  updateHoverPanelPosition(e.clientX, e.clientY);
}

let hoverRaf: number | null = null;
let hoverPendingX = 0;
let hoverPendingY = 0;

export function bindHoverPanelEvents(el: HTMLElement, itemId: string): void {
  el.addEventListener("pointerenter", (e) => {
    // Prevent showing the hover card if dragging or holding mouse down
    const { state } = getCtx();
    if (state.draggedElement) return;

    showHoverPanelForElement(el, itemId, e);
  });

  el.addEventListener("pointermove", (e) => {
    const { state } = getCtx();
    if (state.draggedElement) {
      hideHoverPanel();
      return;
    }

    hoverPendingX = e.clientX;
    hoverPendingY = e.clientY;
    if (!hoverRaf) {
      hoverRaf = requestAnimationFrame(() => {
        hoverRaf = null;
        updateHoverPanelPosition(hoverPendingX, hoverPendingY);
      });
    }
  });

  el.addEventListener("pointerleave", () => {
    hideHoverPanel();
  });

  // Also clean up on pointerdown (click-to-drag start)
  el.addEventListener("pointerdown", () => {
    hideHoverPanel();
  });
}
