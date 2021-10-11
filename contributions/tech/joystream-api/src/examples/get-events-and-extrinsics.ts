import { WsProvider, ApiPromise } from "@polkadot/api";
import { types } from "@joystream/types";
import { Vec } from "@polkadot/types";
import { EventRecord, Extrinsic, SignedBlock } from "@polkadot/types/interfaces";

async function main() {
    // Initialise the provider to connect to the local node
    const provider = new WsProvider('ws://127.0.0.1:9944');

    //If you want to play around on our staging network, go ahead and connect to this staging network instead.
    //const provider = new WsProvider('wss://testnet-rpc-2-singapore.joystream.org');

    // Create the API and wait until ready
    const api = await ApiPromise.create({ provider, types })

    // get all extrinsic and event types in a range of blocks (only works for last 200 blocks unless you are querying an archival node)
    // will take a loooong time if you check too many blocks :)
    const firstBlock = 800000
    const lastBlock = 801000
    const eventTypes:string[] = []
    const extrinsicTypes: string[] = []
    for (let blockHeight=firstBlock; blockHeight<lastBlock; blockHeight++) {
      const blockHash = await api.rpc.chain.getBlockHash(blockHeight)
      const events = await api.query.system.events.at(blockHash) as Vec<EventRecord>;
      const getBlock = await api.rpc.chain.getBlock(blockHash) as SignedBlock
      const extrinsics = getBlock.block.extrinsics as Vec<Extrinsic>
      for (let { event } of events) {
        const section = event.section
        const method = event.method
        const eventType = section+`:`+method
        if (!eventTypes.includes(eventType)) {
          eventTypes.push(eventType)
        }
      }
      for (let i=0; i<extrinsics.length; i++) {
        const section = extrinsics[i].method.section
        const method = extrinsics[i].method.method
        const extrinsicType = section+`:`+method
        if (!extrinsicTypes.includes(extrinsicType)) {
          extrinsicTypes.push(extrinsicType)
        }
      }
    }
    console.log("number of unique event types in range:",eventTypes.length)
    console.log("list of the unique event types in range:")
    console.log(JSON.stringify(eventTypes, null, 4))

    console.log("")

    console.log("number of unique extrinsic types in range",extrinsicTypes.length)
    console.log("list of the unique extrinsic types in range:")
    console.log(JSON.stringify(extrinsicTypes, null, 4))
    
    api.disconnect()
}

main()

