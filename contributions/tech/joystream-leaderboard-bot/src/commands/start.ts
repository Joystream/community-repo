import { BotServiceProps } from '../types';

export default async function startCommand(message: any, props: BotServiceProps) {
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
