import {ApiPromise, WsProvider} from "@polkadot/api";
import {types} from '@joystream/types'
import {
    AccountId,
    Balance,
    BalanceOf,
    BlockNumber,
    EraIndex,
    EventRecord,
    Hash,
    Moment
} from "@polkadot/types/interfaces";

import {
    CacheEvent,
    Exchange,
    Media,
    MintStatistics,
    Statistics,
    ValidatorReward, WorkersInfo, Channel, SpendingProposals, Bounty
} from "./types";

import {Option, u32, Vec} from "@polkadot/types";
import {ElectionStake, SealedVote, Seats} from "@joystream/types/council";
import {Mint, MintId} from "@joystream/types/mint";
import {ContentId, DataObject} from "@joystream/types/media";


import Linkage from "@polkadot/types/codec/Linkage";
import {ChannelId, PostId, ThreadId} from "@joystream/types/common";
import {CategoryId} from "@joystream/types/forum";

import {MemberId, Membership} from "@joystream/types/members";
import {RewardRelationship, RewardRelationshipId} from "@joystream/types/recurring-rewards";

import workingGroup from "@joystream/types/src/working-group/index";
import {Stake} from "@joystream/types/stake";

import {WorkerId} from "@joystream/types/working-group";
import {Entity, EntityId, PropertyType} from "@joystream/types/content-directory";
import {ProposalDetails, ProposalId, Video, VideoId, WorkerOf} from "@joystream/types/augment-codec/all";
import {SpendingParams} from "@joystream/types/proposals";
import * as constants from "constants";

const fsSync = require('fs');
const fs = fsSync.promises;
const parse = require('csv-parse/lib/sync');

const BURN_ADDRESS = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMaeKQu';

const COUNCIL_ROUND_OFFSET = 2;
const PROVIDER_URL = "ws://localhost:9944";

const CACHE_FOLDER = "cache";
const WORKER_ID_OFFSET = 0;

const VIDEO_CLASS_iD = 10;
const CHANNEL_CLASS_iD = 1;

export class StatisticsCollector {

    private api?: ApiPromise;
    private blocksEventsCache: Map<number, CacheEvent[]>;
    private statistics: Statistics;

    constructor() {
        this.blocksEventsCache = new Map<number, CacheEvent[]>();
        this.statistics = new Statistics();
    }

    async getStatistics(startBlock: number, endBlock: number): Promise<Statistics> {
        this.api = await StatisticsCollector.connectApi();

        let startHash = (await this.api.rpc.chain.getBlockHash(startBlock)) as Hash;
        let endHash = (await this.api.rpc.chain.getBlockHash(endBlock)) as Hash;

        this.statistics.startBlock = startBlock;
        this.statistics.endBlock = endBlock;
        this.statistics.newBlocks = endBlock - startBlock;
        this.statistics.percNewBlocks = StatisticsCollector.convertToPercentage(startBlock, endBlock);
        await this.buildBlocksEventCache(startBlock, endBlock);
        await this.fillBasicInfo(startHash, endHash);
        await this.fillTokenGenerationInfo(startBlock, endBlock, startHash, endHash);
        await this.fillMintsInfo(startHash, endHash);
        await this.fillCouncilInfo(startHash, endHash);
        await this.fillCouncilElectionInfo(startBlock);
        await this.fillValidatorInfo(startHash, endHash);
        await this.fillStorageProviderInfo(startBlock, endBlock, startHash, endHash);
        await this.fillCuratorInfo(startHash, endHash);
        await this.fillMembershipInfo(startHash, endHash);
        await this.fillMediaUploadInfo(startHash, endHash);
        await this.fillForumInfo(startHash, endHash);

        await this.api.disconnect();
        return this.statistics;
    }

    async getApprovedBounties() {
        let bountiesFilePath = __dirname + '/../bounties.csv';
        try {
            await fs.access(bountiesFilePath, constants.R_OK);
        } catch {
            throw new Error('Bounties CSV file not found');
        }

        const fileContent = await fs.readFile(bountiesFilePath);
        const rawBounties = parse(fileContent);
        rawBounties.shift();

        let bounties = rawBounties.map((rawBounty: any) => {
            return new Bounty(rawBounty[0], rawBounty[1], rawBounty[2], rawBounty[3], rawBounty[4], rawBounty[5]);
        });

        return bounties.filter((bounty: Bounty) => bounty.status == "Approved" && bounty.testnet == "Antioch");
    }

