import Discord, { ClientOptions, Intents } from "discord.js";

export const clientOptions: ClientOptions = {
  partials: ["MESSAGE", "CHANNEL"],
  intents: [
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
  ],
};

export const findDiscordChannel = (
  client: Discord.Client,
  name: string
): Discord.TextChannel =>
  client.channels.cache.find(
    (channel: any) => channel.name === name
  ) as Discord.TextChannel;

export const deleteDuplicateMessages = (channel: any) => {
  if (!channel) return console.warn(`deleteDuplicateMessages: empty channel`);
  let messages: { [key: string]: any } = {};
  channel.messages.fetch({ limit: 100 }).then((msgs: any) =>
    msgs.map((msg: any) => {
      const txt = msg.content.slice(0, 100);
      if (messages[txt]) {
        if (msg.deleted) return;
        msg.delete().then(() => console.debug(`deleted message ${msg.id}`));
      } else messages[txt] = msg;
    })
  );
};
