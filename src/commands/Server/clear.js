const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');

class clear extends Command {
    constructor(client) {
        super(client, {
            name: "clear",
            description: "Clear message (max 100)",
            category: "Server",
            usage: "clear [number of message]",
            permLevel: "Owner",
            aliases: ["rm", "purge"]
        });
    }

    async run(message, args, kimiwa) { // eslint-disable-line no-unused-vars
        let limit = args.splice(0).join(' ');
        limit = parseInt(limit) + 1;

        const bulk = await message.channel.getMessages(limit);
        const bulkMap = bulk.map(x => x.id);

        try {
            await message.channel.deleteMessages(bulkMap);
        } catch (error) {
            message.channel.send('Sorry an error has been occured :/')
        }
    }
}


module.exports = clear;