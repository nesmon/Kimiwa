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

        if (name === false) {
            name = args.splice(0).join(' ');
            if (name === '') {
                console.log(1);
                const osuName = await kimiwaHelper.preparedQuery(kimiwa.db, 'SELECT * FROM profile WHERE user_ID = ?', message.author.id);
                console.log(1);
                console.log(osuName);
                console.log(1);
                name = osuName[0].osu_username;
                console.log(1);
                if (name === '') {
                    return message.channel.createEmbed(new kimiwaHelper.Embed().setColor('RED').setAuthor("ERROR", message.author.avatarURL).setDescription(`Thanks to asigne name to your command with --name [name of command] or just put your name if you search in std`));
                }
            }
        }

        if (mode === false) mode = 'std';
        
        kimiwa.osu.user
            .get(name, kimiwaHelper.osuGetModeNumberByName(mode))
            .then(data => {
                let country = data.country.toLowerCase();
                message.channel.createEmbed(new kimiwaHelper.Embed()
                    .setColor('#f463a5')
                    .setAuthor(`Profil of ${data.username}`, `https://cdn.rawgit.com/hjnilsson/country-flags/master/png100px/${country}.png`, `https://osu.ppy.sh/users/${data.userid}`)
                    .setThumbnail(`https://a.ppy.sh/${data.user_id}`)
                    .setDescription(`**▸Join:** ${data.join_date}\n**▸Rank:** #${data.pp_rank || '0'}(${data.country}#${data.pp_country_rank || '0'})\n**▸Level:** ${Math.round(data.level*100)/100}\n**▸PP:** ${data.pp_raw || '0'}\n**▸Playing** ${kimiwaHelper.normalizeSecondsToHMS(data.total_seconds_played)}\n**▸Accuracy:** ${Math.round(data.accuracy*100)/100}%\n**▸Performance:** SSH: ${data.count_rank_ssh || '0'}, SH: ${data.count_rank_sh || '0'}, SS: ${data.count_rank_ss || '0'}, S: ${data.count_rank_s || '0'}\n**▸Playcount:** ${data.playcount || '0'}`)
                    .setTimestamp()
                    .setFooter('Made by nesmon', message.author.avatarURL)
                )
            }).catch((error) => {
                message.channel.createMessage("Sorry a error has been find :/ Thanks to verify the usage command.");
            })
    };
};



module.exports = Osu;