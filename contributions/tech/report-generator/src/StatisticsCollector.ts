import { ApiPromise, WsProvider } from "@polkadot/api";
import { types } from "@joystream/types";
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

import {
  CacheEvent,
  Media,
  MintStatistics,
  Statistics,
  WorkersInfo,
  Channel,
  SpendingProposals,
  Bounty,
  WorkerReward,
} from "./types";

import { Option, u32, Vec } from "@polkadot/types";
import { ElectionStake, SealedVote, Seats } from "@joystream/types/council";
import { Mint, MintId } from "@joystream/types/mint";
import { ContentId, DataObject } from "@joystream/types/media";

import { ChannelId, PostId, ThreadId } from "@joystream/types/common";
import { CategoryId } from "@joystream/types/forum";

import { MemberId, Membership } from "@joystream/types/members";
import {
  RewardRelationship,
  RewardRelationshipId,
} from "@joystream/types/recurring-rewards";
import { Stake } from "@joystream/types/stake";
import { WorkerId } from "@joystream/types/working-group";
import {
  Entity,
  EntityId,
  PropertyType,
} from "@joystream/types/content-directory";
import {
  ProposalId,
  Video,
  VideoId,
  WorkerOf,
} from "@joystream/types/augment-codec/all";
import { ProposalDetails, ProposalOf } from "@joystream/types/augment/types";
import { SpendingParams } from "@joystream/types/proposals";
import * as constants from "constants";

import { getPercent, getTotalMinted, momentToString } from "./lib";
import {
  getBlock,
  getBlockHash,
  getTimestamp,
  getIssuance,
  getEra,
  getEraStake,
  getEvents,
  getCouncil,
  getCouncilRound,
  getCouncilSize,
  getCouncilApplicants,
  getCouncilApplicantStakes,
  getCouncilCommitments,
  getCouncilPayoutInterval,
  getCouncilPayout,
  getCouncilPeriods,
  getNextWorker,
  getWorker,
  getWorkers,
  getWorkerReward,
  getStake,
  getCouncilMint,
  getMintsCreated,
  getMint,
  getGroupMint,
  getNextMember,
  getMember,
  getNextPost,
  getNextThread,
  getNextCategory,
  getProposalCount,
  getProposalInfo,
  getProposalDetails,
  getValidatorCount,
  getValidators,
  getNextEntity,
  getNextChannel,
  getNextVideo,
  getEntity,
  getDataObject,
  getDataObjects,
} from "./lib/api";

import {
  filterMethods,
  getWorkerRewards,
  getBurnedTokens,
  getMintInfo,
  getActiveValidators,
  getValidatorsRewards,
} from "./lib/rewards";

const fsSync = require("fs");
const fs = fsSync.promises;
const parse = require("csv-parse/lib/sync");

const BURN_ADDRESS = "5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMaeKQu";

const COUNCIL_ROUND_OFFSET = 2;
const PROVIDER_URL = "ws://localhost:9944";

const CACHE_FOLDER = "cache";

const VIDEO_CLASS_iD = 10;
const CHANNEL_CLASS_iD = 1;

const SPENDING_CATEGORIES_FILE_NAME = "spending_proposal_categories";

export class StatisticsCollector {
  private api?: ApiPromise;
  private blocksEventsCache: Map<number, CacheEvent[]>;
  private statistics: Statistics;

  constructor() {
    this.blocksEventsCache = new Map<number, CacheEvent[]>();
    this.statistics = new Statistics();
  }

  saveStats(data: any) {
    Object.keys(data).map((key: string) => (this.statistics[key] = data[key]));
  }

  filterCache(
    filterEvent: (event: CacheEvent) => boolean
  ): [number, CacheEvent[]][] {
    const blocks: [number, CacheEvent[]][] = [];
    for (let block of this.blocksEventsCache) {
      const [key, events] = block;
      const filtered = events.filter((event) => filterEvent(event));
      if (filtered.length) blocks.push([key, filtered]);
    }
    return blocks;
  }

