import { MemberModel, IMember, FaucetModel, IFaucet } from './db';
import axios from 'axios';
import puppeteer from 'puppeteer';
import TelegramBot from 'node-telegram-bot-api';

import { BotServiceProps } from './types';
import AccountTransferTokens from './commands/transferTokens';
import startCommand from './commands/start';
import inductedCommand from './commands/inducted';
import faucetCommand from './commands/faucet';

import getFmInfo from './getFmInfo';

const prod = process.env.PRODUCTION === 'true';

async function lookupCommand(
  member: IMember | null,
  message: any,
  props: BotServiceProps
) {
  const regexp = new RegExp(`^${props.commandPrefix}lookup(.*)`);
  const regexpMatch = new RegExp(`${props.commandPrefix}lookup (.*)`);

  if (regexp.test(props.getText(message))) {
    const match = props.getText(message).match(regexpMatch);
    // console.log('message', message);

    const handle = match ? match[1] : member?.handle;

    if (handle) {
      const fmInfo = await getFmInfo();
      const memberData = fmInfo.data.scores.totalScores.find(
        (m: any) => m.memberHandle === handle
      );

      if (memberData) {
        const memberDataStr =
          `From data processed berofe: ${new Date(
            fmInfo.data.scores.cutoff
          ).toLocaleDateString()}\n\n` +
          `Direct Score = *${memberData.totalDirectScore}*\n` +
          `Referral Score = *${memberData.totalReferralScore}*\n` +
          `Total Score = *${memberData.totalScore}*\n\n` +
          memberData.directScores
            .map((m: any, index: number) => `Period ${index} = *${m || 0}*`)
            .join('\n');

        await props.send(message, memberDataStr);
      } else {
        await props.send(
          message,
          `Don't find member ${handle}. Please note that the handle is case sensitive.`
        );
      }
    } else {
      await props.send(message, 'Please, set your handle.');
    }
  }
}

async function setHandleCommand(
  member: IMember | null,
  message: any,
  props: BotServiceProps
) {
  const regexp = new RegExp(`^${props.commandPrefix}sethandle`);
  if (regexp.test(props.getText(message))) {
    props.log('sethandle');
    if (member === null) {
      const newMember = {
        [props.dbId]: props.getId(message),
        date: props.getDate(message),
        lastCommand: 'sethandle',
      };

      await MemberModel.create(newMember);
    } else {
      await MemberModel.updateOne(
        { [props.dbId]: props.getId(message) },
        { $set: { lastCommand: 'sethandle' } }
      );
    }

    await props.send(
      message,
      'Write your handle. Please note that the handle is case sensitive.'
    );
  } else if (member && member.lastCommand === 'sethandle') {
    const updMember = await MemberModel.findOne({
      handle: props.getText(message),
    });

    if (updMember) {
      await MemberModel.remove({
        [props.dbId]: props.getId(message),
        handle: undefined,
      });

      await updMember.updateOne({
        $set: {
          lastCommand: undefined,
          [props.dbId]: props.getId(message),
          handle: props.getText(message),
        },
      });
    } else {
      await MemberModel.updateOne(
        { [props.dbId]: props.getId(message) },
        { $set: { lastCommand: undefined, handle: props.getText(message) } }
      );
    }

    await props.send(message, 'Good! Now you can get statistics =)');
  }
}

async function checkFaucetBalanceCommand(message: any, props: BotServiceProps) {
  const regexp = new RegExp(`^${props.commandPrefix}balancefaucet`);

  if (regexp.test(props.getText(message))) {
    const transferTokens = new AccountTransferTokens();
    const balance = await transferTokens.getBalance();
    // console.log('balance', balance);

    await props.send(message, `Balance = ${balance}`);
  }
}

// enable notification about expiring balance
async function enableFaucetBalanceNotifyTgCommand(
  member: IMember | null,
  message: TelegramBot.Message,
  props: BotServiceProps
) {
  changeFaucetBalanceNotifyTg(member, message, props, 'enablefaucetnotify', true);
}

async function disableFaucetBalanceNotifyTgCommand(
  member: IMember | null,
  message: TelegramBot.Message,
  props: BotServiceProps
) {
  changeFaucetBalanceNotifyTg(member, message, props, 'disablefaucetnotify', false);
}

async function changeFaucetBalanceNotifyTg(
  member: IMember | null,
  message: TelegramBot.Message,
  props: BotServiceProps,
  command = '',
  enableNotify = true,
) {
  const regexp = new RegExp(`^${props.commandPrefix}${command}`);
  if (regexp.test(props.getText(message))) {
    if (member) {
      await MemberModel.updateOne(
        { [props.dbId]: props.getId(message) },
        { $set: { lastCommand: '', enableNotify: enableNotify ? (new Date().getTime() - 1000 * 60 * 60 * 24) : undefined } }
      );

      // console.log('message', message);
      
      await props.send(message, `Notifies ${enableNotify ? 'enabled' : 'disabled'}`);
    } else {
      await props.send(message, 'Set your handle througs /sethandle');
    }
  }
}

export default async function BotService(_bot, props: BotServiceProps) {
  props.client.on('message', async (message: any) => {
    const id = props.getId(message);
    let member = null;

    try {
      if (props.commandPrefix === '/' && !props?.isPrivate(message)) {
        props.deleteMessage(_bot, message);
      }
    } catch (ex) {
      console.log('ex', ex);
    }

    try {
      member = await MemberModel.findOne({ [props.dbId]: id });
      console.log('member =>', member);
    } catch (e) {
      console.log(e);
      await props.send(message, 'Error =( please try later');
    }

    console.log('message', message);

    try {
      startCommand(message, props);
      lookupCommand(member, message, props);
      await faucetCommand(member, message, props);

      if (props.commandPrefix === '/') {
        setHandleCommand(member, message, props);
        checkFaucetBalanceCommand(message, props);
        enableFaucetBalanceNotifyTgCommand(member, message, props);
        disableFaucetBalanceNotifyTgCommand(member, message, props);
      }
    } catch (ex) {
      console.log('ex', ex);
      
      await props.send(message, ex.message);
    }
  });
}
