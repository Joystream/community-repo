import { connectUpstream } from './joystream/ws'
import { ApiPromise } from '@polkadot/api'
import { BlockHash, EventRecord, Header } from '@polkadot/types/interfaces'
import { wgEvents, workingGroups } from './config'
import { AugmentedEvents } from '@polkadot/api/types/events'

const TYPES_AVAILABLE = [] as const
type ApiType = typeof TYPES_AVAILABLE[number]

;(async () => {
  
    connectUpstream().then( async (api: any) => {
        api.rpc.chain.subscribeNewHeads(async (header: Header) => {
          const id = +header.number
          const hash = await getBlockHash(api, id)
          const blockEvents = await api.query.system.events.at(hash)
          blockEvents.forEach(async ({ event }: EventRecord) => {
            let { section, method, data } = event
            if (wgEvents.includes(method) && Object.keys(workingGroups).includes(section)) {
                console.log(section);
                console.log(method);
                console.log(data);
            }
          });
        })  
      })
})()

const getBlockHash = (api: ApiPromise, blockId: number) =>
  api.rpc.chain.getBlockHash(blockId).then((hash: BlockHash) => hash.toString())