  async getStatistics(
    startBlock: number,
    endBlock: number
  ): Promise<Statistics> {
    this.api = await StatisticsCollector.connectApi();

    let startHash: Hash = await getBlockHash(this.api, startBlock);
    let endHash: Hash = await getBlockHash(this.api, endBlock);
    let startDate: Moment = await getTimestamp(this.api, startHash);
    let endDate: Moment = await getTimestamp(this.api, endHash);
    this.saveStats({
      dateStart: momentToString(startDate),
      dateEnd: momentToString(endDate),
      startBlock,
      endBlock,
      newBlocks: endBlock - startBlock,
      percNewBlocks: getPercent(startBlock, endBlock),
    });

    await this.buildBlocksEventCache(startBlock, endBlock);
    await this.fillTokenGenerationInfo(
      startBlock,
      endBlock,
      startHash,
      endHash
    );
    await this.fillMintsInfo(startHash, endHash);
    await this.fillCouncilInfo(startHash, endHash);
    await this.fillCouncilElectionInfo(startBlock);
    await this.fillValidatorInfo(startHash, endHash);
    await this.fillStorageProviderInfo(
      startBlock,
      endBlock,
      startHash,
      endHash
    );
    await this.fillCuratorInfo(startHash, endHash);
    await this.fillOperationsInfo(startBlock, endBlock, startHash, endHash);
    await this.fillMembershipInfo(startHash, endHash);
    await this.fillMediaUploadInfo(startHash, endHash);
    await this.fillForumInfo(startHash, endHash);

    this.api.disconnect();
    return this.statistics;
  }

  async getApprovedBounties(): Promise<Bounty[]> {
    let bountiesFilePath = `${__dirname}/../${SPENDING_CATEGORIES_FILE_NAME}.csv`;
    try {
      await fs.access(bountiesFilePath, constants.R_OK);
    } catch {
      throw new Error("Bounties CSV file not found");
    }

    const fileContent = await fs.readFile(bountiesFilePath);
    let rawBounties = parse(fileContent);
    rawBounties.shift();
    rawBounties = rawBounties.filter((line: string[]) => line[8] == "Bounties");

    let bounties = rawBounties.map((rawBounty: any) => {
      return new Bounty(
        rawBounty[0],
        rawBounty[1],
        rawBounty[2],
        rawBounty[3],
        rawBounty[4],
        rawBounty[5]
      );
    });

    return bounties.filter(
      (bounty: Bounty) =>
        bounty.status == "Approved" && bounty.testnet == "Antioch"
    );
  }

  async getFinalizedSpendingProposals(): Promise<Array<SpendingProposals>> {
    let spendingProposals = new Array<SpendingProposals>();
    for (let [key, blockEvents] of this.blocksEventsCache) {
      let proposalEvents = blockEvents.filter(
        ({ section, method }) =>
          section === "proposalsEngine" && method === "ProposalStatusUpdated"
      );
      for (let proposalEvent of proposalEvents) {
        let statusUpdateData = proposalEvent.data[1] as any;
        const finalizedAt = statusUpdateData.finalized.finalizedAt;
        if (!(statusUpdateData.finalized && finalizedAt)) continue;

        const id: ProposalId = proposalEvent.data[0] as any;
        const proposalInfo: ProposalOf = await getProposalInfo(this.api, id);
        const finalizedData = proposalInfo.status.asFinalized;
        const proposalDetail: ProposalDetails = await getProposalDetails(
          this.api,
          id
        );
        if (
          !finalizedData.proposalStatus.isApproved ||
          !proposalDetail.isSpending
        )
          continue;
        let spendingParams = proposalDetail.asSpending;
        if (!spendingProposals.some((proposal) => proposal.id == +id)) {
          const title = proposalInfo.title.toString();
          const amount = +spendingParams[0];
          const proposal = new SpendingProposals(+id, title, amount);
          spendingProposals.push(proposal);
        }
      }
    }
    return spendingProposals;
  }

