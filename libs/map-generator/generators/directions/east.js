import { Direction } from './_direction.js';

export class East extends Direction {
    constructor() {
        super();

        this.direction = 'east';
        this.x = 1;
        this.y = 0;
    }
}
