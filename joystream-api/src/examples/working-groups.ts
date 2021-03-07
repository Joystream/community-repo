import { WsProvider, ApiPromise } from "@polkadot/api";
import { types } from "@joystream/types";
import { Worker, WorkerId } from "@joystream/types/working-group";
import { Null, Vec } from "@polkadot/types";
import { Curator, CuratorApplication, CuratorApplicationId, CuratorId, CuratorInduction } from "@joystream/types/content-working-group";
import { RewardRelationship } from "@joystream/types/recurring-rewards";
import { Stake, StakingStatus, Staked } from "@joystream/types/stake";

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
  
  /*
  If you want to play around on our staging network, go ahead and connect to this staging network instead.
  const provider = new WsProvider('wss://alexandria-testing-1.joystream.app/staging/rpc:9944');
  
  There's a bunch of tokens on the account: 5HdYzMVpJv3c4omqwKKr7SpBgzrdRRYBwoNVhJB2Y8xhUbfK,
  with seed: "emotion soul hole loan journey what sport inject dwarf cherry ankle lesson"
  please transfer (what you need only) to your own account, and don't test runtime upgrades :D
  */
  
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
  const contentCuratorKeys = await api.query.contentWorkingGroup.curatorById.keys()
  const contentCuratorIds = contentCuratorKeys.map(({ args: [workerId]}) => workerId) as Vec<CuratorId>
  contentCuratorIds.sort((a,b) => a.toNumber()-b.toNumber())
  console.log('all contentCuratorIds:', contentCuratorIds.join(', '));
  for (let key of contentCuratorIds) {
    const curator = await api.query.contentWorkingGroup.curatorById(key) as Curator
    // filter out inactive
    if (curator.is_active) {
      const curatorApplicationId = (curator.induction as CuratorInduction).curator_application_id as CuratorApplicationId
      const applicationId = await api.query.contentWorkingGroup.curatorApplicationById(curatorApplicationId) as CuratorApplication
      const contentCurator: ContentCurator = {
        curatorId: key.toNumber(),
        memberId: applicationId.member_id.toNumber(),
        roleAccount: curator.role_account.toString(),
        applicationId: applicationId.application_id.toNumber(),
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