const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');

class editCommand extends Command {
    constructor(client) {
        super(client, {
            name: "editcommand",
            description: "edit you own custom textual command",
            category: "Server",
            usage: "editcommand --name [name of command --value [new value]",
            permLevel: "serverowner",
            aliases: ["ecm"]
        });
    }

    async run(message, args, kimiwa) { // eslint-disable-line no-unused-vars

        let name = kimiwaHelper.flags(message.content, "--name")
        let value = kimiwaHelper.flags(message.content, "--value")

        if (name === false) return message.channel.createEmbed(new kimiwaHelper.Embed().setColor('RED').setAuthor("ERROR", message.author.avatarURL).setDescription(`Thanks to asigne name to your command with --name [name of command]`));
        if (value === false) return message.channel.createEmbed(new kimiwaHelper.Embed().setColor('RED').setAuthor("ERROR", message.author.avatarURL).setDescription(`Thanks to asigne value to your command with --value [value of command]`));

        try {
            console.log(name)
            const id = `${message.channel.guild.id}`;

            const getServer = await kimiwaHelper.query(kimiwa.db, `SELECT * FROM customcmdserver WHERE guildID = '${id}' AND name = '${name}'`);

            if (getServer.length === 0) {
                return message.channel.createEmbed(new kimiwaHelper.Embed()
                    .setColor('RED')
                    .setAuthor("ERROR", message.author.avatarURL)
                    .setDescription(`Sorry but this command dosn't exist on this server.`)
                );
            }

            let cmd = {
                guildID: id,
                createBy: message.author.id,
                name: getServer[0].name,
                value: value
            }

            kimiwaHelper.preparedQuery(kimiwa.db, `UPDATE customcmdserver SET ? WHERE name = ${getServer[0].name}`, cmd);
            message.channel.createEmbed(new kimiwaHelper.Embed()
                .setColor('GREEN')
                .setAuthor("New command added :", message.author.avatarURL)
                .setDescription(`The command **${getServer[0].name}** has edit for this server`)
                .addField("Old value : ", `${getServer[0].value}`, true)
                .addField("New value : ", `${value}`, true)
            )
        } catch (error) {
            console.log(error)
            return message.channel.createEmbed(new kimiwaHelper.Embed()
                .setColor('RED')
                .setAuthor("ERROR", message.author.avatarURL)
                .setDescription(`An error has been occured, please try again.`))
        }

    }
}


module.exports = editCommand;