import seedrandom from 'seedrandom';
import { randomBytes } from 'node:crypto';
import chalk from 'chalk';

import { createBiome } from './biome.js';
import { Sea } from './biomes/sea.js';
import { Void } from './biomes/void.js';
import { FreshWater } from './biomes/fresh-water.js';
import { Placeholder } from './biomes/placeholder.js';
import { Beach } from './biomes/beach.js';
import { Landmass } from './generators/landmass.js';
import { River } from './generators/river.js';
import { Stepper } from './generators/stepper.js';
import {
    getTileNeighbours,
    isValidIndex,
    findNearest,
    convertToScanline,
    indexToXY,
    xyToIndex,
} from './helpers.js';

export class Generator {
    constructor(width, height, seed = null) {
        this.setSeed(seed);
        this.setHeight(height);
        this.setWidth(width);

        this.matrix = [...Array(this.width * this.height).fill(new Void())];
    }

    /**
     * Returns how long it took to generate the map in MS.
     * @return {number} Generation time in MS
     */
    get gentime() {
        return (this.genEnd - this.genStart) / 1000;
    }

    /**
     * Seeds the RNG and generate the map for this world
     * @return {Promise} Resolves when complete
     */
    async generate() {
        this.genStart = Date.now();

        // Generate the land mass
        await Promise.all([...Array(this.landmassStepperCount)]
            .map((v, i) => this.generateLandmass(this.landmassStepperSteps, i)));

        // clean up landmass to make it look less generated, and fill in some gaps
        this.postProccess();

        // generate sea water
        // await this.floodFill(Sea, xyToIndex(1, 1, this.width, this.height));

        // generate fresh water
        // find any other void cells, and turn them into fresh water
        // for (let i = 0; i < this.matrix.length; i += 1) {
        //     const tile = this.matrix[i];

        //     if (tile instanceof Void) {
        //         this.matrix[i] = new FreshWater();
        //     }
        // }

        // // generate general world elevation
        // await this.generateElevation();

        // // create rivers
        // // await Promise.all([...Array(this.riverCount ?? 1)]
        // //     .map(() => this.generateRivers()));

        // // calculate the moisture for each placeholder cell
        // await this.generateMoisture();

        // // generate beaches
        // this.generateBeaches();

        // // generate biomes
        // for (let i = 0; i < this.matrix.length; i += 1) {
        //     const tile = this.matrix[i];

        //     if (!(tile instanceof Placeholder)) {
        //         return;
        //     }

        //     this.matrix[i] = createBiome(tile.elevation, tile.moisture);
        // }

        this.genEnd = Date.now();
    }

    generateMoisture() {
        const moistures = [];

        // loop each ground tile
        for (let i = 0; i < this.matrix.length; i += 1) {
            const tile = this.matrix[i];

            if (!(tile instanceof Placeholder)) {
                continue;
            }

            const nearestWater = findNearest(this.matrix, this.width, this.height, i, FreshWater);
            const { distance } = nearestWater[0];

            this.matrix[i].distanceFromWater = distance;
            moistures.push({ i, distance });
        }

        // sort by distance
        moistures.sort((a, b) => b.distance - a.distance);

        // normalise the distances by deviding the biggest distance by 6
        const perMoistureStage = moistures[0].distance / 6;

        for (let i = 0; i < moistures.length; i += 1) {
            const tile = moistures[i];

            let moisture = 6 - Math.ceil(tile.distance / perMoistureStage) + 1;

            if (moisture > 6) {
                moisture = 6;
            }

            this.matrix[i].moisture = moisture;
        }
    }