  async fillTokenGenerationInfo(
    startBlock: number,
    endBlock: number,
    startHash: Hash,
    endHash: Hash
  ): Promise<void> {
    const startIssuance = (await getIssuance(this.api, startHash)).toNumber();
    const endIssuance = (await getIssuance(this.api, endHash)).toNumber();
    this.saveStats({
      startIssuance,
      endIssuance,
      newIssuance: endIssuance - startIssuance,
      percNewIssuance: getPercent(startIssuance, endIssuance),
      newTokensBurn: await getBurnedTokens(
        BURN_ADDRESS,
        this.filterCache(filterMethods.getBurnedTokens)
      ),
    });

    // bounties
    const bounties = await this.getApprovedBounties();
    let spendingProposals: SpendingProposals[] = await this.getFinalizedSpendingProposals();
    let bountiesTotalPaid = 0;
    if (bounties) {
      for (let bounty of bounties) {
        const bountySpendingProposal = spendingProposals.find(
          (spendingProposal) => spendingProposal.id == bounty.proposalId
        );
        if (bountySpendingProposal)
          bountiesTotalPaid += bountySpendingProposal.spentAmount;
      }
      this.saveStats({ bountiesTotalPaid });
    }

    if (!bountiesTotalPaid) {
      console.warn(
        "No bounties found in " +
          SPENDING_CATEGORIES_FILE_NAME +
          ", trying to find spending proposals of bounties, please check the values!..."
      );
      for (const spendingProposal of spendingProposals) {
        if (spendingProposal.title.toLowerCase().includes("bounty")) {
          bountiesTotalPaid += spendingProposal.spentAmount;
        }
      }
      this.saveStats({ bountiesTotalPaid });
    }

    let roundNrBlocks = endBlock - startBlock;
    const spendingProposalsTotal = spendingProposals.reduce(
      (n, p) => n + p.spentAmount,
      0
    );
    const newCouncilRewards = await this.computeCouncilReward(
      roundNrBlocks,
      endHash
    );
    const newCuratorInfo = await this.computeWorkingGroupReward(
      roundNrBlocks,
      startHash,
      endHash,
      "contentDirectory"
    );

    this.saveStats({
      spendingProposalsTotal,
      newCouncilRewards: newCouncilRewards.toFixed(2),
      newCuratorRewards: newCuratorInfo.rewards.toFixed(2),
    });
  }

  async computeCouncilReward(
    roundNrBlocks: number,
    endHash: Hash
  ): Promise<number> {
    const payoutInterval = Number(
      ((await getCouncilPayoutInterval(
        this.api,
        endHash
      )) as Option<BlockNumber>).unwrapOr(0)
    );
    const amountPerPayout = ((await getCouncilPayout(
      this.api,
      endHash
    )) as BalanceOf).toNumber();

    const [
      announcingPeriod,
      votingPeriod,
      revealingPeriod,
      termDuration,
    ] = await Promise.all(getCouncilPeriods(this.api, endHash));

    const nrCouncilMembers = ((await getCouncil(this.api, endHash)) as Seats)
      .length;
    const totalCouncilRewardsPerBlock =
      amountPerPayout && payoutInterval
        ? (amountPerPayout * nrCouncilMembers) / payoutInterval
        : 0;

    const councilTermDurationRatio =
      termDuration /
      (termDuration + votingPeriod + revealingPeriod + announcingPeriod);
    const avgCouncilRewardPerBlock =
      councilTermDurationRatio * totalCouncilRewardsPerBlock;

    return avgCouncilRewardPerBlock * roundNrBlocks;
  }

  // Summarize stakes and rewards at start and end
  async computeWorkingGroupReward(
    roundNrBlocks: number,
    startHash: Hash,
    endHash: Hash,
    workingGroup: string
  ): Promise<WorkersInfo> {
    const group = workingGroup + "WorkingGroup";
    let info = new WorkersInfo();

    // stakes at start
    const workersStart: WorkerReward[] = await getWorkerRewards(
      this.api,
      group,
      startHash
    );
    workersStart.forEach(({ stake }) => {
      if (stake) info.startStake += stake.value.toNumber();
    });

    // stakes at end
    const workersEnd: WorkerReward[] = await getWorkerRewards(
      this.api,
      group,
      endHash
    );
    workersEnd.forEach(({ stake }) => {
      if (stake) info.endStake += stake.value.toNumber();
    });

    info.rewards = await this.computeReward(
      roundNrBlocks,
      workersEnd.filter((w) => w.reward).map((w) => w.reward)
    );
    info.endNrOfWorkers = workersEnd.length;
    return info;
  }

