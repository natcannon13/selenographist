function getRoleList(numPlayers){
    if (numPlayers < 4 || numPlayers > 15){
        return [];
    }
    let roles = ["Seer", "Werewolf", "Villager", "Villager"];
    let numExtraVillagers = 0;
    let apprentice = false;
    let numExtraWerewolves = 0;
    let masons = false;
    let beholder = false;
    switch(numPlayers){
        case 4:
            break;
        case 5:
            numExtraVillagers = 1;
            break;
        case 6:
            numExtraVillagers = 2;
            break;
        case 7:
            numExtraVillagers = 1;
            numExtraWerewolves = 1;
            apprentice = true;
            break;
        case 8:
            numExtraVillagers = 2;
            numExtraWerewolves = 1;
            apprentice = true;
            break;
        case 9:
            numExtraVillagers = 3;
            numExtraWerewolves = 1;
            apprentice = true;
            break;
        case 10:
            numExtraVillagers = 4;
            numExtraWerewolves = 1;
            apprentice = true;
            break;
        case 11:
            numExtraVillagers = 3;
            numExtraWerewolves = 2;
            apprentice = true;
            beholder = true;
            break;
        case 12:
            numExtraVillagers = 4;
            numExtraWerewolves = 2;
            apprentice = true;
            beholder = true;
            break;
        case 13:
            numExtraVillagers = 4;
            numExtraWerewolves = 2;
            apprentice = true;
            beholder = false;
            masons = true;
            break;
        case 14:
            numExtraVillagers = 4;
            numExtraWerewolves = 2;
            apprentice = true;
            beholder = true;
            masons = true;
            break;
        case 15:
            numExtraVillagers = 5;
            numExtraWerewolves = 2;
            apprentice = true;
            beholder = true;
            masons = true;
            break;  
    }
    for (i = 0; i < numExtraVillagers; i++){
        roles.push("Villager");
    }
    for (i = 0; i < numExtraWerewolves; i++){
        roles.push("Werewolf");
    }
    if(apprentice){
        roles.push("Apprentice");
    }
    if(beholder){
        roles.push("Beholder");
    }
    if(masons){
        roles.push("Mason");
        roles.push("Mason");
    }
    shuffle(roles);
    return roles;
}

function shuffle(roles){
    for(let i = roles.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i+1));
        const newPos = roles[i];
        roles[i] = roles[j];
        roles[j] = newPos;
    }
}

function getPlayerID(input){
    const match = input.match(/^<@(\d+)>$/);
    return match ? match[1] : null;
}

module.exports = {
    getRoleList,
    getPlayerID
}