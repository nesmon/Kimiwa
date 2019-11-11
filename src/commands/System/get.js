const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');

class cache extends Command {
    constructor(client) {
        super(client, {
            name: "cache",
            description: "Cache some information like beatmap file or anime data",
            category: "System",
            usage: "cache [anime/beatmap] [array]",
            nsfw: false,
            permLevel: "owner"
        });
    }

    async run(message, args, kimiwa) { // eslint-disable-line no-unused-vars
        let type = kimiwaHelper.flags(message, '--type');
        let of = kimiwaHelper.flags(message, '--of');

        if (type === false) return message.channel.createMessage('Please specify a type');
        if (of === false) return message.channel.createMessage('Please specify a value');

        if (type === 'message') {
            const getMessage = await kimiwaHelper.preparedQuery(this.client.db, 'SELECT * FROM user WHERE user_ID = ?', [of]);
            const user = await kimiwa.getRESTUser(of);

            message.channel.createEmbed(new kimiwaHelper.Embed()
                .setColor('GREEN')
                .setTitle('Number of message')
                .setDescription(`${user.username} send ${getMessage[0].messagesend}`)
            )
        }

    }
}
module.exports = cache;