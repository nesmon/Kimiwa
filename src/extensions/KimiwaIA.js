const kimiwaHelper = require('./../kimiwaHelper');
const IA = require('./../constants/IAcmd')

class kimiwaIA {
    constructor(client) {
        this.kimiwa = client;
    }

    preconditionned(str, message) {
        let out;
        let func;
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
                func = IA[i].function
                break;
            }
        }

        if (out === void 0 && func === void 0) {
            return console.log('sorry')
        }

        this.selectFunc(out, func, str, message, level, levelCache)
    }

    selectFunc(out, func, str, message, level, levelCache) {

        switch (func) {
            case 'osu':
                this.osu(out, str, message, level, levelCache)
                break;
            case 'help':
                this.help(out, str, message, level, levelCache)
                break;
            case 'search':
                this.search(out, str, message, level, levelCache)
                break;
            case 'kitsu':
                this.kitsu(out, str, message, level, levelCache)
                break;
            default:
                break;
        }

    }

    osu(out, str, message, level, levelCache) {

    }

    kitsu(out, str, message, level, levelCache) {
        let args = [];
        let cmdName;

        if (out === 'randomanime') cmdName = 'randomanime';
        if (out === 'leaderboard') cmdName = 'kitsuboard';

        this.run(cmdName, args, message, level, levelCache);
    }

    search(out, str, message, level, levelCache) {

    }

    help(out, str, message, level, levelCache) {
        let args = [];
        let cmdName; 

        if (out === 'help1') {
            cmdName = 'help'
        }
        
        if (out === 'help4') cmdName = 'help';

        this.run(cmdName, args, message, level, levelCache);
    }


    run(cmdName, args, message, level, levelCache) {
        if (cmdName !== void 0) {
            this.kimiwa.commands.get(cmdName).run(message, args, this.kimiwa, level, true);
            args = [];
        }
    }

    // /**
    //  * This part is made for remove mention, useless space and send to the run methode.
    //  * @param {string} str      | Transform initial value in value without mention and remove useless space
    //  * @param {object} message  | The message object
    //  */
    // preconditionned(str, message) {
    //     const level = this.kimiwa._permlevel(message);

    //     let levelCache = {};
    //     for (let i = 0; i < this.kimiwa.config.permLevels.length; i++) {
    //         const thisLevel = this.kimiwa.config.permLevels[i];
    //         levelCache[thisLevel.name] = thisLevel.level;
    //     }

    //     str = str.replace(`<@${this.kimiwa.user.id}>`, '').trim();
    //     str = str.replace(/[\s]{2,}/g, " ");
    //     str = str.toLowerCase();

    //     this.run(str, message, level, levelCache);
    // }

    // /**
    //  * Main part of the IA
    //  * Kimiwa execute command after enter sentence like :
    //  * @Kimiwa can you help me -> and send help message
    //  * He transforme the bot to a likre real personne 
    //  * @param {string} str      | The string without useless space and mention
    //  * @param {object} message  | Messagc object
    //  */
    // async run(str, message, level, levelCache) {
    //     let cmdName;
    //     let args = [];

    //     /**
    //      * This part is dedicated to help
    //      * Posibility : 
    //      * Can you help me about : <cmdName> -> args send : [cmdName]
    //      * Can you help me for <cmdName> -> args send : [cmdName]
    //      * Can you help me
    //      * Help me
    //      */
    //     if (str.includes('can you help me about')) {

    //         if (str.includes('command') || str.includes('cmd') || str.includes('comand') || str.includes('comands') || str.includes('commands')) {
    //             str = str.replace(/(\w*command)|(\w*cmd)|(\w*comand)|(\w*comands)|(\w*commands)/, '');
    //         }

    //         str = str.trim();
    //         let arg = str.split(': ');

    //         if (arg[1] === void 0) return message.channel.createMessage('Please specify the name of an command you want to understand')

    //         args.push(arg[1]);
    //         cmdName = 'help';
    //     }

    //     if (str.includes('can you help me for')) {
    //         str = str.replace('can you help me for', '');

    //         if (str.includes('command') || str.includes('cmd') || str.includes('comand') || str.includes('comands') || str.includes('commands')) {
    //             str = str.replace(/(\w*command)|(\w*cmd)|(\w*comand)|(\w*comands)|(\w*commands)/, '');
    //         }

    //         str = kimiwaHelper.removeUselessSpace(str);
    //         args.push(str);

    //         cmdName = 'help';
    //     }

    //     if (str.includes('can you help me') || str.includes('help me')) {
    //         cmdName = 'help';
    //     }


    //     /**
    //      * This part is dedicated to search
    //      * Posibility : 
    //      * Can you search <player name> in osu <mode> -> args send : [player name, mode]
    //      * Can you search <anime name> in anime-> args send : [anime name]
    //      */
    //     if (str.includes('can you search')) {
    //         if (str.includes(`in osu`)) {
    //             str = str.split('can you search ');
    //             str = str[1].split('in osu');
    //             args.push(str[0].trim());

    //             str = str[1].split(' ');
    //             args.push(str[1].trim());

    //             cmdName = 'osu';
    //         } else if (str.includes('in anime')) {
    //             str = str.split('can you search ');
    //             str = str[1].split('in anime');

    //             args.push(str[0].trim());

    //             cmdName = 'kitsu';
    //         }
    //     }


    //     /**
    //      * This part is dedicated to the kitsu leaderboard and kitsu random anime
    //      * Posibility : 
    //      * Can I get the leaderboard / Can you give me the leaderboard / Give me the leaderboard
    //      * Can you give me random anime / Can you give me a random anime / Can I get a random anime / Can I get random anime / Do you have a anime for me / Do you have anime for me
    //      */
    //     if (str.includes('can i get the leaderboard ') || str.includes('can you give me the leaderboard') || str.includes('give me the leaderboard')) {
    //         cmdName = 'kitsuboard';
    //     }

    //     if (str.includes('can you give me random anime') || str.includes('can you give me a random anime') || str.includes('can i get a random anime') || str.includes('can i get random anime') || str.includes('do you have a anime for me') || str.includes('do you have anime for me')) {
    //         cmdName = 'randomanime'
    //     }


    //     /**
    //      * This part is dedicated to osu
    //      * Posibility : 
    //      * Can you roll
    //      */
    //     if (str.includes('can you roll')) {
    //         cmdName = 'roll';
    //     }

    //     if (str.includes('roll')) {
    //         console.log("Comming soon");
    //     }


    //     /**
    //      * Detect if cmdName is not undefined for run the command.
    //      */
    //     if (cmdName !== void 0) {
    //         this.kimiwa.commands.get(cmdName).run(message, args, this.kimiwa, level, true);
    //         args = [];
    //     }
    // }

}

module.exports = kimiwaIA;