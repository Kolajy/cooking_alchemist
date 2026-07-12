// @ts-nocheck
/**
 * Culinary Alchemy - Ingredient Progress Graph
 * Nodes = ingredients. Edges = transitions (technique or combine) between them.
 */

import { registry } from "./core/bundle_registry";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] || ch
  ));
}

const NODE_W = 108;
const NODE_H = 72;
const GAP_X = 20;
const GAP_Y = 110;
const PADDING = 48;

function getItemById(id) {
  const starter = registry.STARTER_ELEMENTS.find(item => item.id === id);
  if (starter) return starter;

  const unlockable = registry.UNLOCKABLE_ELEMENTS.find(item => item.id === id);
  if (unlockable) return unlockable;

  const discovered = registry.DISCOVERABLE_ITEMS[id];
  if (discovered) return { id, ...discovered };

  return { id, name: id, emoji: "❓", origin: "raw" };
}

function isIngredientUnlocked(id, context) {
  if (registry.STARTER_ELEMENTS.some(item => item.id === id)) return true;

  if (context.discoveredIds.has(id)) return true;

  const isMilestonePrimitive = registry.UNLOCKABLE_ELEMENTS.some(item => item.id === id);
  if (isMilestonePrimitive && context.milestoneIngredientIds.includes(id)) {
    return true;
  }

  return false;
}

  function getDisplayItem(id, context) {
    const item = getItemById(id);
    if (isIngredientUnlocked(id, context)) {
      return item;
    }

    return {
      ...item,
      id,
      name: "???",
      emoji: "???"
    };
  }

function buildRecipeTransitions() {
  return registry.TRANSITION_INDEX?.graphEdges || registry.TRANSITION_INDEX?.toGraphEdges?.() || [];
}

function collectIngredientIds(transitions) {
  const ids = new Set();

  [...registry.STARTER_ELEMENTS, ...registry.UNLOCKABLE_ELEMENTS].forEach(item => {
    ids.add(item.id);
  });

  Object.keys(registry.DISCOVERABLE_ITEMS).forEach(id => ids.add(id));
  transitions.forEach(transition => {
    transition.inputs.forEach(inputId => ids.add(inputId));
    ids.add(transition.output);
  });

  return ids;
}

