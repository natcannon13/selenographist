const { getRoleList } = require("../utils/roles_util");
for(let i = 4; i <= 15; i++){
    const roles = getRoleList(i);

    if(roles.length !== i){
        console.error(`FAILED for ${i} players`);
        console.error(roles);
    }
    else{
        console.log(`PASS ${i}`);
    }
}