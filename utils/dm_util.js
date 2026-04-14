async function sendRole(user, role){
    try{
        await user.send(`Your role is: ${role}`);
        return true;
    }
    catch(error){
        console.error(`Failed to DM ${user.tag}:`);
        return false;
    }
}