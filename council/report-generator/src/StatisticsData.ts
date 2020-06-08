export class StatisticsData {
    startBlock: number;
    endBlock: number;
    percNewBlocks: number

    newBlocks: number;
    avgBlockProduction: number;
    nrValidators: number;
    newPosts: number;
    newThreads: number;
    newCategories: number;
    totalIssuance: number;
    newMembers: number;
    newProposals: number;
    newMedia: number;
    deletedMedia: number;
    createdMints: number;
    totalMinted: number;
    totalMintCapacityIncrease: number;
    // totalBurned: number;
    totalNewUsedSpace: number;
    newStakes: number;
    totalNewStakeValue: number;

    constructor() {
    }

}