const GameManager = require("../game/GameManager.js");
const werewordsGame = require("../game/WerewordsGame.js");

async function run(message, args, client){
    const game = GameManager.findGame(message.guild.id);

    if(!game){
        return message.reply("There is no game happening in this server!");
    }

    if (!message.member.permissions.has("Administrator") && !(message.member.id === game.mayor)){
        return message.reply("You must be the Mayor or an admin to quit the game!");
    }
    game.destroy();
    GameManager.deleteGame(message.guild.id);
    return message.reply("Game successfully quit!");
}

module.exports = {
    run
}