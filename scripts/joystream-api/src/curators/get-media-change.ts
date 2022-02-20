import { WsProvider, ApiPromise } from "@polkadot/api";
import { types } from "@joystream/types";
import { Vec } from "@polkadot/types";
import { EventRecord, Hash } from "@polkadot/types/interfaces";
import { getChangeAction } from "./functions";

async function main() {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider("ws://127.0.0.1:9944");

  const api = await ApiPromise.create({ provider, types });
  const firstBlock = 4191207; // first block after the upgrade to the new Content Directory
  const lastBlock = 4551590;
  // note that with this blockheight, you will see a lot of jsgenesis initialization and uploads

  for (let blockHeight = firstBlock; blockHeight < lastBlock; blockHeight++) {
    const blockHash = (await api.rpc.chain.getBlockHash(blockHeight)) as Hash;
    try {
      const events = (await api.query.system.events.at(
          blockHash
      )) as Vec<EventRecord>;
      const eventsArray: EventRecord[] = [];
      let eventIndex = 0;
      for (let i = 0; i < events.length; i++) {
        const section = events[i].event.section;
        const method = events[i].event.method;
        if (section == "content") {
          console.log(`Event section=${section}, Event method=${method}`);
          eventsArray.push(events[i]);
          if (method == "VideoCreated") {
            eventIndex += 1;
            const cdChange = await getChangeAction(
                api,
                "createVideo",
                blockHeight,
                blockHash,
                eventIndex,
                events[i]
            );
            console.log("Change", JSON.stringify(cdChange, null, 4));
          }
          if (method == "VideoUpdated") {
            eventIndex += 1;
            const cdChange = await getChangeAction(
                api,
                "updateVideo",
                blockHeight,
                blockHash,
                eventIndex,
                events[i]
            );
            console.log("Change", JSON.stringify(cdChange, null, 4));
          }
          if (method == "VideoDeleted") {
            eventIndex += 1;
            const cdChange = await getChangeAction(
                api,
                "deleteVideo",
                blockHeight,
                blockHash,
                eventIndex,
                events[i]
            );
            console.log("Change", JSON.stringify(cdChange, null, 4));
          }
          if (method == "ChannelCreated") {
            eventIndex += 1;
            const cdChange = await getChangeAction(
                api,
                "createChannel",
                blockHeight,
                blockHash,
                eventIndex,
                events[i]
            );
            console.log("Change", JSON.stringify(cdChange, null, 4));
          }
          if (method == "ChannelUpdated") {
            eventIndex += 1;
            const cdChange = await getChangeAction(
                api,
                "updateChannel",
                blockHeight,
                blockHash,
                eventIndex,
                events[i]
            );
            console.log("Change", JSON.stringify(cdChange, null, 4));
          }
        }
      }
    }catch (e) {
        console.error(`Unable to get events at block: ${blockHeight}`)
    }
  }
  await api.disconnect();
}


main();
