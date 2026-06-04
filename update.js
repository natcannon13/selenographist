const fs = require('fs');
const { spawn } = require('child_process');

const scriptPath = './update.sh';

// Make executable
fs.chmodSync(scriptPath, 0o755);

// Run script and inherit terminal I/O
const child = spawn('bash', [scriptPath], {
  stdio: 'inherit'
});

child.on('close', (code) => {
  console.log(`Script exited with code ${code}`);
});