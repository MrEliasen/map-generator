export class Biome {
    constructor() {
        this.elevation = 1;
        this.char = '';
        this.color = '#000000';
        this.pathingDifficultyScale = 1;
    }

    pathCost(withoutScale = false) {
        return this.elevation * (withoutScale ? 1 : this.pathingDifficultyScale);
    }
}
