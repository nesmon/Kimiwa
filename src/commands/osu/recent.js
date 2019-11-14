const Command = require("../../base/Command.js");
const kimiwaHelper = require('../../kimiwaHelper');

class Recent extends Command {
    constructor(client) {
        super(client, {
            name: "recent",
            category: "Osu",
            description: "Get osu information about last play of player",
            usage: "rs --name [name of user] --mode [standard/mania/taiko/catch optional, by default std is select]",
            aliases: ["rs"]
        });
    }

    async run(message, args, kimiwa, level, IA) { // eslint-disable-line no-unused-vars
        let name;
        let mode;

        if (IA === true) {
            name = args[0];
            mode = args[1] || 'standard';
        } else {
            name = kimiwaHelper.flags(message.content, "--name");
            mode = kimiwaHelper.flags(message.content, "--mode");
        }

        if (name === false) {
            name = args.splice(0).join(' ');
            if (name === '') {
                const osuName = await kimiwaHelper.preparedQuery(kimiwa.db, 'SELECT * FROM profile WHERE user_ID = ?', message.author.id);
                name = osuName[0].osu_username;
                if (name === '' || name === null) {
                    return message.channel.createEmbed(new kimiwaHelper.Embed().setColor('RED').setAuthor("ERROR", message.author.avatarURL).setDescription(`Thanks to asigne name to your command with --name [name of command] or just put your name if you search in std`));
                }
            }
        }

        if (mode === false) mode = 'std';

        const getRecent = await kimiwaHelper.osuAPI(kimiwa, 'getRecent', name, mode, 1);
        console.log(getRecent);


    };
}



module.exports = Recent;