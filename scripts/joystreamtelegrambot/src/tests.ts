//import TelegramBot from "node-telegram-bot-api";
import { wsLocation } from "../config";

// types
import { Council, Send } from "./types";
import { types } from "@joystream/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Header } from "@polkadot/types/interfaces";

// functions
import * as announce from "./lib/announcements";
import * as get from "./lib/getters";

const log = (msg: string) => console.log(msg);
const sendMessage: Send = (msg, channel) => console.log(msg.discord);
const nochan = {};

const main = async () => {
  const provider = new WsProvider(wsLocation);
  const api = await ApiPromise.create({ provider, types });
  await api.isReady;

  const [chain, node, version] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);
  log(`Connected to ${chain} on ${node} v${version}`);

  let council: Council = { round: 0, last: "" };
  let lastBlock: number = 0;
  let categories = [0, 0];
  let posts = [0, 0];
  let channels = [0, 0];

  const unsubscribe = await api.rpc.chain.subscribeNewHeads(
    async (block: Header): Promise<void> => {
      // council
      if (lastBlock > 0) process.exit;
      lastBlock = block.number.toNumber();
      const currentBlock = block.number.toNumber();
      log("current council");
      council = await announce.council(
        api,
        council,
        currentBlock,
        sendMessage,
        nochan
      );
      lastBlock = currentBlock;

      log("first category");
      announce.categories(api, categories, sendMessage, nochan);

      log("last category");
      categories[1] = await get.currentCategoryId(api);
      categories[0] = categories[1] - 1;
      announce.categories(api, categories, sendMessage, nochan);

      log("first post");
      announce.posts(api, posts, sendMessage, nochan);

      log("last post");
      posts[1] = await get.currentPostId(api);
      posts[0] = posts[1] - 1;
      announce.posts(api, posts, sendMessage, nochan);
    }
  );
};

main();
