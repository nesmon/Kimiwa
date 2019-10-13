const Command = require("../../base/Command.js");

class Ping extends Command {
  constructor (client) {
    super(client, {
      name: "ping",
      description: "Latency and API response times.",
      usage: "ping",
      cooldown: 4,
      aliases: ["pong"]
    });
    this.key = 'how are you'
  }

  async run (message, args) { // eslint-disable-line no-unused-vars
    try {
        this.client.createMessage(message.channel.id, "Hakuna matata");
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Ping;