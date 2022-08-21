import { Sea } from '../biomes/sea.js';
import { FreshWater } from '../biomes/fresh-water.js';
import { getTileNeighbours, getPathMap, xyToIndex } from '../helpers.js';
import { AStar, Graph } from '../../3rdparty/astar.js';

export class River {
    constructor(width, height, rng, matrix = null) {
        this.width = width;
        this.height = height;
        this.matrix = matrix;
        this.rng = rng;
        this.path = [];
    }

    /**
     * Generates a new river using A*
     * @return {Void}
     */
    generate() {
        const maxStartX = Math.floor(this.width / 4);
        const maxStartY = Math.floor(this.height / 4);

        // randomise start location
        const startX = Math.floor(this.width / 2 - this.rng() * maxStartX);
        const startY = Math.floor(this.height / 2 - this.rng() * maxStartY);
        const graphMap = new Graph(getPathMap(
            this.matrix,
            this.width,
            this.height,
            [],
            [FreshWater],
        ));

        const directions = [
            {
                x: 0,
                y: Math.floor(this.rng() * this.height),
            },
            {
                x: Math.floor(this.rng() * this.width),
                y: 0,
            },
            {
                x: this.width - 1,
                y: Math.floor(this.rng() * this.height),
            },
            {
                x: Math.floor(this.rng() * this.width),
                y: this.height - 1,
            },
        ];

        const randomDirection = directions[Math.floor(this.rng() * directions.length)];

        // define the start and end for the A* algo
        const startLocation = graphMap.grid[startX][startY];
        const endLocation = graphMap.grid[randomDirection.x][randomDirection.y];

        // get pathing result.
        const resultWithWeight = AStar.search(graphMap, startLocation, endLocation);

        for (let i = 0; i < resultWithWeight.length; i += 1) {
            const cell = resultWithWeight[i];
            const index = xyToIndex(cell.x, cell.y, this.width, this.height);

            if (this.matrix[index] instanceof Sea) {
                break;
            }

            // set the current tile to floor type
            this.matrix[index] = new FreshWater();
            this.path.push({ i: index, x: cell.x, y: cell.y });

            // we are flush with sea, stop the stepper.
            if (getTileNeighbours(this.matrix, this.width, this.height, index, Sea).length > 0) {
                break;
            }

            const freshWaterNeighbouts = getTileNeighbours(
                this.matrix,
                this.width,
                this.height,
                index,
                FreshWater,
            );

            // we are flush with fresh water, stop the stepper.
            if (freshWaterNeighbouts.length > 1) {
                break;
            }
        }
    }
}
