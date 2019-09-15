const Command = require("../../base/Command.js");

class Roll extends Command {
    constructor(client) {
        super(client, {
            name: "roll",
            category: "Osu",
            description: "Just roll number like osu",
            cooldown: 0,
            usage: "roll [something you wan't]",
            aliases: ["roll"]
        });
    }

    async run(message, args, level) { // eslint-disable-line no-unused-vars
        let min = Math.ceil(1);
        let max = Math.floor(100);
        let roll = Math.floor(Math.random() * (max - min + 1)) + min;
        message.channel.createMessage(roll)
    }
}

module.exports = Roll;