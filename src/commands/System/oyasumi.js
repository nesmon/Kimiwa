const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');


class Oyasumi extends Command {
  constructor(client) {
    super(client, {
      name: "oyasumi",
      description: "See you next time Kimiwa",
      category: "System",
      usage: "oyasumi",
      nsfw: false,
      permLevel: "Owner"
    });
  }

  async run(message, args, level, id) { // eslint-disable-line no-unused-vars
    const react = await message.channel.createMessage(this.embed(message, "Would you stop the bot ?"))
    this.client.addMessageReaction(message.channel.id, react.id, '✅')
    this.client.addMessageReaction(message.channel.id, react.id, '❌');


    const reactionListener = new kimiwaHelper.ReactionHandler.continuousReactionStream(
      react,
      (userID) => userID === message.author.id,
      false, {
        maxMatches: 1,
        time: 10000
      }
    );

    reactionListener.on('reacted', async (event) => {
      if (event.emoji.name === '✅') {
        await react.edit(this.embed(message, "Bot will now disconnect"));
        await react.removeReactions();
        this.client.disconnect();
        process.exit(1);
      } else if (event.emoji.name === '❌') {
        await react.edit(this.embed(message, "Bot continue to serv people !"));
        await react.removeReactions();
      }
    });
  }

  embed(message, content) {
    const data = {
      "embed": {
        "description": content,
        "color": 12238334,
        "timestamp": new Date(),
        "footer": {
          "icon_url": message.author.avatarURL,
          "text": "Kimiwa"
        }
      }
    };
    return data;
  }
}
module.exports = Oyasumi;