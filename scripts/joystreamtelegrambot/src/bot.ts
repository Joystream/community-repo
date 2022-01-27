import { Client } from "discord.js";
import TelegramBot, {
  ParseMode,
  SendMessageOptions,
} from "node-telegram-bot-api";
import {
  domain,
  discordToken,
  tgToken,
  chatid,
  heartbeat,
  proposalDelay,
  wsLocation,
  councilStatusHeartbeat,
} from "../config";

// types
import { Block, Council, Options, Proposals, ProposalVotes } from "./types";
import { ProposalDetail } from "./lib/types";
import { types } from "@joystream/types";
import { ProposalId } from "@joystream/types/proposals";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { AccountId, Header, EventRecord } from "@polkadot/types/interfaces";

// functions
import {
  getActiveProposals,
  getProposal,
  getProposalInfo,
  getBestHash,
  getBlockHash,
  getTimestamp,
  getCouncil,
  getEvents,
  getMember,
  getNextPost,
  getNextThread,
  getProposalCount,
  getProposalPost,
  getProposalVotes,
} from "./lib/api";
import * as announce from "./announcements";
import { getCouncilHandles, parseArgs, printStatus, passedTime } from "./util";
import moment from "moment";

const opts: Options = parseArgs(process.argv.slice(2));
const log = (msg: string): void | number => opts.verbose && console.log(msg);
log(JSON.stringify(opts));
process.env.NTBA_FIX_319 ||
  log("TL;DR: Set NTBA_FIX_319 to hide this warning.");

// connect to telegram
const bot = tgToken ? new TelegramBot(tgToken, { polling: true }) : null;

// connect to discord
let discordChannels: { [key: string]: any } = {};
const client = new Client();
client.login(discordToken);
client.on("ready", async () => {
  if (!client.user) return console.error(`Empty discord user.`);
  console.log(`Logged in to discord as ${client.user.tag}!`);
  discordChannels.council = await findDiscordChannel("council");
  discordChannels.proposals = await findDiscordChannel("proposals-bot");
  discordChannels.forum = await findDiscordChannel("forum-bot");
  discordChannels.tokenomics = await findDiscordChannel("tokenomics");

  deleteDuplicateMessages(discordChannels.proposals);
});

const deleteDuplicateMessages = (channel: any) => {
  let messages: { [key: string]: any } = {};
  channel.messages.fetch({ limit: 100 }).then((msgs: any) =>
    msgs.map((msg: any) => {
      const txt = msg.content.slice(0, 100);
      if (messages[txt]) {
        if (msg.deleted) console.log(`duplicate msg already deleted`);
        else {
          console.log(`deleting duplicate message`, msg.content);
          msg.delete().then(() => console.log(`deleted message ${msg.id}`));
        }
      } else messages[txt] = msg;
    })
  );
};

const findDiscordChannel = (name: string) =>
  client.channels.cache.find((channel: any) => channel.name === name);

client.on("message", async (msg) => {
  const user = msg.author;
  if (msg.content === "/status") msg.reply(`${user}, reporting to discord.`);
});

bot?.on("message", (msg: TelegramBot.Message) => {
  if (!msg.reply_to_message) {
    const chatId = msg.chat.id;
    console.log(chatId);
    const username = `${msg.from?.first_name} ${
      msg.from?.last_name || ""
    }`.trim();
    const userParsed = `[${username}](tg://user?id=${msg.from?.id})`;
    const options: SendMessageOptions = { parse_mode: "Markdown" };
    if (msg.text?.startsWith("/status")) {
      bot.sendMessage(
        chatId,
        `Hi ${userParsed}, **on demand status is still in progress**`,
        options
      );
    }
  }
});

// send to telegram and discord
const sendMessage = (
  msg: { tg: string; tgParseMode: ParseMode | undefined; discord: string },
  channel: any
) => {
  if (msg.discord.length) sendDiscord(msg.discord, channel);
  if (msg.tg.length) sendTelegram(msg.tg, msg.tgParseMode);
};
const sendTelegram = (msg: string, tgParseMode: ParseMode | undefined) => {
  if (bot && msg.length) {
    try {
      bot.sendMessage(chatid, msg, { parse_mode: tgParseMode || "HTML" });
    } catch (e) {
      console.log(`Failed to send to telegram: ${e}`);
    }
  } else console.log(msg);
};
const sendDiscord = (msg: string, channel: any) => {
  if (!channel) return;
  try {
    channel.send(msg);
  } catch (e: any) {
    console.log(`Failed to send to discord: ${e.message}`);
  }
};

