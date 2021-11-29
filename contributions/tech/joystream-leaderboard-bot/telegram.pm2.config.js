module.exports = {
  apps : [
    {
      name: 'telegram-bot',
      script: './src/telegram.ts',
      cwd: './',
      exec_mode: 'fork',
      interpreter: 'node',
      watch: './src',
      interpreter_args: '--require ts-node/register --require tsconfig-paths/register'
    },
],
};