  async computeReward(
    roundNrBlocks: number,
    recurringRewards: RewardRelationship[]
  ): Promise<number> {
    let rewardPerBlock = 0;
    recurringRewards.forEach((recurringReward: RewardRelationship) => {
      if (!recurringReward) return;
      const amount = recurringReward.amount_per_payout.toNumber();
      const payoutInterval = Number(recurringReward.payout_interval);
      if (amount && payoutInterval) rewardPerBlock += amount / payoutInterval;
    });
    return rewardPerBlock * roundNrBlocks;
  }

  async computeGroupMintStats(
    [label, tag]: string[],
    startHash: Hash,
    endHash: Hash
  ) {
    const group = label + "WorkingGroup";
    const mint = await getGroupMint(this.api, group, endHash);
    const info = await getMintInfo(this.api, mint, startHash, endHash);
    let stats: { [key: string]: number } = {};
    stats[`start${tag}Minted`] = info.startMinted;
    stats[`end${tag}Minted`] = info.endMinted;
    stats[`new${tag}Minted`] = info.diffMinted;
    stats[`perc${tag}Minted`] = info.percMinted;
    this.saveStats(stats);
  }

  async fillMintsInfo(startHash: Hash, endHash: Hash): Promise<void> {
    const startNrMints = await getMintsCreated(this.api, startHash);
    const endNrMints = await getMintsCreated(this.api, endHash);
    const newMints = endNrMints - startNrMints;

    // calcuate sum of all mints
    let totalMinted = 0;
    let totalMintCapacityIncrease = 0;
    // summarize old mints
    for (let i = 0; i < startNrMints; ++i) {
      const startMint: Mint = await getMint(this.api, startHash, i);
      const endMint: Mint = await getMint(this.api, endHash, i);
      const startMintTotal = getTotalMinted(startMint);
      const endMintTotal = getTotalMinted(endMint);
      totalMinted += endMintTotal - startMintTotal;
      totalMintCapacityIncrease +=
        parseInt(endMint.getField("capacity").toString()) -
        parseInt(startMint.getField("capacity").toString());
    }

    // summarize new mints
    for (let i = startNrMints; i < endNrMints; ++i) {
      const endMint: Mint = await getMint(this.api, endHash, i);
      if (endMint) totalMinted += getTotalMinted(endMint);
    }
    this.saveStats({ newMints, totalMinted, totalMintCapacityIncrease });

    // council
    const councilInfo = await getMintInfo(
      this.api,
      await getCouncilMint(this.api, endHash),
      startHash,
      endHash
    );
    this.saveStats({
      startCouncilMinted: councilInfo.startMinted,
      endCouncilMinted: councilInfo.endMinted,
      newCouncilMinted: councilInfo.diffMinted,
      percNewCouncilMinted: councilInfo.percMinted,
    });
    // working groups
    const groups = [
      ["contentDirectory", "Curator"],
      ["storage", "Storage"],
      ["operations", "Operations"],
    ].forEach((group) => this.computeGroupMintStats(group, startHash, endHash));
  }

  async fillCouncilInfo(startHash: Hash, endHash: Hash): Promise<void> {
    const round = await getCouncilRound(this.api, startHash);
    const startNrProposals = await getProposalCount(this.api, startHash);
    const endNrProposals = await getProposalCount(this.api, endHash);

    let approvedProposals = new Set();
    for (let [key, blockEvents] of this.blocksEventsCache) {
      for (let event of blockEvents) {
        if (
          event.section == "proposalsEngine" &&
          event.method == "ProposalStatusUpdated"
        ) {
          let statusUpdateData = event.data[1] as any;
          let finalizeData = statusUpdateData.finalized as any;
          if (finalizeData && finalizeData.proposalStatus.approved) {
            approvedProposals.add(Number(event.data[0]));
          }
        }
      }
    }

    this.saveStats({
      councilRound: round - COUNCIL_ROUND_OFFSET, // TODO repeated elections?
      councilMembers: await getCouncilSize(this.api, startHash),
      newProposals: endNrProposals - startNrProposals,
      newApprovedProposals: approvedProposals.size,
    });
  }

