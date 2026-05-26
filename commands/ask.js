const GameManager = require("../game/GameManager.js");
const werewordsGame = require("../game/WerewordsGame.js");

async function run(message, args, client){
    let game = GameManager.findGame(message.guild.id);
        if(game){
            let user = message.member;
            if(user.id === game.mayor){
                return message.reply("You are the Mayor! You can't ask questions!");
            }
            if(game.phase != "questions"){
                return message.reply("You cannot use this right now.");
            }
            if(game.gameChannel != message.channel.id){
                return message.reply("You can only use this command in the game channel.");
            }
            
    }
    else{
        return message.reply("This command can only be used during a game!");
    }
}

module.exports = {
    run
}