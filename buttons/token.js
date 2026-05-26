const config_util = require("../utils/config_util.js");
const GameManager = require("../game/GameManager.js");
const roles_util = require("../utils/roles_util.js");
const WerewordsGame = require("../game/WerewordsGame.js");
const Player = require("../game/Player.js");

async function run(interaction, guildId, user, option){
    console.log(`button clicked: ${option}`)
    const game = GameManager.findGame(guildId);
    if(!game){
        return;
    }
    if(!(interaction.member.id === game.mayor)){
        return interaction.reply("You are not the mayor!");
    }
    await interaction.deferUpdate();
    switch(option){
        case "yes":
            game.giveToken('y', user);
            break;
        case "no":
            game.giveToken('n', user);
            break;
        case "maybe":
            game.giveToken('m', user);
            break;
        case "soClose":
            game.giveToken('s', user);
            break;
        case "wayWayOff":
            game.giveToken('w', user);
            break;
        case "correct":
            game.wordGuessed(user);
            break;
    }
}

module.exports = {
    run
}