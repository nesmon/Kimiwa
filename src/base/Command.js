class Command {

  constructor(client, {
    name = null,
    description = 'No description provided.',
    category = 'Miscellaneous',
    usage = 'No usage provided.',
    nsfw = false,
    enabled = true,
    cooldown = 3,
    guildOnly = false,
    aliases = new Array(),
    permLevel = 'user'
  }) {
    this.client = client;
    this.conf = { nsfw, enabled, cooldown, guildOnly, aliases, permLevel };
    this.help = { name, description, category, usage, nsfw };
    this.category = category;
    this.name = name;
    this.cooldown = cooldown;
  }
}
module.exports = Command;