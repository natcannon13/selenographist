const { spawn } = require('child_process');

spawn('bash', ['./update.sh'], {
  stdio: 'inherit'
});