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

  async run (message, args, level, id) { // eslint-disable-line no-unused-vars
    if (!args || args.size < 1) return this.client.createMessage(id, "Must provide a command to reload. Derp.");
    
    if (args[0] === "mysql") {
      this.client._reloadKimiwaDB();
      return this.client.createMessage(id, "MYSQL reload");
    }
    
    const commands = this.client.commands.get(args[0]) || this.client.commands.get(this.client.aliases.get(args[0]));
    if (!commands) return this.client.createMessage(id, `The command \`${args[0]}\` does not exist, nor is it an alias.`);

    let response = await this.client._unloadCommand(commands.conf.location, commands.help.name);
    if (response) return this.client.createMessage(id, `Error Unloading: ${response}`);

    response = this.client._loadCommand(commands.conf.location, commands.help.name);
    if (response) return this.client.createMessage(id, `Error loading: ${response}`);

    this.client.createMessage(id, `The command \`${commands.help.name}\` has been reloaded`);
  }
}
module.exports = Reload;