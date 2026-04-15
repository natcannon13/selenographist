async function sendRole(player){
    if(player.isMayor){
        await player.member.send("You are the Mayor!");
    }
    try{
        await player.member.send(`Your role is: ${player.role}`);
        return true;
    }
    catch(error){
        console.error(`Failed to DM ${user.tag}:`);
        return false;
    }
}

async function sendInfo(player, info){

}


module.exports = {
    sendRole,
    sendInfo
}