    async getSpendingProposals(): Promise<Array<SpendingProposals>> {
        let spendingProposals = new Array<SpendingProposals>();
        for (let [key, blockEvents] of this.blocksEventsCache) {
            let validatorRewards = blockEvents.filter((event) => {
                return event.section == "staking" && event.method == "Reward";
            });
            for (let validatorReward of validatorRewards) {
                this.statistics.newValidatorRewards += Number(validatorReward.data[1]);
            }

            let transfers = blockEvents.filter((event) => {
                return event.section == "balances" && event.method == "Transfer";
            });
            for (let transfer of transfers) {
                let receiver = transfer.data[1] as AccountId;
                let amount = transfer.data[2] as Balance;
                if (receiver.toString() == BURN_ADDRESS) {
                    this.statistics.newTokensBurn = Number(amount);
                }
            }

            let proposalEvents = blockEvents.filter((event) => {
                return event.section == "proposalsEngine" && event.method == "ProposalStatusUpdated";
            });

            for (let proposalEvent of proposalEvents) {
                let statusUpdateData = proposalEvent.data[1] as any;
                if (!(statusUpdateData.finalized && statusUpdateData.finalized.finalizedAt)) {
                    continue;
                }
                let proposalId = proposalEvent.data[0] as ProposalId;
                let proposalDetail = await this.api.query.proposalsCodex.proposalDetailsByProposalId(proposalId) as ProposalDetails;
                if (!proposalDetail.isOfType("Spending")) {
                    continue;
                }
                let spendingParams = Array.from(proposalDetail.asType("Spending") as SpendingParams);
                spendingProposals.push(new SpendingProposals(Number(proposalId), Number(spendingParams[0])));
            }
        }
        return spendingProposals;
    }

    async fillBasicInfo(startHash: Hash, endHash: Hash) {
        let startDate = (await this.api.query.timestamp.now.at(startHash)) as Moment;
        let endDate = (await this.api.query.timestamp.now.at(endHash)) as Moment;
        this.statistics.dateStart = new Date(startDate.toNumber()).toLocaleDateString("en-US");
        this.statistics.dateEnd = new Date(endDate.toNumber()).toLocaleDateString("en-US");
    }

    async fillTokenGenerationInfo(startBlock: number, endBlock: number, startHash: Hash, endHash: Hash) {
        this.statistics.startIssuance = (await this.api.query.balances.totalIssuance.at(startHash) as Balance).toNumber();
        this.statistics.endIssuance = (await this.api.query.balances.totalIssuance.at(endHash) as Balance).toNumber();
        this.statistics.newIssuance = this.statistics.endIssuance - this.statistics.startIssuance;
        this.statistics.percNewIssuance = StatisticsCollector.convertToPercentage(this.statistics.startIssuance, this.statistics.endIssuance);

        let bounties = await this.getApprovedBounties();
        let spendingProposals = await this.getSpendingProposals();

        this.statistics.bountiesTotalPaid = 0;
        for (let bounty of bounties) {
            let bountySpendingProposal = spendingProposals.find((spendingProposal) => spendingProposal.id == bounty.proposalId);
            if (bountySpendingProposal) {
                this.statistics.bountiesTotalPaid += bountySpendingProposal.spentAmount;
            }
        }

        this.statistics.spendingProposalsTotal = spendingProposals.reduce((n, spendingProposal) => n + spendingProposal.spentAmount, 0);

        let roundNrBlocks = endBlock - startBlock;
        this.statistics.newCouncilRewards = await this.computeCouncilReward(roundNrBlocks, endHash);
        this.statistics.newCouncilRewards = Number(this.statistics.newCouncilRewards.toFixed(2));

        this.statistics.newCuratorRewards = await this.computeCuratorsReward(roundNrBlocks, startHash, endHash);
        this.statistics.newCuratorRewards = Number(this.statistics.newCuratorRewards.toFixed(2));
    }

