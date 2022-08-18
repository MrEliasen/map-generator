import fs from 'fs';
import chalk from 'chalk';
import { Generator } from './libs/map-generator/generator.js';
import { convertToScanline } from './libs/helpers/convert-grid.js';

async function run() {
    const seed = null;

    const mapGenerator = new Generator(100, 100, seed);
    mapGenerator.setLandmassStepperCount(100);
    mapGenerator.setLandmassStepperStep(150);
    mapGenerator.setRivers(1, 2);
    await mapGenerator.generate();

    const grid = convertToScanline(mapGenerator.matrix);

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

    fs.writeFileSync(
        'example-map.json',
        JSON.stringify(mapGenerator.matrix),
    );

    // eslint-disable-next-line
    console.log(chalk.green(`Seed: ${mapGenerator.seed}`));
    // eslint-disable-next-line
    console.log(chalk.green('Output saved to ./map.json'));
}

run();
