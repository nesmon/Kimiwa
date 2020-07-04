const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');

class OsuBest extends Command {
    constructor(client) {
        super(client, {
            name: "osubest",
            category: "Osu",
            description: "get best play of osu user (only std)",
            usage: "osubest [name of user]",
            aliases: ["ob"]
        });
        this.embed = []
    }

    async run(message, args, kimiwa, level, IA) { // eslint-disable-line no-unused-vars
        let name;
        let mode;

        if (IA === true) {
            name = args[0];
            mode = args[1] || 'std';
        } else {
            name = kimiwaHelper.flags(message.content, "--name");
            mode = kimiwaHelper.flags(message.content, "--mode");
            if (mode !== Boolean(false) && mode.split(" ").length > 0) {
                if (mode.split(" ")[0].toLowerCase() === "std" || mode.split(" ")[0].toLowerCase() === "standard"){
                    mode = "std"
                } else if (mode.split(" ")[0].toLowerCase() === "ctb" || mode.split(" ")[0].toLowerCase() === "catch") {
                    mode = "ctb"
                } else if (mode.split(" ")[0].toLowerCase() === "mania") {
                    mode = "mania"
                } else if (mode.split(" ")[0].toLowerCase() === "taiko") {
                    mode = "taiko"
                } else {
                    return kimiwaHelper.flashMessage(message, "Error", "Sorry but this mode dosn't exist please try again.\nMode allowed : std, mania, ctb, taiko", "RED", 10000)
                }
            } else if (mode === false) {
                mode = 'std';
            }
        }

        if (name === false) {
            name = message.content.split(" --mode ");
            name = name[0].split(`${kimiwa.prefix}osubest`);
            name = name[1].trim();
            if (name === "") {
                const osuName = await kimiwaHelper.preparedQuery(kimiwa.db, 'SELECT * FROM profile WHERE user_ID = ?', message.author.id);
                name = osuName[0].osu_username;
                if (name === null) {
                    return message.channel.createEmbed(new kimiwaHelper.Embed().setColor('RED').setAuthor("ERROR", message.author.avatarURL).setDescription(`Thanks to asigne name to your command with --name [name of command] or just put your name if you search in std`));
                }
            }
        }


        if (kimiwaHelper.osuGetMode(mode) === 0) {
            this._getStdBestScore(message, name, mode, kimiwa);
        } else if (kimiwaHelper.osuGetMode(mode) !== 0){
            this._getOtherModeBestScore(message, name, mode, kimiwa);
        }

        this.embed = [];
    };


    async _getStdBestScore (message, name, mode, kimiwa) {
        let getUserBestScore = await kimiwa.osu.user.getBest(name, kimiwaHelper.osuGetMode(mode), 5);
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
            let beatmapUsedMods = (kimiwaHelper.getModByNumber(bestScore.enabled_mods).length > 0) ? " +" + kimiwaHelper.getModByNumber(bestScore.enabled_mods).join(',') : " +Nomod";

            this.embed.push({
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
                            `${kimiwaHelper.osuGetAcu(bestScore.count300, bestScore.count100, bestScore.count50, bestScore.countmiss).toFixed(2)}%`,
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

        if (this.embed.length === 1) {
            return message.channel.createEmbed(this.embed[0])
        } else {
            return await kimiwaHelper.PaginationEmbed.createPaginationEmbed(message, this.embed, {
                showPageNumbers: false,
                cycling: true
            });
        }
    }

    async _getOtherModeBestScore (message, name, mode, kimiwa) {
        let getUserBestScore = await kimiwa.osu.user.getBest(name, kimiwaHelper.osuGetMode(mode), 5);
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
            let beatmapUsedMods = (kimiwaHelper.getModByNumber(bestScore.enabled_mods).length > 0) ? " +" + kimiwaHelper.getModByNumber(bestScore.enabled_mods).join(',') : " +Nomod";

            this.embed.push({
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
                        value: Number(maps[0].difficultyrating).toFixed(2) + "★ ▸ " + bestScore.rank + "▸ **" + bestScore.score + "**\n" +
                            `**Total Hits:** ▸ ` +
                            `[${bestScore.count300 + "/" + bestScore.count100 + "/" + bestScore.count50 + "/" + bestScore.countmiss}]\n` +
                            `**Accuracy : ** ▸ ` +
                            `${kimiwaHelper.osuGetAcu(bestScore.count300, bestScore.count100, bestScore.count50, bestScore.countmiss).toFixed(2)}%`,
                        inline: true
                    },
                    {
                        name: "\u200B",
                        value: `**${bestScore.maxcombo}x** / ${maps[0].max_combo + "x" || "none"}\n` +
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

        if (this.embed.length === 1) {
            return message.channel.createEmbed(this.embed[0])
        } else {
            return await kimiwaHelper.PaginationEmbed.createPaginationEmbed(message, this.embed, {
                showPageNumbers: false,
                cycling: true
            });
        }
    }

}

module.exports = OsuBest;