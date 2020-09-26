import {ApiPromise, WsProvider} from "@polkadot/api";
import { types } from '@joystream/types'
import {AccountId, Balance, BlockNumber, EventRecord, Hash, Moment} from "@polkadot/types/interfaces";

import {Exchange, MintStatistics, ProposalTypes, StatisticsData, ValidatorReward} from "./StatisticsData";

import {u32, Vec} from "@polkadot/types";
import {ElectionStake, Seats} from "@joystream/types/council";
import {Mint, MintId} from "@joystream/types/mint";
import {ContentId, DataObject} from "@joystream/types/media";
import {RoleParameters} from "@joystream/types/roles";
import {Entity, EntityId} from "@joystream/types/versioned-store";
import Option from "@polkadot/types/codec/Option";
import Linkage from "@polkadot/types/codec/Linkage";

const BURN_ADDRESS = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMaeKQu';

const FIRST_COUNCIL_BLOCK = 908796;
const COUNCIL_ROUND_OFFSET = 5;


class Media {

    constructor(public id: number, public title: string) {
    }
}

export class StatisticsCollector {

    private api?: ApiPromise;

    constructor() {

    }


    async getStatistics(startBlock: number, endBlock: number): Promise<StatisticsData> {
        this.api = await StatisticsCollector.connectApi();

        let startHash = await this.api.query.system.blockHash(startBlock) as Hash;
        let endHash = await this.api.query.system.blockHash(endBlock) as Hash;

        let statistics = new StatisticsData();

        statistics.startBlock = startBlock;
        statistics.endBlock = endBlock;
        statistics.newBlocks = endBlock - startBlock;
        statistics.percNewBlocks = StatisticsCollector.convertToPercentage(statistics.newBlocks, endBlock);
        await this.fillBasicInfo(startHash, endHash, statistics);
        await this.fillMintsData(startHash, endHash, statistics);
        // await this.fillCouncilElectionInfo(startHash, endHash, startBlock, statistics);
        this.api.disconnect();
        return statistics;


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
        // let startTimestamp = await this.api.query.timestamp.now.at(startHash) as unknown as Moment;
        // let endTimestamp = await this.api.query.timestamp.now.at(endHash) as unknown as Moment;
        // let avgBlockProduction = (((endTimestamp.toNumber() - startTimestamp.toNumber())
        //     / 1000) / statistics.newBlocks);
        // statistics.avgBlockProduction = Number(avgBlockProduction.toFixed(2));
        //
        // let startPostId = await this.api.query.forum.nextPostId.at(startHash) as unknown as PostId;
        // let endPostId = await this.api.query.forum.nextPostId.at(endHash) as unknown as PostId;
        // statistics.startPosts = startPostId.toNumber() - 1;
        // statistics.newPosts = endPostId.toNumber() - startPostId.toNumber();
        // statistics.endPosts = endPostId.toNumber() - 1;
        // statistics.percNewPosts = this.convertToPercentage(statistics.newPosts, statistics.endPosts);
        //
        // let startThreadId = await this.api.query.forum.nextThreadId.at(startHash) as unknown as ThreadId;
        // let endThreadId = await this.api.query.forum.nextThreadId.at(endHash) as unknown as ThreadId;
        // statistics.newThreads = endThreadId.toNumber() - startThreadId.toNumber();
        // statistics.totalThreads = endThreadId.toNumber() - 1;
        // statistics.percNewThreads = this.convertToPercentage(statistics.newThreads, statistics.totalThreads);
        //
        // let startCategoryId = await this.api.query.forum.nextCategoryId.at(startHash) as unknown as CategoryId;
        // let endCategoryId = await this.api.query.forum.nextCategoryId.at(endHash) as unknown as CategoryId;
        // statistics.newCategories = endCategoryId.toNumber() - startCategoryId.toNumber();
        //
        // let startNrProposals = await this.api.query.proposalsEngine.proposalCount.at(startHash) as unknown as u32;
        // let endNrProposals = await this.api.query.proposalsEngine.proposalCount.at(endHash) as unknown as u32;
        // statistics.newProposals = endNrProposals.toNumber() - startNrProposals.toNumber();
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

    async fillBasicInfo(startHash: Hash, endHash: Hash, statistics: StatisticsData) {
        let startDate = await this.api.query.timestamp.now.at(startHash) as Moment;
        let endDate = await this.api.query.timestamp.now.at(endHash) as Moment;
        statistics.dateStart = new Date(startDate.toNumber()).toLocaleDateString("en-US");
        statistics.dateEnd = new Date(endDate.toNumber()).toLocaleDateString("en-US");

    }


    async fillMintsData(startHash: Hash, endHash: Hash, statistics: StatisticsData) {

        let startNrMints = parseInt((await this.api.query.minting.mintsCreated.at(startHash)).toString());
        let endNrMints = parseInt((await this.api.query.minting.mintsCreated.at(endHash)).toString());

        statistics.newMints = endNrMints - startNrMints;
        // statistics.startMinted = 0;
        // statistics.endMinted = 0;
        for (let i = 0; i < startNrMints; ++i) {
            let startMintResult = await this.api.query.minting.mints.at(startHash, i) as unknown as [Mint, Linkage<MintId>];
            let startMint = startMintResult[0];

            let endMintResult = await this.api.query.minting.mints.at(endHash, i) as unknown as [Mint, Linkage<MintId>];
            let endMint = endMintResult[0];

            let startMintTotal = parseInt(startMint.getField('total_minted').toString());
            let endMintTotal = parseInt(endMint.getField('total_minted').toString());

            // statistics.startMinted += startMintTotal;

            statistics.totalMinted += endMintTotal - startMintTotal;
            statistics.totalMintCapacityIncrease += parseInt(endMint.getField('capacity').toString()) - parseInt(startMint.getField('capacity').toString());
        }

        for (let i = startNrMints; i < endNrMints; ++i) {
            let endMintResult = await this.api.query.minting.mints.at(endHash, i) as unknown as [Mint, Linkage<MintId>];
            let endMint = endMintResult[0] as Mint;
            statistics.totalMinted = parseInt(endMint.getField('total_minted').toString());
        }

        let councilMint = await this.api.query.council.councilMint.at(endHash) as MintId;
        let councilMintStatistics = await this.computeMintInfo(councilMint, startHash, endHash);

        statistics.startCouncilMinted = councilMintStatistics.startMinted;
        statistics.endCouncilMinted = councilMintStatistics.endMinted
        statistics.newCouncilMinted = councilMintStatistics.diffMinted;
        statistics.percNewCouncilMinted = councilMintStatistics.percMinted;

        let curatorMint = await this.api.query.contentWorkingGroup.mint.at(endHash) as MintId;
        let curatorMintStatistics = await this.computeMintInfo(curatorMint, startHash, endHash);
        statistics.startCuratorMinted = curatorMintStatistics.startMinted;
        statistics.endCuratorMinted = curatorMintStatistics.endMinted;
        statistics.newCuratorMinted = curatorMintStatistics.diffMinted;
        statistics.percCuratorMinted = curatorMintStatistics.percMinted;

        let storageProviderMint = await this.api.query.storageWorkingGroup.mint.at(endHash) as MintId;
        let storageProviderMintStatistics = await this.computeMintInfo(storageProviderMint, startHash, endHash);
        statistics.startStorageMinted = storageProviderMintStatistics.startMinted;
        statistics.endStorageMinted = storageProviderMintStatistics.endMinted;
        statistics.newStorageMinted = storageProviderMintStatistics.diffMinted;
        statistics.percStorageMinted = storageProviderMintStatistics.percMinted;
    }

    async computeMintInfo(mintId: MintId, startHash: Hash, endHash: Hash): Promise<MintStatistics> {
        if (mintId.toString() == "0"){
            return new MintStatistics(0, 0, 0);
        }
        let startCouncilMintResult = await this.api.query.minting.mints.at(startHash, mintId) as unknown as [Mint, Linkage<MintId>];
        let startCouncilMint = startCouncilMintResult[0] as unknown as Mint;

        let endCouncilMintResult = await this.api.query.minting.mints.at(endHash, mintId) as unknown as [Mint, Linkage<MintId>];
        let endCouncilMint = endCouncilMintResult[0] as unknown as Mint;

        let mintStatistics = new MintStatistics();
        mintStatistics.startMinted = parseInt(startCouncilMint.getField('total_minted').toString());
        mintStatistics.endMinted = parseInt(endCouncilMint.getField('total_minted').toString());
        mintStatistics.diffMinted = mintStatistics.endMinted - mintStatistics.startMinted;
        mintStatistics.percMinted = StatisticsCollector.convertToPercentage(mintStatistics.diffMinted, mintStatistics.endMinted);
        return mintStatistics;
    }

    async fillCouncilElectionInfo(startHash: Hash, endHash: Hash, startBlock: number, statistics: StatisticsData) {
        statistics.councilRound = (await this.api.query.councilElection.round.at(startHash) as u32).toNumber() - COUNCIL_ROUND_OFFSET;
        let seats = await this.api.query.council.activeCouncil.at(startHash) as Seats;
        statistics.councilMembers = seats.length;

        let applicants: Vec<AccountId>
        let currentSearchBlock = startBlock - 1;
        do {
            let applicantHash = await this.api.query.system.blockHash(currentSearchBlock);
            applicants = await this.api.query.councilElection.applicants.at(applicantHash) as Vec<AccountId>;
            --currentSearchBlock;
        } while (applicants.length == 0);

        statistics.electionApplicants = applicants.length;

        statistics.electionApplicantsStakes = 0;
        for (let applicant of applicants) {
            let applicantStakes = await this.api.query.councilElection.applicantStakes.at(startHash, applicant) as unknown as ElectionStake;
            statistics.electionApplicantsStakes += applicantStakes.new.toNumber();
        }
        statistics.electionVotes = seats.map((seat) => seat.backers.length).reduce((a, b) => a + b);
    }

    static async extractValidatorsRewards(api: ApiPromise, blockNumber: number, events: Vec<EventRecord>): Promise<ValidatorReward[]> {
        let valRewards = [];
        // const api = await this.connectApi();
        for (let {event} of events) {
            if (event.section === 'staking' && event.method === 'Reward') {
                const sharedReward = event.data[0] as Balance;
                const remainingReward = event.data[1] as Balance;
                const oldHash: Hash = await api.query.system.blockHash(blockNumber - 1);
                const slotStake = await api.query.staking.slotStake.at(oldHash) as Balance;
                const validatorInfo = await api.query.staking.currentElected.at(oldHash) as AccountId;
                const valReward = new ValidatorReward();
                valReward.sharedReward = sharedReward.toNumber();


                valReward.remainingReward = remainingReward.toNumber();
                valReward.validators = validatorInfo.length;
                valReward.slotStake = slotStake.toNumber();
                // date: new Date(timestamp.toNumber()),
                valReward.blockNumber = blockNumber;
                // session: session.toNumber(),
                // era: era.toNumber()

                valRewards.push(valReward)
            }
        }
        return valRewards;
    }

    static async computeStorageRewards(api: ApiPromise, startBlock: number, endBlock: number): Promise<number> {
        let estimateOfStorageReward = 0
        for (let blockHeight = startBlock; blockHeight < endBlock; blockHeight += 600) {
            const blockHash: Hash = await api.rpc.chain.getBlockHash(blockHeight);
            const storageProviders = (await api.query.actors.actorAccountIds.at(blockHash) as Vec<AccountId>).length;
            const storageParameters = (await api.query.actors.parameters.at(blockHash, "StorageProvider") as Option<RoleParameters>).unwrap();
            const reward = storageParameters.reward.toNumber();
            const rewardPeriod = storageParameters.reward_period.toNumber();
            estimateOfStorageReward += storageProviders * reward * rewardPeriod / 600;
        }
        return estimateOfStorageReward;
    }

    static extractExchanges(blockNumber: number, events: Vec<EventRecord>): Exchange[] {
        let exchanges = [];
        for (let {event} of events) {
            if (event.section === 'balances' && event.method === 'Transfer') {
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

                    exchanges.push(exchange)
                }
            }
        }
        return exchanges;
    }

