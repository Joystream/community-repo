import { MemberModel, IMember } from './db';
import axios from 'axios';

type SendMessage = (message: any, text: string) => Promise<any>;
type CommandPrefix = '/' | '!' | string;

interface BotServiceProps {
  send: SendMessage;
  commandPrefix: CommandPrefix;
  client: any; // TelegramBot | DiscordBot,
  getId: Function;
  getText: Function;
  getDate: Function;
  dbId: 'tgId' | 'disId' | string;
  log: Function;
}

interface BotProps {
  send: SendMessage;
  commandPrefix: CommandPrefix;
  client: any;
  id: number;
  text: string;
  dbId: 'tgId' | 'disId' | string;
}

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
  member: IMember,
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
          `Direct Score = *${memberData.totalDirectScore}*\n` +
          `Referral Score = *${memberData.totalReferralScore}*\n` +
          `Total Score = *${memberData.totalScore}*\n\n` +
          memberData.directScores
            .map((m: any, index: number) => `Period ${index} = *${m}*`)
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
  member: IMember,
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
        handle: null,
      });

      await updMember.updateOne({
        $set: {
          lastCommand: null,
          [props.dbId]: props.getId(message),
          handle: props.getText(message),
        },
      });
    } else {
      await MemberModel.updateOne(
        { [props.dbId]: props.getId(message) },
        { $set: { lastCommand: null, handle: props.getText(message) } }
      );
    }

    props.send(message, 'Good! Now you can get statistics =)');
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

    startCommand(message, props);
    lookupCommand(member, message, props);

    if (props.commandPrefix === '/') {
      setHandleCommand(member, message, props);
    }
  });
}
