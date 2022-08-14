import { Bare } from './biomes/bare.js';
import { Grassland } from './biomes/grassland.js';
import { Scorched } from './biomes/scorched.js';
import { Shrubland } from './biomes/shrubland.js';
import { Snow } from './biomes/snow.js';
import { SubtropicalDesert } from './biomes/subtropical-desert.js';
import { Taiga } from './biomes/taiga.js';
import { TemperateDeciduousForest } from './biomes/temperate-deciduous-forest.js';
import { TemperateDesert } from './biomes/temperate-desert.js';
import { TemperateRainForest } from './biomes/temperate-rain-forest.js';
import { TropicalRainForest } from './biomes/tropical-rain-forest.js';
import { TropicalSeasonalForest } from './biomes/tropical-seasonal-forest.js';
import { Tundra } from './biomes/tundra.js';

const whittakerDiagram = {
    1: {
        1: SubtropicalDesert,
        2: Grassland,
        3: TropicalSeasonalForest,
        4: TropicalSeasonalForest,
        5: TropicalRainForest,
        6: TropicalRainForest,
    },
    2: {
        1: TemperateDesert,
        2: Grassland,
        3: Grassland,
        4: TemperateDeciduousForest,
        5: TemperateDeciduousForest,
        6: TemperateRainForest,
    },
    3: {
        1: TemperateDesert,
        2: TemperateDesert,
        3: Shrubland,
        4: Shrubland,
        5: Taiga,
        6: Taiga,
    },
    4: {
        1: Scorched,
        2: Bare,
        3: Tundra,
        4: Snow,
        5: Snow,
        6: Snow,
    },
};

export function createBiome(tileElevation, tileMoisture) {
    const elevation = Number.parseInt(tileElevation, 10);
    const moisture = Number.parseInt(tileMoisture, 10);

    if (elevation < 1 || elevation > 4) {
        throw new Error(`"elevation" must be between 1 and 4, ${elevation} given`);
    }

    if (moisture < 1 || moisture > 6) {
        throw new Error(`"moisture" must be between 1 and 6, ${moisture} given`);
    }

    const biome = new whittakerDiagram[elevation][moisture]();
    biome.elevation = elevation;
    biome.moisture = moisture;

    return biome;
}
