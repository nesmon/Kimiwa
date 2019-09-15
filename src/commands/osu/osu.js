const Command = require("../../base/Command.js");

class Osu extends Command {
    constructor(client) {
        super(client, {
            name: "osu",
            category: "Osu",
            description: "Latency and API response times.",
            usage: "osu [standard/mania/taiko/catch] [name of user]",
            aliases: ["osu", "ctb", "std", "mania", "catch", "taiko"]
        });
    }

    async run(message, args, level) { // eslint-disable-line no-unused-vars
        
    };
};

module.exports = Osu;