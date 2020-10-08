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
    StatisticsData,
    ValidatorReward, WorkersInfo
} from "./StatisticsData";

import {u32, Vec} from "@polkadot/types";
import {ElectionStake, SealedVote, Seats} from "@joystream/types/council";
import {Mint, MintId} from "@joystream/types/mint";
import {ContentId, DataObject} from "@joystream/types/media";
import {RoleParameters} from "@joystream/types/roles";
import {Entity, EntityId} from "@joystream/types/versioned-store";
import Option from "@polkadot/types/codec/Option";
import Linkage from "@polkadot/types/codec/Linkage";
import {PostId, ThreadId} from "@joystream/types/common";
import {CategoryId} from "@joystream/types/forum";
import {Event} from "@polkadot/types/interfaces/system/types";
import number from "@polkadot/util/is/number";
import toNumber from "@polkadot/util/hex/toNumber";
import {
    ProposalStatus,
    FinalizationData,
    ProposalDecisionStatus,
    Finalized,
    IProposalStatus, Approved
} from "@joystream/types/proposals";
import {MemberId} from "@joystream/types/members";
import {RewardRelationship, RewardRelationshipId} from "@joystream/types/recurring-rewards";
import {StorageProviderId, WorkerId, Worker, RoleStakeProfile} from "@joystream/types/working-group";
import workingGroup from "@joystream/types/src/working-group/index";
import {Stake} from "@joystream/types/stake";
import {ChannelId} from "@joystream/types/content-working-group";

const fsSync = require('fs');
const fs = fsSync.promises;

const BURN_ADDRESS = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMaeKQu';

const COUNCIL_ROUND_OFFSET = 5;
const PROVIDER_URL = "ws://localhost:9944";

const CACHE_FOLDER = "cache";
const WORKER_ID_OFFSET = 1;

export class StatisticsCollector {

    private api?: ApiPromise;
    private blocksEventsCache: Map<number, CacheEvent[]>;
    private statistics: StatisticsData;

    constructor() {
        this.blocksEventsCache = new Map<number, CacheEvent[]>();
        this.statistics = new StatisticsData();
    }

