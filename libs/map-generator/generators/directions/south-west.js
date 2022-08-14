import { Direction } from './_direction.js';

export class SouthWest extends Direction {
    constructor() {
        super();

        this.direction = 'south west';
        this.x = -1;
        this.y = 1;
    }
}