function isUnlockablePrimitive(id) {
  return registry.UNLOCKABLE_ELEMENTS.some(item => item.id === id);
}

  function collectAncestorIds(id, transitions, maxDepth = Infinity) {
    const ancestors = new Set();
    const seen = new Set([id]);
    let frontier = [id];
    let depth = 0;

    while (frontier.length > 0 && depth < maxDepth) {
      const next = [];
      frontier.forEach(current => {
        transitions.forEach(transition => {
          if (transition.output !== current) return;
          transition.inputs.forEach(inputId => {
            if (seen.has(inputId)) return;
            seen.add(inputId);
            ancestors.add(inputId);
            next.push(inputId);
          });
        });
      });
      frontier = next;
      depth += 1;
    }

    return ancestors;
  }

  function collectDescendantIds(id, transitions, maxDepth = Infinity) {
    const descendants = new Set();
    const seen = new Set([id]);
    let frontier = [id];
    let depth = 0;

    while (frontier.length > 0 && depth < maxDepth) {
      const next = [];
      frontier.forEach(current => {
        transitions.forEach(transition => {
          if (!transition.inputs.includes(current)) return;
          if (seen.has(transition.output)) return;
          seen.add(transition.output);
          descendants.add(transition.output);
          next.push(transition.output);
        });
      });
      frontier = next;
      depth += 1;
    }

    return descendants;
  }

  function filterIngredientIdsByFocus(allIds, transitions, focusId, maxDepth = Infinity) {
    if (!focusId) return allIds;

    const focused = new Set([focusId]);
    collectAncestorIds(focusId, transitions, maxDepth).forEach(id => focused.add(id));
    collectDescendantIds(focusId, transitions, maxDepth).forEach(id => focused.add(id));

    const result = new Set();
    if (allIds.size < focused.size) {
      allIds.forEach(id => {
        if (focused.has(id)) result.add(id);
      });
    } else {
      focused.forEach(id => {
        if (allIds.has(id)) result.add(id);
      });
    }
    return result;
  }

  function filterTransitionsByIngredients(transitions, ingredientIds) {
    return transitions.filter(transition => {
      if (!ingredientIds.has(transition.output)) return false;
      return transition.inputs.every(inputId => ingredientIds.has(inputId));
    });
  }

  function computeDepthsFromFocus(focusId, ingredientIds, transitions) {
    const depths = new Map();
    depths.set(focusId, 0);

    const visitUp = [focusId];
    const seenUp = new Set([focusId]);
    while (visitUp.length > 0) {
      const current = visitUp.shift();
      const currentDepth = depths.get(current);

      transitions.forEach(transition => {
        if (transition.output !== current) return;
        transition.inputs.forEach(inputId => {
          if (!ingredientIds.has(inputId)) return;
          const nextDepth = currentDepth - 1;
          if (!depths.has(inputId) || nextDepth < depths.get(inputId)) {
            depths.set(inputId, nextDepth);
          }
          if (!seenUp.has(inputId)) {
            seenUp.add(inputId);
            visitUp.push(inputId);
          }
        });
      });
    }

    let changed = true;
    let guard = 0;
    while (changed && guard < ingredientIds.size + 5) {
      changed = false;
      guard += 1;

      transitions.forEach(transition => {
        if (!ingredientIds.has(transition.output)) return;

        const parentDepths = transition.inputs
          .map(inputId => depths.get(inputId))
          .filter(depth => depth !== undefined);

        if (parentDepths.length !== transition.inputs.length) return;

        const nextDepth = Math.max(...parentDepths) + 1;
        const currentDepth = depths.get(transition.output);

        if (currentDepth === undefined || nextDepth > currentDepth) {
          depths.set(transition.output, nextDepth);
          changed = true;
        }
      });
    }

    ingredientIds.forEach(id => {
      if (!depths.has(id)) depths.set(id, 0);
    });

    return depths;
  }

  function isTransitionDiscovered(transition, context) {
    if (!isIngredientUnlocked(transition.output, context)) return false;
    return transition.inputs.every(inputId => isIngredientUnlocked(inputId, context));
  }

  function listFilterableIngredients(ingredientIds, context) {
    return [...ingredientIds]
      .filter(id => isIngredientUnlocked(id, context))
      .map(id => ({ id, name: getItemById(id).name, emoji: getItemById(id).emoji }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function computeDepths(ingredientIds, transitions) {
    const depths = new Map();

    registry.STARTER_ELEMENTS.forEach(item => depths.set(item.id, 0));
    registry.UNLOCKABLE_ELEMENTS.forEach(item => depths.set(item.id, -1));

    let changed = true;
    let guard = 0;

    while (changed && guard < ingredientIds.size + 5) {
      changed = false;
      guard += 1;

      transitions.forEach(transition => {
        const parentDepths = transition.inputs
          .map(inputId => depths.get(inputId))
          .filter(depth => depth !== undefined);

        if (parentDepths.length !== transition.inputs.length) return;

        const nextDepth = Math.max(...parentDepths) + 1;
        const currentDepth = depths.get(transition.output);

        if (currentDepth === undefined || nextDepth > currentDepth) {
          depths.set(transition.output, nextDepth);
          changed = true;
        }
      });
    }

    ingredientIds.forEach(id => {
      if (!depths.has(id)) depths.set(id, 1);
    });

    return depths;
  }

  function getRowLabel(depth, minDepth, focusId) {
    if (focusId) {
      if (depth < 0) return "Sources";
      if (depth === 0) return "Focused ingredient";
      if (depth === 1) return "Direct results";
      return `Further results (tier ${depth})`;
    }
    if (depth === -1) return "Milestone unlocks";
    if (depth === 0) return "Starting ingredients";
    if (depth === 1) return "First transformations";
    return `Tier ${depth - minDepth + 1}`;
  }

  function fitGraphToViewport(viewport, layout, viewState) {
    const vpW = viewport.clientWidth;
    const vpH = viewport.clientHeight;
    if (!vpW || !vpH || !layout.width || !layout.height) return;

    const padding = 24;
    const scaleX = (vpW - padding) / layout.width;
    const scaleY = (vpH - padding) / layout.height;
    viewState.scale = Math.min(1.15, Math.max(0.25, Math.min(scaleX, scaleY)));
    viewState.panX = (vpW - layout.width * viewState.scale) / 2;
    viewState.panY = (vpH - layout.height * viewState.scale) / 2;
  }

  function appendRowLabels(group, layout, focusId) {
    if (!layout.sortedDepths || !layout.depths) return;

    layout.sortedDepths.forEach(depth => {
      const nodesAtDepth = [...layout.positions.entries()].filter(([id]) => layout.depths.get(id) === depth);
      if (nodesAtDepth.length === 0) return;

      const minX = Math.min(...nodesAtDepth.map(([, pos]) => pos.x));
      const labelY = nodesAtDepth[0][1].y - NODE_H / 2 - 10;
      const label = createSvgEl("text", {
        class: "graph-row-label",
        x: String(Math.max(PADDING, minX - NODE_W / 2)),
        y: String(labelY),
        "text-anchor": "start"
      });
      label.textContent = getRowLabel(depth, layout.minDepth ?? 0, focusId);
      group.appendChild(label);
    });
  }

  function computePositions(ingredientIds, depths) {
    const layers = new Map();

    ingredientIds.forEach(id => {
      const depth = depths.get(id) ?? 0;
      if (!layers.has(depth)) layers.set(depth, []);
      layers.get(depth).push(id);
    });

    const sortedDepths = [...layers.keys()].sort((a, b) => a - b);
    const minDepth = sortedDepths[0] ?? 0;
    let maxRowWidth = 0;

    sortedDepths.forEach(depth => {
      const row = layers.get(depth).sort((a, b) => getItemById(a).name.localeCompare(getItemById(b).name));
      const rowWidth = row.length * NODE_W + Math.max(0, row.length - 1) * GAP_X;
      maxRowWidth = Math.max(maxRowWidth, rowWidth);
    });

    const positions = new Map();
    const rowCount = sortedDepths.length;
    const totalHeight = rowCount * GAP_Y + PADDING * 2 + 24;

    sortedDepths.forEach(depth => {
      const row = layers.get(depth).sort((a, b) => getItemById(a).name.localeCompare(getItemById(b).name));
      const rowWidth = row.length * NODE_W + Math.max(0, row.length - 1) * GAP_X;
      const startX = PADDING + (maxRowWidth - rowWidth) / 2;
      const rowIndex = depth - minDepth;
      const y = PADDING + 24 + rowIndex * GAP_Y;

      row.forEach((id, index) => {
        positions.set(id, {
          x: startX + index * (NODE_W + GAP_X) + NODE_W / 2,
          y: y + NODE_H / 2
        });
      });
    });

    return {
      positions,
      width: maxRowWidth + PADDING * 2,
      height: totalHeight,
      sortedDepths,
      minDepth,
      depths
    };
  }

  function createSvgEl(name, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attrs || {}).forEach(([key, value]) => el.setAttribute(key, value));
    return el;
  }

  function getTechniqueName(toolId) {
    if (!toolId) return "Process";
    const skill = registry.PROGRESSION_TIERS && registry.PROGRESSION_TIERS[toolId];
    if (skill) return skill.name;
    const playerActions = registry.PROGRESSION_CONFIG?.playerActions || {};
    const action = Object.values(playerActions).find(entry => entry.mode === toolId);
    if (action) return action.name;
    return toolId.replace(/_/g, " ");
  }

  function getTechniqueEmoji(toolId) {
    if (!toolId) return "⚗️";
    const skill = registry.PROGRESSION_TIERS && registry.PROGRESSION_TIERS[toolId];
    if (skill?.emoji) return skill.emoji;
    const playerActions = registry.PROGRESSION_CONFIG?.playerActions || {};
    const action = Object.values(playerActions).find(entry => entry.mode === toolId);
    if (action?.emoji) return action.emoji;
    return "⚗️";
  }

  function getTransitionMarkerSymbol(transition) {
    if (transition.kind === "combine") return "+";
    return getTechniqueEmoji(transition.tool);
  }

  function formatTransitionPath(transition, context) {
    const inputs = transition.inputs.map(id => {
      const item = getDisplayItem(id, context);
      return `${item.emoji} ${item.name}`;
    });
    const output = getDisplayItem(transition.output, context);
    const outputLabel = `${output.emoji} ${output.name}`;

    if (transition.kind === "combine") {
      return {
        from: inputs.join(" + "),
        via: "Combine",
        to: outputLabel
      };
    }

    return {
      from: inputs[0],
      via: `${getTechniqueEmoji(transition.tool)} ${getTechniqueName(transition.tool)}`,
      to: outputLabel
    };
  }

  function appendTransitionMarker(group, x, y, transition, unlocked) {
    const radius = 11;
    const bg = createSvgEl("circle", {
      class: `graph-transition-marker${unlocked ? " is-unlocked" : ""}`,
      cx: String(x),
      cy: String(y),
      r: String(radius)
    });

    const symbol = createSvgEl("text", {
      class: "graph-transition-marker-symbol",
      x: String(x),
      y: String(y + 1),
      "text-anchor": "middle",
      "dominant-baseline": "middle"
    });
    symbol.textContent = getTransitionMarkerSymbol(transition);

    group.appendChild(bg);
    group.appendChild(symbol);
  }

  function appendTransitionsList(container, transitions, context, visibleSet) {
    const discovered = transitions.filter(transition => {
      if (!isTransitionDiscovered(transition, context)) return false;
      return transition.inputs.every(id => visibleSet.has(id)) && visibleSet.has(transition.output);
    });
    if (discovered.length === 0) return;

    const panel = document.createElement("div");
    panel.className = "graph-transitions-panel";

    const title = document.createElement("h3");
    title.className = "graph-transitions-panel__title";
    title.textContent = "Known paths";
    panel.appendChild(title);

    const list = document.createElement("ul");
    list.className = "graph-transitions-list";

    discovered
      .slice()
      .sort((a, b) => {
        const nameA = getDisplayItem(a.output, context).name;
        const nameB = getDisplayItem(b.output, context).name;
        return nameA.localeCompare(nameB) || a.id.localeCompare(b.id);
      })
      .forEach(transition => {
        const path = formatTransitionPath(transition, context);
        const item = document.createElement("li");
        item.className = `graph-transitions-list__item graph-transitions-list__item--${transition.kind}`;
        item.innerHTML = `
          <span class="graph-path-from">${escapeHtml(path.from)}</span>
          <span class="graph-path-via">${escapeHtml(path.via)}</span>
          <span class="graph-path-to">${escapeHtml(path.to)}</span>
        `;
        list.appendChild(item);
      });

    panel.appendChild(list);
    container.appendChild(panel);
  }

  function truncate(text, max) {
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1)}…`;
  }

  function nodeBottom(pos) {
    return { x: pos.x, y: pos.y + NODE_H / 2 - 6 };
  }

  function nodeTop(pos) {
    return { x: pos.x, y: pos.y - NODE_H / 2 + 6 };
  }

  function bezierPath(x1, y1, x2, y2) {
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  }

  function renderTechniqueTransition(group, transition, layout, unlocked) {
    const fromPos = layout.positions.get(transition.inputs[0]);
    const toPos = layout.positions.get(transition.output);
    if (!fromPos || !toPos) return;

    const start = nodeBottom(fromPos);
    const end = nodeTop(toPos);
    const labelX = (start.x + end.x) / 2;
    const labelY = (start.y + end.y) / 2;

    const path = createSvgEl("path", {
      class: `graph-transition-line graph-transition-line--technique${unlocked ? " is-unlocked" : ""}`,
      d: bezierPath(start.x, start.y, end.x, end.y),
      "marker-end": "url(#graph-arrow-technique)"
    });
    group.appendChild(path);
    appendTransitionMarker(group, labelX, labelY, transition, unlocked);
  }

  function renderCombineTransition(group, transition, layout, unlocked) {
    const inputPositions = transition.inputs
      .map(id => layout.positions.get(id))
      .filter(Boolean);

    const outputPos = layout.positions.get(transition.output);
    if (inputPositions.length === 0 || !outputPos) return;

    const inputBottoms = inputPositions.map(pos => nodeBottom(pos));
    const junction = {
      x: inputBottoms.reduce((sum, p) => sum + p.x, 0) / inputBottoms.length,
      y: Math.max(...inputBottoms.map(p => p.y)) + 28
    };

    appendTransitionMarker(group, junction.x, junction.y, transition, unlocked);

    inputBottoms.forEach(start => {
      const path = createSvgEl("path", {
        class: `graph-transition-line graph-transition-line--combine-in${unlocked ? " is-unlocked" : ""}`,
        d: bezierPath(start.x, start.y, junction.x, junction.y - 16)
      });
      group.appendChild(path);
    });

    const end = nodeTop(outputPos);
    const outPath = createSvgEl("path", {
      class: `graph-transition-line graph-transition-line--combine-out${unlocked ? " is-unlocked" : ""}`,
      d: bezierPath(junction.x, junction.y + 16, end.x, end.y),
      "marker-end": "url(#graph-arrow-combine)"
    });
    group.appendChild(outPath);
  }

  function filterSearchResults(options, term, limit = 12) {
    const query = term.trim().toLowerCase();
    const pool = query
      ? options.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      )
      : options;
    return pool.slice(0, limit);
  }

  function appendGraphSearchControl(toolbar, filterOptions, focusId, context, rerenderWithContext) {
    const wrap = document.createElement("div");
    wrap.className = "graph-search-wrap";

    const label = document.createElement("label");
    label.className = "graph-focus-control graph-search-control";
    label.innerHTML = `
      <span class="graph-focus-label">Search</span>
      <input
        type="search"
        id="graph-ingredient-search"
        class="graph-search-input"
        placeholder="Find an ingredient…"
        autocomplete="off"
        spellcheck="false"
        aria-label="Search ingredients to show on the progress map"
        aria-controls="graph-search-results"
        aria-expanded="false"
      />
    `;

    const input = label.querySelector("#graph-ingredient-search");
    input.value = context.searchTerm || "";

    const results = document.createElement("ul");
    results.id = "graph-search-results";
    results.className = "graph-search-results";
    results.setAttribute("role", "listbox");
    results.hidden = true;

    function syncResultsVisibility() {
      const open = document.activeElement === input && results.childElementCount > 0;
      results.hidden = !open;
      input.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function paintResults() {
      results.innerHTML = "";
      const matches = filterSearchResults(filterOptions, input.value);

      if (matches.length === 0) {
        const empty = document.createElement("li");
        empty.className = "graph-search-empty";
        empty.textContent = input.value.trim()
          ? "No ingredients match that search."
          : "Type to find an ingredient.";
        results.appendChild(empty);
        syncResultsVisibility();
        return;
      }

      matches.forEach(item => {
        const option = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "graph-search-result";
        btn.setAttribute("role", "option");
        btn.dataset.ingredientId = item.id;
        btn.textContent = `${item.emoji} ${item.name}`;
        btn.addEventListener("mousedown", event => event.preventDefault());
        btn.addEventListener("click", () => {
          rerenderWithContext({
            focusIngredientId: item.id,
            searchTerm: input.value
          });
        });
        option.appendChild(btn);
        results.appendChild(option);
      });

      syncResultsVisibility();
    }

    input.addEventListener("input", () => {
      if (typeof context.onSearchChange === "function") {
        context.onSearchChange(input.value);
      }
      paintResults();
    });

    input.addEventListener("focus", paintResults);
    input.addEventListener("blur", () => {
      setTimeout(syncResultsVisibility, 120);
    });

    wrap.appendChild(label);
    wrap.appendChild(results);

    if (focusId) {
      const focused = filterOptions.find(item => item.id === focusId) || {
        id: focusId,
        name: getItemById(focusId).name,
        emoji: getItemById(focusId).emoji
      };

      const chip = document.createElement("div");
      chip.className = "graph-focus-chip";
      chip.innerHTML = `
        <span class="graph-focus-chip__label">Showing</span>
        <span class="graph-focus-chip__value">${escapeHtml(focused.emoji)} ${escapeHtml(focused.name)}</span>
        <button type="button" class="graph-focus-chip__clear" aria-label="Clear ingredient selection">×</button>
      `;
      chip.querySelector(".graph-focus-chip__clear").addEventListener("click", () => {
        rerenderWithContext({ focusIngredientId: null });
      });
      wrap.appendChild(chip);
    }

    toolbar.appendChild(wrap);
    paintResults();
  }

  function renderGraph(container, context) {
    container.innerHTML = "";

    const allTransitions = buildRecipeTransitions();
    const allIngredientIds = collectIngredientIds(allTransitions);
    const focusId = context.focusIngredientId || null;
    const focusDepth = context.focusDepth == null ? 2 : context.focusDepth;
    const showLocked = context.showLocked !== false;
    const filterOptions = listFilterableIngredients(allIngredientIds, context);

    const viewport = document.createElement("div");
    viewport.className = "graph-viewport";
    viewport.style.opacity = "0";

    const toolbar = document.createElement("div");
    toolbar.className = "graph-toolbar";

    function rerenderWithContext(updates) {
      const nextContext = { ...context, ...updates };
      if (typeof context.onFocusChange === "function" && "focusIngredientId" in updates) {
        context.onFocusChange(updates.focusIngredientId);
      }
      if (typeof context.onDepthChange === "function" && "focusDepth" in updates) {
        context.onDepthChange(updates.focusDepth);
      }
      if (typeof context.onSearchChange === "function" && "searchTerm" in updates) {
        context.onSearchChange(updates.searchTerm);
      }
      renderGraph(container, nextContext);
    }

    appendGraphSearchControl(toolbar, filterOptions, focusId, context, rerenderWithContext);

    let depthControl = null;
    if (focusId) {
      depthControl = document.createElement("label");
      depthControl.className = "graph-focus-control";
      depthControl.innerHTML = `
        <span class="graph-focus-label">Connections</span>
        <select id="graph-focus-depth" class="graph-focus-select" aria-label="How many degrees of connection to show">
          <option value="1">1 degree</option>
          <option value="2">2 degrees</option>
          <option value="all">Everything</option>
        </select>
      `;
      depthControl.querySelector("#graph-focus-depth").value = String(focusDepth);
    }

    const toggles = document.createElement("div");
    toggles.className = "graph-toolbar-toggles";
    toggles.innerHTML = `
      <label class="graph-toggle">
        <input type="checkbox" id="graph-show-locked" ${showLocked ? "checked" : ""}>
        Show undiscovered
      </label>
    `;

    const zoomControls = document.createElement("div");
    zoomControls.className = "graph-zoom-controls";
    if (focusId) {
      zoomControls.innerHTML = `
        <button type="button" class="btn btn-secondary graph-zoom-btn" data-zoom="out" aria-label="Zoom out">−</button>
        <button type="button" class="btn btn-secondary graph-zoom-btn" data-zoom="in" aria-label="Zoom in">+</button>
        <button type="button" class="btn btn-secondary graph-zoom-btn" data-zoom="reset" aria-label="Reset view">Reset</button>
      `;
    }

    if (depthControl) toolbar.appendChild(depthControl);
    toolbar.appendChild(toggles);
    if (focusId) toolbar.appendChild(zoomControls);

    container.appendChild(toolbar);

    if (!focusId) {
      const empty = document.createElement("div");
      empty.className = "graph-viewport graph-viewport--empty";
      empty.innerHTML = `<p class="graph-empty-message">Search for an ingredient above to explore its recipes and connections.</p>`;
      container.appendChild(empty);

      const lockedToggle = toolbar.querySelector("#graph-show-locked");
      lockedToggle.addEventListener("change", () => {
        rerenderWithContext({ showLocked: lockedToggle.checked });
      });
      return;
    }

    const maxDepth = focusDepth === "all" ? Infinity : Number(focusDepth);
    const ingredientIds = filterIngredientIdsByFocus(allIngredientIds, allTransitions, focusId, maxDepth);
    const transitions = filterTransitionsByIngredients(allTransitions, ingredientIds);
    const depths = computeDepthsFromFocus(focusId, ingredientIds, transitions);
    const layout = computePositions(ingredientIds, depths);

    const visibleIngredientIds = [...ingredientIds].filter(id => {
      if (showLocked) return true;
      return isIngredientUnlocked(id, context);
    });
    const visibleSet = new Set(visibleIngredientIds);

    const legend = document.createElement("div");
    legend.className = "graph-legend";
    legend.innerHTML = `
      <span><i class="legend-swatch legend-swatch--primitive"></i> Primal ingredient</span>
      <span><i class="legend-swatch legend-swatch--raw"></i> Raw ingredient</span>
      <span><i class="legend-swatch legend-swatch--processed"></i> Prepared ingredient</span>
      <span><i class="legend-line legend-line--technique"></i> Technique</span>
      <span><i class="legend-line legend-line--combine"></i> Combine</span>
      <span class="graph-legend-hint">Edge icons mark known paths — details listed below</span>
    `;

    const svg = createSvgEl("svg", {
      class: "ingredient-graph-svg",
      width: "100%",
      height: "100%",
      role: "img",
      "aria-label": "Ingredient progression graph"
    });

    const defs = createSvgEl("defs");
    defs.innerHTML = `
      <marker id="graph-arrow-technique" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(20, 90%, 58%)"></path>
      </marker>
      <marker id="graph-arrow-combine" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(200, 75%, 62%)"></path>
      </marker>
    `;
    svg.appendChild(defs);

    const rootGroup = createSvgEl("g", { class: "graph-root" });
    const labelsGroup = createSvgEl("g", { class: "graph-row-labels" });
    const transitionsGroup = createSvgEl("g", { class: "graph-transitions" });
    const nodesGroup = createSvgEl("g", { class: "graph-nodes" });

    appendRowLabels(labelsGroup, layout, focusId);

    transitions.forEach(transition => {
      const allVisible = transition.inputs.every(id => visibleSet.has(id)) && visibleSet.has(transition.output);
      if (!allVisible) return;
      if (!isTransitionDiscovered(transition, context)) return;

      const unlocked = isIngredientUnlocked(transition.output, context);
      const group = createSvgEl("g", {
        class: `graph-transition graph-transition--${transition.kind}${unlocked ? " is-unlocked" : ""}`,
        "data-transition-id": transition.id
      });

      if (transition.kind === "technique") {
        renderTechniqueTransition(group, transition, layout, unlocked);
      } else {
        renderCombineTransition(group, transition, layout, unlocked);
      }

      transitionsGroup.appendChild(group);
    });

    visibleIngredientIds.forEach(id => {
      const unlocked = isIngredientUnlocked(id, context);
      const display = getDisplayItem(id, context);
      const pos = layout.positions.get(id);
      if (!pos) return;

      const origin = registry.getIngredientOrigin(id);
      const isFocus = focusId === id;
      const group = createSvgEl("g", {
        class: `graph-node graph-node--${origin}${unlocked ? " is-unlocked" : " is-locked"}${isFocus ? " graph-node--focus" : ""}`,
        "data-ingredient-id": id
      });
      group.setAttribute("transform", `translate(${pos.x - NODE_W / 2}, ${pos.y - NODE_H / 2})`);
      group.style.cursor = unlocked ? "pointer" : "default";
      group.addEventListener("click", event => {
        event.stopPropagation();
        if (!unlocked) return;
        if (typeof context.onIngredientActivate === "function") {
          context.onIngredientActivate(id);
          return;
        }
        rerenderWithContext({ focusIngredientId: id });
      });

      const rect = createSvgEl("rect", {
        class: "graph-node-bg",
        width: String(NODE_W),
        height: String(NODE_H),
        rx: "12"
      });

      const emoji = createSvgEl("text", {
        class: "graph-node-emoji",
        x: String(NODE_W / 2),
        y: "30",
        "text-anchor": "middle"
      });
      emoji.textContent = display.emoji || "???";

      const name = createSvgEl("text", {
        class: "graph-node-name",
        x: String(NODE_W / 2),
        y: "52",
        "text-anchor": "middle"
      });
      name.textContent = truncate(display.name || "???", 14);

      const badge = createSvgEl("text", {
        class: "graph-node-badge",
        x: String(NODE_W / 2),
        y: "66",
        "text-anchor": "middle"
      });
      badge.textContent = unlocked
        ? (origin === "primitive"
          ? (isUnlockablePrimitive(id) ? "Milestone" : "Primal")
          : origin === "raw"
            ? "Raw"
            : "Prepared")
        : "???";

      group.appendChild(rect);
      group.appendChild(emoji);
      group.appendChild(name);
      group.appendChild(badge);
      nodesGroup.appendChild(group);
    });

    rootGroup.appendChild(labelsGroup);
    rootGroup.appendChild(transitionsGroup);
    rootGroup.appendChild(nodesGroup);
    svg.appendChild(rootGroup);

    viewport.appendChild(svg);
    container.appendChild(legend);
    appendTransitionsList(container, transitions, context, visibleSet);
    container.appendChild(viewport);

    const viewState = { scale: 1, panX: 0, panY: 0 };
    let dragging = false;
    let dragStart = { x: 0, y: 0 };

    function applyTransform() {
      rootGroup.setAttribute("transform", `translate(${viewState.panX} ${viewState.panY}) scale(${viewState.scale})`);
    }

    function zoomAt(focalX, focalY, nextScale) {
      const clamped = Math.min(2.5, Math.max(0.35, nextScale));
      const ratio = clamped / viewState.scale;
      // Keep the point under (focalX, focalY) fixed while scaling.
      viewState.panX = focalX - (focalX - viewState.panX) * ratio;
      viewState.panY = focalY - (focalY - viewState.panY) * ratio;
      viewState.scale = clamped;
      applyTransform();
    }

    function zoomFromCenter(nextScale) {
      zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, nextScale);
    }

    function resetView() {
      viewState.scale = 1;
      viewState.panX = 0;
      viewState.panY = 0;
      fitGraphToViewport(viewport, layout, viewState);
      applyTransform();
    }

    toolbar.querySelector('[data-zoom="in"]').addEventListener("click", () => zoomFromCenter(viewState.scale + 0.2));
    toolbar.querySelector('[data-zoom="out"]').addEventListener("click", () => zoomFromCenter(viewState.scale - 0.2));
    toolbar.querySelector('[data-zoom="reset"]').addEventListener("click", resetView);

    const lockedToggle = toolbar.querySelector("#graph-show-locked");
    lockedToggle.addEventListener("change", () => {
      rerenderWithContext({ showLocked: lockedToggle.checked });
    });

    const depthSelect = toolbar.querySelector("#graph-focus-depth");
    if (depthSelect) {
      depthSelect.addEventListener("change", () => {
        const value = depthSelect.value === "all" ? "all" : Number(depthSelect.value);
        rerenderWithContext({ focusDepth: value });
      });
    }

    viewport.addEventListener("pointerdown", event => {
      if (event.target.closest(".graph-node")) return;
      dragging = true;
      dragStart = { x: event.clientX - viewState.panX, y: event.clientY - viewState.panY };
      viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener("pointermove", event => {
      if (!dragging) return;
      viewState.panX = event.clientX - dragStart.x;
      viewState.panY = event.clientY - dragStart.y;
      applyTransform();
    });

    viewport.addEventListener("pointerup", event => {
      dragging = false;
      viewport.releasePointerCapture(event.pointerId);
    });

    viewport.addEventListener("wheel", event => {
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const focalX = event.clientX - rect.left;
      const focalY = event.clientY - rect.top;
      const factor = event.deltaY > 0 ? 0.9 : 1.1;
      zoomAt(focalX, focalY, viewState.scale * factor);
    }, { passive: false });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const containerHeight = container.clientHeight;
        if (containerHeight > 0) {
          const transitionsPanel = container.querySelector(".graph-transitions-panel");
          const chrome = toolbar.offsetHeight + legend.offsetHeight + (transitionsPanel?.offsetHeight || 0) + 16;
          viewport.style.minHeight = `${Math.max(300, containerHeight - chrome)}px`;
        }
        fitGraphToViewport(viewport, layout, viewState);
        applyTransform();
        viewport.style.opacity = "1";
      });
    });
  }

export function renderIngredientGraph(container, options) {
  if (!container) return;

  const context = {
    discoveredIds: options.discoveredIds || new Set(),
    milestoneIngredientIds: options.milestoneIngredientIds || [],
    showLocked: options.showLocked !== false,
    focusIngredientId: options.focusIngredientId || null,
    focusDepth: options.focusDepth == null ? 2 : options.focusDepth,
    searchTerm: options.searchTerm || "",
    onFocusChange: options.onFocusChange || null,
    onDepthChange: options.onDepthChange || null,
    onSearchChange: options.onSearchChange || null,
    onIngredientActivate: options.onIngredientActivate || null
  };

  renderGraph(container, context);
}
