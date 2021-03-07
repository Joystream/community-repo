import { Actor, CreateEntityOperation, EntityId, Entity, OperationType, UpdatePropertyValuesOperation } from "@joystream/types/content-directory";
import { ApiPromise } from "@polkadot/api";
import { u64, Vec } from "@polkadot/types";
import { EventRecord, Extrinsic, Hash, SignedBlock } from "@polkadot/types/interfaces";
import { AnyJson } from "@polkadot/types/types";

interface NewBatch {
  blockHeight: number,
  action: string,
  result: string,
  entityIds: number[],
  classesOfEntityIds: number[],
  signer: string,
  actor: AnyJson
}

interface Removed {
  blockHeight: number,
  action: string,
  entityId: number,
  classOfEntity: number,
  signer: string,
  actor: AnyJson
}

export async function getBatchAction(api: ApiPromise, blockHeight:number, blockHash:Hash, index:number, eventsArray: EventRecord[], result: string): Promise<NewBatch|null> {
  const getBlock = await api.rpc.chain.getBlock(blockHash) as SignedBlock
  const extrinsics = getBlock.block.extrinsics as Vec<Extrinsic>
  for (let n=0; n<extrinsics.length; n++) {
    const extSection = extrinsics[n].method.sectionName
    const extMethod = extrinsics[n].method.methodName
    let extrinscIndex = 0
    if (extSection == "contentDirectory" && extMethod == "transaction") {
      extrinscIndex +=1
      if (index == extrinscIndex) {
        const extrinsic = extrinsics[n]
        const actor = extrinsic.args[0] as Actor
        const entityIds:number[] = []
        const classesOfEntityIds:number[] = []
        const batchOperation:NewBatch = {
          blockHeight,
          action: "",
          result,
          entityIds,
          classesOfEntityIds,
          signer: extrinsic.signer.toString(),
          actor: actor.toHuman()
        }
        const batch = extrinsic.args[1] as Vec<OperationType>
        for (let n=0; n<batch.length; n++) {
          const operationType = batch[n]
          if (operationType.value instanceof CreateEntityOperation) {
            classesOfEntityIds.push(operationType.value.class_id.toNumber())
            if (operationType.value.class_id.toNumber() == 10) {
              batchOperation.action = "Video Upload"
            } else if (operationType.value.class_id.toNumber() == 1) {
              batchOperation.action = "Channel Creation"
            } else {
              batchOperation.action = "Entities created in multiple classes"
            }
          } else if (operationType.value instanceof UpdatePropertyValuesOperation) {
            batchOperation.action = "Updated Entity Properties"
          }
        }
        for (let i=0; i<eventsArray.length-1; i++) {
          const entityId = eventsArray[i].event.data[1]
          if (entityId instanceof u64) {
            if (!batchOperation.entityIds.includes(entityId.toNumber())) {
              batchOperation.entityIds.push(entityId.toNumber())
            }
          }
        }
        return batchOperation
      }
    }
  }
  return null
}

export async function getRemovedAction(api: ApiPromise, blockHeight:number, blockHash:Hash, removIndex: number, event: EventRecord): Promise<Removed|null> {
  const getBlock = await api.rpc.chain.getBlock(blockHash) as SignedBlock
  const extrinsics = getBlock.block.extrinsics as Vec<Extrinsic>
  for (let n=0; n<extrinsics.length; n++) {
    const extSection = extrinsics[n].method.sectionName
    const extMethod = extrinsics[n].method.methodName
    let extrinscIndex = 0
    if (extSection == "contentDirectory" && extMethod == "removeEntity") {
      extrinscIndex +=1
      if (removIndex == extrinscIndex) {
        const extrinsic = extrinsics[n]
        const actor = extrinsic.args[0] as Actor
        let entityId:number = -1
        let classOfEntity:number = -1
        const ent = event.event.data[1]
        if (ent instanceof EntityId) {
          entityId = ent.toNumber()
          const previousBlockHash = await api.rpc.chain.getBlockHash(blockHeight-1) as Hash
          classOfEntity = (await api.query.contentDirectory.entityById.at(previousBlockHash,entityId) as Entity).class_id.toNumber()
        }
        const removedEntity:Removed = {
          blockHeight,
          action: "Entity removed",
          entityId,
          classOfEntity,
          signer: extrinsic.signer.toString(),
          actor: actor.toHuman()
        }
        return removedEntity
      }
    }
  }
  return null
}