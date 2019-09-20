const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');
const kitsu = require('node-kitsu');
const moment = require('moment');

class Kitsu extends Command {
    constructor(client) {
        super(client, {
            name: "kitsu",
            description: "Find anime or manga information",
            category: "Anime and manga",
            usage: "kitsu [anime/manga] [Title]",
            aliases: ["kitsu", "k"]
        });
    }

    async run(message, args, level) { // eslint-disable-line no-unused-vars

        let name = args.splice(0).join(' ');
        if (!name) return message.channel.createEmbed(new kimiwaHelper.Embed()
            .setColor('RED')
            .setDescription('Sorry but, this commands need a anime name for work.')
        );

        const search = await message.channel.createEmbed(new kimiwaHelper.Embed()
            .setColor('BLUE')
            .setDescription('Waiting for get some result...')
        );

        let animeSearch = await kitsu.searchAnime(name, 0);
        let results = [];
        let syn = [];

        try {
            for (let i = 0; i < 5; i++) {
                results.push(`**${i + 1}.** **${animeSearch[i].attributes.canonicalTitle}**`);
                let sin = animeSearch[i].attributes.synopsis;
                sin = `${sin.split(".")[0]}.`;
                syn.push(`${sin}`);
            }

            const myEmbeds = [];

            for (let i = 0; i < 5; i++) {
                myEmbeds.push(new kimiwaHelper.Embed()
                    .setColor('BLUE')
                    .setTitle(results[i])
                    .setDescription(syn[i])
                )
            }

            search.delete();
            const e = await kimiwaHelper.PaginationEmbed.createPaginationEmbed(message, myEmbeds, {
                showPageNumbers: false,
                cycling: true
            });


            const filter = (m) => message.author.id === m.author.id;
            const waitingMesage = await message.channel.awaitMessages(filter, {
                time: 60000,
                maxMatches: 1
            });

            const select = parseInt(waitingMesage[0].content.replace(/[^0-9\.]+/g, ''));

            if (select > select.length || select < 1 || !select) {
                return message.channel.createEmbed(new kimiwaHelper.Embed()
                    .setColor('RED')
                    .setTitle(`Please retry and send a numerical choice...`)
                    .setTimestamp()
                    .setFooter("s")
                );
            }

            e.delete();
            this.client.deleteMessage(message.channel.id, message.channel.lastMessageID);

            message.channel.createEmbed(new kimiwaHelper.Embed()
                .setColor('BLUE')
                .setAuthor(`${animeSearch[select - 1].attributes.canonicalTitle}`, this.client.user.avatarURL, `https://kitsu.io/anime/${animeSearch[select - 1].attributes.slug}`)
                .setThumbnail(animeSearch[select - 1].attributes.posterImage.original)
                .addField('Number of episode :', `${animeSearch[select - 1].attributes.episodeCount || "n/a"} of ${animeSearch[select - 1].attributes.episodeLength + "min" || "n/a"}`, true)
                .addField('Status :', animeSearch[select - 1].attributes.status || "n/a", true)
                .addField('Age Rating :', animeSearch[select - 1].attributes.ageRatingGuide || 'n/a', true)
                .addField('Type :', `${animeSearch[select - 1].attributes.subtype.charAt(0).toUpperCase() + animeSearch[select - 1].attributes.subtype.slice(1)}` || "N/A", true)
            )

        } catch (error) {
            search.edit({
                embed: new kimiwaHelper.Embed().setColor('RED').setTitle(`Find any anime with this title`).setTimestamp().setFooter("\u200B")
            });
        }
    }
}


module.exports = Kitsu;


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
//})