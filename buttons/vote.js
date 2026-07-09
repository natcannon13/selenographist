const config_util = require("../utils/config_util.js");
const GameManager = require("../game/GameManager.js");
const WerewordsGame = require("../game/WerewordsGame.js");
const Player = require("../game/Player.js");

async function run(interaction, guildId, user, option){
    console.log(`button clicked: ${option}`);
    const game = GameManager.findGame(guildId);
    if(!game){
        return;
    }

    let voter = interaction.member;

    if(!game.players.has(voter.id)){
        return interaction.reply({content: "You are not playing!", ephemeral: true});
    }
    
    if(voter.id === user){
        return interaction.reply({content: "You cannot vote for yourself!", ephemeral: true});
    }

    if(game.phase === "seerKill"){
        if(voter.displayName !== game.werewolfSpokesman){
            return interaction.reply({content: "You are not the Voting Werewolf!", ephemeral: true});
        }
        else{
            await game.seerVoteReceived(user);
        }
    }
    else if(game.phase === "werewolfVote"){
        game.players.get(voter.id).vote = user;
    }
    else{
        return interaction.reply({content: "You cannot use this right now!", ephemeral: true});
    }
    await interaction.deferUpdate();
    return interaction.followUp({content: "Vote cast successfully!", ephemeral: true});
}
module.exports = {
    run
}