  async fillCouncilElectionInfo(startBlock: number): Promise<void> {
    let startBlockHash = await getBlockHash(this.api, startBlock);
    let events: Vec<EventRecord> = await getEvents(this.api, startBlockHash);
    let isStartBlockFirstCouncilBlock = events.some(
      ({ event }) =>
        event.section == "councilElection" && event.method == "CouncilElected"
    );

    if (!isStartBlockFirstCouncilBlock)
      return console.warn(
        "Note: The given start block is not the first block of the council round so council election information will be empty"
      );

    let lastBlockHash = await getBlockHash(this.api, startBlock - 1);
    let applicants: Vec<AccountId> = await getCouncilApplicants(
      this.api,
      lastBlockHash
    );
    let electionApplicantsStakes = 0;
    for (let applicant of applicants) {
      const applicantStakes: ElectionStake = await getCouncilApplicantStakes(
        this.api,
        lastBlockHash,
        applicant
      );
      electionApplicantsStakes += applicantStakes.new.toNumber();
    }
    // let seats = await getCouncil(this.api,startBlockHash) as Seats;
    //TODO: Find a more accurate way of getting the votes
    const votes: Vec<Hash> = await getCouncilCommitments(
      this.api,
      lastBlockHash
    );

    this.saveStats({
      electionApplicants: applicants.length,
      electionApplicantsStakes,
      electionVotes: votes.length,
    });
  }

  async fillValidatorInfo(startHash: Hash, endHash: Hash): Promise<void> {
    let startTimestamp: Moment = await getTimestamp(this.api, startHash);
    let endTimestamp: Moment = await getTimestamp(this.api, endHash);
    let avgBlockProduction =
      (endTimestamp.toNumber() - startTimestamp.toNumber()) /
      1000 /
      this.statistics.newBlocks;
    const maxStartValidators = await getValidatorCount(this.api, startHash);
    const startValidators = await getActiveValidators(this.api, startHash);
    const maxEndValidators = await getValidatorCount(this.api, endHash);
    const endValidators = await getActiveValidators(this.api, endHash, true);
    const startEra: Option<EraIndex> = await getEra(this.api, startHash);
    const endEra: Option<EraIndex> = await getEra(this.api, endHash);

    this.saveStats({
      avgBlockProduction: Number(avgBlockProduction.toFixed(2)),
      startValidators: startValidators.length + " / " + maxStartValidators,
      endValidators: endValidators.length + " / " + maxEndValidators,
      percValidators: getPercent(startValidators.length, endValidators.length),
      startValidatorsStake: await getEraStake(
        this.api,
        startHash,
        startEra.unwrap()
      ),
      endValidatorsStake: await getEraStake(this.api, endHash, endEra.unwrap()),
      percNewValidatorsStake: getPercent(
        this.statistics.startValidatorsStake,
        this.statistics.endValidatorsStake
      ),
      newValidatorRewards: await getValidatorsRewards(
        this.filterCache(filterMethods.newValidatorsRewards)
      ),
    });
  }

