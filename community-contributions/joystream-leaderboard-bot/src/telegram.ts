require('dotenv').config();
import TelegramBot from 'node-telegram-bot-api';

import connect from './db';
import botService from './botService';

console.log('================ start ================');

connect();

const token = process.env.TELEGRAM_BOT_TEST_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', console.log);

bot.setMyCommands([
  {
    command: '/sethandle',
    description: 'set your handle name',
  },
  {
    command: '/lookup',
    description: 'return the score of the user',
  },
]);

botService({
  send: (message: TelegramBot.Message, text: string) =>
    bot.sendMessage(message.chat.id, text, { parse_mode: 'Markdown' }),
  commandPrefix: '/',
  client: bot,
  getId: (message: TelegramBot.Message) => message.from.id,
  getText: (message: TelegramBot.Message) => message.text,
  getDate: (message: TelegramBot.Message) => message.date,
  dbId: 'tgId',
  log: (...args: any) => console.log('Telegram: ', ...args),
});
