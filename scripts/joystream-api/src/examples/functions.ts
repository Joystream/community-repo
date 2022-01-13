import { MemberId, Membership } from "@joystream/types/members";
import { ApiPromise } from "@polkadot/api";
import { Vec } from "@polkadot/types";
import { AccountId } from "@polkadot/types/interfaces";
import { Hash } from "@polkadot/types/interfaces";
import { Participant } from './interfaces';

export async function getParticipant(api: ApiPromise, accountId: AccountId): Promise<Participant> {
  let memberId = -1
  const isMemberRoot = await api.query.members.memberIdsByRootAccountId(accountId) as Vec<MemberId>
  const isMemberCtrl = await api.query.members.memberIdsByControllerAccountId(accountId) as Vec<MemberId>
  if (isMemberRoot[0] === isMemberCtrl[0] && isMemberRoot.length == 1 && isMemberCtrl.length == 1) {
    console.log("true")
    memberId = isMemberRoot[0].toNumber()
    const handle = (await api.query.members.membershipById(isMemberRoot[0]) as Membership).handle.toString()
    const partipant: Participant = {
      memberId,
      handle,
      accountId:accountId.toString(),
    }
    return partipant
  } else {
    const memberIds: number[] = []
    const handle: string[] = []
    for (let ids of (isMemberRoot && isMemberCtrl)) {
      if (!memberIds.includes(ids.toNumber())) {
        memberIds.push(ids.toNumber())
        handle.push((await api.query.members.membershipById(ids) as Membership).handle.toString())
      }
    }
    if (memberIds.length === 1) {
      
      const partipant: Participant = {
        memberId: memberIds[0],
        handle,
        accountId:accountId.toString(),
      }
      return partipant
    } else {
      const partipant: Participant = {
        memberId: memberIds,
        handle,
        accountId:accountId.toString(),
      }
      return partipant
    }
  }
}

export async function getParticipantAt(api: ApiPromise, accountId: AccountId, blockHash: Hash): Promise<Participant> {
  let memberId = -1
  const isMemberRoot = await api.query.members.memberIdsByRootAccountId.at(blockHash,accountId) as Vec<MemberId>
  const isMemberCtrl = await api.query.members.memberIdsByControllerAccountId.at(blockHash,accountId) as Vec<MemberId>
  if (isMemberRoot[0].toNumber() === isMemberCtrl[0].toNumber() && isMemberRoot.length == 1 && isMemberCtrl.length == 1) {
    memberId = isMemberRoot[0].toNumber()
    const handle = (await api.query.members.membershipById.at(blockHash,isMemberRoot[0]) as Membership).handle.toString()
    const partipant: Participant = {
      memberId,
      handle,
      accountId:accountId.toString(),
    }
    return partipant
  } else {
    const memberIds: number[] = []
    const handle: string[] = []
    for (let ids of (isMemberRoot && isMemberCtrl)) {
      if (!memberIds.includes(ids.toNumber())) {
        memberIds.push(ids.toNumber())
        handle.push((await api.query.members.membershipById.at(blockHash,ids) as Membership).handle.toString())
      }
    }
    if (memberIds.length === 1) {
      const partipant: Participant = {
        memberId: memberIds[0],
        handle : handle[0],
        accountId:accountId.toString(),
      }
      return partipant
    } else {
      const partipant: Participant = {
        memberId: memberIds,
        handle,
        accountId:accountId.toString(),
      }
      return partipant
    }
  }
}
