const Command = require("../../base/Command.js");
const kimiwaHelper = require('./../../kimiwaHelper');
const kitsu = require('node-kitsu');

class RandomAnime extends Command {
    constructor(client) {
        super(client, {
            name: "randomanime",
            description: "Find random anime select into search anime with kimiwa",
            category: "Anime and manga",
            usage: "randomanime ",
            aliases: ["ra", "ranime", "kitsurandom"]
        });
    }

    async run(message, args, kimiwa) { // eslint-disable-line no-unused-vars

        try {
            const selectAnime = await kimiwaHelper.query(kimiwa.db, 'SELECT * FROM anime ORDER BY RAND() LIMIT 1');
            let animeSearch = await kitsu.searchAnime(selectAnime[0].title.toLowerCase(), 0);

            message.channel.createEmbed(new kimiwaHelper.Embed()
                .setColor('BLUE')
                .setAuthor(`${animeSearch[0].attributes.canonicalTitle}`, this.client.user.avatarURL, `https://kitsu.io/anime/${animeSearch[0].attributes.slug}`)
                .setThumbnail(animeSearch[0].attributes.posterImage.original)
                .setDescription((animeSearch[0].attributes.synopsis.length > 1900) ? `${animeSearch[0].attributes.synopsis.substring(0, 1900)}...\n[Read More](https://kitsu.io/anime/${animeSearch[0].attributes.slug})` : (animeSearch[0].attributes.synopsis === null || animeSearch[0].attributes.synopsis === "") ? "No synopsi for this anime :/" : animeSearch[0].attributes.synopsis)
                .addField('Number of episode :', `${animeSearch[0].attributes.episodeCount || "n/a"} of ${animeSearch[0].attributes.episodeLength + "min" || "n/a"}`, true)
                .addField('Status :', animeSearch[0].attributes.status || "n/a", true)
                .addField('Age Rating :', animeSearch[0].attributes.ageRatingGuide || 'n/a', true)
                .addField("Rating :", animeSearch[0].attributes.averageRating || "n/a", true)
                .addField('Type :', `${animeSearch[0].attributes.subtype.charAt(0).toUpperCase() + animeSearch[0].attributes.subtype.slice(1)}` || "N/A", true)
                .addField('NSFW :', (animeSearch[0].attributes.nsfw === true) ? "This anime is NSFW" : "This anime is not NSFW", true)
                .setTimestamp()
                .setFooter("\u200B")
            )

            kimiwaHelper.addPoint(animeSearch[0].attributes.canonicalTitle, animeSearch[0].id, `https://kitsu.io/anime/${animeSearch[0].attributes.slug}`, kimiwa.db)
        } catch (error) {
            message.channel.createEmbed(new kimiwaHelper.Embed().setColor('RED').setTitle(`Sorry a error has been occured :/`).setTimestamp().setFooter("\u200B"));
            console.log(error)
        }
    }
}


module.exports = RandomAnime;