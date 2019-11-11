const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');

class OsuBest extends Command {
    constructor(client) {
        super(client, {
            name: "osubest",
            category: "Osu",
            description: "get best play of osu user",
            usage: "osubest [name of user]",
            aliases: ["osubest", "Osubest", "osuBest", "ob"]
        });
    }

    async run(message, args, kimiwa, level, IA) { // eslint-disable-line no-unused-vars
        let name;

        if (IA === true) {
            name = args[0];
        } else {
            name = args.splice(0).join(' ');
        }
        
        let embedBest = [];
        let getUserBestScore = await kimiwa.osu.user.getBest(name, 0, 5);
        let getUserInformation = await kimiwa.osu.user.get(name, 0, undefined);

        if (!getUserInformation) {
            return message.channel.createMessage('Sorry but this username dosne\'t exist :/');
        }

        let osuName = getUserInformation.username;

        for (let i = 0; i < getUserBestScore.length; i++) {
            let bestScore = getUserBestScore[i];
            let maps = await kimiwa.osu.beatmaps.getByBeatmapId(bestScore.beatmap_id);
            let renderBeatmapName = maps[0].artist + "-" + maps[0].title + "[" + maps[0].version + "]";

            let getMap = await kimiwaHelper.getOsuBeatmapCache(bestScore.beatmap_id);
            let parseBeatmap = new kimiwaHelper.ojsama.parser();
            parseBeatmap.feed(getMap);

            let beatmap = parseBeatmap.map;
            let beatmapStars = await new kimiwaHelper.ojsama.diff().calc({
                map: beatmap,
                mods: parseInt(bestScore.enabled_mods)
            });
            beatmapStars = beatmapStars.toString().split(" ", 1)[0];
            let beatmapUsedMods = (kimiwaHelper.getModByNumber(bestScore.enabled_mods).length > 0) ? "+" + kimiwaHelper.getModByNumber(bestScore.enabled_mods).join(',') : "Nomod";

            embedBest.push({
                title: `Top play in osu! for **${osuName}**`,
                description: "[" + renderBeatmapName + beatmapUsedMods + "](https://osu.ppy.sh/b/" + maps[0].beatmap_id + "&m=0)",
                color: "16016293",
                timestamp: bestScore.date.replace(' ', 'T') + '.000Z',
                thumbnail: {
                    url: "https://b.ppy.sh/thumb/" + maps[0].beatmapset_id + "l.jpg?uts=" + Math.floor(new Date() / 1000)
                },
                fields: [{
                        name: "Beatmap Information",
                        value: `Length: **${kimiwaHelper.secToMin(maps[0].total_length)}** Mapper : **${maps[0].creator}**\n` +
                            `AR: **${maps[0].diff_approach}**, BPM: **${maps[0].bpm}**`
                    },
                    {
                        name: "Play Score",
                        value: beatmapStars.toString().split(" ", 1)[0] + "★ ▸ " + bestScore.rank + "▸ **" + bestScore.score + "**\n" +
                            `**Total Hits:** ▸ ` +
                            `[${bestScore.count300 + "/" + bestScore.count100 + "/" + bestScore.count50 +"/" + bestScore.countmiss}]\n` +
                            `**Accuracy : ** ▸ ` +
                            `${kimiwaHelper.osuGetAcu(bestScore.count300, bestScore.count100, bestScore.count50, bestScore.countmiss)}%`,
                        inline: true
                    },
                    {
                        name: "\u200B",
                        value: `**${bestScore.maxcombo}x** / ${beatmap.max_combo()}x\n` +
                            `**${bestScore.pp}pp**`,
                        inline: true
                    }
                ],
                footer: {
                    icon_url: 'https://a.ppy.sh/' + getUserInformation.user_id + '?uts=' + Math.floor(new Date() / 1000),
                    text: osuName + " #" + getUserInformation.pp_rank + " Global"
                }
            })
        }

        if (embedBest.length === 1) {
            message.channel.createEmbed(embedBest[0])
        } else {
            const e = await kimiwaHelper.PaginationEmbed.createPaginationEmbed(message, embedBest, {
                showPageNumbers: false,
                cycling: true
            });
        }
    };
}

module.exports = OsuBest;