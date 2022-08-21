import { Stepper } from './generators/stepper.js';
import { North } from './generators/directions/north.js';
import { West } from './generators/directions/west.js';
import { South } from './generators/directions/south.js';
import { East } from './generators/directions/east.js';
import { NorthWest } from './generators/directions/north-west.js';
import { NorthEast } from './generators/directions/north-east.js';
import { SouthWest } from './generators/directions/south-west.js';
import { SouthEast } from './generators/directions/south-east.js';

export function indexToXY(index, width, height) {
    const total = width * height;
    const rows = total / width;
    const x = Math.floor(index / rows);
    const y = (index % rows);

    return { x, y };
}

export function xyToIndex(x, y, width, height) {
    const total = width * height;
    const rows = total / width;

    return rows * x + y;
}

export function convertTo2D(grid1d, width, height) {
    const grid = [...Array(width)].map(() => []);
    const total = width * height;
    const rows = total / width;

    for (let i = 0; i < grid1d.length; i += 1) {
        const x = Math.floor(i / rows);
        grid[x].push(grid1d[i]);
    }

    return grid;
}

export function convertToScanline(grid, width, height) {
    const scanlineGrid = [...Array(width)].map(() => []);
    const mapData = convertTo2D(grid, width, height);

    mapData.forEach((x) => x.forEach((y, index) => {
        scanlineGrid[index].push(y);
    }));

    return scanlineGrid;
}

/**
 * Checks if its a valid grid
 * @param  {number}  x
 * @param  {number}  y
 * @return {Boolean}   if tile is a valid tile
 */
export function isValidIndex(grid, i) {
    if (i < 0) {
        return false;
    }

    if (i >= grid.length) {
        return false;
    }

    if (!grid[i]) {
        return false;
    }

    return true;
}

/**
 * Get the distance between two coordinates
 * @param  {number} x1 X of coordinate 1
 * @param  {number} y1 Y of coordinate 1
 * @param  {number} x2 X of coordinate 2
 * @param  {number} y2 Y of coordinate
 * @return {float}     The dictance
 */
function getDistance(x1, y1, x2, y2) {
    const y = x2 - x1;
    const x = y2 - y1;

    return Math.sqrt(x * x + y * y);
}

/**
 * Checks if a tile is void and valid
 * @param  {array}   grid    The grid to search
 * @param  {number}  index
 * @param  {string|null}  ofType    The type of tile to look for, will use same type as the
 *                                  tile on the x,y coord if null.
 * @param  {boolean}    crossDirectional    If it should check cross directional as well
 * @return {Boolean}    if tile is a void tile
 */
export function getTileNeighbours(grid, width, height, i, ofType = null, crossDirectional = false) {
    const neighbours = [];
    const originalTile = grid[i];
    const tileType = ofType ?? originalTile.constructor;

    const directions = [
        new North(),
        new West(),
        new South(),
        new East(),
    ];

    if (crossDirectional) {
        directions.push(new NorthWest());
        directions.push(new NorthEast());
        directions.push(new SouthWest());
        directions.push(new SouthEast());
    }

    const { x, y } = indexToXY(i, width, height);

    for (let c = 0; c < directions.length; c += 1) {
        const direction = directions[c];
        const nX = x + direction.x;
        const nY = y + direction.y;
        const index = xyToIndex(nX, nY, width, height);

        if (isValidIndex(grid, index)) {
            if (grid[index] instanceof tileType) {
                neighbours.push({ i: index });
            }
        }
    }

    return neighbours;
}

/**
 * Find the nearest "ofType" tile
 * @param  {array}   grid    The grid to search
 * @param  {number}  index
 * @param  {string|null}  ofType    The type of tile to look for, will use same type as the
 *                                  tile on the x,y coord if null.
 * @param  {boolean}    crossDirectional    If it should check cross directional as well
 * @return {Boolean}    if tile is a void tile
 */
export function findNearest(grid, width, height, i, ofType) {
    const { x, y } = indexToXY(i, width, height);
    const total = width * height;
    const rows = total / width;
    const cols = width;

    const nearestTiles = [];
    let xStart = x;
    let yStart = y;
    let xMax = x;
    let yMax = y;

    while (nearestTiles.length === 0) {
        xStart -= 1;
        yStart -= 1;
        xMax += 1;
        yMax += 1;

        if (xStart < 0 && yStart < 0 && xMax >= cols && yMax >= rows) {
            break;
        }

        for (let nx = xStart; nx <= xMax; nx += 1) {
            for (let ny = yStart; ny <= yMax; ny += 1) {
                // ignore tiles which we have already checked
                if (ny > yStart && ny < yMax && nx > xStart && nx < xMax) {
                    continue;
                }

                const index = xyToIndex(nx, ny, width, height);

                if (!isValidIndex(grid, index)) {
                    continue;
                }

                if (!(grid[index] instanceof ofType)) {
                    continue;
                }

                nearestTiles.push({ i: index });
            }
        }
    }

    for (let ni = 0; ni < nearestTiles.length; ni += 1) {
        const tile = nearestTiles[i];

        nearestTiles[i] = {
            ...tile,
            distance: getDistance(x, y, tile.i),
        };
    }

    nearestTiles.sort((a, b) => b.distance - a.distance);

    return nearestTiles;
}

export function getPathMap(grid, width, height, blockers = [], ignoreScale = []) {
    const newMap = convertTo2D(grid, width, height);

    for (let i = 0; i < grid.length; i += 1) {
        const cell = grid[i];

        if (blockers.includes(cell.constructor)) {
            newMap[i] = 0;
        }

        newMap[i] = cell.pathCost(ignoreScale.includes(cell.constructor));
    }

    return newMap;
}

/**
 * Finds the opposite direction to the one entered
 * @param  {object} direction Object containing {x, y}
 * @return {Object}
 */
export function getOppositeDirection(direction) {
    return Stepper.directions.find((dir) => {
        if (direction.x === 0) {
            if (dir.x !== 0) {
                return false;
            }

            return dir.y !== direction.y;
        }

        if (direction.y === 0) {
            if (dir.y !== 0) {
                return false;
            }

            return dir.x !== direction.x;
        }

        return false;
    });
}

/**
 * Finds the opposite direction to the one entered
 * @param  {object} direction Object containing {x, y}
 * @return {Object}
 */
export function getOppositeAxisDirections(direction) {
    return Stepper.directions.filter((dir) => {
        if (direction.x === 0) {
            return dir.x !== 0;
        }

        if (direction.y === 0) {
            return dir.y !== 0;
        }

        return false;
    });
}
