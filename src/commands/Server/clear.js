const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');

class clear extends Command {
    constructor(client) {
        super(client, {
            name: "clear",
            description: "Clear message (between 1 and 99)",
            category: "Server",
            usage: "clear [number of message]",
            permLevel: "serverowner",
            aliases: ["rm", "purge", 'bulk']
        });
    }

    async run(message, args, kimiwa, level) { // eslint-disable-line no-unused-vars

        let limit = args.splice(0).join(' ');
        limit = parseInt(limit);

        if (!limit || limit < 1 || limit > 100 || isNaN(limit)) return message.channel.createMessage(this.help.description);
        limit = limit + 1;

        const bulk = await message.channel.getMessages(limit);
        const bulkMap = bulk.map(x => x.id);

        try {
            await message.channel.deleteMessages(bulkMap);
        } catch (error) {
            message.channel.send('Sorry an error has been occured, it\'s probaly due to a message older than 2 week')
        }
    }
}


module.exports = clear;