var readline = require("readline");
var osu = require("ojsama");

var mods = osu.modbits.none;
var acc_percent;
var combo;
var nmiss;

// get mods, acc, combo, misses from command line arguments
// format: +HDDT 95% 300x 1m
var argv = process.argv;

for (var i = 2; i < argv.length; ++i)
{
  if (argv[i].startsWith("+")) {
    mods = osu.modbits.from_string(argv[i].slice(1) || "");
  }

  else if (argv[i].endsWith("%")) {
    acc_percent = parseFloat(argv[i]);
  }

  else if (argv[i].endsWith("x")) {
    combo = parseInt(argv[i]);
  }

  else if (argv[i].endsWith("m")) {
    nmiss = parseInt(argv[i]);
  }
}

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
        stars: stars,
        combo: combo,
        nmiss: nmiss,
        acc_percent: acc_percent,
      });

      var max_combo = map.max_combo();
      combo = combo || max_combo;

      console.log(pp.computed_accuracy.toString());
      console.log(combo + "/" + max_combo + "x");

      console.log(pp.toString());
    });




let acc = kimiwaHelper.osuGetAcu(getRecent[0].count300, getRecent[0].count100, getRecent[0].count50, getRecent[0].countmiss);
let accIfFC = parseFloat((((
    (parseInt(getRecent[0].count300) * 300) +
    ((parseInt(getRecent[0].count100) + parseInt(getRecent[0].countmiss)) * 100) +
    (parseInt(getRecent[0].count50) * 50) +
    (parseInt(0) * 0)) /
    ((
        parseInt(getRecent[0].count300) +
        parseInt(getRecent[0].count100) +
        parseInt(getRecent[0].count50) +
        parseInt(getRecent[0].countmiss)
    ) * 300)) * 100));

console.log(acc);
let a = parseInt("47");
let b = parseInt("13");
let c = parseFloat("56.67");
let beatmapPP = kimiwaHelper.ojsama.ppv2({
    stars: beatmapStars,
    max_combo: a,
    nmiss: b,
    acc_percent: c
});
let beatmapppforacc = kimiwaHelper.ojsama.ppv2({
    stars: beatmapStars,
    max_combo: Number(getBeatmap[0].max_combo),
    nmiss: 0,
    acc_percent: accIfFC
});
let ppIfFC = beatmapppforacc.toString().split(" ", 1)[0];
let PPmin = beatmapPP.toString().split(" ", 1)[0];
console.log(beatmapPP);
console.log(beatmapppforacc.toString());