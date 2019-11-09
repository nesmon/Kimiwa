const Command = require("../../base/Command.js");
const kimiwaHelper = require('../../kimiwaHelper');

class profile extends Command {
    constructor(client) {
        super(client, {
            name: "profile",
            description: "Look your profile or profile af any people",
            category: "Profile",
            usage: "profile",
            permLevel: "user",
            aliases: []
        });
    }

    async run(message, args, kimiwa, level) { // eslint-disable-line no-unused-vars
        const mentionedProfile = message.mentions[0];
        let profileName;
        let profileID;


        if (!mentionedProfile) {
            args = message.content.split(' ');
            let id = parseInt(args[1]);

            if (Number.isInteger(id)) {
                try {
                    const getName = await kimiwa.getRESTUser(args[1])
                    profileName = getName.username;
                    profileID = id;
                } catch (error) {
                    return message.channel.createEmbed(new kimiwaHelper.Embed()
                        .setColor('RED')
                        .setDescription('Sorry an error has been occured, it\'s probably due to usage of a wrong ID !')
                    )
                }
            } else {
                profileName = message.author.username
                profileID = message.author.id;
            }
        } else {
            profileName = mentionedProfile.username;
            profileID = mentionedProfile.id;
        }


        const getProfile = await kimiwaHelper.preparedQuery(kimiwa.db, 'SELECT * FROM profile WHERE user_ID = ?', profileID);
        const getAvatar = await kimiwa.getRESTUser(getProfile[0].user_ID);

        if (getProfile.length > 0) {
            const e = new kimiwaHelper.Embed()
                .setTitle(`Profile of ${profileName}`)
                .setColor('BLUE')
                .setDescription(getProfile[0].description)
                .setThumbnail(getAvatar.avatarURL)
                .setFooter('')
                .setTimestamp()

            if (getProfile[0].stack_osu === 'false') {
                if (getProfile[0].osu_username !== null) {
                    e.addField('Osu! Official :', getProfile[0].osu_username, true);
                }

                if (getProfile[0].ripple_username !== null) {
                    e.addField('Osu! Ripple :', getProfile[0].ripple_username, true);
                }

                if (getProfile[0].akatsuki_username !== null) {
                    e.addField('Osu! Akatsuki :', getProfile[0].akatsuki_username, true);
                }
            } else if (getProfile[0].stack_osu === 'true') {
                e.addField('Osu! Account :', [
                    `Osu! Official : ${getProfile[0].osu_username || 'no osu! official account'}\n` +
                    `Osu! Akatsuki : ${getProfile[0].akatsuki_username || 'no osu! Akatsuki account'}\n` +
                    `Osu! Ripple : ${getProfile[0].ripple_username || 'no osu! Ripple account'}\n`
                ], true)
            }

            if (getProfile[0].stack_social === 'false') {
                if (getProfile[0].twitch !== null) {
                    e.addField('Twitch :', getProfile[0].twitch, true);
                }

                if (getProfile[0].twitter !== null) {
                    e.addField('Twitter :', getProfile[0].twitter, true);
                }

                if (getProfile[0].youtube !== null) {
                    e.addField('Youtube :', getProfile[0].youtube, true);
                }
            } else if (getProfile[0].stack_social === 'false') {
                e.addField('Social Account :', [
                    `Twitch : ${getProfile[0].twitch || 'no Twitch account'}\n` +
                    `Twitter : ${getProfile[0].twitter || 'no Twitter account'}\n` +
                    `Youtube : ${getProfile[0].youtube || 'no Youtube account'}\n`
                ], true)
            }

            if (getProfile[0].website !== null) {
                e.addField('website :', getProfile[0].website, true);
            }

            message.channel.createEmbed(e);
        } else {
            message.channel.createEmbed(new kimiwaHelper.Embed()
                .setColor('RED')
                .setDescription('Sorry but this account dosn\'t exist :/')
            )
        }
    }
}


module.exports = profile;