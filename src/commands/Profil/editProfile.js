const Command = require("../../base/Command.js");
const kimiwaHelper = require('../../kimiwaHelper');

class editProfile extends Command {
    constructor(client) {
        super(client, {
            name: "editprofile",
            description: "Edit your own profile",
            category: "Profile",
            usage: "editprofile",
            permLevel: "user",
            aliases: ["ep"]
        });
    }

    async run(message, args, kimiwa, level) { // eslint-disable-line no-unused-vars
        let desc = kimiwaHelper.flags(message.content, '--desc');
        let website = kimiwaHelper.flags(message.content, '--web');
        let stackgame = kimiwaHelper.flags(message.content, '--stack_osu');
        let osu = kimiwaHelper.flags(message.content, '--osu');
        let ripple = kimiwaHelper.flags(message.content, '--ripple');
        let akatsuki = kimiwaHelper.flags(message.content, '--akatsuki');
        let stacksocial = kimiwaHelper.flags(message.content, '--stack_social');
        let twitch = kimiwaHelper.flags(message.content, '--twitch');
        let twitter = kimiwaHelper.flags(message.content, '--twitter');
        let youtube = kimiwaHelper.flags(message.content, '--youtube');
        let json = kimiwaHelper.flags(message.content, '--json');

        const getProfile = await kimiwaHelper.preparedQuery(kimiwa.db, 'SELECT * FROM profile WHERE user_ID = ?', [message.author.id]);

        if (getProfile.length > 0) {
            if (desc === false && website === false && stackgame === false && osu === false && osu === false && ripple === false && akatsuki === false && stacksocial === false && twitch === false && twitter === false && youtube === false) {
                if (json === false) {
                    message.channel.createEmbed(new kimiwaHelper.Embed()
                        .setColor('BLUE')
                        .setTitle('Edit profile :')
                        .setDescription('For use this command you have two way :')
                        .addField('With separed option :', 'k!editprofile --desc some description --twitch twitch username')
                        .addField('with JSON structure', 'k!editprofile --json {desc: \'hello description\', twitch: \'twitch username\'}')
                    );
                } else {
                    try {
                        json = JSON.parse(json);
                        desc = json.description || getProfile[0].description;
                        website = json.website || getProfile[0].website;
                        stackgame = json.stack_osu || getProfile[0].stack_osu;
                        osu = json.osu_username || getProfile[0].osu_username;
                        ripple = json.ripple_username || getProfile[0].ripple_username;
                        akatsuki = json.akatsuki_username || getProfile[0].akatsuki_username;
                        stacksocial = json.stack_social || getProfile[0].stack_social;
                        twitch = json.twitch || getProfile[0].twitch;
                        twitter = json.twitter || getProfile[0].twitter;
                        youtube = json.youtube || getProfile[0].youtube;

                        let profile = {
                            'description': desc,
                            'website': website,
                            'stack_osu': stackgame,
                            'osu_username': osu,
                            'ripple_username': ripple,
                            'akatsuki_username': akatsuki,
                            'stack_social': stacksocial,
                            'twitch': twitch,
                            'twitter': twitter,
                            'youtube': youtube
                        }

                        await kimiwaHelper.preparedQuery(kimiwa.db, `UPDATE profile SET ? WHERE user_ID = ${message.author.id}`, profile)
                        return message.channel.createEmbed(new kimiwaHelper.Embed()
                            .setColor('GREEN')
                            .setDescription('Sucesfully, your account has been update \:D')
                        )
                    } catch (error) {
                        message.channel.createEmbed(new kimiwaHelper.Embed()
                            .setColor('RED')
                            .setDescription('An error has been ocured, it\'s probably due to a bad usage of JSON structure !\n\n```JSON\n{\n"description":"Awesome description",\n"osu":"osu_username"\n}```')
                        );
                    }
                }
            } else {
                if (json !== false) {
                    message.channel.createEmbed(new kimiwaHelper.Embed()
                        .setColor('RED')
                        .setDescription('Please thans to not use `--json` flags with another flags')
                    );
                } else {
                    if (desc === false) desc = getProfile[0].description;
                    if (website === false) website = getProfile[0].website;
                    if (stackgame === false) stackgame = getProfile[0].stack_osu;
                    if (osu === false) osu = getProfile[0].osu_username;
                    if (ripple === false) ripple = getProfile[0].ripple_username;
                    if (akatsuki === false) akatsuki = getProfile[0].akatsuki_username;
                    if (stacksocial === false) stacksocial = getProfile[0].stack_social;
                    if (twitch === false) twitch = getProfile[0].twitch;
                    if (twitter === false) twitter = getProfile[0].twitter;
                    if (youtube === false) youtube = getProfile[0].youtube;

                    let profile = {
                        'description': desc,
                        'website': website,
                        'stack_osu': stackgame,
                        'osu_username': osu,
                        'ripple_username': ripple,
                        'akatsuki_username': akatsuki,
                        'stack_social': stacksocial,
                        'twitch': twitch,
                        'twitter': twitter,
                        'youtube': youtube
                    }

                    try {
                        await kimiwaHelper.preparedQuery(kimiwa.db, `UPDATE profile SET ? WHERE user_ID = ${message.author.id}`, profile)
                        return message.channel.createEmbed(new kimiwaHelper.Embed()
                            .setColor('GREEN')
                            .setDescription('Sucesfully, your account has been update \:D')
                        )
                    } catch (error) {
                        message.channel.createEmbed(new kimiwaHelper.Embed()
                            .setColor('RED')
                            .setDescription('An error has been ocured, please try again !')
                        );
                    }
                }
            }
        } else {
            message.channel.createEmbed(new kimiwaHelper.Embed()
                .setColor('RED')
                .setDescription('Sorry but you dosn\'t have an account !\nUse k!createprofile for create your profile')
            );
        }
    }
}


module.exports = editProfile;