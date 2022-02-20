import { ApiPromise } from "@polkadot/api";
import { Vec } from "@polkadot/types";
import {AccountId, EventRecord, Extrinsic, Hash} from "@polkadot/types/interfaces";
import { SignedBlock} from '@polkadot/types/interfaces';
import { AnyJson } from "@polkadot/types/types";

interface ActionData {
  blockHeight: number,
  action: string,
  entityId: number,
  signer: string,
  actor: AnyJson
}

export async function getChangeAction(api: ApiPromise, method: string, blockHeight:number, blockHash:Hash, eventIndex: number, event: EventRecord): Promise<ActionData|null> {
  const getBlock = await api.rpc.chain.getBlock(blockHash) as SignedBlock
  const extrinsics = getBlock.block.extrinsics as Vec<Extrinsic>
  for (let n=0; n<extrinsics.length; n++) {
    const extSection = extrinsics[n].method.section
    const extMethod = extrinsics[n].method.method
    let extrinscIndex = 0
    console.log(`Extrinsics section=${extSection}, Event method=${extMethod}`)
    if (extSection == "content" && extMethod == method) {
      extrinscIndex +=1
      if (eventIndex == extrinscIndex) {
        const extrinsic = extrinsics[n]
        const actor = extrinsic.args[0] as AccountId
        const ent = event.event.data[1]
        let entityId:number = +(ent.toString())
        const video:ActionData = {
          blockHeight,
          action: method,
          entityId,
          signer: extrinsic.signer.toString(),
          actor: actor.toHuman()
        }
        return video
      }
    }
  }
  return null
}