import { Biome } from './_biome.js';

export class FreshWater extends Biome {
    constructor() {
        super();

        this.name = 'Fresh Water';
        this.color = '#557DA5';
        this.pathingDifficultyScale = 10;
    }
}