    async computeCouncilReward(roundNrBlocks: number, endHash: Hash): Promise<number> {
        const payoutInterval = Number((await this.api.query.council.payoutInterval.at(endHash) as Option<BlockNumber>).unwrapOr(0));
        const amountPerPayout = (await this.api.query.council.amountPerPayout.at(endHash) as BalanceOf).toNumber();

        const announcing_period = (await this.api.query.councilElection.announcingPeriod.at(endHash)) as BlockNumber;
        const voting_period = (await this.api.query.councilElection.votingPeriod.at(endHash)) as BlockNumber;
        const revealing_period = (await this.api.query.councilElection.revealingPeriod.at(endHash)) as BlockNumber;
        const new_term_duration = (await this.api.query.councilElection.newTermDuration.at(endHash)) as BlockNumber;

        const termDuration = new_term_duration.toNumber();
        const votingPeriod = voting_period.toNumber();
        const revealingPeriod = revealing_period.toNumber();
        const announcingPeriod = announcing_period.toNumber();

        const nrCouncilMembers = (await this.api.query.council.activeCouncil.at(endHash) as Seats).length
        const totalCouncilRewardsPerBlock = (amountPerPayout && payoutInterval)
            ? (amountPerPayout * nrCouncilMembers) / payoutInterval
            : 0;

        const councilTermDurationRatio = termDuration / (termDuration + votingPeriod + revealingPeriod + announcingPeriod);
        const avgCouncilRewardPerBlock = councilTermDurationRatio * totalCouncilRewardsPerBlock;

        return avgCouncilRewardPerBlock * roundNrBlocks;
    }

    async computeStorageProviderReward(roundNrBlocks: number, startHash: Hash, endHash: Hash): Promise<WorkersInfo> {
        let nextWorkerId = (await this.api.query.storageWorkingGroup.nextWorkerId.at(startHash) as WorkerId).toNumber();
        let info = new WorkersInfo();
        for (let i = 0; i < nextWorkerId; ++i) {
            let worker = await this.api.query.storageWorkingGroup.workerById(i) as WorkerOf;
            if (worker.role_stake_profile.isSome) {
                let roleStakeProfile = worker.role_stake_profile.unwrap();
                let stake = await this.api.query.stake.stakes(roleStakeProfile.stake_id) as Stake;
                info.startStake += stake.value.toNumber();
            }
        }

        nextWorkerId = (await this.api.query.storageWorkingGroup.nextWorkerId.at(endHash) as WorkerId).toNumber();
        let rewardRelationshipIds = Array<RewardRelationshipId>();

        for (let i = 0; i < nextWorkerId; ++i) {
            let worker = await this.api.query.storageWorkingGroup.workerById(i) as WorkerOf;
            if (worker.reward_relationship.isSome) {
                rewardRelationshipIds.push(worker.reward_relationship.unwrap());
            }
            if (worker.role_stake_profile.isSome) {
                let roleStakeProfile = worker.role_stake_profile.unwrap();
                let stake = await this.api.query.stake.stakes(roleStakeProfile.stake_id) as Stake;
                info.endStake += stake.value.toNumber();
            }
        }
        info.rewards = await this.computeReward(roundNrBlocks, rewardRelationshipIds, endHash);
        info.endNrOfWorkers = nextWorkerId - WORKER_ID_OFFSET;
        return info;
    }

    async computeCuratorsReward(roundNrBlocks: number, startHash: Hash, endHash: Hash) {
        let nextCuratorId = (await this.api.query.contentDirectoryWorkingGroup.nextWorkerId.at(endHash) as WorkerId).toNumber();

        let rewardRelationshipIds = Array<RewardRelationshipId>();
        for (let i = 0; i < nextCuratorId; ++i) {
            let worker = await this.api.query.contentDirectoryWorkingGroup.workerById(i) as WorkerOf;
            if (worker.reward_relationship.isSome) {
                rewardRelationshipIds.push(worker.reward_relationship.unwrap());
            }
        }
        return this.computeReward(roundNrBlocks, rewardRelationshipIds, endHash);
    }

    async computeReward(roundNrBlocks: number, rewardRelationshipIds: RewardRelationshipId[], hash: Hash) {
        let recurringRewards = await Promise.all(rewardRelationshipIds.map(async (rewardRelationshipId) => {
            return await this.api.query.recurringRewards.rewardRelationships.at(hash, rewardRelationshipId) as RewardRelationship;
        }));

        let rewardPerBlock = 0;
        for (let recurringReward of recurringRewards) {
            const amount = recurringReward.amount_per_payout.toNumber();
            const payoutInterval = recurringReward.payout_interval.unwrapOr(null);

            if (amount && payoutInterval) {
                rewardPerBlock += amount / payoutInterval;
            }

        }
        return rewardPerBlock * roundNrBlocks;
    }

