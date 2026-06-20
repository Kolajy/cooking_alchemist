import { getCtx } from "../context";
import {
  enrichItem,
  getIngredientState,
  getStateLabel,
  isFinalizedRecipe
} from "../ingredients";
import { escapeHtml, escapeHtmlAttr } from "../security/html";
import type { DiscoveryLogEntry } from "../../types";

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short"
});

function formatDiscoveredAt(discoveredAt: number): string {
  if (!discoveredAt) return "Earlier session";
  return timestampFormatter.format(new Date(discoveredAt));
}

function resolveLogEntry(entry: DiscoveryLogEntry) {
  const { state, data } = getCtx();
  if (!state.discoveredIds.has(entry.id)) return null;

  const item = data.DISCOVERABLE_ITEMS[entry.id]
    || data.STARTER_ELEMENTS.find(starter => starter.id === entry.id);
  if (!item) return null;

  return enrichItem({ id: entry.id, ...item });
}

export function renderDiscoveryJournal(): void {
  const { state, dom } = getCtx();
  const { discoveryLogList, discoveryLogCountEl } = dom;
  if (!discoveryLogList) return;

  discoveryLogList.replaceChildren();

  const entries = state.discoveryLog
    .map(entry => ({ entry, item: resolveLogEntry(entry) }))
    .filter((row): row is { entry: DiscoveryLogEntry; item: NonNullable<ReturnType<typeof resolveLogEntry>> } => Boolean(row.item));

  if (discoveryLogCountEl) {
    discoveryLogCountEl.textContent = String(entries.length);
  }

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "discovery-log-empty";
    empty.textContent = "Your hearth journal is blank. Separate, combine, and cook on the counter — each new find is recorded here.";
    discoveryLogList.appendChild(empty);
    return;
  }

  entries.forEach(({ entry, item }) => {
    const row = document.createElement("article");
    row.className = "discovery-log-entry";
    row.setAttribute("role", "listitem");
    if (isFinalizedRecipe(item)) {
      row.classList.add("discovery-log-entry--recipe");
    }

    const stateKey = getIngredientState(item);
    row.innerHTML = `
      <div class="discovery-log-entry__main">
        <span class="discovery-log-entry__emoji" aria-hidden="true">${escapeHtml(item.emoji)}</span>
        <div class="discovery-log-entry__text">
          <span class="discovery-log-entry__name">${escapeHtml(item.name)}</span>
          <span class="discovery-log-entry__meta">
            <span class="origin-badge ${stateKey === "recipe" ? "origin-badge--recipe" : stateKey === "raw" ? "origin-badge--raw" : stateKey === "primal" ? "origin-badge--primitive" : "origin-badge--processed"}">${escapeHtml(getStateLabel(stateKey))}</span>
            ${item.category ? `<span class="discovery-log-entry__category">${escapeHtml(item.category)}</span>` : ""}
          </span>
        </div>
      </div>
      <time class="discovery-log-entry__time" datetime="${entry.discoveredAt ? escapeHtmlAttr(new Date(entry.discoveredAt).toISOString()) : ""}">${escapeHtml(formatDiscoveredAt(entry.discoveredAt))}</time>
    `;

    discoveryLogList.appendChild(row);
  });
}

export function refreshDiscoveryJournalIfOpen(): void {
  const { state } = getCtx();
  if (state.activeSidebarTab === "journal") {
    renderDiscoveryJournal();
  }
}
