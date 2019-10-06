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
            usage: "kitsu [Title]",
            aliases: ["kitsu", "k", "kistu"]
        });
    }

    async run(message, args, kimiwa) { // eslint-disable-line no-unused-vars

        let name = args.splice(0).join(' ');
        
        if (!name) return message.channel.createEmbed(new kimiwaHelper.Embed()
            .setColor('RED')
            .setDescription('Sorry but, this commands need a anime name for work.')
            .setTimestamp()
            .setFooter("\u200B")
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
                syn.push(`${sin.split(".")[0]}.`);
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
                    .setFooter("\u200B")
                );
            }

            e.delete();
            kimiwa.deleteMessage(message.channel.id, message.channel.lastMessageID);

            message.channel.createEmbed(new kimiwaHelper.Embed()
                .setColor('BLUE')
                .setAuthor(`${animeSearch[select - 1].attributes.canonicalTitle}`, kimiwa.user.avatarURL, `https://kitsu.io/anime/${animeSearch[select - 1].attributes.slug}`)
                .setThumbnail(animeSearch[select - 1].attributes.posterImage.original)
                .setDescription((animeSearch[select - 1].attributes.synopsis.length > 1900) ? `${animeSearch[select - 1].attributes.synopsis.substring(0, 1900)}...\n[Read More](https://kitsu.io/anime/${animeSearch[select - 1].attributes.slug})` : (animeSearch[select - 1].attributes.synopsis === null || animeSearch[select - 1].attributes.synopsis === "") ? "No synopsi for this anime :/" : animeSearch[select - 1].attributes.synopsis)
                .addField('Number of episode :', `${animeSearch[select - 1].attributes.episodeCount || "n/a"} of ${animeSearch[select - 1].attributes.episodeLength + "min" || "n/a"}`, true)
                .addField('Status :', animeSearch[select - 1].attributes.status || "n/a", true)
                .addField('Age Rating :', animeSearch[select - 1].attributes.ageRatingGuide || 'n/a', true)
                .addField("Rating :", animeSearch[select - 1].attributes.averageRating || "n/a", true)
                .addField('Type :', `${animeSearch[select - 1].attributes.subtype.charAt(0).toUpperCase() + animeSearch[select - 1].attributes.subtype.slice(1)}` || "N/A", true)
                .addField('NSFW :', (animeSearch[select - 1].attributes.nsfw === true) ? "This anime is NSFW" : "This anime is not NSFW", true)
                .setTimestamp()
                .setFooter("\u200B")
            )

            kimiwaHelper.addPoint(animeSearch[select - 1].attributes.canonicalTitle, animeSearch[select - 1].id, `https://kitsu.io/anime/${animeSearch[select - 1].attributes.slug}`, kimiwa.db)

        } catch (error) {
            search.edit({
                embed: new kimiwaHelper.Embed().setColor('RED').setTitle(`Find any anime with this title`).setTimestamp().setFooter("\u200B")
            });
        }
    }
}


module.exports = Kitsu;
