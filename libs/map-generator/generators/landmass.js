import { Placeholder } from '../biomes/placeholder.js';
import { Stepper } from './stepper.js';
import { isValidIndex, xyToIndex } from '../helpers.js';

export class Landmass extends Stepper {
    constructor(width, height, rng, matrix = null) {
        super(width, height, rng, matrix);
    }

    /**
     * Generates a new level
     * @param {Number} steps    The number of steps the generator should take
     * @return {Void}
     */
    async generate(steps = 100) {
        await this.run(async (stepperX, stepperY, index, lastDirection) => {
            if (lastDirection.steps === 3) {
                this.fillArea(stepperX, stepperY);
            }

            // set the current tile to floor type
            this.matrix[index] = new Placeholder();
        }, steps);
    }

    fillArea(x, y) {
        let xOffset = -2;
        let yOffset = -2;
        const xMaxOffset = 2;
        const yMaxOffset = 2;

        while (xOffset <= xMaxOffset) {
            const newX = y + xOffset;

            while (yOffset <= yMaxOffset) {
                const newY = x + yOffset;

                // do not touch the far corners, to round it off a bit
                if ((xOffset === -2 && yOffset === -2)
                    && (xOffset === 2 && yOffset === 2)
                    && (xOffset === -2 && yOffset === 2)
                    && (xOffset === 2 && yOffset === -2)
                ) {
                    yOffset += 1;
                    return;
                }

                const index = xyToIndex(newX, newY, this.width, this.height);

                if (isValidIndex(this.matrix, index)) {
                    this.matrix[index] = new Placeholder();
                }

                yOffset += 1;
            }

            yOffset = -2;
            xOffset += 1;
        }
    }
}
