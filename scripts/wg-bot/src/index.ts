import { connectUpstream } from './joystream/ws'
import { ApiPromise } from '@polkadot/api'
import { BlockHash, EventRecord, Header } from '@polkadot/types/interfaces'

;(async () => {
  
    connectUpstream().then( async (api: any) => {
        api.rpc.chain.subscribeNewHeads(async (header: Header) => {
          const id = +header.number
          const hash = await getBlockHash(api, id)
          const blockEvents = await api.query.system.events.at(hash)
          blockEvents.forEach(async ({ event }: EventRecord) => {
            let { section, method, data } = event
            console.log(section);
            console.log(method);
          });
        })  
      })
})()

const getBlockHash = (api: ApiPromise, blockId: number) =>
  api.rpc.chain.getBlockHash(blockId).then((hash: BlockHash) => hash.toString())