    async fillMintsInfo(startHash: Hash, endHash: Hash) {
        let startNrMints = parseInt((await this.api.query.minting.mintsCreated.at(startHash)).toString());
        let endNrMints = parseInt((await this.api.query.minting.mintsCreated.at(endHash)).toString());

        this.statistics.newMints = endNrMints - startNrMints;
        // statistics.startMinted = 0;
        // statistics.endMinted = 0;
        for (let i = 0; i < startNrMints; ++i) {
            let startMint = (await this.api.query.minting.mints.at(startHash, i)) as Mint;
            // if (!startMint) {
            //     continue;
            // }

            let endMint = (await this.api.query.minting.mints.at(endHash, i)) as Mint;
            // let  = endMintResult[0];
            // if (!endMint) {
            //     continue;
            // }

            let startMintTotal = parseInt(startMint.getField("total_minted").toString());
            let endMintTotal = parseInt(endMint.getField("total_minted").toString());

            // statistics.startMinted += startMintTotal;

            this.statistics.totalMinted += endMintTotal - startMintTotal;
            this.statistics.totalMintCapacityIncrease += parseInt(endMint.getField("capacity").toString()) - parseInt(startMint.getField("capacity").toString());
        }

        for (let i = startNrMints; i < endNrMints; ++i) {
            let endMint = await this.api.query.minting.mints.at(endHash, i) as Mint;
            if (!endMint) {
                return;
            }
            this.statistics.totalMinted = parseInt(endMint.getField("total_minted").toString());
        }

        let councilMint = (await this.api.query.council.councilMint.at(endHash)) as MintId;
        let councilMintStatistics = await this.computeMintInfo(councilMint, startHash, endHash);

        this.statistics.startCouncilMinted = councilMintStatistics.startMinted;
        this.statistics.endCouncilMinted = councilMintStatistics.endMinted;
        this.statistics.newCouncilMinted = councilMintStatistics.diffMinted;
        this.statistics.percNewCouncilMinted = councilMintStatistics.percMinted;
        6
        let curatorMint = (await this.api.query.contentDirectoryWorkingGroup.mint.at(endHash)) as MintId;
        let curatorMintStatistics = await this.computeMintInfo(curatorMint, startHash, endHash);
        this.statistics.startCuratorMinted = curatorMintStatistics.startMinted;
        this.statistics.endCuratorMinted = curatorMintStatistics.endMinted;
        this.statistics.newCuratorMinted = curatorMintStatistics.diffMinted;
        this.statistics.percCuratorMinted = curatorMintStatistics.percMinted;

        let storageProviderMint = (await this.api.query.storageWorkingGroup.mint.at(endHash)) as MintId;
        let storageProviderMintStatistics = await this.computeMintInfo(storageProviderMint, startHash, endHash);
        this.statistics.startStorageMinted = storageProviderMintStatistics.startMinted;
        this.statistics.endStorageMinted = storageProviderMintStatistics.endMinted;
        this.statistics.newStorageMinted = storageProviderMintStatistics.diffMinted;
        this.statistics.percStorageMinted = storageProviderMintStatistics.percMinted;
    }


    async computeMintInfo(mintId: MintId, startHash: Hash, endHash: Hash): Promise<MintStatistics> {
        // if (mintId.toString() == "0") {
        //     return new MintStatistics(0, 0, 0);
        // }
        let startMint = await this.api.query.minting.mints.at(startHash, mintId) as Mint;
        // let startMint = startMintResult[0] as unknown as Mint;
        // if (!startMint) {
        //     return new MintStatistics(0, 0, 0);
        // }

        let endMint = await this.api.query.minting.mints.at(endHash, mintId) as Mint;
        // let endMint = endMintResult[0] as unknown as Mint;
        // if (!endMint) {
        //     return new MintStatistics(0, 0, 0);
        // }

        let mintStatistics = new MintStatistics();
        mintStatistics.startMinted = parseInt(startMint.getField('total_minted').toString());
        mintStatistics.endMinted = parseInt(endMint.getField('total_minted').toString());
        mintStatistics.diffMinted = mintStatistics.endMinted - mintStatistics.startMinted;
        mintStatistics.percMinted = StatisticsCollector.convertToPercentage(mintStatistics.startMinted, mintStatistics.endMinted);
        return mintStatistics;
    }

