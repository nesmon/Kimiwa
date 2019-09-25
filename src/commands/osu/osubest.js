const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');

class OsuBest extends Command {
    constructor(client) {
        super(client, {
            name: "OsuBest",
            category: "Osu",
            description: "get best play of osu user",
            usage: "getbest [standard/mania/taiko/catch] [name of user]",
            aliases: ["osubest", "Osubest", "osuBest", "ob"]
        });
    }

    async run(message, args, kimiwa) { // eslint-disable-line no-unused-vars

        let mode = args[0];
        let name = args.splice(1).join(' ');

        const best = [];
        let userbest = await kimiwa.osu.user.getBest(name, kimiwaHelper.osuGetMode(mode), 5)

        //console.log(userbest)
        for (let i = 0; i < 5; i++) {
            let maps = await kimiwa.osu.beatmaps.getByBeatmapId(userbest[i].beatmap_id)
            let parse = new kimiwaHelper.ojsama.parser();
                beatmapParser.feed(maps);
            let beatmapMap = beatmapParser.map;
            let beatmapStars = new kimiwaHelper.ojsama.diff().calc({ map: beatmapMap, mods: kimiwaHelper.numberToMod(userbest[i].enabled_mods) });
            
            console.log(beatmapStars)

            best.push(new kimiwaHelper.Embed()
                .setColor('BLUE')
                .setAuthor(`${maps[0].title} +${kimiwaHelper.numberToMod(userbest[i].enabled_mods)} []`)
                .setDescription("n")
            )
        }

        const e = await kimiwaHelper.PaginationEmbed.createPaginationEmbed(message, best, {
            showPageNumbers: false,
            cycling: true
        });
    };
};



module.exports = OsuBest;