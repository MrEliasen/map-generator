import { Direction } from './_direction.js';

export class NorthEast extends Direction {
    constructor() {
        super();

        this.direction = 'north east';
        this.x = 1;
        this.y = -1;
    }
}
