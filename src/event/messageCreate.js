const Eris = require("eris");
const kimiwaHelper = require('./../kimiwaHelper')


module.exports = class {
  constructor(client) {
    this.kimiwa = client;
    this.cooldown = new Eris.Collection();
  }

  async run(message) {

    if (message.author.bot) return;

    let id = message.channel.id;

    if (message.guild && !message.channel.memberHasPermission(this.kimiwa.user.id, "sendMessages")) return;

    const prefixMention = new RegExp(`^<@!?${this.kimiwa.user.id}>( |)$`);
    if (message.content.match(prefixMention)) {
      this.kimiwa.createMessage(message.channel.id, `My prefix on this guild is \`${this.kimiwa.prefix}\``);
    }


    if (message.content.indexOf(this.kimiwa.prefix) !== 0) return;

    const args = message.content.slice(this.kimiwa.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();


    if (message.guild && !message.member) await message.guild.fetchMember(message.author);

    const cmd = this.kimiwa.commands.get(command) || this.kimiwa.commands.get(this.kimiwa.aliases.get(command));

    // If command not found, try find this command in custom command database
    if (!cmd) {
      const cmdName = message.content.slice(this.kimiwa.prefix.length).split(" ")
      const getCustomCommand = await kimiwaHelper.preparedQuery(this.kimiwa.db, 'SELECT * FROM customcmdserver WHERE guildID = ?', [message.channel.guild.id])

      if (getCustomCommand.length > 0) {
        console.log(cmdName[0])
        for (let i = 0; i < getCustomCommand.length; i++) {
          if (cmdName[0] === getCustomCommand[i].name) {
            return message.channel.createMessage(getCustomCommand[i].value)
          }
        }
        return;
      } else {
        return;
      }

    }

    // Verify nsfw
    if (cmd.help.nsfw && !message.channel.nsfw) {
      return this.kimiwa.createMessage(id, `Command **${cmd.help.name}** is only available in NSFW channels!`);
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
        return this.kimiwa.createMessage(id, `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${cmd.name}\` command.`);
      }

    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    
    // Perm level part
    const level = this.kimiwa._permlevel(message);

    let levelCache = {};
    for (let i = 0; i < this.kimiwa.config.permLevels.length; i++) {
      const thisLevel = this.kimiwa.config.permLevels[i];
      levelCache[thisLevel.name] = thisLevel.level;
    }

    if (level < levelCache[cmd.conf.permLevel]) {
      return this.kimiwa.createMessage(message.channel.id, "You are not allowed to use his command :/")
    }

    // Verify if commands is available on DM
    if (cmd && !message.guild && cmd.conf.guildOnly)
      return this.kimiwa.createMessage(message.channel.id, "This command is unavailable via private message. Please run this command in a guild.");

    message.flags = [];
    while (args[0] && args[0][0] === "-") {
      message.flags.push(args.shift().slice(1));
    }

    cmd.run(message, args, this.kimiwa, id);
  };
};