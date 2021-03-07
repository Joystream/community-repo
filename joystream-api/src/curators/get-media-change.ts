import { WsProvider, ApiPromise } from "@polkadot/api";
import { types } from "@joystream/types";
import {  Vec } from "@polkadot/types";
import { EventRecord, Hash } from "@polkadot/types/interfaces";
import { getBatchAction, getRemovedAction } from "./functions";


async function main() {
    // Initialise the provider to connect to the local node
    const provider = new WsProvider('wss://staging-2.joystream.app/staging/rpc:9944');

    const api = await ApiPromise.create({ provider, types })
    const firstBlock = 1292265 // first block after the upgrade to the new Content Directory
    const lastBlock = 2332000
    // note that with this blockheight, you will see a lot of jsgenesis initialization and uploads
    
    
    for (let blockHeight=firstBlock; blockHeight<lastBlock; blockHeight++) {
      const blockHash = await api.rpc.chain.getBlockHash(blockHeight) as Hash
      const events = await api.query.system.events.at(blockHash) as Vec<EventRecord>;
      const eventsArray: EventRecord[] = []
      let index = 0
      let removIndex = 0
      for (let i=0; i<events.length; i++) {
        const section = events[i].event.section
        const method = events[i].event.method
        if (section == "contentDirectory") {
          eventsArray.push(events[i])
          if (method == "EntityCreated") {
          }
          if (method == "EntitySchemaSupportAdded") {
          }
          if (method == "EntityPropertyValuesUpdated") {
          }
          if (method == "EntityRemoved") {
            removIndex+=1
            const cdChange = await getRemovedAction(api, blockHeight, blockHash, removIndex, events[i])
            console.log("Change",JSON.stringify(cdChange, null, 4))
          }
          if (method == "TransactionCompleted") {
            index+=1
            const cdChange = await getBatchAction(api, blockHeight, blockHash, index, eventsArray, method)
            console.log("Change",JSON.stringify(cdChange, null, 4))
          }
          if (method == "TransactionFailed") {
            index+=1
            const cdChange = await getBatchAction(api, blockHeight, blockHash, index, eventsArray, method)
            console.log("Change",JSON.stringify(cdChange, null, 4))
          }
        }
      }
    }
    
  api.disconnect()
}

main()

