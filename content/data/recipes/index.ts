/**
 * Processed-ingredient recipe registry.
 * Separation outputs use type: "ingredient" (raw). Finalized dishes use type: "recipe".
 *
 * Recipes here are flattened at load time into TRANSITION_INDEX (see content/data/transitions/index.ts)
 * for technique → input → output lookups.
 */

import produceBerries from './produce/berries';
import produceBerryPulp from './produce/berry_pulp';
import produceFruits from './produce/fruits';
import liquidWater from './liquids/water';
import forageRoots from './forage/roots';
import forageTubers from './forage/tubers';
import forageNuts from './forage/nuts';
import forageMushrooms from './forage/mushrooms';
import forageGrasses from './forage/grasses';
import forageShoots from './forage/shoots';
import pantrySeeds from './pantry/seeds';
import proteinShellfish from './proteins/shellfish';
import techniqueSmash from './techniques/smash';
import techniqueThermal from './techniques/thermal';
import techniqueThermalNew from './techniques/thermal_new';
import starterCombines from './combines/starter_combines';
import forageGinger from './forage/ginger_recipes';
import forageScallions from './forage/scallions_recipes';
import pantryOil from './pantry/oil';
import proteinFish from './proteins/fish';
import pantrySoySauce from './pantry/soy_sauce';
import worldCuisine from './world_cuisine';
import forageLivestock from './forage/livestock';
import forageGardenProduce from './forage/garden_produce';
import forageWildHives from './forage/wild_hives';

export default {
  ...produceBerries,
  ...produceBerryPulp,
  ...produceFruits,
  ...liquidWater,
  ...forageRoots,
  ...forageTubers,
  ...forageNuts,
  ...forageMushrooms,
  ...forageGrasses,
  ...forageShoots,
  ...pantrySeeds,
  ...proteinShellfish,
  ...techniqueSmash,
  ...techniqueThermal,
  ...techniqueThermalNew,
  ...starterCombines,
  ...forageGinger,
  ...forageScallions,
  ...pantryOil,
  ...proteinFish,
  ...pantrySoySauce,
  ...worldCuisine,
  ...forageLivestock,
  ...forageGardenProduce,
  ...forageWildHives
};
