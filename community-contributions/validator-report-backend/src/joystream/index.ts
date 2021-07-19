import {
  Account,
  Block,
  Era,
  Event,
  ValidatorStats
} from '../db/models'

import moment from 'moment'
import chalk from 'chalk'

import { HeaderExtended } from '@polkadot/api-derive/type/types';
import {
  Api,
} from '../types'


import {
  AccountId,
  Moment,
  EventRecord,
  BlockHash,
} from '@polkadot/types/interfaces'
import { Vec } from '@polkadot/types'
import { ApiPromise } from '@polkadot/api';

let queue: any[] = []
let processing = ''

export const processNext = async () => {
  const task = queue.shift()
  if (!task) return
  await task()
  processNext()
}

const accounts = new Map<string, any>()

const getBlockHash = (api: ApiPromise, blockId: number) =>
  api.rpc.chain.getBlockHash(blockId).then((hash: BlockHash) => hash.toString())

const getEraAtHash = (api: ApiPromise, hash: string) =>
  api.query.staking.activeEra
    .at(hash)
    .then((era) => era.unwrap().index.toNumber())

const getAccount = async (address: string) => {
    if (accounts.get(address)) {
      return accounts.get(address)
    } else {
      const account = (await Account.findOrCreate({where: {key : address}}))[0].get({plain: true})
      accounts.set(address, account)
      return account
    }
}

const getEraAtBlock = async (api: ApiPromise, block: number) =>
  getEraAtHash(api, await getBlockHash(api, block))

const getTimestamp = async (api: ApiPromise, hash?: string) => {
  const timestamp = hash
    ? await api.query.timestamp.now.at(hash)
    : await api.query.timestamp.now()
  return moment.utc(timestamp.toNumber()).valueOf()
}

export const addBlock = async (
  api: ApiPromise,
  header: { number: number; author: string }
) => {
  const id = +header.number
  const exists = await Block.findByPk(id) 
  if (exists) {
    console.error(`TODO handle fork`, String(header.author))
  }

  await processBlock(api, id)
  
  // logging
  //const handle = await getHandleOrKey(api, key)
  const q = queue.length ? chalk.green(` [${queue.length}:${processing}]`) : ''
  console.log(`[Joystream] block ${id} ${q}`)
}

const processBlock = async (api: ApiPromise, id: number) => {

  const exists = (await Block.findByPk(id))
  if (exists) return exists.get({plain: true})

  processing = `block ${id}`
  console.log(processing)

  const previousBlockModel = (await Block.findByPk(id - 1))
  let lastBlockTimestamp = 0
  let lastBlockHash = ''
  let lastEraId = 0
  if (previousBlockModel) {
    const previousDbBlock = previousBlockModel.get({plain: true})
    lastBlockTimestamp = previousDbBlock.timestamp.getTime();
    lastBlockHash = previousDbBlock.hash
    lastEraId = previousDbBlock.eraId
  } else {
    lastBlockHash = await getBlockHash(api, id - 1);
    lastBlockTimestamp = await getTimestamp(api, lastBlockHash);
    lastEraId = await getEraAtHash(api, lastBlockHash)
  }
  const hash = await getBlockHash(api, id)
  const currentBlockTimestamp = await getTimestamp(api, hash)
  const extendedHeader = await api.derive.chain.getHeader(hash) as HeaderExtended

  const eraId = await getEraAtHash(api, hash)
  let chainTime
  if(eraId - lastEraId === 1) {
    console.log('This block marks the start of new era. Updating the previous era stats')
    const {total, individual} = await api.query.staking.erasRewardPoints.at(lastBlockHash, lastEraId)
    const slots = (await api.query.staking.validatorCount.at(lastBlockHash)).toNumber()
    const newEraTime = (await api.query.timestamp.now.at(hash)) as Moment
    chainTime = moment(newEraTime.toNumber())

    await Era.upsert({ // update stats for previous era
      id: lastEraId,
      slots: slots,
      stake: await api.query.staking.erasTotalStake.at(hash, lastEraId),
      eraPoints: total
    })


    const validatorStats = await ValidatorStats.findAll({where: {eraId: lastEraId}, include: [Account]})
    for (let stat of validatorStats) {
      const validatorStats = stat.get({plain: true})
      const validatorAccount = validatorStats.account.key
      console.log(validatorAccount)
      let pointVal = 0;
      for(const [key, value] of individual.entries()) {
        if(key == validatorAccount) {
          pointVal = value.toNumber()
          break
        }
      }

      const {total, own} = await api.query.staking.erasStakers.at(lastBlockHash, lastEraId, validatorAccount)

      ValidatorStats.upsert({
        eraId: lastEraId, 
        accountId: validatorStats.accountId, 
        stake_own: own, 
        stake_total: total, 
        points: pointVal,
        commission: (await api.query.staking.erasValidatorPrefs.at(lastBlockHash, eraId, validatorAccount)).commission.toNumber() / 10000000
      })
    }
  
  }
  const [era, created] = await Era.upsert({ // add the new are with just a timestamp of its first block
    id: eraId,
    timestamp: chainTime
  }, {returning: true})

  const block = await Block.upsert({
    id: id, 
    hash: hash,
    timestamp: moment.utc(currentBlockTimestamp).toDate(),
    blocktime: (currentBlockTimestamp - lastBlockTimestamp),
    eraId: era.get({plain: true}).id,
    validatorId: (await getAccount(extendedHeader.author.toHuman())).id
  }, {returning: true})

  await importEraAtBlock(api, id, hash, era)
  processEvents(api, id, eraId, hash)

  return block
}

