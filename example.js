import fs from 'fs';
import chalk from 'chalk';
import { Generator } from './libs/map-generator/generator.js';

async function run() {
    const seed = null;

    const mapGenerator = new Generator(100, 100, seed);
    mapGenerator.setLandmassStepperCount(100);
    mapGenerator.setLandmassStepperStep(150);
    mapGenerator.setRivers(1, 2);
    await mapGenerator.generate();

    mapGenerator.outputToConsole();

    // eslint-disable-next-line
    console.log(chalk.green(`Seed: ${mapGenerator.seed}`));
    console.log(chalk.green(`Generation Time: ${mapGenerator.gentime} seconds`));

    fs.writeFileSync(
        'example-map.json',
        JSON.stringify(mapGenerator.matrix),
    );
}

run();
