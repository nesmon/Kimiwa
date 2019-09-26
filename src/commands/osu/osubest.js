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

        for (let i = 0; i < 5; i++) {
            let maps = await kimiwa.osu.beatmaps.getByBeatmapId(userbest[i].beatmap_id)
            let getMap = await kimiwaHelper.getOsuBeatmapCache(userbest[i].beatmap_id)
            let parse = new kimiwaHelper.ojsama.parser();
            parse.feed(getMap);
            let beatmap = parse.map;
            let beatmapStars = new kimiwaHelper.ojsama.diff().calc({
                map: beatmap,
                mods: parseInt(userbest[i].enabled_mods)
            });

            let scorebest = userbest[i];
            
            best.push(new kimiwaHelper.Embed()
                .setColor('BLUE')
                .setAuthor(`${maps[0].title} [${beatmapStars.toString().split(" ", 1)[0]}]`, null, `https://osu.ppy.sh/beatmapsets/${maps[0].beatmapset_id}`)
                .addField("Score information : ", `**Rank : **${scorebest.rank}\n**Score : **${scorebest.score}[${scorebest.count300 + "/" + scorebest.count100 + "/" + scorebest.count50 +"/" + scorebest.countmiss}]`)
                .addField("Mod used : ", (kimiwaHelper.numberToMod(scorebest.enabled_mods).length > 0) ? "+" + kimiwaHelper.numberToMod(scorebest.enabled_mods).join(',') : "Nomod", true)
            )
        }

        const e = await kimiwaHelper.PaginationEmbed.createPaginationEmbed(message, best, {
            showPageNumbers: false,
            cycling: true
        });
    };
};



module.exports = OsuBest;