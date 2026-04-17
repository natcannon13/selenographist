const SecretInfo = require("../game/SecretInfo.js");
async function sendRole(player){
    if(player.isMayor){
        await player.member.send("You are the Mayor!");
    }
    try{
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
            infoMessage += `The magic word is: **${info.word}**;`
            break;
        case "Apprentice":
            if(info.apprentice){
                infoMessage += `The magic word is: **${info.word}**;`
            }
            else if(player.isMayor){
                infoMessage += "You are the Mayor!";
            }
            else{
                infoMessage += "The Mayor is NOT the Seer."
            }
            break;
        case "Beholder":
            infoMessage += "The Seer and Apprentice are:"
            for(const person of info.beholder){
                infoMessage += `\n**${person}**`;
            }
            break;
        case "Mason":
            infoMessage += "The Masons are:"
            for(const person of info.beholder){
                infoMessage += `\n**${person}**`;
            }
    }
    try{
        await player.member.send(infoMessage);
        return true;
    }
    catch{
        console.error(`Failed to DM ${player.member.tag}:`);
        return false;
    }
}

module.exports = {
    sendRole,
    sendInfo
}