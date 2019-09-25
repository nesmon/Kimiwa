const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');

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

    async run(message, args, kimiwa) { // eslint-disable-line no-unused-vars

        let mode = args[0];
        let name = args.splice(1).join(' ');

        

        kimiwa.osu.user
            .get(name, mode)
            .then(data => {
               
            }).catch((error) => {
                
            })
    };
};



module.exports = Osu;