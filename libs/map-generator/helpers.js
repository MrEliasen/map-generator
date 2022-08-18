import { Stepper } from './generators/stepper.js';
import { North } from './generators/directions/north.js';
import { West } from './generators/directions/west.js';
import { South } from './generators/directions/south.js';
import { East } from './generators/directions/east.js';
import { NorthWest } from './generators/directions/north-west.js';
import { NorthEast } from './generators/directions/north-east.js';
import { SouthWest } from './generators/directions/south-west.js';
import { SouthEast } from './generators/directions/south-east.js';

/**
 * Checks if its a valid grid
 * @param  {number}  x
 * @param  {number}  y
 * @return {Boolean}   if tile is a valid tile
 */
export function isValidCell(grid, x, y) {
    if (x < 0 || y < 0) {
        return false;
    }

    if (x >= grid.length || y >= grid[0].length) {
        return false;
    }

    if (!grid[x]) {
        return false;
    }

    if (!grid[x][y]) {
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
 * @param  {number}  x
 * @param  {number}  y
 * @param  {string|null}  ofType    The type of tile to look for, will use same type as the
 *                                  tile on the x,y coord if null.
 * @param  {boolean}    crossDirectional    If it should check cross directional as well
 * @return {Boolean}    if tile is a void tile
 */
export function getTileNeighbours(grid, x, y, ofType = null, crossDirectional = false) {
    const neighbours = [];
    const originalTile = grid[x][y];
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

    directions.forEach((direction) => {
        const nX = x + direction.x;
        const nY = y + direction.y;

        if (isValidCell(grid, nX, nY)) {
            if (grid[nX][nY] instanceof tileType) {
                neighbours.push({ x: nX, y: nY });
            }
        }
    });

    return neighbours;
}

/**
 * Find the nearest "ofType" tile
 * @param  {array}   grid    The grid to search
 * @param  {number}  x
 * @param  {number}  y
 * @param  {string|null}  ofType    The type of tile to look for, will use same type as the
 *                                  tile on the x,y coord if null.
 * @param  {boolean}    crossDirectional    If it should check cross directional as well
 * @return {Boolean}    if tile is a void tile
 */
export function findNearest(grid, x, y, ofType) {
    let nearestTiles = [];
    let xStart = x;
    let yStart = y;
    let xMax = x;
    let yMax = y;

    while (nearestTiles.length === 0) {
        xStart -= 1;
        yStart -= 1;
        xMax += 1;
        yMax += 1;

        if (xStart < 0 && yStart < 0 && xMax >= grid.length && yMax >= grid[0].length) {
            break;
        }

        for (let nx = xStart; nx <= xMax; nx += 1) {
            for (let ny = yStart; ny <= yMax; ny += 1) {
                // ignore tiles which we have already checked
                if (ny > yStart && ny < yMax && nx > xStart && nx < xMax) {
                    continue;
                }

                if (!isValidCell(grid, nx, ny)) {
                    continue;
                }

                if (!(grid[nx][ny] instanceof ofType)) {
                    continue;
                }

                nearestTiles.push({ x: nx, y: ny });
            }
        }
    }

    // eslint-disable-next-line arrow-body-style
    nearestTiles = nearestTiles.map((coords) => {
        return {
            ...coords,
            distance: getDistance(x, y, coords.x, coords.y),
        };
    });

    nearestTiles.sort((a, b) => b.distance - a.distance);

    return nearestTiles;
}

export function getPathMap(grid, blockers = [], ignoreScale = []) {
    return grid.map((x) => x.map((cell) => {
        if (blockers.includes(cell.constructor)) {
            return 0;
        }

        return cell.pathCost(ignoreScale.includes(cell.constructor));
    }));
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

export function convertFromScanline(scanlineGrid) {
    const grid = [...Array(scanlineGrid[0].length)].map(() => []);

    scanlineGrid.forEach((y) => y.forEach((x, index) => {
        grid[index].push(x);
    }));

    return grid;
}

export function convertToScanline(grid) {
    const scanlineGrid = [...Array(grid.length)].map(() => []);

    grid.forEach((x) => x.forEach((y, index) => {
        scanlineGrid[index].push(y);
    }));

    return scanlineGrid;
}
