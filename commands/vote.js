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
            let vote = roles_util.getPlayerID(args[0]);
            if (vote == user.id){
                return message.reply ("You cannot vote for yourself!");
            }
            if(game.phase === "seerKill"){
                if(user.displayName != game.werewolfSpokesman){
                    return message.reply ("You are not the Voting Werewolf!");
                }
                else{
                    game.seerVoteReceived(vote);
                }
            }
            else if(game.phase === "werewolfVote"){
                game.players.get(message.member.id).vote = vote;
            }
            else{
                console.log(game.phase);
                return message.reply("You cannot use this right now.");
            }
            message.delete();
    }
}
module.exports = {
    run
}