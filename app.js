const Eris = require('eris-additions')(require('eris'));
const ReactionHandler = require('eris-reactions');
const EmbedPaginator = require('eris-pagination');
const KimiwaConfig = require('./config/config')
const {
  promisify
} = require("util");
const readdir = promisify(require("fs").readdir);
const mysql = require('mysql');
const klaw = require("klaw");
const path = require("path");

class KimiwaCore extends Eris.Client {
  constructor() {
    super(KimiwaConfig.token);
    this.commands = new Eris.Collection();
    this.modules = new Eris.Collection();
    this.aliases = new Eris.Collection();
    this.config = KimiwaConfig;
    this.reactionHandler = ReactionHandler;
    this.embedPaginator = EmbedPaginator;
    

    this.prefix = KimiwaConfig.prefix;
    // this.db = mysql.createConnection(KimiwaConfig.mysqlConfig);

    // this.db.connect(this._initDatabase)
    this._addEventListeners();
    this._registerCommands();
    this._catchUnhandledRejections();

    this.connect();
  }


  // Make individual event in this function like kirameki
  async _addEventListeners() {
    const evtFiles = await readdir("./src/event/");
    console.log(`Loading a total of ${evtFiles.length} events.`);
    evtFiles.forEach(file => {
      const eventName = file.split(".")[0];
      const event = new(require(`./src/event/${file}`))(this);
      this.modules.set(eventName, event);
      this.on(eventName, (...args) => event.run(...args));
    });
  }

  _registerCommands() {
    klaw("./src/commands").on("data", (item) => {
      const cmdFile = path.parse(item.path);
      if (!cmdFile.ext || cmdFile.ext !== ".js") return;
      const response = this._loadCommand(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`);
      if (response) console.log(response);
    });
  }

  _loadCommand(commandPath, commandName) {
    try {
      const props = new(require(`${commandPath}${path.sep}${commandName}`))(this);
      console.log(`Loading Command: ${props.help.name}.`, "log");
      props.conf.location = commandPath;
      if (props.init) {
        props.init(this);
      }
      this.commands.set(props.help.name, props);
      props.conf.aliases.forEach(alias => {
        this.aliases.set(alias, props.help.name);
      });
      return false;
    } catch (e) {
      return `Unable to load command ${commandName}: ${e}`;
    }
  }

  async _unloadCommand(commandPath, commandName) {
    let command;
    if (this.commands.has(commandName)) {
      command = this.commands.get(commandName);
    } else if (this.aliases.has(commandName)) {
      command = this.commands.get(this.aliases.get(commandName));
    }
    if (!command) return `The command \`${commandName}\` doesn"t seem to exist, nor is it an alias. Try again!`;

    if (command.shutdown) {
      await command.shutdown(this);
    }
    delete require.cache[require.resolve(`${commandPath}${path.sep}${commandName}.js`)];
    return false;
  }


  _catchUnhandledRejections() {
    process.on('unhandledRejection', (error, promise) => {
      console.log('Promise error : ', `An unhandled promise rejection occurred. Promise: ${promise} | Rejection: ${error}`)
      process.exit(1)
    })
  }

  _permlevel(message) {
    let permlvl = 0;

    const permOrder = this.config.permLevels.slice(0).sort((p, c) => p.level < c.level ? 1 : -1);

    while (permOrder.length) {
      const currentLevel = permOrder.shift();
      if (message.guild && currentLevel.guildOnly) continue;
      if (currentLevel.check(message)) {
        permlvl = currentLevel.level;
        break;
      }
    }
    return permlvl;
  }

  _initDatabase(connectionError) {
    if (connectionError) {
        console.log(`DATABASE ERROR \nA connection error surfaced: ${connectionError}`);
    }

    console.log("DATABASE CONNECTION \nSuccessfully connected to the database!");
}

  levelCache() {
    this.client.levelCache = {};
    for (let i = 0; i < this.client.config.permLevels.length; i++) {
      const thisLevel = this.client.config.permLevels[i];
      this.client.levelCache[thisLevel.name] = thisLevel.level;
    }
  }

  async clean(client, text) {
    if (text && text.constructor.name == "Promise")
      text = await text;
    if (typeof evaled !== "string")
      text = require("util").inspect(text, {
        depth: 1
      });

    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203))
      .replace(client.config.token, "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0");

    return text;
  };

}

module.exports = new KimiwaCore()


// client.on("messageCreate", (msg) => {

//     if (msg.content === "!ping") {
//         client.editChannel(msg.channel.id, {
//             name: "eris-test",
//             topic: `erisjs`
//         }, "some test")
//         client.createMessage(msg.channel.id, "Pong!").then((data) => {
//             setTimeout(() => {
//                 client.addMessageReaction(msg.channel.id, data.id, '😄')
//             }, 500);
//         })

//     }
// });

// client.on("messageDelete", (msg) => {
//     console.log("A message as remove")
// });

// client.on("messageReactionAdd", (message, emoji, userID) => {
//     //client.addGuildMemberRole(message.channel.guild.id, userID, "601380709625626624")
// })

// client.connect();