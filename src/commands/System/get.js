const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');

class get extends Command {
    constructor(client) {
        super(client, {
            name: "get",
            description: "get some information for stats",
            category: "System",
            usage: "get parameter here",
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
module.exports = get;