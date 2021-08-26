import { MemberModel, IMember, FaucetModel } from './db';
import axios from 'axios';
import puppeteer from 'puppeteer';
import TelegramBot from 'node-telegram-bot-api';

import { SendMessage, CommandPrefix, BotServiceProps } from './types';
import AccountTransferTokens from './commands/transferTokens';

const prod = process.env.PRODUCTION === 'true';

let cachedFmInfo: any = null;
let lastUpdateFmDate = 0;

async function getFmInfo() {
  if (!cachedFmInfo || new Date().getTime() - lastUpdateFmDate > 1000 * 600) {
    console.log('get new fmData');
    cachedFmInfo = await axios.get(
      'https://raw.githubusercontent.com/Joystream/founding-members/main/data/fm-info.json'
    );
    lastUpdateFmDate = new Date().getTime();
  }

  return cachedFmInfo;
}

function startCommand(message: any, props: BotServiceProps) {
  props.log(props.getText(message));

  const regexp = new RegExp(`^${props.commandPrefix}start`);
  if (regexp.test(props.getText(message))) {
    props.log('welcome', props.getId(message));
    props.send(
      message,
      'Welcome! Using this bot, you can get information about founding members.' +
        (props.commandPrefix === '/'
          ? `\n\nTo view your statistics, you need enter your name via the ${props.commandPrefix}sethandle command to save it OR use the command "${props.commandPrefix}lookup handle". `
          : `\n\nTo view your statistics, use the command "${props.commandPrefix}lookup handle". `) +
        '*Please note that the handle is case sensitive!*.'
    );
  }
}

async function lookupCommand(
  member: IMember | null,
  message: any,
  props: BotServiceProps
) {
  const regexp = new RegExp(`^${props.commandPrefix}lookup(.*)`);
  const regexpMatch = new RegExp(`${props.commandPrefix}lookup (.*)`);

  if (regexp.test(props.getText(message))) {
    const match = props.getText(message).match(regexpMatch);
    console.log('message', message);

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

        props.send(message, memberDataStr);
      } else {
        props.send(
          message,
          `Don't find member ${handle}. Please note that the handle is case sensitive.`
        );
      }
    } else {
      props.send(message, 'Please, set your handle.');
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

    props.send(
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
        handle: undefined, // TODO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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

    props.send(message, 'Good! Now you can get statistics =)');
  }
}

