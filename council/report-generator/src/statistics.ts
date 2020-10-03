import {ApiPromise, WsProvider} from "@polkadot/api";
import {types} from '@joystream/types'
import {AccountId, Balance, EventRecord, Hash, Moment} from "@polkadot/types/interfaces";

import {
    CacheEvent,
    Exchange,
    Media,
    MintStatistics,
    StatisticsData,
    ValidatorReward
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

const fsSync = require('fs');
const fs = fsSync.promises;

const BURN_ADDRESS = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMaeKQu';

const COUNCIL_ROUND_OFFSET = 5;
const PROVIDER_URL = "ws://localhost:9944";

const CACHE_FOLDER = "cache";

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
        this.statistics.percNewBlocks = StatisticsCollector.convertToPercentage(this.statistics.newBlocks, endBlock);
        await this.buildBlocksEventCache(startBlock, endBlock);
        await this.fillBasicInfo(startHash, endHash);
        await this.fillMintsInfo(startHash, endHash);
        await this.fillCouncilInfo(startHash, endHash);
        await this.fillCouncilElectionInfo(startBlock, endBlock);
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
        // let startIssuance = await this.api.query.balances.totalIssuance.at(startHash) as unknown as Balance;
        // let endIssuance = await this.api.query.balances.totalIssuance.at(endHash) as unknown as Balance;
        // statistics.newIssuance = endIssuance.toNumber() - startIssuance.toNumber();
        // statistics.totalIssuance = endIssuance.toNumber();
        // statistics.percNewIssuance = this.convertToPercentage(statistics.newIssuance, statistics.totalIssuance);
        //
        // let startNrMembers = await this.api.query.members.membersCreated.at(startHash) as unknown as MemberId;
        // let endNrNumber = await this.api.query.members.membersCreated.at(endHash) as unknown as MemberId;
        // statistics.newMembers = endNrNumber.toNumber() - startNrMembers.toNumber();
        // statistics.totalMembers = endNrNumber.toNumber();
        // statistics.percNewMembers = this.convertToPercentage(statistics.newMembers, statistics.totalMembers);
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
        // let startNrChannels = (await this.api.query.contentWorkingGroup.nextChannelId.at(startHash) as ChannelId).toNumber() - 1;
        // let endNrChannels = (await this.api.query.contentWorkingGroup.nextChannelId.at(endHash) as ChannelId).toNumber() - 1;
        //
        // statistics.newChannels = endNrChannels - startNrChannels;
        // statistics.totalChannels = endNrChannels;
        // statistics.percNewChannels = this.convertToPercentage(statistics.newChannels, statistics.totalChannels);
        //
        // let startMedias = await this.getMedia(api, startHash);
        // let endMedias = await this.getMedia(api, endHash);
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

    async fillMintsInfo(startHash: Hash, endHash: Hash) {
        let startNrMints = parseInt((await this.api.query.minting.mintsCreated.at(startHash)).toString());
        let endNrMints = parseInt((await this.api.query.minting.mintsCreated.at(endHash)).toString());

        this.statistics.newMints = endNrMints - startNrMints;
        // statistics.startMinted = 0;
        // statistics.endMinted = 0;
        for (let i = 0; i < startNrMints; ++i) {
            let startMintResult = ((await this.api.query.minting.mints.at(startHash, i)) as unknown) as [Mint, Linkage<MintId>];
            let startMint = startMintResult[0];
            if (!startMint) {
                continue;
            }

            let endMintResult = ((await this.api.query.minting.mints.at(endHash, i)) as unknown) as [Mint, Linkage<MintId>];
            let endMint = endMintResult[0];
            if (!endMint) {
                continue;
            }

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
        if (mintId.toString() == "0") {
            return new MintStatistics(0, 0, 0);
        }
        let startMintResult = await this.api.query.minting.mints.at(startHash, mintId) as unknown as [Mint, Linkage<MintId>];
        let startMint = startMintResult[0] as unknown as Mint;
        if (!startMint) {
            return new MintStatistics(0, 0, 0);
        }

        let endMintResult = await this.api.query.minting.mints.at(endHash, mintId) as unknown as [Mint, Linkage<MintId>];
        let endMint = endMintResult[0] as unknown as Mint;
        if (!endMint) {
            return new MintStatistics(0, 0, 0);
        }

        let mintStatistics = new MintStatistics();
        mintStatistics.startMinted = parseInt(startMint.getField('total_minted').toString());
        mintStatistics.endMinted = parseInt(endMint.getField('total_minted').toString());
        mintStatistics.diffMinted = mintStatistics.endMinted - mintStatistics.startMinted;
        mintStatistics.percMinted = StatisticsCollector.convertToPercentage(mintStatistics.diffMinted, mintStatistics.endMinted);
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

    async fillCouncilElectionInfo(startBlock: number, endBlock: number) {

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
        let seats = await this.api.query.council.activeCouncil.at(startBlockHash) as Seats;
        //TODO: Find a more accurate way of getting the votes
        this.statistics.electionVotes = seats.map((seat) => seat.backers.length).reduce((a, b) => a + b);
    }

    async fillForumInfo(startHash: Hash, endHash: Hash) {
        let startPostId = await this.api.query.forum.nextPostId.at(startHash) as PostId;
        let endPostId = await this.api.query.forum.nextPostId.at(endHash) as PostId;
        this.statistics.startPosts = startPostId.toNumber();
        this.statistics.endPosts = endPostId.toNumber() + 1;
        this.statistics.newPosts = this.statistics.endPosts - this.statistics.startPosts;
        this.statistics.percNewPosts = StatisticsCollector.convertToPercentage(this.statistics.newPosts, this.statistics.endPosts);

        let startThreadId = ((await this.api.query.forum.nextThreadId.at(startHash)) as unknown) as ThreadId;
        let endThreadId = ((await this.api.query.forum.nextThreadId.at(endHash)) as unknown) as ThreadId;
        this.statistics.startThreads = startThreadId.toNumber();
        this.statistics.endThreads = endThreadId.toNumber() + 1;
        this.statistics.newThreads = this.statistics.endThreads - this.statistics.startThreads;
        this.statistics.percNewThreads = StatisticsCollector.convertToPercentage(this.statistics.newThreads, this.statistics.endThreads);

        let startCategoryId = (await this.api.query.forum.nextCategoryId.at(startHash)) as CategoryId;
        let endCategoryId = (await this.api.query.forum.nextCategoryId.at(endHash)) as CategoryId;
        this.statistics.startCategories = startCategoryId.toNumber();
        this.statistics.endCategories = endCategoryId.toNumber() + 1;
        this.statistics.newCategories = this.statistics.endCategories - this.statistics.startCategories;
        this.statistics.perNewCategories = StatisticsCollector.convertToPercentage(this.statistics.newCategories, this.statistics.endCategories);
    }

    static async extractValidatorsRewards(api: ApiPromise, blockNumber: number, events: Vec<EventRecord>): Promise<ValidatorReward[]> {
        let valRewards = [];
        // const api = await this.connectApi();
        for (let {event} of events) {
            if (event.section === "staking" && event.method === "Reward") {
                const sharedReward = event.data[0] as Balance;
                const remainingReward = event.data[1] as Balance;
                const oldHash: Hash = await api.rpc.chain.getBlockHash(blockNumber - 1);
                const slotStake = (await api.query.staking.slotStake.at(oldHash)) as Balance;
                const validatorInfo = (await api.query.staking.currentElected.at(oldHash)) as AccountId;
                const valReward = new ValidatorReward();
                valReward.sharedReward = sharedReward.toNumber();

                valReward.remainingReward = remainingReward.toNumber();
                valReward.validators = validatorInfo.length;
                valReward.slotStake = slotStake.toNumber();
                // date: new Date(timestamp.toNumber()),
                valReward.blockNumber = blockNumber;
                // session: session.toNumber(),
                // era: era.toNumber()

                valRewards.push(valReward);
            }
        }
        return valRewards;
    }

    static async computeStorageRewards(api: ApiPromise, startBlock: number, endBlock: number): Promise<number> {
        let estimateOfStorageReward = 0;
        for (let blockHeight = startBlock; blockHeight < endBlock; blockHeight += 600) {
            const blockHash: Hash = await api.rpc.chain.getBlockHash(blockHeight);
            const storageProviders = ((await api.query.actors.actorAccountIds.at(blockHash)) as Vec<AccountId>).length;
            const storageParameters = ((await api.query.actors.parameters.at(blockHash, "StorageProvider")) as Option<RoleParameters>).unwrap();
            const reward = storageParameters.reward.toNumber();
            const rewardPeriod = storageParameters.reward_period.toNumber();
            estimateOfStorageReward += (storageProviders * reward * rewardPeriod) / 600;
        }
        return estimateOfStorageReward;
    }

    static extractExchanges(blockNumber: number, events: Vec<EventRecord>): Exchange[] {
        let exchanges = [];
        for (let {event} of events) {
            if (event.section === "balances" && event.method === "Transfer") {
                const recipient = event.data[1] as AccountId;
                if (recipient.toString() === BURN_ADDRESS) {
                    // For all events of "Transfer" type with matching recipient...
                    const sender = event.data[0] as AccountId;
                    const amountJOY = event.data[2] as Balance;
                    const feesJOY = event.data[3] as Balance;
                    //const memo = await api.query.memo.memo.at(blockHash, sender) as Text;
                    let exchange = new Exchange();

                    exchange.sender = sender.toString();
                    // recipient: recipient.toString(),
                    exchange.amount = amountJOY.toNumber();
                    exchange.fees = feesJOY.toNumber();
                    // date: new Date(timestamp.toNumber()),
                    exchange.blockNumber = blockNumber;
                    // session: session.toNumber(),
                    // era: era.toNumber()

                    exchanges.push(exchange);
                }
            }
        }
        return exchanges;
    }

    static convertToPercentage(value: number, totalValue: number): number {
        return Number(((value / totalValue) * 100).toFixed(2));
    }

    static async computeUsedSpaceInBytes(api: ApiPromise, contentIds: Vec<ContentId>) {
        let space = 0;
        for (let contentId of contentIds) {
            let dataObject = (await api.query.dataDirectory.dataObjectByContentId(contentId)) as Option<DataObject>;
            space += dataObject.unwrap().size_in_bytes.toNumber();
        }
        return space;
    }

    static async getMedia(api: ApiPromise, blockHash: Hash) {
        let nrEntities = ((await api.query.versionedStore.nextEntityId.at(blockHash)) as EntityId).toNumber();

        let medias: Media[] = [];
        for (let i = 0; i < nrEntities; ++i) {
            let entity = ((await api.query.versionedStore.entityById.at(blockHash, i)) as unknown) as Entity;

            if (entity.class_id.toNumber() != 7) {
                continue;
            }

            let title = entity.entity_values[0].value.value.toString();

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
