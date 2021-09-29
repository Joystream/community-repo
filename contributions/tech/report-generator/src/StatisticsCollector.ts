import { ApiPromise } from "@polkadot/api";

// types
import {
  AccountId,
  Balance,
  BalanceOf,
  BlockNumber,
  EventRecord,
  Hash,
} from "@polkadot/types/interfaces";
import { Media, MintStatistics, Statistics, WorkersInfo } from "./types";
import {
  CacheEvent,
  Bounty,
  WorkerReward,
  SpendingProposal,
} from "./lib/types";

import { Option, u32, Vec } from "@polkadot/types";
import { ElectionStake, SealedVote, Seats } from "@joystream/types/council";
import { Mint, MintId } from "@joystream/types/mint";
import { ContentId, DataObject } from "@joystream/types/media";
import { CategoryId } from "@joystream/types/forum";
import { MemberId, Membership } from "@joystream/types/members";
import {
  Proposal,
  ProposalId,
  SpendingParams,
} from "@joystream/types/proposals";
import {
  RewardRelationship,
  RewardRelationshipId,
} from "@joystream/types/recurring-rewards";
import { Stake } from "@joystream/types/stake";
import { Worker, WorkerId } from "@joystream/types/working-group";
import { ProposalDetails, ProposalOf } from "@joystream/types/augment/types";
import * as constants from "constants";

