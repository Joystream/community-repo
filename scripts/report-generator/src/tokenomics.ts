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
import { Config, MintStats, Statistics, WorkersInfo } from "./types/tokenomics";
import { sum } from "./lib";
import {
  CacheEvent,
  Bounty,
  WorkerReward,
  SpendingProposal,
  StatusData,
} from "./lib/types";
import { Option, u32, Vec } from "@polkadot/types";
import { ElectionStake, SealedVote, Seats } from "@joystream/types/council";
import { Mint, MintId } from "@joystream/types/mint";
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
import { StorageBucket, StorageBucketId } from "@joystream/types/storage";
import { Worker, WorkerId } from "@joystream/types/working-group";
import { ProposalDetails, ProposalOf } from "@joystream/types/augment/types";
import * as constants from "constants";
import axios from "axios";

// lib
import { eventStats, getPercent, getTotalMinted, momentToString } from "./lib";
import {
  connectApi,
  getBlock,
  getBlockHash,
  getHead,
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
  getNextChannel,
  getNextVideo,
  getStorageBucket,
  getStorageBuckets,
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

export class StatisticsCollector {
  private api?: ApiPromise;
  private blocksEventsCache: Map<number, CacheEvent[]>;
  private statistics: Statistics;
  private groups = [
    // map chain prefix to group tag
    ["contentWorkingGroup", "Curators", "curators"],
    ["storageWorkingGroup", "Storage Providers", "storageProviders"],
    ["distributionWorkingGroup", "Distribution", "distribution"],
    //["gatewayWorkingGroup", "Gateways", "gateways"],
    ["operationsWorkingGroupAlpha", "Operations", "operationsGroupAlpha"],
    ["operationsWorkingGroupBeta", "Marketing", "operationsGroupBeta"],
    ["operationsWorkingGroupGamma", "Gamma", "operationsGroupGamma"],
  ];

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

  async getStats(
    startBlock: number,
    endBlock: number,
    config: Config
  ): Promise<Statistics> {
    const { cacheDir, providerUrl, statusUrl } = config;
    this.api = await connectApi(providerUrl);

    const aboveHead = endBlock - Number(await getHead(this.api));
    if (aboveHead > 0) {
      console.log(`End Block is above our Head, wait ${aboveHead} blocks.`);
      return this.statistics;
    }

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

    // run long running tasks in parallel first
    await Promise.all([
      this.buildBlocksEventCache(startBlock, endBlock, cacheDir).then(() =>
        this.fillStats(startBlock, endBlock, startHash, endHash, config)
      ),
      this.getFiatEvents(startBlock, endBlock, statusUrl),
      this.fillMediaUploadInfo(startHash, endHash),
    ]);
    this.api.disconnect();
    return this.statistics;
  }

  fillStats(
    startBlock: number,
    endBlock: number,
    startHash: Hash,
    endHash: Hash,
    config: Config
  ): Promise<void[]> {
    eventStats(this.blocksEventsCache); // print event stats
    return Promise.all([
      this.fillTokenInfo(startBlock, endBlock, startHash, endHash, config),
      this.fillMintsInfo([startHash, endHash]),
      this.fillCouncilInfo(startHash, endHash, config.councilRoundOffset),
      this.fillCouncilElectionInfo(startBlock),
      this.fillValidatorInfo(startHash, endHash),
      this.fillMembershipInfo(startHash, endHash),
      this.fillForumInfo(startHash, endHash),
      this.fillWorkingGroupsInfo([startHash, endHash]),
    ]);
  }

  async getApprovedBounties(file: string): Promise<Bounty[]> {
    try {
      await fs.access(file, constants.R_OK);
    } catch {
      console.warn("File with spending proposal categories not found: ${file}");
    }
    const proposals = fsSync
      .readFileSync(file, "utf-8")
      .split("\n")
      .map((line: string) => line.split(","))
      .filter((fields: string[]) => fields.length === 12)
      .slice(1);
    console.log(`Loaded ${proposals.length} proposals.`);
    return proposals
      .filter(
        (line: string[]) => line[3] === "Approved" && line[8] === "Bounties"
      )
      .map((bounty: string[]) => {
        return new Bounty(
          bounty[0],
          Number(bounty[1]),
          bounty[2],
          bounty[3],
          Number(bounty[4]),
          Number(bounty[5])
        );
      });
  }

  fillSudoSetBalance() {
    let balancesSetByRoot = 0;
    this.filterCache(filterMethods.sudoSetBalance).map(([block, events]) =>
      events.forEach(({ data }) => {
        balancesSetByRoot += Number(data[1]);
      })
    );
    this.saveStats({ balancesSetByRoot });
  }

  async fillTokenInfo(
    startBlock: number,
    endBlock: number,
    startHash: Hash,
    endHash: Hash,
    config: Config
  ): Promise<void> {
    const { burnAddress } = config;
    const proposalsFile = config.repoDir + config.spendingCategoriesFile;
    const startIssuance = (await getIssuance(this.api, startHash)).toNumber();
    const endIssuance = (await getIssuance(this.api, endHash)).toNumber();
    const burnEvents = this.filterCache(filterMethods.getBurnedTokens);
    this.saveStats({
      startIssuance,
      endIssuance,
      newIssuance: endIssuance - startIssuance,
      percNewIssuance: getPercent(startIssuance, endIssuance),
      newTokensBurn: await getBurnedTokens(burnAddress, burnEvents),
    });
    this.fillSudoSetBalance();

    // bounties
    const bounties = await this.getApprovedBounties(proposalsFile);
    console.log(bounties.length, `bounties found`);
    const blocks = this.filterCache(filterMethods.finalizedSpendingProposals);
    const spendingProposals: SpendingProposal[] =
      await getFinalizedSpendingProposals(this.api, blocks);
    let bountiesTotalPaid = 0;
    for (let { proposalId } of bounties) {
      const bounty = spendingProposals.find(({ id }) => +id === +proposalId);
      if (!bounty) continue; // not in this period
      const { amount, title } = bounty;
      bountiesTotalPaid += amount;
      console.log(`Bounty: ${amount} ${title}`);
    }

    if (!spendingProposals.length || !bountiesTotalPaid) {
      const file = require("path").resolve(proposalsFile);
      console.log(`\n!!! Please update\n!!! ${file}\n\nFiltering by title:`);
      for (const { title, amount } of spendingProposals) {
        if (!title.toLowerCase().includes("bounty")) continue;
        bountiesTotalPaid += amount;
        console.log(` - ${title}: ${amount}`);
      }
    }
    console.log(`Paid for bounties: ${bountiesTotalPaid}\n`);
    this.saveStats({ bountiesTotalPaid });
    const spent = spendingProposals.reduce((n, p) => n + p.amount, 0);
    const newCouncilRewards = (
      await this.computeCouncilReward(endBlock - startBlock, endHash)
    ).toFixed(2);
    this.saveStats({ spendingProposalsTotal: spent, newCouncilRewards });
  }

  //
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

    const nrCouncilMembers = ((await getCouncil(this.api)) as Seats).length;
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

  // Generate mint stats and WG sections
  fillWorkingGroupsInfo(range: Hash[]) {
    const promises = this.groups.map((group: string[], i: number) =>
      this.groupStats(group, range, i).then((stats) => this.groupSection(stats))
    );
    Promise.all(promises).then((sections) =>
      this.saveStats({ workingGroups: sections.join("\n\n") })
    );
  }

  // Generate WG markdown
  groupSection({ workers, stakes, workersTable, index, labels }: WorkersInfo) {
    const [chainName, tag, pioneerName] = labels;
    return `### 4.${index + 2} ${tag}
* [openings for ${chainName}](https://testnet.joystream.org/#/working-groups/opportunities/${pioneerName})

| Property                | Start Block | End Block | % Change |
|-------------------------|--------------|--------------|----------|
| Number of  Workers | ${workers.start} | ${workers.end} | ${workers.change} |
| Total  Stake | ${stakes.start} | ${stakes.end} | ${stakes.change} |

${workersTable}`;
  }

  // Summarize stakes and rewards at start and end
  async groupStats(
    labels: string[],
    range: Hash[],
    index: number
  ): Promise<WorkersInfo> {
    const [startHash, endHash] = range;
    const [group, tag] = labels;
    let workers = { start: 0, end: 0, change: 0 };
    let stakes = { start: 0, end: 0, change: 0 };
    const workersStart: WorkerReward[] = await getWorkerRewards(
      this.api,
      group,
      startHash
    );
    workers.start = workersStart.length;
    stakes.start = sum(workersStart.map(({ stake }) => +stake?.value || 0));
    const workersEnd: WorkerReward[] = await getWorkerRewards(
      this.api,
      group,
      endHash
    );
    workers.end = workersEnd.length;
    workers.change = getPercent(workers.start, workers.end);
    let workerRows = ``; // rewards table
    workersEnd.forEach(async (worker) => {
      if (worker.stake) stakes.end += worker.stake.value.toNumber();
      if (!worker.reward) return;
      let earnedBefore = 0;
      const hired = workersStart.find((w) => w.id === worker.id);
      if (hired) earnedBefore = hired.reward.total_reward_received.toNumber();
      workerRows += getWorkerRow(worker, earnedBefore);
    });
    stakes.change = getPercent(stakes.start, stakes.end);
    const workersTable = this.workersTable(workerRows);
    return { labels, index, workers, stakes, workersTable };
  }

  workersTable(rows: string) {
    if (!rows.length) return ``;
    return `| # | Member | Status | tJOY / Block | M tJOY Term | M tJOY total |\n|--|--|--|--|--|--|\n${rows}`;
  }

  async fillMintsInfo(range: Hash[]): Promise<void> {
    const [startHash, endHash] = range;
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
    const councilStats = await getCouncilMint(this.api, endHash).then(
      async (id) => this.mintStats(this.api, id, range)
    );
    const { start, end, diff, change } = councilStats;
    let tokenomics = `| Council | ${diff} |\n`;
    let mintStats = `| Council Total Minted | ${start} | ${end} | ${diff} | ${change} |\n`;

    // Calculate WG Mint Growth
    const promises = this.groups.map(async ([group, tag]: string[]) => {
      const id = await getGroupMint(this.api, group);
      const stats = await this.mintStats(this.api, id, range);
      const { start, end, diff, change } = stats;
      tokenomics += `| ${tag} | ${diff} |\n`;
      mintStats += `| ${tag} Minted | ${start} | ${end} | ${diff} | ${change} |\n`;
    });
    Promise.all(promises).then(() => this.saveStats({ mintStats, tokenomics }));
  }

  // Calculate growth
  async mintStats(
    api: ApiPromise,
    mintId: MintId,
    range: Hash[]
  ): Promise<MintStats> {
    const [startHash, endHash] = range;
    const startMint: Mint = await getMint(api, startHash, mintId);
    const endMint: Mint = await getMint(api, endHash, mintId);
    const start = getTotalMinted(startMint);
    const end = getTotalMinted(endMint);
    return this.formatChange(start, end);
  }

  async fillCouncilInfo(
    startHash: Hash,
    endHash: Hash,
    councilRoundOffset: number
  ): Promise<void> {
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
      councilRound: round - councilRoundOffset,
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

    let election = {
      electionApplicants: 0,
      electionApplicantsStakes: 0,
      electionVotes: 0,
    };
    if (!isStartBlockFirstCouncilBlock) {
      this.saveStats(election);
      return console.warn(
        "Note: The given start block is not the first block of the council round so council election information will be empty"
      );
    }

    let lastBlockHash = await getBlockHash(this.api, startBlock - 1);
    let applicants: Vec<AccountId> = await getCouncilApplicants(
      this.api,
      lastBlockHash
    );
    let electionApplicantsStakes = 0;
    for (let applicant of applicants) {
      const stake: ElectionStake = await getCouncilApplicantStakes(
        this.api,
        lastBlockHash,
        applicant
      );
      electionApplicantsStakes += +stake.new + +stake.transferred;
    }
    election.electionApplicants = applicants.length;
    election.electionVotes = await getCouncilCommitments(
      this.api,
      lastBlockHash
    ).then((votes: Vec<Hash>) => votes.length);
    election.electionApplicantsStakes = electionApplicantsStakes;
    this.saveStats(election);
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
    console.log(`Collecting Media stats`);
    const startMedia = Number(await getNextVideo(this.api, startHash));
    const endMedia = Number(await getNextVideo(this.api, endHash));
    const startChannels = Number(await getNextChannel(this.api, startHash));
    const endChannels = Number(await getNextChannel(this.api, endHash));

    // count size
    getStorageBuckets(this.api).then(
      async (buckets: Map<StorageBucketId, StorageBucket>) => {
        let startUsedSpace = 0;
        let endUsedSpace = 0;
        for (const [id, bucket] of buckets) {
          const atStart = await getStorageBucket(this.api, id, startHash);
          const atEnd = await getStorageBucket(this.api, id, endHash);
          const growth =
            atEnd.voucher.sizeUsed.toNumber() -
            atStart.voucher.sizeUsed.toNumber();

          startUsedSpace += atStart.voucher.sizeUsed.toNumber() / 1024 / 1024;
          endUsedSpace += atEnd.voucher.sizeUsed.toNumber() / 1024 / 1024;
        }
        console.log(`space start, end`, startUsedSpace, endUsedSpace);
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
    );
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

  async getFiatEvents(
    startBlockHeight: number,
    endBlockHeight: number,
    statusUrl: string
  ) {
    let sumerGenesis = new Date("2021-04-07T18:20:54.000Z");

    console.log("Fetching fiat events....");
    await axios.get(statusUrl).then(({ data }) => {
      const { burns, exchanges, dollarPoolChanges } = data as StatusData;

      console.log("# Exchanges");
      let filteredExchanges = exchanges.filter(
        (exchange) =>
          exchange.blockHeight >= startBlockHeight &&
          exchange.blockHeight <= endBlockHeight &&
          new Date(exchange.date) > sumerGenesis
      );

      for (let filteredExchange of filteredExchanges) {
        console.log(
          `Block: ${filteredExchange.blockHeight}, USD: ${filteredExchange.amountUSD}`
        );
      }

      let filteredBurns = burns.filter(
        (burn: any) =>
          burn.blockHeight >= startBlockHeight &&
          burn.blockHeight <= endBlockHeight &&
          new Date(burn.date) > sumerGenesis
      );
      if (filteredBurns.length) {
        console.log("# Burns");
        filteredBurns.forEach(({ blockHeight, amount }) =>
          console.log(`Block: ${blockHeight}, tJOY: ${amount}`)
        );
      }

      console.log("# Dollar Pool Changes");
      const allDollarPoolChanges = dollarPoolChanges.filter(
        (dollarPoolChange: any) =>
          dollarPoolChange.blockHeight >= startBlockHeight &&
          dollarPoolChange.blockHeight <= endBlockHeight &&
          new Date(dollarPoolChange.blockTime) > sumerGenesis
      );
      const filteredDollarPoolChanges = dollarPoolChanges.filter(
        (dollarPoolChange: any) =>
          dollarPoolChange.blockHeight >= startBlockHeight &&
          dollarPoolChange.blockHeight <= endBlockHeight &&
          dollarPoolChange.change > 0 &&
          new Date(dollarPoolChange.blockTime) > sumerGenesis
      );

      let dollarPoolRefills = ``;
      if (filteredDollarPoolChanges.length > 0) {
        dollarPoolRefills =
          "| Refill, USD | Reason | Block # |\n|---------------------|--------------|--------------|\n";
        filteredDollarPoolChanges.forEach(({ blockHeight, change, reason }) => {
          console.log(
            `Block: ${blockHeight}, USD: ${change}, Reason: ${reason}`
          );
          dollarPoolRefills += `| ${change} | ${reason} | ${blockHeight} |\n`;
        });
      }

      // calculate inflation
      let [rateStart, rateEnd, fiatStart, fiatEnd] = [0, 0, 0, 0];
      if (filteredExchanges.length) {
        const lastExchangeEvent =
          filteredExchanges[filteredExchanges.length - 1];
        rateStart = filteredExchanges[0].price * 1000000;
        rateEnd = lastExchangeEvent.price * 1000000;
      } else if (filteredDollarPoolChanges.length) {
        rateStart = filteredDollarPoolChanges[0].rateAfter * 1000000;
        const lastEvent =
          filteredDollarPoolChanges[filteredDollarPoolChanges.length - 1];
        rateEnd = lastEvent.rateAfter * 1000000;
      }

      // dollar pool size
      if (allDollarPoolChanges.length) {
        fiatStart =
          allDollarPoolChanges[0].change > 0
            ? allDollarPoolChanges[0].valueAfter -
              allDollarPoolChanges[0].change
            : allDollarPoolChanges[0].valueAfter;
        const endDollarEvent =
          allDollarPoolChanges[allDollarPoolChanges.length - 1];
        fiatEnd = endDollarEvent.valueAfter;
      }
      const fiat = this.formatChangePrefix(fiatStart, fiatEnd, "fiat");
      const rate = this.formatChangePrefix(rateStart, rateEnd, "price");
      rate.priceChange = -1 * +rate.priceChange; // rate increase means deflation
      console.log(
        "# USD / 1M tJOY Rate\n",
        `@ Term start (block #${startBlockHeight}: ${rate.priceStart}\n`,
        `@ Term end (block #${endBlockHeight}: ${rate.priceEnd}\n`,
        `Inflation: ${rate.priceChange}`
      );
      this.saveStats({ ...fiat, ...rate, dollarPoolRefills });
    });
  }

  formatChange(input: number, output: number): MintStats {
    const diff = output - input;
    const change = getPercent(input, output);
    return { start: input.toFixed(2), end: output.toFixed(2), diff, change };
  }

  formatChangePrefix(
    input: number,
    output: number,
    pre: string
  ): { [key: string]: string | number } {
    const diff = output - input;
    const change = getPercent(input, output);
    return {
      [`${pre}Start`]: input.toFixed(2),
      [`${pre}End`]: output.toFixed(2),
      [`${pre}Diff`]: diff,
      [`${pre}Change`]: change,
    };
  }

  async buildBlocksEventCache(
    startBlock: number,
    endBlock: number,
    cacheDir: string
  ): Promise<void> {
    const cacheFile = `${cacheDir}/${startBlock}-${endBlock}.json`;
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
    }
  }
}