    async fillCouncilInfo(startHash: Hash, endHash: Hash) {
        this.statistics.councilRound = (await this.api.query.councilElection.round.at(startHash) as u32).toNumber() - COUNCIL_ROUND_OFFSET;
        this.statistics.councilMembers = (await this.api.query.councilElection.councilSize.at(startHash) as u32).toNumber();
        let startNrProposals = await this.api.query.proposalsEngine.proposalCount.at(startHash) as u32;
        let endNrProposals = await this.api.query.proposalsEngine.proposalCount.at(endHash) as u32;
        this.statistics.newProposals = endNrProposals.toNumber() - startNrProposals.toNumber();

        let approvedProposals = new Set();
        for (let [key, blockEvents] of this.blocksEventsCache) {
            for (let event of blockEvents) {
                if (event.section == "proposalsEngine" && event.method == "ProposalStatusUpdated") {
                    let statusUpdateData = event.data[1] as any;
                    let finalizeData = statusUpdateData.finalized as any
                    if (finalizeData && finalizeData.proposalStatus.approved) {
                        approvedProposals.add(Number(event.data[0]));
                    }

                }
            }
        }

        this.statistics.newApprovedProposals = approvedProposals.size;
    }

    async fillCouncilElectionInfo(startBlock: number) {

        let startBlockHash = await this.api.rpc.chain.getBlockHash(startBlock);
        let events = await this.api.query.system.events.at(startBlockHash) as Vec<EventRecord>;
        let isStartBlockFirstCouncilBlock = events.some((event) => {
            return event.event.section == "councilElection" && event.event.method == "CouncilElected";
        });

        if (!isStartBlockFirstCouncilBlock) {
            console.warn('Note: The given start block is not the first block of the council round so council election information will be empty');
            return;
        }
        let previousCouncilRoundLastBlock = startBlock - 1;
        let previousCouncilRoundLastBlockHash = await this.api.rpc.chain.getBlockHash(previousCouncilRoundLastBlock);

        let applicants = await this.api.query.councilElection.applicants.at(previousCouncilRoundLastBlockHash) as Vec<AccountId>;
        this.statistics.electionApplicants = applicants.length;
        for (let applicant of applicants) {
            let applicantStakes = await this.api.query.councilElection.applicantStakes.at(previousCouncilRoundLastBlockHash, applicant) as unknown as ElectionStake;
            this.statistics.electionApplicantsStakes += applicantStakes.new.toNumber();
        }
        // let seats = await this.api.query.council.activeCouncil.at(startBlockHash) as Seats;
        //TODO: Find a more accurate way of getting the votes
        const votes = await this.api.query.councilElection.commitments.at(previousCouncilRoundLastBlockHash) as Vec<Hash>;
        this.statistics.electionVotes = votes.length;
    }

    async fillValidatorInfo(startHash: Hash, endHash: Hash) {
        let startTimestamp = await this.api.query.timestamp.now.at(startHash) as unknown as Moment;
        let endTimestamp = await this.api.query.timestamp.now.at(endHash) as unknown as Moment;
        let avgBlockProduction = (((endTimestamp.toNumber() - startTimestamp.toNumber())
            / 1000) / this.statistics.newBlocks);
        this.statistics.avgBlockProduction = Number(avgBlockProduction.toFixed(2));

        let maxStartValidators = (await this.api.query.staking.validatorCount.at(startHash) as u32).toNumber();
        let startValidators = await this.findActiveValidators(startHash, false);
        this.statistics.startValidators = startValidators.length + " / " + maxStartValidators;

        let maxEndValidators = (await this.api.query.staking.validatorCount.at(endHash) as u32).toNumber();
        let endValidators = await this.findActiveValidators(endHash, true);
        this.statistics.endValidators = endValidators.length + " / " + maxEndValidators;

        this.statistics.percValidators = StatisticsCollector.convertToPercentage(startValidators.length, endValidators.length);

        const startEra = await this.api.query.staking.currentEra.at(startHash) as Option<EraIndex>;
        this.statistics.startValidatorsStake = (await this.api.query.staking.erasTotalStake.at(startHash, startEra.unwrap())).toNumber();

        const endEra = await this.api.query.staking.currentEra.at(endHash) as Option<EraIndex>;
        this.statistics.endValidatorsStake = (await this.api.query.staking.erasTotalStake.at(endHash, endEra.unwrap())).toNumber();

        this.statistics.percNewValidatorsStake = StatisticsCollector.convertToPercentage(this.statistics.startValidatorsStake, this.statistics.endValidatorsStake);
    }

