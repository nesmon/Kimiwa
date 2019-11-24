const {Client, Collection} = require('eris-additions')(require('eris'));
const KimiwaConfig = require('./config/config');
const kimiwaHuman = require('./src/extensions/KimiwaHuman');
const kimiwaUser = require('./src/extensions/KimiwaUser');
const {promisify} = require("util");
const readdir = promisify(require("fs").readdir);
const mysql = require('mysql');
const klaw = require("klaw");
const path = require("path");
const Nodesu = require('nodesu');

class KimiwaCore extends Client {
  constructor() {
    super(KimiwaConfig.token, {"restMode": true});
    this.commands = new Collection();
    this.aliases = new Collection();
    this.modules = new Collection();

    this.human = new kimiwaHuman(this);
    this.user = new kimiwaUser(this);

    this.config = KimiwaConfig;

    this.prefix = KimiwaConfig.prefix;
    this.db = mysql.createConnection(KimiwaConfig.mysqlConfig);
    this.osu = new Nodesu.Client(KimiwaConfig.osu_apikey);

    this.db.connect(this._initKimiwaDB);
    this._addEventListeners();
    this._registerCommands();
    this._catchUnhandledRejections();

    this.connect();
  }

  async _addEventListeners() {
    const evtFiles = await readdir(`./src/event/`);
    console.log(`Loading a total of ${evtFiles.length} events.`);
    evtFiles.forEach(file => {
      const eventName = file.split(".")[0];
      const event = new(require(`./src/event/${file}`))(this);
      console.log(`Loading Event : ${eventName} `);
      this.modules.set(eventName, event);
      this.on(eventName, (...args) => event.run(...args));
    });
  }

  _registerCommands() {
    klaw(`./src/commands`).on("data", (item) => {
      const cmdFile = path.parse(item.path);
      if (!cmdFile.ext || cmdFile.ext !== ".js") return;
      const response = this._loadCommand(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`);
      if (response) console.log(response);
    });
  }

  _loadCommand(commandPath, commandName) {
    try {
      const props = new(require(`${commandPath}${path.sep}${commandName}`))(this);
      console.log(`Loading Command : ${props.help.name}.`, "log");
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
      return console.log(`Unable to load command ${commandName} \nError : ${e}`);
    }
  }

  async _unloadCommand(commandPath, commandName) {
    let command;
    if (this.commands.has(commandName)) {
      command = this.commands.get(commandName);
    } else if (this.aliases.has(commandName)) {
      command = this.commands.get(this.aliases.get(commandName));
    }
    if (!command) return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;

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

  async _initKimiwaDB(connectionError) {
    if (connectionError) {
      console.log(`DATABASE ERROR \nA connection error surfaced: ${connectionError}`);
    } else {
      console.log(`DATABASE CONNECTION \nSuccessfully connected to the database!`);
    }
  }
}

module.exports = new KimiwaCore();