require('dotenv').config();
const axios = require('axios').default;
const TelegramBot = require('node-telegram-bot-api'),
  mongoose = require('mongoose');

require('./db');

const members = mongoose.model('members');

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

let cachedFmInfo = null;
let lastUpdateFmDate = 0;

async function getFmInfo() {
  if (!cachedFmInfo || new Date().getTime - lastUpdateFmDate > 1000 * 600) {
    console.log('get new fmData');
    cachedFmInfo = await axios.get(
      'https://raw.githubusercontent.com/Joystream/founding-members/main/data/fm-info.json'
    );
    lastUpdateFmDate = new Date().getTime();
  }

  return cachedFmInfo;
}

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

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;

  let member = null;

  try {
    member = await members.findOne({ tgId: fromId });
  } catch (e) {
    console.error(e);
    bot.sendMessage(chatId, 'Error =( please try later');
  }

  console.log('message => ', msg);

  if (msg.text === '/start') {
    console.log('welcome', fromId);
    bot.sendMessage(
      chatId,
      'Welcome! Using this bot, you can get information about founding members.' +
        '\n\nTo view your statistics, you need enter your name via the /sethandle command to save it OR use the command "/lookup handle". ' +
        '*Please note that the handle is case sensitive!*.',
      /* + '\n\nData is updated every 10 minutes' */ { parse_mode: 'markdown' }
    );
  }

  if (/\/lookup(.*)/.test(msg.text)) {
    const match = msg.text.match(/\/lookup (.*)/);
    const handle = match ? match[1] : member?.handle;

    if (handle) {
      const fmInfo = await getFmInfo();
      const memberData = fmInfo.data.scores.totalScores.find(
        (m) => m.memberHandle === handle
      );

      if (memberData) {
        const memberDataStr =
          `Direct Score = *${memberData.totalDirectScore}*\n` +
          `Referral Score = *${memberData.totalReferralScore}*\n` +
          `Total Score = *${memberData.totalScore}*\n\n` +
          memberData.directScores
            .map((m, index) => `Period ${index} = *${m}*`)
            .join('\n');

        bot.sendMessage(chatId, memberDataStr, { parse_mode: 'markdown' });
      } else {
        bot.sendMessage(
          chatId,
          `Don't find member ${handle}. Please note that the handle is case sensitive.`
        );
      }
    } else {
      bot.sendMessage(chatId, 'Please, set your handle.');
    }
  }

  if (msg.text === '/sethandle') {
    if (member === null) {
      member = {
        tgId: fromId,
        date: msg.date,
        lastCommand: 'sethandle',
      };

      await members.create(member);
    } else {
      await members.updateOne(
        { tgId: fromId },
        { $set: { lastCommand: 'sethandle' } }
      );
    }

    bot.sendMessage(
      chatId,
      'Write your handle. Please note that the handle is case sensitive.'
    );
  } else if (member && member.lastCommand === 'sethandle') {
    await members.updateOne(
      { tgId: fromId },
      { $set: { lastCommand: null, handle: msg.text } }
    );

    bot.sendMessage(chatId, 'Good! Now you can get statistics =)');
  }

  // bot.sendMessage(chatId, 'Sorry! Technical work in progress!');
});
