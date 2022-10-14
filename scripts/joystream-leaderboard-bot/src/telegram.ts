require('dotenv').config();
import TelegramBot from 'node-telegram-bot-api';

import { MemberModel } from './db';
import connect from './db';
import botService from './botService';
import AccountTransferTokens from './commands/transferTokens';

// const typeTelegramBot = process.argv[2];

console.log('================ start ================');
console.log('PRODUCTION', process.env.PRODUCTION);
// console.log('typeTelegramBot', typeTelegramBot);

connect();

/* const telegramBotToken = typeTelegramBot === 'private' ? process.env.TELEGRAM_BOT_TOKEN : process.env.TELEGRAM_GROUP_BOT_TOKEN;

const token =
  (process.env.PRODUCTION === 'true'
    ? telegramBotToken
    : process.env.TELEGRAM_BOT_TEST_TOKEN) || ''; */

const token =
  (process.env.PRODUCTION === 'true'
    ? process.env.TELEGRAM_BOT_TOKEN
    : process.env.TELEGRAM_BOT_TEST_TOKEN) || '';

const groupBotToken = process.env.TELEGRAM_GROUP_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });
const groupBot = new TelegramBot(groupBotToken, { polling: true });

bot.on('polling_error', console.log);
groupBot.on('polling_error', console.log);

const setFaucetCommand = {
  command: '/faucet',
  description: 'get 101 token',
};

bot.setMyCommands([
  {
    command: '/sethandle',
    description: 'set your handle name',
  },
  {
    command: '/lookup',
    description: 'return the score of the user',
  },
  { ...setFaucetCommand },
]);

groupBot.setMyCommands([{ ...setFaucetCommand }]);

const isPrivate = (message: TelegramBot.Message) =>
  message.chat.type === 'private';

const deleteMessage = (_bot, message: TelegramBot.Message) =>
  setTimeout(
    () => _bot.deleteMessage(message.chat.id, message.message_id.toString()),
    1000 * 60 * 5
  );

function init(_bot) {
  botService(_bot, {
    send: async (message: TelegramBot.Message, text: string) => {
      const result = await _bot.sendMessage(message.chat.id, text, {
        parse_mode: 'Markdown',
      });

      if (!isPrivate(message)) {
        deleteMessage(_bot, result);
      }

      return result;
    },
    commandPrefix: '/',
    client: _bot,
    getId: (message: TelegramBot.Message) => message.from?.id,
    getName: (message: TelegramBot.Message) => message.from?.first_name,
    getChatId: (message: TelegramBot.Message) => message.chat.id,
    getText: (message: TelegramBot.Message) => message.text,
    getDate: (message: TelegramBot.Message) => message.date,
    isPrivate,
    deleteMessage,
    dbId: 'tgId',
    log: (...args: any) => console.log('Telegram: ', ...args),
  });
}

init(bot);
init(groupBot);

// send notification only once a day
setInterval(async () => {
  const transferTokens = new AccountTransferTokens();
  const balance = await transferTokens.getBalance();

  // console.log('balance', balance);

  if (balance.toBigInt() < 1000) {
    const dateLastNotify = new Date().getTime() - 1000 * 60 * 60 * 24;
    console.log('dateLastNotify', dateLastNotify);
    const notifyMembers = await MemberModel.find({
      enableNotify: { $lt: dateLastNotify },
    });
    console.log('notifyMembers', notifyMembers);

    notifyMembers.forEach(async (m) => {
      await bot.sendMessage(
        m.tgId.toString(),
        `Bot balance alert! Current balance - ${balance}`
      );

      await MemberModel.updateOne(
        { tgId: m.tgId },
        { $set: { lastCommand: '', enableNotify: new Date().getTime() } }
      );
    });
  }
}, 1000 * 60);
