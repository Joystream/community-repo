import TelegramBot from "node-telegram-bot-api";
import { token, chatid, wsLocation } from "../config";

// types
import { Options, Proposals } from "./types";
import { types } from "@joystream/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Header } from "@polkadot/types/interfaces";

// functions
import * as announce from "./lib/announcements";
import * as get from "./lib/getters";
import { parseArgs, printStatus, exit } from "./lib/util";

const opts: Options = parseArgs(process.argv.slice(2));
const log = (msg: string): void | number => opts.verbose && console.log(msg);
process.env.NTBA_FIX_319 ||
  log("TL;DR: Set NTBA_FIX_319 to hide this warning.");

const bot = new TelegramBot(token, { polling: true });

const sendMessage = (msg: string) => {
  try {
    //bot.sendMessage(chatid, msg, { parse_mode: "HTML" });
  } catch (e) {
    console.log(`Failed to send message: ${e}`);
  }
};

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

  let lastBlock = 0;
  const cats: number[] = [0, 0];
  const channels: number[] = [0, 0];
  const posts: number[] = [0, 0];
  const threads: number[] = [0, 0];
  let proposals: Proposals = { last: 0, current: 0, active: [], pending: [] };

  if (opts.channel) channels[0] = await get.currentChannelId(api);

  if (opts.forum) {
    posts[0] = (await get.currentPostId(api)) - 1;
    cats[0] = (await get.currentCategoryId(api)) - 1;
    threads[0] = (await get.currentThreadId(api)) - 1;
  }

  if (opts.proposals) {
    proposals.last = (await get.proposalCount(api)) - 1;
    proposals.active = await get.activeProposals(api);
    proposals.pending = await get.pendingProposals(api);
  }

  log(`Subscribed to ${chain} on ${node} v${version}`);
  const unsubscribe = await api.rpc.chain.subscribeNewHeads(
    async (block: Header): Promise<void> => {
      const currentBlock = block.number.toNumber();
      if (opts.council && currentBlock > lastBlock)
        lastBlock = await announce.councils(api, currentBlock, sendMessage);

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
        block: currentBlock,
        cats,
        chain: String(chain),
        posts,
        proposals,
        threads
      });
    }
  );
};
main().catch(() => exit(log));
