import { MemberModel, IMember, FaucetModel, IFaucet } from '../db';
import axios from 'axios';
import puppeteer from 'puppeteer';
import TelegramBot from 'node-telegram-bot-api';

import { BotServiceProps } from '../types';
import AccountTransferTokens from './transferTokens';

const prod = process.env.PRODUCTION === 'true';

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
      lastCommandChatId: props.getChatId(message)
    };

    await MemberModel.create(newMember);
  } else {
    console.log('faucet model update', props.getChatId(message));
    
    await MemberModel.updateOne(
      { [props.dbId]: props.getId(message) },
      { $set: { lastCommand, lastCommandChatId: props.getChatId(message) } }
    );
  }
}

export default async function faucetCommand(
  member: IMember | null,
  message: any,
  props: BotServiceProps
) {
  const id = props.getId(message);
  const regexp = new RegExp(`^${props.commandPrefix}faucet(.*)`);
  const regexpMatch = new RegExp(`^${props.commandPrefix}faucet (.*)`);
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
    const match = props.getText(message).match(regexpMatch);

    const walletAddress = match ? match[1] : null;

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

      const errorText = 'You can use the bot no more then once every 10 minutes';
      throw new Error(errorText);
    }
    
    if (walletAddress) {
      await faucetTransfer(member, message, props, walletAddress, faucetMemberData);
      return await props.send(message, `${props.getName(message)}, operation completed.`);
    } else {
      return await props.send(
        message,
        'Send your wallet address. To cancel the operation, send Q.'
      );
    }
  } else if (
    member &&
    member.lastCommand === 'faucet' &&
    member.lastCommandChatId === props.getChatId(message) &&
    currentMessage?.toLowerCase() === 'q'
  ) {
    // Cancel
    await setLastCommand(member, message, props, '');
    await props.send(message, 'Canceled transfer');
  } else if (
    member &&
    member.lastCommand === 'faucet' &&
    member.lastCommandChatId === props.getChatId(message) &&
    !faucetMemberData?.addresses.includes(currentMessage) &&
    new Date().getTime() - dateLastOperation > faucetPeriod
  ) {
    await faucetTransfer(member, message, props, currentMessage, faucetMemberData);
    return await props.send(message, `${props.getName(message)}, operation completed.`);
  } else if (
    member &&
    member.lastCommand === 'faucet' &&
    member.lastCommandChatId !== props.getChatId(message) &&
    (faucetMemberData?.addresses.includes(currentMessage) ||
      new Date().getTime() - dateLastOperation < faucetPeriod)
  ) {
    // Reject
    await setLastCommand(member, message, props, '');
    return props.send(
      message,
      'Transfer has already been made to this address'
    );
  }
}

async function faucetTransfer(
  member: IMember | null,
  message: any,
  props: BotServiceProps,
  currentMessage: string,
  faucetMemberData: IFaucet
  ) {
  // Transfer

  await props.send(message, 'Wait a few minutes...');

  const checkAddress = await FaucetModel.find({ addresses: { $all: [currentMessage] } });

  await setLastCommand(member, message, props, '');

  if (checkAddress.length > 0) {
    throw new Error('Error: Transfer has already been made to this address');
  }

  try {
    await faucet(currentMessage, (text: string) => props.send(message, text));

    await props.send(message, 'You got funded! If you want to get more tJoy tokens start here https://testnet.joystream.org/#/forum/threads/192');

    await FaucetModel.updateOne(
      { [props.dbId]: props.getId(message) },
      { $set: { dateLastOperation: new Date().getTime(), addresses: [...(faucetMemberData?.addresses || []), currentMessage] } }
    );
  } catch (ex) {
    console.error(ex);
    await props.send(message, ex.message);
  }
}

async function faucet(
  walletAddress = '5HfxszoqKG9MPxp1WfywYAynUaTnSfmguCidpSGWJvqwaPpu',
  sendMessage: Function
) {
  const transferTokens = new AccountTransferTokens();
  await transferTokens.start(walletAddress, prod ? 101 : 1);
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
  await page.click('.ui--InputFile');
  const inputFile = await page.$('.ui--InputFile input[type="file"]');
  await page.type(
    '.ui--Input input[type="password"]',
    process.env.ACCOUNT_PASSWORD || ''
  );
  await inputFile?.uploadFile(`accounts/${process.env.ACCOUNT_JSON_NAME}` || '');

  // Click restore button
  const restoreButtonText = prod ? 'Restore' : 'Восстановить';
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