    async findActiveValidators(hash: Hash, searchPreviousBlocks: boolean): Promise<AccountId[]> {
        const block = await this.api.rpc.chain.getBlock(hash);

        let currentBlockNr = block.block.header.number.toNumber();
        let activeValidators;
        do {
            let currentHash = (await this.api.rpc.chain.getBlockHash(currentBlockNr)) as Hash;
            let allValidators = await this.api.query.staking.snapshotValidators.at(currentHash) as Option<Vec<AccountId>>;
            if (!allValidators.isEmpty) {
                let max = (await this.api.query.staking.validatorCount.at(currentHash)).toNumber();
                activeValidators = Array.from(allValidators.unwrap()).slice(0, max);
            }

            if (searchPreviousBlocks) {
                --currentBlockNr;
            } else {
                ++currentBlockNr;
            }

        } while (activeValidators == undefined);
        return activeValidators;
    }

    async fillStorageProviderInfo(startBlock: number, endBlock: number, startHash: Hash, endHash: Hash) {
        let roundNrBlocks = endBlock - startBlock;

        let storageProvidersRewards = await this.computeStorageProviderReward(roundNrBlocks, startHash, endHash);
        this.statistics.newStorageProviderReward = storageProvidersRewards.rewards;
        this.statistics.newStorageProviderReward = Number(this.statistics.newStorageProviderReward.toFixed(2));

        this.statistics.startStorageProvidersStake = storageProvidersRewards.startStake;
        this.statistics.endStorageProvidersStake = storageProvidersRewards.endStake;
        this.statistics.percNewStorageProviderStake = StatisticsCollector.convertToPercentage(this.statistics.startStorageProvidersStake, this.statistics.endStorageProvidersStake);

        this.statistics.startStorageProviders = await this.api.query.storageWorkingGroup.activeWorkerCount.at(startHash);
        this.statistics.endStorageProviders = await this.api.query.storageWorkingGroup.activeWorkerCount.at(endHash);
        this.statistics.percNewStorageProviders = StatisticsCollector.convertToPercentage(this.statistics.startStorageProviders, this.statistics.endStorageProviders);

        let lastStorageProviderId = Number(await this.api.query.storageWorkingGroup.nextWorkerId.at(endHash)) - 1;
        this.statistics.storageProviders = "";
        for (let i = lastStorageProviderId, storageProviderCount = 0; storageProviderCount < this.statistics.endStorageProviders; --i, ++storageProviderCount) {
            let storageProvider = await this.api.query.storageWorkingGroup.workerById.at(endHash, i) as WorkerOf;
            let membership = await this.api.query.members.membershipById.at(endHash, storageProvider.member_id) as Membership;
            this.statistics.storageProviders += "@" + membership.handle + " | (" + membership.root_account + ")  \n";
        }

    }

    async fillCuratorInfo(startHash: Hash, endHash: Hash) {
        this.statistics.startCurators = Number(await this.api.query.contentDirectoryWorkingGroup.activeWorkerCount.at(startHash));
        this.statistics.endCurators = Number(await this.api.query.contentDirectoryWorkingGroup.activeWorkerCount.at(endHash));
        this.statistics.percNewCurators = StatisticsCollector.convertToPercentage(this.statistics.startCurators, this.statistics.endCurators);

        let lastCuratorId = Number(await this.api.query.contentDirectoryWorkingGroup.nextWorkerId.at(endHash)) - 1;
        this.statistics.curators = "";
        for (let i = lastCuratorId, curatorCount = 0; curatorCount < this.statistics.endCurators; --i, ++curatorCount) {
            let curator = await this.api.query.contentDirectoryWorkingGroup.workerById.at(endHash, i) as WorkerOf;
            let curatorMembership = await this.api.query.members.membershipById.at(endHash, curator.member_id) as Membership;
            this.statistics.curators += "@" + curatorMembership.handle + " | (" + curatorMembership.root_account + ")  \n";
        }

    }

