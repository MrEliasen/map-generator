## Map Generator

Will generate a map with biomes based on a Whittaker diagram found [here](http://www-cs-students.stanford.edu/~amitp/game-programming/polygon-map-generation/#biomes).


Run `npm run generate` to generate a new map. It will output the result to `./map.json` and render it in the console as well.


You can update the `./index.js` file to play a round a bit more with some settings.


Made as a small side project to learn a bit more about random map generation.


## Example Map

![Example generated map](https://i.imgur.com/ELkUdiU.png)


## Known Issue(s)

The [floodFil](https://github.com/MrEliasen/map-generator/blob/master/libs/map-generator/generator.js#L295) method will cause the maximum call stack to be exceeded if going much above 100x100 map.


## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).