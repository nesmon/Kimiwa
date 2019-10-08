const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');

class Help extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      description: "Displays all the available commands for you.",
      category: "System",
      cooldown: 10,
      usage: "help [command]",
      aliases: ["h", "halp"]
    });
  }

  async run(message, args, kimiwa, level) {
    let desc = [];

    let levelCache = {};
    for (let i = 0; i < kimiwa.config.permLevels.length; i++) {
      const thisLevel = kimiwa.config.permLevels[i];
      levelCache[thisLevel.name] = thisLevel.level;
    }

    if (!args[0]) {
      const myCommands = message.guild ? kimiwa.commands.filter(cmd => levelCache[cmd.conf.permLevel] <= level) : kimiwa.commands.filter(cmd => levelCache[cmd.conf.permLevel] <= level && cmd.conf.guildOnly !== true);

      let currentCategory = "";
      const sorted = Array.from(myCommands.values()).sort((p, c) => p.help.category > c.help.category ? 1 : p.help.name > c.help.name && p.help.category === c.help.category ? 1 : -1);

      let em = new kimiwaHelper.Embed()

      for (let i = 0; i < kimiwaHelper.KCategory.length; i++) {
        let cmd = sorted.filter(cate => cate.help.category === kimiwaHelper.KCategory[i])

        if (currentCategory !== cmd[0].help.category) {
          em.setTitle(`Command List : `)
          em.setTimestamp();
          em.setFooter(`Use ${kimiwa.prefix}help <commandname> for details`)
          em.setColor('BLUE')
          desc = []
          currentCategory = cmd[0].help.category;
        }

        for (let i = 0; i < cmd.length; i++) {
          desc.push(`-${kimiwa.config.prefix}${cmd[i].help.name}`)
        }

        em.addField(`${cmd[0].help.category}`, `${desc.join("\n")}`, true)
      }

      if (Number.isInteger(kimiwaHelper.KCategory.length / 3)) {} else {
        em.addBlankField(true)
      }

      message.channel.createEmbed(em)
    } else {
      let command = args[0];
      if (kimiwa.commands.has(command)) {
        command = kimiwa.commands.get(command);
        if (level < levelCache[command.conf.permLevel]) return;
        message.channel.createEmbed(new kimiwaHelper.Embed()
          .setColor('RANDOM')
          .setTitle(`${command.help.name}`)
          .setDescription(`${command.help.description.charAt(0).toUpperCase() + command.help.description.slice(1)}\n**Usage : **${command.help.usage}\n**Aliase : **${command.conf.aliases.join(", ")}`)
        )
      }
    }
  }
}

module.exports = Help;