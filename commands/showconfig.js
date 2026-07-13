const config_util = require("../utils/config_util.js");

async function run(message, args, client){
    if(!config_util.config[message.guild.id]){
        return message.reply("The bot is not configured for this server. A server admin must use !config first.");
    }
    if (!message.member.permissions.has("Administrator")){
        return message.reply("You must be an admin to use this command!");
    }
    const serverConfig = config_util.config[message.guild.id];
    return message.reply("Current Configuration for " + message.guild.name + "\nMayor Role: <@&" + serverConfig.mayorRole + ">\nGame Channel: <#" + serverConfig.gameChannel + ">\nMayor Channel: <#" + serverConfig.mayorChannel + ">\nVoice Channel: <#" + serverConfig.voiceChannel + ">");
}

module.exports = {
    run
}