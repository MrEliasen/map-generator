export function convertFromScanline(scanlineGrid) {
    const grid = [...Array(scanlineGrid[0].length)].map(() => []);

    scanlineGrid.forEach((y) => y.forEach((x, index) => {
        grid[index].push(x);
    }))

    return grid;
}

export function convertToScanline(grid) {
    const scanlineGrid = [...Array(grid.length)].map(() => []);

    grid.forEach((x) => x.forEach((y, index) => {
        scanlineGrid[index].push(y);
    }))

    return scanlineGrid;
}