const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');

class removeCommand extends Command {
    constructor(client) {
        super(client, {
            name: "removecommand",
            description: "Remove command on you server",
            category: "Server",
            usage: "removecommand --name [name of command]",
            permLevel: "serverowner",
            aliases: ["rcm"]
        });
    }

    async run(message, args, kimiwa) { // eslint-disable-line no-unused-vars

        let name = kimiwaHelper.flags(message.content, "--name")

        if (name === false) return message.channel.createEmbed(new kimiwaHelper.Embed().setColor('RED').setAuthor("ERROR", message.author.avatarURL).setDescription(`Thanks to asigne name to your command with --name [name of command]`));

        try {

            const id = message.channel.guild.id;

            const getServer = await kimiwaHelper.query(kimiwa.db, `SELECT name FROM customcmdserver WHERE guildID = '${id}' AND name = '${name}'`);
            
            if (getServer.length > 0) {} else {
                return message.channel.createEmbed(new kimiwaHelper.Embed()
                    .setColor('RED')
                    .setAuthor("ERROR", message.author.avatarURL)
                    .setDescription(`Sorry but this command dosn't exist on this server.`)
                );
            }


            await kimiwaHelper.query(kimiwa.db, `DELETE FROM customcmdserver WHERE guildID = '${id}' AND name = '${name}'`);

            message.channel.createEmbed(new kimiwaHelper.Embed()
                .setColor('GREEN')
                .setAuthor("Succes", message.author.avatarURL)
                .setDescription(`Command has been removed`))

        } catch (error) {
            console.log(error)
            return message.channel.createEmbed(new kimiwaHelper.Embed()
                .setColor('RED')
                .setAuthor("ERROR", message.author.avatarURL)
                .setDescription(`An error has been occured, please try again.`))
        }

    }
}


module.exports = removeCommand;