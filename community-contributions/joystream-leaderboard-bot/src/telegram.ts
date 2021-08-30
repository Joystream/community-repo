require('dotenv').config();
import TelegramBot from 'node-telegram-bot-api';

import { MemberModel } from './db';
import connect from './db';
import botService from './botService';
import AccountTransferTokens from './commands/transferTokens';

console.log('================ start ================');
console.log('PRODUCTION', process.env.PRODUCTION);

connect();

const token =
  (process.env.PRODUCTION === 'true'
    ? process.env.TELEGRAM_BOT_TOKEN
    : process.env.TELEGRAM_BOT_TEST_TOKEN) || '';

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
  {
    command: '/faucet',
    description: 'get 101 token',
  },
]);

botService({
  send: (message: TelegramBot.Message, text: string) =>
    bot.sendMessage(message.chat.id, text, { parse_mode: 'Markdown' }),
  commandPrefix: '/',
  client: bot,
  getId: (message: TelegramBot.Message) => message.from?.id,
  getName: (message: TelegramBot.Message) => message.from?.first_name,
  getChatId: (message: TelegramBot.Message) => message.chat.id,
  getText: (message: TelegramBot.Message) => message.text,
  getDate: (message: TelegramBot.Message) => message.date,
  dbId: 'tgId',
  log: (...args: any) => console.log('Telegram: ', ...args),
});

// send notification only once a day
setInterval(async () => {
  const transferTokens = new AccountTransferTokens();
  const balance = await transferTokens.getBalance();

  console.log('balance', balance);
  
  if (balance.toBigInt() < 1000) {
    const dateLastNotify = (new Date().getTime()) - 1000 * 60 * 60 * 24;
    console.log('dateLastNotify', dateLastNotify);
    const notifyMembers = await MemberModel.find({ enableNotify: { $lt: dateLastNotify } });
    console.log('notifyMembers', notifyMembers);

    notifyMembers.forEach(async (m) => {
      await bot.sendMessage(m.tgId.toString(), `Bot balance alert! Current balance - ${balance}`);

      await MemberModel.updateOne(
        { tgId: m.tgId },
        { $set: { lastCommand: '', enableNotify: (new Date().getTime()) } }
      );
    });
  }
}, 1000 * 60);
