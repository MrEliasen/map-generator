import { Biome } from './_biome.js';

export class Beach extends Biome {
    constructor() {
        super();

        this.name = 'Beach';
        this.color = '#FFEDAF';
        this.pathingDifficultyScale = 2;
    }
}
