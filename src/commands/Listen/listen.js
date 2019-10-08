const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');


class listen extends Command {
    constructor(client) {
        super(client, {
            name: "listen",
            description: "Probably one day I create this listen music command",
            usage: "listen",
            category: 'Listen',
            cooldown: 0,
            aliases: []
        });
    }

    async run(message, args, kimiwa) { // eslint-disable-line no-unused-vars
        message.channel.createMessage('Hum for this moment, the command not realy exist x)')
    }
}

module.exports = listen;