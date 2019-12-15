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
        }

        if (name === false ) {
            name = args.splice(0).join(' ');
            if (name === '') {
                const osuName = await kimiwaHelper.preparedQuery(kimiwa.db, 'SELECT * FROM profile WHERE user_ID = ?', message.author.id);
                name = osuName[0].osu_username;
                if (name === '' || name === null) {
                    return message.channel.createEmbed(new kimiwaHelper.Embed().setColor('RED').setAuthor("ERROR", message.author.avatarURL).setDescription(`Thanks to asigne name to your command with --name [name of command] or just put your name if you search in std`));
                }
            }
        }

        if (mode === false) mode = 'std';
        
        let osuUser = await kimiwa.osu.user.get(name, kimiwaHelper.osuGetMode(mode));

        if (!osuUser) {
            return kimiwaHelper.flashMessage(message, 'No user found', 'Sorry but I do not find anyone in osu!', '#f463a5', 10000);
        }

        let getBest = await kimiwa.osu.user.getBest(osuUser.user_id, kimiwaHelper.osuGetMode(mode), 100, 'id');

        const getRangeOsuUser = await kimiwaHelper.getRangeOsuUser(getBest, kimiwa);

        console.log(getRangeOsuUser);

        let maxcombo = getRangeOsuUser[4] + getRangeOsuUser[5] + getRangeOsuUser[6] + getRangeOsuUser[7];
        let slider = maxcombo * 35 / 100;
        let circle = maxcombo - slider;

        await console.log({
            aim_stars: Number(2.30),
            speed_stars: Number(1.80),
            max_combo: maxcombo,
            nsliders: slider,
            ncircles: circle,
            nobjects: maxcombo,
            base_ar: Number(8.5),
            base_od: Number(8.5),
            nmiss: getRangeOsuUser[7]
        });

        let ppUser = ojsama.ppv2({
            aim_stars: Number(2.30),
            speed_stars: Number(1.80),
            max_combo: Number(maxcombo),
            nsliders: slider,
            ncircles: circle,
            nobjects: maxcombo,
            base_ar: Number(8.5),
            base_od: Number(8.5),
            nmiss: Number(getRangeOsuUser[8])
        });

        console.log(ppUser);

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
        );
    }
}

// Info I want :
// Range pp *
// Global pp in best 100 *
// Range stars *
// Percentage mods played
// Range of combo *
// Get all 300/100/50/miss on global

module.exports = Osu;