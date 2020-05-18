const Command = require("../../base/Command.js");
const kimiwaHelper = require('../../kimiwaHelper');
const ojsama = require('ojsama');

class Osu extends Command {
    constructor(client) {
        super(client, {
            name: "osu",
            category: "Osu",
            description: "Get osu information about player",
            usage: "osu --name [name of user] --mode [standard/mania/taiko/catch optional, by default std is select]",
            aliases: ["osu", "ctb", "std", "mania", "catch", "taiko"]
        });
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
            name = name[0].split(`${kimiwa.prefix}osu`);
            name = name[1].trim();
            if (name === "") {
                const osuName = await kimiwaHelper.preparedQuery(kimiwa.db, 'SELECT * FROM profile WHERE user_ID = ?', message.author.id);
                name = osuName[0].osu_username;
                if (name === null) {
                    return message.channel.createEmbed(new kimiwaHelper.Embed().setColor('RED').setAuthor("ERROR", message.author.avatarURL).setDescription(`Thanks to asigne name to your command with --name [name of command] or just put your name if you search in std`));
                }
            }
        }

        let osuUser = await kimiwa.osu.user.get(name, kimiwaHelper.osuGetMode(mode));

        if (!osuUser) {
            return kimiwaHelper.flashMessage(message, 'No user found', 'Sorry but I do not find anyone in osu!', '#f463a5', 10000);
        }

        let country = osuUser.country.toLowerCase();

        let embed = new kimiwaHelper.Embed()
            .setColor('#f463a5')
            .setAuthor(`Profil of ${osuUser.username}`, `https://cdn.rawgit.com/hjnilsson/country-flags/master/png100px/${country}.png`, `https://osu.ppy.sh/users/${osuUser.user_id}`)
            .setThumbnail(`https://a.ppy.sh/${osuUser.user_id}`)
            .setDescription([
                `**♪ Rank:** #${osuUser.pp_rank || '0'}(${osuUser.country}#${osuUser.pp_country_rank || '0'})\n` +
                `**♪ Level:** ${Math.round(osuUser.level * 100) / 100}\n` +
                `**♪ PP:** ${osuUser.pp_raw || '0'}\n` +
                `**♪ Playing** ${kimiwaHelper.normalizeSecondsToHMS(osuUser.total_seconds_played)}\n` +
                `**♪ Accuracy:** ${Math.round(osuUser.accuracy * 100) / 100}%\n` +
                `**♪ Performance:** SSH: ${osuUser.count_rank_ssh || '0'}, SH: ${osuUser.count_rank_sh || '0'}, SS: ${osuUser.count_rank_ss || '0'}, S: ${osuUser.count_rank_s || '0'}\n` +
                `**♪ Playcount:** ${osuUser.playcount || '0'}`
            ])
            .addField('Information', 'Please Wait for more information ...')

        const osu = await message.channel.createEmbed(embed);

        let getBest = await kimiwa.osu.user.getBest(osuUser.user_id, kimiwaHelper.osuGetMode(mode), 100, 'id');
        const getRangeOsuUser = await this.getRangeOsuUser(getBest, kimiwa, kimiwaHelper.osuGetMode(mode));

        let ebinfo = new kimiwaHelper.Embed()
            .setColor('#f463a5')
            .setAuthor(`Profil of ${osuUser.username}`, `https://cdn.rawgit.com/hjnilsson/country-flags/master/png100px/${country}.png`, `https://osu.ppy.sh/users/${osuUser.user_id}`)
            .setThumbnail(`https://a.ppy.sh/${osuUser.user_id}`)
            .setDescription([
                `**♪ Rank:** #${osuUser.pp_rank || '0'}(${osuUser.country}#${osuUser.pp_country_rank || '0'})\n` +
                `**♪ Level:** ${Math.round(osuUser.level * 100) / 100}\n` +
                `**♪ PP:** ${osuUser.pp_raw || '0'}\n` +
                `**♪ Playing** ${kimiwaHelper.normalizeSecondsToHMS(osuUser.total_seconds_played)}\n` +
                `**♪ Accuracy:** ${Math.round(osuUser.accuracy * 100) / 100}%\n` +
                `**♪ Performance:** SSH: ${osuUser.count_rank_ssh || '0'}, SH: ${osuUser.count_rank_sh || '0'}, SS: ${osuUser.count_rank_ss || '0'}, S: ${osuUser.count_rank_s || '0'}\n` +
                `**♪ Playcount:** ${osuUser.playcount || '0'}`
            ])
            .addField('Information :', [
                `Global PP : ${getRangeOsuUser[0].toFixed(2)}\n` +
                `Range PP in game : ${getRangeOsuUser[1].toFixed(2)}\n` +
                `Stars range : ${getRangeOsuUser[2].toFixed(2)}\n` +
                `Range max combo : ${getRangeOsuUser[3].toFixed(0)}\n` +
                `Range time : ${getRangeOsuUser[8]}`
            ])

        await osu.edit({embed: ebinfo})
    }

    async getRangeOsuUser(osuBest, kimiwa, mode) {
        let getBest = osuBest;
        let PP = Number(0);
        let stars = Number(0);
        let combo = Number(0);
        let c300 = Number(0);
        let c100 = Number(0);
        let c50 = Number(0);
        let cmiss = Number(0);
        let mapTime = Number(0);

        let range = [];

        if (mode === 0){
            for (let i = 0; i < getBest.length; i++) {
                let beatmapData = await kimiwaHelper.getOsuBeatmapCache(getBest[i].beatmap_id);
                let getBeatmap = await kimiwaHelper.getOsuBeatmapData(kimiwa, getBest[i].beatmap_id);

                let beatmap = new ojsama.parser();
                beatmap.feed(beatmapData);
                let parsebeatmap = beatmap.map;

                let beatmapStars = new ojsama.diff().calc({
                    map: parsebeatmap,
                    mods: parseInt(getBest[i].enabled_mods)
                });
                let formattedStars = beatmapStars.toString().split(" ", 1)[0];
                stars = stars + Number(formattedStars);
            }
        } else {
            for (let i = 0; i < getBest.length; i++) {
                let beatmapData = await kimiwaHelper.getOsuBeatmapCache(getBest[i].beatmap_id);
                let getBeatmap = await kimiwaHelper.getOsuBeatmapData(kimiwa, getBest[i].beatmap_id);
                stars = Number(getBeatmap.difficulty_rating) + stars
            }
        }

        for (let i = 0; i < getBest.length; i++) {
            const beatmapData = await kimiwaHelper.getOsuBeatmapCache(getBest[i].beatmap_id);
            const getBeatmap = await kimiwaHelper.getOsuBeatmapData(kimiwa, getBest[i].beatmap_id);
            let PPmin = getBest[i].pp;
            PP = PP + Number(PPmin);

            combo = combo + Number(getBest[i].maxcombo);
            c300 = c300 + Number(getBest[i].count300);
            c100 = c100 + Number(getBest[i].count100);
            c50 = c50 + Number(getBest[i].count50);
            cmiss = cmiss + Number(getBest[i].countmiss);
            mapTime = mapTime + Number(getBeatmap.maptime);
        }

        mapTime = mapTime / getBest.length;
        mapTime = mapTime.toFixed(0);

        range.push(PP, PP / getBest.length, stars / getBest.length, combo / getBest.length, c300, c100, c50, cmiss, kimiwaHelper.normalizeSecToMin(mapTime));

        return range;
    }
}

module.exports = Osu;