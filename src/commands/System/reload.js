const Command = require("../../base/Command.js");

class Reload extends Command {
  constructor (client) {
    super(client, {
      name: "reload",
      description: "Reloads a command that has been modified.",
      category: "System",
      usage: "reload [command]",
      permLevel: "Bot Admin"
    });
  }

  async run (message, args, kimiwa, id) { // eslint-disable-line no-unused-vars
    if (!args || args.size < 1) return kimiwa.createMessage(id, "Must provide a command to reload. Derp.");
    
    const commands = kimiwa.commands.get(args[0]) || kimiwa.commands.get(this.client.aliases.get(args[0]));
    if (!commands) return kimiwa.createMessage(id, `The command \`${args[0]}\` does not exist, nor is it an alias.`);

    let response = await kimiwa._unloadCommand(commands.conf.location, commands.help.name);
    if (response) return kimiwa.createMessage(id, `Error Unloading: ${response}`);

    response = kimiwa._loadCommand(commands.conf.location, commands.help.name);
    if (response) return kimiwa.createMessage(id, `Error loading: ${response}`);

    kimiwa.createMessage(id, `The command \`${commands.help.name}\` has been reloaded`);
  }
}
module.exports = Reload;