    async fillMembershipInfo(startHash: Hash, endHash: Hash) {
        this.statistics.startMembers = (await this.api.query.members.nextMemberId.at(startHash) as MemberId).toNumber();
        this.statistics.endMembers = (await this.api.query.members.nextMemberId.at(endHash) as MemberId).toNumber();
        this.statistics.newMembers = this.statistics.endMembers - this.statistics.startMembers;
        this.statistics.percNewMembers = StatisticsCollector.convertToPercentage(this.statistics.startMembers, this.statistics.endMembers);
    }

    async fillMediaUploadInfo(startHash: Hash, endHash: Hash) {

        let startVideos = (await this.api.query.content.nextVideoId.at(startHash) as VideoId).toNumber();
        let endVideos = (await this.api.query.content.nextVideoId.at(endHash) as VideoId).toNumber();

        this.statistics.startMedia = startVideos;
        this.statistics.endMedia = endVideos;
        this.statistics.percNewMedia = StatisticsCollector.convertToPercentage(this.statistics.startMedia, this.statistics.endMedia);

        let startChannels = (await this.api.query.content.nextChannelId.at(startHash) as ChannelId).toNumber();
        let endChannels = (await this.api.query.content.nextChannelId.at(endHash) as ChannelId).toNumber();

        this.statistics.startChannels = startChannels;
        this.statistics.endChannels = endChannels;
        this.statistics.percNewChannels = StatisticsCollector.convertToPercentage(this.statistics.startChannels, this.statistics.endChannels);

        let dataObjects = await this.api.query.dataDirectory.dataByContentId.entries() as unknown as Map<ContentId, DataObject>;

        let startObjects = new Map<ContentId, DataObject>();
        let endObjects = new Map<ContentId, DataObject>();

        const startBlock = await this.api.rpc.chain.getBlock(startHash);
        const endBlock = await this.api.rpc.chain.getBlock(endHash);

        for (let [key, dataObject] of dataObjects) {
            if (dataObject.added_at.block.toNumber() < startBlock.block.header.number.toNumber()){
                startObjects.set(key, dataObject);
                this.statistics.startUsedSpace += dataObject.size_in_bytes.toNumber() / 1024 / 1024;
            }

            if (dataObject.added_at.block.toNumber() < endBlock.block.header.number.toNumber()) {
                endObjects.set(key, dataObject);
                this.statistics.endUsedSpace += dataObject.size_in_bytes.toNumber() / 1024 / 1024;
            }
        }
        this.statistics.startUsedSpace = Number(this.statistics.startUsedSpace.toFixed(2));
        this.statistics.endUsedSpace = Number(this.statistics.endUsedSpace.toFixed(2));

        this.statistics.percNewUsedSpace = StatisticsCollector.convertToPercentage(this.statistics.startUsedSpace, this.statistics.endUsedSpace);
    }

    async fillForumInfo(startHash: Hash, endHash: Hash) {
        let startPostId = await this.api.query.forum.nextPostId.at(startHash) as PostId;
        let endPostId = await this.api.query.forum.nextPostId.at(endHash) as PostId;
        this.statistics.startPosts = startPostId.toNumber();
        this.statistics.endPosts = endPostId.toNumber();
        this.statistics.newPosts = this.statistics.endPosts - this.statistics.startPosts;
        this.statistics.percNewPosts = StatisticsCollector.convertToPercentage(this.statistics.startPosts, this.statistics.endPosts);

        let startThreadId = ((await this.api.query.forum.nextThreadId.at(startHash)) as unknown) as ThreadId;
        let endThreadId = ((await this.api.query.forum.nextThreadId.at(endHash)) as unknown) as ThreadId;
        this.statistics.startThreads = startThreadId.toNumber();
        this.statistics.endThreads = endThreadId.toNumber();
        this.statistics.newThreads = this.statistics.endThreads - this.statistics.startThreads;
        this.statistics.percNewThreads = StatisticsCollector.convertToPercentage(this.statistics.startThreads, this.statistics.endThreads);

        let startCategoryId = (await this.api.query.forum.nextCategoryId.at(startHash)) as CategoryId;
        let endCategoryId = (await this.api.query.forum.nextCategoryId.at(endHash)) as CategoryId;
        this.statistics.startCategories = startCategoryId.toNumber();
        this.statistics.endCategories = endCategoryId.toNumber();
        this.statistics.newCategories = this.statistics.endCategories - this.statistics.startCategories;
        this.statistics.perNewCategories = StatisticsCollector.convertToPercentage(this.statistics.startCategories, this.statistics.endCategories);
    }

