import TelegramBot from "node-telegram-bot-api";
import { token, chatid, heartbeat, wsLocation } from "../config";

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

const main = async () => {
  const provider = new WsProvider(wsLocation);
  const api = await ApiPromise.create({ provider, types });
  await api.isReady;

  const [chain, node, version] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);

  let council: Council = { round: 0, last: "" };
  let blocks: Block[] = [];
  let lastEra = 0;
  let lastBlock: Block = {
    id: 0,
    duration: 6000,
    timestamp: startTime,
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

  const cats: number[] = [0, 0];
  const channels: number[] = [0, 0];
  const posts: number[] = [0, 0];
  const threads: number[] = [0, 0];
  let proposals: Proposals = { last: 0, current: 0, active: [], executing: [] };

  if (opts.channel) channels[0] = await get.currentChannelId(api);

  if (opts.forum) {
    posts[0] = await get.currentPostId(api);
    cats[0] = await get.currentCategoryId(api);
    threads[0] = await get.currentThreadId(api);
  }

  if (opts.proposals) {
    proposals.last = await get.proposalCount(api);
    proposals.active = await get.activeProposals(api, proposals.last);
  }

  const getReward = async (era: number) =>
    Number(await api.query.staking.erasValidatorReward(era));

  log(`Subscribed to ${chain} on ${node} v${version}`);
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
        vals = Number(await api.query.staking.validatorCount());
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
      if (timestamp > startTime + heartbeat) {
        const time = passedTime(startTime, timestamp);
        blocks = announce.heartbeat(api, blocks, time, proposals, sendMessage);
        startTime = block.timestamp;
      }

      // announcements
      if (opts.council && block.id > lastBlock.id)
        council = await announce.council(api, council, block.id, sendMessage);

      if (opts.channel) {
        channels[1] = await get.currentChannelId(api);
        if (channels[1] > channels[0])
          channels[0] = await announce.channels(api, channels, sendMessage);
      }

      if (opts.proposals) {
        proposals.current = await get.proposalCount(api);
        if (
          proposals.current > proposals.last ||
          proposals.active ||
          proposals.executing
        )
          // TODO do not refetch each active/executing proposal on every block
          proposals = await announce.proposals(api, proposals, id, sendMessage);
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
        threads,
      });
    }
  );
};
main().catch(() => exit(log));
