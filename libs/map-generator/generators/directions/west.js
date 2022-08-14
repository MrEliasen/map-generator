import { Direction } from './_direction.js';

export class West extends Direction {
    constructor() {
        super();

        this.direction = 'west';
        this.x = -1;
        this.y = 0;
    }
}
