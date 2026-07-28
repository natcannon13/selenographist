const {EmbedBuilder} = require('discord.js');
async function run(message, args, client){
    let embed = new EmbedBuilder()
    .setTitle("Selenographist Help")
    .addFields(
        {name: "**Game Commands:**"},
        {name: "```!werewords <difficulty> <mayor>```", value: "Starts a game of Werewords. Difficulties:\neasy (e)\nmedium (m)\nhard (h)\nridiculous (r)\nYou can select a mayor by mentioning a player, or have one randomly assigned.", inline: false},
        {name: "```!ask```", value: "Queues a question for the mayor to answer. You can only have one question queued at once.", inline: false},
        {name: "```!quit```", value: "Quits a live game. Only usable by the mayor and server administrators.", inline: false},
        {name: "**Discord Commands:**"},
        {name: "```!showconfig```", value: "Shows the channel configuration for this server. Only usable by server administrators", inline: false},
        {name: "```!config <game channel> <mayor channel> <voice channel> <mayor role>```", value: "Configures the channels for the server. Only usable by server administrators. Mention the channels to be used as the game channel, mayor channel, and voice channel, then mention the role to be used as the mayor role.", inline: false},
        {name: ```!help```, value: "Shows the help menu and a description of the commands", inline: false}
    );
    return message.reply(embed);
}
module.exports = {
    run
}