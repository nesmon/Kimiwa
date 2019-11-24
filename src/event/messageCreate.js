const Eris = require("eris");
const kimiwaHelper = require('./../kimiwaHelper');

module.exports = class MessageCreate {
  constructor(client) {
    this.kimiwa = client;
    this.cooldown = new Eris.Collection();
    this.user = this.kimiwa.user;
  }

  async run(message) {

    if (message.author.bot) return;

    // Verify if user is ban. If it's not ban kimiwa add one point to send message (only use for stats)
    let user = await this.user.verifyUser(message);

    if (user === false) {
      return kimiwaHelper.flashMessage(message, 'You are ban :', 'Sorry but you are **ban** by an operator.\nYou can\'t use part of this bot.\nTry to contact an operator for unban or more information', 'RED', 10000);
    }
    await this.user.addMessage(message);

    // Verify if kimiwa can send message
    if (message.guild && !message.channel.memberHasPermission(this.kimiwa.user.id, "sendMessages")) return;


    // Human part
    const prefixMention = new RegExp(`^<@!?${this.kimiwa.user.id}>( |)$`);
    if (message.content.match(prefixMention)) {
      return kimiwaHelper.flashMessage(message, `Prefix : ${this.kimiwa.prefix}`, `For more help about bot : ${this.kimiwa.prefix}help or ${this.kimiwa.prefix}help [cmdname]`, 'PURPLE', 10000);
    }

    if (message.content.indexOf(`<@${this.kimiwa.user.id}>`) !== -1) {
      if (user === false) {
        return kimiwaHelper.flashMessage(message, 'You are ban :', 'Sorry but you are **ban** by an operator.\nYou can\'t use part of this bot.\nTry to contact an operator for unban or more information', 'RED', 10000);
      } else {
        if (message.content.indexOf(this.kimiwa.prefix) !== 0 ) {
          this.kimiwa.human.preconditionned(message.content, message);
        }
      }
    }

    // Detect if message contain prefix of Kimiwa 
    if (message.content.indexOf(this.kimiwa.prefix) !== 0) return;

    const args = message.content.slice(this.kimiwa.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (message.guild && !message.member) await message.guild.fetchMember(message.author);

    const cmd = this.kimiwa.commands.get(command) || this.kimiwa.commands.get(this.kimiwa.aliases.get(command));

    // If command not found, try find this command in custom command database
    if (!cmd) {
      const cmdName = message.content.slice(this.kimiwa.prefix.length).split(" ");
      const getCustomCommand = await kimiwaHelper.preparedQuery(this.kimiwa.db, 'SELECT * FROM customcmdserver WHERE guildID = ?', [message.channel.guild.id]);

      if (getCustomCommand.length > 0) {
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
      return kimiwaHelper.flashMessage(message, 'NSFW', 'This command can only use in NSFW channel', 'RED', 10000);
    }

    // Cooldown part :
    if (!this.cooldown.has(cmd.name)) {
      this.cooldown.set(cmd.name, new Eris.Collection());
    }

    const now = Date.now();
    const timestamps = this.cooldown.get(cmd.name);
    const cooldownAmount = (cmd.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return kimiwaHelper.flashMessage(message, 'Cooldown',  `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${cmd.name}\` command.`, 'BLUE', 10000);
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
      return;
    }

    // Verify if commands is available on DM
    if (cmd && !message.guild && cmd.conf.guildOnly)
      return kimiwaHelper.flashMessage(message, 'Hum ...', "This command is unavailable via private message. Please run this command in a guild.", 'BLUE', 10000);

    message.flags = [];
    while (args[0] && args[0][0] === "-") {
      message.flags.push(args.shift().slice(1));
    }

    cmd.run(message, args, this.kimiwa, level, false);
  };
};