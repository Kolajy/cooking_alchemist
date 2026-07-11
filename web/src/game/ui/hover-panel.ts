import { getCtx } from "../context";
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

export function setupHoverPanel(): void {
  if (hoverCardEl) return;

  hoverCardEl = document.createElement("div");
  hoverCardEl.className = "ingredient-hover-card";
  hoverCardEl.setAttribute("aria-live", "polite");
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

function updateHoverPanelPosition(e: MouseEvent): void {
  if (!hoverCardEl) return;

  const cardWidth = hoverCardEl.offsetWidth || 260;
  const cardHeight = hoverCardEl.offsetHeight || 180;
  const padding = 15;

  let x = e.clientX + padding;
  let y = e.clientY + padding;

  // Clamp inside the window boundary so it never runs off-screen
  if (x + cardWidth > window.innerWidth) {
    x = e.clientX - cardWidth - padding;
  }
  if (y + cardHeight > window.innerHeight) {
    y = e.clientY - cardHeight - padding;
  }

  // Ensure it doesn't clip past top/left
  x = Math.max(padding, x);
  y = Math.max(padding, y);

  hoverCardEl.style.left = `${x}px`;
  hoverCardEl.style.top = `${y}px`;
}

export function showHoverPanelForElement(el: HTMLElement, itemId: string, e: MouseEvent): void {
  const { data } = getCtx();
  if (!hoverCardEl || activeHoverTarget === el) return;

  // Look up item
  let item = data.DISCOVERABLE_ITEMS[itemId] || null;
  if (!item) {
    item = (data.STARTER_ELEMENTS.find(i => i.id === itemId) as IngredientItem) || null;
  }
  if (!item) {
    item = (data.UNLOCKABLE_ELEMENTS.find(i => i.id === itemId) as IngredientItem) || null;
  }
  if (!item) return;

  // Enrich it with global lookup
  const origin = item.origin || data.getIngredientOrigin(itemId);
  const stateKey = getIngredientStateKey({ ...item, origin });
  const props = item.properties || INGREDIENT_PROPERTIES[itemId] || {};

  activeHoverTarget = el;

  // Build the state badge class & label
  const stateClass = `hover-card__state hover-card__state--${stateKey}`;
  const stateLabel = getFriendlyStateLabel(stateKey);

  const historicalText = stateKey === "primal" ? PRIMAL_HISTORICAL_INFO[itemId] : null;

  hoverCardEl.textContent = "";

  const headerDiv = document.createElement("div");
  headerDiv.className = "hover-card__header";

  const emojiSpan = document.createElement("span");
  emojiSpan.className = "hover-card__emoji";
  emojiSpan.textContent = item.emoji;

  const metaDiv = document.createElement("div");
  metaDiv.className = "hover-card__meta";

  const nameSpan = document.createElement("span");
  nameSpan.className = "hover-card__name";
  nameSpan.textContent = item.name;

  const stateSpan = document.createElement("span");
  stateSpan.className = stateClass;
  stateSpan.textContent = stateLabel;

  metaDiv.append(nameSpan, stateSpan);
  headerDiv.append(emojiSpan, metaDiv);
  hoverCardEl.appendChild(headerDiv);

  if (item.description) {
    const descP = document.createElement("p");
    descP.className = "hover-card__description";
    descP.textContent = item.description;
    hoverCardEl.appendChild(descP);
  }

  if (historicalText) {
    const loreDiv = document.createElement("div");
    loreDiv.className = "hover-card__lore";
    loreDiv.style.borderLeftColor = "hsl(265, 40%, 65%)";
    loreDiv.style.background = "hsla(265, 30%, 93%, 0.45)";
    loreDiv.style.color = "hsl(265, 25%, 36%)";
    loreDiv.style.marginTop = "0.85rem";
    loreDiv.textContent = historicalText;
    hoverCardEl.appendChild(loreDiv);
  }

  const propsDiv = document.createElement("div");
  propsDiv.className = "hover-card__props";
  let hasProps = false;

  const isPrimal = stateKey === "primal";
  if (!isPrimal) {
    const createProp = (iconStr: string, label: string, valText?: string, extraStyle?: string) => {
      const pItem = document.createElement("div");
      pItem.className = "hover-card__prop-item";
      if (extraStyle) pItem.setAttribute("style", extraStyle);

      const pIcon = document.createElement("span");
      pIcon.className = "hover-card__prop-icon";
      pIcon.textContent = iconStr;
      pItem.appendChild(pIcon);

      const pText = document.createElement("span");
      if (valText) {
        pText.textContent = `${label}: `;
        const pVal = document.createElement("span");
        pVal.className = "hover-card__prop-value";
        if (label === "Moisture" || label === "Fat" || label === "Structure") {
          pVal.style.textTransform = "capitalize";
        }
        pVal.textContent = valText;
        pText.appendChild(pVal);
      } else {
        pText.textContent = label;
      }
      pItem.appendChild(pText);
      propsDiv.appendChild(pItem);
      hasProps = true;
    };

    if (props.edibleRaw !== undefined) createProp("🥦", "Raw", props.edibleRaw ? "Edible" : "Need Cook");
    if (props.moisture && props.moisture !== "none") createProp("💧", "Moisture", props.moisture);
    if (props.fat && props.fat !== "none") createProp("🧈", "Fat", props.fat);
    if (props.structure) createProp("🪵", "Structure", props.structure);
    if (props.hasOuterLayer) createProp("🍊", "Has Peel");
    if (props.hasSeeds) createProp("🌱", "Has Seeds");
    if (props.hasBones) createProp("🦴", "Has Bones");
    if (props.toxic) createProp("⚠️", "Toxic if raw!", undefined, "grid-column: span 2; color: var(--color-danger); font-weight: bold;");
  }

  if (hasProps) {
    hoverCardEl.appendChild(propsDiv);
  }

  if (item.blurb) {
    const blurbDiv = document.createElement("div");
    blurbDiv.className = "hover-card__lore";
    blurbDiv.textContent = item.blurb;
    hoverCardEl.appendChild(blurbDiv);
  }

  if (item.tip) {
    const tipDiv = document.createElement("div");
    tipDiv.className = "hover-card__tip-box";
    const tipIconSpan = document.createElement("span");
    tipIconSpan.className = "hover-card__tip-icon";
    tipIconSpan.textContent = "💡";
    const tipTextSpan = document.createElement("span");
    tipTextSpan.textContent = item.tip;
    tipDiv.append(tipIconSpan, tipTextSpan);
    hoverCardEl.appendChild(tipDiv);
  }

  hoverCardEl.classList.add("visible");
  updateHoverPanelPosition(e);
}

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
    updateHoverPanelPosition(e);
  });

  el.addEventListener("pointerleave", () => {
    hideHoverPanel();
  });

  // Also clean up on pointerdown (click-to-drag start)
  el.addEventListener("pointerdown", () => {
    hideHoverPanel();
  });
}
