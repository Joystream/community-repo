module.exports = {
  apps : [
    {
      name: 'discord-bot',
      script: './src/discord.ts',
      cwd: './',
      exec_mode: 'fork',
      interpreter: 'node',
      watch: './src',
      interpreter_args: '--require ts-node/register --require tsconfig-paths/register'
    },
],
};