const missingVotesMessages = async (api: ApiPromise, council: Council) => {
  const active: ProposalId[] = await getActiveProposals(api);
  const proposals = await Promise.all(
    active.map((id: ProposalId) =>
      getProposalInfo(api, id).then(({ title }) =>
        getProposalVotes(api, id).then((votes) => {
          return { id, title: String(title.toHuman()), votes };
        })
      )
    )
  );
  return announce.missingProposalVotes(proposals, council);
};

const main = async () => {
  const provider = new WsProvider(wsLocation);
  const api = await ApiPromise.create({ provider, types });
  await api.isReady;

  let council: Council = { round: 0, last: "", seats: [] };
  council.seats = await getCouncilHandles(api);

  client.on("message", (msg): void => {
    const user = msg.author.id;
    if (msg.content === "/proposals") {
      msg
        .reply(`Checking..`)
        .then(async (reply) =>
          reply.edit(
            await missingVotesMessages(api, council).then(
              ({ discord }) => discord || `No active proposals.`
            )
          )
        )
        .catch((error) => console.log(`Discord /proposals: ${error.message}`));
    }
  });

  const [chain, node, version] = await Promise.all([
    String(await api.rpc.system.chain()),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);
  log(`Subscribed to ${chain} on ${node} v${version}`);

  let blocks: Block[] = [];
  let lastEra = 0;
  let timestamp = await getTimestamp(api, await getBestHash(api));
  let duration = 0;
  let lastHeartbeat = timestamp;
  let lastCouncilHeartbeat = timestamp;
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
    const hash = await getBestHash(api);
    posts[0] = (await getNextPost(api, hash)) - 1;
    threads[0] = (await getNextThread(api, hash)) - 1;
  }

  if (opts.proposals) {
    console.log(`updating proposals`);
    proposals.last = await getProposalCount(api);
    proposals.active = await getActiveProposals(api);
  }

  const getReward = async (era: number) =>
    Number(await api.query.staking.erasValidatorReward(era));

  api.rpc.chain.subscribeNewHeads(async (header: Header): Promise<void> => {
    // current block
    const id = header.number.toNumber();
    if (lastBlock.id === id) return;
    const hash = await getBlockHash(api, id);
    timestamp = await getTimestamp(api, hash);
    duration = lastBlock.timestamp ? timestamp - lastBlock.timestamp : 0;
    const events: EventRecord[] = await getEvents(api, hash);

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

    // send proposal reminder
    if (timestamp > lastProposalUpdate + heartbeat) {
      const msg = await missingVotesMessages(api, council);
      const channel = await findDiscordChannel("proposals");
      console.log(msg);
      //sendMessage(msg, channel);
      //sendDiscord("Please vote:\n" + msg.discord, channel);
      lastProposalUpdate = timestamp;
    }

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
    if (timestamp > lastCouncilHeartbeat + councilStatusHeartbeat) {
      announce.councilStatus(api, block, sendMessage, discordChannels.council);
      lastCouncilHeartbeat = block.timestamp;
    }

    if (opts.council && block.id > lastBlock.id) {
      council = await announce.council(
        api,
        council,
        block.id,
        sendMessage,
        discordChannels.council
      );
    }

    if (opts.proposals) {
      // new proposal
      const created = events.filter(
        ({ event }: EventRecord) => event.method === "ProposalCreated"
      );
      if (created.length) {
        console.log(
          `proposal created`,
          created.map(({ event }) => event.data)
        );
        created.map(({ event }) =>
          getProposal(api, event.data[1] as ProposalId).then((proposal) =>
            announce.proposalCreated(
              proposal,
              sendMessage,
              discordChannels.proposals
            )
          )
        );
      }

      // status update
      const updated = events.filter(
        ({ event }: EventRecord) => event.method === "ProposalStatusUpdated"
      );
      let seen: number[] = [];
      if (updated.length) {
        console.log(
          `proposal update`,
          updated.map((e) => e.toHuman())
        );
        updated.map(({ event }) => {
          const proposalId = Number(event.data[0]);
          if (seen.includes(proposalId)) return;
          seen.push(proposalId);
          getProposal(api, event.data[0] as ProposalId).then((proposal) =>
            announce.proposalUpdated(
              proposal,
              id,
              sendMessage,
              discordChannels.proposals
            )
          );
        });
      }
    }

    if (opts.forum) {
      posts[1] = (await getNextPost(api, hash)) - 1;
      announce.posts(api, posts, sendMessage, discordChannels.forum);
      posts[0] = posts[1];
    }

    printStatus(opts, { block: id, chain, posts, proposals });
    lastBlock = block;
  });
};
main().catch((error) => {
  console.log(error);
  process.exit();
});
