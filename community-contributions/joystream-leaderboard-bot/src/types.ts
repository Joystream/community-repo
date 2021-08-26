export type SendMessage = (message: any, text: string) => Promise<any>;
export type CommandPrefix = '/' | '!' | string;

export interface BotServiceProps {
  send: SendMessage;
  commandPrefix: CommandPrefix;
  client: any; // TelegramBot | DiscordBot,
  getId: Function;
  getChatId?: Function;
  getText: Function;
  getDate: Function;
  dbId: 'tgId' | 'disId' | string;
  log: Function;
}
