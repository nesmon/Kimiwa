// The MESSAGE event runs anytime a message is received
// Note that due to the binding of client to every event, every event
// goes `client, other, args` when this function is run.
const Eris = require("eris");


module.exports = class {
  constructor(client) {
    this.client = client;
    this.cooldown = new Eris.Collection();
  }



  async run(message) {

    if (message.author.bot) return;

    let id = message.channel.id;

    if (message.guild && !message.channel.permissionsFor(message.guild.me).missing("SEND_MESSAGES")) return;

    const prefixMention = new RegExp(`^<@!?${this.client.user.id}>( |)$`);
    if (message.content.match(prefixMention)) {
      this.client.createMessage(message.channel.id, `My prefix on this guild is \`${this.client.prefix}\``);
    }


    if (message.content.indexOf(this.client.prefix) !== 0) return;

    const args = message.content.slice(this.client.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();


    if (message.guild && !message.member) await message.guild.fetchMember(message.author);

    const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

    if (!cmd) return;


    // Verify nsfw
    if (cmd.help.nsfw && !message.channel.nsfw) {
      return this.client.createMessage(id, `Command **${cmd.help.name}** is only available in NSFW channels!`);
    }


    // Cooldown part :
    if (!this.cooldown.has(cmd.name)) {
      this.cooldown.set(cmd.name,new Eris.Collection());
    }

    const now = Date.now();
    const timestamps = this.cooldown.get(cmd.name);
    const cooldownAmount = (cmd.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return this.client.createMessage(id, `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${cmd.name}\` command.`);
      }

    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    
    // Perm level part
    const level = this.client._permlevel(message);

    let levelCache = {};
    for (let i = 0; i < this.client.config.permLevels.length; i++) {
      const thisLevel = this.client.config.permLevels[i];
      levelCache[thisLevel.name] = thisLevel.level;
    }

    if (level < levelCache[cmd.conf.permLevel]) {
      return this.client.createMessage(message.channel.id, "You are not allowed to use his command :/")
    }

    // Verify if commands is available on DM
    if (cmd && !message.guild && cmd.conf.guildOnly)
      return this.client.createMessage(message.channel.id, "This command is unavailable via private message. Please run this command in a guild.");

    message.flags = [];
    while (args[0] && args[0][0] === "-") {
      message.flags.push(args.shift().slice(1));
    }


    cmd.run(message, args, level, id);
  };
};