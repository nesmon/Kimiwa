const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');

class Osu extends Command {
    constructor(client) {
        super(client, {
            name: "osu",
            category: "Osu",
            description: "Get osu information about player",
            usage: "osu [standard/mania/taiko/catch] [name of user]",
            aliases: ["osu", "ctb", "std", "mania", "catch", "taiko"]
        });
    }

    async run(message, args, kimiwa) { // eslint-disable-line no-unused-vars

        let mode = args[0];
        let name = args.splice(1).join(' ');

        kimiwa.osu.user
            .get(name, kimiwaHelper.osuGetMode(mode))
            .then(data => {
                let country = data.country.toLowerCase();
                message.channel.createEmbed(new kimiwaHelper.Embed()
                    .setColor('#f463a5')
                    .setAuthor(`Profil of ${data.username}`, `https://cdn.rawgit.com/hjnilsson/country-flags/master/png100px/${country}.png`, `https://osu.ppy.sh/users/${data.userid}`)
                    .setThumbnail(`https://a.ppy.sh/${data.user_id}`)
                    .setDescription(`**▸Join:** ${data.join_date}\n**▸Rank:** #${data.pp_rank || '0'}(${data.country}#${data.pp_country_rank || '0'})\n**▸Level:** ${Math.round(data.level*100)/100}\n**▸PP:** ${data.pp_raw || '0'}\n**▸Playing** ${kimiwaHelper.normalizeSecondsToDHMS(data.total_seconds_played)}\n**▸Accuracy:** ${Math.round(data.accuracy*100)/100}%\n**▸Performance:** SSH: ${data.count_rank_ssh || '0'}, SH: ${data.count_rank_sh || '0'}, SS: ${data.count_rank_ss || '0'}, S: ${data.count_rank_s || '0'}\n**▸Playcount:** ${data.playcount || '0'}`)
                    .setTimestamp()
                    .setFooter('Made by nesmon', message.author.avatarURL)
                )
            }).catch((error) => {
                message.channel.createMessage("Sorry a error has been find :/ Thanks to verify the usage command.");
            })
    };
};



module.exports = Osu;