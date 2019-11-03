const Command = require("../../base/Command.js");
const kimiwaHelper = require('../../kimiwaHelper');

class createProfile extends Command {
    constructor(client) {
        super(client, {
            name: "createprofile",
            description: "Create your own profile",
            category: "Profile",
            usage: "createprofile",
            permLevel: "User",
            aliases: ["cp"]
        });
    }

    async run(message, args, kimiwa, level) { // eslint-disable-line no-unused-vars
        const accountAlreadyExist = await kimiwaHelper.preparedQuery(kimiwa.db, 'SELECT * FROM profile WHERE user_ID = ?', [message.author.id]);

        if (accountAlreadyExist.length > 0) {
            message.channel.createEmbed(new kimiwaHelper.Embed()
                .setColor('RED')
                .setDescription('Sorry but you have already an account !')
            );
        } else {
            try {
                const waitingMessage = await message.channel.createEmbed(new kimiwaHelper.Embed()
                    .setColor('BLUE')
                    .setDescription('Please wait while your account is created :D !')
                );

                let newprofile = {
                    'user_ID': message.author.id,
                    'description': "Error 404, description not found :/",
                    'badge': ""
                };

                await kimiwaHelper.preparedQuery(kimiwa.db, 'INSERT INTO profile SET ?', newprofile);

                await waitingMessage.edit({
                    embed: new kimiwaHelper.Embed()
                        .setColor('BLUE')
                        .setDescription('Your account is now created :D !')
                });
            } catch (error) {
                console.log(error)
            }

        }
    }
}


module.exports = createProfile;