import {rpc} from "@polkadot/types/interfaces/definitions";
import {ApiPromise, WsProvider} from "@polkadot/api";
import {registerJoystreamTypes} from '@joystream/types';
import {Balance, Hash, Moment} from "@polkadot/types/interfaces";
import {ClassId, ClassPropertyValue, Entity} from "@joystream/types/lib/versioned-store";
import {Mint} from "@joystream/types/lib/mint";
import {Option, u32, Vec} from "@polkadot/types";
import {ContentId, DataObject} from "@joystream/types/lib/media";
import {Stake, StakeId} from "@joystream/types/lib/stake";
import Linkage from "@polkadot/types/codec/Linkage";
import {CategoryId, PostId, ThreadId} from "@joystream/types/lib/forum";
import {MemberId} from "@joystream/types/lib/members";
import number from "@polkadot/util/is/number";
import {StatisticsData} from "./StatisticsData";

const BURN_ADDRESS = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMaeKQu';


class Media {

    constructor(public id: number, public title: string) {
    }
}

export class StatisticsCollector {
    static async getStatistics(startBlock: number, endBlock: number): Promise<StatisticsData> {

        // Initialise the provider to connect to the local node
        const provider = new WsProvider('wss://rome-rpc-endpoint.joystream.org:9944');

        // register types before creating the api
        registerJoystreamTypes();

        // Create the API and wait until ready
        const api = await ApiPromise.create({provider});

        let statistics = new StatisticsData();

        statistics.startBlock = startBlock;
        statistics.endBlock = endBlock;
        statistics.newBlocks = endBlock - startBlock;
        statistics.percNewBlocks = Number((statistics.newBlocks / endBlock * 100).toFixed(2));

        let startHash = await api.rpc.chain.getBlockHash(startBlock);
        let endHash = await api.rpc.chain.getBlockHash(endBlock);

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

        let startDataObjects = await api.query.dataDirectory.knownContentIds.at(startHash) as Vec<ContentId>;
        let startUsedSpace = await this.computeUsedSpaceInBytes(api, startDataObjects);

        let endDataObjects = await api.query.dataDirectory.knownContentIds.at(endHash) as Vec<ContentId>;
        let endUsedSpace = await this.computeUsedSpaceInBytes(api, endDataObjects);

        statistics.totalNewUsedSpace = endUsedSpace - startUsedSpace;

        let startNrMints = parseInt((await api.query.minting.mintsCreated.at(startHash)).toString());
        let endNrMints = parseInt((await api.query.minting.mintsCreated.at(endHash)).toString());

        statistics.createdMints = endNrMints - startNrMints;

        for (let i = 0; i < startNrMints; ++i) {
            let startMintResult = await api.query.minting.mints.at(startHash, i) as unknown as [2];
            let startMint = startMintResult[0] as unknown as Mint;

            let endMintResult = await api.query.minting.mints.at(endHash, i) as unknown as [2];
            let endMint = endMintResult[0] as unknown as Mint;

            statistics.totalMinted = parseInt(endMint.getField('total_minted').toString()) - parseInt(startMint.getField('total_minted').toString());
            statistics.totalMintCapacityIncrease = parseInt(endMint.getField('capacity').toString()) - -parseInt(startMint.getField('capacity').toString());
        }

        // let startMedias = await this.getMedia(api, startHash);
        // let endMedias = await this.getMedia(api, endHash);
        //
        // let newMedia = endMedias.filter((endMedia) => {
        //     return !startMedias.some((startMedia) => startMedia.id == endMedia.id);
        // });
        // statistics.newMedia = newMedia.length;
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

        let startThreadId = await api.query.forum.nextThreadId.at(startHash) as unknown as ThreadId;
        let endThreadId = await api.query.forum.nextThreadId.at(endHash) as unknown as ThreadId;
        statistics.newThreads = endThreadId.toNumber() - startThreadId.toNumber();

        let startCategoryId = await api.query.forum.nextCategoryId.at(startHash) as unknown as CategoryId;
        let endCategoryId = await api.query.forum.nextCategoryId.at(endHash) as unknown as CategoryId;
        statistics.newCategories = endCategoryId.toNumber() - startCategoryId.toNumber();

        let startIssuance = await api.query.balances.totalIssuance.at(startHash) as unknown as Balance;
        let endIssuance = await api.query.balances.totalIssuance.at(endHash) as unknown as Balance;
        statistics.totalIssuance = Number(endIssuance.toNumber() - startIssuance.toNumber());

        let startNrMembers = await api.query.members.membersCreated.at(startHash) as unknown as MemberId;
        let endNrNumber = await api.query.members.membersCreated.at(endHash) as unknown as MemberId;
        statistics.newMembers = endNrNumber.toNumber() - startNrMembers.toNumber();

        let startNrProposals = await api.query.proposalsEngine.proposalCount.at(startHash) as unknown as u32;
        let endNrProposals = await api.query.proposalsEngine.proposalCount.at(endHash) as unknown as u32;
        statistics.newProposals = endNrProposals.toNumber() - startNrProposals.toNumber();


        return statistics;
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
        let nrEntities = parseInt((await api.query.versionedStore.nextEntityId()).toString());

        let medias: Media[] = [];
        for (let i = 0; i < nrEntities; ++i) {
            let entity = await api.query.versionedStore.entityById.at(blockHash, i) as unknown as Entity;
            // console.log(entity);

            if (entity.class_id.toNumber() != 7) {
                continue;
            }

            let title = entity.entity_values[0].value.value.toString();

            medias.push(new Media(entity.id.toNumber(), title));

        }
        return medias;
    }
}



