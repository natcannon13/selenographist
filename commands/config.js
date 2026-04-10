const config_util = require("../utils/config_util.js");

function run(message, args, client){
    if (!message.member.permissions.has("Administrator")){
        return message.reply("You must be an admin to use this command!");
    }

    if (args.length < 3){
        return message.reply("Usage: !config <gameChannel> <mayorChannel> <voiceChannel>");
    }
    const guildID = message.guild.id;
    let gameChannel = args[0];
    let mayorChannel = args[1];
    let voiceChannel = args[2];
    gameChannel = config_util.getChannelID(gameChannel);
    mayorChannel = config_util.getChannelID(mayorChannel);
    voiceChannel = config_util.getChannelID(voiceChannel);

    config_util.config[guildID] = {
        gameChannel,
        mayorChannel,
        voiceChannel
    }
    try{
        config_util.saveConfig();
        console.log(config_util.config[guildID]);
        return message.reply("Successfully configured!\nGame Channel: <#" + gameChannel + ">\nMayor Channel: <#" + mayorChannel + ">\nVoice Channel: <#" + voiceChannel + ">");
    }
    catch{

    }
}

module.exports = {
    run
}