  async fillStorageProviderInfo(
    startBlock: number,
    endBlock: number,
    startHash: Hash,
    endHash: Hash
  ): Promise<void> {
    let roundNrBlocks = endBlock - startBlock;
    let storageProvidersRewards = await this.computeWorkingGroupReward(
      roundNrBlocks,
      startHash,
      endHash,
      "storage"
    );
    const newStorageProviderReward = Number(
      storageProvidersRewards.rewards.toFixed(2)
    );
    const startStorageProvidersStake = storageProvidersRewards.startStake;
    const endStorageProvidersStake = storageProvidersRewards.endStake;

    const group = "storageWorkingGroup";
    const startStorageProviders = await getWorkers(this.api, group, startHash);
    const endStorageProviders = await getWorkers(this.api, group, endHash);

    let storageProviders = "";
    const nextWorkerId = await getNextWorker(this.api, group, endHash);
    for (let i = 0; i < nextWorkerId; ++i) {
      const provider: WorkerOf = await getWorker(this.api, group, endHash, i);
      if (!provider.is_active) continue;
      const id = provider.member_id;
      const { handle, root_account } = await getMember(this.api, endHash, id);
      storageProviders += `@${handle} | (${root_account})  \n`;
    }

    this.saveStats({
      newStorageProviderReward,
      startStorageProvidersStake,
      endStorageProvidersStake,
      percNewStorageProviderStake: getPercent(
        startStorageProvidersStake,
        endStorageProvidersStake
      ),
      startStorageProviders,
      endStorageProviders,
      percNewStorageProviders: getPercent(
        startStorageProviders,
        endStorageProviders
      ),
      storageProviders,
    });
  }

  async fillCuratorInfo(startHash: Hash, endHash: Hash): Promise<void> {
    const group = "contentDirectoryWorkingGroup";
    const startCurators = await getWorkers(this.api, group, startHash);
    const endCurators = await getWorkers(this.api, group, endHash);

    let nextCuratorId = await getNextWorker(this.api, group, endHash);
    let curators = "";
    for (let i = 0; i < nextCuratorId; ++i) {
      const curator: WorkerOf = await getWorker(this.api, group, endHash, i);
      if (!curator.is_active) continue;
      const id = curator.member_id;
      const { handle, root_account } = await getMember(this.api, endHash, id);
      curators += `@${handle} | (${root_account})  \n`;
    }
    this.saveStats({
      startCurators,
      endCurators,
      percNewCurators: getPercent(
        this.statistics.startCurators,
        this.statistics.endCurators
      ),
      curators,
    });
  }

  async fillOperationsInfo(
    startBlock: number,
    endBlock: number,
    startHash: Hash,
    endHash: Hash
  ): Promise<void> {
    const roundNrBlocks = endBlock - startBlock;
    const operationsRewards = await this.computeWorkingGroupReward(
      roundNrBlocks,
      startHash,
      endHash,
      "operations"
    );
    const newOperationsReward = operationsRewards.rewards.toFixed(2);
    const startOperationsStake = operationsRewards.startStake;
    const endOperationsStake = operationsRewards.endStake;

    const group = "operationsWorkingGroup";
    const startWorkers = await getWorkers(this.api, group, startHash);
    const endWorkers = await getWorkers(this.api, group, endHash);

    let operations = "";
    let nextOperationsWorkerId = await getNextWorker(this.api, group, endHash);
    for (let i = 0; i < nextOperationsWorkerId; ++i) {
      let worker: WorkerOf = await getWorker(this.api, group, endHash, i);
      if (!worker.is_active) continue;
      const id = worker.member_id;
      const { handle, root_account } = await getMember(this.api, endHash, id);
      operations += `@${handle} | (${root_account})  \n`;
    }
    this.saveStats({
      operations,
      newOperationsReward: Number(newOperationsReward),
      startOperationsWorkers: startWorkers,
      endOperationsWorkers: endWorkers,
      percNewOperationsWorkers: getPercent(startWorkers, endWorkers),
      startOperationsStake,
      endOperationsStake,
      percNewOperationstake: getPercent(
        startOperationsStake,
        endOperationsStake
      ),
    });
  }

  async fillMembershipInfo(startHash: Hash, endHash: Hash): Promise<void> {
    const startMembers = await getNextMember(this.api, startHash);
    const endMembers = await getNextMember(this.api, endHash);
    this.saveStats({
      startMembers,
      endMembers,
      newMembers: endMembers - startMembers,
      percNewMembers: getPercent(startMembers, endMembers),
    });
  }

