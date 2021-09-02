import { ApiPromise } from "@polkadot/api";
import { Option, u32, Vec } from "@polkadot/types";
import type { Codec, Observable } from "@polkadot/types/types";
import {
  AccountId,
  Balance,
  BalanceOf,
  BlockNumber,
  EraIndex,
  EventRecord,
  Hash,
  Moment,
} from "@polkadot/types/interfaces";
import { SignedBlock } from "@polkadot/types/interfaces/runtime";

import { PostId, ThreadId } from "@joystream/types/common";
import { CategoryId } from "@joystream/types/forum";
import { ElectionStake, SealedVote, Seats } from "@joystream/types/council";
import { Mint, MintId } from "@joystream/types/mint";
import { MemberId, Membership } from "@joystream/types/members";
import { WorkerId } from "@joystream/types/working-group";
import { Stake, StakeId } from "@joystream/types/stake";
import {
  RewardRelationship,
  RewardRelationshipId,
} from "@joystream/types/recurring-rewards";

import { Entity, EntityId } from "@joystream/types/content-directory";
import { ContentId, DataObject } from "@joystream/types/media";

import { SpendingParams } from "@joystream/types/proposals";
import { ProposalId, WorkerOf } from "@joystream/types/augment-codec/all";
import { ProposalDetails, ProposalOf } from "@joystream/types/augment/types";

// blocks
export const getBlock = (api: ApiPromise, hash: Hash): Promise<SignedBlock> =>
  api.rpc.chain.getBlock(hash);

export const getBlockHash = (api: ApiPromise, block: number): Promise<Hash> =>
  api.rpc.chain.getBlockHash(block);

export const getTimestamp = (api: ApiPromise, hash: Hash): Promise<Moment> =>
  api.query.timestamp.now.at(hash);

export const getIssuance = (api: ApiPromise, hash: Hash): Promise<Balance> =>
  api.query.balances.totalIssuance.at(hash);

export const getEvents = (
  api: ApiPromise,
  hash: Hash
): Promise<Vec<EventRecord>> => api.query.system.events.at(hash);

export const getEra = (
  api: ApiPromise,
  hash: Hash
): Promise<Option<EraIndex>> => api.query.staking.currentEra.at(hash);

export const getEraStake = async (
  api: ApiPromise,
  hash: Hash,
  era: EraIndex
): Promise<number> =>
  (await api.query.staking.erasTotalStake.at(hash, era)).toNumber();

// council
export const getCouncil = (api: ApiPromise, hash: Hash): Promise<Seats> =>
  api.query.council.activeCouncil.at(hash);

export const getCouncilRound = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  ((await api.query.councilElection.round.at(hash)) as u32).toNumber();

export const getCouncilSize = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  ((await api.query.councilElection.councilSize.at(hash)) as u32).toNumber();

export const getCouncilApplicants = (
  api: ApiPromise,
  hash: Hash
): Promise<Vec<AccountId>> => api.query.councilElection.applicants.at(hash);

export const getCouncilApplicantStakes = (
  api: ApiPromise,
  hash: Hash,
  applicant: AccountId
): Promise<ElectionStake> =>
  api.query.councilElection.applicantStakes.at(hash, applicant);

export const getCouncilCommitments = (
  api: ApiPromise,
  hash: Hash
): Promise<Vec<Hash>> => api.query.councilElection.commitments.at(hash);

export const getCouncilPayoutInterval = (
  api: ApiPromise,
  hash: Hash
): Promise<Option<BlockNumber>> => api.query.council.payoutInterval.at(hash);

export const getCouncilPayout = (
  api: ApiPromise,
  hash: Hash
): Promise<BalanceOf> => api.query.council.amountPerPayout.at(hash);

const periods = [
  "announcingPeriod",
  "votingPeriod",
  "revealingPeriod",
  "newTermDuration",
];
export const getCouncilPeriods = (
  api: ApiPromise,
  hash: Hash
): Promise<number>[] =>
  periods.map(async (period: string) =>
    ((await api.query.councilElection[period].at(
      hash
    )) as BlockNumber).toNumber()
  );