    static convertToPercentage(value: number, totalValue: number):
        number {
        return Number((value / totalValue * 100).toFixed(2));
    }


    static async computeUsedSpaceInBytes(api: ApiPromise, contentIds: Vec<ContentId>) {
        let space = 0;
        for (let contentId of contentIds) {
            let dataObject = await api.query.dataDirectory.dataObjectByContentId(contentId) as Option<DataObject>;
            space += dataObject.unwrap().size_in_bytes.toNumber();

        }
        return space;
    }

    static async getMedia(api: ApiPromise, blockHash: Hash) {
        let nrEntities = (await api.query.versionedStore.nextEntityId.at(blockHash) as EntityId).toNumber();

        let medias: Media[] = [];
        for (let i = 0; i < nrEntities; ++i) {
            let entity = await api.query.versionedStore.entityById.at(blockHash, i) as unknown as Entity;

            if (entity.class_id.toNumber() != 7) {
                continue;
            }

            let title = entity.entity_values[0].value.value.toString();

            medias.push(new Media(entity.id.toNumber(), title));

        }
        return medias;
    }

    static async connectApi(): Promise<ApiPromise> {
        // const provider = new WsProvider('wss://testnet.joystream.org:9944');
        const provider = new WsProvider('wss://rome-rpc-endpoint.joystream.org:9944');

        // Create the API and wait until ready
        return await ApiPromise.create({provider, types});
    }

}



