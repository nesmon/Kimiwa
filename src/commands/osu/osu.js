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
            mode = args[1] || 'standard';
        } else {
                name = kimiwaHelper.flags(message.content, "--name");
                mode = kimiwaHelper.flags(message.content, "--mode");
                if (mode !== Boolean(false) && mode.split(" ").length > 0) {
                    mode = mode.split(" ")[0];
                } else if (mode === false) {
                    mode = 'std';
                }
        }

        if (name === false) {
            if (name === false && mode !== false) {
                const osuName = await kimiwaHelper.preparedQuery(kimiwa.db, 'SELECT * FROM profile WHERE user_ID = ?', message.author.id);
                name = osuName[0].osu_username;
            }else {
                name = args.splice(0).join(' ');

                if (name === '') {
                    const osuName = await kimiwaHelper.preparedQuery(kimiwa.db, 'SELECT * FROM profile WHERE user_ID = ?', message.author.id);
                    name = osuName[0].osu_username;
                    if (name === '' || name === null) {
                        return message.channel.createEmbed(new kimiwaHelper.Embed().setColor('RED').setAuthor("ERROR", message.author.avatarURL).setDescription(`Thanks to asigne name to your command with --name [name of command] or just put your name if you search in std`));
                    }
                }
            }

        }

        let osuUser = await kimiwa.osu.user.get(name, kimiwaHelper.osuGetMode(mode));

        if (!osuUser) {
            return kimiwaHelper.flashMessage(message, 'No user found', 'Sorry but I do not find anyone in osu!', '#f463a5', 10000);
        }

        let getBest = await kimiwa.osu.user.getBest(osuUser.user_id, kimiwaHelper.osuGetMode(mode), 100, 'id');

        const getRangeOsuUser = await this.getRangeOsuUser(getBest, kimiwa);

        console.log(getRangeOsuUser);

        let maxcombo = getRangeOsuUser[4] + getRangeOsuUser[5] + getRangeOsuUser[6] + getRangeOsuUser[7];
        let slider = maxcombo * 35 / 100;
        let circle = maxcombo - slider;

        let ppUser = ojsama.ppv2({
            aim_stars: Number(2.30),
            speed_stars: Number(1.80),
            max_combo: Number(maxcombo),
            combo: getRangeOsuUser[3].toFixed(0) * 2,
            nsliders: slider,
            ncircles: circle,
            nobjects: maxcombo,
            base_ar: Number(8.5),
            base_od: Number(8.5),
            n300: getRangeOsuUser[4],
            n100: getRangeOsuUser[5],
            n50: getRangeOsuUser[6],
            nmiss: getRangeOsuUser[7]
        });

        let country = osuUser.country.toLowerCase();
        message.channel.createEmbed(new kimiwaHelper.Embed()
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
                `Range max combo : ${getRangeOsuUser[3].toFixed(0)}\n`
            ])
            .addField('Your own PP account :', ppUser)
        );
    }

    async getRangeOsuUser(osuBest, kimiwa) {
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

        for (let i = 0; i < getBest.length; i++) {
            let beatmapData = await kimiwaHelper.getOsuBeatmapCache(getBest[i].beatmap_id);
            let getBeatmap = await kimiwaHelper.getOsuBeatmapData(kimiwa, getBest[i].beatmap_id);

            let beatmap = new ojsama.parser();
            beatmap.feed(beatmapData);
            let parsebeatmap = beatmap.map;

            let beatmapStars = new ojsama.diff().calc({
                map: parsebeatmap,
                mods: parseInt(getBest.enabled_mods)
            });

            let maxcomob = parseInt(getBest[i].maxcombo);
            let miss = parseInt(getBest[i].countmiss);
            let acc = kimiwaHelper.osuGetAcu(getBest[i].count300, getBest[i].count100, getBest[i].count50, getBest[i].countmiss);
            let beatmapPP = ojsama.ppv2({ stars: beatmapStars, combo: maxcomob, nmiss: miss, acc_percent: acc });

            let PPmin = beatmapPP.toString().split(" ", 1)[0];
            PP = PP + Number(PPmin);

            let formattedStars = beatmapStars.toString().split(" ", 1)[0];
            stars = stars + Number(formattedStars);

            console.log(getBeatmap)
            mapTime = mapTime + Number(getBeatmap.maptime);
            combo = combo + Number(getBest[i].maxcombo);
            c300 = c300 + Number(getBest[i].count300);
            c100 = c100 + Number(getBest[i].count100);
            c50 = c50 + Number(getBest[i].count50);
            cmiss = cmiss + Number(getBest[i].countmiss);

        }
        console.log(kimiwaHelper.normalizeSecToMin(mapTime / getBest.length));
        range.push(PP);
        range.push(PP / getBest.length);
        range.push(stars / getBest.length);
        range.push(combo / getBest.length);
        range.push(c300);
        range.push(c100);
        range.push(c50);
        range.push(cmiss);
        range.push(kimiwaHelper.normalizeSecToMin(mapTime / getBest.length));


        return range;
    }
}



module.exports = Osu;