const { exec } = require('child_process');

exec('bash ./update.sh', (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(stdout);
});