    generateElevation() {
        const groundElevations = [];

        // loop each ground tile
        for (let i = 0; i < this.matrix.length; i += 1) {
            const tile = this.matrix[i];

            if (!(tile instanceof Placeholder)) {
                continue;
            }

            const nearestSea = findNearest(this.matrix, this.width, this.height, i, Sea);
            const { distance } = nearestSea[0];

            this.matrix[i].distanceFromSea = distance;
            groundElevations.push({ i, distance });
        }

        // sort by distance
        groundElevations.sort((a, b) => b.distance - a.distance);

        // normalise the distances by deviding the biggest distance by 4
        const perElevation = Math.floor(groundElevations[0].distance / 4);

        for (let i = 0; i < groundElevations.length; i += 1) {
            const tile = groundElevations[i];

            let elevation = Math.floor(tile.distance / perElevation);

            if (elevation === 0) {
                elevation = 1;
            }

            this.matrix[tile.i].elevation = elevation;
        }
    }

    generateBeaches() {
        for (let i = 0; i < this.matrix.length; i += 1) {
            const tile = this.matrix[i];

            if (!(tile instanceof Placeholder)) {
                continue;
            }

            if (tile.elevation !== 1 || tile.moisture > 2) {
                continue;
            }

            const neighbours = getTileNeighbours(
                this.matrix,
                this.width,
                this.height,
                i,
                Sea,
                true,
            );

            if (neighbours.length >= 1) {
                this.matrix[i] = new Beach();
            }
        }
    }

    /**
     * Sets the seed used for the RNG.
     * Non alpha-numeric characters will be ignored.
     * @param {string} seed The seed
     */
    setSeed(seed = null) {
        let mapSeed = seed;

        if (mapSeed === null) {
            mapSeed = randomBytes(128).toString('hex');
        }

        if (typeof mapSeed !== 'string') {
            throw new Error(`setSeed expects the argument "seed" to be a "string", ${typeof mapSeed} given`);
        }

        // only accept alpha-numeric chars
        this.seed = mapSeed.replace(/\W/g, '');
        this.rng = seedrandom(this.seed);
    }

    /**
     * Sets the height of the world map to generate
     * @param {number} height The height in number of tiles
     */
    setHeight(height) {
        if (typeof height !== 'number') {
            throw new Error(`setHeight expects the argument "height" to be a "number", ${typeof height} given`);
        }

        this.height = height;
    }

    /**
     * Sets the width of the world map to generate
     * @param {number} width The width in number of tiles
     */
    setWidth(width) {
        if (typeof width !== 'number') {
            throw new Error(`setWidth expects the argument "width" to be a "number", ${typeof width} given`);
        }

        this.width = width;
    }

    /**
     * Spawns a landmass generator which will add some landmass to the map
     * @param  {Number} stepsPerIteration The number of steps it should take
     * @param  {Number} stepperIndex      Unique number specific to this stepper, used in the RNG
     * @return {Promise}                  Resolves when done
     */
    async generateLandmass(stepsPerIteration, stepperIndex = null) {
        const stepper = new Landmass(
            this.width,
            this.height,
            this.rng,
            this.matrix,
        );

        await stepper.generate(stepsPerIteration, stepperIndex);
    }

    /**
     * Sets the number of langmas stepper generators to create
     * @param {number} count The number to create
     */
    setLandmassStepperCount(count) {
        this.landmassStepperCount = count;
    }

    /**
     * Sets how many steps a landmass stepper should take
     * @param {number} steps The number of steps to take
     */
    setLandmassStepperStep(steps) {
        this.landmassStepperSteps = steps;
    }

    /**
     * Sets how many rivers should be generated
     * @param {number} min The min number of rivers to generate
     * @param {number} max The max number of rivers to generate
     */
    setRivers(min, max = null) {
        this.riverCount = min;

        if (max > min) {
            this.riverCount = Math.floor(this.rng() * (max - min + 1) + min);
        }
    }

    /**
     * Spawns a river generator
     * @param  {Number} riverIndex      Unique number specific for this rivr, used in the RNG
     * @return {Promise}                  Resolves when done
     */
    async generateRivers() {
        const riverGen = new River(
            this.width,
            this.height,
            this.rng,
            this.matrix,
        );

        await riverGen.generate();

        this.postProccess(riverGen.path, [0, riverGen.path.length - 1]);
    }

