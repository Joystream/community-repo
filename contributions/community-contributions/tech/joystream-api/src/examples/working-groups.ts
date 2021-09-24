import { WsProvider, ApiPromise } from "@polkadot/api";
import { types } from "@joystream/types";
import { Worker, WorkerId } from "@joystream/types/working-group";
import { Null, Vec } from "@polkadot/types";
import { RewardRelationship } from "@joystream/types/recurring-rewards";
import { Stake, StakingStatus, Staked } from "@joystream/types/stake";
import { ApplicationOf, WorkerOf } from "@joystream/types/augment-codec/all";

interface WorkingGroupStake {
  stakeId: number,
  roleStake: number,
}

interface WorkingGroupReward {
  rewardRelationshipId: number,
  rewardSize: number,
  rewardInterval: number,
  rewardPerWeek: number,
  totalEarned: number,
  totalMissed: number,
}


interface ContentCurator {
  curatorId: number,
  memberId: number,
  roleAccount: string,
  applicationId: number,
  stakeProfile?: WorkingGroupStake,
  rewardRelationship?: WorkingGroupReward, 
}


interface StorageProvider {
  workerId: number,
  memberId: number,
  roleAccount: string,
  stakeProfile?: WorkingGroupStake,
  rewardRelationship?: WorkingGroupReward, 
}

async function main() {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider('ws://127.0.0.1:9944');
  
  //If you want to play around on our staging network, go ahead and connect to this staging network instead.
  //const provider = new WsProvider('wss://testnet-rpc-2-singapore.joystream.org');
  
  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider, types })

  const storageProviders: StorageProvider[] = []
  const contentCurators: ContentCurator[] = []

  // get all active storage workers
  const storageWorkerKeys = await api.query.storageWorkingGroup.workerById.keys()
  const storageWorkerIds = storageWorkerKeys.map(({ args: [workerId]}) => workerId) as Vec<WorkerId>
  storageWorkerIds.sort((a,b) => a.toNumber()-b.toNumber())
  console.log('all storageWorkerIds:', storageWorkerIds.join(', '));
  for (let key of storageWorkerIds) {
    const worker = await api.query.storageWorkingGroup.workerById(key) as Worker
    //console.log("worker",worker.toHuman())
    const storageProvider: StorageProvider = {
      workerId: key.toNumber(),
      memberId: worker.member_id.toNumber(),
      roleAccount: worker.role_account_id.toString(),
    }
    if (worker.reward_relationship.isSome) {
      const rewardRelationshipId = worker.reward_relationship.unwrap()
      const rewardRelationship = await api.query.recurringRewards.rewardRelationships(rewardRelationshipId) as RewardRelationship
      //console.log("rewardRelationship",rewardRelationship.toHuman())
      let rewardInterval = 0
      let rewardPerWeek = 0
      if (!(rewardRelationship.payout_interval.value instanceof Null)) {
        rewardInterval = rewardRelationship.payout_interval.unwrap().toNumber()
        rewardPerWeek = rewardRelationship.amount_per_payout.toNumber()*100800/rewardInterval
      }
      storageProvider.rewardRelationship = {
        rewardRelationshipId: rewardRelationshipId.toNumber(),
        rewardSize: rewardRelationship.amount_per_payout.toNumber(),
        rewardInterval,
        rewardPerWeek,
        totalEarned: rewardRelationship.total_reward_received.toNumber(),
        totalMissed: rewardRelationship.total_reward_missed.toNumber(),
      }
    }
    if (worker.role_stake_profile.isSome && !(worker.role_stake_profile instanceof Null)) {
      const stake = worker.role_stake_profile.unwrap()
      const workerStake = await api.query.stake.stakes(stake.stake_id) as Stake
      //console.log("workerStake",workerStake.toHuman())
      const stakingStatus = (workerStake.staking_status as StakingStatus).value
      if (stakingStatus instanceof Staked) {
        storageProvider.stakeProfile = {
          stakeId: stake.stake_id.toNumber(),
          roleStake: stakingStatus.staked_amount.toNumber(),
        }
      }
    }
    storageProviders.push(storageProvider)
  }

  // get all active content curators
  for (let i = 0; i < +(await api.query.contentDirectoryWorkingGroup.activeWorkerCount()).toString(); i++) {
    const curator = await api.query.contentDirectoryWorkingGroup.workerById(i) as WorkerOf
    // filter out inactive
    if (curator.is_active) {
      const nextApplicationId = +(await api.query.contentDirectoryWorkingGroup.nextApplicationId()).toString()
      let applicationId = {} as ApplicationOf
      for (let j = 0; j < nextApplicationId - 1; j++) {
        const appId = await api.query.contentDirectoryWorkingGroup.applicationById(j) as ApplicationOf
        if(appId.member_id?.toNumber() == curator.member_id?.toNumber()) {
          applicationId = appId
          break
        }
      }
      
      const contentCurator: ContentCurator = {
        curatorId: i,
        memberId: applicationId?.member_id.toNumber(),
        roleAccount: curator.role_account_id.toString(),
        applicationId: applicationId?.application_id.toNumber(),
      }
      if (curator.reward_relationship.isSome) {
        const rewardRelationshipId = curator.reward_relationship.unwrap()
        const rewardRelationship = await api.query.recurringRewards.rewardRelationships(rewardRelationshipId) as RewardRelationship
        //console.log("rewardRelationship",rewardRelationship.toHuman())
        let rewardInterval = 0
        let rewardPerWeek = 0
        if (!(rewardRelationship.payout_interval.value instanceof Null)) {
          rewardInterval = rewardRelationship.payout_interval.unwrap().toNumber()
          rewardPerWeek = rewardRelationship.amount_per_payout.toNumber()*100800/rewardInterval
        }
        contentCurator.rewardRelationship = {
          rewardRelationshipId: rewardRelationshipId.toNumber(),
          rewardSize: rewardRelationship.amount_per_payout.toNumber(),
          rewardInterval,
          rewardPerWeek,
          totalEarned: rewardRelationship.total_reward_received.toNumber(),
          totalMissed: rewardRelationship.total_reward_missed.toNumber(),
        }
      }
      if (curator.role_stake_profile.isSome && !(curator.role_stake_profile instanceof Null)) {
        const stake = curator.role_stake_profile.unwrap()
        const workerStake = await api.query.stake.stakes(stake.stake_id) as Stake
        //console.log("workerStake",workerStake.toHuman())
        const stakingStatus = (workerStake.staking_status as StakingStatus).value
        if (stakingStatus instanceof Staked) {
          contentCurator.stakeProfile = {
            stakeId: stake.stake_id.toNumber(),
            roleStake: stakingStatus.staked_amount.toNumber(),
          }
        }
      }
      contentCurators.push(contentCurator)
    }
  }
 console.log("storageProviders",JSON.stringify(storageProviders, null, 4))

 console.log("contentCurators",JSON.stringify(contentCurators, null, 4))





  api.disconnect()
}

main()