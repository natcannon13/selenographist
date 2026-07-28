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

    //shouldn't happen ever, but if it does we protect against it
    if(interaction.user.id != game.mayor){
        return interaction.reply("You are not the mayor and should not have received this DM. Please file a bug report.");
    }

    if(game.hasChosenWord){
        return interaction.reply("You already chose a word.");
    }

    // Sync latch before any await to block double-clicks
    game.hasChosenWord = true;
    await interaction.deferUpdate();
    try{
        await game.wordChosen(word);
        return interaction.followUp(`Your magic word is: **${word}**!`);
    }
    catch(err){
        console.error(err);
        game.hasChosenWord = false;
        game.word = null;
        try{
            await interaction.followUp("Something went wrong choosing the word. Ending the game.");
        }
        catch(followUpErr){
            console.error(followUpErr);
        }
        await game.destroy();
    }
}

module.exports = {
    run
}
