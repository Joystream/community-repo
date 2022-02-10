import Discord, { Intents } from "discord.js";
import { ApiPromise } from "@polkadot/api";
import { EventRecord } from "@polkadot/types/interfaces";
import { wsLocation } from "../../config";
import { connectApi, getBlockHash, getEvents } from "../lib/api";
import { getDiscordChannels } from "../util";
import { DiscordChannels } from "../types";
import { processGroupEvents } from "./";

const eventsMapping = {
  MintCapacityChanged: 4211575,
  OpeningFilled: 4206250,
  OpeningAdded: 4224720,
  OpeningAdded2: 4392577,
  WorkerRewardAmountUpdated: 4389286,
  WorkerRewardAmountUpdated2: 4222426,
  AppliedOnOpening: 4264168,
  AppliedOnOpening2: 4393863,
  StakeIncreased: 4264798,
  StakeDecreased: 4264862,
  BeganApplicationReview: 4276739,
  TerminatedLeader: 4282370,
  LeaderUnset: 4282370,
};

const discordBotToken = process.env.TOKEN || undefined; // environment variable TOKEN must be set

const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS] });
client.login(discordBotToken).then(async () => {
  console.log("Bot logged in successfully");
  const channels: DiscordChannels = await getDiscordChannels(client);

  const api: ApiPromise = await connectApi(wsLocation);
  await api.isReady;
  Object.values(eventsMapping).forEach((block: number) =>
    getBlockHash(api, block).then((hash) =>
      getEvents(api, hash).then((events: EventRecord[]) =>
        processGroupEvents(api, block, hash, events, channels)
      )
    )
  );
});