    static convertToPercentage(previousValue: number, newValue: number): number {
        if (previousValue == 0) {
            return newValue > 0 ? Infinity : 0;
        }
        return Number((newValue * 100 / previousValue - 100).toFixed(2));
    }

    async computeUsedSpaceInMbs(contentIds: Vec<ContentId>) {
        let space = 0;
        for (let contentId of contentIds) {
            let dataObject = (await this.api.query.dataDirectory.dataObjectByContentId(contentId)) as Option<DataObject>;
            space += dataObject.unwrap().size_in_bytes.toNumber();
        }
        return space / 1024 / 1024;
    }

    async parseVideos(entities: Map<number, Entity>) {
        let videos: Media[] = [];
        for (let [key, entity] of entities) {
            if (entity.class_id.toNumber() != VIDEO_CLASS_iD || entity.values.isEmpty) {
                continue;
            }
            let values = Array.from(entity.getField('values').entries());
            if (values.length < 2 || values[2].length < 1) {
                continue;
            }

            let title = values[2][1].getValue().toString();

            videos.push(new Media(key, title));
        }

        return videos;
    }

    async parseChannels(entities: Map<number, Entity>) {
        let channels: Channel[] = [];

        for (let [key, entity] of entities) {
            if (entity.class_id.toNumber() != CHANNEL_CLASS_iD || entity.values.isEmpty) {
                continue;
            }
            let values = Array.from(entity.getField('values').entries());

            let title = values[0][1].getValue().toString();
            channels.push(new Channel(key, title));
        }
        return channels;
    }

    async getEntities(blockHash: Hash) {
        let nrEntities = ((await this.api.query.contentDirectory.nextEntityId.at(blockHash)) as EntityId).toNumber();

        let entities = new Map<number, Entity>();
        for (let i = 0; i < nrEntities; ++i) {
            let entity = await this.api.query.contentDirectory.entityById.at(blockHash, i) as Entity;

            entities.set(i, entity);
        }
        return entities;
    }

    async buildBlocksEventCache(startBlock: number, endBlock: number) {
        let cacheFile = CACHE_FOLDER + '/' + startBlock + '-' + endBlock + '.json';
        let exists = await fs.access(cacheFile, fsSync.constants.R_OK).then(() => true)
            .catch(() => false);
        // let exists = false;
        if (!exists) {
            console.log('Building events cache...');
            for (let i = startBlock; i < endBlock; ++i) {
                process.stdout.write('\rCaching block: ' + i + ' until ' + endBlock);
                const blockHash: Hash = await this.api.rpc.chain.getBlockHash(i);
                let eventRecord = await this.api.query.system.events.at(blockHash) as Vec<EventRecord>;
                let cacheEvents = new Array<CacheEvent>();
                for (let event of eventRecord) {
                    cacheEvents.push(new CacheEvent(event.event.section, event.event.method, event.event.data));
                }
                this.blocksEventsCache.set(i, cacheEvents);
            }

            console.log('\nFinish events cache...');
            await fs.writeFile(cacheFile, JSON.stringify(Array.from(this.blocksEventsCache.entries()), null, 2));
        } else {
            console.log('Cache file found, loading it...');
            let fileData = await fs.readFile(cacheFile);
            this.blocksEventsCache = new Map(JSON.parse(fileData));
            console.log('Cache file loaded...');
        }
    }

    static async connectApi(): Promise<ApiPromise> {
        // const provider = new WsProvider('wss://testnet.joystream.org:9944');
        const provider = new WsProvider(PROVIDER_URL);

        // Create the API and wait until ready
        return await ApiPromise.create({provider, types});
    }
}
