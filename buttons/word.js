const config_util = require("../utils/config_util.js");
const GameManager = require("../game/GameManager.js");
const WerewordsGame = require("../game/WerewordsGame.js");
const Player = require("../game/Player.js");

async function run(interaction, guildId, word, option){
    //console.log(guildId);
    console.log(`button clicked: ${option}`);
    const game = GameManager.findGame(guildId);
    if(!game){
        return interaction.reply("No game found!");
    }

    if(game.phase != "wordChoice"){
            return interaction.reply("You cannot use this right now.");
    }

    game.wordChosen(word);

    await interaction.deferUpdate();
    return interaction.followUp(`Your magic word is: **${word}**!`);
}

module.exports = {
    run
}