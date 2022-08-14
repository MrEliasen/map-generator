import { Direction } from './_direction.js';

export class South extends Direction {
    constructor() {
        super();

        this.direction = 'south';
        this.x = 0;
        this.y = 1;
    }
}
