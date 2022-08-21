import { North } from './directions/north.js';
import { West } from './directions/west.js';
import { South } from './directions/south.js';
import { East } from './directions/east.js';
import { xyToIndex } from '../helpers.js';

export class Stepper {
    // Directions the stepper can take
    static get directions() {
        return [
            new North(),
            new West(),
            new South(),
            new East(),
        ];
    }

    constructor(width, height, rng, matrix = null) {
        this.width = width;
        this.height = height;
        this.rng = rng;
        this.matrix = matrix;
        this.startLocation = null;
        this.blockedDirections = [];
        this.priorityDirection = null;
        this.priorityPercent = null;
        this.stepsHistory = [];
    }

    /**
     * Sets the start location from which the stepper will run.
     * @param {number} x The X coordinate / row
     * @param {number} y The Y coordicate / column
     */
    setStartLocation(x, y) {
        this.startLocation = { x, y };
    }

    /**
     * Generates a new level
     * @param {Function} onStep         Function to execute on successful step
     * @param {Number} steps            The number of steps the generator should take,
     * @return {Void}
     */
    async run(onStep, steps = 100) {
        // position the stepper closest to the middle of the grid.
        let stepperX = Math.floor(this.width / 2);
        let stepperY = Math.floor(this.height / 2);
        let stepperDirection = this.getRandomDirection();
        let stepsLeft = steps;

        if (this.startLocation) {
            stepperX = this.startLocation.x;
            stepperY = this.startLocation.y;
        } else {
            this.startLocation = {
                x: stepperX,
                y: stepperY,
            };
        }

        const lastDirection = {
            direction: '',
            steps: 0,
        };

        while (stepsLeft >= 1) {
            // 50% change it will change direction
            if (this.rng() < 0.5) {
                stepperDirection = this.getRandomDirection();
            }

            // move the stepper
            if (stepperDirection.x !== 0) {
                stepperX += stepperDirection.x;
            }

            if (stepperDirection.y !== 0) {
                stepperY += stepperDirection.y;
            }

            // check if the stepper X is out of bounds or at the outer layer,
            // if so, reverse the direction
            if (stepperX <= 0 || stepperX >= this.width - 1) {
                // Reverse the number and double the value to
                // reverse the initial change and walk 1 step in the opporsite direction
                stepperX += (stepperDirection.x * 2) * -1;
            }

            // check if the stepper Y is out of bounds, if so,
            // reverse the direction
            if (stepperY <= 0 || stepperY >= this.height - 1) {
                // Reverse the number and double the value to
                // reverse the initial change and walk 1 step in the opporsite direction
                stepperY += (stepperDirection.y * 2) * -1;
            }

            if (lastDirection.direction !== stepperDirection.direction) {
                lastDirection.steps = 0;
                lastDirection.direction = stepperDirection.direction;
            }

            lastDirection.steps += 1;

            const index = xyToIndex(stepperX, stepperY, this.width, this.height);

            this.stepsHistory.push({ x: stepperX, y: stepperY, i: index });

            // eslint-disable-next-line no-await-in-loop
            const proceed = await onStep(
                stepperX,
                stepperY,
                index,
                lastDirection,
                (steps - stepsLeft + 1),
            );

            stepsLeft -= 1;

            if (proceed === false) {
                stepsLeft = 0;
            }
        }
    }

    /**
     * Makes the stepper prioritise the given direction by the percent
     * @param {Direction} direction The direction to prioritise
     * @param {number} percent   The percent chance this direction is picked in "getRandomDirection"
     */
    setPriorityDirection(direction, percent) {
        if (percent < 0) {
            throw new Error(`"percent" cannot be less than 0, ${percent} given`);
        }

        this.priorityDirection = direction;
        this.priorityPercent = percent;
    }

    /**
     * Gets a new random direction
     * @return {Number}
     */
    getRandomDirection() {
        const directions = Stepper.directions.filter((dir) => {
            if (this.blockedDirections.includes(dir)) {
                return false;
            }

            if (this.priorityDirection) {
                return !(dir instanceof this.priorityDirection.constructor);
            }

            return true;
        });

        if (this.priorityDirection) {
            const chance = Math.floor(this.rng() * 100);

            if (chance <= this.priorityPercent) {
                return this.priorityDirection;
            }
        }

        return directions[Math.floor(this.rng() * directions.length)];
    }
}
