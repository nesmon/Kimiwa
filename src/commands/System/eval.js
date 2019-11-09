const Command = require("../../base/Command.js");

class Eval extends Command {
  constructor (client) {
    super(client, {
      name: "eval",
      description: "Evaluates arbitrary Javascript.",
      category:"System",
      usage: "eval <expression>",
      cooldown: 0,
      enabled: false,
      aliases: ["ev"],
      permLevel: "owner"
    });
  }

  async run (message, args, kimiwa) { 
    const code = args.join(" ");
    try {
      const evaled = eval(code);
      const clean = await kimiwa.clean(this.client, evaled);
      // sends evaled output as a file if it exceeds the maximum character limit
      // 6 graves, and 2 characters for "js"
      const MAX_CHARS = 3 + 2 + clean.length + 3;
      if (MAX_CHARS > 2000) {
        message.channel.createMessage("Output exceeded 2000 characters. Sending as a file.", { files: [{ attachment: Buffer.from(clean), name: "output.txt" }] });
      }
      message.channel.createMessage(`\`\`\`js\n${clean}\n\`\`\``);
    } catch (err) {
      message.channel.createMessage(`\`ERROR\` \`\`\`xl\n${await kimiwa.clean(this.client, err)}\n\`\`\``);
    }
  }
}

module.exports = Eval;