async function faucetOldVersion(memberAddress = '', sendMessage: Function) {
  const browser = await puppeteer.launch({
    args: ['--lang="en-US"'],
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en',
  });

  await page.goto('https://testnet.joystream.org/#/accounts');
  await page.waitForTimeout(5000);

  sendMessage('Preparing for transfer...');

  // Open restore json window
  const restoreJSONText = prod ? 'Restore JSON' : 'Восстановить из JSON файла';
  const [restoreJSONButton] = await page.$x(
    `//button[contains(., '${restoreJSONText}')]`
  );
  await restoreJSONButton.click();

  // Fill fields (file + password)
  // const clickToSelectText = prod ? 'click to select or drag and drop the file here' : 'нажмите для выбора, либо сбростье файл сюда';
  await page.click('.ui--InputFile');
  const inputFile = await page.$('.ui--InputFile input[type="file"]');
  // const inputPassword = await page.$('.ui--Input input[type="password"]');
  await page.type(
    '.ui--Input input[type="password"]',
    process.env.ACCOUNT_PASSWORD || ''
  );
  await inputFile?.uploadFile(`accounts/${process.env.ACCOUNT_JSON_NAME}` || '');

  // Click restore button
  const restoreButtonText = prod ? 'Restore' : 'Восстановить'; // 'Отменить'; //'Восстановить';
  const restoreButtons = await page.$x(
    `//button[contains(., '${restoreButtonText}')]`
  );

  await restoreButtons[1].click();

  sendMessage('Preparing for transfer - step 2...');
  // Click send button
  const sendButtonText = prod ? 'send' : 'отправить';
  const [sendButton] = await page.$x(
    `//button[contains(., '${sendButtonText}')]`
  );
  await sendButton.click();

  // Fill address
  const sendToAddressSelectText = prod
    ? 'send to address'
    : 'отправить на адрес';
  const sendAmountText = prod ? 'amount' : 'сумма';

  const [addresSelector] = await page.$x(
    `//div[contains(@class, "ui--Modal-Column") and contains(., "${sendToAddressSelectText}")]/div[contains(@class, "ui--Modal-Column")]//input`
  );

  const [labelAmount] = await page.$x(
    `//div[contains(@class, "ui--Modal-Column") and contains(., "${sendAmountText}")]/div[contains(@class, "ui--Modal-Column")]//input`
  );

  console.log('memberAddress', memberAddress);

  await page.screenshot({ path: `screenshots/send.png` });
  await labelAmount.click({ clickCount: 3 });
  await labelAmount.type('1' /* '101' */);
  await page.screenshot({ path: `screenshots/send1.png` });
  await addresSelector.type(memberAddress);
  await page.screenshot({ path: `screenshots/send2.png` });

  sendMessage('Preparing for transfer - step 3...');

  // Click to transfer & Sign and Submit
  const transferText = prod ? 'Make Transfer' : 'Выполнить Трансфер';
  const [transferButton] = await page.$x(
    `//button[contains(., '${transferText}')]`
  );
  await transferButton.click();

  const unlockAccountText = prod
    ? 'unlock account with password'
    : 'разблокировать аккаунт с помощью пароля';

  const signAndSubmitText = prod ? 'Sign and Submit' : 'Подписать и отправить';

  const [unlockPasswordInput] = await page.$x(
    `//div[contains(@class, "ui--Modal-Column") and contains(., "${unlockAccountText}")]/div[contains(@class, "ui--Modal-Column")]//input`
  );

  const [signAndSubmitButton] = await page.$x(
    `//button[contains(., '${signAndSubmitText}')]`
  );

  sendMessage('Start transfer tokens');

  await unlockPasswordInput.type(process.env.ACCOUNT_PASSWORD || '');
  await signAndSubmitButton.click();
  await page.waitForTimeout(2000);

  console.log('-------------------- create screenshot --------------------');

  await page.screenshot({ path: `screenshots/example.png` });
  await page.screenshot({ path: `screenshots/wallet-${memberAddress}.png` });

  console.log('-------------------- finish --------------------');

  await browser.close();
}

async function setLastCommand(
  member: IMember | null,
  message: any,
  props: BotServiceProps,
  lastCommand: string
) {
  if (member === null) {
    const newMember = {
      [props.dbId]: props.getId(message),
      date: props.getDate(message),
      lastCommand,
    };

    await MemberModel.create(newMember);
  } else {
    await MemberModel.updateOne(
      { [props.dbId]: props.getId(message) },
      { $set: { lastCommand } }
    );
  }
}