    async getStatistics(startBlock: number, endBlock: number): Promise<StatisticsData> {
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
        this.api.disconnect();
        return this.statistics;


        //
        // if (statistics.electionVotes) {
        //     statistics.avgVotePerApplicant = statistics.electionVotes / statistics.electionApplicants;
        // } else {
        //     statistics.avgVotePerApplicant = 0;
        // }
        //

        //

        //
        //

        //

        //
        //
        // let startNrStakes = await this.api.query.stake.stakesCreated.at(startHash) as StakeId;
        // let endNrStakes = await this.api.query.stake.stakesCreated.at(endHash) as StakeId;
        // statistics.newStakes = endNrStakes.toNumber() - startNrStakes.toNumber();
        //
        // for (let i = startNrStakes.toNumber(); i < endNrStakes.toNumber(); ++i) {
        //     let stakeResult = await this.api.query.stake.stakes(i) as unknown as [Stake, Linkage<StakeId>];
        //     let stake = stakeResult[0] as Stake;
        //
        //     statistics.totalNewStakeValue += stake.value ? stake.value.toNumber() : 0;
        // }
        //
        // // let startBurnedTokens = await this.api.query.balances.freeBalance.at(startHash, BURN_ADDRESS) as Balance;
        // // let endBurnedTokens = await this.api.query.balances.freeBalance.at(endHash, BURN_ADDRESS) as Balance;
        // //
        // // statistics.totalBurned = endBurnedTokens.toNumber() - startBurnedTokens.toNumber();
        //

        //

        //
        // let newMedia = endMedias.filter((endMedia) => {
        //     return !startMedias.some((startMedia) => startMedia.id == endMedia.id);
        // });
        //
        // statistics.newMedia = newMedia.length;
        // statistics.totalMedia = endMedias.length;
        // statistics.percNewMedia = this.convertToPercentage(statistics.newMedia, statistics.totalMedia);
        //
        // let startDataObjects = await this.api.query.dataDirectory.knownContentIds.at(startHash) as Vec<ContentId>;
        // let startUsedSpace = await this.computeUsedSpaceInBytes(api, startDataObjects);
        //
        // let endDataObjects = await this.api.query.dataDirectory.knownContentIds.at(endHash) as Vec<ContentId>;
        // let endUsedSpace = await this.computeUsedSpaceInBytes(api, endDataObjects);
        //
        // statistics.newUsedSpace = endUsedSpace - startUsedSpace;
        // statistics.totalUsedSpace = endUsedSpace;
        // statistics.percNewUsedSpace = this.convertToPercentage(statistics.newUsedSpace, statistics.totalUsedSpace);
        //
        // statistics.avgNewSizePerContent = Number((statistics.newUsedSpace / statistics.newMedia).toFixed(2));
        // statistics.totalAvgSizePerContent = Number((statistics.totalUsedSpace / statistics.totalMedia).toFixed(2));
        // statistics.percAvgSizePerContent = this.convertToPercentage(statistics.avgNewSizePerContent, statistics.totalAvgSizePerContent);
        //
        // //
        // // for (let startMedia of startMedias) {
        // //     let deleted = !endMedias.some((endMedia) => {
        // //         return endMedia.id == startMedia.id;
        // //     })
        // //     if (deleted) {
        // //         ++statistics.deletedMedia;
        // //     }
        // // }
        //
        //

        //
        // for (let i = startNrProposals.toNumber(); i < endNrProposals.toNumber(); ++i) {
        //     let proposalNumber = i - 1;
        //     let proposalDetails = await this.api.query.proposalsCodex.proposalDetailsByProposalId.at(endHash, proposalNumber) as ProposalDetails;
        //     switch (proposalDetails.type) {
        //         case ProposalTypes.Text:
        //             ++statistics.newTextProposals;
        //             break;
        //
        //         case ProposalTypes.RuntimeUpgrade:
        //             ++statistics.newRuntimeUpgradeProposal;
        //             break;
        //
        //         case ProposalTypes.SetElectionParameters:
        //             ++statistics.newSetElectionParametersProposal;
        //             break;
        //
        //         case ProposalTypes.Spending:
        //             ++statistics.newSpendingProposal;
        //             break;
        //
        //         case ProposalTypes.SetLead:
        //             ++statistics.newSetLeadProposal;
        //             break;
        //
        //         case ProposalTypes.SetContentWorkingGroupMintCapacity:
        //             ++statistics.newSetContentWorkingGroupMintCapacityProposal;
        //             break;
        //
        //         case ProposalTypes.EvictStorageProvider:
        //             ++statistics.newEvictStorageProviderProposal;
        //             break;
        //
        //         case ProposalTypes.SetValidatorCount:
        //             ++statistics.newSetValidatorCountProposal;
        //             break;
        //
        //         case ProposalTypes.SetStorageRoleParameters:
        //             ++statistics.newSetStorageRoleParametersProposal;
        //             break;
        //     }
        // }
        //
        // let validatorRewards: ValidatorReward[] = [];
        // let exchangesCollection: Exchange[] = [];
        // let promises = [];
        //
        // console.time('extractValidatorsRewards');
        // for (let i = startBlock; i < endBlock; ++i) {
        //     let promise = (async () => {
        //         const blockHash: Hash = await this.api.rpc.chain.getBlockHash(i);
        //         const events = await this.api.query.system.events.at(blockHash) as Vec<EventRecord>;
        //         let rewards = await this.extractValidatorsRewards(api, i, events);
        //         if (rewards.length) {
        //             validatorRewards = validatorRewards.concat(rewards);
        //         }
        //         let exchanges = this.extractExchanges(i, events);
        //         if (exchanges.length) {
        //             exchangesCollection = exchangesCollection.concat(exchanges);
        //         }
        //
        //     })();
        //     promises.push(promise);
        // }
        // await Promise.all(promises);
        // console.timeEnd('extractValidatorsRewards');
        //
        // statistics.newValidatorReward = validatorRewards.map((validatorReward) => validatorReward.sharedReward).reduce((a, b) => a + b);
        // let avgValidators = validatorRewards.map((validatorReward) => validatorReward.validators).reduce((a, b) => a + b) / validatorRewards.length;
        // statistics.avgValidators = Number(avgValidators.toFixed(2));
        //
        // statistics.newTokensBurn = exchangesCollection.map((exchange) => exchange.amount).reduce((a, b) => a + b);
        //
        // statistics.newStorageProviderReward = await this.computeStorageRewards(api, startBlock, endBlock);
        //
        // this.api.disconnect();
        // return statistics;
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
        }
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
            let worker = await this.api.query.storageWorkingGroup.workerById(i) as Worker;
            if (worker.role_stake_profile.isSome) {
                let roleStakeProfile = worker.role_stake_profile.unwrap();
                let stake = await this.api.query.stake.stakes(roleStakeProfile.stake_id) as Stake;
                info.startStake += stake.value.toNumber();
            }
        }

        nextWorkerId = (await this.api.query.storageWorkingGroup.nextWorkerId.at(endHash) as WorkerId).toNumber();
        let rewardRelationshipIds = Array<RewardRelationshipId>();

        for (let i = 0; i < nextWorkerId; ++i) {
            let worker = await this.api.query.storageWorkingGroup.workerById(i) as Worker;
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
        let nextCuratorId = (await this.api.query.contentWorkingGroup.nextCuratorId.at(endHash) as WorkerId).toNumber();

        let rewardRelationshipIds = Array<RewardRelationshipId>();
        for (let i = 0; i < nextCuratorId; ++i) {
            let worker = await this.api.query.contentWorkingGroup.curatorById(i) as Worker;
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
            let endMintResult = ((await this.api.query.minting.mints.at(endHash, i)) as unknown) as [Mint, Linkage<MintId>];

            let endMint = endMintResult[0] as Mint;
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
        let curatorMint = (await this.api.query.contentWorkingGroup.mint.at(endHash)) as MintId;
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
        this.statistics.councilRound = (await this.api.query.councilElection.round.at(endHash) as u32).toNumber();
        this.statistics.councilMembers = (await this.api.query.councilElection.councilSize.at(endHash) as u32).toNumber();
        let startNrProposals = await this.api.query.proposalsEngine.proposalCount.at(startHash) as u32;
        let endNrProposals = await this.api.query.proposalsEngine.proposalCount.at(endHash) as u32;
        this.statistics.newProposals = endNrProposals.toNumber() - startNrProposals.toNumber();

        let approvedProposals = new Set();
        for (let [key, blockEvents] of this.blocksEventsCache) {
            for (let event of blockEvents) {
                if (event.section == "proposalsEngine" && event.method == "ProposalStatusUpdated") {
                    let statusUpdateData = event.data[1] as any;
                    let finalizeData = statusUpdateData.Finalized as any
                    if (finalizeData && finalizeData.proposalStatus.Approved) {
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
            console.warn('The given start block is not the first block of the council round so council election information will be empty');
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

        this.statistics.startValidators = (await this.api.query.staking.validatorCount.at(startHash) as u32).toNumber();
        this.statistics.endValidators = (await this.api.query.staking.validatorCount.at(endHash) as u32).toNumber();
        this.statistics.percValidators = StatisticsCollector.convertToPercentage(this.statistics.startValidators, this.statistics.endValidators);

        const startEra = await this.api.query.staking.currentEra.at(startHash) as Option<EraIndex>;
        this.statistics.startValidatorsStake = (await this.api.query.staking.erasTotalStake.at(startHash, startEra.unwrap())).toNumber();

        const endEra = await this.api.query.staking.currentEra.at(endHash) as Option<EraIndex>;
        this.statistics.endValidatorsStake = (await this.api.query.staking.erasTotalStake.at(endHash, endEra.unwrap())).toNumber();

        this.statistics.percNewValidatorsStake = StatisticsCollector.convertToPercentage(this.statistics.startValidatorsStake, this.statistics.endValidatorsStake);
    }

    async fillStorageProviderInfo(startBlock: number, endBlock: number, startHash: Hash, endHash: Hash) {
        let roundNrBlocks = endBlock - startBlock;

        let storageProvidersRewards = await this.computeStorageProviderReward(roundNrBlocks, startHash, endHash);
        this.statistics.newStorageProviderReward = storageProvidersRewards.rewards;
        this.statistics.newStorageProviderReward = Number(this.statistics.newStorageProviderReward.toFixed(2));

        this.statistics.startStorageProvidersStake = storageProvidersRewards.startStake;
        this.statistics.endStorageProvidersStake = storageProvidersRewards.endStake;
        this.statistics.percNewStorageProviderStake = StatisticsCollector.convertToPercentage(this.statistics.startStorageProvidersStake, this.statistics.endStorageProvidersStake);

        this.statistics.startStorageProviders = (await this.api.query.storageWorkingGroup.nextWorkerId.at(startHash) as WorkerId).toNumber() - WORKER_ID_OFFSET;
        this.statistics.endStorageProviders = (await this.api.query.storageWorkingGroup.nextWorkerId.at(endHash) as WorkerId).toNumber() - WORKER_ID_OFFSET;
        this.statistics.percNewStorageProviders = StatisticsCollector.convertToPercentage(this.statistics.startStorageProviders, this.statistics.endStorageProviders);

    }

    async fillCuratorInfo(startHash: Hash, endHash: Hash) {
        this.statistics.startCurators = (await this.api.query.contentWorkingGroup.nextCuratorId.at(startHash));
        this.statistics.endCurators = (await this.api.query.contentWorkingGroup.nextCuratorId.at(endHash));
        this.statistics.percNewCurators = StatisticsCollector.convertToPercentage(this.statistics.startCurators, this.statistics.endCurators);
    }

    async fillMembershipInfo(startHash: Hash, endHash: Hash) {
        this.statistics.startMembers = (await this.api.query.members.nextMemberId.at(startHash) as MemberId).toNumber();
        this.statistics.endMembers = (await this.api.query.members.nextMemberId.at(endHash) as MemberId).toNumber();
        this.statistics.newMembers = this.statistics.endMembers - this.statistics.startMembers;
        this.statistics.percNewMembers = StatisticsCollector.convertToPercentage(this.statistics.startMembers, this.statistics.endMembers);
    }

    async fillMediaUploadInfo(startHash: Hash, endHash: Hash) {
        let startMedias = await this.getMedia(startHash);
        let endMedias = await this.getMedia(endHash);

        this.statistics.startMedia = startMedias.length;
        this.statistics.endMedia = endMedias.length;
        this.statistics.percNewMedia = StatisticsCollector.convertToPercentage(this.statistics.startMedia, this.statistics.endMedia);

        this.statistics.startChannels = (await this.api.query.contentWorkingGroup.nextChannelId.at(startHash) as ChannelId).toNumber();
        this.statistics.endChannels = (await this.api.query.contentWorkingGroup.nextChannelId.at(endHash) as ChannelId).toNumber();
        this.statistics.percNewChannels = StatisticsCollector.convertToPercentage(this.statistics.startChannels, this.statistics.endChannels);

        let startDataObjects = await this.api.query.dataDirectory.knownContentIds.at(startHash) as Vec<ContentId>;
        this.statistics.startUsedSpace = await this.computeUsedSpaceInBytes(startDataObjects);

        let endDataObjects = await this.api.query.dataDirectory.knownContentIds.at(endHash) as Vec<ContentId>;
        this.statistics.endUsedSpace = await this.computeUsedSpaceInBytes(endDataObjects);
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
            return 0;
        }
        return Number((newValue * 100 / previousValue - 100).toFixed(2));
    }

    async computeUsedSpaceInBytes(contentIds: Vec<ContentId>) {
        let space = 0;
        for (let contentId of contentIds) {
            let dataObject = (await this.api.query.dataDirectory.dataObjectByContentId(contentId)) as Option<DataObject>;
            space += dataObject.unwrap().size_in_bytes.toNumber();
        }
        return space;
    }

    async getMedia(blockHash: Hash) {
        let nrEntities = ((await this.api.query.versionedStore.nextEntityId.at(blockHash)) as EntityId).toNumber();

        let medias: Media[] = [];
        for (let i = 0; i < nrEntities; ++i) {
            let entity = await this.api.query.versionedStore.entityById.at(blockHash, i) as Entity;

            if (entity.class_id.toNumber() != 7 || entity.entity_values.isEmpty) {
                continue;
            }

            let title = entity.entity_values[0].value.toString();

            medias.push(new Media(entity.id.toNumber(), title));
        }
        return medias;
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
