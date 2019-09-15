const Command = require("../../base/Command.js");


class Help extends Command {
  constructor (client) {
    super(client, {
      name: "help",
      description: "Displays all the available commands for you.",
      category: "System",
      cooldown: 10,
      usage: "help [command]",
      aliases: ["h", "halp"]
    });
  }

  async run (message, args, level) {
    
  }
}

module.exports = Help;
