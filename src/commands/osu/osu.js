const Command = require("../../base/Command.js");
const kimiwaHelper = require('../../kimiwaHelper');

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

        const ppRange = await kimiwaHelper.getRangePP(osuUser, kimiwa, mode);

        console.log(ppRange);

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
            .addField('Information :', )
            .setFooter('\u200B', message.author.avatarURL)
        );
    }
}

// Info I want :
// Range pp
// Global pp in best 100
// Range stars
// Percentage mods played
// Miss count every X combo
// Get all 300/100/50/miss on every top 100best game

module.exports = Osu;