// working groups
export const getNextWorker = async (
  api: ApiPromise,
  group: string,
  hash: Hash
): Promise<number> =>
  ((await api.query[group].nextWorkerId.at(hash)) as WorkerId).toNumber();

export const getWorker = (
  api: ApiPromise,
  group: string,
  hash: Hash,
  id: number
): Promise<WorkerOf> => api.query[group].workerById.at(hash, id);

export const getWorkers = (
  api: ApiPromise,
  group: string,
  hash: Hash
): Promise<number> => api.query[group].activeWorkerCount.at(hash);

export const getStake = async (
  api: ApiPromise,
  id: StakeId | number
): Promise<Stake> => (await api.query.stake.stakes(id)) as Stake;

export const getWorkerReward = (
  api: ApiPromise,
  hash: Hash,
  id: RewardRelationshipId | number
): Promise<RewardRelationship> =>
  api.query.recurringRewards.rewardRelationships.at(hash, id);

// mints
export const getCouncilMint = (api: ApiPromise, hash: Hash): Promise<MintId> =>
  api.query.council.councilMint.at(hash);

export const getGroupMint = (
  api: ApiPromise,
  group: string,
  hash: Hash
): Promise<MintId> => api.query[group].mint.at(hash);

export const getMintsCreated = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> => parseInt(await api.query.minting.mintsCreated.at(hash));

export const getMint = (
  api: ApiPromise,
  hash: Hash,
  id: MintId | number
): Promise<Mint> => api.query.minting.mints.at(hash, id);

// members
export const getNextMember = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  ((await api.query.members.nextMemberId.at(hash)) as MemberId).toNumber();

export const getMember = (
  api: ApiPromise,
  hash: Hash,
  id: MemberId
): Promise<Membership> => api.query.members.membershipById.at(hash, id);

// forum
export const getNextPost = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  ((await api.query.forum.nextPostId.at(hash)) as PostId).toNumber();

export const getNextThread = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  ((await api.query.forum.nextThreadId.at(hash)) as ThreadId).toNumber();

export const getNextCategory = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  ((await api.query.forum.nextCategoryId.at(hash)) as CategoryId).toNumber();

// proposals
export const getProposalCount = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  ((await api.query.proposalsEngine.proposalCount.at(hash)) as u32).toNumber();

export const getProposalInfo = async (
  api: ApiPromise,
  id: ProposalId
): Promise<ProposalOf> =>
  (await api.query.proposalsEngine.proposals(id)) as ProposalOf;

export const getProposalDetails = async (
  api: ApiPromise,
  id: ProposalId
): Promise<ProposalDetails> =>
  (await api.query.proposalsCodex.proposalDetailsByProposalId(
    id
  )) as ProposalDetails;

// validators
export const getValidatorCount = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  ((await api.query.staking.validatorCount.at(hash)) as u32).toNumber();

export const getValidators = (
  api: ApiPromise,
  hash: Hash
): Promise<Option<Vec<AccountId>>> =>
  api.query.staking.snapshotValidators.at(hash);

// media
export const getNextEntity = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  ((await api.query.contentDirectory.nextEntityId.at(
    hash
  )) as EntityId).toNumber();

export const getNextChannel = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> => api.query.content.nextChannelId.at(hash);

export const getNextVideo = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> => api.query.content.nextVideoId.at(hash);

export const getEntity = (
  api: ApiPromise,
  hash: Hash,
  id: number
): Promise<Entity> => api.query.contentDirectory.entityById.at(hash, id);

export const getDataObjects = async (
  api: ApiPromise
): Promise<Map<ContentId, DataObject>> =>
  ((await api.query.dataDirectory.dataByContentId.entries()) as unknown) as Map<
    ContentId,
    DataObject
  >;

export const getDataObject = async (
  api: ApiPromise,
  id: ContentId
): Promise<Option<DataObject>> =>
  (await api.query.dataDirectory.dataByContentId(id)) as Option<DataObject>;
