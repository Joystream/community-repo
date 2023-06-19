//import TelegramBot from "node-telegram-bot-api";
import * as announce from "./announcements";
import { wsLocation } from "../config";
import { getCouncilHandles } from "./util";

// types
import { Council, Send } from "./types";
import { types } from "@joystream/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Header } from "@polkadot/types/interfaces";

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

  let council: Council = { round: 0, last: "", seats: [] };
  council.seats = await getCouncilHandles(api);
  let lastBlock: number = 0;

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
    }
  );
};

main();
