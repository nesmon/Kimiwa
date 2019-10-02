const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');

class addCommand extends Command {
    constructor(client) {
        super(client, {
            name: "addcommand",
            description: "Add you own custom textual command",
            category: "Server",
            usage: "addcommand ",
            permLevel: "Owner",
            aliases: ["acm"]
        });
    }

    async run(message, args, kimiwa) { // eslint-disable-line no-unused-vars

        let name = kimiwaHelper.flags(message.content, "--name")
        let value = kimiwaHelper.flags(message.content, "--value")

        if (name === false) return message.channel.createEmbed(new kimiwaHelper.Embed().setColor('RED').setAuthor("ERROR", message.author.avatarURL).setDescription(`Thanks to asigne name to your command with --name [name of command]`));
        if (value === false) return message.channel.createEmbed(new kimiwaHelper.Embed().setColor('RED').setAuthor("ERROR", message.author.avatarURL).setDescription(`Thanks to asigne value to your command with --value [value of command]`));

        try {
            const id = `${message.channel.guild.id}`;
            let cmd = {
                guildID: id,
                createBy: message.author.id,
                name: name.replace(/ +/g, ""),
                value: value
            }

            const getServer = await kimiwaHelper.preparedQuery(kimiwa.db, 'SELECT name FROM customcmdserver WHERE guildID = ?', id);

            for (let i = 0; i < getServer.length; i++) {
                if (getServer[i].name === name) {
                    return message.channel.createEmbed(new kimiwaHelper.Embed()
                        .setColor('RED')
                        .setAuthor("ERROR", message.author.avatarURL)
                        .setDescription(`Sorry but this command already exist on this server.`)
                    );
                }
            }

            kimiwaHelper.preparedQuery(kimiwa.db, `INSERT INTO customcmdserver SET ?`, cmd);
            message.channel.createEmbed(new kimiwaHelper.Embed()
                .setColor('GREEN')
                .setAuthor("New command added :", message.author.avatarURL)
                .setDescription(`The command **${name.replace(/ +/g, "")}** has creat for this server`)
            )
        } catch (error) {
            return message.channel.createEmbed(new kimiwaHelper.Embed()
                .setColor('RED')
                .setAuthor("ERROR", message.author.avatarURL)
                .setDescription(`An error has been occured, please try again.`))
        }

    }
}


module.exports = addCommand;