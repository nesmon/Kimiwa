const kimiwaHelper = require('./../kimiwaHelper');
const IA = require('./../constants/IAcmd');

class kimiwaHuman {
    constructor(client) {
        this.kimiwa = client;
    }

    preconditionned(str, message) {
        let out;
        let func;
        let inp;

        const level = this.kimiwa._permlevel(message);

        let levelCache = {};
        for (let i = 0; i < this.kimiwa.config.permLevels.length; i++) {
            const thisLevel = this.kimiwa.config.permLevels[i];
            levelCache[thisLevel.name] = thisLevel.level;
        }

        str = str.replace(`<@${this.kimiwa.user.id}>`, '').trim();

        if (str.includes('cmd') || str.includes('commands') || str.includes('command')) {
            str = str.replace(/(\w*command)|(\w*cmd)|(\w*commands)/, '');
        }

        str = str.replace(/[\s]{2,}/g, " ");
        str = str.toLowerCase();

        for (let i = 0; i < IA.length; i++) {
            if (str.includes(IA[i].input)) {
                out = IA[i].output;
                func = IA[i].function;
                inp = IA[i].input;
                break;
            }
        }

        if (out === void 0 && func === void 0) {
            return console.log('sorry')
        }

        this.selectFunc(out, func, inp, str, message, level, levelCache)
    }

    selectFunc(out, func, inp, str, message, level, levelCache) {

        switch (func) {
            case 'osu':
                this.osu(out, inp, str, message, level, levelCache);
                break;
            case 'help':
                this.help(out, inp, str, message, level, levelCache);
                break;
            case 'search':
                this.search(out, inp, str, message, level, levelCache);
                break;
            case 'kitsu':
                this.kitsu(out, str, message, level, levelCache);
                break;
            case 'server':
                this.server(out, inp, str, message, level, levelCache);
                break;
            default:
                break;
        }

    }

    osu(out, inp, str, message, level, levelCache) {
        let args = [];
        let cmdName;

        if (out === 'roll') {
            cmdName = 'roll';
        }

        if (out === 'osubest') {
            str = str.split(inp);

            if (str[1].includes('in osu')) {
                str = str[1].replace('in osu', '');
                str = str.split('  ');

                args.push(str[0].trim());

                str = str[1].split(' ');
                args.push(str[0]);
            } else {
                args.push(str[1]);
                args.push('standard');
            }

            console.log(args);
            cmdName = 'osubest';
        }

        this.run(cmdName, args, message, level, levelCache)

    }

    help(out, inp, str, message, level, levelCache) {
        let args = [];
        let cmdName;

        if (out === 'help1') {
            str = str.trim();
            str = str.replace(inp, '');

            cmdName = this.kimiwa.commands.map(x => x.name);

            for (let i = 0; i < cmdName.length; i++) {
                if (str.includes(cmdName[i])) {
                    args.push(cmdName[i]);
                    break
                }
            }

            if (args[0] === void 0) return message.channel.createMessage('Please specify the name of an command you want to understand');

            cmdName = 'help';
        }

        if (out === 'help4') cmdName = 'help';

        this.run(cmdName, args, message, level, levelCache);
    }

    search(out, inp, str, message, level, levelCache) {
        let args = [];
        let cmdName;

        if (out === 'search') {
            if (str.includes(`in osu`)) {
                str = str.split(inp);
                str = str[1].split('in osu');
                args.push(str[0].trim());

                str = str[1].split(' ');

                if (str[0] === '' || str[0] === ' ') {
                    args.push('standard');
                } else {
                    args.push(str[1].trim());
                }

                cmdName = 'osu';
            } else if (str.includes('in anime')) {
                str = str.split(inp);
                str = str[1].split('in anime');

                args.push(str[0].trim());

                cmdName = 'kitsu';
            }
        }

        this.run(cmdName, args, message, level, levelCache);
    }

    kitsu(out, str, message, level, levelCache) {
        let args = [];
        let cmdName;

        if (out === 'randomanime') cmdName = 'randomanime';
        if (out === 'leaderboard') cmdName = 'kitsuboard';

        this.run(cmdName, args, message, level, levelCache);
    }

    server(out, inp, str, message, level, levelCache) {
        let args = [];
        let cmdName;

        if (out === 'clear') {
            str = str.split('clear');
            str = str[1];
            str = str.trim().split(' ');

            args.push(str[0]);
            cmdName = 'clear';
        }

        this.run(cmdName, args, message, level, levelCache)
    }



    run(cmdName, args, message, level, levelCache) {

        if (cmdName === void 0) {
            return;
        }

        let cmd = this.kimiwa.commands.get(cmdName);

        if (level < levelCache[cmd.conf.permLevel]) {
            return;
        }

        if (cmd && !message.guild && cmd.conf.guildOnly)
            return message.channel.createMessage("This command is unavailable via private message. Please run this command in a guild.");

        cmd.run(message, args, this.kimiwa, level, true);
        args = [];
    }

}

module.exports = kimiwaHuman;