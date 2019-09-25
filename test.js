var readline = require("readline");
var osu = require("ojsama");
 
var mods = osu.modbits.from_string("HDDT");

 
// get mods, acc, combo, misses from command line arguments
// format: +HDDT 95% 300x 1m

var parser = new osu.parser();
readline.createInterface({
  input: process.stdin, terminal: false
})

.on("line", parser.feed_line.bind(parser))
.on("close", function() {
  var map = parser.map;
  console.log(map.toString());
 
  if (mods) {
    console.log("+" + osu.modbits.string(mods));
  }
 
  var stars = new osu.diff().calc({map: map, mods: mods});
  console.log(stars.toString());
 
  var pp = osu.ppv2({
    stars: stars
  });
 
  console.log(pp.computed_accuracy.toString());
 
  console.log(pp.toString());
});