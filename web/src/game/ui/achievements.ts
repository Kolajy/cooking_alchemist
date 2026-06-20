import { getCtx } from "../context";

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short"
});

const CATEGORY_LABELS: Record<string, string> = {
  discovery: "Discovery",
  technique: "Technique",
  progression: "Progression",
  exploration: "Exploration"
};

function formatUnlockedAt(unlockedAt: number): string {
  if (!unlockedAt) return "";
  return timestampFormatter.format(new Date(unlockedAt));
}

export function renderAchievementsPanel(): void {
  const { state, dom, data } = getCtx();
  const { achievementsList, achievementsCountEl, achievementsProgressEl } = dom;
  if (!achievementsList) return;

  const achievements = data.ACHIEVEMENTS;
  achievementsList.replaceChildren();

  const unlocked = state.achievementUnlocks;
  const summary = `${unlocked.size} / ${achievements.length}`;

  if (achievementsCountEl) achievementsCountEl.textContent = summary;
  if (achievementsProgressEl) {
    const percent = achievements.length
      ? Math.round((unlocked.size / achievements.length) * 100)
      : 0;
    achievementsProgressEl.style.width = `${percent}%`;
  }

  if (achievements.length === 0) {
    const empty = document.createElement("p");
    empty.className = "achievements-empty";
    empty.textContent = "No achievements configured yet.";
    achievementsList.appendChild(empty);
    return;
  }

  const grouped = new Map<string, typeof achievements>();
  achievements.forEach(def => {
    const list = grouped.get(def.category) ?? [];
    list.push(def);
    grouped.set(def.category, list);
  });

  grouped.forEach((defs, category) => {
    const section = document.createElement("section");
    section.className = "achievements-section";

    const heading = document.createElement("h3");
    heading.className = "achievements-section__title";
    heading.textContent = CATEGORY_LABELS[category] || category;
    section.appendChild(heading);

    const list = document.createElement("div");
    list.className = "achievements-section__list";
    list.setAttribute("role", "list");

    defs.forEach(def => {
      const unlockedAt = unlocked.get(def.id);
      const isEarned = typeof unlockedAt === "number";

      const row = document.createElement("article");
      row.className = `achievement-card${isEarned ? " achievement-card--unlocked" : " achievement-card--locked"}`;
      row.setAttribute("role", "listitem");

      const main = document.createElement("div");
      main.className = "achievement-card__main";

      const emoji = document.createElement("span");
      emoji.className = "achievement-card__emoji";
      emoji.setAttribute("aria-hidden", "true");
      emoji.textContent = isEarned ? def.emoji : "🔒";

      const text = document.createElement("div");
      text.className = "achievement-card__text";

      const name = document.createElement("span");
      name.className = "achievement-card__name";
      name.textContent = isEarned ? def.name : "???";

      const desc = document.createElement("span");
      desc.className = "achievement-card__desc";
      desc.textContent = isEarned ? def.description : def.hint;

      text.append(name, desc);
      main.append(emoji, text);
      row.appendChild(main);

      if (isEarned && unlockedAt) {
        const time = document.createElement("time");
        time.className = "achievement-card__time";
        time.dateTime = new Date(unlockedAt).toISOString();
        time.textContent = formatUnlockedAt(unlockedAt);
        row.appendChild(time);
      }

      list.appendChild(row);
    });

    section.appendChild(list);
    achievementsList.appendChild(section);
  });
}
