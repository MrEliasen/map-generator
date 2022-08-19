## Map Generator

Will generate a map with biomes based on a Whittaker diagram found [here](http://www-cs-students.stanford.edu/~amitp/game-programming/polygon-map-generation/#biomes).


Run `npm run example` to generate a new map example . It will output the result to `./example-map.json` and render it in the console as well.


You can update the `./index.js` file to play a round a bit more with some settings.


Made as a small side project to learn a bit more about random map generation.

## Usage

install `npm install random-map-generator`


```js
import fs from 'fs';
import { Generator } from 'random-map-generator';

 // any string; if null a random seed will be generated
const seed = null;
const height = 100;
const width = 100;

const worldMap = new Generator(width, height, seed);
// how many steppers to generate, which creates land mass
worldMap.setLandmassStepperCount(100);
// how many steps a stepper should take
worldMap.setLandmassStepperStep(150);
// how many rivers to generate (min, max)
worldMap.setRivers(1, 2);
// generate the map
await worldMap.generate();

// render the map to console.
mapGenerator.outputToConsole();

// output the map seed
console.log(chalk.green(`Seed: ${mapGenerator.seed}`));

// save the map to json
fs.writeFileSync('./map.json', JSON.stringify(mapGenerator.matrix));
```


## Example Map

![Example generated map](https://i.imgur.com/ELkUdiU.png)


## Known Issue(s)

The [floodFil](https://github.com/MrEliasen/map-generator/blob/master/libs/map-generator/generator.js#L295) method will cause the maximum call stack to be exceeded if going much above 100x100 map.

I created a version which utilises a single while loop, but the map generator goes from about 0.5s generation time for a 100x100 map, to several seconds.

Suggestions welcome!


## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).


## Resources

A couple of useful resources for random/procedual map generation:

- [Amit’s Game Programming Information](http://www-cs-students.stanford.edu/~amitp/gameprog.html)
- [Polygonal Map Generation for Games](http://www-cs-students.stanford.edu/~amitp/game-programming/polygon-map-generation/)
- [Notes on Procedural Map Generation Techniques](https://christianjmills.com/Notes-on-Procedural-Map-Generation-Techniques/)
- [Terrain and heightmaps generation using the diamond-square algorithm](https://yonatankra.com/how-to-create-terrain-and-heightmaps-using-the-diamond-square-algorithm-in-javascript/)
