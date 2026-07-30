const {EmbedBuilder} = require('discord.js');

async function run(message, args, client){
    let embed = new EmbedBuilder()
    .setTitle("Selenographist Help")
    .addFields(
        {name: "**Game Commands:**", value: " ", inline: true},
        {name: "```!werewords <difficulty> <mayor>```", value: "Starts a game of Werewords. Difficulties:\neasy (e)\nmedium (m)\nhard (h)\nridiculous (r)\nYou can select a mayor by mentioning a player, or have one randomly assigned.", inline: false},
        {name: "```!ask```", value: "Queues a question for the mayor to answer. Each player can only have one question queued at once.", inline: false},
        {name: "```!quit```", value: "Only usable by the mayor and server administrators. Quits a live game.", inline: false},
        {name: "**Discord Commands:**", value: " ", inline: true},
        {name: "```!help```", value: "Shows the help menu and a description of the commands", inline: false},
        {name: "```!showconfig```", value: "Only usable by server administrators. Shows the channel configuration for this server.", inline: false},
        {name: "```!config <game channel> <mayor channel> <voice channel> <mayor role>```", value: "Only usable by server administrators. Configures the channels for the server. Mention the channels to be used as the game channel, mayor channel, and voice channel, then mention the role to be used as the mayor role.", inline: false},
    );
    return message.reply({embeds: [embed]});
}
module.exports = {
    run
}