import { Biome } from './_biome.js';

export class Sea extends Biome {
    constructor() {
        super();

        this.name = 'Sea';
        this.color = '#363661';
        this.pathingDifficultyScale = 50;
    }
}
