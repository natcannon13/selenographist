const GameManager = require("../game/GameManager.js");
const WerewordsGame = require("../game/WerewordsGame.js");
const Player = require("../game/Player.js");
const roles_util = require("../utils/roles_util.js");

function run(message, args, client){
    let game = GameManager.findGame(message.guild.id);
        if(game){
            let user = message.member;
            if(game.gameChannel != message.channel.id){
                return message.reply("You can only use this command in the game channel.");
            }
            if(game.phase == "seerKill"){
                if(game.players.get(user.id).role != "Werewolf"){
                    return message.reply ("You are not a Werewolf!");
                }

            }
            else if(game.phase == "werewolfVote"){

            }
            else{
                return message.reply("You cannot use this right now.");
            }
            message.delete();
    }
}