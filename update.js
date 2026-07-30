const { spawn } = require('child_process');
const {versionNumber} = require("./utils/update_util");
const fs = require("fs");
const path = require("path");

let packagePath = path.join(__dirname, "package.json");
const package = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
const currentVersion = `v${package.version}`;

(async () => {
  const remoteVersion = await versionNumber();
  console.log(currentVersion);
  console.log(remoteVersion);
  if((!remoteVersion) || currentVersion === remoteVersion){
    const scriptPath = "./index.js";
    spawn('node', [scriptPath], {
      env: process.env,
      stdio: 'inherit'
    });
  }
  else{
    console.log("Updating")
    spawn('bash', ['./update.sh'], {
      stdio: 'inherit'
    });
  }
})();



