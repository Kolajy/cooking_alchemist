import { buildTechniqueItem, createTechniqueTransition } from "../_techniqueRecipe";

const recipe = createTechniqueTransition(
  "smashed_berries",
  ["separate"],
  ["berry_pulp"],
  {
    description: "You strained the mashed berries to separate the smooth pulp from the seeds and skins.",
    tip: "Strain smashed soft fruits to extract pure pulps and juices."
  }
);

export default buildTechniqueItem(
  {
    id: "berry_pulp",
    name: "Berry Pulp",
    emoji: "🥤",
    category: "Produce",
    description: "Smooth, strained berry pulp without seeds or skins.",
    blurb: "Straining mashed berries concentrates their sweet juice and smooth flesh, separating out the fibrous parts."
  },
  recipe
);
