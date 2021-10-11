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
import { parseArgs, printStatus, passedTime } from "./lib/util";
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
  discordChannels.tokenomics = await findDiscordChannel("tokenomics");
});

const findDiscordChannel = (name: string) =>
  client.channels.cache.find((channel: any) => channel.name === name);

client.on("message", async (msg) => {
  const user = msg.author;
  if (msg.content === "/status") {
    msg.reply(`reporting to discord`);
  }
});

// send to telegram and discord
const sendMessage = (msg: { tg: string; discord: string }, channel: any) => {
  if (msg.tg === "") return;
  sendDiscord(msg.discord, channel);
  sendTelegram(msg.tg);
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
  if (!channel || !msg.length) return;
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
  let timestamp = await get.timestamp(api);
  let duration = 0;
  let lastHeartbeat = timestamp;
  let lastBlock: Block = {
    id: 0,
    duration: 0,
    timestamp: 0,
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
  let announced: { [key: string]: boolean } = {};

  const channels: number[] = [0, 0];
  const posts: number[] = [0, 0];
  const threads: number[] = [0, 0];
  let proposals: Proposals = { last: 0, current: 0, active: [], executing: [] };
  let lastProposalUpdate = 0;

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
      timestamp = await get.timestamp(api);
      duration = lastBlock.timestamp ? timestamp - lastBlock.timestamp : 0;

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
      if (duration) blocks = blocks.concat(block);

      // heartbeat
      if (timestamp > lastHeartbeat + heartbeat) {
        const time = passedTime(lastHeartbeat, timestamp);
        announce.heartbeat(
          api,
          blocks,
          time,
          proposals,
          sendMessage,
          discordChannels.tokenomics
        );
        lastHeartbeat = block.timestamp;
        blocks = [];
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

      if (opts.proposals) {
        proposals.current = await get.proposalCount(api);

        if (
          proposals.current > proposals.last &&
          !announced[proposals.current]
        ) {
          announced[`proposal${proposals.current}`] = true;
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
        announce.posts(api, posts, sendMessage, discordChannels.forum);
        posts[0] = posts[1];
      }

      printStatus(opts, { block: id, chain, posts, proposals });
      lastBlock = block;
    }
  );
};
main().catch((error) => {
  console.log(error);
  process.exit();
});
