import { Direction } from './_direction.js';

export class North extends Direction {
    constructor() {
        super();

        this.direction = 'north';
        this.x = 0;
        this.y = -1;
    }
}
