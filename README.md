## Map Generator

Will generate a map with biomes based on a Whittaker diagram found [here](http://www-cs-students.stanford.edu/~amitp/game-programming/polygon-map-generation/#biomes).


## Example Map

![Example generated map](https://i.imgur.com/ELkUdiU.png)


## Known Issue(s)

The [floodFil](https://github.com/MrEliasen/map-generator/blob/master/libs/map-generator/generator.js#L295) method will cause the maximum call stack to be exceeded if going much above 100x100 map.


## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).