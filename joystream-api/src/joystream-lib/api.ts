import { ApiPromise, WsProvider } from "@polkadot/api";
import moment from "moment";

// types
import { AccountBalance, ElectionInfo, Round, ProposalDetail } from "./types";
import { Option, u32, u64, Vec, StorageKey } from "@polkadot/types";
import type { Codec, Observable } from "@polkadot/types/types";
import {
  AccountId,
  AccountInfo,
  AccountData,
  Balance,
  BlockNumber,
  EraIndex,
  EventRecord,
  Hash,
  Moment,
} from "@polkadot/types/interfaces";
import { SignedBlock } from "@polkadot/types/interfaces/runtime";
import { types } from "@joystream/types";
import { PostId, ThreadId } from "@joystream/types/common";
import { CategoryId, Category, Thread, Post } from "@joystream/types/forum";
import {
  ElectionStage,
  ElectionStake,
  SealedVote,
  Seats,
} from "@joystream/types/council";
import { Entity, EntityId } from "@joystream/types/content-directory";
import { ContentId, DataObject } from "@joystream/types/media";
import { MemberId, Membership } from "@joystream/types/members";
import { Mint, MintId } from "@joystream/types/mint";
import {
  Proposal,
  ProposalId,
  DiscussionPost,
  SpendingParams,
  VoteKind,
} from "@joystream/types/proposals";
import { Stake, StakeId } from "@joystream/types/stake";
import {
  RewardRelationship,
  RewardRelationshipId,
} from "@joystream/types/recurring-rewards";
import { WorkerId, Worker } from "@joystream/types/working-group";
import { ProposalOf, ProposalDetailsOf } from "@joystream/types/augment/types";

import { WorkerOf } from "@joystream/types/augment-codec/all";

export const connectApi = async (url: string): Promise<ApiPromise> => {
  const provider = new WsProvider(url);
  return await ApiPromise.create({ provider, types });
};

// blocks
export const getBlock = (api: ApiPromise, hash: Hash): Promise<SignedBlock> =>
  api.rpc.chain.getBlock(hash);

export const getBlockHash = (
  api: ApiPromise,
  block: BlockNumber | number
): Promise<Hash> => {
  try {
    return api.rpc.chain.getBlockHash(block);
  } catch (e) {
    return api.rpc.chain.getFinalizedHead();
  }
};

export const getHead = (api: ApiPromise) => api.derive.chain.bestNumber();

export const getTimestamp = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  moment.utc((await api.query.timestamp.now.at(hash)).toNumber()).valueOf();

export const getIssuance = (api: ApiPromise, hash: Hash): Promise<Balance> =>
  api.query.balances.totalIssuance.at(hash);

export const getEvents = (
  api: ApiPromise,
  hash: Hash
): Promise<Vec<EventRecord>> => api.query.system.events.at(hash);

export const getEra = async (api: ApiPromise, hash: Hash): Promise<number> =>
  Number(api.query.staking.currentEra.at(hash));

export const getEraStake = async (
  api: ApiPromise,
  hash: Hash,
  era: EraIndex | number
): Promise<number> =>
  (await api.query.staking.erasTotalStake.at(hash, era)).toNumber();

// council
export const getCouncil = (api: ApiPromise, hash: Hash): Promise<Seats> =>
  api.query.council.activeCouncil.at(hash);

export const getCouncils = async (
  api: ApiPromise,
  head: number
): Promise<Round[]> => {
  // durations: [ announcing, voting, revealing, term, sum ]
  // each chain starts with an election (duration: d[0]+d[1]+d[2])
  // elections are repeated if not enough apply (round increments though)
  // first term starts at begin of d[3] or some electionDuration later
  // term lasts till the end of the next successful election
  // `council.termEndsAt` returns the end of the current round
  // to determine term starts check every electionDuration blocks

  const d: number[] = await getCouncilElectionDurations(
    api,
    await getBlockHash(api, 1)
  );
  const electionDuration = d[0] + d[1] + d[2];

  const starts: number[] = [];
  let lastEnd = 1;
  for (let block = lastEnd; block < head; block += electionDuration) {
    const hash = await getBlockHash(api, block);
    const end = Number(await api.query.council.termEndsAt.at(hash));
    if (end === lastEnd) continue;
    lastEnd = end;
    starts.push(end - d[3]);
  }

  // index by round: each start is the end of the previous term
  const rounds: { [key: number]: Round } = {};
  await Promise.all(
    starts.map(async (start: number, index: number) => {
      const hash = await getBlockHash(api, start);
      const round = await getCouncilRound(api, hash);
      const isLast = index === starts.length - 1;
      const end = isLast ? start + d[4] - 1 : starts[index + 1] - 1;
      rounds[round] = { start, round, end };
    })
  );
  return Object.values(rounds);
};

