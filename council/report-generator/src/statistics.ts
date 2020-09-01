import {rpc} from "@polkadot/types/interfaces/definitions";
import {ApiPromise, WsProvider} from "@polkadot/api";
import {registerJoystreamTypes} from '@joystream/types';
import {AccountId, Balance, BlockNumber, EventRecord, Hash, Moment} from "@polkadot/types/interfaces";

import {Exchange, ProposalTypes, StatisticsData, ValidatorReward} from "./StatisticsData";

import {u32, Vec} from "@polkadot/types";
import {ElectionStake, Seats} from "@joystream/types/council";
import {MemberId} from "@joystream/types/members";
import {Stake, StakeId} from "@joystream/types/stake";
import {Mint, MintId} from "@joystream/types/mint";
import {ChannelId} from "@joystream/types/content-working-group";
import {ContentId, DataObject} from "@joystream/types/media";
import {PostId, ThreadId} from "@joystream/types/common";
import {CategoryId} from "@joystream/types/forum";
import {ProposalDetails} from "@joystream/types/proposals";
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
    static async getStatistics(startBlock: number, endBlock: number): Promise<StatisticsData> {

        const api = await this.connectApi();

        let startHash = await api.rpc.chain.getBlockHash(startBlock);
        let endHash = await api.rpc.chain.getBlockHash(endBlock);

        let statistics = new StatisticsData();

        statistics.councilRound = (await api.query.councilElection.round.at(startHash) as u32).toNumber() - COUNCIL_ROUND_OFFSET;
        let seats = await api.query.council.activeCouncil.at(startHash) as Seats;

        statistics.councilMembers = seats.length;
        let applicants = await api.query.councilElection.applicants.at(startHash) as Vec<AccountId>;
        statistics.electionApplicants = applicants.length;

        statistics.electionApplicantsStakes = 0;
        for (let applicant of applicants) {
            let applicantStakes = await api.query.councilElection.applicantStakes.at(startHash, applicant) as unknown as ElectionStake;
            statistics.electionApplicantsStakes += applicantStakes.new.toNumber();
        }
        statistics.electionVotes = seats.map((seat) => seat.backers.length).reduce((a, b) => a + b);

        if (statistics.electionVotes) {
            statistics.avgVotePerApplicant = statistics.electionVotes / statistics.electionApplicants;
        } else {
            statistics.avgVotePerApplicant = 0;
        }

        let startDate = await api.query.timestamp.now.at(startHash) as Moment;
        let endDate = await api.query.timestamp.now.at(endHash) as Moment;

        statistics.dateStart = new Date(startDate.toNumber()).toLocaleDateString("en-US");
        statistics.dateEnd = new Date(endDate.toNumber()).toLocaleDateString("en-US");

        statistics.startBlock = startBlock;
        statistics.endBlock = endBlock;
        statistics.newBlocks = endBlock - startBlock;
        statistics.percNewBlocks = this.convertToPercentage(statistics.newBlocks, endBlock);


        let startIssuance = await api.query.balances.totalIssuance.at(startHash) as unknown as Balance;
        let endIssuance = await api.query.balances.totalIssuance.at(endHash) as unknown as Balance;
        statistics.newIssuance = endIssuance.toNumber() - startIssuance.toNumber();
        statistics.totalIssuance = endIssuance.toNumber();
        statistics.percNewIssuance = this.convertToPercentage(statistics.newIssuance, statistics.totalIssuance);

        let startNrMembers = await api.query.members.membersCreated.at(startHash) as unknown as MemberId;
        let endNrNumber = await api.query.members.membersCreated.at(endHash) as unknown as MemberId;
        statistics.newMembers = endNrNumber.toNumber() - startNrMembers.toNumber();
        statistics.totalMembers = endNrNumber.toNumber();
        statistics.percNewMembers = this.convertToPercentage(statistics.newMembers, statistics.totalMembers);


        let startNrStakes = await api.query.stake.stakesCreated.at(startHash) as StakeId;
        let endNrStakes = await api.query.stake.stakesCreated.at(endHash) as StakeId;
        statistics.newStakes = endNrStakes.toNumber() - startNrStakes.toNumber();

        for (let i = startNrStakes.toNumber(); i < endNrStakes.toNumber(); ++i) {
            let stakeResult = await api.query.stake.stakes(i) as unknown as [Stake, Linkage<StakeId>];
            let stake = stakeResult[0] as Stake;

            statistics.totalNewStakeValue += stake.value ? stake.value.toNumber() : 0;
        }

        // let startBurnedTokens = await api.query.balances.freeBalance.at(startHash, BURN_ADDRESS) as Balance;
        // let endBurnedTokens = await api.query.balances.freeBalance.at(endHash, BURN_ADDRESS) as Balance;
        //
        // statistics.totalBurned = endBurnedTokens.toNumber() - startBurnedTokens.toNumber();



        let startNrMints = parseInt((await api.query.minting.mintsCreated.at(startHash)).toString());
        let endNrMints = parseInt((await api.query.minting.mintsCreated.at(endHash)).toString());

        statistics.createdMints = endNrMints - startNrMints;

        for (let i = 0; i < startNrMints; ++i) {
            let startMintResult = await api.query.minting.mints.at(startHash, i) as unknown as [Mint, Linkage<MintId>];
            let startMint = startMintResult[0];

            let endMintResult = await api.query.minting.mints.at(endHash, i) as unknown as [Mint, Linkage<MintId>];
            let endMint = endMintResult[0];

            statistics.totalMinted = parseInt(endMint.getField('total_minted').toString()) - parseInt(startMint.getField('total_minted').toString());
            statistics.totalMintCapacityIncrease = parseInt(endMint.getField('capacity').toString()) - -parseInt(startMint.getField('capacity').toString());
        }

        for (let i = startNrMints; i < endNrMints; ++i) {
            let endMintResult = await api.query.minting.mints.at(endHash, i) as unknown as [Mint, Linkage<MintId>];
            let endMint = endMintResult[0] as Mint;
            statistics.totalMinted = parseInt(endMint.getField('total_minted').toString());
        }

        let councilMint = await api.query.council.councilMint.at(endHash) as Option<MintId>;
        let curatorMint = await api.query.contentWorkingGroup.mint.at(endHash) as MintId;

        let startCouncilMintResult = await api.query.minting.mints.at(startHash, councilMint.unwrap()) as unknown as [Mint, Linkage<MintId>];
        let startCouncilMint = startCouncilMintResult[0] as unknown as Mint;

        let endCouncilMintResult = await api.query.minting.mints.at(endHash, councilMint.unwrap()) as unknown as [Mint, Linkage<MintId>];
        let endCouncilMint = endCouncilMintResult[0] as unknown as Mint;

        let startCuratorMintResult = await api.query.minting.mints.at(startHash, curatorMint.toNumber()) as unknown as [Mint, Linkage<MintId>];
        let startCuratorMint = startCuratorMintResult[0] as unknown as Mint;

        let endCuratorMintResult = await api.query.minting.mints.at(endHash, curatorMint.toNumber()) as unknown as [Mint, Linkage<MintId>];
        let endCuratorMint = endCuratorMintResult[0] as unknown as Mint;

        statistics.newCouncilMinted = parseInt(endCouncilMint.getField('total_minted').toString()) - parseInt(startCouncilMint.getField('total_minted').toString());
        statistics.newCuratorMinted = parseInt(endCuratorMint.getField('total_minted').toString()) - parseInt(startCuratorMint.getField('total_minted').toString());

        let startNrChannels = (await api.query.contentWorkingGroup.nextChannelId.at(startHash) as ChannelId).toNumber() - 1;
        let endNrChannels = (await api.query.contentWorkingGroup.nextChannelId.at(endHash) as ChannelId).toNumber() - 1;

        statistics.newChannels = endNrChannels - startNrChannels;
        statistics.totalChannels = endNrChannels;
        statistics.percNewChannels = this.convertToPercentage(statistics.newChannels, statistics.totalChannels);

        let startMedias = await this.getMedia(api, startHash);
        let endMedias = await this.getMedia(api, endHash);

        let newMedia = endMedias.filter((endMedia) => {
            return !startMedias.some((startMedia) => startMedia.id == endMedia.id);
        });

        statistics.newMedia = newMedia.length;
        statistics.totalMedia = endMedias.length;
        statistics.percNewMedia = this.convertToPercentage(statistics.newMedia, statistics.totalMedia);

        let startDataObjects = await api.query.dataDirectory.knownContentIds.at(startHash) as Vec<ContentId>;
        let startUsedSpace = await this.computeUsedSpaceInBytes(api, startDataObjects);

        let endDataObjects = await api.query.dataDirectory.knownContentIds.at(endHash) as Vec<ContentId>;
        let endUsedSpace = await this.computeUsedSpaceInBytes(api, endDataObjects);

        statistics.newUsedSpace = endUsedSpace - startUsedSpace;
        statistics.totalUsedSpace = endUsedSpace;
        statistics.percNewUsedSpace = this.convertToPercentage(statistics.newUsedSpace, statistics.totalUsedSpace);

        statistics.avgNewSizePerContent = Number((statistics.newUsedSpace / statistics.newMedia).toFixed(2));
        statistics.totalAvgSizePerContent = Number((statistics.totalUsedSpace / statistics.totalMedia).toFixed(2));
        statistics.percAvgSizePerContent = this.convertToPercentage(statistics.avgNewSizePerContent, statistics.totalAvgSizePerContent);

        //
        // for (let startMedia of startMedias) {
        //     let deleted = !endMedias.some((endMedia) => {
        //         return endMedia.id == startMedia.id;
        //     })
        //     if (deleted) {
        //         ++statistics.deletedMedia;
        //     }
        // }

        let startTimestamp = await api.query.timestamp.now.at(startHash) as unknown as Moment;
        let endTimestamp = await api.query.timestamp.now.at(endHash) as unknown as Moment;
        let avgBlockProduction = (((endTimestamp.toNumber() - startTimestamp.toNumber())
            / 1000) / statistics.newBlocks);
        statistics.avgBlockProduction = Number(avgBlockProduction.toFixed(2));

        let startPostId = await api.query.forum.nextPostId.at(startHash) as unknown as PostId;
        let endPostId = await api.query.forum.nextPostId.at(endHash) as unknown as PostId;
        statistics.newPosts = endPostId.toNumber() - startPostId.toNumber();
        statistics.totalPosts = endPostId.toNumber() - 1;
        statistics.percNewPosts = this.convertToPercentage(statistics.newPosts, statistics.totalPosts);

        let startThreadId = await api.query.forum.nextThreadId.at(startHash) as unknown as ThreadId;
        let endThreadId = await api.query.forum.nextThreadId.at(endHash) as unknown as ThreadId;
        statistics.newThreads = endThreadId.toNumber() - startThreadId.toNumber();
        statistics.totalThreads = endThreadId.toNumber() - 1;
        statistics.percNewThreads = this.convertToPercentage(statistics.newThreads, statistics.totalThreads);

        let startCategoryId = await api.query.forum.nextCategoryId.at(startHash) as unknown as CategoryId;
        let endCategoryId = await api.query.forum.nextCategoryId.at(endHash) as unknown as CategoryId;
        statistics.newCategories = endCategoryId.toNumber() - startCategoryId.toNumber();

        let startNrProposals = await api.query.proposalsEngine.proposalCount.at(startHash) as unknown as u32;
        let endNrProposals = await api.query.proposalsEngine.proposalCount.at(endHash) as unknown as u32;
        statistics.newProposals = endNrProposals.toNumber() - startNrProposals.toNumber();

        for (let i = startNrProposals.toNumber(); i < endNrProposals.toNumber(); ++i) {
            let proposalNumber = i - 1;
            let proposalDetails = await api.query.proposalsCodex.proposalDetailsByProposalId.at(endHash, proposalNumber) as ProposalDetails;
            switch (proposalDetails.type) {
                case ProposalTypes.Text:
                    ++statistics.newTextProposals;
                    break;

                case ProposalTypes.RuntimeUpgrade:
                    ++statistics.newRuntimeUpgradeProposal;
                    break;

                case ProposalTypes.SetElectionParameters:
                    ++statistics.newSetElectionParametersProposal;
                    break;

                case ProposalTypes.Spending:
                    ++statistics.newSpendingProposal;
                    break;

                case ProposalTypes.SetLead:
                    ++statistics.newSetLeadProposal;
                    break;

                case ProposalTypes.SetContentWorkingGroupMintCapacity:
                    ++statistics.newSetContentWorkingGroupMintCapacityProposal;
                    break;

                case ProposalTypes.EvictStorageProvider:
                    ++statistics.newEvictStorageProviderProposal;
                    break;

                case ProposalTypes.SetValidatorCount:
                    ++statistics.newSetValidatorCountProposal;
                    break;

                case ProposalTypes.SetStorageRoleParameters:
                    ++statistics.newSetStorageRoleParametersProposal;
                    break;
            }
        }

        let validatorRewards: ValidatorReward[] = [];
        let exchangesCollection: Exchange[] = [];
        let promises = [];

        console.time('extractValidatorsRewards');
        for (let i = startBlock; i < endBlock; ++i) {
            let promise = (async () => {
                const blockHash: Hash = await api.rpc.chain.getBlockHash(i);
                const events = await api.query.system.events.at(blockHash) as Vec<EventRecord>;
                let rewards = await this.extractValidatorsRewards(api, i, events);
                if (rewards.length) {
                    validatorRewards = validatorRewards.concat(rewards);
                }
                let exchanges = this.extractExchanges(i, events);
                if (exchanges.length) {
                    exchangesCollection = exchangesCollection.concat(exchanges);
                }

            })();
            promises.push(promise);
        }
        await Promise.all(promises);
        console.timeEnd('extractValidatorsRewards');

        statistics.newValidatorReward = validatorRewards.map((validatorReward) => validatorReward.sharedReward).reduce((a, b) => a + b);
        let avgValidators = validatorRewards.map((validatorReward) => validatorReward.validators).reduce((a, b) => a + b) / validatorRewards.length;
        statistics.avgValidators = Number(avgValidators.toFixed(2));

        statistics.newTokensBurn = exchangesCollection.map((exchange) => exchange.amount).reduce((a, b) => a + b);

        statistics.newStorageProviderReward = await this.computeStorageRewards(api, startBlock, endBlock);

        api.disconnect();
        return statistics;
    }


    static async extractValidatorsRewards(api: ApiPromise, blockNumber: number, events: Vec<EventRecord>): Promise<ValidatorReward[]> {
        let valRewards = [];
        // const api = await this.connectApi();
        for (let {event} of events) {
            if (event.section === 'staking' && event.method === 'Reward') {
                const sharedReward = event.data[0] as Balance;
                const remainingReward = event.data[1] as Balance;
                const oldHash: Hash = await api.rpc.chain.getBlockHash(blockNumber - 1)
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
        // register types before creating the api
        registerJoystreamTypes();

        // Create the API and wait until ready
        return await ApiPromise.create({provider});
    }

}