  async fillMediaUploadInfo(startHash: Hash, endHash: Hash): Promise<void> {
    const startMedia = await getNextVideo(this.api, startHash);
    const endMedia = await getNextVideo(this.api, endHash);
    const startChannels = await getNextChannel(this.api, startHash);
    const endChannels = await getNextChannel(this.api, endHash);

    // count size
    let startUsedSpace = 0;
    let endUsedSpace = 0;
    const startBlock = await getBlock(this.api, startHash);
    const endBlock = await getBlock(this.api, endHash);
    const dataObjects: Map<ContentId, DataObject> = await getDataObjects(
      this.api
    );
    for (let [key, dataObject] of dataObjects) {
      const added = dataObject.added_at.block.toNumber();
      const start = startBlock.block.header.number.toNumber();
      const end = endBlock.block.header.number.toNumber();
      if (added < start)
        startUsedSpace += dataObject.size_in_bytes.toNumber() / 1024 / 1024;
      if (added < end)
        endUsedSpace += dataObject.size_in_bytes.toNumber() / 1024 / 1024;
    }
    this.saveStats({
      startMedia,
      endMedia,
      percNewMedia: getPercent(startMedia, endMedia),
      startChannels,
      endChannels,
      percNewChannels: getPercent(startChannels, endChannels),
      startUsedSpace: Number(startUsedSpace.toFixed(2)),
      endUsedSpace: Number(endUsedSpace.toFixed(2)),
      percNewUsedSpace: getPercent(startUsedSpace, endUsedSpace),
    });
  }

  async fillForumInfo(startHash: Hash, endHash: Hash): Promise<void> {
    const startPosts = await getNextPost(this.api, startHash);
    const endPosts = await getNextPost(this.api, endHash);
    const startThreads = await getNextThread(this.api, startHash);
    const endThreads = await getNextThread(this.api, endHash);
    const startCategories = await getNextCategory(this.api, startHash);
    const endCategories = await getNextCategory(this.api, endHash);
    this.saveStats({
      startPosts,
      endPosts,
      newPosts: endPosts - startPosts,
      percNewPosts: getPercent(startPosts, endPosts),
      startThreads,
      endThreads,
      newThreads: endThreads - startThreads,
      percNewThreads: getPercent(startThreads, endThreads),
      startCategories,
      endCategories,
      newCategories: endCategories - startCategories,
      perNewCategories: getPercent(startCategories, endCategories),
    });
  }

  async buildBlocksEventCache(
    startBlock: number,
    endBlock: number
  ): Promise<void> {
    const cacheFile = `${CACHE_FOLDER}/${startBlock}-${endBlock}.json`;
    const exists = await fs
      .access(cacheFile, fsSync.constants.R_OK)
      .then(() => true)
      .catch(() => false);
    if (!exists) {
      console.log("Building events cache...");
      let blocksEvents = new Map<number, CacheEvent[]>();
      for (let i = startBlock; i < endBlock; ++i) {
        process.stdout.write("\rCaching block: " + i + " until " + endBlock);
        const blockHash: Hash = await getBlockHash(this.api, i);
        let eventRecord: Vec<EventRecord> = await getEvents(
          this.api,
          blockHash
        );
        let cacheEvents = new Array<CacheEvent>();
        for (let event of eventRecord) {
          cacheEvents.push(
            new CacheEvent(
              event.event.section,
              event.event.method,
              event.event.data
            )
          );
        }
        blocksEvents.set(i, cacheEvents);
      }

      console.log("\nFinish events cache...");
      const json = JSON.stringify(Array.from(blocksEvents.entries()), null, 2);
      fsSync.writeFileSync(cacheFile, json);
      this.blocksEventsCache = new Map(JSON.parse(json));
    } else {
      console.log("Cache file found, loading it...");
      let fileData = await fs.readFile(cacheFile);
      this.blocksEventsCache = new Map(JSON.parse(fileData));
      console.log("Cache file loaded...");
    }
  }

  static async connectApi(): Promise<ApiPromise> {
    const provider = new WsProvider(PROVIDER_URL);
    return await ApiPromise.create({ provider, types });
  }
}