export const getCouncilRound = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  ((await api.query.councilElection.round.at(hash)) as u32).toNumber();

export const getCouncilElectionStage = async (
  api: ApiPromise,
  hash: Hash
): Promise<ElectionStage> =>
  (await api.query.councilElection.stage.at(hash)) as ElectionStage;

export const getCouncilTermEnd = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  ((await api.query.council.termEndsAt.at(hash)) as BlockNumber).toNumber();

export const getCouncilElectionStatus = async (
  api: ApiPromise,
  hash: Hash
): Promise<ElectionInfo> => {
  const durations = await getCouncilElectionDurations(api, hash);
  const round = await getCouncilRound(api, hash);
  const stage: ElectionStage = await getCouncilElectionStage(api, hash);
  const stageEndsAt: number = Number(stage.value as BlockNumber);
  const termEndsAt: number = await getCouncilTermEnd(api, hash);
  return { round, stageEndsAt, termEndsAt, stage, durations };
};

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
): Promise<Balance> => api.query.council.amountPerPayout.at(hash);

const getCouncilElectionPeriod = (
  api: ApiPromise,
  hash: Hash,
  period: string
): Promise<BlockNumber> => api.query.councilElection[period].at(hash);

export const getCouncilElectionDurations = async (
  api: ApiPromise,
  hash: Hash
): Promise<number[]> => {
  const periods = [
    "announcingPeriod",
    "votingPeriod",
    "revealingPeriod",
    "newTermDuration",
  ];
  let durations = await Promise.all(
    periods.map((period: string) => getCouncilElectionPeriod(api, hash, period))
  ).then((d) => d.map((block: BlockNumber) => block.toNumber()));
  durations.push(durations[0] + durations[1] + durations[2] + durations[3]);
  return durations;
};

export const getCommitments = (api: ApiPromise, hash: Hash): Promise<Hash[]> =>
  api.query.councilElection.commitments.at(hash);

export const getCommitment = (
  api: ApiPromise,
  blockHash: Hash,
  voteHash: Hash
): Promise<SealedVote> =>
  api.query.councilElection.votes.at(blockHash, voteHash);

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
export const getAccounts = async (
  api: ApiPromise
): Promise<AccountBalance[]> => {
  let accounts: AccountBalance[] = [];
  const entries = await api.query.system.account.entries();
  for (const account of entries) {
    const accountId = String(account[0].toHuman());
    const balance = account[1].data.toJSON() as unknown as AccountData;
    accounts.push({ accountId, balance });
  }
  return accounts;
};

export const getAccount = (
  api: ApiPromise,
  hash: Hash,
  account: AccountId | string
): Promise<AccountInfo> => api.query.system.account.at(hash, account);

export const getNextMember = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  ((await api.query.members.nextMemberId.at(hash)) as MemberId).toNumber();

export const getMember = async (
  api: ApiPromise,
  id: MemberId | number,
  hash?: Hash
): Promise<Membership> =>
  (await (hash
    ? api.query.members.membershipById.at(hash, id)
    : api.query.members.membershipById(id))) as Membership;

export const getMemberIdByAccount = async (
  api: ApiPromise,
  accountId: AccountId
): Promise<MemberId> => {
  const ids = (await api.query.members.memberIdsByRootAccountId(
    accountId
  )) as Vec<MemberId>;
  return ids[0];
};

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

export const getCategory = async (
  api: ApiPromise,
  id: number
): Promise<Category> => (await api.query.forum.categoryById(id)) as Category;

export const getThread = async (api: ApiPromise, id: number): Promise<Thread> =>
  (await api.query.forum.threadById(id)) as Thread;

export const getPost = async (api: ApiPromise, id: number): Promise<Post> =>
  (await api.query.forum.postById(id)) as Post;

// proposals
export const getProposalCount = async (
  api: ApiPromise,
  hash?: Hash
): Promise<number> =>
  (
    (await (hash
      ? api.query.proposalsEngine.proposalCount.at(hash)
      : api.query.proposalsEngine.proposalCount())) as u32
  ).toNumber();

export const getProposalInfo = async (
  api: ApiPromise,
  id: ProposalId
): Promise<ProposalOf> =>
  (await api.query.proposalsEngine.proposals(id)) as ProposalOf;

