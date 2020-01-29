const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');

class Kitsuboard extends Command {
  constructor(client) {
    super(client, {
      name: 'kitsuboard',
      description: 'Scoreboard',
      category: 'Anime and manga',
      usage: 'kitsuboard',
      aliases: ['kitsuboard', 'kb']
    });
  }

  async run(message, args, kimiwa) { // eslint-disable-line no-unused-vars

    const getQuery = await kimiwaHelper.query(this.client.db, 'SELECT * FROM anime ORDER BY search_time DESC LIMIT 5')

    const e = await new kimiwaHelper.Embed()
      .setDescription(`Our top 5 of most searched anime`)
      .setColor(kimiwaHelper.getRandomColor())

    for (const data of await getQuery) {
      e.addField(`${data.title}`, `Searched ${data.search_time} time\n[${data.title} page.](${data.url})`)
    }

    message.channel.createEmbed(e);
  }
}

module.exports = Kitsuboard;