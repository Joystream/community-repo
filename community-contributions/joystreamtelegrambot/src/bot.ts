import TelegramBot from "node-telegram-bot-api";
import { accountId, token, chatid, wsLocation, heartbeat } from "../config";
import storageProviders from "../storageProviders";

// types
import {
  Block,
  NominatorsEntries,
  Options,
  Proposals,
  Summary,
  ProviderStatus
} from "./types";
import { types } from "@joystream/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Header } from "@polkadot/types/interfaces";

// functions
import * as announce from "./lib/announcements";
import * as get from "./lib/getters";
import { parseArgs, printStatus, passedTime, exit } from "./lib/util";
import moment from "moment";

const opts: Options = parseArgs(process.argv.slice(2));
const log = (msg: string): void | number => opts.verbose && console.log(msg);
process.env.NTBA_FIX_319 ||
  log("TL;DR: Set NTBA_FIX_319 to hide this warning.");

const bot = new TelegramBot(token, { polling: true });

let startTime: number = moment().valueOf();

const sendMessage = (msg: string) => {
  if (msg === "") return;
  try {
    bot.sendMessage(chatid, msg, { parse_mode: "HTML" });
  } catch (e) {
    console.log(`Failed to send message: ${e}`);
  }
};

// storage providers
const checkPeriod = 60000 * 10;
let lastCheck: number = 0;
let providerStatus: ProviderStatus = {};
storageProviders.forEach(
  async (address: string): Promise<void> => {
    providerStatus[address] = await get.providerStatus(address);
  }
);

const main = async () => {
  const provider = new WsProvider(wsLocation);
  const api = await ApiPromise.create({ provider, types });
  await api.isReady;

  log(`Publishing to ${chatid} with token ${token}`);

  const [chain, node, version] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version()
  ]);

  let lastBlock: Block = { id: 0, duration: 6000, timestamp: startTime };
  let summary: Summary = { blocks: [], nominators: [], validators: [] };

  const cats: number[] = [0, 0];
  const channels: number[] = [0, 0];
  const posts: number[] = [0, 0];
  const threads: number[] = [0, 0];
  let proposals: Proposals = { last: 0, current: 0, active: [], pending: [] };

  if (opts.channel) channels[0] = await get.currentChannelId(api);

  if (opts.forum) {
    posts[0] = await get.currentPostId(api);
    cats[0] = await get.currentCategoryId(api);
    threads[0] = await get.currentThreadId(api);
  }

  if (opts.proposals) {
    proposals.last = await get.proposalCount(api);
    proposals.active = await get.activeProposals(api);
    proposals.pending = await get.pendingProposals(api);
  }

  log(`Subscribed to ${chain} on ${node} v${version}`);
  const unsubscribe = await api.rpc.chain.subscribeNewHeads(
    async (header: Header): Promise<void> => {
      // current block
      const id = header.number.toNumber();
      if (lastBlock.id === id) return;
      const timestamp = (await api.query.timestamp.now()).toNumber();
      const duration = timestamp - lastBlock.timestamp;
      const block: Block = { id, timestamp, duration };

      // count nominators and validators
      const nominatorsEntries: NominatorsEntries = await api.query.staking.nominators.entries();
      const currentValidators = await api.query.staking.validatorCount();
      let { blocks, nominators, validators } = summary;
      blocks = blocks.concat(block);
      nominators = nominators.concat(nominatorsEntries.length);
      validators = validators.concat(currentValidators.toNumber());
      summary = { blocks, nominators, validators };

      // heartbeat
      if (timestamp > startTime + heartbeat) {
        const formattedTime = passedTime(startTime, timestamp);
        announce.heartbeat(api, summary, formattedTime, accountId, sendMessage);
        startTime = block.timestamp;
        summary = { blocks: [], nominators: [], validators: [] };
      }

      // announcements
      if (opts.council && block.id > lastBlock.id)
        announce.councils(api, block.id, sendMessage);

      if (opts.channel) {
        channels[1] = await get.currentChannelId(api);
        if (channels[1] > channels[0])
          channels[0] = await announce.channels(api, channels, sendMessage);
      }

      if (opts.proposals) {
        proposals.current = await get.proposalCount(api);
        if (proposals.current > proposals.last)
          proposals = await announce.proposals(api, proposals, sendMessage);
      }

      if (opts.forum) {
        cats[1] = await get.currentCategoryId(api);
        posts[1] = await get.currentPostId(api);
        threads[1] = await get.currentThreadId(api);

        if (cats[1] > cats[0])
          cats[0] = await announce.categories(api, cats, sendMessage);

        if (posts[1] > posts[0])
          posts[0] = await announce.posts(api, posts, sendMessage);

        if (threads[1] > threads[0])
          threads[0] = await announce.threads(api, threads, sendMessage);
      }

      printStatus(opts, {
        block: id,
        cats,
        chain: String(chain),
        posts,
        proposals,
        threads
      });
      lastBlock = block;

      // test storage providers
      if (block.timestamp > lastCheck + checkPeriod) {
        checkProviders(providerStatus, sendMessage);
        lastCheck = block.timestamp;
      }
    }
  );
};
main().catch(() => exit(log));

const checkProviders = async (
  providerStatus: ProviderStatus,
  sendMessage: (msg: string) => void
): Promise<void> => {
  Object.keys(providerStatus).map(
    async (address: string, id: number): Promise<void> => {
      const status = await get.providerStatus(address);
      log(`\t${address}:\t${status ? "online" : "offline"}`);

      //A storage provider goes online (id, address, time)
      if (!providerStatus[address] && status)
        announce.provider(id, address, "online", sendMessage);

      //A storage provider goes offline (id, address, time)
      if (providerStatus[address] && !status)
        announce.provider(id, address, "offline", sendMessage);

      providerStatus[address] = status;
    }
  );
  // TODO A new storage provider (or lead) opportunity is opened (id, title, link)
  // TODO A new storage provider (or lead) opportunity is closed (id, title, link, providerId+membershipId of hired)
};
