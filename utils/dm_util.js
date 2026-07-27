const { EmbedBuilder, ButtonStyle } = require("discord.js");
const SecretInfo = require("../game/SecretInfo.js");
const word_util = require("word_util.js");

async function sendRole(player){
    try{
        if(player.isMayor){
            await player.member.send("You are the Mayor!");
        }
        await player.member.send(`Your role is: ${player.role}`);
        return true;
    }
    catch(error){
        console.error(`Failed to DM ${player.member.tag}:`);
        return false;
    }
}

async function sendInfo(player, info){
    let infoMessage = "";
    switch(player.role){
        case "Villager":
            return;
        case "Werewolf":
            infoMessage += `The magic word is: **${info.word}**\nThe werewolves are:`;
            for (const werewolf of info.werewolves){
                infoMessage += `\n**${werewolf}**`
            }
            break;
        case "Seer":
            infoMessage += `The magic word is: **${info.word}**.`;
            break;
        case "Apprentice":
            if(info.apprentice){
                infoMessage += `The magic word is: **${info.word}**.`;
            }
            else if(player.isMayor){
                infoMessage += "You are the Mayor!";
            }
            else{
                infoMessage += "The Mayor is NOT the Seer.";
            }
            break;
        case "Beholder":
            infoMessage += "The Seer and Apprentice are:";
            for(const person of info.beholder){
                infoMessage += `\n**${person}**`;
            }
            break;
        case "Mason":
            infoMessage += "The Masons are:"
            for(const person of info.masons){
                infoMessage += `\n**${person}**`;
            }
    }
    try{
        await player.member.send(infoMessage);
        return true;
    }
    catch{
        console.error(`Failed to DM ${player.member.tag}`);
        return false;
    }
}

async function sendWordChoice(mayor, difficulty, role, guildID){
    let words = word_util.getWords(difficulty, role);
    let embed = buildWordsEmbed(words, guildID);
    try{
        await mayor.send(embed);
    }
    catch{
        console.error(`Failed to DM ${player.member.tag}`);
        return false;
    }
}

function buildWordsEmbed(words, guildID){
    let buttons = [];
    for (const word of words){
        const button = new ButtonBuilder()
        .setCustomId(`word:${guildID}:${word}:word`)
        .setLabel(`{word}`)
        .setStyle(ButtonStyle.Primary);
        buttons.push(button);
    }
    const row = new ActionRowBuilder();
    row.addComponents(buttons);

    let embed = new EmbedBuilder()
    .setTitle("Mayor - Word Choice")
    .setDescription("Click one of the below buttons to choose the Magic Word.");

    return({
        embeds: [embed],
        components: [row]
    });
}

module.exports = {
    sendRole,
    sendInfo,
    sendWordChoice
}