import { ApiPromise } from "@polkadot/api";
import { Option, Vec } from "@polkadot/types";
import { AccountId, Balance } from "@polkadot/types/interfaces";
import { Hash } from "@polkadot/types/interfaces";
import { Mint, MintId } from "@joystream/types/mint";
import { Stake } from "@joystream/types/stake";
import { WorkerOf } from "@joystream/types/augment-codec/all";
import { Bounty, CacheEvent, MintStatistics, WorkerReward } from "../types";
import {
  RewardRelationship,
  RewardRelationshipId,
} from "@joystream/types/recurring-rewards";

import { getPercent, getTotalMinted, momentToString } from "./";
import {
  getBlock,
  getBlockHash,
  getMint,
  getNextWorker,
  getWorker,
  getWorkerReward,
  getStake,
  getValidators,
  getValidatorCount,
} from "./api";

export const filterMethods = {
  getBurnedTokens: ({ section, method }: CacheEvent) =>
    section === "balances" && method === "Transfer",
  newValidatorsRewards: ({ section, method }: CacheEvent) =>
    section === "staking" && method === "Reward",
};

export const getWorkerRewards = async (
  api: ApiPromise,
  group: string,
  hash: Hash
): Promise<WorkerReward[]> => {
  let workers = Array<WorkerReward>();
  const nextWorkerId = await getNextWorker(api, group, hash);

  for (let id = 0; id < nextWorkerId; ++id) {
    const worker: WorkerOf = await getWorker(api, group, hash, id);

    // TODO workers fired before the end will be missed out
    if (!worker.is_active) continue;
    let stake: Stake, reward: RewardRelationship;

    if (worker.role_stake_profile.isSome) {
      const roleStakeProfile = worker.role_stake_profile.unwrap();
      stake = await getStake(api, roleStakeProfile.stake_id);
    }

    if (worker.reward_relationship.isSome) {
      // TODO changing salaries are not reflected
      const rewardId: RewardRelationshipId = worker.reward_relationship.unwrap();
      reward = await getWorkerReward(api, hash, rewardId);
    }
    workers.push({ id, stake, reward });
  }
  return workers;
};

export const getBurnedTokens = (
  burnAddress: string,
  blocks: [number, CacheEvent[]][]
): number => {
  let tokensBurned = 0;
  blocks.forEach(([key, transfers]) =>
    transfers.forEach((transfer) => {
      let receiver = transfer.data[1] as AccountId;
      let amount = transfer.data[2] as Balance;
      if (receiver.toString() === burnAddress) tokensBurned = Number(amount);
    })
  );
  return tokensBurned;
};

export const getMintInfo = async (
  api: ApiPromise,
  mintId: MintId,
  startHash: Hash,
  endHash: Hash
): Promise<MintStatistics> => {
  const startMint: Mint = await getMint(api, startHash, mintId);
  const endMint: Mint = await getMint(api, endHash, mintId);
  let stats = new MintStatistics();
  stats.startMinted = getTotalMinted(startMint);
  stats.endMinted = getTotalMinted(endMint);
  stats.diffMinted = stats.endMinted - stats.startMinted;
  stats.percMinted = getPercent(stats.startMinted, stats.endMinted);
  return stats;
};

export const getValidatorsRewards = (
  blocks: [number, CacheEvent[]][]
): number => {
  let newValidatorRewards = 0;
  blocks.forEach(([key, validatorRewards]) =>
    validatorRewards.forEach(
      (reward: CacheEvent) => (newValidatorRewards += Number(reward.data[1]))
    )
  );
  return newValidatorRewards;
};

export const getActiveValidators = async (
  api: ApiPromise,
  hash: Hash,
  searchPreviousBlocks: boolean = false
): Promise<AccountId[]> => {
  const block = await getBlock(api, hash);
  let currentBlockNr = block.block.header.number.toNumber();
  let activeValidators: AccountId[];
  do {
    const hash: Hash = await getBlockHash(api, currentBlockNr);
    const validators: Option<Vec<AccountId>> = await getValidators(api, hash);
    if (!validators.isEmpty) {
      let max = await getValidatorCount(api, hash);
      activeValidators = Array.from(validators.unwrap()).slice(0, max);
    }

    if (searchPreviousBlocks) --currentBlockNr;
    else ++currentBlockNr;
  } while (activeValidators == undefined);
  return activeValidators;
};
