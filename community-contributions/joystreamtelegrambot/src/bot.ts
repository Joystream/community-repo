import { Client } from "discord.js";
import TelegramBot from "node-telegram-bot-api";
import {
  discordToken,
  tgToken,
  chatid,
  heartbeat,
  proposalDelay,
  wsLocation,
} from "../config";

// types
import { Block, Council, Options, Proposals } from "./types";
import { types } from "@joystream/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { AccountId, Header } from "@polkadot/types/interfaces";

// functions
import * as announce from "./lib/announcements";
import * as get from "./lib/getters";
import { parseArgs, printStatus, passedTime, exit } from "./lib/util";
import moment from "moment";

const opts: Options = parseArgs(process.argv.slice(2));
const log = (msg: string): void | number => opts.verbose && console.log(msg);
process.env.NTBA_FIX_319 ||
  log("TL;DR: Set NTBA_FIX_319 to hide this warning.");

// connect to telegram
const bot = tgToken ? new TelegramBot(tgToken, { polling: true }) : null;

// connect to discord
let discordChannels: { [key: string]: any } = {};
const client = new Client();
client.login(discordToken);
client.on("ready", async () => {
  if (!client.user) return;
  console.log(`Logged in to discord as ${client.user.tag}!`);
  discordChannels.council = await findDiscordChannel("council");
  discordChannels.proposals = await findDiscordChannel("proposals-bot");
  discordChannels.forum = await findDiscordChannel("forum-bot");
});

const findDiscordChannel = (name: string) =>
  client.channels.cache.find((channel: any) => channel.name === name);

client.on("message", async (msg) => {
  const user = msg.author;
  if (msg.content === "/status") {
    msg.reply(`reporting to discord`);
  }
});

let lastHeartbeat: number = moment().valueOf();

// send to telegram and discord
const sendMessage = (msg: string, channel: any) => {
  if (msg === "") return;
  sendDiscord(msg, channel);
  sendTelegram(msg);
};
const sendTelegram = (msg: string) => {
  try {
    if (bot) bot.sendMessage(chatid, msg, { parse_mode: "HTML" });
    else console.log(msg);
  } catch (e) {
    console.log(`Failed to send to telegram: ${e}`);
  }
};
const sendDiscord = (msg: string, channel: any) => {
  if (!channel) return;
  try {
    channel.send(msg);
  } catch (e) {
    console.log(e);
  }
};

const main = async () => {
  const provider = new WsProvider(wsLocation);
  const api = await ApiPromise.create({ provider, types });
  await api.isReady;

  const [chain, node, version] = await Promise.all([
    String(await api.rpc.system.chain()),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);
  log(`Subscribed to ${chain} on ${node} v${version}`);

  let council: Council = { round: 0, last: "" };
  let blocks: Block[] = [];
  let lastEra = 0;
  let lastBlock: Block = {
    id: 0,
    duration: 6000,
    timestamp: lastHeartbeat,
    stake: 0,
    noms: 0,
    vals: 0,
    issued: 0,
    reward: 0,
  };
  let issued = 0;
  let reward = 0;
  let stake = 0;
  let vals = 0;
  let noms = 0;

  const channels: number[] = [0, 0];
  const posts: number[] = [0, 0];
  const threads: number[] = [0, 0];
  let proposals: Proposals = { last: 0, current: 0, active: [], executing: [] };
  let lastProposalUpdate = 0;

  if (opts.channel) channels[0] = await get.currentChannelId(api);

  if (opts.forum) {
    posts[0] = await get.currentPostId(api);
    threads[0] = await get.currentThreadId(api);
  }

  if (opts.proposals) {
    proposals.last = await get.proposalCount(api);
    proposals.active = await get.activeProposals(api, proposals.last);
  }

  const getReward = async (era: number) =>
    Number(await api.query.staking.erasValidatorReward(era));

  api.rpc.chain.subscribeNewHeads(
    async (header: Header): Promise<void> => {
      // current block
      const id = header.number.toNumber();

      if (lastBlock.id === id) return;
      const timestamp = (await api.query.timestamp.now()).toNumber();
      const duration = timestamp - lastBlock.timestamp;

      // update validators and nominators every era
      const era = Number(await api.query.staking.currentEra());

      if (era > lastEra) {
        vals = (await api.query.session.validators()).length;
        stake = Number(await api.query.staking.erasTotalStake(era));
        issued = Number(await api.query.balances.totalIssuance());
        reward = (await getReward(era - 1)) || (await getReward(era - 2));

        // nominator count
        noms = 0;
        const nominators: { [key: string]: number } = {};
        const stashes = (await api.derive.staking.stashes())
          .map((s) => String(s))
          .map(async (v) => {
            const stakers = await api.query.staking.erasStakers(era, v);
            stakers.others.forEach(
              (n: { who: AccountId }) => nominators[String(n.who)]++
            );
            noms = Object.keys(nominators).length;
          });
        lastEra = era;
      }

      const block: Block = {
        id,
        timestamp,
        duration,
        stake,
        noms,
        vals,
        reward,
        issued,
      };
      blocks = blocks.concat(block);

      // heartbeat
      if (timestamp > lastHeartbeat + heartbeat) {
        const time = passedTime(lastHeartbeat, timestamp);
        blocks = announce.heartbeat(
          api,
          blocks,
          time,
          proposals,
          sendMessage,
          discordChannels.proposals
        );
        lastHeartbeat = block.timestamp;
      }

      // announcements
      if (opts.council && block.id > lastBlock.id)
        council = await announce.council(
          api,
          council,
          block.id,
          sendMessage,
          discordChannels.council
        );

      if (opts.channel) {
        channels[1] = await get.currentChannelId(api);
        if (channels[1] > channels[0])
          channels[0] = await announce.channels(
            api,
            channels,
            sendMessage,
            discordChannels.channels
          );
      }

      if (opts.proposals) {
        proposals.current = await get.proposalCount(api);
        if (
          proposals.current > proposals.last ||
          (timestamp > lastProposalUpdate + 60000 * proposalDelay &&
            (proposals.active || proposals.executing))
        ) {
          proposals = await announce.proposals(
            api,
            proposals,
            id,
            sendMessage,
            discordChannels.proposals
          );
          lastProposalUpdate = timestamp;
        }
      }

      if (opts.forum) {
        posts[1] = await get.currentPostId(api);
        posts[0] = await announce.posts(
          api,
          posts,
          sendMessage,
          discordChannels.forum
        );
      }

      printStatus(opts, { block: id, chain, posts, proposals });
      lastBlock = block;
    }
  );
};
main().catch((error) => {
  console.log(error);
  exit(log);
});
