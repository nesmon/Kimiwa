const Command = require("../../base/Command.js");

class Kitsuboard extends Command {
  constructor(client) {
    super(client, {
      name: "kitsuboard",
      description: "Scoreboard",
      category: "Anime and manga",
      usage: "kitsuboard [anime/manga]",
      aliases: ["kitsuboard", "kb"]
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars

  }
}

module.exports = Kitsuboard;