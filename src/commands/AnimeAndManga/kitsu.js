const Command = require("../../base/Command.js");
const anifetch = require('anifetch');
const moment = require('moment');
// const mysql = require("./../modules/db");
// const utility = require("./../modules/utility");

class Kitsu extends Command {
    constructor(client) {
        super(client, {
            name: "kitsu",
            description: "Find anime or manga information",
            category: "Anime and manga",
            usage: "kitsu [anime/manga] [Title]",
            aliases: ["kitsu", "k"]
        });
        // this.anifetch = anifetch;
        // this.moment = moment;
        // this.Discord = Discord;
        // this.utility = new utility();
    }

    async run(message, args, level) { // eslint-disable-line no-unused-vars
        // let name = args.splice(0).join(' ');

        // this.utility.kitsuFindAll(name, 'Sorry this anime/manga doesn\'t exist', (err, resp) => {

        //     const embed = new Discord.RichEmbed()
        //         .setColor(resp.color)
        //         .setTitle(`${resp.title}`)
        //         .setURL(`${resp.url}`)
        //         .setDescription(`${resp.desc}`)
        //         .setThumbnail(`${resp.cover}`)
        //         .addField('Anime status', `${resp.anime.status}`)
        //         .addField('Number of episode', `${resp.anime.episode}`, true)
        //         .addField('Type', `${resp.anime.format}`, true)
        //         .addField('Manga status', `${resp.manga.status}`)
        //         .addField('Number of volume', `${resp.manga.volume}`, true)
        //         .addField('Number of chapter', `${resp.manga.chapter}`, true)
        //         .setTimestamp()
        //         .setFooter('Made by nesmon powered with kitsu', message.author.avatarURL)


        //     this.utility.findPoint(resp.title, resp.id, resp.url, 'anime', message);
        //     this.utility.addSearchProfil(message.author.id, message.author.avatarURL, message.author.username)
            message.channel.createMessage("hello");
        //})
    }
}


module.exports = Kitsu;