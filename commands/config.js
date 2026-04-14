const config_util = require("../utils/config_util.js");

function run(message, args, client){
    if (!message.member.permissions.has("Administrator")){
        return message.reply("You must be an admin to use this command!");
    }

    if (args.length < 4){
        return message.reply("Usage: !config <mayorRole> <gameChannel> <mayorChannel> <voiceChannel>");
    }
    const guildID = message.guild.id;
    let mayorRole = args[0];
    let gameChannel = args[1];
    let mayorChannel = args[2];
    let voiceChannel = args[3];
    mayorRole = config_util.getRoleID(mayorRole);
    gameChannel = config_util.getChannelID(gameChannel);
    mayorChannel = config_util.getChannelID(mayorChannel);
    voiceChannel = config_util.getChannelID(voiceChannel);

    config_util.config[guildID] = {
        mayorRole,
        gameChannel,
        mayorChannel,
        voiceChannel
    }
    try{
        config_util.saveConfig();
        console.log(config_util.config[guildID]);
        return message.reply("Successfully configured!\nMayor Role: <@&" + mayorRole + ">\nGame Channel: <#" + gameChannel + ">\nMayor Channel: <#" + mayorChannel + ">\nVoice Channel: <#" + voiceChannel + ">");
    }
    catch{

    }
}

module.exports = {
    run
}