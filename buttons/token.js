const config_util = require("../utils/config_util.js");
const GameManager = require("../game/GameManager.js");
const WerewordsGame = require("../game/WerewordsGame.js");
const Player = require("../game/Player.js");

async function run(interaction, guildId, user, option){
    console.log(`button clicked: ${option}`)
    const game = GameManager.findGame(guildId);
    if(!game){
        return interaction.reply("No game found!");
    }
    if(!(game.phase === "questions")){
        return interaction.reply("The game is not in the questions phase!");
    }
    if(!(interaction.member.id === game.mayor)){
        return interaction.reply("You are not the mayor!");
    }
    await interaction.deferUpdate();
    switch(option){
        case "yes":
            await game.giveToken('y', user);
            break;
        case "no":
            await game.giveToken('n', user);
            break;
        case "maybe":
            await game.giveToken('m', user);
            break;
        case "soClose":
            await game.giveToken('s', user);
            break;
        case "wayWayOff":
            await game.giveToken('w', user);
            break;
        case "correct":
            await game.wordGuessed(user);
            break;
    }
}

module.exports = {
    run
}