async function faucetCommand(
  member: IMember | null,
  message: any,
  props: BotServiceProps
) {
  const id = props.getId(message);
  const regexp = new RegExp(`^${props.commandPrefix}faucet(.*)`);
  const faucetMemberData = await FaucetModel.findOne({ [props.dbId]: id });
  const dateLastOperation = faucetMemberData?.dateLastOperation || 0;

  const currentMessage = props.getText(message);

  const faucetPeriod =
    60000 *
    10 *
    (faucetMemberData?.addresses.length >= 3
      ? (faucetMemberData?.addresses.length - 2) * 60
      : 1);

  if (regexp.test(currentMessage)) {
    // /faucet

    await setLastCommand(member, message, props, 'faucet');

    if (faucetMemberData === null) {
      const newFaucet = {
        [props.dbId]: props.getId(message),
        date: props.getDate(message),
        dateUpdate: props.getDate(message),
      };

      await FaucetModel.create(newFaucet);
    } else if (
      new Date().getTime() - dateLastOperation < faucetPeriod
    ) {
      await setLastCommand(member, message, props, '');
      return await props.send(message, 'You can use the bot no more then once every 10 minutes');
    }

    return await props.send(
      message,
      'Send your wallet address. To cancel the operation, send Q.'
    );
  } else if (
    member &&
    member.lastCommand === 'faucet' &&
    currentMessage.toLowerCase() === 'q'
  ) {
    // Cancel
    await setLastCommand(member, message, props, '');
    await props.send(message, 'Canceled transfer');
  } else if (
    member &&
    member.lastCommand === 'faucet' &&
    // && !faucetMemberData?.address
    !faucetMemberData?.addresses.includes(currentMessage) &&
    new Date().getTime() - dateLastOperation > faucetPeriod
  ) {
    // Transfer
    props.send(message, 'Wait a few minutes...');

    const checkAddress = await FaucetModel.find({ addresses: { $all: [currentMessage] } });

    console.log('checkAddress', checkAddress);

    if (checkAddress.length > 0) {
      props.send(message, 'Transfer has already been made to this address');
      throw new Error('Error: Transfer has already been made to this address');
    }

    await setLastCommand(member, message, props, '');

    try {
      await faucet(currentMessage, (text: string) => props.send(message, text));

      await props.send(message, 'You got funded!');

      await FaucetModel.updateOne(
        { [props.dbId]: props.getId(message) },
        { $set: { dateLastOperation: new Date().getTime(), addresses: [...faucetMemberData?.addresses, currentMessage] } }
      );
    } catch (ex) {
      console.error(ex);
      props.send(message, ex.message);
    }

    const transferTokens = new AccountTransferTokens();
    const balance = await transferTokens.getBalance();
    if (balance.toBigInt() < 1000) {
      // send notification only once a day
      const dateLastNotify = (new Date().getTime()) - 1000 * 60 * 60 * 24;
      const notifyMembers = await MemberModel.find({ enableNotify: { $lt: dateLastNotify } });

      notifyMembers.forEach(async (m) => {
        await props.send({ chat: { id: m.tgId } }, `Bot balance alert! Current balance - ${balance}`);

        await MemberModel.updateOne(
          { tgId: m.tgId },
          { $set: { lastCommand: '', enableNotify: (new Date().getTime()) } }
        );
      });
    }

    return props.send(message, 'Operation completed.');
  } else if (
    member &&
    member.lastCommand === 'faucet' &&
    (faucetMemberData?.addresses.includes(currentMessage) ||
      new Date().getTime() - dateLastOperation < faucetPeriod)
  ) {
    // Reject
    await setLastCommand(member, message, props, '');
    return props.send(
      message,
      /* 'Can only be done once a day.' */ 'Transfer has already been made to this address'
    );
  }
}

async function faucet(
  walletAddress = '5HfxszoqKG9MPxp1WfywYAynUaTnSfmguCidpSGWJvqwaPpu',
  sendMessage: Function
) {
  const transferTokens = new AccountTransferTokens();
  await transferTokens.start(walletAddress, prod ? 101 : 1);
}

async function checkFaucetBalanceCommand(message: any, props: BotServiceProps) {
  const regexp = new RegExp(`^${props.commandPrefix}balancefaucet`);

  if (regexp.test(props.getText(message))) {
    const transferTokens = new AccountTransferTokens();
    const balance = await transferTokens.getBalance();
    console.log('balance', balance);

    props.send(message, `Balance = ${balance}`);
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

      console.log('message', message);
      
      props.send(message, `Notifies ${enableNotify ? 'enabled' : 'disabled'}`);
    } else {
      props.send(message, 'Set your handle througs /sethandle');
    }
  }
}

export default async function BotService(props: BotServiceProps) {
  props.client.on('message', async (message: any) => {
    const id = props.getId(message);
    let member = null;

    try {
      member = await MemberModel.findOne({ [props.dbId]: id });
      console.log('member =>', member);
    } catch (e) {
      console.log(e);
      props.send(message, 'Error =( please try later');
    }

    try {
      startCommand(message, props);
      lookupCommand(member, message, props);

      if (props.commandPrefix === '/') {
        setHandleCommand(member, message, props);
        faucetCommand(member, message, props);
        checkFaucetBalanceCommand(message, props);
        enableFaucetBalanceNotifyTgCommand(member, message, props);
        disableFaucetBalanceNotifyTgCommand(member, message, props);
      }
    } catch (e) {
      await props.send(message, e);
    }
  });
}
