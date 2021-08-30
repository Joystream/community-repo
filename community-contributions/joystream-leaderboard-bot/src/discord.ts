require('dotenv').config();
import { Client, Message } from 'discord.js';

import connect from './db';
import botService from './botService';
const client = new Client();

connect();

botService({
  send: (message: Message, text: string) => message.channel.send(text),
  commandPrefix: '!',
  client,
  getId: (message: Message) => message.author.id,
  getName: (message: Message) => message.author.username,
  getText: (message: Message) => message.content,
  getDate: (message: Message) => message.createdTimestamp,
  dbId: 'disId',
  log: (...args: any) => console.log('Discord:', ...args)
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