export const getProposalDetails = async (
  api: ApiPromise,
  id: ProposalId
): Promise<ProposalDetailsOf> =>
  (await api.query.proposalsCodex.proposalDetailsByProposalId(
    id
  )) as ProposalDetailsOf;

export const getProposalType = async (
  api: ApiPromise,
  id: ProposalId
): Promise<string> => {
  const details = (await getProposalDetails(api, id)) as ProposalDetailsOf;
  const [type]: string[] = Object.getOwnPropertyNames(details.toJSON());
  return type;
};

export const getProposal = async (
  api: ApiPromise,
  id: ProposalId
): Promise<ProposalDetail> => {
  const proposal: ProposalOf = await getProposalInfo(api, id);
  const status: { [key: string]: any } = proposal.status;
  const stage: string = status.isActive ? "Active" : "Finalized";
  const { finalizedAt, proposalStatus } = status[`as${stage}`];
  const result: string = proposalStatus
    ? (proposalStatus.isApproved && "Approved") ||
      (proposalStatus.isCanceled && "Canceled") ||
      (proposalStatus.isExpired && "Expired") ||
      (proposalStatus.isRejected && "Rejected") ||
      (proposalStatus.isSlashed && "Slashed") ||
      (proposalStatus.isVetoed && "Vetoed")
    : "Pending";
  const exec = proposalStatus ? proposalStatus["Approved"] : null;

  const { description, parameters, proposerId, votingResults } = proposal;
  const member: Membership = await getMember(api, proposerId);
  const author = String(member ? member.handle : proposerId);
  const title = proposal.title.toString();
  const type: string = await getProposalType(api, id);
  const args: string[] = [String(id), title, type, stage, result, author];
  const message: string = ``; //formatProposalMessage(args)
  const created: number = Number(proposal.createdAt);

  return {
    id: Number(id),
    title,
    created,
    finalizedAt,
    parameters: JSON.stringify(parameters),
    message,
    stage,
    result,
    exec,
    description: description.toHuman(),
    votes: votingResults,
    type,
    author,
    authorId: Number(proposerId),
  };
};

export const getProposalVotes = async (
  api: ApiPromise,
  id: ProposalId | number
): Promise<{ memberId: number; vote: string }[]> => {
  let votes: { memberId: number; vote: string }[] = [];
  const entries =
    await api.query.proposalsEngine.voteExistsByProposalByVoter.entries(id);
  entries.forEach((entry: any) => {
    const memberId = entry[0].args[1].toJSON();
    const vote = entry[1].toString();
    votes.push({ memberId, vote });
  });
  return votes;
};

export const getProposalPost = async (
  api: ApiPromise,
  threadId: ThreadId | number,
  postId: PostId | number
): Promise<DiscussionPost> =>
  (await api.query.proposalsDiscussion.postThreadIdByPostId(
    threadId,
    postId
  )) as DiscussionPost;

export const getProposalPosts = (
  api: ApiPromise
): Promise<[StorageKey<any>, DiscussionPost][]> =>
  api.query.proposalsDiscussion.postThreadIdByPostId.entries();

export const getProposalPostCount = async (api: ApiPromise): Promise<number> =>
  Number((await api.query.proposalsDiscussion.postCount()) as u64);

export const getProposalThreadCount = async (
  api: ApiPromise
): Promise<number> =>
  Number((await api.query.proposalsDiscussion.threadCount()) as u64);

// validators
export const getValidatorCount = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  ((await api.query.staking.validatorCount.at(hash)) as u32).toNumber();

export const getValidators = async (
  api: ApiPromise,
  hash: Hash
): Promise<AccountId[]> => {
  const snapshot = (await api.query.staking.snapshotValidators.at(
    hash
  )) as Option<Vec<AccountId>>;
  return snapshot.isSome ? snapshot.unwrap() : [];
};

// media
export const getNextEntity = async (
  api: ApiPromise,
  hash: Hash
): Promise<number> =>
  (
    (await api.query.contentDirectory.nextEntityId.at(hash)) as EntityId
  ).toNumber();

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
  (await api.query.dataDirectory.dataByContentId.entries()) as unknown as Map<
    ContentId,
    DataObject
  >;

export const getDataObject = async (
  api: ApiPromise,
  id: ContentId
): Promise<Option<DataObject>> =>
  (await api.query.dataDirectory.dataByContentId(id)) as Option<DataObject>;