// lib
import { eventStats, getPercent, getTotalMinted, momentToString } from "./lib";
import {
  connectApi,
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
  getCouncilElectionDurations,
  getNextWorker,
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
  getWorkerRow,
  getBurnedTokens,
  getFinalizedSpendingProposals,
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

const SPENDING_PROPOSALS_CATEGORIES_FILE =
  __dirname + "/../../../../governance/spending_proposal_categories.csv";

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
    this.api = await connectApi(PROVIDER_URL);

    let startHash: Hash = await getBlockHash(this.api, startBlock);
    let endHash: Hash = await getBlockHash(this.api, endBlock);
    let dateStart = momentToString(await getTimestamp(this.api, startHash));
    let dateEnd = momentToString(await getTimestamp(this.api, endHash));
    this.saveStats({
      dateStart,
      dateEnd,
      startBlock,
      endBlock,
      newBlocks: endBlock - startBlock,
      percNewBlocks: getPercent(startBlock, endBlock),
    });

    await this.buildBlocksEventCache(startBlock, endBlock);
    eventStats(this.blocksEventsCache);
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
    try {
      await fs.access(SPENDING_PROPOSALS_CATEGORIES_FILE, constants.R_OK);
    } catch {
      console.warn("File with the spending proposal categories not found");
    }

    const fileContent = await fs.readFile(SPENDING_PROPOSALS_CATEGORIES_FILE);
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
    const blocks = this.filterCache(filterMethods.finalizedSpendingProposals);
    const spendingProposals: SpendingProposal[] =
      await getFinalizedSpendingProposals(this.api, blocks);
    let bountiesTotalPaid = 0;
    if (bounties) {
      for (let bounty of bounties) {
        const bountySpendingProposal = spendingProposals.find(
          (spendingProposal) => spendingProposal.id == bounty.proposalId
        );
        if (bountySpendingProposal)
          bountiesTotalPaid += bountySpendingProposal.amount;
      }
      this.saveStats({ bountiesTotalPaid });
    }

    if (!bountiesTotalPaid) {
      console.warn(
        `No bounties found in ${SPENDING_PROPOSALS_CATEGORIES_FILE}, trying to find spending proposals of bounties, please check the values!...`
      );
      for (const spendingProposal of spendingProposals) {
        if (spendingProposal.title.toLowerCase().includes("bounty")) {
          bountiesTotalPaid += spendingProposal.amount;
        }
      }
      this.saveStats({ bountiesTotalPaid });
    }

    let roundNrBlocks = endBlock - startBlock;
    const spendingProposalsTotal = spendingProposals.reduce(
      (n, p) => n + p.amount,
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

  async getMintInfo(
    api: ApiPromise,
    mintId: MintId,
    startHash: Hash,
    endHash: Hash
  ): Promise<MintStatistics> {
    const startMint: Mint = await getMint(api, startHash, mintId);
    const endMint: Mint = await getMint(api, endHash, mintId);
    let stats = new MintStatistics();
    stats.startMinted = getTotalMinted(startMint);
    stats.endMinted = getTotalMinted(endMint);
    stats.diffMinted = stats.endMinted - stats.startMinted;
    stats.percMinted = getPercent(stats.startMinted, stats.endMinted);
    return stats;
  }

  async computeCouncilReward(
    roundNrBlocks: number,
    endHash: Hash
  ): Promise<number> {
    const payoutInterval = Number(
      (
        (await getCouncilPayoutInterval(
          this.api,
          endHash
        )) as Option<BlockNumber>
      ).unwrapOr(0)
    );
    const amountPerPayout = (
      (await getCouncilPayout(this.api, endHash)) as BalanceOf
    ).toNumber();

    const [
      announcingPeriod,
      votingPeriod,
      revealingPeriod,
      termDuration,
    ]: number[] = await getCouncilElectionDurations(this.api, endHash);

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
    let workers = ``;
    workersEnd.forEach(async (worker) => {
      if (worker.stake) info.endStake += worker.stake.value.toNumber();
      if (!worker.reward) return;
      let earnedBefore = 0;
      const hired = workersStart.find((w) => w.id === worker.id);
      if (hired) earnedBefore = hired.reward.total_reward_received.toNumber();
      workers += getWorkerRow(worker, earnedBefore);
    });
    const header = `| # | Member | Status | tJOY / Block | M tJOY Term | M tJOY total |\n|--|--|--|--|--|--|\n`;
    const groupTag =
      workingGroup === `storage`
        ? `storageProviders`
        : workingGroup === `contentDirectory`
        ? `curators`
        : workingGroup === `operations`
        ? `operations`
        : ``;
    this.saveStats({ [groupTag]: header + workers });

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
    const info = await this.getMintInfo(this.api, mint, startHash, endHash);
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
    const councilInfo = await this.getMintInfo(
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
      councilRound: round - COUNCIL_ROUND_OFFSET,
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
    const startTimestamp: number = await getTimestamp(this.api, startHash);
    const endTimestamp: number = await getTimestamp(this.api, endHash);
    const blocks = this.statistics.newBlocks;
    const avgBlockProduction = (endTimestamp - startTimestamp) / 1000 / blocks;
    const maxStartValidators = await getValidatorCount(this.api, startHash);
    const startValidators = await getActiveValidators(this.api, startHash);
    const maxEndValidators = await getValidatorCount(this.api, endHash);
    const endValidators = await getActiveValidators(this.api, endHash, true);
    const startEra: number = await getEra(this.api, startHash);
    const endEra: number = await getEra(this.api, endHash);

    const startStake = await getEraStake(this.api, startHash, startEra);
    const endStake = await getEraStake(this.api, endHash, endEra);

    this.saveStats({
      avgBlockProduction: Number(avgBlockProduction.toFixed(2)),
      startValidators: startValidators.length + " / " + maxStartValidators,
      endValidators: endValidators.length + " / " + maxEndValidators,
      percValidators: getPercent(startValidators.length, endValidators.length),
      startValidatorsStake: startStake,
      endValidatorsStake: endStake,
      percNewValidatorsStake: getPercent(startStake, endStake),
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
    });
  }

  async fillCuratorInfo(startHash: Hash, endHash: Hash): Promise<void> {
    const group = "contentDirectoryWorkingGroup";
    const startCurators = await getWorkers(this.api, group, startHash);
    const endCurators = await getWorkers(this.api, group, endHash);

    this.saveStats({
      startCurators,
      endCurators,
      percNewCurators: getPercent(startCurators, endCurators),
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

    this.saveStats({
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
        let eventRecord: EventRecord[] = [];
        try {
          eventRecord = await getEvents(this.api, blockHash);
        } catch (e) {
          console.warn(`Failed to get events.`, e);
        }
        let cacheEvents = new Array<CacheEvent>();
        for (let { event } of eventRecord) {
          if (!event) {
            console.warn(`empty event record`);
            continue;
          }
          cacheEvents.push(
            new CacheEvent(event.section, event.method, event.data)
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
}