export const addBlockRange = async (
  api: ApiPromise,
  startBlock: number,
  endBlock: number
) => {
  for (let block = startBlock; block <= endBlock; block++) {
    queue.push(() => processBlock(api, block))
  }
}

const processEvents = async (api: ApiPromise, blockId: number, eraId: number, hash: string) => {
  processing = `events block ${blockId}`
  try {
    const blockEvents = await api.query.system.events.at(hash)
    blockEvents.forEach(async ({ event }: EventRecord) => {
      let { section, method, data } = event
      if(section == 'staking' && method == 'Reward') {
        const addressCredited = data[0].toString()
        await Event.create({ blockId, section, method, data: JSON.stringify(data) })
        Account.findOne(
          {
            where: {
              key: addressCredited
            }
          }
        ).then(async (beneficiaryAccount: Account) => {
          let address = ''
          if (beneficiaryAccount == null) {
            address = (await Account.create({key: addressCredited}, {returning: true})).get({plain: true}).id
          } else {
            address = beneficiaryAccount.get({plain: true}).id
          }
          await ValidatorStats.upsert(
            {
              accountId: address, 
              eraId: eraId,
              rewards: Number(data[1])
            }
          )  
        })
      }
    })
  } catch (e) {
    console.log(`failed to fetch events for block  ${blockId} ${hash}`)
  }
}


const importEraAtBlock = async (api: Api, blockId: number, hash: string, eraModel: Era) => {
  const era = eraModel.get({plain: true})
  if (era.active) return
  const id = era.id
  processing = `era ${id}`
  try {
    const snapshotValidators = await api.query.staking.snapshotValidators.at(hash);
    if (!snapshotValidators.isEmpty) {
      console.log(`[Joystream] Found validator info for era ${id}`)

      const validators = snapshotValidators.unwrap() as Vec<AccountId>;
      const validatorCount = validators.length
  
      for (let validator of validators) {
        // create stub records, which will be populated with stats on the first block of the next era
        ValidatorStats.upsert({
          eraId: id, 
          accountId: (await getAccount(validator.toHuman())).id, 
        })
      }
  
      const slots = (await api.query.staking.validatorCount.at(hash)).toNumber()
  
      await Era.upsert({
        id: id,
        allValidators: validatorCount,
        waitingValidators: validatorCount > slots ? validatorCount - slots : 0,
      })  
    }

    const snapshotNominators = await api.query.staking.snapshotNominators.at(hash);
    if (!snapshotNominators.isEmpty) {
      const nominators = snapshotNominators.unwrap() as Vec<AccountId>;
      await Era.upsert({
        id: id,
        nominators: nominators.length
      })  
    }
    return id;

  } catch (e) {
    console.error(`import era ${blockId} ${hash}`, e)
  }
}


module.exports = { addBlock, addBlockRange, processNext }