    /**
     * Fills all Void and connected void tiles, with Biome tiles
     * @param  {[type]} Biome       The biome tyoe to fill with
     * @param  {number} i           Start tile index
     * @param  {Map} activeCells    Keeps track of cells which have been touched
     * @return {Promise}            Resolves when done
     */
    async floodFill(Biome, i, activeCells = new Map()) {
        if (!(this.matrix[i] instanceof Void)) {
            return;
        }

        this.matrix[i] = new Biome();

        const { x, y } = indexToXY(i, this.width, this.height);

        // spawn fillers in all directions
        const validDirections = Stepper.directions
            .filter((direction) => {
                const key = `${x + direction.x}-${y + direction.y}`;

                if (activeCells.has(key)) {
                    return false;
                }

                const index = xyToIndex(x + direction.x, y + direction.y, this.width, this.height);

                if (!isValidIndex(this.matrix, index)) {
                    return false;
                }

                activeCells.set(key, true);
                return true;
            });

        if (validDirections.length === 0) {
            return;
        }

        // TODO: Rewrite the flood fill logic to not hit call stack limit
        // eslint-disable-next-line no-restricted-syntax
        for (const direction of validDirections) {
            const index = xyToIndex(x + direction.x, y + direction.y, this.width, this.height);

            // eslint-disable-next-line no-await-in-loop
            await this.floodFill(Biome, index, activeCells);
        }
    }

    /**
     * Removes standalone tiles to make it less "random" looking
     * @return {Void}
     */
    postProccess(grid = null, skipClean = []) {
        if (grid) {
            for (let i = 0; i < grid.length; i += 1) {
                const cell = grid[i];
                this.cleanTile(cell.x, cell.y, skipClean.includes(i));
            }
            return;
        }

        // remove long stragglers
        this.removeStragglers();
        return;

        // run from top to bottom
        for (let i = 0; i < this.matrix.length; i += 1) {
            this.cleanTile(i);
        }
    }

    /**
     * Removes straggler "stepper" paths
     * @return {void}
     */
    removeStragglers() {
        for (let i = 0; i < this.matrix.length; i += 1) {
            const tile = this.matrix[i];

            if (!(tile instanceof Placeholder)) {
                return;
            }

            const neighbours = getTileNeighbours(
                this.matrix,
                this.width,
                this.height,
                i,
                Placeholder,
                true,
            );

            if (neighbours.length <= 2) {
                this.matrix[i] = new Void();
            }
        }
    }

    /**
     * Removes the tile if its 1 or less neighbouts.
     * Will continue to search its neighbouts
     * @param  {number} index
     * @param  {boolean} skipClean    Set if you want to ignore clean for this coordinate.
     *                                Useful for the start end end of rivers or similar.
     */
    cleanTile(i, skipClean = false) {
        if (skipClean) {
            return;
        }

        const { x, y } = indexToXY(i, this.width, this.height);

        // ignore outter rim
        if (y === 0 // top
            || y === this.height - 1 // bottom
            || x === 0 // left
            || x === this.width - 1 // right
        ) {
            this.matrix[i] = new Void();
            return;
        }

        const neighbours = getTileNeighbours(this.matrix, this.width, this.height, i);

        if (neighbours.length > 1) {
            return;
        }

        // if a tile is alone, convert it
        if (neighbours.length <= 1) {
            if (this.matrix[i] instanceof Void) {
                this.matrix[i] = new Placeholder();
            } else if (this.matrix[i] instanceof FreshWater) {
                this.matrix[i] = new Placeholder();
            } else {
                this.matrix[i] = new Void();
            }
        }

        for (let c = 0; c < neighbours.length; c += 1) {
            this.cleanTile(neighbours[c].index);
        }
    }

    /**
     * Renders the map in console log
     * @return {void}
     */
    outputToConsole() {
        const grid = convertToScanline(this.matrix, this.width, this.height);

        for (let y = 0; y < grid.length; y += 1) {
            const tiles = grid[y];
            let output = '';

            for (let x = 0; x < tiles.length; x += 1) {
                const tile = grid[y][x];

                output = `${output}${chalk.hex(tile.color).bold('██')}`;
            }

            // eslint-disable-next-line
            console.log(output);
        }
    }
}
